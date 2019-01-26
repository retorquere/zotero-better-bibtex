declare const Zotero: any

import { pathSearch } from './path-search'
import { KeyManager } from './key-manager'
import * as log from './debug'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let TeXstudio = new class { // tslint:disable-line:variable-name
  public enabled: boolean
  public texstudio: string

  public async init() {
    try {
      this.texstudio = await pathSearch('texstudio')
    } catch (err) {
      log.debug('TeXstudio: not found:', err)
      this.texstudio = null
    }
    this.enabled = !!this.texstudio
    if (this.enabled) log.debug('TeXstudio: found at', this.texstudio)
  }

  public async push() {
    if (!this.enabled) throw new Error('texstudio was not found')

    const pane = Zotero.getActiveZoteroPane() // can Zotero 5 have more than one pane at all?

    let items
    try {
      items = pane.getSelectedItems()
      log.debug('TeXstudio:', items)
    } catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
      log.error('TeXstudio: Could not get selected items:', err)
      return
    }

    const citation = items.map(item => KeyManager.get(item.id).citekey).filter(citekey => citekey).join(',')
    if (!citation) {
      log.debug('TeXstudio: no items to cite')
      return
    }

    try {
      await Zotero.Utilities.Internal.exec(this.texstudio, ['--insert-cite', citation])
    } catch (err) {
      log.error('TeXstudio: Could not get execute texstudio:', err)
    }
  }
}
