/* eslint-disable max-len, id-blacklist */

import { Fields } from '../../content/extra'
import type { arXiv } from '../../content/arXiv'
<%
  nonregular = ['note', 'annotation', 'attachment']

  def isort(l):
    return sorted(l, key=lambda t: t.lower())

  fields = isort(list({
    name
    for itemType in schema.itemTypes
    for field in itemType.fields
    for name in (field.field, getattr(field, 'baseField', field.field))
  }))

  def quoted(name):
    return "'" + name + "'"
%>

export namespace Serialized {
  type RegularItemType =
      ${'\n    | '.join(isort([quoted(itemType.itemType) for itemType in schema.itemTypes if itemType.itemType not in nonregular]))}
  type ItemType =
      RegularItemType
    | ${'\n    | '.join(isort([quoted(itemType) for itemType in nonregular]))}
  type FieldName =
      ${'\n    | '.join(isort([quoted(field) for field in fields]))}

  interface Collection {
    // id?: string
    key: string
    name: string
    // collections: string[] | ZoteroCollection[]
    collections: string[]
    items: number[]
    parent?: string
  }

  interface Tag {
    tag: string
    type?: number
  }
  interface Creator {
    creatorType: string
    name?: string
    firstName?: string
    lastName?: string
    fieldMode?: number
    source?: string
  }

  interface ItemBase {
    itemKey: string
    itemID: number
    libraryID: number
    uri: string
    dateAdded: string
    dateModified: string
  }

  interface Note extends ItemBase {
    itemType: 'note' | 'annotation'

    note: string
  }

  interface Attachment extends ItemBase {
    itemType: 'attachment'

    path: string
    title?: string
    mimeType?: string
    localPath?: string
    defaultPath?: string
    relations: { 'dc:relation': string[] }

    saveFile(path: string, overwrite: boolean): void
  }

  interface RegularItem extends ItemBase {
    itemType: RegularItemType
    // fields common to all items
    creators: Array<Creator>
    tags: Array<Tag>
    notes: Array<Note>
    attachments: Array<Attachment>

    raw: boolean
    autoJournalAbbreviation?: string
    $cacheable?: boolean
    $unused?: Set<string>

    %for field in fields:
    ${field}: string
    %endfor

    relations: { 'dc:relation': string[] }
    cslType: string
    cslVolumeTitle: string
    collections: string[]
    extraFields: Fields
    arXiv: arXiv

    multi?: {
      _keys: {
        title: Record<string, string>
      }
      main: {
        title: string
      }
    }
  }

  type Item = RegularItem | Note | Attachment
}
