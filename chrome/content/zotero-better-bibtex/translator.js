Zotero.BetterBibTeX.KeyManager = new function() {
  Zotero.DB.query("ATTACH ':memory:' AS 'better-bibtex'");
  Zotero.DB.query("create table better-bibtex.keys (library, item, citekey, unique(library, item))");

  var embeddedKeyRE = /bibtex:\s*([^\s\r\n]+)/;
  var andersJohanssonKeyRE = /biblatexcitekey\[([^\]]+)\]/;
  function extractKey(item, options) {
    options = options || {};

    var extra;

    if (item.getField) {
      extra = item.getField('extra');
    } else {
      extra = item.extra;
    }

    if (!extra) { return null; }

    var m = embeddedKeyRE.exec(item.extra) || andersJohanssonKeyRE.exec(item.extra);
    if (!m) { return null; }

    if (!options.extractOnly && item.setField) {
      item.setField('extra', extra.replace(m[0], '').trim());
    }
    var key = m[1];

    return key;
  }

  var safechars = /[-:a-z0-9_!\$\*\+\.\/;\?\[\]]/ig;
  // not  "@',\#}{%
  var unsafechars = '' + safechars;
  unsafechars = unsafechars.substring(unsafechars.indexOf('/') + 1, unsafechars.lastIndexOf('/'));
  unsafechars = unsafechars.substring(0, 1) + '^' + unsafechars.substring(1, unsafechars.length);
  unsafechars = new RegExp(unsafechars, 'ig');

  var rows = Zotero.DB.query("" +
    "select i.key as 'key', idv.value as extra" +
    "from items i " +
    "join itemData id on i.itemID = id.itemID " +
    "join itemDataValues idv on idv.valueID = id.valueID " +
    "join fields f on id.fieldID = f.fieldID  " +
    "where f.fieldName = 'extra' and idv.value like '%bibtex:%'");
  for each(var row in rows) {
    Zotero.DB.query("insert into better-bibtex.keys ('key', citekey) values (?, ?)", [row.key, extractKey({extra: row.extra})]);
  }

  /* --------------------------- */

  this.get = function(item) {
    var citekey = Zotero.DB.valueQuery("select citekey from better-bibtex.keys where 'key'=?", item.key);
    if (citekey) { return citekey; }

    var citekey = this.format(item);
    var postfix = {n: 0, c:'a'};
    while (!this.free(citekey + postfix.c, item)) {
      postfix.n++;
      postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)
    }

    return this.set(citekey + postfix.c, item);
  }

  this.reset = function(item) {
    this.delete(item.key);
    return this.get(item);
  }

  this.delete(key) {
    Zotero.DB.query("delete from better-bibtex.keys where 'key' = ?", [key]);
  }

  this.set = function(citekey, item) {
    item = Zotero.Items.get(item.id);

    var oldkey = extractKey(item, {extractOnly: false}); // remove old key, if any

    if (oldkey == citekey) { return; }

    var extra = '' + item.getField('extra');
    extra = extra.trim();
    if (extra.length > 0) { extra += "\n"; }
    item.setField('extra', extra + 'bibtex: ' + citekey);
    item.save({ skipDateModifiedUpdate: true });

    Zotero.DB.query("insert or replace into better-bibtex.keys ('key', citekey) values (?, ?)", [item.key, citekey]);

    return citekey;
  }

  this.free = function(citekey, item) {
    var count = null

    if (item) {
      count = Zotero.DB.valueQuery("select count(*) from better-bibtex.keys where citekey=? and 'key' <> ?", [citekey, item.key]);
    } else {
      count = Zotero.DB.valueQuery("select count(*) from better-bibtex.keys where citekey=?", [citekey]);
    }
    return (parseInt(count) == 0);
  }

  this.duplicates = function(item) {
    var dups = null;

    if (item) {
      var citekey = this.get(item);
      dups = Zotero.DB.valueQuery("select count(*) - 1 as duplicates from better-bibtex.keys where citekey=? and 'key'
      in ()", [citekey]);
    } else {
      dups = {};
      rows = Zotero.DB.query("select citekey, count('key') as duplicates from better-bibtex.keys group by citekey having count('key') > 1");
      for each(var row in rows) {
        dups[row.citekey] = row.duplicates;
      }
    }
    return dups;
  }
};

