import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS

import type { Attachment, Item } from '../gen/typings/serialized-item'
import { JournalAbbrev } from './journal-abbrev'
import { DB as Cache } from './db/cache'
import { $and } from './db/loki'
import { Preference } from './prefs'
import { orchestrator } from './orchestrator'

type CacheEntry = {
  itemID: number
  item: Item
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Serializer = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private cache

  constructor() {
    orchestrator.add('serializer', {
      description: 'object serializer',
      needs: ['cache', 'keymanager', 'abbreviator'],
      startup: async () => { // eslint-disable-line @typescript-eslint/require-await
        try {
          this.cache = Cache.getCollection('itemToExportFormat')
        }
        catch (err) {
          Zotero.debug(`Serializer.init failed: ${err.message}`)
        }
      },
    })
  }

  private fetch(item: ZoteroItem): Item {
    if (!Preference.cache || !this.cache) return null

    const cached: CacheEntry = this.cache.findOne($and({ itemID: item.id }))
    if (!cached) return null

    return this.enrich(cached.item, item)
  }

  private store(item: ZoteroItem, serialized: Item): Item {
    if (this.cache) {
      if (Preference.cache) this.cache.insert({ itemID: item.id, item: serialized })
    }
    else {
      Zotero.debug('Serializer.store ignored, DB not yet loaded')
    }

    return this.enrich(serialized, item)
  }

  public serialize(item: ZoteroItem): Item {
    return Zotero.Utilities.Internal.itemToExportFormat(item, false, true) as Item
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
      if (serialized.localPath) serialized.defaultPath = `files/${att.id}/${$OS.Path.basename(serialized.localPath)}`
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
        serialized.citationKey = Zotero.BetterBibTeX.KeyManager.get(item.id).citationKey
        if (!serialized.citationKey) throw new Error(`no citation key for ${Zotero.ItemTypes.getName(item.itemTypeID)} ${item.id}`)
        if (!serialized.journalAbbreviation && Preference.autoAbbrev) {
          const autoJournalAbbreviation = JournalAbbrev.get(serialized)
          if (autoJournalAbbreviation) serialized.autoJournalAbbreviation = autoJournalAbbreviation
        }
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
