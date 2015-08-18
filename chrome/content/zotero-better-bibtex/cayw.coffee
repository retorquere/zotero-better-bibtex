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
    citations = []
    for citation in @citation.citationItems
      citation.label = 'page' if !citation.label && citation.locator
      citekey = Zotero.BetterBibTeX.keymanager.get({itemID: citation.id}, 'on-export')
      continue unless citekey
      citation.citekey = citekey.citekey
      citations.push(citation)

    if Zotero.BetterBibTeX.CAYW.Formatter[@config.format]
      formatted = Zotero.BetterBibTeX.CAYW.Formatter[@config.format].call(null, citations)
    else
      formatted = []
      for citation in citations
        fromatted.push(@config.keyprefix + citation.citekey + @config.keypostfix)
      if formatted.length == 0
        formatted = ''
      else
        formatted = @config.citeprefix + formatted.join(@config.separator) + @config.citepostfix

    Zotero.Utilities.Internal.copyTextToClipboard(formatted) if @config.clipboard
    @deferred.fulfill(formatted)
    Zotero.Integration.currentWindow.close()

    @doc.activate()

Zotero.BetterBibTeX.CAYW.Formatter = {
  mmd: (citations) ->
    formatted = []
    for citation in citations
      if citation.prefix
        formatted.push("[#{citation.prefix}][##{citation.citekey}]")
      else
        formatted.push("[##{citation.citekey}][]")
    return formatted.join('')

  pandoc: (citations) ->
    formatted = []
    for citation in citations
      cite = ''
      cite += "#{citation.prefix} " if citation.prefix
      cite += '-' if citation['suppress-author']
      cite += "@#{citation.citekey}"
      cite += ", #{citation.label} #{citation.locator}" if citation.locator
      cite += " #{citation.suffix}" if citation.suffix
      formatted.push(cite)
    return '' if citation.length == 0
    return '[' + citation.join(';') + ']'

  'scannable-cite': (citations) ->
    formatted = []
    for citation in citations
      item = Zotero.Items.get(citation.id)
      isLegal = Zotero.ItemTypes.getName(item.itemTypeID) in [ 'bill', 'case', 'gazette', 'hearing', 'patent', 'regulation', 'statute', 'treaty' ]

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
      formatted.push("{#{citation.prefix}|#{label}|#{locator}|#{citation.suffix}|#{id}}")
    return formatted.join('')
}
