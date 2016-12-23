Components.utils.import('resource://gre/modules/Services.jsm')
Components.utils.import('resource://gre/modules/AddonManager.jsm')
Components.utils.import("resource://services-common/async.js")

Components.utils.import('resource://zotero/config.js') unless ZOTERO_CONFIG?

Zotero.BetterBibTeX = new class
  disabled: "BBT load failed"

  constructor: ->
    @debug = @debug_on
    @log = @log_on

    # because bugger async
    @activeAddons = {}
    callback = Async.makeSyncCallback()
    AddonManager.getAllAddons(callback)
    addons = Async.waitForSyncCallback(callback)
    for addon in addons
      Zotero.debug("Addon: #{addon.id} (#{addon.isActive}): #{addon.name} @ #{addon.version}")
      continue if addon.appDisabled || addon.userDisabled # unless addon.isActive
      @activeAddons[addon.id] = addon.version
    # fallback for ZSA
    for guid in ['zotero@chnm.gmu.edu', 'juris-m@juris-m.github.io']
      @activeAddons[guid] ||= ZOTERO_CONFIG.VERSION if ZOTERO_CONFIG.GUID == guid

    @release = @activeAddons['better-bibtex@iris-advies.com']

    @flash('Better BibTeX has been disabled', @disabled) if @disabled = @versionConflict()

  serializer: Components.classes['@mozilla.org/xmlextras/xmlserializer;1'].createInstance(Components.interfaces.nsIDOMSerializer)
  document: Components.classes['@mozilla.org/xul/xul-document;1'].getService(Components.interfaces.nsIDOMDocument)

  # because bugger this async crap
  demand: (promise) ->
    callback = Async.makeSyncCallback()
    promise.then(
      (value) -> callback(value),
      (reason) -> callback.throw(reason)
    )
    return Async.waitForSyncCallback(callback)

  versionConflict: ->
    if (version = @activeAddons['zotfile@columbia.edu']) && Services.vc.compare(version, '4.2.6') < 0
      return """
        Better BibTeX has been disabled because it has detected conflicting extension "ZotFile" #{version}.
        After upgrading to ZotFile to 4.2.6, Better BibTeX will start up as usual.
      """

    if (version = @activeAddons['zoteromaps@zotero.org']) && Services.vc.compare(version, '1.0.10.1') < 0
      return """
        Better BibTeX has been disabled because it has detected conflicting extension "zotero-maps" #{version}. Versions
        up to and including 1.0.10 interfere with Better BibTeX; unfortunately this plugin appears to be abandoned, and
        their issue tracker at

        https://github.com/zotero/zotero-maps

        is not enabled.
      """

    if (version = @activeAddons['zutilo@www.wesailatdawn.com']) && Services.vc.compare(version, '1.2.10.1') <= 0
      return """
        Better BibTeX has been disabled because it has detected conflicting extension "zutilo" #{version}. Zutilo
        versions 1.2.10.1 and earlier interfere with Better BibTeX; If have proposed a fix at

        https://github.com/willsALMANJ/Zutilo/issues/42

        Once that has been implemented, Better BibTeX will start up as usual. In the meantime, beta7 from

        https://addons.mozilla.org/en-US/firefox/addon/zutilo-utility-for-zotero/versions/

        should work; alternately, you can uninstall Zutilo.
      """

    if (version = @activeAddons['{359f0058-a6ca-443e-8dd8-09868141bebc}']) && Services.vc.compare(version, '1.2.3') <= 0
      return """
        Better BibTeX has been disabled because it has detected conflicting extension "recoll-firefox" #{version}.
        Recoll-firefox 1.2.3 and earlier interfere with Better BibTeX; if have proposed a fix for recall-firefox at

        https://sourceforge.net/p/recollfirefox/discussion/general/thread/a31d3c89/

        Once that has been implemented, Better BibTeX will start up as usual.  Alternately, you can uninstall Recoll Firefox.

        In the meantime, unfortunately, Better BibTeX and recoll-firefox cannot co-exist.
      """

    switch
      when version = @activeAddons['zotero@chnm.gmu.edu']
        switch
          when Services.vc.compare(version.replace(/(\.SOURCE|beta[0-9]+)$/, ''), '4.0.28') < 0
            return "Better BibTeX has been disabled because it found Zotero #{version}, but requires 4.0.28 or later."

          when Services.vc.compare(version.replace(/(\.SOURCE|beta[0-9]+)$/, ''), '5.0.0') >= 0
            return "Zotero #{version} found. Better BibTeX has been disabled because is not compatible with Zotero version 5.0 or later."

          when version.match(/(\.SOURCE|beta[0-9]+)$/)
            @flash(
              "You are on a custom/beta Zotero build (#{version}). " +
              'Feel free to submit error reports for Better BibTeX when things go wrong, I will do my best to address them, but the target will always be the latest official version of Zotero'
            )

      when version = @activeAddons['juris-m@juris-m.github.io']?.replace('m', '.')
        switch
          when Services.vc.compare(version.replace(/(\.SOURCE|beta[0-9]+)$/, ''), '4.0.29.12.95') == 0
            return null

          when Services.vc.compare(version.replace(/(\.SOURCE|beta[0-9]+)$/, ''), '4.0.29.12.98') < 0
            return "Juris-M #{@activeAddons['juris-m@juris-m.github.io']} found. Better BibTeX has been disabled because is not compatible with Juris-M version 4.0.29.12m98 or earlier."

          when Services.vc.compare(version.replace(/(\.SOURCE|beta[0-9]+)$/, ''), '5.0.0') >= 0
            return "Juris-M #{version} found. Better BibTeX has been disabled because is not compatible with Juris-M version 5.0 or later."

          when version.match(/(\.SOURCE|beta[0-9]+)$/)
            @flash(
              "You are on a custom Juris-M build (#{version}). " +
              'Feel free to submit error reports for Better BibTeX when things go wrong, I will do my best to address them, but the target will always be the latest official version of Juris-M'
            )

      else
        @flash('Neither Zotero nor Juris-M seem to be installed.')

    if Zotero.isConnector
      return """
        You are running Zotero in connector mode (running Zotero Firefox and Zotero Standalone simultaneously.
        This is not supported by Better BibTeX; see https://github.com/retorquere/zotero-better-bibtex/issues/143
      """

    return null

  _log: (level, msg...) ->
    str = []
    for m in msg
      switch
        when m instanceof Error
          str.push("<Exception: #{m.message || m.name}#{if m.stack then '\n' + m.stack else ''}>")
        when !m || (typeof m in ['number', 'string', 'boolean'])
          str.push('' + m)
        when @varDump
          str.push(@varDump(m).replace(/\n/g, ''))
        else
          str.push('' + m)

    str = "[better-bibtex @ #{new Date()}] #{str.join(' ')}"

    if level == 0
      Zotero.logError(str)
    else
      Zotero.debug(str, level)
    console.log(str)

  flash: (title, body, timeout = 8) ->
    try
      @debug('flash:', title, body)
      pw = new Zotero.ProgressWindow()
      pw.changeHeadline('Better BibTeX: ' + title)
      body ||= title
      body = body.join("\n") if Array.isArray(body)
      pw.addDescription(body)
      pw.show()
      pw.startCloseTimer(timeout * 1000)
    catch err
      @error('@flash failed:', {title, body}, err)

  error: (msg...) -> @_log.apply(@, [0].concat(msg))
  warn: (msg...) -> @_log.apply(@, [1].concat(msg))

  debug_on: (msg...) -> @_log.apply(@, [5].concat(msg))
  debug_off: ->

  log_on: (msg...) -> @_log.apply(@, [3].concat(msg))
  log_off: ->

