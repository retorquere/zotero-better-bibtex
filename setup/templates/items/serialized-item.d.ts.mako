import { Fields } from '../../content/extra'
declare global {
  interface ISerializedItem {
    // fields common to all items
    itemID: string | number
    itemType: ${' | '.join(["'" + itemType + "'" for itemType in itemTypes])}
    dateAdded: string
    dateModified: string
    creators: { creatorType?: string, name?: string, firstName?: string, lastName?:string, fieldMode?: number, source?: string }[]
    tags: Array<{ tag: string, type?: number }>
    notes: string[]
    attachments: { path: string, title?: string, mimeType?: string }
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
    // Juris-M extras
    multi: any
  }
}
