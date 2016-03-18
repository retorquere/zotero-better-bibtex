Components.utils.import('resource://gre/modules/Services.jsm')

Zotero.BetterBibTeX.DB = new class
  cacheExpiry: Date.now() - (1000 * 60 * 60 * 24 * 30)

  constructor: ->
    Zotero.debug('DB.initialize')
    ### split to speed up auto-saves ###

    db = Zotero.getZoteroDatabase('betterbibtex-lokijs')
    Zotero.DB.query('ATTACH ? AS betterbibtex', [db.path])
    Zotero.DB.query('CREATE TABLE IF NOT EXISTS lokijs (name PRIMARY KEY, data)')

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

    db = Zotero.BetterBibTeX.createFile('serialized-items.json')
    keepCache = db.exists()
    db.moveTo(null, @db.volatile.filename) if keepCache

    @db.main.loadDatabase()
    @db.volatile.loadDatabase()

    @metadata = @db.main.getCollection('metadata')
    @metadata ||= @db.main.addCollection('metadata')
    @metadata = @metadata.data[0]
    @metadata ||= {}
    delete @metadata.$loki
    delete @metadata.meta
    @metadata.cacheReap ||= Date.now()

    ### this ensures that if the volatile DB hasn't been saved in the previous session, it is destroyed and will be rebuilt. ###
    volatile = Zotero.BetterBibTeX.createFile(@db.volatile.filename)
    volatile.moveTo(null, @db.volatile.filename + '.bak') if volatile.exists()

    @cache = @db.volatile.getCollection('cache')
    @cache ||= @db.volatile.addCollection('cache', { indices: ['itemID'] })
    delete @cache.binaryIndices.getCollections
    delete @cache.binaryIndices.exportCharset
    delete @cache.binaryIndices.exportNotes
    delete @cache.binaryIndices.translatorID
    delete @cache.binaryIndices.useJournalAbbreviation
    @cacheAccess = {}

    @serialized = @db.volatile.getCollection('serialized')
    @serialized ||= @db.volatile.addCollection('serialized', { indices: ['itemID', 'uri'] })

    @keys = @db.main.getCollection('keys')
    @keys ||= @db.main.addCollection('keys', {indices: ['itemID', 'libraryID', 'citekey']})

    @autoexport = @db.main.getCollection('autoexport')
    @autoexport ||= @db.main.addCollection('autoexport', {indices: ['collection', 'path', 'exportCharset', 'exportNotes', 'translatorID', 'useJournalAbbreviation']})

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

    @upgradeNeeded = @metadata.Zotero != ZOTERO_CONFIG.VERSION || @metadata.BetterBibTeX != Zotero.BetterBibTeX.release

    cacheReset = Zotero.BetterBibTeX.pref.get('cacheReset')
    Zotero.debug('DB.initialize, cache reset: ' + JSON.stringify({cacheReset, keepCache, metadata: @metadata, release: Zotero.BetterBibTeX.release}))

    if !cacheReset && !keepCache
      cacheReset = @metadata.BetterBibTeX != Zotero.BetterBibTeX.release

      ###
      # The default is arbitrarily set at 1000. I just assume if you have less than that actually cached, you will be more annoyed by being
      # asked about the cache than about it being regenerated.
      ###
      confirmCacheResetSize = Zotero.BetterBibTeX.pref.get('confirmCacheResetSize')

      if cacheReset && confirmCacheResetSize && Math.max(@cache.data.length, @serialized.data.length) > confirmCacheResetSize
        prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService)
        ###
        # 1 is magic (https://bugzilla.mozilla.org/show_bug.cgi?id=345067)
        # if you abort the window, I will assume you want the cache dropped. Keeping the cache should be a confirmed
        # choice.
        ###
        cacheReset = 1 == prompts.confirmEx(
          null,
          'Clear Better BibTeX cache?',
          """
            You have upgraded BetterBibTeX. This usually means output generation for Bib(La)TeX has changed, and it is recommended to clear the cache in order for these changes to take effect.

            Since you have a large library, with #{Math.max(@cache.data.length, @serialized.data.length)} entries cached, this may lead to a slow first (auto)export as the cache is refilled.

            If you don't care about the changes introduced in #{Zotero.BetterBibTeX.release}, and you want to keep your old cache, you may consider skipping this step.

            If you opt NOT to clear the cache, and you experience unexpected output at some point in the future, please first clear the cache from the preferences before reporting an issue

            Do you want to clear the BibTeX cache now?
          """,
          prompts.BUTTON_POS_1_DEFAULT + prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING + prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING + prompts.BUTTON_DELAY_ENABLE,
          "I know what I'm Doing. Keep the cache",
          'Clear cache (recommended)',
          '',
          null,
          {value: false}
        )

    if cacheReset
      @serialized.removeDataOnly()
      @cache.removeDataOnly()
      if typeof cacheReset == 'number'
        cacheReset = cacheReset - 1
        cacheReset = 0 if cacheReset < 0
        Zotero.BetterBibTeX.pref.set('cacheReset', cacheReset)
        Zotero.debug('DB.initialize, cache.load forced reset, ' + cacheReset + 'left')
      else
        Zotero.debug("DB.initialize, cache.load reset after upgrade from #{@metadata.BetterBibTeX} to #{Zotero.BetterBibTeX.release}")

    @keys.on('insert', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        ### removewhere will trigger 'delete' for the conflicts, which will take care of their cache dependents ###
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)
      @cache.removeWhere({itemID: key.itemID})
    )
    @keys.on('update', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)

      @cache.removeWhere({itemID: key.itemID})
    )
    @keys.on('delete', (key) =>
      @keys.removeWhere({itemID: key.itemID})
      @cache.removeWhere({itemID: key.itemID})
    )

    Zotero.debug('DB.initialize: ready')
    Zotero.debug("DB.initialize: ready.serialized: #{@serialized.data.length}")

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

  purge: ->
    itemIDs = Zotero.DB.columnQuery('select itemID from items except select itemID from deletedItems')
    itemIDs = (parseInt(id) for id in itemIDs)
    @keys.removeWhere((o) -> o.itemID not in itemIDs)
    @cache.removeWhere((o) -> o.itemID not in itemIDs)
    @serialized.removeWhere((o) -> o.itemID not in itemIDs)

  touch: (itemID) ->
    Zotero.BetterBibTeX.debug('touch:', itemID)
    @cache.removeWhere({itemID})
    @serialized.removeWhere({itemID})
    @keys.removeWhere((o) -> o.itemID == itemID && o.citekeyFormat)

  save: (all) ->
    Zotero.BetterBibTeX.debug('DB.save:', {all, serialized: @serialized.data.length})

    if all
      try
        for id, timestamp of @cacheAccess
          item = @cache.get(id)
          next unless item
          item.accessed = timestamp
          @cache.update(item)
        if @metadata.cacheReap < @cacheExpiry
          @metadata.cacheReap = Date.now()
          @cache.removeWhere((o) => (o.accessed || 0) < @cacheExpiry)
      catch err
        Zotero.BetterBibTeX.error('error purging cache:', err)

      try
        @db.volatile.save((err) ->
          if err
            Zotero.BetterBibTeX.error('error saving cache:', err)
            throw(err)
        )
      catch err
        Zotero.BetterBibTeX.error('error saving cache:', err)

    if all || @db.main.autosaveDirty()
      try
        @metadata.Zotero = ZOTERO_CONFIG.VERSION
        @metadata.BetterBibTeX = Zotero.BetterBibTeX.release

        @db.main.removeCollection('metadata')
        metadata = @db.main.addCollection('metadata')
        metadata.insert(@metadata)
      catch err
        Zotero.BetterBibTeX.error('error updating DB metadata:', err)

      @db.main.save((err) ->
        if err
          Zotero.BetterBibTeX.error('error saving DB:', err)
          throw(err)
      )
      @db.main.autosaveClearFlags()

  adapter:
    saveDatabase: (name, serialized, callback) ->
      Zotero.DB.query("INSERT OR REPLACE INTO betterbibtex.lokijs (name, data)", [name, serialized])
      callback()
      return

    loadDatabase: (name, callback) ->
      file = Zotero.BetterBibTeX.createFile(name)
      if file.exists()
        Zotero.BetterBibTeX.debug('DB.loadDatabase:', {name, file: file.path})
        callback(Zotero.File.getContents(file))
        file.remove(null)
        return

      data = Zotero.DB.valueQuery("SELECT data FROM betterbibtex.lokijs WHERE name=?", [name])
      if data
        callback(data)
        return

      callback(null)
      return

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

      db = Zotero.BetterBibTeX.createFile('better-bibtex-serialized-items.json')
      db.remove(true) if db.exists()

      db = Zotero.getZoteroDatabase('betterbibtex')
      return unless db.exists()

      Zotero.BetterBibTeX.flash('Better BibTeX: updating database', 'Updating database, this could take a while')

      Zotero.DB.query('ATTACH ? AS betterbibtexmigration', [db.path])

      if @tableExists('betterbibtexmigration.autoexport') && !@table_info('betterbibtexmigration.autoexport').context
        Zotero.BetterBibTeX.debug('DB.migrate: autoexport')
        Zotero.BetterBibTeX.DB.autoexport.removeDataOnly()

        if @table_info('betterbibtexmigration.autoexport').collection
          Zotero.DB.query("update betterbibtexmigration.autoexport set collection = (select 'library:' || libraryID from groups where 'group:' || groupID = collection) where collection like 'group:%'")
          Zotero.DB.query("update betterbibtexmigration.autoexport set collection = 'collection:' || collection where collection <> 'library' and collection not like '%:%'")

        migrated = 0
        for row in Zotero.DB.query('select * from betterbibtexmigration.autoexport')
          migrated += 1
          Zotero.BetterBibTeX.DB.autoexport.insert({
            collection: row.collection
            path: row.path
            exportCharset: row.exportCharset
            exportNotes: (row.exportNotes == 'true')
            translatorID: row.translatorID
            useJournalAbbreviation: (row.useJournalAbbreviation == 'true')
            status: 'pending'
          })
        Zotero.BetterBibTeX.debug('DB.migrate: autoexport=', migrated)

      if @tableExists('betterbibtexmigration.cache')
        Zotero.BetterBibTeX.debug('DB.migrate: cache')
        Zotero.BetterBibTeX.DB.cache.removeDataOnly()

        migrated = 0
        for row in Zotero.DB.query('select * from betterbibtexmigration.cache')
          migrated += 1
          Zotero.BetterBibTeX.DB.cache.insert({
            itemID: parseInt(row.itemID)
            exportCharset: row.exportCharset
            exportNotes: (row.exportNotes == 'true')
            translatorID: row.translatorID
            useJournalAbbreviation: (row.useJournalAbbreviation == 'true')
            citekey: row.citekey
            bibtex: row.bibtex
            accessed: Date.now()
          })

        Zotero.BetterBibTeX.debug('DB.migrate: cache=', migrated)

      if @tableExists('betterbibtexmigration.keys')
        Zotero.BetterBibTeX.debug('DB.migrate: keys')
        Zotero.BetterBibTeX.DB.keys.removeDataOnly()
        pinned = @table_info('betterbibtexmigration.autoexport').pinned

        migrated = 0
        for row in Zotero.DB.query('select k.*, i.libraryID from betterbibtexmigration.keys k join items i on k.itemID = i.itemID')
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

      Zotero.DB.query('DETACH betterbibtexmigration')

      db.moveTo(null, 'betterbibtex.sqlite.bak')

      Zotero.BetterBibTeX.DB.save(true)

      Zotero.BetterBibTeX.flash('Better BibTeX: database updated', 'Database update finished')
      Zotero.BetterBibTeX.flash('Better BibTeX: cache has been reset', 'Cache has been reset due to a version upgrade. First exports after upgrade will be slower than usual')
