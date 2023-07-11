window.addEventListener('unload', () => {
  Zotero.BetterBibTeX.PrefPane.unload()
})
Zotero.BetterBibTeX.PrefPane.load(window).catch(err => Zotero.debug(`better-bibtex: error loading prefs: ${err}\n${err.stack}`))
