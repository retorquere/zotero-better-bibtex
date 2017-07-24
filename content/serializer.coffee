abbrevs = require('./journal-abbrev.coffee')

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
    cache[id][key].journalAbbrev = abbrevs.get(cache[id][key])

    return cache[id][key]
  )(Zotero.Utilities.Internal.itemToExportFormat)

class Serializer
#  # prune cache on old accessed
#  prune: Zotero.Promise.coroutine(->
#    ids = yield Zotero.DB.columnQueryAsync('select itemID from items where itemID not in (select itemID from deletedItems)')
#    for id in ids
#      delete cache[id] if entry.accessed

  get: (item) -> Zotero.Utilities.Internal.itemToExportFormat(item, false, true)

module.exports = new Serializer()
