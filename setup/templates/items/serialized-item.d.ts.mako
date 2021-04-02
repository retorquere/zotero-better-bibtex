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

export interface Note { note: string }
export interface Tag { tag: string, type?: number }
export interface Attachment { path: string, title?: string, mimeType?: string }
export interface Creator { creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number, source?: string }

export interface Item {
  // fields common to all items
  itemID: number
  itemType: ${' | '.join(["'" + itemType + "'" for itemType in itemTypes])}
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
  uri: string
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