Zotero.BetterBibTeX.addCacheHistory = ->
  Zotero.BetterBibTeX.cacheHistory ||= []
  Zotero.BetterBibTeX.cacheHistory.push({
    timestamp: new Date()
    serialized:
      hit: Zotero.BetterBibTeX.serialized.stats.hit
      miss: Zotero.BetterBibTeX.serialized.stats.miss
      clear: Zotero.BetterBibTeX.serialized.stats.clear
    cache:
      hit: Zotero.BetterBibTeX.cache.stats.hit
      miss: Zotero.BetterBibTeX.cache.stats.miss
      clear: Zotero.BetterBibTeX.cache.stats.clear
  })

Zotero.BetterBibTeX.debugMode = (silent) ->
  if @Pref.get('debug')
    Zotero.Debug.setStore(true)
    Zotero.Prefs.set('debug.store', true)
    @debug = @debug_on
    @log = @log_on
    @flash('Debug mode active', 'Debug mode is active. This will affect performance.') unless silent

    clearInterval(Zotero.BetterBibTeX.debugInterval) if Zotero.BetterBibTeX.debugInterval
    try
      Zotero.BetterBibTeX.debugInterval = setInterval(->
        Zotero.BetterBibTeX.addCacheHistory()
      , 10000)
    catch
      delete Zotero.BetterBibTeX.debugInterval
  else
    clearInterval(Zotero.BetterBibTeX.debugInterval) if Zotero.BetterBibTeX.debugInterval
    delete Zotero.BetterBibTeX.debugInterval
    delete Zotero.BetterBibTeX.cacheHistory
    @debug = @debug_off
    @log = @log_off

