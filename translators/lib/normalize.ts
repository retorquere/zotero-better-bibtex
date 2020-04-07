import { stringify } from '../../content/stringify'

function rjust(str, width, padding) {
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
    citekey?: string
    autoJournalAbbreviation?: string
    libraryID?: number
    key?: string
    version?: string
    uniqueFields?: any
  }[]
}

export function normalize(library: Library, scrub=false) {

  for (const item of (library.items as any[])) {
    delete item.citekey
    delete item.autoJournalAbbreviation
    delete item.libraryID
    delete item.key
    delete item.version
    delete item.uniqueFields
    delete item.collections

    if (scrub) delete item.uri

    if (item.notes?.length) {
      item.notes = item.notes.map(note => typeof note === 'string' ? note : note.note).sort()
    } else {
      delete item.notes
    }

    if (item.tags?.length) {
      item.tags = item.tags.map(tag => typeof tag === 'string' ? { tag } : tag).sort((a, b) => a.tag.localeCompare(b.tag))
    } else {
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
    } else {
      delete item.attachments
    }

    if (item.creators?.length) {
      for (const creator of item.creators) {
        if (!creator.fieldMode) delete creator.fieldMode
      }
    } else {
      delete item.creators
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
    item.itemID = acc[item.itemID] = i
    return acc
  }, {})

  if (library.collections && Object.keys(library.collections).length) {
    const collectionOrder = Object.values(library.collections).sort((a, b) => stringify({...a, key: '', parent: ''}).localeCompare(stringify({...b, key: '', parent: ''})))
    const collectionKeys: Record<string, string> = collectionOrder.reduce((acc, coll, i) => {
      coll.key = acc[coll.key] = `coll:${rjust(i, 5, '0')}` // tslint:disable-line:no-magic-numbers
      return acc
    }, {})
    library.collections = collectionOrder.reduce((acc, coll) => {
      if (!(coll.parent = collectionKeys[coll.parent])) delete coll.parent

      coll.items = coll.items.map(itemID => itemIDs[itemID]).filter(itemID => typeof itemID === 'number').sort()

      coll.collections = coll.collections.map(collectionKey => collectionKeys[collectionKey]).filter(collectionKey => collectionKey).sort()

      acc[coll.key] = coll
      return acc
    }, {})
  } else {
    delete library.collections
  }
}
