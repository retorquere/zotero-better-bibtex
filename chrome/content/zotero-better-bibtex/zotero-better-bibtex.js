Components.utils.import("resource://gre/modules/Services.jsm");

Zotero.BetterBibTex = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex."),
  zotPrefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero."),
  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  translators: {},
  threadManager: Components.classes["@mozilla.org/thread-manager;1"].getService(),
  windowMediator: Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),

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
    Zotero.BetterBibTex.safeLoad('KeyOnly.js');
    Zotero.Translators.init();

    var recursive = false;
    try {
      recursive = zotPrefs.getBoolPref('recursiveCollections');
    } catch (err) {}

    try {
      _recursive = Zotero.BetterBibTex.prefs.getBoolPref('getCollections');
      Zotero.BetterBibTex.prefs.setBoolPref('getCollections', null);
      if (_recursive != null) { recursive = _recursive; }
    } catch (err) {}

    Zotero.BetterBibTex.config = {
      getCollections: recursive,
      citeCommand: Zotero.BetterBibTex.prefs.getCharPref('citeCommand'),
      citeKeyFormat: Zotero.BetterBibTex.prefs.getCharPref('citeKeyFormat'),
      forceUnicode: Zotero.BetterBibTex.prefs.getCharPref('forceUnicode')
    };

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

    var translator = Zotero.BetterBibTex.translators['better' + translator.toLowerCase()] || Zotero.BetterBibTex.translators[translator.toLowerCase()];
    if (!translator) { throw('No translator' + translator); }

    var item;
    var items = col.getChildren(true, false, 'item');
    items = [item.id for (item of items)];
    items = Zotero.Items.get(items);

    var charset;
    try {
      charset = (Zotero.BetterBibTex.prefs.getBoolPref('BibLaTex.ASCII') ? 'US-ASCII' : 'UTF-8');
    } catch (err) {
      charset = 'UTF-8';
    }
    return Zotero.BetterBibTex.translate(translator, items, charset);
  },

  translate: function(translator, items, charset) {
    if (!translator) { throw('null translator'); }

    var translation = new Zotero.Translate.Export();
    translation.setItems(items);
    translation.setDisplayOptions({exportCharset: charset});
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
      Zotero.BetterBibTex.log('Loading ' + translator + ' failed: could not parse header');
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
  },

  setCiteKeys: function() {
    var translator = Zotero.BetterBibTex.translators['citationkeys'];

    var win = Zotero.BetterBibTex.windowMediator.getMostRecentWindow("navigator:browser");
    var item;
    var items = win.ZoteroPane.getSelectedItems();
    items = Zotero.Items.get([item.id for (item of items)]);
    items = [item for (item of items) if (!(item.isAttachment() || item.isNote()))];

    // clear keys first so the generator can make fresh ones
    for (item of items) {
      var extra = '' + item.getField('extra');
      extra = extra .replace(/bibtex:\s*[^\s\r\n]+/, '');
      extra = extra.trim();
      item.setField('extra', extra);
      item.save();
    }

    try {
      Zotero.BetterBibTex.log('Fetching keys: for ' + items.length + ' items');
      var keys = Zotero.BetterBibTex.translate(translator, [item for (item of items)]);
      Zotero.BetterBibTex.log('Found keys: ' + keys);
      keys = JSON.parse(keys);
    } catch (err) {
      Zotero.BetterBibTex.log('Cannot set keys: ', err);
      return;
    }

    for (item of items) {
      if (!keys[item.key]) { continue; }

      Zotero.BetterBibTex.log('Setting key for ' + item.key + ': ' + keys[item.key]);

      var extra = '' + item.getField('extra');
      extra = extra.trim();
      if (extra.length > 0) { extra += "\n"; }
      item.setField('extra', extra + 'bibtex: ' + keys[item.key]);
      item.save();
    }
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.BetterBibTex.init(); }, false);
