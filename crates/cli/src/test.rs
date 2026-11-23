use clap::{Args, Subcommand, ValueEnum};

use std::collections::HashMap;
use gherkin::{Feature, GherkinEnv};
use git2::Repository;
use octocrab::Octocrab;
use std::fs;
use std::fs::OpenOptions;
use std::io;
use std::path::Path;
use std::path::PathBuf;
use any_ascii::any_ascii;
use sanitize_filename::sanitize;
use regex::Regex;

use tokio::fs::File;
use tokio::io::AsyncWriteExt;

use s3::bucket::Bucket;
use s3::creds::Credentials;
use s3::region::Region;

use zip::ZipArchive;

use crate::gherkin_formatter::feature_to_string;

#[derive(Subcommand)]
pub(crate) enum Command {
    Add(AddArgs),
    Fmt(FormatArgs),
    Rename(RenameArgs),
    Get(GetArgs),
    Clean(CleanArgs),
    /// Create a beta patch from the base and beta fixtures.
    Diff(FixtureArgs),
    /// Apply a beta patch to the base fixture, replacing the beta fixture.
    Apply(FixtureArgs),
}

#[derive(Args)]
pub(crate) struct GetArgs {
    debug_log: String,
}

#[derive(Args)]
pub(crate) struct CleanArgs {
    debug_log: String,
}

#[derive(Args)]
pub(crate) struct FixtureArgs {
    filename: PathBuf,
}

#[derive(Args)]
pub(crate) struct AddArgs {
    /// Translator type.
    #[arg(short = 't', long, value_enum, default_value_t = Translator::Biblatex)]
    translator: Translator,

    /// Debug log ID, for items
    #[arg(short = 'd', long)]
    debug_log: String,

    /// Issue number.
    #[arg(short = 'i', long)]
    issue: Option<u64>,

    /// Title for the new test.
    #[arg(long)]
    title: Option<String>,

    /// Allow attachments for the test.
    #[arg(long="attachments", conflicts_with = "no_attachments")]
    keep_attachments: bool,

    /// Remove attachments for the test.
    #[arg(long="no-attachments", conflicts_with = "keep_attachments")]
    no_attachments: bool,
}

impl AddArgs {
    fn attachments(&self) -> Option<bool> {
        if self.keep_attachments {
            Some(true)
        } else if self.no_attachments {
            Some(false)
        } else {
            None
        }
    }
}

#[derive(Args)]
pub(crate) struct RenameArgs {
    /// The feature to parse.
    #[arg(long, default_value = "export")]
    feature: String,

    /// Issue number.
    #[arg(short = 'i', long)]
    issue: Option<u64>,

    /// New title for the test.
    #[arg(long)]
    title: Option<String>,
}

#[derive(Args)]
pub(crate) struct FormatArgs {
    /// The feature to parse.
    #[arg(long, default_value = "export")]
    feature: String,
}

#[derive(Clone, Copy, ValueEnum)]
#[derive(PartialEq, Eq)]
enum Translator {
    Biblatex,
    Bibtex,
    #[value(alias = "csl-json")]
    Csl,
    #[value(alias = "csl-yaml")]
    Yml,
    Hayagriva,
    Import,
}

/// Dispatches the test subcommands.
pub async fn run(command: Command) -> Result<(), Box<dyn std::error::Error>> {
    match command {
        Command::Add(args) => add(args).await,
        Command::Fmt(args) => fmt(args),
        Command::Rename(args) => rename(args),
        Command::Get(args) => get(args).await,
        Command::Clean(args) => clean(args),
        Command::Diff(args) => diff(&args.filename),
        Command::Apply(args) => apply(&args.filename),
    }
}

fn issue_from_branch() -> Option<u64> {
    let repo = Repository::discover(".").ok()?;
    let head = repo.head().ok()?;
    let branch = head.shorthand().ok()?;

    branch.strip_prefix("gh-")?.parse().ok()
}

