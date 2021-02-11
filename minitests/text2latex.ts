/* eslint-disable no-console */

const Zotero = { // tslint:disable-line:variable-name
  Debug: {
    enabled: true,
  },
  debug(str) { return console.log(str) },
  Utilities: {
    XRegExp: require('xregexp'),
  },
  BetterBibTeX: {
    titleCase(str) { return str },
  },
}

const BetterBibTeX = { // tslint:disable-line:variable-name
  preferences: {},
}

const text_to_latex = require('../resource/bibtex/unicode_translator.coffee').text2latex
const lib = require('../test/fixtures/export/csquotes #302.json')

for (const item of lib.items) {
  console.log(item.publicationTitle)
  console.log(text_to_latex(item.publicationTitle, {unicode: false, mode: 'text', caseConversion: true}))
}
