#!/usr/bin/env node

import fs from 'fs'
import * as glob from 'glob'

import { Eta } from 'eta'

console.info('pre-processing translators')

const pseudoOptions = {
  exportDir: '',
  exportPath: '',
  custom: false,
}
const explain = {
  custom: 'for pandoc-filter CSL',
  displayOptions: 'for BetterBibTeX JSON',
}

const optionFor = {}
const displayOptions = {}
const headers = glob.globSync('translators/*.json')
  .sort()
  .map(file => JSON.parse(fs.readFileSync(file, 'utf-8')))

for (const header of headers) {
  header.configOptions ??= {}
  header.configOptions.hash = ''
  for (const [option, value] of Object.entries(header.displayOptions || {})) {
    displayOptions[option] = value
    optionFor[option] = optionFor[option] || []
    optionFor[option].push(header.label)
  }
}

for (const options of [displayOptions, pseudoOptions]) {
  for (const [option, value] of Object.entries(options)) {
    const comments = [...(optionFor[option] || [])]
    if (explain[option]) comments.push(explain[option])
    const type = `${ typeof value },`.padEnd(8)
    const comment = comments.length ? ` // ${ comments.join(', ') }` : ''
    options[option] = `  ${ `${ option }?:`.padEnd(25) }${ type }${ comment }`
  }
}

fs.writeFileSync('gen/translators.json', JSON.stringify(headers, null, 2))
const eta = new Eta
fs.writeFileSync('gen/translators.ts', eta.renderString(
  fs.readFileSync('setup/templates/translators.ts.eta', 'utf-8'),
  { displayOptions, pseudoOptions, headers },
))
