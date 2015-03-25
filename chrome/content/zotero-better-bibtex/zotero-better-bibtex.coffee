Components.utils.import('resource://gre/modules/Services.jsm')
Components.utils.import('resource://gre/modules/AddonManager.jsm')

require('Formatter.js')

Zotero.BetterBibTeX = {
  serializer: Components.classes['@mozilla.org/xmlextras/xmlserializer;1'].createInstance(Components.interfaces.nsIDOMSerializer)
  document: Components.classes['@mozilla.org/xul/xul-document;1'].getService(Components.interfaces.nsIDOMDocument)
}

Zotero.BetterBibTeX.inspect = (o) ->
  clone = Object.create(null)
  clone[k] = v for own k, v of o
  return clone

Zotero.BetterBibTeX.log = (msg...) ->
  return unless @logging
  msg = for m in msg
    switch
      when (typeof m) in ['string', 'number'] then '' + m
      when Array.isArray(m) then JSON.stringify(m)
      when m instanceof Error and m.name then "#{m.name}: #{m.message} \n(#{m.fileName}, #{m.lineNumber})\n#{m.stack}"
      when m instanceof Error then "#{e}\n#{e.stack}"
      when (typeof m) == 'object' then JSON.stringify(Zotero.BetterBibTeX.inspect(m)) # unpacks db query objects
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
    switch data
      when 'citeKeyFormat'
        Zotero.BetterBibTeX.keymanager.reset()
        # delete all dynamic keys that have a different citekeyformat (should be all)
        Zotero.DB.query('delete from betterbibtex.keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.pref.get('citeKeyFormat')])
        # delete all cache entries that do not correspond to items with pinned keys
        Zotero.DB.query('delete from betterbibtex.cache where not itemID in (select itemID from betterbibtex.keys where citeKeyFormat is null)')
      when 'auto-export'
        Zotero.BetterBibTeX.auto.process() unless Zotero.BetterBibTeX.pref.get('auto-export') == 'disabled'
    return
}

Zotero.BetterBibTeX.pref.ZoteroObserver = {
  register: -> Zotero.Prefs.prefBranch.addObserver('', this, false)
  unregister: -> Zotero.Prefs.prefBranch.removeObserver('', this)
  observe: (subject, topic, data) ->
    switch data
      when 'recursiveCollections'
        return if Zotero.BetterBibTeX.pref.get('auto-export') == 'disabled'
        recursive = Zotero.BetterBibTeX.auto.recursive()
        Zotero.DB.execute("update betterbibtex.autoexport set recursive = ?, status = 'pending' where recursive <> ?", [recursive, recursive])
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

Zotero.BetterBibTeX.idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
Zotero.BetterBibTeX.idleObserver = observe: (subject, topic, data) ->
  switch topic
    when 'idle'
      Zotero.BetterBibTeX.cache.reap()
      Zotero.BetterBibTeX.auto.idle = true
      Zotero.BetterBibTeX.auto.process('idle')

    when 'back'
      Zotero.BetterBibTeX.auto.idle = false
  return

Zotero.BetterBibTeX.uninstallObserver =
  observe: (subject, topic, data) ->
    if topic == 'quit-application-requested'
      @unregister()
      Zotero.BetterBibTeX.cache.reap()
    return
  register: ->
    observerService = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService)
    observerService.addObserver(@, 'quit-application-requested', false)
    return
  unregister: ->
    observerService = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService)
    observerService.removeObserver(@, 'quit-application-requested')
    return

Zotero.BetterBibTeX.version = (version) -> ("00000#{ver}".slice(-5) for ver in version.split('.')).join('.')

Zotero.BetterBibTeX.SQLColumns = (table) ->
  statement = Zotero.DB.getStatement("pragma betterbibtex.table_info(#{table})", null, true)

  # Get name column
  for i in [0...statement.columnCount]
    name = i if statement.getColumnName(i).toLowerCase() == 'name'

  columns = null
  while statement.executeStep()
    columns ?= {}
    columns[Zotero.DB._getTypedValue(statement, name)] = true
  statement.finalize()

  @log('schema', table, columns)

  return columns

