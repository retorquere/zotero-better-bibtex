import { Path } from './file'

import { log } from './logger'
import { getItemsAsync } from './get-items-async'
import type { Attachment, RegularItem, Item, Note } from '../gen/typings/serialized-item'

import { JournalAbbrev } from './journal-abbrev'
import { Preference } from './prefs'

export class Serializer {
  private attachment(serialized: Attachment, att): Attachment {
    if (att.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_LINKED_URL) {
      serialized.localPath = att.getFilePath()
      if (serialized.localPath) serialized.defaultPath = `files/${att.id}/${Path.basename(serialized.localPath)}`
    }
    return serialized
  }

  private async item(item: Zotero.Item, selectedLibraryID: number): Promise<Item> {
    if (item.libraryID !== selectedLibraryID) await item.loadAllData()

    let serialized: Item = item.toJSON() as unknown as Item
    serialized.uri = Zotero.URI.getItemURI(item)
    serialized.itemID = item.id

    switch (serialized.itemType) {
      case 'note':
      case 'annotation':
        break

      case 'attachment':
        serialized = this.attachment(serialized as unknown as Attachment, item)
        break

      default:
        serialized.attachments = (await getItemsAsync(item.getAttachments()))
          .map(att => this.attachment({ ...att.toJSON(), uri: Zotero.URI.getItemURI(att) } as Attachment, att))
        serialized.notes = (await getItemsAsync(item.getNotes()))
          .map(note => ({ ...note.toJSON(), uri: Zotero.URI.getItemURI(note) } as Note))
        break
    }

    return structuredClone(fix(serialized, item))
  }

  public async serialize(items: Zotero.Item[]): Promise<Item[]> {
    const selectedLibraryID = Zotero.getActiveZoteroPane().getSelectedLibraryID()
    return Promise.all(items.map(item => this.item(item, selectedLibraryID)))
  }
}
export const serializer = new Serializer

export function fix(serialized: Item, item: Zotero.Item): Item {
  if (item.isRegularItem() && !item.isFeedItem) {
    const regular = <RegularItem>serialized

    if (Zotero.BetterBibTeX.starting) {
      // with the new "title as citation", CSL can request these items before the key manager is online
      regular.citationKey = ''
    }
    else {
      regular.citationKey = Zotero.BetterBibTeX.KeyManager.get(item.id).citationKey
      if (!regular.citationKey) {
        // throw new Error(`no citation key for ${ Zotero.ItemTypes.getName(item.itemTypeID) } ${ item.id }`)
        log.error(`no citation key for ${ Zotero.ItemTypes.getName(item.itemTypeID) } ${ item.id } ${ JSON.stringify(regular) }`)
        regular.citationKey = `temporary-citekey-${ item.id }`
      }
      if (Preference.autoAbbrev) {
        regular.autoJournalAbbreviation = JournalAbbrev.get(regular, 'auto') || ''
      }
    }
  }

  // come on -- these are used in the collections export but not provided on the items?!
  serialized.itemID = item.id
  // serialized.key = serialized.itemKey = item.key
  serialized.itemKey = item.key
  serialized.libraryID = item.libraryID

  return serialized as unknown as Item
}
