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

  init: function () {
    if (this.initialized) { return; }
    this.initialized = true;

    this.DB.query('create table if not exists _version_ (tablename primary key, version not null, unique (tablename, version))');
    this.log('keys version = ' + JSON.stringify(this.DB.valueQuery("select version from _version_ where tablename = 'keys'")));
    switch (this.DB.valueQuery("select version from _version_ where tablename = 'keys'")) {
      case false:
        this.DB.query('create table keys (itemID primary key, libraryID not null, citekey not null, pinned)');
        this.DB.query("insert or replace into _version_ (tablename, version) values ('keys', 1)");
        break;
    }

    var endpoint;
    for (endpoint in Zotero.BetterBibTeX.endpoints) {
      var url = "/better-bibtex/" + endpoint;
      Zotero.BetterBibTeX.log('Registering endpoint ' + url);
      var ep = Zotero.Server.Endpoints[url] = function() {};
      ep.prototype = Zotero.BetterBibTeX.endpoints[endpoint];
    }

    this.formatter = new this.Formatter();
    this.keymanager = new this.KeyManager();
    Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
      keymanager: Zotero.BetterBibTeX.keymanager
    };

    Zotero.BetterBibTeX.safeLoad('Better BibTeX.js');
    Zotero.BetterBibTeX.safeLoad('Better BibLaTeX.js');
    Zotero.BetterBibTeX.safeLoad('LaTeX Citation.js');
    Zotero.BetterBibTeX.safeLoad('Pandoc Citation.js');
    Zotero.BetterBibTeX.safeLoad('Zotero TestCase.js');
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
      Zotero.BetterBibTeX.log('itemChanged: ' + event);
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
            Zotero.BetterBibTeX.log('pinning ' + citekey + ' for ' + item.itemID);
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
    Zotero.BetterBibTeX.log('clearing key ' + (onlyCache ? 'cache ' : '') + item.itemID);

    Zotero.BetterBibTeX.DB.query('delete from keys where itemID = ?', [item.itemID]);

    if (!onlyCache) {
      var _item = {extra: '' + item.getField('extra')};
      var citekey = self.extract(_item);
      Zotero.BetterBibTeX.log('something to do? ' + citekey);
      if (citekey) {
        item.setField('extra', _item.extra);
        item.save();
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
    Zotero.BetterBibTeX.log('displayOptions = ' + Zotero.BetterBibTeX.pp(params));
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

  Formatter: function() {
    __item = null;

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
      Zotero.BetterBibTeX.log('getCreators for ' + Object.prototype.toString.call(__item) + ' ' + __item.itemType + ' (' + Zotero.BetterBibTeX.pp(__item) + ')');
      if(!__item.creators || !__item.creators.length) { return []; }

      var creators = {};
      var primaryCreatorType = Zotero.Utilities.getCreatorsForType(__item.itemType)[0];
      var creator;
      __item.creators.forEach(function(creator) {
        var name = stripHTML('' + creator.lastName);
        if (name !== '') {
          if (flags.initials && creator.firstName) {
            var initials = Zotero.Utilities.XRegExp.replace(creator.firstName, caseNotUpperTitle, '', 'all');
            initials = Zotero.Utilities.removeDiacritics(initials);
            initials = Zotero.Utilities.XRegExp.replace(initials, caseNotUpper, '', 'all');
            name += initials;
          }
        } else {
          name = stripHTML('' + creator.firstName);
        }
        if (name !== '') {
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
      return stripHTML('' + str).split(/[\+\.,-\/#!$%\^&\*;:{}=\-\s`~()]+/).filter(function(word) { return (word !== '');}).map(function (word) { return clean(word); });
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
      _words = _words.filter(function(word) { return (word !== ''); });
      if (options.skipWords) { _words = _words.filter(function(word) { return (skipWords.indexOf(word.toLowerCase()) < 0); }); }
      if (_words.length === 0) { return null; }
      return _words;
    }

    function stripHTML(str) {
      return str.replace(/<\/?(sup|sub|i|b|p|span|br|break)\/?>/g, '').replace(/\s+/, ' ').trim();
    }

    var functions = {
      id: function() {
        return __item.itemID;
      },

      key: function() {
        return __item.key;
      },

      auth: function(onlyEditors, n, m) {
        var authors = getCreators(onlyEditors);
        if (!authors) { return ''; }

        var author = authors[m || 0];
        if (author && n) { author = author.substring(0, n); }
        return (author || '');
      },

      type: function() {
        return getBibTeXType(__item);
      },

      authorLast: function(onlyEditors) {
        var authors = getCreators(onlyEditors);
        if (!authors) { return ''; }

        return (authors[authors.length - 1] || '');
      },

      journal: function() {
        return Zotero.BetterBibTeX.keymanager.journalAbbrev(__item);
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

        return authors.slice(0,2).concat(authors.length > 2 ? ['ea'] : []).join('.');
      },

      'auth.etal': function(onlyEditors) {
        var authors = getCreators(onlyEditors);
        if (!authors) { return ''; }

        if (authors.length === 2) { return authors.join('.'); }

        return authors.slice(0,1).concat(authors.length > 1 ? ['etal'] : []).join('.');
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
        if (!__item.pages) { return '';}
        var firstpage = '';
        __item.pages.replace(/^([0-9]+)/g, function(match, fp) { firstpage = fp; });
        return firstpage;
      },

      keyword: function(dummy, n) {
        if (!__item.tags || !__item.tags[n]) { return ''; }
        return __item.tags[n].tag;
      },

      lastpage: function() {
        if (!__item.pages) { return '';}
        var lastpage = '';
        __item.pages.replace(/([0-9]+)[^0-9]*$/g, function(match, lp) { lastpage = lp; });
        return lastpage;
      },

      shorttitle: function() {
        var words = titleWords(__item.title, {skipWords: true, asciiOnly: true});
        if (!words) { return ''; }
        return words.slice(0,3).join('');
      },

      veryshorttitle: function() {
        var words = titleWords(__item.title, {skipWords: true, asciiOnly: true});
        if (!words) { return ''; }
        return words.slice(0,1).join('');
      },

      shortyear: function() {
        if (!__item.date) { return ''; }
        var date = Zotero.Date.strToDate(__item.date);
        if (typeof date.year === 'undefined') { return ''; }
        var year = date.year % 100;
        if (year < 10) { return '0' + year; }
        return year + '';
      },

      year: function() {
        if (!__item.date) { return ''; }
        var date = Zotero.Date.strToDate(__item.date);
        if (typeof date.year === 'undefined') { return __item.date; }
        return date.year;
      },

      month: function() {
        if (!__item.date) { return ''; }
        var date = Zotero.Date.strToDate(__item.date);
        if (typeof date.year === 'undefined') { return ''; }
        return (months[date.month] || '');
      },

      title: function() {
        return titleWords(__item.title).join('');
      }
    };

    var punct = Zotero.Utilities.XRegExp('\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g');
    var filters = {
      condense: function(value, sep) {
        if (typeof sep === 'undefined') { sep = ''; }
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

        if (typeof start === 'undefined') { start = 1; }
        start = parseInt(start) - 1;

        if (typeof n !== 'undefined') { end = start + parseInt(n); }

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
    this.format = function(item) {
      if (!item.setField && !item.itemType && item.itemID) {
        Zotero.BetterBibTeX.log('format: pseudo item');
        item = Zotero.Items.get(item.itemID);
      }
      if (item.setField) {
        Zotero.BetterBibTeX.log('format: serializing item');
        __item = item.toArray(); // TODO: switch to serialize when Zotero does
      } else {
        Zotero.BetterBibTeX.log('format: serialized item');
        __item = item;
      }
      if (!__item.itemType) {
        var e = new Error('dummy');
        throw("format: no item\n" + e.stack);
      }

      var citekey = '';

      Zotero.BetterBibTeX.log('formatting ' + item.itemID + ' using ' + Zotero.BetterBibTeX.Prefs.getCharPref('citeKeyFormat'));
      Zotero.BetterBibTeX.Prefs.getCharPref('citeKeyFormat').split('|').some(function(pattern) {
        citekey = pattern.replace(/\[([^\]]+)\]/g, function(fullmatch, command) {
          var _filters = command.split(':');
          var _function = _filters.shift();
          var _property = _function;

          var _flags = _function.split(/([-+])/);
          _function = _flags.shift();
          flags = Dict();
          while (_flags.length > 0) {
            var m = _flags.shift();
            var flag = _flags.shift();
            if (flag) { flags[flag] = (m === '+'); }
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
            if (value === '' && __item[prop] && (typeof __item[prop] !== 'function')) {
              value = '' + __item[prop];
            }
          });

          if (value === '' && !functions[_function]) {
            Zotero.BetterBibTeX.log('requested non-existent item function ' + _property);
          }

          value = stripHTML(value);

          _filters.forEach(function(filter) {
            var params = filter.split(',');
            filter = params.shift();
            params.unshift(value);
            if (filter.match(/^[(].*[)]$/)) { // text between braces is default value in case a filter or function fails
              if (value === '') { value = filter.substring(1, filter.length - 1); }
            } else if (filters[filter]) {
              value = filters[filter].apply(null, params);
            } else {
              Zotero.BetterBibTeX.log('requested non-existent item filter ' + filter);
              value = '';
            }
          });

          return value;
        });

        return citekey !== '';
      });

      if (citekey === '') { citekey = 'zotero-' + (__item.libraryID || 0) + '-' + __item.key; }

      __item = null;
      return clean(citekey);
    };
  },

  allowAutoPin: function() {
    return (Zotero.Prefs.get('sync.autoSync') || !Zotero.Sync.Server.enabled);
  },

  KeyManager: function() {
    var self = this;

    self.journalAbbrev = function(item) {
      if (item._sandboxManager) { item = arguments[1]; } // the sandbox inserts itself in call parameters

      if (item.journalAbbreviation) { return item.journalAbbreviation; }
      if (!Zotero.BetterBibTeX.Prefs.getBoolPref('auto-abbrev')) { return; }

      var styleID = Zotero.BetterBibTeX.Prefs.getCharPref('auto-abbrev.style');
      if (styleID === '') { styleID = Zotero.Styles.getVisible().filter(function(style) { return style.usesAbbreviation; })[0]; }
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

    // TODO: remove repair action
    var fix = {
      start: Zotero.Date.dateToSQL(new Date(2014, 7, 10), true),
      end: Zotero.Date.dateToSQL(new Date(2014, 7, 12), true)
    };

    for (let row of Zotero.BetterBibTeX.array(Zotero.DB.query(Zotero.BetterBibTeX.findKeysSQL) || [])) {
      Zotero.BetterBibTeX.DB.query('insert into keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, ?)', [row.itemID, row.libraryID, self.extract({extra: row.extra}), 1]);
      // TODO: remove repair action
      Zotero.DB.query('update items set dateModified = clientDateModified where itemID = ? and dateModified <> clientDateModified and clientDateModified between ? and ?', [row.itemID, fix.start, fix.end]);
    }

    self.get = function(item, pinmode) {
      if (item._sandboxManager) { item = arguments[1]; pinmode = arguments[2]; } // the sandbox inserts itself in call parameters

      var citekey = Zotero.BetterBibTeX.DB.rowQuery('select citekey, pinned from keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0]);
      if (!citekey) {
        citekey = Zotero.BetterBibTeX.formatter.format(item);
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
        Zotero.BetterBibTeX.log('pinning key ' + citekey.citekey + ' on ' + item.itemID);
        if (!item.getField) { item = Zotero.Items.get(item.itemID); }
        var _item = {extra: '' + item.getField('extra')};
        self.extract(_item);
        var extra = _item.extra.trim();
        item.setField('extra', extra + " \nbibtex: " + citekey.citekey);
        item.save();

        Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and pinned <> 1 and citekey = ?', [item.libraryID || 0, citekey.citekey]);
        Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, pinned) values (?, ?, ?, 1)', [item.itemID, item.libraryID || 0, citekey]);
      }

      return citekey.citekey;
    };

    self.keys = function() {
      var keys = Zotero.BetterBibTeX.array(Zotero.BetterBibTeX.DB.query('select * from keys order by libraryID, itemID'));
      Zotero.BetterBibTeX.log('key cache: ' + Zotero.BetterBibTeX.pp(keys));
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

        Zotero.BetterBibTeX.log('setPref' + Zotero.BetterBibTeX.pp([name, value]));
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
