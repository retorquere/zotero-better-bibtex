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
    for item in Zotero.DB.query('select * from betterbibtex.cache')
      @cache.insert({
        itemID: @integer(item.itemID)
        translatorID: item.translatorID
        exportCharset: (item.exportCharset || 'UTF-8').toUpperCase()
        exportNotes: (item.exportNotes == 'true')
        preserveBibTeXVariables: (item.preserveBibTeXVariables == 'true')
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
    Zotero.DB.query('delete from betterbibtex.cache')
    @cache.removeDataOnly()
    @cache.flushChanges()
    @access.removeDataOnly()
    @access.flushChanges()

  bool: (v) -> if v then 'true' else 'false'

  flush: ->
    Zotero.DB.beginTransaction()

    for change in @cache.getChanges()
      o = change.obj
      key = [o.itemID, o.translatorID, o.exportCharset, @bool(o.exportNotes), @bool(o.preserveBibTeXVariables), @bool(o.useJournalAbbreviation)]
      switch change.operation
        when 'I', 'U'
          Zotero.DB.query("insert or update into betterbibtex.cache
                            (itemID, translatorID, exportCharset, exportNotes, preserveBibTeXVariables, useJournalAbbreviation, citekey, bibtex, lastaccess)
                           values
                            (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", key.concat([o.citekey, o.bibtex]))

        when 'R'
          Zotero.DB.query("delete from betterbibtex.cache where itemID = ? and translatorID = ? and exportCharset = ?  and exportNotes = ? and preserveBibTeXVariables = ? and useJournalAbbreviation = ?", key)

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
      translatorID: context.translatorID
      exportCharset: (context.exportCharset || 'UTF-8').toUpperCase()
      exportNotes: !!context.exportNotes
      preserveBibTeXVariables: !!context.preserveBibTeXVariables
      useJournalAbbreviation: !!context.useJournalAbbreviation
    }

  fetch: (itemID, context) ->
    if itemID._sandboxManager
      itemID = arguments[1]
      context = arguments[1]

    record = @record(itemID, context)
    cached = @cache.findOne(record)
    @access.insert(record) if cached && !@access.findOne(record)
    return cached

  store: (itemID, context, citekey, bibtex) ->
    if itemID._sandboxManager
      itemID = arguments[1]
      context = arguments[2]
      citekey = arguments[3]
      bibtex = arguments[4]

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