Zotero.BetterBibTeX.reportErrors = (includeReferences) ->
  items = null

  pane = Zotero.getActiveZoteroPane()

  switch includeReferences
    when 'collection'
      collectionsView = pane?.collectionsView
      itemGroup = collectionsView?._getItemAtRow(collectionsView.selection?.currentIndex)
      switch itemGroup?.type
        when 'collection'
          items = {collection: collectionsView.getSelectedCollection() }
        when 'library'
          items = { }
        when 'group'
          items = { collection: Zotero.Groups.get(collectionsView.getSelectedLibraryID()) }

    when 'items'
      items = { items: pane.getSelectedItems() }

  items = null if items && items.items && items.items.length == 0

  params = {wrappedJSObject: {}}

  if items
    getReferences = @Translators.translate(@Translators.BetterBibTeXJSON.translatorID, items, { exportNotes: true, exportFileData: false }).then((references) ->
      params.wrappedJSObject.references = references.trim()
    )
  else
    getReferences = Promise.resolve()

  getReferences.then(->
    ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    ww.openWindow(null, 'chrome://zotero-better-bibtex/content/xul/errorReport.xul', 'zotero-error-report', 'chrome,centerscreen,modal', params)
  )

Zotero.BetterBibTeX.idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
Zotero.BetterBibTeX.idleObserver = observe: (subject, topic, data) ->
  Zotero.BetterBibTeX.debug("idle: #{topic}")
  switch topic
    when 'idle'
      Zotero.BetterBibTeX.auto.idle = true
      Zotero.BetterBibTeX.auto.schedule('idle')

    when 'back', 'active'
      Zotero.BetterBibTeX.auto.idle = false

