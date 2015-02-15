Components.utils.import('resource://gre/modules/Services.jsm')
Components.utils.import('resource://gre/modules/AddonManager.jsm')

require('Formatter.js')

Zotero.BetterBibTeX = {}

Zotero.BetterBibTeX.log = (msg...) ->
  msg = for m in msg
    switch
      when (typeof m) in ['string', 'number'] then '' + m
      when m instanceof Error and m.name then "#{m.name}: #{m.message} \n(#{m.fileName}, #{m.lineNumber})\n#{m.stack}"
      when m instanceof Error then "#{e}\n#{e.stack}"
      else JSON.stringify(m)

  Zotero.debug("[better-bibtex] #{msg.join(' ')}")
  return

Zotero.BetterBibTeX.reportErrors = (details) ->
  switch details
    when 'collection'
      collectionsView = Zotero.getActiveZoteroPane()?.collectionsView
      itemGroup = collectionsView?._getItemAtRow(collectionsView.selection?.currentIndex)
      if itemGroup?.isCollection()
        collection = collectionsView.getSelectedCollection()
    when 'items'
      win = @windowMediator.getMostRecentWindow('navigator:browser')
      items = win.ZoteroPane.getSelectedItems()
      if items?.length > 0
        items = Zotero.Items.get(item.id for item in items) if items?.length > 0
      else
        items = null

  io = {wrappedJSObject: {items: items, collection: collection}}
  ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
  ww.openWindow(null, 'chrome://zotero-better-bibtex/content/errorReport.xul', 'zotero-error-report', 'chrome,centerscreen,modal', io)
  return

Zotero.BetterBibTeX.pref = {}

Zotero.BetterBibTeX.pref.prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.zotero.translators.better-bibtex.')

Zotero.BetterBibTeX.pref.observer = {
  register: -> Zotero.BetterBibTeX.pref.prefs.addObserver('', this, false)
  unregister: -> Zotero.BetterBibTeX.pref.prefs.removeObserver('', this)
  observe: (subject, topic, data) ->
    switch data
      when 'citeKeyFormat'
        Zotero.BetterBibTeX.keymanager.reset()
        Zotero.BetterBibTeX.DB.query('delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.pref.get('citeKeyFormat')])
      when 'auto-export'
        Zotero.BetterBibTeX.auto.process()
    return
}

Zotero.BetterBibTeX.pref.ZoteroObserver = {
  register: -> Zotero.Prefs.prefBranch.addObserver('', this, false)
  unregister: -> Zotero.Prefs.prefBranch.removeObserver('', this)
  observe: (subject, topic, data) ->
    if data == 'recursiveCollections'
      recursive = Zotero.BetterBibTeX.auto.recursive()
      Zotero.BetterBibTeX.DB.execute("update autoexport set recursive = ?, status = 'pending' where recursive <> ?", [recursive, recursive])
      Zotero.BetterBibTeX.auto.process('recursiveCollections')
    return
}

Zotero.BetterBibTeX.pref.snapshot = ->
  stash = Object.create(null)
  for key in @prefs.getChildList('')
    stash[key] = @get(key)
  return stash

Zotero.BetterBibTeX.pref.stash = -> @stashed = @snapshot()

Zotero.BetterBibTeX.pref.restore = ->
  for own key, value of @stashed ? {}
    @set(key, value)
  return

Zotero.BetterBibTeX.pref.set = (key, value) ->
  return Zotero.Prefs.set("translators.better-bibtex.#{key}", value)

Zotero.BetterBibTeX.pref.get = (key) ->
  return Zotero.Prefs.get("translators.better-bibtex.#{key}")

Zotero.BetterBibTeX.formatter = (pattern) ->
  @formatters ?= Object.create(null)
  @formatters[pattern] = BetterBibTeXFormatter.parse(pattern) unless @formatters[pattern]
  return @formatters[pattern]

Zotero.BetterBibTeX.idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService)
Zotero.BetterBibTeX.idleObserver = observe: (subject, topic, data) ->
  switch topic
    when 'idle'
      Zotero.BetterBibTeX.auto.idle = true
      Zotero.BetterBibTeX.auto.process('idle')

    when 'back'
      Zotero.BetterBibTeX.auto.idle = false
  return

