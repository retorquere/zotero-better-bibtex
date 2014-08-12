Components.utils.import("resource://gre/modules/Services.jsm");

Zotero.BetterBibTeX = {
  prefs: {
    zotero: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero."),
    bbt:    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotero.translators.better-bibtex."),
    _:      Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService)
  },

  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  translators: {},
  threadManager: Components.classes["@mozilla.org/thread-manager;1"].getService(),
  windowMediator: Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),

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
          Object.keys(extraData).forEach(function(id) { Zotero.BetterBibTeX.KeyManager.clear({itemID: id}, true); });
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

  clearCiteKeys: function(onlyCache) {
    var win = Zotero.BetterBibTeX.windowMediator.getMostRecentWindow("navigator:browser");
    var item;
    var items = win.ZoteroPane.getSelectedItems();
    items = Zotero.Items.get([item.id for (item of items)]);
    items = [item for (item of items) if (!(item.isAttachment() || item.isNote()))];

    for (item of items) { Zotero.BetterBibTeX.KeyManager.clear(item, onlyCache); }
    return items;
  },

  pinCiteKeys: function() {
    // clear keys first so the generator can make fresh ones
    var items = Zotero.BetterBibTeX.clearCiteKeys(true);

    Zotero.BetterBibTeX.KeyManager.formatter.init();
    items.forEach(function(item) {
      var citekey = Zotero.BetterBibTeX.KeyManager.formatter.format(item);
      Zotero.BetterBibTeX.KeyManager.set(item, citekey, true);
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
    var i, _all = [];
    for (var i = 0; i < all.length; i++) { _all.push(all[i]); }
    return _all;
  },
  safeGet: function(ids) {
    if (ids.length == 0) { return []; }
    var all = Zotero.Items.get(ids);
    if (!all) { return []; }

    // sometimes a pseudo-array is returned
    var i, _all = [];
    for (var i = 0; i < all.length; i++) { _all.push(all[i]); }
    return _all;
  },

  KeyManager: new function() {
    var self = this;

    Zotero.DB.query("ATTACH ':memory:' AS 'betterbibtex'");
    Zotero.DB.query('create table betterbibtex.keys (itemID primary key, libraryID not null, citekey not null, pinned)');

    self.journalAbbrev = function(item) {
      if (item._sandboxManager) { item = arguments[1]; } // the sandbox inserts itself in call parameters

      if (item.journalAbbreviation) { return item.journalAbbreviation; }
      if (!Zotero.BetterBibTeX.prefs.bbt.getBoolPref('auto-abbrev')) { return; }

      var styleID = Zotero.BetterBibTeX.prefs.bbt.getCharPref('auto-abbrev.style');
      if (styleID == '') { styleID = Zotero.Styles.getVisible().filter(function(style) { return style.usesAbbreviation; })[0]; }
      var style = Zotero.Styles.get(styleID);
      var cp = style.getCiteProc(true);

      cp.setOutputFormat('html');
      cp.updateItems([item.itemID]);
      cp.appendCitationCluster({"citationItems":[{id:item.itemID}], properties:{}}, true);
      cp.makeBibliography();

      if (cp.transform.abbrevs) {
        var abbr = Dict.values(cp.transform.abbrevs);
        abbr = abbr.filter(function(abbrev) { return abbrev['container-title'] && (Object.keys(abbrev['container-title']).length > 0); });
        abbr = [].concat.apply([], abbr.map(function(abbrev) { return Dict.values(abbrev['container-title']); }));
        if (abbr.length > 0) { return abbr[0]; }
      }

      return '';
    };

    self.allowAutoPin = function() {
      return (Zotero.Prefs.get('sync.autoSync') || !Zotero.Sync.Server.enabled);
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
    }

    // TODO: remove repair action
    var fix = {
      start: Zotero.Date.dateToSQL(new Date(2014, 7, 10), true),
      end: Zotero.Date.dateToSQL(new Date(2014, 7, 12), true)
    };

    var findKeysSQL = "" +
      "select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra " +
      "from items i " +
      "join itemData id on i.itemID = id.itemID " +
      "join itemDataValues idv on idv.valueID = id.valueID " +
      "join fields f on id.fieldID = f.fieldID  " +
      "where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems) and idv.value like '%bibtex:%'";
    var rows = Zotero.DB.query(findKeysSQL) || [];
    rows.forEach(function(row) {
      Zotero.DB.query('insert into betterbibtex.keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, ?)', [row.itemID, row.libraryID, self.extract({extra: row.extra}), 1]);
      // TODO: remove repair action
      Zotero.DB.query('update items set dateModified = clientDateModified where itemID = ? and dateModified <> clientDateModified and clientDateModified between ? and ?', [row.itemID, fix.start, fix.end]);
    });

    self.set = function(item, citekey, pinned) {
      if (item._sandboxManager) { item = arguments[1]; citekey = arguments[2]; pinned = arguments[3]; } // the sandbox inserts itself in call parameters

      Zotero.BetterBibTeX.log('setting key ' + citekey + ' on ' + item.itemID + ', pinned: ' + pinned);
      var oldkey = self.extract(item);

      if (pinned && oldkey != citekey) {
        Zotero.BetterBibTeX.log('saving key ' + citekey + ' on ' + item.itemID + ', pinned: ' + pinned);
        if (!item.getField) { item = Zotero.Items.get(item.itemID); }
        var _item = {extra: '' + item.getField('extra')};
        self.extract(_item);
        var extra = _item.extra.trim();
        item.setField('extra', extra + " \nbibtex: " + citekey);
        item.save();
      }

      // overwrite any non-pinned key, even if the new key isn't pinned either
      Zotero.DB.query('delete from betterbibtex.keys where libraryID = ? and pinned <> 1 and citekey = ?', [item.libraryID || 0, citekey]);
      Zotero.DB.query('insert or replace into betterbibtex.keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, ?)', [item.itemID, item.libraryID || 0, citekey, pinned ? 1 : 0]);
    }

    self.get = function(item) {
      if (item._sandboxManager) { item = arguments[1]; } // the sandbox inserts itself in call parameters
      return Zotero.DB.valueQuery('select citekey from betterbibtex.keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0]);
    }

    // not for use of translator
    self.clear = function(item, onlyCache) {
      Zotero.BetterBibTeX.log('clearing key ' + (onlyCache ? 'cache ' : '') + item.itemID);
      if (!onlyCache) {
        var _item = {extra: '' + item.getField('extra')};
        var citekey = self.extract(_item);
        Zotero.BetterBibTeX.log('something to do? ' + citekey);
        if (citekey) {
          item.setField('extra', _item.extra);
          item.save();
        }
      }

      Zotero.DB.query('delete from betterbibtex.keys where itemID = ?', [item.itemID]);
    }

    // not for use of translator
    self.updated = function(itemIDs) {
      if (itemIDs.length == 0) { return; }

      itemIDs = itemIDs.map(function(id) { return '' + parseInt(id); });

      var generate = Dict();
      for (let id of itemIDs) { generate[id] = true; }

      itemIDs = '(' + itemIDs.join(',') + ')';
      Zotero.DB.query('delete from betterbibtex.keys where itemID in ' + itemIDs);
      var rows = Zotero.DB.query(findKeysSQL + ' and i.itemID in ' + itemIDs) || [];
      for (let row of rows) {
        delete generate['' + row.itemID];
        Zotero.DB.query('insert into betterbibtex.keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, ?)', [row.itemID, row.libraryID, self.extract({extra: row.extra}), 1]);
      }

      var autopin = (Zotero.BetterBibTeX.KeyManager.allowAutoPin() && Zotero.BetterBibTeX.prefs.bbt.getCharPref('pin-citekeys') == 'on-change');
      for (let item of Zotero.BetterBibTeX.safeGet(Object.keys(generate))) {
        var citekey = Zotero.BetterBibTeX.KeyManager.formatter.format(item);
        Zotero.BetterBibTeX.KeyManager.set(item, citekey, autopin);
      }
    }

    self.isFree = function(citekey, item) {
      if (citekey._sandboxManager) { citekey = arguments[1]; item = arguments[2]; } // the sandbox inserts itself in call parameters

      var count = null
      if (typeof item.itemID == 'undefined') {
        Zotero.debug('checking whether ' + citekey + ' is free');
        count = Zotero.DB.valueQuery('select count(*) from betterbibtex.keys where citekey=? and libraryID = ?', [citekey, item.libraryID || 0]);
      } else {
        Zotero.debug('checking whether ' + citekey + ' is taken by anyone else than ' + item.itemID);
        count = Zotero.DB.valueQuery('select count(*) from betterbibtex.keys where citekey=? and itemID <> ? and libraryID = ?', [citekey, item.itemID, item.libraryID || 0]);
      }
      return (parseInt(count) == 0);
    }

    self.keys = function() {
      return Zotero.DB.query('select * from betterbibtex.keys order by libraryID, itemID');
    }

    self.formatter = new function() {
      var self = this;
      var item = null;
      var translator = self;

      var pattern = null;
      self.init = function() {
        pattern = Zotero.BetterBibTeX.prefs.bbt.getCharPref('citeKeyFormat');
      }

      var safechars = /[-:a-z0-9_!\$\*\+\.\/;\?\[\]]/ig;
      // not  "@',\#{}%
      var unsafechars = '' + safechars;
      unsafechars = unsafechars.substring(unsafechars.indexOf('/') + 1, unsafechars.lastIndexOf('/'));
      unsafechars = unsafechars.substring(0, 1) + '^' + unsafechars.substring(1, unsafechars.length);
      unsafechars = new RegExp(unsafechars, 'ig');
      function clean(str) {
        str = Zotero.Utilities.removeDiacritics(str).replace(unsafechars, '').trim();
        return str;
      }

      var caseNotUpperTitle = Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g');
      var caseNotUpper = Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g');
      function getCreators(onlyEditors) {
        if(!item.creators || !item.creators.length) { return []; }

        var creators = {};
        var primaryCreatorType = Zotero.Utilities.getCreatorsForType(item.itemType)[0];
        var creator;
        item.creators.forEach(function(creator) {
          var name = stripHTML('' + creator.lastName);
          if (name != '') {
            if (flags.initials && creator.firstName) {
              var initials = Zotero.Utilities.XRegExp.replace(creator.firstName, caseNotUpperTitle, '', 'all');
              initials = Zotero.Utilities.removeDiacritics(initials);
              var initials = Zotero.Utilities.XRegExp.replace(initials, caseNotUpper, '', 'all');
              name += initials;
            }
          } else {
            name = stripHTML('' + creator.firstName);
          }
          if (name != '') {
            switch (creator.creatorType) {
              case 'editor':
              case 'seriesEditor':
                if (!creators.editors) { creators.editors = []; }
                creators.editors.push(name);
                break;
              case 'translator':
                if (!creators.translators) { creators.translators = []; }
                creators.translators.push(name);
                break;
              case primaryCreatorType:
                if (!creators.authors) { creators.authors = []; }
                creators.authors.push(name);
                break;
              default:
                if (!creators.collaborators) { creators.collaborators = []; }
                creators.collaborators.push(name);
            }
          }
        });

        if (onlyEditors) { return creators.editors; }
        return creators.authors || creators.editors || creators.collaborators || creators.translators || null;
      }

      function words(str) {
        return stripHTML('' + str).split(/[\+\.,-\/#!$%\^&\*;:{}=\-\s`~()]+/).filter(function(word) { return (word != '');}).map(function (word) { return clean(word) });
      }

      var skipWords = [
        'a',
        'aboard',
        'about',
        'above',
        'across',
        'after',
        'against',
        'al',
        'along',
        'amid',
        'among',
        'an',
        'and',
        'anti',
        'around',
        'as',
        'at',
        'before',
        'behind',
        'below',
        'beneath',
        'beside',
        'besides',
        'between',
        'beyond',
        'but',
        'by',
        'd',
        'das',
        'de',
        'del',
        'der',
        'des',
        'despite',
        'die',
        'do',
        'down',
        'during',
        'ein',
        'eine',
        'einem',
        'einen',
        'einer',
        'eines',
        'el',
        'except',
        'for',
        'from',
        'in',
        'is',
        'inside',
        'into',
        'l',
        'la',
        'las',
        'le',
        'like',
        'los',
        'near',
        'nor',,
        'of',
        'off',
        'on',
        'onto',
        'or',
        'over',
        'past',
        'per',
        'plus',
        'round',
        'save',
        'since',
        'so',
        'some',
        'than',
        'the',
        'through',
        'to',
        'toward',
        'towards',
        'un',
        'una',
        'unas',
        'under',
        'underneath',
        'une',
        'unlike',
        'uno',
        'unos',
        'until',
        'up',
        'upon',
        'versus',
        'via',
        'while',
        'with',
        'within',
        'without',
        'yet'
      ];

      function titleWords(title, options) {
        if (!title) { return null; }

        var _words = words(title);

        options = options || {};
        if (options.asciiOnly) { _words = _words.map(function (word) { return word.replace(/[^ -~]/g, ''); }); }
        _words = _words.filter(function(word) { return (word != ''); });
        if (options.skipWords) { _words = _words.filter(function(word) { return (skipWords.indexOf(word.toLowerCase()) < 0); }); }
        if (_words.length == 0) { return null; }
        return _words;
      };

      function stripHTML(str) {
        return str.replace(/<\/?(sup|sub|i|b|p|span|br|break)\/?>/g, '').replace(/\s+/, ' ').trim();
      };

      var functions = {
        id: function() {
          return item.itemID;
        },

        key: function() {
          return item.key;
        },

        auth: function(onlyEditors, n, m) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          var author = authors[m || 0];
          if (author && n) { author = author.substring(0, n); }
          return (author || '');
        },

        type: function() {
          return getBibTeXType(item);
        },

        authorLast: function(onlyEditors) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          return (authors[authors.length - 1] || '');
        },

        journal: function() {
          return Zotero.BetterBibTeX.KeyManager.journalAbbrev(item);
        },

        authors: function(onlyEditors, n) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          if (n) {
            var etal = (authors.length > n);
            authors = authors.slice(0, n);
            if (etal) { authors.push('EtAl'); }
          }
          authors = authors.join('');
          return authors;
        },

        authorsAlpha: function(onlyEditors) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          switch (authors.length) {
            case 1:
              return authors[0].substring(0, 3);
            case 2:
            case 3:
            case 4:
              return authors.map(function(author) { return author.substring(0, 1); }).join('');
            default:
              return authors.slice(0, 3).map(function(author) { return author.substring(0, 1); }).join('') + '+';
          }
        },

        authIni: function(onlyEditors, n) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          return authors.map(function(author) { return author.substring(0, n); }).join('.');
        },

        authorIni: function(onlyEditors) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          var firstAuthor = authors.shift();

          return [firstAuthor.substring(0, 5)].concat(authors.map(function(author) {
            return auth.split(/\s+/).map(function(name) { return name.substring(0, 1); }).join('');
          })).join('.');
        },

        'auth.auth.ea': function(onlyEditors) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          return authors.slice(0,2).concat(authors.length > 2 ? ['ea'] : []).join('.')
        },

        'auth.etal': function(onlyEditors) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          if (authors.length == 2) { return authors.join('.'); }

          return authors.slice(0,1).concat(authors.length > 1 ? ['etal'] : []).join('.')
        },

        authshort: function(onlyEditors) {
          var authors = getCreators(onlyEditors);
          if (!authors) { return ''; }

          switch (authors.length) {
            case 0:   return '';
            case 1:   return authors[0];
            default:  return authors.map(function(author) { return author.substring(0, 1); }).join('.') + (authors.length > 3 ? '+' : '');
          }
        },

        firstpage: function() {
          if (!item.pages) { return '';}
          var firstpage = '';
          item.pages.replace(/^([0-9]+)/g, function(match, fp) { firstpage = fp; });
          return firstpage;
        },

        keyword: function(dummy, n) {
          if (!item.tags || !item.tags[n]) { return ''; }
          return item.tags[n].tag;
        },

        lastpage: function() {
          if (!item.pages) { return '';}
          var lastpage = '';
          item.pages.replace(/([0-9]+)[^0-9]*$/g, function(match, lp) { lastpage = lp; });
          return lastpage;
        },

        shorttitle: function() {
          var words = titleWords(item.title, {skipWords: true, asciiOnly: true});
          if (!words) { return ''; }
          return words.slice(0,3).join('');
        },

        veryshorttitle: function() {
          var words = titleWords(item.title, {skipWords: true, asciiOnly: true});
          if (!words) { return ''; }
          return words.slice(0,1).join('');
        },

        shortyear: function() {
          if (!item.date) { return ''; }
          var date = Zotero.Date.strToDate(item.date);
          if (typeof date.year === 'undefined') { return ''; }
          var year = date.year % 100;
          if (year < 10) { return '0' + year; }
          return year + '';
        },

        year: function() {
          if (!item.date) { return ''; }
          var date = Zotero.Date.strToDate(item.date);
          if (typeof date.year === 'undefined') { return item.date; }
          return date.year;
        },

        month: function() {
          if (!item.date) { return ''; }
          var date = Zotero.Date.strToDate(item.date);
          if (typeof date.year === 'undefined') { return ''; }
          return (months[date.month] || '');
        },

        title: function() {
          return titleWords(item.title).join('');
        }
      };

      var punct = Zotero.Utilities.XRegExp('\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g');
      var filters = {
        condense: function(value, sep) {
          if (typeof sep == 'undefined') { sep = ''; }
          return value.replace(/\s/g, sep);
        },

        abbr: function(value) {
          return value.split(/\s+/).map(function(word) { return word.substring(0, 1); }).join('');
        },

        lower: function(value) {
          return value.toLowerCase();
        },

        upper: function(value) {
          return value.toUpperCase();
        },

        skipwords: function(value) {
          return value.split(/\s+/).filter(function(word) { return (skipWords.indexOf(word.toLowerCase()) < 0); }).join(' ').trim();
        },

        select: function(value, start, n) {
          value = value.split(/\s+/);
          var end = value.length;

          if (typeof start == 'undefined') { start = 1; }
          start = parseInt(start) - 1;

          if (typeof n != 'undefined') { end = start + parseInt(n); }

          return value.slice(start, end).join(' ');
        },

        ascii: function(value) {
          return value.replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim();
        },

        fold: function(value) {
          return Zotero.Utilities.removeDiacritics(value).split(/\s+/).join(' ').trim();
        },

        capitalize: function(value) {
          return value.replace(/((^|\s)[a-z])/g, function(m) { return m.toUpperCase(); });
        },

        nopunct: function(value) {
          return Zotero.Utilities.XRegExp.replace(value, punct, '', 'all');
        }
      };

      var function_N_M = /^([^0-9]+)([0-9]+)_([0-9]+)$/;
      var function_N = /^([^0-9]+)([0-9]+)$/;
      var flags = Dict();

      // TODO: this *really* needs performance work
      self.format = function(_item) {
        if (_item._sandboxManager) { _item = arguments[1]; } // the sandbox inserts itself in call parameters

        if (_item.setField) {
          Zotero.BetterBibTeX.log('serializing item');
          item = _item.toArray(); // TODO: switch to serialize when Zotero does
        } else {
          Zotero.BetterBibTeX.log('serialized item');
          item = _item;
        }
        Zotero.BetterBibTeX.log('formatting using ' + pattern + ': ' + JSON.stringify(Object.keys(item)));

        var citekey = '';

        pattern.split('|').some(function(pattern) {
          citekey = pattern.replace(/\[([^\]]+)\]/g, function(match, command) {
            var _filters = command.split(':');
            var _function = _filters.shift();
            var _property = _function;

            var _flags = _function.split(/([-+])/);
            _function = _flags.shift();
            flags = Dict();
            while (_flags.length > 0) {
              var m = _flags.shift();
              var flag = _flags.shift();
              if (flag) { flags[flag] = (m == '+'); }
            }

            var N;
            var M;
            var match;

            if (match = function_N_M.exec(_function)) {
              _function = match[1];
              N = parseInt(match[2]);
              M = parseInt(match[3]);
            } else if (match = function_N.exec(_function)) {
              _function = match[1];
              N = parseInt(match[2]);
              M = null;
            } else {
              N = null;
              M = null;
            }

            var onlyEditors = (_function.match(/^edtr/) || _function.match(/^editors/));
            _function = _function.replace(/^edtr/, 'auth').replace(/^editors/, 'authors');

            var value = '';
            if (functions[_function]) {
              value = functions[_function](onlyEditors, N, M);
            }

            [_property, _property.charAt(0).toLowerCase() + _property.slice(1)].forEach(function(prop) {
              if (value == '' && item[prop] && (typeof item[prop] != 'function')) {
                value = '' + item[prop];
              }
            });

            if (value == '' && !functions[_function]) {
              Zotero.BetterBibTeX.log('requested non-existent item function ' + _property);
            }

            value = stripHTML(value);

            _filters.forEach(function(filter) {
              var params = filter.split(',');
              filter = params.shift();
              params.unshift(value);
              if (filter.match(/^[(].*[)]$/)) { // text between braces is default value in case a filter or function fails
                if (value == '') { value = filter.substring(1, filter.length - 1); }
              } else if (filters[filter]) {
                value = filters[filter].apply(null, params);
              } else {
                Zotero.BetterBibTeX.log('requested non-existent item filter ' + filter);
                value = '';
              }
            });

            return value;
          });

          return citekey != '';
        });

        if (citekey == '') { citekey = 'zotero-' + (item.libraryID || 0) + '-' + item.key; }

        item = null;
        return clean(citekey);
      };
    }
  },

  DebugBridge: {
    namespace: 'better-bibtex',
    methods: {
      reset: function() {
        Zotero.Debug.setStore(true);

        if (Zotero.BetterBibTeX.debug) {
          Dict.forEach(Zotero.BetterBibTeX.debug.prefs, function(name, value) {
            Zotero.debug('Restoring ' + name + ' to ' + JSON.stringify(value));
            switch (value.type) {
              case 'boolean':
                Zotero.BetterBibTeX.prefs._.setBoolPref(name, value.value);
                break;
              case 'number':
                 Zotero.BetterBibTeX.prefs._.setIntPref(name, value.value);
                break;
              case 'string':
                 Zotero.BetterBibTeX.prefs._.setCharPref(name, value.value);
                break;
              default:
                throw('Unexpected preference of type "' + value.type + '"');
            }
          });
        }
        Zotero.BetterBibTeX.debug = {
          prefs: Dict(),
          exportOptions: {}
        };

        var all = Zotero.BetterBibTeX.safeGetAll();
        if (all.length > 0) { Zotero.Items.erase(all.map(function(item) { return item.id; })); }
        try {
          var coll = Zotero.getCollections().map(function(c) { return c.id; });
          Zotero.Collections.erase(coll);
        } catch (err) { }
        Zotero.DB.query('delete from betterbibtex.keys');
      },

      import: function(filename) {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        Zotero_File_Interface.importFile(file);
        return true;
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

        if (all.length == 0) {
          Zotero.BetterBibTeX.log('getAll found no items');
          return '';
        }

        all.sort(function(a, b) { return a.itemID - b.itemID; });
        var translator = Zotero.BetterBibTeX.getTranslator(translator);
        var items = Zotero.BetterBibTeX.translate(translator, all, Zotero.BetterBibTeX.debug.exportOptions || {});
        return items;
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

        if (all.length == 0) {
          Zotero.BetterBibTeX.log('getAll found no items');
          return [];
        }

        all.sort(function(a, b) { return a.itemID - b.itemID; });
        var translator = Zotero.BetterBibTeX.getTranslator('Zotero TestCase');
        var items = Zotero.BetterBibTeX.translate(translator, all, {exportNotes: true, exportFileData: false});
        return JSON.parse(items).items;
      },

      getKeys: function() {
        return Zotero.BetterBibTeX.KeyManager.keys();
      },

      setExportOption: function(name, value) {
        Zotero.BetterBibTeX.debug.exportOptions[name] = value;
      },
      setCharPref: function(name, value) {
        if (!Zotero.BetterBibTeX.debug.prefs[name]) { Zotero.BetterBibTeX.debug.prefs[name] = {type: 'string', value: Zotero.BetterBibTeX.prefs._.getCharPref(name)}; }
        Zotero.BetterBibTeX.prefs._.setCharPref(name, value);
      },
      setBoolPref: function(name, value) {
        if (!Zotero.BetterBibTeX.debug.prefs[name]) { Zotero.BetterBibTeX.debug.prefs[name] = {type: 'boolean', value: Zotero.BetterBibTeX.prefs._.getBoolPref(name)}; }
        Zotero.BetterBibTeX.prefs._.setBoolPref(name, value);
      },
      setIntPref: function(name, value) {
        if (!Zotero.BetterBibTeX.debug.prefs[name]) { Zotero.BetterBibTeX.debug.prefs[name] = {type: 'number', value: Zotero.BetterBibTeX.prefs._.getIntPref(name)}; }
        Zotero.BetterBibTeX.prefs._.setIntPref(name, value);
      }
    }
  }
};
