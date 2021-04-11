import { Item, Collection } from '../gen/typings/serialized-item'

export namespace Translators {
  namespace Worker {
    type Config = {
      preferences: any,
      options: any,
      items: Item[]
      collections: Collection[]
      cslItems?: Record<number, any>
      cache: Record<number, {itemID: number, reference: string, metadata: any, meta: { updated: number }}>
    }

    type Message = 
        { kind: 'ping' }
      | { kind: 'ready' }
      | { kind: 'start', config: Config }
      | { kind: 'done', output: boolean | string }
      | { kind: 'debug', message: string }
      | { kind: 'error', message: string }
      | { kind: 'cache', itemID: number, reference: string, metadata: any }
      | { kind: 'item', item: number }
  }

  namespace BibTeX {
    interface Field {
      name: string
      verbatim?: string
      value: string | string[] | number | null | { path: string, title?: string, mimeType?: string } | { tag: string, type?: number }[]
      enc?: 'raw' | 'url' | 'verbatim' | 'creators' | 'literal' | 'latex' | 'tags' | 'attachments' | 'date'
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
    target: string
    configOptions?: {
      getCollections?: boolean
    }
  }
}
