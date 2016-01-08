serialize = (csl) -> YAML.safeDump([csl], {skipInvalid: true})

flush = (items) -> "---\n" + items.join("\n") + "..."
