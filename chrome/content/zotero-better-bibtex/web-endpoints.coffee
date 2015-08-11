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
    col ||= Zotero.Collections.getByLibraryAndKey(libid, key)
    throw "#{collectionkey} not found" unless col

    deferred = Q.defer()
    Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {collection: col}, Zotero.BetterBibTeX.displayOptions(url), (err, result) ->
      if err
        deferred.reject(err)
      else
        deferred.fulfill(result)
    )
    sendResponseCallback(200, 'text/plain', deferred.promise)

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

    deferred = Q.defer()
    Zotero.BetterBibTeX.translate(translator, {library: libid}, Zotero.BetterBibTeX.displayOptions(url), (err, result) ->
      if err
        deferred.reject(err)
      else
        deferred.fulfill(result)
    )
    sendResponseCallback(200, 'text/plain', deferred.promise)

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

  deferred = Q.defer()
  Zotero.BetterBibTeX.translate(Zotero.BetterBibTeX.getTranslator(translator), {items: items}, Zotero.BetterBibTeX.displayOptions(url), (err, result) ->
    if err
      deferred.reject(err)
    else
      deferred.fulfill(result)
  )
  sendResponseCallback(200, 'text/plain', deferred.promise)

Zotero.BetterBibTeX.endpoints.schomd = { supportedMethods: ['POST'] }
Zotero.BetterBibTeX.endpoints.schomd.init = (url, data, sendResponseCallback) ->
  req = JSON.parse(data)
  response = []

  throw new Error('batch requests are not supported') if Array.isArray(req)

  try
    switch req.method
      when 'citation', 'bibliography', 'bibtex', 'search'
        result = Zotero.BetterBibTeX.schomd[req.method].apply(Zotero.BetterBibTeX.schomd, req.params)
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
              result: e.message
            })
          )
        else
          result = JSON.stringify({
            jsonrpc: (if req.jsonrpc then req.jsonrpc else undefined)
            id: (if req.id || (typeof req.id) == 'number' then req.id else null)
            result
          })

      else throw("Unsupported method '#{req.method}'")
  catch err
    result = JSON.stringify({jsonrpc: '2.0', error: {code: 5000, message: '' + err + "\n" + err.stack}, id: result.id})

  return sendResponseCallback(200, 'application/json', result)

Zotero.BetterBibTeX.endpoints.cayw = { supportedMethods: ['GET'] }
Zotero.BetterBibTeX.endpoints.cayw.init = (url, data, sendResponseCallback) ->
  #deferred = Q.defer()
  #mode = if !Zotero.isMac && Zotero.Prefs.get('integration.keepAddCitationDialogRaised') then 'popup' else 'alwaysRaised'
  #io = {wrappedJSObject: deferred}
  #Zotero.Integration.displayDialog({cleanup: ->}, 'chrome://zotero-better-bibtex/content/cayw.xul', mode, io)

  doc = new Zotero.BetterBibTeX.CAYW.Document()

  deferred = Q.defer()

  io = new Zotero.BetterBibTeX.CAYW.CitationEditInterface(deferred, url.query || {}, doc)
  if Zotero.Prefs.get('integration.useClassicAddCitationDialog')
    Zotero.Integration.displayDialog(doc, 'chrome://zotero/content/integration/addCitationDialog.xul', 'alwaysRaised,resizable', io)
  else
    mode = if !Zotero.isMac and Zotero.Prefs.get('integration.keepAddCitationDialogRaised') then 'popup' else 'alwaysRaised'
    Zotero.Integration.displayDialog(doc, 'chrome://zotero/content/integration/quickFormat.xul', mode, io)

  sendResponseCallback(200, 'text/plain', deferred.promise)

Zotero.BetterBibTeX.CAYW = {}

class Zotero.BetterBibTeX.CAYW.Document
  constructor: ->
    @fields = []

  cleanup: ->
  activate: ->
    wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
    #ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    windows = wm.getEnumerator(null)
    while windows.hasMoreElements()
      win = windows.getNext().QueryInterface( Components.interfaces.nsIDOMChromeWindow )
      #win = ww.getChromeForWindow(win)
      win.minimize()

  displayAlert: -> 0
  cursorInField: -> null
  convert: ->
  setBibliographyStyle: ->

  canInsertField: (fieldType) ->
    Zotero.BetterBibTeX.debug('CAYW.Document.canInsertField:', fieldType)
    return true

  getDocumentData: -> ''

  setDocumentData: (data) ->
    Zotero.BetterBibTeX.debug('CAYW.Document.setDocumenData:', data)

  insertField: (fieldType, noteType) ->
    Zotero.BetterBibTeX.debug('CAYW.Document.insertField:', fieldType, noteType)
    field = Zotero.BetterBibTeX.CAYW.Field(fieldType, noteType)
    @fields.push(field)
    return field

  getFields: (fieldType) ->
    return (field for field in @fields when field.fieldType == fieldType)

  getFieldsAsync: (fieldType, observer) ->
    throw new Error('CAYW.Document.getFieldsAsync')


class Zotero.BetterBibTeX.CAYW.Field
  constructor: (@fieldType, @noteType) ->

  setCode: (@code) ->

class Zotero.BetterBibTeX.CAYW.CitationEditInterface
  constructor: (@deferred, config, @doc) ->
    @citation = {citationItems:[], properties:{}}
    @wrappedJSObject = @

    @config = {
      citeprefix: ''
      citepostfix: ''
      keyprefix: ''
      keypostfix: ''
      separator: ','
      clipboard: false
      format: ''
    }

    for own key of @config
      @config[key] = config[key] if config[key]

  getItems: -> Q.fcall(-> [])

  accept: (progressCallback) ->
    progressCallback.call(null, 100) if progressCallback
    citation = []

    # {"citationItems":[{"id":"5","locator":"page","prefix":"prefix","suffix":"suffix","suppress-author":true}],"properties":{}}
    switch @config.format
      when 'mmd'
        for item in @citation.citationItems
          citekey = Zotero.BetterBibTeX.keymanager.get({itemID: item.id}, 'on-export')
          continue unless citekey
          if item.prefix
            citation.push("[#{item.prefix}][##{citekey.citekey}]")
          else
            citation.push("[##{citekey.citekey}][]")
        citation = citation.join('')

      else
        for item in @citation.citationItems
          cite = Zotero.BetterBibTeX.keymanager.get({itemID: item.id}, 'on-export').citekey
          citation.push(@config.keyprefix + cite + @config.keypostfix)
        citation = @config.citeprefix + citation.join(@config.separator) + @config.citepostfix

    Zotero.Utilities.Internal.copyTextToClipboard(citation) if @config.clipboard
    @deferred.fulfill(citation)
    Zotero.Integration.currentWindow.close()

    @doc.activate()
