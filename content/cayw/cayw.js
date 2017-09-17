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
  commands: 0,

  onStartRequest: function(request, context) {},
  onStopRequest: function(request, context, status) {
    this.close();
  },

  onDataAvailable: function(request, context, inputStream, offset, count){
    this.data += instream.read(count);

    if (!this.command()) {
      this.close();
    }
  },

  uint32: function(offset) {
    return (this.data.charCodeAt(offset) << 24)
           + (this.data.charCodeAt(offset+1) << 16)
           + (this.data.charCodeAt(offset+2) << 8)
           + this.data.charCodeAt(offset+3);
  }

  command: function() {
    if (this.data.length < 8) return true;

    var [ session, length ] = bufferpack.unpack('>II', this.data);
    if (this.data.length < 8 + length) return true;

    this.commands++;

    if (this.closed || this.commands > 10) throw new Error("Runaway CAYW discussion with Zotero");

    var data = JSON.parse(this.data.substr(8, length);
    this.data = this.data.substr(8 + length);

    this.session = session;

    return this['$' + data[0]].apply(this, data[1]);
  },

  close: function() {
    if (this.closed) return;

    instream.close();
    outstream.close();
    ready.resolve(this.data);

    this.closed = true;
  },

  send: function(payload) {
    payload = JSON.stringify(payload);
    payload = bufferpack.pack('>II', [this.session, payload.length]).toString() + payload;
    outstream.write(payload, payload.length);
    return true;
  }

  $Application_getActiveDocument: function(api) {
    this.api = api;
    return this.send([this.api, this.docID]);
  },

  $Document_getDocumentData: function() {
    return this.send(this.docData)
  },

  $Document_setDocumentData: function() {
    return this.send(null)
  }

  $Document_canInsertField: function() {
    return this.send(true)
  },

  $Document_cursorInField: function() {
    return this.send(nil)
  }

  $Document_insertField: function() {
    return this.send([@fieldID, '', 0])
  }

  $Field_setCode: function(documentID, fieldID, code) {
    if (var m = code.match(/^ITEM CSL_CITATION ({.*})/)) {
      this.reference = JSON.parse(m[1]);
      this.fieldCode = null;
    } else {
      this.fieldCode = code;
    }
    return this.send(null);
  }

  $Document_getFields: function() {
    return this.send([[this.fieldID],[this.fieldCode],[0]]);
  }

  $Field_setText: function() {
    return this.send(null);
  }
  
  $Field_getText: function() {
    return this.send('[' + this.fieldID + ']')
  }

  $Document_activate: function() {
    return this.send(null)
  }

  $Document_complete: function() {
    this.send(null)
    return false; // will close the connection
  }
}

zotero = Zotero.new
};

dataListener.send('addCitation');

var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
pump.init(stream, -1, -1, 0, 0, false);
pump.asyncRead(dataListener,null);

return ready.promise;