var CiteKeys = {
  db: [],

  get: function(item) {
    var rec = CiteKeys.db.filter(function(rec) { return (rec.item.itemID == item.itemID); });
    if (rec.length == 0) { return null; }
    return rec[0];
  },

  report: function(data) {
    var r = '% ' + Config.label + ': ' + (data.pinned ?  'pinned' : 'generated');
    if (data.conflict) {
      r += ', ' + (data.pinned ?  'hard' : 'soft') + ' conflict';
    }
    return r + "\n";
  },

  embeddedKeyRE: /bibtex:\s*([^\s\r\n]+)/,
  andersJohanssonKeyRE: /biblatexcitekey\[([^\]]+)\]/,
  safechars: /[-:a-z0-9_!\$\*\+\.\/;\?\[\]]/ig,
  // not  "@',\#}{%

  initialize: function(items) {
    Config.initialize();

    if (!items) {
      items = [];
      var titles = Dict();
      var item;
      var duplicate;
      while (item = Zotero.nextItem()) {
        // duplicates occur?!
        if (titles.has(item.itemID)) {
          Zotero.debug('WARNING: item "' + item.title + '" shares itemID with item "' + titles.get(item.itemID) + '"');
        } else {
          items.push(item);
          titles.set(item.itemID, item.title);
        }
      }
    }

    items = items.filter(function(item) { return (item.itemType != "note" && item.itemType != "attachment"); });
    items.forEach(function(item) { CiteKeys.register(item); });
    CiteKeys.resolve();

    return items;
  },

  extract: function(item) {
    if (!item.extra) { return null; }

    var m = CiteKeys.embeddedKeyRE.exec(item.extra) || CiteKeys.andersJohanssonKeyRE.exec(item.extra);
    if (!m) { return null; }

    item.extra = item.extra.replace(m[0], '').trim();
    var key = m[1];

    if (CiteKeys.db.some(function(rec) { return (rec.key == key); })) {
      trLog('BibTeX export: duplicate key ' + key);
    }
    return key;
  },

  register: function(item) {
    var citekey = CiteKeys.extract(item);
    var pinned = false;

    if (citekey) {
      pinned = true;
    } else {
      citekey = CiteKeys.clean(Formatter.format(item));
    }

    CiteKeys.db.push({item: item, key: citekey, pinned: pinned, order: CiteKeys.db.length});
  },

  resolve: function() {
    CiteKeys.db.filter(function(rec) { return rec.pinned; }).forEach(function(rec) {
      if (CiteKeys.db.some(function(dup) { return (dup.pinned && dup.key == rec.key && dup.item.itemID != rec.item.itemID); })) {
        rec.conflict = 'hard';
      }
    });

    CiteKeys.db.filter(function(rec) { return !rec.pinned; }).forEach(function(rec) {
      var duplicates = CiteKeys.db.filter(function(dup) { return (dup.key == rec.key && dup.item.itemID != rec.item.itemID); }).sort(
        function(a, b) {
          if (!!(a.pinned) != !!(b.pinned)) {
            return ((a.pinned ? 0 : 1) - (b.pinned ? 0 : 1));
          } else {
            return (a.order - b.order);
          }
        });

      if (duplicates.length != 0) {
        if (duplicates[0].pinned || duplicates[0].order < rec.order) {
          rec.conflict = 'soft';
        }
      }
    });

    if (Config.conflictResolution) {
      CiteKeys.db.filter(function(rec) { return (rec.conflict == 'soft'); }).forEach(function(rec) {
        var postfix = {n: 0, c:'a'};
        while (CiteKeys.db.some(function(other) { return (other.key == (rec.key + postfix.c)); })) {
          postfix.n++;
          postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)
        }
        rec.key += postfix.c;
      });
    }
  },

  clean: function(str) {
    if (!CiteKeys.unsafechars) {
      var unsafechars = '' + CiteKeys.safechars;
      unsafechars = unsafechars.substring(unsafechars.indexOf('/') + 1, unsafechars.lastIndexOf('/'));
      unsafechars = unsafechars.substring(0, 1) + '^' + unsafechars.substring(1, unsafechars.length);
      CiteKeys.unsafechars = new RegExp(unsafechars, 'ig');
    }

    str = ZU.removeDiacritics(str).replace(CiteKeys.unsafechars, '').trim();
    return str;
  }
};

