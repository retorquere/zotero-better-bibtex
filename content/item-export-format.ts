import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS

import { log } from './logger/simple'
import { getItemsAsync } from './get-items-async'
import type { Attachment, RegularItem, Item, Note } from '../gen/typings/serialized-item'
export type Serialized = RegularItem | Attachment | Item

import { JournalAbbrev } from './journal-abbrev'
import { Preference } from './prefs'

export class Serializer {
  private attachment(serialized: Attachment, att): Attachment {
    if (att.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_LINKED_URL) {
      serialized.localPath = att.getFilePath()
      if (serialized.localPath) serialized.defaultPath = `files/${ att.id }/${ $OS.Path.basename(serialized.localPath) }`
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return serialized
  }

  private async item(item: ZoteroItem, selectedLibraryID: number): Promise<Serialized> {
    if (item.libraryID !== selectedLibraryID) await item.loadAllData()

    let serialized: Item = item.toJSON()
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

    return <Serialized>JSON.parse(JSON.stringify(fix(serialized, item)))
  }

  public async serialize(items: ZoteroItem[]): Promise<Serialized[]> {
    const selectedLibraryID = Zotero.getActiveZoteroPane().getSelectedLibraryID()
    return Promise.all(items.map(item => this.item(item, selectedLibraryID)))
  }
}
export const serializer = new Serializer

export function fix(serialized: Item, item: ZoteroItem): Item {
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
      if (!regular.journalAbbreviation && typeof regular.autoJournalAbbreviation !== 'string' && Preference.autoAbbrev) {
        regular.autoJournalAbbreviation = JournalAbbrev.get(regular) || ''
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
