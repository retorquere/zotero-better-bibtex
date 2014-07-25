/*= dict =*/

var Translator = new function() {
  var self = this;

  self.id      =  '/*= id =*/';
  self.label   =  '/*= label =*/';
  self.unicode =  /*= unicode =*/;
  self.release =  '/*= release =*/';
  self.typeMap = {};

  var initialized = false;

  self.initialize = function(config) {
    if (initialized) { return; }

    if (!config) { config = {}; }

    self.pattern                = config.pattern                || Zotero.getHiddenPref('better-bibtex.citeKeyFormat');
    self.skipFields             = config.skipFields             || Zotero.getHiddenPref('better-bibtex.skipfields').split(',').map(function(field) { return field.trim(); });
    self.usePrefix              = config.usePrefix              || Zotero.getHiddenPref('better-bibtex.useprefix');
    self.braceAll               = config.braceAll               || Zotero.getHiddenPref('better-bibtex.brace-all');
    self.fancyURLs              = config.fancyURLs              || Zotero.getHiddenPref('better-bibtex.fancyURLs');
    self.langid                 = config.langid                 || Zotero.getHiddenPref('better-bibtex.langid');
    self.usePrefix              = config.usePrefix              || Zotero.getHiddenPref('better-bibtex.useprefix');

    self.useJournalAbbreviation = config.useJournalAbbreviation || Zotero.getOption('useJournalAbbreviation');
    self.exportCharset          = config.exportCharset          || Zotero.getOption('exportCharset');
    self.exportFileData         = config.exportFileData         || Zotero.getOption('exportFileData');
    self.exportNotes            = config.exportNotes            || Zotero.getOption('exportNotes');

    if (typeof config.unicode == 'undefined') {
      switch (Zotero.getHiddenPref('better-bibtex.unicode')) {
        case 'always':
          self.unicode = true;
          break;
        case 'never':
          self.unicode = false;
          break;
        default:
          var charset = self.exportCharset;
          self.unicode = self.unicode || (charset && charset.toLowerCase() == 'utf-8');
          break;
      }
    } else {
      self.unicode = config.unicode;
    }

    if (self.typeMap.toBibTeX) {
      Zotero.debug('typemap: ' + JSON.stringify(self.typeMap.toBibTeX));
      self.typeMap.toZotero = Dict();
      Dict.forEach(self.typeMap.toBibTeX, function(zotero, bibtex) {
        if (!(bibtex instanceof Array)) { bibtex = [bibtex]; }

        bibtex = bibtex.map(function(tex) {
          Zotero.debug('tex: ' + tex);
          if (!self.typeMap.toZotero[tex] || tex.match(/^:/)) {
            self.typeMap.toZotero[tex.replace(/^:/, '')] = zotero;
          }
          return tex.replace(/^:/, '');
        });

        self.typeMap.toBibTeX[zotero] = bibtex[0].replace(/^:/, '');
      });
    }

    initialized = true;
  }

  self.nextItem = function() {
    while (item = Zotero.nextItem()) {
      if (item.itemType != 'note' && item.itemType != 'attachment') { break; }
    }

    if (!item) { return; }

    if (!initialized) { self.initialize(); }
    Translator.fieldsWritten = Dict({});
    item.__citekey__ = self.citekey(item);
    return item;
  }

  var formatter = new function() {
    var translator = self;
    var self = this;
    var item = null;

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
        return Zotero.Utilities.removeDiacritics(value).split(/\s+/).join(' ').trim();
      },

      capitalize: function(value) {
        return value.replace(/((^|\s)[a-z])/g, function(m) { return m.toUpperCase(); });
      }
    };

    var function_N_M = /^([^0-9]+)([0-9]+)_([0-9]+)$/;
    var function_N = /^([^0-9]+)([0-9]+)$/;

    self.format = function(_item) {
      item = _item;

      var citekey = '';

      Translator.pattern.split('|').some(function(pattern) {
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

  var sync = {
    needed: false,
    test: {
      treshold: 10,
      assumedSafe: 0
    }
  };
  self.citekey = function(item) {
    Zotero.BetterBibTeX.KeyManager.extract(item);
    var citekey = Zotero.BetterBibTeX.KeyManager.get(item);
    if (citekey) { return citekey; }

    citekey = formatter.format(item);

    var postfix = {n: -1, c:''};
    Zotero.debug('basekey: ' + (citekey + postfix.c));
    while (!Zotero.BetterBibTeX.KeyManager.isFree(citekey + postfix.c, item)) {
      postfix.n++;
      postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)
    }

    if (!sync.needed) {
      sync.test.assumedSafe += 1;
      if (sync.test.assumedSafe >= sync.test.treshold) {
        sync.needed = Zotero.BetterBibTeX.KeyManager.syncNeeded();
        sync.test.assumedSafe = 0;
      }
      if (sync.needed) { Zotero.BetterBibTeX.KeyManager.syncWarn(); }
    }

    citekey = citekey + postfix.c;
    if (!sync.needed) { Zotero.BetterBibTeX.KeyManager.set(item, citekey); }
    return citekey;
  }
};

function writeFieldMap(item, fieldMap) {
  Dict.forEach(fieldMap, function(bibtexField, zoteroField) {
    var brace = !!(zoteroField.literal);
    zoteroField = zoteroField.literal ? zoteroField.literal : zoteroField;

    if(item[zoteroField]) {
      value = item[zoteroField];
      if (['url', 'doi'].indexOf(bibtexField) >= 0) {
        writeField(bibtexField, minimal_escape(value));
      } else {
        writeField(bibtexField, latex_escape(value, {brace: brace}));
      }
    }
  });
}

function writeField(field, value, bare) {
  if (Translator.skipFields.indexOf(field) >= 0) { return; }

  if (typeof value == 'number') {
  } else {
    if (!value || value == '') { return; }
  }

  if (!bare) { value = '{' + value + '}'; }

  if (Translator.fieldsWritten[field]) { trLog('Field ' + field + ' output more than once!'); }
  Translator.fieldsWritten[field] = true;
  Zotero.write(",\n  " + field + " = " + value);
}

function writeTags(field, item) {
  if (!item.tags || item.tags.length == 0) { return; }
  var tags = item.tags.map(function(tag) {return tag.tag;});
  tags.sort();
  writeField(field, latex_escape(tags, {sep: ','}));
}

function escapeAttachments(attachments, wipeBraces) {
  return attachments.map(function(att) {
    return [att.title, att.path, att.mimetype].map(function(part) { return (wipeBraces ? part.replace('{', '(').replace('}', ')') : part).replace(/([\\{}:;])/g, "\\$1"); }).join(':');
  }).join(';');
}
function writeAttachments(item) {
  if(! item.attachments) { return ; }

  trLog(item.attachments.length + ' attachments');
  var attachments = [];
  var broken = [];
  item.attachments.forEach(function(att) {
    var a = {title: att.title, path: att.localPath, mimetype: att.mimeType};
    trLog(a);
    var save = (Translator.exportFileData && att.defaultPath && att.saveFile);

    if (save) { a.path = att.defaultPath; }

    if (!a.path) { return; } // amazon/googlebooks etc links show up as atachments without a path

    if (a.path.match(/[{}]/)) { // latex really doesn't want you to do this.
      broken.push(a);
      return;
    }

    if (save) { att.saveFile(att.defaultPath); }

    if (a.path) {
      attachments.push({title: att.title, path: att.localPath, mimetype: att.mimeType});
    } else {
      trLog('WARNING: attachment without path: ' + att.title);
    }
  });

  if (attachments.length != 0) {
    writeField('file', escapeAttachments(attachments, true));
  }
  if (broken.length != 0) {
    writeField('latex_doesnt_like_filenames_with_braces', escapeAttachments(broken, false));
  }
}

function trLog(msg) {
  if (typeof msg != 'string') { msg = JSON.stringify(msg); }
  Zotero.debug('[' + Translator.label + '] ' + msg);
}

function getBibTeXType(item)
{
  var type = Translator.typeMap.toBibTeX[item.itemType];
  if (typeof (type) == "function") { type = type(item); }
  if (!type) type = "misc";
  return type;
}

/*
 * three-letter month abbreviations. I assume these are the same ones that the
 * docs say are defined in some appendix of the LaTeX book. (i don't have the
 * LaTeX book.)
 */
var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function minimal_escape(url) {
  var href = url.replace(/([#\\_%&{}])/g, "\\$1");

  if (!Translator.unicode) {
    href = href.replace(/[^\x21-\x7E]/g, function(chr){return "\\\%" + ('00' + chr.charCodeAt(0).toString(16)).slice(-2)});
  }

  if (Translator.fancyURLs) {
    return "\\href{" + href + "}{" + LaTeX.html2latex(url) + "}";
  }

  return href;
}

function latex_escape(value, options) {
  if ((typeof options) == 'string') { options = {sep: options}; }
  if ((typeof options) == 'boolean') { options = {brace: true}; }
  options = (options || {})

  if (typeof value == 'number') { return value; }
  if (!value) { return; }

  if (value instanceof Array) {
    if (value.length == 0) { return; }
    return value.map(function(word) { return latex_escape(word, options); }).join(options.sep);
  }

  if (options.brace && !value.literal && Translator.braceAll) {
    value = {literal: value};
  }

  var doublequote = value.literal;
  value = value.literal || value;
  value = LaTeX.html2latex(value);
  if (doublequote) { value = '{' + value + '}'; }
  return value;
}

var biblatexdataRE = /biblatexdata\[([^\]]+)\]/;
function writeExtra(item, field) {
  if (!item.extra) { return; }

  var m = biblatexdataRE.exec(item.extra);
  if (m) {
    item.extra = item.extra.replace(m[0], '').trim();
    m[1].split(';').forEach(function(assignment) {
      var data = assignment.split('=', 2);
      writeField(data[0], latex_escape(data[1]));
    });
  }

  writeField(field, latex_escape(item.extra));
}

function flushEntry(item) {
  // fully empty zotero reference generates invalid bibtex. This type-reassignment does nothing but adds the single
  // field each entry needs as a minimum.
  if (Translator.fieldsWritten.length == 0) {
    writeField('type', latex_escape(getBibTeXType(item)));
  }
}

function jabrefSerialize(arr, sep, wrap) {
  return arr.map(function(v) {
    v = ('' + v).replace(/;/g, "\\;");
    if (wrap) { v = v.match(/.{1,70}/g).join("\n"); }
    return v;
  }).join(sep);
}

function exportJabRefGroups() {
  var collections = Dict({});
  var roots = [];
  var collection;
  while(collection = Zotero.nextCollection()) {
    if (collection.childItems && collection.childItems.length == 0) {
      collection.childItems = null;
    }

    // replace itemID with citation key
    if (collection.childItems) {
      collection.childItems = collection.childItems.map(function(child) { return Translator.citekey(child); }).filter(function(child) { return child; });
    }

    collections[collection.id] = collection;
    roots.push(collection.id);
  }

  // walk through all collections, resolve child collections
  Dict.forEach(collections, function(collection) {
    if (collection.childCollections && collection.childCollections.length != 0) {
      collection.childCollections = collection.childCollections.map(function(id) {
        var index = roots.indexOf(id);
        if (index >= 0) { roots.splice(index, 1); }
        return collections[id];
      }).filter(function(child) { return child; });;
    } else {
      collection.childCollections = null;
    }
  });

  // roots now holds the IDs of the root collection, rest is resolved
  if (roots.length == 0) { return; }
  Zotero.debug('jabref groups: ' + roots.length + ' root collections');
  Zotero.write("\n\n@comment{jabref-meta: groupsversion:3;}\n\n");
  Zotero.write("\n\n@comment{jabref-meta: groupstree:\n");
  Zotero.write("0 AllEntriesGroup:;\n");

  var groups = [];
  roots.forEach(function(id) {
    groups = groups.concat(exportJabRefGroup(collections[id], 1));
  });
  groups = jabrefSerialize(groups, ";\n", true);
  if (groups != '') { groups += "\n"; }
  Zotero.write(groups + "}\n");
}

function exportJabRefGroup(collection, level) {
  var group = [level + ' ExplicitGroup:' + collection.name, 0];
  if (collection.childItems) {
    group = group.concat(collection.childItems);
  } else {
    group.push('');
  }
  group = jabrefSerialize(group, ';');

  var result = [group];
  if (collection.childCollections) {
    collection.childCollections.forEach(function(coll) {
      result = result.concat(exportJabRefGroup(coll, level + 1));
    });
  }

  return result;
}

/*= unicode_mapping =*/

LaTeX.toUnicode["\\url"] = '';
LaTeX.toUnicode["\\href"] = '';

LaTeX.html2latexsupport = {
  html2latex: {
    sup:      {open: "\\ensuremath{^{", close: "}}"},
    sub:      {open: "\\ensuremath{_{", close: "}}"},
    i:        {open: "\\emph{",         close: "}"},
    b:        {open: "\\textbf{",       close: "}"},
    p:        {open: "\n\n",            close: "\n\n"},
    span:     {open: "",                close: ""},
    br:       {open: "\n\n",            close: "", empty: true},
    'break':  {open: "\n\n",            close: "", empty: true}
  },

  htmlstack: [],

  htmltag: function(str) {
    var close;
    var tag = str.replace(/[^a-z]/ig, '').toLowerCase();
    var repl = LaTeX.html2latexsupport.html2latex[tag];

    // not a '/' at position 2 means it's an opening tag
    if (str.charAt(1) != '/') {
      // only add tag to the stack if it is not a self-closing tag. Self-closing tags ought to have the second-to-last
      // character be a '/', but this is not a perfect world (loads of <br>'s out there, so tags that always *ought*
      // to be empty are treated as such, regardless of whether the obligatory closing slash is present or not.
      if (str.slice(-2, 1) != '/' && !repl.empty) { LaTeX.html2latexsupport.htmlstack.unshift(tag); }
      return repl.open;
    }

    // if it's a closing tag, it ought to be the first one on the stack
    close = LaTeX.html2latexsupport.htmlstack.indexOf(tag);
    if (close < 0) {
      trLog('Ignoring unexpected close tag "' + tag + '"');
      return '';
    }

    if (close > 0) {
      trLog('Unexpected close tag "' + tag + '", closing "' + LaTeX.html2latexsupport.htmlstack.slice(0, close).join(', ') + '"');
    }

    close = LaTeX.html2latexsupport.htmlstack.slice(0, close).map(function(tag) { return html2latex[tag].close; }).join('');
    LaTeX.html2latexsupport.htmlstack = LaTeX.html2latexsupport.htmlstack.slice(close + 1);
    return repl.close;
  },

  unicode: function(str) {
    var regex = LaTeX.regex[Translator.unicode ? 'unicode' : 'ascii'];

    return str.split(regex.math).map(function(text, i) {

      var latex = text.replace(regex.text, function(match) {
        return (LaTeX.toLaTeX[match] || match);
      });

      if ((i % 2) == 1) { // odd element == splitter == block of math
        return '\\ensuremath{' + latex + '}';
      }

      return latex;

    }).join('');
  }

};

LaTeX.html2latex = function(str) {
  var tags = new RegExp('(' + Object.keys(LaTeX.html2latexsupport.html2latex).map(function(tag) { return '<\/?' + tag + '\/?>'} ).join('|') + ')', 'ig');

  return ('' + str).split(/(<pre>.*?<\/pre>)/ig).map(function(chunk, pre) {
    if ((pre % 2) == 1) { // odd element = splitter == pre block

      return chunk.replace(/^<pre>/i, '').replace(/<\/pre>$/, '');

    } else {

      LaTeX.html2latexsupport.htmlstack = [];

      var res = chunk.split(tags).map(function(chunk, htmltag) {
        if ((htmltag % 2) == 1) { // odd element = splitter == html tag

          return LaTeX.html2latexsupport.htmltag(chunk);

        } else {

          return LaTeX.html2latexsupport.unicode(chunk);

        }
      }).join('').replace(/{}\s+/g, ' ');

      if (LaTeX.html2latexsupport.htmlstack.length != 0) {
        trLog('Unmatched HTML tags: ' + LaTeX.html2latexsupport.htmlstack.join(', '));
        res += htmlstack.map(function(tag) { return LaTeX.html2latexsupport.html2latex[tag].close; }).join('');
      }

      return res;
    }
  }).join('');
}