Zotero.BetterBibTeX.init = ->
  @log("Running init: #{@initialized}")
  return if @initialized
  @initialized = true

  @translators = Object.create(null)
  @threadManager = Components.classes['@mozilla.org/thread-manager;1'].getService()
  @windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
  @DB = new Zotero.DBConnection('betterbibtex')

  @findKeysSQL = "select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra
                  from items i
                  join itemData id on i.itemID = id.itemID
                  join itemDataValues idv on idv.valueID = id.valueID
                  join fields f on id.fieldID = f.fieldID
                  where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems)
                    and (idv.value like '%bibtex:%' or idv.value like '%biblatexcitekey[%' or idv.value like '%biblatexcitekey{%')"
  @findExtra = "select idv.value as extra
                  from items i
                  join itemData id on i.itemID = id.itemID
                  join itemDataValues idv on idv.valueID = id.valueID
                  join fields f on id.fieldID = f.fieldID
                  where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems)"

  @pref.prefs.clearUserPref('brace-all')
  @DB.query('create table if not exists _version_ (tablename primary key, version not null, unique (tablename, version))')
  @DB.query("insert or ignore into _version_ (tablename, version) values ('keys', 0)")

  version = @DB.valueQuery("select version from _version_ where tablename = 'keys'")
  if version == 0
    @DB.query('create table keys (itemID primary key, libraryID not null, citekey not null, pinned)')

  if version < 3
    @pref.set('scan-citekeys', true)

  if version < 4
    @DB.query('alter table keys rename to keys2')
    @DB.query('create table keys (itemID primary key, libraryID not null, citekey not null, citeKeyFormat)')
    @DB.query('insert into keys (itemID, libraryID, citekey, citeKeyFormat)
               select itemID, libraryID, citekey, case when pinned = 1 then null else ? end from keys2', [@pref.get('citeKeyFormat')])

  if version < 5
    @DB.query('drop table keys2')

  if version < 6
    @DB.query("
      create table cache (
        itemid not null,
        context not null,
        citekey not null,
        entry not null,
        primary key (itemid, context))
      ")

  if version < 7
    @DB.query("
      create table autoexport (
        id integer primary key not null,
        collection_id not null,
        collection_name not null,
        path not null,
        context not null,
        recursive not null,
        status not null,
        unique (collection_id, path, context))
      ")

  @DB.query("insert or replace into _version_ (tablename, version) values ('keys', 7)")

  @keymanager.reset()
  @DB.query('delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [@pref.get('citeKeyFormat')])

  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    __exposedProps__: {keymanager: 'r', cache: 'r'}
    keymanager: @keymanager.init()
    cache: @cache.init()
  }

  @pref.observer.register()
  @pref.ZoteroObserver.register()


  for own name, endpoint of @endpoints
    url = "/better-bibtex/#{name}"
    ep = Zotero.Server.Endpoints[url] = ->
    ep.prototype = endpoint
    @log("Registered #{url}")

  if @pref.get('scan-citekeys')
    for row in Zotero.DB.query(@findKeysSQL) or []
      @DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [ row.itemID, row.libraryID, @keymanager.extract({extra: row.extra}) ])
    @pref.set('scan-citekeys', false)

  @loadTranslators()

  # monkey-patch Zotero.ItemTreeView.prototype.getCellText to replace the 'extra' column with the citekey
  # I wish I didn't have to hijack the extra field, but Zotero has checks in numerous places to make sure it only
  # displays 'genuine' Zotero fields, and monkey-patching around all of those got to be way too invasive (and this
  # fragile)
  Zotero.ItemTreeView.prototype.getCellText = ((original) ->
    return (row, column) ->
      if column.id == 'zotero-items-column-extra' && Zotero.BetterBibTeX.pref.get('show-citekey')
        item = this._getItemAtRow(row)
        if !(item?.ref) || item.ref.isAttachment() || item.ref.isNote()
          return ''
        else
          key = Zotero.BetterBibTeX.keymanager.get({itemID: item.id, libraryID: item.libraryID}, {metadata: true})
          return '' if key.citekey.match(/^zotero-(null|[0-9]+)-[0-9]+$/)
          return key.citekey + (if key.citeKeyFormat then ' *' else '')

      return original.apply(this, arguments)
    )(Zotero.ItemTreeView.prototype.getCellText)

  # monkey-patch Zotero.Translate.Base.prototype.translate to capture export data
  Zotero.Translate.Base.prototype.translate = ((original) ->
    return (libraryID, saveAttachments) ->
      if @translator?[0] && @type == 'export' && @path && @_displayOptions?['Keep updated']
        progressWin = new Zotero.ProgressWindow()
        #progressWin.changeHeadline(Zotero.getString("save.link"));
        progressWin.changeHeadline('Auto-export')

        if !@_collection?._id
          progressWin.addLines(['Auto-export only supported for collections'])

        else
          progressWin.addLines(["Collection #{@_collection._name} set up for auto-export"])
          # I don't want 'Keep updated' to be remembered as a default
          try
            settings = JSON.parse(Zotero.Prefs.get('export.translatorSettings'))
            if settings['Keep updated']
              delete settings['Keep updated']
              Zotero.Prefs.set('export.translatorSettings', JSON.stringify(settings));
          catch

          # data to define new auto-export
          config = {
            target: @path
            collection: {id: @_collection?._id, name: @_collection._name}
            context: new Zotero.BetterBibTeX.Context( { id: @translator[0].translatorID, label: @translator[0].label, options: @_displayOptions, preferences: Zotero.BetterBibTeX.pref.snapshot() } )
          }
          Zotero.BetterBibTeX.auto.add(config)

        progressWin.show()
        progressWin.startCloseTimer()

      # add exportPath for relativizing export paths (#126)
      if @_displayOptions && @translator?[0]
        for own name, header of Zotero.BetterBibTeX.translators
          if header.translatorID == @translator[0].translatorID
            @_displayOptions.exportPath = @path
            break

      return original.apply(this, arguments)
    )(Zotero.Translate.Base.prototype.translate)

  @schomd.init()

  nids = []
  nids.push(Zotero.Notifier.registerObserver(@itemChanged, ['item']))
  nids.push(Zotero.Notifier.registerObserver(@collectionChanged, ['collection']))
  nids.push(Zotero.Notifier.registerObserver(@itemAdded, ['collection-item']))
  window.addEventListener('unload', ((e) -> Zotero.Notifier.unregisterObserver(id) for id in nids), false)

  @idleService.addIdleObserver(@idleObserver, 60)

  uninstaller = {
    onUninstalling: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      Zotero.BetterBibTeX.removeTranslators()
      return

    onOperationCancelled: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      if !(addon.pendingOperations & AddonManager.PENDING_UNINSTALL)
        Zotero.BetterBibTeX.loadTranslators()
      return
  }
  AddonManager.addAddonListener(uninstaller)

  return

Zotero.BetterBibTeX.loadTranslators = ->
  @safeLoad('Better BibTeX.js')
  @safeLoad('Better BibLaTeX.js')
  @safeLoad('LaTeX Citation.js')
  @safeLoad('Pandoc Citation.js')
  @safeLoad('Zotero TestCase.js')
  @safeLoad('BibTeXAuxScanner.js')
  Zotero.Translators.init()
  return

Zotero.BetterBibTeX.removeTranslators = ->
  for own name, header of @translators
    fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
    destFile = Zotero.getTranslatorsDirectory()
    destFile.append(fileName)
    destFile.remove(false)
  @translators = Object.create(null)
  Zotero.Translators.init()
  return

Zotero.BetterBibTeX.itemAdded = {
  notify: (event, type, collection_items) ->
    Zotero.BetterBibTeX.log('::: itemAdded', event, type, collection_items)

    collections = []
    for collection_item in collection_items
      [collectionID, itemID] = collection_item.split('-')
      Zotero.BetterBibTeX.log('::: itemAdded', collectionID, itemID)
      collections.push(collectionID)

      # aux-scanner only triggers on add
      continue unless event == 'add'
      collection = Zotero.Collections.get(collectionID)
      continue unless collection

      extra = Zotero.DB.valueQuery("#{Zotero.BetterBibTeX.findExtra} and i.itemID = ?", [itemID])
      continue unless extra

      try
        extra = JSON.parse(extra)
      catch error
        Zotero.BetterBibTeX.log('::: itemAdded extra not json ', extra, error)
        continue

      continue if extra.translator != 'BibTeX AUX Scanner'
      Zotero.BetterBibTeX.log('::: AUX', collection.id, extra.citations)

      missing = []
      for citekey in extra.citations
        Zotero.BetterBibTeX.log("::: citekey #{citekey}")
        id = Zotero.BetterBibTeX.DB.valueQuery('select itemID from keys where libraryID = 0 and citekey = ?', [citekey])
        if id
          Zotero.BetterBibTeX.log("::: citekey #{citekey} found")
          collection.addItem(id)
        else
          Zotero.BetterBibTeX.log("::: citekey #{citekey} missing")
          missing.push("* #{citekey}")

      if missing.length == 0
        Zotero.BetterBibTeX.log("::: all citekeys found")
        Zotero.Items.trash([itemID])
      else
        Zotero.BetterBibTeX.log("::: #{missing.length} citekeys missing")
        item = Zotero.Items.get(itemID)
        item.setField('extra', "Missing references:\n#{missing.join('\n')}")
        item.save()

    if collections.length != 0
      collections = ('' + id for id in collections).join(',')
      Zotero.BetterBibTeX.DB.query("update autoexport set status = 'pending' where collection_id in (#{collections})")
      Zotero.BetterBibTeX.auto.process('collectionChanged')

    return
}

Zotero.BetterBibTeX.collectionChanged = notify: (event, type, ids, extraData) ->
  Zotero.BetterBibTeX.DB.query("delete from autoexport where collection_id in (#{('' + id for id in extraData).join(',')})") if event == 'delete' && extraData.length > 0
  return

Zotero.BetterBibTeX.itemChanged = notify: (event, type, ids, extraData) ->
  Zotero.BetterBibTeX.keymanager.reset()
  collections = []

  switch event
    when 'delete'
      break if extraData.length == 0

      for id in extraData
        Zotero.BetterBibTeX.clearKey({itemID: id}, true)

      Zotero.BetterBibTeX.DB.query("delete from cache where itemid in (#{('' + id for id in extraData).join(',')})")
      collections = Zotero.Collections.getCollectionsContainingItems(extraData, true)

    when 'add', 'modify', 'trash'
      break if ids.length == 0

      collections = Zotero.Collections.getCollectionsContainingItems(ids, true)

      ids = '(' + ('' + id for id in ids).join(',') + ')'

      Zotero.BetterBibTeX.DB.query("delete from keys where itemID in #{ids}")
      if event != 'trash'
        for item in Zotero.DB.query("#{Zotero.BetterBibTeX.findKeysSQL} and i.itemID in #{ids}") or []
          citekey = Zotero.BetterBibTeX.keymanager.extract({extra: item.extra})
          if Zotero.BetterBibTeX.pref.get('key-conflict-policy') == 'change'
            Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID, citekey])
            Zotero.BetterBibTeX.DB.query('delete from cache where citekey = ?', [citekey])
          Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [ item.itemID, item.libraryID, citekey ])

        for item in Zotero.DB.query("select coalesce(libraryID, 0) as libraryID, itemID from items where itemID in #{ids}") or []
          Zotero.BetterBibTeX.keymanager.get(item, 'on-change')

  if collections.length != 0
    collections = ('' + id for id in collections).join(',')
    Zotero.BetterBibTeX.DB.query("update autoexport set status = 'pending' where collection_id in (#{collections})")
    Zotero.BetterBibTeX.auto.process('itemChanged')

  return

