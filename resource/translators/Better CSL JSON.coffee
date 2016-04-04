serialize = (csl) -> JSON.stringify(csl)

flush = (items) -> "[\n" + ("  #{item}" for item in items).join(",\n") + "\n]\n"
