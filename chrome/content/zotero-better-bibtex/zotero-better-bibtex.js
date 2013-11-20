Zotero.BetterBibTex = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex."),
  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  translators: {},
  server: null,
  threadManager: Components.classes["@mozilla.org/thread-manager;1"].getService(),

  log: function(msg, err) {
    msg = '[better-bibtex] ' + msg;
    if (err) { msg += ' (' + err + ')'; }
    console.log(msg);
  },

  init: function () {
    Zotero.BetterBibTex.safeLoad('BetterBibLaTex.js');
    Zotero.BetterBibTex.safeLoad('BetterCiteTex.js');
    Zotero.BetterBibTex.safeLoad('BetterBibTex.js');
    Zotero.Translators.init();

    Zotero.Translators.server = new Zotero.BetterBibTex.Server(Zotero.BetterBibTex.prefs.getIntPref('port'));
  },

  export: function(translator, collectionkey) {
    var lkh = Zotero.Collections.parseLibraryKeyHash(collectionkey);
    if (!lkh) { throw (collectionkey + ' not found'); }

    var col = Zotero.Collections.getByLibraryAndKey(lkh.libraryID, lkh.key);
    if (!col) { throw (collectionkey + ' not found'); }

    var translator = Zotero.BetterBibTex.translators[translator.toLowerCase()];
    if (!translator) { return 'No translator' + translator; }

    var item;
    var items = col.getChildren(true, false, 'item');
    items = [item.id for (item of items)];
    items = Zotero.Items.get(items);

    var translation = new Zotero.Translate.Export();
    translation.setItems(items);
    translation.setTranslator(translator);

    var status = {finished: false};

    translation.setHandler("done", function(obj, success) {
      status.success = success;
      status.finished = true;
      if (success) { status.data = obj.string; }
    });
    translation.translate();

    while (!status.finished) {}

    if (status.success) {
      return status.data;
    } else {
      throw ('export failed');
    }
  },

  safeLoad: function(translator) {
    try {
      Zotero.BetterBibTex.load(translator);
    } catch (err) {
      Zotero.BetterBibTex.log('Loading ' + translator + ' failed: ' + err);
    }
  },

  load: function(translator) {
    Zotero.BetterBibTex.log('Loading ' + translator);

    var header = null;
    var data = null;
    var start = -1;

    try {
      data = Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/translators/' + translator);
      if (data) { start = data.indexOf('{'); }

      if (start >= 0) {
        let len = 0;
        for (len = 0; len < 3000; len++) {
          try {
            header = JSON.parse(data.substring(start, len).trim());
            data = data.substring(len, data.length);
            break;
          } catch (err) {
          }
        }
      }
    } catch (err) {
      header = null;
    }

    if (!header) {
      Zotero.BetterBibTex.log('Loading ' + translator + ' failed: ' + err);
      return;
    }

    Zotero.BetterBibTex.translators[header.label.toLowerCase()] = header.translatorID;

    var override;
    for (section of ['configOptions', 'displayOptions']) {
      if (!header[section]) { continue; }
      for (option in header[section]) {
        override = null;
          var value = header[section][option];
        try {
        switch (typeof value) {
          case 'boolean':
            override = Zotero.BetterBibTex.prefs.getBoolPref(option);
            break;
          case 'number':
            override = Zotero.BetterBibTex.prefs.getIntPref(option);
            break;
          case 'string':
            override = Zotero.BetterBibTex.prefs.getCharPref(option);
            if (override && override.trim() == '') { override = null; }
            break;
        }
        } catch (err) {
          continue;
        }
        if (((typeof override) == 'undefined') || (override === null)) { continue; }
        Zotero.BetterBibTex.log('setting ' + section + '.' + [option] + '=' + override);
        header[section][option] = override;
        data = data.replace("safeGetOption('" + option + "')", JSON.stringify(override)); // explicit override, ought not be required
      }
    }

    Zotero.BetterBibTex.log("Installing " + header.label);
    Zotero.Translators.save(header, data);
  },

