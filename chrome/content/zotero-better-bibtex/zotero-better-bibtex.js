Components.utils.import("resource://gre/modules/Services.jsm");

Zotero.BetterBibTeX = {
  prefs: {
    zotero: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero."),
    bbt:    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero.translators.better-bibtex."),
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
    var endpoint;
    for (endpoint in Zotero.BetterBibTeX.endpoints) {
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

    var notifierID = Zotero.Notifier.registerObserver(this.itemChanged, ['item']);
    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function(e) { Zotero.Notifier.unregisterObserver(notifierID); }, false);
  },

  itemChanged: {
    notify: function(event, type, ids, extraData) {
      switch (event) {
        case 'delete':
          Object.keys(extraData).forEach(function(id) { Zotero.BetterBibTeX.KeyManager.clear({itemID: id}); });
          break;

        case 'add':
        case 'modify':
          Zotero.BetterBibTeX.KeyManager.updated(ids);
          break;
      }
    }
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
              Zotero.Items.getAll(false, libid),
              Zotero.BetterBibTeX.displayOptions(url)
            )
          );
        } catch (err) {
          Zotero.BetterBibTeX.log("Could not export bibliography '" + library + "'", err);
          sendResponseCallback(404, "text/plain", "Could not export bibliography '" + library + "': " + err);
        }
      }
    },

    debug: {
      supportedMethods: ['POST'],

      init: function(url, data, sendResponseCallback) {
        //if (!Zotero.BetterBibTeX.prefs.bbt.getBoolPref('debug')) { return; }

        try {
          var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);

          data = JSON.parse(data);
          var batchRequest;
          var response = [];

          if (Array.isArray(data)) {
            batchRequest = true;
          } else {
            data = [data];
            batchRequest = false;
          }

          // getAll is ridiculously unpredictable. Return value can be an array, an object (only one object present), or
          // an exception (empty library), without any way to predict which.
          function safeGetAll() {
            var all;
            try {
              all = Zotero.Items.getAll();
              if (all && !Array.isArray(all)) { all = [all]; }
            } catch (err) {
              all = false;
            }
            if (!all) { all = []; }

            // sometimes a pseudo-array is returned
            var i, _all = [];
            for (var i = 0; i < all.length; i++) { _all.push(all[i]); }
            return _all;
          }

          data.forEach(function(req) {
            var result = {};
            if (req.jsonrpc) { result.jsonrpc = req.jsonrpc; }
            result.id = (req.id || (typeof req.id) == 'number' ? req.id : null);
            if (!Array.isArray(req.params)) throw('Only array parameters are supported');

            // ------------------------- METHODS ---------------------------
            var method = {
              reset: function() {
                Zotero.Debug.setStore(true);

                if (Zotero.BetterBibTeX.prefs.stashed) {
                  Zotero.BetterBibTeX.prefs.stashed.forEach(function(name, value) {
                    switch (typeof value) {
                      case 'boolean':
                        prefs.setBoolPref(name, value);
                        break;
                      case 'number':
                        prefs.setIntPref(name, value);
                        break;
                      case 'string':
                        prefs.setCharPref(name, value);
                        break;
                    }
                  });
                }
                Zotero.BetterBibTeX.prefs.stashed = Dict();
                Zotero.BetterBibTeX.debugExportOptions = Dict();

                var all = safeGetAll();
                if (all.length > 0) { Zotero.Items.erase(all.map(function(item) { return item.id; })); }
                try {
                  var coll = Zotero.getCollections().map(function(c) { return c.id; });
                  Zotero.Collections.erase(coll);
                } catch (err) { }
              },

              log: function() {
                return Zotero.Debug.get();
              },

              import: function(filename) {
                var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                file.initWithPath(filename);
                Zotero_File_Interface.importFile(file);
                return true;
              },

              export: function(translator) {
                var all = safeGetAll();

                /*
                Zotero.BetterBibTeX.log('getAll found ' + all.length + ' items');
                var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                file.initWithPath('/tmp/zotero.log');
                var dbg = 'getAll: ' + all.length + " items\n";
                // dbg += all.map(function(item) { return JSON.stringify(item.serialize()); }).join("\n") + "\n";
                dbg += Zotero.Debug.get();
                Zotero.File.putContents(file, dbg);
                */

                if (all.length == 0) {
                  Zotero.BetterBibTeX.log('getAll found no items');
                  return '';
                }

                all.sort(function(a, b) { return a.itemID - b.itemID; });
                var translator = Zotero.BetterBibTeX.getTranslator(translator);
                var items = Zotero.BetterBibTeX.translate(translator, all, Zotero.BetterBibTeX.debugExportOptions || {});
                return items;
              },

              getAll: function() {
                var all = safeGetAll();

                /*
                Zotero.BetterBibTeX.log('getAll found ' + all.length + ' items');
                var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                file.initWithPath('/tmp/zotero.log');
                var dbg = 'getAll: ' + all.length + " items\n";
                // dbg += all.map(function(item) { return JSON.stringify(item.serialize()); }).join("\n") + "\n";
                dbg += Zotero.Debug.get();
                Zotero.File.putContents(file, dbg);
                */

                if (all.length == 0) {
                  Zotero.BetterBibTeX.log('getAll found no items');
                  return [];
                }

                all.sort(function(a, b) { return a.itemID - b.itemID; });
                var translator = Zotero.BetterBibTeX.getTranslator('Zotero TestCase');
                var items = Zotero.BetterBibTeX.translate(translator, all, {exportNotes: true, exportFileData: false});
                return JSON.parse(items).items;
              },

              setExportOption: function(name, value) {
                Zotero.BetterBibTeX.debugExportOptions[name] = value;
              },
              setCharPref: function(name, value) {
                if (typeof Zotero.BetterBibTeX.prefs.stashed[name] != 'undefined') { Zotero.BetterBibTeX.prefs.stashed[name] = prefs.getCharPref(name); }
                prefs.setCharPref(name, value);
              },
              setBoolPref: function(name, value) {
                if (typeof Zotero.BetterBibTeX.prefs.stashed[name] != 'undefined') { Zotero.BetterBibTeX.prefs.stashed[name] = prefs.getBoolPref(name); }
                prefs.setBoolPref(name, value);
              },
              setIntPref: function(name, value) {
                if (typeof Zotero.BetterBibTeX.prefs.stashed[name] != 'undefined') { Zotero.BetterBibTeX.prefs.stashed[name] = prefs.getIntPref(name); }
                prefs.setIntPref(name, value);
              }
            }[req.method];

            result.result = method.apply(null, req.params);
            if (typeof result.result == 'undefined') { result.result = null; }
            response.push(result);
          });

          if (!batchRequest) { response = response[0]; }

          sendResponseCallback(200, 'application/json', JSON.stringify(response));
        } catch (err) {
          var logs = '';
          var logs = Zotero.Debug.get();
          sendResponseCallback(200, 'application/json', JSON.stringify({jsonrpc: '2.0', error: {code: 5000, message: '' + err + "\n" + err.stack + "\n" + logs}, id: null}));
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
    for (item of items) { Zotero.BetterBibTeX.KeyManager.clear(item); }
    Zotero.BetterBibTeX.getCiteKeys(items);
  }
};
