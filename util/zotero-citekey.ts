#!/usr/bin/env npx ts-node

import { parse, visit, prettyPrint as print } from 'recast'
import * as fs from 'fs'

console.log('getting zotero citekey generator')

const input = fs.readFileSync('../translators/BibTeX.js', 'utf-8')
let ast = parse('const TRANSLATOR_INFO=' + input)

/*
const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return
      seen.add(value)
    }
    return value
  }
}
console.log(JSON.stringify(ast, getCircularReplacer(), 2))
*/

ast = visit(ast, {
  visitForInStatement(path) {
    path.prune()
    return false
  },

  visitVariableDeclaration(path) {
    path.node.declarations = path.node.declarations.filter(decl => {
      if (decl.type === 'VariableDeclarator' && decl.id.type === 'Identifier') {
        switch (decl.id.name) {
          case 'TRANSLATOR_INFO':
          case 'alwaysMap':
          case 'bibtex2zoteroTypeMap':
          case 'caseProtectedFields':
          case 'encodeFilePathRE':
          case 'eprintIds':
          case 'exports':
          case 'extraIdentifiers':
          case 'fieldMap':
          case 'filePathSpecialChars':
          case 'inputFieldMap':
          case 'jabref':
          case 'keyRe':
          case 'keywordDelimRe':
          case 'keywordSplitOnSpace':
          case 'mappingTable':
          case 'months':
          case 'protectCapsRE':
          case 'revExtraIds':
          case 'reversemappingTable':
          case 'strings':
          case 'testCases':
          case 'vphantomRe':
          case 'zotero2bibtexTypeMap':
            return false
        }
        return true
      }
      else {
        return true
      }
    })

    if (!path.node.declarations.length) path.prune()

    this.traverse(path)
  },

  visitFunctionDeclaration(path) {
    switch (path.node.id.name) {
      case 'beginRecord':
      case 'cleanFilePath':
      case 'dateFieldsToDate':
      case 'decodeFilePathComponent':
      case 'detectImport':
      case 'doExport':
      case 'doImport':
      case 'encodeFilePathComponent':
      case 'escapeSpecialCharacters':
      case 'extraFieldsToString':
      case 'getFieldValue':
      case 'jabrefCollect':
      case 'jabrefSplit':
      case 'mapAccent':
      case 'mapHTMLmarkup':
      case 'mapTeXmarkup':
      case 'parseExtraFields':
      case 'parseFilePathRecord':
      case 'processComment':
      case 'processField':
      case 'readString':
      case 'setKeywordDelimRe':
      case 'setKeywordSplitOnSpace':
      case 'splitUnprotected':
      case 'unescapeBibTeX':
      case 'writeField':
        path.prune()
    }

    this.traverse(path)
  },

  visitMemberExpression(path) {
    const object = path.node.object
    const property = path.node.property
    // Zotero.Utilities.strToISO => Zotero.Date.strToISO
    if (object.type === 'Identifier' && object.name === 'Zotero' && property.type === 'Identifier' && property.name === 'Utilities') {
      property.name = 'Date'
    }
    // Zotero.getHiddenPref => Z.getHiddenPref so I can shim it.
    else if (object.type === 'Identifier' && object.name === 'Zotero' && property.type === 'Identifier' && property.name === 'getHiddenPref') {
      object.name = 'Z'
    }
    this.traverse(path)
  },
})

const code = `
const ZU = Zotero.Utilities;

const Z = {
  getHiddenPref(p) {
    return Zotero.Prefs.get('translators.' + p);
  }
};

${print(ast, {tabWidth: 2, quote: 'single'}).code}

module.exports = {
  buildCiteKey: buildCiteKey
};
`

fs.writeFileSync('content/key-manager/formatter-zotero.js', code.trim())