Zotero.BetterBibTeX.init = ->
  return if @initialized || @disabled

  @testing = (@Pref.get('tests') != '')

  try
    Zotero.BetterBibTeX.PatternFormatter::skipWords = @Pref.get('skipWords').split(',')
    Zotero.BetterBibTeX.debug('skipwords:', Zotero.BetterBibTeX.PatternFormatter::skipWords)
  catch err
    Zotero.BetterBibTeX.error('could not read skipwords:', err)
    Zotero.BetterBibTeX.PatternFormatter::skipWords = []
  @keymanager.setFormatter(true)

  @debugMode()

  @threadManager = Components.classes['@mozilla.org/thread-manager;1'].getService()
  @windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)

  if @Pref.get('scanCitekeys') || Zotero.BetterBibTeX.DB.upgradeNeeded
    reason = if @Pref.get('scanCitekeys') then 'requested by user' else 'after upgrade'
    @flash("Citation key rescan #{reason}", "Scanning 'extra' fields for fixed keys\nFor a large library, this might take a while")
    changed = @keymanager.scan() # TODO: .concat(Zotero.BetterBibTeX.keymanager.clearDynamic()) temporarily disable this until I figure out what to do between #538 and #545
    for itemID in changed
      @cache.remove({itemID})
    @DB.purge()
    setTimeout((-> Zotero.BetterBibTeX.auto.markIDs(changed, 'scanCiteKeys')), 5000) if !Zotero.BetterBibTeX.DB.cacheReset && changed.length != 0
    @flash("Citation key rescan finished")

  if Zotero.BetterBibTeX.DB.cacheReset
    for ae in Zotero.BetterBibTeX.auto.db.autoexport.data
      Zotero.BetterBibTeX.auto.mark(ae, 'pending', 'cache reset')

  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    journalAbbrev:  (sandbox, params...) => @JournalAbbrev.get.apply(@JournalAbbrev, params)
    keymanager: {
      months:         @keymanager.months
      extract:        (sandbox, params...) => @keymanager.extract.apply(@keymanager, params)
      get:            (sandbox, params...) => @keymanager.get.apply(@keymanager, params)
      alternates:     (sandbox, params...) => @keymanager.alternates.apply(@keymanager, params)
      cache:          (sandbox, params...) => @keymanager.cache.apply(@keymanager, params)
    }
    cache: {
      fetch:  (sandbox, params...) => @cache.fetch.apply(@cache, params)
      store:  (sandbox, params...) => @cache.store.apply(@cache, params)
      dump:   (sandbox, params...) => @cache.dump.apply(@cache, params)
      stats:  (sandbox)            -> Zotero.BetterBibTeX.cacheHistory
    }
    CSL: {
      state: {
        opt: {
          lang: 'en'
        },
        locale: {
          en: {
            opts: {
              'skip-words': Zotero.BetterBibTeX.CSL.SKIP_WORDS,
              'skip-words-regexp': new RegExp( '(?:(?:[?!:]*\\s+|-|^)(?:' + Zotero.BetterBibTeX.CSL.SKIP_WORDS.map((term) -> term.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]\s*/g, '\\$&')).join('|') + ')(?=[!?:]*\\s+|-|$))', 'g')
            }
          }
        }
      },
      titleCase: (sandbox, text) ->
        return Zotero.BetterBibTeX.CSL.Output.Formatters.title(Zotero.Translate.Export::Sandbox.BetterBibTeX.CSL.state, text)

      parseParticles: (sandbox, name) ->
        ### twice to work around https://bitbucket.org/fbennett/citeproc-js/issues/183/particle-parser-returning-non-dropping ###
        Zotero.BetterBibTeX.CSL.parseParticles(name)
        Zotero.BetterBibTeX.CSL.parseParticles(name)
    }
    parseDateToObject: (sandbox, date, options = {}) ->
      options.verbatimDetection = true
      return Zotero.BetterBibTeX.DateParser::parseDateToObject(date, options)
    parseDateToArray: (sandbox, date, options = {}) ->
      options.verbatimDetection = true
      return Zotero.BetterBibTeX.DateParser::parseDateToArray(date, options)
  }

  for own name, endpoint of @endpoints
    url = "/better-bibtex/#{name}"
    ep = Zotero.Server.Endpoints[url] = ->
    ep:: = endpoint

  @Translators.install()

  Zotero.BetterBibTeX.debug('CSL Loaded:', ("#{typeof m}: #{m}" for m of Zotero.BetterBibTeX.CSL.DateParser))
  for k, months of Zotero.BetterBibTeX.Locales.months
    Zotero.BetterBibTeX.CSL.DateParser.addDateParserMonths(months)

  ### monkey-patch Zotero.Search::search to allow searching for citekey ###
  Zotero.Search::search = ((original) ->
    return (asTempTable) ->
      searchText = null
      for c in @_conditions
        continue unless c && c.condition == 'field'
        searchText = c.value.toLowerCase() if c.value
      return original.apply(@, arguments) unless searchText

      ids = original.call(@, false) || []

      Zotero.BetterBibTeX.debug('search: looking for', searchText, 'to add to', ids)
      for key in Zotero.BetterBibTeX.keymanager.db.keys.where((k) -> k.citekey.toLowerCase().indexOf(searchText) >= 0)
        ids.push('' + key.itemID) unless ids.indexOf('' + key.itemID) >= 0

      return false if ids.length == 0
      return Zotero.Search.idsToTempTable(ids) if asTempTable
      return ids
    )(Zotero.Search::search)

  ### monkey-patch unwieldy BBT db logging ###
  Zotero.DBConnection::_debug = ((original) ->
    return (str, level) ->
      try
        if @_dbName == 'betterbibtex-lokijs' && str && str.length > 200
          return original.call(@, str.substr(0, 200) + '...', level)
      return original.apply(@, arguments)
    )(Zotero.DBConnection::_debug)

  ### monkey-patch to fake the missing item notification after a zip is unpacked ###
  Zotero.Sync.Storage.processDownload = ((original) ->
    return (data) ->
      r = original.apply(@, arguments)
      try
        setTimeout((-> Zotero.BetterBibTeX.itemChanged('modify', 'item', [data.item.id], [])), 1000)
      catch e
        Zotero.BetterBibTeX.debug('Zotero.Sync.Storage.processDownload:', e)
      return r
    )(Zotero.Sync.Storage.processDownload)

  ### monkey-patch Zotero.Items.parseLibraryKeyHash(id) so you can get by ID -- mainly for SelectExtension ###
  Zotero.Items.parseLibraryKeyHash = ((original) ->
    return (libraryKey) ->
      if libraryKey && libraryKey[0] == '@'
        libraryKey = libraryKey.split('@')
        libraryKey.reverse()
        [citekey, libraryID] = libraryKey
        libraryID = libraryID || null
        item = Zotero.BetterBibTeX.DB.keys.findObject({citekey, libraryID})
        return false unless item && item.itemID
        item = Zotero.Items.get(item.itemID)
        return false unless item
        return {libraryID, key: item.key }

      if libraryKey && (m = libraryKey.match(/^([0-9]+)~(.*)/))
        try
          return {libraryID: Zotero.Groups.getLibraryIDFromGroupID(m[1]), key: m[2]}
        catch
          Zotero.BetterBibTeX.debug('Zotero.Items.parseLibraryKeyHash: no library for group', libraryKey)

      return original.call(@, libraryKey)
    )(Zotero.Items.parseLibraryKeyHash)

  ###
    monkey-patch Zotero.ItemTreeView::getCellText to replace the 'extra' column with the citekey

    I wish I didn't have to hijack the extra field, but Zotero has checks in numerous places to make sure it only
    displays 'genuine' Zotero fields, and monkey-patching around all of those got to be way too invasive (and thus
    fragile)
  ###
  Zotero.ItemTreeView::getCellText = ((original) ->
    return (row, column) ->
      switch
        when column.id == 'zotero-items-column-callNumber' && Zotero.BetterBibTeX.Pref.get('showItemIDs')
          type = 'itemid'
        when column.id == 'zotero-items-column-extra' && Zotero.BetterBibTeX.Pref.get('showCitekeys')
          type = 'citekey'
      item = @._getItemAtRow(row) if type

      return original.apply(@, arguments) unless item
      return '' if !item.ref || item.ref.isAttachment() || item.ref.isNote()

      switch type
        when 'itemid'
          return ('\u2003\u2003\u2003\u2003\u2003\u2003' + item.id).slice(-6)

        when 'citekey'
          key = Zotero.BetterBibTeX.keymanager.get({itemID: item.id})
          return '' if key.citekey.match(/^zotero-(null|[0-9]+)-[0-9]+$/)
          return key.citekey + (if key.citekeyFormat then ' *' else '')

      return original.apply(@, arguments)
    )(Zotero.ItemTreeView::getCellText)

  ### monkey-patch translate to capture export path and auto-export ###
  Zotero.Translate.Export::translate = ((original) ->
    return ->
      Zotero.BetterBibTeX.debug("Zotero.Translate.Export::translate: #{if @_export then Object.keys(@_export) else 'no @_export'}", @_displayOptions)
      ### requested translator ###
      translatorID = @translator?[0]
      translatorID = translatorID.translatorID if translatorID.translatorID
      Zotero.BetterBibTeX.debug('Zotero.Translate.Export::translate: ', translatorID)
      return original.apply(@, arguments) unless translatorID

      ### pick up sentinel from patched Zotero_File_Interface.exportCollection in zoteroPane.coffee ###
      if @_export?.items?.search
        saved_search = @_export.items.search
        @_export.items = @_export.items.items
        throw new Error('Cannot export empty search') unless @_export.items

      ### regular behavior for non-BBT translators, or if translating to string ###
      header = Zotero.BetterBibTeX.Translators[translatorID]
      return original.apply(@, arguments) unless header && @location?.path

      if @_displayOptions
        if @_displayOptions.exportFileData
          ### export directory selected ###
          @_displayOptions.exportPath = @location.path
        else
          @_displayOptions.exportPath = @location.parent.path
        @_displayOptions.exportFilename = @location.leafName

      Zotero.BetterBibTeX.debug("Zotero.Translate.Export::translate: export", @_export, " to #{if @_displayOptions?.exportFileData then 'directory' else 'file'}", @location.path, 'using', @_displayOptions)

      ### If no capture, we're done ###
      return original.apply(@, arguments) unless @_displayOptions?['Keep updated'] && !@_displayOptions.exportFileData

      if !(@_export?.type in ['library', 'collection']) && !saved_search
        Zotero.BetterBibTeX.flash('Auto-export only supported for searches, groups, collections and libraries')
        return original.apply(@, arguments)

      progressWin = new Zotero.ProgressWindow()
      progressWin.changeHeadline('Auto-export')

      switch
        when saved_search
          progressWin.addLines(["Saved search #{saved_search.name} set up for auto-export"])
          to_export = "search:#{saved_search.id}"

        when @_export?.type == 'library'
          to_export = if @_export.id then "library:#{@_export.id}" else 'library'
          try
            name = Zotero.Libraries.getName(@_export.id)
          catch
            name = to_export
          progressWin.addLines(["#{name} set up for auto-export"])

        when @_export?.type == 'collection'
          progressWin.addLines(["Collection #{@_export.collection.name} set up for auto-export"])
          to_export = "collection:#{@_export.collection.id}"

        else
          progressWin.addLines(['Auto-export only supported for searches, groups, collections and libraries'])
          to_export = null

      progressWin.show()
      progressWin.startCloseTimer()

      if to_export
        @_displayOptions.translatorID = translatorID
        Zotero.BetterBibTeX.auto.add(to_export, @location.path, @_displayOptions)
        Zotero.BetterBibTeX.debug('Captured auto-export:', @location.path, @_displayOptions)

      return original.apply(@, arguments)
    )(Zotero.Translate.Export::translate)

  ### monkey-patch _prepareTranslation to notify itemgetter whether we're doing exportFileData ###
  Zotero.Translate.Export::_prepareTranslation = ((original) ->
    return ->
      r = original.apply(@, arguments)

      ### caching shortcut sentinels ###
      translatorID = @translator?[0]
      translatorID = translatorID.translatorID if translatorID.translatorID

      Zotero.BetterBibTeX.debug('Zotero.Translate.Export::_prepareTranslation:', {translatorID})
      @_itemGetter._BetterBibTeX = Zotero.BetterBibTeX.Translators[translatorID]
      @_itemGetter._exportFileData = @_displayOptions.exportFileData

      return r
    )(Zotero.Translate.Export::_prepareTranslation)

  ### monkey-patch Zotero.Translate.ItemGetter::nextItem to fetch from pre-serialization cache. ###
  ### object serialization is approx 80% of the work being done while translating! Seriously! ###
  Zotero.Translate.ItemGetter::nextItem = ((original) ->
    Zotero.BetterBibTeX.debug('monkey-patching Zotero.Translate.ItemGetter::nextItem', typeof original)
    return ->
      ### don't mess with this unless I know it's in BBT ###
      return original.apply(@, arguments) if @legacy || !@_BetterBibTeX

      ###
        If I wanted to access serialized items when exporting file data, I'd have to pass "@" to serialized.get
        and call attachmentToArray.call(itemGetter, ...) there rather than ::attachmentToArray(...) so attachmentToArray would have access to
        @_exportFileDirectory
      ###
      if @_exportFileData
        id = @_itemsLeft[0]?.id
        item = original.apply(@, arguments)
        Zotero.BetterBibTeX.serialized.fixup(item, id) if item

      else
        while @_itemsLeft.length != 0
          item = Zotero.BetterBibTeX.serialized.get(@_itemsLeft.shift())
          break if item

      Zotero.BetterBibTeX.debug('Zotero.Translate.ItemGetter::nextItem:', {_exportFileData: @_exportFileData, uri: item?.uri, itemID: item?.itemID, itemType: item?.itemType})
      return item || false
    )(Zotero.Translate.ItemGetter::nextItem)

  ### monkey-patch zotfile wildcard table to add bibtex key ###
  if Zotero.ZotFile && Zotero.BetterBibTeX.Pref.get('ZotFile')
    Zotero.ZotFile.wildcardTable = ((original) ->
      return (item) ->
        table = original.apply(@, arguments)
        table['%b'] ||= Zotero.BetterBibTeX.keymanager.get(item).citekey unless item.isAttachment() || item.isNote()
        return table
      )(Zotero.ZotFile.wildcardTable)

  @schomd.init()

  @Pref.register()
  Zotero.addShutdownListener(->
    Zotero.BetterBibTeX.log('shutting down')
    Zotero.BetterBibTeX.DB.save('force')
    Zotero.BetterBibTeX.debugMode(true)
    return
  )
  Zotero.getActiveZoteroPane().addBeforeReloadListener((mode) =>
    @debug('before reload:', {mode})
    Zotero.BetterBibTeX.DB.save('all') if Zotero.BetterBibTeX.DB && mode != 'connector'
  )

  nids = []
  nids.push(Zotero.Notifier.registerObserver({ notify: (event, type, ids, extraData) => setTimeout((=> @itemChanged(event, type, ids, extraData)), 1) }, ['item']))
  nids.push(Zotero.Notifier.registerObserver(@collectionChanged, ['collection']))
  nids.push(Zotero.Notifier.registerObserver(@itemAdded, ['collection-item']))
  window.addEventListener('unload', ((e) -> Zotero.Notifier.unregisterObserver(id) for id in nids), false)

  zoteroPane = Zotero.getActiveZoteroPane()
  zoteroPane.addReloadListener(->
    Zotero.BetterBibTeX.DB.load('reload out of connector mode') if !Zotero.initialized || Zotero.isConnector
  )
  zoteroPane.addBeforeReloadListener((mode) ->
    Zotero.BetterBibTeX.DB.save('all') if Zotero.BetterBibTeX.DB && mode != 'connector'
  )

  Zotero.BetterBibTeX.debug("Scheduling auto-export on idle on a #{@Pref.get('autoExportIdleWait')} second delay")
  @idleService.addIdleObserver(@idleObserver, @Pref.get('autoExportIdleWait'))

  uninstaller = {
    onUninstalling: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      Zotero.BetterBibTeX.Translators.uninstall()

    onOperationCancelled: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      Zotero.BetterBibTeX.Translators.install() unless addon.pendingOperations & AddonManager.PENDING_UNINSTALL
  }
  AddonManager.addAddonListener(uninstaller)

  #if @testing
  #  tests = @Pref.get('tests')
  #  @Pref.set('tests', '')
  #  try
  #    loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)
  #    loader.loadSubScript("chrome://zotero-better-bibtex/content/test/include.js")
  #    @Test.run(tests.trim().split(/\s+/))

  @initialized = true

