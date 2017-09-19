bufferpack = require('bufferpack')

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

  constructor: (@format, @config) ->
    @transport = transportService.createTransport(null, 0, @host, @port, null)
    @outstream = transport.openOutputStream(Components.interfaces.nsITransport.OPEN_BLOCKING, 0, 0)

    @stream = transport.openInputStream(0, 0, 0)
    @instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream)
    @instream.init(@stream)

    # var str = instream.read(4096);
    # var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
    # var data = utf8Converter.convertURISpecToUTF8 (str, "UTF-8");

    @_ready = Zotero.Promise.defer()
    @ready = @_ready.promise

    @session = 0

    @data = ''
    @commands = 0
    @citation = null

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

    return @['$' + data[0]].apply(@, data[1])

  close: (err) ->
    return if @closed

    @instream.close()
    @outstream.close()

    if err
      @_ready.reject(err)
    else
      @_ready.resolve(@citation || [])

    @closed = true
    return

  send: (payload) ->
    payload = JSON.stringify(payload)
    payload = bufferpack.pack('>II', [@session, payload.length]).toString() + payload
    @outstream.write(payload, payload.length)
    return true

  $Application_getActiveDocument: (protocolVersion) -> @send([protocolVersion, @docID])

  $Document_getDocumentData: (documentID) -> @send(@docData)

  $Document_setDocumentData: (documentID, dataString) -> @send(null)

  $Document_canInsertField: (documentID) -> @send(true)

  $Document_cursorInField: (documentID, fieldType) -> @send(null)

  $Document_insertField: (documentID, fieldType, noteType) -> @send([@fieldID, '', 0])

  $Field_setCode: (documentID, fieldID, code) ->
    if m = code.match(/^ITEM CSL_CITATION ({.*})/)
      @citation = JSON.parse(m[1]).citationItems
      @fieldCode = null
    else
      @fieldCode = code
    return @send(null)

  $Document_getFields: (documentID, fieldType) -> @send([[@fieldID],[@fieldCode],[0]])

  $Field_setText: (documentID, fieldID, text, isRTF) -> @send(null)

  $Field_getText: (documentID, fieldID) -> @send("[#{@fieldID}]")

  $Document_activate: (documentID) -> @send(null)

  $Document_complete: (documentID) ->
    @send(null)
    return false # will close the connection

  $Field_delete: (documentID, fieldID) -> @send(null)

  getStyle: (id = 'apa') ->
    style = Zotero.Styles.get("http://www.zotero.org/styles/#{id}")
    style ||= Zotero.Styles.get("http://juris-m.github.io/styles/#{id}")
    style ||= Zotero.Styles.get(id)
    return style

  $$latex: ->
    return '' unless @citation.length
    @config.command ||= 'cite'

