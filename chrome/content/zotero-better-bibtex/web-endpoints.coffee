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

    Zotero.BetterBibTeX.log(':::preparing to export', path)
    bibtex = Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {collection: col}, Zotero.BetterBibTeX.displayOptions(url))
    Zotero.BetterBibTeX.log(':::exporting', bibtex)
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
    libid = 0
    path = library.split('/')
    if path.length > 1
      path.shift() # leading '/'
      libid = parseInt(path.shift())

      if not Zotero.Libraries.exists(libid)
        sendResponseCallback(404, 'text/plain', "Could not export bibliography: library '#{library}' does not exist")
        return

    path = path.join('/').split('.')
    if path.length is 1
      sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{library}': no format specified")
      return

    translator = path.pop()
    sendResponseCallback(200, 'text/plain', Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), null, Zotero.BetterBibTeX.displayOptions(url)))

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

