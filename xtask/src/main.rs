use std::process::Command;

fn main() {
    let args: Vec<_> = std::env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: cargo xtask <command>");
        eprintln!("Commands:");
        eprintln!("  build     Build all crates and generate WASM bindings");
        std::process::exit(1);
    }

    match args[1].as_str() {
        "build" => build(),
        cmd => {
            eprintln!("Unknown command: {}", cmd);
            std::process::exit(1);
        }
    }
}

fn build() {
    println!("Building workspace...");
    run("cargo", &["build", "--workspace"]);

    println!("Building WASM bindings...");
    run("wasm-pack", &["build", "crates/translators", "--target", "web"]);

    println!("✓ Build complete");
}

fn run(cmd: &str, args: &[&str]) {
    let status = Command::new(cmd)
        .args(args)
        .status()
        .unwrap_or_else(|e| {
            eprintln!("Failed to run {}: {}", cmd, e);
            std::process::exit(1);
        });

    if !status.success() {
        eprintln!("{} failed", cmd);
        std::process::exit(1);
    }
}

