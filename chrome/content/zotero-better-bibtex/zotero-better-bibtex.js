Components.utils.import("resource://gre/modules/Services.jsm");

Zotero.BetterBibTeX = {
  prefs: {
    zotero: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero."),
    bbt:    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero.translators.better-bibtex."),
    dflt:   Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getDefaultBranch("extensions.zotero.translators.better-bibtex."),

    legacy: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero-better-bibtex.")
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
    branch = Zotero.BetterBibTeX.prefs[branch || 'bbt'];
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
    Zotero.BetterBibTeX.prefs.legacy.clearUserPref('BibLaTex.ASCII');
    Zotero.BetterBibTeX.prefs.legacy.clearUserPref('citekeyformat');
    Zotero.BetterBibTeX.prefs.legacy.clearUserPref('getCollections');
    for (var option of ['citeCommand', 'citeKeyFormat']) {
      try {
        var value = Zotero.BetterBibTeX.prefs.legacy.getCharPref(option);
        if (value) {
          Zotero.BetterBibTeX.prefs.bbt.setCharPref(option, value);
          Zotero.BetterBibTeX.prefs.legacy.clearUserPref(option);
        }
      } catch (err) {}
    }

    for (var endpoint of Object.keys(Zotero.BetterBibTeX.endpoints)) {
      var url = "/better-bibtex/" + endpoint;
      Zotero.BetterBibTeX.log('Registering endpoint ' + url);
      var ep = Zotero.Server.Endpoints[url] = function() {};
      ep.prototype = Zotero.BetterBibTeX.endpoints[endpoint];
    }

    Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
      KeyManager: Zotero.BetterBibTeX.KeyManager
    };

    Zotero.BetterBibTeX.safeLoad('Better BibTeX.js');
    Zotero.BetterBibTeX.safeLoad('Better BibLaTeX.js');
    Zotero.BetterBibTeX.safeLoad('LaTeX Citation.js');
    Zotero.BetterBibTeX.safeLoad('Pandoc Citation.js');
    Zotero.BetterBibTeX.safeLoad('BibTeX Citation Keys.js');
    Zotero.BetterBibTeX.safeLoad('Zotero TestCase.js');
    Zotero.Translators.init();
  },

  displayOptions: function(url) {
    var params = {};
    var hasParams = false;

    ['exportCharset', 'exportNotes?', 'useJournalAbbreviation?'].forEach(function(key) {
      try {
        var isBool = key.match(/[?]$/);
        if (isBool) { key = key.replace(isBool[0], ''); }
        params[key] = url.query[key];
        if (isBool) { params[key] = (['y', 'yes', 'true'].indexOf(params[key].toLowerCase()) >= 0); }
        hasParams = true;
      } catch (e) {}
    });
    Zotero.BetterBibTeX.log('displayOptions = ' + JSON.stringify(params));
    return (hasParams ? params : null);
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

          var items = []

          Zotero.BetterBibTeX.log('exporting: ' + path + ' to ' + translator);
          for (var collectionkey of path.split('+')) {
            if (collectionkey.charAt(0) != '/') { collectionkey = '/0/' + collectionkey; }
            Zotero.BetterBibTeX.log('exporting ' + collectionkey);

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

            var _items = col.getChildren(Zotero.BetterBibTeX.pref('recursiveCollections', false, 'zotero'), false, 'item');
            items = items.concat(Zotero.Items.get([item.id for (item of _items)]));
          }

          sendResponseCallback(
            200,
            "text/plain",
            Zotero.BetterBibTeX.translate(
              Zotero.BetterBibTeX.getTranslator(translator),
              items,
              Zotero.BetterBibTeX.displayOptions(url)
            )
          );
        } catch (err) {
          Zotero.BetterBibTeX.log("Could not export bibliography '" + collection + "'", err);
          sendResponseCallback(404, "text/plain", "Could not export bibliography '" + collection + "': " + err);
        }
      }
    },

    library: {
      supportedMethods: ['GET'],

      init: function(url, data, sendResponseCallback) {
        var library;

        try {
          library = url.query[''];
        } catch (err) {
          library = null;
        }

        if (!library) {
          sendResponseCallback(501, "text/plain", "Could not export bibliography: no path");
          return;
        }

        try {
          var libid = 0;
          var path = library.split('/');
          if (path.length > 1) {
              path.shift(); // leading /
              libid = parseInt(path[0]);
              path.shift();

              if (!Zotero.Libraries.exists(libid)) {
                  sendResponseCallback(404, "text/plain", "Could not export bibliography: library '" + library + "' does not exist");
                  return;
              }
          }

          var path = path.join('/').split('.');

          if (path.length == 1) {
            sendResponseCallback(404, "text/plain", "Could not export bibliography '" + library + "': no format specified");
            return;
          }
          var translator = path.pop();

          sendResponseCallback(
            200,
            "text/plain",
            Zotero.BetterBibTeX.translate(
              Zotero.BetterBibTeX.getTranslator(translator),
              Zotero.Items.getAll(false, libid, false),
              Zotero.BetterBibTeX.displayOptions(url)
            )
          );
        } catch (err) {
          Zotero.BetterBibTeX.log("Could not export bibliography '" + library + "'", err);
          sendResponseCallback(404, "text/plain", "Could not export bibliography '" + library + "': " + err);
        }
      }
    }
  },

  translate: function(translator, items, displayOptions) {
    if (!translator) { throw('null translator'); }

    var translation = new Zotero.Translate.Export();
    translation.setItems(items);
    translation.setTranslator(translator);
    translation.setDisplayOptions(displayOptions);

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
      Zotero.BetterBibTeX.load(translator);
    } catch (err) {
      Zotero.BetterBibTeX.log('Loading ' + translator + ' failed', err);
    }
  },

  load: function(translator) {
    Zotero.BetterBibTeX.log('Loading ' + translator);

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
      Zotero.BetterBibTeX.log('Loading ' + translator + ' failed: could not parse header');
      return;
    }

    Zotero.BetterBibTeX.translators[header.label.toLowerCase().replace(/[^a-z]/, '')] = header.translatorID;

    Zotero.BetterBibTeX.log("Installing " + header.label);
    Zotero.Translators.save(header, data);
  },

  getTranslator: function(name) {
    name = name.toLowerCase().replace(/[^a-z]/, '');
    var translator = Zotero.BetterBibTeX.translators['better' + name] || Zotero.BetterBibTeX.translators[name];
    if (!translator) { throw('No translator' + name + '; available: ' + Object.keys(Zotero.BetterBibTeX.translators).join(', ')); }
    return translator;
  },

  getCiteKeys: function(items) {
    var translator = Zotero.BetterBibTeX.getTranslator('BibTeX Citation Keys');
    if (!translator) { throw('No translator' + translator); }

    try {
      Zotero.BetterBibTeX.log('Fetching keys: for ' + items.length + ' items');
      var keys = Zotero.BetterBibTeX.translate(translator, [item for (item of items)]);
      Zotero.BetterBibTeX.log('Found keys: ' + keys);
      return JSON.parse(keys);
    } catch (err) {
      Zotero.BetterBibTeX.log('Cannot retrieve keys: ', err);
      return null;
    }
  },

  setCiteKeys: function() {
    var win = Zotero.BetterBibTeX.windowMediator.getMostRecentWindow("navigator:browser");
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
      item.save({ skipDateModifiedUpdate: true });
    }

    var keys = Zotero.BetterBibTeX.getCiteKeys(items);
    if (!keys) {
      Zotero.BetterBibTeX.log('Cannot set keys');
      return;
    }

    items.forEach(function(item) {
      if (keys[item.id]) {
        Zotero.BetterBibTeX.log('Setting key for ' + item.id + ': ' + keys[item.id]);

        var extra = '' + item.getField('extra');
        extra = extra.trim();
        if (extra.length > 0) { extra += "\n"; }
        item.setField('extra', extra + 'bibtex: ' + keys[item.id]);
        item.save({ skipDateModifiedUpdate: true });
      }
    });
  }
};
