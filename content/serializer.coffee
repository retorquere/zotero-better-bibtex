abbrevs = require('./journal-abbrev.coffee')
debug = require('./debug.coffee')
Loki = require('./loki.coffee')

class Serializer
  cache: Loki('cache').addCollection('cache', {
    indices: [ 'itemID', 'legacy', 'skipChildItems' ],
    schema: {
      type: 'object'
      properties: {
        itemID: { type: 'integer' }
        legacy: { coerce: 'boolean', default: false }
        skipChildItems: { coerce: 'boolean', default: false }
      }
      required: [ 'itemID', 'legacy', 'skipChildItems' ]
    }
  })

#  # prune cache on old accessed
#  prune: Zotero.Promise.coroutine(->
#    ids = yield Zotero.DB.columnQueryAsync('select itemID from items where itemID not in (select itemID from deletedItems)')
#    for id in ids
#      delete cache[id] if entry.accessed

  init: Zotero.Promise.coroutine(->
    debug('Serializer.init')
    mapping = yield Zotero.DB.queryAsync("""
      SELECT bf.fieldName as baseName, it.typeName, f.fieldName
      FROM baseFieldMappingsCombined bfmc
      join fields bf on bf.fieldID = bfmc.baseFieldID
      join fields f on f.fieldID = bfmc.fieldID
      join itemTypes it on it.itemTypeID = bfmc.itemTypeID
      order by it.typeName, bf.fieldName
    """)

    mapping = mapping.reduce((map, alias) ->
      map[alias.baseName] ||= {}
      map[alias.baseName]['item.' + alias.fieldName] = true
      return map
    , {})

    simplify = ''
    for baseName, aliases of mapping
      simplify += "if (item.#{baseName} == null) { item.#{baseName} = #{Object.keys(aliases).join(' || ')}; }\n"
    simplify += 'item.tags = item.tags ? item.tags.map(function(tag) { return tag.tag }) : [];'
    simplify += 'return item;'

    debug('Serializer.init: simplify =', simplify)
    @simplify = new Function('item', simplify)

    Zotero.Notifier.registerObserver(@, ['item'], 'BetterBibTeX', 1)

    debug('Serializer.init: done')
    return
  )

  notify: (action, type, ids, extraData) ->
    debug('Serializer.notify', {action, type, ids, extraData})

    if action in ['delete', 'trash']
      @cache.findAndRemove({ itemID : { $in : ids } })

    return

  remove: (itemID) ->
    @cache.findAndRemove({ itemID })
    return

  fetch: (itemID, legacy, skipChildItems) ->
    serializedZoteroItem = @cache.findOne({ itemID, legacy: !!legacy, skipChildItems: !!skipChildItems})
    return null unless serializedZoteroItem
    serializedZoteroItem = serializedZoteroItem.item
    serializedZoteroItem.journalAbbreviation ||= abbrevs.get(serializedZoteroItem)
    return serializedZoteroItem

  store: (itemID, serializedZoteroItem, legacy, skipChildItems) ->
    serializedZoteroItem.itemID = itemID
    @cache.insert({itemID, legacy, skipChildItems, item: serializedZoteroItem})

    serializedZoteroItem.journalAbbreviation ||= abbrevs.get(serializedZoteroItem)
    return serializedZoteroItem

  serialize: (item) -> Zotero.Utilities.Internal.itemToExportFormat(item, false, true)

module.exports = new Serializer()
