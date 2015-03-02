Components.utils.import('resource://gre/modules/Services.jsm')
Components.utils.import('resource://gre/modules/AddonManager.jsm')

require('Formatter.js')

Zotero.BetterBibTeX = {}

Zotero.BetterBibTeX.inspect = (o) ->
  clone = Object.create(null)
  clone[k] = v for own k, v of o
  return clone

Zotero.BetterBibTeX.log = (msg...) ->
  msg = for m in msg
    switch
      when (typeof m) in ['string', 'number'] then '' + m
      when (typeof m) == 'object' then JSON.stringify(Zotero.BetterBibTeX.inspect(m)) # unpacks db query objects
      when m instanceof Error and m.name then "#{m.name}: #{m.message} \n(#{m.fileName}, #{m.lineNumber})\n#{m.stack}"
      when m instanceof Error then "#{e}\n#{e.stack}"
      else JSON.stringify(m)

  Zotero.debug("[better-bibtex] #{msg.join(' ')}")
  return

Zotero.BetterBibTeX.flash = (title, body) ->
  progressWin = new Zotero.ProgressWindow()
  progressWin.changeHeadline(title)
  progressWin.addLines((if Array.isArray(body) then body else body.split("\n")))
  progressWin.startCloseTimer()
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
    if data == 'citeKeyFormat'
      Zotero.BetterBibTeX.keymanager.reset()
      # delete all dynamic keys that have a different citekeyformat (should be all)
      Zotero.DB.query('delete from betterbibtex.keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.pref.get('citeKeyFormat')])
      # delete all cache entries that do not correspond to items with pinned keys
      Zotero.DB.query('delete from betterbibtex.cache where not itemID in (select itemID from betterbibtex.keys where citeKeyFormat is null)')
    return
}

Zotero.BetterBibTeX.pref.stash = ->
  @stashed = Object.create(null)
  keys = @prefs.getChildList('')
  for key in keys
    @stashed[key] = @get(key)
  return @stashed

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