async fn title_from_issue(issue: Option<u64>) -> Option<String> {
    if let Some(issue) = issue {
        let token = std::env::var("GITHUB_TOKEN")
            .expect("GITHUB_TOKEN environment variable not set");
        let octocrab = Octocrab::builder().personal_token(token).build().ok()?;
        let issue = octocrab.issues("retorquere", "zotero-better-bibtex").get(issue).await.ok()?;
        Some(format!("{} #{}", issue.title, issue.number))
    }
    else {
      None
    }
}

fn sanitized(title: &String) -> String {
    let mut title = title
        .replace(&['`', '\'', '"', '?'], "")
        .trim()
        .to_string();
    loop {
        let cleaned = Regex::new(r"^\s*\[?(Bug|Feature|Request)\]?[/:\s]*").unwrap().replace_all(title.as_str(), "").trim().to_string();
        if cleaned == title {
            break;
        }
        title = cleaned;
    }
    sanitize(any_ascii(&title))
}

/// Detects attachments with missing fixture files and optionally removes them from the JSON tree.
fn detect_attachments(value: &mut serde_json::Value, fixtures: &Path, remove: bool) -> bool {
    fn is_broken_attachment(fixtures: &Path, value: &serde_json::Value) -> bool {
        let Some(object) = value.as_object() else {
            return false;
        };

        let item_type = object.get("itemType").and_then(serde_json::Value::as_str);
        let is_attachment = item_type == Some("attachment");
        let path = object.get("path").and_then(serde_json::Value::as_str);
        let has_missing_path = path.is_some_and(|path| {
            let fixture_path = fixtures.join(path);
            !fixture_path.exists()
        });

        is_attachment && has_missing_path
    }

    match value {
        serde_json::Value::Object(object) => {
            if remove {
                let mut found = false;
                for child in object.values_mut() {
                    found |= detect_attachments(child, fixtures, remove);
                }
                found
            } else {
                object.values_mut().any(|child| detect_attachments(child, fixtures, remove))
            }
        }

        serde_json::Value::Array(items) => {
            if remove {
                let mut found = false;
                items.retain_mut(|item| {
                    if is_broken_attachment(fixtures, item) {
                        found = true;
                        false
                    } else {
                        found |= detect_attachments(item, fixtures, remove);
                        true
                    }
                });
                found
            } else {
                items.iter_mut().any(|item| {
                    is_broken_attachment(fixtures, item) || detect_attachments(item, fixtures, remove)
                })
            }
        }

        _ => false,
    }
}

