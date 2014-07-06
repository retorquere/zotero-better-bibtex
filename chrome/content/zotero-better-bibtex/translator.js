Zotero.BetterBibTeX.KeyManager = new function() {
  Zotero.DB.query("ATTACH ':memory:' AS 'betterbibtex'");
  Zotero.DB.query('create table betterbibtex.keys (itemID primary key, libraryID not null, citekey not null)');

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
  };

  var rows = Zotero.DB.query("" +
    "select coalesce(i.libraryID, 0) as libraryID, i.itemID as itemID, idv.value as extra " +
    "from items i " +
    "join itemData id on i.itemID = id.itemID " +
    "join itemDataValues idv on idv.valueID = id.valueID " +
    "join fields f on id.fieldID = f.fieldID  " +
    "where f.fieldName = 'extra' and idv.value like '%bibtex:%'");
  rows.forEach(function(row) {
    Zotero.DB.query('insert into betterbibtex.keys (itemID, libraryID, citekey) values (?, ?, ?)', [row.itemID, row.libraryID, extractKey({extra: row.extra})]);
  });

  function set(citekey, item) {
    var oldkey = extractKey(item);
    if (oldkey == citekey) { return; } // needed to prevent save loops in the notifier

    oldkey = extractKey(item, {extractOnly: false}); // remove old key, if any

    if (!item.getField) { item = Zotero.Item.get(item.itemID); }

    var extra = '' + item.getField('extra');
    extra = extra.trim();
    if (extra.length > 0) { extra += "\n"; }
    item.setField('extra', extra + 'bibtex: ' + citekey);
    item.save({ skipDateModifiedUpdate: true });

    Zotero.DB.query('insert or replace into betterbibtex.keys (itemID, libraryID, citekey) values (?, ?, ?)', [item.itemID, item.libraryID || 0, citekey]);

    return citekey;
  };

  var formatter = new function() {
    var item = null;
  
    var safechars = /[-:a-z0-9_!\$\*\+\.\/;\?\[\]]/ig;
    // not  "@',\#{}%
    var unsafechars = '' + safechars;
    unsafechars = unsafechars.substring(unsafechars.indexOf('/') + 1, unsafechars.lastIndexOf('/'));
    unsafechars = unsafechars.substring(0, 1) + '^' + unsafechars.substring(1, unsafechars.length);
    unsafechars = new RegExp(unsafechars, 'ig');
    function clean(str) {
      str = ZU.removeDiacritics(str).replace(unsafechars, '').trim();
      return str;
    }
  
    function getCreators(onlyEditors) {
      if(!item.creators || !item.creators.length) { return []; }
  
      var creators = {};
      var primaryCreatorType = Zotero.Utilities.getCreatorsForType(item.itemType)[0];
      var creator;
      item.creators.forEach(function(creator) {
        var name = stripHTML('' + creator.lastName);
        if (name == '') { stripHTML('' + creator.firstName); }
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
        var date = Zotero.Utilities.strToDate(item.date);
        if (typeof date.year === 'undefined') { return ''; }
        var year = date.year % 100;
        if (year < 10) { return '0' + year; }
        return year + '';
      },
  
      year: function() {
        if (!item.date) { return ''; }
        var date = Zotero.Utilities.strToDate(item.date);
        if (typeof date.year === 'undefined') { return item.date; }
        return date.year;
      },
  
      month: function() {
        if (!item.date) { return ''; }
        var date = Zotero.Utilities.strToDate(item.date);
        if (typeof date.year === 'undefined') { return ''; }
        return (months[date.month] || '');
      },
  
      title: function() {
        return titleWords(item.title).join('');
      }
    };
  
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
        return ZU.removeDiacritics(value).split(/\s+/).join(' ').trim();
      },
  
      capitalize: function(value) {
        return value.replace(/((^|\s)[a-z])/g, function(m) { return m.toUpperCase(); });
      }
    };
  
    var function_N_M = /^([^0-9]+)([0-9]+)_([0-9]+)$/;
    var function_N = /^([^0-9]+)([0-9]+)$/;
  
    this.format = function(i) {
      item = i;
  
      var citekey = '';
  
      Zotero.BetterBibTeX.prefs.bbt.getCharPref('citeKeyFormat').pattern.split('|').some(function(pattern) {
        citekey = pattern.replace(/\[([^\]]+)\]/g, function(match, command) {
          var _filters = command.split(':');
          var _function = _filters.shift();
          var _property = _function;
  
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
            trLog('requested non-existent item function ' + _property);
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
              trLog('requested non-existent item filter ' + filter);
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

  /* --------------------------- */

  this.get = function(item) {
    var citekey = extractKey(item);
    if (citekey) { return citekey; }

    var citekey = formatter.format(item);
    var postfix = {n: 0, c:'a'};
    while (!this.free(citekey + postfix.c, item)) {
      postfix.n++;
      postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)
    }

    return set(citekey + postfix.c, item);
  }

  this.reset = function(item) {
    this.delete(item);
    return this.get(item);
  }

  this.delete = function(item) {
    Zotero.DB.query('delete from betterbibtex.keys where itemID = ?', [item.itemID]);
  }

  this.free = function(citekey, item) {
    var count = null

    if (typeof item.itemID == 'undefined') {
      count = Zotero.DB.valueQuery('select count(*) from betterbibtex.keys where citekey=? and itemID <> ? and libraryID = ?', [citekey, item.itemID, item.libraryID || 0]);
    } else {
      count = Zotero.DB.valueQuery('select count(*) from betterbibtex.keys where citekey=? and libraryID = ?', [citekey, item.libraryID || 0]);
    }
    return (parseInt(count) == 0);
  }

  this.duplicates = function(item) {
    var citekey = this.get(item);
    return Zotero.DB.valueQuery('select count(*) - 1 as duplicates from betterbibtex.keys where citekey=? and library = ?', [citekey, item.libraryID || 0]);
  }
};

