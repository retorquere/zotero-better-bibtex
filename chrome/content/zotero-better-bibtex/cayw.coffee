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

  scannableCiteLocator: {
    article: "art."
    chapter: "ch."
    subchapter: "subch."
    column: "col."
    figure: "fig."
    line: "l."
    note: "n."
    issue: "no."
    opus: "op."
    page: "p."
    paragraph: "para."
    subparagraph: "subpara."
    part: "pt."
    rule: "r."
    section: "sec."
    subsection: "subsec."
    Section: "Sec."
    'sub verbo': "sv."
    schedule: "sch."
    title: "tit."
    verse: "vrs."
    volume: "vol."
  }

  accept: (progressCallback) ->
    progressCallback.call(null, 100) if progressCallback
    citation = []

    # {"citationItems":[{"id":"5","locator":"page","prefix":"prefix","suffix":"suffix","suppress-author":true}],"properties":{}}
    # "label":"line","locator":"xx"
    items = []
    for item in @citation.citationItems
      item.label = 'page' if !item.label && item.locator
      citekey = Zotero.BetterBibTeX.keymanager.get({itemID: item.id}, 'on-export')
      continue unless citekey
      item.citekey = citekey.citekey
      items.push(item)

    switch @config.format
      when 'mmd'
        for item in items
          if item.prefix
            citation.push("[#{item.prefix}][##{item.citekey}]")
          else
            citation.push("[##{item.citekey}][]")
        citation = citation.join('')

      when 'pandoc'
        for item in items
          cite = ''
          cite += "#{item.prefix} " if item.prefix
          cite += '-' if item['suppress-author']
          cite += "@#{item.citekey}"
          cite += ", #{item.label} #{item.locator}" if item.locator
          cite += " #{item.suffix}" if item.suffix
          citation.push(cite)
        if citation.length == 0
          citation = ''
        else
          citation = '[' + citation.join(';') + ']'

      when 'scannable-cite'
        for citation in items
          item = Zotero.Items.get(citation.id)
          isLegal = Zotero.ItemTypes.getName(item.itemTypeID) in [ 'bill' 'case' 'gazette' 'hearing' 'patent' 'regulation' 'statute' 'treaty' ]

          id = switch
            when item.libraryID then "zg:#{item.libraryID}:#{item.key}"
            when Zotero.userID then "zu:#{Zotero.userID}:#{item.key}"
            else "zu:0:#{item.key}"
          locator = if citation.locator then "#{@scannableCiteLocator[citation.label]} #{citation.locator}" else ''
          citation.prefix ?= ''
          citation.suffix ?= ''

          label = item.firstCreator
          label ||= item.getField('shortTitle')
          label ||= item.getField('title')

          date = Zotero.Date.strToDate(item.getField('date')).year
          date ||= item.getField('date')
          date ||= 'no date'

          label = "#{label} #{date}".trim()

          label = "-#{label}" if citation['suppress-author']
          citation.push("{#{citation.prefix}|#{label}|#{locator}|#{citation.suffix}|#{id}}")
        citation = citation.join('')

      else
        for item in items
          citation.push(@config.keyprefix + item.citekey + @config.keypostfix)
        if citation.length == 0
          citation = ''
        else
          citation = @config.citeprefix + citation.join(@config.separator) + @config.citepostfix

    Zotero.Utilities.Internal.copyTextToClipboard(citation) if @config.clipboard
    @deferred.fulfill(citation)
    Zotero.Integration.currentWindow.close()

    @doc.activate()
