Zotero.BetterBibTeX.cache = new class
  constructor: ->
    @cache = Zotero.BetterBibTeX.Cache.addCollection('cache')
    @access = Zotero.BetterBibTeX.Cache.addCollection('access')

    @log = Zotero.BetterBibTeX.log
    @__exposedProps__ = {
      fetch: 'r'
      store: 'r'
    }
    for own key, value of @__exposedProps__
      @[key].__exposedProps__ = []

  integer: (v) ->
    return v if typeof v == 'number'
    _v = parseInt(v)
    throw new Error("#{v} is not an integer-string") if isNaN(_v)
    return _v

  load: ->
    size = 0
    for item in Zotero.DB.query('select * from betterbibtex.cache')
      size += 1
      @cache.insert({
        itemID: @integer(item.itemID)
        exportCharset: item.exportCharset
        exportCollections: (item.exportCollections == 'true')
        exportFileData: (item.exportFileData == 'true')
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
    Zotero.BetterBibTeX.log("export cache: loaded #{size} items")

  remove: (what) ->
    what.itemID = @integer(what.itemID) unless what.itemID == undefined
    @cache.removeWhere(what)

  reset: ->
    Zotero.DB.query('delete from betterbibtex.cache')
    @cache.removeDataOnly()
    @cache.flushChanges()
    @access.removeDataOnly()
    @access.flushChanges()

  bool: (v) -> if v then 'true' else 'false'

  flush: ->
    Zotero.DB.beginTransaction()

    Zotero.BetterBibTeX.log("export cache: flushing #{@cache.getChanges().length} changes")

    for change in @cache.getChanges()
      o = change.obj
      key = [o.itemID, o.exportCharset, @bool(o.exportCollections), @bool(o.exportFileData), @bool(o.exportNotes), @bool(o.getCollections), @bool(o.preserveBibTeXVariables), o.translatorID, @bool(o.useJournalAbbreviation)]
      switch change.operation
        when 'I', 'U'
          Zotero.DB.query("insert or update into betterbibtex.cache
                            (itemID, exportCharset, exportCollections, exportFileData, exportNotes, getCollections, preserveBibTeXVariables, translatorID, useJournalAbbreviation, citekey, bibtex, lastaccess)
                           values
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", key.concat([o.citekey, o.bibtex]))

        when 'R'
          Zotero.DB.query("delete from betterbibtex.cache
                           where itemID = ?
                           and exportCharset = ?
                           and exportCollections = ?
                           and exportFileData = ?
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

    Zotero.DB.commitTransaction()
    @cache.flushChanges()
    @access.flushChanges()

  record: (itemID, context) ->
    return {
      itemID: @integer(itemID)
      exportCharset: context.exportCharset
      exportCollections: !!context.exportCollections
      exportFileData: !!context.exportFileData
      exportNotes: !!context.exportNotes
      getCollections: !!context.getCollections
      preserveBibTeXVariables: !!context.preserveBibTeXVariables
      translatorID: context.translatorID
      useJournalAbbreviation: !!context.useJournalAbbreviation
    }

  fetch: (itemID, context) ->
    if itemID._sandboxManager
      itemID = arguments[1]
      context = arguments[1]

    # file paths vary if exportFileData is on
    return if context.exportFileData

    record = @record(itemID, context)
    cached = @cache.findOne(record)
    @access.insert(record) if cached && !@access.findOne(record)
    Zotero.BetterBibTeX.log("export cache: #{if cached then 'hit' else 'miss'} for #{itemID}")
    return cached

  store: (itemID, context, citekey, bibtex) ->
    if itemID._sandboxManager
      itemID = arguments[1]
      context = arguments[2]
      citekey = arguments[3]
      bibtex = arguments[4]

    # file paths vary if exportFileData is on
    return if context.exportFileData

    record = @record(itemID, context)
    cached = @cache.findOne(record)
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

Zotero.BetterBibTeX.auto = new class
  constructor: ->
    @bool = Zotero.BetterBibTeX.cache.bool

  add: (collection, path, context) ->
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
    return if @running
    switch Zotero.BetterBibTeX.pref.get('autoExport')
      when 'off'  then return
      when 'idle' then return unless @idle

    ae = Zotero.DB.rowQuery("select * from betterbibtex.autoexport ae where status == 'pending' limit 1")
    return unless ae
    @running = '' + ae.id

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
      Zotero.DB.query('update betterbibtex.autoexport set status = ? where id = ?', [(if worked then 'done' else 'error'), Zotero.BetterBibTeX.auto.running])
      Zotero.BetterBibTeX.auto.running = null
      Zotero.BetterBibTeX.auto.process(reason)
      return
    )
    translation.translate()
    return