/// Adds a test feature after resolving and validating its linked GitHub issue.
async fn add(args: AddArgs) -> Result<(), Box<dyn std::error::Error>> {
    let keep_attachments= args.attachments();
    let feature: String = if args.translator == Translator::Import { "import.feature" } else { "export.feature" }.to_string();
    let (feature_path, mut feature) = load_feature(&feature)?;

    let issue = args.issue.or_else(issue_from_branch);

    let mut title = match args.title {
        Some(title) => title,
        None => title_from_issue(issue).await.ok_or_else(|| {
            std::io::Error::new(std::io::ErrorKind::NotFound, "Could not resolve a title from the GitHub issue")
        })?,
    };
    title = sanitized(&title);
    if title.is_empty() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "No title provided or detected",
        ).into());
    }

    if !args.debug_log.contains("-refs") {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("{} does not contain items", args.debug_log)
        ).into());
    }

    if !Path::new("logs").join(&args.debug_log).is_dir() {
        if !download_debug_log(&args.debug_log).await? {
            return Err(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Debug log {} not found", args.debug_log),
            )
            .into());
        }
    }

    let library_path = Some(Path::new("logs").join(&args.debug_log).join("items.json"))
        .filter(|path| path.is_file())
        .ok_or_else(|| {
            std::io::Error::new(std::io::ErrorKind::NotFound, format!("Library not found: logs/{}/items.json", &args.debug_log))
        })?;

    let mut library: serde_json::Value = serde_json::from_slice(&fs::read(&library_path)?)?;
    if library.pointer("/config/id").and_then(serde_json::Value::as_str) != Some("36a3b0b5-bad0-4a04-b79b-441c7cef77db") {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("{} is not a library", library_path.display()),
        ).into());
    }

    let fixtures = PathBuf::from("test/fixtures").join(if args.translator == Translator::Import { "import" } else { "export" });
    match keep_attachments {
        Some(true) => (),

        Some(false) => {
            detect_attachments(&mut library, &fixtures, true);
        },

        None => {
            if detect_attachments(&mut library, &fixtures, false) {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::InvalidInput,
                    format!("{} has attachments, keep or remove?", library_path.display()),
                ).into());
            }
        },
    };

    let items = library["items"].as_array().map_or(0, |arr| arr.len());
    if items == 0 {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("{} has no items", library_path.display()),
        ).into());
    }

    if let Some(preferences) = library.pointer_mut("/config/preferences").and_then(serde_json::Value::as_object_mut) {
        preferences.remove("baseAttachmentPath");
    }
    fs::create_dir_all(&fixtures)?;
    fs::write(fixtures.join(&title).with_extension("yml"), library_yaml(&library)?)?;

    fn create(fixtures: &PathBuf, title: &str, ext: &str,contents: &str) -> Result<(), Box<dyn std::error::Error>> {
        let filename = fixtures.join(title).with_extension(ext);
        OpenOptions::new()
            .write(true)
            .create_new(true) // Fails if file already exists
            .open(&filename)
            .map_err(|error| {
                std::io::Error::new(
                    error.kind(),
                    format!("could not create {}: {error}", filename.display()),
                )
            })?;
        fs::write(&filename, contents)?;
        Ok(())
    }
    let name =match args.translator {
        Translator::Import => {
            create(&fixtures, &title, "bib", "")?;
            "Import <refs> references from <file>"
        },
        Translator::Biblatex => {
            create(&fixtures, &title, "biblatex", "")?;
            "Export <refs> references for BibLaTeX to <file>"
        }
        Translator::Bibtex => {
            create(&fixtures, &title, "bibtex", "")?;
            "Export <refs> references for BibTeX to <file>"
        },
        Translator::Csl => {
            create(&fixtures, &title, "csl.json", "[]")?;
            "Export <refs> references for CSL-JSON to <file>"
        }
        Translator::Yml => {
            create(&fixtures, &title, "csl.yaml", "[]")?;
            "Export <refs> references for CSL-YAML to <file>"
        }
        Translator::Hayagriva => {
            create(&fixtures, &title, "hayagriva.reference.yml", "{}")?;
            create(&fixtures, &title, "hayagriva.reference.apa", "")?;
            "Export <refs> references for Better Hayagriva to <file>"
        }
    };

    let outline = feature.scenarios.iter_mut().find(|scenario| scenario.keyword == "Scenario Outline" && scenario.name == name);
    if let Some(outline) = outline {
        for example in &mut outline.examples {
            if let Some(table) = &mut example.table {
                let files = table.rows.first().map_or(false, |header| {
                    header.len() == 2 && header[0] == "refs" && header[1] == "file"
                });
                if !files {
                    continue;
                }

                table.rows.retain(|row| row.get(1) != Some(&title));
                table.rows.push(vec![items.to_string(), title.clone()]);

                break;
            }
        }
    }
    else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("Scenario outline {} not found", name)
        ).into());
    }

    write_feature(&feature_path, &feature)
}

/// Formats the selected feature without requiring an issue or GitHub credentials.
fn fmt(args: FormatArgs) -> Result<(), Box<dyn std::error::Error>> {
    let (feature_path, feature) = load_feature(&args.feature)?;
    write_feature(&feature_path, &feature)
}

