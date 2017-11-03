const OK = 200
const SERVER_ERROR = 500

Zotero.Server.Endpoints['/better-bibtex/collection'] = class {
  public supportedMethods = ['GET']

  public async init(request) {
    let path
    try {
      path = url.query['']
    } catch (err) {
      return [SERVER_ERROR, 'text/plain', 'Could not export bibliography: no path']
    }

    try {
      let [ , path, translator ] = path.match(/(.*)\.([a-zA-Z]+)$/)

      translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === translator) || translator
      if (path[0] !== '/') path = `/0/${path}`

      let [ , lib, path ] = path.match(/\/([0-9]+)\/(.*)/)
      libID = parseInt(lib)

      let collection = Zotero.Collections.getByLibraryAndKey(libID, path)
      if (!collection) {
        for (const subcol of path.split('/')) {
          if (!subcol) continue
        }
      }

    } catch (err) {
      return [SERVER_ERROR, 'text/plain', '' + err]
    }
  }
}

Zotero.BetterBibTeX.endpoints = { }
Zotero.BetterBibTeX.endpoints.collection = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.collection.init = (url, data, sendResponseCallback) ->
  try
    path = collection.split('.')
    if path.length == 1
      sendResponseCallback(404, 'text/plain', "Could not export bibliography '#{collection}': no format specified")
      return

    translator = path.pop().toLowerCase()
    translator = Zotero.BetterBibTeX.Translators.getID(translator)
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

    translator = Zotero.BetterBibTeX.Translators.getID(format)
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
  items = Zotero.Items.get(zoteroPane.getSelectedItems().map((item) -> item.id))

  translator = Zotero.BetterBibTeX.Translators.getID(translator)
  Zotero.BetterBibTeX.Translators.translate(translator, {items}, Zotero.BetterBibTeX.displayOptions(url)).then((result) ->
    sendResponseCallback(200, 'text/plain', result)
  ).catch((err) ->
    sendResponseCallback(500, 'text/plain', '' + err)
  )
