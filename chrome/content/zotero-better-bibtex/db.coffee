Components.utils.import('resource://gre/modules/Services.jsm')

Zotero.BetterBibTeX.DB = new class
  cacheVersion: '1.5.11'

  constructor: ->
    # split to speed up auto-saves
    @db = {
      main: new loki('db.json', {
        autosave: true
        autosaveInterval: 10000
        adapter: @adapter
        env: 'BROWSER'
      })
      volatile: new loki('cache.json', {
        adapter: @adapter
        env: 'BROWSER'
      })
    }

    @db.main.loadDatabase()
    @db.volatile.loadDatabase()

    # this ensures that if the volatile DB hasn't been saved, it is destroyed and will be rebuilt.
    volatile = Zotero.BetterBibTeX.createFile(@db.volatile.filename)
    volatile.remove(true) if volatile.exists()

    @cache = @db.volatile.getCollection('cache')
    @cache ||= @db.volatile.addCollection('cache', { indices: ['itemID', 'exportCharset', 'exportNotes', 'getCollections', 'translatorID', 'useJournalAbbreviation', 'citekey'] })

    @serialized = @db.volatile.getCollection('serialized')
    @serialized ||= @db.volatile.addCollection('serialized', { indices: ['itemID', 'uri'] })

    @keys = @db.main.getCollection('keys')
    @keys ||= @db.main.addCollection('keys', {indices: ['itemID', 'libraryID', 'citekey', 'citekeyFormat']})

    @autoexport = @db.main.getCollection('autoexport')
    @autoexport ||= @db.main.addCollection('autoexport', {indices: ['collection', 'path', 'exportCharset', 'exportNotes', 'translatorID', 'useJournalAbbreviation', 'exportedRecursively']})

    # # in case I need to update the indices:
    # #
    # # remove all binary indexes
    # coll.binaryIndices = {}
    # # Unique indexes are not saved but their names are (to be rebuilt on every load)
    # # This will remove all unique indexes on the next save/load cycle
    # coll.uniqueNames = []
    # # add binary index
    # coll.ensureIndex("lastname")
    # # add unique index
    # coll.ensureUniqueIndex("userId")

    metadata = @db.main.getCollection('metadata')
    @upgradeNeeded = !metadata || !metadata[0] ||
      metadata.data[0].Zotero != ZOTERO_CONFIG.VERSION ||
      metadata.data[0].BetterBibTeX != Zotero.BetterBibTeX.release

    cacheReset = Zotero.BetterBibTeX.pref.get('cacheReset')
    cacheVersion = metadata?.data?[0]?.BetterBibTeX || '0.0.0'
    if cacheReset || Services.vc.compare(cacheVersion, @cacheVersion) < 0
      @serialized.removeDataOnly()
      @cache.removeDataOnly()
      if cacheReset > 0
        Zotero.BetterBibTeX.pref.set('cacheReset', cacheReset - 1)
        Zotero.BetterBibTeX.debug('cache.load forced reset', cacheReset - 1, 'left')
      else
        Zotero.BetterBibTeX.debug('cache.load reset after upgrade from', cacheVersion, 'to', Zotero.BetterBibTeX.release)

    @keys.on('insert', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        # removewhere will trigger 'delete' for the conflicts, which will take care of their cache dependents
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)
    )
    @keys.on('update', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)

      @cache.removeWhere({itemID: key.itemID})
    )
    @keys.on('delete', (key) =>
      @removeWhere({itemID: key.itemID})
    )

    Zotero.BetterBibTeX.debug('DB: ready')

    idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
    idleService.addIdleObserver({observe: (subject, topic, data) => @save() if topic == 'idle'}, 5)

    Zotero.Notifier.registerObserver(
      notify: (event, type, ids, extraData) ->
        return unless event in ['delete', 'trash', 'modify']
        ids = extraData if event == 'delete'
        return unless ids.length > 0

        for itemID in ids
          Zotero.BetterBibTeX.debug('touch:', {event, itemID})
          itemID = parseInt(itemID) unless typeof itemID == 'number'
          Zotero.BetterBibTeX.DB.touch(itemID)
    , ['item'])

  touch: (itemID) ->
    Zotero.BetterBibTeX.debug('touch:', itemID)
    @cache.removeWhere({itemID})
    @serialized.removeWhere({itemID})
    @keys.removeWhere((o) -> o.itemID == itemID && o.citekeyFormat)

  cacheExpiry: 1000 * 60 * 60 * 24 * 30

  save: (all) ->
    Zotero.BetterBibTeX.debug('DB.save:', {all})
    if all || @db.main.autosaveDirty()
      @db.main.removeCollection('metadata')
      metadata = @db.main.addCollection('metadata')
      metadata.insert({Zotero: ZOTERO_CONFIG.VERSION, BetterBibTeX: Zotero.BetterBibTeX.release})

      @db.main.save((err) -> throw(err) if (err))
      @db.main.autosaveClearFlags()

    if all
      @cache.removeWhere((o) => o.accessed < @cacheExpiry)
      @db.volatile.save((err) -> throw(err) if (err))

  adapter:
    saveDatabase: (name, serialized, callback) ->
      file = Zotero.BetterBibTeX.createFile(name)

      Zotero.File.putContents(file, serialized)

      callback(true)
      Zotero.BetterBibTeX.debug('DB.saveDatabase:', {name, file: file.path})

    loadDatabase: (name, callback) ->
      file = Zotero.BetterBibTeX.createFile(name)
      Zotero.BetterBibTeX.debug('DB.loadDatabase:', {name, file: file.path})
      if file.exists()
        callback(Zotero.File.getContents(file))
      else
        callback(null)
      Zotero.BetterBibTeX.debug('DB.loadDatabase: done', {name, file: file.path})

  SQLite:
    parseTable: (name) ->
      name = name.split('.')
      switch name.length
        when 1
          schema = ''
          name = name[0]
        when 2
          schema = name[0] + '.'
          name = name[1]
      name = name.slice(1, -1) if name[0] == '"'
      return {schema: schema, name: name}

    table_info: (table) ->
      table = @parseTable(table)
      statement = Zotero.DB.getStatement("pragma #{table.schema}table_info(\"#{table.name}\")", null, true)

      fields = (statement.getColumnName(i).toLowerCase() for i in [0...statement.columnCount])

      columns = {}
      while statement.executeStep()
        values = (Zotero.DB._getTypedValue(statement, i) for i in [0...statement.columnCount])
        column = {}
        for name, i in fields
          column[name] = values[i]
        columns[column.name] = column
      statement.finalize()

      return columns

    columnNames: (table) ->
      return Object.keys(@table_info(table))

    tableExists: (name) ->
      table = @parseTable(name)
      return (Zotero.DB.valueQuery("SELECT count(*) FROM #{table.schema}sqlite_master WHERE type='table' and name=?", [table.name]) != 0)

    Set: (values) -> '(' + ('' + v for v in values).join(', ') + ')'

    migrate: ->
      db = Zotero.getZoteroDatabase('betterbibtexcache')
      db.remove(true) if db.exists()

      db = Zotero.BetterBibTeX.createFile('serialized-items.json')
      if db.exists()
        Zotero.BetterBibTeX.DB.serialized.removeDataOnly()
        try
          serialized = JSON.parse(Zotero.File.getContents(db))
        catch
          serialized = {}

        serialized = (coll.data for coll in serialized.collections || [] when coll.name == 'serialized')[0]

        if Array.isArray(serialized)
          Zotero.BetterBibTeX.debug('DB.migrate: serialized')
          migrated = 0
          for item in serialized
            migrated += 1
            delete item.meta
            delete item['$loki']
            for attachment in item.attachments || []
              delete attachment.meta
              delete attachment['$loki']
            Zotero.BetterBibTeX.DB.serialized.insert(item)
          Zotero.BetterBibTeX.debug('DB.migrate: serialized=', migrated)
        else
          Zotero.BetterBibTeX.debug('DB.migrate: serialized: no data')

        db.remove(true)

      db = Zotero.getZoteroDatabase('betterbibtex')
      return unless db.exists()

      Zotero.BetterBibTeX.flash('Better BibTeX: updating database', 'Updating database, this could take a while')

      Zotero.DB.query('ATTACH ? AS betterbibtex', [db.path])

      # the context stuff was a mess
      if @tableExists('betterbibtex.autoexport') && !@table_info('betterbibtex.autoexport').context
        Zotero.BetterBibTeX.debug('DB.migrate: autoexport')
        Zotero.BetterBibTeX.DB.autoexport.removeDataOnly()

        if @table_info('betterbibtex.autoexport').collection
          Zotero.DB.query("update betterbibtex.autoexport set collection = (select 'library:' || libraryID from groups where 'group:' || groupID = collection) where collection like 'group:%'")
          Zotero.DB.query("update betterbibtex.autoexport set collection = 'collection:' || collection where collection <> 'library' and collection not like '%:%'")

        migrated = 0
        for row in Zotero.DB.query('select * from betterbibtex.autoexport')
          migrated += 1
          Zotero.BetterBibTeX.DB.autoexport.insert({
            collection: row.collection
            path: row.path
            exportCharset: row.exportCharset
            exportNotes: (row.exportNotes == 'true')
            translatorID: row.translatorID
            useJournalAbbreviation: (row.useJournalAbbreviation == 'true')
            exportedRecursively: (row.exportedRecursively == 'true')
            status: 'pending'
          })
        Zotero.BetterBibTeX.debug('DB.migrate: autoexport=', migrated)

      if @tableExists('betterbibtex.cache')
        Zotero.BetterBibTeX.debug('DB.migrate: cache')
        Zotero.BetterBibTeX.DB.cache.removeDataOnly()

        migrated = 0
        for row in Zotero.DB.query('select * from betterbibtex.cache')
          migrated += 1
          Zotero.BetterBibTeX.DB.cache.insert({
            itemID: parseInt(row.itemID)
            exportCharset: row.exportCharset
            exportNotes: (row.exportNotes == 'true')
            getCollections: (row.getCollections == 'true')
            translatorID: row.translatorID
            useJournalAbbreviation: (row.useJournalAbbreviation == 'true')
            citekey: row.citekey
            bibtex: row.bibtex
            accessed: Date.now()
          })

        Zotero.BetterBibTeX.debug('DB.migrate: cache=', migrated)

      if @tableExists('betterbibtex.keys')
        Zotero.BetterBibTeX.debug('DB.migrate: keys')
        Zotero.BetterBibTeX.DB.keys.removeDataOnly()
        pinned = @table_info('betterbibtex.autoexport').pinned

        migrated = 0
        for row in Zotero.DB.query('select k.*, i.libraryID from betterbibtex.keys k join items i on k.itemID = i.itemID')
          continue if pinned && row.pinned != 1
          migrated += 1

          row.citekeyFormat = null unless row.citekeyFormat

          Zotero.BetterBibTeX.DB.keys.insert({
            itemID: parseInt(row.itemID)
            citekey: row.citekey
            citekeyFormat: row.citekeyFormat
            libraryID: row.libraryID
          })
        Zotero.BetterBibTeX.debug('DB.migrate: keys=', migrated)

      Zotero.DB.query('DETACH betterbibtex')

      db.moveTo(null, 'betterbibtex.sqlite.bak')

      Zotero.BetterBibTeX.DB.save(true)

      Zotero.BetterBibTeX.flash('Better BibTeX: database updated', 'Database update finished')
      Zotero.BetterBibTeX.flash('Better BibTeX: cache has been reset', 'Cache has been reset due to a version upgrade. First exports after upgrade will be slower than usual')
