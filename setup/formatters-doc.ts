// tslint:disable:no-console

import * as fs from 'fs'
import * as sqlite from 'sqlite-sync'
import * as yaml from 'js-yaml'

sqlite.connect('test/fixtures/profile/zotero/zotero/zotero.sqlite')
// fetch fieldnames and capitalize them
const query = `
  SELECT DISTINCT COALESCE(bf.fieldName, f.fieldName) as fieldName
  FROM itemTypes it
  JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
  JOIN fields f ON f.fieldID = itf.fieldID
  LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
  LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
`.replace(/\n/g, ' ').trim()
const fields = sqlite.run(query).map(row => row.fieldName[0].toUpperCase() + row.fieldName.slice(1))
fields.sort()

const cells = 4
const table = []
while (fields.length) {
  table.push(fields.splice(0, cells).concat([...Array(cells)]).slice(0, cells).map(cell => cell || ''))
}

const formatter = {
  _: {},
  $: {},
}
function walk(doc) {
  if (doc.kindString === 'Method') {
    if ((doc.name[0] === '_' || doc.name[0] === '$') && doc.name !== '$property') {
      if (doc.signatures.length !== 1) throw new Error('multiple sigs?')

      let name = doc.name.substr(1).replace(/_/g, '.')
      if (doc.signatures[0].parameters && doc.name[0] === '$') {
        const parameters = doc.signatures[0].parameters.reduce((acc, p) => { acc[p.name] = true ; return acc }, {})
        if (parameters.n) name += 'N'
        if (parameters.n && parameters.m) name += '_M'
      }

      let documentation = ''
      if (doc.signatures[0].comment && doc.signatures[0].comment.shortText) {
        documentation = doc.signatures[0].comment.shortText
      } else {
        documentation = 'not documented'
      }

      formatter[doc.name[0]][name] = documentation
    }
  } else {
    for (const child of doc.children || []) {
      walk(child)
    }
  }
}

walk(require('../typedoc.json'))

function quote(s) { return `\`${s}\`` }
for (const func of Object.keys(formatter.$)) {
  let name
  if (func.startsWith('authors')) {
    name = [func, func.replace(/^authors/, 'editors')].map(quote).join(' / ')
  } else if (func.startsWith('author')) {
    name = [func, func.replace(/^author/, 'editor')].map(quote).join(' / ')
  } else if (func.startsWith('auth')) {
    name = [func, func.replace(/^auth/, 'edtr')].map(quote).join(' / ')
  } else {
    name = quote(func)
  }
  formatter.$[name] = formatter.$[func]
  delete formatter.$[func]
}
for (const filter of Object.keys(formatter._)) {
  formatter._[quote(filter)] = formatter._[filter]
  delete formatter._[filter]
}

const preferences = require('../gen/preferences.json')
const defaults = {}
for (const [pref, meta] of Object.entries(preferences)) {
  defaults[pref] = (meta as any).default
}

fs.writeFileSync('docs/_data/preferences.yml', yaml.safeDump(defaults))
fs.writeFileSync('docs/_data/pattern/fields.yml', yaml.safeDump(table))
fs.writeFileSync('docs/_data/pattern/functions.yml', yaml.safeDump(formatter.$))
fs.writeFileSync('docs/_data/pattern/filters.yml', yaml.safeDump(formatter._))
