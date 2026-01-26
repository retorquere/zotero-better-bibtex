import { Path } from './file'

import { log } from './logger'
import { getItemsAsync } from './get-items-async'
import type { Serialized } from '../gen/typings/serialized'

import { JournalAbbrev } from './journal-abbrev'
import { Preference } from './prefs'

class Serializer {
  private attachment(serialized: Serialized.Attachment, att): Serialized.Attachment {
    if (att.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_LINKED_URL) {
      serialized.localPath = att.getFilePath()
      if (serialized.localPath) serialized.defaultPath = `files/${att.id}/${Path.basename(serialized.localPath)}`
    }
    return serialized
  }

  private async item(item: Zotero.Item, selectedLibraryID: number): Promise<Serialized.Item> {
    if (item.libraryID !== selectedLibraryID) await item.loadAllData()

    let serialized: Serialized.Item = item.toJSON() as unknown as Serialized.Item
    serialized.uri = Zotero.URI.getItemURI(item)
    serialized.itemID = item.id

    switch (serialized.itemType) {
      case 'note':
      case 'annotation':
        break

      case 'attachment':
        serialized = this.attachment(serialized as unknown as Serialized.Attachment, item)
        break

      default:
        serialized.attachments = (await getItemsAsync(item.getAttachments()))
          .map(att => this.attachment({ ...att.toJSON(), uri: Zotero.URI.getItemURI(att) } as Serialized.Attachment, att))
        serialized.notes = (await getItemsAsync(item.getNotes()))
          .map(note => ({ ...note.toJSON(), uri: Zotero.URI.getItemURI(note) } as Serialized.Note))
        break
    }

    return structuredClone(fix(serialized, item))
  }

  public async serialize(items: Zotero.Item[]): Promise<Serialized.Item[]> {
    const selectedLibraryID = Zotero.getActiveZoteroPane().getSelectedLibraryID()
    return Promise.all(items.map(item => this.item(item, selectedLibraryID)))
  }
}
export const serializer = new Serializer

export function fix(serialized: Serialized.Item, item: Zotero.Item): Serialized.Item {
  if (item.isRegularItem() && !item.isFeedItem) {
    const regular = <Serialized.RegularItem>serialized

    if (!Zotero.BetterBibTeX.starting && Preference.autoAbbrev) {
      regular.autoJournalAbbreviation = JournalAbbrev.get(regular, 'auto') || ''
    }
  }

  // come on -- these are used in the collections export but not provided on the items?!
  serialized.itemID = item.id
  // serialized.key = serialized.itemKey = item.key
  serialized.itemKey = item.key
  serialized.libraryID = item.libraryID

  return serialized as unknown as Serialized.Item
}
