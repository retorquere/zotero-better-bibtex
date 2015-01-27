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

    translator = path.pop()
    path = path.join('.')
    path = "/0/#{path}" if path.charAt(0) != '/'
    path = path.split('/')
    path.shift() # removes empty field before first '/'

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
    col ?= Zotero.Collections.getByLibraryAndKey(libid, key)
    throw "#{collectionkey} not found" unless col

    bibtex = Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {collection: col}, Zotero.BetterBibTeX.displayOptions(url))
    sendResponseCallback(200, 'text/plain', bibtex)

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

    translator = Zotero.BetterBibTeX.getTranslator(format)
    if !translator
      sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{library}': unsupported format #{format}")
      return

    Zotero.BetterBibTeX.log("Exporting library #{libid} using #{format}")
    sendResponseCallback(200, 'text/plain', Zotero.BetterBibTeX.translate(translator, {library: libid}, Zotero.BetterBibTeX.displayOptions(url)))

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

  win = Zotero.BetterBibTeX.windowMediator.getMostRecentWindow('navigator:browser')
  items = Zotero.Items.get((item.id for item of win.ZoteroPane.getSelectedItems()))
  sendResponseCallback(200, 'text/plain', Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {items: items}, Zotero.BetterBibTeX.displayOptions(url)))
  return

Zotero.BetterBibTeX.endpoints.schomd = { supportedMethods: ['POST'] }
Zotero.BetterBibTeX.endpoints.schomd.init = (url, data, sendResponseCallback) ->
  data = JSON.parse(data)
  response = []

  if Array.isArray(data)
    batchRequest = true
  else
    data = [data]
    batchRequest = false

  for req in data
    result = {}
    result.jsonrpc = req.jsonrpc if req.jsonrpc
    result.id = if req.id || (typeof req.id) == 'number' then req.id else null

    try
      switch req.method
        when 'citation', 'bibliography'
          result.result = Zotero.BetterBibTeX.schomd[req.method].apply(Zotero.BetterBibTeX.schomd, req.params)

        else throw("Unsupported method '#{req.method}'")
    catch err
      result = {jsonrpc: '2.0', error: {code: 5000, message: '' + err + "\n" + err.stack}, id: result.id}

    response.push(result)

  response = response[0] unless batchRequest
  return sendResponseCallback(200, 'application/json', JSON.stringify(response))

Zotero.BetterBibTeX.endpoints.search = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.search.init = (url, data, sendResponseCallback) ->
  try
    query = url.query.query
  catch err
    query = null

  if not query
    sendResponseCallback(501, 'text/plain', 'No query specified')
    return

  try
    Zotero = Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject
    search = new Zotero.Search()

    # default search conditions - addCondition(condition, operator, value, required)
    search.addCondition('quicksearch-titleCreatorYear', 'contains', query, false)
#    search.addCondition('quicksearch-everything', 'contains', query, false)

    # fetching result IDs
    results = search.search()

    if not results
      Zotero.BetterBibTeX.log("No results found")
      sendResponseCallback(200, 'text/plain', JSON.stringify([]))
      return

    # fetching items using IDs
    items = Zotero.Items.get(results)

    selected = []
    for item in items
      response = {
        id: item.id
        key: item.key
        libraryKey: item.libraryKey
        title: item.getField('title')
        date: item.getField('date')
        extra: item.getField('extra')
        creators: []
      }

      for creator in item.getCreators()
        author = {}
        author.lastName = creator.ref.lastName
        author.firstName = creator.ref.firstName
        response.creators.push(author)
      selected.push(response)

    Zotero.BetterBibTeX.log("Search results for query #{query}")
    sendResponseCallback(200, 'text/plain', JSON.stringify(selected))

  catch err
    Zotero.BetterBibTeX.log("Could not perform search: #{err}", err)
    sendResponseCallback(404, 'text/plain', "Could not perform search: #{err}")

Zotero.BetterBibTeX.endpoints.item = { supportedMethods: ['POST'] }
Zotero.BetterBibTeX.endpoints.item.init = (url, data, sendResponseCallback) ->
  data = JSON.parse(data)
  response = []

  if data
    translator = if data.translator then data.translator else "betterbiblatex"
    format = if data.format then data.format else "json"
    items = switch
      when data.ids then Zotero.Items.get(data.ids)
      when data.bibtexKeys then Zotero.Items.get(Zotero.BetterBibTeX.schomd.item(data.bibtexKeys))

  try
    if format is "json"
      for item in items
        bibtex = Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {items: [item]}, Zotero.BetterBibTeX.displayOptions(url))
        obj = {
          id: item.id
          key: item.key
          bibtex: bibtex
        }
        response.push(obj)
    else
      bibtex = Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {items: items}, Zotero.BetterBibTeX.displayOptions(url))

    Zotero.BetterBibTeX.log("Exporting items #{items}")
    switch format
      when "json" then sendResponseCallback(200, 'application/json', JSON.stringify(response))
      when "text" then sendResponseCallback(200, 'plain/text', bibtex)

  catch err
    Zotero.BetterBibTeX.log("Could not export items '#{items}", err)
    sendResponseCallback(404, 'text/plain', "Could not export items '#{items}': #{err}")