Zotero.BetterBibTeX.createFile = (paths...) ->
  f = Zotero.getZoteroDirectory()
  throw new Error('no path specified') if paths.length == 0

  paths.unshift('better-bibtex')
  Zotero.BetterBibTeX.debug('createFile:', paths)

  leaf = paths.pop()
  for path in paths
    f.append(path)
    f.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0o777) unless f.exists()
  f.append(leaf)
  return f

Zotero.BetterBibTeX.itemAdded = notify: ((event, type, collection_items) ->
  Zotero.BetterBibTeX.debug('itemAdded:', {event, type, collection_items})
  collections = []
  items = []

  ###
    monitor items added to collection to find BibTeX import errors. The scanner adds a dummy item whose 'extra'
    field has instructions on what to do after import
  ###

  return if collection_items.length == 0

  for collection_item in collection_items
    [collectionID, itemID] = collection_item.split('-')
    collections.push(collectionID)
    items.push(itemID)

    continue unless event == 'add'
    collection = Zotero.Collections.get(collectionID)
    continue unless collection

    try
      extra = JSON.parse(Zotero.Items.get(itemID).getField('extra').trim())
      @debug('import error info found on collection add')
    catch error
      continue

    switch extra.translator
      when 'ca65189f-8815-4afe-8c8b-8c7c15f0edca'
        ### Better BibTeX ###
        if extra.notimported && extra.notimported.length > 0
          report = new @HTMLNode('http://www.w3.org/1999/xhtml', 'html')
          report.div(->
            @p(-> @b('Better BibTeX could not import'))
            @add(' ')
            @pre(extra.notimported)
          )

          Zotero.Items.trash([itemID])
          item = new Zotero.Item('note')
          item.libraryID = collection.libraryID
          item.setNote(report.serialize())
          item.save()
          collection.addItem(item.id)

  collections = @auto.withParentCollections(collections) if collections.length != 0
  collections = ("collection:#{id}" for id in collections)
  Zotero.BetterBibTeX.debug('marking:', collections, 'from', (o.collection for o in @DB.autoexport.data))
  if collections.length > 0
    for ae in @DB.autoexport.where((o) -> o.collection in collections)
      @auto.mark(ae, 'pending', "itemAdded: #{collections}")
).bind(Zotero.BetterBibTeX)

