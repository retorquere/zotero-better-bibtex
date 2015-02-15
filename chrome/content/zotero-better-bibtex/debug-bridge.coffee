Zotero.BetterBibTeX.DebugBridge = {
  exportOptions: {}
  namespace: 'better-bibtex'
  methods: {}
}

Zotero.BetterBibTeX.DebugBridge.methods.init = ->
  return if Zotero.BetterBibTeX.DebugBridge.initialized
  Zotero.BetterBibTeX.DebugBridge.initialized = true

  Zotero.BetterBibTeX.pref.stash() unless Zotero.BetterBibTeX.pref.stashed

  # monkey-patch Zotero.Items.getAll to get items sorted. With random order I can't really implement stable
  # testing. A simple ORDER BY would have been easier and loads faster, but I can't reach into getAll.
  Zotero.Items.getAll = ((original) ->
    return (onlyTopLevel, libraryID, includeDeleted) ->
      items = original.apply(this, arguments)
      items.sort(((a, b) -> a.itemID - b.itemID))
      return items)(Zotero.Items.getAll)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.reset = ->
  Zotero.BetterBibTeX.DebugBridge.methods.init()
  Zotero.BetterBibTeX.pref.restore()

  Zotero.BetterBibTeX.DebugBridge.exportOptions = {}

  try
    Zotero.Items.erase((item.id for item in Zotero.BetterBibTeX.safeGetAll()))
  catch
  try
    Zotero.Collections.erase((coll.id for coll in Zotero.getCollections()))
  catch

  Zotero.BetterBibTeX.keymanager.reset(true)
  Zotero.Items.emptyTrash()

  return true

Zotero.BetterBibTeX.DebugBridge.methods.import = (filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  Zotero_File_Interface.importFile(file)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.librarySize = -> Zotero.DB.valueQuery('select count(*) from items')

Zotero.BetterBibTeX.DebugBridge.methods.exportToString = (translator) ->
  translator = Zotero.BetterBibTeX.getTranslator(translator)
  return Zotero.BetterBibTeX.translate(translator, null, Zotero.BetterBibTeX.DebugBridge.exportOptions || {})

Zotero.BetterBibTeX.DebugBridge.methods.exportToFile = (translator, filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  translator = Zotero.BetterBibTeX.getTranslator(translator)
  options = JSON.parse(JSON.stringify((Zotero.BetterBibTeX.DebugBridge.exportOptions || {})))
  options.exportFileData = false
  Zotero.File.putContents(file, Zotero.BetterBibTeX.translate(translator, null, options))
  return true

Zotero.BetterBibTeX.DebugBridge.methods.library = ->
  translator = Zotero.BetterBibTeX.getTranslator('Zotero TestCase')
  return JSON.parse(Zotero.BetterBibTeX.translate(translator, null, { exportNotes: true, exportFileData: false }))

Zotero.BetterBibTeX.DebugBridge.methods.getKeys = -> Zotero.BetterBibTeX.keymanager.keys()

Zotero.BetterBibTeX.DebugBridge.methods.setExportOption = (name, value) -> Zotero.BetterBibTeX.DebugBridge.exportOptions[name] = value

Zotero.BetterBibTeX.DebugBridge.methods.setPreference = (name, value) -> Zotero.Prefs.set(name, value)

Zotero.BetterBibTeX.DebugBridge.methods.select = (attribute, value) ->
  attribute = attribute.replace(/[^a-zA-Z]/, '')
  sql = "select i.itemID as itemID
         from items i
         join itemData id on i.itemID = id.itemID
         join itemDataValues idv on idv.valueID = id.valueID
         join fields f on id.fieldID = f.fieldID
         where f.fieldName = '#{attribute}' and not i.itemID in (select itemID from deletedItems) and idv.value = ?"

  return Zotero.DB.valueQuery(sql, [value])

Zotero.BetterBibTeX.DebugBridge.methods.cache = ->
  return {
    stats: Zotero.BetterBibTeX.cache.stats
    data: Zotero.BetterBibTeX.DB.query('select * from cache')
  }

Zotero.BetterBibTeX.DebugBridge.methods.remove = (id) -> Zotero.Items.trash([id])

Zotero.BetterBibTeX.DebugBridge.methods.pinCiteKey = (id) ->
  Zotero.BetterBibTeX.clearKey({itemID: id}, true)
  return Zotero.BetterBibTeX.keymanager.get({itemID: id}, 'manual')
