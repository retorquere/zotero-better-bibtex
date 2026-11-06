use clap::{Args, Subcommand, ValueEnum};
use gherkin::{Feature, GherkinEnv};
use git2::Repository;
use octocrab::models::timelines::Rename;
use octocrab::Octocrab;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::process;

use crate::gherkin_formatter::feature_to_string;

#[derive(Subcommand)]
pub(crate) enum Command {
    Add(AddArgs),
    Fmt(FormatArgs),
    Rename(RenameArgs),
}

#[derive(Args)]
pub(crate) struct AddArgs {
    /// Translator type.
    #[arg(short = 't', long, value_enum, default_value_t = Translator::Biblatex)]
    translator: Translator,

    /// Debug log ID, for items
    #[arg(short = 'd', long)]
    data: String,

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
    }
}

fn issue_from_branch() -> Option<u64> {
    let repo = Repository::discover(".").ok()?;
    let head = repo.head().ok()?;
    let branch = head.shorthand().ok()?;

    branch.strip_prefix("gh-")?.parse().ok()
}

async fn title_from_issue(issue: u64) -> Option<String> {
    let token = std::env::var("GITHUB_TOKEN")
        .expect("GITHUB_TOKEN environment variable not set");
    let octocrab = Octocrab::builder().personal_token(token).build().ok()?;
    let issue = octocrab.issues("retorquere", "zotero-better-bibtex").get(issue).await.ok()?;
    Some(issue.title)
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
async fn add(mut args: AddArgs) -> Result<(), Box<dyn std::error::Error>> {
    let keep_attachments= args.attachments();
    let feature: String = if args.translator == Translator::Import { "import.feature" } else { "export.feature" }.to_string();
    let (feature_path, feature) = load_feature(&feature)?;
    
    let issue = args.issue.or_else(issue_from_branch)
        .ok_or_else(|| std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "No issue specified or detected",
        ))?;

    let title = match args.title {
        Some(title) => title,
        None => title_from_issue(issue).await.ok_or_else(|| std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "No title specified or detected",
        ))?,
    };

    let library_path = Some(Path::new("logs").join(&args.data).join("items.json"))
        .filter(|path| path.is_file())
        .ok_or_else(|| {
            std::io::Error::new(std::io::ErrorKind::NotFound, format!("Library not found: logs/{}/items.json", &args.data))
        })?;

    let mut library: serde_json::Value = serde_json::from_slice(&fs::read(&library_path)?)?;
    if library.pointer("/config/id").and_then(serde_json::Value::as_str)
        != Some("36a3b0b5-bad0-4a04-b79b-441c7cef77db")
    {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("{} is not a library", library_path.display()),
        ).into());
    }

    let fixtures = PathBuf::from("test/fixtures").join(if args.translator == Translator::Import { "import" } else { "export" });
    match keep_attachments {
        Some(true) => (),

        Some(false) => {
            detect_attachments(&mut library, fixtures, true);
        },
        
        None => {
            if detect_attachments(&mut library, fixtures, false) {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::InvalidInput,
                    format!("{} has attachments, keep or remove?", library_path.display()),
                ).into());
            }
        },
    };

    fs::create_dir_all(&fixtures)?;
    serde_yaml::to_writer(fs::File::create(fixtures.join(title).with_extension("yaml"))?, &library)?;

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
