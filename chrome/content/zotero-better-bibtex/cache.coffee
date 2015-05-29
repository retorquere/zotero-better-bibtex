Zotero.BetterBibTeX.cache = new class
  constructor: ->
    @cache = Zotero.BetterBibTeX.Cache.addCollection('cache', {disableChangesApi: false})
    @access = Zotero.BetterBibTeX.Cache.addCollection('access', {disableChangesApi: false})

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
    @cache.flushChanges()
    for item in Zotero.DB.query('select itemID, exportCharset, exportNotes, getCollections, preserveBibTeXVariables, translatorID, useJournalAbbreviation, citekey, bibtex from betterbibtex.cache')
      @cache.insert({
        itemID: @integer(item.itemID)
        exportCharset: item.exportCharset
        exportNotes: (item.exportNotes == 'true')
        getCollections: (item.getCollections == 'true')
        preserveBibTeXVariables: (item.preserveBibTeXVariables == 'true')
        translatorID: item.translatorID
        useJournalAbbreviation: (item.useJournalAbbreviation == 'true')
        citekey: item.citekey
        bibtex: item.bibtex
      })
    @cache.flushChanges()
    @access.flushChanges()

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
      key = [o.itemID, o.exportCharset, @bool(o.exportNotes), @bool(o.getCollections), @bool(o.preserveBibTeXVariables), o.translatorID, @bool(o.useJournalAbbreviation)]
      switch change.operation
        when 'I', 'U'
          Zotero.DB.query("insert or replace into betterbibtex.cache
                            (itemID, exportCharset, exportNotes, getCollections, preserveBibTeXVariables, translatorID, useJournalAbbreviation, citekey, bibtex, lastaccess)
                           values
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", key.concat([o.citekey, o.bibtex]))

        when 'R'
          Zotero.DB.query("delete from betterbibtex.cache
                           where itemID = ?
                           and exportCharset = ?
                           and exportNotes = ?
                           and getCollections = ?
                           and preserveBibTeXVariables = ?
                           and translatorID = ?
                           and useJournalAbbreviation = ?", key)

    for change in @access.getChanges()
      o = change.obj
      key = [o.itemID, o.translatorID, o.exportCharset, @bool(o.exportNotes), @bool(o.preserveBibTeXVariables), @bool(o.useJournalAbbreviation)]
      Zotero.DB.query("update betterbibtex.cache set lastaccess = CURRENT_TIMESTAMP where itemID = ? and translatorID = ? and exportCharset = ?  and exportNotes = ? and preserveBibTeXVariables = ? and useJournalAbbreviation = ?", key)

    Zotero.DB.query("delete from betterbibtex.cache where lastaccess < datetime('now','-1 month')")

    Zotero.DB.commitTransaction() unless tip
    @cache.flushChanges()
    @access.flushChanges()

  record: (itemID, context) ->
    throw new Error("No translator ID supplied in #{JSON.stringify(Object.keys(context))}") unless context.translatorID
    return {
      itemID: @integer(itemID)
      exportCharset: (context.exportCharset || 'UTF-8').toUpperCase()
      exportNotes: !!context.exportNotes
      getCollections: !!context.getCollections
      preserveBibTeXVariables: !!context.preserveBibTeXVariables
      translatorID: context.translatorID
      useJournalAbbreviation: !!context.useJournalAbbreviation
    }

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

  fetch: (itemID, context) ->
    [itemID, context] = Array.slice(arguments, 1, 3) if arguments[0]._sandboxManager

    # file paths vary if exportFileData is on
    if context.exportFileData
      Zotero.BetterBibTeX.debug("cache fetch for #{itemID} rejected as file data is being exported")
      return

    record = @record(itemID, context)
    cached = @cache.findOne(record)
    @access.insert(record) if cached && !@access.findOne(record)
    Zotero.BetterBibTeX.debug("cache fetch for #{itemID}", if cached then 'hit' else 'miss')
    return cached

  store: (itemID, context, citekey, bibtex) ->
    [itemID, context, citekey, bibtex] = Array.slice(arguments, 1, 5) if arguments[0]._sandboxManager

    # file paths vary if exportFileData is on
    if context.exportFileData
      Zotero.BetterBibTeX.debug("cache store for #{itemID} rejected as file data is being exported")
      return

    record = @record(itemID, context)
    cached = @cache.findOne(record)
    if cached
      cached.citekey = citekey
      cached.bibtex = bibtex
      cached.lastaccess = Date.now()
      @cache.update(cached)
      Zotero.BetterBibTeX.debug("cache store for #{itemID}: replace")
    else
      record.citekey = citekey
      record.bibtex = bibtex
      record.lastaccess = Date.now()
      @cache.insert(record)
      Zotero.BetterBibTeX.debug("cache store for #{itemID}: insert")

Zotero.BetterBibTeX.auto = new class
  constructor: ->
    @bool = Zotero.BetterBibTeX.cache.bool

  add: (collection, path, context) ->
    Zotero.BetterBibTeX.debug("auto-export set up for #{collection} to #{path}")
    Zotero.DB.query("insert or replace into betterbibtex.autoexport (collection, path, translatorID, exportCharset, exportNotes, preserveBibTeXVariables, useJournalAbbreviation, exportedRecursively, status)
               values (?, ?, ?, ?, ?, ?, ?, ?, 'done')", [
                collection,
                path,
                context.translatorID,
                (context.exportCharset || 'UTF-8').toUpperCase(),
                @bool(context.exportNotes),
                @bool(context.preserveBibTeXVariables),
                @bool(context.useJournalAbbreviation),
                @bool(@recursive())])

  recursive: ->
    try
      return if Zotero.Prefs.get('recursiveCollections') then 'true' else 'false'
    catch
    return 'undefined'

  clear: ->
    Zotero.DB.query("delete from betterbibtex.autoexport")

  reset: ->
    Zotero.DB.query("update betterbibtex.autoexport set status='pending'")

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

    ae = Zotero.DB.rowQuery("select * from betterbibtex.autoexport ae where status == 'pending' limit 1")
    if ae
      @running = '' + ae.id
      Zotero.BetterBibTeX.debug('auto.process: starting', Zotero.BetterBibTeX.log.object(ae))
    else
      Zotero.BetterBibTeX.debug('auto.process: no pending jobs')
      return

    translation = new Zotero.Translate.Export()

    if m = /^library(:([0-9]+))?$/.exec(ae.collection)
      items = Zotero.Items.get(false, m[2])
      translation.setItems(items)

    else
      translation.setCollection(Zotero.Collections.get(ae.collection))

    path = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile)
    path.initWithPath(ae.path)
    translation.setLocation(path)
    translation.setTranslator(ae.translatorID)

    translation.setDisplayOptions({
      exportCharset: ae.exportCharset
      exportNotes: (ae.exportNotes == 'true')
      'Preserve BibTeX Variables': (ae.preserveBibTeXVariables == 'true')
      useJournalAbbreviation: (ae.useJournalAbbreviation == 'true')
    })

    translation.setHandler('done', (obj, worked) ->
      status = (if worked then 'done' else 'error')
      Zotero.BetterBibTeX.debug("auto.process: finished #{Zotero.BetterBibTeX.auto.running}: #{status}")
      Zotero.DB.query('update betterbibtex.autoexport set status = ? where id = ?', [status, Zotero.BetterBibTeX.auto.running])
      Zotero.BetterBibTeX.auto.running = null
      Zotero.BetterBibTeX.auto.process(reason)
    )
    translation.translate()