Zotero.BetterBibTeX.updateSchema = ->
  Zotero.DB.query("create table if not exists betterbibtex.schema (lock primary key default 'schema' check (lock='schema'), version not null)")

  ### migrate '_version_' to 'schema' ###
  if @SQLColumns('_version_')
    Zotero.DB.query("insert or replace into betterbibtex.schema (lock, version) select 'schema', version from betterbibtex._version_ order by version desc limit 1")
    Zotero.DB.query('drop table betterbibtex._version_')

  ### initialize 'schema' ###
  Zotero.DB.query("insert or ignore into betterbibtex.schema (lock, version) values ('schema', '')")
  ### migrate from serial numbers to extension version ###
  Zotero.DB.query("update betterbibtex.schema set version = case version
    when 0 then '0.6.6'
    when 1 then '0.6.38'
    when 2 then '0.6.41'
    when 3 then '0.6.43'
    when 4 then '0.6.11'
    when 5 then '0.7.22'
    when 6 then '0.7.32'
    when 7 then '0.7.33'
    when 8 then '0.7.34'
    when 9 then '0.8.0'
    when 10 then '0.8.1'
    when 11 then '0.8.5'
    when 12 then '0.8.10'
    else version
    end")
  installed = @version(Zotero.DB.valueQuery("select version from betterbibtex.schema"))
  installing = @version(@release)
  Zotero.DB.query("insert or replace into betterbibtex.schema (lock, version) values ('schema', ?)", [@release])
  @log("schema: #{@release}")

  return if installed == installing

  if installed < @version('0.8.10')
    ### upgrade 'keys' table ###
    columns = @SQLColumns('keys')
    if columns?.pinned || columns?.libraryID
      Zotero.DB.query('alter table betterbibtex.keys rename to _keys_')
    if !columns || columns?.pinned || columns?.libraryID
      Zotero.DB.query('create table betterbibtex.keys (itemID primary key, citekey not null, citeKeyFormat)')
    switch
      when columns?.pinned
        Zotero.DB.query('insert into betterbibtex.keys (itemID, citekey, citeKeyFormat)
                         select itemID, citekey, case when pinned = 1 then null else ? end from betterbibtex._keys_', [@pref.get('citeKeyFormat')])
      when columns?.libraryID
        Zotero.DB.query('insert into betterbibtex.keys (itemID, citekey, citeKeyFormat)
                         select itemID, citekey, citeKeyFormat from betterbibtex._keys_')
    if columns?.pinned || columns?.libraryID
      Zotero.DB.query('drop table betterbibtex._keys_')

    ### drop 'keys2' table, upgrade leftovers ###
    Zotero.DB.query('drop table betterbibtex.keys2') if @SQLColumns('keys2')

    ### upgrade 'cache' table ###
    columns = @SQLColumns('cache')
    unless columns?.lastaccess
      if columns
        Zotero.DB.query('alter table betterbibtex.cache rename to _cache_')
      Zotero.DB.query("
        create table betterbibtex.cache (
          itemID not null,
          context not null,
          citekey not null,
          entry not null,
          lastaccess not null default CURRENT_TIMESTAMP,
          primary key (itemid, context))
        ")
      if columns && !columns.lastaccess
        Zotero.DB.query('insert into betterbibtex.cache (itemID, context, citekey, entry) select itemID, context, citekey, entry from betterbibtex._cache_')
        Zotero.DB.query('drop table betterbibtex._cache_')

    ### upgrade 'autoexport' table ###
    Zotero.DB.query("
      create table if not exists betterbibtex.autoexport (
        id integer primary key not null,
        collection_id not null,
        collection_name not null,
        path not null,
        context not null,
        recursive not null,
        status not null,
        unique (collection_id, path, context))
      ")

  ### schema 0.6.43, 0.7.33 & 0.8.10 had a scanning flaw, force rescan ###
  if installed < @version('0.8.10')
    @pref.set('scan-citekeys', true)

  # 0.8.11 changes BibLaTeX export, drop cache
  if installed < @version('0.8.11')
    Zotero.DB.query("delete from betterbibtex.cache")

  return

Zotero.BetterBibTeX.findKeysSQL = "select i.itemID as itemID, idv.value as extra
                  from items i
                  join itemData id on i.itemID = id.itemID
                  join itemDataValues idv on idv.valueID = id.valueID
                  join fields f on id.fieldID = f.fieldID
                  where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems)
                    and (idv.value like '%bibtex:%' or idv.value like '%biblatexcitekey[%' or idv.value like '%biblatexcitekey{%')"

Zotero.BetterBibTeX.findExtra = "select idv.value as extra
                  from items i
                  join itemData id on i.itemID = id.itemID
                  join itemDataValues idv on idv.valueID = id.valueID
                  join fields f on id.fieldID = f.fieldID
                  where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems)"

Zotero.BetterBibTeX.init = ->
  return if @initialized
  @initialized = true

  @log('initializing')

  @logging = Zotero.Debug.enabled
  Zotero.debug("BBT: logging = #{@logging}")
  @pref.set('logging', @logging)

  @translators = Object.create(null)
  @threadManager = Components.classes['@mozilla.org/thread-manager;1'].getService()
  @windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
  db = Zotero.getZoteroDatabase('betterbibtex')
  Zotero.DB.query('ATTACH ? AS betterbibtex', [db.path])

  @pref.prefs.clearUserPref('brace-all')

  AddonManager.getAddonByID('better-bibtex@iris-advies.com', (addon) -> Zotero.BetterBibTeX.release = addon.version)
  thread = @threadManager.currentThread
  while not @release
    thread.processNextEvent(true)
  @log("My extension's version is #{@release}")

  @updateSchema()

  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    __exposedProps__: {keymanager: 'r', cache: 'r'}
    keymanager: @keymanager.init()
    cache: @cache.init()
  }

  @keymanager.reset()
  Zotero.DB.query('delete from betterbibtex.keys where citeKeyFormat is not null and citeKeyFormat <> ?', [@pref.get('citeKeyFormat')])

  @pref.observer.register()
  @pref.ZoteroObserver.register()
  @uninstallObserver.register()

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
      patched.push(row.itemID)
      @log('scan:', row)
      @keymanager.set(row, @keymanager.extract({extra: row.extra}).__citekey__)
    if patched.length > 0
      for row in Zotero.DB.query("select * from betterbibtex.keys where citeKeyFormat is null and itemID not in #{@SQLSet(patched)}")
        @keymanager.remove(row)
    @pref.set('scan-citekeys', false)

  @loadTranslators()

  # monkey-patch Zotero.debug.setStore to notice logging changes
  Zotero.Debug.setStore = ((original) ->
    return (enable) ->
      Zotero.BetterBibTeX.logging = enable
      Zotero.BetterBibTeX.pref.set('logging', enable)
      return original.apply(this, arguments)
    )(Zotero.Debug.setStore)

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
              Zotero.Prefs.set('export.translatorSettings', JSON.stringify(settings))
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

  @log('initialized')
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

    # monitor items added to collection to find BibTeX AUX Scanner data. The scanner adds a dummy item whose 'extra'
    # field has instructions on what to do after import

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
      Zotero.Items.trash([itemID])

      missing = []
      for citekey in extra.citations
        Zotero.BetterBibTeX.log("::: citekey #{citekey}")
        id = Zotero.DB.valueQuery('select itemID from betterbibtex.keys where citekey = ? and itemID in (select itemID from items where coalesce(libraryID, 0) = ?)', [citekey, collection.libraryID || 0])
        if id
          Zotero.BetterBibTeX.log("::: citekey #{citekey} found")
          collection.addItem(id)
        else
          Zotero.BetterBibTeX.log("::: citekey #{citekey} missing")
          missing.push(citekey)

      if missing.length == 0
        Zotero.BetterBibTeX.log("::: all citekeys found")
      else
        report = new Zotero.BetterBibTeX.HTMLNode('http://www.w3.org/1999/xhtml', 'html')
        report.div(->
          @p(-> @b('BibTeX AUX scan'))
          @p('Missing references:')
          @ul(->
            for citekey in missing
              @li(citekey)
            return
          )
          return
        )
        item = new Zotero.Item('note')
        item.libraryID = collection.libraryID
        item.setNote(report.serialize())
        item.save()
        collection.addItem(item.id)

    unless collections.length == 0 || Zotero.BetterBibTeX.pref.get('auto-export') == 'disabled'
      Zotero.DB.query("update betterbibtex.autoexport set status = 'pending' where collection_id in #{Zotero.BetterBibTeX.SQLSet(collections)}")
      Zotero.BetterBibTeX.auto.process('collectionChanged')

    return
}

Zotero.BetterBibTeX.collectionChanged = notify: (event, type, ids, extraData) ->
  Zotero.DB.query("delete from betterbibtex.autoexport where collection_id in #{Zotero.BetterBibTeX.SQLSet(extraData)}") if event == 'delete' && extraData.length > 0
  return

Zotero.BetterBibTeX.SQLSet = (values) -> '(' + ('' + v for v in values).join(', ') + ')'

Zotero.BetterBibTeX.itemChanged = notify: (event, type, ids, extraData) ->
  return unless type == 'item' && event in ['delete', 'trash', 'add', 'modify']
  ids = extraData if event == 'delete'
  return unless ids.length > 0

  Zotero.BetterBibTeX.log('itemChanged', event, type, ids, extraData)

  Zotero.BetterBibTeX.keymanager.reset()
  Zotero.DB.query("delete from betterbibtex.cache where itemID in #{Zotero.BetterBibTeX.SQLSet(ids)}")

  # this is safe -- either a pinned key is restored below, or it needs to be regenerated anyhow after change
  for id in ids
    Zotero.BetterBibTeX.keymanager.remove({itemID: id})

  if event in ['add', 'modify']
    for item in Zotero.DB.query("#{Zotero.BetterBibTeX.findKeysSQL} and i.itemID in #{Zotero.BetterBibTeX.SQLSet(ids)}") or []
      citekey = Zotero.BetterBibTeX.keymanager.extract(item).__citekey__
      Zotero.BetterBibTeX.keymanager.set(item, citekey)
      Zotero.DB.query('delete from betterbibtex.cache where citekey = ?', [citekey])

    for id in ids
      Zotero.BetterBibTeX.keymanager.get({itemID: id}, 'on-change')

  collections = Zotero.Collections.getCollectionsContainingItems(ids, true)
  unless collections.length == 0 || Zotero.BetterBibTeX.pref.get('auto-export') == 'disabled'
    Zotero.DB.query("update betterbibtex.autoexport set status = 'pending' where collection_id in #{Zotero.BetterBibTeX.SQLSet(collections)}")
    Zotero.BetterBibTeX.auto.process('itemChanged')

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

  thread = @threadManager.currentThread
  while not status.finished
    thread.processNextEvent(true)

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

  delete header.displayOptions['Keep updated'] if header.displayOptions && Zotero.BetterBibTeX.pref.get('auto-export') == 'disabled'

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

class Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    if !@doc
      @doc = Zotero.BetterBibTeX.document.implementation.createDocument(@namespace, @root, null)
      @root = @doc.documentElement

  serialize: -> Zotero.BetterBibTeX.serializer.serializeToString(@doc)

  alias: (names) ->
    for name in names
      @Node::[name] = do (name) -> (v...) -> XmlNode::add.apply(@, [{"#{name}": v[0]}].concat(v.slice(1)))
    return

  set: (node, attrs...) ->
    for attr in attrs
      for own name, value of attr
        switch
          when typeof value == 'function'
            value.call(new @Node(@namespace, node, @doc))

          when name == ''
            node.appendChild(@doc.createTextNode('' + value))

          else
            node.setAttribute(name, '' + value)
    return

  add: (content...) ->
    if typeof content[0] == 'object'
      for own name, attrs of content[0]
        continue if name == ''
        node = @doc.createElementNS(@namespace, name)
        @root.appendChild(node)
        content = [attrs].concat(content.slice(1))
        break # there really should only be one pair here!
    node ?= @root

    content = (c for c in content when typeof c == 'number' || c)

    for attrs in content
      switch
        when typeof attrs == 'string'
          node.appendChild(@doc.createTextNode(attrs))

        when typeof attrs == 'function'
          attrs.call(new @Node(@namespace, node, @doc))

        when attrs.appendChild
          node.appendChild(attrs)

        else
          @set(node, attrs)

    return

class Zotero.BetterBibTeX.HTMLNode extends Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    super(@namespace, @root, @doc)

  Node: HTMLNode

  HTMLNode::alias(['b', 'p', 'div', 'ul', 'li'])

require('preferences.coffee')
require('keymanager.coffee')
require('web-endpoints.coffee')
require('schomd.coffee')
require('debug-bridge.coffee')
require('context.coffee', 'Zotero.BetterBibTeX')
require('cache.coffee')
