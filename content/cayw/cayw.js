var host = 'www.google.nl';
var port = 80;
var _ ="https://github.com/zotero/zotero-libreoffice-integration/blob/master/components/zoteroOpenOfficeIntegration.js";
var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
var transport = transportService.createTransport(null,0,host,port,null);

var command = "GET / HTTP/1.0\n\n";
var outstream = transport.openOutputStream(0,0,0);
outstream.write(command,command.length);

var stream = transport.openInputStream(0,0,0);
var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
instream.init(stream);

var ready = Zotero.Promise.defer();

var dataListener = {
	data : "",

  onStartRequest: function(request, context) {},
  onStopRequest: function(request, context, status) {
		instream.close();
    outstream.close();
    ready.resolve(this.data);
  },

  onDataAvailable: function(request, context, inputStream, offset, count){
    this.data += instream.read(count);
  },
};

var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
pump.init(stream, -1, -1, 0, 0, false);
pump.asyncRead(dataListener,null);

return ready.promise;