/// Renames a test on disk
fn rename(args: RenameArgs) -> Result<(), Box<dyn std::error::Error>> {
    let (feature_path, feature) = load_feature(&args.feature)?;
    write_feature(&feature_path, &feature)
}

async fn get(args: GetArgs) -> Result<(), Box<dyn std::error::Error>> {
    if !download_debug_log(&args.debug_log).await? {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("Debug log {} not found", args.debug_log),
        )
        .into());
    }
    Ok(())
}

async fn download_debug_log(id: &str) -> Result<bool, Box<dyn std::error::Error>> {
    let id = id.split('/').next().unwrap_or(id);
    let s3: serde_json::Value = serde_json::from_slice(&fs::read("content/s3.json")?)?;
    let bucket = s3
        .pointer("/bucket")
        .and_then(serde_json::Value::as_str)
        .ok_or("Missing S3 bucket in content/s3.json")?;
    let postfixes: HashMap<String, String> = s3["region"]
        .as_object()
        .map(|regions| {
            regions
                .iter()
                .filter_map(|(region, details)| {
                    let short = details.get("short")?.as_str()?;
                    Some((short.to_string(), region.to_string()))
                })
                .collect()
        })
        .unwrap_or_default();
    let mut downloaded = false;
    let zipfile = format!("logs/{}.zip", id);
    fs::create_dir_all("logs")?;
    let credentials = Credentials::default()?;
    for (postfix, region) in &postfixes {
        let bucket_name = format!("{}-{}", bucket, postfix);
        let bucket = Bucket::new(&bucket_name, region.parse::<Region>()?, credentials.clone())?;
        let key = bucket
            .list(id.to_string(), None)
            .await
            .map_err(|error| {
                io::Error::new(
                    io::ErrorKind::Other,
                    format!("S3 ListObjects for s3://{bucket_name}/ with prefix {id} failed: {error}"),
                )
            })?
            .into_iter()
            .flat_map(|listing| listing.contents)
            .map(|object| object.key)
            .find(|key| key.ends_with(".zip"));
        let Some(key) = key else {
            continue;
        };

        println!("Downloading {zipfile}");

        let mut output = File::create(&zipfile).await?;
        let status = bucket
            .get_object_to_writer(&key, &mut output)
            .await
            .map_err(|error| {
                io::Error::new(
                    io::ErrorKind::Other,
                    format!("S3 GetObject s3://{bucket_name}/{key} failed: {error}"),
                )
            })?;
        if !(200..300).contains(&status) {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("S3 GetObject s3://{bucket_name}/{key} returned HTTP {status}"),
            )
            .into());
        }
        output.flush().await?;
        downloaded = true;
        break;
    }
    if downloaded {
        let logs = Path::new("logs");
        let mut zip = ZipArchive::new(fs::File::open(&zipfile)?)?;
        for i in 0..zip.len() {
            let mut entry = zip.by_index(i)?;

            let path = match entry.enclosed_name() {
                Some(path) => logs.join(path),
                None => continue, // Skip suspicious paths (Zip Slip protection)
            };

            if entry.name()?.ends_with('/') {
                // Create target directory
                fs::create_dir_all(&path)?;
            }
            else {
                // Ensure parent directories exist for files in nested paths
                if let Some(parent) = path.parent() {
                    if !parent.exists() {
                        fs::create_dir_all(parent)?;
                    }
                }
                // Copy file contents out of the zip archive
                let mut file = fs::File::create(&path)?;
                io::copy(&mut entry, &mut file)?;
            }
        }
        drop(zip);
        fs::remove_file(&zipfile)?;
    }
    Ok(downloaded)
}

/// Resolves a feature name under `test/features` and parses its Gherkin contents.
fn load_feature(name: &str) -> Result<(String, Feature), Box<dyn std::error::Error>> {
    let path = Path::new("test")
        .join("features")
        .join(name)
        .with_extension("feature")
        .display()
        .to_string();
    let feature = Feature::parse_path(&path, GherkinEnv::default())?;

    Ok((path, feature))
}

