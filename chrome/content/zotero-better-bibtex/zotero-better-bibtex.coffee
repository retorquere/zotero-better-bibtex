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
  pane = Zotero.getActiveZoteroPane()
  data = {}
  switch details
    when 'collection'
      collectionsView = pane?.collectionsView
      itemGroup = collectionsView?._getItemAtRow(collectionsView.selection?.currentIndex)
      switch itemGroup?.type
        when 'collection'
          data = { data: true, collection: collectionsView.getSelectedCollection() }
        when 'library'
          data = { data: true }
        when 'group'
          data = { data: true, collection: Zotero.Groups.get(collectionsView.getSelectedLibraryID()) }

    when 'items'
      data = { data: true, items: pane?.getSelectedItems() }

  io = {wrappedJSObject: data}
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
      when 'citekeyFormat'
        Zotero.BetterBibTeX.keymanager.reset()
        # delete all dynamic keys that have a different citekeyformat (should be all)
        Zotero.DB.query('delete from betterbibtex.keys where citekeyFormat is not null and citekeyFormat <> ?', [Zotero.BetterBibTeX.pref.get('citekeyFormat')])

    # if any var changes, drop the cache and kick off all exports
    Zotero.DB.query('delete from betterbibtexcache.cache')
    Zotero.DB.query("update betterbibtex.autoexport set status='pending'")
    Zotero.BetterBibTeX.auto.process()
    return
}

