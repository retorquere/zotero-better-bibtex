Components.utils.import 'resource://gre/modules/Services.jsm'
Components.utils.import 'resource://gre/modules/AddonManager.jsm'

require 'Formatter.js'

Zotero.BetterBibTeX = new ->
  @prefs = (Components.classes['@mozilla.org/preferences-service;1'].getService Components.interfaces.nsIPrefService).getBranch 'extensions.zotero.translators.better-bibtex.'
  @translators = Object.create null
  @threadManager = Components.classes['@mozilla.org/thread-manager;1'].getService()
  @windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService Components.interfaces.nsIWindowMediator
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
  if data == 'citeKeyFormat'
    Zotero.BetterBibTeX.DB.query('delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.prefs.getCharPref('citeKeyFormat')])

Zotero.BetterBibTeX.log = (msg, e) ->
  msg = "[better-bibtex] #{msg}"
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
    when 0
      @log 'initializing DB: no tables'
      @DB.query 'create table keys (itemID primary key, libraryID not null, citekey not null, pinned)'
      @DB.query "insert or replace into _version_ (tablename, version) values ('keys', 1)"

    when 1, 2
      @prefs.setBoolPref 'scan-citekeys', true
      @DB.query "insert or replace into _version_ (tablename, version) values ('keys', 3)"

    when 3
      @DB.query 'alter table keys rename to keys2'
      @DB.query 'create table keys (itemID primary key, libraryID not null, citekey not null, citeKeyFormat)'
      @DB.query('insert into keys (itemID, libraryID, citekey, citeKeyFormat)
                 select itemID, libraryID, citekey, case when pinned = 1 then null else ? end from keys2', [@prefs.getCharPref 'citeKeyFormat'])
      @DB.query "insert or replace into _version_ (tablename, version) values ('keys', 4)"

  @DB.query 'delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [@prefs.getCharPref 'citeKeyFormat']

  @prefsObserver.register()

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
      Zotero.BetterBibTeX.DB.query 'insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [ row.itemID, row.libraryID, @keymanager.extract({extra: row.extra}) ]
    @prefs.setBoolPref 'scan-citekeys', false

  notifierID = Zotero.Notifier.registerObserver @itemChanged, ['item']
  window.addEventListener 'unload', ((e) -> Zotero.Notifier.unregisterObserver notifierID), false
  @loadTranslators()

Zotero.BetterBibTeX.loadTranslators = ->
  @safeLoad 'Better BibTeX.js'
  @safeLoad 'Better BibLaTeX.js'
  @safeLoad 'LaTeX Citation.js'
  @safeLoad 'Pandoc Citation.js'
  @safeLoad 'Zotero TestCase.js'
  Zotero.Translators.init()

Zotero.BetterBibTeX.removeTranslators = ->
  for name in @translators
    header = @translators[name]
    fileName = Zotero.Translators.getFileNameFromLabel header.label, header.translatorID
    destFile = Zotero.getTranslatorsDirectory()
    destFile.append fileName
    destFile.remove()
  Zotero.Translators.init()

Zotero.BetterBibTeX.itemChanged = {}

Zotero.BetterBibTeX.itemChanged.notify = (event, type, ids, extraData) ->
  switch event
    when 'delete'
      for key in extraData
        v = extraData[key]
        i = {itemID: key}
        Zotero.BetterBibTeX.clearKey i, true

    when 'add', 'modify', 'trash'
      break if ids.length is 0

      ids = '(' + ('' + id for id in ids).join(',') + ')'

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
      item.save()
  @DB.query 'delete from keys where itemID = ?', [item.itemID]

Zotero.BetterBibTeX.displayOptions = (url) ->
  params = {}
  hasParams = false
  for key in [ 'exportCharset', 'exportNotes?', 'useJournalAbbreviation?' ]
    try
      isBool = key.match /[?]$/
      key = key.replace isBool[0], '' if isBool
      params[key] = url.query[key]
      params[key] = [ 'y', 'yes', 'true' ].indexOf(params[key].toLowerCase()) >= 0 if isBool
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
  translation.translate()

  while not status.finished # ugly spinlock
    continue

  return status.data if status.success
  throw 'export failed'

Zotero.BetterBibTeX.safeLoad = (translator) ->
  try
    @load translator
  catch err
    @log "Loading #{translator} failed", err

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
            header = JSON.parse (data.substring start, len).trim()
            data = data.substring start + len, data.length
            break
          catch
          len++
  catch err
    header = null

  if not header
    @log "Loading #{translator} failed: could not parse header"
    return 

  @translators[header.label.toLowerCase().replace /[^a-z]/, ''] = header
  Zotero.Translators.save header, data

Zotero.BetterBibTeX.getTranslator = (name) ->
  name = name.toLowerCase().replace(/[^a-z]/, '')
  translator = @translators[name]
  translator ?= @translators["better#{name}"]
  translator ?= @translators["zotero#{name}"]
  throw "No translator #{name}; available: #{Object.keys(@translators).join(', ')}" unless translator
  return translator.translatorID

Zotero.BetterBibTeX.clearCiteKeys = (onlyCache) ->
  win = @windowMediator.getMostRecentWindow 'navigator:browser'
  for item in Zotero.Items.get((item.id for item in win.ZoteroPane.getSelectedItems() when !item.isAttachment() && !item.isNote()))
    @clearKey item, onlyCache
  return items

Zotero.BetterBibTeX.pinCiteKeys = ->
  for item in @clearCiteKeys true
    Zotero.BetterBibTeX.keymanager.get item, 'manual'

Zotero.BetterBibTeX.safeGetAll = ->
  try
    all = Zotero.Items.getAll()
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
  item = item.toArray() if item.setField # TODO: switch to serialize when Zotero does
  throw 'format: no item\n' + (new Error 'dummy').stack if not item.itemType
  return item

require 'keymanager.coffee'
require 'web-endpoints.coffee'
require 'debug-bridge.coffee'
