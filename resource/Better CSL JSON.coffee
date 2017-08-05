Exporter = require('./csl/csl.coffee')

Exporter::serialize = (csl) -> JSON.stringify(csl)

Exporter::flush = (items) -> "[\n" + ("  #{item}" for item in items).join(",\n") + "\n]\n"

BetterBibTeX.doExport = -> (new Exporter()).doExport()
