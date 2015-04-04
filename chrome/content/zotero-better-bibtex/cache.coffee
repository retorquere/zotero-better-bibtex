Zotero.BetterBibTeX.auto = {}

Zotero.BetterBibTeX.auto.add = (collection, path, options) ->
  o = Zotero.BetterBibTeX.cache.exportOptions(options)
  id = Zotero.DB.query('insert or replace into betterbibtex.exportoptions (translatorID, exportCharset, exportNotes, preserveBibTeXVariables, useJournalAbbreviation)
                         values (?, ?, ?, ?, ?)', [o.translatorID, o.exportCharset, o.exportNotes, o.preserveBibTeXVariables, o.useJournalAbbreviation])
  Zotero.DB.query("insert or replace into betterbibtex.autoexport (collection, path, exportoptions, includeChildCollections, status)
                  values (?, ?, ?, ?, 'done')", [state.collection.id, state.target, id, "#{!!@recursive()}"])
  return

Zotero.BetterBibTeX.auto.recursive = ->
  try
    return if Zotero.Prefs.get('recursiveCollections') then 'true' else 'false'
  catch
  return 'undefined'

Zotero.BetterBibTeX.auto.process = (reason) ->
  return if @running
  switch Zotero.BetterBibTeX.pref.get('autoExport')
    when 'off', 'disabled'  then return
    when 'idle' then return unless @idle

  Zotero.BetterBibTeX.log("Auto-export: #{reason}")

  ae = Zotero.DB.rowQuery("select *
                           from betterbibtex.autoexport ae
                           join betterbibtex.exportoptions eo on ae.exportoptions = eo.id
                           where status == 'pending' limit 1")
  return unless ae
  @running = '' + ae.id

  translation = new Zotero.Translate.Export()
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

Zotero.BetterBibTeX.cache = {}

Zotero.BetterBibTeX.cache.exportOptions = (options) ->
  o = {}
  for own key, value of options
    key = key.replace(' ', '')
    key = key.charAt(0).toLowerCase() + key.slice(1)
    o[key] = switch key
      when 'exportCharset' then (value || 'UTF-8').toUpperCase()
      when 'exportNotes', 'preserveBibTeXVariables', 'useJournalAbbreviation' then "#{!!value}"
      when 'translatorID' then value || ''
  return o

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

  o = @exportOptions(options)
  cached = Zotero.DB.rowQuery('select citekey, entry, exportoptions
                               from betterbibtex.cache c
                               join betterbibtex.exportoptions eo on eo.id = c.exportoptions
                               where itemID = ?
                                and translatorID = ? exportCharset = ? and exportNotes = ? and preserveBibTeXVariables = ? and useJournalAbbreviation = ?', [
                               itemID, o.translatorID, o.exportCharset, o.exportNotes, o.preserveBibTeXVariables, o.useJournalAbbreviation])
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

  o = Zotero.BetterBibTeX.cache.exportOptions(options)
  id = Zotero.DB.query('insert or replace into betterbibtex.exportoptions (translatorID, exportCharset, exportNotes, preserveBibTeXVariables, useJournalAbbreviation)
                         values (?, ?, ?, ?)', [o.translatorID, o.exportCharset, o.exportNotes, o.preserveBibTeXVariables, o.useJournalAbbreviation])
  Zotero.DB.query("insert or replace into betterbibtex.cache (exportoptions, itemid, citekey, entry, lastaccess) values (?, ?, ?, ?, CURRENT_TIMESTAMP)", [id, itemid, citekey, entry])
  return null
