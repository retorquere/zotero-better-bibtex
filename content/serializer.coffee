abbrevs = require('./journal-abbrev.coffee')
debug = require('./debug.coffee')

cache = {}

Zotero.Utilities.Internal.itemToExportFormat = ((original) ->
  return (zoteroItem, legacy, skipChildItems) ->
    id = zoteroItem.id
    modified = zoteroItem.dateModified
    delete cache[id] if cache[id]?.modified != modified

    key = "legacy:#{!!legacy},skipChildItems:#{!!skipChildItems}"
    cache[id] ||= { modified: modified }
    if !cache[id][key]
      cache[id][key] = original.apply(@, arguments)
      cache[id][key].itemID = cache[id][key].id = parseInt(id)

    ### set journal abbrev ###
    cache[id][key].journalAbbreviation = abbrevs.get(cache[id][key])

    return cache[id][key]
  )(Zotero.Utilities.Internal.itemToExportFormat)

class Serializer
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
    debug('Serializer.init: done')
    return
  )

  get: (item) -> Zotero.Utilities.Internal.itemToExportFormat(item, false, true)

module.exports = new Serializer()
