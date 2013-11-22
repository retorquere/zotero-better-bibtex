Components.utils.import("resource://gre/modules/Services.jsm");

Zotero.BetterBibTex = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex."),
  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  translators: {},
  threadManager: Components.classes["@mozilla.org/thread-manager;1"].getService(),

  log: function(msg, e) {
    msg = '[better-bibtex] ' + msg;
    if (e) {
      msg += "\nan error occurred: ";
      if (e.name) {
        msg += e.name + ": " + e.message + " \n(" + e.fileName + ", " + e.lineNumber + ")";
      } else {
        msg += e;
      }
      if (e.stack) { msg += "\n" + e.stack; }
    }
    Zotero.debug(msg);
    console.log(msg);
  },

  init: function () {
    Zotero.BetterBibTex.safeLoad('BetterBibLaTex.js');
    Zotero.BetterBibTex.safeLoad('BetterCiteTex.js');
    Zotero.BetterBibTex.safeLoad('BetterBibTex.js');
    Zotero.BetterBibTex.safeLoad('PandocCite.js');
    Zotero.Translators.init();

    for (var endpoint of Object.keys(Zotero.BetterBibTex.endpoints)) {
      var url = "/better-bibtex/" + endpoint;
      console.log('Registering endpoint ' + url);
      var ep = Zotero.Server.Endpoints[url] = function() {};
      ep.prototype = Zotero.BetterBibTex.endpoints[endpoint];
    }
  },

  endpoints: {
    collection: {
      supportedMethods: ['GET'],

      init: function(url, data, sendResponseCallback) {
        var collection;

        try {
          collection = url.query[''];
        } catch (err) {
          collection = null;
        }

        if (!collection) {
          sendResponseCallback(501, "text/plain", "Could not export bibliography: no path");
          return;
        }

        try {
          var path = collection.split('.');

          if (path.length == 1) {
            sendResponseCallback(404, "text/plain", "Could not export bibliography '" + collection + "': no format specified");
            return;
          }
          var translator = path.pop();
          var path = path.join('.');
          sendResponseCallback(200, "text/plain", Zotero.BetterBibTex.export(translator, path));
        } catch (err) {
          Zotero.BetterBibTex.log("Could not export bibliography '" + collection + "'", err);
          sendResponseCallback(404, "text/plain", "Could not export bibliography '" + collection + "': " + err);
        }
      }
    }
  },

  export: function(translator, collectionkey) {
    if (collectionkey.charAt(0) != '/') { collectionkey = '/0/' + collectionkey; }
    Zotero.BetterBibTex.log('exporting ' + collectionkey + ' in ' + translator);

    var path = collectionkey.split('/');
    path.shift(); // remove leading /

    var libid = parseInt(path.shift());
    if (isNaN(libid)) {
      throw('Not a valid library ID: ' + collectionkey);
    }

    var key = '' + path[0];
    
    var col = null;
    for (var name of path) {
      var children = Zotero.getCollections(col && col.id, false, libid);
      col = null;
      for (child of children) {
        if (child.name.toLowerCase() == name.toLowerCase()) {
          col = child;
          break;
        }
      }
      if (!col) { break; }
    }

    if (!col) {
      col = Zotero.Collections.getByLibraryAndKey(libid, key);
    }

    if (!col) { throw (collectionkey + ' not found'); }

    var translator = Zotero.BetterBibTex.translators[translator.toLowerCase()];
    if (!translator) { throw('No translator' + translator); }

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
      Zotero.BetterBibTex.log('Loading ' + translator + ' failed', err);
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
      Zotero.BetterBibTex.log('Loading ' + translator + ' failed', err);
      return;
    }

    Zotero.BetterBibTex.translators[header.label.toLowerCase().replace(/[^a-z]/, '')] = header.translatorID;

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
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
