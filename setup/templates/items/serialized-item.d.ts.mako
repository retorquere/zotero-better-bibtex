/* eslint-disable max-len, id-blacklist */

import { Fields } from '../../content/extra'
import type { arXiv } from '../../content/arXiv'

export interface Collection {
  // id?: string
  key: string
  name: string
  // collections: string[] | ZoteroCollection[]
  collections: string[]
  items: number[]
  parent?: string
}

export interface Tag {
  tag: string
  type?: number
}
export interface Creator {
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

export interface Note extends ItemBase {
  itemType: 'note' | 'annotation'

  note: string
}

export interface Attachment extends ItemBase {
  itemType: 'attachment'

  path: string
  title?: string
  mimeType?: string
  localPath?: string
  defaultPath?: string
  relations: { 'dc:relation': string[] }

  saveFile(path: string, overwrite: boolean): void
}

export interface RegularItem extends ItemBase {
  itemType: ${' | '.join(["'" + itemType + "'" for itemType in itemTypes if itemType not in ['note', 'annotation', 'attachment']])}
  // citationKey: string

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

export type Item = RegularItem | Note | Attachment
