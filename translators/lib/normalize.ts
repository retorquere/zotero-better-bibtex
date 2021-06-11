/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

import { stringify } from '../../content/stringify'
import { Reference, Collection } from '../../gen/typings/serialized-item'

function rjust(str: string | number, width: number, padding: string): string {
  if (typeof str === 'number') str = `${str}`
  padding = (padding || ' ')[0]
  return str.length < width ? padding.repeat(width - str.length) + str : str
}

type Library = {
  config: any
  preferences?: any

  collections: Record<string, {
    key: string
    name: string
    collections: string[]
    items: number[]
    parent?: string
  }>

  items: {
    itemID: number
    title: string
    itemType: string
    date: string
    citekey?: string
    citationKey?: string
    autoJournalAbbreviation?: string
    libraryID?: number
    key?: string
    version?: string
    uniqueFields?: any
  }[]
}

function key(item) {
  return [item.itemType, item.citationKey || '', item.title || '', item.creators?.[0]?.lastName || item.creators?.[0]?.name || ''].join('\t').toLowerCase()
}

function strip(obj) {
  if (Array.isArray(obj)) {
    obj = obj.map(strip).filter(e => e)
    return obj.length ? obj : undefined
  }

  if (typeof obj === 'object') {
    let keep = false
    for (let [k, v] of Object.entries(obj)) {
      v = strip(v)
      if (typeof v === 'undefined') {
        delete obj[k]
      }
      else {
        obj[k] = v
        keep = true
      }
    }
    return keep ? obj : undefined
  }

  if (typeof obj === 'string' && !obj) return undefined
  if (obj === null) return undefined

  return obj
}

export function normalize(library: Library): void {
  library.items.sort((a, b) => key(a).localeCompare(key(b)))

  for (const item of (library.items as any[])) {
    delete item.citekey
    delete item.autoJournalAbbreviation
    delete item.libraryID
    delete item.key
    delete item.itemKey
    delete item.version
    delete item.uniqueFields
    delete item.collections

    if (item.notes?.length) {
      item.notes = item.notes.map(note => typeof note === 'string' ? note : note.note).sort()
    }
    else {
      delete item.notes
    }

    if (item.tags?.length) {
      item.tags = item.tags.map(tag => typeof tag === 'string' ? { tag } : tag).sort((a, b) => a.tag.localeCompare(b.tag))
    }
    else {
      delete item.tags
    }

    if (item.attachments?.length) {
      for (const att of item.attachments) {
        att.contentType = att.contentType || att.mimeType
        delete att.mimeType
        for (const prop of ['localPath', 'itemID', 'charset', 'dateAdded', 'parentItem', 'dateModified', 'version', 'relations', 'id']) {
          delete att[prop]
        }
      }
    }
    else {
      delete item.attachments
    }

    if (item.creators?.length) {
      for (const creator of item.creators) {
        if (!creator.fieldMode) delete creator.fieldMode
      }
    }
    else {
      delete item.creators
    }

    // I want to keep empty lines in extra
    if (item.extra && typeof item.extra !== 'string') item.extra = item.extra.join('\n')

    strip(item)

    if (item.extra?.length) {
      item.extra = (item as Reference).extra.split('\n')
    }
    else {
      delete item.extra
    }
  }

  if (library.preferences) {
    delete library.preferences.client
    delete library.preferences.platform
    delete library.preferences.newTranslatorsAskRestart
    delete library.preferences.testing
  }

  // sort items and normalize their IDs
  library.items.sort((a, b) => stringify({...a, itemID: 0}).localeCompare(stringify({...b, itemID: 0})))
  const itemIDs: Record<number, number> = library.items.reduce((acc, item, i) => {
    item.itemID = acc[item.itemID] = i + 1 // Zotero does not recognize items with itemID 0 in collections...
    return acc
  }, {})

  if (library.collections && Object.keys(library.collections).length) {
    const collectionOrder: Collection[] = Object.values(library.collections)
      .sort((a: Collection, b: Collection): number => stringify({...a, key: '', parent: ''}).localeCompare(stringify({...b, key: '', parent: ''})))
    const collectionKeys: Record<string, string> = collectionOrder.reduce((acc: Record<string, string>, coll: Collection, i: number): Record<string, string> => {
      coll.key = acc[coll.key] = `coll:${rjust(i, 5, '0')}` // eslint-disable-line no-magic-numbers
      return acc
    }, {})
    library.collections = collectionOrder.reduce((acc, coll) => {
      if (!(coll.parent = collectionKeys[coll.parent])) delete coll.parent

      coll.items = coll.items.map(itemID => itemIDs[itemID]).filter(itemID => typeof itemID === 'number').sort()

      coll.collections = coll.collections.map(collectionKey => collectionKeys[collectionKey]).filter(collectionKey => collectionKey).sort()

      acc[coll.key] = coll
      return acc
    }, {})
  }
  else {
    delete library.collections
  }
}
