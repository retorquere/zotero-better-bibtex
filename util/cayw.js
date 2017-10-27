const Cc = Components.classes;
const Ci = Components.interfaces;

function session()
{
    this.transport = null;
    this.reconnectionAttemptFrequency = 10000;
    this.port = 5000;
    this.address = "127.0.0.1";
    this.connectionTimeout = 3600000;
}

session.prototype =
{
    connect: function()
    {
        try {
            if (this.transport != null && this.transport.isAlive()) return "alive";
            
            var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
            var transport = transportService.createTransport(null, 0, this.address, this.port, null);
            if (!transport) {
                Zotero.debug("connect-failed", "Unable to create transport for "+this.address+":"+this.port);
                return;
            }
            // long timeout for connections
            transport.setTimeout(Components.interfaces.nsISocketTransport.TIMEOUT_CONNECT, this.connectionTimeout);
            this.setTransport(transport);
            this.write('');
        } catch(ex) {
            Zotero.debug("connect-failed", "Unable to connect to "+this.address+":"+this.port+"; Exception occured "+ex);
            this.disconnect();
        }
    },
    
    setTransport: function(transport)
    {
        try {
            this.transport = transport;
            this.raw_istream = this.transport.openInputStream(0, 0, 0);
            this.ostream = this.transport.openOutputStream(0,0,0);
            this.istream = Components.classes["@mozilla.org/binaryinputstream;1"]
                           .createInstance(Components.interfaces.nsIBinaryInputStream);
            this.istream.setInputStream(this.raw_istream);
            if (!this.transport.isAlive()) {
                var mainThread = Components.classes["@mozilla.org/thread-manager;1"]
                                 .getService(Components.interfaces.nsIThreadManager).mainThread;
                var asyncOutputStream = this.ostream.QueryInterface(Components.interfaces.nsIAsyncOutputStream);
                // We need to be able to write at least one byte.
                asyncOutputStream.asyncWait(this, 0, 1, mainThread);
            } else {
                this.onConnect();
            }
        } catch(ex) {
            Zotero.debug("connect-failed", "setTransport failed, Unable to connect; Exception "+ex);
            Zotero.debug(ex + " setTransport failed: ");
            this.disconnect();
        }
    },
    
    onOutputStreamReady: function()
    {
        if (this.transport != null && this.transport.isAlive())
            this.onConnect();
    },

    onConnect: function()
    {
        try {
            // start the async read
            this.pump = Components.classes["@mozilla.org/network/input-stream-pump;1"]
                        .createInstance(Components.interfaces.nsIInputStreamPump);
            this.pump.init(this.raw_istream, -1, -1, 0, 0, false);
            this.pump.asyncRead(this, null);
            Zotero.debug("transport-status-connected", null);
        } catch(ex) {
            Zotero.debug(ex + "Session::onConnect failed: ");
            Zotero.debug("connect-failed", "Unable to connect; Exception occured "+ex);
            this.disconnect();
        }
    },
    
    disconnect: function()
    {
        if ("istream" in this && this.istream)
            this.istream.close();
        if ("ostream" in this && this.ostream)
            this.ostream.close();
        if ("transport" in this && this.transport)
          this.transport.close(Components.results.NS_OK);
    
        this.pump = null;
        this.istream = null;
        this.ostream = null;
        this.transport = null;
        Zotero.debug("connect-closed", null);
    },

    readData: function(count) 
    {
        return this.istream.readBytes(count);
    },

    read: function() {
      var data = ''
      while (true) {
        try {
          data += this.readData(1)
        } catch (ex) {
          Zotero.debug('' + ex);
          break;
        }
      }
      return data;
    },

    write: function(str) {
      return this.writeData(str, str.length);
    },
    
    //TODO: try to recover from dead connections...
    writeData: function(data, dataLen)
    {
        try {
            if (!this.transport || !this.transport.isAlive()) {
                Zotero.debug("Session.transport is not available");
                this.disconnect();
                this.connect();
                return -1;
            }
            if (arguments.length == 0) {
                Zotero.debug("Session.writeData called with no args");
                return -1;
            } else if (arguments.length == 1) {
                dataLen = data.length;
            }
    
            var str1 = this.expand(data);
            if (str1.length > 1000) {
                str1 = str1.substr(0, 1000) + "...";
            }
            Zotero.debug("writeData: [" + str1 + "]");
            
            var num_written = this.ostream.write(data, dataLen);
            if (num_written != dataLen) {
                Zotero.debug("Expected to write "
                          + dataLen
                          + " chars, but wrote only "
                          + num_written);
                if (num_written == 0) {
                    Zotero.debug("bailing out...");
                    this.disconnect();
                }
            }
            return num_written;
        } catch(ex) {
            Zotero.debug(ex + "writeData failed: ");
        }
        return -1;
    },

    expand: function(s)
    {
        // JS doesn't have foo ||= val
        if (!this._hexEscape) {
            this._hexEscape = function(str) {
                var res1 = parseInt(str.charCodeAt(0)).toString(16);
                var leader = res1.length == 1 ? "0" : "";
                return "%" + leader + res1;
            };
        }
        return s.replace(/[\x00-\x09\x11-\x1f]/g, this._hexEscape);
    },
    
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIStreamListener, Ci.nsITransportEventSink, Ci.nsIOutputStreamCallback])
};

var data = '';
var s = new session();
s.connect();
s.write('hello')
data += s.read()
data += s.read()
data += s.read()
s.write('bye')
data += s.read()
data += s.read()
data += s.read()
// s.write('bye!')
return data;