Zotero.BetterBibTeX.clearKey = (item, onlyCache) ->
  if not onlyCache
    _item = {extra: '' + item.getField('extra')}
    citekey = not @keymanager.extract(_item)
    if citekey
      item.setField('extra', _item.extra)
      item.save()
  Zotero.BetterBibTeX.keymanager.reset()
  @DB.query('delete from keys where itemID = ?', [item.itemID])
  return

Zotero.BetterBibTeX.displayOptions = (url) ->
  params = {}
  hasParams = false
  for key in [ 'exportCharset', 'exportNotes?', 'useJournalAbbreviation?' ]
    try
      isBool = key.match(/[?]$/)
      key = key.replace(isBool[0], '') if isBool
      params[key] = url.query[key]
      params[key] = [ 'y', 'yes', 'true' ].indexOf(params[key].toLowerCase()) >= 0 if isBool
      hasParams = true
    catch
  return params if hasParams
  return null

Zotero.BetterBibTeX.translate = (translator, items, displayOptions) ->
  throw 'null translator' unless translator

  translation = new Zotero.Translate.Export

  for own key, value of items
    switch key
      when 'library' then translation.setItems(Zotero.Items.getAll(true, value))
      when 'items' then translation.setItems(value)
      when 'collection' then translation.setCollection(value)

  translation.setTranslator(translator)
  translation.setDisplayOptions(displayOptions)

  status = {finished: false}

  translation.setHandler('done', (obj, success) ->
    status.success = success
    status.finished = true
    status.data = obj.string if success
    return)
  translation.translate()

  while not status.finished # ugly spinlock
    continue

  return status.data if status.success
  throw 'export failed'

