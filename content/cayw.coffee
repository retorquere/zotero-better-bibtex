bufferpack = require('bufferpack')
getItemsAsync = require('./get-items-async.coffee')

transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService)
# "https://github.com/zotero/zotero-libreoffice-integration/blob/master/components/zoteroOpenOfficeIntegration.js"

class CAYW
  host = '127.0.0.1'
  port = 23116
  docID: 1
  fieldID: 2

  docData: """<data data-version=\"3\" zotero-version=\"5.0.18\">
      <session id=\"Z9Tp8PjG\"/>
      <style
        id=\"http://www.zotero.org/styles/chicago-note-bibliography\"
        locale=\"en-US\"
        hasBibliography=\"1\"
        bibliographyStyleHasBeenSet=\"0\"
      />
      <prefs>
        <pref name=\"fieldType\" value=\"Bookmark\"/>
        <pref name=\"automaticJournalAbbreviations\" value=\"true\"/>
        <pref name=\"noteType\" value=\"1\"/>
      </prefs>
    </data>"""

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

  constructor: (@options) ->
    @_ready = Zotero.Promise.defer()
    @ready = @_ready.promise

    if !@options.format
      @_ready.reject('no format')
      return

    if @options.format.startsWith('cite')
      @options.command = @options.format
      @options.format = 'latex'

    if !@['$' + @options.format]
      @_ready.reject("Unsupported format #{@options.format}")
      return

    @options.format = @options.format.replace(/-/g, '_')

    @transport = transportService.createTransport(null, 0, @host, @port, null)
    @outstream = transport.openOutputStream(Components.interfaces.nsITransport.OPEN_BLOCKING, 0, 0)

    @stream = transport.openInputStream(0, 0, 0)
    @instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream)
    @instream.init(@stream)

    # var str = instream.read(4096);
    # var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
    # var data = utf8Converter.convertURISpecToUTF8 (str, "UTF-8");


    @session = 0

    @data = ''
    @commands = 0
    @citation = []

    @send('addCitation')

    pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump)
    pump.init(@stream, -1, -1, 0, 0, false)
    pump.asyncRead(@, null)

  onStartRequest: ->

  onStopRequest: (request, context, status) -> @close()

  onDataAvailable: (request, context, inputStream, offset, count) ->
    @data += @instream.read(count)

    @close() if !@command()
    return

  command: ->
    return true if @data.length < 8

    [ session, length ] = bufferpack.unpack('>II', @data)
    return true if @data.length < 8 + length

    @commands++

    return @close("Runaway CAYW discussion with Zotero") if @closed || @commands > 10

    data = JSON.parse(@data.substr(8, length))
    @data = @data.substr(8 + length)

    @session = session

    return @['_' + data[0]].apply(@, data[1])

  close: (err) ->
    return if @closed

    @instream.close()
    @outstream.close()

    if err
      @_ready.reject(err)
    else
      for citation in @citations
        citation.citekey = KeyManager.get(citation.id)
      Zotero.Promise.resolve(@['$' + @options.format]()).then((v) -> @_ready.resolve(v)).catch((err) -> @_ready.reject(err))

    @closed = true
    return

  send: (payload) ->
    payload = JSON.stringify(payload)
    payload = bufferpack.pack('>II', [@session, payload.length]).toString() + payload
    @outstream.write(payload, payload.length)
    return true

  _Application_getActiveDocument: (protocolVersion) -> @send([protocolVersion, @docID])

  _Document_getDocumentData: (documentID) -> @send(@docData)

  _Document_setDocumentData: (documentID, dataString) -> @send(null)

  _Document_canInsertField: (documentID) -> @send(true)

  _Document_cursorInField: (documentID, fieldType) -> @send(null)

  _Document_insertField: (documentID, fieldType, noteType) -> @send([@fieldID, '', 0])

  _Field_setCode: (documentID, fieldID, code) ->
    if m = code.match(/^ITEM CSL_CITATION ({.*})/)
      @citation = JSON.parse(m[1]).citationItems
      @fieldCode = null
    else
      @fieldCode = code
    return @send(null)

  _Document_getFields: (documentID, fieldType) -> @send([[@fieldID],[@fieldCode],[0]])

  _Field_setText: (documentID, fieldID, text, isRTF) -> @send(null)

  _Field_getText: (documentID, fieldID) -> @send("[#{@fieldID}]")

  _Document_activate: (documentID) -> @send(null)

  _Document_complete: (documentID) ->
    @send(null)
    return false # will close the connection

  _Field_delete: (documentID, fieldID) -> @send(null)

  getStyle: (id = 'apa') ->
    style = Zotero.Styles.get("http://www.zotero.org/styles/#{id}")
    style ||= Zotero.Styles.get("http://juris-m.github.io/styles/#{id}")
    style ||= Zotero.Styles.get(id)
    return style

  $latex: ->
    return '' unless @citation.length
    @options.command ||= 'cite'

    state = @citations.reduce(((acc, cit) ->
      for k of acc
        acc[k]++ if cit[k]
      return
    ), { prefix: 0, suffix: 0, 'suppress-author': 0, locator: 0, label: 0 })

    if @citations.length > 1 && state.suffix == 0 && state.prefix == 0 && state.locator == 0 && state['suppress-author'] in [0, @citations.length]
      ### simple case where everything can be put in a single cite ###
      return "\\#{if @citations[0]['suppress-author'] then 'citeyear' else @options.command}{#{(@citation.citekey for citation in @citations).join(',')}}"

    formatted = ''
    for citation in @citations
      formatted += "\\"
      formatted += if citation['suppress-author'] then 'citeyear' else @options.command
      formatted += '[' + citation.prefix + ']' if citation.prefix

      switch
        when citation.locator && citation.suffix
          label = if citation.label == 'page' then '' else @shortLocator[citation.label] + ' '
          formatted += "[#{label}#{citation.locator}, #{citation.suffix}]"
        when citation.locator
          label = if citation.label == 'page' then '' else @shortLocator[citation.label] + ' '
          formatted += "[#{label}#{citation.locator}]"
        when citation.suffix
          formatted += "[#{citation.suffix}]"
        when citation.prefix
          formatted += '[]'
      formatted += '{' + citation.citekey + '}'

    return formatted

  $mmd: ->
    formatted = []
    for citation in @citations
      if citation.prefix
        formatted.push("[#{citation.prefix}][##{citation.citekey}]")
      else
        formatted.push("[##{citation.citekey}][]")
    return formatted.join('')

  $pandoc: ->
    formatted = []
    for citation in @citations
      cite = ''
      cite += "#{citation.prefix} " if citation.prefix
      cite += '-' if citation['suppress-author']
      cite += "@#{citation.citekey}"
      cite += ", #{@shortLocator[citation.label]} #{citation.locator}" if citation.locator
      cite += " #{citation.suffix}" if citation.suffix
      formatted.push(cite)
    formatted = formatted.join('; ')
    formatted = '[' + formatted + ']' if @options.brackets
    return formatted

  $asciidoctor_bibtex: ->
    formatted = []
    for citation in @citations
      cite = citation.citekey
      if citation.locator
        label = citation.locator
        label = @shortLocator[citation.label] + ' ' + label if citation.label != 'page'
        cite += '(' + label + ')'
      formatted.push(cite)
    formatted = formatted.join(', ')
    formatted = (@options.cite || 'cite') + ':[' + formatted + ']'
    return formatted

  $scannable_cite: Zotero.Promise.coroutine(->
    class Mem
      constructor: (@isLegal) ->
        @lst = []

      set: (str, punc, slug) ->
        punc = '' unless punc
        switch
          when str        then @lst.push(str + punc)
          when !@isLegal  then @lst.push(slug)
        return

      setlaw: (str, punc) ->
        punc = '' unless punc
        @lst.push(str + punc) if str && @isLegal
        return

      get: -> @lst.join(' ')

    formatted = []
    for citation in @citations
      item = yield getItemsAsync(citation.id)
      isLegal = Zotero.ItemTypes.getName(item.itemTypeID) in [ 'bill', 'case', 'gazette', 'hearing', 'patent', 'regulation', 'statute', 'treaty' ]

      key = if Prefs.get('testing') then 'ITEMKEY' else item.key
      id = switch
        when item.libraryID then "zg:#{item.libraryID}:#{key}"
        when Zotero.userID then "zu:#{Zotero.userID}:#{key}"
        else "zu:0:#{key}"
      locator = if citation.locator then "#{@shortLocator[citation.label]} #{citation.locator}" else ''
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
  )

  $atom_zotero_citations: ->
    citekeys = (citation.citekey for citation in @citations)
    itemIDs = (citation.id for citation in @citations)

    style = @getStyle(@options.style)

    cp = style.getCiteProc()
    cp.setOutputFormat('markdown')
    cp.updateItems(itemIDs)
    label = cp.appendCitationCluster({citationItems: ({ id } for id in itemIDs), properties: {}}, true)[0][1]

    if citekeys.length == 1
      return "[#{label}](#@#{citekeys.join(',')})"
    else
      return "[#{label}](?@#{citekeys.join(',')})"

  $translate: Zotero.Promise.coroutine(->
    items = yield getItemsAsync((citation.id for citation in @citations))

    @options.translator = 'BetterBibLeTeX' if (@options.translator || 'biblatex') == 'biblatex'
    @options.translator = Translators.byLabel[@options.translator].translatorID if Translators.byLabel[@options.translator]

    exportOptions = {
      exportNotes: (@options.exportNotes || '').toLowerCase() in ['yes', 'y', 'true']
      useJournalAbbreviation: (@options.useJournalAbbreviation || '').toLowerCase() in ['yes', 'y', 'true']
    }

    return yield Translators.translate(@options.translator, {items: items}, exportOptions)
  )

Zotero.Server.Endpoints['/better-bibtex/cayw'] = class
  supportedMethods: ['GET']

  init: Zotero.Promise.coroutine((options) ->
    return [200, 'text/plain', 'ready'] if options.query.probe

    try
      return [200, 'text/plain', yield (new CAYW(options)).ready]
    catch
      return [500, "application/text", 'debug-bridge failed: ' + err + "\n" + err.stack]
  )
