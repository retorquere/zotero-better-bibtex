const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const trigger = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '-' + window.document.readyState
Zotero.debug(`bbt-preferences: pre-load ${trigger}`)
if (window.document.readyState === 'complete') {
  Zotero.BetterBibTeX.PrefPane.load(window, trigger)
}
else {
  window.addEventListener('load', (event) => {
    Zotero.BetterBibTeX.PrefPane.load(window, trigger)
  })
}

window.addEventListener('unload', (event) => {
  Zotero.BetterBibTeX.PrefPane.unload(trigger)
})
