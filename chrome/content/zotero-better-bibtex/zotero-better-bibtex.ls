Components.utils.import 'resource://gre/modules/Services.jsm'
Components.utils.import 'resource://gre/modules/AddonManager.jsm'

Zotero.BetterBibTeX = new ->
  @prefs = (Components.classes.'@mozilla.org/preferences-service;1'.getService Components.interfaces.nsIPrefService).getBranch 'extensions.zotero.translators.better-bibtex.'
  @translators = Object.create null
  @threadManager = Components.classes.'@mozilla.org/thread-manager;1'.getService!
  @windowMediator = Components.classes.'@mozilla.org/appshell/window-mediator;1'.getService Components.interfaces.nsIWindowMediator
  @DB = new Zotero.DBConnection 'betterbibtex'

  @findKeysSQL = 'select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra
                  from items i 
                  join itemData id on i.itemID = id.itemID
                  join itemDataValues idv on idv.valueID = id.valueID
                  join fields f on id.fieldID = f.fieldID
                  where f.fieldName = \'extra\' and not i.itemID in (select itemID from deletedItems)
                    and (idv.value like \'%bibtex:%\' or idv.value like \'%biblatexcitekey[%\')'


Zotero.BetterBibTeX.prefsObserver = {}

Zotero.BetterBibTeX.prefsObserver.register = -> Zotero.BetterBibTeX.prefs.addObserver '', this, false

Zotero.BetterBibTeX.prefsObserver.unregister = -> Zotero.BetterBibTeX.prefs.removeObserver '', this

Zotero.BetterBibTeX.prefsObserver.observe = (subject, topic, data) ->
  switch data
  case 'citeKeyFormat'
    Zotero.BetterBibTeX.DB.query('delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.prefs.getCharPref('citeKeyFormat')])

Zotero.BetterBibTeX.log = (msg, e) ->
  msg = "[better-bibtex] #msg"
  if e
    msg += '\nan error occurred: '
    if e.name
      msg += "#{e.name}: #{e.message} \n(#{e.fileName}, #{e.lineNumber})"
    else
      msg += e
    if e.stack then msg += '\n' + e.stack
  Zotero.debug msg

Zotero.BetterBibTeX.formatter = (pattern) ->
  @formatters ?= Object.create(null)
  @formatters[pattern] = BetterBibTeXFormatter.parse(pattern) unless @formatters[pattern]
  return @formatters[pattern]

Zotero.BetterBibTeX.init = ->
  return if @initialized
  @initialized = true

  @DB.query 'create table if not exists _version_ (tablename primary key, version not null, unique (tablename, version))'
  @DB.query "insert or ignore into _version_ (tablename, version) values ('keys', 0)"

  switch @DB.valueQuery("select version from _version_ where tablename = 'keys'")
  case 0
    @log 'initializing DB: no tables'
    @DB.query 'create table keys (itemID primary key, libraryID not null, citekey not null, pinned)'
    @DB.query "insert or replace into _version_ (tablename, version) values ('keys', 1)"

  case 1, 2
    @prefs.setBoolPref 'scan-citekeys', true
    @DB.query "insert or replace into _version_ (tablename, version) values ('keys', 3)"

  case 3
    @DB.query 'alter table keys rename to keys2'
    @DB.query 'create table keys (itemID primary key, libraryID not null, citekey not null, citeKeyFormat)'
    @DB.query('insert into keys (itemID, libraryID, citekey, citeKeyFormat)
               select itemID, libraryID, citekey, case when pinned = 1 then null else ? end from keys2', [@prefs.getCharPref 'citeKeyFormat'])
    @DB.query "insert or replace into _version_ (tablename, version) values ('keys', 4)"

  @DB.query 'delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [@prefs.getCharPref 'citeKeyFormat']

  @prefsObserver.register!

  for endpoint in @endpoints
    url = '/better-bibtex/' + endpoint
    @log 'Registering endpoint ' + url
    ep = Zotero.Server.Endpoints[url] = ->
    ep.prototype = @endpoints[endpoint]

  @keymanager = new @KeyManager
  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    __exposedProps__: {keymanager: 'r'}
    keymanager: @keymanager
  }

  if @prefs.getBoolPref 'scan-citekeys'
    for row in Zotero.DB.query(@findKeysSQL) or []
      Zotero.BetterBibTeX.DB.query 'insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [ row.itemID, row.libraryID, @keymanager.extract({row.extra}) ]
    @prefs.setBoolPref 'scan-citekeys', false

  notifierID = Zotero.Notifier.registerObserver @itemChanged, ['item']
  window.addEventListener 'unload', ((e) -> Zotero.Notifier.unregisterObserver notifierID), false
  @loadTranslators!

Zotero.BetterBibTeX.loadTranslators = ->
  @safeLoad 'Better BibTeX.js'
  @safeLoad 'Better BibLaTeX.js'
  @safeLoad 'LaTeX Citation.js'
  @safeLoad 'Pandoc Citation.js'
  @safeLoad 'Zotero TestCase.js'
  Zotero.Translators.init!

Zotero.BetterBibTeX.removeTranslators = ->
  for name in @translators
    header = @translators[name]
    fileName = Zotero.Translators.getFileNameFromLabel header.label, header.translatorID
    destFile = Zotero.getTranslatorsDirectory!
    destFile.append fileName
    destFile.remove!
  Zotero.Translators.init!

Zotero.BetterBibTeX.itemChanged = {}

Zotero.BetterBibTeX.itemChanged.notify = (event, type, ids, extraData) ->
  switch event
  case 'delete'
    for key in extraData
      v = extraData[key]
      i = {itemID: key}
      Zotero.BetterBibTeX.clearKey i, true

  case 'add', 'modify', 'trash'
    break if ids.length is 0

    ids = '(' + ['' + id for id in ids].join(',') + ')'

    Zotero.BetterBibTeX.DB.query 'delete from keys where itemID in ' + ids
    if event != 'trash'
      for item in Zotero.DB.query(Zotero.BetterBibTeX.findKeysSQL + ' and i.itemID in ' + ids) or []
        citekey = Zotero.BetterBibTeX.keymanager.extract({extra: item.extra})
        Zotero.BetterBibTeX.DB.query 'delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID, citekey]
        Zotero.BetterBibTeX.DB.query 'insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [ item.itemID, item.libraryID, citekey ]

      for item in Zotero.DB.query('select coalesce(libraryID, 0) as libraryID, itemID from items where itemID in ' + ids) or []
        Zotero.BetterBibTeX.keymanager.get item, 'on-change'

Zotero.BetterBibTeX.clearKey = (item, onlyCache) ->
  if not onlyCache
    _item = {extra: '' + item.getField 'extra'}
    citekey = not @keymanager.extract _item
    if citekey
      item.setField 'extra', _item.extra
      item.save!
  @DB.query 'delete from keys where itemID = ?', [item.itemID]

Zotero.BetterBibTeX.displayOptions = (url) ->
  params = {}
  hasParams = false
  for key in [ 'exportCharset', 'exportNotes?', 'useJournalAbbreviation?' ]
    try
      isBool = key.match //[?]$//
      key = key.replace isBool[0], '' if isBool
      params[key] = url.query[key]
      params[key] = [ 'y', 'yes', 'true' ].indexOf(params[key].toLowerCase!) >= 0 if isBool
      hasParams = true
    catch
  return params if hasParams
  return null

Zotero.BetterBibTeX.translate = (translator, items, displayOptions) ->
  throw 'null translator' unless translator

  translation = new Zotero.Translate.Export
  translation.setItems items if items
  translation.setTranslator translator
  translation.setDisplayOptions displayOptions

  status = {finished: false}

  translation.setHandler 'done', (obj, success) ->
    status.success = success
    status.finished = true
    status.data = obj.string if success
  translation.translate!

  while not status.finished # ugly spinlock
    continue

  return status.data if status.success
  throw 'export failed'

Zotero.BetterBibTeX.safeLoad = (translator) ->
  try
    @load translator
  catch err
    @log "Loading #translator failed", err

Zotero.BetterBibTeX.load = (translator) ->
  header = null
  data = null
  start = -1
  try
    data = Zotero.File.getContentsFromURL 'resource://zotero-better-bibtex/translators/' + translator
    start = data.indexOf '{' if data
    if start >= 0
      len = data.indexOf '}', start
      if len > 0
        len -= start
        while len < 3000
          try
            header = JSON.parse (data.substring start, len).trim!
            data = data.substring start + len, data.length
            break
          catch
          len++
  catch err
    header = null

  if not header
    @log "Loading #translator failed: could not parse header'
    return 

  @translators[header.label.toLowerCase!.replace //[^a-z]//, ''] = header
  Zotero.Translators.save header, data

Zotero.BetterBibTeX.getTranslator = (name) ->
  name = name.toLowerCase!.replace //[^a-z]//, ''
  translator = @translators['better' + name] or @translators[name] or @translators['zotero' + name]
  throw "No translator #name; available: #{Object.keys(@translators).join ', '}" unless translator
  return translator.translatorID

Zotero.BetterBibTeX.clearCiteKeys = (onlyCache) ->
  win = @windowMediator.getMostRecentWindow 'navigator:browser'
  for item in Zotero.Items.get([item.id for item in win.ZoteroPane.getSelectedItems! when !item.isAttachment! && !item.isNote!])
    @clearKey item, onlyCache
  return items

Zotero.BetterBibTeX.pinCiteKeys = ->
  for item in @clearCiteKeys true
    Zotero.BetterBibTeX.keymanager.get item, 'manual'

Zotero.BetterBibTeX.safeGetAll = ->
  try
    all = Zotero.Items.getAll!
    all = [all] if all and not Array.isArray all
  catch err
    all = false
  if not all then all = []
  return all

Zotero.BetterBibTeX.safeGet = (ids) ->
  return [] if ids.length is 0
  all = Zotero.Items.get ids
  if not all then return []
  return all

Zotero.BetterBibTeX.allowAutoPin = -> Zotero.Prefs.get('sync.autoSync') or not Zotero.Sync.Server.enabled

Zotero.BetterBibTeX.toArray = (item) ->
  item = Zotero.Items.get(item.itemID) if not item.setField and not item.itemType and item.itemID
  item = item.toArray! if item.setField # TODO: switch to serialize when Zotero does
  throw 'format: no item\n' + (new Error 'dummy').stack if not item.itemType
  return item

############### KEY MANAGER ###############################

Zotero.BetterBibTeX.KeyManager = ->
  # three-letter month abbreviations. I assume these are the same ones that the
  # docs say are defined in some appendix of the LaTeX book. (I don't have the
  # LaTeX book.)
  @months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]
  @journalAbbrevCache = OBject.create(null)

  @__exposedProps__ = {
    months: 'r'
    journalAbbrev: 'r'
    extract: 'r'
    get: 'r'
    keys: 'r'
  }
  for own key, value of @__exposedProps__
    self[key].__exposedProps__ = []

Zotero.BetterBibTeX.KeyManager::journalAbbrev = (item) ->
  item = arguments[1] if item._sandboxManager # the sandbox inserts itself in call parameters

  return item.journalAbbreviation if item.journalAbbreviation
  return unless Zotero.BetterBibTeX.prefs.getBoolPref 'auto-abbrev'

  if typeof @journalAbbrevCache[item.publicationTitle] is 'undefined'
    styleID = Zotero.BetterBibTeX.prefs.getCharPref 'auto-abbrev.style'
    styleID = [style for style in Zotero.Styles.getVisible! when style.usesAbbreviation][0].styleID if styleID is ''
    style = Zotero.Styles.get styleID
    cp = style.getCiteProc true

    cp.setOutputFormat 'html'
    cp.updateItems [item.itemID]
    cp.appendCitationCluster({ citationItems: [{id: item.itemID}], properties: {} } , true)
    cp.makeBibliography!

    abbrevs = cp
    for p in ['transform', 'abbrevs', 'default', 'container-title']
      abbrevs = abbrevs[p] if abbrevs

    for own title,abbr of abbrevs or {}
      @journalAbbrevCache[title] = abbr

    @journalAbbrevCache[item.publicationTitle] ?= ''

  return @journalAbbrevCache[item.publicationTitle]

Zotero.BetterBibTeX.KeyManager::extract = (item) ->
  item = arguments[1] if item._sandboxManager
  item = {extra: item.getField('extra')} if item.getField
  return null unless item.extra

  embeddedKeyRE = //bibtex: *([^\s\r\n]+)//
  andersJohanssonKeyRE = //biblatexcitekey\[([^\]]+)\]//
  extra = item.extra

  m = embeddedKeyRE.exec(item.extra) or andersJohanssonKeyRE.exec(item.extra)
  return null unless m

  item.extra = item.extra.replace(m.0, '').trim!
  return m[1]

Zotero.BetterBibTeX.KeyManager::get = (item, pinmode) ->
  if item._sandboxManager
    item = arguments[1]
    pinmode = arguments[2]

  citekey = Zotero.BetterBibTeX.DB.rowQuery 'select citekey, citeKeyFormat from keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0]
  if not citekey
    pattern = Zotero.BetterBibTeX.prefs.getCharPref 'citeKeyFormat'
    Formatter = Zotero.BetterBibTeX.formatter pattern
    citekey = new Formatter(Zotero.BetterBibTeX.toArray(item)).value
    postfix = { n: -1, c: '' }
    while Zotero.BetterBibTeX.DB.valueQuery 'select count(*) from keys where citekey=? and libraryID = ?', [citekey + postfix.c, item.libraryID || 0]
      postfix.n++
      postfix.c = String.fromCharCode('a'.charCodeAt! + postfix.n)

    citekey = { citekey: citekey + postfix.c, citeKeyFormat: pattern }
    Zotero.BetterBibTeX.DB.query 'delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID || 0, citekey.citekey]
    Zotero.BetterBibTeX.DB.query 'insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, ?)', [ item.itemID, item.libraryID || 0, citekey.citekey, pattern ]

  if citekey.citeKeyFormat && (pinmode == 'manual' || (Zotero.BetterBibTeX.allowAutoPin() && pinmode == Zotero.BetterBibTeX.Prefs.getCharPref('pin-citekeys')))
    item = Zotero.Items.get item.itemID if not item.getField
    _item = {extra: '' + item.getField 'extra'}
    @extract _item
    extra = _item.extra.trim!
    item.setField('extra', "#extra \nbibtex: #{citekey.citekey}"
    item.save!

    Zotero.BetterBibTeX.DB.query 'delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID || 0, citekey.citekey]
    Zotero.BetterBibTeX.DB.query 'insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [ item.itemID, item.libraryID || 0, citekey.citekey ]

  return citekey.citekey

Zotero.BetterBibTeX.KeyManager::keys = ->
  return Zotero.BetterBibTeX.DB.query 'select * from keys order by libraryID, itemID'

################ ENDPOINTS ###########################################
Zotero.BetterBibTeX.endpoints = { }
Zotero.BetterBibTeX.endpoints.collection = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.collection.init: (url, data, sendResponseCallback) ->
  try
    collection = url.query['']
  catch err
    collection = null

  if not collection
    sendResponseCallback 501, 'text/plain', 'Could not export bibliography: no path'
    return 

  try
    path = collection.split '.'
    if path.length is 1
      sendResponseCallback 404, 'text/plain', "Could not export bibliography '#collection': no format specified"
      return 

    translator = path.pop!
    path = path.join '.'
    items = []
    for collectionkey in path.split '+'
      collectionkey = "/0/#collectionkey" if collectionkey.charAt(0) isnt '/'
      path = collectionkey.split '/'
      path.shift!

      libid = parseInt path.shift!
      throw "Not a valid library ID: #collectionkey" if isNaN libid

      key = '' + path[0]
      col = null
      for name in path
        children = Zotero.getCollections col?.id, false, libid
        col = null
        for child in children
          if child.name.toLowerCase! is name.toLowerCase!
            col = child
            break
        if not col then break
      col ?= Zotero.Collections.getByLibraryAndKey libid, key
      throw "#collectionkey not found" unless col

      try
        recursive = Zotero.Prefs.get 'recursiveCollections'
      catch e
        recursive = false

      items = items.concat(Zotero.Items.get([item.id for item of col.getChildren recursive, false, 'item']))

    sendResponseCallback 200, 'text/plain', Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), items, Zotero.BetterBibTeX.displayOptions url)

  catch err
    Zotero.BetterBibTeX.log "Could not export bibliography '#collection", err
    sendResponseCallback 404, 'text/plain', "Could not export bibliography '#collection': #err"

Zotero.BetterBibTeX.endpoints.library = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.library.init: (url, data, sendResponseCallback) ->
  try
    library = url.query['']
  catch err
    library = null

  if not library
    sendResponseCallback 501, 'text/plain', 'Could not export bibliography: no path'
    return 

  try
    libid = 0
    path = library.split '/'
    if path.length > 1
      path.shift! # leading '/'
      libid = parseInt path.shift!

      if not Zotero.Libraries.exists libid
        sendResponseCallback 404, 'text/plain', "Could not export bibliography: library '#library' does not exist"
        return 

    path = path.join('/').split '.'
    if path.length is 1
      sendResponseCallback 404, 'text/plain', "Could not export bibliography '#library': no format specified"
      return 

    translator = path.pop!
    sendResponseCallback 200, 'text/plain', Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), Zotero.Items.getAll(false, libid), Zotero.BetterBibTeX.displayOptions url)

  catch err
    Zotero.BetterBibTeX.log "Could not export bibliography '#library'", err
    sendResponseCallback 404, 'text/plain', "Could not export bibliography '#library': #err"

