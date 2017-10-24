declare const Translator: any

const Exporter = require('./csl/csl.ts') // tslint:disable-line:variable-name

Exporter.serialize = csl => JSON.stringify(csl)

Exporter.flush = items => `[\n${(items.map(item => `  ${item}`)).join(',\n')}\n]\n`

Translator.doExport = () => Exporter.doExport()
