serialize = (csl) -> YAML.safeDump([csl], {skipInvalid: true})

flush = (items) -> items.join('')
