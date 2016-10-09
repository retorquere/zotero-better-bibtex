Components.utils.import('resource://gre/modules/Services.jsm')
Components.utils.import('resource://gre/modules/FileUtils.jsm')

Zotero.BetterBibTeX.DBStore = new class
  backups: 4

  constructor: ->
    # this will go away in 5.0
    dbName = 'betterbibtex-lokijs'
    file = Zotero.getZoteroDatabase(dbName)
    Zotero.BetterBibTeX.debug('DBStore: looking for', file.path)
    if file.exists()
      try
        Zotero.BetterBibTeX.debug('DBStore: migrating', dbName)
        store = new Zotero.DBConnection(dbName)
        for row in store.query("SELECT name, data FROM lokijs WHERE name IN ('cache.json', 'db.json')")
          Zotero.BetterBibTeX.debug('DBStore: migrating', row, row.name)
          @saveDatabase(row.name, row.data, ->)
        store.closeDatabase(true)
        file.moveTo(null, file.leafName + '.migrated')
      catch err
        Zotero.BetterBibTeX.flash("Failed to migrate #{file.path}; the database has been backup up, please file an error report")
        Zotero.BetterBibTeX.debug('DBStore: migration failed:', err)
        file.moveTo(null, file.leafName + '.failedmigration')

  versioned: (name, id) ->
    return name unless id
    return "#{name}.#{id}"

  saveDatabase: (name, serialized, callback) ->
    if Zotero.isConnector
      Zotero.BetterBibTeX.flash('Zotero is in connector mode -- not saving database!')
      callback()
      return

    try
      db = Zotero.BetterBibTeX.createFile(name)
      if db.exists()
        for id in [@backups..0]
          db = Zotero.BetterBibTeX.createFile(@versioned(name, id))
          continue unless db.exists()
          Zotero.BetterBibTeX.debug("DBStore: backing up #{db.path}")
          db.moveTo(null, name + ".#{id + 1}")
    catch err
      Zotero.BetterBibTeX.debug('DBStore: backup failed', err)

    db = Zotero.BetterBibTeX.createFile(name + '.saving')
    Zotero.File.putContents(db, serialized)
    db.moveTo(null, name)

    callback()
    return

  tryDatabase: (name) ->
    Zotero.BetterBibTeX.debug("DBStore.load: trying #{name}")
    file = Zotero.BetterBibTeX.createFile(name)
    throw {name: 'NoSuchFile', message: "#{file.path} not found", toString: -> "#{@name}: #{@message}"} unless file.exists()

    data = Zotero.File.getContents(file)

    # will throw an error if not valid JSON -- too bad we're doing this twice, but better safe than sorry, and only
    # happens at startup
    JSON.parse(data)

    return data

  loadDatabase: (name, callback) ->
    data = null
    for id in [0..@backups]
      try
        data = @tryDatabase(@versioned(name, id))
        break
      catch err
        Zotero.BetterBibTeX.debug("DBStore: failed to load #{@versioned(name, id)}", err)
        data = null

    Zotero.BetterBibTeX.flash("failed to load #{name}") unless data

    callback(data)
    return

