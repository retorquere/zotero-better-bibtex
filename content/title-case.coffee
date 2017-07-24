citeproc = require('./citeproc.coffee')

state = {
  opt: { lang: 'en' },
  locale: {
    en: {
      opts: {
        'skip-words': citeproc.SKIP_WORDS,
        'skip-words-regexp': new RegExp('(?:(?:[?!:]*\\s+|-|^)(?:' + citeproc.SKIP_WORDS.slice().join('|') + ')(?=[!?:]*\\s+|-|$))', 'g')
      }
    }
  }
}

module.exports = (text) -> citeproc.Output.Formatters.title(state, text)