/// Writes the formatted feature back to its source file.
fn write_feature(path: &str, feature: &Feature) -> Result<(), Box<dyn std::error::Error>> {
    fs::write(path, feature_to_string(feature))?;

    Ok(())
}

/// Emits multiline values as literal blocks, including lines with trailing spaces.
fn library_yaml(value: &serde_json::Value) -> Result<String, saphyr::EmitError> {
    use saphyr::{Scalar, ScalarStyle, Yaml, YamlEmitter};

    fn node(value: &serde_json::Value) -> Yaml<'_> {
        match value {
            serde_json::Value::Null => Yaml::Value(Scalar::Null),
            serde_json::Value::Bool(value) => Yaml::Value(Scalar::Boolean(*value)),
            serde_json::Value::Number(value) => {
                Yaml::Representation(value.to_string().into(), ScalarStyle::Plain, None)
            },
            serde_json::Value::String(value) => {
                Yaml::Value(Scalar::String(value.as_str().into()))
            },
            serde_json::Value::Array(values) => {
                Yaml::Sequence(values.iter().map(node).collect())
            },
            serde_json::Value::Object(values) => Yaml::Mapping(
                values.iter().map(|(key, value)| {
                    (Yaml::Value(Scalar::String(key.as_str().into())), node(value))
                }).collect(),
            ),
        }
    }

    let mut output = String::new();
    let mut emitter = YamlEmitter::new(&mut output);
    emitter.multiline(true);
    emitter.dump(&node(value))?;
    if !output.ends_with('\n') {
        output.push('\n');
    }
    Ok(output)
}

fn fixture_paths(filename: &Path) -> io::Result<(&'static str, PathBuf, PathBuf)> {
    let name = filename.file_name().and_then(|name| name.to_str()).ok_or_else(|| {
        io::Error::new(io::ErrorKind::InvalidInput, "Expected a UTF-8 fixture filename")
    })?;
    let extension = [".csl.json", ".csl.yml", ".hayagriva.yml", ".json", ".yaml", ".yml", ".biblatex", ".bibtex", ".bib"]
        .into_iter()
        .find(|extension| name.ends_with(extension))
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, format!("Unsupported fixture extension: {name}")))?;
    let beta = filename.with_file_name(format!("{}.beta{extension}", &name[..name.len() - extension.len()]));
    let mut patch_name = filename.as_os_str().to_os_string();
    patch_name.push(".beta.patch");
    Ok((extension, beta, PathBuf::from(patch_name)))
}

fn diff(filename: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let (extension, beta, patch_path) = fixture_paths(filename)?;
    let source = fs::read_to_string(filename)?;
    let target = fs::read_to_string(beta)?;

    let output = if extension.ends_with(".json") || extension.ends_with(".yml") || extension.ends_with(".yaml") {
        let (source, target): (serde_json::Value, serde_json::Value) = if extension.ends_with(".json") {
            (serde_json::from_str(&source)?, serde_json::from_str(&target)?)
        } else {
            (serde_yaml::from_str(&source)?, serde_yaml::from_str(&target)?)
        };
        serde_json::to_string_pretty(&json_patch::diff(&source, &target))?
    } else {
        let mut dmp = diff_match_patch::Dmp::new();
        let mut patches = dmp.patch_make1(&source, &target);
        dmp.patch_to_text(&mut patches)
    };

    fs::write(&patch_path, output)?;
    println!("{}", patch_path.display());
    Ok(())
}

