debug = require('../lib/debug.ts')

collections = null
module.exports = (raw) ->
  return collections if collections

  collections = {}

  return collections unless Translator.header.configOptions?.getCollections && Zotero.nextCollection

  while collection = Zotero.nextCollection()
    children = collection.children || collection.descendents || []
    collection = {
      id: collection.id
      key: collection.key || collection.primary?.key
      parent: collection.fields.parentKey
      name: collection.name
      items: collection.childItems,
      collections: (coll.key for coll in children when coll.type == 'collection')
      #items: (item.itemID for item in children when item.type != 'collection')
      #descendents: undefined
      #children: undefined
      #childCollections: undefined
      #primary: undefined
      #fields: undefined
      #type: undefined
      #level: undefined
    }
    collections[collection.key] = collection

  debug('got collections:', collections)

  return collections
