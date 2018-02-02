// tslint:disable:no-console

import * as path from 'path'
import * as fs from 'fs-extra'

console.log('translator framework typings')

import root from 'zotero-plugin/root'

const preferences = require(path.join(root, 'gen/preferences.json'))
const translators = require(path.join(root, 'gen/translators.json'))
const _ = require('lodash')

const prefs = Object.keys(preferences).map(pref => {
  switch (pref) {
    case 'csquotes':
      return `    ${pref}: { open: string, close: string}`

    case 'skipFields':
    case 'skipWords':
      return `    ${pref}: string[]`

    default:
      return `    ${pref}: ${typeof preferences[pref]}`
  }
}).join('\n')
const labels = Object.keys(translators.byLabel).map(tr => `  ${tr}?: boolean`).join('\n')

const header = {
  displayOptions: {
    quickCopyMode: true, // faked by tests
  },
}

fs.readdirSync(path.join(root, 'resource'))
  .filter(f => f.endsWith('.json'))
  .map(json => {
    const tr = JSON.parse(fs.readFileSync(path.join(root, 'resource', json), 'utf-8'))
    _.merge(header, tr)
  })

function quoted(k) { return k.indexOf(' ') >= 0 ? `'${k}'` : k }

let headerSpec = ''
for (const [key, value] of Object.entries(header)) {
  headerSpec += `    ${key}:`
  if (typeof value === 'object') {
    headerSpec += ' {\n'
    for (const [k, v] of Object.entries(value)) {
      headerSpec += `      ${quoted(k)}: ${typeof v}\n`
    }
    headerSpec += '    }\n'
  } else {
    headerSpec += ` ${typeof value}\n`
  }
}

const options = Object.keys(header.displayOptions).map(option => `    ${quoted(option)}?: ${typeof header.displayOptions[option]}`).join('\n')

fs.writeFileSync(path.join(root, 'gen/typings/translator.d.ts'), `
interface ITranslator {
  preferences: {
${prefs}
  }

${labels}

  header: {
${headerSpec}  }

  collections: any[]

  options: {
${options}
  }

  unicode: boolean
  debugEnabled: boolean

  doExport: () => void
  detectImport: () => void
  doImport: () => void
  initialize: () => void
}
`)