Zotero.BetterBibTeX.collectionChanged = notify: (event, type, ids, extraData) ->
  return unless event == 'delete' && extraData.length > 0
  extraData = ("collection:#{id}" for id in extraData)
  @DB.autoexport.removeWhere((o) -> o.collection in extraData)

Zotero.BetterBibTeX.itemChanged = (event, type, ids, extraData) ->
  Zotero.BetterBibTeX.debug("itemChanged:", {event, type, ids, extraData})

  return unless type == 'item' && event in ['delete', 'trash', 'add', 'modify']
  ids = extraData if event == 'delete'
  return unless ids.length > 0

  items = Zotero.Items.get(ids)
  ids = {}
  references = []
  for item in items
    ids[item.id] = parseInt(item.id)
    if item.isAttachment() || item.isNote()
      parent = item.getSource()
      ids[parent] = parseInt(parent) if parent
    else
      references.push(item)
  ids = (v for k, v of ids)

  pinned = if event in ['add', 'modify'] then @keymanager.scan(references) else []

  @DB.keys.removeWhere((k) -> k.itemID in ids && !(k.itemID in pinned))

  if event in ['add', 'modify']
    for item in references
      continue if parseInt(item.id) in pinned
      @keymanager.get(item, 'on-change')

  for itemID in ids
    @serialized.remove(itemID)
    @cache.remove({itemID})

  @auto.markIDs(ids, 'itemChanged')

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

  return params if hasParams
  return null