Zotero.BetterBibTeX.pref.ZoteroObserver = {
  register: -> Zotero.Prefs.prefBranch.addObserver('', this, false)
  unregister: -> Zotero.Prefs.prefBranch.removeObserver('', this)
  observe: (subject, topic, data) ->
    switch data
      when 'recursiveCollections'
        recursive = "#{!!Zotero.BetterBibTeX.auto.recursive()}"
        # libraries are always recursive
        Zotero.DB.execute("update betterbibtex.autoexport set exportedRecursively = ?, status = 'pending' where exportedRecursively <> ? and collection <> 'library'", [recursive, recursive])
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
  @formatters ||= Object.create(null)
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

Zotero.BetterBibTeX.quitObserver =
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

Zotero.BetterBibTeX.foreign_keys = (enabled) ->
  statement = Zotero.DB.getStatement("PRAGMA foreign_keys = #{if enabled then 'ON' else 'OFF'}", null, true)
  statement.executeStep()
  statement.finalize()
  return

Zotero.BetterBibTeX.SQLColumns = (table) ->
  schema = if table == 'cache' then 'cache' else ''
  statement = Zotero.DB.getStatement("pragma betterbibtex#{schema}.table_info(#{table})", null, true)

  # Get name column
  for i in [0...statement.columnCount]
    name = i if statement.getColumnName(i).toLowerCase() == 'name'

  columns = null
  while statement.executeStep()
    columns ||= {}
    columns[Zotero.DB._getTypedValue(statement, name)] = true
  statement.finalize()

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

  return if installed == installing && !(['cache', 'keys', 'autoexport', 'exportoptions'].some((table) => !@SQLColumns(table)))

  @flash('Better BibTeX: updating database', 'Updating database, this could take a while')

  @pref.set('scanCitekeys', true)
  for key in @pref.prefs.getChildList('')
    switch key
      when 'auto-abbrev.style' then @pref.set('autoAbbrevStyle', @pref.get(key))
      when 'auto-abbrev' then @pref.set('autoAbbrev', @pref.get(key))
      when 'auto-export' then @pref.set('autoExport', @pref.get(key))
      when 'citeKeyFormat' then @pref.set('citekeyFormat', @pref.get(key))
      when 'doi-and-url' then @pref.set('DOIandURL', @pref.get(key))
      when 'key-conflict-policy' then @pref.set('keyConflictPolicy', @pref.get(key))
      when 'langid' then @pref.set('langID', @pref.get(key))
      when 'pin-citekeys' then @pref.set('pinCitekeys', @pref.get(key))
      when 'raw-imports' then @pref.set('rawImports', @pref.get(key))
      when 'show-citekey' then @pref.set('showCitekeys', @pref.get(key))
      when 'skipfields' then @pref.set('skipFields', @pref.get(key))
      when 'useprefix' then @pref.set('usePrefix', @pref.get(key))
      when 'unicode'
        @pref.set('asciiBibTeX', (@pref.get(key) != 'always'))
        @pref.set('asciiBibLaTeX', (@pref.get(key) == 'never'))
      else continue
    @pref.prefs.clearUserPref(key)

  #@foreign_keys(false)

  columns = Object.create(null)
  for table in ['keys', 'autoexport', 'exportoptions']
    columns[table] = @SQLColumns(table)
    Zotero.DB.query("drop table if exists betterbibtex._#{table}_")
    Zotero.DB.query("alter table betterbibtex.#{table} rename to _#{table}_") if columns[table]
  Zotero.DB.query('drop table if exists betterbibtex.keys2')
  Zotero.DB.query('drop table if exists betterbibtex.cache')
  Zotero.DB.query('drop table if exists betterbibtexcache.cache')

  ### clean slate ###
  Zotero.DB.query('create table betterbibtex.keys (itemID primary key, citekey not null, citekeyFormat)')
  Zotero.DB.query("
    create table betterbibtex.exportoptions (
      id INTEGER PRIMARY KEY NOT NULL DEFAULT NULL,

      translatorID not null,
      exportCharset not null,
      exportNotes CHECK(exportNotes in ('true', 'false')),
      preserveBibTeXVariables CHECK(preserveBibTeXVariables in ('true', 'false')),
      useJournalAbbreviation CHECK(useJournalAbbreviation in ('true', 'false')),

      unique (translatorID, exportCharset, exportNotes, preserveBibTeXVariables, useJournalAbbreviation)
      )
    ")
  Zotero.DB.query("
    create table betterbibtexcache.cache (
      itemID not null,
      exportoptions not null,
      citekey not null,
      entry not null,
      lastaccess not null default CURRENT_TIMESTAMP,
      primary key (itemid, exportoptions)
      )
    ")
  Zotero.DB.query("
    create table betterbibtex.autoexport (
      id INTEGER PRIMARY KEY NOT NULL DEFAULT NULL,
      collection not null,
      path not null,
      exportOptions not null,
      exportedRecursively CHECK(exportedRecursively in ('true', 'false')),
      status CHECK(status in ('pending', 'error', 'done'))
      )
    ")
  # foreign key (exportOptions) references exportoptions(id)

  ### migrate data where needed ###

  if columns.keys
    if columns.keys.pinned
      Zotero.DB.query('insert into betterbibtex.keys (itemID, citekey, citekeyFormat)
                      select itemID, citekey, case when pinned = 1 then null else ? end from betterbibtex._keys_', [@pref.get('citekeyFormat')])
    else
      Zotero.DB.query('insert into betterbibtex.keys (itemID, citekey, citekeyFormat)
                      select itemID, citekey, citekeyFormat from betterbibtex._keys_')

  ### cleanup ###

  for table in ['exportoptions', 'autoexport', 'keys']
    Zotero.DB.query("drop table betterbibtex._#{table}_") if columns[table]

  #@foreign_keys(true)

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

  @logging = Zotero.Debug.enabled
  @pref.set('logging', @logging)

  @translators = Object.create(null)
  @threadManager = Components.classes['@mozilla.org/thread-manager;1'].getService()
  @windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
  db = Zotero.getZoteroDatabase('betterbibtex')
  Zotero.DB.query('ATTACH ? AS betterbibtex', [db.path])
  db = Zotero.getZoteroDatabase('betterbibtexcache')
  Zotero.DB.query('ATTACH ? AS betterbibtexcache', [db.path])
  for pragma in [ 'betterbibtexcache.auto_vacuum = NONE', 'betterbibtexcache.journal_mode = OFF', 'betterbibtexcache.synchronous = OFF' ]
    statement = Zotero.DB.getStatement("PRAGMA #{pragma}", null, true)
    statement.executeStep()
    statement.finalize()
  try # corruption detection is prudent after the above pragmas
    Zotero.DB.query('select * from betterbibtexcache')
  catch
    Zotero.DB.query('drop table if exists betterbibtexcache.cache')

  @pref.prefs.clearUserPref('brace-all')

  AddonManager.getAddonByID('better-bibtex@iris-advies.com', (addon) -> Zotero.BetterBibTeX.release = addon.version)
  thread = @threadManager.currentThread
  while not @release
    thread.processNextEvent(true)

  @updateSchema()

  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    __exposedProps__: {keymanager: 'r', cache: 'r'}
    keymanager: @keymanager.init()
    cache: @cache.init()
  }

  @keymanager.reset()
  Zotero.DB.query('delete from betterbibtex.keys where citekeyFormat is not null and citekeyFormat <> ?', [@pref.get('citekeyFormat')])

  @pref.observer.register()
  @pref.ZoteroObserver.register()
  @quitObserver.register()

  for own name, endpoint of @endpoints
    url = "/better-bibtex/#{name}"
    ep = Zotero.Server.Endpoints[url] = ->
    ep.prototype = endpoint

  # clean up keys for items that have gone missing
  Zotero.DB.query('delete from betterbibtex.keys where not itemID in (select itemID from items)')

  if @pref.get('scanCitekeys')
    @flash('Citation key rescan', "Scanning 'extra' fields for fixed keys\nFor a large library, this might take a while")
    patched = []
    for row in Zotero.DB.query(@findKeysSQL) or []
      patched.push(row.itemID)
      @keymanager.set(row, @keymanager.extract({extra: row.extra}).__citekey__)
    if patched.length > 0
      for row in Zotero.DB.query("select * from betterbibtex.keys where citekeyFormat is null and itemID not in #{@SQLSet(patched)}")
        @keymanager.remove(row)
    @pref.set('scanCitekeys', false)

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
      if column.id == 'zotero-items-column-extra' && Zotero.BetterBibTeX.pref.get('showCitekeys')
        item = this._getItemAtRow(row)
        if !(item?.ref) || item.ref.isAttachment() || item.ref.isNote()
          return ''
        else
          key = Zotero.BetterBibTeX.keymanager.get({itemID: item.id})
          return '' if key.citekey.match(/^zotero-(null|[0-9]+)-[0-9]+$/)
          return key.citekey + (if key.citekeyFormat then ' *' else '')

      return original.apply(this, arguments)
    )(Zotero.ItemTreeView.prototype.getCellText)

  # monkey-patch translate to capture export path and auto-export
  Zotero.Translate.Export.prototype.translate = ((original) ->
    return ->
      # requested translator
      translatorID = @translator?[0]
      translatorID = translatorID.translatorID if translatorID.translatorID
      return original.apply(this, arguments) unless translatorID

      # detect BBT
      for own name, bbt of Zotero.BetterBibTeX.translators
        break if bbt.translatorID == translatorID
        bbt = null

      # convert group into its library items
      if @_collection?.objectType == 'group'
        @_group = @_collection
        delete @_collection
        @_items = Zotero.DB.columnQuery('select itemID from items where libraryID in (select libraryID from groups where groupID = ?) and not itemID in (select itemID from deletedItems)', [@_group.id])
        @_items = Zotero.Items.get(@_items) unless @_items.length == 0

      # regular behavior for non-BBT translators
      return original.apply(this, arguments) unless bbt

      # export path for relative exports
      @_displayOptions.exportPath = @location.path.slice(0, -@location.leafName.length) if @location && typeof @location == 'object'

      # If no capture, we're done
      return original.apply(this, arguments) unless @_displayOptions?['Keep updated']

      # I don't want 'Keep updated' to be remembered as a default
      try
        settings = JSON.parse(Zotero.Prefs.get('export.translatorSettings'))
        if settings['Keep updated']
          delete settings['Keep updated']
          Zotero.Prefs.set('export.translatorSettings', JSON.stringify(settings))
      catch

      progressWin = new Zotero.ProgressWindow()
      progressWin.changeHeadline('Auto-export')

      switch
        when @_group # group export, already converted to its corresponding items above
          progressWin.addLines(["Group #{group.name} set up for auto-export"])
          collection = "group:#{@_group.id}"

        when @_collection?.id
          progressWin.addLines(["Collection #{@_collection.name} set up for auto-export"])
          collection = @_collection.id

        when !@_items
          progressWin.addLines(['Auto-export of full library'])
          collection = 'library'

        else
          progressWin.addLines(['Auto-export only supported for groups, collections and libraries'])
          collection = null

      progressWin.show()
      progressWin.startCloseTimer()

      if collection
        @_displayOptions.translatorID = translatorID
        Zotero.BetterBibTeX.auto.add(collection, @location.path, @_displayOptions)

      return original.apply(this, arguments)
    )(Zotero.Translate.Export.prototype.translate)

  # monkey-patch _prepareTranslation to add collections for group export
  Zotero.Translate.Export.prototype._prepareTranslation = ((original) ->
    return ->
      r = original.apply(this, arguments)
      @_itemGetter._collectionsLeft = @_group.getCollections() if @_group && @_translatorInfo?.configOptions?.getCollections
      return r
    )(Zotero.Translate.Export.prototype._prepareTranslation)

  # monkey-patch buildCollectionContextMenu to add group library export
  zoteroPane = Zotero.getActiveZoteroPane()
  zoteroPane.buildCollectionContextMenu = ((original) ->
    return ->
      itemGroup = @collectionsView._getItemAtRow(@collectionsView.selection.currentIndex)

      menuItem = @document.getElementById('zotero-better-bibtex-export-group')
      menuItem.setAttribute('disabled', false)
      menuItem.setAttribute('hidden', !itemGroup.isGroup())

      for id in ['zotero-better-bibtex-show-export-url', 'zotero-better-bibtex-report-errors']
        menuItem = @document.getElementById(id)
        menuItem.setAttribute('disabled', false)
        menuItem.setAttribute('hidden', !(itemGroup.isLibrary(true) || itemGroup.isCollection()))

      menuItem = @document.getElementById('zotero-better-bibtex-collectionmenu-separator')
      menuItem.setAttribute('hidden', !(itemGroup.isLibrary(true) || itemGroup.isCollection()))

      return original.apply(this, arguments)
    )(zoteroPane.buildCollectionContextMenu)

  @schomd.init()

  nids = []
  nids.push(Zotero.Notifier.registerObserver(@itemChanged, ['item']))
  nids.push(Zotero.Notifier.registerObserver(@collectionChanged, ['collection']))
  nids.push(Zotero.Notifier.registerObserver(@itemAdded, ['collection-item']))
  window.addEventListener('unload', ((e) -> Zotero.Notifier.unregisterObserver(id) for id in nids), false)

  @idleService.addIdleObserver(@idleObserver, @pref.get('autoExportIdleWait'))

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
  @load('Better BibTeX.js')
  @load('Better BibLaTeX.js')
  @load('LaTeX Citation.js')
  @load('Pandoc Citation.js')
  @load('Zotero TestCase.js')
  @load('BibTeXAuxScanner.js')
  Zotero.Translators.init()
  return

Zotero.BetterBibTeX.removeTranslators = ->
  for own name, header of @translators
    @removeTranslator(header)
  @translators = Object.create(null)
  Zotero.Translators.init()
  return

Zotero.BetterBibTeX.removeTranslator = (header) ->
  try
    fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
    destFile = Zotero.getTranslatorsDirectory()
    destFile.append(fileName)
    destFile.remove(false)
  catch err
    @log("failed to remove #{header.label}:", err)
  return

Zotero.BetterBibTeX.itemAdded = {
  notify: (event, type, collection_items) ->
    collections = []
    items = []

    # monitor items added to collection to find BibTeX AUX Scanner data. The scanner adds a dummy item whose 'extra'
    # field has instructions on what to do after import

    return if collection_items.length == 0

    for collection_item in collection_items
      [collectionID, itemID] = collection_item.split('-')
      collections.push(collectionID)
      items.push(itemID)

      # aux-scanner only triggers on add
      continue unless event == 'add'
      collection = Zotero.Collections.get(collectionID)
      continue unless collection

      extra = Zotero.DB.valueQuery("#{Zotero.BetterBibTeX.findExtra} and i.itemID = ?", [itemID])
      continue unless extra

      try
        extra = JSON.parse(extra)
      catch error
        continue

      note = null
      switch extra.translator
        when 'ca65189f-8815-4afe-8c8b-8c7c15f0edca' # Better BibTeX
          if extra.notimported && extra.notimported.length > 0
            report = new Zotero.BetterBibTeX.HTMLNode('http://www.w3.org/1999/xhtml', 'html')
            report.div(->
              @p(-> @b('Better BibTeX could not import'))
              @pre(extra.notimported)
              return
            )
            note = report.serialize()

        when '0af8f14d-9af7-43d9-a016-3c5df3426c98' # BibTeX AUX Scanner

          missing = []
          for citekey in extra.citations
            id = Zotero.DB.valueQuery('select itemID from betterbibtex.keys where citekey = ? and itemID in (select itemID from items where coalesce(libraryID, 0) = ?)', [citekey, collection.libraryID || 0])
            if id
              collection.addItem(id)
            else
              missing.push(citekey)

          if missing.length != 0
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
            note = report.serialize()

      if note
        Zotero.Items.trash([itemID])
        item = new Zotero.Item('note')
        item.libraryID = collection.libraryID
        item.setNote(note)
        item.save()
        collection.addItem(item.id)

    collections = Zotero.BetterBibTeX.withParentCollections(collections) if collections.length != 0
    for groupID in Zotero.DB.columnQuery("select distinct g.groupID from items i left join groups g on i.libraryID = g.libraryID where itemID in #{Zotero.BetterBibTeX.SQLSet(items)}")
      if groupID
        collections.push("'group:#{groupID}'")
      else
        collections.push("'library'")
    if collections.length > 0
      Zotero.DB.query("update betterbibtex.autoexport set status = 'pending' where collection in #{Zotero.BetterBibTeX.SQLSet(collections)}")
    Zotero.BetterBibTeX.auto.process('collectionChanged')
    return
}

Zotero.BetterBibTeX.collectionChanged = notify: (event, type, ids, extraData) ->
  Zotero.DB.query("delete from betterbibtex.autoexport where collection in #{Zotero.BetterBibTeX.SQLSet(extraData)}") if event == 'delete' && extraData.length > 0
  return

Zotero.BetterBibTeX.SQLSet = (values) -> '(' + ('' + v for v in values).join(', ') + ')'

Zotero.BetterBibTeX.itemChanged = notify: (event, type, ids, extraData) ->
  return unless type == 'item' && event in ['delete', 'trash', 'add', 'modify']
  ids = extraData if event == 'delete'
  return unless ids.length > 0

  Zotero.BetterBibTeX.keymanager.reset()
  Zotero.DB.query("delete from betterbibtexcache.cache where itemID in #{Zotero.BetterBibTeX.SQLSet(ids)}")

  # this is safe -- either a pinned key is restored below, or it needs to be regenerated anyhow after change
  for id in ids
    Zotero.BetterBibTeX.keymanager.remove({itemID: id})

  if event in ['add', 'modify']
    for item in Zotero.DB.query("#{Zotero.BetterBibTeX.findKeysSQL} and i.itemID in #{Zotero.BetterBibTeX.SQLSet(ids)}") or []
      citekey = Zotero.BetterBibTeX.keymanager.extract(item).__citekey__
      Zotero.BetterBibTeX.keymanager.set(item, citekey)
      Zotero.DB.query('delete from betterbibtexcache.cache where citekey = ?', [citekey])

    for id in ids
      Zotero.BetterBibTeX.keymanager.get({itemID: id}, 'on-change')

  collections = Zotero.Collections.getCollectionsContainingItems(ids, true) || []
  collections = Zotero.BetterBibTeX.withParentCollections(collections) unless collections.length == 0
  for groupID in Zotero.DB.columnQuery("select distinct g.groupID from items i left join groups g on i.libraryID = g.libraryID where itemID in #{Zotero.BetterBibTeX.SQLSet(ids)}")
    if groupID
      collections.push("'group:#{groupID}'")
    else
      collections.push("'library'")
  if collections.length > 0
    Zotero.DB.query("update betterbibtex.autoexport set status = 'pending' where collection in #{Zotero.BetterBibTeX.SQLSet(collections)}")
  Zotero.BetterBibTeX.auto.process('itemChanged')

  return

Zotero.BetterBibTeX.withParentCollections = (collections) ->
  return collections unless Zotero.BetterBibTeX.auto.recursive()
  return collections if collections.length == 0

  return Zotero.DB.columnQuery("
    with recursive recursivecollections as (
      select collectionID, parentCollectionID
      from collections
      where collectionID in #{Zotero.BetterBibTeX.SQLSet(collections)}

      union all

      select p.collectionID, p.parentCollectionID
      from collections p
      join recursivecollections as c on c.parentCollectionID = p.collectionID
    ) select distinct collectionID from recursivecollections")

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

Zotero.BetterBibTeX.load = (translator) ->
  try
    header = JSON.parse(Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator}on"))
    @removeTranslator(header)
    code = [
      # Zotero ships with a lobotomized version
      Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/translators/xregexp-all-min.js'),
      Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/translators/json5.js'),
      Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator}")
    ].join("\n")

    @translators[header.label.toLowerCase().replace(/[^a-z]/, '')] = header
    Zotero.Translators.save(header, code)

    #filename = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
    #file = Zotero.getTranslatorsDirectory()
    #file.append(filename)
    #Zotero.File.putContents(file, JSON.stringify(header) + "\n\n" + code)
  catch err
    @log("Loading #{translator} failed", err)
  return

Zotero.BetterBibTeX.getTranslator = (name) ->
  name = name.toLowerCase().replace(/[^a-z]/, '')
  translator = @translators[name]
  translator ||= @translators["better#{name}"]
  translator ||= @translators["zotero#{name}"]
  throw "No translator #{name}; available: #{Object.keys(@translators).join(', ')}" unless translator
  return translator.translatorID

Zotero.BetterBibTeX.translatorName = (id) ->
  for own name, tr of @translators
    return tr.label if tr.translatorID == id
  return "#{id}"

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

Zotero.BetterBibTeX.exportGroup = ->
  zoteroPane = Zotero.getActiveZoteroPane()
  itemGroup = zoteroPane.collectionsView._getItemAtRow(zoteroPane.collectionsView.selection.currentIndex)
  return unless itemGroup.isGroup()

  exporter = new Zotero_File_Exporter()
  exporter.collection = Zotero.Groups.get(itemGroup.ref.id)
  exporter.name = exporter.collection.name
  exporter.save()
  return

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
    node ||= @root

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

  HTMLNode::alias(['pre', 'b', 'p', 'div', 'ul', 'li'])

require('preferences.coffee')
require('keymanager.coffee')
require('web-endpoints.coffee')
require('schomd.coffee')
require('debug-bridge.coffee')
require('cache.coffee')
