declare const Translator: any

import Exporter = require('./csl/csl.ts')

Exporter.serialize = csl => JSON.stringify(csl)

Exporter.flush = items => `[\n${(items.map(item => `  ${item}`)).join(',\n')}\n]\n`

Translator.doExport = () => Exporter.doExport()