Zotero.BetterBibTeX.DB = new class
  cacheExpiry: Date.now() - (1000 * 60 * 60 * 24 * 30)

  constructor: ->
    @load()
    idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
    idleService.addIdleObserver({observe: (subject, topic, data) => @save('all') if topic == 'idle'}, 5)

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

  load: (reason) ->
    Zotero.debug('DB.initialize (' + ( reason || 'startup') + ')')

    ### split to speed up auto-saves ###
    @db = {
      main: new Zotero.BetterBibTeX.LokiJS('db.json', {
        autosave: true
        autosaveInterval: 5000
        adapter: Zotero.BetterBibTeX.DBStore
        env: 'BROWSER'
      })
      volatile: new Zotero.BetterBibTeX.LokiJS('cache.json', {
        adapter: Zotero.BetterBibTeX.DBStore
        env: 'BROWSER'
      })
    }

    @db.main.loadDatabase()
    @db.volatile.loadDatabase()

    @db.metadata = @db.main.getCollection('metadata') || @db.main.addCollection('metadata')
    if @db.metadata.data.length != 0 && !@db.metadata.data[0].$loki
      # I stored corrupted data in metadata at some point -- oy vey.
      @db.main.removeCollection('metadata')
      @db.metadata = @db.main.addCollection('metadata')
    @db.metadata.insert({}) if @db.metadata.data.length == 0
    @metadata = @db.metadata.data[0]

    if !@metadata.cacheReap
      @metadata.cacheReap = Date.now()
      @db.metadata.update(@metadata)
    Zotero.BetterBibTeX.debug('db: loaded, metadata:', @metadata)

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

    @upgradeNeeded = {}
    freshInstall = true
    for k, v of { Zotero: ZOTERO_CONFIG.VERSION, BetterBibTeX: Zotero.BetterBibTeX.release, storage: Zotero.getZoteroDirectory().path }
      freshInstall = false if @metadata[k]
      continue if @metadata[k] == v
      @upgradeNeeded[k] = v
    @upgradeNeeded = false if Object.keys(@upgradeNeeded).length == 0
    Zotero.BetterBibTeX.debug('upgrade needed?', @upgradeNeeded)

    switch
      # force cache reset by user request, or fresh install
      when Zotero.BetterBibTeX.Pref.get('cacheReset')
        Zotero.BetterBibTeX.debug('reset cache: user request')
        @cacheReset = true

      when @upgradeNeeded && freshInstall
        Zotero.BetterBibTeX.debug('reset cache: new installation')
        @cacheReset = true

      # nothing changed, don't touch the cache
      when !@upgradeNeeded
        Zotero.BetterBibTeX.debug('reset cache: no')
        @cacheReset = false

      # something has changed, really *should* drop the cache, but let's ask the user
      else
        @cacheReset = true
        Zotero.BetterBibTeX.debug('reset cache: conditional')
        ###
        # The default is arbitrarily set at 1000. I just assume if you have less than that actually cached, you will be more annoyed by being
        # asked about the cache than about it being regenerated.
        ###
        confirmCacheResetSize = Zotero.BetterBibTeX.Pref.get('confirmCacheResetSize')

        if confirmCacheResetSize && Math.max(@cache.data.length, @serialized.data.length) > confirmCacheResetSize
          prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService)
          ###
          # 1 is magic (https://bugzilla.mozilla.org/show_bug.cgi?id=345067)
          # if you abort the window, I will assume you want the cache dropped. Keeping the cache should be a confirmed
          # choice.
          ###

          upgrade = []
          storage = []
          for k, v of @upgradeNeeded
            continue unless v
            if k == 'storage'
              storage.push("changed the Zotero storage location to #{v}")
            else
              upgrade.push("#{k} to #{v}")

          if upgrade.length > 0
            upgrade[0] = 'upgraded ' + upgrade[0]

          doneIt = upgrade.concat(storage)

          switch doneIt.length
            when 0
              doneIt = ['upgraded Better BibTeX']
            when 1
              # pass
            else
              l = doneIt.length
              doneIt.splice(l - 2, 2, doneIt[l - 2] + ' and ' + doneIt[l - 1])
          doneIt = doneIt.join(', ')
          Zotero.BetterBibTeX.debug("reset cache: user has #{doneIt}")

          @cacheReset = 1 == prompts.confirmEx(
            null,
            'Clear Better BibTeX cache?',
            """
              You have #{doneIt}. This usually means output generation for Bib(La)TeX has changed, and it is recommended to clear the cache in order for these changes to take effect.

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

    if @cacheReset
      Zotero.BetterBibTeX.debug('reset cache: roger roger')
      @serialized.removeDataOnly()
      @cache.removeDataOnly()
      if typeof @cacheReset == 'number'
        @cacheReset = @cacheReset - 1
        @cacheReset = 0 if @cacheReset < 0
        Zotero.BetterBibTeX.Pref.set('cacheReset', @cacheReset)
        Zotero.debug('DB.initialize, cache.load forced reset, ' + @cacheReset + 'left')
      else
        Zotero.debug("DB.initialize, cache.load reset after upgrade from #{@metadata.BetterBibTeX} to #{Zotero.BetterBibTeX.release}")

    @keys.on('insert', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.Pref.get('keyConflictPolicy') == 'change'
        ### removewhere will trigger 'delete' for the conflicts, which will take care of their cache dependents ###
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)
      @cache.removeWhere({itemID: key.itemID})
    )
    @keys.on('update', (key) =>
      if !key.citekeyFormat && Zotero.BetterBibTeX.Pref.get('keyConflictPolicy') == 'change'
        @keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)

      @cache.removeWhere({itemID: key.itemID})
    )
    @keys.on('delete', (key) =>
      @keys.removeWhere({itemID: key.itemID})
      @cache.removeWhere({itemID: key.itemID})
    )
    @autoexport.on('delete', (key) ->
      Zotero.BetterBibTeX.debug('@autoexport.on(delete)', key)
    )
    @autoexport.on('insert', (key) ->
      Zotero.BetterBibTeX.debug('@autoexport.on(insert)', key)
    )
    @autoexport.on('update', (key) ->
      Zotero.BetterBibTeX.debug('@autoexport.on(update)', key)
    )

    if @upgradeNeeded
      for k, v of @upgradeNeeded
        @metadata[k] = v
      @db.metadata.update(@metadata)

    Zotero.debug('DB.initialize: ready')

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

  save: (mode) ->
    Zotero.BetterBibTeX.debug('DB.save:', {mode, serialized: @serialized.data.length})
    throw new Error("Unexpected mode '#{mode}'") unless mode in ['main', 'all', 'force']

    if mode in ['force', 'all']
      Zotero.BetterBibTeX.debug('purging cache: start')
      try
        for id, timestamp of @cacheAccess
          item = @cache.get(id)
          continue unless item
          item.accessed = timestamp
          @cache.update(item)
        if @metadata.cacheReap < @cacheExpiry
          @metadata.cacheReap = Date.now()
          @db.metadata.update(@metadata)
          @cache.removeWhere((o) => (o.accessed || 0) < @cacheExpiry)
      catch err
        Zotero.BetterBibTeX.error('failed to purge cache:', {message: err.message || err.name}, err)

      if mode == 'force' || @db.volatile.autosaveDirty()
        @db.volatile.save((err) ->
          if err
            Zotero.BetterBibTeX.error('error saving cache:', err)
            throw(err)
        )
        @db.volatile.autosaveClearFlags()

    if mode == 'force' || @db.main.autosaveDirty()
      @db.main.save((err) ->
        if err
          Zotero.BetterBibTeX.error('error saving DB:', err)
          throw(err)
      )
      @db.main.autosaveClearFlags()

  SQLite:
    Set: (values) -> '(' + ('' + v for v in values).join(', ') + ')'
