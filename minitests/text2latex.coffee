global.Zotero = {
  Debug: {
    enabled: true
  },
  debug: (str) -> console.log(str),
  Utilities: {
    XRegExp: require('xregexp')
  },
  BetterBibTeX: {
    titleCase: (str) -> str
  }
}

global.BetterBibTeX = {
  preferences: {}
}

text_to_latex = require('../resource/bibtex/unicode_translator.coffee').text2latex
lib = require('../test/fixtures/export/csquotes #302.json')

for item in lib.items
  console.log(item.publicationTitle)
  console.log(text_to_latex(item.publicationTitle, {unicode: false, mode: 'text', caseConversion: true}))
