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

  getStyle: (id = 'apa') ->
    style = Zotero.Styles.get("http://www.zotero.org/styles/#{id}")
    style ||= Zotero.Styles.get("http://juris-m.github.io/styles/#{id}")
    style ||= Zotero.Styles.get(id)
    return style

  Formatter:
    latex: (citations, config) ->
      config.command ||= 'cite'

      return '' if citations.length == 0

      if citations.length > 1
        state = {
          prefix: 0
          suffix: 0
          'suppress-author': 0
          locator: 0
          label: 0
        }

        for citation in citations
          for own k of citation
            state[k] ?= 0
            state[k]++

        Zotero.BetterBibTeX.debug('citations:', {citations, state})
        if state.suffix == 0 && state.prefix == 0 && state.locator == 0 && state['suppress-author'] in [0, citations.length]
          ### simple case where everything can be put in a single cite ###
          return "\\#{if citations[0]['suppress-author'] then 'citeyear' else config.command}{#{(citation.citekey for citation in citations).join(',')}}"

      formatted = ''
      for citation in citations
        formatted += "\\"
        formatted += if citation['suppress-author'] then 'citeyear' else config.command
        formatted += '[' + citation.prefix + ']' if citation.prefix

        Zotero.BetterBibTeX.debug('citation:', citation)
        switch
          when citation.locator && citation.suffix
            label = if citation.label == 'page' then '' else Zotero.BetterBibTeX.CAYW.shortLocator[citation.label] + ' '
            formatted += "[#{label}#{citation.locator}, #{citation.suffix}]"
          when citation.locator
            label = if citation.label == 'page' then '' else Zotero.BetterBibTeX.CAYW.shortLocator[citation.label] + ' '
            formatted += "[#{label}#{citation.locator}]"
          when citation.suffix
            formatted += "[#{citation.suffix}]"
          when citation.prefix
            formatted += '[]'
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

    pandoc: (citations, config = {}) ->
      formatted = []
      for citation in citations
        cite = ''
        cite += "#{citation.prefix} " if citation.prefix
        cite += '-' if citation['suppress-author']
        cite += "@#{citation.citekey}"
        cite += ", #{Zotero.BetterBibTeX.CAYW.shortLocator[citation.label]} #{citation.locator}" if citation.locator
        cite += " #{citation.suffix}" if citation.suffix
        formatted.push(cite)
      formatted = formatted.join('; ')
      formatted = '[' + formatted + ']' if config.brackets
      return formatted

    'asciidoctor-bibtex': (citations, config = {}) ->
      formatted = []
      for citation in citations
        cite = citation.citekey
        if citation.locator
          label = citation.locator
          label = Zotero.BetterBibTeX.CAYW.shortLocator[citation.label] + ' ' + label if citation.label != 'page'
          cite += '(' + label + ')'
        formatted.push(cite)
      formatted = formatted.join(', ')
      formatted = (config.cite || 'cite') + ':[' + formatted + ']'
      return formatted

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

        key = if Zotero.BetterBibTeX.Pref.get('tests') then 'ITEMKEY' else item.key
        id = switch
          when item.libraryID then "zg:#{item.libraryID}:#{key}"
          when Zotero.userID then "zu:#{Zotero.userID}:#{key}"
          else "zu:0:#{key}"
        locator = if citation.locator then "#{Zotero.BetterBibTeX.CAYW.shortLocator[citation.label]} #{citation.locator}" else ''
        citation.prefix ?= ''
        citation.suffix ?= ''

        title = new Mem(isLegal)
        title.set(item.firstCreator, ',', 'anon.')

        includeTitle = false
        ### Prefs.get throws an error if the pref is not found ###
        try
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

      itemIDs = (item for item in Zotero.BetterBibTeX.schomd.itemIDs(citekeys, options) when item)
      style = Zotero.BetterBibTeX.CAYW.getStyle(options.style)

      cp = style.getCiteProc()
      cp.setOutputFormat('markdown')
      cp.updateItems(itemIDs)
      label = cp.appendCitationCluster({citationItems: ({id:itemID} for itemID in itemIDs), properties:{}}, true)[0][1]

      if citekeys.length == 1
        return "[#{label}](#@#{citekeys.join(',')})"
      else
        return "[#{label}](?@#{citekeys.join(',')})"

    translate: (citations, options = {}) ->
      items = Zotero.Items.get((citation.id for citation in citations))

      translator = options.translator || 'biblatex'
      translator = Zotero.BetterBibTeX.Translators.getID(translator) || translator
      Zotero.BetterBibTeX.debug('cayw.translate:', {requested: options, got: translator})

      exportOptions = {
        exportNotes: (options.exportNotes || '').toLowerCase() in ['yes', 'y', 'true']
        useJournalAbbreviation: (options.useJournalAbbreviation || '').toLowerCase() in ['yes', 'y', 'true']
      }

      return Zotero.BetterBibTeX.Translators.translate(translator, {items: items}, exportOptions)

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

    @config = JSON.parse(JSON.stringify(config))
    @config.citeprefix ||= ''
    @config.citepostfix ||= ''
    @config.keyprefix ||= ''
    @config.keypostfix ||= ''
    @config.separator ||= ','
    @config.clipboard ||= false
    @config.format ||= ''

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
        alert('Could not format references: ' + (err.message || err.name))
        formatted = ''
    else
      formatted = []
      for citation in citations
        formatted.push(@config.keyprefix + citation.citekey + @config.keypostfix)
      if formatted.length == 0
        formatted = ''
      else
        formatted = @config.citeprefix + formatted.join(@config.separator) + @config.citepostfix

    Zotero.BetterBibTeX.debug('formatted-type:', typeof formatted)
    if typeof formatted == 'string'
      resolve = formatted
      deferred = Q.defer()
      formatted = deferred.promise
    Zotero.BetterBibTeX.debug('formatted-type:*', typeof formatted)

    formatted.then((res) =>
      Zotero.Utilities.Internal.copyTextToClipboard(res) if @config.clipboard
      @deferred.fulfill(res)
      Zotero.Integration.currentWindow.close() unless Zotero.BetterBibTeX.Pref.get('tests')
      @doc.activate()
    )
    deferred.resolve(resolve) if typeof resolve == 'string'