Zotero.BetterBibTeX.safeLoad = (translator) ->
  try
    @load(translator)
  catch err
    @log("Loading #{translator} failed", err)

Zotero.BetterBibTeX.load = (translator) ->
  header = null
  data = null
  start = -1
  try
    data = Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator}")
    start = data.indexOf('{') if data
    if start >= 0
      len = data.indexOf('}', start)
      if len > 0
        len -= start
        while len < 3000
          try
            header = JSON.parse(data.substring(start, len).trim())
            data = data.substring(start + len, data.length)
            break
          catch
          len++
  catch err
    header = null

  if not header
    @log("Loading #{translator} failed: could not parse header")
    return

  @translators[header.label.toLowerCase().replace(/[^a-z]/, '')] = header
  Zotero.Translators.save(header, data)
  return

Zotero.BetterBibTeX.getTranslator = (name) ->
  name = name.toLowerCase().replace(/[^a-z]/, '')
  translator = @translators[name]
  translator ?= @translators["better#{name}"]
  translator ?= @translators["zotero#{name}"]
  throw "No translator #{name}; available: #{Object.keys(@translators).join(', ')}" unless translator
  return translator.translatorID

Zotero.BetterBibTeX.clearCiteKeys = (onlyCache) ->
  win = @windowMediator.getMostRecentWindow('navigator:browser')
  items = Zotero.Items.get((item.id for item in win.ZoteroPane.getSelectedItems() when !item.isAttachment() && !item.isNote()))
  for item in items
    @clearKey(item, onlyCache)
  return items

Zotero.BetterBibTeX.pinCiteKeys = ->
  for item in @clearCiteKeys(true)
    @keymanager.get(item, 'manual')

Zotero.BetterBibTeX.safeGetAll = ->
  try
    all = Zotero.Items.getAll()
    all = [all] if all and not Array.isArray(all)
  catch err
    all = false
  if not all then all = []
  return all

Zotero.BetterBibTeX.safeGet = (ids) ->
  return [] if ids.length == 0
  all = Zotero.Items.get(ids)
  if not all then return []
  return all

Zotero.BetterBibTeX.allowAutoPin = -> Zotero.Prefs.get('sync.autoSync') or not Zotero.Sync.Server.enabled

Zotero.BetterBibTeX.toArray = (item) ->
  item = Zotero.Items.get(item.itemID) if not item.setField and not item.itemType and item.itemID
  item = item.toArray() if item.setField # TODO: switch to serialize when Zotero does
  throw 'format: no item\n' + (new Error('dummy')).stack if not item.itemType
  return item

require('preferences.coffee')
require('keymanager.coffee')
require('web-endpoints.coffee')
require('schomd.coffee')
require('debug-bridge.coffee')
require('context.coffee', 'Zotero.BetterBibTeX')
require('cache.coffee')
