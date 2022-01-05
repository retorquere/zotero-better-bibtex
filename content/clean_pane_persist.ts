export function clean_pane_persist(): void {
  let persisted = Zotero.Prefs.get('pane.persist')
  if (persisted) {
    try {
      persisted = JSON.parse(persisted)
      delete persisted['zotero-items-column-citekey']
      Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))
    }
    catch (err) {
      Zotero.logError(err)
    }
  }
}
