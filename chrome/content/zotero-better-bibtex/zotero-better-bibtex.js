Components.utils.import("resource://gre/modules/Services.jsm");

Zotero.BetterBibTeX = {
  Prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero.translators.better-bibtex."),

  pp: function(obj) {
    var toString = Object.prototype.toString,
        tab = 2,
        buffer = '',
        //Second argument is indent
        indent = arguments[1] || 0,
        //For better performance, Cache indentStr for a given indent.
        indentStr = (function(n) { var str = ''; while(n--){ str += ' '; } return str; })(indent);

    if(!obj || ( typeof obj != 'object' && typeof obj!= 'function' )){
      //any non-object ( Boolean, String, Number), null, undefined, NaN
      buffer += obj;
    } else if(toString.call(obj) == '[object Date]') {
      buffer += '[Date] ' + obj;
    } else if(toString.call(obj) == '[object RegExp') {
      buffer += '[RegExp] ' + obj;
    } else if(toString.call(obj) == '[object Function]') {
      buffer += '[Function] ' + obj;
    } else if(toString.call(obj) == '[object Array]') {
      var idx = 0, len = obj.length;
      buffer += "[\n";
      while(idx < len){
        buffer += [ indentStr, idx, ': ', this.pp(obj[idx], indent + tab) ].join('');
        buffer += "\n";
        idx++;
      }
      buffer += indentStr + ']';
    } else { //Handle Object
      var prop;
      buffer += "{\n";
      for(prop in obj){
        buffer += [ indentStr, prop, ': ', this.pp(obj[prop], indent + tab) ].join('');
        buffer += "\n";
      }
      buffer += indentStr + '}';
    }

    return buffer;
  },

  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  translators: {},
  threadManager: Components.classes["@mozilla.org/thread-manager;1"].getService(),
  windowMediator: Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),

  array: function(arr) {
    if (Array.isArray(arr)) { return arr; }
    var i, _arr = [];
    for (i = 0; i < arr.length; i++) { _arr.push(arr[i]); }
    return _arr;
  },

  log: function(msg, e) {
    msg = '[better-bibtex ' + (Date.now() / 1000) + '] ' + msg;
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

  DB: new Zotero.DBConnection('betterbibtex'),

  formatter: function(pattern) {
    if (!this.formatters) { this.formatters = Dict(); }
    if (!this.formatters[pattern]) { this.formatters[pattern] = BetterBibTeXFormatter.parse(pattern); }
    return this.formatters[pattern];
  },

  init: function () {
    // this.log('initializing: ' + !this.initialized);
    if (this.initialized) { return; }
    this.initialized = true;

    this.DB.query('create table if not exists _version_ (tablename primary key, version not null, unique (tablename, version))');
    this.DB.query("insert or ignore into _version_ (tablename, version) values ('keys', 0)");

    this.log('keys version = ' + JSON.stringify(this.DB.valueQuery("select version from _version_ where tablename = 'keys'")));
    switch (this.DB.valueQuery("select version from _version_ where tablename = 'keys'")) {
      case 0:
        this.log('initializing DB: no tables');
        this.DB.query('create table keys (itemID primary key, libraryID not null, citekey not null, pinned)');
        this.DB.query("insert or replace into _version_ (tablename, version) values ('keys', 1)");
        break;
    }
    // this.DB.query('PRAGMA temp_store=MEMORY;');
    // this.DB.query('PRAGMA journal_mode=MEMORY;');
    // this.DB.query('PRAGMA synchronous = OFF;');

    var endpoint;
    for (endpoint in Zotero.BetterBibTeX.endpoints) {
      var url = "/better-bibtex/" + endpoint;
      this.log('Registering endpoint ' + url);
      var ep = Zotero.Server.Endpoints[url] = function() {};
      ep.prototype = this.endpoints[endpoint];
    }

    this.keymanager = new this.KeyManager();
    Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
      keymanager: Zotero.BetterBibTeX.keymanager
    };

    this.safeLoad('Better BibTeX.js');
    this.safeLoad('Better BibLaTeX.js');
    this.safeLoad('LaTeX Citation.js');
    this.safeLoad('Pandoc Citation.js');
    this.safeLoad('Zotero TestCase.js');
    Zotero.Translators.init();

    var notifierID = Zotero.Notifier.registerObserver(this.itemChanged, ['item']);
    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function(e) { Zotero.Notifier.unregisterObserver(notifierID); }, false);
  },

  findKeysSQL: "" +
      "select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra " +
      "from items i " +
      "join itemData id on i.itemID = id.itemID " +
      "join itemDataValues idv on idv.valueID = id.valueID " +
      "join fields f on id.fieldID = f.fieldID  " +
      "where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems) and idv.value like '%bibtex:%'",

  itemChanged: {
    notify: function(event, type, ids, extraData) {
      switch (event) {
        case 'delete':
          Object.keys(extraData).forEach(function(id) { Zotero.BetterBibTeX.clearKey({itemID: id}, true); });
          break;

        case 'add':
        case 'modify':
          if (ids.length === 0) { break; }

          ids = '(' + ids.map(function(id) { return '' + id; }).join(',') + ')';

          Zotero.BetterBibTeX.DB.query('delete from keys where itemID in ' + ids);
          for (let item of Zotero.BetterBibTeX.array(Zotero.DB.query(Zotero.BetterBibTeX.findKeysSQL + ' and i.itemID in ' + ids) || [])) {
            var citekey = Zotero.BetterBibTeX.keymanager.extract({extra: item.extra});
            Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and pinned <> 1 and citekey = ?', [item.libraryID, citekey]);
            Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, 1)', [item.itemID, item.libraryID, citekey]);
          }

          for (let item of Zotero.BetterBibTeX.array(Zotero.DB.query('select coalesce(libraryID, 0) as libraryID, itemID from items where itemID in ' + ids) || [])) {
            Zotero.BetterBibTeX.keymanager.get(item, 'on-change');
          }
          break;
      }
    }
  },

  clearKey: function(item, onlyCache) {
    if (!onlyCache) {
      var _item = {extra: '' + item.getField('extra')};
      var citekey = !this.keymanager.extract(_item);
      if (citekey) {
        item.setField('extra', _item.extra);
        item.save();
      }
    }
    Zotero.BetterBibTeX.DB.query('delete from keys where itemID = ?', [item.itemID]);
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

          if (path.length === 1) {
            sendResponseCallback(404, "text/plain", "Could not export bibliography '" + collection + "': no format specified");
            return;
          }
          var translator = path.pop();
          path = path.join('.');

          var items = [];

          Zotero.BetterBibTeX.log('exporting: ' + path + ' to ' + translator);
          for (var collectionkey of path.split('+')) {
            if (collectionkey.charAt(0) !== '/') { collectionkey = '/0/' + collectionkey; }
            Zotero.BetterBibTeX.log('exporting ' + collectionkey);

            path = collectionkey.split('/');
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
              for (let child of children) {
                if (child.name.toLowerCase() === name.toLowerCase()) {
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

            var recursive;
            try {
              recursive = Zotero.Prefs.get('recursiveCollections');
            } catch (e) {
              recursive = false;
            }
            var _items = col.getChildren(recursive, false, 'item');
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

          path = path.join('/').split('.');

          if (path.length === 1) {
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

    selected: {
      supportedMethods: ['GET'],

      init: function(url, data, sendResponseCallback) {
        var translator;

        try {
          translator = url.query[''];
        } catch (err) {
          translator = null;
        }

        if (!translator) {
          sendResponseCallback(501, "text/plain", "Could not export bibliography: no path");
          return;
        }

        var win = Zotero.BetterBibTeX.windowMediator.getMostRecentWindow("navigator:browser");
        var item;
        var items = win.ZoteroPane.getSelectedItems();
        items = Zotero.Items.get([item.id for (item of items)]);

        sendResponseCallback(
          200,
          "text/plain",
          Zotero.BetterBibTeX.translate(
            Zotero.BetterBibTeX.getTranslator(translator),
            items,
            Zotero.BetterBibTeX.displayOptions(url)
          )
        );
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
    Zotero.Translators.save(header, data);
  },

  getTranslator: function(name) {
    name = name.toLowerCase().replace(/[^a-z]/, '');
    var translator = Zotero.BetterBibTeX.translators['better' + name] || Zotero.BetterBibTeX.translators[name] || Zotero.BetterBibTeX.translators['zotero' + name];
    if (!translator) { throw('No translator' + name + '; available: ' + Object.keys(Zotero.BetterBibTeX.translators).join(', ')); }
    return translator;
  },

  clearCiteKeys: function(onlyCache) {
    var win = Zotero.BetterBibTeX.windowMediator.getMostRecentWindow("navigator:browser");
    var item;
    var items = win.ZoteroPane.getSelectedItems();
    items = Zotero.Items.get([item.id for (item of items)]);
    items = [item for (item of items) if (!(item.isAttachment() || item.isNote()))];

    for (item of items) { this.clearKey(item, onlyCache); }
    return items;
  },

  pinCiteKeys: function() {
    // clear keys first so the generator can make fresh ones
    var items = this.clearCiteKeys(true);

    items.forEach(function(item) {
      Zotero.BetterBibTeX.keymanager.get(item, 'manual');
    });
  },

  safeGetAll: function() {
    var all;
    try {
      all = Zotero.Items.getAll();
      if (all && !Array.isArray(all)) { all = [all]; }
    } catch (err) {
      all = false;
    }
    if (!all) { all = []; }

    // sometimes a pseudo-array is returned
    return Zotero.BetterBibTeX.array(all);
  },
  safeGet: function(ids) {
    if (ids.length === 0) { return []; }
    var all = Zotero.Items.get(ids);
    if (!all) { return []; }

    return Zotero.BetterBibTeX.array(all);
  },

  allowAutoPin: function() {
    return (Zotero.Prefs.get('sync.autoSync') || !Zotero.Sync.Server.enabled);
  },

  toArray: function(item) {
    if (!item.setField && !item.itemType && item.itemID) {
      item = Zotero.Items.get(item.itemID);
    }
    if (item.setField) {
      item = item.toArray(); // TODO: switch to serialize when Zotero does
    } else {
      // Zotero.BetterBibTeX.log('format: serialized item');
    }
    if (!item.itemType) {
      var e = new Error('dummy');
      throw("format: no item\n" + e.stack);
    }
    return item;
  },

  KeyManager: function() {
    /*
     * three-letter month abbreviations. I assume these are the same ones that the
     * docs say are defined in some appendix of the LaTeX book. (i don't have the
     * LaTeX book.)
     */
    this.months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    this.journalAbbrevCache = Dict();

    var self = this;

    self.journalAbbrev = function(item) {
      if (item._sandboxManager) { item = arguments[1]; } // the sandbox inserts itself in call parameters

      if (item.journalAbbreviation) { return item.journalAbbreviation; }
      if (!Zotero.BetterBibTeX.Prefs.getBoolPref('auto-abbrev')) { return; }

      if (typeof this.journalAbbrevCache[item.publicationTitle] === 'undefined') {
        var styleID = Zotero.BetterBibTeX.Prefs.getCharPref('auto-abbrev.style');
        if (styleID === '') { styleID = Zotero.Styles.getVisible().filter(function(style) { return style.usesAbbreviation; })[0]; }
        var style = Zotero.Styles.get(styleID);
        var cp = style.getCiteProc(true);

        cp.setOutputFormat('html');
        cp.updateItems([item.itemID]);
        cp.appendCitationCluster({"citationItems":[{id:item.itemID}], properties:{}}, true);
        cp.makeBibliography();

        var abbrevs = cp;
        ['transform', 'abbrevs', 'default', 'container-title'].forEach(function(p) {
          if (abbrevs) { abbrevs = abbrevs[p]; }
        });
        for (let title in (abbrevs || {})) {
          this.journalAbbrevCache[title] = abbrevs[title];
        }
        if (!this.journalAbbrevCache[item.publicationTitle]) { this.journalAbbrevCache[item.publicationTitle] = ''; }
      }
      return this.journalAbbrevCache[item.publicationTitle];
    };

    // dual-use
    self.extract = function(item) {
      if (item._sandboxManager) { item = arguments[1]; } // the sandbox inserts itself in call parameters
      if (item.getField) { item = {extra: item.getField('extra')}; }

      var embeddedKeyRE = /bibtex:\s*([^\s\r\n]+)/;
      var andersJohanssonKeyRE = /biblatexcitekey\[([^\]]+)\]/;
      var extra = item.extra;

      if (!item.extra) { return null; }

      var m = embeddedKeyRE.exec(item.extra) || andersJohanssonKeyRE.exec(item.extra);
      if (!m) { return null; }

      // does not save item!
      item.extra = item.extra.replace(m[0], '').trim();

      return m[1];
    };

    for (let row of Zotero.BetterBibTeX.array(Zotero.DB.query(Zotero.BetterBibTeX.findKeysSQL) || [])) {
      Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, ?)', [row.itemID, row.libraryID, self.extract({extra: row.extra}), 1]);
    }

    self.get = function(item, pinmode) {
      if (item._sandboxManager) { item = arguments[1]; pinmode = arguments[2]; } // the sandbox inserts itself in call parameters

      var citekey = Zotero.BetterBibTeX.DB.rowQuery('select citekey, pinned from keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0]);
      if (!citekey) {
        var Formatter = Zotero.BetterBibTeX.formatter(Zotero.BetterBibTeX.Prefs.getCharPref('citeKeyFormat'));
        citekey = new Formatter(Zotero.BetterBibTeX.toArray(item)).value;
        var postfix = {n: -1, c:''};
        Zotero.debug('basekey: ' + (citekey + postfix.c));
        while (Zotero.BetterBibTeX.DB.valueQuery('select count(*) from keys where citekey=? and libraryID = ?', [citekey + postfix.c, item.libraryID || 0])) {
          postfix.n++;
          postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n);
        }
        citekey = {citekey: citekey + postfix.c};
        Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and pinned <> 1 and citekey = ?', [item.libraryID || 0, citekey.citekey]);
        Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, 0)', [item.itemID, item.libraryID || 0, citekey.citekey]);
      }

      if (!citekey.pinned && (pinmode === 'manual' || (Zotero.BetterBibTeX.allowAutoPin() && pinmode === Zotero.BetterBibTeX.Prefs.getCharPref('pin-citekeys')))) {
        if (!item.getField) { item = Zotero.Items.get(item.itemID); }
        var _item = {extra: '' + item.getField('extra')};
        self.extract(_item);
        var extra = _item.extra.trim();
        item.setField('extra', extra + " \nbibtex: " + citekey.citekey);
        item.save();

        Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and pinned <> 1 and citekey = ?', [item.libraryID || 0, citekey.citekey]);
        Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, 1)', [item.itemID, item.libraryID || 0, citekey.citekey]);
      }

      return citekey.citekey;
    };

    self.keys = function() {
      var keys = Zotero.BetterBibTeX.array(Zotero.BetterBibTeX.DB.query('select * from keys order by libraryID, itemID'));
      return keys;
    };

  },

  DebugBridge: {
    data: {
      prefs: Dict(),
      exportOptions: {},
      setPref: function(name, value) {
        if (!Zotero.BetterBibTeX.DebugBridge.data.prefs[name]) { Zotero.BetterBibTeX.DebugBridge.data.prefs[name] = {}; }
        Zotero.BetterBibTeX.DebugBridge.data.prefs[name].set = value;

        if (typeof Zotero.BetterBibTeX.DebugBridge.data.prefs[name].reset === 'undefined') {
          var reset = null;
          try { reset = Zotero.Prefs.get(name); } catch (err) { }
          Zotero.BetterBibTeX.DebugBridge.data.prefs[name].reset = reset;
        }

        Zotero.Prefs.set(name, value);
      }
    },
    namespace: 'better-bibtex',
    methods: {
      reset: function() {
        Zotero.BetterBibTeX.init();
        var retval = Zotero.BetterBibTeX.DebugBridge.data.prefs;

        Dict.forEach(Zotero.BetterBibTeX.DebugBridge.data.prefs, function(name, value) {
          if (value.reset !== null) { Zotero.Prefs.set(name, value.reset); }
        });
        Zotero.BetterBibTeX.DebugBridge.data.prefs = Dict();
        Zotero.BetterBibTeX.DebugBridge.data.exportOptions = {};

        var all = Zotero.BetterBibTeX.safeGetAll();
        if (all.length > 0) { Zotero.Items.erase(all.map(function(item) { return item.id; })); }
        try {
          var coll = Zotero.getCollections().map(function(c) { return c.id; });
          Zotero.Collections.erase(coll);
        } catch (err) { }
        Zotero.BetterBibTeX.DB.query('delete from keys');

        return retval;
      },

      import: function(filename) {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        Zotero_File_Interface.importFile(file);
        return true;
      },

      librarySize: function() {
        return Zotero.DB.valueQuery('select count(*) from items');
      },

      export: function(translator) {
        var all = Zotero.BetterBibTeX.safeGetAll();

        /*
        Zotero.BetterBibTeX.log('export found ' + all.length + ' items');
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath('/tmp/zotero.log');
        var dbg = 'export: ' + all.length + " items\n";
        // dbg += all.map(function(item) { return JSON.stringify(item.serialize()); }).join("\n") + "\n";
        dbg += Zotero.Debug.get();
        Zotero.File.putContents(file, dbg);
        */

        if (all.length === 0) {
          Zotero.BetterBibTeX.log('getAll found no items');
          return '';
        }

        all.sort(function(a, b) { return a.itemID - b.itemID; });
        translator = Zotero.BetterBibTeX.getTranslator(translator);

        var items = Zotero.BetterBibTeX.translate(translator, all, Zotero.BetterBibTeX.DebugBridge.data.exportOptions || {});
        return items;
      },

      exportToFile: function(translator, filename) {
        var all = Zotero.BetterBibTeX.safeGetAll();
        all.sort(function(a, b) { return a.itemID - b.itemID; });

        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);

        translator = Zotero.BetterBibTeX.getTranslator(translator);
        Zotero.File.putContents(file, Zotero.BetterBibTeX.translate(translator, all, {exportNotes: true, exportFileData: false}));
        return true;
      },

      getAll: function() {
        var all = Zotero.BetterBibTeX.safeGetAll();

        /*
        Zotero.BetterBibTeX.log('getAll found ' + all.length + ' items');
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath('/tmp/zotero.log');
        var dbg = 'getAll: ' + all.length + " items\n";
        // dbg += all.map(function(item) { return JSON.stringify(item.serialize()); }).join("\n") + "\n";
        dbg += Zotero.Debug.get();
        Zotero.File.putContents(file, dbg);
        */

        if (all.length === 0) {
          Zotero.BetterBibTeX.log('getAll found no items');
          return [];
        }

        all.sort(function(a, b) { return a.itemID - b.itemID; });
        var translator = Zotero.BetterBibTeX.getTranslator('Zotero TestCase');
        var items = Zotero.BetterBibTeX.translate(translator, all, {exportNotes: true, exportFileData: false});
        return JSON.parse(items).items;
      },

      getKeys: function() {
        return Zotero.BetterBibTeX.keymanager.keys();
      },

      setExportOption: function(name, value) {
        Zotero.BetterBibTeX.DebugBridge.data.exportOptions[name] = value;
      },
      setPreference: function(name, value) {
        Zotero.BetterBibTeX.DebugBridge.data.setPref(name, value);
      }
    }
  }
};
