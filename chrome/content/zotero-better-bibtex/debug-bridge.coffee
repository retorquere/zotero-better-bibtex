Zotero.BetterBibTeX.DebugBridge = {
  namespace: 'better-bibtex'
  methods: {}
}

Zotero.BetterBibTeX.DebugBridge.methods.init = ->
  return if Zotero.BetterBibTeX.DebugBridge.initialized
  Zotero.BetterBibTeX.DebugBridge.initialized = true

  Zotero.getActiveZoteroPane().show()

  Zotero.noUserInput = true

  return true

Zotero.BetterBibTeX.DebugBridge.methods.reset = ->
  Zotero.BetterBibTeX.DebugBridge.methods.init()

  for key in Zotero.BetterBibTeX.Pref.branch.getChildList('')
    Zotero.BetterBibTeX.Pref.clear(key)

  Zotero.Items.erase((item.id for item in Zotero.BetterBibTeX.DB.getAll()))

  ### notes don't get erased in bulk?! ###
  for item in Zotero.BetterBibTeX.DB.getAll()
    item.erase()

  Zotero.Collections.erase((coll.id for coll in Zotero.getCollections()))
  Zotero.Items.emptyTrash()

  Zotero.BetterBibTeX.cache.reset('debugbridge.reset')
  Zotero.BetterBibTeX.serialized.reset('debugbridge.reset')
  Zotero.BetterBibTeX.auto.clear()
  Zotero.BetterBibTeX.keymanager.reset()
  Zotero.BetterBibTeX.JournalAbbrev.reset()

  items = Zotero.BetterBibTeX.DB.getAll()
  return true if items.length == 0
  err = JSON.stringify((item.toArray() for item in items))
  throw "reset failed -- #{items.length} items left in library -- #{err}"

Zotero.BetterBibTeX.DebugBridge.methods.import = (filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  Zotero_File_Interface.importFile(file)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.librarySize = ->
  items = {
    notes: 0
    attachments: 0
    references: 0
  }

  for item in Zotero.BetterBibTeX.DB.getAll()
    switch item.itemTypeID
      when 1  then  items.notes++
      when 14 then  items.attachments++
      else          items.references++

  Zotero.BetterBibTeX.debug('librarySize:', items)
  return items

Zotero.BetterBibTeX.DebugBridge.methods.exportToString = (translator, displayOptions) ->
  if translator.substring(0,3) == 'id:'
    translator = translator.slice(3)
  else
    translator = Zotero.BetterBibTeX.Translators.getID(translator)

  return Zotero.BetterBibTeX.Translators.translate(translator, {library: null}, displayOptions || {})

Zotero.BetterBibTeX.DebugBridge.methods.exportToFile = (translator, displayOptions, filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  Zotero.debug('exporting to local file' + filename)
  file.initWithPath(filename)

  if translator.substring(0,3) == 'id:'
    translator = translator.slice(3)
  else
    translator = Zotero.BetterBibTeX.Translators.getID(translator)

  displayOptions ||= {}
  displayOptions.exportFileData = false

  return Zotero.BetterBibTeX.Translators.translate(translator, {library: null}, displayOptions, file)

Zotero.BetterBibTeX.DebugBridge.methods.library = ->
  return Zotero.BetterBibTeX.Translators.translate(Zotero.BetterBibTeX.Translators.getID('BetterBibTeX JSON'), {library: null}, { exportNotes: true, exportFileData: false }).then((result) ->
    Promise.resolve(JSON.parse(result))
  )

Zotero.BetterBibTeX.DebugBridge.methods.setPreference = (name, value) -> Zotero.Prefs.set(name, value)

Zotero.BetterBibTeX.DebugBridge.methods.keyManagerState = -> Zotero.BetterBibTeX.DB.collection.keys.find()
Zotero.BetterBibTeX.DebugBridge.methods.cacheState = -> Zotero.BetterBibTeX.DB.collection.cache.find()
Zotero.BetterBibTeX.DebugBridge.methods.serializedState = -> Zotero.BetterBibTeX.serialized.items
Zotero.BetterBibTeX.DebugBridge.methods.cacheStats = -> {serialized: Zotero.BetterBibTeX.serialized.stats, cache: Zotero.BetterBibTeX.cache.stats }

Zotero.BetterBibTeX.DebugBridge.methods.find = (attribute, value, select) ->
  s = new Zotero.Search()
  s.addCondition('field', 'is', value)
  ids = s.search()
  throw new Error("No item found with #{attribute} = '#{value}'") unless ids && ids.length != 0

  id = ids[0]
  return id unless select

  for attempt in [1..10]
    Zotero.BetterBibTeX.debug("select: #{id}, attempt #{attempt}")
    zoteroPane = Zotero.getActiveZoteroPane()
    zoteroPane.show()
    continue unless zoteroPane.selectItem(id, true)

    selected = (parseInt(i) for i in zoteroPane.getSelectedItems(true))
    return id if selected.length == 1 && id == selected[0]
    Zotero.BetterBibTeX.debug("select: expected #{JSON.stringify([id])}, got #{JSON.stringify(selected)}")

  throw new Error("failed to select #{id}")


Zotero.BetterBibTeX.DebugBridge.methods.remove = (id) -> Zotero.Items.trash([id])

Zotero.BetterBibTeX.DebugBridge.methods.restore = ->
  Zotero.DB.beginTransaction()
  for item in Zotero.Items.getDeleted()
    item.deleted = false
    item.save()
  Zotero.DB.commitTransaction()

Zotero.BetterBibTeX.DebugBridge.methods.selected = (action) ->
  Zotero.BetterBibTeX.keymanager.selected(action)
  zoteroPane = Zotero.getActiveZoteroPane()
  return zoteroPane.getSelectedItems()

Zotero.BetterBibTeX.DebugBridge.methods.autoExports = ->
  exports = []
  return exports

Zotero.BetterBibTeX.DebugBridge.methods.cayw = (picks, format) ->
  doc = new Zotero.BetterBibTeX.CAYW.Document({format})

  deferred = Q.defer()

  picker = new Zotero.BetterBibTeX.CAYW.CitationEditInterface(deferred, {format}, doc)
  picker.citation = {citationItems: picks, properties: {}}
  picker.accept()

  return deferred.promise