Zotero.BetterBibTeX.getContentsFromURL = (url) ->
  try
    return Zotero.File.getContentsFromURL(url)
  catch err
    throw new Error("Failed to load #{url}: #{err.message || err.name}")

Zotero.BetterBibTeX.safeGet = (ids) ->
  return [] if ids.length == 0
  all = Zotero.Items.get(ids)
  if not all then return []
  return all

Zotero.BetterBibTeX.allowAutoPin = -> Zotero.Prefs.get('sync.autoSync') or not Zotero.Sync.Server.enabled

class Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    if !@doc
      @doc = Zotero.BetterBibTeX.document.implementation.createDocument(@namespace, @root, null)
      @root = @doc.documentElement

  serialize: -> Zotero.BetterBibTeX.serializer.serializeToString(@doc)

  alias: (names) ->
    for name in names
      @Node::[name] = do (name) -> (v...) -> XmlNode::add.apply(@, [{"#{name}": v[0]}].concat(v.slice(1)))

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

  add: (content...) ->
    if typeof content[0] == 'object'
      for own name, attrs of content[0]
        continue if name == ''
        # @doc['createElementNS'] rather than @doc.createElementNS because someone thinks there's a relevant difference
        node = @doc['createElementNS'](@namespace, name)
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

class Zotero.BetterBibTeX.HTMLNode extends Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    super(@namespace, @root, @doc)

  Node: HTMLNode

  HTMLNode::alias(['pre', 'b', 'p', 'div', 'ul', 'li'])