Zotero.BetterBibTeX.init = ->
  return if @initialized
  @initialized = true

  @translators = Object.create(null)
  @threadManager = Components.classes['@mozilla.org/thread-manager;1'].getService()
  @windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
  db = Zotero.getZoteroDatabase('betterbibtex')
  Zotero.DB.query('ATTACH ? AS betterbibtex', [db.path])

  @findKeysSQL = "select i.itemID as itemID, idv.value as extra
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
  Zotero.DB.query('create table if not exists betterbibtex._version_ (tablename primary key, version not null, unique (tablename, version))')
  Zotero.DB.query("insert or ignore into betterbibtex._version_ (tablename, version) values ('keys', 0)")

  version = Zotero.DB.valueQuery("select version from betterbibtex._version_ where tablename = 'keys'")
  @log("Booting BBT, schema: #{version}")
  if version < 1
    Zotero.DB.query('create table betterbibtex.keys (itemID primary key, libraryID not null, citekey not null, pinned)')

  if version < 3
    @pref.set('scan-citekeys', true)

  if version < 4
    Zotero.DB.query('alter table betterbibtex.keys rename to keys2')
    Zotero.DB.query('create table betterbibtex.keys (itemID primary key, libraryID not null, citekey not null, citeKeyFormat)')
    Zotero.DB.query('insert into betterbibtex.keys (itemID, libraryID, citekey, citeKeyFormat)
               select itemID, libraryID, citekey, case when pinned = 1 then null else ? end from betterbibtex.keys2', [@pref.get('citeKeyFormat')])

  if version < 5
    Zotero.DB.query('drop table betterbibtex.keys2')

  if version < 6
    Zotero.DB.query("
      create table betterbibtex.cache (
        itemID not null,
        context not null,
        citekey not null,
        entry not null,
        primary key (itemid, context))
      ")

  if version < 7
    Zotero.DB.query('alter table betterbibtex.keys rename to _keys_')
    Zotero.DB.query('create table betterbibtex.keys (itemID primary key, citekey not null, citeKeyFormat)')
    Zotero.DB.query('insert into betterbibtex.keys (itemID, citekey, citeKeyFormat) select itemID, citekey, citeKeyFormat from betterbibtex._keys_')
    Zotero.DB.query('drop table betterbibtex._keys_')
    @pref.set('scan-citekeys', true)

  Zotero.DB.query("insert or replace into betterbibtex._version_ (tablename, version) values ('keys', 7)")

  @keymanager.reset()
  Zotero.DB.query('delete from betterbibtex.keys where citeKeyFormat is not null and citeKeyFormat <> ?', [@pref.get('citeKeyFormat')])

  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    __exposedProps__: {keymanager: 'r', cache: 'r'}
    keymanager: @keymanager.init()
    cache: @cache.init()
  }

  @pref.observer.register()

  for own name, endpoint of @endpoints
    url = "/better-bibtex/#{name}"
    ep = Zotero.Server.Endpoints[url] = ->
    ep.prototype = endpoint
    @log("Registered #{url}")

  # clean up keys for items that have gone missing
  Zotero.DB.query('delete from betterbibtex.keys where not itemID in (select itemID from items)')

  if @pref.get('scan-citekeys')
    @flash('Citation key rescan', "Scanning 'extra' fields for fixed keys\nFor a large library, this might take a while")
    patched = []
    for row in Zotero.DB.query(@findKeysSQL) or []
      patched.push('' + row.itemID)
      @log('scan:', row)
      @keymanager.set(row, @keymanager.extract({extra: row.extra}).__citekey__)
    if patched.length > 0
      for row in Zotero.DB.query("select * from betterbibtex.keys where citeKeyFormat is null and itemID not in (#{patched.join(', ')})")
        @keymanager.remove(row)
    @pref.set('scan-citekeys', false)

  @loadTranslators()

  # monkey-patch Zotero.ItemTreeView.prototype.getCellText to replace the 'extra' column with the citekey
  # I wish I didn't have to hijack the extra field, but Zotero has checks in numerous places to make sure it only
  # displays 'genuine' Zotero fields, and monkey-patching around all of those got to be way too invasive (and thus
  # fragile)
  Zotero.ItemTreeView.prototype.getCellText = ((original) ->
    return (row, column) ->
      if column.id == 'zotero-items-column-extra' && Zotero.BetterBibTeX.pref.get('show-citekey')
        item = this._getItemAtRow(row)
        if !(item?.ref) || item.ref.isAttachment() || item.ref.isNote()
          return ''
        else
          key = Zotero.BetterBibTeX.keymanager.get({itemID: item.id})
          return '' if key.citekey.match(/^zotero-(null|[0-9]+)-[0-9]+$/)
          return key.citekey + (if key.citeKeyFormat then ' *' else '')

      return original.apply(this, arguments)
    )(Zotero.ItemTreeView.prototype.getCellText)

  @schomd.init()

  nids = []
  nids.push(Zotero.Notifier.registerObserver(@itemChanged, ['item']))
  nids.push(Zotero.Notifier.registerObserver(@itemAdded, ['collection-item']))
  window.addEventListener('unload', ((e) -> Zotero.Notifier.unregisterObserver(id) for id in nids), false)

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
    return unless event == 'add'

    # monitor items added to collection to find BibTeX AUX Scanner data. The scanner adds a dummy item whose 'extra'
    # field has instructions on what to do after import

    for collection_item in collection_items
      [collectionID, itemID] = collection_item.split('-')
      Zotero.BetterBibTeX.log('::: itemAdded', collectionID, itemID)

      collection = Zotero.Collections.get(collectionID)
      Zotero.BetterBibTeX.log('::: itemAdded collection = ', collection?.id)
      continue unless collection

      extra = Zotero.DB.valueQuery("#{Zotero.BetterBibTeX.findExtra} and i.itemID = ?", [itemID])
      Zotero.BetterBibTeX.log('::: itemAdded extra = ', extra)
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
        id = Zotero.DB.valueQuery('select itemID from betterbibtex.keys where citekey = ? and itemID in (select itemID from items where coalesce(libraryID, 0) = ?)', [citekey, collection.libraryID])
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

    return
}

Zotero.BetterBibTeX.itemChanged = notify: (event, type, ids, extraData) ->
  Zotero.BetterBibTeX.keymanager.reset()

  switch event
    when 'delete', 'trash'
      for id in (if event == 'delete' then extraData else ids) || []
        Zotero.BetterBibTeX.keymanager.remove({itemID: id})

    when 'add', 'modify'
      break if ids.length == 0

      for id in ids
        Zotero.BetterBibTeX.keymanager.remove({itemID: id})

      for item in Zotero.DB.query("#{Zotero.BetterBibTeX.findKeysSQL} and i.itemID in (#{('' + id for id in ids).join(',')})") or []
        citekey = Zotero.BetterBibTeX.keymanager.extract(item).__citekey__
        Zotero.BetterBibTeX.keymanager.set(item, citekey)
        Zotero.DB.query('delete from betterbibtex.cache where citekey = ?', [citekey])

      for id in ids
        Zotero.BetterBibTeX.keymanager.get({itemID: id}, 'on-change')

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
    continue unless value
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
  header = JSON.parse(Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator}on"))
  code = [
    # Zotero ships with a lobotomized version
    Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/translators/xregexp-all-min.js'),
    Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/translators/json5.js'),
    Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator}")
  ].join("\n")

  @translators[header.label.toLowerCase().replace(/[^a-z]/, '')] = header
  Zotero.Translators.save(header, code)
  return

Zotero.BetterBibTeX.getTranslator = (name) ->
  name = name.toLowerCase().replace(/[^a-z]/, '')
  translator = @translators[name]
  translator ?= @translators["better#{name}"]
  translator ?= @translators["zotero#{name}"]
  throw "No translator #{name}; available: #{Object.keys(@translators).join(', ')}" unless translator
  return translator.translatorID

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
