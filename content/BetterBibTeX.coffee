Components.utils.import('resource://gre/modules/AddonManager.jsm')

module.exports = Zotero.BetterBibTeX || {}

if !Zotero.BetterBibTeX
  debug = require('./debug.ts')
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
    UNINSTALL
  ###

  uninstaller = {
    onUninstalling: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      debug('uninstall')

      quickCopy = Zotero.Prefs.get('export.quickCopy.setting')
      for label, metadata of Translators.byName
        Zotero.Prefs.clear('export.quickCopy.setting') if quickCopy == "export=#{metadata.translatorID}"

        try
          Translators.uninstall(label, metadata.translatorID)

      Zotero.BetterBibTeX.uninstalled = true

      return

    onOperationCancelled: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      return if addon.pendingOperations & (AddonManager.PENDING_UNINSTALL | AddonManager.PENDING_DISABLE)

      for id, header of Translators.byId
        try
          Translators.install(header)

      delete Zotero.BetterBibTeX.uninstalled

      return
  }
  uninstaller.onDisabling = uninstaller.onUninstalling
  AddonManager.addAddonListener(uninstaller)

  ###
    MONKEY PATCHES
  ###

  # Monkey patch because of https://groups.google.com/forum/#!topic/zotero-dev/zy2fSO1b0aQ
  pane = Zotero.getActiveZoteroPane() # can Zotero 5 have more than one pane at all?
  pane.serializePersist = do (original = pane.serializePersist) ->
    return ->
      original.apply(@, arguments)

      if Zotero.BetterBibTeX.uninstalled && persisted = Zotero.Prefs.get('pane.persist')
        persisted = JSON.parse(persisted)
        delete persisted['zotero-items-column-citekey']
        Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))

      return

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
          return '\uFFFD' if citekey.retry
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

      # prevents update loop -- see KeyManager.init()
      ids = (id for id in ids when !extraData[id]?.bbtCitekeyUpdate) if action == 'modify'

      # safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
      # https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
      # items = Zotero.Items.get(ids)

      # not needed as the parents will be signaled themselves
      # parents = (item.parentID for item in items when item.parentID)
      # CACHE.remove(parents)

      CACHE.remove(ids)

      # safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
      # https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
      if action == 'delete'
        items = []
      else
        items = (item for item in Zotero.Items.get(ids) when !(item.isNote() || item.isAttachment()))

      switch action
        when 'delete', 'trash'
          debug("event.#{type}.#{action}", {ids, extraData})
          KeyManager.remove(ids)
          events.emit('items-removed', ids)

        when 'add', 'modify'
          for item in items
            KeyManager.update(item)

          events.emit('items-changed', ids)

        else
          debug('item.notify: unhandled', {action, type, ids, extraData})
          return

      changed = {
        collections: new Set()
        libraries: new Set()
      }
      for item in items
        changed.libraries.add(item.libraryID)

        for collectionID in item.getCollections()
          continue if changed.collections.has(collectionID)
          while collectionID
            changed.collections.add(collectionID)
            collectionID = Zotero.Collections.get(collectionID).parentID

      events.emit('collections-changed', Array.from(changed.collections)) if changed.collections.size
      events.emit('libraries-changed', Array.from(changed.libraries)) if changed.libraries.size

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
      changed = new Set()

      for collection_item in collection_items
        collectionID = parseInt(collection_item.split('-')[0])
        continue if changed.has(collectionID)
        while collectionID
          changed.add(collectionID)
          collectionID = Zotero.Collections.get(collectionID).parentID

      events.emit('collections-changed', Array.from(changed)) if changed.size

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
              id = @_export.id

            when 'collection'
              name = @_export.collection.name
              id = @_export.collection.id

            else
              flash('Auto-export not registered', 'Auto-export only supported for groups, collections and libraries')
              return

          AutoExport.add({
            type: @_export.type,
            id: id,
            path: @location.path,
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

  module.exports.ErrorReport = Zotero.Promise.coroutine((includeReferences) ->
    debug('ErrorReport::start', includeReferences)
    items = null

    pane = Zotero.getActiveZoteroPane()

    switch pane && includeReferences
      when 'collection', 'library'
        items = { collection: pane.getSelectedCollection() }
        items = { library: pane.getSelectedLibraryID() } unless items.collection

      when 'items'
        try
          items = { items: pane.getSelectedItems() }
        catch err # zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
          debug('Could not get selected items:', err)
          items = {}

        items = null unless items.items && items.items.length

    params = {wrappedJSObject: { items }}

    debug('ErrorReport::start popup', params)
    ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    ww.openWindow(null, 'chrome://zotero-better-bibtex/content/ErrorReport.xul', 'better-bibtex-error-report', 'chrome,centerscreen,modal', params)
    debug('ErrorReport::start done')

    return
  )

  debug('Loading Better BibTeX: setup done')

  class Lock
    postfix: '-better-bibtex-locked'

    constructor: ->
      @mark = { ts: new Date() }

    lock: Zotero.Promise.coroutine((msg)->
      yield Zotero.uiReadyPromise

      yield Zotero.unlockPromise if Zotero.locked

      @update(msg || 'Initializing')

      @toggle(true)

      return
    )

    bench: (msg) ->
      ts = new Date()
      debug('Lock:', @mark.msg, 'took', (ts - @mark.ts) / 1000.0, 's') if @mark.msg
      @mark = { ts, msg }
      return

    update: (msg) ->
      @bench(msg)
      Zotero.showZoteroPaneProgressMeter("Better BibTeX: #{msg}...")
      return

    unlock: ->
      @bench()

      Zotero.hideZoteroPaneOverlays()
      @toggle(false)

      return

    toggle: (locked) ->
      for id in ['menu_import', 'menu_importFromClipboard', 'menu_newItem', 'menu_newNote', 'menu_newCollection', 'menu_exportLibrary']
        document.getElementById(id).hidden = locked

      for id in ['zotero-collections-tree']
        document.getElementById(id).disabled = locked

      return

    hide: (deck) ->
      return unless @decks

      id = deck.id
      lock = id + @postfix

      debug('Lock: re-locking', id, 'with', lock)

      for node, i in deck.childNodes
        if node.id == lock
          deck.selectedIndex = i
          debug('Lock: selected', i, 'for', id)
          break
      return

  load = Zotero.Promise.coroutine(->
    debug('Loading Better BibTeX: starting...')

    ready = Zotero.Promise.defer()
    module.exports.ready = ready.promise

    # oh FFS -- datadir is async now

    lock = new Lock()
    yield lock.lock('Waiting for Zotero database')

    CACHE.init()

    # Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
    yield Zotero.Schema.schemaUpdatePromise

    lock.update('Loading citation keys')
    yield DB.init()

    lock.update('Starting auto-export')
    AutoExport.init()

    lock.update('Starting key manager')
    yield KeyManager.init() # inits the key cache by scanning the DB

    lock.update('Starting serialization cache')
    yield Serializer.init() # creates simplify et al

    if Prefs.get('testing')
      lock.update('Loading test support')
      module.exports.TestSupport = require('./test/support.coffee')
    else
      debug('starting, skipping test support')

    lock.update('Loading journal abbreviator')
    JournalAbbrev.init()

    lock.update('Installing bundled translators')
    yield Translators.init()

    # should be safe to start tests at this point. I hate async.

    ready.resolve(true)

    lock.unlock()

    return
  )

  # actual start
  window.addEventListener('load', load, false)
