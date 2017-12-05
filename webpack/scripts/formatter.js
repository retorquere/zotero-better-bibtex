const ejs = require('ejs')
const sqlite = require('sqlite-sync')
const fs = require('fs')

sqlite.connect('test/fixtures/profile/zotero/zotero/zotero.sqlite')
// fetch fieldnames and capitalize them
const fields = sqlite.run("SELECT fieldName FROM fields ORDER BY fieldName").map(row => row.fieldName[0].toUpperCase() + row.fieldName.slice(1))
const table = []
const cells = 4
while (fields.length) {
  table.push(Array(cells).fill().map((_, i) => fields[i] || ''))
  fields.splice(0, cells)
}
console.log(table)

const preferences = require('../../gen/preferences.json')

const formatter = {
  '_': {},
  '$': {},
}
function walk(doc) {
  if (doc.kindString === 'Method') {
    if ((doc.name[0] == '_' || doc.name[0] === '$') && doc.name !== '$property') {
      if (doc.signatures.length !== 1) throw new Error('multiple sigs?')

      const name = doc.name.substr(1).replace(/_/g, '.')
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

walk(require('../../typedoc.json'))

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

console.log(formatter)

const template = fs.readFileSync('wiki/Citation-Keys.ejs', 'utf8')
console.log(ejs.render(template, {fields: table, preferences, functions: formatter.$, filters: formatter._}))
