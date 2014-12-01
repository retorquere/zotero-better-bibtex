Zotero.BetterBibTeX.DebugBridge = {
  data: {
    prefs: Object.create(null)
    exportOptions: {}
  }
  namespace: 'better-bibtex'
  methods: {}
}

Zotero.BetterBibTeX.DebugBridge.data.setPref = (name, value) ->
  @prefs[name] ?= Object.create(null)
  @prefs[name].set = value
  if typeof @prefs[name].reset is 'undefined'
    reset = null
    try
      reset = Zotero.Prefs.get(name)
    catch
    @prefs[name].reset = reset
  Zotero.Prefs.set(name, value)
  return

Zotero.BetterBibTeX.DebugBridge.methods.init = ->
  # monkey-patch Zotero.Items.getAll to get items sorted. With random order I can't really implement stable
  # testing. A simple ORDER BY would have been easier and loads faster, but I can't reach into getAll.
  Zotero.Items.getAll = ((original) ->
    return (onlyTopLevel, libraryID, includeDeleted) ->
      items = original.apply(this, arguments)
      items.sort(((a, b) -> a.itemID - b.itemID))
      return items)(Zotero.Items.getAll)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.reset = ->
  Zotero.BetterBibTeX.init()
  retval = Zotero.BetterBibTeX.DebugBridge.data.prefs

  for own name, value of Zotero.BetterBibTeX.DebugBridge.data.prefs
    Zotero.Prefs.set(name, value.reset) if value.reset isnt null
  Zotero.BetterBibTeX.DebugBridge.data.prefs = Object.create(null)
  Zotero.BetterBibTeX.DebugBridge.data.exportOptions = {}

  try
    Zotero.Items.erase((item.id for item in Zotero.BetterBibTeX.safeGetAll()))
  catch
  try
    Zotero.Collections.erase((coll.id for coll in Zotero.getCollections()))
  catch

  Zotero.BetterBibTeX.DB.query('delete from keys')
  Zotero.Items.emptyTrash()

  return retval

Zotero.BetterBibTeX.DebugBridge.methods.import = (filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  Zotero_File_Interface.importFile(file)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.librarySize = -> Zotero.DB.valueQuery('select count(*) from items')

Zotero.BetterBibTeX.DebugBridge.methods.exportToString = (translator) ->
  translator = Zotero.BetterBibTeX.getTranslator(translator)
  return Zotero.BetterBibTeX.translate(translator, null, Zotero.BetterBibTeX.DebugBridge.data.exportOptions || {})

Zotero.BetterBibTeX.DebugBridge.methods.exportToFile = (translator, filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  translator = Zotero.BetterBibTeX.getTranslator(translator)
  Zotero.File.putContents(file, Zotero.BetterBibTeX.translate(translator, null, { exportNotes: true, exportFileData: false }))
  return true

Zotero.BetterBibTeX.DebugBridge.methods.library = ->
  translator = Zotero.BetterBibTeX.getTranslator('Zotero TestCase')
  return JSON.parse(Zotero.BetterBibTeX.translate(translator, null, { exportNotes: true, exportFileData: false }))

Zotero.BetterBibTeX.DebugBridge.methods.getKeys = -> Zotero.BetterBibTeX.keymanager.keys()

Zotero.BetterBibTeX.DebugBridge.methods.setExportOption = (name, value) -> Zotero.BetterBibTeX.DebugBridge.data.exportOptions[name] = value

Zotero.BetterBibTeX.DebugBridge.methods.setPreference = (name, value) -> Zotero.BetterBibTeX.DebugBridge.data.setPref(name, value)

Zotero.BetterBibTeX.DebugBridge.methods.select = (attribute, value) ->
  attribute = attribute.replace(/[^a-zA-Z]/, '')
  sql = "select i.itemID as itemID
         from items i
         join itemData id on i.itemID = id.itemID
         join itemDataValues idv on idv.valueID = id.valueID
         join fields f on id.fieldID = f.fieldID
         where f.fieldName = '#{attribute}' and not i.itemID in (select itemID from deletedItems) and idv.value = ?"

  return Zotero.DB.valueQuery(sql, [value])

Zotero.BetterBibTeX.DebugBridge.methods.remove = (id) -> Zotero.Items.trash([id])

Zotero.BetterBibTeX.DebugBridge.methods.pinCiteKey = (id) ->
  Zotero.BetterBibTeX.clearKey({itemID: id}, true)
  return Zotero.BetterBibTeX.keymanager.get({itemID: id}, 'manual')
