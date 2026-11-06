use clap::{Parser, Subcommand};

mod gherkin_formatter;
mod test;

#[derive(Parser)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    Test {
        #[command(subcommand)]
        command: test::Command,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();

    match Cli::parse().command {
        Command::Test { command } => test::run(command).await?,
    }

    Ok(())
}
