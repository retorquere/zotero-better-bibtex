import { Fields } from '../../content/extra'

export interface Collection {
  // id?: string
  key: string
  name: string
  // collections: string[] | ZoteroCollection[]
  collections: string[]
  items: number[]
  parent?: string
}

export interface Note {
  itemType: 'note' | 'annotation'
  key: string
  itemID: number
  libraryID: number
  uri: string

  note: string
}

export interface Tag { tag: string, type?: number }
export interface Creator { creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number, source?: string }

export interface Attachment {
  itemType: 'attachment'
  key: string
  itemID: number
  libraryID: number
  uri: string

  path: string
  title?: string
  mimeType?: string
  localPath?: string
  defaultPath?: string
}

export interface Item {
  itemType: ${' | '.join(["'" + itemType + "'" for itemType in itemTypes])}
  key: string
  itemID: number
  libraryID: number
  uri: string

  // fields common to all items
  dateAdded: string
  dateModified: string
  creators: Array<ZoteroTranslatorObject.Creator>
  tags: Array<ZoteroTranslatorObject.Tag>
  notes: Array<ZoteroTranslatorObject.Note>
  attachments: Array<ZoteroTranslatorObject.Attachment>
  raw: boolean
  cachable?: boolean
  autoJournalAbbreviation?: string

  %for field in fields:
  ${field}: string
  %endfor

  relations: { 'dc:relation': string[] }
  cslType: string
  cslVolumeTitle: string
  citationKey: string
  collections: string[]
  extraFields: Fields
  arXiv: { source?: string, id: string, category?: string }

  multi?: {
    _keys: {
      title: Record<string, string>
    }
    main: {
      title: string
    }
  }
}