/* vim:set ts=2 sw=2 et: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * To use try out this JS server socket implementation, just copy this file
 * into the "components" directory of a Mozilla build.  Then load the URL
 * http://localhost:4444/ in the browser.  You should see a page get loaded
 * that was served up by this component :-)
 *
 * This code requires Mozilla 1.6 or better.
 */

  Server: function(port) { 
    const nsISupports = Components.interfaces.nsISupports;
    const nsIObserver = Components.interfaces.nsIObserver;
    const nsIServerSocket = Components.interfaces.nsIServerSocket;
    const nsIServerSocketListener = Components.interfaces.nsIServerSocketListener;
    const nsITransport = Components.interfaces.nsITransport;

    this.QueryInterface = function(iid) {
      if (iid.equals(nsIObserver) || iid.equals(nsIServerSocketListener) || iid.equals(nsISupports)) return this;

      throw Components.results.NS_ERROR_NO_INTERFACE;
    };

    this.observe = function(subject, topic, data) {
      Zotero.BetterBibTex.log(">>> observe [" + topic + "]");
      this.startListening();
    };

    /* this function is called when we receive a new connection */
    this.onSocketAccepted = function(serverSocket, clientSocket) {
      Zotero.BetterBibTex.log(">>> accepted connection on "+clientSocket.host+":"+clientSocket.port);

      var input = clientSocket.openInputStream(nsITransport.OPEN_BLOCKING, 0, 0);
      var output = clientSocket.openOutputStream(nsITransport.OPEN_BLOCKING, 0, 0);

      var handler = new Zotero.BetterBibTex.RequestHandler(input, output);
      input.asyncWait(handler, 0, 0, Zotero.BetterBibTex.threadManager.mainThread);
    };

    this.onStopListening = function(serverSocket, status) {
      Zotero.BetterBibTex.log(">>> shutting down server socket");
    };

    this.startListening = function() {
      const SERVERSOCKET_CONTRACTID = "@mozilla.org/network/server-socket;1";
      var socket = Components.classes[SERVERSOCKET_CONTRACTID].createInstance(nsIServerSocket);
      socket.init(this.port, false /* loopback only */, -1);
      Zotero.BetterBibTex.log(">>> listening on port "+socket.port);
      socket.asyncListen(this);
    };

    Zotero.BetterBibTex.log('server started');
    this.port = port;
    this.startListening();
  },

  RequestHandler: function(input, output) {
    const nsIScriptableInputStream = Components.interfaces.nsIScriptableInputStream;

    this.input = input;
    this.output = output;

    this.onInputStreamReady = function(input) {
      var req = this.request();
      req = req.split(/\r?\n/);
      req = req[0];
      Zotero.BetterBibTex.log(req);

      var response = null;
      var cmd = req.match(/^GET\s+\/(bib(la)?tex)\/([^\s]+_[^\s]+)(\sHTTP\/)?/i);

      if (cmd) {
        var translator = cmd[1];
        var collection = cmd[3].replace(/\.bib$/i, '');

        try {
          response = "HTTP/1.1 200 OK\nContent-Type: text/plain\n\n" + Zotero.BetterBibTex.export(translator, collection);
        } catch (err) {
          response = "HTTP/1.1 404 Not Found\nContent-Type: text/plain\n\nNo collection found: " + err;
        }
      } else {
        Zotero.BetterBibTex.log('no support for ' + req);
        response = "HTTP/1.1 501 Not Implemented\nContent-Type: text/plain\n\nCommand not implemented: " + req;
      }
      var n = this.output.write(response, response.length);
      Zotero.BetterBibTex.log(">>> wrote "+n+" bytes");

      this.input.close();
      this.output.close();
    };

    this.request = function(input) {
      var req = '';
      /* use nsIScriptableInputStream to consume all of the data on the stream */

      var sin = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(nsIScriptableInputStream);
      sin.init(this.input);

      /* discard all data */
      while (sin.available() > 0) req += sin.read(512);
      return req;
    };

  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
