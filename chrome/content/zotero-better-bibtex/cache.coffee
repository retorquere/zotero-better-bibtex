Zotero.BetterBibTeX.auto = {}

Zotero.BetterBibTeX.auto.add = (state) ->
  Zotero.DB.query("insert into betterbibtex.autoexport (collection_id, collection_name, path, context, recursive, status)
                               values (?, ?, ?, ?, ?, 'done')", [state.collection.id, state.collection.name, state.target, state.context, @recursive()])
  return

Zotero.BetterBibTeX.auto.recursive = ->
  try
    return if Zotero.Prefs.get('recursiveCollections') then 'true' else 'false'
  catch
  return 'undefined'

Zotero.BetterBibTeX.auto.process = (reason) ->
  return if @running
  switch Zotero.BetterBibTeX.pref.get('auto-export')
    when 'off', 'disabled'  then return
    when 'idle' then return unless @idle

  Zotero.BetterBibTeX.log("Auto-export: #{reason}")

  ae = Zotero.DB.rowQuery("select * from betterbibtex.autoexport where status == 'pending' limit 1")
  return unless ae
  @running = '' + ae.id

  translation = new Zotero.Translate.Export()
  translation.setCollection(Zotero.Collections.get(ae.collection_id))
  translation.setLocation(ae.path) # TODO: nsiFile
  translation.setTranslator(ae.translatorID)
  translation.setDisplayOptions(JSON.parse(ae.context))

  translation.setHandler('done', (obj, worked) ->
    Zotero.DB.query('update betterbibtex.autoexport set status = ? where id = ?', [(if worked then 'done' else 'error'), Zotero.BetterBibTeX.auto.running])
    Zotero.BetterBibTeX.auto.running = null
    Zotero.BetterBibTeX.auto.process(reason)
    return
  )
  translation.translate()
  return

Zotero.BetterBibTeX.cache = {}

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
    for own context, accesstime of access
      Zotero.DB.query("update betterbibtex.cache set lastaccess = ? where itemID = ? and context = ?", [accesstime.toISOString().substring(0, 19).replace('T', ' '), itemID, context])
  @stats.access = {}
  Zotero.DB.query("delete from betterbibtex.cache where lastaccess < datetime('now','-1 month')")
  return

Zotero.BetterBibTeX.cache.fetch = (context, itemID) ->
  if context._sandboxManager
    context = arguments[1]
    itemID = arguments[2]

  for cached in Zotero.DB.query('select citekey, entry, bbtaccess(itemID, context) from betterbibtex.cache where context = ? and itemID = ?', [context, itemID])
    @stats.access[itemID] ?= {}
    @stats.access[itemID][context] = Date.now()
    cached = {citekey: cached.citekey, entry: cached.entry}
    throw("Malformed cache entry! #{cached}") unless cached.citekey && cached.entry
    @stats.hits += 1
    Zotero.BetterBibTeX.log('::: found cache entry', cached)
    return cached
  @stats.misses += 1
  return null

Zotero.BetterBibTeX.cache.store = (context, itemid, citekey, entry) ->
  if context._sandboxManager
    context = arguments[1]
    itemid = arguments[2]
    citekey = arguments[3]
    entry = arguments[4]

  @stats.stores += 1
  Zotero.BetterBibTeX.log('::: caching entry', [context, itemid, citekey, entry])
  Zotero.DB.query("insert or replace into betterbibtex.cache (context, itemid, citekey, entry, lastaccess) values (?, ?, ?, ?, CURRENT_TIMESTAMP)", [context, itemid, citekey, entry])
  return null
