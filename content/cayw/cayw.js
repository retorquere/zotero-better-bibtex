var bufferpack = Zotero.BetterBibTeX.TestSupport.bufferpack;

var host = '127.0.0.1';
var port = 23116;
var _ ="https://github.com/zotero/zotero-libreoffice-integration/blob/master/components/zoteroOpenOfficeIntegration.js";
var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
var transport = transportService.createTransport(null,0,host,port,null);

var outstream = transport.openOutputStream(Components.interfaces.nsITransport.OPEN_BLOCKING, 0, 0);

var stream = transport.openInputStream(0,0,0);
var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
instream.init(stream);

var str = instream.read(4096);
var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
var data = utf8Converter.convertURISpecToUTF8 (str, "UTF-8"); 

var ready = Zotero.Promise.defer();

var dataListener = {
  session: 0,
  docID: 1,
  fieldID: 2,
  docData: `<data data-version="3" zotero-version="5.0.18">
      <session id="Z9Tp8PjG"/>
      <style
        id="http://www.zotero.org/styles/chicago-note-bibliography"
        locale="en-US"
        hasBibliography="1"
        bibliographyStyleHasBeenSet="0"
      />
      <prefs>
        <pref name="fieldType" value="Bookmark"/>
        <pref name="automaticJournalAbbreviations" value="true"/>
        <pref name="noteType" value="1"/>
      </prefs>
    </data>`,

  data : '',

  onStartRequest: function(request, context) {},
  onStopRequest: function(request, context, status) {
    this.close();
  },

  onDataAvailable: function(request, context, inputStream, offset, count){
    this.data += instream.read(count);

    var command = this.command();
    if (command) {
      this['$' + command.command](command.args);
    }
  },

  uint32: function(offset) {
    return (this.data.charCodeAt(offset) << 24)
           + (this.data.charCodeAt(offset+1) << 16)
           + (this.data.charCodeAt(offset+2) << 8)
           + this.data.charCodeAt(offset+3);
  }

  command: function() {
    if (this.data.length < 8) return null;

    var [ session, length ] = bufferpack.unpack('>II', this.data);
    if (this.data.length < 8 + length) return null;

    var data = JSON.parse(this.data.substr(8, length);
    this.data = this.data.substr(8 + length);

    return {
      session: session,
      command: data[0],
      args: data[1],
    }
  },

  close: function() {
    if (this.closed) return;

    instream.close();
    outstream.close();
    ready.resolve(this.data);

    this.closed = true;
  },

  send: function(payload) {
    payload = bufferpack.pack('>I', this.session).toString() + JSON.stringify(payload);
    outstream.write(payload, payload.length);
  }

  $Application_getActiveDocument: function(api) {
    this.api = api
    this.send([this.api, this.docID])
  },

  $Document_getDocumentData: function() {
    this.send(this.docData)
  },

  $Document_setDocumentData: function() {
    this.send(null)
  }

  $Document_canInsertField: {
    this.send(true)
  },

        when 'Document_cursorInField'
          send(nil)

        when 'Document_insertField'
          #send([@docID, 'ReferenceMark', 0])
          send([@fieldID, '', 0])

        when 'Field_setCode'
          fieldCode = args.last
          if fieldCode =~ /^ITEM CSL_CITATION ({.*})/
            @reference = JSON.parse($1)
            puts JSON.pretty_generate(@reference)
            @fieldCode = nil
          else
            @fieldCode = fieldCode
          end
          send(nil)

        when 'Document_getFields'
          send([[@fieldID],[@fieldCode],[0]])

        when 'Field_setText'
          send(nil)

        when 'Field_getText'
          send('[1]')

        when 'Document_activate'
          send(nil)

        when 'Document_complete'
          send(nil)
          @zotero.close
          break

        else
          raise cmd
      end
    end
  end

  def send(payload)
    payload = payload.to_json
    puts ">> #{payload}"
    message = ZoteroMsg.new(s: @session, len: payload.length, msg: payload)
    @zotero.write(message.to_binary_s)
  end

  def receive
    response = ZoteroMsg.read(@zotero)
    @session = response.s
    puts "<< #{response.msg}"
    return JSON.parse(response.msg)
  end
end

zotero = Zotero.new
};

dataListener.send('addCitation');

var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
pump.init(stream, -1, -1, 0, 0, false);
pump.asyncRead(dataListener,null);

return ready.promise;