class Zotero.BetterBibTeX.AUXScanner
  constructor: (window) ->
    fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker)
    fp.init(window, Zotero.getString('fileInterface.import'), Components.interfaces.nsIFilePicker.modeOpen)
    fp.appendFilter('AUX file', '*.aux')
    rv = fp.show()
    return false unless rv in [Components.interfaces.nsIFilePicker.returnOK, Components.interfaces.nsIFilePicker.returnReplace]

    @citations = {}

    @parse(fp.file)
    @citations = Object.keys(@citations)
    return if @citations.length == 0

    collection = Zotero.getActiveZoteroPane()?.getSelectedCollection()
    # hasChildItems counts items in trash
    # MFG getChildItems returns false rather than an empty list
    if !collection || (collection.getChildItems(true) || []).length != 0
      name = fp.file.leafName.substr(0, fp.file.leafName.lastIndexOf(".")) + ' ' + (new Date()).toLocaleString()
      collection = Zotero.Collections.add(name , collection?.id || null)
    @save(collection, @citations)

  parse: (file) ->
    Zotero.BetterBibTeX.debug('AUXScanner:', file.path)
    contents = Zotero.File.getContents(file)

    re = /(\\citation|@cite){([^}]+)}/g
    while m = re.exec(contents)
      for key in m[2].split(',')
        @citations[key] = true

    re = /\\@input{([^}]+)}/g
    while m = re.exec(contents)
      inc = file.parent.clone()
      inc.append(m[1])
      @parse(inc)

  save: (collection, keys) ->
    missing = []
    for own citekey, found of Zotero.BetterBibTeX.keymanager.resolve(keys, {libraryID: collection.libraryID})
      if found
        collection.addItem(found.itemID)
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
        )
      )
      item = new Zotero.Item('note')
      item.libraryID = collection.libraryID
      item.setNote(report.serialize())
      item.save()
      collection.addItem(item.id)
