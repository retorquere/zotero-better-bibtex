Zotero.BetterBibTeX.DebugBridge = {
  namespace: 'better-bibtex'
  methods: {}
}

Zotero.BetterBibTeX.DebugBridge.methods.init = ->
  return if Zotero.BetterBibTeX.DebugBridge.initialized
  Zotero.BetterBibTeX.DebugBridge.initialized = true

  # replacing Zotero.Items.getAll to get items sorted. With random order I can't really implement stable
  # testing.
  Zotero.Items.getAll = (onlyTopLevel, libraryID, includeDeleted) ->
    sql = 'SELECT A.itemID FROM items A'
    if onlyTopLevel
      sql += ' LEFT JOIN itemNotes B USING (itemID) LEFT JOIN itemAttachments C ON (C.itemID=A.itemID) WHERE B.sourceItemID IS NULL AND C.sourceItemID IS NULL'
    else
      sql += ' WHERE 1'
    if !includeDeleted
      sql += ' AND A.itemID NOT IN (SELECT itemID FROM deletedItems)'
    if libraryID
      sql += ' AND libraryID=? ORDER BY A.itemID'
      ids = Zotero.DB.columnQuery(sql, libraryID)
    else
      sql += ' AND libraryID IS NULL ORDER BY A.itemID'
      ids = Zotero.DB.columnQuery(sql)
    return @get(ids) || []

  return true

Zotero.BetterBibTeX.DebugBridge.methods.reset = ->
  Zotero.BetterBibTeX.DebugBridge.methods.init()

  for key in Zotero.BetterBibTeX.pref.prefs.getChildList('')
    Zotero.BetterBibTeX.pref.prefs.clearUserPref(key)

  Zotero.Items.erase((item.id for item in Zotero.BetterBibTeX.safeGetAll()))
  for item in Zotero.BetterBibTeX.safeGetAll() # notes don't get erased in bulk?!
    item.erase()
  Zotero.Collections.erase((coll.id for coll in Zotero.getCollections()))
  Zotero.Items.emptyTrash()

  Zotero.BetterBibTeX.cache.reset()
  Zotero.BetterBibTeX.serialized.reset()
  Zotero.BetterBibTeX.auto.clear()
  Zotero.BetterBibTeX.keymanager.reset()

  return true if Zotero.DB.valueQuery('select count(*) from items') == 0
  err = JSON.stringify((item.toArray() for item in Zotero.BetterBibTeX.safeGetAll()))
  throw "reset failed -- Library not empty -- #{err}"

Zotero.BetterBibTeX.DebugBridge.methods.import = (filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  Zotero_File_Interface.importFile(file)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.librarySize = -> Zotero.DB.valueQuery('select count(*) from items i where not i.itemID in (select d.itemID from deletedItems d)')

Zotero.BetterBibTeX.DebugBridge.methods.exportToString = (translator, displayOptions) ->
  deferred = Q.defer()
  Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), null, displayOptions || {}, (result) ->
    deferred.resolve(result)
  )

  Zotero.debug('exportToString: returning promise')
  return deferred.promise

Zotero.BetterBibTeX.DebugBridge.methods.exportToFile = (translator, displayOptions, filename) ->
  translation = new Zotero.Translate.Export()

  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  translation.setLocation(file)

  translator = Zotero.BetterBibTeX.getTranslator(translator)
  translation.setTranslator(translator)

  displayOptions ||= {}
  displayOptions.exportFileData = false
  translation.setDisplayOptions(displayOptions)

  deferred = Q.defer()
  translation.setHandler('done', (obj, worked) ->
    deferred.resolve(!!worked)
  )
  translation.translate()

  return deferred.promise

Zotero.BetterBibTeX.DebugBridge.methods.library = ->
  translator = Zotero.BetterBibTeX.getTranslator('BetterBibTeX JSON')

  deferred = Q.defer()
  Zotero.BetterBibTeX.translate(translator, null, { exportNotes: true, exportFileData: false }, (result) ->
    deferred.resolve(JSON.parse(result))
  )
  return deferred.promise

Zotero.BetterBibTeX.DebugBridge.methods.setPreference = (name, value) -> Zotero.Prefs.set(name, value)

Zotero.BetterBibTeX.DebugBridge.methods.keyManagerState = -> Zotero.BetterBibTeX.keymanager.keys.find()
Zotero.BetterBibTeX.DebugBridge.methods.cacheState = -> Zotero.BetterBibTeX.cache.cache.find()
Zotero.BetterBibTeX.DebugBridge.methods.serializedState = -> Zotero.BetterBibTeX.serialized.items

Zotero.BetterBibTeX.DebugBridge.methods.select = (attribute, value) ->
  attribute = attribute.replace(/[^a-zA-Z]/, '')
  sql = "select i.itemID as itemID
         from items i
         join itemData id on i.itemID = id.itemID
         join itemDataValues idv on idv.valueID = id.valueID
         join fields f on id.fieldID = f.fieldID
         where f.fieldName = '#{attribute}' and not i.itemID in (select itemID from deletedItems) and idv.value = ?"

  id = Zotero.DB.valueQuery(sql, [value])
  throw new Error("No item found with #{attribute} = '#{value}'") unless id
  zoteroPane = Zotero.getActiveZoteroPane()
  zoteroPane.selectItem(id, true)
  return id

Zotero.BetterBibTeX.DebugBridge.methods.remove = (id) -> Zotero.Items.trash([id])

Zotero.BetterBibTeX.DebugBridge.methods.selected = (action) ->
  Zotero.BetterBibTeX.keymanager.selected(action)
  zoteroPane = Zotero.getActiveZoteroPane()
  return zoteroPane.getSelectedItems()

Zotero.BetterBibTeX.DebugBridge.methods.autoExports = ->
  exports = []
  for e in Zotero.DB.query('select * from betterbibtex.autoexport')
    ae = {}
    for own k, v of e
      ae[k] = v
    exports.push(ae)
  return exports
