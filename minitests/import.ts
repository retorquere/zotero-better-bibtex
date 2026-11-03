// tslint:disable:no-console

// const bibtexParser = require('biblatex-csl-converter').BibLatexParser
// BibTeXParser = require('../../biblatex-csl-converter').BibLatexParser

import { writeFile, readFile } from 'node:fs/promises'
import init, { parse } from '@retorquere/bibtex-parser/wasm'

const binary = new URL(import.meta.resolve('@retorquere/bibtex-parser/wasm/bibtex_parser_bg.wasm'))
await init({ module_or_path: await readFile(binary) })
const library = parse(await readFile('test/fixtures/import/Some bibtex entries quietly discarded on import from bib file #873.bib', 'utf-8'))

await writeFile('parsed.json', JSON.stringify(library.entries.map(entry => entry.key.toLowerCase())))
await writeFile('library.json', JSON.stringify(library))

for (const entry of library.entries) {
}
