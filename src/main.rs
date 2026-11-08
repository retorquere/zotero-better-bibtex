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
async fn main() -> std::process::ExitCode {
    dotenvy::dotenv().ok();

    let result = match Cli::parse().command {
        Command::Test { command } => test::run(command).await,
    };

    match result {
        Ok(()) => std::process::ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Error: {error}");
            std::process::ExitCode::FAILURE
        }
    }
}
