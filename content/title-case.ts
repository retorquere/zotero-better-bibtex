import Citeproc = require('./citeproc.ts')

const state = {
  opt: { lang: 'en' },

  locale: {
    en: {
      opts: {
        'skip-words': Citeproc.SKIP_WORDS,
        'skip-words-regexp': new RegExp(`(?:(?:[?!:]*\\s+|-|^)(?:${Citeproc.SKIP_WORDS.slice().join('|')})(?=[!?:]*\\s+|-|$))`, 'g'),
      },
    },
  },
}

export = text => Citeproc.Output.Formatters.title(state, text)