fn apply(filename: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let (extension, beta, patch_path) = fixture_paths(filename)?;
    let source = fs::read_to_string(filename)?;
    let patch = fs::read_to_string(patch_path)?;

    let output = if extension.ends_with(".json") || extension.ends_with(".yml") || extension.ends_with(".yaml") {
        let is_json = extension.ends_with(".json");
        let mut source: serde_json::Value = if is_json {
            serde_json::from_str(&source)?
        } else {
            serde_yaml::from_str(&source)?
        };
        let operations: Vec<json_patch::PatchOperation> = serde_json::from_str(&patch)?;
        json_patch::patch(&mut source, &operations)?;
        if is_json {
            format!("{}\n", serde_json::to_string_pretty(&source)?)
        } else {
            library_yaml(&source)?
        }
    } else {
        let mut dmp = diff_match_patch::Dmp::new();
        let mut patches = dmp.patch_from_text(patch);
        let (output, applied) = dmp.patch_apply(&mut patches, &source);
        if applied.iter().any(|applied| !applied) {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Could not apply every patch hunk").into());
        }
        output.into_iter().collect()
    };

    fs::write(&beta, output)?;
    println!("{}", beta.display());
    Ok(())
}

fn clean(args: CleanArgs) -> Result<(), Box<dyn std::error::Error>> {
    let mut debug_log: serde_json::Value = if args.debug_log.ends_with(".yaml") {
        serde_yaml::from_str(&fs::read_to_string(&args.debug_log)?)?
    } else if args.debug_log.ends_with(".json") {
        serde_json::from_slice(&fs::read(&args.debug_log)?)?
    } else {
        return Err("File must have .yaml or .json extension".into());
    };

    if !debug_log.is_object() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("{} is not a library", args.debug_log),
        ).into());
    }

    if debug_log.pointer("/config/id").and_then(serde_json::Value::as_str) != Some("36a3b0b5-bad0-4a04-b79b-441c7cef77db") {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("{} is not a library", args.debug_log),
        ).into());
    }

    let reference_prefs: serde_json::Value = serde_yaml::from_str(&fs::read_to_string("content/Preferences/preferences.yaml")?)?;

    if let Some(preferences) = debug_log.pointer_mut("/config/preferences").and_then(serde_json::Value::as_object_mut) {
        preferences.remove("baseAttachmentPath");
        *preferences = std::mem::take(preferences)
            .into_iter()
            .filter_map(|(key, value)| {
                match reference_prefs.get(&key).and_then(|pref| pref.get("default")) {
                    Some(default_value) if !values_have_same_type(&value, default_value) => {
                        Some(Err(std::io::Error::new(
                            std::io::ErrorKind::InvalidData,
                            format!("Preference {} has mismatched type", key),
                        )))
                    }
                    Some(default_value) if &value == default_value => None,
                    _ => Some(Ok((key, value))),
                }
            })
            .collect::<Result<_, _>>()?;
    }

    fs::write(Path::new(&args.debug_log).with_extension("yaml"), library_yaml(&debug_log)?)?;

    Ok(())
}

