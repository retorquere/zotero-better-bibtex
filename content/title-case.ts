// import Citeproc = require('./citeproc.ts')
declare const Zotero: any

const state = {
  opt: { lang: 'en' },

  locale: {
    en: {
      opts: {
        'skip-words': Zotero.CiteProc.CSL.SKIP_WORDS,
        'skip-words-regexp': new RegExp(`(?:(?:[?!:]*\\s+|-|^)(?:${Zotero.CiteProc.CSL.SKIP_WORDS.slice().join('|')})(?=[!?:]*\\s+|-|$))`, 'g'),
      },
    },
  },
}

export = text => Zotero.CiteProc.CSL.Output.Formatters.title(state, text)
