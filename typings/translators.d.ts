import { Item, Attachment, Collection, Tag } from '../gen/typings/serialized-item'

export namespace Translators {
  namespace Worker {
    type Environment = {
      version: string
      platform: string
      locale: string
      localeDateOrder: string
    }

    type Job = {
      translator: string
      autoExport?: string

      preferences: any
      options: any

      output: string
      debugEnabled: boolean

      data?: {
        items: Array<Item | Attachment | Note>
        collections: Collection[]
        cache: Record<number, {itemID: number, reference: string, metadata: any, meta: { updated: number }}>
      }
    }

    type Message = 
        { kind: 'initialize', CSL_MAPPINGS: any }
      | { kind: 'configure', environment: Environment }
      | { kind: 'start', config: ArrayBuffer }
      | { kind: 'done', output: boolean | string }
      | { kind: 'debug', message: string }
      | { kind: 'error', message: string }
      | { kind: 'cache', itemID: number, entry: string, metadata: any }
      | { kind: 'item', item: number }
      | { kind: 'ping' }
      | { kind: 'stop' }
      | { kind: 'progress', percent: number, translator: string, autoExport: string }
  }

  namespace BibTeX {
    interface Field {
      name: string
      verbatim?: string
      value: string | string[] | number | null | Attachment[] | Tag[]
      enc?: 'raw' | 'url' | 'verbatim' | 'creators' | 'literal' | 'literal_list' | 'latex' | 'tags' | 'attachments' | 'date' | 'minimal' | 'bibtex' | 'biblatex'
      orig?: { name?: string, verbatim?: string, inherit?: boolean }
      bibtexStrings?: boolean
      bare?: boolean
      raw?: boolean

      // kept as seperate booleans for backwards compat
      replace?: boolean
      fallback?: boolean

      html?: boolean

      bibtex?: string
    }
  }

  interface Header {
    translatorID: string
    label: string
    description: string
    creator: string
    minVersion: string
    maxVersion: string
    translatorType: number
    browserSupport: string
    inRepository: false
    priority: number
    target: string
    browserSupport: 'gcsv'
    configOptions?: {
      getCollections?: boolean
      async?: boolean
      hash?: string
      cached?: boolean
    }
    displayOptions?: {
      exportNotes?: boolean,
      exportFileData?: boolean
      useJournalAbbreviation?: boolean
      biblatexAPA?: boolean
      keepUpdated?: boolean
      worker?: boolean
      markdown?: boolean

      Normalize?: boolean
      Items?: boolean
      Preferences?: boolean

      Authors?: boolean
      Title?: boolean
      Year?: boolean

      quickCopyMode?: string
    }
  }
}
