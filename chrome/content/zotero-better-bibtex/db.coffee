Zotero.BetterBibTeX.DB = new class
  constructor: ->
    @db = new loki('betterbibtex.db', {
      autosave: true
      autosaveInterval: 10000
      adapter: @adapter
      env: 'BROWSER'
    })

    @db.loadDatabase()

    if !@db.getCollection('cache')
      @cache = @db.addCollection('cache', { indices: ['itemID', 'exportCharset', 'exportNotes', 'getCollections', 'translatorID', 'useJournalAbbreviation', 'citekey'] })

    if !@db.getCollection('serialized')
      @serialized = @db.addCollection('serialized', { indices: ['itemID', 'uri'] })

    if !@db.getCollection('keys')
      @keys = @db.addCollection('keys', {indices: ['itemID', 'libraryID', 'citekey', 'citekeyFormat']})

    metadata = @db.getCollection('metadata')
    if !metadata || !metadata[0] ||
      metadata.data[0].Zotero != ZOTERO_CONFIG.VERSION ||
      metadata.data[0].BetterBibTeX != Zotero.BetterBibTeX.release
        @serialized.removeDataOnly()
        @cache.removeDataOnly()

    @keys.on('insert', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        # removewhere will trigger 'delete' for the conflicts, which will take care of their cache dependents
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)
    )
    @keys.on('update', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)

      @cache.remove({itemID: key.itemID})
    )
    @keys.on('delete', (key) =>
      @remove({itemID: key.itemID})
    )

    idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
    idleService.addIdleObserver({observe: (subject, topic, data) => @save() if topic == 'idle'}, 5)

  touch: (itemID) ->
    @cache.remove({itemID})
    @serialized.remove({itemID})
    @keys.removeWhere((o) -> o.itemID == itemID && o.citekeyFormat)

  save: (force) ->
    return unless force || @db.autosaveDirty()

    @db.removeCollection('metadata')
    metadata = @db.addCollection('metadata')
    metadata.insert({Zotero: ZOTERO_CONFIG.VERSION, BetterBibTeX: Zotero.BetterBibTeX.release})

    @db.save((err) ->
      throw(err) if (err)
    )
    @db.autosaveClearFlags()

  adapter:
    saveDatabase: (name, serialized, callback) ->
      file = Zotero.getZoteroDirectory()
      file.append("#{name}.json")
      stream = FileUtils.openAtomicFileOutputStream(@file(), FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE)
      stream.write(serialized, serialized.length)
      stream.close()
      callback(true)

    loadDatabase: (name, callback) ->
      file = Zotero.getZoteroDirectory()
      file.append("#{name}.json")
      if file.exists()
        callback(Zotero.File.getContents(file))
      else
        callback(null)
