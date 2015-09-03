Zotero.BetterBibTeX.CAYW =
  shortLocator:
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

class Zotero.BetterBibTeX.CAYW.Document
  constructor: (@config) ->
    @fields = []

  cleanup: ->
  activate: ->
    return unless @config.minimize

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
      separator: ';'
      clipboard: false
      format: ''
    }

    for own key of @config
      @config[key] = config[key] if config[key]

    if @config.format.match(/^cite/)
      @config.command = @config.format
      @config.format = 'latex'

  getItems: -> Q.fcall(-> [])

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
      try
        formatted = Zotero.BetterBibTeX.CAYW.Formatter[@config.format].call(null, citations, @config)
      catch err
        Zotero.BetterBibTeX.error('cayw:', err)
        alert('Could not format references: ' + err.msg)
        formatted = ''
    else
      formatted = []
      for citation in citations
        formatted.push(@config.keyprefix + citation.citekey + @config.keypostfix)
      if formatted.length == 0
        formatted = ''
      else
        formatted = @config.citeprefix + formatted.join(@config.separator) + @config.citepostfix

    Zotero.Utilities.Internal.copyTextToClipboard(formatted) if @config.clipboard
    @deferred.fulfill(formatted)
    Zotero.Integration.currentWindow.close()

    @doc.activate()

Zotero.BetterBibTeX.CAYW.Formatter = {
  latex: (citations, config) ->
    config.command ||= 'cite'

    return '' if citations.length == 0

    state = {
      prefix: 0
      suffix: 0
      'suppress-author': 0
      locator: 0
      label: 0
    }
    if citations.length > 1
      for citation in citations
        for own k of citation
          state[k] ?= 0
          state[k]++

    if state.suffix == 0 && state.prefix == 0 && state.locator == 0 && state['suppress-author'] in [0, citations.length]
      # simple case where everything can be put in a single cite
      return "\\#{if citations[0]['suppress-author'] then 'citeyear' else config.command}{#{(citation.citekey for citation in citations).join(',')}}"

    formatted = ''
    for citation in citations
      formatted += ' ' + citation.prefix + ' ' if citation.prefix
      formatted += "\\"
      formatted += if citation['suppress-author'] then 'citeyear' else config.command

      switch
        when citation.locator && citation.suffix
          formatted += '[' + Zotero.BetterBibTeX.CAYW.shortLocator[citation.label] + ' ' + citation.locator + ', ' + citation.suffix + ']'
        when citation.locator
          formatted += '[' + Zotero.BetterBibTeX.CAYW.shortLocator[citation.label] + ' ' + citation.locator + ']'
        when citation.suffix
          formatted += '[' + citation.suffix + ']'
      formatted += '{' + citation.citekey + '}'

    return formatted.trim()

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
    return '' if formatted.length == 0
    return '[' + formatted.join(';') + ']'

  'scannable-cite': (citations) ->

    class Mem
      constructor: (@isLegal) ->
        @lst = []

      set: (str, punc, slug) ->
        punc = '' unless punc
        switch
          when str        then @lst.push(str + punc)
          when !@isLegal  then @lst.push(slug)

      setlaw: (str, punc) ->
        punc = '' unless punc
        @lst.push(str + punc) if str && @isLegal

      get: -> @lst.join(' ')

    formatted = []
    for citation in citations
      item = Zotero.Items.get(citation.id)
      isLegal = Zotero.ItemTypes.getName(item.itemTypeID) in [ 'bill', 'case', 'gazette', 'hearing', 'patent', 'regulation', 'statute', 'treaty' ]

      id = switch
        when item.libraryID then "zg:#{item.libraryID}:#{item.key}"
        when Zotero.userID then "zu:#{Zotero.userID}:#{item.key}"
        else "zu:0:#{item.key}"
      locator = if citation.locator then "#{Zotero.BetterBibTeX.CAYW.shortLocator[citation.label]} #{citation.locator}" else ''
      citation.prefix ?= ''
      citation.suffix ?= ''

      title = new Mem(isLegal)
      title.set(item.firstCreator, ',', 'anon.')

      includeTitle = false
      try # Prefs.get throws an error if the pref is not found
        includeTitle = Zotero.Prefs.get('translators.ODFScan.includeTitle')
      if includeTitle || !item.firstCreator
        title.set(item.getField('shortTitle') || item.getField('title'), ',', '(no title)')

      try
        title.setlaw(item.getField('authority'), ',')
      try
        title.setlaw(item.getField('volume'))
      try
        title.setlaw(item.getField('reporter'))
      title.setlaw(item.getField('pages'))

      year = new Mem(isLegal)
      try
        year.setlaw(item.getField('court'), ',')
      date = Zotero.Date.strToDate(item.getField('date'))
      year.set((if date.year then date.year else item.getField('date')), '', 'no date')

      label = (title.get() + ' ' + year.get()).trim()
      label = "-#{label}" if citation['suppress-author']

      formatted.push("{#{citation.prefix}|#{label}|#{locator}|#{citation.suffix}|#{id}}")
    return formatted.join('')

  'atom-zotero-citations': (citations, options = {}) ->
    citekeys = (citation.citekey for citation in citations)

    items = (item for item in Zotero.BetterBibTeX.schmd.items(citekeys, options) when item)
    url = "http://www.zotero.org/styles/#{options.style ? 'apa'}"
    style = Zotero.Styles.get(url)
    cp = style.getCiteProc()
    cp.setOutputFormat('markdown')
    cp.updateItems((item for item in items when item))
    label = cp.appendCitationCluster({citationItems: ({id:item} for item in items), properties:{}}, true)[0][1]

    citekeys = ("@#{citekey}" for citekey in citekeys).join(',')
    return "[#{label}][#{citekeys}]"
}
