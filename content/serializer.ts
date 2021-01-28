declare const Zotero: any
declare const OS: any

import { JournalAbbrev } from './journal-abbrev'

import { DB as Cache } from './db/cache'
import { KeyManager } from './key-manager'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Serializer = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private cache

  public init() {
    JournalAbbrev.init()
    this.cache = Cache.getCollection('itemToExportFormat')
  }

  private fetch(item) {
    if (!this.cache) return null

    const cached = this.cache.findOne({ itemID: item.id })
    if (!cached) return null

    return this.enrich(cached.item, item)
  }

  private store(item, serialized) {
    if (this.cache) {
      this.cache.insert({ itemID: item.id, item: serialized })
    } else {
      Zotero.debug('Serializer.store ignored, DB not yet loaded')
    }

    return this.enrich(serialized, item)
  }

  public serialize(item) { return Zotero.Utilities.Internal.itemToExportFormat(item, false, true) }

  public fast(item, count?: { cached: number }) {
    let serialized = this.fetch(item)

    if (serialized) {
      if (count) count.cached += 1
    } else {
      serialized = item.toJSON()
      serialized.uri = Zotero.URI.getItemURI(item)
      serialized.itemID = item.id

      switch (serialized.itemType) {
        case 'note':
          break

        case 'attachment':
          serialized = this.fastAttachment(serialized, item)
          break

        default:
          serialized.attachments = item.getAttachments().map(id => {
            const att = Zotero.Items.get(id)
            return this.fastAttachment({ ...att.toJSON(), uri: Zotero.URI.getItemURI(att) }, att)
          })

          serialized.notes = item.getNotes().map(id => {
            const note = Zotero.Items.get(id)
            return { ...note.toJSON(), uri: Zotero.URI.getItemURI(note) }
          })
      }
      this.store(item, serialized)
    }

    // since the cache doesn't clone, these will be written into the cache, but since we override them always anyways, that's OK
    return this.enrich(serialized, item)
  }

  private fastAttachment(serialized, att) {
    if (att.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_LINKED_URL) {
      serialized.localPath = att.getFilePath()
      if (serialized.localPath) serialized.defaultPath = `files/${att.id}/${OS.Path.basename(serialized.localPath)}`
    }
    return serialized
  }

  public enrich(serialized, item) {
    switch (serialized.itemType) {
      case 'note':
      case 'attachment':
        break

      default:
        serialized.citekey = KeyManager.get(item.id).citekey
        serialized.citationKey = serialized.citationKey || serialized.citekey // prepare for https://github.com/zotero/translators/pull/1810#issuecomment-456219750
        if (!serialized.journalAbbreviation) serialized.autoJournalAbbreviation = JournalAbbrev.get(serialized)
        break
    }

    // come on -- these are used in the collections export but not provided on the items?!
    serialized.itemID = item.id
    serialized.key = item.key
    serialized.libraryID = item.libraryID
    return serialized
  }
}
