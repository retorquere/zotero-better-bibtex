declare const Zotero: any

import { JournalAbbrev } from './journal-abbrev'

import { DB as Cache } from './db/cache'
import { KeyManager } from './key-manager'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Serializer = new class { // tslint:disable-line:variable-name
  private enabled = true
  private cache

  public init() {
    JournalAbbrev.init()
    this.cache = this.enabled && Cache.getCollection('itemToExportFormat')
  }

  public fetch(item, legacy, skipChildItems) {
    if (!this.cache) return null

    const query = { itemID: item.id, legacy: !!legacy, skipChildItems: !!skipChildItems}
    const cached = this.cache.findOne(query)
    if (!cached) return null

    return this.enrich(cached.item, item)
  }

  public store(item, serialized, legacy, skipChildItems) {
    // come on -- these are used in the collections export but not provided on the items?!
    serialized.itemID = item.id
    serialized.key = item.key

    if (this.cache) {
      this.cache.insert({itemID: item.id, legacy: !!legacy, skipChildItems: !!skipChildItems, item: serialized})
    } else {
      if (this.enabled) Zotero.debug('Serializer.store ignored, DB not yet loaded')
    }

    return this.enrich(serialized, item)
  }

  public serialize(item) { return Zotero.Utilities.Internal.itemToExportFormat(item, false, true) }

  private enrich(serialized, item) {
    switch (serialized.itemType) {
      case 'note':
      case 'attachment':
        break

      default:
        serialized.citekey = KeyManager.get(item.id).citekey
        serialized.citationKey = serialized.citationKey || serialized.citekey // prepare for https://github.com/zotero/translators/pull/1810#issuecomment-456219750
        serialized.journalAbbreviation = JournalAbbrev.get(serialized)
        serialized.libraryID = item.libraryID
        break
    }
    return serialized
  }
}
