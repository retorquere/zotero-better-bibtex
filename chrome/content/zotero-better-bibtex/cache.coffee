Zotero.BetterBibTeX.cache = new class
  constructor: ->
    @cache = Zotero.BetterBibTeX.Cache.addCollection('cache', {disableChangesApi: false, indices: 'itemID exportCharset exportNotes getCollections translatorID useJournalAbbreviation citekey'.split(/\s+/)})
    @access = Zotero.BetterBibTeX.Cache.addCollection('access', {disableChangesApi: false, indices: 'itemID exportCharset exportNotes getCollections translatorID useJournalAbbreviation'.split(/\s+/)})

    if Zotero.BetterBibTeX.pref.get('debug')
      @cache.on('insert', (entry) -> Zotero.BetterBibTeX.debug('cache.loki insert', entry))
      @cache.on('update', (entry) -> Zotero.BetterBibTeX.debug('cache.loki update', entry))
      @cache.on('delete', (entry) -> Zotero.BetterBibTeX.debug('cache.loki delete', entry))

    @log = Zotero.BetterBibTeX.log
    @__exposedProps__ = {
      fetch: 'r'
      store: 'r'
      dump: 'r'
    }
    for own key, value of @__exposedProps__
      @[key].__exposedProps__ = []

  integer: (v) ->
    return v if typeof v == 'number'
    _v = parseInt(v)
    throw new Error("#{v} is not an integer-string") if isNaN(_v)
    return _v

  load: ->
    Zotero.BetterBibTeX.debug('cache.load')
    if Zotero.BetterBibTeX.pref.get('cacheReset') > 0
      @reset()
      Zotero.BetterBibTeX.pref.set('cacheReset', Zotero.BetterBibTeX.pref.get('cacheReset')  - 1)
      Zotero.BetterBibTeX.debug('cache.load forced reset', Zotero.BetterBibTeX.pref.get('cacheReset'), 'left')

    @cache.flushChanges()
    for item in Zotero.DB.query('select itemID, exportCharset, exportNotes, getCollections, translatorID, useJournalAbbreviation, citekey, bibtex from betterbibtex.cache')
      @cache.insert({
        itemID: @integer(item.itemID)
        exportCharset: item.exportCharset
        exportNotes: (item.exportNotes == 'true')
        getCollections: (item.getCollections == 'true')
        translatorID: item.translatorID
        useJournalAbbreviation: (item.useJournalAbbreviation == 'true')
        citekey: item.citekey
        bibtex: item.bibtex
      })
    @cache.flushChanges()
    @access.flushChanges()

  verify: (entry) ->
    return entry unless Zotero.BetterBibTeX.pref.get('debug') || Zotero.BetterBibTeX.testing

    verify = {itemID: 1, exportCharset: 'x', exportNotes: true, getCollections: true, translatorID: 'x', useJournalAbbreviation: true }

    for own key, value of entry
      switch
        when key in ['$loki', 'meta'] then # ignore

        when verify[key] == undefined
          throw new Error("Unexpected field #{key} in #{typeof entry} #{JSON.stringify(entry)}")

        when verify[key] == null
          delete verify[key]

        when typeof verify[key] == 'string' && typeof value == 'string' && value.trim() != ''
          delete verify[key]

        when typeof verify[key] == 'number' && typeof value == 'number'
          delete verify[key]

        when typeof verify[key] == 'boolean' && typeof value == 'boolean'
          delete verify[key]

        else
          throw new Error("field #{key} of #{typeof entry} #{JSON.stringify(entry)} is unexpected #{typeof value} #{value}")

    verify = Object.keys(verify)
    return entry if verify.length == 0
    throw new Error("missing fields #{verify} in #{typeof entry} #{JSON.stringify(entry)}")

  remove: (what) ->
    what.itemID = @integer(what.itemID) unless what.itemID == undefined
    @cache.removeWhere(what)

  reset: ->
    Zotero.BetterBibTeX.log("export cache: reset")
    Zotero.DB.query('delete from betterbibtex.cache')
    @cache.removeDataOnly()
    @cache.flushChanges()
    @access.removeDataOnly()
    @access.flushChanges()

  bool: (v) -> if v then 'true' else 'false'

  flush: ->
    Zotero.BetterBibTeX.log("export cache: flushing #{@cache.getChanges().length} changes")

    tip = Zotero.DB.transactionInProgress()
    Zotero.DB.beginTransaction() unless tip

    for change in @cache.getChanges()
      o = change.obj
      key = [o.itemID, o.exportCharset, @bool(o.exportNotes), @bool(o.getCollections), o.translatorID, @bool(o.useJournalAbbreviation)]
      switch change.operation
        when 'I', 'U'
          Zotero.DB.query("insert or replace into betterbibtex.cache
                            (itemID, exportCharset, exportNotes, getCollections, translatorID, useJournalAbbreviation, citekey, bibtex, lastaccess)
                           values
                            (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", key.concat([o.citekey, o.bibtex]))

        when 'R'
          Zotero.DB.query("delete from betterbibtex.cache
                           where itemID = ?
                           and exportCharset = ?
                           and exportNotes = ?
                           and getCollections = ?
                           and translatorID = ?
                           and useJournalAbbreviation = ?", key)

    for change in @access.getChanges()
      o = change.obj
      key = [o.itemID, o.translatorID, o.exportCharset, @bool(o.exportNotes), @bool(o.useJournalAbbreviation)]
      Zotero.DB.query("update betterbibtex.cache set lastaccess = CURRENT_TIMESTAMP where itemID = ? and translatorID = ? and exportCharset = ?  and exportNotes = ? and useJournalAbbreviation = ?", key)

    Zotero.DB.query("delete from betterbibtex.cache where lastaccess < datetime('now','-1 month')")

    Zotero.DB.commitTransaction() unless tip
    @cache.flushChanges()
    @access.flushChanges()

  record: (itemID, context) ->
    return @verify({
      itemID: @integer(itemID)
      exportCharset: (context.exportCharset || 'UTF-8').toUpperCase()
      exportNotes: !!context.exportNotes
      getCollections: !!context.getCollections
      translatorID: context.translatorID
      useJournalAbbreviation: !!context.useJournalAbbreviation
    })

  clone: (obj) ->
    clone = JSON.parse(JSON.stringify(obj))
    delete clone.meta
    delete clone['$loki']
    return clone

  dump: (itemIDs) ->
    itemIDs = arguments[1] if arguments[0]._sandboxManager
    itemIDs = (parseInt(id) for id in itemIDs)
    cache = (@clone(cached) for cached in @cache.where((o) -> o.itemID in itemIDs))
    return cache

  fetch: ->
    return unless Zotero.BetterBibTeX.pref.get('caching')
    [itemID, context] = (if arguments[0]._sandboxManager then Array.slice(arguments, 1) else arguments)

    # file paths vary if exportFileData is on
    if context.exportFileData
      Zotero.BetterBibTeX.debug("cache.fetch for #{itemID} rejected as file data is being exported")
      return

    record = @record(itemID, context)
    cached = @cache.findObject(record)

    @access.insert(record) if cached && !@access.findObject(record)
    Zotero.BetterBibTeX.debug("cache.fetch", (if cached then 'hit' else 'miss'), 'for', Zotero.BetterBibTeX.log.object(record), ':', cached)
    return cached

  store: ->
    [itemID, context, citekey, bibtex] = (if arguments[0]._sandboxManager then Array.slice(arguments, 1) else arguments)

    # file paths vary if exportFileData is on
    if context.exportFileData
      Zotero.BetterBibTeX.debug("cache.store for #{itemID} rejected as file data is being exported")
      return

    record = @record(itemID, context)
    cached = @cache.findObject(record)
    if cached
      cached.citekey = citekey
      cached.bibtex = bibtex
      cached.lastaccess = Date.now()
      @cache.update(cached)
    else
      record.citekey = citekey
      record.bibtex = bibtex
      record.lastaccess = Date.now()
      @cache.insert(record)
    Zotero.BetterBibTeX.debug('cache.store', (if cached then 'replace' else 'insert'), 'for', Zotero.BetterBibTeX.log.object(record))

Zotero.BetterBibTeX.auto = new class
  constructor: ->
    @bool = Zotero.BetterBibTeX.cache.bool

  refresh: ->
    wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
    enumerator = wm.getEnumerator('zotero:pref')
    if enumerator.hasMoreElements()
      win = enumerator.getNext()
      win.BetterBibTeXAutoExportPref.refresh(true)

  add: (collection, path, context) ->
    Zotero.BetterBibTeX.debug("auto-export set up for #{collection} to #{path}")
    Zotero.DB.query("insert or replace into betterbibtex.autoexport (collection, path, translatorID, exportCharset, exportNotes, useJournalAbbreviation, exportedRecursively, status)
               values (?, ?, ?, ?, ?, ?, ?, 'done')", [
                collection,
                path,
                context.translatorID,
                (context.exportCharset || 'UTF-8').toUpperCase(),
                @bool(context.exportNotes),
                @bool(context.useJournalAbbreviation),
                @bool(@recursive())])
    @refresh()

  recursive: ->
    try
      return if Zotero.Prefs.get('recursiveCollections') then 'true' else 'false'
    catch
    return 'undefined'

  clear: ->
    Zotero.DB.query("delete from betterbibtex.autoexport")
    @refresh()

  reset: ->
    Zotero.DB.query("update betterbibtex.autoexport set status='pending'")
    @refresh()

  process: (reason) ->
    Zotero.BetterBibTeX.debug("auto.process: started (#{reason})")

    if @running
      Zotero.BetterBibTeX.debug('auto.process: export already running')
      return

    switch Zotero.BetterBibTeX.pref.get('autoExport')
      when 'off'
        Zotero.BetterBibTeX.debug('auto.process: off')
        return
      when 'idle'
        if !@idle
          Zotero.BetterBibTeX.debug('auto.process: not idle')
          return

    skip = {error: [], done: []}
    translation = null
    for ae in Zotero.DB.query("select * from betterbibtex.autoexport ae where status == 'pending'")
      Zotero.BetterBibTeX.debug('auto.process: candidate', Zotero.BetterBibTeX.log.object(ae))
      path = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile)
      path.initWithPath(ae.path)

      if !(path.exists() && path.isFile() && path.isWritable())
        Zotero.BetterBibTeX.debug('auto.process: candidate path not writable', path.path)
        skip.error.push(ae.id)
        continue

      if !(path.parent.exists() && path.parent.isDirectory() && path.isWritable())
        Zotero.BetterBibTeX.debug('auto.process: candidate path not writable', path.path)
        skip.error.push(ae.id)
        continue

      if m = /^library(:([0-9]+))?$/.exec(ae.collection)
        items = Zotero.Items.getAll(false, m[2])
        if !items || items.length == 0
          Zotero.BetterBibTeX.debug('auto.process: empty library')
          skip.done.push(ae.id)
          continue
      else
        items = null

      continue if translation

      Zotero.BetterBibTeX.debug('auto.process: candidate picked:', Zotero.BetterBibTeX.log.object(ae))
      translation = new Zotero.Translate.Export()

      if items
        translation.setItems(items)
      else
        translation.setCollection(Zotero.Collections.get(ae.collection))

      translation.setLocation(path)
      translation.setTranslator(ae.translatorID)

      translation.setDisplayOptions({
        exportCharset: ae.exportCharset
        exportNotes: (ae.exportNotes == 'true')
        useJournalAbbreviation: (ae.useJournalAbbreviation == 'true')
      })
      @running = '' + ae.id

    for own status, ae of skip
      continue if ae.length == 0
      Zotero.DB.query("update betterbibtex.autoexport set status = ? where id in #{Zotero.BetterBibTeX.SQLSet(ae)}", [status])

    if !translation
      Zotero.BetterBibTeX.debug('auto.process: no pending jobs')
      return

    Zotero.BetterBibTeX.debug('auto.process: starting', Zotero.BetterBibTeX.log.object(ae))
    @refresh()

    translation.setHandler('done', (obj, worked) ->
      status = (if worked then 'done' else 'error')
      Zotero.BetterBibTeX.debug("auto.process: finished #{Zotero.BetterBibTeX.auto.running}: #{status}")
      Zotero.DB.query('update betterbibtex.autoexport set status = ? where id = ?', [status, Zotero.BetterBibTeX.auto.running])
      Zotero.BetterBibTeX.auto.running = null
      Zotero.BetterBibTeX.auto.refresh()
      Zotero.BetterBibTeX.auto.process(reason)
    )
    translation.translate()