fn values_have_same_type(a: &serde_json::Value, b: &serde_json::Value) -> bool {
    match (a, b) {
        (serde_json::Value::Null, serde_json::Value::Null) => true,
        (serde_json::Value::Bool(_), serde_json::Value::Bool(_)) => true,
        (serde_json::Value::Number(_), serde_json::Value::Number(_)) => true,
        (serde_json::Value::String(_), serde_json::Value::String(_)) => true,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::{apply, diff, library_yaml};
    use serde_json::json;

    #[test]
    fn beta_patches_transform_fixtures() {
        let dir = std::env::temp_dir().join(format!(
            "bbt-patch-{}-{}",
            std::process::id(),
            std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos()
        ));
        std::fs::create_dir(&dir).unwrap();
        for (name, beta_name, source, target) in [
            ("fixture.biblatex", "fixture.beta.biblatex", "@book{é, title={old}}\n", "@book{é, title={new 😀}}\n"),
            ("fixture.csl.json", "fixture.beta.csl.json", r#"[{"a/b": [1, 2]}]"#, r#"[{"a/b": [2, 3], "title": "new"}]"#),
            ("fixture.hayagriva.yml", "fixture.beta.hayagriva.yml", "entry:\n  title: old\n", "entry:\n  title: new\n"),
            ("fixture.yaml", "fixture.beta.yaml", "entry:\n  title: old\n", "entry:\n  title: new\n"),
        ] {
            let filename = dir.join(name);
            let beta = dir.join(beta_name);
            std::fs::write(&filename, source).unwrap();
            std::fs::write(&beta, target).unwrap();
            diff(&filename).unwrap();
            let patch_file = dir.join(format!("{name}.beta.patch"));
            std::fs::remove_file(&beta).unwrap();
            apply(&filename).unwrap();
            let result = std::fs::read_to_string(&beta).unwrap();
            if name.ends_with(".biblatex") {
                assert_eq!(result, target);
            } else {
                let parse = |text| -> serde_json::Value {
                    if name.ends_with(".json") {
                        serde_json::from_str(text).unwrap()
                    } else {
                        serde_yaml::from_str(text).unwrap()
                    }
                };
                assert_eq!(parse(&result), parse(target));
            }
            std::fs::remove_file(patch_file).unwrap();
            std::fs::remove_file(beta).unwrap();
            std::fs::remove_file(filename).unwrap();
        }
        let missing_beta = dir.join("missing.json");
        std::fs::write(&missing_beta, "{}").unwrap();
        assert!(diff(&missing_beta).is_err());
        assert!(!dir.join("missing.json.beta.patch").exists());
        assert!(apply(&missing_beta).is_err());
        std::fs::remove_file(missing_beta).unwrap();
        assert!(diff(&dir.join("unsupported.txt")).is_err());
        assert!(apply(&dir.join("unsupported.txt")).is_err());

        let filename = dir.join("conflict.bib");
        let beta = dir.join("conflict.beta.bib");
        let patch_file = dir.join("conflict.bib.beta.patch");
        std::fs::write(&filename, "original content that will be replaced").unwrap();
        std::fs::write(&beta, "replacement content").unwrap();
        diff(&filename).unwrap();
        std::fs::write(&filename, "completely unrelated text").unwrap();
        assert!(apply(&filename).is_err());
        assert_eq!(std::fs::read_to_string(&beta).unwrap(), "replacement content");
        std::fs::remove_file(filename).unwrap();
        std::fs::remove_file(beta).unwrap();
        std::fs::remove_file(patch_file).unwrap();
        std::fs::remove_dir(dir).unwrap();
    }

    #[test]
    fn yaml_uses_literal_blocks_without_changing_values() {
        for multiline in [
            "first \nsecond",
            "first\nsecond ",
            "first\nsecond\n",
            "first\nsecond\n\n",
            "\n  indented\ntext",
        ] {
            let value = json!({
                "multiline": multiline,
                "single": "single line",
                "nested": [{"text": multiline}],
                "number": u64::MAX,
                "float": 1.5,
                "boolean": true,
                "null": null,
            });
            let yaml = library_yaml(&value).unwrap();
            assert!(yaml.contains("multiline: |"), "{yaml}");
            assert!(yaml.contains("single: single line\n"), "{yaml}");
            assert!(yaml.contains("text: |"), "{yaml}");
            assert_eq!(serde_yaml::from_str::<serde_json::Value>(&yaml).unwrap(), value);
        }
    }

    #[test]
    fn yaml_formats_issue_3472_postscript_as_a_literal_block() {
        let value: serde_json::Value = serde_yaml::from_str(include_str!(
            "../../../test/fixtures/export/tex.pages= in Extra field not exporting as LaTeX, Language = de exporting as german, not ngerman #3472.yaml"
        )).unwrap();
        let yaml = library_yaml(&value).unwrap();

        assert!(yaml.contains("postscript: |\n"), "{yaml}");
        assert_eq!(serde_yaml::from_str::<serde_json::Value>(&yaml).unwrap(), value);
    }
}
