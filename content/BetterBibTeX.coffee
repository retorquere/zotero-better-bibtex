module.exports = Zotero.BetterBibTeX || {}

if !Zotero.BetterBibTeX
  debug = require('./debug.coffee')
  flash = require('./flash.coffee')
  edtf = require('edtf')
  events = require('./events.coffee')
  zotero_config = require('./zotero-config.coffee')

  debug('Loading Better BibTeX')

  Prefs = require('./prefs.coffee') # needs to be here early, initializes the prefs observer

  # TODO: remove after beta
  Zotero.Prefs.get('debug.store', true)
  Zotero.Debug.setStore(true)

  Translators = require('./translators.coffee')
  DB = require('./db/main.coffee')
  CACHE = require('./db/cache.coffee')
  Serializer = require('./serializer.coffee')
  Citekey = require('./keymanager/get-set.coffee')
  JournalAbbrev = require('./journal-abbrev.coffee')
  AutoExport = require('./auto-export.coffee')

  module.exports.KeyManager = KeyManager = require('./keymanager.coffee')

  ###
    MONKEY PATCHES
  ###

  # otherwise the display of the citekey in the item pane flames out
  Zotero.ItemFields.isFieldOfBase = ((original) ->
    return (field, baseField) ->
      return false if field in ['citekey', 'itemID']
      return original.apply(@, arguments)
  )(Zotero.ItemFields.isFieldOfBase)
  # because the zotero item editor does not check whether a textbox is read-only. *sigh*
  Zotero.Item::setField = ((original) ->
    return (field, value, loadIn) ->
      return original.apply(@, arguments) unless field in ['citekey', 'itemID']
      return false
  )(Zotero.Item::setField)

  # To show the citekey in the reference list
  Zotero.Item::getField = ((original) ->
    return (field, unformatted, includeBaseMapped) ->
      return original.apply(@, arguments) unless field in ['citekey', 'itemID']

      switch field
        when 'citekey'
          citekey = KeyManager.get(@id)
          return citekey.citekey + (if !citekey.citekey || citekey.pinned then '' else ' *')
        when 'itemID'
          return '' + @id
        else
          return field
  )(Zotero.Item::getField)
  Zotero.ItemTreeView::getCellText = ((original) ->
    return (row, column) ->
      return original.apply(@, arguments) unless column.id in ['zotero-items-column-citekey']

      obj = this.getRow(row)
      itemID = obj.id
      citekey = KeyManager.get(itemID)

      if citekey.retry
        debug('Zotero.ItemTreeView::getCellText: could not get key for', itemID, ', waiting for BBT.ready...')
        Zotero.BetterBibTeX.ready.then(=>
          debug('Zotero.ItemTreeView::getCellText: deferred update for', itemID)

          @_treebox.invalidateCell(row, column)
          return
        )

      return citekey.citekey + (if !citekey.citekey || citekey.pinned then '' else ' *')
  )(Zotero.ItemTreeView::getCellText)

  ### bugger this, I don't want megabytes of shared code in the translators ###
  parseDate = require('./dateparser.coffee')
  CiteProc = require('./citeproc.coffee')
  titleCase = require('./title-case.coffee')
  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    parseDate: (sandbox, date) -> parseDate(date)
    isEDTF: (sandbox, date) ->
      try
        edtf.parse(date)
        return true
      catch
        return false
    parseParticles: (sandbox, name) -> CiteProc.parseParticles(name) # && CiteProc.parseParticles(name)
    titleCase: (sandbox, text) -> titleCase(text)
    simplifyFields: (sandbox, item) -> Serializer.simplify(item)
    scrubFields: (sandbox, item) -> Serializer.scrub(item)
    debugEnabled: (sandbox) -> Zotero.Debug.enabled
    version: (sandbox) -> { Zotero: zotero_config.Zotero, BetterBibTeX: require('../gen/version.js') }

    cacheFetch: (sandbox, itemID, options) ->
      collection = CACHE.getCollection(sandbox.translator[0].label)
      if !collection
        debug('cacheFetch:', sandbox.translator[0].label, 'not found')
        return false

      cached = collection.findOne({ itemID, exportNotes: !!options.exportNotes, useJournalAbbreviation: !!options.useJournalAbbreviation })
      if !cached
        debug('cacheFetch: cache miss for', sandbox.translator[0].label)
        return false

      collection.update(cached) # touches the cache object
      return cached

    cacheStore: (sandbox, itemID, options, reference, metadata) ->
      metadata ||= {}

      collection = CACHE.getCollection(sandbox.translator[0].label)
      return false unless collection

      cached = collection.findOne({ itemID, exportNotes: !!options.exportNotes, useJournalAbbreviation: !!options.useJournalAbbreviation })
      if cached
        cached.reference = reference
        cached.metadata = metadata
        collection.update(cached)
      else
        collection.insert({
          itemID,
          exportNotes: options.exportNotes,
          useJournalAbbreviation: options.useJournalAbbreviation,
          reference,
          metadata
        })
      return true
  }
  Zotero.Translate.Import::Sandbox.BetterBibTeX = {
    simplifyFields: (sandbox, item) -> Serializer.simplify(item)
    debugEnabled: (sandbox) -> Zotero.Debug.enabled
    scrubFields: (sandbox, item) -> Serializer.scrub(item)
  }

  Zotero.Notifier.registerObserver({
    notify: (action, type, ids, extraData) ->
      debug('item.notify', {action, type, ids, extraData})

      bench = (msg) ->
        now = new Date()
        debug("notify: #{msg} took #{(now - bench.start) / 1000.0}s")
        bench.start = now
        return
      bench.start = new Date()

      # safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
      # https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
      # items = Zotero.Items.get(ids)

      # not needed as the parents will be signaled themselves
      # parents = (item.parentID for item in items when item.parentID)
      # CACHE.remove(parents)

      CACHE.remove(ids)
      bench('cache remove')

      # safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
      # https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
      items = (item for item in Zotero.Items.get(ids) when !(item.isNote() || item.isAttachment()))

      switch action
        when 'delete', 'trash'
          debug("event.#{type}.#{action}", {ids, extraData})
          KeyManager.remove(ids)
          events.emit('items-removed', ids)
          bench('remove')

        when 'add', 'modify'
          for item in items
            KeyManager.update(item)

          events.emit('items-changed', ids)

        else
          debug('item.notify: unhandled', {action, type, ids, extraData})
          return

      childCollections = (coll) =>
        return [] unless coll

        children = [coll.id]
        for child in coll.getChildCollections()
          children = children.concat(childCollections(child))

        return children

      collections = {}
      libraries = {}
      for item in items
        libraries[item.libraryID] = true

        for collectionID in item.getCollections()
          continue if collections[collectionID]
          for coll in childCollections(Zotero.Collections.get(collectionID))
            collections[collectionID] = true


      collections = Object.keys(collections)
      events.emit('collections-changed', collections) if collections.length

      libraries = Object.keys(libraries)
      events.emit('libraries-changed', libraries) if libraries.length

      return
  }, ['item'], 'BetterBibTeX', 1)

  Zotero.Notifier.registerObserver({
    notify: (event, type, ids, extraData) ->
      events.emit('collections-removed', ids) if event == 'delete' && ids.length
      return
  }, ['collection'], 'BetterBibTeX', 1)

  Zotero.Notifier.registerObserver({
    notify: (event, type, ids, extraData) ->
      events.emit('libraries-removed', ids) if event == 'delete' && ids.length
      return
  }, ['group'], 'BetterBibTeX', 1)

  Zotero.Notifier.registerObserver({
    notify: (event, type, collection_items) ->
      changed = {}

      for collection_item in collection_items
        [collectionID, itemID] = collection_item.split('-')
        changed[collectionID] = true

        collection = Zotero.Collections.get(collectionID)
        while collection.parent?
          changed[collection.parent] = true
          collection = Zotero.Collections.get(collection.parent)

      collections = Object.keys(collections)
      events.emit('collections-changed', collections) if collections.length

      return
  }, ['collection-item'], 'BetterBibTeX', 1)

  Zotero.Utilities.Internal.itemToExportFormat = ((original) ->
    return (zoteroItem, legacy, skipChildItems) ->
      try
        return Serializer.fetch(zoteroItem, legacy, skipChildItems) || Serializer.store(zoteroItem, original.apply(@, arguments), legacy, skipChildItems)
      catch err # fallback for safety for non-BBT
        debug('Zotero.Utilities.Internal.itemToExportFormat', err)

      return original.apply(@, arguments)
  )(Zotero.Utilities.Internal.itemToExportFormat)

  Zotero.Translate.Export::translate = ((original) ->
    return ->
      try
        do =>
          debug("Zotero.Translate.Export::translate: #{if @_export then Object.keys(@_export) else 'no @_export'}", @_displayOptions)

          ### requested translator ###
          translatorID = @translator?[0]
          translatorID = translatorID.translatorID if translatorID.translatorID
          debug('Zotero.Translate.Export::translate: ', translatorID)

          ### regular behavior for non-BBT translators, or if translating to string ###
          return unless translatorID && @_displayOptions && Translators.byId[translatorID] && @location?.path

          if @_displayOptions.exportFileData # export directory selected
            @_displayOptions.exportPath = @location.path
          else
            @_displayOptions.exportPath = @location.parent.path
          @_displayOptions.exportFilename = @location.leafName

          return unless @_displayOptions?['Keep updated']

          debug('Keep updated set -- trying to register auto-export')

          if @_displayOptions.exportFileData
            flash('Auto-export not registered', 'Auto-export is not supported when file data is exported')
            return

          switch @_export?.type
            when 'library'
              if @_export.id == Zotero.Libraries.userLibraryID
                name = Zotero.Libraries.get(@_export.id).name
              else
                name = 'library ' + Zotero.Libraries.get(@_export.id).name

            when 'collection'
              name = @_export.collection.name

            else
              flash('Auto-export not registered', 'Auto-export only supported for groups, collections and libraries')
              return

          AutoExport.add({
            type: @_export.type,
            id: @_export.id,
            path: @_displayOptions.exportPath,
            status: 'done',
            translatorID,
            exportNotes: @_displayOptions.exportNotes,
            useJournalAbbreviation: @_displayOptions.useJournalAbbreviation,
          })

          return

      catch err
        debug('Zotero.Translate.Export::translate error:', err)

      return original.apply(@, arguments)
  )(Zotero.Translate.Export::translate)
  ###
    INIT
  ###

  bench = (msg) ->
    now = new Date()
    debug("startup: #{msg} took #{(now - bench.start) / 1000.0}s")
    bench.start = now
    return

  module.exports.ErrorReport = Zotero.Promise.coroutine((includeReferences) ->
    debug('ErrorReport::start', includeReferences)
    items = null

    pane = Zotero.getActiveZoteroPane()

    switch pane && includeReferences
      when 'collection', 'library'
        items = { collection: pane.getSelectedCollection() }
        items = { library: pane.getSelectedLibraryID() } unless items.collection

      when 'items'
        items = { items: pane.getSelectedItems() }
        items = null unless items.items && items.items.length

    params = {wrappedJSObject: { items }}

    debug('ErrorReport::start popup', params)
    ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    ww.openWindow(null, 'chrome://zotero-better-bibtex/content/ErrorReport.xul', 'better-bibtex-error-report', 'chrome,centerscreen,modal', params)
    debug('ErrorReport::start done')

    return
  )

  debug('Loading Better BibTeX: setup done')

  load = Zotero.Promise.coroutine(->
    debug('Loading Better BibTeX: starting...')

    ready = Zotero.Promise.defer()
    module.exports.ready = ready.promise
    bench.start = new Date()

    progressWin = new Zotero.ProgressWindow({ closeOnClick: false })

    progressWin.changeHeadline('BetterBibTeX: Waiting for Zotero database')
    progressWin.show()

    # oh FFS -- datadir is async now
    yield Zotero.uiReadyPromise
    CACHE.init()
    bench('Zotero.uiReadyPromise')

    # Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
    yield Zotero.Schema.schemaUpdatePromise
    bench('Zotero.Schema.schemaUpdatePromise')

    progressWin.changeHeadline('BetterBibTeX: Initializing')

    yield DB.init()
    bench('DB.init()')

    AutoExport.init()
    bench('AutoExport.init()')

    yield KeyManager.init() # inits the key cache by scanning the DB
    bench('KeyManager.init()')

    yield Serializer.init() # creates simplify et al
    bench('Serializer.init()')

    if Prefs.get('testing')
      module.exports.TestSupport = require('./test/support.coffee')
      bench('Zotero.BetterBibTeX.TestSupport')
    else
      debug('starting, skipping test support')

    JournalAbbrev.init()

    yield Translators.init()
    bench('Translators.init()')

    progressWin.changeHeadline('BetterBibTeX: Ready for business')
    progressWin.startCloseTimer(500)

    # should be safe to start tests at this point. I hate async.

    ready.resolve(true)
    bench('ready')

    return
  )

  # actual start
  window.addEventListener('load', load, false)
