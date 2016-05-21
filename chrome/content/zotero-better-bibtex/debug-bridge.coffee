Zotero.BetterBibTeX.DebugBridge = {
  namespace: 'better-bibtex'
  methods: {}
}

Zotero.BetterBibTeX.DebugBridge.methods.init = ->
  return if Zotero.BetterBibTeX.DebugBridge.initialized
  Zotero.BetterBibTeX.DebugBridge.initialized = true

  Zotero.getActiveZoteroPane().show()

  Zotero.noUserInput = true

  ### monkey-patching Zotero.Items.get to retrieve items sorted. With random order I can't really implement stable testing. ###
  Zotero.Items.get = ((original) ->
    return ->
      items = original.apply(@, arguments)
      items.sort(Zotero.BetterBibTeX.keymanager.sort) if Array.isArray(items)
      return items
    )(Zotero.Items.get)

  for setter in ['setItems', 'setCollection', 'setAll']
    Zotero.Translate.ItemGetter::[setter] = ((original) ->
      return ->
        r = original.apply(@, arguments)
        @_itemsLeft.sort(Zotero.BetterBibTeX.keymanager.sort) if Array.isArray(@_itemsLeft)
        return r
      )(Zotero.Translate.ItemGetter::[setter])

  return true

Zotero.BetterBibTeX.DebugBridge.methods.reset = ->
  Zotero.BetterBibTeX.DebugBridge.methods.init()

  for key in Zotero.BetterBibTeX.pref.prefs.getChildList('')
    Zotero.BetterBibTeX.pref.prefs.clearUserPref(key)

  tags = Object.keys(Zotero.Tags.getAll())
  Zotero.Tags.erase(tags) if tags.length > 0

  Zotero.Items.erase((item.id for item in Zotero.BetterBibTeX.safeGetAll()))

  ### notes don't get erased in bulk?! ###
  for item in Zotero.BetterBibTeX.safeGetAll()
    item.erase()

  Zotero.Collections.erase((coll.id for coll in Zotero.getCollections()))
  Zotero.Items.emptyTrash()

  Zotero.BetterBibTeX.cache.reset('debugbridge.reset')
  Zotero.BetterBibTeX.serialized.reset('debugbridge.reset')
  Zotero.BetterBibTeX.auto.clear()
  Zotero.BetterBibTeX.keymanager.reset()
  Zotero.BetterBibTeX.JournalAbbrev.reset()

  return true if Zotero.DB.valueQuery('select count(*) from items') == 0
  err = JSON.stringify((item.toArray() for item in Zotero.BetterBibTeX.safeGetAll()))
  throw "reset failed -- Library not empty -- #{err}"

Zotero.BetterBibTeX.DebugBridge.methods.import = (filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  Zotero_File_Interface.importFile(file)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.librarySize = ->
  items = {
    references: 0
    notes: 0
    attachments: 0
  }
  for count in Zotero.DB.query("
          select count(*) as nr, case itemtypeID when 1 then 'notes' when 14 then 'attachments' else 'references' end as itemType
          from items i
          where not i.itemID in (select d.itemID from deletedItems d)
          group by 2")
    items[count.itemType] = parseInt(count.nr)
  Zotero.BetterBibTeX.debug('librarySize:', items)
  return items

Zotero.BetterBibTeX.DebugBridge.methods.exportToString = (translator, displayOptions) ->
  deferred = Q.defer()

  if translator.substring(0,3) == 'id:'
    translator = translator.slice(3)
  else
    translator = Zotero.BetterBibTeX.getTranslator(translator)

  Zotero.BetterBibTeX.translate(translator, {library: null}, displayOptions || {}, (err, result) ->
    if err
      deferred.reject(err)
    else
      deferred.fulfill(result)
  )

  return deferred.promise

Zotero.BetterBibTeX.DebugBridge.methods.exportToFile = (translator, displayOptions, filename) ->
  translation = new Zotero.Translate.Export()

  file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
  file.initWithPath(filename)
  translation.setLocation(file)

  if translator.substring(0,3) == 'id:'
    translator = translator.slice(3)
  else
    translator = Zotero.BetterBibTeX.getTranslator(translator)

  translation.setTranslator(translator)

  displayOptions ||= {}
  displayOptions.exportFileData = false
  translation.setDisplayOptions(displayOptions)
  translation.setLibraryID(null)

  deferred = Q.defer()
  translation.setHandler('done', (obj, worked) ->
    if worked
      deferred.fulfill(true)
    else
      deferred.reject(!worked)
  )
  translation.translate()

  return deferred.promise

Zotero.BetterBibTeX.DebugBridge.methods.library = ->
  translator = Zotero.BetterBibTeX.getTranslator('BetterBibTeX JSON')

  deferred = Q.defer()
  Zotero.BetterBibTeX.translate(translator, {library: null}, { exportNotes: true, exportFileData: false }, (err, result) ->
    if err
      deferred.reject(err)
    else
      deferred.fulfill(JSON.parse(result))
  )
  return deferred.promise

Zotero.BetterBibTeX.DebugBridge.methods.setPreference = (name, value) -> Zotero.Prefs.set(name, value)

Zotero.BetterBibTeX.DebugBridge.methods.keyManagerState = -> Zotero.BetterBibTeX.DB.keys.find()
Zotero.BetterBibTeX.DebugBridge.methods.cacheState = -> Zotero.BetterBibTeX.DB.cache.find()
Zotero.BetterBibTeX.DebugBridge.methods.serializedState = -> Zotero.BetterBibTeX.serialized.items
Zotero.BetterBibTeX.DebugBridge.methods.cacheStats = -> {serialized: Zotero.BetterBibTeX.serialized.stats, cache: Zotero.BetterBibTeX.cache.stats }

Zotero.BetterBibTeX.DebugBridge.methods.find = (attribute, value, select) ->
  attribute = attribute.replace(/[^a-zA-Z]/, '')
  sql = "select i.itemID as itemID
         from items i
         join itemData id on i.itemID = id.itemID
         join itemDataValues idv on idv.valueID = id.valueID
         join fields f on id.fieldID = f.fieldID
         where f.fieldName = '#{attribute}' and not i.itemID in (select itemID from deletedItems) and idv.value = ?"

  id = Zotero.DB.valueQuery(sql, [value])
  throw new Error("No item found with #{attribute} = '#{value}'") unless id

  id = parseInt(id)
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
