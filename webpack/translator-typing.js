const preferences = require('../defaults/preferences/defaults.json')
const translators = require('./translators');
const fs = require('fs')
const path = require('path')
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
}).join('\n');
const labels = Object.keys(translators).map(tr => `  ${tr.replace(/ /g, '')}?: boolean`).join('\n');

const header = {
  displayOptions: {
    quickCopyMode: true // faked by tests
  }
}

fs.readdirSync(path.join(__dirname, '../resource'))
  .filter(f => f.endsWith('.json'))
  .map(json => {
    const tr = JSON.parse(fs.readFileSync(path.join(__dirname, '../resource', json)));
    _.merge(header, tr)
  })

function quoted(k) { return k.indexOf(' ') >= 0 ? `'${k}'` : k }

let headerSpec = '';
for (const [key, value] of Object.entries(header)) {
  headerSpec += `    ${key}:`;
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

const options = Object.keys(header.displayOptions).map(option => `    ${quoted(option)}?: ${typeof header.displayOptions[option]}`).join('\n');

fs.writeFileSync('gen/translator.ts', `
export interface ITranslator {
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
`);
