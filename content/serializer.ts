import type { Attachment, Item } from '../gen/typings/serialized-item'
import { JournalAbbrev } from './journal-abbrev'
import { DB as Cache } from './db/cache'
import { $and } from './db/loki'

type CacheEntry = {
  itemID: number
  item: Item
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Serializer = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private cache

  public init() {
    JournalAbbrev.init().then(() => {
      this.cache = Cache.getCollection('itemToExportFormat')
    }).catch(err => {
      Zotero.debug(`Serializer.init failed: ${err.message}`)
    })
  }

  private fetch(item: ZoteroItem): Item {
    if (!this.cache) return null

    const cached: CacheEntry = this.cache.findOne($and({ itemID: item.id }))
    if (!cached) return null

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.enrich(cached.item, item)
  }

  private store(item: ZoteroItem, serialized: Item): Item {
    if (this.cache) {
      this.cache.insert({ itemID: item.id, item: serialized })
    }
    else {
      Zotero.debug('Serializer.store ignored, DB not yet loaded')
    }

    return this.enrich(serialized, item)
  }

  public serialize(item: ZoteroItem): Item {
    const serialized = Zotero.Utilities.Internal.itemToExportFormat(item, false, true) as Item
    // if (this.cache) this.cache.insert({ itemID: item.id, item: serialized }) // this causes cache invalidation problems. No idea why.
    return serialized
  }

  public fast(item: ZoteroItem): Item {
    let serialized = this.fetch(item)

    if (!serialized) {
      serialized = item.toJSON()
      serialized.uri = Zotero.URI.getItemURI(item)
      serialized.itemID = item.id

      switch (serialized.itemType) {
        case 'note':
        case 'annotation':
          break

        case 'attachment':
          serialized = this.fastAttachment(serialized as unknown as Attachment, item)
          break

        default:
          serialized.attachments = item.getAttachments().map(id => {
            const att = Zotero.Items.get(id)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return this.fastAttachment({ ...att.toJSON(), uri: Zotero.URI.getItemURI(att) }, att)
          })

          serialized.notes = item.getNotes().map(id => {
            const note = Zotero.Items.get(id)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return { ...note.toJSON(), uri: Zotero.URI.getItemURI(note) }
          })
      }
      this.store(item, serialized)
    }

    // since the cache doesn't clone, these will be written into the cache, but since we override them always anyways, that's OK
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.enrich(serialized, item)
  }

  private fastAttachment(serialized: Attachment, att): Attachment {
    if (att.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_LINKED_URL) {
      serialized.localPath = att.getFilePath()
      if (serialized.localPath) serialized.defaultPath = `files/${att.id}/${OS.Path.basename(serialized.localPath)}`
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return serialized
  }

  public enrich(serialized: Item, item: ZoteroItem): Item {
    switch (serialized.itemType) {
      case 'note':
      case 'annotation':
      case 'attachment':
        break

      default:
        serialized.citationKey = Zotero.BetterBibTeX.KeyManager.get(item.id).citekey
        // @ts-ignore
        serialized.citekey = serialized.citationKey // legacy
        if (!serialized.journalAbbreviation) serialized.autoJournalAbbreviation = JournalAbbrev.get(serialized)
        break
    }

    // come on -- these are used in the collections export but not provided on the items?!
    serialized.itemID = item.id
    // serialized.key = serialized.itemKey = item.key
    serialized.itemKey = item.key
    serialized.libraryID = item.libraryID

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return serialized
  }
}
