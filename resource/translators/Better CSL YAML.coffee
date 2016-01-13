serialize = (csl) -> YAML.safeDump([csl], {skipInvalid: true})

flush = (items) -> "---\nreferences:\n" + items.join("\n") + "..."
