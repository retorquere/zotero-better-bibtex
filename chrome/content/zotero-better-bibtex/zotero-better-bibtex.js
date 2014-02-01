Components.utils.import("resource://gre/modules/Services.jsm");

Zotero.BetterBibTex = {
  prefs: {
    bbt: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex."),
    zotero: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero."),
    hidden: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero.translators.better-bibtex.")
  },

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

  pref: function(key, dflt, branch) {
    branch = Zotero.BetterBibTex.prefs[branch || 'bbt'];
    try {
      switch (typeof dflt) {
        case 'boolean':
          return branch.getBoolPref(key);
        case 'number':
          return branch.getIntPref(key);
        case 'string':
          return branch.getCharPref(key);
      }
    } catch (err) {
      return dflt;
    }
  },

  init: function () {
    // migrate options
    Zotero.BetterBibTex.prefs.bbt.clearUserPref('BibLaTex.ASCII');
    Zotero.BetterBibTex.prefs.bbt.clearUserPref('citekeyformat');
    Zotero.BetterBibTex.prefs.bbt.clearUserPref('getCollections');
    for (var option of ['citeCommand', 'citeKeyFormat']) {
      try {
        var value = Zotero.BetterBibTex.prefs.bbt.getCharPref(option);
        if (value) {
          Zotero.BetterBibTex.prefs.hidden.setCharPref(option, value);
          Zotero.BetterBibTex.prefs.bbt.clearUserPref(option);
        }
      } catch (err) {}
    }

    for (var endpoint of Object.keys(Zotero.BetterBibTex.endpoints)) {
      var url = "/better-bibtex/" + endpoint;
      console.log('Registering endpoint ' + url);
      var ep = Zotero.Server.Endpoints[url] = function() {};
      ep.prototype = Zotero.BetterBibTex.endpoints[endpoint];
    }

    Zotero.BetterBibTex.config = {}
    for (var option of ['citeCommand', 'citeKeyFormat', 'fancyURLs', 'unicode']) {
      var value = null;
      try {
        value = Zotero.BetterBibTex.prefs.hidden.getPref(option);
      } catch(err) {}
      Zotero.BetterBibTex.config[option] = value;
    }

    Zotero.BetterBibTex.safeLoad('Better BibTeX.js');
    Zotero.BetterBibTex.safeLoad('Better BibLaTeX.js');
    Zotero.BetterBibTex.safeLoad('BibTeX Citations.js');
    Zotero.BetterBibTex.safeLoad('Pandoc Citations.js');
    Zotero.BetterBibTex.safeLoad('BibTeX Citation Keys.js');
    Zotero.Translators.init();
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

    var items = col.getChildren(Zotero.BetterBibTex.pref('recursiveCollections', false, 'zotero'), false, 'item');
    items = [item.id for (item of items)];
    items = Zotero.Items.get(items);

    return Zotero.BetterBibTex.translate(translator, items);
  },

  translate: function(translator, items) {
    if (!translator) { throw('null translator'); }

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
        let len = data.indexOf('}', start);
        if (len > 0) {
          for (len -= start; len < 3000; len++) {
            try {
              header = JSON.parse(data.substring(start, len).trim());
              // comment out header but keep linecount the same -- helps in debugging
              data = data.substring(start + len, data.length);
              break;
            } catch (err) {
            }
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

    //header.hiddenPrefs = {}
    //for(var pref in Zotero.BetterBibTex.config) { header.hiddenPrefs[pref]=Zotero.BetterBibTex.config[pref]; }

    Zotero.BetterBibTex.translators[header.label.toLowerCase().replace(/[^a-z]/, '')] = header.translatorID;

    Zotero.BetterBibTex.log("Installing " + header.label);
    Zotero.Translators.save(header, data);
    Zotero.Translators.update([header]);
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
