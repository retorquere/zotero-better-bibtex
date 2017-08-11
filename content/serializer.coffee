abbrevs = require('./journal-abbrev.coffee')
debug = require('./debug.coffee')
DB = require('./db.coffee')

class Serializer
  collection: 'itemToExportFormat'

#  # prune cache on old accessed
#  prune: Zotero.Promise.coroutine(->
#    ids = yield Zotero.DB.columnQueryAsync('select itemID from items where itemID not in (select itemID from deletedItems)')
#    for id in ids
#      delete cache[id] if entry.accessed

  init: Zotero.Promise.coroutine(->
    abbrevs.init()

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

    debug('Serializer.init: done')
    return
  )

  fetch: (itemID, legacy, skipChildItems) ->
    @cache ||= DB.getCollection(@collection)
    return null unless @cache

    serializedZoteroItem = @cache.findOne({ itemID, legacy: !!legacy, skipChildItems: !!skipChildItems})
    return null unless serializedZoteroItem
    serializedZoteroItem = serializedZoteroItem.item
    serializedZoteroItem.journalAbbreviation = abbrevs.get(serializedZoteroItem)
    return serializedZoteroItem

  store: (itemID, serializedZoteroItem, legacy, skipChildItems) ->
    @cache ||= DB.getCollection(@collection)
    throw new Error("DB not loaded") unless @cache

    serializedZoteroItem.itemID = itemID
    @cache.insert({itemID, legacy, skipChildItems, item: serializedZoteroItem})

    serializedZoteroItem.journalAbbreviation = abbrevs.get(serializedZoteroItem)
    return serializedZoteroItem

  serialize: (item) -> Zotero.Utilities.Internal.itemToExportFormat(item, false, true)

module.exports = new Serializer()
