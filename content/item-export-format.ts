import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS

import type { RegularItem, Attachment, Item } from '../gen/typings/serialized-item'
import { JournalAbbrev } from './journal-abbrev'
import { Preference } from './prefs'
import { orchestrator } from './orchestrator'
import { cache as IndexedCache } from './db/indexed'
import { Events } from './events'

function attachmentToPOJO(serialized: Attachment, att): Attachment {
  if (att.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_LINKED_URL) {
    serialized.localPath = att.getFilePath()
    if (serialized.localPath) serialized.defaultPath = `files/${att.id}/${$OS.Path.basename(serialized.localPath)}`
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return serialized
}

export function itemToPOJO(item: ZoteroItem): Item {
  let serialized: Item = item.toJSON()
  serialized.uri = Zotero.URI.getItemURI(item)
  serialized.itemID = item.id

  switch (serialized.itemType) {
    case 'note':
    case 'annotation':
      break

    case 'attachment':
      serialized = attachmentToPOJO(serialized as unknown as Attachment, item)
      break

    default:
      serialized.attachments = item.getAttachments().map(id => {
        const att = Zotero.Items.get(id)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return attachmentToPOJO({ ...att.toJSON(), uri: Zotero.URI.getItemURI(att) }, att)
      })

      serialized.notes = item.getNotes().map(id => {
        const note = Zotero.Items.get(id)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return { ...note.toJSON(), uri: Zotero.URI.getItemURI(note) }
      })
  }

  return serialized
}

export function fix(serialized: Item, item: ZoteroItem): Item {
  if (item.isRegularItem() && !item.isFeedItem) {
    const regular = <RegularItem>serialized

    if (Zotero.BetterBibTeX.ready.isPending()) {
      // with the new "title as citation", CSL can request these items before the key manager is online
      regular.citationKey = ''
    }
    else {
      regular.citationKey = Zotero.BetterBibTeX.KeyManager.get(item.id).citationKey
      if (!regular.citationKey) throw new Error(`no citation key for ${Zotero.ItemTypes.getName(item.itemTypeID)} ${item.id}`)
      if (!regular.journalAbbreviation && Preference.autoAbbrev) {
        const autoJournalAbbreviation = JournalAbbrev.get(regular)
        if (autoJournalAbbreviation) regular.autoJournalAbbreviation = autoJournalAbbreviation
      }
    }
  }

  // come on -- these are used in the collections export but not provided on the items?!
  serialized.itemID = item.id
  // serialized.key = serialized.itemKey = item.key
  serialized.itemKey = item.key
  serialized.libraryID = item.libraryID

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return serialized as unknown as Item
}

type Serialized = RegularItem | Attachment | Item
const serialize = (item: ZoteroItem): Serialized => <Serialized>JSON.parse(JSON.stringify(fix(itemToPOJO(item), item)))

orchestrator.add({
  id: 'serializer',
  description: 'object serializer',
  needs: ['cache', 'keymanager', 'abbreviator'],
  startup: async () => {
    const lastUpdated = await Zotero.DB.valueQueryAsync('SELECT MAX(dateModified) FROM items')
    await IndexedCache.open(serialize, lastUpdated)

    Events.serializationCacheTouch = async (ids: number[]) => {
      await IndexedCache.ExportFormat.delete(ids)
    }
  },
  shutdown: async () => { // eslint-disable-line @typescript-eslint/require-await
    IndexedCache.close()
  },
})
