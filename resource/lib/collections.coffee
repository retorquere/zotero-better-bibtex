debug = require('../lib/debug.coffee')

# the zotero collections export object is insane

collections = null
module.exports = (raw) ->
  return collections if collections

  if raw
    debug('Collections: was passed', raw.length, 'collections')
  else
    raw = []
    if BetterBibTeX.header.configOptions?.getCollections && Zotero.nextCollection
      while collection = Zotero.nextCollection()
        raw.push(collection)
    debug('Collections: fetched', raw.length, 'collections from Zotero')

  debug('Collections: found', raw.length, 'collections:', raw)

  collections = {}
  for collection in raw
    debug('found collection', collection.fields.name, 'with parent', collection.fields.parentKey)
    collections[collection.primary.key] = {
      key: collection.primary.key
      name: collection.fields.name
      collections: []
      items: (item.key for item in (collection.descendents || []) when item.type == 'item')
      parent: collection.fields.parentKey
      root: !collection.fields.parentKey
    }

  for key, collection of collections
    if collection.parent && !collections[collection.parent]
      debug(collection.name, '/', key, 'has non-existing parent', {parent: collection.parent})

    collections[collection.parent].collections.push(collection) if collection.parent
    delete collection.parent
  debug('got collections:', collections)

  return collections
