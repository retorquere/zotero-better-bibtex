import { log } from './logger'

export function clean_pane_persist(): void {
  const pref = Zotero.Prefs.get('pane.persist') as string
  if (pref) {
    try {
      const persisted = JSON.parse(pref)
      delete persisted['zotero-items-column-citekey']
      delete persisted['zotero-items-column-citationKey']
      Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))
    }
    catch (err) {
      log.error('', err)
    }
  }
}
