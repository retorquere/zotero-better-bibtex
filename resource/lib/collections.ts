declare const Zotero: any
declare const Translator: any

const debug = require('../lib/debug.ts')

let collections = null

export = () => {
  if (collections) return collections

  collections = {}

  if (!Translator.header.configOptions || !Translator.header.configOptions.getCollections || !Zotero.nextCollection) return collections

  let collection
  while (collection = Zotero.nextCollection()) {
    const children = collection.children || collection.descendents || []
    const key = (collection.primary ? collection.primary : collection).key

    collections[key] = {
      id: collection.id,
      key,
      parent: collection.fields.parentKey,
      name: collection.name,
      items: collection.childItems,
      collections: children.filter(coll => coll.type === 'collection').map(coll => coll.key),
      // items: (item.itemID for item in children when item.type != 'collection')
      // descendents: undefined
      // children: undefined
      // childCollections: undefined
      // primary: undefined
      // fields: undefined
      // type: undefined
      // level: undefined
    }
  }

  debug('got collections:', collections)

  return collections
}
