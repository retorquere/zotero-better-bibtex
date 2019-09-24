declare const Zotero: any

const state = {
  opt: { lang: 'en' },

  locale: {
    en: {
      opts: {
        'skip-words': Zotero.CiteProc.CSL.SKIP_WORDS,
        'skip-words-regexp': new RegExp( '(?:(?:[?!:]*\\s+|-|^)(?:' + Zotero.CiteProc.CSL.SKIP_WORDS.join('|') + ')(?=[!?:]*\\s+|-|$))', 'g'), // tslint:disable-line:prefer-template
      },
    },
  },
}

export function titleCase(text) {
  const titleCased = Zotero.CiteProc.CSL.Output.Formatters.title(state, text)
  return titleCased
}