Zotero.BetterBibTeX.endpoints.selected = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.selected.init: (url, data, sendResponseCallback) ->
  try
    translator = url.query['']
  catch err
    translator = null

  if not translator
    sendResponseCallback 501, 'text/plain', 'Could not export bibliography: no path'
    return 

  win = Zotero.BetterBibTeX.windowMediator.getMostRecentWindow 'navigator:browser'
  items = Zotero.Items.get([item.id for item of win.ZoteroPane.getSelectedItems!])
  sendResponseCallback 200, 'text/plain', Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), items, Zotero.BetterBibTeX.displayOptions url)

################# DEBUGBRIDGE ############################
Zotero.BetterBibTeX.DebugBridge = {
  data: {
    prefs: Object.create null
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
      reset = Zotero.Prefs.get name
    catch
    @prefs[name].reset = reset
  Zotero.Prefs.set name, value

Zotero.BetterBibTeX.DebugBridge.methods.init = ->
  # monkey-patch Zotero.Items.getAll to get items sorted. With random order I can't really implement stable
  # testing. A simple ORDER BY would have been easier and loads faster, but I can't reach into getAll.
  Zotero.Items.getAll = ((original) ->
    (onlyTopLevel, libraryID, includeDeleted) ->
      items = original.apply this, arguments_
      items.sort ((a, b) -> a.itemID - b.itemID)
      items)(Zotero.Items.getAll)
  return true

Zotero.BetterBibTeX.DebugBridge.methods.reset = ->
  # Zotero.BetterBibTeX.init!
  retval = Zotero.BetterBibTeX.DebugBridge.data.prefs

  for own name, value of Zotero.BetterBibTeX.DebugBridge.data.prefs
    Zotero.Prefs.set name, value.reset if value.reset isnt null
  Zotero.BetterBibTeX.DebugBridge.data.prefs = Object.create(null);
  Zotero.BetterBibTeX.DebugBridge.data.exportOptions = {}

  try
    Zotero.Items.erase [item.id for item in Zotero.BetterBibTeX.safeGetAll!]
  catch
  try
    Zotero.Collections.erase [coll.id for coll in Zotero.getCollections!]
  catch

  Zotero.BetterBibTeX.DB.query 'delete from keys'
  Zotero.Items.emptyTrash!

  return retval

Zotero.BetterBibTeX.DebugBridge.methods.import = (filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance Components.interfaces.nsILocalFile
  file.initWithPath filename
  Zotero_File_Interface.importFile file
  return true

Zotero.BetterBibTeX.DebugBridge.methods.librarySize = -> Zotero.DB.valueQuery 'select count(*) from items'

Zotero.BetterBibTeX.DebugBridge.methods.exportToString = (translator) ->
  translator = Zotero.BetterBibTeX.getTranslator translator
  Zotero.BetterBibTeX.translate translator, null, Zotero.BetterBibTeX.DebugBridge.data.exportOptions || {}

Zotero.BetterBibTeX.DebugBridge.methods.exportToFile = (translator, filename) ->
  file = Components.classes['@mozilla.org/file/local;1'].createInstance Components.interfaces.nsILocalFile
  file.initWithPath filename
  translator = Zotero.BetterBibTeX.getTranslator translator
  Zotero.File.putContents file, Zotero.BetterBibTeX.translate(translator, null, { exportNotes: true, exportFileData: false })
  return true

Zotero.BetterBibTeX.DebugBridge.methods.library = ->
  translator = Zotero.BetterBibTeX.getTranslator 'Zotero TestCase'
  return JSON.parse Zotero.BetterBibTeX.translate(translator, null, { exportNotes: true, exportFileData: false })

Zotero.BetterBibTeX.DebugBridge.methods.getKeys = -> Zotero.BetterBibTeX.keymanager.keys!

Zotero.BetterBibTeX.DebugBridge.methods.setExportOption = (name, value) -> Zotero.BetterBibTeX.DebugBridge.data.exportOptions[name] = value

Zotero.BetterBibTeX.DebugBridge.methods.setPreference = (name, value) -> Zotero.BetterBibTeX.DebugBridge.data.setPref name, value

Zotero.BetterBibTeX.DebugBridge.methods.select = (attribute, value) ->
  attribute = attribute.replace //[^a-zA-Z]//, ''
  sql = "select i.itemID as itemID
         from items i
         join itemData id on i.itemID = id.itemID
         join itemDataValues idv on idv.valueID = id.valueID
         join fields f on id.fieldID = f.fieldID 
         where f.fieldName = '#attribute' and not i.itemID in (select itemID from deletedItems) and idv.value = ?"

  return Zotero.DB.valueQuery sql, [value]

Zotero.BetterBibTeX.DebugBridge.methods.remove = (id) -> Zotero.Items.trash([id])

Zotero.BetterBibTeX.DebugBridge.methods.pinCiteKey = (id) ->
  Zotero.BetterBibTeX.clearKey({itemID: id}, true)
  Zotero.BetterBibTeX.keymanager.get({itemID: id}, 'manual')
