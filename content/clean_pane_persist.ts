import { log } from './logger'

export function clean_pane_persist(): void {
  let persisted = Zotero.Prefs.get('pane.persist')
  if (persisted) {
    try {
      persisted = JSON.parse(persisted)
      delete persisted['zotero-items-column-citekey']
      delete persisted['zotero-items-column-citationKey']
      Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))
    }
    catch (err) {
      log.error('', err)
    }
  }
}
