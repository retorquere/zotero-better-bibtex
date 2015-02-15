Zotero.BetterBibTeX.auto = {}

Zotero.BetterBibTeX.auto.add = (state) ->
  Zotero.BetterBibTeX.DB.query("insert into autoexport (collection_id, collection_name, path, context, recursive, status)
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
    when 'off'  then return
    when 'idle' then return unless @idle

  Zotero.BetterBibTeX.log("Auto-export: #{reason}")

  ae = Zotero.BetterBibTeX.DB.rowQuery("select * from autoexport where status == 'pending' limit 1")
  return unless ae
  @running = '' + ae.id

  translation = new Zotero.Translate.Export()
  translation.setCollection(Zotero.Collections.get(ae.collection_id))
  translation.setLocation(ae.path) # TODO: nsiFile
  translation.setTranslator(ae.translatorID)
  translation.setDisplayOptions(JSON.parse(ae.context))

  translation.setHandler('done', (obj, worked) ->
    Zotero.BetterBibTeX.DB.query('update autoexport set status = ? where id = ?', [(if worked then 'done' else 'error'), Zotero.BetterBibTeX.auto.running])
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
  }

  return @

Zotero.BetterBibTeX.cache.fetch = (context, itemid) ->
  if context._sandboxManager
    context = arguments[1]
    itemid = arguments[2]

  for cached in Zotero.BetterBibTeX.DB.query('select citekey, entry from cache where context = ? and itemid = ?', [context, itemid])
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
  Zotero.BetterBibTeX.DB.query("insert or replace into cache (context, itemid, citekey, entry) values (?, ?, ?, ?)", [context, itemid, citekey, entry])
  return null
