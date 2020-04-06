import { debug } from './debug'
import stringify from 'fast-safe-stringify'

function rjust(str, width, padding) {
  padding = (padding || ' ')[0]
  return str.length < width ? padding.repeat(width - str.length) + str : str
}

type Library = {
  config: any

  collections: Record<string, {
    key: string
    name: string
    collections: string[]
    items: number[]
    parent?: string
  }>

  items: {
    itemID: number
    citekey?: string
    autoJournalAbbreviation?: string
    libraryID?: number
    key?: string
    version?: string
    uniqueFields?: any
  }[]
}

export function normalize(library: Library) {
  // sort items and normalize their IDs
  library.items.sort((a, b) => stringify({...a, itemID: 0}).localeCompare(stringify({...b, itemID: 0})))
  const itemIDs: Record<number, number> = library.items.reduce((acc, item, i) => {
    item.itemID = acc[item.itemID] = i

    delete item.citekey
    delete item.autoJournalAbbreviation
    delete item.libraryID
    delete item.key
    delete item.version
    delete item.uniqueFields

    return acc
  }, {})

  const collectionOrder = Object.values(library.collections).sort((a, b) => stringify({...a, key: '', parent: ''}).localeCompare(stringify({...b, key: '', parent: ''})))
  const collectionKeys: Record<string, string> = collectionOrder.reduce((acc, coll, i) => {
    coll.key = acc[coll.key] = `coll:${rjust(i, 5, '0')}` // tslint:disable-line:no-magic-numbers
    return acc
  }, {})
  library.collections = collectionOrder.reduce((acc, coll) => {
    if (!(coll.parent = collectionKeys[coll.parent])) delete coll.parent

    debug('normalize:pre:', coll.items)
    coll.items = coll.items.map(itemID => itemIDs[itemID]).filter(itemID => typeof itemID === 'number').sort()
    debug('normalize:post:', coll.items)

    coll.collections = coll.collections.map(collectionKey => collectionKeys[collectionKey]).filter(collectionKey => collectionKey).sort()

    acc[coll.key] = coll
    return acc
  }, {})
}
