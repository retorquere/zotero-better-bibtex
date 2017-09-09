KeyManager = require('../keymanager.coffee')
debug = require('../debug.coffee')
co = Zotero.Promise.coroutine
pref_defaults = require('../../defaults/preferences/defaults.json')
Translators = require('../translators.coffee')
AutoExport = require('../auto-export.coffee')

module.exports =
  reset: co(->

    debug('TestSupport.reset: start')
    prefix = 'translators.better-bibtex.'
    for pref, value of pref_defaults
      continue if pref in ['debug', 'testing']
      Zotero.Prefs.set(prefix + pref, value)

    Zotero.Prefs.set(prefix + 'debug', true)
    Zotero.Prefs.set(prefix + 'testing', true)
    debug('TestSupport.reset: preferences reset')

    # Zotero DB access is *really* slow and times out even with chunked transactions. 3.5k references take ~ 50 seconds
    # to delete.
    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    while items.length
      chunk = items.splice(0, 100)
      debug('TestSupport.reset: deleting', chunk.length, 'items')
      yield Zotero.Items.erase(chunk)

    debug('TestSupport.reset: empty trash')
    yield Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID)

    debug('TestSupport.reset: removing collections')
    # ^%&^%@#&^% you can't just loop and erase because subcollections are also deleted
    while (collections = Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID, true) || []).length
      yield collections[0].eraseTx()

    AutoExport.db.findAndRemove({ type: { $ne: '' } })

    debug('TestSupport.reset: done')

    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    throw new Error('library not empty after reset') if items.length != 0
    return
  )

  importFile: co((source, createNewCollection, preferences) ->
    preferences ||= {}
    if Object.keys(preferences).length
      debug("importing references and preferences from #{source}")
      for pref, value of preferences
        debug("#{if typeof pref_defaults[pref] == 'undefined' then 'not ' else ''}setting preference #{pref} to #{value}")
        throw new Error("Unsupported preference #{pref} in test case") if typeof pref_defaults[pref] == 'undefined'
        value = value.join(',') if Array.isArray(value)
        Zotero.Prefs.set("translators.better-bibtex.#{pref}", value)
    else
      debug("importing references from #{source}")

    file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
    file.initWithPath(source)

    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    before = items.length

    debug('starting import at ' + new Date())
    yield Zotero_File_Interface.importFile(file, !!createNewCollection)
    debug('import finished at ' + new Date())

    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    after = items.length

    debug('import found ' + (after - before) + ' items')
    return (after - before)
  )

  exportLibrary: co((translatorID, displayOptions, path) ->
    return yield Translators.translate(translatorID, displayOptions, null, path)
  )

  select: co((field, value) ->
    s = new Zotero.Search()
    s.addCondition('field', 'is', value) # field not used?
    ids = yield s.search()
    throw new Error("No item found with #{field}  = '#{value}'") unless ids && ids.length

    id = ids[0]

    for attempt in [1 .. 10]
      debug("select #{field} = '#{value}' = #{id}, attempt #{attempt}")
      zoteroPane = Zotero.getActiveZoteroPane()
      zoteroPane.show()
      continue if (yield zoteroPane.selectItem(id, true))

      selected = zoteroPane.getSelectedItems(true)
      debug('selected items = ', selected)
      return id if selected.length == 1 && id == selected[0]
      debug("select: expected #{id}, got #{selected}")
    throw new Error("failed to select " + id)
    return
  )

  pinCiteKey: co((itemID, action) ->
    if typeof itemID == 'number'
      ids = [itemID]
    else
      ids = []
      items = yield Zotero.DB.queryAsync("""
        select item.itemID
        from items item
        join itemTypes it on item.itemTypeID = it.itemTypeID and it.typeName not in ('note', 'attachment')
        where item.itemID not in (select itemID from deletedItems)
      """)
      for item in items
        ids.push(item.itemID)

    throw new Error('Nothing to do') unless ids.length

    for itemID in ids
      switch action
        when 'pin'
          yield KeyManager.pin(itemID)
        when 'unpin'
          yield KeyManager.unpin(itemID)
        when 'refresh'
          yield KeyManager.refresh(itemID)
        else
          throw new Error("TestSupport.pinCiteKey: unsupported action #{action}")
    return
  )
