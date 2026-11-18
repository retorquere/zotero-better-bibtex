use gherkin::{Feature, Rule, Scenario, Step, Table};

pub fn feature_to_string(feature: &Feature) -> String {
    let mut out = String::new();

    // 1. Tags
    for tag in &feature.tags {
        out.push_str(&format!("@{}\n", tag));
    }

    // 2. Feature Title & Description
    out.push_str(&format!("Feature: {}\n", feature.name));
    if let Some(ref desc) = feature.description {
        for line in desc.lines() {
            out.push_str(&format!("  {}\n", line));
        }
    }
    out.push('\n');

    // 3. Feature Background
    if let Some(ref bg) = feature.background {
        out.push_str(&format!("  Background: {}\n", bg.name));
        if let Some(ref desc) = bg.description {
            for line in desc.lines() {
                out.push_str(&format!("    {}\n", line));
            }
        }
        for step in &bg.steps {
            format_step(step, "    ", &mut out);
        }
        out.push('\n');
    }

    // 4. Scenarios
    for scenario in &feature.scenarios {
        format_scenario(scenario, "  ", &mut out);
    }

    // 5. Rules
    for rule in &feature.rules {
        format_rule(rule, &mut out);
    }

    out
}

fn format_rule(rule: &Rule, out: &mut String) {
    out.push_str(&format!("  Rule: {}\n", rule.name));
    if let Some(ref desc) = rule.description {
        for line in desc.lines() {
            out.push_str(&format!("    {}\n", line));
        }
    }
    out.push('\n');

    if let Some(ref bg) = rule.background {
        out.push_str(&format!("    Background: {}\n", bg.name));
        for step in &bg.steps {
            format_step(step, "      ", out);
        }
        out.push('\n');
    }

    for scenario in &rule.scenarios {
        format_scenario(scenario, "    ", out);
    }
}

fn format_scenario(scenario: &Scenario, indent: &str, out: &mut String) {
    for tag in &scenario.tags {
        out.push_str(&format!("{}@{}\n", indent, tag));
    }

    out.push_str(&format!("{}{}: {}\n", indent, scenario.keyword, scenario.name));

    if let Some(ref desc) = scenario.description {
        for line in desc.lines() {
            out.push_str(&format!("{}  {}\n", indent, line));
        }
    }

    let step_indent = format!("{}  ", indent);
    for step in &scenario.steps {
        format_step(step, &step_indent, out);
    }

    // Examples tables
    for example in &scenario.examples {
        out.push('\n');
        for tag in &example.tags {
            out.push_str(&format!("{}  @{}\n", indent, tag));
        }
        let name = example.name.as_deref().unwrap_or("");
        if name.is_empty() {
            out.push_str(&format!("{}  Examples:\n", indent));
        } else {
            out.push_str(&format!("{}  Examples: {}\n", indent, name));
        }

        if let Some(ref table) = example.table {
            format_table(table, &format!("{}    ", indent), out);
        }
    }
    out.push('\n');
}

fn format_step(step: &Step, indent: &str, out: &mut String) {
    out.push_str(&format!("{}{}{}\n", indent, step.keyword, step.value));

    if let Some(ref docstring) = step.docstring {
        out.push_str(&format!("{}  \"\"\"\n", indent));
        for line in docstring.lines() {
            out.push_str(&format!("{}  {}\n", indent, line));
        }
        out.push_str(&format!("{}  \"\"\"\n", indent));
    }

    if let Some(ref table) = step.table {
        format_table(table, &format!("{}  ", indent), out);
    }
}

/// Formats a table and sorts reference/file example rows by file name.
fn format_table(table: &Table, indent: &str, out: &mut String) {
    if table.rows.is_empty() {
        return;
    }

    let swap = table.rows.first().map_or(false, |first_row| {
        first_row.len() == 2 && first_row[0] == "file" && first_row[1] == "references"
    });

    let mut rows: Vec<Vec<String>> = table
        .rows
        .iter()
        .enumerate()
        .map(|(i, row)| {
            let ordered = if swap {
                vec![row[1].clone(), row[0].clone()]
            } else {
                row.clone()
            };

            if i == 0 {
                ordered
                    .into_iter()
                    .map(|cell| cell.replace("references", "refs"))
                    .collect()
            } else {
                ordered
            }
        })
        .collect();

    // Keep the header in place and sort only tables that identify both columns.
    if let Some(header) = rows.first() {
        let file_column = header
            .iter()
            .position(|cell| cell.eq_ignore_ascii_case("file"));
        let has_refs_column = header.iter().any(|cell| {
            cell.eq_ignore_ascii_case("refs") || cell.eq_ignore_ascii_case("references")
        });

        if let Some(file_column) = file_column.filter(|_| has_refs_column) {
            rows[1..].sort_by_cached_key(|row| {
                row.get(file_column)
                    .map(|file| file.to_lowercase())
                    .unwrap_or_default()
            });
        }
    }

    // Determine the max width for each column, capped at 160
    let col_count = rows.iter().map(|row| row.len()).max().unwrap_or(0);
    let mut col_widths = vec![0; col_count];

    for row in &rows {
        for (i, cell) in row.iter().enumerate() {
            // Use unicode character count instead of byte length
            let cell_len = cell.chars().count();
            col_widths[i] = col_widths[i].max(cell_len).min(160);
        }
    }

    // Render formatted rows
    for row in &rows {
        out.push_str(indent);
        out.push('|');
        for (i, cell) in row.iter().enumerate() {
            let width = col_widths.get(i).copied().unwrap_or(0);
            let cell_len = cell.chars().count();
            let is_last_col = i == row.len() - 1;

            out.push(' ');
            out.push_str(cell);

            // Pad with spaces if the cell length is less than the calculated width
            if !is_last_col && cell_len < width {
                out.push_str(&" ".repeat(width - cell_len));
            }

            out.push_str(" |");
        }
        out.push('\n');
    }
}
