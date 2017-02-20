Components.utils.import("resource://zotero-better-bibtex/lib/citeproc.js", Zotero.BetterBibTeX)

Zotero.BetterBibTeX.TitleCaser = {
  state: {
    opt: { lang: 'en' },
    locale: {
      en: {
        opts: {
          'skip-words': Zotero.BetterBibTeX.CSL.SKIP_WORDS,
          'skip-words-regexp': new RegExp('(?:(?:[?!:]*\\s+|-|^)(?:' + Zotero.BetterBibTeX.CSL.SKIP_WORDS.slice().join('|') + ')(?=[!?:]*\\s+|-|$))', 'g')
        }
      }
    }
  },

  titleCase: (text) -> Zotero.BetterBibTeX.CSL.Output.Formatters.title(Zotero.BetterBibTeX.TitleCaser.state, text)
}
