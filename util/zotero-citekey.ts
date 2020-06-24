#!/usr/bin/env npx ts-node

import j = require('jscodeshift')
import * as fs from 'fs'

const input = fs.readFileSync('../translators/BibTeX.js', 'utf-8')
const ast = j('const TRANSLATOR_INFO=' + input)

console.log('getting zotero citekey generator')

const x_functions = [
  'beginRecord',
  'cleanFilePath',
  'decodeFilePathComponent',
  'detectImport',
  'doExport',
  'doImport',
  'encodeFilePathComponent',
  'escapeSpecialCharacters',
  'extraFieldsToString',
  'getFieldValue',
  'jabrefCollect',
  'jabrefSplit',
  'mapAccent',
  'mapHTMLmarkup',
  'mapTeXmarkup',
  'parseExtraFields',
  'parseFilePathRecord',
  'processComment',
  'processField',
  'readString',
  'setKeywordDelimRe',
  'setKeywordSplitOnSpace',
  'splitUnprotected',
  'unescapeBibTeX',
  'writeField',
]
for (const name of x_functions) {
  ast.find(j.FunctionDeclaration, { id: { type: 'Identifier', name } }).remove()
}

const x_vars =  [
  'TRANSLATOR_INFO',
  'alwaysMap',
  'bibtex2zoteroTypeMap',
  'caseProtectedFields',
  'encodeFilePathRE',
  'eprintIds',
  'exports',
  'extraIdentifiers',
  'fieldMap',
  'filePathSpecialChars',
  'inputFieldMap',
  'jabref',
  'keyRe',
  'keywordDelimRe',
  'keywordSplitOnSpace',
  'mappingTable',
  'months',
  'protectCapsRE',
  'revExtraIds',
  'reversemappingTable',
  'strings',
  'testCases',
  'vphantomRe',
  'zotero2bibtexTypeMap',
]
for (const name of x_vars) {
  ast.find(j.VariableDeclarator, { id: { type: 'Identifier', name } }).remove()
}

ast.find(j.ForInStatement, { type: 'ForInStatement' }).remove()

ast.find(j.MemberExpression, {
  type: 'MemberExpression',
  object: { type: 'Identifier', name: 'Zotero' },
  property: { type: 'Identifier', name: 'Utilities' },
}).forEach(p => {
  p.value.property.name = 'Date'
})

const code = `
const ZU = Zotero.Utilities;

${ast.toSource()}

module.exports = { buildCiteKey: buildCiteKey }
`

const code_with_prefs = code
  .replace("Zotero.getHiddenPref('BibTeX.export.simpleCitekey')", "Zotero.Prefs.get('translators.BibTeX.export.simpleCitekey')")
  .replace('Zotero.getHiddenPref', 'Zotero.Prefs')
if (code === code_with_prefs) throw new Error('no change')

fs.writeFileSync('content/key-manager/formatter-zotero.js', code_with_prefs)
