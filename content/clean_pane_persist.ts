import { log } from './logger'

import { is7 } from './client'
export function clean_pane_persist(): void {
  if (!is7) return

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
