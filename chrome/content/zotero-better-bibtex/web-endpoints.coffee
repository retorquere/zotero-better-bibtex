Zotero.BetterBibTeX.endpoints = { }
Zotero.BetterBibTeX.endpoints.collection = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.collection.init = (url, data, sendResponseCallback) ->
  try
    collection = url.query['']
  catch err
    collection = null

  if not collection
    sendResponseCallback(501, 'text/plain', 'Could not export bibliography: no path')
    return

  try
    path = collection.split('.')
    if path.length == 1
      sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{collection}': no format specified")
      return

    translator = path.pop().toLowerCase()
    translator = Zotero.BetterBibTeX.Translators.getID(translator) || Zotero.BetterBibTeX.Translators.getID('better' + translator)
    path = path.join('.')
    path = "/0/#{path}" if path.charAt(0) != '/'
    path = path.split('/')
    ### removes empty field before first '/' ###
    path.shift()

    libid = parseInt(path.shift())
    throw "Not a valid library ID: #{collectionkey}" if isNaN(libid)

    key = '' + path[0]
    col = null
    for name in path
      children = Zotero.getCollections(col?.id, false, libid)
      col = null
      for child in children
        if child.name.toLowerCase() is name.toLowerCase()
          col = child
          break
      if not col then break
    col ||= Zotero.Collections.getByLibraryAndKey(libid, key)
    throw "#{collectionkey} not found" unless col

    Zotero.BetterBibTeX.Translators.translate(translator, {collection: col}, Zotero.BetterBibTeX.displayOptions(url)).then((result) ->
      sendResponseCallback(200, 'text/plain', result)
    ).catch((err) ->
      sendResponseCallback(500, 'text/plain', '' + err)
    )

  catch err
    Zotero.BetterBibTeX.log("Could not export bibliography '#{collection}", err)
    sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{collection}': #{err}")

Zotero.BetterBibTeX.endpoints.library = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.library.init = (url, data, sendResponseCallback) ->
  try
    library = url.query['']
  catch err
    library = null

  if not library
    sendResponseCallback(501, 'text/plain', 'Could not export bibliography: no path')
    return

  try
    params = /^\/?([0-9]+)?\/?library.(.*)$/.exec(library)

    libid = params[1]
    format = params[2]

    if libid && not Zotero.Libraries.exists(libid)
      sendResponseCallback(404, 'text/plain', "Could not export bibliography: library '#{library}' does not exist")
      return

    if !format
      sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{library}': no format specified")
      return

    translator = Zotero.BetterBibTeX.Translator.getID(format)
    if !translator
      sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{library}': unsupported format #{format}")
      return

    Zotero.BetterBibTeX.Translators.translate(translator, {library: libid}, Zotero.BetterBibTeX.displayOptions(url)).then((result) ->
      sendResponseCallback(200, 'text/plain', result)
    ).catch((err) ->
      sendResponseCallback(500, 'text/plain', '' + err)
    )

  catch err
    Zotero.BetterBibTeX.log("Could not export bibliography '#{library}'", err)
    sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{library}': #{err}")

Zotero.BetterBibTeX.endpoints.selected = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.selected.init = (url, data, sendResponseCallback) ->
  try
    translator = url.query['']
  catch err
    translator = null

  if not translator
    sendResponseCallback(501, 'text/plain', 'Could not export bibliography: no path')
    return

  zoteroPane = Zotero.getActiveZoteroPane()
  items = Zotero.Items.get((item.id for item of zoteroPane.getSelectedItems()))

  Zotero.BetterBibTeX.Translators.translate(Zotero.BetterBibTeX.Translators.getID(translator), {items}, Zotero.BetterBibTeX.displayOptions(url)).then((result) ->
    sendResponseCallback(200, 'text/plain', result)
  ).catch((err) ->
    sendResponseCallback(500, 'text/plain', '' + err)
  )

Zotero.BetterBibTeX.endpoints.schomd = { supportedMethods: ['POST'] }
Zotero.BetterBibTeX.endpoints.schomd.init = (url, data, sendResponseCallback) ->
  req = JSON.parse(data)
  response = []

  throw new Error('batch requests are not supported') if Array.isArray(req)

  try
    ### the schomd methods search by citekey -- the cache needs to be fully primed for this to work ###
    Zotero.BetterBibTeX.keymanager.prime()

    result = Zotero.BetterBibTeX.schomd['jsonrpc_' + req.method].apply(Zotero.BetterBibTeX.schomd, req.params)
    if typeof result?.then == 'function'
      result = result.then((result) ->
        return JSON.stringify({
          jsonrpc: (if req.jsonrpc then req.jsonrpc else undefined)
          id: (if req.id || (typeof req.id) == 'number' then req.id else null)
          result
        })
      ).catch((e) ->
        return JSON.stringify({
          jsonrpc: (if req.jsonrpc then req.jsonrpc else undefined)
          id: (if req.id || (typeof req.id) == 'number' then req.id else null)
          result: e.message || e.name
        })
      )
    else
      result = JSON.stringify({
        jsonrpc: (if req.jsonrpc then req.jsonrpc else undefined)
        id: (if req.id || (typeof req.id) == 'number' then req.id else null)
        result
      })
  catch err
    result = JSON.stringify({jsonrpc: '2.0', error: {code: 5000, message: '' + err + "\n" + err.stack}, id: null})

  return sendResponseCallback(200, 'application/json', result)

Zotero.BetterBibTeX.endpoints.cayw = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.cayw.init = (url, data, sendResponseCallback) ->
  if url.query.probe
    sendResponseCallback(200, 'text/plain', 'ready')
    return

  doc = new Zotero.BetterBibTeX.CAYW.Document(url.query || {})

  deferred = Q.defer()

  io = new Zotero.BetterBibTeX.CAYW.CitationEditInterface(deferred, url.query || {}, doc)
  if Zotero.Prefs.get('integration.useClassicAddCitationDialog')
    Zotero.Integration.displayDialog(doc, 'chrome://zotero/content/integration/addCitationDialog.xul', 'alwaysRaised,resizable', io)
  else
    mode = if !Zotero.isMac and Zotero.Prefs.get('integration.keepAddCitationDialogRaised') then 'popup' else 'alwaysRaised'
    Zotero.Integration.displayDialog(doc, 'chrome://zotero/content/integration/quickFormat.xul', mode, io)

  deferred.promise.then(
    ((value) -> sendResponseCallback(200, 'text/plain', value)),
    ((reason) -> sendResponseCallback(500, 'text/plain', '' + reason)),
  )

Zotero.BetterBibTeX.endpoints.cacheActivity =
  supportedMethods: ['GET']
  init: (url, data, sendResponseCallback) ->
    try
      dataURL = url.query['']
    catch err
      dataURL = null

    if dataURL
      # someone thinks HTML-loaded javascripts are harmful. If that were true, you have bigger problems than this
      # people.
      return sendResponseCallback(200, 'text/html', Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/reports/cacheActivity.txt'))

    Zotero.BetterBibTeX.addCacheHistory()
    timestamp = (date) ->
      date = [date.getHours(), date.getMinutes(), date.getSeconds()]
      date = (('0' + dp).slice(-2) for dp in date)
      return date.join(':')
    data = ([timestamp(dp.timestamp), dp.serialized.hit, dp.serialized.miss, dp.serialized.clear, dp.cache.hit, dp.cache.miss, dp.cache.clear] for dp in Zotero.BetterBibTeX.cacheHistory)

    return sendResponseCallback(200, 'application/json', JSON.stringify(data))
