Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/AddonManager.jsm");

Zotero.BetterBibTeX = {
  Prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero.translators.better-bibtex."),

  PrefsObserver: {
    register: function() {
      Zotero.BetterBibTeX.Prefs.addObserver('', this, false);
    },
    unregister: function() {
      Zotero.BetterBibTeX.Prefs.removeObserver('', this);
    },
    observe: function(subject, topic, data) {
      switch (data) {
        case 'citeKeyFormat':
          Zotero.BetterBibTeX.DB.query('delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.Prefs.getCharPref('citeKeyFormat')]);
          break;
      }
    }
  },

  translators: Dict(),
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
    if (this.initialized) { return; }
    this.initialized = true;

    this.DB.query('create table if not exists _version_ (tablename primary key, version not null, unique (tablename, version))');
    this.DB.query("insert or ignore into _version_ (tablename, version) values ('keys', 0)");

    switch (this.DB.valueQuery("select version from _version_ where tablename = 'keys'")) {
      case 0:
        this.log('initializing DB: no tables');
        this.DB.query('create table keys (itemID primary key, libraryID not null, citekey not null, pinned)');
        this.DB.query("insert or replace into _version_ (tablename, version) values ('keys', 1)");
        // omission of 'break' is intentional!

      case 1:
      case 2:
        Zotero.BetterBibTeX.Prefs.setBoolPref('scan-citekeys', true);
        this.DB.query("insert or replace into _version_ (tablename, version) values ('keys', 3)");
        // omission of 'break' is intentional!

      case 3:
        this.DB.query('alter table keys rename to keys2');
        this.DB.query('create table keys (itemID primary key, libraryID not null, citekey not null, citeKeyFormat)');
        this.DB.query('insert into keys (itemID, libraryID, citekey, citeKeyFormat) select itemID, libraryID, citekey, case when pinned = 1 then null else ? end from keys2', [Zotero.BetterBibTeX.Prefs.getCharPref('citeKeyFormat')]);
        this.DB.query("insert or replace into _version_ (tablename, version) values ('keys', 4)");
    }

    // guard against pattern changes performed while the observer can't catch them
    this.DB.query('delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.Prefs.getCharPref('citeKeyFormat')]);
    this.PrefsObserver.register();

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
      __exposedProps__: {keymanager: 'r'},
      keymanager: Zotero.BetterBibTeX.keymanager
    };

    var notifierID = Zotero.Notifier.registerObserver(this.itemChanged, ['item']);
    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function(e) { Zotero.Notifier.unregisterObserver(notifierID); }, false);

    Zotero.BetterBibTeX.loadTranslators();

    /*
    AddonManager.addAddonListener({
      onUninstalling: function(addon){
        if (addon.id != 'better-bibtex@iris-advies.com') { return; }
        Zotero.BetterBibTeX.removeTranslators();
      },
      onDisabling: function(addon) {
        if (addon.id != 'better-bibtex@iris-advies.com') { return; }
        Zotero.BetterBibTeX.removeTranslators();
      },
      onEnabled: function(addon) {
        if (addon.id != 'better-bibtex@iris-advies.com') { return; }
        Zotero.BetterBibTeX.loadTranslators();
      }
    });
    */
  },

  loadTranslators: function() {
    this.safeLoad('Better BibTeX.js');
    this.safeLoad('Better BibLaTeX.js');
    this.safeLoad('LaTeX Citation.js');
    this.safeLoad('Pandoc Citation.js');
    this.safeLoad('Zotero TestCase.js');
    Zotero.Translators.init();
  },

  removeTranslators: function() {
    for_each (let name:let header of this.translators) {
      var fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID);
      var destFile = Zotero.getTranslatorsDirectory();
      destFile.append(fileName);
      destFile.remove();
    }
    Zotero.Translators.init();
  },

  findKeysSQL: "" +
      "select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra " +
      "from items i " +
      "join itemData id on i.itemID = id.itemID " +
      "join itemDataValues idv on idv.valueID = id.valueID " +
      "join fields f on id.fieldID = f.fieldID  " +
      "where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems) " +
            "and (idv.value like '%bibtex:%' or idv.value like '%biblatexcitekey[%')",

  itemChanged: {
    notify: function(event, type, ids, extraData) {
      switch (event) {
        case 'delete':
          for_each (let key : let v of extraData) {
            Zotero.BetterBibTeX.clearKey({itemID: key}, true);
          }
          break;

        case 'add':
        case 'modify':
          if (ids.length === 0) { break; }

          ids = '(' + ids.map(function(id) { return '' + id; }).join(',') + ')';

          Zotero.BetterBibTeX.DB.query('delete from keys where itemID in ' + ids);
          for_each (let item in Zotero.DB.query(Zotero.BetterBibTeX.findKeysSQL + ' and i.itemID in ' + ids) || []) {
            var citekey = Zotero.BetterBibTeX.keymanager.extract({extra: item.extra});
            Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID, citekey]);
            Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [item.itemID, item.libraryID, citekey]);
          }

          for_each (let item in Zotero.DB.query('select coalesce(libraryID, 0) as libraryID, itemID from items where itemID in ' + ids) || []) {
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

    for_each (let key in ['exportCharset', 'exportNotes?', 'useJournalAbbreviation?']) {
      try {
        var isBool = key.match(/[?]$/);
        if (isBool) { key = key.replace(isBool[0], ''); }
        params[key] = url.query[key];
        if (isBool) { params[key] = (['y', 'yes', 'true'].indexOf(params[key].toLowerCase()) >= 0); }
        hasParams = true;
      } catch (e) {}
    }
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
          for_each (let collectionkey in path.split('+')) {
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
            for_each (let name in path) {
              var children = Zotero.getCollections(col && col.id, false, libid);
              col = null;
              for_each (let child in children) {
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
            items = items.concat(Zotero.Items.get(collect(for (item of _items) item.id)));

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
        items = Zotero.Items.get(collect(for (item of items) item.id));

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
    if (items) { translation.setItems(items); }
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

    Zotero.BetterBibTeX.translators[header.label.toLowerCase().replace(/[^a-z]/, '')] = header;
    Zotero.Translators.save(header, data);
  },

  getTranslator: function(name) {
    name = name.toLowerCase().replace(/[^a-z]/, '');
    var translator = this.translators['better' + name] || this.translators[name] || this.translators['zotero' + name];
    if (!translator) { throw('No translator' + name + '; available: ' + Object.keys(this.translators).join(', ')); }
    return translator.translatorID;
  },

  clearCiteKeys: function(onlyCache) {
    var win = Zotero.BetterBibTeX.windowMediator.getMostRecentWindow("navigator:browser");
    var items = win.ZoteroPane.getSelectedItems();
    items = Zotero.Items.get(collect(for (item of items) item.id));
    items = collect(for (item of items) if (!item.isAttachment() && !item.isNote()) item);

    for_each (let item in items) { this.clearKey(item, onlyCache); }
    return items;
  },

  pinCiteKeys: function() {
    // clear keys first so the generator can make fresh ones
    var items = this.clearCiteKeys(true);

    for_each (let item in items) {
      Zotero.BetterBibTeX.keymanager.get(item, 'manual');
    }
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
    var self = this;

    /*
     * three-letter month abbreviations. I assume these are the same ones that the
     * docs say are defined in some appendix of the LaTeX book. (i don't have the
     * LaTeX book.)
     */
    this.months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    this.journalAbbrevCache = Dict();

    self.journalAbbrev = function(item) {
      if (item._sandboxManager) { item = arguments[1]; } // the sandbox inserts itself in call parameters

      if (item.journalAbbreviation) { return item.journalAbbreviation; }
      if (!Zotero.BetterBibTeX.Prefs.getBoolPref('auto-abbrev')) { return; }

      if (typeof self.journalAbbrevCache[item.publicationTitle] === 'undefined') {
        var styleID = Zotero.BetterBibTeX.Prefs.getCharPref('auto-abbrev.style');
        if (styleID === '') { styleID = Zotero.Styles.getVisible().filter(function(style) { return style.usesAbbreviation; })[0].styleID; }
        var style = Zotero.Styles.get(styleID);
        var cp = style.getCiteProc(true);

        cp.setOutputFormat('html');
        cp.updateItems([item.itemID]);
        cp.appendCitationCluster({"citationItems":[{id:item.itemID}], properties:{}}, true);
        cp.makeBibliography();

        var abbrevs = cp;
        for_each (let p in ['transform', 'abbrevs', 'default', 'container-title']) {
          if (abbrevs) { abbrevs = abbrevs[p]; }
        }
        for_each (let title:let abbr of abbrevs || {}) {
          self.journalAbbrevCache[title] = abbr;
        }
        if (!self.journalAbbrevCache[item.publicationTitle]) { self.journalAbbrevCache[item.publicationTitle] = ''; }
      }
      return self.journalAbbrevCache[item.publicationTitle];
    };

    // dual-use
    self.extract = function(item) {
      if (item._sandboxManager) { item = arguments[1]; } // the sandbox inserts itself in call parameters
      if (item.getField) { item = {extra: item.getField('extra')}; }

      var embeddedKeyRE = /bibtex: *([^\s\r\n]+)/;
      var andersJohanssonKeyRE = /biblatexcitekey\[([^\]]+)\]/;
      var extra = item.extra;

      if (!item.extra) { return null; }

      var m = embeddedKeyRE.exec(item.extra) || andersJohanssonKeyRE.exec(item.extra);
      if (!m) { return null; }

      // does not save item!
      item.extra = item.extra.replace(m[0], '').trim();

      return m[1];
    };

    if (Zotero.BetterBibTeX.Prefs.getBoolPref('scan-citekeys')) {
      for_each (let row in Zotero.DB.query(Zotero.BetterBibTeX.findKeysSQL) || []) {
        Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [row.itemID, row.libraryID, self.extract({extra: row.extra})]);
      }
      Zotero.BetterBibTeX.Prefs.setBoolPref('scan-citekeys', false);
    }

    self.get = function(item, pinmode) {
      if (item._sandboxManager) { item = arguments[1]; pinmode = arguments[2]; } // the sandbox inserts itself in call parameters

      var citekey = Zotero.BetterBibTeX.DB.rowQuery('select citekey, citeKeyFormat from keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0]);
      if (!citekey) {
        var pattern = Zotero.BetterBibTeX.Prefs.getCharPref('citeKeyFormat');
        var Formatter = Zotero.BetterBibTeX.formatter(pattern);
        citekey = new Formatter(Zotero.BetterBibTeX.toArray(item)).value;
        var postfix = {n: -1, c:''};
        while (Zotero.BetterBibTeX.DB.valueQuery('select count(*) from keys where citekey=? and libraryID = ?', [citekey + postfix.c, item.libraryID || 0])) {
          postfix.n++;
          postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n);
        }
        citekey = {citekey: citekey + postfix.c, citeKeyFormat: pattern};
        Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID || 0, citekey.citekey]);
        Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, ?)', [item.itemID, item.libraryID || 0, citekey.citekey, pattern]);
      }

      if (citekey.citeKeyFormat && (pinmode === 'manual' || (Zotero.BetterBibTeX.allowAutoPin() && pinmode === Zotero.BetterBibTeX.Prefs.getCharPref('pin-citekeys')))) {
        if (!item.getField) { item = Zotero.Items.get(item.itemID); }
        var _item = {extra: '' + item.getField('extra')};
        self.extract(_item);
        var extra = _item.extra.trim();
        item.setField('extra', extra + " \nbibtex: " + citekey.citekey);
        item.save();

        Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID || 0, citekey.citekey]);
        Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [item.itemID, item.libraryID || 0, citekey.citekey]);
      }

      return citekey.citekey;
    };

    self.keys = function() {
      var keys = Zotero.BetterBibTeX.array(Zotero.BetterBibTeX.DB.query('select * from keys order by libraryID, itemID'));
      return keys;
    };

    self.__exposedProps__ = {
      months:         'r',
      journalAbbrev:  'r',
      extract:        'r',
      get:            'r',
      keys:           'r'
    };
    // protect the exposed properties from further recursion -- Recoll Indexer messes with Function.prototype (a very
    // bad idea) without making the new stuff it adds unenumerable
    // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
    for_each (let key:let value of self.__exposedProps__) {
      self[key].__exposedProps__ = [];
    }
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
      init: function() {
        // monkey-patch Zotero.Items.getAll to get items sorted. With random order I can't really implement stable
        // testing. A simple ORDER BY would have been easier and loads faster, but I can't reach into getAll.
        Zotero.BetterBibTeX.log('patching Zotero.Items.getAll');
        Zotero.Items.getAll = (function (original) {
          return function(onlyTopLevel, libraryID, includeDeleted) {
            var items = original.apply(this, arguments);
            items.sort(function(a, b) { return a.itemID - b.itemID; });
            return items;
          };
        })(Zotero.Items.getAll);
        return true;
      },

      reset: function() {
        Zotero.BetterBibTeX.init();
        var retval = Zotero.BetterBibTeX.DebugBridge.data.prefs;

        for_each (let name:let value of Zotero.BetterBibTeX.DebugBridge.data.prefs) {
          if (value.reset !== null) { Zotero.Prefs.set(name, value.reset); }
        }
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

      exportToString: function(translator) {
        translator = Zotero.BetterBibTeX.getTranslator(translator);

        return Zotero.BetterBibTeX.translate(translator, null, Zotero.BetterBibTeX.DebugBridge.data.exportOptions || {});
      },

      exportToFile: function(translator, filename) {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);

        translator = Zotero.BetterBibTeX.getTranslator(translator);
        Zotero.File.putContents(file, Zotero.BetterBibTeX.translate(translator, null, {exportNotes: true, exportFileData: false}));
        return true;
      },

      library: function() {
        var translator = Zotero.BetterBibTeX.getTranslator('Zotero TestCase');
        return JSON.parse(Zotero.BetterBibTeX.translate(translator, null, {exportNotes: true, exportFileData: false}));
      },

      getKeys: function() {
        return Zotero.BetterBibTeX.keymanager.keys();
      },

      setExportOption: function(name, value) {
        Zotero.BetterBibTeX.DebugBridge.data.exportOptions[name] = value;
      },
      setPreference: function(name, value) {
        Zotero.BetterBibTeX.DebugBridge.data.setPref(name, value);
      },
      select: function(attribute, value) {
        for_each (let item in Zotero.BetterBibTeX.safeGetAll()) {
          Zotero.BetterBibTeX.log('item: ' + item.id);
        }
        attribute = attribute.replace(/[^a-zA-Z]/, '');
        var sql = "" +
            "select i.itemID as itemID " +
            "from items i " +
            "join itemData id on i.itemID = id.itemID " +
            "join itemDataValues idv on idv.valueID = id.valueID " +
            "join fields f on id.fieldID = f.fieldID  " +
            "where f.fieldName = '" + attribute + "' and not i.itemID in (select itemID from deletedItems) and idv.value = ?";
        return Zotero.DB.valueQuery(sql, [value]);
      },
      pinCiteKey: function(id) {
        Zotero.BetterBibTeX.clearKey({itemID: id}, true);
        return Zotero.BetterBibTeX.keymanager.get({itemID: id}, 'manual');
      }
    }
  }
};
