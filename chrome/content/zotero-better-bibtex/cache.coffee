Zotero.BetterBibTeX.auto = {}

Zotero.BetterBibTeX.auto.add = (collectionID, path, options) ->
  eo = Zotero.BetterBibTeX.cache.exportOptions(options)
  Zotero.DB.query("insert or replace into betterbibtex.autoexport (collection, path, exportOptions, exportedRecursively, status)
                  values (?, ?, ?, ?, 'done')", [collectionID, path, eo, "#{!!@recursive()}"])
  return

Zotero.BetterBibTeX.auto.recursive = ->
  try
    return if Zotero.Prefs.get('recursiveCollections') then 'true' else 'false'
  catch
  return 'undefined'

Zotero.BetterBibTeX.auto.process = (reason) ->
  return if @running
  switch Zotero.BetterBibTeX.pref.get('autoExport')
    when 'off'  then return
    when 'idle' then return unless @idle

  Zotero.BetterBibTeX.log("Auto-export: #{reason}")

  ae = Zotero.DB.rowQuery("select *
                           from betterbibtex.autoexport ae
                           join betterbibtex.exportoptions eo on ae.exportoptions = eo.id
                           where status == 'pending' limit 1")
  return unless ae
  @running = '' + ae.id

  translation = new Zotero.Translate.Export()
  translation.setCollection(Zotero.Collections.get(ae.collection)) if ae.collection != 'library'

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

Zotero.BetterBibTeX.cache = {}

Zotero.BetterBibTeX.cache.exportOptions = (options) ->
  # insert or replace would have been easier, but sqlite bumps the auto-inc for every time we do this (which is often
  # for cache stores)
  params = [
    options.translatorID
    (options.exportCharset || 'UTF-8').toUpperCase()
    "#{!!options.exportNotes}"
    "#{!!(options['Preserve BibTeX Variables'] || options.preserveBibTeXVariables)}"
    "#{!!options.useJournalAbbreviation}"
  ]
  @exportOptionsCache ?= {}
  key = params.join('::')
  return @exportOptionsCache[key] if @exportOptionsCache[key]

  id = Zotero.DB.valueQuery('select id
                             from betterbibtex.exportoptions
                             where translatorID = ? and exportCharset = ? and exportNotes = ? and preserveBibTeXVariables = ? and useJournalAbbreviation = ?', params)
  if not id
    id = Zotero.DB.query('insert into betterbibtex.exportoptions (translatorID, exportCharset, exportNotes, preserveBibTeXVariables, useJournalAbbreviation)
                          values (?, ?, ?, ?, ?)', params)
  @exportOptionsCache[key] = id
  return id

Zotero.BetterBibTeX.cache.init = ->
  @__exposedProps__ = {
    fetch: 'r'
    store: 'r'
  }
  for own key, value of @__exposedProps__
    @[key].__exposedProps__ = []

  @stats = {
    hits: 0
    misses: 0
    stores: 0
    access: {}
  }

  return @

Zotero.BetterBibTeX.cache.reap = ->
  for own itemID, access of @stats.access
    for own options, accesstime of access
      Zotero.DB.query("update betterbibtex.cache set lastaccess = ? where itemID = ? and exportoptions = ?", [accesstime.toISOString().substring(0, 19).replace('T', ' '), itemID, options])
  @stats.access = {}
  Zotero.DB.query("delete from betterbibtex.cache where lastaccess < datetime('now','-1 month')")
  return

Zotero.BetterBibTeX.cache.fetch = (options, itemID) ->
  if options._sandboxManager
    options = arguments[1]
    itemID = arguments[2]

  eo = @exportOptions(options)
  cached = Zotero.DB.rowQuery('select citekey, entry, exportoptions from betterbibtex.cache where itemID = ? and exportoptions = ?', [itemID, eo])
  if cached?.citekey && cached?.entry
    @stats.access[itemID] ?= {}
    @stats.access[itemID][cached.exportoptions] = Date.now()
    @stats.hits += 1
    Zotero.BetterBibTeX.log('::: found cache entry', cached)
    return cached

  @stats.misses += 1
  return null

Zotero.BetterBibTeX.cache.store = (options, itemid, citekey, entry) ->
  if options._sandboxManager
    options = arguments[1]
    itemid = arguments[2]
    citekey = arguments[3]
    entry = arguments[4]

  @stats.stores += 1

  eo = Zotero.BetterBibTeX.cache.exportOptions(options)
  Zotero.DB.query("insert or replace into betterbibtex.cache (exportoptions, itemid, citekey, entry, lastaccess) values (?, ?, ?, ?, CURRENT_TIMESTAMP)", [eo, itemid, citekey, entry])
  return