Formatter = {
  item: null,

  getCreators: function(onlyEditors) {
    if(!Formatter.item.creators || !Formatter.item.creators.length) { return []; }
    var creators = {};
    var primaryCreatorType = Zotero.Utilities.getCreatorsForType(Formatter.item.itemType)[0];
    var creator;
    Formatter.item.creators.forEach(function(creator) {
      var name = Formatter.stripHTML('' + creator.lastName);
      if (name == '') { Formatter.stripHTML('' + creator.firstName); }
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
  },

  words: function(str) {
    return Formatter.stripHTML('' + str).split(/[\+\.,-\/#!$%\^&\*;:{}=\-\s`~()]+/).filter(function(word) { return (word != '');}).map(function (word) { return CiteKeys.clean(word) });
  },

  skipWords: [
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
  ],

  titleWords: function(title, options) {
    if (!title) { return null; }

    var _words = Formatter.words(title);

    options = options || {};
    if (options.asciiOnly) { _words = _words.map(function (word) { return word.replace(/[^ -~]/g, ''); }); }
    _words = _words.filter(function(word) { return (word != ''); });
    if (options.skipWords) { _words = _words.filter(function(word) { return (Formatter.skipWords.indexOf(word.toLowerCase()) < 0); }); }
    if (_words.length == 0) { return null; }
    return _words;
  },

  stripHTML: function(str) {
    return str.replace(/<\/?(sup|sub|i|b|p|span|br|break)\/?>/g, '').replace(/\s+/, ' ').trim();
  },

  functions: {
    id: function() {
      return Formatter.item.itemID;
    },

    key: function() {
      return Formatter.item.key;
    },

    auth: function(onlyEditors, n, m) {
      var authors = Formatter.getCreators(onlyEditors);
      if (!authors) { return ''; }

      var author = authors[m || 0];
      if (author && n) { author = author.substring(0, n); }
      return (author || '');
    },

    type: function() {
      return getBibTeXType(Formatter.item);
    },

    authorLast: function(onlyEditors) {
      var authors = Formatter.getCreators(onlyEditors);
      if (!authors) { return ''; }

      return (authors[authors.length - 1] || '');
    },

    authors: function(onlyEditors, n) {
      var authors = Formatter.getCreators(onlyEditors);
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
      var authors = Formatter.getCreators(onlyEditors);
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
      var authors = Formatter.getCreators(onlyEditors);
      if (!authors) { return ''; }

      return authors.map(function(author) { return author.substring(0, n); }).join('.');
    },

    authorIni: function(onlyEditors) {
      var authors = Formatter.getCreators(onlyEditors);
      if (!authors) { return ''; }

      var firstAuthor = authors.shift();

      return [firstAuthor.substring(0, 5)].concat(authors.map(function(author) {
        return auth.split(/\s+/).map(function(name) { return name.substring(0, 1); }).join('');
      })).join('.');
    },

    'auth.auth.ea': function(onlyEditors) {
      var authors = Formatter.getCreators(onlyEditors);
      if (!authors) { return ''; }

      return authors.slice(0,2).concat(authors.length > 2 ? ['ea'] : []).join('.')
    },

    'auth.etal': function(onlyEditors) {
      var authors = Formatter.getCreators(onlyEditors);
      if (!authors) { return ''; }

      if (authors.length == 2) { return authors.join('.'); }

      return authors.slice(0,1).concat(authors.length > 1 ? ['etal'] : []).join('.')
    },

    authshort: function(onlyEditors) {
      var authors = Formatter.getCreators(onlyEditors);
      if (!authors) { return ''; }

      switch (authors.length) {
        case 0:   return '';
        case 1:   return authors[0];
        default:  return authors.map(function(author) { return author.substring(0, 1); }).join('.') + (authors.length > 3 ? '+' : '');
      }
    },

    firstpage: function() {
      if (!Formatter.item.pages) { return '';}
      var firstpage = '';
      Formatter.item.pages.replace(/^([0-9]+)/g, function(match, fp) { firstpage = fp; });
      return firstpage;
    },

    keyword: function(dummy, n) {
      if (!Formatter.item.tags || !Formatter.item.tags[n]) { return ''; }
      return Formatter.item.tags[n].tag;
    },

    lastpage: function() {
      if (!Formatter.item.pages) { return '';}
      var lastpage = '';
      Formatter.item.pages.replace(/([0-9]+)[^0-9]*$/g, function(match, lp) { lastpage = lp; });
      return lastpage;
    },

    shorttitle: function() {
      var words = Formatter.titleWords(Formatter.item.title, {skipWords: true, asciiOnly: true});
      if (!words) { return ''; }
      return words.slice(0,3).join('');
    },

    veryshorttitle: function() {
      var words = Formatter.titleWords(Formatter.item.title, {skipWords: true, asciiOnly: true});
      if (!words) { return ''; }
      return words.slice(0,1).join('');
    },

    shortyear: function() {
      if (!Formatter.item.date) { return ''; }
      var date = Zotero.Utilities.strToDate(Formatter.item.date);
      if (typeof date.year === 'undefined') { return ''; }
      var year = date.year % 100;
      if (year < 10) { return '0' + year; }
      return year + '';
    },

    year: function() {
      if (!Formatter.item.date) { return ''; }
      var date = Zotero.Utilities.strToDate(Formatter.item.date);
      if (typeof date.year === 'undefined') { return Formatter.item.date; }
      return date.year;
    },

    month: function() {
      if (!Formatter.item.date) { return ''; }
      var date = Zotero.Utilities.strToDate(Formatter.item.date);
      if (typeof date.year === 'undefined') { return ''; }
      return (months[date.month] || '');
    },

    title: function() {
      return Formatter.titleWords(Formatter.item.title).join('');
    }
  },

  filters: {
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
      return value.split(/\s+/).filter(function(word) { return (Formatter.skipWords.indexOf(word.toLowerCase()) < 0); }).join(' ').trim();
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
      return ZU.removeDiacritics(value).split(/\s+/).join(' ').trim();
    },

    capitalize: function(value) {
      return value.replace(/((^|\s)[a-z])/g, function(m) { return m.toUpperCase(); });
    }
  },

  function_N_M: /^([^0-9]+)([0-9]+)_([0-9]+)$/,
  function_N: /^([^0-9]+)([0-9]+)$/,

  format: function(item) {
    Formatter.item = item;

    var citekey = '';

    Config.pattern.split('|').some(function(pattern) {
      citekey = pattern.replace(/\[([^\]]+)\]/g, function(match, command) {
        var _filters = command.split(':');
        var _function = _filters.shift();
        var _property = _function;

        var N;
        var M;
        var match;

        if (match = Formatter.function_N_M.exec(_function)) {
          _function = match[1];
          N = parseInt(match[2]);
          M = parseInt(match[3]);
        } else if (match = Formatter.function_N.exec(_function)) {
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
        if (Formatter.functions[_function]) {
          value = Formatter.functions[_function](onlyEditors, N, M);
        }

        [_property, _property.charAt(0).toLowerCase() + _property.slice(1)].forEach(function(prop) {
          if (value == '' && Formatter.item[prop] && (typeof Formatter.item[prop] != 'function')) {
            value = '' + Formatter.item[prop];
          }
        });

        if (value == '' && !Formatter.functions[_function]) {
          trLog('requested non-existent item function ' + _property);
        }

        value = Formatter.stripHTML(value);

        _filters.forEach(function(filter) {
          var params = filter.split(',');
          filter = params.shift();
          params.unshift(value);
          if (filter.match(/^[(].*[)]$/)) { // text between braces is default value in case a filter or function fails
            if (value == '') { value = filter.substring(1, filter.length - 1); }
          } else if (Formatter.filters[filter]) {
            value = Formatter.filters[filter].apply(null, params);
          } else {
            trLog('requested non-existent item filter ' + filter);
            value = '';
          }
        });

        return value;
      });

      return citekey != '';
    });

    if (citekey == '') { citekey = 'zotero-' + Formatter.item.key; }

    return CiteKeys.clean(citekey);
  }
}
