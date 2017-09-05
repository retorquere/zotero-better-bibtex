{
  "translatorID": "ca65189f-8815-4afe-8c8b-8c7c15f0edca",
  "label": "Better BibTeX",
  "creator": "Simon Kornblith, Richard Karnesky and Emiliano heyns",
  "target": "bib",
  "minVersion": "4.0.27",
  "maxVersion": "",
  "configOptions": {
    "getCollections": true,
    "serializationCache": true
  },
  "displayOptions": {
    "exportNotes": true,
    "exportFileData": false,
    "useJournalAbbreviation": false,
    "Keep updated": false
  },
  "translatorType": 3,
  "browserSupport": "gcsv",
  "priority": 199,
  "inRepository": false,
  "lastUpdated": "2017-09-05 07:26:36"
}

var Translator = {
  initialize: function () {},
  version: "5.0.2.emile.java-cotton",
  BetterBibTeX: true,
  // header == ZOTERO_TRANSLATOR_INFO -- maybe pick it from there
  header: {"translatorID":"ca65189f-8815-4afe-8c8b-8c7c15f0edca","label":"Better BibTeX","creator":"Simon Kornblith, Richard Karnesky and Emiliano heyns","target":"bib","minVersion":"4.0.27","maxVersion":"","configOptions":{"getCollections":true,"serializationCache":true},"displayOptions":{"exportNotes":true,"exportFileData":false,"useJournalAbbreviation":false,"Keep updated":false},"translatorType":3,"browserSupport":"gcsv","priority":199,"inRepository":false,"lastUpdated":"2017-09-05 07:26:36"},
  preferences: {"asciiBibLaTeX":false,"asciiBibTeX":true,"attachmentsNoMetadata":false,"autoAbbrev":false,"autoAbbrevStyle":"","autoExport":"idle","autoExportIdleWait":10,"cacheFlushInterval":5,"itemObserverDelay":100,"citeCommand":"cite","citekeyFormat":"[auth][shorttitle][year]","citekeyFold":true,"DOIandURL":"both","bibtexURL":"off","csquotes":"","keyConflictPolicy":"keep","langID":"babel","pinCitekeys":"manual","preserveBibTeXVariables":false,"rawImports":false,"citekeyScan":"","skipFields":"","skipWords":"a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum","warnBulkModify":10,"postscript":"","jabrefGroups":4,"defaultDateParserLocale":"","bibtexParticleNoOp":false,"biblatexExtendedNameFormat":false,"biblatexExtendedDateFormat":false,"quickCopyMode":"latex","quickCopyPandocBrackets":false,"jurismPreferredLanguage":"zh-alalc97","qualityReport":false,"suppressTitleCase":false,"parseParticles":true,"debug":false,"testing":false,"rawLaTag":"#LaTeX"},
  options: {"exportNotes":true,"exportFileData":false,"useJournalAbbreviation":false,"Keep updated":false},

  getConfig: function(detect) {
    this.debugEnabled = Zotero.BetterBibTeX.debugEnabled();
    this.unicode = true;

    if (detect) {
      this.options = {}
    } else {
      for (var key in this.options) {
        this.options[key] = Zotero.getOption(key)
      }
      // special handling
      this.options.exportPath = Zotero.getOption('exportPath')
      this.options.exportFilename = Zotero.getOption('exportFilename')
    }

    for (key in this.preferences) {
      this.preferences[key] = Zotero.getHiddenPref('better-bibtex.' + key)
    }
    // special handling
    this.preferences.skipWords = this.preferences.skipWords.toLowerCase().trim().split(/\s*,\s*/).filter(function(s) { return s })
    this.preferences.skipFields = this.preferences.skipFields.toLowerCase().trim().split(/\s*,\s*/).filter(function(s) { return s })
    this.preferences.rawLaTag = '#LaTeX'
    if (this.preferences.csquotes) {
      var i, csquotes = { open: '', close: '' }
      for (i = 0; i < this.preferences.csquotes.length; i++) {
        csquotes[i % 2 == 0 ? 'open' : 'close'] += this.preferences.csquotes[i]
      }
      this.preferences.csquotes = csquotes
    }
  }
};


  function doExport() {
    Translator.getConfig()
    Translator.initialize()
    Translator.doExport()
  }



  function detectImport() {
    Translator.getConfig(true)
    return Translator.detectImport()
  }
  function doImport() {
    Translator.getConfig()
    Translator.initialize()
    Translator.doImport()
  }
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 93);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** ./lib/debug.coffee ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var format, stringify,
  slice = [].slice;

stringify = __webpack_require__(/*! json-stringify-safe */ 2);

format = __webpack_require__(/*! ../../content/debug-formatter.coffee */ 5);

module.exports = function() {
  var msg;
  msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  if (!(Translator.debugEnabled || Translator.preferences.testing)) {
    return;
  }
  Zotero.debug(format("better-bibtex:" + Translator.header.label, msg));
};


/***/ }),
/* 1 */,
/* 2 */
/*!********************************************************!*\
  !*** ../node_modules/json-stringify-safe/stringify.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

exports = module.exports = stringify
exports.getSerialize = serializer

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}


/***/ }),
/* 3 */
/*!********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_core.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.1' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 4 */
/*!*******************************************************!*\
  !*** ../node_modules/core-js/library/modules/_wks.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(/*! ./_shared */ 54)('wks');
var uid = __webpack_require__(/*! ./_uid */ 35);
var Symbol = __webpack_require__(/*! ./_global */ 12).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 5 */
/*!*****************************************!*\
  !*** ../content/debug-formatter.coffee ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var stringify;

stringify = __webpack_require__(/*! json-stringify-safe */ 2);

module.exports = function(prefix, msg) {
  var err, i, len, m, str;
  err = false;
  str = '';
  for (i = 0, len = msg.length; i < len; i++) {
    m = msg[i];
    switch (false) {
      case !(m instanceof Error):
        err = true;
        m = "<Exception: " + (m.message || m.name) + (m.stack ? '\n' + m.stack : '') + ">";
        break;
      case !(m && typeof m === 'object' && m.stack):
        err = true;
        m = "<Exception: " + m + "#\n" + m.stack + ">";
        break;
      case !(m instanceof String || typeof m === 'string'):
        break;
      default:
        m = stringify(m);
    }
    if (m) {
      str += m + ' ';
    }
  }
  if (err) {
    prefix += ':ERROR';
  }
  return "{" + prefix + "} " + str;
};


/***/ }),
/* 6 */
/*!*****************************!*\
  !*** ./lib/exporter.coffee ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Citekey, Collections, Exporter, JSON5, JabRef, debug,
  hasProp = {}.hasOwnProperty;

debug = __webpack_require__(/*! ../lib/debug.coffee */ 0);

JSON5 = __webpack_require__(/*! json5 */ 10);

Citekey = __webpack_require__(/*! ../../content/keymanager/get-set.coffee */ 7);

JabRef = __webpack_require__(/*! ../bibtex/jabref.coffee */ 14);

Collections = __webpack_require__(/*! ./collections.coffee */ 8);

Exporter = (function() {
  function Exporter() {
    var name, ref, v;
    if (Exporter.prototype.instance) {
      return Exporter.prototype.instance;
    }
    Exporter.prototype.instance = this;
    this.extractFieldsKVRE = new RegExp("^\\s*(" + (Object.keys(Exporter.prototype.CSLVariables).join('|')) + "|LCCN|MR|Zbl|arXiv|JSTOR|HDL|GoogleBooksID)\\s*:\\s*(.+)\\s*$", 'i');
    ref = this.CSLVariables;
    for (name in ref) {
      v = ref[name];
      v.name = name;
    }
    this.preamble = {
      DeclarePrefChars: ''
    };
    this.attachmentCounter = 0;
    this.caching = !Translator.options.exportFileData;
    this.collections = Collections();
    this.jabref = new JabRef(this.collections);
    this.citekeys = {};
  }

  Exporter.prototype.locale = function(language) {
    var base, i, k, len, ll, locale, ref, v;
    if (!this.languages.locales[language]) {
      ll = language.toLowerCase();
      ref = this.languages.langs;
      for (i = 0, len = ref.length; i < len; i++) {
        locale = ref[i];
        for (k in locale) {
          v = locale[k];
          if (ll === v) {
            this.languages.locales[language] = locale[1];
          }
        }
        if (this.languages.locales[language]) {
          break;
        }
      }
      (base = this.languages.locales)[language] || (base[language] = language);
    }
    return this.languages.locales[language];
  };


  /* http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables */

  Exporter.prototype.CSLVariables = {
    archive: {},
    'archive_location': {},
    'archive-place': {},
    authority: {
      BibLaTeX: 'institution'
    },
    'call-number': {
      BibTeX: 'lccn'
    },
    'collection-title': {},
    'container-title': {
      BibLaTeX: function() {
        switch (this.item.__type__) {
          case 'film':
          case 'tvBroadcast':
          case 'videoRecording':
          case 'motion_picture':
            return 'booktitle';
          case 'bookSection':
          case 'chapter':
            return 'maintitle';
          default:
            return 'journaltitle';
        }
      }
    },
    'container-title-short': {},
    dimensions: {},
    DOI: {
      BibTeX: 'doi',
      BibLaTeX: 'doi'
    },
    event: {},
    'event-place': {},
    genre: {},
    ISBN: {
      BibTeX: 'isbn',
      BibLaTeX: 'isbn'
    },
    ISSN: {
      BibTeX: 'issn',
      BibLaTeX: 'issn'
    },
    jurisdiction: {},
    keyword: {},
    locator: {},
    medium: {},
    'original-publisher': {
      BibLaTeX: 'origpublisher',
      type: 'literal'
    },
    'original-publisher-place': {
      BibLaTeX: 'origlocation',
      type: 'literal'
    },
    'original-title': {
      BibLaTeX: 'origtitle'
    },
    page: {},
    'page-first': {},
    PMCID: {},
    PMID: {},
    publisher: {},
    'publisher-place': {
      BibLaTeX: 'location',
      type: 'literal'
    },
    references: {},
    'reviewed-title': {},
    scale: {},
    section: {},
    source: {},
    status: {
      BibLaTeX: 'pubstate'
    },
    title: {
      BibLaTeX: function() {
        if (this.referencetype === 'book') {
          return 'maintitle';
        } else {
          return null;
        }
      }
    },
    'title-short': {},
    URL: {},
    version: {},
    'volume-title': {
      field: 'volumeTitle'
    },
    'year-suffix': {},
    'chapter-number': {},
    'collection-number': {},
    edition: {},
    issue: {},
    number: {
      BibLaTeX: 'number'
    },
    'number-of-pages': {},
    'number-of-volumes': {},
    volume: {
      BibLaTeX: 'volume'
    },
    accessed: {
      type: 'date'
    },
    container: {
      type: 'date'
    },
    'event-date': {
      type: 'date'
    },
    issued: {
      type: 'date',
      BibLaTeX: 'date'
    },
    'original-date': {
      type: 'date',
      BibLaTeX: 'origdate'
    },
    submitted: {
      type: 'date'
    },
    author: {
      type: 'creator',
      BibLaTeX: 'author'
    },
    'collection-editor': {
      type: 'creator'
    },
    composer: {
      type: 'creator'
    },
    'container-author': {
      type: 'creator'
    },
    director: {
      type: 'creator',
      BibLaTeX: 'director'
    },
    editor: {
      type: 'creator',
      BibLaTeX: 'editor'
    },
    'editorial-director': {
      type: 'creator'
    },
    illustrator: {
      type: 'creator'
    },
    interviewer: {
      type: 'creator'
    },
    'original-author': {
      type: 'creator'
    },
    recipient: {
      type: 'creator'
    },
    'reviewed-author': {
      type: 'creator'
    },
    translator: {
      type: 'creator'
    },
    type: {
      field: 'cslType'
    }
  };

  Exporter.prototype.CSLVariable = function(name) {
    return this.CSLVariables[name] || this.CSLVariables[name.toLowerCase()] || this.CSLVariables[name.toUpperCase()];
  };

  Exporter.prototype.CSLCreator = function(value) {
    var creator;
    creator = value.split(/\s*\|\|\s*/);
    if (creator.length === 2) {
      return {
        lastName: creator[0] || '',
        firstName: creator[1] || ''
      };
    } else {
      return {
        name: value
      };
    }
  };

  Exporter.prototype.extractFields = function(item) {
    var assignment, cslvar, data, extra, fields, i, j, json, len, len1, line, m, name, prefix, raw, ref, ref1, ref2, value;
    if (!item.extra) {
      return {};
    }
    fields = {};
    m = /(biblatexdata|bibtex|biblatex)(\*)?\[([^\]]+)\]/.exec(item.extra);
    if (m) {
      item.extra = item.extra.replace(m[0], '').trim();
      ref = m[3].split(';');
      for (i = 0, len = ref.length; i < len; i++) {
        assignment = ref[i];
        data = assignment.match(/^([^=]+)=[^\S\n]*(.*)/);
        if (data) {
          fields[data[1].toLowerCase()] = {
            value: data[2],
            format: 'naive',
            raw: !m[2]
          };
        } else {
          debug("Not an assignment: " + assignment);
        }
      }
    }
    m = /(biblatexdata|bibtex|biblatex)(\*)?({[\s\S]+})/.exec(item.extra);
    if (m) {
      prefix = m[1] + (m[2] || '');
      raw = !m[2];
      data = m[3];
      while (data.indexOf('}') >= 0) {
        try {
          json = JSON5.parse(data);
        } catch (error) {
          json = null;
        }
        if (json) {
          break;
        }
        data = data.replace(/[^}]*}$/, '');
      }
      if (json) {
        item.extra = item.extra.replace(prefix + data, '').trim();
        for (name in json) {
          if (!hasProp.call(json, name)) continue;
          value = json[name];
          fields[name.toLowerCase()] = {
            value: value,
            format: 'json',
            raw: raw
          };
        }
      }
    }

    /* fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/ */
    item.extra = item.extra.replace(/{:([^:]+):[^\S\n]*([^}]+)}/g, (function(_this) {
      return function(m, name, value) {
        var cslvar, ref1;
        cslvar = _this.CSLVariable(name);
        if (!cslvar) {
          return m;
        }
        switch (false) {
          case !cslvar.field:
            item[cslvar.field] = value;
            break;
          case cslvar.type !== 'creator':
            if (!Array.isArray((ref1 = fields[name]) != null ? ref1.value : void 0)) {
              fields[cslvar.name] = {
                value: [],
                format: 'csl'
              };
            }
            fields[cslvar.name].value.push(_this.CSLCreator(value));
            break;
          default:
            fields[cslvar.name] = {
              value: value,
              format: 'csl'
            };
        }
        return '';
      };
    })(this));
    extra = [];
    ref1 = item.extra.split("\n");
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      line = ref1[j];
      m = this.extractFieldsKVRE.exec(line);
      cslvar = m ? this.CSLVariable(m[1]) : null;
      switch (false) {
        case !!m:
          extra.push(line);
          break;
        case !!cslvar:
          fields[m[1].toLowerCase()] = {
            value: m[2].trim(),
            format: 'key-value'
          };
          break;
        case !cslvar.field:
          item[cslvar.field] = m[2].trim();
          break;
        case cslvar.type !== 'creator':
          if (!Array.isArray((ref2 = fields[cslvar.name]) != null ? ref2.value : void 0)) {
            fields[cslvar.name] = {
              value: [],
              format: 'csl'
            };
          }
          fields[cslvar.name].value.push(this.CSLCreator(m[2].trim()));
          break;
        default:
          fields[cslvar.name] = {
            value: m[2].trim(),
            format: 'csl'
          };
      }
    }
    item.extra = extra.join("\n");
    item.extra = item.extra.trim();
    if (item.extra === '') {
      delete item.extra;
    }
    return fields;
  };

  Exporter.prototype.unique_chars = function(str) {
    var c, i, len, uniq;
    uniq = '';
    for (i = 0, len = str.length; i < len; i++) {
      c = str[i];
      if (uniq.indexOf(c) < 0) {
        uniq += c;
      }
    }
    return uniq;
  };

  Exporter.prototype.nextItem = function() {
    var cached, item, ref;
    while (item = Zotero.nextItem()) {
      if ((ref = item.itemType) === 'note' || ref === 'attachment') {
        continue;
      }
      debug('fetched item:', item);
      if (!item.citekey) {
        debug(new Error('No citation key found in'), item);
        throw new Error('No citation key in ' + JSON.stringify(item));
      }
      if (cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options)) {
        Zotero.write(cached.reference);
        if (cached.metadata) {
          this.citekeys[cached.itemID] = item.citekey;
          if (cached.metadata.DeclarePrefChars) {
            this.preamble.DeclarePrefChars += cached.metadata.DeclarePrefChars;
          }
          continue;
        }
      }
      Zotero.BetterBibTeX.simplifyFields(item);
      item.extra = Citekey.get(item.extra).extra;
      debug('exporting', item);
      this.jabref.citekeys[item.itemID] = item.citekey;
      return item;
    }
    return null;
  };

  Exporter.prototype.complete = function() {
    var cmd, preamble;
    debug('Exporter.complete: write JabRef groups');
    this.jabref.exportGroups();
    preamble = [];
    if (this.preamble.DeclarePrefChars) {
      preamble.push("\\ifdefined\\DeclarePrefChars\\DeclarePrefChars{'’-}\\else\\fi");
    }
    if (this.preamble.noopsort) {
      preamble.push('\\newcommand{\\noopsort}[1]{}');
    }
    if (preamble.length > 0) {
      preamble = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = preamble.length; i < len; i++) {
          cmd = preamble[i];
          results.push('"' + cmd + ' "');
        }
        return results;
      })();
      Zotero.write("@preamble{ " + preamble.join(" \n # ") + " }\n");
    }
  };

  return Exporter;

})();

module.exports = Exporter;


/***/ }),
/* 7 */
/*!********************************************!*\
  !*** ../content/keymanager/get-set.coffee ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var biblatexcitekey, bibtex, get, set;

bibtex = /(?:^|\s)bibtex:[^\S\n]*([^\s]*)(?:\s|$)/;

biblatexcitekey = /(?:^|\s)biblatexcitekey\[([^\[\]\s]*)\](?:\s|$)/;

get = function(extra) {
  var citekey, pinned;
  if (extra != null) {
    extra = '' + extra;
  } else {
    extra = '';
  }
  citekey = '';
  pinned = false;
  extra = extra.replace(bibtex, function(m, _citekey) {
    citekey = _citekey;
    pinned = citekey;
    return "\n";
  }).trim();
  if (!citekey) {
    extra = extra.replace(biblatexcitekey, function(m, _citekey) {
      citekey = _citekey;
      pinned = citekey;
      return "\n";
    }).trim();
  }
  return {
    extra: extra,
    citekey: citekey,
    pinned: !!pinned
  };
};

set = function(extra, citekey) {
  return ((get(extra).extra) + "\nbibtex: " + citekey).trim();
};

module.exports = {
  get: get,
  set: set
};


/***/ }),
/* 8 */
/*!********************************!*\
  !*** ./lib/collections.coffee ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var collections, debug;

debug = __webpack_require__(/*! ../lib/debug.coffee */ 0);

collections = null;

module.exports = function(raw) {
  var children, coll, collection, ref, ref1;
  if (collections) {
    return collections;
  }
  collections = {};
  if (!(((ref = Translator.header.configOptions) != null ? ref.getCollections : void 0) && Zotero.nextCollection)) {
    return collections;
  }
  while (collection = Zotero.nextCollection()) {
    children = collection.children || collection.descendents || [];
    collection = {
      id: collection.id,
      key: collection.key || ((ref1 = collection.primary) != null ? ref1.key : void 0),
      parent: collection.fields.parentKey,
      name: collection.name,
      items: collection.childItems,
      collections: (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = children.length; i < len; i++) {
          coll = children[i];
          if (coll.type === 'collection') {
            results.push(coll.key);
          }
        }
        return results;
      })()
    };
    collections[collection.key] = collection;
  }
  debug('got collections:', collections);
  return collections;
};


/***/ }),
/* 9 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-dp.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ./_an-object */ 16);
var IE8_DOM_DEFINE = __webpack_require__(/*! ./_ie8-dom-define */ 70);
var toPrimitive = __webpack_require__(/*! ./_to-primitive */ 49);
var dP = Object.defineProperty;

exports.f = __webpack_require__(/*! ./_descriptors */ 13) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 10 */
/*!******************************************!*\
  !*** ../node_modules/json5/lib/json5.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// json5.js
// Modern JSON. See README.md for details.
//
// This file is based directly off of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

var JSON5 = ( true ? exports : {});

JSON5.parse = (function () {
    "use strict";

// This is a function that can parse a JSON5 text, producing a JavaScript
// data structure. It is a simple, recursive descent parser. It does not use
// eval or regular expressions, so it can be used as a model for implementing
// a JSON5 parser in other languages.

// We are defining the function inside of another function to avoid creating
// global variables.

    var at,           // The index of the current character
        lineNumber,   // The current line number
        columnNumber, // The current column number
        ch,           // The current character
        escapee = {
            "'":  "'",
            '"':  '"',
            '\\': '\\',
            '/':  '/',
            '\n': '',       // Replace escaped newlines in strings w/ empty string
            b:    '\b',
            f:    '\f',
            n:    '\n',
            r:    '\r',
            t:    '\t'
        },
        ws = [
            ' ',
            '\t',
            '\r',
            '\n',
            '\v',
            '\f',
            '\xA0',
            '\uFEFF'
        ],
        text,

        renderChar = function (chr) {
            return chr === '' ? 'EOF' : "'" + chr + "'";
        },

        error = function (m) {

// Call error when something is wrong.

            var error = new SyntaxError();
            // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
            error.message = m + " at line " + lineNumber + " column " + columnNumber + " of the JSON5 data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 19));
            error.at = at;
            // These two property names have been chosen to agree with the ones in Gecko, the only popular
            // environment which seems to supply this info on JSON.parse
            error.lineNumber = lineNumber;
            error.columnNumber = columnNumber;
            throw error;
        },

        next = function (c) {

// If a c parameter is provided, verify that it matches the current character.

            if (c && c !== ch) {
                error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
            }

// Get the next character. When there are no more characters,
// return the empty string.

            ch = text.charAt(at);
            at++;
            columnNumber++;
            if (ch === '\n' || ch === '\r' && peek() !== '\n') {
                lineNumber++;
                columnNumber = 0;
            }
            return ch;
        },

        peek = function () {

// Get the next character without consuming it or
// assigning it to the ch varaible.

            return text.charAt(at);
        },

        identifier = function () {

// Parse an identifier. Normally, reserved words are disallowed here, but we
// only use this for unquoted object keys, where reserved words are allowed,
// so we don't check for those here. References:
// - http://es5.github.com/#x7.6
// - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
// - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
// TODO Identifiers can have Unicode "letters" in them; add support for those.

            var key = ch;

            // Identifiers must start with a letter, _ or $.
            if ((ch !== '_' && ch !== '$') &&
                    (ch < 'a' || ch > 'z') &&
                    (ch < 'A' || ch > 'Z')) {
                error("Bad identifier as unquoted key");
            }

            // Subsequent characters can contain digits.
            while (next() && (
                    ch === '_' || ch === '$' ||
                    (ch >= 'a' && ch <= 'z') ||
                    (ch >= 'A' && ch <= 'Z') ||
                    (ch >= '0' && ch <= '9'))) {
                key += ch;
            }

            return key;
        },

        number = function () {

// Parse a number value.

            var number,
                sign = '',
                string = '',
                base = 10;

            if (ch === '-' || ch === '+') {
                sign = ch;
                next(ch);
            }

            // support for Infinity (could tweak to allow other words):
            if (ch === 'I') {
                number = word();
                if (typeof number !== 'number' || isNaN(number)) {
                    error('Unexpected word for number');
                }
                return (sign === '-') ? -number : number;
            }

            // support for NaN
            if (ch === 'N' ) {
              number = word();
              if (!isNaN(number)) {
                error('expected word to be NaN');
              }
              // ignore sign as -NaN also is NaN
              return number;
            }

            if (ch === '0') {
                string += ch;
                next();
                if (ch === 'x' || ch === 'X') {
                    string += ch;
                    next();
                    base = 16;
                } else if (ch >= '0' && ch <= '9') {
                    error('Octal literal');
                }
            }

            switch (base) {
            case 10:
                while (ch >= '0' && ch <= '9' ) {
                    string += ch;
                    next();
                }
                if (ch === '.') {
                    string += '.';
                    while (next() && ch >= '0' && ch <= '9') {
                        string += ch;
                    }
                }
                if (ch === 'e' || ch === 'E') {
                    string += ch;
                    next();
                    if (ch === '-' || ch === '+') {
                        string += ch;
                        next();
                    }
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        next();
                    }
                }
                break;
            case 16:
                while (ch >= '0' && ch <= '9' || ch >= 'A' && ch <= 'F' || ch >= 'a' && ch <= 'f') {
                    string += ch;
                    next();
                }
                break;
            }

            if(sign === '-') {
                number = -string;
            } else {
                number = +string;
            }

            if (!isFinite(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

        string = function () {

// Parse a string value.

            var hex,
                i,
                string = '',
                delim,      // double quote or single quote
                uffff;

// When parsing for string values, we must look for ' or " and \ characters.

            if (ch === '"' || ch === "'") {
                delim = ch;
                while (next()) {
                    if (ch === delim) {
                        next();
                        return string;
                    } else if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (ch === '\r') {
                            if (peek() === '\n') {
                                next();
                            }
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else if (ch === '\n') {
                        // unescaped newlines are invalid; see:
                        // https://github.com/aseemk/json5/issues/24
                        // TODO this feels special-cased; are there other
                        // invalid unescaped chars?
                        break;
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

        inlineComment = function () {

// Skip an inline comment, assuming this is one. The current character should
// be the second / character in the // pair that begins this inline comment.
// To finish the inline comment, we look for a newline or the end of the text.

            if (ch !== '/') {
                error("Not an inline comment");
            }

            do {
                next();
                if (ch === '\n' || ch === '\r') {
                    next();
                    return;
                }
            } while (ch);
        },

        blockComment = function () {

// Skip a block comment, assuming this is one. The current character should be
// the * character in the /* pair that begins this block comment.
// To finish the block comment, we look for an ending */ pair of characters,
// but we also watch for the end of text before the comment is terminated.

            if (ch !== '*') {
                error("Not a block comment");
            }

            do {
                next();
                while (ch === '*') {
                    next('*');
                    if (ch === '/') {
                        next('/');
                        return;
                    }
                }
            } while (ch);

            error("Unterminated block comment");
        },

        comment = function () {

// Skip a comment, whether inline or block-level, assuming this is one.
// Comments always begin with a / character.

            if (ch !== '/') {
                error("Not a comment");
            }

            next('/');

            if (ch === '/') {
                inlineComment();
            } else if (ch === '*') {
                blockComment();
            } else {
                error("Unrecognized comment");
            }
        },

        white = function () {

// Skip whitespace and comments.
// Note that we're detecting comments by only a single / character.
// This works since regular expressions are not valid JSON(5), but this will
// break if there are other valid values that begin with a / character!

            while (ch) {
                if (ch === '/') {
                    comment();
                } else if (ws.indexOf(ch) >= 0) {
                    next();
                } else {
                    return;
                }
            }
        },

        word = function () {

// true, false, or null.

            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            case 'I':
                next('I');
                next('n');
                next('f');
                next('i');
                next('n');
                next('i');
                next('t');
                next('y');
                return Infinity;
            case 'N':
              next( 'N' );
              next( 'a' );
              next( 'N' );
              return NaN;
            }
            error("Unexpected " + renderChar(ch));
        },

        value,  // Place holder for the value function.

        array = function () {

// Parse an array value.

            var array = [];

            if (ch === '[') {
                next('[');
                white();
                while (ch) {
                    if (ch === ']') {
                        next(']');
                        return array;   // Potentially empty array
                    }
                    // ES5 allows omitting elements in arrays, e.g. [,] and
                    // [,null]. We don't allow this in JSON5.
                    if (ch === ',') {
                        error("Missing array element");
                    } else {
                        array.push(value());
                    }
                    white();
                    // If there's no comma after this value, this needs to
                    // be the end of the array.
                    if (ch !== ',') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad array");
        },

        object = function () {

// Parse an object value.

            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                while (ch) {
                    if (ch === '}') {
                        next('}');
                        return object;   // Potentially empty object
                    }

                    // Keys can be unquoted. If they are, they need to be
                    // valid JS identifiers.
                    if (ch === '"' || ch === "'") {
                        key = string();
                    } else {
                        key = identifier();
                    }

                    white();
                    next(':');
                    object[key] = value();
                    white();
                    // If there's no comma after this pair, this needs to be
                    // the end of the object.
                    if (ch !== ',') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad object");
        };

    value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

        white();
        switch (ch) {
        case '{':
            return object();
        case '[':
            return array();
        case '"':
        case "'":
            return string();
        case '-':
        case '+':
        case '.':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

// Return the json_parse function. It will have access to all of the above
// functions and variables.

    return function (source, reviver) {
        var result;

        text = String(source);
        at = 0;
        lineNumber = 1;
        columnNumber = 1;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

// If there is a reviver function, we recursively walk the new structure,
// passing each name/value pair to the reviver function for possible
// transformation, starting with a temporary root object that holds the result
// in an empty key. If there is not a reviver function, we simply return the
// result.

        return typeof reviver === 'function' ? (function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }({'': result}, '')) : result;
    };
}());

// JSON5 stringify will not quote keys where appropriate
JSON5.stringify = function (obj, replacer, space) {
    if (replacer && (typeof(replacer) !== "function" && !isArray(replacer))) {
        throw new Error('Replacer must be a function or an array');
    }
    var getReplacedValueOrUndefined = function(holder, key, isTopLevel) {
        var value = holder[key];

        // Replace the value with its toJSON value first, if possible
        if (value && value.toJSON && typeof value.toJSON === "function") {
            value = value.toJSON();
        }

        // If the user-supplied replacer if a function, call it. If it's an array, check objects' string keys for
        // presence in the array (removing the key/value pair from the resulting JSON if the key is missing).
        if (typeof(replacer) === "function") {
            return replacer.call(holder, key, value);
        } else if(replacer) {
            if (isTopLevel || isArray(holder) || replacer.indexOf(key) >= 0) {
                return value;
            } else {
                return undefined;
            }
        } else {
            return value;
        }
    };

    function isWordChar(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') ||
            c === '_' || c === '$';
    }

    function isWordStart(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_' || c === '$';
    }

    function isWord(key) {
        if (typeof key !== 'string') {
            return false;
        }
        if (!isWordStart(key[0])) {
            return false;
        }
        var i = 1, length = key.length;
        while (i < length) {
            if (!isWordChar(key[i])) {
                return false;
            }
            i++;
        }
        return true;
    }

    // export for use in tests
    JSON5.isWord = isWord;

    // polyfills
    function isArray(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        } else {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    }

    function isDate(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    var objStack = [];
    function checkForCircular(obj) {
        for (var i = 0; i < objStack.length; i++) {
            if (objStack[i] === obj) {
                throw new TypeError("Converting circular structure to JSON");
            }
        }
    }

    function makeIndent(str, num, noNewLine) {
        if (!str) {
            return "";
        }
        // indentation no more than 10 chars
        if (str.length > 10) {
            str = str.substring(0, 10);
        }

        var indent = noNewLine ? "" : "\n";
        for (var i = 0; i < num; i++) {
            indent += str;
        }

        return indent;
    }

    var indentStr;
    if (space) {
        if (typeof space === "string") {
            indentStr = space;
        } else if (typeof space === "number" && space >= 0) {
            indentStr = makeIndent(" ", space, true);
        } else {
            // ignore space parameter
        }
    }

    // Copied from Crokford's implementation of JSON
    // See https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
    // Begin
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
    function escapeString(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ?
                c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    // End

    function internalStringify(holder, key, isTopLevel) {
        var buffer, res;

        // Replace the value, if necessary
        var obj_part = getReplacedValueOrUndefined(holder, key, isTopLevel);

        if (obj_part && !isDate(obj_part)) {
            // unbox objects
            // don't unbox dates, since will turn it into number
            obj_part = obj_part.valueOf();
        }
        switch(typeof obj_part) {
            case "boolean":
                return obj_part.toString();

            case "number":
                if (isNaN(obj_part) || !isFinite(obj_part)) {
                    return "null";
                }
                return obj_part.toString();

            case "string":
                return escapeString(obj_part.toString());

            case "object":
                if (obj_part === null) {
                    return "null";
                } else if (isArray(obj_part)) {
                    checkForCircular(obj_part);
                    buffer = "[";
                    objStack.push(obj_part);

                    for (var i = 0; i < obj_part.length; i++) {
                        res = internalStringify(obj_part, i, false);
                        buffer += makeIndent(indentStr, objStack.length);
                        if (res === null || typeof res === "undefined") {
                            buffer += "null";
                        } else {
                            buffer += res;
                        }
                        if (i < obj_part.length-1) {
                            buffer += ",";
                        } else if (indentStr) {
                            buffer += "\n";
                        }
                    }
                    objStack.pop();
                    if (obj_part.length) {
                        buffer += makeIndent(indentStr, objStack.length, true)
                    }
                    buffer += "]";
                } else {
                    checkForCircular(obj_part);
                    buffer = "{";
                    var nonEmpty = false;
                    objStack.push(obj_part);
                    for (var prop in obj_part) {
                        if (obj_part.hasOwnProperty(prop)) {
                            var value = internalStringify(obj_part, prop, false);
                            isTopLevel = false;
                            if (typeof value !== "undefined" && value !== null) {
                                buffer += makeIndent(indentStr, objStack.length);
                                nonEmpty = true;
                                key = isWord(prop) ? prop : escapeString(prop);
                                buffer += key + ":" + (indentStr ? ' ' : '') + value + ",";
                            }
                        }
                    }
                    objStack.pop();
                    if (nonEmpty) {
                        buffer = buffer.substring(0, buffer.length-1) + makeIndent(indentStr, objStack.length) + "}";
                    } else {
                        buffer = '{}';
                    }
                }
                return buffer;
            default:
                // functions and undefined should be ignored
                return undefined;
        }
    }

    // special case...when undefined is used inside of
    // a compound object/array, return null.
    // but when top-level, return undefined
    var topLevelHolder = {"":obj};
    if (obj === undefined) {
        return getReplacedValueOrUndefined(topLevelHolder, '', true);
    }
    return internalStringify(topLevelHolder, '', true);
};


/***/ }),
/* 11 */
/*!**********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_export.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ 12);
var core = __webpack_require__(/*! ./_core */ 3);
var ctx = __webpack_require__(/*! ./_ctx */ 20);
var hide = __webpack_require__(/*! ./_hide */ 15);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && key in exports) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 12 */
/*!**********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_global.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 13 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_descriptors.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(/*! ./_fails */ 18)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 14 */
/*!******************************!*\
  !*** ./bibtex/jabref.coffee ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var JabRef, debug;

debug = __webpack_require__(/*! ../lib/debug.coffee */ 0);

JabRef = (function() {
  function JabRef(collections) {
    this.collections = collections;
    debug('JabRef:', {
      collections: this.collections
    });
    this.citekeys = {};
  }

  JabRef.prototype.exportGroups = function() {
    var collection, key, meta, ref;
    debug('exportGroups:', this.collections);
    if (Object.keys(this.collections).length === 0 || !Translator.preferences.jabrefGroups) {
      return;
    }
    switch (false) {
      case Translator.preferences.jabrefGroups !== 3:
        meta = 'groupsversion:3';
        break;
      case !Translator.BetterBibLaTeX:
        meta = 'databaseType:biblatex';
        break;
      default:
        meta = 'databaseType:bibtex';
    }
    debug('JabRef.exportGroups', {
      collections: this.collections,
      citekeys: this.citekeys
    });
    Zotero.write("@comment{jabref-meta: " + meta + ";}\n");
    Zotero.write('@comment{jabref-meta: groupstree:\n');
    Zotero.write('0 AllEntriesGroup:;\n');
    ref = this.collections;
    for (key in ref) {
      collection = ref[key];
      if (collection.parent) {
        continue;
      }
      Zotero.write(this.exportGroup(collection, 1));
    }
    Zotero.write(';\n');
    Zotero.write('}\n');
  };

  JabRef.prototype.serialize = function(list, wrap) {
    var elt, serialized;
    serialized = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = list.length; i < len; i++) {
        elt = list[i];
        results.push(elt.replace(/\\/g, '\\\\').replace(/;/g, '\\;'));
      }
      return results;
    })();
    if (wrap) {
      serialized = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = serialized.length; i < len; i++) {
          elt = serialized[i];
          results.push(elt.match(/.{1,70}/g).join("\n"));
        }
        return results;
      })();
    }
    return serialized.join(wrap ? ";\n" : ';');
  };

  JabRef.prototype.exportGroup = function(collection, level) {
    var child, collected, i, id, len, ref, references;
    collected = [level + " ExplicitGroup:" + collection.name, '0'];
    debug('JabRef.exportGroup:', {
      groups: Translator.preferences.jabrefGroups,
      items: collection.items,
      citekeys: this.citekeys
    });
    if (Translator.preferences.jabrefGroups === 3) {
      references = (function() {
        var i, len, ref, results;
        ref = collection.items || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          if (this.citekeys[id]) {
            results.push(this.citekeys[id]);
          }
        }
        return results;
      }).call(this);
      if (Translator.preferences.testing) {
        references.sort();
      }
      collected = collected.concat(references);
    }
    collected = collected.concat(['']);
    collected = [this.serialize(collected)];
    ref = collection.collections || [];
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      collected = collected.concat(this.exportGroup(child, level + 1));
    }
    if (level > 1) {
      return collected;
    } else {
      return this.serialize(collected, true);
    }
  };

  return JabRef;

})();

module.exports = JabRef;


/***/ }),
/* 15 */
/*!********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_hide.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(/*! ./_object-dp */ 9);
var createDesc = __webpack_require__(/*! ./_property-desc */ 29);
module.exports = __webpack_require__(/*! ./_descriptors */ 13) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 16 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_an-object.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ 17);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 17 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_is-object.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 18 */
/*!*********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_fails.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 19 */
/*!*******************************************************!*\
  !*** ../node_modules/core-js/library/modules/_has.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 20 */
/*!*******************************************************!*\
  !*** ../node_modules/core-js/library/modules/_ctx.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(/*! ./_a-function */ 69);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 21 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_iterators.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 22 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_to-iobject.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(/*! ./_iobject */ 51);
var defined = __webpack_require__(/*! ./_defined */ 46);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 23 */
/*!***************************************************************!*\
  !*** ../node_modules/babel-runtime/helpers/classCallCheck.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/***/ }),
/* 24 */
/*!************************************************************!*\
  !*** ../node_modules/babel-runtime/helpers/createClass.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__(/*! ../core-js/object/define-property */ 84);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/***/ }),
/* 25 */,
/* 26 */,
/* 27 */
/*!*********************************!*\
  !*** ./lib/markupparser.coffee ***!
  \*********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {


/* From https://raw.githubusercontent.com/Munawwar/neutron-html5parser/master/htmlparser.js */
var MarkupParser,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

MarkupParser = (function() {
  var AST;

  function MarkupParser() {}

  MarkupParser.prototype.re = {
    startTag: /^<([-\w:]+)((?:\s+[^\s\/>"'=]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
    endTag: /^<\/([-\w:]+)[^>]*>/,
    attr: /^\s+([^\s\/>"'=]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/,
    pre: /^([\s\S]*?)<\/pre[^>]*>/i
  };

  MarkupParser.prototype.makeMap = function(elts) {
    var elt, j, len, map, ref;
    map = {};
    ref = elts.split(/\s+/);
    for (j = 0, len = ref.length; j < len; j++) {
      elt = ref[j];
      map[elt] = true;
    }
    return map;
  };

  MarkupParser.prototype.minimal = MarkupParser.prototype.makeMap('em italic i strong b nc sc enquote pre span sub sup');

  MarkupParser.prototype.closeSelf = MarkupParser.prototype.makeMap('colgroup dd dt li options p td tfoot th thead tr');

  MarkupParser.prototype.empty = MarkupParser.prototype.makeMap('area base basefont br col frame hr img input link meta param embed command keygen source track wbr');

  MarkupParser.prototype.parseStartTag = function(tag, tagName, rest, unary) {
    var attrs, match, name, value;
    tagName = tagName.toLowerCase();
    if (this.closeSelf[tagName] && this.lastTag === tagName) {
      this.parseEndTag("", tagName);
    }
    unary = this.empty[tagName] || !!unary;
    if (!unary) {
      this.stack.push(tagName);
      this.lastTag = tagName;
    }
    if (this.handler.start) {
      attrs = {};
      while (match = rest.match(this.re.attr)) {
        rest = rest.substr(match[0].length);
        name = match[1];
        value = match[2] || match[3] || match[4] || '';
        attrs[name] = value;
      }
      this.handler.start(tagName, attrs);
    }
  };

  MarkupParser.prototype.parseEndTag = function(tag, tagName) {
    var i, pos;
    if (!tagName) {
      pos = 0;
    } else {
      pos = this.stack.length - 1;
      while (pos >= 0) {
        if (this.stack[pos] === tagName) {
          break;
        }
        pos -= 1;
      }
    }
    if (pos >= 0) {
      i = this.stack.length - 1;
      while (i >= pos) {
        if (this.handler.end) {
          this.handler.end(this.stack[i]);
        }
        i -= 1;
      }
      this.stack.length = pos;
      this.lastTag = this.stack[pos - 1];
    }
  };

  MarkupParser.prototype.parse = function(html, options) {
    var chars, htmlMode, index, last, length, match, pos, ref, text;
    if (options == null) {
      options = {};
    }
    html = '' + html;
    this.handler = new AST(options.caseConversion);
    if (options.mode === 'plain') {
      if (options.caseConversion) {
        throw "No case conversion in plain mode";
      }
      this.handler.chars(html);
      return this.handler.root;
    }
    this.stack = [];
    htmlMode = options.mode === 'html';
    last = html;

    /* add enquote psuedo-tags. Pseudo-tags are used here because they're cleanly removable for the pre block */
    if (Translator.preferences.csquotes) {
      html = html.replace(RegExp("[" + (Translator.preferences.csquotes.open.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]\s*/g, "\\$&")) + "]\\s*", "g"), "\x0E");
      html = html.replace(RegExp("\\s*[" + (Translator.preferences.csquotes.close.replace(/\s*[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")) + "]", "g"), "\x0F");
    }
    length = html.length;
    while (html) {
      chars = true;
      switch (false) {
        case this.lastTag !== 'pre':
          html = html.replace(this.re.pre, (function(_this) {
            return function(all, text) {
              if (_this.handler.pre) {
                _this.handler.pre(text.replace(/[\x0E\x0F]/g, ''));
              }
              return '';
            };
          })(this));
          chars = false;
          this.parseEndTag('', this.lastTag);
          break;
        case !(html.substring(0, 2) === '</' || html[0] === "\x0F"):
          if (html[0] === '<') {
            match = html.match(this.re.endTag);
            switch (false) {
              case !!match:
                break;
              case !(htmlMode || match[1] === 'span'):
                break;
              case !(this.minimal[match[1]] && match[0][match[1].length + 2] === '>'):
                break;
              default:
                match = null;
            }
          } else {
            match = [html[0], 'enquote'];
          }
          if (match) {
            html = html.substring(match[0].length);
            this.parseEndTag.apply(this, match);
          } else {
            if (this.handler.chars) {
              this.handler.chars('<', length - html.length);
            }
            html = html.substring(1);
          }
          chars = false;
          break;
        case !(html[0] === '<' || html[0] === "\x0E"):
          if (html[0] === '<') {
            match = html.match(this.re.startTag);
            switch (false) {
              case !!match:
                break;
              case !(htmlMode || match[1] === 'span'):
                break;
              case !(this.minimal[match[1]] && ((ref = match[0].substr(match[1].length + 1, 2)) === '/>' || ref === '>')):
                break;
              default:
                match = null;
            }
          } else {
            match = [html[0], 'enquote', '', ''];
          }
          if (match) {
            html = html.substring(match[0].length);
            this.parseStartTag.apply(this, match);
          } else {
            if (this.handler.chars) {
              this.handler.chars('<', length - html.length);
            }
            html = html.substring(1);
          }
          chars = false;
      }
      if (chars) {
        index = html.search(/[<\x0E\x0F]/);
        pos = length - html.length;
        text = index < 0 ? html : html.substring(0, index);
        html = index < 0 ? '' : html.substring(index);
        if (this.handler.chars) {
          this.handler.chars(text, pos);
        }
      }
      if (html === last) {
        throw 'Parse Error: ' + html;
      }
      last = html;
    }
    this.parseEndTag();
    if (options.caseConversion) {
      if (!Translator.preferences.suppressTitleCase) {
        this.titleCased = Zotero.BetterBibTeX.titleCase(this.innerText(this.handler.root));
        this.titleCase(this.handler.root);
      }
      this.simplify(this.handler.root);

      /* BibLaTeX is beyond insane https://github.com/retorquere/zotero-better-bibtex/issues/541#issuecomment-240999396 */
      this.unwrapNocase(this.handler.root);
    }
    return this.handler.root;
  };

  MarkupParser.prototype.innerText = function(node, text) {
    var child, j, len, ref;
    if (text == null) {
      text = '';
    }
    switch (node.name) {
      case '#text':
        if (node.pos != null) {
          text += Array((node.pos - text.length) + 1).join(' ') + node.text;
        }
        break;
      case 'pre':
        text += node.text.replace(/</g, '[').replace(/>/g, ']');
        break;
      default:
        ref = node.children;
        for (j = 0, len = ref.length; j < len; j++) {
          child = ref[j];
          text = this.innerText(child, text);
        }
    }
    return text;
  };

  MarkupParser.prototype.unwrapNocase = function(node) {
    var child, children, clone, expand, expanded, j, k, last, len, len1, ref, ref1, ref2;
    if (node.name === '#text') {
      return node;
    }
    children = (function() {
      var j, len, ref, results;
      ref = node.children;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        results.push(this.unwrapNocase(child));
      }
      return results;
    }).call(this);
    node.children = (ref = []).concat.apply(ref, children);
    expand = false;
    ref1 = node.children;
    for (j = 0, len = ref1.length; j < len; j++) {
      child = ref1[j];
      if (child.nocase) {
        expand = true;
        break;
      }
    }
    if (!expand) {
      return node;
    }
    expanded = [];
    last = null;
    ref2 = node.children;
    for (k = 0, len1 = ref2.length; k < len1; k++) {
      child = ref2[k];
      clone = JSON.parse(JSON.stringify(node));
      switch (false) {
        case !child.nocase:
          clone.children = child.children;
          child.children = [clone];
          expanded.push(child);
          last = null;
          break;
        case !(last && !last.nocase):
          last.children.push(child);
          break;
        default:
          clone.children = [child];
          expanded.push(clone);
          last = clone;
      }
    }
    return expanded;
  };

  MarkupParser.prototype.simplify = function(node, isNoCased) {
    var child, j, len, ref;
    if (isNoCased) {
      delete node.nocase;
    }
    switch (node.name) {
      case '#text':
        break;
      case 'pre':
        switch (node.children.length) {
          case 0:
            break;
          case 1:
            if (node.children[0].name !== '#text') {
              throw new Error("Pre node had unexpected child " + (JSON.stringify(node.children[0])));
            }
            node.text = node.children[0].text;
            node.children = [];
            break;
          default:
            throw new Error("Pre node had unexpected children " + (JSON.stringify(node.children)));
        }
        break;
      default:
        ref = node.children;
        for (j = 0, len = ref.length; j < len; j++) {
          child = ref[j];
          this.simplify(child, isNoCased || node.nocase);
        }
    }
  };

  MarkupParser.prototype.titleCase = function(node) {
    var char, child, i, j, k, len, len1, recased, ref, ref1, ref2, spaces;
    if (node.name === '#text') {
      if (node.pos != null) {
        spaces = '\u2003\u2004\u205F\u2009\u00A0'.split('');
        recased = '';
        ref = this.titleCased.substr(node.pos, node.text.length).split('');
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          char = ref[i];
          if (ref1 = node.text[i], indexOf.call(spaces, ref1) >= 0) {
            recased += node.text[i];
          } else {
            recased += char;
          }
        }
        node.text = recased;
      }
    } else {
      ref2 = node.children;
      for (k = 0, len1 = ref2.length; k < len1; k++) {
        child = ref2[k];
        if (!child.nocase) {
          this.titleCase(child);
        }
      }
    }
  };

  AST = (function() {
    AST.prototype.re = {
      Nl: /\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF/.source,
      Nd: /\u0030-\u0039\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19/.source,
      Mn: /\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F/.source,
      Mc: /\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC/.source,
      Lu: /\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A/.source,
      Lt: /\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC/.source,
      Ll: /\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A/.source,
      Lm: /\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F/.source,
      Lo: /\u00AA\u00BA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC/.source,

      /* P without period */
      P: /\.\u002D\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\/:;<=>\?@\[\]^_`{\|}~/.source,
      whitespace: / \t\n\r\u00A0/.source
    };

    AST.prototype.re.lcChar = AST.prototype.re.Ll + AST.prototype.re.Lt + AST.prototype.re.Lm + AST.prototype.re.Lo + AST.prototype.re.Mn + AST.prototype.re.Mc + AST.prototype.re.Nd + AST.prototype.re.Nl;

    AST.prototype.re.char = AST.prototype.re.Lu + AST.prototype.re.lcChar;

    AST.prototype.re.protectedWord = "[" + AST.prototype.re.lcChar + "]*[" + AST.prototype.re.Lu + "][" + AST.prototype.re.char + "]*";


    /* actual regexps */


    /* TODO: add punctuation */

    AST.prototype.re.leadingUnprotectedWord = RegExp("^([" + AST.prototype.re.Lu + "][" + AST.prototype.re.lcChar + "]*)[" + AST.prototype.re.whitespace + AST.prototype.re.P + "]");

    AST.prototype.re.protectedWords = RegExp("^(" + AST.prototype.re.protectedWord + ")(([" + AST.prototype.re.whitespace + "])(" + AST.prototype.re.protectedWord + "))*");

    AST.prototype.re.unprotectedWord = RegExp("^[" + AST.prototype.re.char + "]+");

    AST.prototype.re.url = /^(https?|mailto):\/\/[^\s]+/;

    AST.prototype.re.whitespace = RegExp("^[" + AST.prototype.re.whitespace + "]+");

    function AST(caseConversion) {
      this.caseConversion = caseConversion;
      this.root = {
        name: 'span',
        children: [],
        attr: {},
        "class": {}
      };
      this.elems = [this.root];
      this.sentenceStart = true;
      return;
    }

    AST.prototype.start = function(name, attr, unary) {
      var cls, j, len, ref, tag;
      tag = {
        name: name,
        attr: attr,
        "class": {},
        children: []
      };
      if (tag.attr["class"]) {
        ref = tag.attr["class"].split(/\s+/);
        for (j = 0, len = ref.length; j < len; j++) {
          cls = ref[j];
          tag["class"][cls] = true;
        }
      }
      if (name === 'sc' || tag["class"].smallcaps || (tag.attr.smallcaps != null) || (tag.attr.style || '').match(/small-caps/i)) {
        tag.smallcaps = true;
      }
      if ((tag.attr.nocase != null) || tag["class"].nocase || name === 'nc') {
        tag.nocase = true;
      }
      if ((tag.attr.relax != null) || tag["class"].relax) {
        tag.relax = true;
      }
      this.elems[0].children.push(tag);
      this.elems.unshift(tag);
    };

    AST.prototype.end = function() {
      this.elems.shift();
    };

    AST.prototype.plaintext = function(text, pos) {
      var l;
      l = this.elems[0].children.length;
      if (l === 0 || this.elems[0].children[l - 1].name !== '#text') {
        this.elems[0].children.push({
          pos: pos,
          name: '#text',
          text: text
        });
      } else {
        this.elems[0].children[l - 1].text += text;
      }
    };

    AST.prototype.pre = function(text) {
      if (this.elems[0].name !== 'pre') {
        throw "Expectd 'pre' tag, found '" + this.elems[0].name + "'";
      }
      if (this.elems[0].text) {
        throw "Text already set on pre tag'";
      }
      if (this.elems[0].children && this.elems[0].children.length > 0) {
        throw "Pre must not have children";
      }
      this.elems[0].text = text;
    };

    AST.prototype.chars = function(text, pos) {
      var length, m;
      if (!(this.caseConversion && (pos != null))) {
        this.elems[0].children.push({
          pos: pos,
          name: '#text',
          text: text
        });
        return;
      }
      length = text.length;
      while (text) {
        if (m = this.re.whitespace.exec(text)) {
          this.plaintext(m[0], pos + (length - text.length));
          text = text.substring(m[0].length);
          continue;
        }
        if (this.sentenceStart && (m = this.re.leadingUnprotectedWord.exec(text + ' '))) {
          this.sentenceStart = false;
          this.plaintext(m[1], pos + (length - text.length));
          text = text.substring(m[1].length);
          continue;
        }
        this.sentenceStart = false;
        switch (false) {
          case !(m = this.re.protectedWords.exec(text)):
            this.elems[0].children.push({
              name: 'span',
              nocase: true,
              children: [
                {
                  pos: pos + (length - text.length),
                  name: '#text',
                  text: m[0]
                }
              ],
              attr: {},
              "class": {}
            });
            text = text.substring(m[0].length);
            break;
          case !(m = this.re.url.exec(text)):
            this.elems[0].children.push({
              name: 'span',
              nocase: true,
              children: [
                {
                  pos: pos + (length - text.length),
                  name: '#text',
                  text: m[0]
                }
              ],
              attr: {},
              "class": {}
            });
            text = text.substring(m[0].length);
            break;
          case !(m = this.re.unprotectedWord.exec(text)):
            this.plaintext(m[0], pos + (length - text.length));
            text = text.substring(m[0].length);
            break;
          default:
            this.plaintext(text[0], pos + (length - text.length));
            text = text.substring(1);
        }
      }
    };

    return AST;

  })();

  return MarkupParser;

})();

module.exports = new MarkupParser();


/***/ }),
/* 28 */
/*!**********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.string.iterator.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(/*! ./_string-at */ 99)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(/*! ./_iter-define */ 47)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 29 */
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_property-desc.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 30 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-keys.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(/*! ./_object-keys-internal */ 73);
var enumBugKeys = __webpack_require__(/*! ./_enum-bug-keys */ 55);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 31 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_to-object.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(/*! ./_defined */ 46);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 32 */,
/* 33 */,
/* 34 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_to-length.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(/*! ./_to-integer */ 45);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 35 */
/*!*******************************************************!*\
  !*** ../node_modules/core-js/library/modules/_uid.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 36 */
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_set-to-string-tag.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(/*! ./_object-dp */ 9).f;
var has = __webpack_require__(/*! ./_has */ 19);
var TAG = __webpack_require__(/*! ./_wks */ 4)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 37 */
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/web.dom.iterable.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./es6.array.iterator */ 106);
var global = __webpack_require__(/*! ./_global */ 12);
var hide = __webpack_require__(/*! ./_hide */ 15);
var Iterators = __webpack_require__(/*! ./_iterators */ 21);
var TO_STRING_TAG = __webpack_require__(/*! ./_wks */ 4)('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}


/***/ }),
/* 38 */
/*!**********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_for-of.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(/*! ./_ctx */ 20);
var call = __webpack_require__(/*! ./_iter-call */ 77);
var isArrayIter = __webpack_require__(/*! ./_is-array-iter */ 78);
var anObject = __webpack_require__(/*! ./_an-object */ 16);
var toLength = __webpack_require__(/*! ./_to-length */ 34);
var getIterFn = __webpack_require__(/*! ./core.get-iterator-method */ 56);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),
/* 39 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-pie.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 40 */
/*!***********************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/const.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/** A list of supported languages (without aliases)  in the langid field */
var langidOptions = {
    "acadian": {
        "csl": "fr-CA",
        "biblatex": "acadian"
    },
    "afrikaans": {
        "csl": "af-ZA",
        "biblatex": "afrikaans"
    },
    "arabic": {
        "csl": "ar",
        "biblatex": "arabic"
    },
    "basque": {
        "csl": "eu",
        "biblatex": "basque"
    },
    "bulgarian": {
        "csl": "bg-BG",
        "biblatex": "bulgarian"
    },
    "catalan": {
        "csl": "ca-AD",
        "biblatex": "catalan"
    },
    "chinese": {
        "csl": "zh-CN",
        "biblatex": "pinyin"
    },
    "croatian": {
        "csl": "hr-HR",
        "biblatex": "croatian"
    },
    "czech": {
        "csl": "cs-CZ",
        "biblatex": "czech"
    },
    "danish": {
        "csl": "da-DK",
        "biblatex": "danish"
    },
    "dutch": {
        "csl": "nl-NL",
        "biblatex": "dutch"
    },
    "auenglish": {
        "csl": "en-GB",
        "biblatex": "australian"
    },
    "caenglish": {
        "csl": "en-US",
        "biblatex": "canadian"
    },
    "nzenglish": {
        "csl": "en-GB",
        "biblatex": "newzealand"
    },
    "ukenglish": {
        "csl": "en-GB",
        "biblatex": "ukenglish"
    },
    "usenglish": {
        "csl": "en-US",
        "biblatex": "usenglish"
    },
    "estonian": {
        "csl": "et-EE",
        "biblatex": "estonian"
    },
    "finnish": {
        "csl": "fi-FI",
        "biblatex": "finnish"
    },
    "french": {
        "csl": "fr-FR",
        "biblatex": "french"
    },
    "cafrench": {
        "csl": "fr-CA",
        "biblatex": "canadien"
    },
    "german": {
        "csl": "de-DE",
        "biblatex": "ngerman"
    },
    "atgerman": {
        "csl": "de-AT",
        "biblatex": "naustrian"
    },
    "greek": {
        "csl": "el-GR",
        "biblatex": "greek"
    },
    "hebrew": {
        "csl": "he-IL",
        "biblatex": "hebrew"
    },
    "hungarian": {
        "csl": "hu-HU",
        "biblatex": "hungarian"
    },
    "icelandic": {
        "csl": "is-IS",
        "biblatex": "icelandic"
    },
    "italian": {
        "csl": "it-IT",
        "biblatex": "italian"
    },
    "japanese": {
        "csl": "ja-JP",
        "biblatex": "japanese"
    },
    "latin": {
        "csl": "la",
        "biblatex": "latin"
    },
    "latvian": {
        "csl": "lv-LV",
        "biblatex": "latvian"
    },
    "lithuanian": {
        "csl": "lt-LT",
        "biblatex": "lithuanian"
    },
    "magyar": {
        "csl": "hu-HU",
        "biblatex": "magyar"
    },
    "mongolian": {
        "csl": "mn-MN",
        "biblatex": "mongolian"
    },
    "norwegian": {
        "csl": "nb-NO",
        "biblatex": "norsk"
    },
    "newnorwegian": {
        "csl": "nn-NO",
        "biblatex": "nynorsk"
    },
    "farsi": {
        "csl": "fa-IR",
        "biblatex": "farsi"
    },
    "polish": {
        "csl": "pl-PL",
        "biblatex": "polish"
    },
    "portuguese": {
        "csl": "pt-PT",
        "biblatex": "portuguese"
    },
    "brportuguese": {
        "csl": "pt-BR",
        "biblatex": "brazilian"
    },
    "romanian": {
        "csl": "ro-RO",
        "biblatex": "romanian"
    },
    "russian": {
        "csl": "ru-RU",
        "biblatex": "russian"
    },
    "serbian": {
        "csl": "sr-RS",
        "biblatex": "serbian"
    },
    "cyrillicserbian": {
        "csl": "sr-RS",
        "biblatex": "serbianc"
    },
    "slovak": {
        "csl": "sk-SK",
        "biblatex": "slovak"
    },
    "slovene": {
        "csl": "sl-SL",
        "biblatex": "slovene"
    },
    "spanish": {
        "csl": "es-ES",
        "biblatex": "spanish"
    },
    "swedish": {
        "csl": "sv-SE",
        "biblatex": "swedish"
    },
    "thai": {
        "csl": "th-TH",
        "biblatex": "thai"
    },
    "turkish": {
        "csl": "tr-TR",
        "biblatex": "turkish"
    },
    "ukrainian": {
        "csl": "uk-UA",
        "biblatex": "ukrainian"
    },
    "vietnamese": {
        "csl": "vi-VN",
        "biblatex": "vietnamese"
    }
};

var pubstateOptions = {
    "inpreparation": {
        "csl": "in preparation",
        "biblatex": "inpreparation"
    },
    "submitted": {
        "csl": "submitted",
        "biblatex": "submitted"
    },
    "forthcoming": {
        "csl": "forthcoming",
        "biblatex": "forthcoming"
    },
    "inpress": {
        "csl": "in press",
        "biblatex": "inpress"
    },
    "prepublished": {
        "csl": "prepublished",
        "biblatex": "prepublished"
    }
};

var languageOptions = ['catalan', 'croatian', 'czech', 'danish', 'dutch', 'english', 'american', 'finnish', 'french', 'german', 'greek', 'italian', 'latin', 'norwegian', 'polish', 'portuguese', 'brazilian', 'russian', 'slovene', 'spanish', 'swedish'];

/** A list of field types of Bibligraphy DB with lookup by field name. */
var BibFieldTypes = exports.BibFieldTypes = {
    'abstract': {
        type: 'f_long_literal',
        biblatex: 'abstract',
        csl: 'abstract'
    },
    'addendum': {
        type: 'f_literal',
        biblatex: 'addendum'
    },
    'afterword': {
        type: 'l_name',
        biblatex: 'afterword'
    },
    'annotation': {
        type: 'f_long_literal',
        biblatex: 'annotation'
    },
    'annotator': {
        type: 'l_name',
        biblatex: 'annotator'
    },
    'author': {
        type: 'l_name',
        biblatex: 'author',
        csl: 'author'
    },
    'bookauthor': {
        type: 'l_name',
        biblatex: 'bookauthor',
        csl: 'container-author'
    },
    'bookpagination': {
        type: 'f_key',
        biblatex: 'bookpagination',
        options: ['page', 'column', 'section', 'paragraph', 'verse', 'line']
    },
    'booksubtitle': {
        type: 'f_title',
        biblatex: 'booksubtitle'
    },
    'booktitle': {
        type: 'f_title',
        biblatex: 'booktitle',
        csl: 'container-title'
    },
    'booktitleaddon': {
        type: 'f_title',
        biblatex: 'booktitleaddon'
    },
    'chapter': {
        type: 'f_literal',
        biblatex: 'chapter',
        csl: 'chapter-number'
    },
    'commentator': {
        type: 'l_name',
        biblatex: 'commentator'
    },
    'date': {
        type: 'f_date',
        biblatex: 'date',
        csl: 'issued'
    },
    'doi': {
        type: 'f_verbatim',
        biblatex: 'doi',
        csl: 'DOI'
    },
    'edition': {
        type: 'f_integer',
        biblatex: 'edition',
        csl: 'edition'
    },
    'editor': {
        type: 'l_name',
        biblatex: 'editor',
        csl: 'editor'
    },
    'editora': {
        type: 'l_name',
        biblatex: 'editora'
    },
    'editorb': {
        type: 'l_name',
        biblatex: 'editorb'
    },
    'editorc': {
        type: 'l_name',
        biblatex: 'editorc'
    },
    'editortype': {
        type: 'f_key',
        biblatex: 'editortype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'editoratype': {
        type: 'f_key',
        biblatex: 'editoratype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'editorbtype': {
        type: 'f_key',
        biblatex: 'editorbtype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'editorctype': {
        type: 'f_key',
        biblatex: 'editorctype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'eid': {
        type: 'f_literal',
        biblatex: 'eid'
    },
    'entrysubtype': {
        type: 'f_literal',
        biblatex: 'entrysubtype'
    },
    'eprint': {
        type: 'f_verbatim',
        biblatex: 'eprint'
    },
    'eprintclass': {
        type: 'f_literal',
        biblatex: 'eprintclass'
    },
    'eprinttype': {
        type: 'f_literal',
        biblatex: 'eprinttype'
    },
    'eventdate': {
        type: 'f_date',
        biblatex: 'eventdate',
        csl: 'event-date'
    },
    'eventtitle': {
        type: 'f_title',
        biblatex: 'eventtitle',
        csl: 'event'
    },
    'file': {
        type: 'f_verbatim',
        biblatex: 'file'
    },
    'foreword': {
        type: 'l_name',
        biblatex: 'foreword'
    },
    'holder': {
        type: 'l_name',
        biblatex: 'holder'
    },
    'howpublished': {
        type: 'f_literal',
        biblatex: 'howpublished',
        csl: 'medium'
    },
    'indextitle': {
        type: 'f_literal',
        biblatex: 'indextitle'
    },
    'institution': {
        type: 'l_literal',
        biblatex: 'institution'
    },
    'introduction': {
        type: 'l_name',
        biblatex: 'introduction'
    },
    'isan': {
        type: 'f_literal',
        biblatex: 'isan'
    },
    'isbn': {
        type: 'f_literal',
        biblatex: 'isbn',
        csl: 'ISBN'
    },
    'ismn': {
        type: 'f_literal',
        biblatex: 'ismn'
    },
    'isrn': {
        type: 'f_literal',
        biblatex: 'isrn'
    },
    'issn': {
        type: 'f_literal',
        biblatex: 'issn',
        csl: 'ISSN'
    },
    'issue': {
        type: 'f_literal',
        biblatex: 'issue',
        csl: 'issue'
    },
    'issuesubtitle': {
        type: 'f_literal',
        biblatex: 'issuesubtitle'
    },
    'issuetitle': {
        type: 'f_literal',
        biblatex: 'issuetitle'
    },
    'iswc': {
        type: 'f_literal',
        biblatex: 'iswc'
    },
    'journalsubtitle': {
        type: 'f_literal',
        biblatex: 'journalsubtitle'
    },
    'journaltitle': {
        type: 'f_literal',
        biblatex: 'journaltitle',
        csl: 'container-title'
    },
    'keywords': {
        type: 'l_tag',
        biblatex: 'keywords'
    },
    'label': {
        type: 'f_literal',
        biblatex: 'label'
    },
    'language': {
        type: 'l_key',
        biblatex: 'language',
        options: languageOptions
    },
    'langid': {
        type: 'f_key',
        strict: true, // Does not allow costum strings
        biblatex: 'langid',
        csl: 'language',
        options: langidOptions
    },
    'library': {
        type: 'f_literal',
        biblatex: 'library'
    },
    'location': {
        type: 'l_literal',
        biblatex: 'location',
        csl: 'publisher-place'
    },
    'mainsubtitle': {
        type: 'f_title',
        biblatex: 'mainsubtitle'
    },
    'maintitle': {
        type: 'f_title',
        biblatex: 'maintitle'
    },
    'maintitleaddon': {
        type: 'f_title',
        biblatex: 'maintitleaddon'
    },
    'nameaddon': {
        type: 'f_literal',
        biblatex: 'nameaddon'
    },
    'note': {
        type: 'f_literal',
        biblatex: 'note',
        csl: 'note'
    },
    'number': {
        type: 'f_literal',
        biblatex: 'number',
        csl: 'number'
    },
    'organization': {
        type: 'l_literal',
        biblatex: 'organization'
    },
    'origdate': {
        type: 'f_date',
        biblatex: 'origdate',
        csl: 'original-date'
    },
    'origlanguage': {
        type: 'f_key',
        biblatex: 'origlanguage',
        options: languageOptions
    },
    'origlocation': {
        type: 'l_literal',
        biblatex: 'origlocation',
        csl: 'original-publisher-place'
    },
    'origpublisher': {
        type: 'l_literal',
        biblatex: 'origpublisher',
        csl: 'original-publisher'
    },
    'origtitle': {
        type: 'f_title',
        biblatex: 'origtitle',
        csl: 'original-title'
    },
    'pages': {
        type: 'l_range',
        biblatex: 'pages',
        csl: 'page'
    },
    'pagetotal': {
        type: 'f_literal',
        biblatex: 'pagetotal',
        csl: 'number-of-pages'
    },
    'pagination': {
        type: 'f_key',
        biblatex: 'pagination',
        options: ['page', 'column', 'section', 'paragraph', 'verse', 'line']
    },
    'part': {
        type: 'f_literal',
        biblatex: 'part'
    },
    'publisher': {
        type: 'l_literal',
        biblatex: 'publisher',
        csl: 'publisher'
    },
    'pubstate': {
        type: 'f_key',
        biblatex: 'pubstate',
        csl: 'status',
        options: pubstateOptions
    },
    'reprinttitle': {
        type: 'f_literal',
        biblatex: 'reprinttitle'
    },
    'series': {
        type: 'f_literal',
        biblatex: 'series',
        csl: 'collection-title'
    },
    'shortauthor': {
        type: 'l_name',
        biblatex: 'shortauthor'
    },
    'shorteditor': {
        type: 'l_name',
        biblatex: 'shorteditor'
    },
    'shorthand': {
        type: 'f_literal',
        biblatex: 'shorthand'
    },
    'shorthandintro': {
        type: 'f_literal',
        biblatex: 'shorthandintro'
    },
    'shortjournal': {
        type: 'f_literal',
        biblatex: 'shortjournal',
        csl: 'container-title-short'
    },
    'shortseries': {
        type: 'f_literal',
        biblatex: 'shortseries'
    },
    'shorttitle': {
        type: 'f_literal',
        biblatex: 'shorttitle',
        csl: 'title-short'
    },
    'subtitle': {
        type: 'f_title',
        biblatex: 'subtitle'
    },
    'title': {
        type: 'f_title',
        biblatex: 'title',
        csl: 'title'
    },
    'titleaddon': {
        type: 'f_title',
        biblatex: 'titleaddon'
    },
    'translator': {
        type: 'l_name',
        biblatex: 'translator',
        csl: 'translator'
    },
    'type': {
        type: 'f_key',
        biblatex: 'type',
        options: ['manual', 'patent', 'report', 'thesis', 'mathesis', 'phdthesis', 'candthesis', 'techreport', 'resreport', 'software', 'datacd', 'audiocd']
    },
    'url': {
        type: 'f_uri',
        biblatex: 'url',
        csl: 'URL'
    },
    'urldate': {
        type: 'f_date',
        biblatex: 'urldate',
        csl: 'accessed'
    },
    'venue': {
        type: 'f_literal',
        biblatex: 'venue',
        csl: 'event-place'
    },
    'version': {
        type: 'f_literal',
        biblatex: 'version',
        csl: 'version'
    },
    'volume': {
        type: 'f_literal',
        biblatex: 'volume',
        csl: 'volume'
    },
    'volumes': {
        type: 'f_literal',
        biblatex: 'volumes',
        csl: 'number-of-volumes'
    }

    /** A list of all bib types and their fields. */
};var BibTypes = exports.BibTypes = {
    "article": {
        "order": 1,
        "biblatex": "article",
        "csl": "article",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pagination", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "article-magazine": {
        "order": 2,
        "biblatex": "article",
        "csl": "article-magazine",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pagination", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "article-newspaper": {
        "order": 3,
        "biblatex": "article",
        "csl": "article-newspaper",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pagination", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "article-journal": {
        "order": 4,
        "biblatex": "article",
        "csl": "article-journal",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pagination", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "post-weblog": {
        "order": 5,
        "biblatex": "online",
        "csl": "post-weblog",
        "required": ["date", "title", "url"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "pubstate", "subtitle", "language", "langid", "urldate", "titleaddon", "version", "note", "organization", "annotation", "keywords"]
    },
    "book": {
        "order": 10,
        "biblatex": "book",
        "csl": "book",
        "required": ["title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "pagetotal", "bookpagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "mvbook": {
        "order": 11,
        "biblatex": "mvbook",
        "csl": "book",
        "required": ["title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "note", "number", "origlanguage", "pagetotal", "bookpagination", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volumes", "annotation", "keywords"]
    },
    "inbook": {
        "order": 12,
        "biblatex": "inbook",
        "csl": "chapter",
        "required": ["title", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "bookauthor", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "bookinbook": {
        "order": 13,
        "biblatex": "bookinbook",
        "csl": "chapter",
        "required": ["title", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "bookauthor", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "suppbook": {
        "order": 14,
        "biblatex": "suppbook",
        "csl": "chapter",
        "required": ["title", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "bookauthor", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "booklet": {
        "order": 15,
        "biblatex": "booklet",
        "csl": "pamphlet",
        "required": ["title", "date"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "titleaddon", "addendum", "pages", "pagination", "howpublished", "type", "pubstate", "chapter", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "pagetotal", "bookpagination", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "collection": {
        "order": 20,
        "biblatex": "collection",
        "csl": "dataset",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "pagetotal", "bookpagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "mvcollection": {
        "order": 21,
        "biblatex": "mvcollection",
        "csl": "dataset",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "note", "number", "origlanguage", "pagetotal", "bookpagination", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volumes", "annotation", "keywords"]
    },
    "incollection": {
        "order": 22,
        "biblatex": "incollection",
        "csl": "entry",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "suppcollection": {
        "order": 23,
        "biblatex": "suppcollection",
        "csl": "entry",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "post": {
        "order": 30,
        "biblatex": "online",
        "csl": "post",
        "required": ["date", "title", "url"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "pubstate", "subtitle", "language", "langid", "urldate", "titleaddon", "version", "note", "organization", "annotation", "keywords"]
    },
    "manual": {
        "order": 40,
        "biblatex": "manual",
        "csl": "book",
        "required": ["title", "date"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "chapter", "doi", "edition", "eprint", "eprintclass", "eprinttype", "isbn", "language", "langid", "location", "note", "number", "organization", "pages", "pagination", "pagetotal", "bookpagination", "publisher", "pubstate", "series", "subtitle", "titleaddon", "type", "url", "urldate", "version", "annotation", "keywords"]
    },
    "misc": {
        "order": 41,
        "biblatex": "misc",
        "csl": "entry",
        "required": ["title", "date"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "howpublished", "type", "pubstate", "organization", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "version", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "online": {
        "order": 42,
        "biblatex": "online",
        "csl": "webpage",
        "required": ["date", "title", "url"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "pubstate", "subtitle", "language", "langid", "urldate", "titleaddon", "version", "note", "organization", "annotation", "keywords"]
    },
    "patent": {
        "order": 43,
        "biblatex": "patent",
        "csl": "patent",
        "required": ["title", "number", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "holder", "location", "pubstate", "doi", "subtitle", "titleaddon", "type", "url", "urldate", "version", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "periodical": {
        "order": 50,
        "biblatex": "periodical",
        "csl": "book",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "volume", "pubstate", "number", "series", "issn", "issue", "issuesubtitle", "issuetitle", "doi", "subtitle", "editora", "editorb", "editorc", "url", "urldate", "language", "langid", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "suppperiodical": {
        "order": 51,
        "biblatex": "suppperiodical",
        "csl": "entry",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pagination", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "proceedings": {
        "order": 60,
        "biblatex": "proceedings",
        "csl": "entry",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "chapter", "doi", "eprint", "eprintclass", "eprinttype", "eventdate", "eventtitle", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "organization", "pages", "pagination", "pagetotal", "bookpagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "url", "urldate", "venue", "volume", "volumes", "annotation", "keywords"]
    },
    "mvproceedings": {
        "order": 61,
        "biblatex": "mvproceedings",
        "csl": "entry",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "doi", "eprint", "eprintclass", "eprinttype", "eventdate", "eventtitle", "isbn", "language", "langid", "location", "note", "number", "organization", "pagetotal", "bookpagination", "publisher", "pubstate", "series", "subtitle", "titleaddon", "url", "urldate", "venue", "volumes", "annotation", "keywords"]
    },
    "inproceedings": {
        "order": 62,
        "biblatex": "inproceedings",
        "csl": "paper-conference",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "booksubtitle", "booktitleaddon", "chapter", "doi", "eprint", "eprintclass", "eprinttype", "eventdate", "eventtitle", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "organization", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "url", "urldate", "venue", "volume", "volumes", "annotation", "keywords"]
    },
    "reference": {
        "order": 70,
        "biblatex": "book",
        "csl": "reference",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "pagetotal", "bookpagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "mvreference": {
        "order": 71,
        "biblatex": "mvreference",
        "csl": "book",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "note", "number", "origlanguage", "pagetotal", "bookpagination", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volumes", "annotation", "keywords"]
    },
    "inreference": {
        "order": 72,
        "biblatex": "inreference",
        "csl": "entry",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "entry-encyclopedia": {
        "order": 73,
        "biblatex": "inreference",
        "csl": "entry-encyclopedia",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "entry-dictionary": {
        "order": 74,
        "biblatex": "inreference",
        "csl": "entry-dictionary",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagination", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "report": {
        "order": 80,
        "biblatex": "report",
        "csl": "report",
        "required": ["author", "title", "type", "institution", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "pages", "pagination", "pagetotal", "bookpagination", "pubstate", "number", "isrn", "chapter", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "version", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "thesis": {
        "order": 81,
        "biblatex": "thesis",
        "csl": "thesis",
        "required": ["author", "title", "type", "institution", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "pages", "pagination", "pagetotal", "bookpagination", "pubstate", "isbn", "chapter", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "unpublished": {
        "order": 90,
        "biblatex": "unpublished",
        "csl": "manuscript",
        "required": ["title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "howpublished", "pubstate", "isbn", "date", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "note", "annotation", "keywords"]
    }
};

/***/ }),
/* 41 */,
/* 42 */
/*!*********************************!*\
  !*** ./bibtex/reference.coffee ***!
  \*********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {


/* XRegExp = require('xregexp') */
var Exporter, Language, Reference, XRegExp, debug, text2latex,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  hasProp = {}.hasOwnProperty;

XRegExp = Zotero.Utilities.XRegExp;

debug = __webpack_require__(/*! ../lib/debug.coffee */ 0);

Exporter = __webpack_require__(/*! ../lib/exporter.coffee */ 6);

text2latex = __webpack_require__(/*! ./unicode_translator.coffee */ 43).text2latex;


/*
 * h1 Global object: Translator
 *
 * The global Translator object allows access to the current configuration of the translator
 *
 * @param {enum} caseConversion whether titles should be title-cased and case-preserved
 * @param {boolean} bibtexURL set to true when BBT will generate \url{..} around the urls for BibTeX
 */


/*
 * h1 class: Reference
 *
 * The Bib(La)TeX references are generated by the `Reference` class. Before being comitted to the cache, you can add
 * postscript code that can manipulated the `fields` or the `referencetype`
 *
 * @param {Array} @fields Array of reference fields
 * @param {String} @referencetype referencetype
 * @param {Object} @item the current Zotero item being converted
 */


/*
 * The fields are objects with the following keys:
 *   * name: name of the Bib(La)TeX field
 *   * value: the value of the field
 *   * bibtex: the LaTeX-encoded value of the field
 *   * enc: the encoding to use for the field
 */

Reference = (function() {
  function Reference(item1) {
    var base, langlc, ref1, ref2, ref3, sim;
    this.item = item1;
    (base = Reference.prototype).Exporter || (base.Exporter = new Exporter());
    this.fields = [];
    this.has = Object.create(null);
    this.raw = (ref1 = Translator.preferences.rawLaTag, indexOf.call(this.item.tags, ref1) >= 0);
    this.data = {
      DeclarePrefChars: ''
    };
    if (!this.item.language) {
      this.english = true;
      debug('detecting language: defaulting to english');
    } else {
      langlc = this.item.language.toLowerCase();
      this.language = Language.babelMap[langlc.replace(/[^a-z0-9]/, '_')];
      this.language || (this.language = Language.babelMap[langlc.replace(/-[a-z]+$/i, '').replace(/[^a-z0-9]/, '_')]);
      this.language || (this.language = Language.fromPrefix(langlc));
      debug('detecting language:', {
        langlc: langlc,
        language: this.language
      });
      if (this.language) {
        this.language = this.language[0];
      } else {
        sim = Language.lookup(langlc);
        if (sim[0].sim >= 0.9) {
          this.language = sim[0].lang;
        } else {
          this.language = this.item.language;
        }
      }
      this.english = (ref2 = this.language) === 'american' || ref2 === 'british' || ref2 === 'canadian' || ref2 === 'english' || ref2 === 'australian' || ref2 === 'newzealand' || ref2 === 'USenglish' || ref2 === 'UKenglish';
      debug('detected language:', {
        language: this.language,
        english: this.english
      });
    }
    this.override = this.Exporter.extractFields(this.item);
    this.item.__type__ = this.item.cslType || this.item.itemType;
    debug('postextract: item:', this.item);
    debug('postextract: overrides:', this.override);
    this.referencetype = this.typeMap.csl[this.item.cslType] || this.typeMap.zotero[this.item.itemType] || 'misc';
    if (this.referencetype.type) {
      if (this.referencetype.subtype) {
        this.add({
          entrysubtype: this.referencetype.subtype
        });
      }
      this.referencetype = this.referencetype.type;
    }
    if (Translator.preferences.testing) {
      debug('ignoring timestamp', this.item.dateModified || this.item.dateAdded, 'for testing');
      this.add({
        name: 'timestamp',
        value: '2015-02-24 12:14:36 +0100'
      });
    } else {
      this.add({
        name: 'timestamp',
        value: this.item.dateModified || this.item.dateAdded
      });
    }
    switch (false) {
      case !(((ref3 = (this.item.libraryCatalog || '').toLowerCase()) === 'arxiv.org' || ref3 === 'arxiv') && (this.item.arXiv = this.arXiv.parse(this.item.publicationTitle))):
        this.item.arXiv.source = 'publicationTitle';
        if (Translator.BetterBibLaTeX) {
          delete this.item.publicationTitle;
        }
        break;
      case !(this.override.arxiv && (this.item.arXiv = this.arXiv.parse('arxiv:' + this.override.arxiv.value))):
        this.item.arXiv.source = 'extra';
    }
    if (this.item.arXiv) {
      this.add({
        archivePrefix: 'arXiv'
      });
      this.add({
        eprinttype: 'arxiv'
      });
      this.add({
        eprint: this.item.arXiv.eprint
      });
      if (this.item.arXiv.primaryClass) {
        this.add({
          primaryClass: this.item.arXiv.primaryClass
        });
      }
      delete this.override.arxiv;
    }
  }

  Reference.prototype.arXiv = {
    "new": /^arxiv:([0-9]{4}\.[0-9]+)(v[0-9]+)?([^\S\n]+\[(.*)\])?$/i,
    old: /^arxiv:([a-z]+-[a-z]+\/[0-9]{7})(v[0-9]+)?([^\S\n]+\[(.*)\])?$/i,
    bare: /^arxiv:[^\S\n]*([\S]+)/i,
    parse: function(id) {
      var m;
      if (!id) {
        return void 0;
      }
      if (m = this["new"].exec(id)) {
        return {
          id: id,
          eprint: m[1],
          primaryClass: m[4]
        };
      }
      if (m = this.old.exec(id)) {
        return {
          id: id,
          eprint: m[1],
          primaryClass: m[4]
        };
      }
      if (m = this.bare.exec(id)) {
        return {
          id: id,
          eprint: m[1]
        };
      }
      return void 0;
    }
  };


  /*
   * Return a copy of the given `field` with a new value
   *
   * @param {field} field to be cloned
   * @param {value} value to be assigned
   * @return {Object} copy of field settings with new value
   */

  Reference.prototype.clone = function(f, value) {
    var clone;
    clone = JSON.parse(JSON.stringify(f));
    delete clone.bibtex;
    clone.value = value;
    return clone;
  };


  /*
   * 'Encode' to raw LaTeX value
   *
   * @param {field} field to encode
   * @return {String} unmodified `field.value`
   */

  Reference.prototype.enc_raw = function(f) {
    return f.value;
  };


  /*
   * Encode to date
   *
   * @param {field} field to encode
   * @return {String} unmodified `field.value`
   */

  Reference.prototype.isodate = function(date) {
    var iso, ref1;
    if (!(date && date.year && ((ref1 = date.type) === 'date' || ref1 === 'season'))) {
      return null;
    }
    iso = '' + date.year;
    if (date.month) {
      iso += '-' + ('0' + date.month).slice(-2);
      if (date.day) {
        iso += '-' + ('0' + date.day).slice(-2);
      }
    }
    return iso;
  };

  Reference.prototype.enc_date = function(f) {
    var date, enddate, parsed, value;
    if (!f.value) {
      return null;
    }
    value = f.value;
    if (typeof f.value === 'string') {
      parsed = Zotero.BetterBibTeX.parseDate(value, this.item.language);
    }
    if (parsed.type === 'verbatim') {
      if (f.value === 'n.d.') {
        return '\\bibstring{nodate}';
      }
      return this.enc_latex(this.clone(f, f.value));
    }
    date = this.isodate(parsed.from || parsed);
    if (!date) {
      return null;
    }
    if (parsed.to) {
      enddate = this.isodate(parsed.to);
      if (enddate) {
        date += "/" + enddate;
      }
    }
    return this.enc_latex({
      value: date
    });
  };


  /*
   * Encode to LaTeX url
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping). If in Better BibTeX, wraps return value in `\url{string}`
   */

  Reference.prototype.enc_url = function(f) {
    var value;
    value = this.enc_verbatim(f);
    if (Translator.BetterBibTeX) {
      return "\\url{" + (this.enc_verbatim(f)) + "}";
    } else {
      return value;
    }
  };


  /*
   * Encode to verbatim LaTeX
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping).
   */

  Reference.prototype.enc_verbatim = function(f) {
    return this.toVerbatim(f.value);
  };

  Reference.prototype.nonLetters = new XRegExp("[^\\p{Letter}]", 'g');

  Reference.prototype.punctuationAtEnd = new XRegExp("[\\p{Punctuation}]$");

  Reference.prototype.startsWithLowercase = new XRegExp("^[\\p{Ll}]");

  Reference.prototype.hasLowercaseWord = new XRegExp("\\s[\\p{Ll}]");

  Reference.prototype._enc_creators_pad_particle = function(particle, relax) {
    if (particle[particle.length - 1] === ' ') {
      return particle;
    }
    if (Translator.BetterBibLaTeX) {
      if (XRegExp.test(particle, this.punctuationAtEnd)) {
        this.data.DeclarePrefChars += particle[particle.length - 1];
      }
      return particle + ' ';
    }
    if (particle[particle.length - 1] === '.') {
      return particle + ' ';
    }
    if (XRegExp.test(particle, this.punctuationAtEnd)) {
      if (relax) {
        return particle + this._enc_creators_relax_marker + ' ';
      }
      return particle;
    }
    return particle + ' ';
  };

  Reference.prototype._enc_creators_quote_separators = function(value) {
    var i, n;
    return (function() {
      var j, len, ref1, results;
      ref1 = value.split(/(\s+and\s+|,)/i);
      results = [];
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        n = ref1[i];
        results.push(i % 2 === 0 ? n : new String(n));
      }
      return results;
    })();
  };

  Reference.prototype._enc_creators_biblatex = function(name) {
    var family, initials, latex;
    if (name.family.length > 1 && name.family[0] === '"' && name.family[name.family.length - 1] === '"') {
      family = new String(name.family.slice(1, -1));
    } else {
      family = name.family;
    }
    initials = (name.given || '').indexOf(this._enc_creators_initials_marker);
    if (Translator.preferences.biblatexExtendedNameFormat && (name['dropping-particle'] || name['non-dropping-particle'] || name['comma-suffix'])) {
      if (initials >= 0) {
        initials = name.given.substring(0, initials);
        if (initials.length > 1) {
          initials = new String(initials);
        }
        name.given = name.given.replace(this._enc_creators_initials_marker, '');
      } else {
        initials = '';
      }
      latex = [];
      if (family) {
        latex.push('family=' + this.enc_latex({
          value: family
        }));
      }
      if (name.given) {
        latex.push('given=' + this.enc_latex({
          value: name.given
        }));
      }
      if (initials) {
        latex.push('given-i=' + this.enc_latex({
          value: initials
        }));
      }
      if (name.suffix) {
        latex.push('suffix=' + this.enc_latex({
          value: name.suffix
        }));
      }
      if (name['dropping-particle'] || name['non-dropping-particle']) {
        latex.push('prefix=' + this.enc_latex({
          value: name['dropping-particle'] || name['non-dropping-particle']
        }));
        latex.push('useprefix=' + !!name['non-dropping-particle']);
      }
      if (name['comma-suffix']) {
        latex.push('juniorcomma=true');
      }
      return latex.join(', ');
    }
    if (family && XRegExp.test(family, this.startsWithLowercase)) {
      family = new String(family);
    }
    if (family) {
      family = this.enc_latex({
        value: family
      });
    }
    if (initials >= 0) {
      name.given = '<span relax="true">' + name.given.replace(this._enc_creators_initials_marker, '</span>');
    }
    latex = '';
    if (name['dropping-particle']) {
      latex += this.enc_latex({
        value: this._enc_creators_pad_particle(name['dropping-particle'])
      });
    }
    if (name['non-dropping-particle']) {
      latex += this.enc_latex({
        value: this._enc_creators_pad_particle(name['non-dropping-particle'])
      });
    }
    if (family) {
      latex += family;
    }
    if (name.suffix) {
      latex += ', ' + this.enc_latex({
        value: name.suffix
      });
    }
    if (name.given) {
      latex += ', ' + this.enc_latex({
        value: name.given
      });
    }
    return latex;
  };

  Reference.prototype._enc_creators_bibtex = function(name) {
    var family, latex;
    if (name.family.length > 1 && name.family[0] === '"' && name.family[name.family.length - 1] === '"') {
      family = new String(name.family.slice(1, -1));
    } else {
      family = name.family;
    }
    if (name.given && name.given.indexOf(this._enc_creators_initials_marker) >= 0) {
      name.given = '<span relax="true">' + name.given.replace(this._enc_creators_initials_marker, '</span>');
    }

    /*
      TODO: http://chat.stackexchange.com/rooms/34705/discussion-between-retorquere-and-egreg
    
      My advice is never using the alpha style; it's a relic of the past, when numbering citations was very difficult
      because one didn't know the full citation list when writing a paper. In order to have the bibliography in
      alphabetical order, such tricks were devised. The alternative was listing the citation in order of appearance.
      Your document gains nothing with something like XYZ88 as citation key.
    
      The “van” problem should be left to the bibliographic style. Some styles consider “van” as part of the name, some
      don't. In any case, you'll have a kludge, mostly unportable. However, if you want van Gogh to be realized as vGo
      in the label, use {\relax van} Gogh or something like this.
     */
    if (name['non-dropping-particle']) {
      family = new String(this._enc_creators_pad_particle(name['non-dropping-particle']) + family);
    }
    if (XRegExp.test(family, this.startsWithLowercase) || XRegExp.test(family, this.hasLowercaseWord)) {
      family = new String(family);
    }
    family = this.enc_latex({
      value: family
    });
    if (name['dropping-particle']) {
      family = this.enc_latex({
        value: this._enc_creators_pad_particle(name['dropping-particle'], true)
      }) + family;
    }
    if (Translator.BetterBibTeX && Translator.preferences.bibtexParticleNoOp && (name['non-dropping-particle'] || name['dropping-particle'])) {
      family = '{\\noopsort{' + this.enc_latex({
        value: name.family.toLowerCase()
      }) + '}}' + family;
      this.Exporter.preamble.noopsort = true;
    }
    if (name.given) {
      name.given = this.enc_latex({
        value: name.given
      });
    }
    if (name.suffix) {
      name.suffix = this.enc_latex({
        value: name.suffix
      });
    }
    latex = family;
    if (name.suffix) {
      latex += ", " + name.suffix;
    }
    if (name.given) {
      latex += ", " + name.given;
    }
    return latex;
  };


  /*
   * Encode creators to author-style field
   *
   * @param {field} field to encode. The 'value' must be an array of Zotero-serialized `creator` objects.
   * @return {String} field.value encoded as author-style value
   */

  Reference.prototype._enc_creators_initials_marker = '\u0097';

  Reference.prototype._enc_creators_relax_marker = '\u200C';

  Reference.prototype.enc_creators = function(f, raw) {
    var creator, encoded, j, len, name, ref1;
    if (f.value.length === 0) {
      return null;
    }
    encoded = [];
    ref1 = f.value;
    for (j = 0, len = ref1.length; j < len; j++) {
      creator = ref1[j];
      switch (false) {
        case !(creator.name || (creator.lastName && creator.fieldMode === 1)):
          name = raw ? "{" + (creator.name || creator.lastName) + "}" : this.enc_latex({
            value: new String(creator.name || creator.lastName)
          });
          break;
        case !raw:
          name = [creator.lastName || '', creator.firstName || ''].join(', ');
          break;
        case !(creator.lastName || creator.firstName):
          name = {
            family: creator.lastName || '',
            given: creator.firstName || ''
          };
          if (Translator.preferences.parseParticles) {
            Zotero.BetterBibTeX.parseParticles(name);
          }
          if (!(Translator.BetterBibLaTeX && Translator.preferences.biblatexExtendedNameFormat)) {
            this.useprefix || (this.useprefix = !!name['non-dropping-particle']);
            this.juniorcomma || (this.juniorcomma = f.juniorcomma && name['comma-suffix']);
          }
          if (Translator.BetterBibTeX) {
            name = this._enc_creators_bibtex(name);
          } else {
            name = this._enc_creators_biblatex(name);
          }
          break;
        default:
          continue;
      }
      encoded.push(name.trim());
    }
    return encoded.join(' and ');
  };


  /*
   * Encode text to LaTeX literal list (double-braced)
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */

  Reference.prototype.enc_literal = function(f) {
    return this.enc_latex({
      value: new String(f.value)
    });
  };


  /*
   * Encode text to LaTeX
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */

  Reference.prototype.enc_latex = function(f, raw) {
    var caseConversion, value, word;
    debug('enc_latex:', {
      f: f,
      raw: raw,
      english: this.english
    });
    if (typeof f.value === 'number') {
      return f.value;
    }
    if (!f.value) {
      return null;
    }
    if (Array.isArray(f.value)) {
      if (f.value.length === 0) {
        return null;
      }
      return ((function() {
        var j, len, ref1, results;
        ref1 = f.value;
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          word = ref1[j];
          results.push(this.enc_latex(this.clone(f, word), raw));
        }
        return results;
      }).call(this)).join(f.sep || '');
    }
    if (f.raw || raw) {
      return f.value;
    }
    caseConversion = this.caseConversion[f.name] || f.caseConversion;
    value = text2latex(f.value, {
      mode: (f.html ? 'html' : 'text'),
      caseConversion: caseConversion && this.english
    });
    if (caseConversion && Translator.BetterBibTeX && !this.english) {
      value = "{" + value + "}";
    }
    if (f.value instanceof String) {
      value = new String("{" + value + "}");
    }
    return value;
  };

  Reference.prototype.enc_tags = function(f) {
    var balanced, ch, tag, tags;
    tags = (function() {
      var j, len, ref1, results;
      ref1 = f.value || [];
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        tag = ref1[j];
        if (tag && tag !== Translator.preferences.rawLaTag) {
          results.push(tag);
        }
      }
      return results;
    })();
    if (tags.length === 0) {
      return null;
    }
    if (Translator.preferences.testing) {
      tags.sort();
    }
    debug('enc_tags:', tags);
    tags = (function() {
      var j, l, len, len1, results;
      results = [];
      for (j = 0, len = tags.length; j < len; j++) {
        tag = tags[j];
        if (Translator.BetterBibTeX) {
          tag = tag.replace(/([#\\%&])/g, '\\$1');
        } else {
          tag = tag.replace(/([#%\\])/g, '\\$1');
        }
        tag = tag.replace(/,/g, ';');
        balanced = 0;
        for (l = 0, len1 = tag.length; l < len1; l++) {
          ch = tag[l];
          switch (ch) {
            case '{':
              balanced += 1;
              break;
            case '}':
              balanced -= 1;
          }
          if (balanced < 0) {
            break;
          }
        }
        if (balanced !== 0) {
          tag = tag.replace(/{/g, '(').replace(/}/g, ')');
        }
        results.push(tag);
      }
      return results;
    })();
    return tags.join(',');
  };

  Reference.prototype.enc_attachments = function(f) {
    var att, attachment, attachments, errors, j, len, part, ref1;
    if (!f.value || f.value.length === 0) {
      return null;
    }
    attachments = [];
    errors = [];
    ref1 = f.value;
    for (j = 0, len = ref1.length; j < len; j++) {
      attachment = ref1[j];
      att = {
        title: attachment.title,
        mimetype: attachment.contentType || '',
        path: attachment.defaultPath || attachment.localPath
      };
      if (!att.path) {
        continue;
      }
      att.path = att.path.replace(/(?:\s*[{}]+)+\s*/g, ' ');
      if (Translator.options.exportFileData && attachment.saveFile && attachment.defaultPath) {
        attachment.saveFile(att.path, true);
      }
      att.title || (att.title = att.path.replace(/.*[\\\/]/, '') || 'attachment');
      if (!att.mimetype && att.path.slice(-4).toLowerCase() === '.pdf') {
        att.mimetype = 'application/pdf';
      }
      switch (false) {
        case !Translator.preferences.testing:
          this.Exporter.attachmentCounter += 1;
          att.path = "files/" + this.Exporter.attachmentCounter + "/" + (att.path.replace(/.*[\/\\]/, ''));
          break;
        case !(Translator.options.exportPath && att.path.indexOf(Translator.options.exportPath) === 0):
          att.path = att.path.slice(Translator.options.exportPath.length);
      }
      attachments.push(att);
    }
    if (errors.length !== 0) {
      f.errors = errors;
    }
    if (attachments.length === 0) {
      return null;
    }
    attachments.sort(function(a, b) {
      if (a.mimetype === 'text/html' && b.mimetype !== 'text/html') {
        return 1;
      }
      if (b.mimetype === 'text/html' && a.mimetype !== 'text/html') {
        return -1;
      }
      return a.path.localeCompare(b.path);
    });
    if (Translator.preferences.attachmentsNoMetadata) {
      return ((function() {
        var l, len1, results;
        results = [];
        for (l = 0, len1 = attachments.length; l < len1; l++) {
          att = attachments[l];
          results.push(att.path.replace(/([\\{};])/g, "\\$1"));
        }
        return results;
      })()).join(';');
    }
    return ((function() {
      var l, len1, results;
      results = [];
      for (l = 0, len1 = attachments.length; l < len1; l++) {
        att = attachments[l];
        results.push(((function() {
          var len2, o, ref2, results1;
          ref2 = [att.title, att.path, att.mimetype];
          results1 = [];
          for (o = 0, len2 = ref2.length; o < len2; o++) {
            part = ref2[o];
            results1.push(part.replace(/([\\{}:;])/g, "\\$1"));
          }
          return results1;
        })()).join(':'));
      }
      return results;
    })()).join(';');
  };

  Reference.prototype.isBibVarRE = /^[a-z][a-z0-9_]*$/i;

  Reference.prototype.isBibVar = function(value) {
    return Translator.preferences.preserveBibTeXVariables && value && typeof value === 'string' && this.isBibVarRE.test(value);
  };


  /*
   * Add a field to the reference field set
   *
   * @param {field} field to add. 'name' must be set, and either 'value' or 'bibtex'. If you set 'bibtex', BBT will trust
   *   you and just use that as-is. If you set 'value', BBT will escape the value according the encoder passed in 'enc'; no
   *   'enc' means 'enc_latex'. If you pass both 'bibtex' and 'latex', 'bibtex' takes precedence (and 'value' will be
   *   ignored)
   */

  Reference.prototype.add = function(field) {
    var enc, keys, value;
    if (!field.name) {
      keys = Object.keys(field);
      switch (keys.length) {
        case 0:
          return;
        case 1:
          field = {
            name: keys[0],
            value: field[keys[0]]
          };
          break;
        default:
          throw "Quick-add mode expects exactly one name -> value mapping, found " + (JSON.stringify(field)) + " (" + (new Error()).stack + ")";
      }
    }
    if (!field.bibtex) {
      if (typeof field.value !== 'number' && !field.value) {
        return;
      }
      if (typeof field.value === 'string' && field.value.trim() === '') {
        return;
      }
      if (Array.isArray(field.value) && field.value.length === 0) {
        return;
      }
    }
    if (field.replace) {
      this.remove(field.name);
    }
    if (this.has[field.name] && !field.allowDuplicates) {
      throw "duplicate field '" + field.name + "' for " + this.item.citekey;
    }
    if (!field.bibtex) {
      debug('add:', {
        field: field,
        preserve: Translator.preferences.preserveBibTeXVariables,
        match: this.isBibVar(field.value)
      });
      if (typeof field.value === 'number' || (field.preserveBibTeXVariables && this.isBibVar(field.value))) {
        value = '' + field.value;
      } else {
        enc = field.enc || this.fieldEncoding[field.name] || 'latex';
        value = this["enc_" + enc](field, this.raw);
        if (!value) {
          return;
        }
        if (!(field.bare && !field.value.match(/\s/))) {
          value = "{" + value + "}";
        }
      }
      value = value.replace(/{}$/, '');
      field.bibtex = "" + value;
    }
    this.fields.push(field);
    this.has[field.name] = field;
    debug('added:', field);
  };


  /*
   * Remove a field from the reference field set
   *
   * @param {name} field to remove.
   * @return {Object} the removed field, if present
   */

  Reference.prototype.remove = function(name) {
    var field, removed;
    if (!this.has[name]) {
      return;
    }
    debug('remove field', name);
    removed = this.has[name];
    delete this.has[name];
    this.fields = (function() {
      var j, len, ref1, results;
      ref1 = this.fields;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        field = ref1[j];
        if (field.name !== name) {
          results.push(field);
        }
      }
      return results;
    }).call(this);
    return removed;
  };

  Reference.prototype.normalize = typeof ''.normalize === 'function';

  Reference.prototype.postscript = function(reference, item) {};

  Reference.prototype.complete = function() {
    var cslvar, err, field, fields, groups, j, key, l, len, len1, mapped, name, qr, ref, ref1, ref2, ref3, value;
    if (Translator.preferences.DOIandURL !== 'both') {
      if (this.has.doi && this.has.url) {
        debug('removing', (ref1 = Translator.preferences.DOIandURL === 'doi') != null ? ref1 : {
          'url': 'doi'
        });
        switch (Translator.preferences.DOIandURL) {
          case 'doi':
            this.remove('url');
            break;
          case 'url':
            this.remove('doi');
        }
      }
    }
    if ((this.item.collections || []).length && Translator.preferences.jabrefGroups === 4) {
      groups = (function() {
        var j, len, ref2, results;
        ref2 = this.item.collections;
        results = [];
        for (j = 0, len = ref2.length; j < len; j++) {
          key = ref2[j];
          if (this.Exporter.collections[key]) {
            results.push(this.Exporter.collections[key].name);
          }
        }
        return results;
      }).call(this);
      groups = groups.sort().filter(function(item, pos, ary) {
        return !pos || item !== ary[pos - 1];
      });
      this.add({
        groups: groups.join(',')
      });
    }
    fields = [];
    ref2 = this.override;
    for (name in ref2) {
      if (!hasProp.call(ref2, name)) continue;
      value = ref2[name];
      if (name === 'referencetype') {
        this.referencetype = value.value;
        continue;
      }
      if (name === 'PMID' || name === 'PMCID') {
        value.format = 'key-value';
        name = name.toLowerCase();
      }
      if (value.format === 'csl') {
        cslvar = this.Exporter.CSLVariables[name];
        mapped = cslvar[(Translator.BetterBibLaTeX ? 'BibLaTeX' : 'BibTeX')];
        if (typeof mapped === 'function') {
          mapped = mapped.call(this);
        }
        if (mapped) {
          fields.push({
            name: mapped,
            value: value.value,
            raw: false,
            enc: (cslvar.type === 'creator' ? 'creators' : cslvar.type)
          });
        } else {
          debug('Unmapped CSL field', name, '=', value.value);
        }
      } else {
        switch (name) {
          case 'mr':
            fields.push({
              name: 'mrnumber',
              value: value.value,
              raw: value.raw
            });
            break;
          case 'zbl':
            fields.push({
              name: 'zmnumber',
              value: value.value,
              raw: value.raw
            });
            break;
          case 'lccn':
          case 'pmcid':
            fields.push({
              name: name,
              value: value.value,
              raw: value.raw
            });
            break;
          case 'pmid':
          case 'arxiv':
          case 'jstor':
          case 'hdl':
            if (Translator.BetterBibLaTeX) {
              fields.push({
                name: 'eprinttype',
                value: name.toLowerCase()
              });
              fields.push({
                name: 'eprint',
                value: value.value,
                raw: value.raw
              });
            } else {
              fields.push({
                name: name,
                value: value.value,
                raw: value.raw
              });
            }
            break;
          case 'googlebooksid':
            if (Translator.BetterBibLaTeX) {
              fields.push({
                name: 'eprinttype',
                value: 'googlebooks'
              });
              fields.push({
                name: 'eprint',
                value: value.value,
                raw: value.raw
              });
            } else {
              fields.push({
                name: 'googlebooks',
                value: value.value,
                raw: value.raw
              });
            }
            break;
          case 'xref':
            fields.push({
              name: name,
              value: value.value,
              raw: value.raw
            });
            break;
          default:
            debug('fields.push', {
              name: name,
              value: value.value,
              raw: value.raw
            });
            fields.push({
              name: name,
              value: value.value,
              raw: value.raw
            });
        }
      }
    }
    for (j = 0, len = fields.length; j < len; j++) {
      field = fields[j];
      name = field.name.split('.');
      if (name.length > 1) {
        if (this.referencetype !== name[0]) {
          continue;
        }
        field.name = name[1];
      }
      if ((typeof field.value === 'string') && field.value.trim() === '') {
        this.remove(field.name);
        continue;
      }
      field.replace = true;
      this.add(field);
    }
    if (this.fields.length === 0) {
      this.add({
        name: 'type',
        value: this.referencetype
      });
    }
    try {
      this.postscript(this, this.item);
    } catch (error) {
      err = error;
      debug('Reference.postscript failed:', err);
    }
    ref3 = Translator.preferences.skipFields;
    for (l = 0, len1 = ref3.length; l < len1; l++) {
      name = ref3[l];
      this.remove(name);
    }
    if (Translator.preferences.testing) {
      this.fields.sort(function(a, b) {
        return (a.name + " = " + a.value).localeCompare(b.name + " = " + b.value);
      });
    }
    ref = "@" + this.referencetype + "{" + this.item.citekey + ",\n";
    ref += ((function() {
      var len2, o, ref4, results;
      ref4 = this.fields;
      results = [];
      for (o = 0, len2 = ref4.length; o < len2; o++) {
        field = ref4[o];
        results.push("  " + field.name + " = " + field.bibtex);
      }
      return results;
    }).call(this)).join(',\n');
    ref += '\n}\n';
    if (qr = this.qualityReport()) {
      ref += "% Quality Report for " + this.item.citekey + ":\n" + qr + "\n";
    }
    ref += "\n";
    Zotero.write(ref);
    this.data.DeclarePrefChars = this.Exporter.unique_chars(this.data.DeclarePrefChars);
    Zotero.BetterBibTeX.cacheStore(this.item.itemID, Translator.options, ref, this.data);
    if (this.data.DeclarePrefChars) {
      this.Exporter.preamble.DeclarePrefChars += this.data.DeclarePrefChars;
    }
    debug('item.complete:', {
      data: this.data,
      preamble: this.Exporter.preamble
    });
  };

  Reference.prototype.toVerbatim = function(text) {
    var value;
    if (Translator.BetterBibTeX) {
      value = ('' + text).replace(/([#\\%&{}])/g, '\\$1');
    } else {
      value = ('' + text).replace(/([\\{}])/g, '\\$1');
    }
    if (!this.Exporter.unicode) {
      value = value.replace(/[^\x21-\x7E]/g, (function(chr) {
        return '\\%' + ('00' + chr.charCodeAt(0).toString(16).slice(-2));
      }));
    }
    return value;
  };

  Reference.prototype.hasCreator = function(type) {
    return (this.item.creators || []).some(function(creator) {
      return creator.creatorType === type;
    });
  };

  Reference.prototype.qualityReport = function() {
    var field, fields, j, len, option, options, report, titleCased;
    if (!Translator.preferences.qualityReport) {
      return '';
    }
    fields = this.requiredFields[this.referencetype.toLowerCase()];
    if (!fields) {
      return "% I don't know how to check " + this.referencetype;
    }
    report = [];
    for (j = 0, len = fields.length; j < len; j++) {
      field = fields[j];
      options = field.split('/');
      if (((function() {
        var l, len1, results;
        results = [];
        for (l = 0, len1 = options.length; l < len1; l++) {
          option = options[l];
          if (this.has[option]) {
            results.push(option);
          }
        }
        return results;
      }).call(this)).length === 0) {
        report.push("% Missing required field " + field);
      }
    }
    if (this.referencetype === 'proceedings' && this.has.pages) {
      report.push("% Proceedings with page numbers -- maybe his reference should be an 'inproceedings'");
    }
    if (this.referencetype === 'article' && this.has.journal) {
      if (Translator.BetterBibLaTeX) {
        report.push("% BibLaTeX uses journaltitle, not journal");
      }
      if (this.has.journal.value.indexOf('.') >= 0) {
        report.push("% ? Abbreviated journal title " + this.has.journal.value);
      }
    }
    if (this.referencetype === 'article' && this.has.journaltitle) {
      if (this.has.journaltitle.value.indexOf('.') >= 0) {
        report.push("% ? Abbreviated journal title " + this.has.journaltitle.value);
      }
    }
    if (this.referencetype === 'inproceedings' && this.has.booktitle) {
      if (!this.has.booktitle.value.match(/:|Proceedings|Companion| '/) || this.has.booktitle.value.match(/\.|workshop|conference|symposium/)) {
        report.push("% ? Unsure about the formatting of the booktitle");
      }
    }
    if (this.has.title && !Translator.preferences.suppressTitleCase) {
      titleCased = Zotero.BetterBibTeX.titleCase(this.has.title.value) === this.has.title.value;
      if (this.has.title.value.match(/\s/)) {
        if (titleCased) {
          report.push("% ? Title looks like it was stored in title-case in Zotero");
        }
      } else {
        if (!titleCased) {
          report.push("% ? Title looks like it was stored in lower-case in Zotero");
        }
      }
    }
    return report.join("\n");
  };

  return Reference;

})();

Language = new ((function() {
  function _Class() {
    var j, k, key, lang, len, ref1, ref2, v, value;
    this.babelMap = {
      af: 'afrikaans',
      am: 'amharic',
      ar: 'arabic',
      ast: 'asturian',
      bg: 'bulgarian',
      bn: 'bengali',
      bo: 'tibetan',
      br: 'breton',
      ca: 'catalan',
      cop: 'coptic',
      cy: 'welsh',
      cz: 'czech',
      da: 'danish',
      de_1996: 'ngerman',
      de_at_1996: 'naustrian',
      de_at: 'austrian',
      de_de_1996: 'ngerman',
      de: ['german', 'germanb'],
      dsb: ['lsorbian', 'lowersorbian'],
      dv: 'divehi',
      el: 'greek',
      el_polyton: 'polutonikogreek',
      en_au: 'australian',
      en_ca: 'canadian',
      en: 'english',
      en_gb: ['british', 'ukenglish'],
      en_nz: 'newzealand',
      en_us: ['american', 'usenglish'],
      eo: 'esperanto',
      es: 'spanish',
      et: 'estonian',
      eu: 'basque',
      fa: 'farsi',
      fi: 'finnish',
      fr_ca: ['acadian', 'canadian', 'canadien'],
      fr: ['french', 'francais', 'français'],
      fur: 'friulan',
      ga: 'irish',
      gd: ['scottish', 'gaelic'],
      gl: 'galician',
      he: 'hebrew',
      hi: 'hindi',
      hr: 'croatian',
      hsb: ['usorbian', 'uppersorbian'],
      hu: 'magyar',
      hy: 'armenian',
      ia: 'interlingua',
      id: ['indonesian', 'bahasa', 'bahasai', 'indon', 'meyalu'],
      is: 'icelandic',
      it: 'italian',
      ja: 'japanese',
      kn: 'kannada',
      la: 'latin',
      lo: 'lao',
      lt: 'lithuanian',
      lv: 'latvian',
      ml: 'malayalam',
      mn: 'mongolian',
      mr: 'marathi',
      nb: ['norsk', 'bokmal', 'nob'],
      nl: 'dutch',
      nn: 'nynorsk',
      no: ['norwegian', 'norsk'],
      oc: 'occitan',
      pl: 'polish',
      pms: 'piedmontese',
      pt_br: ['brazil', 'brazilian'],
      pt: ['portuguese', 'portuges'],
      pt_pt: 'portuguese',
      rm: 'romansh',
      ro: 'romanian',
      ru: 'russian',
      sa: 'sanskrit',
      se: 'samin',
      sk: 'slovak',
      sl: ['slovenian', 'slovene'],
      sq_al: 'albanian',
      sr_cyrl: 'serbianc',
      sr_latn: 'serbian',
      sr: 'serbian',
      sv: 'swedish',
      syr: 'syriac',
      ta: 'tamil',
      te: 'telugu',
      th: ['thai', 'thaicjk'],
      tk: 'turkmen',
      tr: 'turkish',
      uk: 'ukrainian',
      ur: 'urdu',
      vi: 'vietnamese',
      zh_latn: 'pinyin',
      zh: 'pinyin',
      zlm: ['malay', 'bahasam', 'melayu']
    };
    ref1 = this.babelMap;
    for (key in ref1) {
      if (!hasProp.call(ref1, key)) continue;
      value = ref1[key];
      if (typeof value === 'string') {
        this.babelMap[key] = [value];
      }
    }
    this.babelList = [];
    ref2 = this.babelMap;
    for (k in ref2) {
      if (!hasProp.call(ref2, k)) continue;
      v = ref2[k];
      for (j = 0, len = v.length; j < len; j++) {
        lang = v[j];
        if (this.babelList.indexOf(lang) < 0) {
          this.babelList.push(lang);
        }
      }
    }
    this.cache = {};
    this.prefix = {};
  }

  return _Class;

})());

Language.get_bigrams = function(string) {
  var i, s;
  s = string.toLowerCase();
  s = (function() {
    var j, ref1, results;
    results = [];
    for (i = j = 0, ref1 = s.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
      results.push(s.slice(i, i + 2));
    }
    return results;
  })();
  s.sort();
  return s;
};

Language.string_similarity = function(str1, str2) {
  var hit_count, pairs1, pairs2, union;
  pairs1 = this.get_bigrams(str1);
  pairs2 = this.get_bigrams(str2);
  union = pairs1.length + pairs2.length;
  hit_count = 0;
  while (pairs1.length > 0 && pairs2.length > 0) {
    if (pairs1[0] === pairs2[0]) {
      hit_count++;
      pairs1.shift();
      pairs2.shift();
      continue;
    }
    if (pairs1[0] < pairs2[0]) {
      pairs1.shift();
    } else {
      pairs2.shift();
    }
  }
  return (2 * hit_count) / union;
};

Language.lookup = function(langcode) {
  var j, lc, len, ref1;
  if (!this.cache[langcode]) {
    this.cache[langcode] = [];
    ref1 = Language.babelList;
    for (j = 0, len = ref1.length; j < len; j++) {
      lc = ref1[j];
      this.cache[langcode].push({
        lang: lc,
        sim: this.string_similarity(langcode, lc)
      });
    }
    this.cache[langcode].sort(function(a, b) {
      return b.sim - a.sim;
    });
  }
  return this.cache[langcode];
};

Language.fromPrefix = function(langcode) {
  var code, j, lang, languages, lc, len, matches, ref1;
  if (!(langcode && langcode.length >= 2)) {
    return false;
  }
  if (this.prefix[langcode] == null) {
    lc = langcode.toLowerCase();
    matches = [];
    ref1 = Language.babelMap;
    for (code in ref1) {
      languages = ref1[code];
      for (j = 0, len = languages.length; j < len; j++) {
        lang = languages[j];
        if (lang.toLowerCase().indexOf(lc) !== 0) {
          continue;
        }
        matches.push(languages);
        break;
      }
    }
    if (matches.length === 1) {
      this.prefix[langcode] = matches[0];
    } else {
      this.prefix[langcode] = false;
    }
  }
  return this.prefix[langcode];
};

Reference.installPostscript = function() {
  var err, postscript;
  postscript = Translator.preferences.postscript;
  if (!(typeof postscript === 'string' && postscript.trim() !== '')) {
    return;
  }
  try {
    Reference.prototype.postscript = new Function(postscript);
    Zotero.debug("Installed postscript: " + (JSON.stringify(postscript)));
  } catch (error) {
    err = error;
    Zotero.debug("Failed to compile postscript: " + err + "\n\n" + (JSON.stringify(postscript)));
  }
};

module.exports = Reference;


/***/ }),
/* 43 */
/*!******************************************!*\
  !*** ./bibtex/unicode_translator.coffee ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var HTML, Mapping, MarkupParser, Text2LaTeX, XRegExp, debug;

MarkupParser = __webpack_require__(/*! ../lib/markupparser.coffee */ 27);

debug = __webpack_require__(/*! ../lib/debug.coffee */ 0);

Mapping = __webpack_require__(/*! ./unicode_translator.json */ 44);


/* XRegExp = require('xregexp') */

XRegExp = Zotero.Utilities.XRegExp;

Text2LaTeX = {
  text2latex: function(text, options) {
    if (options == null) {
      options = {};
    }
    options.mode || (options.mode = 'text');
    return Text2LaTeX.html2latex(text, options);
  },
  html2latex: function(html, options) {
    var latex;
    options.mode || (options.mode = 'html');
    latex = (new HTML(html, options)).latex;
    latex = latex.replace(/(\\\\)+[^\S\n]*\n\n/g, "\n\n");
    latex = latex.replace(/\n\n\n+/g, "\n\n");
    latex = latex.replace(/{}([}])/g, '$1');
    return latex;
  }
};

module.exports = Text2LaTeX;

HTML = (function() {
  function HTML(html, options1) {
    this.options = options1 != null ? options1 : {};
    this.latex = '';
    this.mapping = (Translator.unicode ? Mapping.unicode : Mapping.ascii);
    this.stack = [];
    this.walk(MarkupParser.parse(html, this.options));
  }

  HTML.prototype.walk = function(tag) {
    var child, i, latex, len, postfix, prefix, ref, ref1, ref2;
    if (!tag) {
      return;
    }
    switch (tag.name) {
      case '#text':
        this.chars(tag.text);
        return;
      case 'pre':
        this.latex += tag.text;
        return;
    }
    this.stack.unshift(tag);
    latex = '...';
    switch (tag.name) {
      case 'i':
      case 'em':
      case 'italic':
        latex = '\\emph{...}';
        break;
      case 'b':
      case 'strong':
        latex = '\\textbf{...}';
        break;
      case 'a':

        /* zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. */
        if (((ref = tag.attrs.href) != null ? ref.length : void 0) > 0) {
          latex = "\\href{" + tag.attrs.href + "}{...}";
        }
        break;
      case 'sup':
        latex = '\\textsuperscript{...}';
        break;
      case 'sub':
        latex = '\\textsubscript{...}';
        break;
      case 'br':
        latex = '';

        /* line-breaks on empty line makes LaTeX sad */
        if (this.latex !== '' && this.latex[this.latex.length - 1] !== "\n") {
          latex = "\\\\";
        }
        latex += "\n...";
        break;
      case 'p':
      case 'div':
      case 'table':
      case 'tr':
        latex = "\n\n...\n\n";
        break;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
        latex = "\n\n\\" + ((new Array(parseInt(tag.name[1]))).join('sub')) + "section{...}\n\n";
        break;
      case 'ol':
        latex = "\n\n\\begin{enumerate}\n...\n\n\\end{enumerate}\n";
        break;
      case 'ul':
        latex = "\n\n\\begin{itemize}\n...\n\n\\end{itemize}\n";
        break;
      case 'li':
        latex = "\n\\item ...";
        break;
      case 'enquote':
        if (Translator.BetterBibTeX) {
          latex = '\\enquote{...}';
        } else {
          latex = '\\mkbibquote{...}';
        }
        break;
      case 'span':
      case 'sc':
      case 'nc':
        break;
      case 'td':
      case 'th':
        latex = ' ... ';
        break;
      case 'tbody':
      case '#document':
      case 'html':
      case 'head':
      case 'body':
        break;
      default:
        debug("unexpected tag '" + tag.name + "' (" + (Object.keys(tag)) + ")");
    }
    if (latex !== '...') {
      latex = this.embrace(latex, latex.match(/^\\[a-z]+{\.\.\.}$/));
    }
    if (tag.smallcaps) {
      latex = this.embrace("\\textsc{" + latex + "}", true);
    }
    if (tag.nocase) {
      latex = "{{" + latex + "}}";
    }
    if (tag.relax) {
      latex = "{\\relax " + latex + "}";
    }
    ref1 = latex.split('...'), prefix = ref1[0], postfix = ref1[1];
    this.latex += prefix;
    ref2 = tag.children;
    for (i = 0, len = ref2.length; i < len; i++) {
      child = ref2[i];
      this.walk(child);
    }
    this.latex += postfix;
    this.stack.shift();
  };

  HTML.prototype.embrace = function(latex, condition) {

    /* holy mother of %^$#^%$@ the bib(la)tex case conversion rules are insane */

    /* https://github.com/retorquere/zotero-better-bibtex/issues/541 */

    /* https://github.com/plk/biblatex/issues/459 ... oy! */
    if (this.embraced == null) {
      this.embraced = this.options.caseConversion && (((this.latex || latex)[0] !== '\\') || Translator.BetterBibTeX);
    }
    if (!(this.embraced && condition)) {
      return latex;
    }
    return '{' + latex + '}';
  };

  HTML.prototype.chars = function(text) {
    var braced, c, i, latex, len, math, ref;
    latex = '';
    math = false;
    braced = 0;
    ref = XRegExp.split(text, '');
    for (i = 0, len = ref.length; i < len; i++) {
      c = ref[i];
      if (!!this.mapping.math[c] !== math) {
        latex += '$';
        math = !!this.mapping.math[c];
      }

      /* balance out braces with invisible braces until http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754 is widely deployed */
      switch (c) {
        case '{':
          braced += 1;
          break;
        case '}':
          braced -= 1;
      }
      if (braced < 0) {
        latex += "\\vphantom\\{";
        braced = 0;
      }
      c = this.mapping.math[c] || this.mapping.text[c] || c;
      latex += this.embrace(c, Mapping.embrace[c]);
    }
    switch (braced) {
      case 0:
        break;
      case 1:
        latex += "\\vphantom\\}";
        break;
      default:
        latex += "\\vphantom{" + ((new Array(braced + 1)).join("\\}")) + "}";
    }
    if (math) {
      latex += "$";
    }

    /* minor cleanup */
    latex = latex.replace(/([^\\])({})+([^ 0-9a-z])/ig, '$1$3');
    this.latex += latex;
  };

  return HTML;

})();


/***/ }),
/* 44 */
/*!****************************************!*\
  !*** ./bibtex/unicode_translator.json ***!
  \****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {


    module.exports = {
  'unicode': {
    'math': {
      '<': '<',
      '>': '>',
      '\\': '\\backslash{}'
    },
    'text': {
      '#': '\\#',
      '$': '\\$',
      '%': '\\%',
      '&': '\\&',
      '^': '\\^',
      '_': '\\_',
      '{': '\\{',
      '}': '\\}',
      '~': '\\textasciitilde{}',
      '\xA0': '~',
      '\u200B': '\\mbox{}',
      '\u200C': '{\\aftergroup\\ignorespaces}'
    }
  },
  'ascii': {
    'math': {
      '<': '<',
      '>': '>',
      '\\': '\\backslash{}',
      '\xAC': '\\lnot{}',
      '\xAD': '\\-',
      '\xB0': '^\\circ{}',
      '\xB1': '\\pm{}',
      '\xB2': '^2',
      '\xB3': '^3',
      '\xB5': '\\mathrm{\\mu}',
      '\xB7': '\\cdot{}',
      '\xB9': '^1',
      '\xF7': '\\div{}',
      '\u0127': '{\\Elzxh}',
      '\u0192': 'f',
      '\u01AA': '{\\eth}',
      '\u01B5': '{\\Zbar}',
      '\u0237': '{\\jmath}',
      '\u0250': '\\Elztrna{}',
      '\u0252': '\\Elztrnsa{}',
      '\u0254': '\\Elzopeno{}',
      '\u0256': '\\Elzrtld{}',
      '\u0259': '\\Elzschwa{}',
      '\u025B': '\\varepsilon{}',
      '\u0263': '\\Elzpgamma{}',
      '\u0264': '\\Elzpbgam{}',
      '\u0265': '\\Elztrnh{}',
      '\u026C': '\\Elzbtdl{}',
      '\u026D': '\\Elzrtll{}',
      '\u026F': '\\Elztrnm{}',
      '\u0270': '\\Elztrnmlr{}',
      '\u0271': '\\Elzltlmr{}',
      '\u0273': '\\Elzrtln{}',
      '\u0277': '\\Elzclomeg{}',
      '\u0279': '\\Elztrnr{}',
      '\u027A': '\\Elztrnrl{}',
      '\u027B': '\\Elzrttrnr{}',
      '\u027C': '\\Elzrl{}',
      '\u027D': '\\Elzrtlr{}',
      '\u027E': '\\Elzfhr{}',
      '\u0282': '\\Elzrtls{}',
      '\u0283': '\\Elzesh{}',
      '\u0287': '\\Elztrnt{}',
      '\u0288': '\\Elzrtlt{}',
      '\u028A': '\\Elzpupsil{}',
      '\u028B': '\\Elzpscrv{}',
      '\u028C': '\\Elzinvv{}',
      '\u028D': '\\Elzinvw{}',
      '\u028E': '\\Elztrny{}',
      '\u0290': '\\Elzrtlz{}',
      '\u0292': '\\Elzyogh{}',
      '\u0294': '\\Elzglst{}',
      '\u0295': '\\Elzreglst{}',
      '\u0296': '\\Elzinglst{}',
      '\u02A4': '\\Elzdyogh{}',
      '\u02A7': '\\Elztesh{}',
      '\u02C8': '\\Elzverts{}',
      '\u02CC': '\\Elzverti{}',
      '\u02D0': '\\Elzlmrk{}',
      '\u02D1': '\\Elzhlmrk{}',
      '\u02D2': '\\Elzsbrhr{}',
      '\u02D3': '\\Elzsblhr{}',
      '\u02D4': '\\Elzrais{}',
      '\u02D5': '\\Elzlow{}',
      '\u0305': '\\overline{}',
      '\u0309': '\\ovhook{}',
      '\u0310': '\\candra{}',
      '\u0312': '\\oturnedcomma{}',
      '\u0315': '\\ocommatopright{}',
      '\u031A': '\\droang{}',
      '\u0321': '\\Elzpalh{}',
      '\u032A': '\\Elzsbbrg{}',
      '\u0330': '\\utilde{}',
      '\u0331': '\\underbar{}',
      '\u0332': '\\underline{}',
      '\u038E': '\\mathrm{\'Y}',
      '\u038F': '\\mathrm{\'\\Omega}',
      '\u0390': '\\acute{\\ddot{\\iota}}',
      '\u0391': 'A',
      '\u0392': 'B',
      '\u0393': '\\Gamma{}',
      '\u0394': '\\Delta{}',
      '\u0395': 'E',
      '\u0396': 'Z',
      '\u0397': 'H',
      '\u0398': '\\Theta{}',
      '\u0399': 'I',
      '\u039A': 'K',
      '\u039B': '\\Lambda{}',
      '\u039C': 'M',
      '\u039D': 'N',
      '\u039E': '\\Xi{}',
      '\u039F': 'O',
      '\u03A0': '\\Pi{}',
      '\u03A1': 'P',
      '\u03A3': '\\Sigma{}',
      '\u03A4': 'T',
      '\u03A5': '\\Upsilon{}',
      '\u03A6': '\\Phi{}',
      '\u03A7': 'X',
      '\u03A8': '\\Psi{}',
      '\u03A9': '\\Omega{}',
      '\u03AA': '\\mathrm{\\ddot{I}}',
      '\u03AB': '\\mathrm{\\ddot{Y}}',
      '\u03AD': '\\acute{\\epsilon}',
      '\u03AE': '\\acute{\\eta}',
      '\u03AF': '\\acute{\\iota}',
      '\u03B0': '\\acute{\\ddot{\\upsilon}}',
      '\u03B1': '\\alpha{}',
      '\u03B2': '\\beta{}',
      '\u03B3': '\\gamma{}',
      '\u03B4': '\\delta{}',
      '\u03B5': '\\epsilon{}',
      '\u03B6': '\\zeta{}',
      '\u03B7': '\\eta{}',
      '\u03B9': '\\iota{}',
      '\u03BA': '\\kappa{}',
      '\u03BB': '\\lambda{}',
      '\u03BC': '\\mu{}',
      '\u03BD': '\\nu{}',
      '\u03BE': '\\xi{}',
      '\u03BF': 'o',
      '\u03C0': '\\pi{}',
      '\u03C1': '\\rho{}',
      '\u03C2': '\\varsigma{}',
      '\u03C3': '\\sigma{}',
      '\u03C4': '\\tau{}',
      '\u03C5': '\\upsilon{}',
      '\u03C6': '\\varphi{}',
      '\u03C7': '\\chi{}',
      '\u03C8': '\\psi{}',
      '\u03C9': '\\omega{}',
      '\u03CA': '\\ddot{\\iota}',
      '\u03CB': '\\ddot{\\upsilon}',
      '\u03CD': '\\acute{\\upsilon}',
      '\u03CE': '\\acute{\\omega}',
      '\u03D2': '\\Upsilon{}',
      '\u03D5': '\\phi{}',
      '\u03D6': '\\varpi{}',
      '\u03D8': '\\Qoppa{}',
      '\u03D9': '\\qoppa{}',
      '\u03DA': '\\Stigma{}',
      '\u03DB': '\\stigma{}',
      '\u03DC': '\\Digamma{}',
      '\u03DD': '\\digamma{}',
      '\u03DE': '\\Koppa{}',
      '\u03DF': '\\koppa{}',
      '\u03E0': '\\Sampi{}',
      '\u03E1': '\\sampi{}',
      '\u03F0': '\\varkappa{}',
      '\u03F1': '\\varrho{}',
      '\u03F5': '\\epsilon{}',
      '\u03F6': '\\backepsilon{}',
      '\u2003': '\\quad{}',
      '\u200A': '\\mkern1mu{}',
      '\u2016': '\\Vert{}',
      '\u2017': '\\twolowline{}',
      '\u201B': '\\Elzreapos{}',
      '\u2032': '{\'}',
      '\u2033': '{\'\'}',
      '\u2034': '{\'\'\'}',
      '\u2035': '\\backprime{}',
      '\u2036': '\\backdprime{}',
      '\u2037': '\\backtrprime{}',
      '\u2038': '\\caretinsert{}',
      '\u203C': '\\Exclam{}',
      '\u2040': '\\cat{}',
      '\u2043': '\\hyphenbullet{}',
      '\u2044': '\\fracslash{}',
      '\u2047': '\\Question{}',
      '\u2050': '\\closure{}',
      '\u2057': '\'\'\'\'',
      '\u20D0': '\\lvec{}',
      '\u20D1': '\\vec{}',
      '\u20D2': '\\vertoverlay{}',
      '\u20D6': '\\LVec{}',
      '\u20D7': '\\vec{}',
      '\u20DB': '\\dddot{}',
      '\u20DC': '\\ddddot{}',
      '\u20DD': '\\enclosecircle{}',
      '\u20DE': '\\enclosesquare{}',
      '\u20DF': '\\enclosediamond{}',
      '\u20E1': '\\overleftrightarrow{}',
      '\u20E4': '\\enclosetriangle{}',
      '\u20E7': '\\annuity{}',
      '\u20E8': '\\threeunderdot{}',
      '\u20E9': '\\widebridgeabove{}',
      '\u20EC': '\\underrightharpoondown{}',
      '\u20ED': '\\underleftharpoondown{}',
      '\u20EE': '\\underleftarrow{}',
      '\u20EF': '\\underrightarrow{}',
      '\u20F0': '\\asteraccent{}',
      '\u2102': '\\mathbb{C}',
      '\u2107': '\\Euler{}',
      '\u210B': '\\mathscr{H}',
      '\u210C': '\\mathfrak{H}',
      '\u210D': '\\mathbb{H}',
      '\u210E': '\\Planckconst{}',
      '\u210F': '\\hslash{}',
      '\u2110': '\\mathscr{I}',
      '\u2111': '\\mathfrak{I}',
      '\u2112': '\\mathscr{L}',
      '\u2113': '\\mathscr{l}',
      '\u2115': '\\mathbb{N}',
      '\u2118': '\\wp{}',
      '\u2119': '\\mathbb{P}',
      '\u211A': '\\mathbb{Q}',
      '\u211B': '\\mathscr{R}',
      '\u211C': '\\mathfrak{R}',
      '\u211D': '\\mathbb{R}',
      '\u211E': '\\Elzxrat{}',
      '\u2124': '\\mathbb{Z}',
      '\u2127': '\\mho{}',
      '\u2128': '\\mathfrak{Z}',
      '\u2129': '\\ElsevierGlyph{2129}',
      '\u212C': '\\mathscr{B}',
      '\u212D': '\\mathfrak{C}',
      '\u212F': '\\mathscr{e}',
      '\u2130': '\\mathscr{E}',
      '\u2131': '\\mathscr{F}',
      '\u2132': '\\Finv{}',
      '\u2133': '\\mathscr{M}',
      '\u2134': '\\mathscr{o}',
      '\u2135': '\\aleph{}',
      '\u2136': '\\beth{}',
      '\u2137': '\\gimel{}',
      '\u2138': '\\daleth{}',
      '\u213C': '\\mathbb{\\pi}',
      '\u213D': '\\mathbb{\\gamma}',
      '\u213E': '\\mathbb{\\Gamma}',
      '\u213F': '\\mathbb{\\Pi}',
      '\u2140': '\\mathbb{\\Sigma}',
      '\u2141': '\\Game{}',
      '\u2142': '\\sansLturned{}',
      '\u2143': '\\sansLmirrored{}',
      '\u2144': '\\Yup{}',
      '\u2145': '\\CapitalDifferentialD{}',
      '\u2146': '\\DifferentialD{}',
      '\u2147': '\\ExponetialE{}',
      '\u2148': '\\ComplexI{}',
      '\u2149': '\\ComplexJ{}',
      '\u214A': '\\PropertyLine{}',
      '\u214B': '\\invamp{}',
      '\u2153': '\\textfrac{1}{3}',
      '\u2154': '\\textfrac{2}{3}',
      '\u2155': '\\textfrac{1}{5}',
      '\u2156': '\\textfrac{2}{5}',
      '\u2157': '\\textfrac{3}{5}',
      '\u2158': '\\textfrac{4}{5}',
      '\u2159': '\\textfrac{1}{6}',
      '\u215A': '\\textfrac{5}{6}',
      '\u215B': '\\textfrac{1}{8}',
      '\u215C': '\\textfrac{3}{8}',
      '\u215D': '\\textfrac{5}{8}',
      '\u215E': '\\textfrac{7}{8}',
      '\u2190': '\\leftarrow{}',
      '\u2191': '\\uparrow{}',
      '\u2192': '\\rightarrow{}',
      '\u2193': '\\downarrow{}',
      '\u2194': '\\leftrightarrow{}',
      '\u2195': '\\updownarrow{}',
      '\u2196': '\\nwarrow{}',
      '\u2197': '\\nearrow{}',
      '\u2198': '\\searrow{}',
      '\u2199': '\\swarrow{}',
      '\u219A': '\\nleftarrow{}',
      '\u219B': '\\nrightarrow{}',
      '\u219C': '\\arrowwaveleft{}',
      '\u219D': '\\arrowwaveright{}',
      '\u219E': '\\twoheadleftarrow{}',
      '\u219F': '\\twoheaduparrow{}',
      '\u21A0': '\\twoheadrightarrow{}',
      '\u21A1': '\\twoheaddownarrow{}',
      '\u21A2': '\\leftarrowtail{}',
      '\u21A3': '\\rightarrowtail{}',
      '\u21A4': '\\mapsfrom{}',
      '\u21A5': '\\MapsUp{}',
      '\u21A6': '\\mapsto{}',
      '\u21A7': '\\MapsDown{}',
      '\u21A8': '\\updownarrowbar{}',
      '\u21A9': '\\hookleftarrow{}',
      '\u21AA': '\\hookrightarrow{}',
      '\u21AB': '\\looparrowleft{}',
      '\u21AC': '\\looparrowright{}',
      '\u21AD': '\\leftrightsquigarrow{}',
      '\u21AE': '\\nleftrightarrow{}',
      '\u21AF': '\\lightning{}',
      '\u21B0': '\\Lsh{}',
      '\u21B1': '\\Rsh{}',
      '\u21B2': '\\dlsh{}',
      '\u21B3': '\\ElsevierGlyph{21B3}',
      '\u21B4': '\\linefeed{}',
      '\u21B5': '\\carriagereturn{}',
      '\u21B6': '\\curvearrowleft{}',
      '\u21B7': '\\curvearrowright{}',
      '\u21B8': '\\barovernorthwestarrow{}',
      '\u21B9': '\\barleftarrowrightarrowba{}',
      '\u21BA': '\\circlearrowleft{}',
      '\u21BB': '\\circlearrowright{}',
      '\u21BC': '\\leftharpoonup{}',
      '\u21BD': '\\leftharpoondown{}',
      '\u21BE': '\\upharpoonright{}',
      '\u21BF': '\\upharpoonleft{}',
      '\u21C0': '\\rightharpoonup{}',
      '\u21C1': '\\rightharpoondown{}',
      '\u21C2': '\\downharpoonright{}',
      '\u21C3': '\\downharpoonleft{}',
      '\u21C4': '\\rightleftarrows{}',
      '\u21C5': '\\dblarrowupdown{}',
      '\u21C6': '\\leftrightarrows{}',
      '\u21C7': '\\leftleftarrows{}',
      '\u21C8': '\\upuparrows{}',
      '\u21C9': '\\rightrightarrows{}',
      '\u21CA': '\\downdownarrows{}',
      '\u21CB': '\\leftrightharpoons{}',
      '\u21CC': '\\rightleftharpoons{}',
      '\u21CD': '\\nLeftarrow{}',
      '\u21CE': '\\nLeftrightarrow{}',
      '\u21CF': '\\nRightarrow{}',
      '\u21D0': '\\Leftarrow{}',
      '\u21D1': '\\Uparrow{}',
      '\u21D2': '\\Rightarrow{}',
      '\u21D3': '\\Downarrow{}',
      '\u21D4': '\\Leftrightarrow{}',
      '\u21D5': '\\Updownarrow{}',
      '\u21D6': '\\Nwarrow{}',
      '\u21D7': '\\Nearrow{}',
      '\u21D8': '\\Searrow{}',
      '\u21D9': '\\Swarrow{}',
      '\u21DA': '\\Lleftarrow{}',
      '\u21DB': '\\Rrightarrow{}',
      '\u21DC': '\\leftsquigarrow{}',
      '\u21DD': '\\rightsquigarrow{}',
      '\u21DE': '\\nHuparrow{}',
      '\u21DF': '\\nHdownarrow{}',
      '\u21E0': '\\dashleftarrow{}',
      '\u21E1': '\\updasharrow{}',
      '\u21E2': '\\dashrightarrow{}',
      '\u21E3': '\\downdasharrow{}',
      '\u21E4': '\\LeftArrowBar{}',
      '\u21E5': '\\RightArrowBar{}',
      '\u21E6': '\\leftwhitearrow{}',
      '\u21E7': '\\upwhitearrow{}',
      '\u21E8': '\\rightwhitearrow{}',
      '\u21E9': '\\downwhitearrow{}',
      '\u21EA': '\\whitearrowupfrombar{}',
      '\u21F4': '\\circleonrightarrow{}',
      '\u21F5': '\\DownArrowUpArrow{}',
      '\u21F6': '\\rightthreearrows{}',
      '\u21F7': '\\nvleftarrow{}',
      '\u21F8': '\\pfun{}',
      '\u21F9': '\\nvleftrightarrow{}',
      '\u21FA': '\\nVleftarrow{}',
      '\u21FB': '\\ffun{}',
      '\u21FC': '\\nVleftrightarrow{}',
      '\u21FD': '\\leftarrowtriangle{}',
      '\u21FE': '\\rightarrowtriangle{}',
      '\u21FF': '\\leftrightarrowtriangle{}',
      '\u2200': '\\forall{}',
      '\u2201': '\\complement{}',
      '\u2202': '\\partial{}',
      '\u2203': '\\exists{}',
      '\u2204': '\\nexists{}',
      '\u2205': '\\varnothing{}',
      '\u2206': '\\increment{}',
      '\u2207': '\\nabla{}',
      '\u2208': '\\in{}',
      '\u2209': '\\not\\in{}',
      '\u220A': '\\smallin{}',
      '\u220B': '\\ni{}',
      '\u220C': '\\not\\ni{}',
      '\u220D': '\\smallni{}',
      '\u220E': '\\QED{}',
      '\u220F': '\\prod{}',
      '\u2210': '\\coprod{}',
      '\u2211': '\\sum{}',
      '\u2213': '\\mp{}',
      '\u2214': '\\dotplus{}',
      '\u2215': '\\slash{}',
      '\u2216': '\\setminus{}',
      '\u2217': '{_\\ast}',
      '\u2218': '\\circ{}',
      '\u2219': '\\bullet{}',
      '\u221A': '\\surd{}',
      '\u221B': '\\sqrt[3]',
      '\u221C': '\\sqrt[4]',
      '\u221D': '\\propto{}',
      '\u221E': '\\infty{}',
      '\u221F': '\\rightangle{}',
      '\u2220': '\\angle{}',
      '\u2221': '\\measuredangle{}',
      '\u2222': '\\sphericalangle{}',
      '\u2223': '\\mid{}',
      '\u2224': '\\nmid{}',
      '\u2225': '\\parallel{}',
      '\u2226': '\\nparallel{}',
      '\u2227': '\\wedge{}',
      '\u2228': '\\vee{}',
      '\u2229': '\\cap{}',
      '\u222A': '\\cup{}',
      '\u222B': '\\int{}',
      '\u222C': '{\\int\\!\\int}',
      '\u222D': '{\\int\\!\\int\\!\\int}',
      '\u222E': '\\oint{}',
      '\u222F': '\\surfintegral{}',
      '\u2230': '\\volintegral{}',
      '\u2231': '\\clwintegral{}',
      '\u2232': '\\ElsevierGlyph{2232}',
      '\u2233': '\\ElsevierGlyph{2233}',
      '\u2234': '\\therefore{}',
      '\u2235': '\\because{}',
      '\u2236': ':',
      '\u2237': '\\Colon{}',
      '\u2238': '\\ElsevierGlyph{2238}',
      '\u2239': '\\eqcolon{}',
      '\u223A': '\\mathbin{{:}\\!\\!{-}\\!\\!{:}}',
      '\u223B': '\\homothetic{}',
      '\u223C': '\\sim{}',
      '\u223D': '\\backsim{}',
      '\u223E': '\\lazysinv{}',
      '\u223F': '\\AC{}',
      '\u2240': '\\wr{}',
      '\u2241': '\\not\\sim{}',
      '\u2242': '\\ElsevierGlyph{2242}',
      '\u2243': '\\simeq{}',
      '\u2244': '\\not\\simeq{}',
      '\u2245': '\\cong{}',
      '\u2246': '\\approxnotequal{}',
      '\u2247': '\\not\\cong{}',
      '\u2248': '\\approx{}',
      '\u2249': '\\not\\approx{}',
      '\u224A': '\\approxeq{}',
      '\u224B': '\\tildetrpl{}',
      '\u224C': '\\allequal{}',
      '\u224D': '\\asymp{}',
      '\u224E': '\\Bumpeq{}',
      '\u224F': '\\bumpeq{}',
      '\u2250': '\\doteq{}',
      '\u2251': '\\doteqdot{}',
      '\u2252': '\\fallingdotseq{}',
      '\u2253': '\\risingdotseq{}',
      '\u2255': '=:',
      '\u2256': '\\eqcirc{}',
      '\u2257': '\\circeq{}',
      '\u2258': '\\arceq{}',
      '\u2259': '\\estimates{}',
      '\u225A': '\\ElsevierGlyph{225A}',
      '\u225B': '\\starequal{}',
      '\u225C': '\\triangleq{}',
      '\u225D': '\\eqdef{}',
      '\u225E': '\\measeq{}',
      '\u225F': '\\ElsevierGlyph{225F}',
      '\u2260': '\\not =',
      '\u2261': '\\equiv{}',
      '\u2262': '\\not\\equiv{}',
      '\u2263': '\\Equiv{}',
      '\u2264': '\\leq{}',
      '\u2265': '\\geq{}',
      '\u2266': '\\leqq{}',
      '\u2267': '\\geqq{}',
      '\u2268': '\\lneqq{}',
      '\u2269': '\\gneqq{}',
      '\u226A': '\\ll{}',
      '\u226B': '\\gg{}',
      '\u226C': '\\between{}',
      '\u226D': '{\\not\\kern-0.3em\\times}',
      '\u226E': '\\not<',
      '\u226F': '\\not>',
      '\u2270': '\\not\\leq{}',
      '\u2271': '\\not\\geq{}',
      '\u2272': '\\lessequivlnt{}',
      '\u2273': '\\greaterequivlnt{}',
      '\u2274': '\\ElsevierGlyph{2274}',
      '\u2275': '\\ElsevierGlyph{2275}',
      '\u2276': '\\lessgtr{}',
      '\u2277': '\\gtrless{}',
      '\u2278': '\\notlessgreater{}',
      '\u2279': '\\notgreaterless{}',
      '\u227A': '\\prec{}',
      '\u227B': '\\succ{}',
      '\u227C': '\\preccurlyeq{}',
      '\u227D': '\\succcurlyeq{}',
      '\u227E': '\\precapprox{}',
      '\u227F': '\\succapprox{}',
      '\u2280': '\\not\\prec{}',
      '\u2281': '\\not\\succ{}',
      '\u2282': '\\subset{}',
      '\u2283': '\\supset{}',
      '\u2284': '\\not\\subset{}',
      '\u2285': '\\not\\supset{}',
      '\u2286': '\\subseteq{}',
      '\u2287': '\\supseteq{}',
      '\u2288': '\\not\\subseteq{}',
      '\u2289': '\\not\\supseteq{}',
      '\u228A': '\\subsetneq{}',
      '\u228B': '\\supsetneq{}',
      '\u228C': '\\cupleftarrow{}',
      '\u228D': '\\cupdot{}',
      '\u228E': '\\uplus{}',
      '\u228F': '\\sqsubset{}',
      '\u2290': '\\sqsupset{}',
      '\u2291': '\\sqsubseteq{}',
      '\u2292': '\\sqsupseteq{}',
      '\u2293': '\\sqcap{}',
      '\u2294': '\\sqcup{}',
      '\u2295': '\\oplus{}',
      '\u2296': '\\ominus{}',
      '\u2297': '\\otimes{}',
      '\u2298': '\\oslash{}',
      '\u2299': '\\odot{}',
      '\u229A': '\\circledcirc{}',
      '\u229B': '\\circledast{}',
      '\u229C': '\\circledequal{}',
      '\u229D': '\\circleddash{}',
      '\u229E': '\\boxplus{}',
      '\u229F': '\\boxminus{}',
      '\u22A0': '\\boxtimes{}',
      '\u22A1': '\\boxdot{}',
      '\u22A2': '\\vdash{}',
      '\u22A3': '\\dashv{}',
      '\u22A4': '\\top{}',
      '\u22A5': '\\perp{}',
      '\u22A6': '\\assert{}',
      '\u22A7': '\\truestate{}',
      '\u22A8': '\\forcesextra{}',
      '\u22A9': '\\Vdash{}',
      '\u22AA': '\\Vvdash{}',
      '\u22AB': '\\VDash{}',
      '\u22AC': '\\nvdash{}',
      '\u22AD': '\\nvDash{}',
      '\u22AE': '\\nVdash{}',
      '\u22AF': '\\nVDash{}',
      '\u22B0': '\\prurel{}',
      '\u22B1': '\\scurel{}',
      '\u22B2': '\\vartriangleleft{}',
      '\u22B3': '\\vartriangleright{}',
      '\u22B4': '\\trianglelefteq{}',
      '\u22B5': '\\trianglerighteq{}',
      '\u22B6': '\\original{}',
      '\u22B7': '\\image{}',
      '\u22B8': '\\multimap{}',
      '\u22B9': '\\hermitconjmatrix{}',
      '\u22BA': '\\intercal{}',
      '\u22BB': '\\veebar{}',
      '\u22BC': '\\barwedge{}',
      '\u22BD': '\\barvee{}',
      '\u22BE': '\\rightanglearc{}',
      '\u22BF': '\\varlrtriangle{}',
      '\u22C0': '\\ElsevierGlyph{22C0}',
      '\u22C1': '\\ElsevierGlyph{22C1}',
      '\u22C2': '\\bigcap{}',
      '\u22C3': '\\bigcup{}',
      '\u22C4': '\\diamond{}',
      '\u22C5': '\\cdot{}',
      '\u22C6': '\\star{}',
      '\u22C7': '\\divideontimes{}',
      '\u22C8': '\\bowtie{}',
      '\u22C9': '\\ltimes{}',
      '\u22CA': '\\rtimes{}',
      '\u22CB': '\\leftthreetimes{}',
      '\u22CC': '\\rightthreetimes{}',
      '\u22CD': '\\backsimeq{}',
      '\u22CE': '\\curlyvee{}',
      '\u22CF': '\\curlywedge{}',
      '\u22D0': '\\Subset{}',
      '\u22D1': '\\Supset{}',
      '\u22D2': '\\Cap{}',
      '\u22D3': '\\Cup{}',
      '\u22D4': '\\pitchfork{}',
      '\u22D5': '\\hash{}',
      '\u22D6': '\\lessdot{}',
      '\u22D7': '\\gtrdot{}',
      '\u22D8': '\\verymuchless{}',
      '\u22D9': '\\verymuchgreater{}',
      '\u22DA': '\\lesseqgtr{}',
      '\u22DB': '\\gtreqless{}',
      '\u22DC': '\\eqless{}',
      '\u22DD': '\\eqgtr{}',
      '\u22DE': '\\curlyeqprec{}',
      '\u22DF': '\\curlyeqsucc{}',
      '\u22E0': '\\npreceq{}',
      '\u22E1': '\\nsucceq{}',
      '\u22E2': '\\not\\sqsubseteq{}',
      '\u22E3': '\\not\\sqsupseteq{}',
      '\u22E4': '\\sqsubsetneq{}',
      '\u22E5': '\\Elzsqspne{}',
      '\u22E6': '\\lnsim{}',
      '\u22E7': '\\gnsim{}',
      '\u22E8': '\\precedesnotsimilar{}',
      '\u22E9': '\\succnsim{}',
      '\u22EA': '\\ntriangleleft{}',
      '\u22EB': '\\ntriangleright{}',
      '\u22EC': '\\ntrianglelefteq{}',
      '\u22ED': '\\ntrianglerighteq{}',
      '\u22EE': '\\vdots{}',
      '\u22EF': '\\cdots{}',
      '\u22F0': '\\upslopeellipsis{}',
      '\u22F1': '\\downslopeellipsis{}',
      '\u22F2': '\\disin{}',
      '\u22F3': '\\varisins{}',
      '\u22F4': '\\isins{}',
      '\u22F5': '\\isindot{}',
      '\u22F6': '\\barin{}',
      '\u22F7': '\\isinobar{}',
      '\u22F8': '\\isinvb{}',
      '\u22F9': '\\isinE{}',
      '\u22FA': '\\nisd{}',
      '\u22FB': '\\varnis{}',
      '\u22FC': '\\nis{}',
      '\u22FD': '\\varniobar{}',
      '\u22FE': '\\niobar{}',
      '\u22FF': '\\bagmember{}',
      '\u2300': '\\diameter{}',
      '\u2302': '\\house{}',
      '\u2306': '\\perspcorrespond{}',
      '\u2308': '\\lceil{}',
      '\u2309': '\\rceil{}',
      '\u230A': '\\lfloor{}',
      '\u230B': '\\rfloor{}',
      '\u2310': '\\invneg{}',
      '\u2311': '\\wasylozenge{}',
      '\u2312': '\\profline{}',
      '\u2313': '\\profsurf{}',
      '\u2315': '\\recorder{}',
      '\u2316': '{\\mathchar"2208}',
      '\u2317': '\\viewdata{}',
      '\u2319': '\\turnednot{}',
      '\u231C': '\\ulcorner{}',
      '\u231D': '\\urcorner{}',
      '\u231E': '\\llcorner{}',
      '\u231F': '\\lrcorner{}',
      '\u2320': '\\inttop{}',
      '\u2321': '\\intbottom{}',
      '\u2322': '\\frown{}',
      '\u2323': '\\smile{}',
      '\u3008': '\\langle{}',
      '\u3009': '\\rangle{}',
      '\u232C': '\\varhexagonlrbonds{}',
      '\u2332': '\\conictaper{}',
      '\u2336': '\\topbot{}',
      '\u2339': '\\APLinv{}',
      '\u233D': '\\ElsevierGlyph{E838}',
      '\u233F': '\\notslash{}',
      '\u2340': '\\notbackslash{}',
      '\u2347': '\\APLleftarrowbox{}',
      '\u2348': '\\APLrightarrowbox{}',
      '\u2350': '\\APLuparrowbox{}',
      '\u2353': '\\APLboxupcaret{}',
      '\u2357': '\\APLdownarrowbox{}',
      '\u235D': '\\APLcomment{}',
      '\u235E': '\\APLinput{}',
      '\u235F': '\\APLlog{}',
      '\u2370': '\\APLboxquestion{}',
      '\u237C': '\\rangledownzigzagarrow{}',
      '\u2394': '\\hexagon{}',
      '\u239B': '\\lparenuend{}',
      '\u239C': '\\lparenextender{}',
      '\u239D': '\\lparenlend{}',
      '\u239E': '\\rparenuend{}',
      '\u239F': '\\rparenextender{}',
      '\u23A0': '\\rparenlend{}',
      '\u23A1': '\\lbrackuend{}',
      '\u23A2': '\\lbrackextender{}',
      '\u23A3': '\\Elzdlcorn{}',
      '\u23A4': '\\rbrackuend{}',
      '\u23A5': '\\rbrackextender{}',
      '\u23A6': '\\rbracklend{}',
      '\u23A7': '\\lbraceuend{}',
      '\u23A8': '\\lbracemid{}',
      '\u23A9': '\\lbracelend{}',
      '\u23AA': '\\vbraceextender{}',
      '\u23AB': '\\rbraceuend{}',
      '\u23AC': '\\rbracemid{}',
      '\u23AD': '\\rbracelend{}',
      '\u23AE': '\\intextender{}',
      '\u23AF': '\\harrowextender{}',
      '\u23B0': '\\lmoustache{}',
      '\u23B1': '\\rmoustache{}',
      '\u23B2': '\\sumtop{}',
      '\u23B3': '\\sumbottom{}',
      '\u23B4': '\\overbracket{}',
      '\u23B5': '\\underbracket{}',
      '\u23B6': '\\bbrktbrk{}',
      '\u23B7': '\\sqrtbottom{}',
      '\u23B8': '\\lvboxline{}',
      '\u23B9': '\\rvboxline{}',
      '\u23CE': '\\varcarriagereturn{}',
      '\u23DC': '\\overparen{}',
      '\u23DD': '\\underparen{}',
      '\u23DE': '\\overbrace{}',
      '\u23DF': '\\underbrace{}',
      '\u23E0': '\\obrbrak{}',
      '\u23E1': '\\ubrbrak{}',
      '\u23E2': '\\trapezium{}',
      '\u23E3': '\\benzenr{}',
      '\u23E4': '\\strns{}',
      '\u23E5': '\\fltns{}',
      '\u23E6': '\\accurrent{}',
      '\u23E7': '\\elinters{}',
      '\u24C8': '\\circledS{}',
      '\u2506': '\\Elzdshfnc{}',
      '\u2519': '\\Elzsqfnw{}',
      '\u2571': '\\diagup{}',
      '\u2580': '\\blockuphalf{}',
      '\u2584': '\\blocklowhalf{}',
      '\u2588': '\\blockfull{}',
      '\u258C': '\\blocklefthalf{}',
      '\u2590': '\\blockrighthalf{}',
      '\u2591': '\\blockqtrshaded{}',
      '\u2592': '\\blockhalfshaded{}',
      '\u2593': '\\blockthreeqtrshaded{}',
      '\u25A1': '\\square{}',
      '\u25A2': '\\squoval{}',
      '\u25A3': '\\blackinwhitesquare{}',
      '\u25A4': '\\squarehfill{}',
      '\u25A5': '\\squarevfill{}',
      '\u25A6': '\\squarehvfill{}',
      '\u25A7': '\\squarenwsefill{}',
      '\u25A8': '\\squareneswfill{}',
      '\u25A9': '\\squarecrossfill{}',
      '\u25AA': '\\blacksquare{}',
      '\u25AB': '\\smwhtsquare{}',
      '\u25AC': '\\hrectangleblack{}',
      '\u25AD': '\\fbox{~~}',
      '\u25AE': '\\vrectangleblack{}',
      '\u25AF': '\\Elzvrecto{}',
      '\u25B0': '\\parallelogramblack{}',
      '\u25B1': '\\ElsevierGlyph{E381}',
      '\u25B3': '\\bigtriangleup{}',
      '\u25B4': '\\blacktriangle{}',
      '\u25B5': '\\vartriangle{}',
      '\u25B6': '\\RHD{}',
      '\u25B7': '\\rhd{}',
      '\u25B8': '\\blacktriangleright{}',
      '\u25B9': '\\triangleright{}',
      '\u25BA': '\\blackpointerright{}',
      '\u25BB': '\\whitepointerright{}',
      '\u25BD': '\\bigtriangledown{}',
      '\u25BE': '\\blacktriangledown{}',
      '\u25BF': '\\triangledown{}',
      '\u25C0': '\\LHD{}',
      '\u25C1': '\\lhd{}',
      '\u25C2': '\\blacktriangleleft{}',
      '\u25C3': '\\triangleleft{}',
      '\u25C4': '\\blackpointerleft{}',
      '\u25C5': '\\whitepointerleft{}',
      '\u25C7': '\\Diamond{}',
      '\u25C8': '\\blackinwhitediamond{}',
      '\u25C9': '\\fisheye{}',
      '\u25CA': '\\lozenge{}',
      '\u25CB': '\\bigcirc{}',
      '\u25CC': '\\dottedcircle{}',
      '\u25CD': '\\circlevertfill{}',
      '\u25CE': '\\bullseye{}',
      '\u25D0': '\\Elzcirfl{}',
      '\u25D1': '\\Elzcirfr{}',
      '\u25D2': '\\Elzcirfb{}',
      '\u25D3': '\\circletophalfblack{}',
      '\u25D4': '\\circleurquadblack{}',
      '\u25D5': '\\blackcircleulquadwhite{}',
      '\u25D6': '\\LEFTCIRCLE{}',
      '\u25D8': '\\Elzrvbull{}',
      '\u25D9': '\\inversewhitecircle{}',
      '\u25DA': '\\invwhiteupperhalfcircle{}',
      '\u25DB': '\\invwhitelowerhalfcircle{}',
      '\u25DC': '\\ularc{}',
      '\u25DD': '\\urarc{}',
      '\u25DE': '\\lrarc{}',
      '\u25DF': '\\llarc{}',
      '\u25E0': '\\topsemicircle{}',
      '\u25E1': '\\botsemicircle{}',
      '\u25E2': '\\lrblacktriangle{}',
      '\u25E3': '\\llblacktriangle{}',
      '\u25E4': '\\ulblacktriangle{}',
      '\u25E5': '\\urblacktriangle{}',
      '\u25E6': '\\smwhtcircle{}',
      '\u25E7': '\\Elzsqfl{}',
      '\u25E8': '\\Elzsqfr{}',
      '\u25E9': '\\squareulblack{}',
      '\u25EA': '\\Elzsqfse{}',
      '\u25EB': '\\boxbar{}',
      '\u25EC': '\\trianglecdot{}',
      '\u25ED': '\\triangleleftblack{}',
      '\u25EE': '\\trianglerightblack{}',
      '\u25EF': '\\bigcirc{}',
      '\u25F0': '\\squareulquad{}',
      '\u25F1': '\\squarellquad{}',
      '\u25F2': '\\squarelrquad{}',
      '\u25F3': '\\squareurquad{}',
      '\u25F4': '\\circleulquad{}',
      '\u25F5': '\\circlellquad{}',
      '\u25F6': '\\circlelrquad{}',
      '\u25F7': '\\circleurquad{}',
      '\u25F8': '\\ultriangle{}',
      '\u25F9': '\\urtriangle{}',
      '\u25FA': '\\lltriangle{}',
      '\u25FB': '\\square{}',
      '\u25FC': '\\blacksquare{}',
      '\u25FD': '\\mdsmwhtsquare{}',
      '\u25FE': '\\mdsmblksquare{}',
      '\u25FF': '\\lrtriangle{}',
      '\u2609': '\\Sun{}',
      '\u2610': '\\Square{}',
      '\u2611': '\\CheckedBox{}',
      '\u2612': '\\XBox{}',
      '\u2615': '\\steaming{}',
      '\u2620': '\\skull{}',
      '\u2621': '\\danger{}',
      '\u2622': '\\radiation{}',
      '\u2623': '\\biohazard{}',
      '\u262F': '\\yinyang{}',
      '\u2639': '\\frownie{}',
      '\u263A': '\\smiley{}',
      '\u263B': '\\blacksmiley{}',
      '\u263C': '\\sun{}',
      '\u263D': '\\rightmoon{}',
      '\u2641': '\\earth{}',
      '\u2661': '\\heartsuit{}',
      '\u2662': '\\diamond{}',
      '\u2664': '\\varspadesuit{}',
      '\u2667': '\\varclubsuit{}',
      '\u266B': '\\twonotes{}',
      '\u266C': '\\sixteenthnote{}',
      '\u266D': '\\flat{}',
      '\u266E': '\\natural{}',
      '\u266F': '\\sharp{}',
      '\u267B': '\\recycle{}',
      '\u267E': '\\acidfree{}',
      '\u2680': '\\dicei{}',
      '\u2681': '\\diceii{}',
      '\u2682': '\\diceiii{}',
      '\u2683': '\\diceiv{}',
      '\u2684': '\\dicev{}',
      '\u2685': '\\dicevi{}',
      '\u2686': '\\circledrightdot{}',
      '\u2687': '\\circledtwodots{}',
      '\u2688': '\\blackcircledrightdot{}',
      '\u2689': '\\blackcircledtwodots{}',
      '\u2693': '\\anchor{}',
      '\u2694': '\\swords{}',
      '\u26A0': '\\warning{}',
      '\u26A5': '\\Hermaphrodite{}',
      '\u26AA': '\\medcirc{}',
      '\u26AB': '\\medbullet{}',
      '\u26AC': '\\mdsmwhtcircle{}',
      '\u26B2': '\\neuter{}',
      '\u2772': '\\lbrbrak{}',
      '\u2773': '\\rbrbrak{}',
      '\u27C0': '\\threedangle{}',
      '\u27C1': '\\whiteinwhitetriangle{}',
      '\u27C2': '\\perp{}',
      '\u27C3': '\\subsetcirc{}',
      '\u27C4': '\\supsetcirc{}',
      '\u27C5': '\\Lbag{}',
      '\u27C6': '\\Rbag{}',
      '\u27C7': '\\veedot{}',
      '\u27C8': '\\bsolhsub{}',
      '\u27C9': '\\suphsol{}',
      '\u27CC': '\\longdivision{}',
      '\u27D0': '\\Diamonddot{}',
      '\u27D1': '\\wedgedot{}',
      '\u27D2': '\\upin{}',
      '\u27D3': '\\pullback{}',
      '\u27D4': '\\pushout{}',
      '\u27D5': '\\leftouterjoin{}',
      '\u27D6': '\\rightouterjoin{}',
      '\u27D7': '\\fullouterjoin{}',
      '\u27D8': '\\bigbot{}',
      '\u27D9': '\\bigtop{}',
      '\u27DA': '\\DashVDash{}',
      '\u27DB': '\\dashVdash{}',
      '\u27DC': '\\multimapinv{}',
      '\u27DD': '\\vlongdash{}',
      '\u27DE': '\\longdashv{}',
      '\u27DF': '\\cirbot{}',
      '\u27E0': '\\lozengeminus{}',
      '\u27E1': '\\concavediamond{}',
      '\u27E2': '\\concavediamondtickleft{}',
      '\u27E3': '\\concavediamondtickright{}',
      '\u27E4': '\\whitesquaretickleft{}',
      '\u27E5': '\\whitesquaretickright{}',
      '\u27E6': '\\llbracket{}',
      '\u27E7': '\\rrbracket{}',
      '\u27EA': '\\lang{}',
      '\u27EB': '\\rang{}',
      '\u27EC': '\\Lbrbrak{}',
      '\u27ED': '\\Rbrbrak{}',
      '\u27EE': '\\lgroup{}',
      '\u27EF': '\\rgroup{}',
      '\u27F0': '\\UUparrow{}',
      '\u27F1': '\\DDownarrow{}',
      '\u27F2': '\\acwgapcirclearrow{}',
      '\u27F3': '\\cwgapcirclearrow{}',
      '\u27F4': '\\rightarrowonoplus{}',
      '\u27F5': '\\longleftarrow{}',
      '\u27F6': '\\longrightarrow{}',
      '\u27F7': '\\longleftrightarrow{}',
      '\u27F8': '\\Longleftarrow{}',
      '\u27F9': '\\Longrightarrow{}',
      '\u27FA': '\\Longleftrightarrow{}',
      '\u27FB': '\\longmapsfrom{}',
      '\u27FC': '\\longmapsto{}',
      '\u27FD': '\\Longmapsfrom{}',
      '\u27FE': '\\Longmapsto{}',
      '\u27FF': '\\sim\\joinrel\\leadsto{}',
      '\u2900': '\\psur{}',
      '\u2901': '\\nVtwoheadrightarrow{}',
      '\u2902': '\\nvLeftarrow{}',
      '\u2903': '\\nvRightarrow{}',
      '\u2904': '\\nvLeftrightarrow{}',
      '\u2905': '\\ElsevierGlyph{E212}',
      '\u2906': '\\Mapsfrom{}',
      '\u2907': '\\Mapsto{}',
      '\u2908': '\\downarrowbarred{}',
      '\u2909': '\\uparrowbarred{}',
      '\u290A': '\\Uuparrow{}',
      '\u290B': '\\Ddownarrow{}',
      '\u290C': '\\leftbkarrow{}',
      '\u290D': '\\rightbkarrow{}',
      '\u290E': '\\leftdbkarrow{}',
      '\u290F': '\\dbkarow{}',
      '\u2910': '\\drbkarow{}',
      '\u2911': '\\rightdotarrow{}',
      '\u2912': '\\UpArrowBar{}',
      '\u2913': '\\DownArrowBar{}',
      '\u2914': '\\pinj{}',
      '\u2915': '\\finj{}',
      '\u2916': '\\bij{}',
      '\u2917': '\\nvtwoheadrightarrowtail{}',
      '\u2918': '\\nVtwoheadrightarrowtail{}',
      '\u2919': '\\lefttail{}',
      '\u291A': '\\righttail{}',
      '\u291B': '\\leftdbltail{}',
      '\u291C': '\\rightdbltail{}',
      '\u291D': '\\diamondleftarrow{}',
      '\u291E': '\\rightarrowdiamond{}',
      '\u291F': '\\diamondleftarrowbar{}',
      '\u2920': '\\barrightarrowdiamond{}',
      '\u2921': '\\nwsearrow{}',
      '\u2922': '\\neswarrow{}',
      '\u2923': '\\ElsevierGlyph{E20C}',
      '\u2924': '\\ElsevierGlyph{E20D}',
      '\u2925': '\\ElsevierGlyph{E20B}',
      '\u2926': '\\ElsevierGlyph{E20A}',
      '\u2927': '\\ElsevierGlyph{E211}',
      '\u2928': '\\ElsevierGlyph{E20E}',
      '\u2929': '\\ElsevierGlyph{E20F}',
      '\u292A': '\\ElsevierGlyph{E210}',
      '\u292B': '\\rdiagovfdiag{}',
      '\u292C': '\\fdiagovrdiag{}',
      '\u292D': '\\seovnearrow{}',
      '\u292E': '\\neovsearrow{}',
      '\u292F': '\\fdiagovnearrow{}',
      '\u2930': '\\rdiagovsearrow{}',
      '\u2931': '\\neovnwarrow{}',
      '\u2932': '\\nwovnearrow{}',
      '\u2933': '\\ElsevierGlyph{E21C}',
      '\u2934': '\\uprightcurvearrow{}',
      '\u2935': '\\downrightcurvedarrow{}',
      '\u2936': '\\ElsevierGlyph{E21A}',
      '\u2937': '\\ElsevierGlyph{E219}',
      '\u2938': '\\cwrightarcarrow{}',
      '\u2939': '\\acwleftarcarrow{}',
      '\u293A': '\\acwoverarcarrow{}',
      '\u293B': '\\acwunderarcarrow{}',
      '\u293C': '\\curvearrowrightminus{}',
      '\u293D': '\\curvearrowleftplus{}',
      '\u293E': '\\cwundercurvearrow{}',
      '\u293F': '\\ccwundercurvearrow{}',
      '\u2940': '\\Elolarr{}',
      '\u2941': '\\Elorarr{}',
      '\u2942': '\\ElzRlarr{}',
      '\u2943': '\\leftarrowshortrightarrow{}',
      '\u2944': '\\ElzrLarr{}',
      '\u2945': '\\rightarrowplus{}',
      '\u2946': '\\leftarrowplus{}',
      '\u2947': '\\Elzrarrx{}',
      '\u2948': '\\leftrightarrowcircle{}',
      '\u2949': '\\twoheaduparrowcircle{}',
      '\u294A': '\\leftrightharpoon{}',
      '\u294B': '\\rightleftharpoon{}',
      '\u294C': '\\updownharpoonrightleft{}',
      '\u294D': '\\updownharpoonleftright{}',
      '\u294E': '\\LeftRightVector{}',
      '\u294F': '\\RightUpDownVector{}',
      '\u2950': '\\DownLeftRightVector{}',
      '\u2951': '\\LeftUpDownVector{}',
      '\u2952': '\\LeftVectorBar{}',
      '\u2953': '\\RightVectorBar{}',
      '\u2954': '\\RightUpVectorBar{}',
      '\u2955': '\\RightDownVectorBar{}',
      '\u2956': '\\DownLeftVectorBar{}',
      '\u2957': '\\DownRightVectorBar{}',
      '\u2958': '\\LeftUpVectorBar{}',
      '\u2959': '\\LeftDownVectorBar{}',
      '\u295A': '\\LeftTeeVector{}',
      '\u295B': '\\RightTeeVector{}',
      '\u295C': '\\RightUpTeeVector{}',
      '\u295D': '\\RightDownTeeVector{}',
      '\u295E': '\\DownLeftTeeVector{}',
      '\u295F': '\\DownRightTeeVector{}',
      '\u2960': '\\LeftUpTeeVector{}',
      '\u2961': '\\LeftDownTeeVector{}',
      '\u2962': '\\leftleftharpoons{}',
      '\u2963': '\\upupharpoons{}',
      '\u2964': '\\rightrightharpoons{}',
      '\u2965': '\\downdownharpoons{}',
      '\u2966': '\\leftrightharpoonsup{}',
      '\u2967': '\\leftrightharpoonsdown{}',
      '\u2968': '\\rightleftharpoonsup{}',
      '\u2969': '\\rightleftharpoonsdown{}',
      '\u296A': '\\leftbarharpoon{}',
      '\u296B': '\\barleftharpoon{}',
      '\u296C': '\\rightbarharpoon{}',
      '\u296D': '\\barrightharpoon{}',
      '\u296E': '\\UpEquilibrium{}',
      '\u296F': '\\ReverseUpEquilibrium{}',
      '\u2970': '\\RoundImplies{}',
      '\u2971': '\\equalrightarrow{}',
      '\u2972': '\\similarrightarrow{}',
      '\u2973': '\\leftarrowsimilar{}',
      '\u2974': '\\rightarrowsimilar{}',
      '\u2975': '\\rightarrowapprox{}',
      '\u2976': '\\ltlarr{}',
      '\u2977': '\\leftarrowless{}',
      '\u2978': '\\gtrarr{}',
      '\u2979': '\\subrarr{}',
      '\u297A': '\\leftarrowsubset{}',
      '\u297B': '\\suplarr{}',
      '\u297C': '\\ElsevierGlyph{E214}',
      '\u297D': '\\ElsevierGlyph{E215}',
      '\u297E': '\\upfishtail{}',
      '\u297F': '\\downfishtail{}',
      '\u2980': '\\Elztfnc{}',
      '\u2981': '\\spot{}',
      '\u2982': '\\typecolon{}',
      '\u2983': '\\lBrace{}',
      '\u2984': '\\rBrace{}',
      '\u2985': '\\ElsevierGlyph{3018}',
      '\u2986': '\\Elroang{}',
      '\u2987': '\\limg{}',
      '\u2988': '\\rimg{}',
      '\u2989': '\\lblot{}',
      '\u298A': '\\rblot{}',
      '\u298B': '\\lbrackubar{}',
      '\u298C': '\\rbrackubar{}',
      '\u298D': '\\lbrackultick{}',
      '\u298E': '\\rbracklrtick{}',
      '\u298F': '\\lbracklltick{}',
      '\u2990': '\\rbrackurtick{}',
      '\u2991': '\\langledot{}',
      '\u2992': '\\rangledot{}',
      '\u2993': '<\\kern-0.58em(',
      '\u2994': '\\ElsevierGlyph{E291}',
      '\u2995': '\\Lparengtr{}',
      '\u2996': '\\Rparenless{}',
      '\u2997': '\\lblkbrbrak{}',
      '\u2998': '\\rblkbrbrak{}',
      '\u2999': '\\Elzddfnc{}',
      '\u299A': '\\vzigzag{}',
      '\u299B': '\\measuredangleleft{}',
      '\u299C': '\\Angle{}',
      '\u299D': '\\rightanglemdot{}',
      '\u299E': '\\angles{}',
      '\u299F': '\\angdnr{}',
      '\u29A0': '\\Elzlpargt{}',
      '\u29A1': '\\sphericalangleup{}',
      '\u29A2': '\\turnangle{}',
      '\u29A3': '\\revangle{}',
      '\u29A4': '\\angleubar{}',
      '\u29A5': '\\revangleubar{}',
      '\u29A6': '\\wideangledown{}',
      '\u29A7': '\\wideangleup{}',
      '\u29A8': '\\measanglerutone{}',
      '\u29A9': '\\measanglelutonw{}',
      '\u29AA': '\\measanglerdtose{}',
      '\u29AB': '\\measangleldtosw{}',
      '\u29AC': '\\measangleurtone{}',
      '\u29AD': '\\measangleultonw{}',
      '\u29AE': '\\measangledrtose{}',
      '\u29AF': '\\measangledltosw{}',
      '\u29B0': '\\revemptyset{}',
      '\u29B1': '\\emptysetobar{}',
      '\u29B2': '\\emptysetocirc{}',
      '\u29B3': '\\emptysetoarr{}',
      '\u29B4': '\\emptysetoarrl{}',
      '\u29B5': '\\ElsevierGlyph{E260}',
      '\u29B6': '\\ElsevierGlyph{E61B}',
      '\u29B7': '\\circledparallel{}',
      '\u29B8': '\\circledbslash{}',
      '\u29B9': '\\operp{}',
      '\u29BA': '\\obot{}',
      '\u29BB': '\\olcross{}',
      '\u29BC': '\\odotslashdot{}',
      '\u29BD': '\\uparrowoncircle{}',
      '\u29BE': '\\circledwhitebullet{}',
      '\u29BF': '\\circledbullet{}',
      '\u29C0': '\\circledless{}',
      '\u29C1': '\\circledgtr{}',
      '\u29C2': '\\cirscir{}',
      '\u29C3': '\\cirE{}',
      '\u29C4': '\\boxslash{}',
      '\u29C5': '\\boxbslash{}',
      '\u29C6': '\\boxast{}',
      '\u29C7': '\\boxcircle{}',
      '\u29C8': '\\boxbox{}',
      '\u29C9': '\\boxonbox{}',
      '\u29CA': '\\ElzLap{}',
      '\u29CB': '\\Elzdefas{}',
      '\u29CC': '\\triangles{}',
      '\u29CD': '\\triangleserifs{}',
      '\u29CE': '\\rtriltri{}',
      '\u29CF': '\\LeftTriangleBar{}',
      '\u29D0': '\\RightTriangleBar{}',
      '\u29D1': '\\lfbowtie{}',
      '\u29D2': '\\rfbowtie{}',
      '\u29D3': '\\fbowtie{}',
      '\u29D4': '\\lftimes{}',
      '\u29D5': '\\rftimes{}',
      '\u29D6': '\\hourglass{}',
      '\u29D7': '\\blackhourglass{}',
      '\u29D8': '\\lvzigzag{}',
      '\u29D9': '\\rvzigzag{}',
      '\u29DA': '\\Lvzigzag{}',
      '\u29DB': '\\Rvzigzag{}',
      '\u29DC': '\\ElsevierGlyph{E372}',
      '\u29DD': '\\tieinfty{}',
      '\u29DE': '\\nvinfty{}',
      '\u29DF': '\\multimapboth{}',
      '\u29E0': '\\laplac{}',
      '\u29E1': '\\lrtriangleeq{}',
      '\u29E2': '\\shuffle{}',
      '\u29E3': '\\eparsl{}',
      '\u29E4': '\\smeparsl{}',
      '\u29E5': '\\eqvparsl{}',
      '\u29E6': '\\gleichstark{}',
      '\u29E7': '\\thermod{}',
      '\u29E8': '\\downtriangleleftblack{}',
      '\u29E9': '\\downtrianglerightblack{}',
      '\u29EA': '\\blackdiamonddownarrow{}',
      '\u29EB': '\\blacklozenge{}',
      '\u29EC': '\\circledownarrow{}',
      '\u29ED': '\\blackcircledownarrow{}',
      '\u29EE': '\\errbarsquare{}',
      '\u29EF': '\\errbarblacksquare{}',
      '\u29F0': '\\errbardiamond{}',
      '\u29F1': '\\errbarblackdiamond{}',
      '\u29F2': '\\errbarcircle{}',
      '\u29F3': '\\errbarblackcircle{}',
      '\u29F4': '\\RuleDelayed{}',
      '\u29F5': '\\setminus{}',
      '\u29F6': '\\dsol{}',
      '\u29F7': '\\rsolbar{}',
      '\u29F8': '\\xsol{}',
      '\u29F9': '\\zhide{}',
      '\u29FA': '\\doubleplus{}',
      '\u29FB': '\\tripleplus{}',
      '\u29FC': '\\lcurvyangle{}',
      '\u29FD': '\\rcurvyangle{}',
      '\u29FE': '\\tplus{}',
      '\u29FF': '\\tminus{}',
      '\u2A00': '\\bigodot{}',
      '\u2A01': '\\bigoplus{}',
      '\u2A02': '\\bigotimes{}',
      '\u2A03': '\\bigcupdot{}',
      '\u2A04': '\\Elxuplus{}',
      '\u2A05': '\\ElzThr{}',
      '\u2A06': '\\Elxsqcup{}',
      '\u2A07': '\\ElzInf{}',
      '\u2A08': '\\ElzSup{}',
      '\u2A09': '\\varprod{}',
      '\u2A0A': '\\modtwosum{}',
      '\u2A0B': '\\sumint{}',
      '\u2A0C': '\\iiiint{}',
      '\u2A0D': '\\ElzCint{}',
      '\u2A0E': '\\intBar{}',
      '\u2A0F': '\\clockoint{}',
      '\u2A10': '\\ElsevierGlyph{E395}',
      '\u2A11': '\\awint{}',
      '\u2A12': '\\rppolint{}',
      '\u2A13': '\\scpolint{}',
      '\u2A14': '\\npolint{}',
      '\u2A15': '\\pointint{}',
      '\u2A16': '\\sqrint{}',
      '\u2A17': '\\intlarhk{}',
      '\u2A18': '\\intx{}',
      '\u2A19': '\\intcap{}',
      '\u2A1A': '\\intcup{}',
      '\u2A1B': '\\upint{}',
      '\u2A1C': '\\lowint{}',
      '\u2A1D': '\\Join{}',
      '\u2A1E': '\\bigtriangleleft{}',
      '\u2A1F': '\\zcmp{}',
      '\u2A20': '\\zpipe{}',
      '\u2A21': '\\zproject{}',
      '\u2A22': '\\ringplus{}',
      '\u2A23': '\\plushat{}',
      '\u2A24': '\\simplus{}',
      '\u2A25': '\\ElsevierGlyph{E25A}',
      '\u2A26': '\\plussim{}',
      '\u2A27': '\\plussubtwo{}',
      '\u2A28': '\\plustrif{}',
      '\u2A29': '\\commaminus{}',
      '\u2A2A': '\\ElsevierGlyph{E25B}',
      '\u2A2B': '\\minusfdots{}',
      '\u2A2C': '\\minusrdots{}',
      '\u2A2D': '\\ElsevierGlyph{E25C}',
      '\u2A2E': '\\ElsevierGlyph{E25D}',
      '\u2A2F': '\\ElzTimes{}',
      '\u2A30': '\\dottimes{}',
      '\u2A31': '\\timesbar{}',
      '\u2A32': '\\btimes{}',
      '\u2A33': '\\smashtimes{}',
      '\u2A34': '\\ElsevierGlyph{E25E}',
      '\u2A35': '\\ElsevierGlyph{E25E}',
      '\u2A36': '\\otimeshat{}',
      '\u2A37': '\\Otimes{}',
      '\u2A38': '\\odiv{}',
      '\u2A39': '\\triangleplus{}',
      '\u2A3A': '\\triangleminus{}',
      '\u2A3B': '\\triangletimes{}',
      '\u2A3C': '\\ElsevierGlyph{E259}',
      '\u2A3D': '\\intprodr{}',
      '\u2A3E': '\\fcmp{}',
      '\u2A3F': '\\amalg{}',
      '\u2A40': '\\capdot{}',
      '\u2A41': '\\uminus{}',
      '\u2A42': '\\barcup{}',
      '\u2A43': '\\barcap{}',
      '\u2A44': '\\capwedge{}',
      '\u2A45': '\\cupvee{}',
      '\u2A46': '\\cupovercap{}',
      '\u2A47': '\\capovercup{}',
      '\u2A48': '\\cupbarcap{}',
      '\u2A49': '\\capbarcup{}',
      '\u2A4A': '\\twocups{}',
      '\u2A4B': '\\twocaps{}',
      '\u2A4C': '\\closedvarcup{}',
      '\u2A4D': '\\closedvarcap{}',
      '\u2A4E': '\\Sqcap{}',
      '\u2A4F': '\\Sqcup{}',
      '\u2A50': '\\closedvarcupsmashprod{}',
      '\u2A51': '\\wedgeodot{}',
      '\u2A52': '\\veeodot{}',
      '\u2A53': '\\ElzAnd{}',
      '\u2A54': '\\ElzOr{}',
      '\u2A55': '\\ElsevierGlyph{E36E}',
      '\u2A56': '\\ElOr{}',
      '\u2A57': '\\bigslopedvee{}',
      '\u2A58': '\\bigslopedwedge{}',
      '\u2A59': '\\veeonwedge{}',
      '\u2A5A': '\\wedgemidvert{}',
      '\u2A5B': '\\veemidvert{}',
      '\u2A5C': '\\midbarwedge{}',
      '\u2A5D': '\\midbarvee{}',
      '\u2A5E': '\\perspcorrespond{}',
      '\u2A5F': '\\Elzminhat{}',
      '\u2A60': '\\wedgedoublebar{}',
      '\u2A61': '\\varveebar{}',
      '\u2A62': '\\doublebarvee{}',
      '\u2A63': '\\ElsevierGlyph{225A}',
      '\u2A64': '\\dsub{}',
      '\u2A65': '\\rsub{}',
      '\u2A66': '\\eqdot{}',
      '\u2A67': '\\dotequiv{}',
      '\u2A68': '\\equivVert{}',
      '\u2A69': '\\equivVvert{}',
      '\u2A6A': '\\dotsim{}',
      '\u2A6B': '\\simrdots{}',
      '\u2A6C': '\\simminussim{}',
      '\u2A6D': '\\congdot{}',
      '\u2A6E': '\\stackrel{*}{=}',
      '\u2A6F': '\\hatapprox{}',
      '\u2A70': '\\approxeqq{}',
      '\u2A71': '\\eqqplus{}',
      '\u2A72': '\\pluseqq{}',
      '\u2A73': '\\eqqsim{}',
      '\u2A74': '\\Coloneqq{}',
      '\u2A75': '\\Equal{}',
      '\u2A76': '\\Same{}',
      '\u2A77': '\\ddotseq{}',
      '\u2A78': '\\equivDD{}',
      '\u2A79': '\\ltcir{}',
      '\u2A7A': '\\gtcir{}',
      '\u2A7B': '\\ltquest{}',
      '\u2A7C': '\\gtquest{}',
      '\u2A7D': '\\leqslant{}',
      '\u2A7E': '\\geqslant{}',
      '\u2A7F': '\\lesdot{}',
      '\u2A80': '\\gesdot{}',
      '\u2A81': '\\lesdoto{}',
      '\u2A82': '\\gesdoto{}',
      '\u2A83': '\\lesdotor{}',
      '\u2A84': '\\gesdotol{}',
      '\u2A85': '\\lessapprox{}',
      '\u2A86': '\\gtrapprox{}',
      '\u2A87': '\\lneq{}',
      '\u2A88': '\\gneq{}',
      '\u2A89': '\\lnapprox{}',
      '\u2A8A': '\\gnapprox{}',
      '\u2A8B': '\\lesseqqgtr{}',
      '\u2A8C': '\\gtreqqless{}',
      '\u2A8D': '\\lsime{}',
      '\u2A8E': '\\gsime{}',
      '\u2A8F': '\\lsimg{}',
      '\u2A90': '\\gsiml{}',
      '\u2A91': '\\lgE{}',
      '\u2A92': '\\glE{}',
      '\u2A93': '\\lesges{}',
      '\u2A94': '\\gesles{}',
      '\u2A95': '\\eqslantless{}',
      '\u2A96': '\\eqslantgtr{}',
      '\u2A97': '\\elsdot{}',
      '\u2A98': '\\egsdot{}',
      '\u2A99': '\\eqqless{}',
      '\u2A9A': '\\eqqgtr{}',
      '\u2A9B': '\\eqqslantless{}',
      '\u2A9C': '\\eqqslantgtr{}',
      '\u2A9D': '\\Pisymbol{ppi020}{117}',
      '\u2A9E': '\\Pisymbol{ppi020}{105}',
      '\u2A9F': '\\simlE{}',
      '\u2AA0': '\\simgE{}',
      '\u2AA1': '\\NestedLessLess{}',
      '\u2AA2': '\\NestedGreaterGreater{}',
      '\u2AA3': '\\partialmeetcontraction{}',
      '\u2AA4': '\\glj{}',
      '\u2AA5': '\\gla{}',
      '\u2AA6': '\\leftslice{}',
      '\u2AA7': '\\rightslice{}',
      '\u2AA8': '\\lescc{}',
      '\u2AA9': '\\gescc{}',
      '\u2AAA': '\\smt{}',
      '\u2AAB': '\\lat{}',
      '\u2AAC': '\\smte{}',
      '\u2AAD': '\\late{}',
      '\u2AAE': '\\bumpeqq{}',
      '\u2AAF': '\\preceq{}',
      '\u2AB0': '\\succeq{}',
      '\u2AB1': '\\precneq{}',
      '\u2AB2': '\\succneq{}',
      '\u2AB3': '\\preceqq{}',
      '\u2AB4': '\\succeqq{}',
      '\u2AB5': '\\precneqq{}',
      '\u2AB6': '\\succneqq{}',
      '\u2AB7': '\\precapprox{}',
      '\u2AB8': '\\succapprox{}',
      '\u2AB9': '\\precnapprox{}',
      '\u2ABA': '\\succnapprox{}',
      '\u2ABB': '\\llcurly{}',
      '\u2ABC': '\\ggcurly{}',
      '\u2ABD': '\\subsetdot{}',
      '\u2ABE': '\\supsetdot{}',
      '\u2ABF': '\\subsetplus{}',
      '\u2AC0': '\\supsetplus{}',
      '\u2AC1': '\\submult{}',
      '\u2AC2': '\\supmult{}',
      '\u2AC3': '\\subedot{}',
      '\u2AC4': '\\supedot{}',
      '\u2AC5': '\\subseteqq{}',
      '\u2AC6': '\\supseteqq{}',
      '\u2AC7': '\\subsim{}',
      '\u2AC8': '\\supsim{}',
      '\u2AC9': '\\subsetapprox{}',
      '\u2ACA': '\\supsetapprox{}',
      '\u2ACB': '\\subsetneqq{}',
      '\u2ACC': '\\supsetneqq{}',
      '\u2ACD': '\\lsqhook{}',
      '\u2ACE': '\\rsqhook{}',
      '\u2ACF': '\\csub{}',
      '\u2AD0': '\\csup{}',
      '\u2AD1': '\\csube{}',
      '\u2AD2': '\\csupe{}',
      '\u2AD3': '\\subsup{}',
      '\u2AD4': '\\supsub{}',
      '\u2AD5': '\\subsub{}',
      '\u2AD6': '\\supsup{}',
      '\u2AD7': '\\suphsub{}',
      '\u2AD8': '\\supdsub{}',
      '\u2AD9': '\\forkv{}',
      '\u2ADA': '\\topfork{}',
      '\u2ADB': '\\mlcp{}',
      '\u2ADD\u0338': '\\forks{}',
      '\u2ADD': '\\forksnot{}',
      '\u2ADE': '\\shortlefttack{}',
      '\u2ADF': '\\shortdowntack{}',
      '\u2AE0': '\\shortuptack{}',
      '\u2AE1': '\\perps{}',
      '\u2AE2': '\\vDdash{}',
      '\u2AE3': '\\dashV{}',
      '\u2AE4': '\\Dashv{}',
      '\u2AE5': '\\DashV{}',
      '\u2AE6': '\\varVdash{}',
      '\u2AE7': '\\Barv{}',
      '\u2AE8': '\\vBar{}',
      '\u2AE9': '\\vBarv{}',
      '\u2AEA': '\\Top{}',
      '\u2AEB': '\\ElsevierGlyph{E30D}',
      '\u2AEC': '\\Not{}',
      '\u2AED': '\\bNot{}',
      '\u2AEE': '\\revnmid{}',
      '\u2AEF': '\\cirmid{}',
      '\u2AF0': '\\midcir{}',
      '\u2AF1': '\\topcir{}',
      '\u2AF2': '\\nhpar{}',
      '\u2AF3': '\\parsim{}',
      '\u2AF4': '\\interleave{}',
      '\u2AF5': '\\nhVvert{}',
      '\u2AF6': '\\Elztdcol{}',
      '\u2AF7': '\\lllnest{}',
      '\u2AF8': '\\gggnest{}',
      '\u2AF9': '\\leqqslant{}',
      '\u2AFA': '\\geqqslant{}',
      '\u2AFB': '\\trslash{}',
      '\u2AFC': '\\biginterleave{}',
      '\u2AFD': '{{/}\\!\\!{/}}',
      '\u2AFE': '\\talloblong{}',
      '\u2AFF': '\\bigtalloblong{}',
      '\u2B12': '\\squaretopblack{}',
      '\u2B13': '\\squarebotblack{}',
      '\u2B14': '\\squareurblack{}',
      '\u2B15': '\\squarellblack{}',
      '\u2B16': '\\diamondleftblack{}',
      '\u2B17': '\\diamondrightblack{}',
      '\u2B18': '\\diamondtopblack{}',
      '\u2B19': '\\diamondbotblack{}',
      '\u2B1A': '\\dottedsquare{}',
      '\u2B1B': '\\blacksquare{}',
      '\u2B1C': '\\square{}',
      '\u2B1D': '\\vysmblksquare{}',
      '\u2B1E': '\\vysmwhtsquare{}',
      '\u2B1F': '\\pentagonblack{}',
      '\u2B20': '\\pentagon{}',
      '\u2B21': '\\varhexagon{}',
      '\u2B22': '\\varhexagonblack{}',
      '\u2B23': '\\hexagonblack{}',
      '\u2B24': '\\lgblkcircle{}',
      '\u2B25': '\\mdblkdiamond{}',
      '\u2B26': '\\mdwhtdiamond{}',
      '\u2B27': '\\mdblklozenge{}',
      '\u2B28': '\\mdwhtlozenge{}',
      '\u2B29': '\\smblkdiamond{}',
      '\u2B2A': '\\smblklozenge{}',
      '\u2B2B': '\\smwhtlozenge{}',
      '\u2B2C': '\\blkhorzoval{}',
      '\u2B2D': '\\whthorzoval{}',
      '\u2B2E': '\\blkvertoval{}',
      '\u2B2F': '\\whtvertoval{}',
      '\u2B30': '\\circleonleftarrow{}',
      '\u2B31': '\\leftthreearrows{}',
      '\u2B32': '\\leftarrowonoplus{}',
      '\u2B33': '\\longleftsquigarrow{}',
      '\u2B34': '\\nvtwoheadleftarrow{}',
      '\u2B35': '\\nVtwoheadleftarrow{}',
      '\u2B36': '\\twoheadmapsfrom{}',
      '\u2B37': '\\twoheadleftdbkarrow{}',
      '\u2B38': '\\leftdotarrow{}',
      '\u2B39': '\\nvleftarrowtail{}',
      '\u2B3A': '\\nVleftarrowtail{}',
      '\u2B3B': '\\twoheadleftarrowtail{}',
      '\u2B3C': '\\nvtwoheadleftarrowtail{}',
      '\u2B3D': '\\nVtwoheadleftarrowtail{}',
      '\u2B3E': '\\leftarrowx{}',
      '\u2B3F': '\\leftcurvedarrow{}',
      '\u2B40': '\\equalleftarrow{}',
      '\u2B41': '\\bsimilarleftarrow{}',
      '\u2B42': '\\leftarrowbackapprox{}',
      '\u2B43': '\\rightarrowgtr{}',
      '\u2B44': '\\rightarrowsupset{}',
      '\u2B45': '\\LLeftarrow{}',
      '\u2B46': '\\RRightarrow{}',
      '\u2B47': '\\bsimilarrightarrow{}',
      '\u2B48': '\\rightarrowbackapprox{}',
      '\u2B49': '\\similarleftarrow{}',
      '\u2B4A': '\\leftarrowapprox{}',
      '\u2B4B': '\\leftarrowbsimilar{}',
      '\u2B4C': '\\rightarrowbsimilar{}',
      '\u2B50': '\\medwhitestar{}',
      '\u2B51': '\\medblackstar{}',
      '\u2B52': '\\smwhitestar{}',
      '\u2B53': '\\rightpentagonblack{}',
      '\u2B54': '\\rightpentagon{}',
      '\u300A': '\\ElsevierGlyph{300A}',
      '\u300B': '\\ElsevierGlyph{300B}',
      '\u3012': '\\postalmark{}',
      '\u3014': '\\lbrbrak{}',
      '\u3015': '\\rbrbrak{}',
      '\u3018': '\\ElsevierGlyph{3018}',
      '\u3019': '\\ElsevierGlyph{3019}',
      '\u301A': '\\openbracketleft{}',
      '\u301B': '\\openbracketright{}',
      '\u3030': '\\hzigzag{}',
      '\uD835\uDC00': '\\mathbf{A}',
      '\uD835\uDC01': '\\mathbf{B}',
      '\uD835\uDC02': '\\mathbf{C}',
      '\uD835\uDC03': '\\mathbf{D}',
      '\uD835\uDC04': '\\mathbf{E}',
      '\uD835\uDC05': '\\mathbf{F}',
      '\uD835\uDC06': '\\mathbf{G}',
      '\uD835\uDC07': '\\mathbf{H}',
      '\uD835\uDC08': '\\mathbf{I}',
      '\uD835\uDC09': '\\mathbf{J}',
      '\uD835\uDC0A': '\\mathbf{K}',
      '\uD835\uDC0B': '\\mathbf{L}',
      '\uD835\uDC0C': '\\mathbf{M}',
      '\uD835\uDC0D': '\\mathbf{N}',
      '\uD835\uDC0E': '\\mathbf{O}',
      '\uD835\uDC0F': '\\mathbf{P}',
      '\uD835\uDC10': '\\mathbf{Q}',
      '\uD835\uDC11': '\\mathbf{R}',
      '\uD835\uDC12': '\\mathbf{S}',
      '\uD835\uDC13': '\\mathbf{T}',
      '\uD835\uDC14': '\\mathbf{U}',
      '\uD835\uDC15': '\\mathbf{V}',
      '\uD835\uDC16': '\\mathbf{W}',
      '\uD835\uDC17': '\\mathbf{X}',
      '\uD835\uDC18': '\\mathbf{Y}',
      '\uD835\uDC19': '\\mathbf{Z}',
      '\uD835\uDC1A': '\\mathbf{a}',
      '\uD835\uDC1B': '\\mathbf{b}',
      '\uD835\uDC1C': '\\mathbf{c}',
      '\uD835\uDC1D': '\\mathbf{d}',
      '\uD835\uDC1E': '\\mathbf{e}',
      '\uD835\uDC1F': '\\mathbf{f}',
      '\uD835\uDC20': '\\mathbf{g}',
      '\uD835\uDC21': '\\mathbf{h}',
      '\uD835\uDC22': '\\mathbf{i}',
      '\uD835\uDC23': '\\mathbf{j}',
      '\uD835\uDC24': '\\mathbf{k}',
      '\uD835\uDC25': '\\mathbf{l}',
      '\uD835\uDC26': '\\mathbf{m}',
      '\uD835\uDC27': '\\mathbf{n}',
      '\uD835\uDC28': '\\mathbf{o}',
      '\uD835\uDC29': '\\mathbf{p}',
      '\uD835\uDC2A': '\\mathbf{q}',
      '\uD835\uDC2B': '\\mathbf{r}',
      '\uD835\uDC2C': '\\mathbf{s}',
      '\uD835\uDC2D': '\\mathbf{t}',
      '\uD835\uDC2E': '\\mathbf{u}',
      '\uD835\uDC2F': '\\mathbf{v}',
      '\uD835\uDC30': '\\mathbf{w}',
      '\uD835\uDC31': '\\mathbf{x}',
      '\uD835\uDC32': '\\mathbf{y}',
      '\uD835\uDC33': '\\mathbf{z}',
      '\uD835\uDC34': '\\mathsl{A}',
      '\uD835\uDC35': '\\mathsl{B}',
      '\uD835\uDC36': '\\mathsl{C}',
      '\uD835\uDC37': '\\mathsl{D}',
      '\uD835\uDC38': '\\mathsl{E}',
      '\uD835\uDC39': '\\mathsl{F}',
      '\uD835\uDC3A': '\\mathsl{G}',
      '\uD835\uDC3B': '\\mathsl{H}',
      '\uD835\uDC3C': '\\mathsl{I}',
      '\uD835\uDC3D': '\\mathsl{J}',
      '\uD835\uDC3E': '\\mathsl{K}',
      '\uD835\uDC3F': '\\mathsl{L}',
      '\uD835\uDC40': '\\mathsl{M}',
      '\uD835\uDC41': '\\mathsl{N}',
      '\uD835\uDC42': '\\mathsl{O}',
      '\uD835\uDC43': '\\mathsl{P}',
      '\uD835\uDC44': '\\mathsl{Q}',
      '\uD835\uDC45': '\\mathsl{R}',
      '\uD835\uDC46': '\\mathsl{S}',
      '\uD835\uDC47': '\\mathsl{T}',
      '\uD835\uDC48': '\\mathsl{U}',
      '\uD835\uDC49': '\\mathsl{V}',
      '\uD835\uDC4A': '\\mathsl{W}',
      '\uD835\uDC4B': '\\mathsl{X}',
      '\uD835\uDC4C': '\\mathsl{Y}',
      '\uD835\uDC4D': '\\mathsl{Z}',
      '\uD835\uDC4E': '\\mathsl{a}',
      '\uD835\uDC4F': '\\mathsl{b}',
      '\uD835\uDC50': '\\mathsl{c}',
      '\uD835\uDC51': '\\mathsl{d}',
      '\uD835\uDC52': '\\mathsl{e}',
      '\uD835\uDC53': '\\mathsl{f}',
      '\uD835\uDC54': '\\mathsl{g}',
      '\uD835\uDC56': '\\mathsl{i}',
      '\uD835\uDC57': '\\mathsl{j}',
      '\uD835\uDC58': '\\mathsl{k}',
      '\uD835\uDC59': '\\mathsl{l}',
      '\uD835\uDC5A': '\\mathsl{m}',
      '\uD835\uDC5B': '\\mathsl{n}',
      '\uD835\uDC5C': '\\mathsl{o}',
      '\uD835\uDC5D': '\\mathsl{p}',
      '\uD835\uDC5E': '\\mathsl{q}',
      '\uD835\uDC5F': '\\mathsl{r}',
      '\uD835\uDC60': '\\mathsl{s}',
      '\uD835\uDC61': '\\mathsl{t}',
      '\uD835\uDC62': '\\mathsl{u}',
      '\uD835\uDC63': '\\mathsl{v}',
      '\uD835\uDC64': '\\mathsl{w}',
      '\uD835\uDC65': '\\mathsl{x}',
      '\uD835\uDC66': '\\mathsl{y}',
      '\uD835\uDC67': '\\mathsl{z}',
      '\uD835\uDC68': '\\mathbit{A}',
      '\uD835\uDC69': '\\mathbit{B}',
      '\uD835\uDC6A': '\\mathbit{C}',
      '\uD835\uDC6B': '\\mathbit{D}',
      '\uD835\uDC6C': '\\mathbit{E}',
      '\uD835\uDC6D': '\\mathbit{F}',
      '\uD835\uDC6E': '\\mathbit{G}',
      '\uD835\uDC6F': '\\mathbit{H}',
      '\uD835\uDC70': '\\mathbit{I}',
      '\uD835\uDC71': '\\mathbit{J}',
      '\uD835\uDC72': '\\mathbit{K}',
      '\uD835\uDC73': '\\mathbit{L}',
      '\uD835\uDC74': '\\mathbit{M}',
      '\uD835\uDC75': '\\mathbit{N}',
      '\uD835\uDC76': '\\mathbit{O}',
      '\uD835\uDC77': '\\mathbit{P}',
      '\uD835\uDC78': '\\mathbit{Q}',
      '\uD835\uDC79': '\\mathbit{R}',
      '\uD835\uDC7A': '\\mathbit{S}',
      '\uD835\uDC7B': '\\mathbit{T}',
      '\uD835\uDC7C': '\\mathbit{U}',
      '\uD835\uDC7D': '\\mathbit{V}',
      '\uD835\uDC7E': '\\mathbit{W}',
      '\uD835\uDC7F': '\\mathbit{X}',
      '\uD835\uDC80': '\\mathbit{Y}',
      '\uD835\uDC81': '\\mathbit{Z}',
      '\uD835\uDC82': '\\mathbit{a}',
      '\uD835\uDC83': '\\mathbit{b}',
      '\uD835\uDC84': '\\mathbit{c}',
      '\uD835\uDC85': '\\mathbit{d}',
      '\uD835\uDC86': '\\mathbit{e}',
      '\uD835\uDC87': '\\mathbit{f}',
      '\uD835\uDC88': '\\mathbit{g}',
      '\uD835\uDC89': '\\mathbit{h}',
      '\uD835\uDC8A': '\\mathbit{i}',
      '\uD835\uDC8B': '\\mathbit{j}',
      '\uD835\uDC8C': '\\mathbit{k}',
      '\uD835\uDC8D': '\\mathbit{l}',
      '\uD835\uDC8E': '\\mathbit{m}',
      '\uD835\uDC8F': '\\mathbit{n}',
      '\uD835\uDC90': '\\mathbit{o}',
      '\uD835\uDC91': '\\mathbit{p}',
      '\uD835\uDC92': '\\mathbit{q}',
      '\uD835\uDC93': '\\mathbit{r}',
      '\uD835\uDC94': '\\mathbit{s}',
      '\uD835\uDC95': '\\mathbit{t}',
      '\uD835\uDC96': '\\mathbit{u}',
      '\uD835\uDC97': '\\mathbit{v}',
      '\uD835\uDC98': '\\mathbit{w}',
      '\uD835\uDC99': '\\mathbit{x}',
      '\uD835\uDC9A': '\\mathbit{y}',
      '\uD835\uDC9B': '\\mathbit{z}',
      '\uD835\uDC9C': '\\mathscr{A}',
      '\uD835\uDC9E': '\\mathscr{C}',
      '\uD835\uDC9F': '\\mathscr{D}',
      '\uD835\uDCA2': '\\mathscr{G}',
      '\uD835\uDCA5': '\\mathscr{J}',
      '\uD835\uDCA6': '\\mathscr{K}',
      '\uD835\uDCA9': '\\mathscr{N}',
      '\uD835\uDCAA': '\\mathscr{O}',
      '\uD835\uDCAB': '\\mathscr{P}',
      '\uD835\uDCAC': '\\mathscr{Q}',
      '\uD835\uDCAE': '\\mathscr{S}',
      '\uD835\uDCAF': '\\mathscr{T}',
      '\uD835\uDCB0': '\\mathscr{U}',
      '\uD835\uDCB1': '\\mathscr{V}',
      '\uD835\uDCB2': '\\mathscr{W}',
      '\uD835\uDCB3': '\\mathscr{X}',
      '\uD835\uDCB4': '\\mathscr{Y}',
      '\uD835\uDCB5': '\\mathscr{Z}',
      '\uD835\uDCB6': '\\mathscr{a}',
      '\uD835\uDCB7': '\\mathscr{b}',
      '\uD835\uDCB8': '\\mathscr{c}',
      '\uD835\uDCB9': '\\mathscr{d}',
      '\uD835\uDCBB': '\\mathscr{f}',
      '\uD835\uDCBD': '\\mathscr{h}',
      '\uD835\uDCBE': '\\mathscr{i}',
      '\uD835\uDCBF': '\\mathscr{j}',
      '\uD835\uDCC0': '\\mathscr{k}',
      '\uD835\uDCC1': '\\mathscr{l}',
      '\uD835\uDCC2': '\\mathscr{m}',
      '\uD835\uDCC3': '\\mathscr{n}',
      '\uD835\uDCC5': '\\mathscr{p}',
      '\uD835\uDCC6': '\\mathscr{q}',
      '\uD835\uDCC7': '\\mathscr{r}',
      '\uD835\uDCC8': '\\mathscr{s}',
      '\uD835\uDCC9': '\\mathscr{t}',
      '\uD835\uDCCA': '\\mathscr{u}',
      '\uD835\uDCCB': '\\mathscr{v}',
      '\uD835\uDCCC': '\\mathscr{w}',
      '\uD835\uDCCD': '\\mathscr{x}',
      '\uD835\uDCCE': '\\mathscr{y}',
      '\uD835\uDCCF': '\\mathscr{z}',
      '\uD835\uDCD0': '\\mathmit{A}',
      '\uD835\uDCD1': '\\mathmit{B}',
      '\uD835\uDCD2': '\\mathmit{C}',
      '\uD835\uDCD3': '\\mathmit{D}',
      '\uD835\uDCD4': '\\mathmit{E}',
      '\uD835\uDCD5': '\\mathmit{F}',
      '\uD835\uDCD6': '\\mathmit{G}',
      '\uD835\uDCD7': '\\mathmit{H}',
      '\uD835\uDCD8': '\\mathmit{I}',
      '\uD835\uDCD9': '\\mathmit{J}',
      '\uD835\uDCDA': '\\mathmit{K}',
      '\uD835\uDCDB': '\\mathmit{L}',
      '\uD835\uDCDC': '\\mathmit{M}',
      '\uD835\uDCDD': '\\mathmit{N}',
      '\uD835\uDCDE': '\\mathmit{O}',
      '\uD835\uDCDF': '\\mathmit{P}',
      '\uD835\uDCE0': '\\mathmit{Q}',
      '\uD835\uDCE1': '\\mathmit{R}',
      '\uD835\uDCE2': '\\mathmit{S}',
      '\uD835\uDCE3': '\\mathmit{T}',
      '\uD835\uDCE4': '\\mathmit{U}',
      '\uD835\uDCE5': '\\mathmit{V}',
      '\uD835\uDCE6': '\\mathmit{W}',
      '\uD835\uDCE7': '\\mathmit{X}',
      '\uD835\uDCE8': '\\mathmit{Y}',
      '\uD835\uDCE9': '\\mathmit{Z}',
      '\uD835\uDCEA': '\\mathmit{a}',
      '\uD835\uDCEB': '\\mathmit{b}',
      '\uD835\uDCEC': '\\mathmit{c}',
      '\uD835\uDCED': '\\mathmit{d}',
      '\uD835\uDCEE': '\\mathmit{e}',
      '\uD835\uDCEF': '\\mathmit{f}',
      '\uD835\uDCF0': '\\mathmit{g}',
      '\uD835\uDCF1': '\\mathmit{h}',
      '\uD835\uDCF2': '\\mathmit{i}',
      '\uD835\uDCF3': '\\mathmit{j}',
      '\uD835\uDCF4': '\\mathmit{k}',
      '\uD835\uDCF5': '\\mathmit{l}',
      '\uD835\uDCF6': '\\mathmit{m}',
      '\uD835\uDCF7': '\\mathmit{n}',
      '\uD835\uDCF8': '\\mathmit{o}',
      '\uD835\uDCF9': '\\mathmit{p}',
      '\uD835\uDCFA': '\\mathmit{q}',
      '\uD835\uDCFB': '\\mathmit{r}',
      '\uD835\uDCFC': '\\mathmit{s}',
      '\uD835\uDCFD': '\\mathmit{t}',
      '\uD835\uDCFE': '\\mathmit{u}',
      '\uD835\uDCFF': '\\mathmit{v}',
      '\uD835\uDD00': '\\mathmit{w}',
      '\uD835\uDD01': '\\mathmit{x}',
      '\uD835\uDD02': '\\mathmit{y}',
      '\uD835\uDD03': '\\mathmit{z}',
      '\uD835\uDD04': '\\mathfrak{A}',
      '\uD835\uDD05': '\\mathfrak{B}',
      '\uD835\uDD07': '\\mathfrak{D}',
      '\uD835\uDD08': '\\mathfrak{E}',
      '\uD835\uDD09': '\\mathfrak{F}',
      '\uD835\uDD0A': '\\mathfrak{G}',
      '\uD835\uDD0D': '\\mathfrak{J}',
      '\uD835\uDD0E': '\\mathfrak{K}',
      '\uD835\uDD0F': '\\mathfrak{L}',
      '\uD835\uDD10': '\\mathfrak{M}',
      '\uD835\uDD11': '\\mathfrak{N}',
      '\uD835\uDD12': '\\mathfrak{O}',
      '\uD835\uDD13': '\\mathfrak{P}',
      '\uD835\uDD14': '\\mathfrak{Q}',
      '\uD835\uDD16': '\\mathfrak{S}',
      '\uD835\uDD17': '\\mathfrak{T}',
      '\uD835\uDD18': '\\mathfrak{U}',
      '\uD835\uDD19': '\\mathfrak{V}',
      '\uD835\uDD1A': '\\mathfrak{W}',
      '\uD835\uDD1B': '\\mathfrak{X}',
      '\uD835\uDD1C': '\\mathfrak{Y}',
      '\uD835\uDD1E': '\\mathfrak{a}',
      '\uD835\uDD1F': '\\mathfrak{b}',
      '\uD835\uDD20': '\\mathfrak{c}',
      '\uD835\uDD21': '\\mathfrak{d}',
      '\uD835\uDD22': '\\mathfrak{e}',
      '\uD835\uDD23': '\\mathfrak{f}',
      '\uD835\uDD24': '\\mathfrak{g}',
      '\uD835\uDD25': '\\mathfrak{h}',
      '\uD835\uDD26': '\\mathfrak{i}',
      '\uD835\uDD27': '\\mathfrak{j}',
      '\uD835\uDD28': '\\mathfrak{k}',
      '\uD835\uDD29': '\\mathfrak{l}',
      '\uD835\uDD2A': '\\mathfrak{m}',
      '\uD835\uDD2B': '\\mathfrak{n}',
      '\uD835\uDD2C': '\\mathfrak{o}',
      '\uD835\uDD2D': '\\mathfrak{p}',
      '\uD835\uDD2E': '\\mathfrak{q}',
      '\uD835\uDD2F': '\\mathfrak{r}',
      '\uD835\uDD30': '\\mathfrak{s}',
      '\uD835\uDD31': '\\mathfrak{t}',
      '\uD835\uDD32': '\\mathfrak{u}',
      '\uD835\uDD33': '\\mathfrak{v}',
      '\uD835\uDD34': '\\mathfrak{w}',
      '\uD835\uDD35': '\\mathfrak{x}',
      '\uD835\uDD36': '\\mathfrak{y}',
      '\uD835\uDD37': '\\mathfrak{z}',
      '\uD835\uDD38': '\\mathbb{A}',
      '\uD835\uDD39': '\\mathbb{B}',
      '\uD835\uDD3B': '\\mathbb{D}',
      '\uD835\uDD3C': '\\mathbb{E}',
      '\uD835\uDD3D': '\\mathbb{F}',
      '\uD835\uDD3E': '\\mathbb{G}',
      '\uD835\uDD40': '\\mathbb{I}',
      '\uD835\uDD41': '\\mathbb{J}',
      '\uD835\uDD42': '\\mathbb{K}',
      '\uD835\uDD43': '\\mathbb{L}',
      '\uD835\uDD44': '\\mathbb{M}',
      '\uD835\uDD46': '\\mathbb{O}',
      '\uD835\uDD4A': '\\mathbb{S}',
      '\uD835\uDD4B': '\\mathbb{T}',
      '\uD835\uDD4C': '\\mathbb{U}',
      '\uD835\uDD4D': '\\mathbb{V}',
      '\uD835\uDD4E': '\\mathbb{W}',
      '\uD835\uDD4F': '\\mathbb{X}',
      '\uD835\uDD50': '\\mathbb{Y}',
      '\uD835\uDD52': '\\mathbb{a}',
      '\uD835\uDD53': '\\mathbb{b}',
      '\uD835\uDD54': '\\mathbb{c}',
      '\uD835\uDD55': '\\mathbb{d}',
      '\uD835\uDD56': '\\mathbb{e}',
      '\uD835\uDD57': '\\mathbb{f}',
      '\uD835\uDD58': '\\mathbb{g}',
      '\uD835\uDD59': '\\mathbb{h}',
      '\uD835\uDD5A': '\\mathbb{i}',
      '\uD835\uDD5B': '\\mathbb{j}',
      '\uD835\uDD5C': '\\mathbb{k}',
      '\uD835\uDD5D': '\\mathbb{l}',
      '\uD835\uDD5E': '\\mathbb{m}',
      '\uD835\uDD5F': '\\mathbb{n}',
      '\uD835\uDD60': '\\mathbb{o}',
      '\uD835\uDD61': '\\mathbb{p}',
      '\uD835\uDD62': '\\mathbb{q}',
      '\uD835\uDD63': '\\mathbb{r}',
      '\uD835\uDD64': '\\mathbb{s}',
      '\uD835\uDD65': '\\mathbb{t}',
      '\uD835\uDD66': '\\mathbb{u}',
      '\uD835\uDD67': '\\mathbb{v}',
      '\uD835\uDD68': '\\mathbb{w}',
      '\uD835\uDD69': '\\mathbb{x}',
      '\uD835\uDD6A': '\\mathbb{y}',
      '\uD835\uDD6B': '\\mathbb{z}',
      '\uD835\uDD6C': '\\mathslbb{A}',
      '\uD835\uDD6D': '\\mathslbb{B}',
      '\uD835\uDD6E': '\\mathslbb{C}',
      '\uD835\uDD6F': '\\mathslbb{D}',
      '\uD835\uDD70': '\\mathslbb{E}',
      '\uD835\uDD71': '\\mathslbb{F}',
      '\uD835\uDD72': '\\mathslbb{G}',
      '\uD835\uDD73': '\\mathslbb{H}',
      '\uD835\uDD74': '\\mathslbb{I}',
      '\uD835\uDD75': '\\mathslbb{J}',
      '\uD835\uDD76': '\\mathslbb{K}',
      '\uD835\uDD77': '\\mathslbb{L}',
      '\uD835\uDD78': '\\mathslbb{M}',
      '\uD835\uDD79': '\\mathslbb{N}',
      '\uD835\uDD7A': '\\mathslbb{O}',
      '\uD835\uDD7B': '\\mathslbb{P}',
      '\uD835\uDD7C': '\\mathslbb{Q}',
      '\uD835\uDD7D': '\\mathslbb{R}',
      '\uD835\uDD7E': '\\mathslbb{S}',
      '\uD835\uDD7F': '\\mathslbb{T}',
      '\uD835\uDD80': '\\mathslbb{U}',
      '\uD835\uDD81': '\\mathslbb{V}',
      '\uD835\uDD82': '\\mathslbb{W}',
      '\uD835\uDD83': '\\mathslbb{X}',
      '\uD835\uDD84': '\\mathslbb{Y}',
      '\uD835\uDD85': '\\mathslbb{Z}',
      '\uD835\uDD86': '\\mathslbb{a}',
      '\uD835\uDD87': '\\mathslbb{b}',
      '\uD835\uDD88': '\\mathslbb{c}',
      '\uD835\uDD89': '\\mathslbb{d}',
      '\uD835\uDD8A': '\\mathslbb{e}',
      '\uD835\uDD8B': '\\mathslbb{f}',
      '\uD835\uDD8C': '\\mathslbb{g}',
      '\uD835\uDD8D': '\\mathslbb{h}',
      '\uD835\uDD8E': '\\mathslbb{i}',
      '\uD835\uDD8F': '\\mathslbb{j}',
      '\uD835\uDD90': '\\mathslbb{k}',
      '\uD835\uDD91': '\\mathslbb{l}',
      '\uD835\uDD92': '\\mathslbb{m}',
      '\uD835\uDD93': '\\mathslbb{n}',
      '\uD835\uDD94': '\\mathslbb{o}',
      '\uD835\uDD95': '\\mathslbb{p}',
      '\uD835\uDD96': '\\mathslbb{q}',
      '\uD835\uDD97': '\\mathslbb{r}',
      '\uD835\uDD98': '\\mathslbb{s}',
      '\uD835\uDD99': '\\mathslbb{t}',
      '\uD835\uDD9A': '\\mathslbb{u}',
      '\uD835\uDD9B': '\\mathslbb{v}',
      '\uD835\uDD9C': '\\mathslbb{w}',
      '\uD835\uDD9D': '\\mathslbb{x}',
      '\uD835\uDD9E': '\\mathslbb{y}',
      '\uD835\uDD9F': '\\mathslbb{z}',
      '\uD835\uDDA0': '\\mathsf{A}',
      '\uD835\uDDA1': '\\mathsf{B}',
      '\uD835\uDDA2': '\\mathsf{C}',
      '\uD835\uDDA3': '\\mathsf{D}',
      '\uD835\uDDA4': '\\mathsf{E}',
      '\uD835\uDDA5': '\\mathsf{F}',
      '\uD835\uDDA6': '\\mathsf{G}',
      '\uD835\uDDA7': '\\mathsf{H}',
      '\uD835\uDDA8': '\\mathsf{I}',
      '\uD835\uDDA9': '\\mathsf{J}',
      '\uD835\uDDAA': '\\mathsf{K}',
      '\uD835\uDDAB': '\\mathsf{L}',
      '\uD835\uDDAC': '\\mathsf{M}',
      '\uD835\uDDAD': '\\mathsf{N}',
      '\uD835\uDDAE': '\\mathsf{O}',
      '\uD835\uDDAF': '\\mathsf{P}',
      '\uD835\uDDB0': '\\mathsf{Q}',
      '\uD835\uDDB1': '\\mathsf{R}',
      '\uD835\uDDB2': '\\mathsf{S}',
      '\uD835\uDDB3': '\\mathsf{T}',
      '\uD835\uDDB4': '\\mathsf{U}',
      '\uD835\uDDB5': '\\mathsf{V}',
      '\uD835\uDDB6': '\\mathsf{W}',
      '\uD835\uDDB7': '\\mathsf{X}',
      '\uD835\uDDB8': '\\mathsf{Y}',
      '\uD835\uDDB9': '\\mathsf{Z}',
      '\uD835\uDDBA': '\\mathsf{a}',
      '\uD835\uDDBB': '\\mathsf{b}',
      '\uD835\uDDBC': '\\mathsf{c}',
      '\uD835\uDDBD': '\\mathsf{d}',
      '\uD835\uDDBE': '\\mathsf{e}',
      '\uD835\uDDBF': '\\mathsf{f}',
      '\uD835\uDDC0': '\\mathsf{g}',
      '\uD835\uDDC1': '\\mathsf{h}',
      '\uD835\uDDC2': '\\mathsf{i}',
      '\uD835\uDDC3': '\\mathsf{j}',
      '\uD835\uDDC4': '\\mathsf{k}',
      '\uD835\uDDC5': '\\mathsf{l}',
      '\uD835\uDDC6': '\\mathsf{m}',
      '\uD835\uDDC7': '\\mathsf{n}',
      '\uD835\uDDC8': '\\mathsf{o}',
      '\uD835\uDDC9': '\\mathsf{p}',
      '\uD835\uDDCA': '\\mathsf{q}',
      '\uD835\uDDCB': '\\mathsf{r}',
      '\uD835\uDDCC': '\\mathsf{s}',
      '\uD835\uDDCD': '\\mathsf{t}',
      '\uD835\uDDCE': '\\mathsf{u}',
      '\uD835\uDDCF': '\\mathsf{v}',
      '\uD835\uDDD0': '\\mathsf{w}',
      '\uD835\uDDD1': '\\mathsf{x}',
      '\uD835\uDDD2': '\\mathsf{y}',
      '\uD835\uDDD3': '\\mathsf{z}',
      '\uD835\uDDD4': '\\mathsfbf{A}',
      '\uD835\uDDD5': '\\mathsfbf{B}',
      '\uD835\uDDD6': '\\mathsfbf{C}',
      '\uD835\uDDD7': '\\mathsfbf{D}',
      '\uD835\uDDD8': '\\mathsfbf{E}',
      '\uD835\uDDD9': '\\mathsfbf{F}',
      '\uD835\uDDDA': '\\mathsfbf{G}',
      '\uD835\uDDDB': '\\mathsfbf{H}',
      '\uD835\uDDDC': '\\mathsfbf{I}',
      '\uD835\uDDDD': '\\mathsfbf{J}',
      '\uD835\uDDDE': '\\mathsfbf{K}',
      '\uD835\uDDDF': '\\mathsfbf{L}',
      '\uD835\uDDE0': '\\mathsfbf{M}',
      '\uD835\uDDE1': '\\mathsfbf{N}',
      '\uD835\uDDE2': '\\mathsfbf{O}',
      '\uD835\uDDE3': '\\mathsfbf{P}',
      '\uD835\uDDE4': '\\mathsfbf{Q}',
      '\uD835\uDDE5': '\\mathsfbf{R}',
      '\uD835\uDDE6': '\\mathsfbf{S}',
      '\uD835\uDDE7': '\\mathsfbf{T}',
      '\uD835\uDDE8': '\\mathsfbf{U}',
      '\uD835\uDDE9': '\\mathsfbf{V}',
      '\uD835\uDDEA': '\\mathsfbf{W}',
      '\uD835\uDDEB': '\\mathsfbf{X}',
      '\uD835\uDDEC': '\\mathsfbf{Y}',
      '\uD835\uDDED': '\\mathsfbf{Z}',
      '\uD835\uDDEE': '\\mathsfbf{a}',
      '\uD835\uDDEF': '\\mathsfbf{b}',
      '\uD835\uDDF0': '\\mathsfbf{c}',
      '\uD835\uDDF1': '\\mathsfbf{d}',
      '\uD835\uDDF2': '\\mathsfbf{e}',
      '\uD835\uDDF3': '\\mathsfbf{f}',
      '\uD835\uDDF4': '\\mathsfbf{g}',
      '\uD835\uDDF5': '\\mathsfbf{h}',
      '\uD835\uDDF6': '\\mathsfbf{i}',
      '\uD835\uDDF7': '\\mathsfbf{j}',
      '\uD835\uDDF8': '\\mathsfbf{k}',
      '\uD835\uDDF9': '\\mathsfbf{l}',
      '\uD835\uDDFA': '\\mathsfbf{m}',
      '\uD835\uDDFB': '\\mathsfbf{n}',
      '\uD835\uDDFC': '\\mathsfbf{o}',
      '\uD835\uDDFD': '\\mathsfbf{p}',
      '\uD835\uDDFE': '\\mathsfbf{q}',
      '\uD835\uDDFF': '\\mathsfbf{r}',
      '\uD835\uDE00': '\\mathsfbf{s}',
      '\uD835\uDE01': '\\mathsfbf{t}',
      '\uD835\uDE02': '\\mathsfbf{u}',
      '\uD835\uDE03': '\\mathsfbf{v}',
      '\uD835\uDE04': '\\mathsfbf{w}',
      '\uD835\uDE05': '\\mathsfbf{x}',
      '\uD835\uDE06': '\\mathsfbf{y}',
      '\uD835\uDE07': '\\mathsfbf{z}',
      '\uD835\uDE08': '\\mathsfsl{A}',
      '\uD835\uDE09': '\\mathsfsl{B}',
      '\uD835\uDE0A': '\\mathsfsl{C}',
      '\uD835\uDE0B': '\\mathsfsl{D}',
      '\uD835\uDE0C': '\\mathsfsl{E}',
      '\uD835\uDE0D': '\\mathsfsl{F}',
      '\uD835\uDE0E': '\\mathsfsl{G}',
      '\uD835\uDE0F': '\\mathsfsl{H}',
      '\uD835\uDE10': '\\mathsfsl{I}',
      '\uD835\uDE11': '\\mathsfsl{J}',
      '\uD835\uDE12': '\\mathsfsl{K}',
      '\uD835\uDE13': '\\mathsfsl{L}',
      '\uD835\uDE14': '\\mathsfsl{M}',
      '\uD835\uDE15': '\\mathsfsl{N}',
      '\uD835\uDE16': '\\mathsfsl{O}',
      '\uD835\uDE17': '\\mathsfsl{P}',
      '\uD835\uDE18': '\\mathsfsl{Q}',
      '\uD835\uDE19': '\\mathsfsl{R}',
      '\uD835\uDE1A': '\\mathsfsl{S}',
      '\uD835\uDE1B': '\\mathsfsl{T}',
      '\uD835\uDE1C': '\\mathsfsl{U}',
      '\uD835\uDE1D': '\\mathsfsl{V}',
      '\uD835\uDE1E': '\\mathsfsl{W}',
      '\uD835\uDE1F': '\\mathsfsl{X}',
      '\uD835\uDE20': '\\mathsfsl{Y}',
      '\uD835\uDE21': '\\mathsfsl{Z}',
      '\uD835\uDE22': '\\mathsfsl{a}',
      '\uD835\uDE23': '\\mathsfsl{b}',
      '\uD835\uDE24': '\\mathsfsl{c}',
      '\uD835\uDE25': '\\mathsfsl{d}',
      '\uD835\uDE26': '\\mathsfsl{e}',
      '\uD835\uDE27': '\\mathsfsl{f}',
      '\uD835\uDE28': '\\mathsfsl{g}',
      '\uD835\uDE29': '\\mathsfsl{h}',
      '\uD835\uDE2A': '\\mathsfsl{i}',
      '\uD835\uDE2B': '\\mathsfsl{j}',
      '\uD835\uDE2C': '\\mathsfsl{k}',
      '\uD835\uDE2D': '\\mathsfsl{l}',
      '\uD835\uDE2E': '\\mathsfsl{m}',
      '\uD835\uDE2F': '\\mathsfsl{n}',
      '\uD835\uDE30': '\\mathsfsl{o}',
      '\uD835\uDE31': '\\mathsfsl{p}',
      '\uD835\uDE32': '\\mathsfsl{q}',
      '\uD835\uDE33': '\\mathsfsl{r}',
      '\uD835\uDE34': '\\mathsfsl{s}',
      '\uD835\uDE35': '\\mathsfsl{t}',
      '\uD835\uDE36': '\\mathsfsl{u}',
      '\uD835\uDE37': '\\mathsfsl{v}',
      '\uD835\uDE38': '\\mathsfsl{w}',
      '\uD835\uDE39': '\\mathsfsl{x}',
      '\uD835\uDE3A': '\\mathsfsl{y}',
      '\uD835\uDE3B': '\\mathsfsl{z}',
      '\uD835\uDE3C': '\\mathsfbfsl{A}',
      '\uD835\uDE3D': '\\mathsfbfsl{B}',
      '\uD835\uDE3E': '\\mathsfbfsl{C}',
      '\uD835\uDE3F': '\\mathsfbfsl{D}',
      '\uD835\uDE40': '\\mathsfbfsl{E}',
      '\uD835\uDE41': '\\mathsfbfsl{F}',
      '\uD835\uDE42': '\\mathsfbfsl{G}',
      '\uD835\uDE43': '\\mathsfbfsl{H}',
      '\uD835\uDE44': '\\mathsfbfsl{I}',
      '\uD835\uDE45': '\\mathsfbfsl{J}',
      '\uD835\uDE46': '\\mathsfbfsl{K}',
      '\uD835\uDE47': '\\mathsfbfsl{L}',
      '\uD835\uDE48': '\\mathsfbfsl{M}',
      '\uD835\uDE49': '\\mathsfbfsl{N}',
      '\uD835\uDE4A': '\\mathsfbfsl{O}',
      '\uD835\uDE4B': '\\mathsfbfsl{P}',
      '\uD835\uDE4C': '\\mathsfbfsl{Q}',
      '\uD835\uDE4D': '\\mathsfbfsl{R}',
      '\uD835\uDE4E': '\\mathsfbfsl{S}',
      '\uD835\uDE4F': '\\mathsfbfsl{T}',
      '\uD835\uDE50': '\\mathsfbfsl{U}',
      '\uD835\uDE51': '\\mathsfbfsl{V}',
      '\uD835\uDE52': '\\mathsfbfsl{W}',
      '\uD835\uDE53': '\\mathsfbfsl{X}',
      '\uD835\uDE54': '\\mathsfbfsl{Y}',
      '\uD835\uDE55': '\\mathsfbfsl{Z}',
      '\uD835\uDE56': '\\mathsfbfsl{a}',
      '\uD835\uDE57': '\\mathsfbfsl{b}',
      '\uD835\uDE58': '\\mathsfbfsl{c}',
      '\uD835\uDE59': '\\mathsfbfsl{d}',
      '\uD835\uDE5A': '\\mathsfbfsl{e}',
      '\uD835\uDE5B': '\\mathsfbfsl{f}',
      '\uD835\uDE5C': '\\mathsfbfsl{g}',
      '\uD835\uDE5D': '\\mathsfbfsl{h}',
      '\uD835\uDE5E': '\\mathsfbfsl{i}',
      '\uD835\uDE5F': '\\mathsfbfsl{j}',
      '\uD835\uDE60': '\\mathsfbfsl{k}',
      '\uD835\uDE61': '\\mathsfbfsl{l}',
      '\uD835\uDE62': '\\mathsfbfsl{m}',
      '\uD835\uDE63': '\\mathsfbfsl{n}',
      '\uD835\uDE64': '\\mathsfbfsl{o}',
      '\uD835\uDE65': '\\mathsfbfsl{p}',
      '\uD835\uDE66': '\\mathsfbfsl{q}',
      '\uD835\uDE67': '\\mathsfbfsl{r}',
      '\uD835\uDE68': '\\mathsfbfsl{s}',
      '\uD835\uDE69': '\\mathsfbfsl{t}',
      '\uD835\uDE6A': '\\mathsfbfsl{u}',
      '\uD835\uDE6B': '\\mathsfbfsl{v}',
      '\uD835\uDE6C': '\\mathsfbfsl{w}',
      '\uD835\uDE6D': '\\mathsfbfsl{x}',
      '\uD835\uDE6E': '\\mathsfbfsl{y}',
      '\uD835\uDE6F': '\\mathsfbfsl{z}',
      '\uD835\uDE70': '\\mathtt{A}',
      '\uD835\uDE71': '\\mathtt{B}',
      '\uD835\uDE72': '\\mathtt{C}',
      '\uD835\uDE73': '\\mathtt{D}',
      '\uD835\uDE74': '\\mathtt{E}',
      '\uD835\uDE75': '\\mathtt{F}',
      '\uD835\uDE76': '\\mathtt{G}',
      '\uD835\uDE77': '\\mathtt{H}',
      '\uD835\uDE78': '\\mathtt{I}',
      '\uD835\uDE79': '\\mathtt{J}',
      '\uD835\uDE7A': '\\mathtt{K}',
      '\uD835\uDE7B': '\\mathtt{L}',
      '\uD835\uDE7C': '\\mathtt{M}',
      '\uD835\uDE7D': '\\mathtt{N}',
      '\uD835\uDE7E': '\\mathtt{O}',
      '\uD835\uDE7F': '\\mathtt{P}',
      '\uD835\uDE80': '\\mathtt{Q}',
      '\uD835\uDE81': '\\mathtt{R}',
      '\uD835\uDE82': '\\mathtt{S}',
      '\uD835\uDE83': '\\mathtt{T}',
      '\uD835\uDE84': '\\mathtt{U}',
      '\uD835\uDE85': '\\mathtt{V}',
      '\uD835\uDE86': '\\mathtt{W}',
      '\uD835\uDE87': '\\mathtt{X}',
      '\uD835\uDE88': '\\mathtt{Y}',
      '\uD835\uDE89': '\\mathtt{Z}',
      '\uD835\uDE8A': '\\mathtt{a}',
      '\uD835\uDE8B': '\\mathtt{b}',
      '\uD835\uDE8C': '\\mathtt{c}',
      '\uD835\uDE8D': '\\mathtt{d}',
      '\uD835\uDE8E': '\\mathtt{e}',
      '\uD835\uDE8F': '\\mathtt{f}',
      '\uD835\uDE90': '\\mathtt{g}',
      '\uD835\uDE91': '\\mathtt{h}',
      '\uD835\uDE92': '\\mathtt{i}',
      '\uD835\uDE93': '\\mathtt{j}',
      '\uD835\uDE94': '\\mathtt{k}',
      '\uD835\uDE95': '\\mathtt{l}',
      '\uD835\uDE96': '\\mathtt{m}',
      '\uD835\uDE97': '\\mathtt{n}',
      '\uD835\uDE98': '\\mathtt{o}',
      '\uD835\uDE99': '\\mathtt{p}',
      '\uD835\uDE9A': '\\mathtt{q}',
      '\uD835\uDE9B': '\\mathtt{r}',
      '\uD835\uDE9C': '\\mathtt{s}',
      '\uD835\uDE9D': '\\mathtt{t}',
      '\uD835\uDE9E': '\\mathtt{u}',
      '\uD835\uDE9F': '\\mathtt{v}',
      '\uD835\uDEA0': '\\mathtt{w}',
      '\uD835\uDEA1': '\\mathtt{x}',
      '\uD835\uDEA2': '\\mathtt{y}',
      '\uD835\uDEA3': '\\mathtt{z}',
      '\uD835\uDEA4': '\\imath{}',
      '\uD835\uDEA5': '\\jmath{}',
      '\uD835\uDEA8': '\\mathbf{A}',
      '\uD835\uDEA9': '\\mathbf{B}',
      '\uD835\uDEAA': '\\mathbf{\\Gamma}',
      '\uD835\uDEAB': '\\mathbf{\\Delta}',
      '\uD835\uDEAC': '\\mathbf{E}',
      '\uD835\uDEAD': '\\mathbf{Z}',
      '\uD835\uDEAE': '\\mathbf{H}',
      '\uD835\uDEAF': '\\mathbf{\\Theta}',
      '\uD835\uDEB0': '\\mathbf{I}',
      '\uD835\uDEB1': '\\mathbf{K}',
      '\uD835\uDEB2': '\\mathbf{\\Lambda}',
      '\uD835\uDEB3': 'M',
      '\uD835\uDEB4': 'N',
      '\uD835\uDEB5': '\\mathbf{\\Xi}',
      '\uD835\uDEB6': 'O',
      '\uD835\uDEB7': '\\mathbf{\\Pi}',
      '\uD835\uDEB8': '\\mathbf{P}',
      '\uD835\uDEBA': '\\mathbf{\\Sigma}',
      '\uD835\uDEBB': '\\mathbf{T}',
      '\uD835\uDEBC': '\\mathbf{\\Upsilon}',
      '\uD835\uDEBD': '\\mathbf{\\Phi}',
      '\uD835\uDEBE': '\\mathbf{X}',
      '\uD835\uDEBF': '\\mathbf{\\Psi}',
      '\uD835\uDEC0': '\\mathbf{\\Omega}',
      '\uD835\uDEC1': '\\mathbf{\\nabla}',
      '\uD835\uDEC2': '\\mathbf{A}',
      '\uD835\uDEC3': '\\mathbf{B}',
      '\uD835\uDEC4': '\\mathbf{\\Gamma}',
      '\uD835\uDEC5': '\\mathbf{\\Delta}',
      '\uD835\uDEC6': '\\mathbf{E}',
      '\uD835\uDEC7': '\\mathbf{Z}',
      '\uD835\uDEC8': '\\mathbf{H}',
      '\uD835\uDEC9': '\\mathbf{\\theta}',
      '\uD835\uDECA': '\\mathbf{I}',
      '\uD835\uDECB': '\\mathbf{K}',
      '\uD835\uDECC': '\\mathbf{\\Lambda}',
      '\uD835\uDECD': 'M',
      '\uD835\uDECE': 'N',
      '\uD835\uDECF': '\\mathbf{\\Xi}',
      '\uD835\uDED0': 'O',
      '\uD835\uDED1': '\\mathbf{\\Pi}',
      '\uD835\uDED2': '\\mathbf{P}',
      '\uD835\uDED3': '\\mathbf{\\varsigma}',
      '\uD835\uDED4': '\\mathbf{\\Sigma}',
      '\uD835\uDED5': '\\mathbf{T}',
      '\uD835\uDED6': '\\mathbf{\\Upsilon}',
      '\uD835\uDED7': '\\mathbf{\\Phi}',
      '\uD835\uDED8': '\\mathbf{X}',
      '\uD835\uDED9': '\\mathbf{\\Psi}',
      '\uD835\uDEDA': '\\mathbf{\\Omega}',
      '\uD835\uDEDB': '\\partial{}',
      '\uD835\uDEDC': '\\in{}',
      '\uD835\uDEE2': '\\mathsl{A}',
      '\uD835\uDEE3': '\\mathsl{B}',
      '\uD835\uDEE4': '\\mathsl{\\Gamma}',
      '\uD835\uDEE5': '\\mathsl{\\Delta}',
      '\uD835\uDEE6': '\\mathsl{E}',
      '\uD835\uDEE7': '\\mathsl{Z}',
      '\uD835\uDEE8': '\\mathsl{H}',
      '\uD835\uDEE9': '\\mathsl{\\Theta}',
      '\uD835\uDEEA': '\\mathsl{I}',
      '\uD835\uDEEB': '\\mathsl{K}',
      '\uD835\uDEEC': '\\mathsl{\\Lambda}',
      '\uD835\uDEED': 'M',
      '\uD835\uDEEE': 'N',
      '\uD835\uDEEF': '\\mathsl{\\Xi}',
      '\uD835\uDEF0': 'O',
      '\uD835\uDEF1': '\\mathsl{\\Pi}',
      '\uD835\uDEF2': '\\mathsl{P}',
      '\uD835\uDEF4': '\\mathsl{\\Sigma}',
      '\uD835\uDEF5': '\\mathsl{T}',
      '\uD835\uDEF6': '\\mathsl{\\Upsilon}',
      '\uD835\uDEF7': '\\mathsl{\\Phi}',
      '\uD835\uDEF8': '\\mathsl{X}',
      '\uD835\uDEF9': '\\mathsl{\\Psi}',
      '\uD835\uDEFA': '\\mathsl{\\Omega}',
      '\uD835\uDEFB': '\\mathsl{\\nabla}',
      '\uD835\uDEFC': '\\mathsl{A}',
      '\uD835\uDEFD': '\\mathsl{B}',
      '\uD835\uDEFE': '\\mathsl{\\Gamma}',
      '\uD835\uDEFF': '\\mathsl{\\Delta}',
      '\uD835\uDF00': '\\mathsl{E}',
      '\uD835\uDF01': '\\mathsl{Z}',
      '\uD835\uDF02': '\\mathsl{H}',
      '\uD835\uDF03': '\\mathsl{\\Theta}',
      '\uD835\uDF04': '\\mathsl{I}',
      '\uD835\uDF05': '\\mathsl{K}',
      '\uD835\uDF06': '\\mathsl{\\Lambda}',
      '\uD835\uDF07': 'M',
      '\uD835\uDF08': 'N',
      '\uD835\uDF09': '\\mathsl{\\Xi}',
      '\uD835\uDF0A': 'O',
      '\uD835\uDF0B': '\\mathsl{\\Pi}',
      '\uD835\uDF0C': '\\mathsl{P}',
      '\uD835\uDF0D': '\\mathsl{\\varsigma}',
      '\uD835\uDF0E': '\\mathsl{\\Sigma}',
      '\uD835\uDF0F': '\\mathsl{T}',
      '\uD835\uDF10': '\\mathsl{\\Upsilon}',
      '\uD835\uDF11': '\\mathsl{\\Phi}',
      '\uD835\uDF12': '\\mathsl{X}',
      '\uD835\uDF13': '\\mathsl{\\Psi}',
      '\uD835\uDF14': '\\mathsl{\\Omega}',
      '\uD835\uDF15': '\\partial{}',
      '\uD835\uDF16': '\\in{}',
      '\uD835\uDF1C': '\\mathbit{A}',
      '\uD835\uDF1D': '\\mathbit{B}',
      '\uD835\uDF1E': '\\mathbit{\\Gamma}',
      '\uD835\uDF1F': '\\mathbit{\\Delta}',
      '\uD835\uDF20': '\\mathbit{E}',
      '\uD835\uDF21': '\\mathbit{Z}',
      '\uD835\uDF22': '\\mathbit{H}',
      '\uD835\uDF23': '\\mathbit{\\Theta}',
      '\uD835\uDF24': '\\mathbit{I}',
      '\uD835\uDF25': '\\mathbit{K}',
      '\uD835\uDF26': '\\mathbit{\\Lambda}',
      '\uD835\uDF27': 'M',
      '\uD835\uDF28': 'N',
      '\uD835\uDF29': '\\mathbit{\\Xi}',
      '\uD835\uDF2A': 'O',
      '\uD835\uDF2B': '\\mathbit{\\Pi}',
      '\uD835\uDF2C': '\\mathbit{P}',
      '\uD835\uDF2E': '\\mathbit{\\Sigma}',
      '\uD835\uDF2F': '\\mathbit{T}',
      '\uD835\uDF30': '\\mathbit{\\Upsilon}',
      '\uD835\uDF31': '\\mathbit{\\Phi}',
      '\uD835\uDF32': '\\mathbit{X}',
      '\uD835\uDF33': '\\mathbit{\\Psi}',
      '\uD835\uDF34': '\\mathbit{\\Omega}',
      '\uD835\uDF35': '\\mathbit{\\nabla}',
      '\uD835\uDF36': '\\mathbit{A}',
      '\uD835\uDF37': '\\mathbit{B}',
      '\uD835\uDF38': '\\mathbit{\\Gamma}',
      '\uD835\uDF39': '\\mathbit{\\Delta}',
      '\uD835\uDF3A': '\\mathbit{E}',
      '\uD835\uDF3B': '\\mathbit{Z}',
      '\uD835\uDF3C': '\\mathbit{H}',
      '\uD835\uDF3D': '\\mathbit{\\Theta}',
      '\uD835\uDF3E': '\\mathbit{I}',
      '\uD835\uDF3F': '\\mathbit{K}',
      '\uD835\uDF40': '\\mathbit{\\Lambda}',
      '\uD835\uDF41': 'M',
      '\uD835\uDF42': 'N',
      '\uD835\uDF43': '\\mathbit{\\Xi}',
      '\uD835\uDF44': 'O',
      '\uD835\uDF45': '\\mathbit{\\Pi}',
      '\uD835\uDF46': '\\mathbit{P}',
      '\uD835\uDF47': '\\mathbit{\\varsigma}',
      '\uD835\uDF48': '\\mathbit{\\Sigma}',
      '\uD835\uDF49': '\\mathbit{T}',
      '\uD835\uDF4A': '\\mathbit{\\Upsilon}',
      '\uD835\uDF4B': '\\mathbit{\\Phi}',
      '\uD835\uDF4C': '\\mathbit{X}',
      '\uD835\uDF4D': '\\mathbit{\\Psi}',
      '\uD835\uDF4E': '\\mathbit{\\Omega}',
      '\uD835\uDF4F': '\\partial{}',
      '\uD835\uDF50': '\\in{}',
      '\uD835\uDF56': '\\mathsfbf{A}',
      '\uD835\uDF57': '\\mathsfbf{B}',
      '\uD835\uDF58': '\\mathsfbf{\\Gamma}',
      '\uD835\uDF59': '\\mathsfbf{\\Delta}',
      '\uD835\uDF5A': '\\mathsfbf{E}',
      '\uD835\uDF5B': '\\mathsfbf{Z}',
      '\uD835\uDF5C': '\\mathsfbf{H}',
      '\uD835\uDF5D': '\\mathsfbf{\\Theta}',
      '\uD835\uDF5E': '\\mathsfbf{I}',
      '\uD835\uDF5F': '\\mathsfbf{K}',
      '\uD835\uDF60': '\\mathsfbf{\\Lambda}',
      '\uD835\uDF61': 'M',
      '\uD835\uDF62': 'N',
      '\uD835\uDF63': '\\mathsfbf{\\Xi}',
      '\uD835\uDF64': 'O',
      '\uD835\uDF65': '\\mathsfbf{\\Pi}',
      '\uD835\uDF66': '\\mathsfbf{P}',
      '\uD835\uDF68': '\\mathsfbf{\\Sigma}',
      '\uD835\uDF69': '\\mathsfbf{T}',
      '\uD835\uDF6A': '\\mathsfbf{\\Upsilon}',
      '\uD835\uDF6B': '\\mathsfbf{\\Phi}',
      '\uD835\uDF6C': '\\mathsfbf{X}',
      '\uD835\uDF6D': '\\mathsfbf{\\Psi}',
      '\uD835\uDF6E': '\\mathsfbf{\\Omega}',
      '\uD835\uDF6F': '\\mathsfbf{\\nabla}',
      '\uD835\uDF70': '\\mathsfbf{A}',
      '\uD835\uDF71': '\\mathsfbf{B}',
      '\uD835\uDF72': '\\mathsfbf{\\Gamma}',
      '\uD835\uDF73': '\\mathsfbf{\\Delta}',
      '\uD835\uDF74': '\\mathsfbf{E}',
      '\uD835\uDF75': '\\mathsfbf{Z}',
      '\uD835\uDF76': '\\mathsfbf{H}',
      '\uD835\uDF77': '\\mathsfbf{\\Theta}',
      '\uD835\uDF78': '\\mathsfbf{I}',
      '\uD835\uDF79': '\\mathsfbf{K}',
      '\uD835\uDF7A': '\\mathsfbf{\\Lambda}',
      '\uD835\uDF7B': 'M',
      '\uD835\uDF7C': 'N',
      '\uD835\uDF7D': '\\mathsfbf{\\Xi}',
      '\uD835\uDF7E': 'O',
      '\uD835\uDF7F': '\\mathsfbf{\\Pi}',
      '\uD835\uDF80': '\\mathsfbf{P}',
      '\uD835\uDF81': '\\mathsfbf{\\varsigma}',
      '\uD835\uDF82': '\\mathsfbf{\\Sigma}',
      '\uD835\uDF83': '\\mathsfbf{T}',
      '\uD835\uDF84': '\\mathsfbf{\\Upsilon}',
      '\uD835\uDF85': '\\mathsfbf{\\Phi}',
      '\uD835\uDF86': '\\mathsfbf{X}',
      '\uD835\uDF87': '\\mathsfbf{\\Psi}',
      '\uD835\uDF88': '\\mathsfbf{\\Omega}',
      '\uD835\uDF89': '\\partial{}',
      '\uD835\uDF8A': '\\in{}',
      '\uD835\uDF90': '\\mathsfbfsl{A}',
      '\uD835\uDF91': '\\mathsfbfsl{B}',
      '\uD835\uDF92': '\\mathsfbfsl{\\Gamma}',
      '\uD835\uDF93': '\\mathsfbfsl{\\Delta}',
      '\uD835\uDF94': '\\mathsfbfsl{E}',
      '\uD835\uDF95': '\\mathsfbfsl{Z}',
      '\uD835\uDF96': '\\mathsfbfsl{H}',
      '\uD835\uDF97': '\\mathsfbfsl{\\vartheta}',
      '\uD835\uDF98': '\\mathsfbfsl{I}',
      '\uD835\uDF99': '\\mathsfbfsl{K}',
      '\uD835\uDF9A': '\\mathsfbfsl{\\Lambda}',
      '\uD835\uDF9B': 'M',
      '\uD835\uDF9C': 'N',
      '\uD835\uDF9D': '\\mathsfbfsl{\\Xi}',
      '\uD835\uDF9E': 'O',
      '\uD835\uDF9F': '\\mathsfbfsl{\\Pi}',
      '\uD835\uDFA0': '\\mathsfbfsl{P}',
      '\uD835\uDFA2': '\\mathsfbfsl{\\Sigma}',
      '\uD835\uDFA3': '\\mathsfbfsl{T}',
      '\uD835\uDFA4': '\\mathsfbfsl{\\Upsilon}',
      '\uD835\uDFA5': '\\mathsfbfsl{\\Phi}',
      '\uD835\uDFA6': '\\mathsfbfsl{X}',
      '\uD835\uDFA7': '\\mathsfbfsl{\\Psi}',
      '\uD835\uDFA8': '\\mathsfbfsl{\\Omega}',
      '\uD835\uDFA9': '\\mathsfbfsl{\\nabla}',
      '\uD835\uDFAA': '\\mathsfbfsl{A}',
      '\uD835\uDFAB': '\\mathsfbfsl{B}',
      '\uD835\uDFAC': '\\mathsfbfsl{\\Gamma}',
      '\uD835\uDFAD': '\\mathsfbfsl{\\Delta}',
      '\uD835\uDFAE': '\\mathsfbfsl{E}',
      '\uD835\uDFAF': '\\mathsfbfsl{Z}',
      '\uD835\uDFB0': '\\mathsfbfsl{H}',
      '\uD835\uDFB1': '\\mathsfbfsl{\\vartheta}',
      '\uD835\uDFB2': '\\mathsfbfsl{I}',
      '\uD835\uDFB3': '\\mathsfbfsl{K}',
      '\uD835\uDFB4': '\\mathsfbfsl{\\Lambda}',
      '\uD835\uDFB5': 'M',
      '\uD835\uDFB6': 'N',
      '\uD835\uDFB7': '\\mathsfbfsl{\\Xi}',
      '\uD835\uDFB8': 'O',
      '\uD835\uDFB9': '\\mathsfbfsl{\\Pi}',
      '\uD835\uDFBA': '\\mathsfbfsl{P}',
      '\uD835\uDFBB': '\\mathsfbfsl{\\varsigma}',
      '\uD835\uDFBC': '\\mathsfbfsl{\\Sigma}',
      '\uD835\uDFBD': '\\mathsfbfsl{T}',
      '\uD835\uDFBE': '\\mathsfbfsl{\\Upsilon}',
      '\uD835\uDFBF': '\\mathsfbfsl{\\Phi}',
      '\uD835\uDFC0': '\\mathsfbfsl{X}',
      '\uD835\uDFC1': '\\mathsfbfsl{\\Psi}',
      '\uD835\uDFC2': '\\mathsfbfsl{\\Omega}',
      '\uD835\uDFC3': '\\partial{}',
      '\uD835\uDFC4': '\\in{}',
      '\uD835\uDFCA': '\\mbfDigamma{}',
      '\uD835\uDFCB': '\\mbfdigamma{}',
      '\uD835\uDFCE': '\\mathbf{0}',
      '\uD835\uDFCF': '\\mathbf{1}',
      '\uD835\uDFD0': '\\mathbf{2}',
      '\uD835\uDFD1': '\\mathbf{3}',
      '\uD835\uDFD2': '\\mathbf{4}',
      '\uD835\uDFD3': '\\mathbf{5}',
      '\uD835\uDFD4': '\\mathbf{6}',
      '\uD835\uDFD5': '\\mathbf{7}',
      '\uD835\uDFD6': '\\mathbf{8}',
      '\uD835\uDFD7': '\\mathbf{9}',
      '\uD835\uDFD8': '\\mathbb{0}',
      '\uD835\uDFD9': '\\mathbb{1}',
      '\uD835\uDFDA': '\\mathbb{2}',
      '\uD835\uDFDB': '\\mathbb{3}',
      '\uD835\uDFDC': '\\mathbb{4}',
      '\uD835\uDFDD': '\\mathbb{5}',
      '\uD835\uDFDE': '\\mathbb{6}',
      '\uD835\uDFDF': '\\mathbb{7}',
      '\uD835\uDFE0': '\\mathbb{8}',
      '\uD835\uDFE1': '\\mathbb{9}',
      '\uD835\uDFE2': '\\mathsf{0}',
      '\uD835\uDFE3': '\\mathsf{1}',
      '\uD835\uDFE4': '\\mathsf{2}',
      '\uD835\uDFE5': '\\mathsf{3}',
      '\uD835\uDFE6': '\\mathsf{4}',
      '\uD835\uDFE7': '\\mathsf{5}',
      '\uD835\uDFE8': '\\mathsf{6}',
      '\uD835\uDFE9': '\\mathsf{7}',
      '\uD835\uDFEA': '\\mathsf{8}',
      '\uD835\uDFEB': '\\mathsf{9}',
      '\uD835\uDFEC': '\\mathsfbf{0}',
      '\uD835\uDFED': '\\mathsfbf{1}',
      '\uD835\uDFEE': '\\mathsfbf{2}',
      '\uD835\uDFEF': '\\mathsfbf{3}',
      '\uD835\uDFF0': '\\mathsfbf{4}',
      '\uD835\uDFF1': '\\mathsfbf{5}',
      '\uD835\uDFF2': '\\mathsfbf{6}',
      '\uD835\uDFF3': '\\mathsfbf{7}',
      '\uD835\uDFF4': '\\mathsfbf{8}',
      '\uD835\uDFF5': '\\mathsfbf{9}',
      '\uD835\uDFF6': '\\mathtt{0}',
      '\uD835\uDFF7': '\\mathtt{1}',
      '\uD835\uDFF8': '\\mathtt{2}',
      '\uD835\uDFF9': '\\mathtt{3}',
      '\uD835\uDFFA': '\\mathtt{4}',
      '\uD835\uDFFB': '\\mathtt{5}',
      '\uD835\uDFFC': '\\mathtt{6}',
      '\uD835\uDFFD': '\\mathtt{7}',
      '\uD835\uDFFE': '\\mathtt{8}',
      '\uD835\uDFFF': '\\mathtt{9}'
    },
    'text': {
      '#': '\\#',
      '$': '\\$',
      '%': '\\%',
      '&': '\\&',
      '^': '\\^',
      '_': '\\_',
      '{': '\\{',
      '}': '\\}',
      '~': '\\textasciitilde{}',
      '\xA0': '~',
      '\xA1': '\\textexclamdown{}',
      '\xA2': '\\textcent{}',
      '\xA3': '\\textsterling{}',
      '\xA4': '\\textcurrency{}',
      '\xA5': '\\textyen{}',
      '\xA6': '\\textbrokenbar{}',
      '\xA7': '\\textsection{}',
      '\xA8': '\\textasciidieresis{}',
      '\xA9': '\\textcopyright{}',
      '\xAA': '\\textordfeminine{}',
      '\xAB': '\\guillemotleft{}',
      '\xAE': '\\textregistered{}',
      '\xAF': '\\textasciimacron{}',
      '\xB4': '\\textasciiacute{}',
      '\xB6': '\\textparagraph{}',
      '\xB8': '\\c{}',
      '\xBA': '\\textordmasculine{}',
      '\xBB': '\\guillemotright{}',
      '\xBC': '\\textonequarter{}',
      '\xBD': '\\textonehalf{}',
      '\xBE': '\\textthreequarters{}',
      '\xBF': '\\textquestiondown{}',
      '\xC0': '{\\`A}',
      '\xC1': '{\\\'A}',
      '\xC2': '{\\^A}',
      '\xC3': '{\\~A}',
      '\xC4': '{\\"A}',
      '\xC5': '\\AA{}',
      '\xC6': '{\\AE}',
      '\xC7': '{\\c C}',
      '\xC8': '{\\`E}',
      '\xC9': '{\\\'E}',
      '\xCA': '{\\^E}',
      '\xCB': '{\\"E}',
      '\xCC': '{\\`I}',
      '\xCD': '{\\\'I}',
      '\xCE': '{\\^I}',
      '\xCF': '{\\"I}',
      '\xD0': '{\\DH}',
      '\xD1': '{\\~N}',
      '\xD2': '{\\`O}',
      '\xD3': '{\\\'O}',
      '\xD4': '{\\^O}',
      '\xD5': '{\\~O}',
      '\xD6': '{\\"O}',
      '\xD7': '\\texttimes{}',
      '\xD8': '{\\O}',
      '\xD9': '{\\`U}',
      '\xDA': '{\\\'U}',
      '\xDB': '{\\^U}',
      '\xDC': '{\\"U}',
      '\xDD': '{\\\'Y}',
      '\xDE': '{\\TH}',
      '\xDF': '{\\ss}',
      '\xE0': '{\\`a}',
      '\xE1': '{\\\'a}',
      '\xE2': '{\\^a}',
      '\xE3': '{\\~a}',
      '\xE4': '{\\"a}',
      '\xE5': '{\\aa}',
      '\xE6': '{\\ae}',
      '\xE7': '{\\c c}',
      '\xE8': '{\\`e}',
      '\xE9': '{\\\'e}',
      '\xEA': '{\\^e}',
      '\xEB': '{\\"e}',
      '\xEC': '{\\`\\i}',
      '\xED': '{\\\'\\i}',
      '\xEE': '{\\^\\i}',
      '\xEF': '{\\"\\i}',
      '\xF0': '{\\dh}',
      '\xF1': '{\\~n}',
      '\xF2': '{\\`o}',
      '\xF3': '{\\\'o}',
      '\xF4': '{\\^o}',
      '\xF5': '{\\~o}',
      '\xF6': '{\\"o}',
      '\xF8': '{\\o}',
      '\xF9': '{\\`u}',
      '\xFA': '{\\\'u}',
      '\xFB': '{\\^u}',
      '\xFC': '{\\"u}',
      '\xFD': '{\\\'y}',
      '\xFE': '{\\th}',
      '\xFF': '{\\"y}',
      '\u0100': '{\\=A}',
      '\u0101': '{\\=a}',
      '\u0102': '{\\u A}',
      '\u0103': '{\\u a}',
      '\u0104': '\\k{A}',
      '\u0105': '\\k{a}',
      '\u0106': '{\\\'C}',
      '\u0107': '{\\\'c}',
      '\u0108': '{\\^C}',
      '\u0109': '{\\^c}',
      '\u010A': '{\\.C}',
      '\u010B': '{\\.c}',
      '\u010C': '{\\v C}',
      '\u010D': '{\\v c}',
      '\u010E': '{\\v D}',
      '\u010F': '{\\v d}',
      '\u0110': '{\\DJ}',
      '\u0111': '{\\dj}',
      '\u0112': '{\\=E}',
      '\u0113': '{\\=e}',
      '\u0114': '{\\u E}',
      '\u0115': '{\\u e}',
      '\u0116': '{\\.E}',
      '\u0117': '{\\.e}',
      '\u0118': '\\k{E}',
      '\u0119': '\\k{e}',
      '\u011A': '{\\v E}',
      '\u011B': '{\\v e}',
      '\u011C': '{\\^G}',
      '\u011D': '{\\^g}',
      '\u011E': '{\\u G}',
      '\u011F': '{\\u g}',
      '\u0120': '{\\.G}',
      '\u0121': '{\\.g}',
      '\u0122': '{\\c G}',
      '\u0123': '{\\c g}',
      '\u0124': '{\\^H}',
      '\u0125': '{\\^h}',
      '\u0126': '{\\fontencoding{LELA}\\selectfont\\char40}',
      '\u0128': '{\\~I}',
      '\u0129': '{\\~\\i}',
      '\u012A': '{\\=I}',
      '\u012B': '\\={\\i}',
      '\u012C': '{\\u I}',
      '\u012D': '{\\u \\i}',
      '\u012E': '\\k{I}',
      '\u012F': '\\k{i}',
      '\u0130': '{\\.I}',
      '\u0131': '{\\i}',
      '\u0132': 'IJ',
      '\u0133': 'ij',
      '\u0134': '{\\^J}',
      '\u0135': '{\\^\\j}',
      '\u0136': '{\\c K}',
      '\u0137': '{\\c k}',
      '\u0138': '{\\fontencoding{LELA}\\selectfont\\char91}',
      '\u0139': '{\\\'L}',
      '\u013A': '{\\\'l}',
      '\u013B': '{\\c L}',
      '\u013C': '{\\c l}',
      '\u013D': '{\\v L}',
      '\u013E': '{\\v l}',
      '\u013F': '{\\fontencoding{LELA}\\selectfont\\char201}',
      '\u0140': '{\\fontencoding{LELA}\\selectfont\\char202}',
      '\u0141': '{\\L}',
      '\u0142': '{\\l}',
      '\u0143': '{\\\'N}',
      '\u0144': '{\\\'n}',
      '\u0145': '{\\c N}',
      '\u0146': '{\\c n}',
      '\u0147': '{\\v N}',
      '\u0148': '{\\v n}',
      '\u0149': '\'n',
      '\u014A': '{\\NG}',
      '\u014B': '{\\ng}',
      '\u014C': '{\\=O}',
      '\u014D': '{\\=o}',
      '\u014E': '{\\u O}',
      '\u014F': '{\\u o}',
      '\u0150': '{\\H O}',
      '\u0151': '{\\H o}',
      '\u0152': '{\\OE}',
      '\u0153': '{\\oe}',
      '\u0154': '{\\\'R}',
      '\u0155': '{\\\'r}',
      '\u0156': '{\\c R}',
      '\u0157': '{\\c r}',
      '\u0158': '{\\v R}',
      '\u0159': '{\\v r}',
      '\u015A': '{\\\'S}',
      '\u015B': '{\\\'s}',
      '\u015C': '{\\^S}',
      '\u015D': '{\\^s}',
      '\u015E': '{\\c S}',
      '\u015F': '{\\c s}',
      '\u0160': '{\\v S}',
      '\u0161': '{\\v s}',
      '\u0162': '{\\c T}',
      '\u0163': '{\\c t}',
      '\u0164': '{\\v T}',
      '\u0165': '{\\v t}',
      '\u0166': '{\\fontencoding{LELA}\\selectfont\\char47}',
      '\u0167': '{\\fontencoding{LELA}\\selectfont\\char63}',
      '\u0168': '{\\~U}',
      '\u0169': '{\\~u}',
      '\u016A': '{\\=U}',
      '\u016B': '{\\=u}',
      '\u016C': '{\\u U}',
      '\u016D': '{\\u u}',
      '\u016E': '\\r{U}',
      '\u016F': '\\r{u}',
      '\u0170': '{\\H U}',
      '\u0171': '{\\H u}',
      '\u0172': '\\k{U}',
      '\u0173': '\\k{u}',
      '\u0174': '{\\^W}',
      '\u0175': '{\\^w}',
      '\u0176': '{\\^Y}',
      '\u0177': '{\\^y}',
      '\u0178': '{\\"Y}',
      '\u0179': '{\\\'Z}',
      '\u017A': '{\\\'z}',
      '\u017B': '{\\.Z}',
      '\u017C': '{\\.z}',
      '\u017D': '{\\v Z}',
      '\u017E': '{\\v z}',
      '\u0195': '{\\texthvlig}',
      '\u019E': '{\\textnrleg}',
      '\u01BA': '{\\fontencoding{LELA}\\selectfont\\char195}',
      '\u01C2': '{\\textdoublepipe}',
      '\u01F5': '{\\\'g}',
      '\u0258': '{\\fontencoding{LEIP}\\selectfont\\char61}',
      '\u0261': 'g',
      '\u0272': '\\Elzltln{}',
      '\u0278': '\\textphi{}',
      '\u027F': '{\\fontencoding{LEIP}\\selectfont\\char202}',
      '\u029E': '\\textturnk{}',
      '\u02BC': '\'',
      '\u02C7': '\\textasciicaron{}',
      '\u02D8': '\\textasciibreve{}',
      '\u02D9': '\\textperiodcentered{}',
      '\u02DA': '\\r{}',
      '\u02DB': '\\k{}',
      '\u02DC': '\\texttildelow{}',
      '\u02DD': '\\H{}',
      '\u02E5': '\\tone{55}',
      '\u02E6': '\\tone{44}',
      '\u02E7': '\\tone{33}',
      '\u02E8': '\\tone{22}',
      '\u02E9': '\\tone{11}',
      '\u0300': '\\`',
      '\u0301': '\\\'',
      '\u0302': '\\^',
      '\u0303': '\\~',
      '\u0304': '\\=',
      '\u0306': '\\u{}',
      '\u0307': '\\.',
      '\u0308': '\\"',
      '\u030A': '\\r{}',
      '\u030B': '\\H{}',
      '\u030C': '\\v{}',
      '\u030F': '\\cyrchar\\C{}',
      '\u0311': '{\\fontencoding{LECO}\\selectfont\\char177}',
      '\u0318': '{\\fontencoding{LECO}\\selectfont\\char184}',
      '\u0319': '{\\fontencoding{LECO}\\selectfont\\char185}',
      '\u0322': '\\Elzrh{}',
      '\u0327': '\\c{}',
      '\u0328': '\\k{}',
      '\u032B': '{\\fontencoding{LECO}\\selectfont\\char203}',
      '\u032F': '{\\fontencoding{LECO}\\selectfont\\char207}',
      '\u0335': '\\Elzxl{}',
      '\u0336': '\\Elzbar{}',
      '\u0337': '{\\fontencoding{LECO}\\selectfont\\char215}',
      '\u0338': '{\\fontencoding{LECO}\\selectfont\\char216}',
      '\u033A': '{\\fontencoding{LECO}\\selectfont\\char218}',
      '\u033B': '{\\fontencoding{LECO}\\selectfont\\char219}',
      '\u033C': '{\\fontencoding{LECO}\\selectfont\\char220}',
      '\u033D': '{\\fontencoding{LECO}\\selectfont\\char221}',
      '\u0361': '{\\fontencoding{LECO}\\selectfont\\char225}',
      '\u0386': '{\\\'A}',
      '\u0388': '{\\\'E}',
      '\u0389': '{\\\'H}',
      '\u038A': '\\\'{}{I}',
      '\u038C': '{\\\'{}O}',
      '\u03AC': '{\\\'$\\alpha$}',
      '\u03B8': '\\texttheta{}',
      '\u03CC': '{\\\'o}',
      '\u03D0': '\\Pisymbol{ppi022}{87}',
      '\u03D1': '\\textvartheta{}',
      '\u03F4': '\\textTheta{}',
      '\u0401': '\\cyrchar\\CYRYO{}',
      '\u0402': '\\cyrchar\\CYRDJE{}',
      '\u0403': '\\cyrchar{\\\'\\CYRG}',
      '\u0404': '\\cyrchar\\CYRIE{}',
      '\u0405': '\\cyrchar\\CYRDZE{}',
      '\u0406': '\\cyrchar\\CYRII{}',
      '\u0407': '\\cyrchar\\CYRYI{}',
      '\u0408': '\\cyrchar\\CYRJE{}',
      '\u0409': '\\cyrchar\\CYRLJE{}',
      '\u040A': '\\cyrchar\\CYRNJE{}',
      '\u040B': '\\cyrchar\\CYRTSHE{}',
      '\u040C': '\\cyrchar{\\\'\\CYRK}',
      '\u040E': '\\cyrchar\\CYRUSHRT{}',
      '\u040F': '\\cyrchar\\CYRDZHE{}',
      '\u0410': '\\cyrchar\\CYRA{}',
      '\u0411': '\\cyrchar\\CYRB{}',
      '\u0412': '\\cyrchar\\CYRV{}',
      '\u0413': '\\cyrchar\\CYRG{}',
      '\u0414': '\\cyrchar\\CYRD{}',
      '\u0415': '\\cyrchar\\CYRE{}',
      '\u0416': '\\cyrchar\\CYRZH{}',
      '\u0417': '\\cyrchar\\CYRZ{}',
      '\u0418': '\\cyrchar\\CYRI{}',
      '\u0419': '\\cyrchar\\CYRISHRT{}',
      '\u041A': '\\cyrchar\\CYRK{}',
      '\u041B': '\\cyrchar\\CYRL{}',
      '\u041C': '\\cyrchar\\CYRM{}',
      '\u041D': '\\cyrchar\\CYRN{}',
      '\u041E': '\\cyrchar\\CYRO{}',
      '\u041F': '\\cyrchar\\CYRP{}',
      '\u0420': '\\cyrchar\\CYRR{}',
      '\u0421': '\\cyrchar\\CYRS{}',
      '\u0422': '\\cyrchar\\CYRT{}',
      '\u0423': '\\cyrchar\\CYRU{}',
      '\u0424': '\\cyrchar\\CYRF{}',
      '\u0425': '\\cyrchar\\CYRH{}',
      '\u0426': '\\cyrchar\\CYRC{}',
      '\u0427': '\\cyrchar\\CYRCH{}',
      '\u0428': '\\cyrchar\\CYRSH{}',
      '\u0429': '\\cyrchar\\CYRSHCH{}',
      '\u042A': '\\cyrchar\\CYRHRDSN{}',
      '\u042B': '\\cyrchar\\CYRERY{}',
      '\u042C': '\\cyrchar\\CYRSFTSN{}',
      '\u042D': '\\cyrchar\\CYREREV{}',
      '\u042E': '\\cyrchar\\CYRYU{}',
      '\u042F': '\\cyrchar\\CYRYA{}',
      '\u0430': '\\cyrchar\\cyra{}',
      '\u0431': '\\cyrchar\\cyrb{}',
      '\u0432': '\\cyrchar\\cyrv{}',
      '\u0433': '\\cyrchar\\cyrg{}',
      '\u0434': '\\cyrchar\\cyrd{}',
      '\u0435': '\\cyrchar\\cyre{}',
      '\u0436': '\\cyrchar\\cyrzh{}',
      '\u0437': '\\cyrchar\\cyrz{}',
      '\u0438': '\\cyrchar\\cyri{}',
      '\u0439': '\\cyrchar\\cyrishrt{}',
      '\u043A': '\\cyrchar\\cyrk{}',
      '\u043B': '\\cyrchar\\cyrl{}',
      '\u043C': '\\cyrchar\\cyrm{}',
      '\u043D': '\\cyrchar\\cyrn{}',
      '\u043E': '\\cyrchar\\cyro{}',
      '\u043F': '\\cyrchar\\cyrp{}',
      '\u0440': '\\cyrchar\\cyrr{}',
      '\u0441': '\\cyrchar\\cyrs{}',
      '\u0442': '\\cyrchar\\cyrt{}',
      '\u0443': '\\cyrchar\\cyru{}',
      '\u0444': '\\cyrchar\\cyrf{}',
      '\u0445': '\\cyrchar\\cyrh{}',
      '\u0446': '\\cyrchar\\cyrc{}',
      '\u0447': '\\cyrchar\\cyrch{}',
      '\u0448': '\\cyrchar\\cyrsh{}',
      '\u0449': '\\cyrchar\\cyrshch{}',
      '\u044A': '\\cyrchar\\cyrhrdsn{}',
      '\u044B': '\\cyrchar\\cyrery{}',
      '\u044C': '\\cyrchar\\cyrsftsn{}',
      '\u044D': '\\cyrchar\\cyrerev{}',
      '\u044E': '\\cyrchar\\cyryu{}',
      '\u044F': '\\cyrchar\\cyrya{}',
      '\u0451': '\\cyrchar\\cyryo{}',
      '\u0452': '\\cyrchar\\cyrdje{}',
      '\u0453': '\\cyrchar{\\\'\\cyrg}',
      '\u0454': '\\cyrchar\\cyrie{}',
      '\u0455': '\\cyrchar\\cyrdze{}',
      '\u0456': '\\cyrchar\\cyrii{}',
      '\u0457': '\\cyrchar\\cyryi{}',
      '\u0458': '\\cyrchar\\cyrje{}',
      '\u0459': '\\cyrchar\\cyrlje{}',
      '\u045A': '\\cyrchar\\cyrnje{}',
      '\u045B': '\\cyrchar\\cyrtshe{}',
      '\u045C': '\\cyrchar{\\\'\\cyrk}',
      '\u045E': '\\cyrchar\\cyrushrt{}',
      '\u045F': '\\cyrchar\\cyrdzhe{}',
      '\u0460': '\\cyrchar\\CYROMEGA{}',
      '\u0461': '\\cyrchar\\cyromega{}',
      '\u0462': '\\cyrchar\\CYRYAT{}',
      '\u0464': '\\cyrchar\\CYRIOTE{}',
      '\u0465': '\\cyrchar\\cyriote{}',
      '\u0466': '\\cyrchar\\CYRLYUS{}',
      '\u0467': '\\cyrchar\\cyrlyus{}',
      '\u0468': '\\cyrchar\\CYRIOTLYUS{}',
      '\u0469': '\\cyrchar\\cyriotlyus{}',
      '\u046A': '\\cyrchar\\CYRBYUS{}',
      '\u046C': '\\cyrchar\\CYRIOTBYUS{}',
      '\u046D': '\\cyrchar\\cyriotbyus{}',
      '\u046E': '\\cyrchar\\CYRKSI{}',
      '\u046F': '\\cyrchar\\cyrksi{}',
      '\u0470': '\\cyrchar\\CYRPSI{}',
      '\u0471': '\\cyrchar\\cyrpsi{}',
      '\u0472': '\\cyrchar\\CYRFITA{}',
      '\u0474': '\\cyrchar\\CYRIZH{}',
      '\u0478': '\\cyrchar\\CYRUK{}',
      '\u0479': '\\cyrchar\\cyruk{}',
      '\u047A': '\\cyrchar\\CYROMEGARND{}',
      '\u047B': '\\cyrchar\\cyromegarnd{}',
      '\u047C': '\\cyrchar\\CYROMEGATITLO{}',
      '\u047D': '\\cyrchar\\cyromegatitlo{}',
      '\u047E': '\\cyrchar\\CYROT{}',
      '\u047F': '\\cyrchar\\cyrot{}',
      '\u0480': '\\cyrchar\\CYRKOPPA{}',
      '\u0481': '\\cyrchar\\cyrkoppa{}',
      '\u0482': '\\cyrchar\\cyrthousands{}',
      '\u0488': '\\cyrchar\\cyrhundredthousands{}',
      '\u0489': '\\cyrchar\\cyrmillions{}',
      '\u048C': '\\cyrchar\\CYRSEMISFTSN{}',
      '\u048D': '\\cyrchar\\cyrsemisftsn{}',
      '\u048E': '\\cyrchar\\CYRRTICK{}',
      '\u048F': '\\cyrchar\\cyrrtick{}',
      '\u0490': '\\cyrchar\\CYRGUP{}',
      '\u0491': '\\cyrchar\\cyrgup{}',
      '\u0492': '\\cyrchar\\CYRGHCRS{}',
      '\u0493': '\\cyrchar\\cyrghcrs{}',
      '\u0494': '\\cyrchar\\CYRGHK{}',
      '\u0495': '\\cyrchar\\cyrghk{}',
      '\u0496': '\\cyrchar\\CYRZHDSC{}',
      '\u0497': '\\cyrchar\\cyrzhdsc{}',
      '\u0498': '\\cyrchar\\CYRZDSC{}',
      '\u0499': '\\cyrchar\\cyrzdsc{}',
      '\u049A': '\\cyrchar\\CYRKDSC{}',
      '\u049B': '\\cyrchar\\cyrkdsc{}',
      '\u049C': '\\cyrchar\\CYRKVCRS{}',
      '\u049D': '\\cyrchar\\cyrkvcrs{}',
      '\u049E': '\\cyrchar\\CYRKHCRS{}',
      '\u049F': '\\cyrchar\\cyrkhcrs{}',
      '\u04A0': '\\cyrchar\\CYRKBEAK{}',
      '\u04A1': '\\cyrchar\\cyrkbeak{}',
      '\u04A2': '\\cyrchar\\CYRNDSC{}',
      '\u04A3': '\\cyrchar\\cyrndsc{}',
      '\u04A4': '\\cyrchar\\CYRNG{}',
      '\u04A5': '\\cyrchar\\cyrng{}',
      '\u04A6': '\\cyrchar\\CYRPHK{}',
      '\u04A7': '\\cyrchar\\cyrphk{}',
      '\u04A8': '\\cyrchar\\CYRABHHA{}',
      '\u04A9': '\\cyrchar\\cyrabhha{}',
      '\u04AA': '\\cyrchar\\CYRSDSC{}',
      '\u04AB': '\\cyrchar\\cyrsdsc{}',
      '\u04AC': '\\cyrchar\\CYRTDSC{}',
      '\u04AD': '\\cyrchar\\cyrtdsc{}',
      '\u04AE': '\\cyrchar\\CYRY{}',
      '\u04AF': '\\cyrchar\\cyry{}',
      '\u04B0': '\\cyrchar\\CYRYHCRS{}',
      '\u04B1': '\\cyrchar\\cyryhcrs{}',
      '\u04B2': '\\cyrchar\\CYRHDSC{}',
      '\u04B3': '\\cyrchar\\cyrhdsc{}',
      '\u04B4': '\\cyrchar\\CYRTETSE{}',
      '\u04B5': '\\cyrchar\\cyrtetse{}',
      '\u04B6': '\\cyrchar\\CYRCHRDSC{}',
      '\u04B7': '\\cyrchar\\cyrchrdsc{}',
      '\u04B8': '\\cyrchar\\CYRCHVCRS{}',
      '\u04B9': '\\cyrchar\\cyrchvcrs{}',
      '\u04BA': '\\cyrchar\\CYRSHHA{}',
      '\u04BB': '\\cyrchar\\cyrshha{}',
      '\u04BC': '\\cyrchar\\CYRABHCH{}',
      '\u04BD': '\\cyrchar\\cyrabhch{}',
      '\u04BE': '\\cyrchar\\CYRABHCHDSC{}',
      '\u04BF': '\\cyrchar\\cyrabhchdsc{}',
      '\u04C0': '\\cyrchar\\CYRpalochka{}',
      '\u04C3': '\\cyrchar\\CYRKHK{}',
      '\u04C4': '\\cyrchar\\cyrkhk{}',
      '\u04C7': '\\cyrchar\\CYRNHK{}',
      '\u04C8': '\\cyrchar\\cyrnhk{}',
      '\u04CB': '\\cyrchar\\CYRCHLDSC{}',
      '\u04CC': '\\cyrchar\\cyrchldsc{}',
      '\u04D4': '\\cyrchar\\CYRAE{}',
      '\u04D5': '\\cyrchar\\cyrae{}',
      '\u04D8': '\\cyrchar\\CYRSCHWA{}',
      '\u04D9': '\\cyrchar\\cyrschwa{}',
      '\u04E0': '\\cyrchar\\CYRABHDZE{}',
      '\u04E1': '\\cyrchar\\cyrabhdze{}',
      '\u04E8': '\\cyrchar\\CYROTLD{}',
      '\u04E9': '\\cyrchar\\cyrotld{}',
      '\u2002': '\\hspace{0.6em}',
      '\u2003': '\\quad{}',
      '\u2004': '\\;',
      '\u2005': '\\hspace{0.25em}',
      '\u2006': '\\hspace{0.166em}',
      '\u2007': '\\hphantom{0}',
      '\u2008': '\\hphantom{,}',
      '\u2009': '\\,',
      '\u200B': '\\mbox{}',
      '\u200C': '{\\aftergroup\\ignorespaces}',
      '\u2010': '-',
      '\u2013': '\\textendash{}',
      '\u2014': '\\textemdash{}',
      '\u2015': '\\rule{1em}{1pt}',
      '\u2018': '`',
      '\u2019': '\'',
      '\u201A': ',',
      '\u201C': '``',
      '\u201D': '\'\'',
      '\u201E': ',,',
      '\u2020': '\\textdagger{}',
      '\u2021': '\\textdaggerdbl{}',
      '\u2022': '\\textbullet{}',
      '\u2024': '.',
      '\u2025': '..',
      '\u2026': '\\ldots{}',
      '\u2030': '\\textperthousand{}',
      '\u2031': '\\textpertenthousand{}',
      '\u2039': '\\guilsinglleft{}',
      '\u203A': '\\guilsinglright{}',
      '\u205F': '\\:',
      '\u2060': '\\nolinebreak{}',
      '\u20A7': '\\ensuremath{\\Elzpes}',
      '\u20AC': '\\texteuro{}',
      '\u210A': '\\mathscr{g}',
      '\u2116': '\\cyrchar\\textnumero{}',
      '\u2122': '\\texttrademark{}',
      '\u2212': '-',
      '\u2254': ':=',
      '\u2305': '\\barwedge{}',
      '\u2423': '\\textvisiblespace{}',
      '\u2460': '\\ding{172}',
      '\u2461': '\\ding{173}',
      '\u2462': '\\ding{174}',
      '\u2463': '\\ding{175}',
      '\u2464': '\\ding{176}',
      '\u2465': '\\ding{177}',
      '\u2466': '\\ding{178}',
      '\u2467': '\\ding{179}',
      '\u2468': '\\ding{180}',
      '\u2469': '\\ding{181}',
      '\u25A0': '\\ding{110}',
      '\u25B2': '\\ding{115}',
      '\u25BC': '\\ding{116}',
      '\u25C6': '\\ding{117}',
      '\u25CF': '\\ding{108}',
      '\u25D7': '\\ding{119}',
      '\u2605': '\\ding{72}',
      '\u2606': '\\ding{73}',
      '\u260E': '\\ding{37}',
      '\u261B': '\\ding{42}',
      '\u261E': '\\ding{43}',
      '\u263E': '\\rightmoon{}',
      '\u263F': '\\mercury{}',
      '\u2640': '\\venus{}',
      '\u2642': '\\male{}',
      '\u2643': '\\jupiter{}',
      '\u2644': '\\saturn{}',
      '\u2645': '\\uranus{}',
      '\u2646': '\\neptune{}',
      '\u2647': '\\pluto{}',
      '\u2648': '\\aries{}',
      '\u2649': '\\taurus{}',
      '\u264A': '\\gemini{}',
      '\u264B': '\\cancer{}',
      '\u264C': '\\leo{}',
      '\u264D': '\\virgo{}',
      '\u264E': '\\libra{}',
      '\u264F': '\\scorpio{}',
      '\u2650': '\\sagittarius{}',
      '\u2651': '\\capricornus{}',
      '\u2652': '\\aquarius{}',
      '\u2653': '\\pisces{}',
      '\u2660': '\\ding{171}',
      '\u2663': '\\ding{168}',
      '\u2665': '\\ding{170}',
      '\u2666': '\\ding{169}',
      '\u2669': '\\quarternote{}',
      '\u266A': '\\eighthnote{}',
      '\u2701': '\\ding{33}',
      '\u2702': '\\ding{34}',
      '\u2703': '\\ding{35}',
      '\u2704': '\\ding{36}',
      '\u2706': '\\ding{38}',
      '\u2707': '\\ding{39}',
      '\u2708': '\\ding{40}',
      '\u2709': '\\ding{41}',
      '\u270C': '\\ding{44}',
      '\u270D': '\\ding{45}',
      '\u270E': '\\ding{46}',
      '\u270F': '\\ding{47}',
      '\u2710': '\\ding{48}',
      '\u2711': '\\ding{49}',
      '\u2712': '\\ding{50}',
      '\u2713': '\\ding{51}',
      '\u2714': '\\ding{52}',
      '\u2715': '\\ding{53}',
      '\u2716': '\\ding{54}',
      '\u2717': '\\ding{55}',
      '\u2718': '\\ding{56}',
      '\u2719': '\\ding{57}',
      '\u271A': '\\ding{58}',
      '\u271B': '\\ding{59}',
      '\u271C': '\\ding{60}',
      '\u271D': '\\ding{61}',
      '\u271E': '\\ding{62}',
      '\u271F': '\\ding{63}',
      '\u2720': '\\ding{64}',
      '\u2721': '\\ding{65}',
      '\u2722': '\\ding{66}',
      '\u2723': '\\ding{67}',
      '\u2724': '\\ding{68}',
      '\u2725': '\\ding{69}',
      '\u2726': '\\ding{70}',
      '\u2727': '\\ding{71}',
      '\u2729': '\\ding{73}',
      '\u272A': '\\ding{74}',
      '\u272B': '\\ding{75}',
      '\u272C': '\\ding{76}',
      '\u272D': '\\ding{77}',
      '\u272E': '\\ding{78}',
      '\u272F': '\\ding{79}',
      '\u2730': '\\ding{80}',
      '\u2731': '\\ding{81}',
      '\u2732': '\\ding{82}',
      '\u2733': '\\ding{83}',
      '\u2734': '\\ding{84}',
      '\u2735': '\\ding{85}',
      '\u2736': '\\ding{86}',
      '\u2737': '\\ding{87}',
      '\u2738': '\\ding{88}',
      '\u2739': '\\ding{89}',
      '\u273A': '\\ding{90}',
      '\u273B': '\\ding{91}',
      '\u273C': '\\ding{92}',
      '\u273D': '\\ding{93}',
      '\u273E': '\\ding{94}',
      '\u273F': '\\ding{95}',
      '\u2740': '\\ding{96}',
      '\u2741': '\\ding{97}',
      '\u2742': '\\ding{98}',
      '\u2743': '\\ding{99}',
      '\u2744': '\\ding{100}',
      '\u2745': '\\ding{101}',
      '\u2746': '\\ding{102}',
      '\u2747': '\\ding{103}',
      '\u2748': '\\ding{104}',
      '\u2749': '\\ding{105}',
      '\u274A': '\\ding{106}',
      '\u274B': '\\ding{107}',
      '\u274D': '\\ding{109}',
      '\u274F': '\\ding{111}',
      '\u2750': '\\ding{112}',
      '\u2751': '\\ding{113}',
      '\u2752': '\\ding{114}',
      '\u2756': '\\ding{118}',
      '\u2758': '\\ding{120}',
      '\u2759': '\\ding{121}',
      '\u275A': '\\ding{122}',
      '\u275B': '\\ding{123}',
      '\u275C': '\\ding{124}',
      '\u275D': '\\ding{125}',
      '\u275E': '\\ding{126}',
      '\u2761': '\\ding{161}',
      '\u2762': '\\ding{162}',
      '\u2763': '\\ding{163}',
      '\u2764': '\\ding{164}',
      '\u2765': '\\ding{165}',
      '\u2766': '\\ding{166}',
      '\u2767': '\\ding{167}',
      '\u2776': '\\ding{182}',
      '\u2777': '\\ding{183}',
      '\u2778': '\\ding{184}',
      '\u2779': '\\ding{185}',
      '\u277A': '\\ding{186}',
      '\u277B': '\\ding{187}',
      '\u277C': '\\ding{188}',
      '\u277D': '\\ding{189}',
      '\u277E': '\\ding{190}',
      '\u277F': '\\ding{191}',
      '\u2780': '\\ding{192}',
      '\u2781': '\\ding{193}',
      '\u2782': '\\ding{194}',
      '\u2783': '\\ding{195}',
      '\u2784': '\\ding{196}',
      '\u2785': '\\ding{197}',
      '\u2786': '\\ding{198}',
      '\u2787': '\\ding{199}',
      '\u2788': '\\ding{200}',
      '\u2789': '\\ding{201}',
      '\u278A': '\\ding{202}',
      '\u278B': '\\ding{203}',
      '\u278C': '\\ding{204}',
      '\u278D': '\\ding{205}',
      '\u278E': '\\ding{206}',
      '\u278F': '\\ding{207}',
      '\u2790': '\\ding{208}',
      '\u2791': '\\ding{209}',
      '\u2792': '\\ding{210}',
      '\u2793': '\\ding{211}',
      '\u2794': '\\ding{212}',
      '\u2798': '\\ding{216}',
      '\u2799': '\\ding{217}',
      '\u279A': '\\ding{218}',
      '\u279B': '\\ding{219}',
      '\u279C': '\\ding{220}',
      '\u279D': '\\ding{221}',
      '\u279E': '\\ding{222}',
      '\u279F': '\\ding{223}',
      '\u27A0': '\\ding{224}',
      '\u27A1': '\\ding{225}',
      '\u27A2': '\\ding{226}',
      '\u27A3': '\\ding{227}',
      '\u27A4': '\\ding{228}',
      '\u27A5': '\\ding{229}',
      '\u27A6': '\\ding{230}',
      '\u27A7': '\\ding{231}',
      '\u27A8': '\\ding{232}',
      '\u27A9': '\\ding{233}',
      '\u27AA': '\\ding{234}',
      '\u27AB': '\\ding{235}',
      '\u27AC': '\\ding{236}',
      '\u27AD': '\\ding{237}',
      '\u27AE': '\\ding{238}',
      '\u27AF': '\\ding{239}',
      '\u27B1': '\\ding{241}',
      '\u27B2': '\\ding{242}',
      '\u27B3': '\\ding{243}',
      '\u27B4': '\\ding{244}',
      '\u27B5': '\\ding{245}',
      '\u27B6': '\\ding{246}',
      '\u27B7': '\\ding{247}',
      '\u27B8': '\\ding{248}',
      '\u27B9': '\\ding{249}',
      '\u27BA': '\\ding{250}',
      '\u27BB': '\\ding{251}',
      '\u27BC': '\\ding{252}',
      '\u27BD': '\\ding{253}',
      '\u27BE': '\\ding{254}',
      '\u27E8': '\\langle{}',
      '\u27E9': '\\rangle{}',
      '\uFB00': 'ff',
      '\uFB01': 'fi',
      '\uFB02': 'fl',
      '\uFB03': 'ffi',
      '\uFB04': 'ffl',
      '\uFFFD': '\\dbend{}',
      '\uD835\uDEB9': '\\mathbf{\\vartheta}',
      '\uD835\uDEDD': '\\mathbf{\\vartheta}',
      '\uD835\uDEDE': '\\mathbf{\\varkappa}',
      '\uD835\uDEDF': '\\mathbf{\\phi}',
      '\uD835\uDEE0': '\\mathbf{\\varrho}',
      '\uD835\uDEE1': '\\mathbf{\\varpi}',
      '\uD835\uDEF3': '\\mathsl{\\vartheta}',
      '\uD835\uDF17': '\\mathsl{\\vartheta}',
      '\uD835\uDF18': '\\mathsl{\\varkappa}',
      '\uD835\uDF19': '\\mathsl{\\phi}',
      '\uD835\uDF1A': '\\mathsl{\\varrho}',
      '\uD835\uDF1B': '\\mathsl{\\varpi}',
      '\uD835\uDF2D': '\\mathbit{O}',
      '\uD835\uDF51': '\\mathbit{\\vartheta}',
      '\uD835\uDF52': '\\mathbit{\\varkappa}',
      '\uD835\uDF53': '\\mathbit{\\phi}',
      '\uD835\uDF54': '\\mathbit{\\varrho}',
      '\uD835\uDF55': '\\mathbit{\\varpi}',
      '\uD835\uDF67': '\\mathsfbf{\\vartheta}',
      '\uD835\uDF8B': '\\mathsfbf{\\vartheta}',
      '\uD835\uDF8C': '\\mathsfbf{\\varkappa}',
      '\uD835\uDF8D': '\\mathsfbf{\\phi}',
      '\uD835\uDF8E': '\\mathsfbf{\\varrho}',
      '\uD835\uDF8F': '\\mathsfbf{\\varpi}',
      '\uD835\uDFA1': '\\mathsfbfsl{\\vartheta}',
      '\uD835\uDFC5': '\\mathsfbfsl{\\vartheta}',
      '\uD835\uDFC6': '\\mathsfbfsl{\\varkappa}',
      '\uD835\uDFC7': '\\mathsfbfsl{\\phi}',
      '\uD835\uDFC8': '\\mathsfbfsl{\\varrho}',
      '\uD835\uDFC9': '\\mathsfbfsl{\\varpi}'
    }
  },
  'embrace': {
    '\\k{A}': true,
    '\\k{E}': true,
    '\\k{I}': true,
    '\\k{U}': true,
    '\\k{a}': true,
    '\\k{e}': true,
    '\\k{i}': true,
    '\\k{u}': true,
    '\\r{U}': true,
    '\\r{u}': true
  }
};
  

/***/ }),
/* 45 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_to-integer.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 46 */
/*!***********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_defined.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 47 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_iter-define.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(/*! ./_library */ 48);
var $export = __webpack_require__(/*! ./_export */ 11);
var redefine = __webpack_require__(/*! ./_redefine */ 72);
var hide = __webpack_require__(/*! ./_hide */ 15);
var has = __webpack_require__(/*! ./_has */ 19);
var Iterators = __webpack_require__(/*! ./_iterators */ 21);
var $iterCreate = __webpack_require__(/*! ./_iter-create */ 100);
var setToStringTag = __webpack_require__(/*! ./_set-to-string-tag */ 36);
var getPrototypeOf = __webpack_require__(/*! ./_object-gpo */ 105);
var ITERATOR = __webpack_require__(/*! ./_wks */ 4)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 48 */
/*!***********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_library.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 49 */
/*!****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_to-primitive.js ***!
  \****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(/*! ./_is-object */ 17);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 50 */
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-create.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(/*! ./_an-object */ 16);
var dPs = __webpack_require__(/*! ./_object-dps */ 101);
var enumBugKeys = __webpack_require__(/*! ./_enum-bug-keys */ 55);
var IE_PROTO = __webpack_require__(/*! ./_shared-key */ 53)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(/*! ./_dom-create */ 71)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(/*! ./_html */ 104).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 51 */
/*!***********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_iobject.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(/*! ./_cof */ 52);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 52 */
/*!*******************************************************!*\
  !*** ../node_modules/core-js/library/modules/_cof.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 53 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_shared-key.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(/*! ./_shared */ 54)('keys');
var uid = __webpack_require__(/*! ./_uid */ 35);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 54 */
/*!**********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_shared.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ 12);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};


/***/ }),
/* 55 */
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_enum-bug-keys.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 56 */
/*!***************************************************************************!*\
  !*** ../node_modules/core-js/library/modules/core.get-iterator-method.js ***!
  \***************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(/*! ./_classof */ 57);
var ITERATOR = __webpack_require__(/*! ./_wks */ 4)('iterator');
var Iterators = __webpack_require__(/*! ./_iterators */ 21);
module.exports = __webpack_require__(/*! ./_core */ 3).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 57 */
/*!***********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_classof.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(/*! ./_cof */ 52);
var TAG = __webpack_require__(/*! ./_wks */ 4)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 58 */
/*!********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_meta.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(/*! ./_uid */ 35)('meta');
var isObject = __webpack_require__(/*! ./_is-object */ 17);
var has = __webpack_require__(/*! ./_has */ 19);
var setDesc = __webpack_require__(/*! ./_object-dp */ 9).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(/*! ./_fails */ 18)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 59 */
/*!*******************************************************!*\
  !*** ../node_modules/babel-runtime/helpers/typeof.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _iterator = __webpack_require__(/*! ../core-js/symbol/iterator */ 126);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(/*! ../core-js/symbol */ 128);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

/***/ }),
/* 60 */
/*!***********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_wks-ext.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(/*! ./_wks */ 4);


/***/ }),
/* 61 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_wks-define.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ 12);
var core = __webpack_require__(/*! ./_core */ 3);
var LIBRARY = __webpack_require__(/*! ./_library */ 48);
var wksExt = __webpack_require__(/*! ./_wks-ext */ 60);
var defineProperty = __webpack_require__(/*! ./_object-dp */ 9).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 62 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-gops.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 63 */
/*!*************************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/get-iterator.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/get-iterator */ 136), __esModule: true };

/***/ }),
/* 64 */
/*!************************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/object/keys.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/object/keys */ 138), __esModule: true };

/***/ }),
/* 65 */
/*!**********************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/edtf.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.edtfParse = edtfParse;
exports.edtfCheck = edtfCheck;

var _parser = __webpack_require__(/*! ../lib/edtf/src/parser */ 146);

function edtfParse(dateString) {
    return (0, _parser.parse)(
    // Convert to edtf draft spec format supported by edtf.js
    dateString.replace(/^y/, 'Y').replace(/unknown/g, '*').replace(/open/g, '').replace(/u/g, 'X').replace(/\?~/g, '%'));
}

function edtfCheck(dateString) {
    // check if date is valid edtf string (level 0 or 1).
    try {
        var dateObj = edtfParse(dateString);
        if (dateObj.level < 2 && (dateObj.type === 'Date' && dateObj.values || dateObj.type === 'Season' && dateObj.values || dateObj.type === 'Interval' && dateObj.values[0].values && dateObj.values[1].values)) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

/***/ }),
/* 66 */,
/* 67 */,
/* 68 */
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.object.to-string.js ***!
  \***********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {



/***/ }),
/* 69 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_a-function.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 70 */
/*!******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_ie8-dom-define.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(/*! ./_descriptors */ 13) && !__webpack_require__(/*! ./_fails */ 18)(function () {
  return Object.defineProperty(__webpack_require__(/*! ./_dom-create */ 71)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 71 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_dom-create.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ 17);
var document = __webpack_require__(/*! ./_global */ 12).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 72 */
/*!************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_redefine.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./_hide */ 15);


/***/ }),
/* 73 */
/*!************************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-keys-internal.js ***!
  \************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(/*! ./_has */ 19);
var toIObject = __webpack_require__(/*! ./_to-iobject */ 22);
var arrayIndexOf = __webpack_require__(/*! ./_array-includes */ 102)(false);
var IE_PROTO = __webpack_require__(/*! ./_shared-key */ 53)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 74 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_iter-step.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 75 */
/*!****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_redefine-all.js ***!
  \****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var hide = __webpack_require__(/*! ./_hide */ 15);
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};


/***/ }),
/* 76 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_an-instance.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),
/* 77 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_iter-call.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(/*! ./_an-object */ 16);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 78 */
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_is-array-iter.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(/*! ./_iterators */ 21);
var ITERATOR = __webpack_require__(/*! ./_wks */ 4)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 79 */
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_validate-collection.js ***!
  \***********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ 17);
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};


/***/ }),
/* 80 */
/*!************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_is-array.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(/*! ./_cof */ 52);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 81 */
/*!******************************************************************!*\
  !*** ../node_modules/babel-runtime/helpers/toConsumableArray.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _from = __webpack_require__(/*! ../core-js/array/from */ 82);

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};

/***/ }),
/* 82 */
/*!***********************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/array/from.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/array/from */ 122), __esModule: true };

/***/ }),
/* 83 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-gopn.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(/*! ./_object-keys-internal */ 73);
var hiddenKeys = __webpack_require__(/*! ./_enum-bug-keys */ 55).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 84 */
/*!***********************************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/object/define-property.js ***!
  \***********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/object/define-property */ 141), __esModule: true };

/***/ }),
/* 85 */
/*!***************************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/import/literal-parser.js ***!
  \***************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexLiteralParser = undefined;

var _getIterator2 = __webpack_require__(/*! babel-runtime/core-js/get-iterator */ 63);

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ 23);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(/*! babel-runtime/helpers/createClass */ 24);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LATEX_COMMANDS = [// commands that can can contain richtext.
['\\textbf{', 'strong'], ['\\mkbibbold{', 'strong'], ['\\mkbibitalic{', 'em'], ['\\mkbibemph{', 'em'], ['\\textit{', 'em'], ['\\emph{', 'em'], ['\\textsc{', 'smallcaps'], ['\\enquote{', 'enquote'], ['\\mkbibquote{', 'enquote'], ['\\textsubscript{', 'sub'], ['\\textsuperscript{', 'sup']];

var LATEX_VERBATIM_COMMANDS = [// commands that can only contain plaintext.
['\\url{', 'url']];

var LATEX_SPECIAL_CHARS = {
    '&': '&',
    '%': '%',
    '$': '$',
    '#': '#',
    '_': '_',
    '{': '{',
    '}': '}',
    ',': ',',
    '~': '~',
    '^': '^',
    '\'': '\'',
    ';': '\u2004',
    '\\': '\n'
};

var BibLatexLiteralParser = exports.BibLatexLiteralParser = function () {
    function BibLatexLiteralParser(string) {
        var cpMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        (0, _classCallCheck3.default)(this, BibLatexLiteralParser);

        this.string = string;
        this.cpMode = cpMode; // Whether to consider case preservation.
        this.braceLevel = 0;
        this.slen = string.length;
        this.si = 0; // string index
        this.json = [];
        this.braceClosings = [];
        this.currentMarks = [];
        this.inCasePreserve = false;
        this.textNode = false;
    }

    // If the last text node has no content, remove it.


    (0, _createClass3.default)(BibLatexLiteralParser, [{
        key: 'removeIfEmptyTextNode',
        value: function removeIfEmptyTextNode() {
            if (this.textNode.text.length === 0) {
                this.json.pop();
            }
        }
    }, {
        key: 'checkAndAddNewTextNode',
        value: function checkAndAddNewTextNode() {
            if (this.textNode.text.length > 0) {
                // We have text in the last node already,
                // so we need to start a new text node.
                this.addNewTextNode();
            }
        }
    }, {
        key: 'addNewTextNode',
        value: function addNewTextNode() {
            this.textNode = { type: 'text', text: '' };
            this.json.push(this.textNode);
        }
    }, {
        key: 'stringParser',
        value: function stringParser() {
            this.addNewTextNode();

            parseString: while (this.si < this.slen) {
                switch (this.string[this.si]) {
                    case '\\':
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = (0, _getIterator3.default)(LATEX_COMMANDS), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var command = _step.value;

                                if (this.string.substring(this.si, this.si + command[0].length) === command[0]) {
                                    this.braceLevel++;
                                    this.si += command[0].length;
                                    this.checkAndAddNewTextNode();
                                    if (this.cpMode) {
                                        // If immediately inside a brace that added case protection, remove case protection. See
                                        // http://tex.stackexchange.com/questions/276943/biblatex-how-to-emphasize-but-not-caps-protect
                                        if (this.inCasePreserve === this.braceLevel - 1 && this.string[this.si - 1] === '{' && this.currentMarks[this.currentMarks.length - 1].type === 'nocase') {
                                            this.currentMarks.pop();
                                            this.inCasePreserve = false;
                                        } else {
                                            // Of not immediately inside a brace, any styling also
                                            // adds case protection.
                                            this.currentMarks.push({ type: 'nocase' });
                                            this.inCasePreserve = this.braceLevel;
                                        }
                                    }
                                    this.currentMarks.push({ type: command[1] });
                                    this.textNode.marks = this.currentMarks.slice();
                                    this.braceClosings.push(true);
                                    continue parseString;
                                }
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = (0, _getIterator3.default)(LATEX_VERBATIM_COMMANDS), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var _command = _step2.value;

                                if (this.string.substring(this.si, this.si + _command[0].length) === _command[0]) {
                                    this.checkAndAddNewTextNode();
                                    this.textNode.marks = this.currentMarks.slice();
                                    this.textNode.marks.push({ type: _command[1] });
                                    this.si += _command[0].length;
                                    var _sj = this.si;
                                    var internalBraceLevel = 0;
                                    while (_sj < this.slen && (this.string[_sj] !== '}' || internalBraceLevel > 0)) {
                                        switch (this.string[_sj]) {
                                            case '{':
                                                internalBraceLevel++;
                                                break;
                                            case '}':
                                                internalBraceLevel--;
                                                break;
                                        }
                                        _sj++;
                                    }
                                    this.textNode.text = this.string.substring(this.si, _sj);
                                    this.addNewTextNode();
                                    this.si = _sj + 1;
                                    continue parseString;
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        if (LATEX_SPECIAL_CHARS[this.string[this.si + 1]]) {
                            this.textNode.text += LATEX_SPECIAL_CHARS[this.string[this.si + 1]];
                            this.si += 2;
                        } else {
                            // We don't know the command and skip it.
                            this.si++;
                            while (this.si < this.slen && this.string[this.si].match("[a-zA-Z0-9]")) {
                                this.si++;
                            }
                            // If there is a brace at the end of the command,
                            // increase brace level but ignore brace.
                            if (this.string[this.si] === "{") {
                                this.braceLevel++;
                                this.braceClosings.push(false);
                                this.si++;
                            }
                        }
                        break;
                    case '_':
                        switch (this.string[this.si + 1]) {
                            case '{':
                                this.checkAndAddNewTextNode();
                                this.braceLevel++;
                                this.si += 2;
                                this.currentMarks.push({ type: 'sub' });
                                this.textNode.marks = this.currentMarks.slice();
                                this.braceClosings.push(true);
                                break;
                            case '\\':
                                // There is a command following directly. Ignore the sub symbol.
                                this.si++;
                                break;
                            default:
                                // We only add the next character to a sub node.
                                this.checkAndAddNewTextNode();
                                this.textNode.marks = this.currentMarks.slice();
                                this.textNode.marks.push({ type: 'sub' });
                                this.textNode.text = this.string[this.si + 1];
                                this.addNewTextNode();
                                if (this.currentMarks.length) {
                                    this.textNode.marks = this.currentMarks.slice();
                                }
                                this.si += 2;
                        }
                        break;
                    case '`':
                        if (this.string[this.si + 1] === '`') {
                            this.checkAndAddNewTextNode();
                            this.braceLevel++;
                            this.si += 2;
                            this.currentMarks.push({ type: 'enquote' });
                            this.textNode.marks = this.currentMarks.slice();
                            this.braceClosings.push(true);
                        } else {
                            this.textNode.text += this.string[this.si];
                            this.si++;
                        }
                        break;
                    case '\'':
                        if (this.string[this.si + 1] === '\'') {
                            this.braceLevel--;
                            if (this.braceLevel > -1) {
                                var closeBrace = this.braceClosings.pop();
                                if (closeBrace) {
                                    this.checkAndAddNewTextNode();
                                    this.currentMarks.pop();
                                    if (this.currentMarks.length) {
                                        this.textNode.marks = this.currentMarks.slice();
                                    } else {
                                        delete this.textNode.marks;
                                    }
                                }
                                this.si += 2;
                                continue parseString;
                            } else {
                                // A brace was closed before it was opened. Abort and return the original string.
                                return [{ type: 'text', text: this.string }];
                            }
                        } else {
                            this.textNode.text += this.string[this.si];
                            this.si++;
                        }
                        break;
                    case '^':
                        switch (this.string[this.si + 1]) {
                            case '{':
                                this.checkAndAddNewTextNode();
                                this.braceLevel++;
                                this.si += 2;
                                this.currentMarks.push({ type: 'sup' });
                                this.textNode.marks = this.currentMarks.slice();
                                this.braceClosings.push(true);
                                break;
                            case '\\':
                                // There is a command following directly. Ignore the sup symbol.
                                this.si++;
                                break;
                            default:
                                // We only add the next character to a sup node.
                                this.checkAndAddNewTextNode();
                                this.textNode.marks = this.currentMarks.slice();
                                this.textNode.marks.push({ type: 'sup' });
                                this.textNode.text = this.string[this.si + 1];
                                this.addNewTextNode();
                                if (this.currentMarks.length) {
                                    this.textNode.marks = this.currentMarks.slice();
                                }
                                this.si += 2;
                        }
                        break;
                    case '{':
                        if (this.string[this.si + 1] === '}') {
                            // bracket is closing immediately. Ignore it.
                            this.si += 2;
                            continue;
                        }
                        this.braceLevel++;
                        if (this.inCasePreserve || !this.cpMode) {
                            // If already inside case preservation, do not add a second
                            this.braceClosings.push(false);
                        } else {
                            this.inCasePreserve = this.braceLevel;
                            this.checkAndAddNewTextNode();
                            this.currentMarks.push({ type: 'nocase' });
                            this.textNode.marks = this.currentMarks.slice();
                            this.braceClosings.push(true);
                        }
                        this.si++;
                        break;
                    case '}':
                        this.braceLevel--;
                        if (this.braceLevel > -1) {
                            var _closeBrace = this.braceClosings.pop();
                            if (_closeBrace) {
                                this.checkAndAddNewTextNode();
                                var lastMark = this.currentMarks.pop();
                                if (this.inCasePreserve === this.braceLevel + 1) {
                                    this.inCasePreserve = false;
                                    // The last tag may have added more tags. The
                                    // lowest level will be the case preserving one.
                                    while (lastMark.type !== 'nocase' && this.currentMarks.length) {
                                        lastMark = this.currentMarks.pop();
                                    }
                                }
                                if (this.currentMarks.length) {
                                    this.textNode.marks = this.currentMarks.slice();
                                } else {
                                    delete this.textNode.marks;
                                }
                            }
                            this.si++;
                            continue parseString;
                        } else {
                            // A brace was closed before it was opened. Abort and return the original string.
                            return [{ type: 'text', text: this.string }];
                        }
                        break;
                    case '$':
                        // math env, just remove
                        this.si++;
                        break;
                    case '~':
                        // a non-breakable space
                        this.textNode.text += '\xA0';
                        this.si++;
                        break;
                    case '\u0870':
                        // An undefined variable.
                        this.removeIfEmptyTextNode();
                        var sj = this.si + 1;
                        while (sj < this.slen && this.string[sj] !== '\u0870') {
                            sj++;
                        }
                        var variable = this.string.substring(this.si + 1, sj);
                        this.json.push({ type: 'variable', attrs: { variable: variable } });
                        this.addNewTextNode();
                        this.si = sj + 1;
                        break;
                    case '\r':
                        this.si++;
                        break;
                    case '\n':
                        if (['\r', '\n'].includes(this.string[this.si + 1]) && this.string[this.si - 1] !== '\n') {
                            this.textNode.text += '\n\n';
                        } else if (/\S/.test(this.string[this.si - 1]) && /\S/.test(this.string[this.si + 1])) {
                            this.textNode.text += ' ';
                        }
                        this.si++;
                        break;
                    default:
                        this.textNode.text += this.string[this.si];
                        this.si++;
                }
            }

            if (this.braceLevel > 0) {
                // Too many opening braces, we return the original string.
                return [{ type: 'text', text: this.string }];
            }

            this.removeIfEmptyTextNode();

            // Braces were accurate.
            return this.json;
        }
    }, {
        key: 'output',
        get: function get() {
            return this.stringParser();
        }
    }]);
    return BibLatexLiteralParser;
}();

/***/ }),
/* 86 */
/*!**************************************************************!*\
  !*** ../node_modules/babel-runtime/helpers/slicedToArray.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _isIterable2 = __webpack_require__(/*! ../core-js/is-iterable */ 150);

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = __webpack_require__(/*! ../core-js/get-iterator */ 63);

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

/***/ }),
/* 87 */
/*!**********************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/edtf/src/bitmask.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray2 = __webpack_require__(/*! babel-runtime/helpers/slicedToArray */ 86);

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _typeof2 = __webpack_require__(/*! babel-runtime/helpers/typeof */ 59);

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ 23);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(/*! babel-runtime/helpers/createClass */ 24);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DAY = /^days?$/i;
var MONTH = /^months?$/i;
var YEAR = /^years?$/i;
var SYMBOL = /^[xX]$/;
var SYMBOLS = /[xX]/g;
var PATTERN = /^[0-9xXdDmMyY]{8}$/;
var YYYYMMDD = 'YYYYMMDD'.split('');
var MAXDAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

var pow = Math.pow,
    max = Math.max,
    min = Math.min;

/**
 * Bitmasks are used to set Unspecified, Uncertain and
 * Approximate flags for a Date. The bitmask for one
 * feature corresponds to a numeric value based on the
 * following pattern:
 *
 *           YYYYMMDD
 *           --------
 *   Day     00000011
 *   Month   00001100
 *   Year    11110000
 *
 */

var Bitmask = function () {
  (0, _createClass3.default)(Bitmask, null, [{
    key: 'test',
    value: function test(a, b) {
      return this.convert(a) & this.convert(b);
    }
  }, {
    key: 'convert',
    value: function convert() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      // eslint-disable-line complexity
      value = value || 0;

      if (value instanceof Bitmask) return value.value;

      switch (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) {
        case 'number':
          return value;

        case 'boolean':
          return value ? Bitmask.YMD : 0;

        case 'string':
          if (DAY.test(value)) return Bitmask.DAY;
          if (MONTH.test(value)) return Bitmask.MONTH;
          if (YEAR.test(value)) return Bitmask.YEAR;
          if (PATTERN.test(value)) return Bitmask.compute(value);
        // fall through!

        default:
          throw new Error('invalid value: ' + value);
      }
    }
  }, {
    key: 'compute',
    value: function compute(value) {
      return value.split('').reduce(function (memo, c, idx) {
        return memo | (SYMBOL.test(c) ? pow(2, idx) : 0);
      }, 0);
    }
  }, {
    key: 'values',
    value: function values(mask) {
      var digit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var num = Bitmask.numbers(mask, digit).split('');
      var values = [Number(num.slice(0, 4).join(''))];

      if (num.length > 4) values.push(Number(num.slice(4, 6).join('')));
      if (num.length > 6) values.push(Number(num.slice(6, 8).join('')));

      return Bitmask.normalize(values);
    }
  }, {
    key: 'numbers',
    value: function numbers(mask) {
      var digit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return mask.replace(SYMBOLS, digit);
    }
  }, {
    key: 'normalize',
    value: function normalize(values) {
      if (values.length > 1) values[1] = min(11, max(0, values[1] - 1));

      if (values.length > 2) values[2] = min(MAXDAYS[values[1]] || NaN, max(1, values[2]));

      return values;
    }
  }]);

  function Bitmask() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    (0, _classCallCheck3.default)(this, Bitmask);

    this.value = Bitmask.convert(value);
  }

  (0, _createClass3.default)(Bitmask, [{
    key: 'test',
    value: function test() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this.value & Bitmask.convert(value);
    }
  }, {
    key: 'bit',
    value: function bit(k) {
      return this.value & pow(2, k);
    }
  }, {
    key: 'add',
    value: function add(value) {
      return this.value = this.value | Bitmask.convert(value), this;
    }
  }, {
    key: 'set',
    value: function set() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this.value = Bitmask.convert(value), this;
    }
  }, {
    key: 'mask',
    value: function mask() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : YYYYMMDD;

      var _this = this;

      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var symbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'X';

      return input.map(function (c, idx) {
        return _this.bit(offset + idx) ? symbol : c;
      });
    }
  }, {
    key: 'masks',
    value: function masks(values) {
      var _this2 = this;

      var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'X';

      var offset = 0;

      return values.map(function (value) {
        var mask = _this2.mask(value.split(''), offset, symbol);
        offset = offset + mask.length;

        return mask.join('');
      });
    }
  }, {
    key: 'max',
    value: function max(_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 3),
          year = _ref2[0],
          month = _ref2[1],
          day = _ref2[2];

      // eslint-disable-line complexity
      if (!year) return [];

      year = Number(this.test(Bitmask.YEAR) ? this.masks([year], '9')[0] : year);

      if (!month) return [year];

      month = Number(month) - 1;

      switch (this.test(Bitmask.MONTH)) {
        case Bitmask.MONTH:
          month = 11;
          break;
        case Bitmask.MX:
          month = month < 9 ? 8 : 11;
          break;
        case Bitmask.XM:
          month = (month + 1) % 10;
          month = month < 3 ? month + 9 : month - 1;
          break;
      }

      if (!day) return [year, month];

      day = Number(day);

      switch (this.test(Bitmask.DAY)) {
        case Bitmask.DAY:
          day = MAXDAYS[month];
          break;
        case Bitmask.DX:
          day = min(MAXDAYS[month], day + (9 - day % 10));
          break;
        case Bitmask.XD:
          day = day % 10;

          if (month === 1) {
            day = day === 9 && !leap(year) ? day + 10 : day + 20;
          } else {
            day = day < 2 ? day + 30 : day + 20;
            if (day > MAXDAYS[month]) day = day - 10;
          }

          break;
      }

      if (month === 1 && day > 28 && !leap(year)) {
        day = 28;
      }

      return [year, month, day];
    }
  }, {
    key: 'marks',
    value: function marks(values) {
      var _this3 = this;

      var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '?';

      return values.map(function (value, idx) {
        return [_this3.qualified(idx * 2) ? symbol : '', value, _this3.qualified(idx * 2 + 1) ? symbol : ''].join('');
      });
    }
  }, {
    key: 'qualified',
    value: function qualified(idx) {
      // eslint-disable-line complexity
      switch (idx) {
        case 1:
          return this.value === Bitmask.YEAR || this.value & Bitmask.YEAR && !(this.value & Bitmask.MONTH);
        case 2:
          return this.value === Bitmask.MONTH || this.value & Bitmask.MONTH && !(this.value & Bitmask.YEAR);
        case 3:
          return this.value === Bitmask.YM;
        case 4:
          return this.value === Bitmask.DAY || this.value & Bitmask.DAY && this.value !== Bitmask.YMD;
        case 5:
          return this.value === Bitmask.YMD;
        default:
          return false;
      }
    }
  }, {
    key: 'qualify',
    value: function qualify(idx) {
      return this.value = this.value | Bitmask.UA[idx], this;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.value;
    }
  }, {
    key: 'toString',
    value: function toString() {
      var symbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'X';

      return this.masks(['YYYY', 'MM', 'DD'], symbol).join('-');
    }
  }, {
    key: 'day',
    get: function get() {
      return this.test(Bitmask.DAY);
    }
  }, {
    key: 'month',
    get: function get() {
      return this.test(Bitmask.MONTH);
    }
  }, {
    key: 'year',
    get: function get() {
      return this.test(Bitmask.YEAR);
    }
  }]);
  return Bitmask;
}();

Bitmask.prototype.is = Bitmask.prototype.test;

function leap(year) {
  if (year % 4 > 0) return false;
  if (year % 100 > 0) return true;
  if (year % 400 > 0) return false;
  return true;
}

Bitmask.DAY = Bitmask.D = Bitmask.compute('yyyymmxx');
Bitmask.MONTH = Bitmask.M = Bitmask.compute('yyyyxxdd');
Bitmask.YEAR = Bitmask.Y = Bitmask.compute('xxxxmmdd');

Bitmask.MD = Bitmask.M | Bitmask.D;
Bitmask.YMD = Bitmask.Y | Bitmask.MD;
Bitmask.YM = Bitmask.Y | Bitmask.M;

Bitmask.YYXX = Bitmask.compute('yyxxmmdd');
Bitmask.YYYX = Bitmask.compute('yyyxmmdd');
Bitmask.XXXX = Bitmask.compute('xxxxmmdd');

Bitmask.DX = Bitmask.compute('yyyymmdx');
Bitmask.XD = Bitmask.compute('yyyymmxd');
Bitmask.MX = Bitmask.compute('yyyymxdd');
Bitmask.XM = Bitmask.compute('yyyyxmdd');

/*
 * Map each UA symbol position to a mask.
 *
 *   ~YYYY~-~MM~-~DD~
 *   0    1 2  3 4  5
 */
Bitmask.UA = [Bitmask.YEAR, Bitmask.YEAR, // YEAR !DAY
Bitmask.MONTH, Bitmask.YM, Bitmask.DAY, // YEARDAY
Bitmask.YMD];

module.exports = Bitmask;

/***/ }),
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */
/*!******************************!*\
  !*** ./Better BibTeX.coffee ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var BibTeXParser, Exporter, JSON5, Reference, ZoteroItem, debug, htmlEscape, importGroup, importReferences, months;

Reference = __webpack_require__(/*! ./bibtex/reference.coffee */ 42);

Exporter = __webpack_require__(/*! ./lib/exporter.coffee */ 6);

debug = __webpack_require__(/*! ./lib/debug.coffee */ 0);

JSON5 = __webpack_require__(/*! json5 */ 10);

htmlEscape = __webpack_require__(/*! ./lib/html-escape.coffee */ 94);

BibTeXParser = __webpack_require__(/*! biblatex-csl-converter */ 95).BibLatexParser;

Reference.prototype.caseConversion = {
  title: true,
  shorttitle: true,
  booktitle: true
};

Reference.prototype.fieldEncoding = {
  url: 'verbatim',
  doi: 'verbatim',
  institution: 'literal',
  publisher: 'literal'
};

Reference.prototype.requiredFields = {
  inproceedings: ['author', 'booktitle', 'pages', 'publisher', 'title', 'year'],
  article: ['author', 'journal', 'number', 'pages', 'title', 'volume', 'year'],
  techreport: ['author', 'institution', 'title', 'year'],
  incollection: ['author', 'booktitle', 'pages', 'publisher', 'title', 'year'],
  book: ['author', 'publisher', 'title', 'year'],
  inbook: ['author', 'booktitle', 'pages', 'publisher', 'title', 'year'],
  proceedings: ['editor', 'publisher', 'title', 'year'],
  phdthesis: ['author', 'school', 'title', 'year'],
  mastersthesis: ['author', 'school', 'title', 'year'],
  electronic: ['author', 'title', 'url', 'year'],
  misc: ['author', 'howpublished', 'title', 'year']
};

Reference.prototype.addCreators = function() {
  var authors, collaborators, creator, editors, j, len, primaryCreatorType, ref1, translators;
  if (!(this.item.creators && this.item.creators.length)) {
    return;
  }

  /* split creators into subcategories */
  authors = [];
  editors = [];
  translators = [];
  collaborators = [];
  primaryCreatorType = Zotero.Utilities.getCreatorsForType(this.item.itemType)[0];
  ref1 = this.item.creators;
  for (j = 0, len = ref1.length; j < len; j++) {
    creator = ref1[j];
    switch (creator.creatorType) {
      case 'editor':
      case 'seriesEditor':
        editors.push(creator);
        break;
      case 'translator':
        translators.push(creator);
        break;
      case primaryCreatorType:
        authors.push(creator);
        break;
      default:
        collaborators.push(creator);
    }
  }
  this.remove('author');
  this.remove('editor');
  this.remove('translator');
  this.remove('collaborator');
  this.add({
    name: 'author',
    value: authors,
    enc: 'creators'
  });
  this.add({
    name: 'editor',
    value: editors,
    enc: 'creators'
  });
  this.add({
    name: 'translator',
    value: translators,
    enc: 'creators'
  });
  this.add({
    name: 'collaborator',
    value: collaborators,
    enc: 'creators'
  });
};

Reference.prototype.typeMap = {
  csl: {
    article: 'article',
    'article-journal': 'article',
    'article-magazine': 'article',
    'article-newspaper': 'article',
    bill: 'misc',
    book: 'book',
    broadcast: 'misc',
    chapter: 'incollection',
    dataset: 'misc',
    entry: 'incollection',
    'entry-dictionary': 'incollection',
    'entry-encyclopedia': 'incollection',
    figure: 'misc',
    graphic: 'misc',
    interview: 'misc',
    legal_case: 'misc',
    legislation: 'misc',
    manuscript: 'unpublished',
    map: 'misc',
    motion_picture: 'misc',
    musical_score: 'misc',
    pamphlet: 'booklet',
    'paper-conference': 'inproceedings',
    patent: 'misc',
    personal_communication: 'misc',
    post: 'misc',
    'post-weblog': 'misc',
    report: 'techreport',
    review: 'article',
    'review-book': 'article',
    song: 'misc',
    speech: 'misc',
    thesis: 'phdthesis',
    treaty: 'misc',
    webpage: 'misc'
  },
  zotero: {
    artwork: 'misc',
    book: 'book',
    bookSection: 'incollection',
    conferencePaper: 'inproceedings',
    film: 'misc',
    interview: 'misc',
    journalArticle: 'article',
    letter: 'misc',
    magazineArticle: 'article',
    manuscript: 'unpublished',
    newspaperArticle: 'article',
    patent: 'patent',
    report: 'techreport',
    thesis: 'phdthesis',
    webpage: 'misc'
  }
};

Translator.initialize = function() {
  Reference.installPostscript();
  Translator.unicode = !Translator.preferences.asciiBibTeX;
};

months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

Translator.doExport = function() {
  var date, item, j, len, note, pages, ref, ref1, ref2, ref3, ref4, ref5, ref6;
  Exporter = new Exporter();
  Zotero.write('\n');
  while (item = Exporter.nextItem()) {
    ref = new Reference(item);
    ref.add({
      address: item.place
    });
    ref.add({
      chapter: item.section
    });
    ref.add({
      edition: item.edition
    });
    ref.add({
      type: item.type
    });
    ref.add({
      series: item.series
    });
    ref.add({
      title: item.title
    });
    ref.add({
      volume: item.volume
    });
    ref.add({
      copyright: item.rights
    });
    ref.add({
      isbn: item.ISBN
    });
    ref.add({
      issn: item.ISSN
    });
    ref.add({
      lccn: item.callNumber
    });
    ref.add({
      shorttitle: item.shortTitle
    });
    ref.add({
      doi: item.DOI
    });
    ref.add({
      abstract: item.abstractNote
    });
    ref.add({
      nationality: item.country
    });
    ref.add({
      language: item.language
    });
    ref.add({
      assignee: item.assignee
    });
    ref.add({
      number: item.reportNumber || item.issue || item.seriesNumber || item.patentNumber
    });
    ref.add({
      urldate: item.accessDate && item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '')
    });
    switch (Translator.preferences.bibtexURL) {
      case 'url':
        ref.add({
          name: 'url',
          value: item.url
        });
        break;
      case 'note':
        ref.add({
          name: ((ref1 = ref.referencetype) === 'misc' || ref1 === 'booklet' ? 'howpublished' : 'note'),
          allowDuplicates: true,
          value: item.url,
          enc: 'url'
        });
        break;
      default:
        if ((ref2 = item.__type__) === 'webpage' || ref2 === 'post' || ref2 === 'post-weblog') {
          ref.add({
            name: 'howpublished',
            allowDuplicates: true,
            value: item.url
          });
        }
    }
    switch (false) {
      case (ref3 = item.__type__) !== 'bookSection' && ref3 !== 'conferencePaper' && ref3 !== 'chapter':
        ref.add({
          name: 'booktitle',
          value: item.publicationTitle,
          preserveBibTeXVariables: true
        });
        break;
      case !ref.isBibVar(item.publicationTitle):
        ref.add({
          name: 'journal',
          value: item.publicationTitle,
          preserveBibTeXVariables: true
        });
        break;
      default:
        ref.add({
          name: 'journal',
          value: (Translator.options.useJournalAbbreviation && item.journalAbbreviation) || item.publicationTitle,
          preserveBibTeXVariables: true
        });
    }
    switch (item.__type__) {
      case 'thesis':
        ref.add({
          school: item.publisher
        });
        break;
      case 'report':
        ref.add({
          institution: item.institution || item.publisher
        });
        break;
      default:
        ref.add({
          name: 'publisher',
          value: item.publisher
        });
    }
    if (item.__type__ === 'thesis' && ((ref4 = item.thesisType) === 'mastersthesis' || ref4 === 'phdthesis')) {
      ref.referencetype = item.thesisType;
      ref.remove('type');
    }
    ref.addCreators();
    if (item.date) {
      date = Zotero.BetterBibTeX.parseDate(item.date);
      switch ((date != null ? date.type : void 0) || 'verbatim') {
        case 'verbatim':
        case 'interval':
          ref.add({
            year: item.date
          });
          break;
        case 'date':
          if (date.month) {
            ref.add({
              name: 'month',
              value: months[date.month - 1],
              bare: true
            });
          }
          if (((ref5 = date.orig) != null ? ref5.type : void 0) === 'date') {
            ref.add({
              year: "[" + date.orig.year + "] " + date.year
            });
          } else {
            ref.add({
              year: '' + date.year
            });
          }
      }
    }
    ref.add({
      name: 'note',
      value: item.extra,
      allowDuplicates: true
    });
    ref.add({
      name: 'keywords',
      value: item.tags,
      enc: 'tags'
    });
    if (item.pages) {
      pages = item.pages;
      if (!ref.raw) {
        pages = pages.replace(/[-\u2012-\u2015\u2053]+/g, '--');
      }
      ref.add({
        pages: pages
      });
    }
    if (item.notes && Translator.options.exportNotes) {
      ref6 = item.notes;
      for (j = 0, len = ref6.length; j < len; j++) {
        note = ref6[j];
        ref.add({
          name: 'annote',
          value: Zotero.Utilities.unescapeHTML(note.note),
          allowDuplicates: true,
          html: true
        });
      }
    }
    ref.add({
      name: 'file',
      value: item.attachments,
      enc: 'attachments'
    });
    ref.complete();
  }
  Exporter.complete();
  Zotero.write('\n');
};

importReferences = function(input) {
  var parser, references;
  parser = new BibTeXParser(input, {
    rawFields: true,
    processUnexpected: true,
    processUnknown: {
      comment: 'f_verbatim'
    }
  });

  /* this must be called before requesting warnings or errors -- this really, really weirds me out */
  references = parser.output;

  /* relies on side effect of calling '.output' */
  return {
    references: references,
    groups: parser.groups,
    errors: parser.errors,
    warnings: parser.warnings
  };
};

Translator.detectImport = function() {
  var bib, found, input;
  input = Zotero.read(102400);
  bib = importReferences(input);
  found = Object.keys(bib.references).length > 0;
  return found;
};

importGroup = function(group, itemID, root) {
  var citekey, collection, j, len, ref1, subgroup;
  collection = new Zotero.Collection();
  collection.type = 'collection';
  collection.name = group.name;
  collection.children = (function() {
    var j, len, ref1, results;
    ref1 = group.references;
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      citekey = ref1[j];
      if (itemID[citekey]) {
        results.push({
          type: 'item',
          id: itemID[citekey]
        });
      }
    }
    return results;
  })();
  ref1 = group.groups || [];
  for (j = 0, len = ref1.length; j < len; j++) {
    subgroup = ref1[j];
    collection.children.push(importGroup(subgroup, items));
  }
  if (root) {
    collection.complete();
  }
  return collection;
};

Translator.doImport = function() {
  var bib, err, group, id, input, item, itemIDS, j, l, len, len1, read, ref, ref1, ref2, ref3;
  input = '';
  while ((read = Zotero.read(0x100000)) !== false) {
    input += read;
  }
  bib = importReferences(input);
  if (bib.errors.length) {
    item = new Zotero.Item('note');
    item.note = 'Import errors found: <ul>';
    ref1 = bib.errors;
    for (j = 0, len = ref1.length; j < len; j++) {
      err = ref1[j];
      switch (err.type) {
        case 'cut_off_citation':
          item.note += '<li>' + htmlEscape("Incomplete reference @" + err.entry) + '</li>';
          break;
        default:
          throw err;
      }
    }
    item.note += '</ul>';
    item.complete();
  }
  if (Translator.preferences.csquotes) {
    ZoteroItem.prototype.tags.enquote = {
      open: Translator.preferences.csquotes[0],
      close: Translator.preferences.csquotes[1]
    };
  }
  itemIDS = {};
  ref2 = bib.references;
  for (id in ref2) {
    ref = ref2[id];
    itemIDS[ref.entry_key] = id;
    new ZoteroItem(id, ref, bib.groups);
  }
  ref3 = bib.groups || [];
  for (l = 0, len1 = ref3.length; l < len1; l++) {
    group = ref3[l];
    importGroup(group, itemIDS, true);
  }
};

ZoteroItem = (function() {
  function ZoteroItem(id1, bibtex, groups) {
    this.id = id1;
    this.bibtex = bibtex;
    this.groups = groups;
    this.bibtex.bib_type = this.bibtex.bib_type.toLowerCase();
    this.type = this.typeMap[this.bibtex.bib_type] || 'journalArticle';
    this.item = new Zotero.Item(this.type);
    this.item.itemID = this.id;
    this.biblatexdata = {};
    this["import"]();
    this.item.complete();
  }

  ZoteroItem.prototype.typeMap = {
    book: 'book',
    booklet: 'book',
    manual: 'book',
    proceedings: 'book',
    collection: 'book',
    incollection: 'bookSection',
    inbook: 'bookSection',
    inreference: 'encyclopediaArticle',
    article: 'journalArticle',
    misc: 'journalArticle',
    phdthesis: 'thesis',
    mastersthesis: 'thesis',
    thesis: 'thesis',
    unpublished: 'manuscript',
    patent: 'patent',
    inproceedings: 'conferencePaper',
    conference: 'conferencePaper',
    techreport: 'report',
    report: 'report'
  };

  ZoteroItem.prototype.sup = {
    "(": '\u207D',
    ")": '\u207E',
    "+": '\u207A',
    "=": '\u207C',
    '-': '\u207B',
    '\u00C6': '\u1D2D',
    '\u014B': '\u1D51',
    '\u018E': '\u1D32',
    '\u0222': '\u1D3D',
    '\u0250': '\u1D44',
    '\u0251': '\u1D45',
    '\u0254': '\u1D53',
    '\u0259': '\u1D4A',
    '\u025B': '\u1D4B',
    '\u025C': '\u1D4C',
    '\u0263': '\u02E0',
    '\u0266': '\u02B1',
    '\u026F': '\u1D5A',
    '\u0279': '\u02B4',
    '\u027B': '\u02B5',
    '\u0281': '\u02B6',
    '\u0294': '\u02C0',
    '\u0295': '\u02C1',
    '\u0295': '\u02E4',
    '\u03B2': '\u1D5D',
    '\u03B3': '\u1D5E',
    '\u03B4': '\u1D5F',
    '\u03C6': '\u1D60',
    '\u03C7': '\u1D61',
    '\u1D02': '\u1D46',
    '\u1D16': '\u1D54',
    '\u1D17': '\u1D55',
    '\u1D1D': '\u1D59',
    '\u1D25': '\u1D5C',
    '\u2212': '\u207B',
    '\u2218': '\u00B0',
    '\u4E00': '\u3192',
    0: '\u2070',
    1: '\u00B9',
    2: '\u00B2',
    3: '\u00B3',
    4: '\u2074',
    5: '\u2075',
    6: '\u2076',
    7: '\u2077',
    8: '\u2078',
    9: '\u2079',
    A: '\u1D2C',
    B: '\u1D2E',
    D: '\u1D30',
    E: '\u1D31',
    G: '\u1D33',
    H: '\u1D34',
    I: '\u1D35',
    J: '\u1D36',
    K: '\u1D37',
    L: '\u1D38',
    M: '\u1D39',
    N: '\u1D3A',
    O: '\u1D3C',
    P: '\u1D3E',
    R: '\u1D3F',
    T: '\u1D40',
    U: '\u1D41',
    W: '\u1D42',
    a: '\u1D43',
    b: '\u1D47',
    d: '\u1D48',
    e: '\u1D49',
    g: '\u1D4D',
    h: '\u02B0',
    i: '\u2071',
    j: '\u02B2',
    k: '\u1D4F',
    l: '\u02E1',
    m: '\u1D50',
    n: '\u207F',
    o: '\u1D52',
    p: '\u1D56',
    r: '\u02B3',
    s: '\u02E2',
    t: '\u1D57',
    u: '\u1D58',
    v: '\u1D5B',
    w: '\u02B7',
    x: '\u02E3',
    y: '\u02B8'
  };

  ZoteroItem.prototype.sub = {
    0: '\u2080',
    1: '\u2081',
    2: '\u2082',
    3: '\u2083',
    4: '\u2084',
    5: '\u2085',
    6: '\u2086',
    7: '\u2087',
    8: '\u2088',
    9: '\u2089',
    '+': '\u208A',
    '-': '\u208B',
    '=': '\u208C',
    '(': '\u208D',
    ')': '\u208E',
    a: '\u2090',
    e: '\u2091',
    o: '\u2092',
    x: '\u2093',
    h: '\u2095',
    k: '\u2096',
    l: '\u2097',
    m: '\u2098',
    n: '\u2099',
    p: '\u209A',
    s: '\u209B',
    t: '\u209C'
  };

  ZoteroItem.prototype.tags = {
    strong: {
      open: '<b>',
      close: '</b>'
    },
    em: {
      open: '<i>',
      close: '</i>'
    },
    sub: {
      open: '<sub>',
      close: '</sub>'
    },
    sup: {
      open: '<sup>',
      close: '</sup>'
    },
    smallcaps: {
      open: '<span style="font-variant:small-caps;">',
      close: '</span>'
    },
    nocase: {
      open: '',
      close: ''
    },
    enquote: {
      open: '“',
      close: '”'
    },
    url: {
      open: '',
      close: ''
    },
    'undefined': {
      open: '[',
      close: ']'
    }
  };

  ZoteroItem.prototype.unparse = function(text, allowtilde) {
    var c, chunks, closeTags, closing, elt, html, i, index, j, l, lastMarks, len, len1, len2, len3, len4, len5, len6, mark, n, newMarks, node, nosupb, opening, q, r, ref1, ref2, ref3, ref4, s, sub, sup, t, tr, unicoded;
    if (Array.isArray(text) && Array.isArray(text[0])) {
      return ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = text.length; j < len; j++) {
          elt = text[j];
          results.push(this.unparse(elt));
        }
        return results;
      }).call(this)).join(' and ');
    }
    if ((ref1 = typeof text) === 'string' || ref1 === 'number') {
      return text;
    }
    chunks = [];
    for (j = 0, len = text.length; j < len; j++) {
      node = text[j];
      if (node.type === 'variable') {
        chunks.push({
          text: node.attrs.variable,
          marks: []
        });
        continue;
      }
      if (!node.marks) {
        chunks.push(node);
        continue;
      }
      sup = false;
      sub = false;
      nosupb = node.marks.filter(function(mark) {
        var ref2;
        sup || (sup = mark.type === 'sup');
        sub || (sub = mark.type === 'sub');
        return (ref2 = mark.type) !== 'sup' && ref2 !== 'sub';
      });
      if (sup === sub) {
        chunks.push(node);
        continue;
      }
      tr = sup ? this.sup : this.sub;
      unicoded = '';
      ref2 = Zotero.Utilities.XRegExp.split(node.text, '');
      for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
        c = ref2[i];
        if (sup && (c === '\u00B0')) {
          unicoded += c;
        } else if (tr[c]) {
          unicoded += tr[c];
        } else {
          unicoded = false;
          break;
        }
      }
      if (unicoded) {
        node.text = unicoded;
        node.marks = nosupb;
      }
      chunks.push(node);
    }
    html = '';
    lastMarks = [];
    for (n = 0, len2 = chunks.length; n < len2; n++) {
      node = chunks[n];
      if (node.type === 'variable') {
        html += '' + this.tags.undefined.open + node.attrs.variable + this.tags.undefined.close;
        continue;
      }
      newMarks = [];
      if (node.marks) {
        ref3 = node.marks;
        for (q = 0, len3 = ref3.length; q < len3; q++) {
          mark = ref3[q];
          newMarks.push(mark.type);
        }
      }
      closing = false;
      closeTags = [];
      for (index = r = 0, len4 = lastMarks.length; r < len4; index = ++r) {
        mark = lastMarks[index];
        if (mark !== newMarks[index]) {
          closing = true;
        }
        if (closing) {
          closeTags.push(this.tags[mark].close);
        }
      }
      closeTags.reverse();
      html += closeTags.join('');
      opening = false;
      for (index = s = 0, len5 = newMarks.length; s < len5; index = ++s) {
        mark = newMarks[index];
        if (mark !== lastMarks[index]) {
          opening = true;
        }
        if (opening) {
          html += this.tags[mark].open;
        }
      }
      html += node.text;
      lastMarks = newMarks;
    }
    ref4 = lastMarks.slice().reverse();
    for (t = 0, len6 = ref4.length; t < len6; t++) {
      mark = ref4[t];
      html += this.tags[mark].close;
    }
    html = html.replace(/ \u00A0/g, ' ~');
    html = html.replace(/\u00A0 /g, '~ ');
    return html;
  };

  ZoteroItem.prototype["import"] = function() {
    var biblatexdata, field, fields, j, k, key, keys, len, name1, o, ref1, unexpected, unknown, value;
    this.hackyFields = [];
    fields = Object.keys(this.bibtex.fields);
    unexpected = Object.keys(this.bibtex.unexpected_fields || {});
    unknown = Object.keys(this.bibtex.unknown_fields || {});
    if (Translator.preferences.testing) {
      fields.sort();
      unexpected.sort();
      unknown.sort();
    }
    fields = fields.concat(unexpected).concat(unknown);
    this.fields = Object.assign({}, this.bibtex.unknown_fields || {}, this.bibtex.unexpected_fields || {}, this.bibtex.fields);
    for (j = 0, len = fields.length; j < len; j++) {
      field = fields[j];
      value = this.fields[field];
      if (field.match(/^local-zo-url-[0-9]+$/)) {
        if (this.$file(value, field)) {
          continue;
        }
      } else if (field.match(/^bdsk-url-[0-9]+$/)) {
        if (this.$url(value, field)) {
          continue;
        }
      }
      if (typeof this[name1 = "$" + field] === "function" ? this[name1](value, field) : void 0) {
        continue;
      }
      this.addToExtraData(field, this.unparse(value));
    }
    if (((ref1 = this.type) === 'conferencePaper' || ref1 === 'paper-conference') && this.item.publicationTitle && !this.item.proceedingsTitle) {
      this.item.proceedingsTitle = this.item.publicationTitle;
      delete this.item.publicationTitle;
    }
    this.addToExtra("bibtex: " + this.bibtex.entry_key);
    keys = Object.keys(this.biblatexdata);
    if (keys.length > 0) {
      if (Translator.preferences.testing) {
        keys.sort();
      }
      biblatexdata = (function() {
        switch (false) {
          case !(this.biblatexdatajson && Translator.preferences.testing):
            return 'bibtex{' + ((function() {
              var l, len1, results;
              results = [];
              for (l = 0, len1 = keys.length; l < len1; l++) {
                k = keys[l];
                o = {};
                o[k] = this.biblatexdata[k];
                results.push(JSON5.stringify(o).slice(1, -1));
              }
              return results;
            }).call(this)) + '}';
          case !this.biblatexdatajson:
            return "bibtex" + (JSON5.stringify(this.biblatexdata));
          default:
            return biblatexdata = 'bibtex[' + ((function() {
              var l, len1, results;
              results = [];
              for (l = 0, len1 = keys.length; l < len1; l++) {
                key = keys[l];
                results.push(key + "=" + this.biblatexdata[key]);
              }
              return results;
            }).call(this)).join(';') + ']';
        }
      }).call(this);
      this.addToExtra(biblatexdata);
    }
    if (this.hackyFields.length > 0) {
      this.hackyFields.sort();
      this.addToExtra(this.hackyFields.join(" \n"));
    }
    if (!this.item.publisher && this.item.backupPublisher) {
      this.item.publisher = this.item.backupPublisher;
      delete this.item.backupPublisher;
    }
  };

  ZoteroItem.prototype.addToExtra = function(str) {
    if (this.item.extra && this.item.extra !== '') {
      this.item.extra += " \n" + str;
    } else {
      this.item.extra = str;
    }
  };

  ZoteroItem.prototype.addToExtraData = function(key, value) {
    this.biblatexdata[key] = this.unparse(value);
    if (key.match(/[\[\]=;\r\n]/) || value.match(/[\[\]=;\r\n]/)) {
      this.biblatexdatajson = true;
    }
  };

  ZoteroItem.prototype.$title = function(value) {
    if (this.type === 'encyclopediaArticle') {
      this.item.publicationTitle = this.unparse(value);
    } else {
      this.item.title = this.unparse(value);
    }
    return true;
  };

  ZoteroItem.prototype.$author = function(value, field) {
    var creator, j, len, name;
    for (j = 0, len = value.length; j < len; j++) {
      name = value[j];
      creator = {
        creatorType: field
      };
      if (name.literal) {
        creator.lastName = this.unparse(name.literal);
        creator.fieldMode = 1;
      } else {
        creator.firstName = this.unparse(name.given);
        creator.lastName = this.unparse(name.family);
        if (name.prefix) {
          creator.lastName = this.unparse(name.prefix) + ' ' + creator.lastName;
        }
        if (name.suffix) {
          creator.lastName = creator.lastName + ', ' + this.unparse(name.suffix);
        }
        if (creator.lastName && !creator.firstName) {
          creator.fieldMode = 1;
        }
      }
      this.item.creators.push(creator);
    }
    return true;
  };

  ZoteroItem.prototype.$editor = ZoteroItem.prototype.$author;

  ZoteroItem.prototype.$translator = ZoteroItem.prototype.$author;

  ZoteroItem.prototype.$publisher = function(value) {
    var base, pub;
    (base = this.item).publisher || (base.publisher = '');
    if (this.item.publisher) {
      this.item.publisher += ' / ';
    }
    this.item.publisher += ((function() {
      var j, len, results;
      results = [];
      for (j = 0, len = value.length; j < len; j++) {
        pub = value[j];
        results.push(this.unparse(pub));
      }
      return results;
    }).call(this)).join(' and ');
    return true;
  };

  ZoteroItem.prototype.$institution = ZoteroItem.prototype.$publisher;

  ZoteroItem.prototype.$school = ZoteroItem.prototype.$publisher;

  ZoteroItem.prototype.$address = function(value) {
    return this.item.place = this.unparse(value);
  };

  ZoteroItem.prototype.$location = ZoteroItem.prototype.$address;

  ZoteroItem.prototype.$edition = function(value) {
    return this.item.edition = this.unparse(value);
  };

  ZoteroItem.prototype.$isbn = function(value) {
    return this.item.ISBN = this.unparse(value);
  };

  ZoteroItem.prototype.$date = function(value) {
    return this.item.date = this.unparse(value);
  };

  ZoteroItem.prototype.$booktitle = function(value) {
    return this.item.publicationTitle = this.unparse(value);
  };

  ZoteroItem.prototype.$journaltitle = function(value) {
    value = this.unparse(value);
    if (this.fields['booktitle']) {
      this.item.journalAbbreviation = value;
    } else {
      this.item.publicationTitle = value;
    }
    return true;
  };

  ZoteroItem.prototype.$journal = ZoteroItem.prototype.$journaltitle;

  ZoteroItem.prototype.$pages = function(value) {
    var j, len, p, p0, p1, pages, range, ref1;
    pages = [];
    for (j = 0, len = value.length; j < len; j++) {
      range = value[j];
      if (range.length === 1) {
        p = this.unparse(range[0]);
        if (p) {
          pages.push(p);
        }
      } else {
        p0 = this.unparse(range[0]);
        p1 = this.unparse(range[1]);
        if (p0.indexOf('-') >= 0 || p1.indexOf('-') >= 0) {
          pages.push(p0 + "--" + p1);
        } else if (p0 || p1) {
          pages.push(p0 + "-" + p1);
        }
      }
    }
    pages = pages.join(', ');
    if (!pages) {
      return true;
    }
    if ((ref1 = this.type) === 'book' || ref1 === 'thesis' || ref1 === 'manuscript') {
      this.item.numPages = pages;
    } else {
      this.item.pages = pages;
    }
    return true;
  };

  ZoteroItem.prototype.$volume = function(value) {
    return this.item.volume = this.unparse(value);
  };

  ZoteroItem.prototype.$doi = function(value) {
    return this.item.DOI = this.unparse(value);
  };

  ZoteroItem.prototype.$abstract = function(value) {
    return this.item.abstractNote = this.unparse(value, true);
  };

  ZoteroItem.prototype.$keywords = function(value) {
    var base, tag;
    value = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = value.length; j < len; j++) {
        tag = value[j];
        results.push(this.unparse(tag).replace(/\n+/g, ' '));
      }
      return results;
    }).call(this);
    if (value.length === 1 && value[0].indexOf(';') > 0) {
      value = value[0].split(/\s*;\s*/);
    }
    (base = this.item).tags || (base.tags = []);
    this.item.tags = this.item.tags.concat(value);
    this.item.tags = this.item.tags.sort().filter(function(item, pos, ary) {
      return !pos || item !== ary[pos - 1];
    });
    return true;
  };

  ZoteroItem.prototype.$keyword = ZoteroItem.prototype.$keywords;

  ZoteroItem.prototype.$year = function(value) {
    value = this.unparse(value);
    if (this.item.date) {
      if (this.item.date.indexOf(value) < 0) {
        this.item.date += value;
      }
    } else {
      this.item.date = value;
    }
    return true;
  };

  ZoteroItem.prototype.$month = function(value) {
    var month;
    value = this.unparse(value);
    month = months.indexOf(value.toLowerCase());
    if (month >= 0) {
      value = Zotero.Utilities.formatDate({
        month: month
      });
    } else {
      value += ' ';
    }
    if (this.item.date) {
      if (value.indexOf(this.item.date) >= 0) {

        /* value contains year and more */
        this.item.date = value;
      } else {
        this.item.date = value + this.item.date;
      }
    } else {
      this.item.date = value;
    }
    return true;
  };

  ZoteroItem.prototype.$file = function(value) {
    var m, mimeType, mimetype, path, title;
    value = this.unparse(value);
    if (m = value.match(/^([^:]*):([^:]+):([^:]*)$/)) {
      title = m[1];
      path = m[2];
      mimeType = m[3];
    } else {
      path = value;
    }
    mimeType = (mimeType || '').toLowerCase();
    if (!mimeType && path.toLowerCase().endsWith('.pdf')) {
      mimetype = 'application/pdf';
    }
    if (mimeType.toLowerCase() === 'pdf') {
      mimeType = 'application/pdf';
    }
    if (!mimeType) {
      mimeType = void 0;
    }
    this.item.attachments.push({
      title: title,
      path: path,
      mimeType: mimeType
    });
    return true;
  };

  ZoteroItem.prototype['$date-modified'] = function() {
    return true;
  };

  ZoteroItem.prototype['$date-added'] = function() {
    return true;
  };

  ZoteroItem.prototype['$added-at'] = function() {
    return true;
  };

  ZoteroItem.prototype.$timestamp = function() {
    return true;
  };

  ZoteroItem.prototype.$number = function(value) {
    value = this.unparse(value);
    switch (this.type) {
      case 'report':
        this.item.reportNumber = value;
        break;
      case 'book':
      case 'bookSection':
      case 'chapter':
        this.item.seriesNumber = value;
        break;
      case 'patent':
        this.item.patentNumber = value;
        break;
      default:
        this.item.issue = value;
    }
    return true;
  };

  ZoteroItem.prototype.$issn = function(value) {
    return this.item.ISSN = this.unparse(value);
  };

  ZoteroItem.prototype.$url = function(value, field) {
    var m, url;
    value = this.unparse(value);
    if (m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)) {
      url = m[2];
    } else if (field === 'url' || /^(https?:\/\/|mailto:)/i.test(value)) {
      url = value;
    } else {
      url = nil;
    }
    if (!url) {
      return false;
    }
    if (this.item.url) {
      return this.item.url === url;
    }
    this.item.url = url;
    return true;
  };

  ZoteroItem.prototype.$howpublished = ZoteroItem.prototype.$url;

  ZoteroItem.prototype.$type = function(value) {
    this.item.sessionType = this.item.websiteType = this.item.manuscriptType = this.item.genre = this.item.postType = this.item.sessionType = this.item.letterType = this.item.manuscriptType = this.item.mapType = this.item.presentationType = this.item.regulationType = this.item.reportType = this.item.thesisType = this.item.websiteType = this.unparse(value);
    return true;
  };

  ZoteroItem.prototype.$lista = function(value) {
    if (!(this.type === 'encyclopediaArticle' && !this.item.title)) {
      return false;
    }
    this.item.title = this.unparse(value);
    return true;
  };

  ZoteroItem.prototype.$annotation = function(value) {
    this.item.notes.push(Zotero.Utilities.text2html(this.unparse(value)));
    return true;
  };

  ZoteroItem.prototype.$comment = ZoteroItem.prototype.$annotation;

  ZoteroItem.prototype.$annote = ZoteroItem.prototype.$annotation;

  ZoteroItem.prototype.$review = ZoteroItem.prototype.$annotation;

  ZoteroItem.prototype.$notes = ZoteroItem.prototype.$annotation;

  ZoteroItem.prototype.$urldate = function(value) {
    return this.item.accessDate = this.unparse(value);
  };

  ZoteroItem.prototype.$lastchecked = ZoteroItem.prototype.$urldate;

  ZoteroItem.prototype.$series = function(value) {
    return this.item.series = this.unparse(value);
  };

  ZoteroItem.prototype.$groups = function(value) {
    if (!this.groups) {
      return true;
    }
    throw new Error(this.unparse(value));
  };

  ZoteroItem.prototype.$note = function(value) {
    this.addToExtra(this.unparse(value));
    return true;
  };

  ZoteroItem.prototype.$language = function(value, field) {
    var lang, language;
    if (field === 'language') {
      language = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = value.length; j < len; j++) {
          lang = value[j];
          results.push(this.unparse(lang));
        }
        return results;
      }).call(this)).join(' and ');
    } else {
      language = this.unparse(value);
    }
    if (!language) {
      return true;
    }
    switch (language.toLowerCase()) {
      case 'en':
      case 'eng':
      case 'usenglish':
        language = 'English';
    }
    this.item.language = language;
    return true;
  };

  ZoteroItem.prototype.$langid = ZoteroItem.prototype.$language;

  ZoteroItem.prototype.$shorttitle = function(value) {
    return this.item.shortTitle = this.unparse(value);
  };

  ZoteroItem.prototype.$eprint = function(value, field) {

    /* Support for IDs exported by BibLaTeX */
    var eprint, eprinttype;
    eprinttype = this.fields['eprinttype'] || this.fields['archiveprefix'];
    if (!eprinttype) {
      return false;
    }
    eprint = this.unparse(value);
    eprinttype = this.unparse(eprinttype);
    switch (eprinttype.trim().toLowerCase()) {
      case 'arxiv':
        this.hackyFields.push("arXiv: " + eprint);
        break;
      case 'jstor':
        this.hackyFields.push("JSTOR: " + eprint);
        break;
      case 'pubmed':
        this.hackyFields.push("PMID: " + eprint);
        break;
      case 'hdl':
        this.hackyFields.push("HDL: " + eprint);
        break;
      case 'googlebooks':
        this.hackyFields.push("GoogleBooksID: " + eprint);
        break;
      default:
        return false;
    }
    return true;
  };

  ZoteroItem.prototype.$eprinttype = function(value) {
    return this.fields['eprint'];
  };

  ZoteroItem.prototype.$archiveprefix = ZoteroItem.prototype.$eprinttype;

  ZoteroItem.prototype.$nationality = function(value) {
    return this.item.country = this.unparse(value);
  };

  ZoteroItem.prototype.$chapter = function(value) {
    return this.item.section = this.unparse(value);
  };

  return ZoteroItem;

})();


/***/ }),
/* 94 */
/*!********************************!*\
  !*** ./lib/html-escape.coffee ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};


/***/ }),
/* 95 */
/*!***********************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/index.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _biblatex = __webpack_require__(/*! ./import/biblatex */ 96);

Object.defineProperty(exports, "BibLatexParser", {
  enumerable: true,
  get: function get() {
    return _biblatex.BibLatexParser;
  }
});

var _biblatex2 = __webpack_require__(/*! ./export/biblatex */ 158);

Object.defineProperty(exports, "BibLatexExporter", {
  enumerable: true,
  get: function get() {
    return _biblatex2.BibLatexExporter;
  }
});

var _csl = __webpack_require__(/*! ./export/csl */ 160);

Object.defineProperty(exports, "CSLExporter", {
  enumerable: true,
  get: function get() {
    return _csl.CSLExporter;
  }
});

var _const = __webpack_require__(/*! ./const */ 40);

Object.defineProperty(exports, "BibFieldTypes", {
  enumerable: true,
  get: function get() {
    return _const.BibFieldTypes;
  }
});
Object.defineProperty(exports, "BibTypes", {
  enumerable: true,
  get: function get() {
    return _const.BibTypes;
  }
});

var _edtf = __webpack_require__(/*! ./edtf */ 65);

Object.defineProperty(exports, "edtfParse", {
  enumerable: true,
  get: function get() {
    return _edtf.edtfParse;
  }
});
Object.defineProperty(exports, "edtfCheck", {
  enumerable: true,
  get: function get() {
    return _edtf.edtfCheck;
  }
});

/***/ }),
/* 96 */
/*!*********************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/import/biblatex.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexParser = undefined;

var _set = __webpack_require__(/*! babel-runtime/core-js/set */ 97);

var _set2 = _interopRequireDefault(_set);

var _toConsumableArray2 = __webpack_require__(/*! babel-runtime/helpers/toConsumableArray */ 81);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = __webpack_require__(/*! babel-runtime/helpers/typeof */ 59);

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = __webpack_require__(/*! babel-runtime/core-js/get-iterator */ 63);

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = __webpack_require__(/*! babel-runtime/core-js/object/keys */ 64);

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ 23);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(/*! babel-runtime/helpers/createClass */ 24);

var _createClass3 = _interopRequireDefault(_createClass2);

var _const = __webpack_require__(/*! ../const */ 40);

var _const2 = __webpack_require__(/*! ./const */ 143);

var _nameParser = __webpack_require__(/*! ./name-parser */ 144);

var _literalParser = __webpack_require__(/*! ./literal-parser */ 85);

var _tools = __webpack_require__(/*! ./tools */ 145);

var _edtf = __webpack_require__(/*! ../edtf */ 65);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Parses files in BibTeX/BibLaTeX format
 */

/* Based on original work by Henrik Muehe (c) 2010,
 * licensed under the MIT license,
 * https://code.google.com/archive/p/bibtex-js/
 */

/* Config options (default value for every option is false)
   - processUnexpected (false/true):
   Processes fields with names that are known, but are not expected for the given bibtype,
  adding them to an `unexpected_fields` object to each entry.
   - processUnknown (false/true/object [specifying content type for specific unknown]):
   Processes fields with names that are unknown, adding them to an `unknown_fields`
  object to each entry.
   example:
      > a = new BibLatexParser(..., {processUnknown: true})
      > a.output
      {
          "0:": {
              ...
              unknown_fields: {
                  ...
              }
          }
      }
       > a = new BibLatexParser(..., {processUnknown: {commentator: 'l_name'}})
      > a.output
      {
          "0:": {
              ...
              unknown_fields: {
                  commentator: [
                      {
                          given: ...,
                          family: ...
                      }
                  ]
                  ...
              }
          }
      }
*/

var BibLatexParser = exports.BibLatexParser = function () {
    function BibLatexParser(input) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        (0, _classCallCheck3.default)(this, BibLatexParser);

        this.input = input;
        this.config = config;
        this.pos = 0;
        this.entries = [];
        this.bibDB = {};
        this.currentKey = false;
        this.currentEntry = false;
        this.currentType = "";
        this.errors = [];
        this.warnings = [];
        // These variables are expected to be defined by some bibtex sources.
        this.variables = {
            JAN: "January",
            FEB: "February",
            MAR: "March",
            APR: "April",
            MAY: "May",
            JUN: "June",
            JUL: "July",
            AUG: "August",
            SEP: "September",
            OCT: "October",
            NOV: "November",
            DEC: "December"
        };
    }

    (0, _createClass3.default)(BibLatexParser, [{
        key: "isWhitespace",
        value: function isWhitespace(s) {
            return s == ' ' || s == '\r' || s == '\t' || s == '\n';
        }
    }, {
        key: "match",
        value: function match(s) {
            this.skipWhitespace();
            if (this.input.substring(this.pos, this.pos + s.length) == s) {
                this.pos += s.length;
            } else {

                this.errors.push({
                    type: 'token_mismatch',
                    expected: s,
                    found: this.input.substring(this.pos, this.pos + s.length)
                });
            }
            this.skipWhitespace();
        }
    }, {
        key: "tryMatch",
        value: function tryMatch(s) {
            this.skipWhitespace();
            if (this.input.substring(this.pos, this.pos + s.length) == s) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "skipWhitespace",
        value: function skipWhitespace() {
            while (this.isWhitespace(this.input[this.pos])) {
                this.pos++;
            }
            if (this.input[this.pos] == "%") {
                while (this.input[this.pos] != "\n") {
                    this.pos++;
                }
                this.skipWhitespace();
            }
        }
    }, {
        key: "skipToNext",
        value: function skipToNext() {
            while (this.input.length > this.pos && this.input[this.pos] != "@") {
                this.pos++;
            }
            if (this.input.length == this.pos) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "valueBraces",
        value: function valueBraces() {
            var bracecount = 0;
            this.match("{");
            var string = "";
            while (this.pos < this.input.length) {
                switch (this.input[this.pos]) {
                    case '\\':
                        string += this.input.substring(this.pos, this.pos + 2);
                        this.pos++;
                        break;
                    case '}':
                        if (bracecount === 0) {
                            this.match("}");
                            return string.trim();
                        }
                        string += '}';
                        bracecount--;
                        break;
                    case '{':
                        string += '{';
                        bracecount++;
                        break;
                    default:
                        string += this.input[this.pos];
                        break;
                }
                this.pos++;
            }
            this.errors.push({ type: 'unexpected_eof' });
            return string;
        }
    }, {
        key: "valueQuotes",
        value: function valueQuotes() {
            this.match('"');
            var string = "";
            while (this.pos < this.input.length) {
                switch (this.input[this.pos]) {
                    case '\\':
                        string += this.input.substring(this.pos, this.pos + 2);
                        this.pos++;
                        break;
                    case '"':
                        this.match('"');
                        return string.trim();
                    default:
                        string += this.input[this.pos];
                        break;
                }
                this.pos++;
            }
            this.errors.push({ type: 'unexpected_eof' });
            return string;
        }
    }, {
        key: "singleValue",
        value: function singleValue() {
            var start = this.pos;
            if (this.tryMatch("{")) {
                return this.valueBraces();
            } else if (this.tryMatch('"')) {
                return this.valueQuotes();
            } else {
                var k = this.key();
                if (this.variables[k.toUpperCase()]) {
                    return this.variables[k.toUpperCase()];
                } else if (k.match("^[0-9]+$")) {
                    return k;
                } else {
                    this.warnings.push({
                        type: 'undefined_variable',
                        entry: this.currentEntry['entry_key'],
                        key: this.currentKey,
                        variable: k
                    });
                    // Using \u0870 as a delimiter for variables as they cannot be
                    // used in regular latex code.
                    return "\u0870" + k + "\u0870";
                }
            }
        }
    }, {
        key: "value",
        value: function value() {
            var values = [];
            values.push(this.singleValue());
            while (this.tryMatch("#")) {
                this.match("#");
                values.push(this.singleValue());
            }
            return values.join("");
        }
    }, {
        key: "key",
        value: function key(optional) {
            var start = this.pos;
            while (true) {
                if (this.pos == this.input.length) {
                    this.errors.push({ type: 'runaway_key' });
                    return;
                }
                if ([',', '{', '}', ' ', '='].includes(this.input[this.pos])) {
                    if (optional && this.input[this.pos] != ',') {
                        this.pos = start;
                        return null;
                    }
                    return this.input.substring(start, this.pos);
                } else {
                    this.pos++;
                }
            }
        }
    }, {
        key: "keyEqualsValue",
        value: function keyEqualsValue() {
            var key = this.key();
            if (!key) {
                this.errors.push({
                    type: 'cut_off_citation',
                    entry: this.currentEntry['entry_key']
                });
                // The citation is not full, we remove the existing parts.
                this.currentEntry['incomplete'] = true;
                return;
            }
            this.currentKey = key.toLowerCase();
            if (this.tryMatch("=")) {
                this.match("=");
                var val = this.value();
                return [this.currentKey, val];
            } else {
                this.errors.push({
                    type: 'missing_equal_sign',
                    key: this.currentKey,
                    entry: this.currentEntry['entry_key']
                });
            }
        }
    }, {
        key: "keyValueList",
        value: function keyValueList() {
            var kv = this.keyEqualsValue();
            if (typeof kv === 'undefined') {
                // Entry has no fields, so we delete it.
                // It was the last one pushed, so we remove the last one
                this.entries.pop();
                return;
            }
            var rawFields = this.currentRawFields;
            rawFields[kv[0]] = kv[1];
            while (this.tryMatch(",")) {
                this.match(",");
                //fixes problems with commas at the end of a list
                if (this.tryMatch("}")) {
                    break;
                }
                kv = this.keyEqualsValue();
                if (typeof kv === 'undefined') {
                    this.errors.push({
                        type: 'key_value_error',
                        entry: this.currentEntry['entry_key']
                    });
                    break;
                }
                rawFields[kv[0]] = kv[1];
            }
        }
    }, {
        key: "processFields",
        value: function processFields() {
            var _this = this;

            var that = this;
            var rawFields = this.currentRawFields;
            var fields = this.currentEntry['fields'];

            // date may come either as year, year + month or as date field.
            // We therefore need to catch these hear and transform it to the
            // date field after evaluating all the fields.
            // All other date fields only come in the form of a date string.

            var date = void 0;
            if (rawFields.date) {
                // date string has precedence.
                date = rawFields.date;
            } else if (rawFields.year && rawFields.month) {
                date = rawFields.year + "-" + rawFields.month;
            } else if (rawFields.year) {
                date = "" + rawFields.year;
            }
            if (date) {
                if (this._checkDate(date)) {
                    fields['date'] = date;
                } else {
                    var fieldName = void 0,
                        value = void 0,
                        errorList = void 0;
                    if (rawFields.date) {
                        fieldName = 'date';
                        value = rawFields.date;
                        errorList = this.errors;
                    } else if (rawFields.year && rawFields.month) {
                        fieldName = 'year,month';
                        value = [rawFields.year, rawFields.month];
                        errorList = this.warnings;
                    } else {
                        fieldName = 'year';
                        value = rawFields.year;
                        errorList = this.warnings;
                    }
                    errorList.push({
                        type: 'unknown_date',
                        entry: this.currentEntry['entry_key'],
                        field_name: fieldName,
                        value: value
                    });
                }
            }
            // Check for English language. If the citation is in English language,
            // titles may use case preservation.
            var langEnglish = true; // By default we assume everything to be written in English.
            if (rawFields.langid && rawFields.langid.length) {
                var langString = rawFields.langid.toLowerCase().trim();
                var englishOptions = ['english', 'american', 'british', 'usenglish', 'ukenglish', 'canadian', 'australian', 'newzealand'];
                if (!englishOptions.some(function (option) {
                    return langString === option;
                })) {
                    langEnglish = false;
                }
            } else if (rawFields.language) {
                // langid and language. The two mean different things, see discussion https://forums.zotero.org/discussion/33960/biblatex-import-export-csl-language-biblatex-langid
                // but in bibtex, language is often used for what is essentially langid.
                // If there is no langid, but a language, and the language happens to be
                // a known langid, set the langid to be equal to the language.
                var langid = this._reformKey(rawFields.language, 'langid');
                if (langid) {
                    fields['langid'] = langid;
                    if (!['usenglish', 'ukenglish', 'caenglish', 'auenglish', 'nzenglish'].includes(langid)) {
                        langEnglish = false;
                    }
                }
            }

            var _loop = function _loop(bKey) {

                if (bKey === 'date' || ['year', 'month'].includes(bKey) && !_this.config.processUnknown) {
                    // Handled above
                    return "continue|iterateFields";
                }

                // Replace alias fields with their main term.
                var aliasKey = _const2.BiblatexFieldAliasTypes[bKey],
                    fKey = void 0;
                if (aliasKey) {
                    if (rawFields[aliasKey]) {
                        _this.warnings.push({
                            type: 'alias_creates_duplicate_field',
                            entry: _this.currentEntry['entry_key'],
                            field: bKey,
                            alias_of: aliasKey,
                            value: rawFields[bKey],
                            alias_of_value: rawFields[aliasKey]
                        });
                        return "continue|iterateFields";
                    }

                    fKey = (0, _keys2.default)(_const.BibFieldTypes).find(function (ft) {
                        return _const.BibFieldTypes[ft].biblatex === aliasKey;
                    });
                } else {
                    fKey = (0, _keys2.default)(_const.BibFieldTypes).find(function (ft) {
                        return _const.BibFieldTypes[ft].biblatex === bKey;
                    });
                }

                var oFields = void 0,
                    fType = void 0;
                var bType = _const.BibTypes[_this.currentEntry['bib_type']];

                if ('undefined' == typeof fKey) {
                    _this.warnings.push({
                        type: 'unknown_field',
                        entry: _this.currentEntry['entry_key'],
                        field_name: bKey
                    });
                    if (!_this.config.processUnknown) {
                        return "continue|iterateFields";
                    }
                    if (!_this.currentEntry['unknown_fields']) {
                        _this.currentEntry['unknown_fields'] = {};
                    }
                    oFields = _this.currentEntry['unknown_fields'];
                    fType = _this.config.processUnknown[bKey] ? _this.config.processUnknown[bKey] : 'f_literal';
                    fKey = bKey;
                } else if (bType['required'].includes(fKey) || bType['optional'].includes(fKey) || bType['eitheror'].includes(fKey)) {
                    oFields = fields;
                    fType = _const.BibFieldTypes[fKey]['type'];
                } else {
                    _this.warnings.push({
                        type: 'unexpected_field',
                        entry: _this.currentEntry['entry_key'],
                        field_name: bKey
                    });
                    if (!_this.config.processUnexpected) {
                        return "continue|iterateFields";
                    }
                    if (!_this.currentEntry['unexpected_fields']) {
                        _this.currentEntry['unexpected_fields'] = {};
                    }
                    oFields = _this.currentEntry['unexpected_fields'];
                    fType = _const.BibFieldTypes[fKey]['type'];
                }

                var fValue = rawFields[bKey];
                switch (fType) {
                    case 'f_date':
                        if (_this._checkDate(fValue)) {
                            oFields[fKey] = fValue;
                        } else {
                            _this.errors.push({
                                type: 'unknown_date',
                                entry: _this.currentEntry['entry_key'],
                                field_name: fKey,
                                value: fValue
                            });
                        }
                        break;
                    case 'f_integer':
                        oFields[fKey] = _this._reformLiteral(fValue);
                        break;
                    case 'f_key':
                        var reformedKey = _this._reformKey(fValue, fKey);
                        if (reformedKey !== false) {
                            oFields[fKey] = reformedKey;
                        }
                        break;
                    case 'f_literal':
                    case 'f_long_literal':
                        oFields[fKey] = _this._reformLiteral(fValue);
                        break;
                    case 'l_range':
                        oFields[fKey] = _this._reformRange(fValue);
                        break;
                    case 'f_title':
                        oFields[fKey] = _this._reformLiteral(fValue, langEnglish);
                        break;
                    case 'f_uri':
                        if (_this._checkURI(fValue)) {
                            oFields[fKey] = _this._reformURI(fValue);
                        } else {
                            _this.errors.push({
                                type: 'unknown_uri',
                                entry: _this.currentEntry['entry_key'],
                                field_name: fKey,
                                value: fValue
                            });
                        }
                        break;
                    case 'f_verbatim':
                        oFields[fKey] = fValue;
                        break;
                    case 'l_key':
                        oFields[fKey] = (0, _tools.splitTeXString)(fValue).map(function (keyField) {
                            return that._reformKey(keyField, fKey);
                        });
                        break;
                    case 'l_tag':
                        oFields[fKey] = fValue.split(/[,;]/).map(function (string) {
                            return string.trim();
                        });
                        break;
                    case 'l_literal':
                        var items = (0, _tools.splitTeXString)(fValue);
                        oFields[fKey] = [];
                        items.forEach(function (item) {
                            oFields[fKey].push(_this._reformLiteral(item.trim()));
                        });
                        break;
                    case 'l_name':
                        oFields[fKey] = _this._reformNameList(fValue);
                        break;
                    default:
                        // Something must be wrong in the code.
                        console.warn("Unrecognized type: " + fType + "!");
                }
            };

            iterateFields: for (var bKey in rawFields) {
                var _ret = _loop(bKey);

                if (_ret === "continue|iterateFields") continue iterateFields;
            }
        }
    }, {
        key: "_reformKey",
        value: function _reformKey(keyString, fKey) {
            var keyValue = keyString.trim().toLowerCase();
            var fieldType = _const.BibFieldTypes[fKey];
            if (_const2.BiblatexAliasOptions[fKey] && _const2.BiblatexAliasOptions[fKey][keyValue]) {
                keyValue = _const2.BiblatexAliasOptions[fKey][keyValue];
            }
            if (fieldType['options']) {
                if (Array.isArray(fieldType['options'])) {
                    if (fieldType['options'].includes(keyValue)) {
                        return keyValue;
                    }
                } else {
                    var optionValue = (0, _keys2.default)(fieldType['options']).find(function (key) {
                        return fieldType['options'][key]['biblatex'] === keyValue;
                    });
                    if (optionValue) {
                        return optionValue;
                    }
                }
            }
            if (fieldType.strict) {
                this.warnings.push({
                    type: 'unknown_key',
                    entry: this.currentEntry['entry_key'],
                    field_name: fKey,
                    value: keyString
                });
                return false;
            }
            return this._reformLiteral(keyString);
        }
    }, {
        key: "_checkURI",
        value: function _checkURI(uriString) {
            /* Copyright (c) 2010-2013 Diego Perini, MIT licensed
               https://gist.github.com/dperini/729294
             */
            return (/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(uriString)
            );
        }
    }, {
        key: "_reformURI",
        value: function _reformURI(uriString) {
            return uriString.replace(/\\/g, '');
        }
    }, {
        key: "_reformNameList",
        value: function _reformNameList(nameString) {
            var people = (0, _tools.splitTeXString)(nameString);
            return people.map(function (person) {
                var nameParser = new _nameParser.BibLatexNameParser(person);
                return nameParser.output;
            });
        }
    }, {
        key: "_reformRange",
        value: function _reformRange(rangeString) {
            var _this2 = this;

            return rangeString.split(',').map(function (string) {
                var parts = string.split('--');
                if (parts.length > 1) {
                    return [_this2._reformLiteral(parts.shift().trim()), _this2._reformLiteral(parts.join('--').trim())];
                } else {
                    parts = string.split('-');
                    if (parts.length > 1) {
                        return [_this2._reformLiteral(parts.shift().trim()), _this2._reformLiteral(parts.join('-').trim())];
                    } else {
                        return [_this2._reformLiteral(string.trim())];
                    }
                }
            });
        }
    }, {
        key: "_checkDate",
        value: function _checkDate(dateStr) {
            return (0, _edtf.edtfCheck)(dateStr);
        }
    }, {
        key: "_reformLiteral",
        value: function _reformLiteral(theValue, cpMode) {
            var parser = new _literalParser.BibLatexLiteralParser(theValue, cpMode);
            return parser.output;
        }
    }, {
        key: "bibType",
        value: function bibType() {
            var biblatexType = this.currentType;
            if (_const2.BiblatexAliasTypes[biblatexType]) {
                biblatexType = _const2.BiblatexAliasTypes[biblatexType];
            }

            var bibType = (0, _keys2.default)(_const.BibTypes).find(function (bType) {
                return _const.BibTypes[bType]['biblatex'] === biblatexType;
            });

            if (typeof bibType === 'undefined') {
                this.warnings.push({
                    type: 'unknown_type',
                    type_name: biblatexType
                });
                bibType = 'misc';
            }

            return bibType;
        }
    }, {
        key: "createNewEntry",
        value: function createNewEntry() {
            this.currentEntry = {
                'bib_type': this.bibType(),
                'entry_key': this.key(true),
                'fields': {}
            };
            this.currentRawFields = {};
            this.entries.push(this.currentEntry);
            if (this.currentEntry['entry_key'] !== null) {
                this.match(",");
            }
            this.keyValueList();
            if (this.currentEntry['entry_key'] === null) {
                this.currentEntry['entry_key'] = '';
            }
            this.processFields();
        }
    }, {
        key: "directive",
        value: function directive() {
            this.match("@");
            this.currentType = this.key().toLowerCase();
            return "@" + this.currentType;
        }
    }, {
        key: "string",
        value: function string() {
            var kv = this.keyEqualsValue();
            this.variables[kv[0].toUpperCase()] = kv[1];
        }
    }, {
        key: "preamble",
        value: function preamble() {
            this.value();
        }
    }, {
        key: "replaceTeXChars",
        value: function replaceTeXChars() {
            var value = this.input;
            var len = _const2.TeXSpecialChars.length;
            for (var i = 0; i < len; i++) {
                var texChar = _const2.TeXSpecialChars[i];
                var texCharRe = /^[a-zA-Z\\]+$/.test(texChar[0]) ? new RegExp("{(" + texChar[0] + ")}|" + texChar[0] + "\\s|" + texChar[0] + "(?=\\W|\\_)", 'g') : new RegExp("{(" + texChar[0] + ")}|" + texChar[0] + "{}|" + texChar[0], 'g');
                value = value.replace(texCharRe, texChar[1]);
            }
            // Delete multiple spaces
            this.input = value.replace(/ +(?= )/g, '');
            return;
        }
    }, {
        key: "stepThroughBibtex",
        value: function stepThroughBibtex() {
            while (this.skipToNext()) {
                var d = this.directive();
                this.match("{");
                if (d == "@string") {
                    this.string();
                } else if (d == "@preamble") {
                    this.preamble();
                } else if (d == "@comment") {
                    this.parseGroups();
                } else {
                    this.createNewEntry();
                }
                this.match("}");
            }
        }
    }, {
        key: "parseGroups",
        value: function parseGroups() {
            var _this3 = this;

            var prefix = 'jabref-meta: groupstree:';
            var pos = this.input.indexOf(prefix, this.pos);
            if (pos < 0) {
                return;
            }
            this.pos = pos + prefix.length;

            /*  The JabRef Groups format is... interesting. To parse it, you must:
                1. Unwrap the lines (just remove the newlines)
                2. Split the lines on ';' (but not on '\;')
                3. Each line is a group which is formatted as follows:
                   <level> <type>:<name>\;<intersect>\;<citekey1>\;<citekey2>\;....
                 Each level can interact with the level it is nested under; either no interaction (intersect = 0), intersection
                (intersect = 1) or union (intersect = 2).
                 There are several group types: root-level (all references are implicitly available on the root level),
                ExplicitGroup (the citation keys are listed in the group line) or query-type groups. I have only implemented
                explicit groups.
            */

            // skip any whitespace after the identifying string */
            while (this.input.length > this.pos && '\r\n '.indexOf(this.input[this.pos]) >= 0) {
                this.pos++;
            }

            var start = this.pos;
            var braces = 1;
            while (this.input.length > this.pos && braces > 0) {
                switch (this.input[this.pos]) {
                    case '{':
                        braces += 1;
                        break;
                    case '}':
                        braces -= 1;
                }
                this.pos++;
            }

            // no ending brace found
            if (braces !== 0) {
                return;
            }

            // leave the ending brace for the main parser to pick up
            this.pos--;

            // simplify parsing by taking the whole comment, throw away newlines, replace the escaped separators with tabs, and
            // then split on the remaining non-escaped separators
            // I use \u2004 to protect \; and \u2005 to protect \\\; (the escaped version of ';') when splitting lines at ;
            var lines = this.input.substring(start, this.pos).replace(/[\r\n]/g, '').replace(/\\\\\\;/g, "\u2005").replace(/\\;/g, "\u2004").split(';');
            lines = lines.map(function (line) {
                return line.replace(/\u2005/g, ';');
            });
            var levels = { '0': { references: [], groups: [] } };
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop2 = function _loop2() {
                    var line = _step.value;

                    if (line === '') {
                        return "continue";
                    }
                    var match = line.match(/^([0-9])\s+([^:]+):(.*)/);
                    if (!match) {
                        return {
                            v: void 0
                        };
                    }
                    var level = parseInt(match[1]);
                    var type = match[2];
                    var references = match[3];
                    references = references ? references.split("\u2004").filter(function (key) {
                        return key;
                    }) : [];
                    var name = references.shift();
                    var intersection = references.shift(); // 0 = independent, 1 = intersection, 2 = union

                    // ignore root level, has no refs anyway in the comment
                    if (level === 0) {
                        return "continue";
                    }

                    // remember this group as the current `level` level, so that any following `level + 1` levels can find it
                    levels[level] = { name: name, groups: [], references: references
                        // and add it to its parent
                    };levels[level - 1].groups.push(levels[level]);

                    // treat all groups as explicit
                    if (type != 'ExplicitGroup') {
                        _this3.warnings.push({
                            type: 'unsupported_jabref_group',
                            group_type: type
                        });
                    }

                    switch (intersection) {
                        case '0':
                            // do nothing more
                            break;
                        case '1':
                            // intersect with parent. Hardly ever used.
                            levels[level].references = levels[level].references.filter(function (key) {
                                return levels[level - 1].references.includes(key);
                            });
                            break;
                        case '2':
                            // union with parent
                            levels[level].references = [].concat((0, _toConsumableArray3.default)(new _set2.default([].concat((0, _toConsumableArray3.default)(levels[level].references), (0, _toConsumableArray3.default)(levels[level - 1].references)))));
                            break;
                    }
                };

                for (var _iterator = (0, _getIterator3.default)(lines), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _ret2 = _loop2();

                    switch (_ret2) {
                        case "continue":
                            continue;

                        default:
                            if ((typeof _ret2 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.groups = levels['0'].groups;
        }
    }, {
        key: "createBibDB",
        value: function createBibDB() {
            var that = this;
            this.entries.forEach(function (entry, index) {
                // Start index from 1 to create less issues with testing
                that.bibDB[index + 1] = entry;
            });
        }
    }, {
        key: "output",
        get: function get() {
            this.replaceTeXChars();
            this.stepThroughBibtex();
            this.createBibDB();
            return this.bibDB;
        }
    }]);
    return BibLatexParser;
}();

/***/ }),
/* 97 */
/*!****************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/set.js ***!
  \****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/set */ 98), __esModule: true };

/***/ }),
/* 98 */
/*!*************************************************!*\
  !*** ../node_modules/core-js/library/fn/set.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../modules/es6.object.to-string */ 68);
__webpack_require__(/*! ../modules/es6.string.iterator */ 28);
__webpack_require__(/*! ../modules/web.dom.iterable */ 37);
__webpack_require__(/*! ../modules/es6.set */ 108);
__webpack_require__(/*! ../modules/es7.set.to-json */ 115);
__webpack_require__(/*! ../modules/es7.set.of */ 118);
__webpack_require__(/*! ../modules/es7.set.from */ 120);
module.exports = __webpack_require__(/*! ../modules/_core */ 3).Set;


/***/ }),
/* 99 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_string-at.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ./_to-integer */ 45);
var defined = __webpack_require__(/*! ./_defined */ 46);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 100 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_iter-create.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(/*! ./_object-create */ 50);
var descriptor = __webpack_require__(/*! ./_property-desc */ 29);
var setToStringTag = __webpack_require__(/*! ./_set-to-string-tag */ 36);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(/*! ./_hide */ 15)(IteratorPrototype, __webpack_require__(/*! ./_wks */ 4)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 101 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-dps.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(/*! ./_object-dp */ 9);
var anObject = __webpack_require__(/*! ./_an-object */ 16);
var getKeys = __webpack_require__(/*! ./_object-keys */ 30);

module.exports = __webpack_require__(/*! ./_descriptors */ 13) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 102 */
/*!******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_array-includes.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(/*! ./_to-iobject */ 22);
var toLength = __webpack_require__(/*! ./_to-length */ 34);
var toAbsoluteIndex = __webpack_require__(/*! ./_to-absolute-index */ 103);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 103 */
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_to-absolute-index.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ./_to-integer */ 45);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 104 */
/*!********************************************************!*\
  !*** ../node_modules/core-js/library/modules/_html.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(/*! ./_global */ 12).document;
module.exports = document && document.documentElement;


/***/ }),
/* 105 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-gpo.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(/*! ./_has */ 19);
var toObject = __webpack_require__(/*! ./_to-object */ 31);
var IE_PROTO = __webpack_require__(/*! ./_shared-key */ 53)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 106 */
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.array.iterator.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(/*! ./_add-to-unscopables */ 107);
var step = __webpack_require__(/*! ./_iter-step */ 74);
var Iterators = __webpack_require__(/*! ./_iterators */ 21);
var toIObject = __webpack_require__(/*! ./_to-iobject */ 22);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(/*! ./_iter-define */ 47)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 107 */
/*!**********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_add-to-unscopables.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 108 */
/*!**********************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.set.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(/*! ./_collection-strong */ 109);
var validate = __webpack_require__(/*! ./_validate-collection */ 79);
var SET = 'Set';

// 23.2 Set Objects
module.exports = __webpack_require__(/*! ./_collection */ 111)(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);


/***/ }),
/* 109 */
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_collection-strong.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var dP = __webpack_require__(/*! ./_object-dp */ 9).f;
var create = __webpack_require__(/*! ./_object-create */ 50);
var redefineAll = __webpack_require__(/*! ./_redefine-all */ 75);
var ctx = __webpack_require__(/*! ./_ctx */ 20);
var anInstance = __webpack_require__(/*! ./_an-instance */ 76);
var forOf = __webpack_require__(/*! ./_for-of */ 38);
var $iterDefine = __webpack_require__(/*! ./_iter-define */ 47);
var step = __webpack_require__(/*! ./_iter-step */ 74);
var setSpecies = __webpack_require__(/*! ./_set-species */ 110);
var DESCRIPTORS = __webpack_require__(/*! ./_descriptors */ 13);
var fastKey = __webpack_require__(/*! ./_meta */ 58).fastKey;
var validate = __webpack_require__(/*! ./_validate-collection */ 79);
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};


/***/ }),
/* 110 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_set-species.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ./_global */ 12);
var core = __webpack_require__(/*! ./_core */ 3);
var dP = __webpack_require__(/*! ./_object-dp */ 9);
var DESCRIPTORS = __webpack_require__(/*! ./_descriptors */ 13);
var SPECIES = __webpack_require__(/*! ./_wks */ 4)('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),
/* 111 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_collection.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(/*! ./_global */ 12);
var $export = __webpack_require__(/*! ./_export */ 11);
var meta = __webpack_require__(/*! ./_meta */ 58);
var fails = __webpack_require__(/*! ./_fails */ 18);
var hide = __webpack_require__(/*! ./_hide */ 15);
var redefineAll = __webpack_require__(/*! ./_redefine-all */ 75);
var forOf = __webpack_require__(/*! ./_for-of */ 38);
var anInstance = __webpack_require__(/*! ./_an-instance */ 76);
var isObject = __webpack_require__(/*! ./_is-object */ 17);
var setToStringTag = __webpack_require__(/*! ./_set-to-string-tag */ 36);
var dP = __webpack_require__(/*! ./_object-dp */ 9).f;
var each = __webpack_require__(/*! ./_array-methods */ 112)(0);
var DESCRIPTORS = __webpack_require__(/*! ./_descriptors */ 13);

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};


/***/ }),
/* 112 */
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_array-methods.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = __webpack_require__(/*! ./_ctx */ 20);
var IObject = __webpack_require__(/*! ./_iobject */ 51);
var toObject = __webpack_require__(/*! ./_to-object */ 31);
var toLength = __webpack_require__(/*! ./_to-length */ 34);
var asc = __webpack_require__(/*! ./_array-species-create */ 113);
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};


/***/ }),
/* 113 */
/*!************************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_array-species-create.js ***!
  \************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(/*! ./_array-species-constructor */ 114);

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};


/***/ }),
/* 114 */
/*!*****************************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_array-species-constructor.js ***!
  \*****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ 17);
var isArray = __webpack_require__(/*! ./_is-array */ 80);
var SPECIES = __webpack_require__(/*! ./_wks */ 4)('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};


/***/ }),
/* 115 */
/*!******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es7.set.to-json.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = __webpack_require__(/*! ./_export */ 11);

$export($export.P + $export.R, 'Set', { toJSON: __webpack_require__(/*! ./_collection-to-json */ 116)('Set') });


/***/ }),
/* 116 */
/*!**********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_collection-to-json.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = __webpack_require__(/*! ./_classof */ 57);
var from = __webpack_require__(/*! ./_array-from-iterable */ 117);
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};


/***/ }),
/* 117 */
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_array-from-iterable.js ***!
  \***********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var forOf = __webpack_require__(/*! ./_for-of */ 38);

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};


/***/ }),
/* 118 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es7.set.of.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
__webpack_require__(/*! ./_set-collection-of */ 119)('Set');


/***/ }),
/* 119 */
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_set-collection-of.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// https://tc39.github.io/proposal-setmap-offrom/
var $export = __webpack_require__(/*! ./_export */ 11);

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};


/***/ }),
/* 120 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es7.set.from.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
__webpack_require__(/*! ./_set-collection-from */ 121)('Set');


/***/ }),
/* 121 */
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_set-collection-from.js ***!
  \***********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// https://tc39.github.io/proposal-setmap-offrom/
var $export = __webpack_require__(/*! ./_export */ 11);
var aFunction = __webpack_require__(/*! ./_a-function */ 69);
var ctx = __webpack_require__(/*! ./_ctx */ 20);
var forOf = __webpack_require__(/*! ./_for-of */ 38);

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};


/***/ }),
/* 122 */
/*!********************************************************!*\
  !*** ../node_modules/core-js/library/fn/array/from.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es6.string.iterator */ 28);
__webpack_require__(/*! ../../modules/es6.array.from */ 123);
module.exports = __webpack_require__(/*! ../../modules/_core */ 3).Array.from;


/***/ }),
/* 123 */
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.array.from.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ctx = __webpack_require__(/*! ./_ctx */ 20);
var $export = __webpack_require__(/*! ./_export */ 11);
var toObject = __webpack_require__(/*! ./_to-object */ 31);
var call = __webpack_require__(/*! ./_iter-call */ 77);
var isArrayIter = __webpack_require__(/*! ./_is-array-iter */ 78);
var toLength = __webpack_require__(/*! ./_to-length */ 34);
var createProperty = __webpack_require__(/*! ./_create-property */ 124);
var getIterFn = __webpack_require__(/*! ./core.get-iterator-method */ 56);

$export($export.S + $export.F * !__webpack_require__(/*! ./_iter-detect */ 125)(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),
/* 124 */
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_create-property.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $defineProperty = __webpack_require__(/*! ./_object-dp */ 9);
var createDesc = __webpack_require__(/*! ./_property-desc */ 29);

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};


/***/ }),
/* 125 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_iter-detect.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(/*! ./_wks */ 4)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 126 */
/*!****************************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/symbol/iterator.js ***!
  \****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/symbol/iterator */ 127), __esModule: true };

/***/ }),
/* 127 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/fn/symbol/iterator.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es6.string.iterator */ 28);
__webpack_require__(/*! ../../modules/web.dom.iterable */ 37);
module.exports = __webpack_require__(/*! ../../modules/_wks-ext */ 60).f('iterator');


/***/ }),
/* 128 */
/*!*******************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/symbol.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/symbol */ 129), __esModule: true };

/***/ }),
/* 129 */
/*!**********************************************************!*\
  !*** ../node_modules/core-js/library/fn/symbol/index.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es6.symbol */ 130);
__webpack_require__(/*! ../../modules/es6.object.to-string */ 68);
__webpack_require__(/*! ../../modules/es7.symbol.async-iterator */ 134);
__webpack_require__(/*! ../../modules/es7.symbol.observable */ 135);
module.exports = __webpack_require__(/*! ../../modules/_core */ 3).Symbol;


/***/ }),
/* 130 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.symbol.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(/*! ./_global */ 12);
var has = __webpack_require__(/*! ./_has */ 19);
var DESCRIPTORS = __webpack_require__(/*! ./_descriptors */ 13);
var $export = __webpack_require__(/*! ./_export */ 11);
var redefine = __webpack_require__(/*! ./_redefine */ 72);
var META = __webpack_require__(/*! ./_meta */ 58).KEY;
var $fails = __webpack_require__(/*! ./_fails */ 18);
var shared = __webpack_require__(/*! ./_shared */ 54);
var setToStringTag = __webpack_require__(/*! ./_set-to-string-tag */ 36);
var uid = __webpack_require__(/*! ./_uid */ 35);
var wks = __webpack_require__(/*! ./_wks */ 4);
var wksExt = __webpack_require__(/*! ./_wks-ext */ 60);
var wksDefine = __webpack_require__(/*! ./_wks-define */ 61);
var enumKeys = __webpack_require__(/*! ./_enum-keys */ 131);
var isArray = __webpack_require__(/*! ./_is-array */ 80);
var anObject = __webpack_require__(/*! ./_an-object */ 16);
var toIObject = __webpack_require__(/*! ./_to-iobject */ 22);
var toPrimitive = __webpack_require__(/*! ./_to-primitive */ 49);
var createDesc = __webpack_require__(/*! ./_property-desc */ 29);
var _create = __webpack_require__(/*! ./_object-create */ 50);
var gOPNExt = __webpack_require__(/*! ./_object-gopn-ext */ 132);
var $GOPD = __webpack_require__(/*! ./_object-gopd */ 133);
var $DP = __webpack_require__(/*! ./_object-dp */ 9);
var $keys = __webpack_require__(/*! ./_object-keys */ 30);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(/*! ./_object-gopn */ 83).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(/*! ./_object-pie */ 39).f = $propertyIsEnumerable;
  __webpack_require__(/*! ./_object-gops */ 62).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(/*! ./_library */ 48)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    replacer = args[1];
    if (typeof replacer == 'function') $replacer = replacer;
    if ($replacer || !isArray(replacer)) replacer = function (key, value) {
      if ($replacer) value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(/*! ./_hide */ 15)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 131 */
/*!*************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_enum-keys.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(/*! ./_object-keys */ 30);
var gOPS = __webpack_require__(/*! ./_object-gops */ 62);
var pIE = __webpack_require__(/*! ./_object-pie */ 39);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 132 */
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-gopn-ext.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(/*! ./_to-iobject */ 22);
var gOPN = __webpack_require__(/*! ./_object-gopn */ 83).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 133 */
/*!***************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-gopd.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(/*! ./_object-pie */ 39);
var createDesc = __webpack_require__(/*! ./_property-desc */ 29);
var toIObject = __webpack_require__(/*! ./_to-iobject */ 22);
var toPrimitive = __webpack_require__(/*! ./_to-primitive */ 49);
var has = __webpack_require__(/*! ./_has */ 19);
var IE8_DOM_DEFINE = __webpack_require__(/*! ./_ie8-dom-define */ 70);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(/*! ./_descriptors */ 13) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 134 */
/*!****************************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es7.symbol.async-iterator.js ***!
  \****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./_wks-define */ 61)('asyncIterator');


/***/ }),
/* 135 */
/*!************************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es7.symbol.observable.js ***!
  \************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./_wks-define */ 61)('observable');


/***/ }),
/* 136 */
/*!**********************************************************!*\
  !*** ../node_modules/core-js/library/fn/get-iterator.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../modules/web.dom.iterable */ 37);
__webpack_require__(/*! ../modules/es6.string.iterator */ 28);
module.exports = __webpack_require__(/*! ../modules/core.get-iterator */ 137);


/***/ }),
/* 137 */
/*!********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/core.get-iterator.js ***!
  \********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ./_an-object */ 16);
var get = __webpack_require__(/*! ./core.get-iterator-method */ 56);
module.exports = __webpack_require__(/*! ./_core */ 3).getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};


/***/ }),
/* 138 */
/*!*********************************************************!*\
  !*** ../node_modules/core-js/library/fn/object/keys.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es6.object.keys */ 139);
module.exports = __webpack_require__(/*! ../../modules/_core */ 3).Object.keys;


/***/ }),
/* 139 */
/*!******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.object.keys.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 Object.keys(O)
var toObject = __webpack_require__(/*! ./_to-object */ 31);
var $keys = __webpack_require__(/*! ./_object-keys */ 30);

__webpack_require__(/*! ./_object-sap */ 140)('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});


/***/ }),
/* 140 */
/*!**************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-sap.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(/*! ./_export */ 11);
var core = __webpack_require__(/*! ./_core */ 3);
var fails = __webpack_require__(/*! ./_fails */ 18);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),
/* 141 */
/*!********************************************************************!*\
  !*** ../node_modules/core-js/library/fn/object/define-property.js ***!
  \********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es6.object.define-property */ 142);
var $Object = __webpack_require__(/*! ../../modules/_core */ 3).Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),
/* 142 */
/*!*****************************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.object.define-property.js ***!
  \*****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(/*! ./_export */ 11);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(/*! ./_descriptors */ 13), 'Object', { defineProperty: __webpack_require__(/*! ./_object-dp */ 9).f });


/***/ }),
/* 143 */
/*!******************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/import/const.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/** A list of all field aliases and what they refer to. */
var BiblatexFieldAliasTypes = exports.BiblatexFieldAliasTypes = {
    'address': 'location',
    'annote': 'annotation',
    'archiveprefix': 'eprinttype',
    'journal': 'journaltitle',
    'pdf': 'file',
    'primaryclass': 'eprintclass',
    'school': 'institution'

    /** A list of all bibentry aliases and what they refer to. */
};var BiblatexAliasTypes = exports.BiblatexAliasTypes = {
    'conference': 'inproceedings',
    'electronic': 'online',
    'mastersthesis': 'thesis',
    'phdthesis': 'thesis',
    'techreport': 'report',
    'www': 'online'
};

var langidAliases = {
    'english': 'usenglish',
    'american': 'usenglish',
    'en': 'usenglish',
    'eng': 'usenglish',
    'en-US': 'usenglish',
    'anglais': 'usenglish',
    'british': 'ukenglish',
    'en-GB': 'ukenglish',
    'francais': 'french',
    'austrian': 'naustrian',
    'german': 'ngerman',
    'germanb': 'ngerman',
    'polutonikogreek': 'greek',
    'brazil': 'brazilian',
    'portugues': 'portuguese',
    'chinese': 'pinyin'
};

var languageAliases = {
    "langamerican": "american",
    "langbrazilian": "brazilian",
    "langcatalan": "catalan",
    "langcroation": "croation",
    "langczech": "czech",
    "langdanish": "danish",
    "langdutch": "dutch",
    "langenglish": "english",
    "langfinnish": "finnish",
    "langfrench": "french",
    "langgerman": "german",
    "langgreek": "greek",
    "langitalian": "italian",
    "langlatin": "latin",
    "langnorwegian": "norwegian",
    "langpolish": "polish",
    "langportuguese": "portuguese",
    "langrussian": "russian",
    "langslovene": "slovene",
    "langspanish": "spanish",
    "langswedish": "swedish"

    /** A list of aliases for options known by biblatex/babel/polyglosia and what they refer to. */
};var BiblatexAliasOptions = exports.BiblatexAliasOptions = {
    'language': languageAliases,
    'origlanguage': languageAliases,
    'langid': langidAliases

    /** A list of special chars in Tex and their unicode equivalent. */

    /* The copyright holder of the below composition is Emiliano Heyns, and it is made available under the MIT license.
    
    Data sources for the composition are:
    
    http://milde.users.sourceforge.net/LUCR/Math/data/unimathsymbols.txt
    http://www.w3.org/2003/entities/2007xml/unicode.xml
    http://www.w3.org/Math/characters/unicode.xml
    */
};var TeXSpecialChars = exports.TeXSpecialChars = [["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char220\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char220", '\u033C'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char225\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char225", '\u0361'], ["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char201\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char201", '\u013F'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char218\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char218", '\u033A'], ["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char202\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char202", '\u0140'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char207\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char207", '\u032F'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char203\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char203", '\u032B'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char185\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char185", '\u0319'], ["\\{\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char202\\}|\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char202", '\u027F'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char184\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char184", '\u0318'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char177\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char177", '\u0311'], ["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char195\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char195", '\u01BA'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char215\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char215", '\u0337'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char216\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char216", '\u0338'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char219\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char219", '\u033B'], ["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char221\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char221", '\u033D'], ["\\{\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char61\\}|\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char61", '\u0258'], ["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char63\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char63", '\u0167'], ["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char91\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char91", '\u0138'], ["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char40\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char40", '\u0126'], ["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char47\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char47", '\u0166'], ["\\\\mathbin\\{\\{:\\}\\\\!\\\\!\\{\\-\\}\\\\!\\\\!\\{:\\}\\}", '\u223A'], ["\\\\cyrchar\\\\cyrhundredthousands", '\u0488'], ['\\\\acute\\{\\\\ddot\\{\\\\upsilon\\}\\}', '\u03B0'], ["\\\\Pisymbol\\{ppi020\\}\\{105\\}", '\u2A9E'], ["\\\\acute\\{\\\\ddot\\{\\\\iota\\}\\}", '\u0390'], ["\\\\Pisymbol\\{ppi020\\}\\{117\\}", '\u2A9D'], ["\\\\mathsfbfsl\\{\\\\varkappa\\}", '\uD835\uDFC6'], ["\\\\barleftarrowrightarrowba", '\u21B9'], ["\\\\mathsfbfsl\\{\\\\vartheta\\}", '\uD835\uDF97'], ["\\\\not\\\\kern\\-0\\.3em\\\\times", '\u226D'], ["\\\\leftarrowshortrightarrow", '\u2943'], ["\\\\mathsfbfsl\\{\\\\varsigma\\}", '\uD835\uDFBB'], ["\\\\Pisymbol\\{ppi022\\}\\{87\\}", '\u03D0'], ["\\\\concavediamondtickright", '\u27E3'], ["\\\\invwhiteupperhalfcircle", '\u25DA'], ['\\\\mathsfbfsl\\{\\\\Upsilon\\}', '\uD835\uDFA4'], ["\\\\nvtwoheadrightarrowtail", '\u2917'], ["\\\\nVtwoheadrightarrowtail", '\u2918'], ["\\\\invwhitelowerhalfcircle", '\u25DB'], ["\\\\leftrightarrowtriangle", '\u21FF'], ["\\\\partialmeetcontraction", '\u2AA3'], ['\\\\updownharpoonleftright', '\u294D'], ["\\\\ensuremath\\{\\\\Elzpes\\}", '\u20A7'], ["\\\\texteuro|\\{\\\\mbox\\{\\\\texteuro\\}\\}|\\\\mbox\\{\\\\texteuro\\}", '\u20AC'], ["\\\\cyrchar\\\\CYROMEGATITLO", '\u047C'], ["\\\\mathsfbfsl\\{\\\\varrho\\}", '\uD835\uDFC8'], ["\\\\cyrchar\\\\cyromegatitlo", '\u047D'], ["\\\\nVtwoheadleftarrowtail", '\u2B3D'], ["\\\\concavediamondtickleft", '\u27E2'], ['\\\\updownharpoonrightleft', '\u294C'], ["\\\\blackcircleulquadwhite", '\u25D5'], ["\\\\mathsfbfsl\\{\\\\Lambda\\}", '\uD835\uDF9A'], ["\\\\mathsfbf\\{\\\\varsigma\\}", '\uD835\uDF81'], ["\\\\mathsfbf\\{\\\\varkappa\\}", '\uD835\uDF8C'], ["\\\\nvtwoheadleftarrowtail", '\u2B3C'], ["\\\\mathsfbf\\{\\\\vartheta\\}", '\uD835\uDF67'], ["\\\\downtrianglerightblack", '\u29E9'], ["\\\\ElsevierGlyph\\{E838\\}", '\u233D'], ["\\\\ElsevierGlyph\\{2129\\}", '\u2129'], ["\\\\ElsevierGlyph\\{E219\\}", '\u2937'], ["\\\\rangledownzigzagarrow", '\u237C'], ["\\\\mathsfbfsl\\{\\\\Omega\\}", '\uD835\uDFA8'], ["\\\\mathrm\\{\\\\ddot\\{Y\\}\\}", '\u03AB'], ["\\\\mathsfbfsl\\{\\\\nabla\\}", '\uD835\uDFA9'], ["\\\\mathrm\\{\\\\ddot\\{I\\}\\}", '\u03AA'], ["\\\\mathsfbfsl\\{\\\\Gamma\\}", '\uD835\uDF92'], ["\\\\ElsevierGlyph\\{2275\\}", '\u2275'], ["\\\\ElsevierGlyph\\{E21A\\}", '\u2936'], ["\\\\ElsevierGlyph\\{E214\\}", '\u297C'], ["\\\\ElsevierGlyph\\{E215\\}", '\u297D'], ["\\\\ElsevierGlyph\\{2274\\}", '\u2274'], ["\\\\ElsevierGlyph\\{2232\\}", '\u2232'], ["\\\\ElsevierGlyph\\{E212\\}", '\u2905'], ["\\\\ElsevierGlyph\\{2233\\}", '\u2233'], ["\\\\ElsevierGlyph\\{3018\\}", '\u2985'], ["\\\\sim\\\\joinrel\\\\leadsto", '\u27FF'], ["\\\\ElsevierGlyph\\{2238\\}", '\u2238'], ["\\\\ElsevierGlyph\\{E291\\}", '\u2994'], ["\\\\ElsevierGlyph\\{E21C\\}", '\u2933'], ['\\\\underrightharpoondown', '\u20EC'], ["\\\\ElsevierGlyph\\{2242\\}", '\u2242'], ["\\\\ElsevierGlyph\\{E260\\}", '\u29B5'], ["\\\\ElsevierGlyph\\{E61B\\}", '\u29B6'], ["\\\\cyrchar\\\\cyrsemisftsn", '\u048D'], ["\\\\cyrchar\\\\CYRSEMISFTSN", '\u048C'], ["\\\\cyrchar\\\\cyrthousands", '\u0482'], ["\\\\ElsevierGlyph\\{3019\\}", '\u3019'], ["\\\\ElsevierGlyph\\{300B\\}", '\u300B'], ["\\\\leftrightharpoonsdown", '\u2967'], ["\\\\rightleftharpoonsdown", '\u2969'], ["\\\\ElsevierGlyph\\{E210\\}", '\u292A'], ["\\\\ElsevierGlyph\\{300A\\}", '\u300A'], ["\\\\ElsevierGlyph\\{E372\\}", '\u29DC'], ["\\\\ElsevierGlyph\\{22C0\\}", '\u22C0'], ["\\\\downtriangleleftblack", '\u29E8'], ["\\\\blackdiamonddownarrow", '\u29EA'], ["\\\\ElsevierGlyph\\{E20F\\}", '\u2929'], ["\\\\ElsevierGlyph\\{E20E\\}", '\u2928'], ["\\\\ElsevierGlyph\\{E211\\}", '\u2927'], ["\\\\ElsevierGlyph\\{E20A\\}", '\u2926'], ["\\\\ElsevierGlyph\\{225A\\}", '\u225A'], ["\\\\ElsevierGlyph\\{225F\\}", '\u225F'], ["\\\\ElsevierGlyph\\{E20B\\}", '\u2925'], ["\\\\ElsevierGlyph\\{E20D\\}", '\u2924'], ['\\\\mathsfbf\\{\\\\Upsilon\\}', '\uD835\uDF6A'], ["\\\\ElsevierGlyph\\{22C1\\}", '\u22C1'], ["\\\\mathbit\\{\\\\varkappa\\}", '\uD835\uDF52'], ["\\\\mathbit\\{\\\\vartheta\\}", '\uD835\uDF51'], ["\\\\mathbit\\{\\\\varsigma\\}", '\uD835\uDF47'], ["\\\\ElsevierGlyph\\{E20C\\}", '\u2923'], ["\\\\ElsevierGlyph\\{E395\\}", '\u2A10'], ["\\\\ElsevierGlyph\\{E25A\\}", '\u2A25'], ["\\\\ElsevierGlyph\\{21B3\\}", '\u21B3'], ["\\\\ElsevierGlyph\\{E25B\\}", '\u2A2A'], ["\\\\ElsevierGlyph\\{E25C\\}", '\u2A2D'], ["\\\\ElsevierGlyph\\{E25D\\}", '\u2A2E'], ["\\\\ElsevierGlyph\\{E25E\\}", '\u2A34'], ["\\\\ElsevierGlyph\\{E259\\}", '\u2A3C'], ["\\\\ElsevierGlyph\\{E381\\}", '\u25B1'], ["\\\\closedvarcupsmashprod", '\u2A50'], ["\\\\ElsevierGlyph\\{E36E\\}", '\u2A55'], ["\\\\barovernorthwestarrow", '\u21B8'], ["\\\\mathsfbfsl\\{\\\\Delta\\}", '\uD835\uDF93'], ["\\\\ElsevierGlyph\\{E30D\\}", '\u2AEB'], ["\\\\mathsfbfsl\\{\\\\Sigma\\}", '\uD835\uDFA2'], ["\\\\mathsfbfsl\\{\\\\varpi\\}", '\uD835\uDFC9'], ['\\\\mathbit\\{\\\\Upsilon\\}', '\uD835\uDF30'], ["\\\\whiteinwhitetriangle", '\u27C1'], ["\\\\cyrchar\\\\cyromegarnd", '\u047B'], ["\\\\cyrchar\\\\CYRABHCHDSC", '\u04BE'], ["\\\\cyrchar\\\\CYROMEGARND", '\u047A'], ["\\\\twoheadleftarrowtail", '\u2B3B'], ["\\\\mathsl\\{\\\\varkappa\\}", '\uD835\uDF18'], ["\\\\mathsl\\{\\\\varsigma\\}", '\uD835\uDF0D'], ["\\\\cyrchar\\\\cyrabhchdsc", '\u04BF'], ["\\\\cyrchar\\\\CYRpalochka", '\u04C0'], ["\\\\mathbf\\{\\\\varkappa\\}", '\uD835\uDEDE'], ["\\\\CapitalDifferentialD", '\u2145'], ["\\\\mathbf\\{\\\\varsigma\\}", '\uD835\uDED3'], ["\\\\mathsfbf\\{\\\\varrho\\}", '\uD835\uDF8E'], ["\\\\twoheaduparrowcircle", '\u2949'], ["\\\\rightarrowbackapprox", '\u2B48'], ["\\\\curvearrowrightminus", '\u293C'], ["\\\\barrightarrowdiamond", '\u2920'], ["\\\\leftrightarrowcircle", '\u2948'], ["\\\\downrightcurvedarrow", '\u2935'], ["\\\\NestedGreaterGreater", '\u2AA2'], ["\\\\cyrchar\\{\\\\'\\\\CYRK\\}", '\u040C'], ["\\\\mathsl\\{\\\\vartheta\\}", '\uD835\uDEF3'], ["\\\\mathsfbf\\{\\\\Lambda\\}", '\uD835\uDF60'], ['\\\\underleftharpoondown', '\u20ED'], ["\\\\mathbf\\{\\\\vartheta\\}", '\uD835\uDEB9'], ["\\\\cyrchar\\{\\\\'\\\\cyrk\\}", '\u045C'], ["\\\\blackcircledrightdot", '\u2688'], ["\\\\whitesquaretickright", '\u27E5'], ["\\\\cyrchar\\{\\\\'\\\\cyrg\\}", '\u0453'], ["\\\\cyrchar\\{\\\\'\\\\CYRG\\}", '\u0403'], ["\\\\cyrchar\\\\cyrmillions", '\u0489'], ["\\\\ReverseUpEquilibrium", '\u296F'], ["\\\\blackcircledownarrow", '\u29ED'], ["\\\\int\\\\!\\\\int\\\\!\\\\int", '\u222D'], ["\\\\leftrightsquigarrow", '\u21AD'], ["\\\\leftarrowbackapprox", '\u2B42'], ["\\\\mathbit\\{\\\\Lambda\\}", '\uD835\uDF26'], ["\\\\mathsfbfsl\\{\\\\phi\\}", '\uD835\uDFC7'], ["\\\\blockthreeqtrshaded", '\u2593'], ["\\\\whitesquaretickleft", '\u27E4'], ["\\\\blackcircledtwodots", '\u2689'], ["\\\\stackrel\\{\\*\\}\\{=\\}", '\u2A6E'], ["\\\\whitearrowupfrombar", '\u21EA'], ["\\\\mathsfbfsl\\{\\\\Phi\\}", '\uD835\uDFA5'], ["\\\\mathsfbf\\{\\\\Theta\\}", '\uD835\uDF5D'], ["\\\\leftrightharpoonsup", '\u2966'], ["\\\\mathsfbf\\{\\\\varpi\\}", '\uD835\uDF8F'], ["\\\\blackinwhitediamond", '\u25C8'], ["\\\\cyrchar\\\\cyriotbyus", '\u046D'], ["\\\\mathsfbf\\{\\\\Omega\\}", '\uD835\uDF6E'], ["\\\\cyrchar\\\\CYRIOTBYUS", '\u046C'], ['\\\\mathbf\\{\\\\Upsilon\\}', '\uD835\uDEBC'], ["\\\\mathsfbf\\{\\\\Delta\\}", '\uD835\uDF59'], ["\\\\mathsfbfsl\\{\\\\Psi\\}", '\uD835\uDFA7'], ["\\\\DownLeftRightVector", '\u2950'], ["\\\\cyrchar\\\\textnumero", '\u2116'], ["\\\\twoheadleftdbkarrow", '\u2B37'], ["\\\\mathsfbf\\{\\\\Gamma\\}", '\uD835\uDF58'], ["\\\\rightleftharpoonsup", '\u2968'], ['\\\\mathsl\\{\\\\Upsilon\\}', '\uD835\uDEF6'], ["\\\\cyrchar\\\\cyriotlyus", '\u0469'], ["\\\\nVtwoheadrightarrow", '\u2901'], ["\\\\mathbit\\{\\\\varrho\\}", '\uD835\uDF54'], ["\\\\mathsfbf\\{\\\\nabla\\}", '\uD835\uDF6F'], ["\\\\mathsfbf\\{\\\\Sigma\\}", '\uD835\uDF68'], ["\\\\cyrchar\\\\CYRIOTLYUS", '\u0468'], ["\\\\diamondleftarrowbar", '\u291F'], ["\\\\cyrchar\\\\CYRCHLDSC", '\u04CB'], ["\\\\longleftsquigarrow", '\u2B33'], ["\\\\textfrac\\{2\\}\\{5\\}", '\u2156'], ["\\\\RightDownTeeVector", '\u295D'], ["\\\\textfrac\\{7\\}\\{8\\}", '\u215E'], ["\\\\DownRightVectorBar", '\u2957'], ["\\\\mathrm\\{'\\\\Omega\\}", '\u038F'], ["\\\\textfrac\\{5\\}\\{8\\}", '\u215D'], ["\\\\rightpentagonblack", '\u2B53'], ["\\\\rightarrowbsimilar", '\u2B4C'], ["\\\\textfrac\\{3\\}\\{8\\}", '\u215C'], ["\\\\blackinwhitesquare", '\u25A3'], ["\\\\bsimilarrightarrow", '\u2B47'], ["\\\\textfrac\\{1\\}\\{8\\}", '\u215B'], ["\\\\textfrac\\{5\\}\\{6\\}", '\u215A'], ["\\\\errbarblackdiamond", '\u29F1'], ["\\\\mathbf\\{\\\\varrho\\}", '\uD835\uDEE0'], ["\\\\textfrac\\{1\\}\\{6\\}", '\u2159'], ["\\\\parallelogramblack", '\u25B0'], ["\\\\precedesnotsimilar", '\u22E8'], ["\\\\ccwundercurvearrow", '\u293F'], ["\\\\textfrac\\{4\\}\\{5\\}", '\u2158'], ["\\\\inversewhitecircle", '\u25D9'], ["\\\\textfrac\\{3\\}\\{5\\}", '\u2157'], ["\\\\textfrac\\{1\\}\\{5\\}", '\u2155'], ["\\\\mathbit\\{\\\\varpi\\}", '\uD835\uDF55'], ["\\\\DownRightTeeVector", '\u295F'], ["\\{\\{/\\}\\\\!\\\\!\\{/\\}\\}", '\u2AFD'], ["\\\\textfrac\\{1\\}\\{3\\}", '\u2153'], ["\\\\mathbit\\{\\\\nabla\\}", '\uD835\uDF35'], ["\\\\mathbit\\{\\\\Omega\\}", '\uD835\uDF34'], ["\\\\overleftrightarrow", '\u20E1'], ["\\\\acute\\{\\\\epsilon\\}", '\u03AD'], ["\\\\mathbit\\{\\\\Sigma\\}", '\uD835\uDF2E'], ["\\\\mathbf\\{\\\\Lambda\\}", '\uD835\uDEB2'], ['\\\\acute\\{\\\\upsilon\\}', '\u03CD'], ["\\\\mathbit\\{\\\\Theta\\}", '\uD835\uDF23'], ["\\\\mathbit\\{\\\\Delta\\}", '\uD835\uDF1F'], ["\\\\mathbit\\{\\\\Gamma\\}", '\uD835\uDF1E'], ["\\\\mathsfbfsl\\{\\\\Xi\\}", '\uD835\uDF9D'], ["\\\\mathsl\\{\\\\varrho\\}", '\uD835\uDF1A'], ["\\\\RightDownVectorBar", '\u2955'], ["\\\\textperiodcentered", '\u02D9'], ["\\\\textfrac\\{2\\}\\{3\\}", '\u2154'], ["\\\\hspace\\{0\\.166em\\}", '\u2006'], ["\\\\,|\\\\hspace\\{0\\.167em\\}", '\u2009'], ["\\\\circletophalfblack", '\u25D3'], ["\\\\rule\\{1em\\}\\{1pt\\}", '\u2015'], ["\\\\curvearrowleftplus", '\u293D'], ["\\\\rightarrowtriangle", '\u21FE'], ["\\\\Longleftrightarrow", '\u27FA'], ["\\\\cyrchar\\\\cyrabhdze", '\u04E1'], ["\\\\longleftrightarrow", '\u27F7'], ["\\\\blacktriangleright", '\u25B8'], ["\\\\circleonrightarrow", '\u21F4'], ["\\\\cyrchar\\\\CYRABHDZE", '\u04E0'], ["\\\\nVtwoheadleftarrow", '\u2B35'], ["\\\\rightrightharpoons", '\u2964'], ["\\\\cyrchar\\\\CYRCHRDSC", '\u04B6'], ["\\\\trianglerightblack", '\u25EE'], ["\\\\cyrchar\\\\cyrchldsc", '\u04CC'], ["\\\\cyrchar\\\\cyrchrdsc", '\u04B7'], ["\\\\mathsfbfsl\\{\\\\Pi\\}", '\uD835\uDF9F'], ["\\\\nvtwoheadleftarrow", '\u2B34'], ["\\\\textpertenthousand", '\u2031'], ["\\\\circledwhitebullet", '\u29BE'], ["\\\\cyrchar\\\\CYRCHVCRS", '\u04B8'], ["\\\\cyrchar\\\\cyrchvcrs", '\u04B9'], ["\\\\mathsl\\{\\\\Lambda\\}", '\uD835\uDEEC'], ["\\\\blacktriangleleft", '\u25C2'], ["\\\\mathsl\\{\\\\Theta\\}", '\uD835\uDEE9'], ["\\\\blacktriangledown", '\u25BE'], ["\\\\mathsl\\{\\\\Delta\\}", '\uD835\uDEE5'], ["\\\\whitepointerright", '\u25BB'], ["\\\\blackpointerright", '\u25BA'], ["\\\\mathsl\\{\\\\Gamma\\}", '\uD835\uDEE4'], ["\\\\mathbf\\{\\\\Gamma\\}", '\uD835\uDEAA'], ["\\\\mathbf\\{\\\\varpi\\}", '\uD835\uDEE1'], ["\\\\mathbf\\{\\\\Delta\\}", '\uD835\uDEAB'], ["\\\\mathbf\\{\\\\Theta\\}", '\uD835\uDEAF'], ["\\\\mathbf\\{\\\\theta\\}", '\uD835\uDEC9'], ["\\\\mathbf\\{\\\\nabla\\}", '\uD835\uDEC1'], ["\\\\mathbf\\{\\\\Omega\\}", '\uD835\uDEC0'], ['\\\\uprightcurvearrow', '\u2934'], ["\\\\mathbf\\{\\\\Sigma\\}", '\uD835\uDEBA'], ["\\\\similarrightarrow", '\u2972'], ["\\\\rightarrowdiamond", '\u291E'], ["\\\\rightarrowsimilar", '\u2974'], ["\\\\cyrchar\\\\CYRKBEAK", '\u04A0'], ["\\\\LeftDownVectorBar", '\u2959'], ["\\\\cyrchar\\\\CYRABHHA", '\u04A8'], ["\\\\cyrchar\\\\cyrabhha", '\u04A9'], ["\\\\cyrchar\\\\cyrkhcrs", '\u049F'], ["\\\\cyrchar\\\\CYRKHCRS", '\u049E'], ["\\\\cyrchar\\\\cyrkvcrs", '\u049D'], ["\\\\downslopeellipsis", '\u22F1'], ["\\\\cyrchar\\\\CYRKVCRS", '\u049C'], ["\\\\cyrchar\\\\cyrzhdsc", '\u0497'], ["\\\\cyrchar\\\\CYRZHDSC", '\u0496'], ["\\\\cyrchar\\\\cyrghcrs", '\u0493'], ["\\\\cyrchar\\\\CYRGHCRS", '\u0492'], ["\\\\rightarrowonoplus", '\u27F4'], ["\\\\acwgapcirclearrow", '\u27F2'], ["\\\\measuredangleleft", '\u299B'], ["\\\\cyrchar\\\\CYRYHCRS", '\u04B0'], ["\\\\cyrchar\\\\cyryhcrs", '\u04B1'], ["\\\\cyrchar\\\\CYRTETSE", '\u04B4'], ["\\\\cyrchar\\\\cyrtetse", '\u04B5'], ["\\\\cyrchar\\\\cyrrtick", '\u048F'], ["\\\\cyrchar\\\\CYRRTICK", '\u048E'], ["\\\\cyrchar\\\\CYRABHCH", '\u04BC'], ["\\\\cyrchar\\\\cyrabhch", '\u04BD'], ["\\\\cyrchar\\\\cyrkoppa", '\u0481'], ["\\\\cyrchar\\\\CYRKOPPA", '\u0480'], ["\\\\RightUpDownVector", '\u294F'], ["\\\\errbarblacksquare", '\u29EF'], ["\\\\errbarblackcircle", '\u29F3'], ["\\\\cyrchar\\\\cyromega", '\u0461'], ["\\\\cyrchar\\\\CYROMEGA", '\u0460'], ["\\\\mathsfbf\\{\\\\Psi\\}", '\uD835\uDF6D'], ["\\\\mathsfbf\\{\\\\Phi\\}", '\uD835\uDF6B'], ["\\\\mathsl\\{\\\\varpi\\}", '\uD835\uDF1B'], ["\\\\mathsl\\{\\\\nabla\\}", '\uD835\uDEFB'], ["\\\\mathsl\\{\\\\Omega\\}", '\uD835\uDEFA'], ["\\\\mathsl\\{\\\\Sigma\\}", '\uD835\uDEF4'], ["\\\\cyrchar\\\\cyrkbeak", '\u04A1'], ["\\\\cyrchar\\\\cyrushrt", '\u045E'], ["\\\\cyrchar\\\\cyrsftsn", '\u044C'], ["\\\\cyrchar\\\\cyrhrdsn", '\u044A'], ["\\\\cyrchar\\\\cyrishrt", '\u0439'], ["\\\\cyrchar\\\\CYRSFTSN", '\u042C'], ["\\\\cyrchar\\\\CYRHRDSN", '\u042A'], ["\\\\twoheadrightarrow", '\u21A0'], ["\\\\cyrchar\\\\CYRISHRT", '\u0419'], ["\\\\cyrchar\\\\CYRUSHRT", '\u040E'], ["\\\\varhexagonlrbonds", '\u232C'], ["\\\\DownLeftTeeVector", '\u295E'], ["\\\\mathbb\\{\\\\Gamma\\}", '\u213E'], ["\\\\mathbb\\{\\\\gamma\\}", '\u213D'], ['\\\\ddot\\{\\\\upsilon\\}', '\u03CB'], ["\\\\varcarriagereturn", '\u23CE'], ["\\\\cyrchar\\\\CYRSCHWA", '\u04D8'], ["\\\\cyrchar\\\\cyrschwa", '\u04D9'], ["\\\\hspace\\{0\\.33em\\}", '\u2004'], ["\\\\hspace\\{0\\.25em\\}", '\u2005'], ["\\\\textquotedblright", '\u201D'], ["\\\\textthreequarters", '\xBE'], ["\\\\textasciidieresis", '\xA8'], ["\\\\diamondrightblack", '\u2B17'], ["\\\\circleonleftarrow", '\u2B30'], ["\\\\bsimilarleftarrow", '\u2B41'], ["\\\\LeftDownTeeVector", '\u2961'], ["\\\\leftarrowbsimilar", '\u2B4B'], ["\\\\triangleleftblack", '\u25ED'], ["\\\\leftrightharpoons", '\u21CB'], ["\\\\cwundercurvearrow", '\u293E'], ["\\\\DownLeftVectorBar", '\u2956'], ["\\\\rightleftharpoons", '\u21CC'], ["\\\\circleurquadblack", '\u25D4'], ["\\\\mathsfbf\\{\\\\phi\\}", '\uD835\uDF8D'], ["\\\\leftarrowtriangle", '\u21FD'], ["\\\\mathbb\\{\\\\Sigma\\}", '\u2140'], ["\\\\textordmasculine", '\xBA'], ["\\\\nvleftrightarrow", '\u21F9'], ["\\\\twoheadleftarrow", '\u219E'], ["\\\\diamondleftblack", '\u2B16'], ["\\\\cyrchar\\\\CYRSHCH", '\u0429'], ["\\\\leftarrowsimilar", '\u2973'], ["\\\\cyrchar\\\\CYREREV", '\u042D'], ["\\\\downdownharpoons", '\u2965'], ["\\\\leftarrowonoplus", '\u2B32'], ["\\\\cyrchar\\\\cyrshch", '\u0449'], ["\\\\cyrchar\\\\cyrerev", '\u044D'], ["\\\\cyrchar\\\\cyrtshe", '\u045B'], ["\\\\leftrightharpoon", '\u294A'], ["\\\\rightleftharpoon", '\u294B'], ["\\\\mathbit\\{\\\\Phi\\}", '\uD835\uDF31'], ["\\\\mathbit\\{\\\\Psi\\}", '\uD835\uDF33'], ["\\\\mathbit\\{\\\\phi\\}", '\uD835\uDF53'], ["\\\\cyrchar\\\\cyrdzhe", '\u045F'], ["\\\\mathsfbf\\{\\\\Xi\\}", '\uD835\uDF63'], ["\\\\leftleftharpoons", '\u2962'], ["\\\\RightUpVectorBar", '\u2954'], ["\\\\mathsfbf\\{\\\\Pi\\}", '\uD835\uDF65'], ["\\\\rightrightarrows", '\u21C9'], ["\\\\cyrchar\\\\CYRIOTE", '\u0464'], ["\\\\rightarrowsupset", '\u2B44'], ["\\\\cyrchar\\\\cyriote", '\u0465'], ["\\\\cyrchar\\\\CYRLYUS", '\u0466'], ["\\\\cyrchar\\\\cyrlyus", '\u0467'], ["\\\\cyrchar\\\\CYRBYUS", '\u046A'], ["\\\\similarleftarrow", '\u2B49'], ["\\\\DownArrowUpArrow", '\u21F5'], ["\\\\cyrchar\\\\CYRFITA", '\u0472'], ["\\\\RightTriangleBar", '\u29D0'], ["\\\\twoheaddownarrow", '\u21A1'], ["\\\\cyrchar\\\\cyrshha", '\u04BB'], ["\\\\cyrchar\\\\CYRSHHA", '\u04BA'], ["\\\\openbracketright", '\u301B'], ["\\\\sphericalangleup", '\u29A1'], ["\\\\whitepointerleft", '\u25C5'], ["\\\\cyrchar\\\\cyrhdsc", '\u04B3'], ["\\\\cyrchar\\\\CYRHDSC", '\u04B2'], ["\\\\cwgapcirclearrow", '\u27F3'], ["\\\\blackpointerleft", '\u25C4'], ["<\\\\kern\\-0\\.58em\\(", '\u2993'], ["\\\\rightthreearrows", '\u21F6'], ["\\\\ntrianglerighteq", '\u22ED'], ["\\\\cyrchar\\\\CYRZDSC", '\u0498'], ["\\\\cyrchar\\\\cyrzdsc", '\u0499'], ["\\\\acwunderarcarrow", '\u293B'], ["\\\\nVleftrightarrow", '\u21FC'], ["\\\\cyrchar\\\\CYRKDSC", '\u049A'], ["\\\\nvLeftrightarrow", '\u2904'], ["\\\\cyrchar\\\\cyrkdsc", '\u049B'], ["\\\\cyrchar\\\\cyrtdsc", '\u04AD'], ["\\\\cyrchar\\\\CYRTDSC", '\u04AC'], ["\\\\cyrchar\\\\cyrsdsc", '\u04AB'], ["\\\\cyrchar\\\\CYRSDSC", '\u04AA'], ["\\\\LeftUpDownVector", '\u2951'], ["\\\\RightUpTeeVector", '\u295C'], ["\\\\rightarrowapprox", '\u2975'], ["\\\\hermitconjmatrix", '\u22B9'], ["\\\\downharpoonright", '\u21C2'], ["\\\\rightharpoondown", '\u21C1'], ["\\\\hspace\\{0\\.6em\\}", '\u2002'], ["\\\\cyrchar\\\\cyrotld", '\u04E9'], ["\\\\cyrchar\\\\CYROTLD", '\u04E8'], ["\\\\circlearrowright", '\u21BB'], ["\\\\textquotedblleft", '\u201C'], ["\\\\vartriangleright", '\u22B3'], ["\\\\cyrchar\\\\CYRNDSC", '\u04A2'], ["\\\\acute\\{\\\\omega\\}", '\u03CE'], ["\\\\textvisiblespace", '\u2423'], ["\\\\cyrchar\\\\cyrndsc", '\u04A3'], ["\\\\APLrightarrowbox", '\u2348'], ["\\\\cyrchar\\\\CYRTSHE", '\u040B'], ["\\\\textquestiondown", '\xBF'], ["\\\\diamondleftarrow", '\u291D'], ["\\\\cyrchar\\\\CYRDZHE", '\u040F'], ["\\\\LeftRightVector", '\u294E'], ["\\\\acwoverarcarrow", '\u293A'], ["\\\\acwleftarcarrow", '\u2939'], ["\\\\cwrightarcarrow", '\u2938'], ["\\\\cyrchar\\\\CYRPHK", '\u04A6'], ["\\\\cyrchar\\\\cyrphk", '\u04A7'], ['\\\\upslopeellipsis', '\u22F0'], ["\\\\downarrowbarred", '\u2908'], ["\\\\cyrchar\\\\CYRKHK", '\u04C3'], ["\\\\cyrchar\\\\cyrkhk", '\u04C4'], ["\\\\mathbit\\{\\\\Pi\\}", '\uD835\uDF2B'], ["\\\\mathbit\\{\\\\Xi\\}", '\uD835\uDF29'], ["\\\\mathsl\\{\\\\phi\\}", '\uD835\uDF19'], ["\\\\mathsl\\{\\\\Psi\\}", '\uD835\uDEF9'], ["\\\\mathsl\\{\\\\Phi\\}", '\uD835\uDEF7'], ["\\\\cyrchar\\\\CYRNHK", '\u04C7'], ["\\\\cyrchar\\\\cyrnhk", '\u04C8'], ["\\\\perspcorrespond", '\u2306'], ["\\\\APLleftarrowbox", '\u2347'], ["\\\\APLdownarrowbox", '\u2357'], ["\\\\circledrightdot", '\u2686'], ["\\\\textperthousand", '\u2030'], ["\\\\enclosetriangle", '\u20E4'], ["\\\\widebridgeabove", '\u20E9'], ["\\\\blockhalfshaded", '\u2592'], ['\\\\underrightarrow', '\u20EF'], ['\\\\urblacktriangle', '\u25E5'], ['\\\\ulblacktriangle', '\u25E4'], ["\\\\llblacktriangle", '\u25E3'], ["\\\\lrblacktriangle", '\u25E2'], ["\\\\bigtriangledown", '\u25BD'], ["\\\\mathbf\\{\\\\phi\\}", '\uD835\uDEDF'], ["\\\\vrectangleblack", '\u25AE'], ["\\\\hrectangleblack", '\u25AC'], ["\\\\squarecrossfill", '\u25A9'], ["\\\\mathbf\\{\\\\Psi\\}", '\uD835\uDEBF'], ["\\\\mathbf\\{\\\\Phi\\}", '\uD835\uDEBD'], ["\\\\rightsquigarrow", '\u21DD'], ["\\\\vartriangleleft", '\u22B2'], ["\\\\trianglerighteq", '\u22B5'], ["\\\\nLeftrightarrow", '\u21CE'], ["\\\\greaterequivlnt", '\u2273'], ["\\\\rightwhitearrow", '\u21E8'], ["\\\\mathsfbfsl\\{z\\}", '\uD835\uDE6F'], ["\\\\mathsfbfsl\\{y\\}", '\uD835\uDE6E'], ["\\\\mathsfbfsl\\{x\\}", '\uD835\uDE6D'], ["\\\\mathsfbfsl\\{w\\}", '\uD835\uDE6C'], ["\\\\mathsfbfsl\\{v\\}", '\uD835\uDE6B'], ["\\\\mathsfbfsl\\{u\\}", '\uD835\uDE6A'], ["\\\\mathsfbfsl\\{t\\}", '\uD835\uDE69'], ["\\\\mathsfbfsl\\{s\\}", '\uD835\uDE68'], ["\\\\mathsfbfsl\\{r\\}", '\uD835\uDE67'], ["\\\\mathsfbfsl\\{q\\}", '\uD835\uDE66'], ["\\\\mathsfbfsl\\{p\\}", '\uD835\uDE65'], ["\\\\mathsfbfsl\\{o\\}", '\uD835\uDE64'], ["\\\\mathsfbfsl\\{n\\}", '\uD835\uDE63'], ["\\\\mathsfbfsl\\{m\\}", '\uD835\uDE62'], ["\\\\mathsfbfsl\\{l\\}", '\uD835\uDE61'], ["\\\\mathsfbfsl\\{k\\}", '\uD835\uDE60'], ["\\\\mathsfbfsl\\{j\\}", '\uD835\uDE5F'], ["\\\\mathsfbfsl\\{i\\}", '\uD835\uDE5E'], ["\\\\mathsfbfsl\\{h\\}", '\uD835\uDE5D'], ["\\\\mathsfbfsl\\{g\\}", '\uD835\uDE5C'], ["\\\\mathsfbfsl\\{f\\}", '\uD835\uDE5B'], ["\\\\mathsfbfsl\\{e\\}", '\uD835\uDE5A'], ["\\\\mathsfbfsl\\{d\\}", '\uD835\uDE59'], ["\\\\mathsfbfsl\\{c\\}", '\uD835\uDE58'], ["\\\\mathsfbfsl\\{b\\}", '\uD835\uDE57'], ["\\\\mathsfbfsl\\{a\\}", '\uD835\uDE56'], ["\\\\mathsfbfsl\\{Z\\}", '\uD835\uDE55'], ["\\\\mathsfbfsl\\{Y\\}", '\uD835\uDE54'], ["\\\\mathsfbfsl\\{X\\}", '\uD835\uDE53'], ["\\\\mathsfbfsl\\{W\\}", '\uD835\uDE52'], ["\\\\mathsfbfsl\\{V\\}", '\uD835\uDE51'], ["\\\\mathsfbfsl\\{U\\}", '\uD835\uDE50'], ["\\\\mathsfbfsl\\{T\\}", '\uD835\uDE4F'], ["\\\\mathsfbfsl\\{S\\}", '\uD835\uDE4E'], ["\\\\mathsfbfsl\\{R\\}", '\uD835\uDE4D'], ["\\\\mathsfbfsl\\{Q\\}", '\uD835\uDE4C'], ["\\\\mathsfbfsl\\{P\\}", '\uD835\uDE4B'], ["\\\\mathsfbfsl\\{O\\}", '\uD835\uDE4A'], ["\\\\mathsfbfsl\\{N\\}", '\uD835\uDE49'], ["\\\\mathsfbfsl\\{M\\}", '\uD835\uDE48'], ["\\\\mathsfbfsl\\{L\\}", '\uD835\uDE47'], ["\\\\mathsfbfsl\\{K\\}", '\uD835\uDE46'], ["\\\\mathsfbfsl\\{J\\}", '\uD835\uDE45'], ["\\\\mathsfbfsl\\{I\\}", '\uD835\uDE44'], ["\\\\mathsfbfsl\\{H\\}", '\uD835\uDE43'], ["\\\\mathsfbfsl\\{G\\}", '\uD835\uDE42'], ["\\\\mathsfbfsl\\{F\\}", '\uD835\uDE41'], ["\\\\mathsfbfsl\\{E\\}", '\uD835\uDE40'], ["\\\\mathsfbfsl\\{D\\}", '\uD835\uDE3F'], ["\\\\mathsfbfsl\\{C\\}", '\uD835\uDE3E'], ["\\\\mathsfbfsl\\{B\\}", '\uD835\uDE3D'], ["\\\\mathsfbfsl\\{A\\}", '\uD835\uDE3C'], ["\\\\textquotesingle", "'"], ["\\\\openbracketleft", '\u301A'], ["\\\\leftarrowapprox", '\u2B4A'], ["\\\\leftcurvedarrow", '\u2B3F'], ["\\\\nVleftarrowtail", '\u2B3A'], ["\\\\nvleftarrowtail", '\u2B39'], ["\\\\twoheadmapsfrom", '\u2B36'], ["\\\\leftthreearrows", '\u2B31'], ["\\\\varhexagonblack", '\u2B22'], ["\\\\diamondbotblack", '\u2B19'], ["\\\\diamondtopblack", '\u2B18'], ["\\\\leftrightarrows", '\u21C6'], ["\\\\textordfeminine", '\xAA'], ["\\\\textasciimacron", '\xAF'], ["\\\\rightleftarrows", '\u21C4'], ["\\\\downharpoonleft", '\u21C3'], ["\\\\rightthreetimes", '\u22CC'], ["\\\\leftharpoondown", '\u21BD'], ["\\\\acute\\{\\\\iota\\}", '\u03AF'], ["\\\\circlearrowleft", '\u21BA'], ["\\\\cyrchar\\\\CYRDJE", '\u0402'], ["\\\\cyrchar\\\\CYRDZE", '\u0405'], ["\\\\verymuchgreater", '\u22D9'], ["\\\\cyrchar\\\\CYRLJE", '\u0409'], ["\\\\cyrchar\\\\CYRNJE", '\u040A'], ["\\\\cyrchar\\\\CYRERY", '\u042B'], ["\\\\curvearrowright", '\u21B7'], ["\\\\not\\\\sqsubseteq", '\u22E2'], ["\\\\not\\\\sqsupseteq", '\u22E3'], ["\\\\bigtriangleleft", '\u2A1E'], ["\\\\cyrchar\\\\cyrery", '\u044B'], ["\\\\cyrchar\\\\cyrdje", '\u0452'], ["\\\\cyrchar\\\\cyrdze", '\u0455'], ["\\\\cyrchar\\\\cyrlje", '\u0459'], ["\\\\cyrchar\\\\cyrnje", '\u045A'], ["\\\\nleftrightarrow", '\u21AE'], ["\\\\cyrchar\\\\CYRYAT", '\u0462'], ["\\\\circledownarrow", '\u29EC'], ["\\\\cyrchar\\\\CYRKSI", '\u046E'], ["\\\\cyrchar\\\\cyrksi", '\u046F'], ["\\\\cyrchar\\\\CYRPSI", '\u0470'], ["\\\\cyrchar\\\\cyrpsi", '\u0471'], ["\\\\cyrchar\\\\CYRIZH", '\u0474'], ["\\\\LeftTriangleBar", '\u29CF'], ['\\\\uparrowoncircle', '\u29BD'], ["\\\\circledparallel", '\u29B7'], ["\\\\measangledltosw", '\u29AF'], ["\\\\measangledrtose", '\u29AE'], ["\\\\measangleultonw", '\u29AD'], ["\\\\measangleurtone", '\u29AC'], ["\\\\measangleldtosw", '\u29AB'], ["\\\\measanglerdtose", '\u29AA'], ["\\\\measanglelutonw", '\u29A9'], ["\\\\measanglerutone", '\u29A8'], ["\\\\cyrchar\\\\CYRGUP", '\u0490'], ["\\\\cyrchar\\\\cyrgup", '\u0491'], ["\\\\ntrianglelefteq", '\u22EC'], ["\\\\cyrchar\\\\CYRGHK", '\u0494'], ["\\\\cyrchar\\\\cyrghk", '\u0495'], ["\\\\leftarrowsubset", '\u297A'], ["\\\\equalrightarrow", '\u2971'], ["\\\\barrightharpoon", '\u296D'], ["\\\\rightbarharpoon", '\u296C'], ["\\\\LeftUpTeeVector", '\u2960'], ["\\\\LeftUpVectorBar", '\u2958'], ["\\\\notgreaterless", '\u2279'], ["\\\\rightouterjoin", '\u27D6'], ["\\\\mathbf\\{\\\\Pi\\}", '\uD835\uDEB7'], ["\\\\rightarrowtail", '\u21A3'], ["\\\\cyrchar\\\\cyrot", '\u047F'], ["\\\\cyrchar\\\\CYRUK", '\u0478'], ["\\\\cyrchar\\\\CYROT", '\u047E'], ['\\\\underleftarrow', '\u20EE'], ["\\\\triangleserifs", '\u29CD'], ["\\\\blackhourglass", '\u29D7'], ["\\\\downdownarrows", '\u21CA'], ["\\\\approxnotequal", '\u2246'], ["\\\\leftsquigarrow", '\u21DC'], ["\\\\mathsl\\{\\\\Pi\\}", '\uD835\uDEF1'], ["\\\\mathsl\\{\\\\Xi\\}", '\uD835\uDEEF'], ["\\\\cyrchar\\\\cyrje", '\u0458'], ["\\\\cyrchar\\\\cyryi", '\u0457'], ["\\\\cyrchar\\\\cyrii", '\u0456'], ["\\\\cyrchar\\\\cyrie", '\u0454'], ["\\\\cyrchar\\\\cyryo", '\u0451'], ["\\\\cyrchar\\\\cyrya", '\u044F'], ["\\\\cyrchar\\\\cyryu", '\u044E'], ["\\\\cyrchar\\\\cyrsh", '\u0448'], ["\\\\cyrchar\\\\cyrch", '\u0447'], ["\\\\carriagereturn", '\u21B5'], ["\\\\cyrchar\\\\cyrzh", '\u0436'], ["\\\\cyrchar\\\\CYRYA", '\u042F'], ["\\\\cyrchar\\\\CYRYU", '\u042E'], ["\\\\curvearrowleft", '\u21B6'], ["\\\\cyrchar\\\\CYRSH", '\u0428'], ["\\\\cyrchar\\\\CYRCH", '\u0427'], ["\\\\bigslopedwedge", '\u2A58'], ["\\\\wedgedoublebar", '\u2A60'], ["\\\\twoheaduparrow", '\u219F'], ["\\\\arrowwaveleft|\\\\arrowwaveright", '\u219C'], ["\\\\cyrchar\\\\CYRZH", '\u0416'], ["\\\\leftrightarrow", '\u2194'], ["\\\\cyrchar\\\\CYRJE", '\u0408'], ["\\\\cyrchar\\\\CYRYI", '\u0407'], ["\\\\cyrchar\\\\CYRII", '\u0406'], ["\\\\cyrchar\\\\CYRIE", '\u0404'], ["\\\\mathbb\\{\\\\Pi\\}", '\u213F'], ["\\\\cyrchar\\\\CYRYO", '\u0401'], ["\\\\APLboxquestion", '\u2370'], ["\\\\ddot\\{\\\\iota\\}", '\u03CA'], ["\\\\mathbb\\{\\\\pi\\}", '\u213C'], ["\\\\hookrightarrow", '\u21AA'], ["\\\\lparenextender", '\u239C'], ["\\\\rparenextender", '\u239F'], ["\\\\acute\\{\\\\eta\\}", '\u03AE'], ["\\\\lbrackextender", '\u23A2'], ["\\\\NestedLessLess", '\u2AA1'], ["\\\\rbrackextender", '\u23A5'], ["\\\\vbraceextender", '\u23AA'], ["\\\\harrowextender", '\u23AF'], ["\\\\cyrchar\\\\CYRAE", '\u04D4'], ["\\\\cyrchar\\\\cyrae", '\u04D5'], ["\\\\circledtwodots", '\u2687'], ['\\\\upharpoonright', '\u21BE'], ["\\\\ocommatopright", '\u0315'], ["\\\\rightharpoonup", '\u21C0'], ["\\\\leftthreetimes", '\u22CB'], ["\\\\rightarrowplus", '\u2945'], ["\\\\textasciibreve", '\u02D8'], ["\\\\textasciicaron", '\u02C7'], ["\\\\textdoublepipe", '\u01C2'], ["\\\\textonequarter", '\xBC'], ["\\\\guillemotright", '\xBB'], ["\\\\mathrm\\{\\\\mu\\}", '\xB5'], ["\\\\textasciiacute", '\xB4'], ["\\\\guilsinglright", '\u203A'], ["\\\\cyrchar\\\\CYRNG", '\u04A4'], ["\\\\looparrowright", '\u21AC'], ["\\\\textregistered", '\xAE'], ["\\\\dblarrowupdown", '\u21C5'], ["\\\\textexclamdown", '\xA1'], ["\\\\squaretopblack", '\u2B12'], ["\\\\squarebotblack", '\u2B13'], ["\\\\textasciigrave", '`'], ["\\\\leftleftarrows", '\u21C7'], ["\\\\enclosediamond", '\u20DF'], ["\\\\Longrightarrow", '\u27F9'], ["\\\\equalleftarrow", '\u2B40'], ["\\\\blockrighthalf", '\u2590'], ["\\\\blockqtrshaded", '\u2591'], ["\\\\RightVectorBar", '\u2953'], ["\\\\ntriangleright", '\u22EB'], ["\\\\longrightarrow", '\u27F6'], ['\\\\updownarrowbar', '\u21A8'], ["\\\\cyrchar\\\\cyrng", '\u04A5'], ["\\\\rightanglemdot", '\u299D'], ["\\\\concavediamond", '\u27E1'], ["\\\\rdiagovsearrow", '\u2930'], ["\\\\fdiagovnearrow", '\u292F'], ["\\\\leftbarharpoon", '\u296A'], ["\\\\trianglelefteq", '\u22B4'], ["\\\\circlevertfill", '\u25CD'], ["\\\\barleftharpoon", '\u296B'], ["\\\\dashrightarrow", '\u21E2'], ["\\\\RightTeeVector", '\u295B'], ["\\\\cyrchar\\\\cyruk", '\u0479'], ["\\\\downwhitearrow", '\u21E9'], ["\\\\squarenwsefill", '\u25A7'], ["\\\\Leftrightarrow", '\u21D4'], ["\\\\squareneswfill", '\u25A8'], ["\\\\leftwhitearrow", '\u21E6'], ["\\\\mathbf\\{\\\\Xi\\}", '\uD835\uDEB5'], ["\\\\sphericalangle", '\u2222'], ["\\\\notlessgreater", '\u2278'], ["\\\\downdasharrow", '\u21E3'], ["\\\\mathsfbf\\{R\\}", '\uD835\uDDE5'], ["\\\\mathslbb\\{D\\}", '\uD835\uDD6F'], ["\\\\mathfrak\\{H\\}", '\u210C'], ["\\\\mathslbb\\{E\\}", '\uD835\uDD70'], ["\\\\RightArrowBar", '\u21E5'], ["\\\\measuredangle", '\u2221'], ["\\\\mathslbb\\{F\\}", '\uD835\uDD71'], ["\\\\mathsfbf\\{S\\}", '\uD835\uDDE6'], ["\\\\mathslbb\\{O\\}", '\uD835\uDD7A'], ["\\\\biginterleave", '\u2AFC'], ["\\\\mathsfsl\\{Y\\}", '\uD835\uDE20'], ["\\\\mathsfsl\\{X\\}", '\uD835\uDE1F'], ["\\\\textbrokenbar", '\xA6'], ["\\\\mathsfsl\\{W\\}", '\uD835\uDE1E'], ["\\\\textcopyright", '\xA9'], ["\\\\guillemotleft", '\xAB'], ["\\\\textparagraph", '\xB6'], ["\\\\guilsinglleft", '\u2039'], ["\\\\mathsfsl\\{V\\}", '\uD835\uDE1D'], ["\\\\mathslbb\\{P\\}", '\uD835\uDD7B'], ["\\\\mathslbb\\{Q\\}", '\uD835\uDD7C'], ["\\\\mathfrak\\{Z\\}", '\u2128'], ["\\\\mathsfsl\\{U\\}", '\uD835\uDE1C'], ["\\\\shortdowntack", '\u2ADF'], ["\\\\shortlefttack", '\u2ADE'], ["\\\\textdaggerdbl", '\u2021'], ["\\\\mathfrak\\{C\\}", '\u212D'], ["\\\\mathslbb\\{R\\}", '\uD835\uDD7D'], ["\\\\mathslbb\\{S\\}", '\uD835\uDD7E'], ["\\\\mathslbb\\{T\\}", '\uD835\uDD7F'], ["\\\\divideontimes", '\u22C7'], ["\\\\mathslbb\\{U\\}", '\uD835\uDD80'], ["\\\\mathslbb\\{V\\}", '\uD835\uDD81'], ["\\\\mathslbb\\{W\\}", '\uD835\uDD82'], ["\\\\hookleftarrow", '\u21A9'], ["\\\\mathslbb\\{X\\}", '\uD835\uDD83'], ["\\\\mathsfsl\\{T\\}", '\uD835\uDE1B'], ["\\\\mathsfsl\\{S\\}", '\uD835\uDE1A'], ['\\\\upharpoonleft', '\u21BF'], ["\\\\mathslbb\\{Y\\}", '\uD835\uDD84'], ["\\\\mathsfsl\\{R\\}", '\uD835\uDE19'], ["\\\\mathsfsl\\{Q\\}", '\uD835\uDE18'], ["\\\\mathslbb\\{Z\\}", '\uD835\uDD85'], ["\\\\hphantom\\{,\\}", '\u2008'], ["\\\\mathsfsl\\{P\\}", '\uD835\uDE17'], ["\\\\mathsfsl\\{O\\}", '\uD835\uDE16'], ["\\\\sixteenthnote", '\u266C'], ["\\\\hphantom\\{0\\}", '\u2007'], ["\\\\hspace\\{1em\\}", '\u2003'], ["\\\\Hermaphrodite", '\u26A5'], ["\\\\mathslbb\\{a\\}", '\uD835\uDD86'], ["\\\\mdsmwhtcircle", '\u26AC'], ["\\\\leftharpoonup", '\u21BC'], ["\\\\mathsfsl\\{N\\}", '\uD835\uDE15'], ["\\\\mathsfsl\\{M\\}", '\uD835\uDE14'], ["\\\\cyrchar\\\\cyry", '\u04AF'], ["\\\\mathsfsl\\{L\\}", '\uD835\uDE13'], ["\\\\APLboxupcaret", '\u2353'], ["\\\\APLuparrowbox", '\u2350'], ["\\\\mathsfsl\\{K\\}", '\uD835\uDE12'], ["\\\\mathsfbf\\{b\\}", '\uD835\uDDEF'], ["\\\\sansLmirrored", '\u2143'], ["\\\\mathsfsl\\{J\\}", '\uD835\uDE11'], ["\\\\mathsfbf\\{l\\}", '\uD835\uDDF9'], ["\\\\cyrchar\\\\CYRY", '\u04AE'], ['\\\\uparrowbarred', '\u2909'], ["\\\\DifferentialD", '\u2146'], ["\\\\mathchar\"2208", '\u2316'], ["\\\\cyrchar\\\\CYRA", '\u0410'], ["\\\\cyrchar\\\\CYRB", '\u0411'], ["\\\\cyrchar\\\\CYRV", '\u0412'], ["\\\\cyrchar\\\\CYRG", '\u0413'], ["\\\\cyrchar\\\\CYRD", '\u0414'], ["\\\\cyrchar\\\\CYRE", '\u0415'], ["\\\\cyrchar\\\\CYRZ", '\u0417'], ["\\\\cyrchar\\\\CYRI", '\u0418'], ["\\\\cyrchar\\\\CYRK", '\u041A'], ["\\\\cyrchar\\\\CYRL", '\u041B'], ["\\\\cyrchar\\\\CYRM", '\u041C'], ["\\\\mathsfsl\\{I\\}", '\uD835\uDE10'], ["\\\\mathsfsl\\{H\\}", '\uD835\uDE0F'], ["\\\\cyrchar\\\\CYRN", '\u041D'], ["\\\\mathsfsl\\{G\\}", '\uD835\uDE0E'], ["\\\\cyrchar\\\\CYRO", '\u041E'], ["\\\\cyrchar\\\\CYRP", '\u041F'], ["\\\\mathslbb\\{b\\}", '\uD835\uDD87'], ["\\\\mathsfbf\\{9\\}", '\uD835\uDFF5'], ["\\\\cyrchar\\\\CYRR", '\u0420'], ["\\\\cyrchar\\\\CYRS", '\u0421'], ["\\\\cyrchar\\\\CYRT", '\u0422'], ["\\\\cyrchar\\\\CYRU", '\u0423'], ["\\\\mathsfbf\\{8\\}", '\uD835\uDFF4'], ["\\\\mathsfbf\\{7\\}", '\uD835\uDFF3'], ["\\\\mathsfbf\\{6\\}", '\uD835\uDFF2'], ["\\\\mathslbb\\{c\\}", '\uD835\uDD88'], ["\\\\mathslbb\\{d\\}", '\uD835\uDD89'], ["\\\\cyrchar\\\\CYRF", '\u0424'], ["\\\\mathslbb\\{e\\}", '\uD835\uDD8A'], ["\\\\cyrchar\\\\CYRH", '\u0425'], ["\\\\cyrchar\\\\CYRC", '\u0426'], ["\\\\mathsfbf\\{5\\}", '\uD835\uDFF1'], ["\\\\mathslbb\\{f\\}", '\uD835\uDD8B'], ["\\\\mathslbb\\{g\\}", '\uD835\uDD8C'], ["\\\\mathslbb\\{h\\}", '\uD835\uDD8D'], ["\\\\mathsfbf\\{4\\}", '\uD835\uDFF0'], ["\\\\mathsfbf\\{3\\}", '\uD835\uDFEF'], ["\\\\looparrowleft", '\u21AB'], ["\\\\mathslbb\\{i\\}", '\uD835\uDD8E'], ["\\\\mathslbb\\{j\\}", '\uD835\uDD8F'], ["\\\\cyrchar\\\\cyra", '\u0430'], ["\\\\cyrchar\\\\cyrb", '\u0431'], ["\\\\cyrchar\\\\cyrv", '\u0432'], ["\\\\cyrchar\\\\cyrg", '\u0433'], ["\\\\cyrchar\\\\cyrd", '\u0434'], ["\\\\mathslbb\\{k\\}", '\uD835\uDD90'], ["\\\\triangletimes", '\u2A3B'], ["\\\\triangleminus", '\u2A3A'], ["\\\\cyrchar\\\\cyre", '\u0435'], ["\\\\mathsfbf\\{2\\}", '\uD835\uDFEE'], ["\\\\mathslbb\\{l\\}", '\uD835\uDD91'], ["\\\\cyrchar\\\\cyrz", '\u0437'], ["\\\\cyrchar\\\\cyri", '\u0438'], ["\\\\mathslbb\\{m\\}", '\uD835\uDD92'], ["\\\\cyrchar\\\\cyrk", '\u043A'], ["\\\\mathslbb\\{n\\}", '\uD835\uDD93'], ["\\\\mathslbb\\{o\\}", '\uD835\uDD94'], ["\\\\mathsfbf\\{c\\}", '\uD835\uDDF0'], ["\\\\mathslbb\\{p\\}", '\uD835\uDD95'], ["\\\\mathslbb\\{q\\}", '\uD835\uDD96'], ["\\\\cyrchar\\\\cyrl", '\u043B'], ["\\\\mathslbb\\{r\\}", '\uD835\uDD97'], ["\\\\cyrchar\\\\cyrm", '\u043C'], ["\\\\mathslbb\\{s\\}", '\uD835\uDD98'], ["\\\\cyrchar\\\\cyrn", '\u043D'], ["\\\\cyrchar\\\\cyro", '\u043E'], ["\\\\cyrchar\\\\cyrp", '\u043F'], ["\\\\cyrchar\\\\cyrr", '\u0440'], ["\\\\cyrchar\\\\cyrs", '\u0441'], ["\\\\cyrchar\\\\cyrt", '\u0442'], ["\\\\cyrchar\\\\cyru", '\u0443'], ["\\\\cyrchar\\\\cyrf", '\u0444'], ["\\\\cyrchar\\\\cyrh", '\u0445'], ["\\\\cyrchar\\\\cyrc", '\u0446'], ["\\\\mathslbb\\{t\\}", '\uD835\uDD99'], ["\\\\mathslbb\\{u\\}", '\uD835\uDD9A'], ["\\\\leftarrowplus", '\u2946'], ["\\\\mathslbb\\{v\\}", '\uD835\uDD9B'], ["\\\\mathslbb\\{w\\}", '\uD835\uDD9C'], ["\\\\mathslbb\\{x\\}", '\uD835\uDD9D'], ["\\\\mathsfbf\\{1\\}", '\uD835\uDFED'], ["\\\\rightdotarrow", '\u2911'], ["\\\\mathslbb\\{y\\}", '\uD835\uDD9E'], ["\\\\mathsfbf\\{0\\}", '\uD835\uDFEC'], ["\\\\leftarrowless", '\u2977'], ["\\\\mathsfbf\\{d\\}", '\uD835\uDDF1'], ["\\\\mathsfsl\\{E\\}", '\uD835\uDE0C'], ["\\\\mathsfsl\\{D\\}", '\uD835\uDE0B'], ["\\\\mathslbb\\{z\\}", '\uD835\uDD9F'], ["\\\\mathsfsl\\{C\\}", '\uD835\uDE0A'], ["\\\\mathsfsl\\{B\\}", '\uD835\uDE09'], ["\\\\mathsfbf\\{e\\}", '\uD835\uDDF2'], ["\\\\fallingdotseq", '\u2252'], ["\\\\mathsfsl\\{A\\}", '\uD835\uDE08'], ["\\\\mathsfbf\\{A\\}", '\uD835\uDDD4'], ["\\\\errbardiamond", '\u29F0'], ["\\\\mathsfbf\\{B\\}", '\uD835\uDDD5'], ["\\\\mathsfbf\\{C\\}", '\uD835\uDDD6'], ["\\\\mathsfbf\\{f\\}", '\uD835\uDDF3'], ["\\\\mathsfbf\\{D\\}", '\uD835\uDDD7'], ["\\\\mathsfbf\\{E\\}", '\uD835\uDDD8'], ["\\\\mathsfbf\\{F\\}", '\uD835\uDDD9'], ["\\\\mathsfbf\\{G\\}", '\uD835\uDDDA'], ["\\\\mathsfbf\\{z\\}", '\uD835\uDE07'], ["\\\\mathsfbf\\{H\\}", '\uD835\uDDDB'], ["\\\\mathsfbf\\{I\\}", '\uD835\uDDDC'], ["\\\\mathsfbf\\{J\\}", '\uD835\uDDDD'], ["\\\\mathsfbf\\{K\\}", '\uD835\uDDDE'], ["\\\\mathsfbf\\{L\\}", '\uD835\uDDDF'], ["\\\\mathsfbf\\{M\\}", '\uD835\uDDE0'], ["\\\\mathsfbf\\{N\\}", '\uD835\uDDE1'], ["\\\\mathsfbf\\{O\\}", '\uD835\uDDE2'], ["\\\\mathsfbf\\{g\\}", '\uD835\uDDF4'], ["\\\\LeftVectorBar", '\u2952'], ["\\\\mathsfbf\\{y\\}", '\uD835\uDE06'], ["\\\\mathsfbf\\{P\\}", '\uD835\uDDE3'], ['\\\\UpEquilibrium', '\u296E'], ["\\\\bigtriangleup", '\u25B3'], ["\\\\blacktriangle", '\u25B4'], ["\\\\rightanglearc", '\u22BE'], ["\\\\dashleftarrow", '\u21E0'], ["\\\\triangleright", '\u25B9'], ["\\\\mathslbb\\{A\\}", '\uD835\uDD6C'], ["\\\\mathsfbf\\{Q\\}", '\uD835\uDDE4'], ["\\\\mathfrak\\{I\\}", '\u2111'], ["\\\\mathslbb\\{B\\}", '\uD835\uDD6D'], ["\\\\not\\\\supseteq", '\u2289'], ["\\\\not\\\\subseteq", '\u2288'], ["\\\\mathslbb\\{C\\}", '\uD835\uDD6E'], ["\\\\mathfrak\\{z\\}", '\uD835\uDD37'], ["\\\\mathfrak\\{y\\}", '\uD835\uDD36'], ["\\\\mathfrak\\{x\\}", '\uD835\uDD35'], ["\\\\mathfrak\\{w\\}", '\uD835\uDD34'], ["\\\\mathfrak\\{v\\}", '\uD835\uDD33'], ["\\\\mathfrak\\{u\\}", '\uD835\uDD32'], ["\\\\mathfrak\\{t\\}", '\uD835\uDD31'], ["\\\\mathfrak\\{s\\}", '\uD835\uDD30'], ["\\\\mathfrak\\{r\\}", '\uD835\uDD2F'], ["\\\\mathfrak\\{q\\}", '\uD835\uDD2E'], ["\\\\mathfrak\\{p\\}", '\uD835\uDD2D'], ["\\\\mathfrak\\{o\\}", '\uD835\uDD2C'], ["\\\\mathfrak\\{n\\}", '\uD835\uDD2B'], ["\\\\mathfrak\\{m\\}", '\uD835\uDD2A'], ["\\\\mathfrak\\{l\\}", '\uD835\uDD29'], ["\\\\mathfrak\\{k\\}", '\uD835\uDD28'], ["\\\\mathfrak\\{j\\}", '\uD835\uDD27'], ["\\\\mathfrak\\{i\\}", '\uD835\uDD26'], ["\\\\mathfrak\\{h\\}", '\uD835\uDD25'], ["\\\\mathfrak\\{g\\}", '\uD835\uDD24'], ["\\\\mathfrak\\{f\\}", '\uD835\uDD23'], ["\\\\mathfrak\\{e\\}", '\uD835\uDD22'], ["\\\\mathfrak\\{d\\}", '\uD835\uDD21'], ["\\\\mathfrak\\{c\\}", '\uD835\uDD20'], ["\\\\mathfrak\\{b\\}", '\uD835\uDD1F'], ["\\\\mathfrak\\{a\\}", '\uD835\uDD1E'], ["\\\\mathfrak\\{Y\\}", '\uD835\uDD1C'], ["\\\\mathfrak\\{X\\}", '\uD835\uDD1B'], ["\\\\mathfrak\\{W\\}", '\uD835\uDD1A'], ["\\\\mathfrak\\{V\\}", '\uD835\uDD19'], ["\\\\mathfrak\\{U\\}", '\uD835\uDD18'], ["\\\\mathfrak\\{T\\}", '\uD835\uDD17'], ["\\\\mathfrak\\{S\\}", '\uD835\uDD16'], ["\\\\mathfrak\\{Q\\}", '\uD835\uDD14'], ["\\\\mathfrak\\{P\\}", '\uD835\uDD13'], ["\\\\mathfrak\\{O\\}", '\uD835\uDD12'], ["\\\\mathfrak\\{N\\}", '\uD835\uDD11'], ["\\\\mathfrak\\{M\\}", '\uD835\uDD10'], ["\\\\mathfrak\\{L\\}", '\uD835\uDD0F'], ["\\\\mathfrak\\{K\\}", '\uD835\uDD0E'], ["\\\\mathfrak\\{J\\}", '\uD835\uDD0D'], ["\\\\mathfrak\\{G\\}", '\uD835\uDD0A'], ["\\\\mathfrak\\{F\\}", '\uD835\uDD09'], ["\\\\mathfrak\\{E\\}", '\uD835\uDD08'], ["\\\\mathfrak\\{D\\}", '\uD835\uDD07'], ["\\\\mathfrak\\{B\\}", '\uD835\uDD05'], ["\\\\mathfrak\\{A\\}", '\uD835\uDD04'], ["\\\\mathsfsl\\{F\\}", '\uD835\uDE0D'], ["\\\\mathslbb\\{G\\}", '\uD835\uDD72'], ["\\\\mathslbb\\{H\\}", '\uD835\uDD73'], ["\\\\topsemicircle", '\u25E0'], ["\\\\botsemicircle", '\u25E1'], ["\\\\mathslbb\\{I\\}", '\uD835\uDD74'], ["\\\\squareulblack", '\u25E9'], ["\\\\mathsfbf\\{x\\}", '\uD835\uDE05'], ["\\\\mathsfbf\\{T\\}", '\uD835\uDDE7'], ["\\\\leftarrowtail", '\u21A2'], ["\\\\mathsfbf\\{w\\}", '\uD835\uDE04'], ["\\\\mathsfbf\\{v\\}", '\uD835\uDE03'], ["\\\\leftouterjoin", '\u27D5'], ["\\\\fullouterjoin", '\u27D7'], ["\\\\mathsfbf\\{u\\}", '\uD835\uDE02'], ["\\\\circledbullet", '\u29BF'], ["\\\\mathsfbf\\{U\\}", '\uD835\uDDE8'], ["\\\\LeftTeeVector", '\u295A'], ["\\\\mathsfbf\\{V\\}", '\uD835\uDDE9'], ["\\\\mathsfbf\\{W\\}", '\uD835\uDDEA'], ["\\\\mathsfbf\\{X\\}", '\uD835\uDDEB'], ["\\\\circledbslash", '\u29B8'], ["\\\\mathsfbf\\{Y\\}", '\uD835\uDDEC'], ["\\\\emptysetoarrl", '\u29B4'], ["\\\\emptysetocirc", '\u29B2'], ["\\\\mathsfbf\\{t\\}", '\uD835\uDE01'], ["\\\\mathsfbf\\{h\\}", '\uD835\uDDF5'], ["\\\\mathsfbf\\{i\\}", '\uD835\uDDF6'], ["\\\\mathsfbf\\{j\\}", '\uD835\uDDF7'], ["\\\\mathsfbf\\{s\\}", '\uD835\uDE00'], ["\\\\wideangledown", '\u29A6'], ["\\\\mathsfbf\\{r\\}", '\uD835\uDDFF'], ["\\\\mathsfbf\\{q\\}", '\uD835\uDDFE'], ["\\\\mathsfbf\\{Z\\}", '\uD835\uDDED'], ["\\\\mathsfbf\\{p\\}", '\uD835\uDDFD'], ["\\\\mathsfbf\\{a\\}", '\uD835\uDDEE'], ["\\\\mathsfbf\\{k\\}", '\uD835\uDDF8'], ["\\\\longleftarrow", '\u27F5'], ["\\\\mathsfsl\\{z\\}", '\uD835\uDE3B'], ["\\\\mathsfsl\\{y\\}", '\uD835\uDE3A'], ["\\\\mathsfsl\\{x\\}", '\uD835\uDE39'], ["\\\\mathsfsl\\{w\\}", '\uD835\uDE38'], ["\\\\mathsfsl\\{v\\}", '\uD835\uDE37'], ["\\\\mathsfsl\\{u\\}", '\uD835\uDE36'], ["\\\\mathsfsl\\{t\\}", '\uD835\uDE35'], ["\\\\mathsfsl\\{s\\}", '\uD835\uDE34'], ["\\\\mathsfsl\\{r\\}", '\uD835\uDE33'], ["\\\\mathsfsl\\{q\\}", '\uD835\uDE32'], ["\\\\mathsfsl\\{p\\}", '\uD835\uDE31'], ["\\\\mathsfsl\\{o\\}", '\uD835\uDE30'], ["\\\\mathsfsl\\{n\\}", '\uD835\uDE2F'], ["\\\\mathsfsl\\{m\\}", '\uD835\uDE2E'], ["\\\\mathsfsl\\{l\\}", '\uD835\uDE2D'], ["\\\\mathsfsl\\{k\\}", '\uD835\uDE2C'], ["\\\\mathsfsl\\{j\\}", '\uD835\uDE2B'], ["\\\\mathsfsl\\{i\\}", '\uD835\uDE2A'], ["\\\\mathsfsl\\{h\\}", '\uD835\uDE29'], ["\\\\mathsfsl\\{g\\}", '\uD835\uDE28'], ["\\\\ntriangleleft", '\u22EA'], ["\\\\backslash|\\\\textbackslash", '\\'], ["\\\\varlrtriangle", '\u22BF'], ["\\\\rightpentagon", '\u2B54'], ["\\\\mathsfsl\\{f\\}", '\uD835\uDE27'], ["\\\\mathfrak\\{R\\}", '\u211C'], ["\\\\mathsfsl\\{e\\}", '\uD835\uDE26'], ["\\\\mdsmwhtsquare", '\u25FD'], ["\\\\mdsmblksquare", '\u25FE'], ["\\\\rightarrowgtr", '\u2B43'], ["\\\\mathsfbf\\{o\\}", '\uD835\uDDFC'], ["\\\\threeunderdot", '\u20E8'], ["\\\\blocklefthalf", '\u258C'], ["\\\\texttrademark", '\u2122'], ["\\\\Longleftarrow", '\u27F8'], ["\\\\mathsfbf\\{n\\}", '\uD835\uDDFB'], ["\\\\enclosesquare", '\u20DE'], ["\\\\mathslbb\\{J\\}", '\uD835\uDD75'], ["\\\\mathslbb\\{K\\}", '\uD835\uDD76'], ["\\\\enclosecircle", '\u20DD'], ["\\\\mathsfbf\\{m\\}", '\uD835\uDDFA'], ["\\\\mathslbb\\{L\\}", '\uD835\uDD77'], ["\\\\mathsfsl\\{d\\}", '\uD835\uDE25'], ["\\\\mathsfsl\\{c\\}", '\uD835\uDE24'], ["\\\\mathsfsl\\{b\\}", '\uD835\uDE23'], ["\\\\mathsfsl\\{a\\}", '\uD835\uDE22'], ["\\\\mathsfsl\\{Z\\}", '\uD835\uDE21'], ["\\\\pentagonblack", '\u2B1F'], ["\\\\vysmwhtsquare", '\u2B1E'], ["\\\\vysmblksquare", '\u2B1D'], ["\\\\mathslbb\\{M\\}", '\uD835\uDD78'], ["\\\\mathslbb\\{N\\}", '\uD835\uDD79'], ["\\\\squarellblack", '\u2B15'], ["\\\\squareurblack", '\u2B14'], ["\\\\bigtalloblong", '\u2AFF'], ["\\\\mathscr\\{c\\}", '\uD835\uDCB8'], ["\\\\'\\$\\\\alpha\\$", '\u03AC'], ["\\\\mathbit\\{q\\}", '\uD835\uDC92'], ["\\\\mathbit\\{r\\}", '\uD835\uDC93'], ["\\\\mathbit\\{s\\}", '\uD835\uDC94'], ["\\\\surfintegral", '\u222F'], ["\\\\mathbit\\{t\\}", '\uD835\uDC95'], ["\\\\trianglecdot", '\u25EC'], ["\\\\mathbit\\{u\\}", '\uD835\uDC96'], ["\\\\mathbit\\{v\\}", '\uD835\uDC97'], ["\\\\mathbit\\{w\\}", '\uD835\uDC98'], ["\\\\lessequivlnt", '\u2272'], ["\\\\mathscr\\{g\\}", '\u210A'], ["\\\\mathscr\\{d\\}", '\uD835\uDCB9'], ["\\\\longdivision", '\u27CC'], ["\\\\eqqslantless", '\u2A9B'], ["\\\\mathscr\\{H\\}", '\u210B'], ["\\\\mathbit\\{x\\}", '\uD835\uDC99'], ['\\\\upwhitearrow', '\u21E7'], ["\\\\mathbit\\{y\\}", '\uD835\uDC9A'], ["\\\\mathbit\\{z\\}", '\uD835\uDC9B'], ["\\\\mathscr\\{A\\}", '\uD835\uDC9C'], ["\\\\dottedcircle", '\u25CC'], ["\\\\mathmit\\{D\\}", '\uD835\uDCD3'], ["\\\\odotslashdot", '\u29BC'], ["\\\\cupleftarrow", '\u228C'], ["\\\\mathscr\\{I\\}", '\u2110'], ["\\\\notbackslash", '\u2340'], ["\\\\textvartheta", '\u03D1'], ["\\\\LeftArrowBar", '\u21E4'], ["\\\\mathmit\\{I\\}", '\uD835\uDCD8'], ["\\\\lozengeminus", '\u27E0'], ["\\\\mathscr\\{C\\}", '\uD835\uDC9E'], ["\\\\emptysetoarr", '\u29B3'], ["\\\\mathscr\\{f\\}", '\uD835\uDCBB'], ["\\\\emptysetobar", '\u29B1'], ["\\\\mathscr\\{D\\}", '\uD835\uDC9F'], ["\\\\mathbit\\{A\\}", '\uD835\uDC68'], ["\\\\fdiagovrdiag", '\u292C'], ["\\\\mathscr\\{h\\}", '\uD835\uDCBD'], ["\\\\verymuchless", '\u22D8'], ["\\\\mathbit\\{B\\}", '\uD835\uDC69'], ["\\\\mathbit\\{C\\}", '\uD835\uDC6A'], ["\\\\mathscr\\{G\\}", '\uD835\uDCA2'], ['\\\\upupharpoons', '\u2963'], ["\\\\nvRightarrow", '\u2903'], ["\\\\mathscr\\{J\\}", '\uD835\uDCA5'], ["\\\\revangleubar", '\u29A5'], ["\\\\mathscr\\{K\\}", '\uD835\uDCA6'], ["\\\\mathbit\\{D\\}", '\uD835\uDC6B'], ["\\\\mathmit\\{H\\}", '\uD835\uDCD7'], ["\\\\mathmit\\{G\\}", '\uD835\uDCD6'], ["\\\\mathscr\\{N\\}", '\uD835\uDCA9'], ["\\\\mathscr\\{i\\}", '\uD835\uDCBE'], ["\\\\mathmit\\{F\\}", '\uD835\uDCD5'], ["\\\\mathbit\\{E\\}", '\uD835\uDC6C'], ["\\\\mathbit\\{F\\}", '\uD835\uDC6D'], ["\\\\mathbit\\{G\\}", '\uD835\uDC6E'], ["\\\\mathmit\\{z\\}", '\uD835\uDD03'], ["\\\\mathbit\\{H\\}", '\uD835\uDC6F'], ["\\\\PropertyLine", '\u214A'], ["\\\\mathscr\\{j\\}", '\uD835\uDCBF'], ["\\\\mathscr\\{O\\}", '\uD835\uDCAA'], ["\\\\mathmit\\{y\\}", '\uD835\uDD02'], ["\\\\DownArrowBar", '\u2913'], ["\\\\mathscr\\{k\\}", '\uD835\uDCC0'], ["\\\\mathscr\\{m\\}", '\uD835\uDCC2'], ["\\\\mathscr\\{n\\}", '\uD835\uDCC3'], ["\\\\mathmit\\{x\\}", '\uD835\uDD01'], ["\\\\mathscr\\{P\\}", '\uD835\uDCAB'], ["\\\\mathmit\\{w\\}", '\uD835\uDD00'], ["\\\\mathmit\\{v\\}", '\uD835\uDCFF'], ["\\\\mathscr\\{Q\\}", '\uD835\uDCAC'], ["\\\\mathmit\\{u\\}", '\uD835\uDCFE'], ["\\\\mathmit\\{t\\}", '\uD835\uDCFD'], ["\\\\mathscr\\{p\\}", '\uD835\uDCC5'], ["\\\\mathscr\\{q\\}", '\uD835\uDCC6'], ["\\\\mathscr\\{r\\}", '\uD835\uDCC7'], ["\\\\mathscr\\{S\\}", '\uD835\uDCAE'], ["\\\\mathmit\\{s\\}", '\uD835\uDCFC'], ["\\\\mathmit\\{r\\}", '\uD835\uDCFB'], ["\\\\mathmit\\{q\\}", '\uD835\uDCFA'], ["\\\\squareulquad", '\u25F0'], ["\\\\mathbit\\{I\\}", '\uD835\uDC70'], ["\\\\squarellquad", '\u25F1'], ["\\\\risingdotseq", '\u2253'], ["\\\\squarelrquad", '\u25F2'], ["\\\\squareurquad", '\u25F3'], ["\\\\mathmit\\{p\\}", '\uD835\uDCF9'], ["\\\\circleulquad", '\u25F4'], ["\\\\circledequal", '\u229C'], ["\\\\medblackstar", '\u2B51'], ["\\\\medwhitestar", '\u2B50'], ["\\\\circlellquad", '\u25F5'], ["\\\\circlelrquad", '\u25F6'], ["\\\\mathbit\\{J\\}", '\uD835\uDC71'], ["\\\\circleurquad", '\u25F7'], ["\\\\squarehvfill", '\u25A6'], ["\\\\rightdbltail", '\u291C'], ["\\\\mathscr\\{s\\}", '\uD835\uDCC8'], ["\\\\mathmit\\{o\\}", '\uD835\uDCF8'], ["\\\\mathscr\\{t\\}", '\uD835\uDCC9'], ["\\\\doublebarvee", '\u2A62'], ["\\\\mathbit\\{K\\}", '\uD835\uDC72'], ["\\\\mathbit\\{L\\}", '\uD835\uDC73'], ["\\\\mathbit\\{M\\}", '\uD835\uDC74'], ["\\\\errbarcircle", '\u29F2'], ["\\\\mathscr\\{T\\}", '\uD835\uDCAF'], ["\\\\mathmit\\{n\\}", '\uD835\uDCF7'], ["\\\\blocklowhalf", '\u2584'], ["\\\\mathmit\\{m\\}", '\uD835\uDCF6'], ["\\\\mathmit\\{E\\}", '\uD835\uDCD4'], ["\\\\mathbit\\{N\\}", '\uD835\uDC75'], ["\\\\leftdotarrow", '\u2B38'], ["\\\\mathbit\\{O\\}", '\uD835\uDC76'], ["\\\\mathmit\\{l\\}", '\uD835\uDCF5'], ["\\\\wedgemidvert", '\u2A5A'], ["\\\\errbarsquare", '\u29EE'], ["\\\\mathscr\\{U\\}", '\uD835\uDCB0'], ["\\\\bigslopedvee", '\u2A57'], ["\\\\mathmit\\{k\\}", '\uD835\uDCF4'], ["\\\\mathmit\\{j\\}", '\uD835\uDCF3'], ["\\\\blacklozenge", '\u29EB'], ["\\\\mathmit\\{i\\}", '\uD835\uDCF2'], ["\\\\mathscr\\{V\\}", '\uD835\uDCB1'], ["\\\\mathmit\\{h\\}", '\uD835\uDCF1'], ["\\\\smwhtlozenge", '\u2B2B'], ["\\\\smblklozenge", '\u2B2A'], ["\\\\smblkdiamond", '\u2B29'], ["\\\\mdwhtlozenge", '\u2B28'], ["\\\\mdblklozenge", '\u2B27'], ["\\\\mdwhtdiamond", '\u2B26'], ["\\\\mdblkdiamond", '\u2B25'], ["\\\\mathmit\\{g\\}", '\uD835\uDCF0'], ["\\\\hexagonblack", '\u2B23'], ["\\\\rbrackurtick", '\u2990'], ["\\\\mathbit\\{P\\}", '\uD835\uDC77'], ["\\\\mathbit\\{Q\\}", '\uD835\uDC78'], ["\\\\mathscr\\{W\\}", '\uD835\uDCB2'], ["\\\\mathmit\\{f\\}", '\uD835\uDCEF'], ["\\\\closedvarcap", '\u2A4D'], ["\\\\dottedsquare", '\u2B1A'], ["\\\\lbracklltick", '\u298F'], ["\\\\rbracklrtick", '\u298E'], ["\\\\closedvarcup", '\u2A4C'], ["\\\\mathmit\\{e\\}", '\uD835\uDCEE'], ["\\\\downfishtail", '\u297F'], ["\\\\mathmit\\{d\\}", '\uD835\uDCED'], ["\\\\mathbit\\{R\\}", '\uD835\uDC79'], ["\\\\mathbit\\{S\\}", '\uD835\uDC7A'], ["\\\\mathmit\\{c\\}", '\uD835\uDCEC'], ["\\\\lbrackultick", '\u298D'], ["\\\\mathmit\\{b\\}", '\uD835\uDCEB'], ["\\\\mathscr\\{X\\}", '\uD835\uDCB3'], ["\\\\mathbit\\{T\\}", '\uD835\uDC7B'], ["\\\\mathmit\\{a\\}", '\uD835\uDCEA'], ["\\\\lrtriangleeq", '\u29E1'], ["\\\\mathbit\\{U\\}", '\uD835\uDC7C'], ["\\\\textsterling", '\xA3'], ["\\\\textcurrency", '\xA4'], ["\\\\mathscr\\{Y\\}", '\uD835\uDCB4'], ["\\\\mathbit\\{V\\}", '\uD835\uDC7D'], ["\\\\mathscr\\{Z\\}", '\uD835\uDCB5'], ["\\\\hyphenbullet", '\u2043'], ["\\\\mathmit\\{Z\\}", '\uD835\uDCE9'], ["\\\\longmapsfrom", '\u27FB'], ["\\\\multimapboth", '\u29DF'], ["\\\\mathbit\\{W\\}", '\uD835\uDC7E'], ["\\\\mathbit\\{X\\}", '\uD835\uDC7F'], ["\\\\mathbit\\{Y\\}", '\uD835\uDC80'], ["\\\\mathbit\\{Z\\}", '\uD835\uDC81'], ["\\\\mathbit\\{a\\}", '\uD835\uDC82'], ["\\\\mathbit\\{b\\}", '\uD835\uDC83'], ["\\\\mathmit\\{Y\\}", '\uD835\uDCE8'], ["\\\\mathmit\\{X\\}", '\uD835\uDCE7'], ["\\\\mathbit\\{c\\}", '\uD835\uDC84'], ["\\\\mathbit\\{d\\}", '\uD835\uDC85'], ["\\\\mathmit\\{W\\}", '\uD835\uDCE6'], ["\\\\mathmit\\{V\\}", '\uD835\uDCE5'], ["\\\\mathmit\\{U\\}", '\uD835\uDCE4'], ["\\\\RoundImplies", '\u2970'], ["\\\\triangleplus", '\u2A39'], ["\\\\rdiagovfdiag", '\u292B'], ["\\\\mathscr\\{a\\}", '\uD835\uDCB6'], ["\\\\mathscr\\{u\\}", '\uD835\uDCCA'], ["\\\\mathscr\\{B\\}", '\u212C'], ["\\\\mathmit\\{T\\}", '\uD835\uDCE3'], ["\\\\mathscr\\{b\\}", '\uD835\uDCB7'], ["\\\\mathmit\\{S\\}", '\uD835\uDCE2'], ["\\\\mathscr\\{e\\}", '\u212F'], ["\\\\mathbit\\{e\\}", '\uD835\uDC86'], ["\\\\mathmit\\{R\\}", '\uD835\uDCE1'], ["\\\\mathscr\\{v\\}", '\uD835\uDCCB'], ["\\\\mathscr\\{w\\}", '\uD835\uDCCC'], ["\\\\mathbit\\{f\\}", '\uD835\uDC87'], ["\\\\mathbit\\{g\\}", '\uD835\uDC88'], ["\\\\mathscr\\{x\\}", '\uD835\uDCCD'], ["\\\\texttildelow", '\u02DC'], ["\\\\mathbit\\{h\\}", '\uD835\uDC89'], ["\\\\varspadesuit", '\u2664'], ["\\\\mathscr\\{y\\}", '\uD835\uDCCE'], ["\\\\mathbit\\{i\\}", '\uD835\uDC8A'], ["\\\\mathmit\\{Q\\}", '\uD835\uDCE0'], ["\\\\supsetapprox", '\u2ACA'], ["\\\\subsetapprox", '\u2AC9'], ["\\\\rightbkarrow", '\u290D'], ["\\\\mathbit\\{j\\}", '\uD835\uDC8B'], ["\\\\mathmit\\{P\\}", '\uD835\uDCDF'], ["\\\\mathscr\\{R\\}", '\u211B'], ["\\\\mathmit\\{O\\}", '\uD835\uDCDE'], ["\\\\mathscr\\{z\\}", '\uD835\uDCCF'], ["\\\\oturnedcomma", '\u0312'], ["\\\\mathbit\\{k\\}", '\uD835\uDC8C'], ["\\\\mathbit\\{l\\}", '\uD835\uDC8D'], ["\\\\Longmapsfrom", '\u27FD'], ["\\\\mathmit\\{N\\}", '\uD835\uDCDD'], ["\\\\mathmit\\{A\\}", '\uD835\uDCD0'], ["\\\\mathmit\\{M\\}", '\uD835\uDCDC'], ["\\\\triangledown", '\u25BF'], ["\\\\triangleleft", '\u25C3'], ["\\\\mathmit\\{L\\}", '\uD835\uDCDB'], ["\\\\mathmit\\{B\\}", '\uD835\uDCD1'], ["\\\\mathscr\\{l\\}", '\u2113'], ["\\\\leftdbkarrow", '\u290E'], ["\\\\mathbit\\{m\\}", '\uD835\uDC8E'], ["\\\\mathbit\\{n\\}", '\uD835\uDC8F'], ["\\\\mathbit\\{o\\}", '\uD835\uDC90'], ["\\\\mathmit\\{K\\}", '\uD835\uDCDA'], ["\\\\mathscr\\{L\\}", '\u2112'], ["\\\\mathmit\\{C\\}", '\uD835\uDCD2'], ["\\\\mathmit\\{J\\}", '\uD835\uDCD9'], ["\\\\mathscr\\{E\\}", '\u2130'], ["\\\\mathrm\\{'Y\\}", '\u038E'], ["\\\\mathscr\\{F\\}", '\u2131'], ["\\\\mathscr\\{M\\}", '\u2133'], ['\\\\underbracket', '\u23B5'], ["\\\\mathscr\\{o\\}", '\u2134'], ["\\\\mathbit\\{p\\}", '\uD835\uDC91'], ["\\\\nHdownarrow", '\u21DF'], ["\\\\forcesextra", '\u22A8'], ['\\\\updasharrow', '\u21E1'], ["\\\\circleddash", '\u229D'], ["\\\\circledcirc", '\u229A'], ["\\\\nvleftarrow", '\u21F7'], ["\\\\nVleftarrow", '\u21FA'], ["\\\\not\\\\supset", '\u2285'], ["\\\\not\\\\subset", '\u2284'], ["\\\\succcurlyeq", '\u227D'], ["\\\\preccurlyeq", '\u227C'], ["\\\\int\\\\!\\\\int", '\u222C'], ["\\\\volintegral", '\u2230'], ["\\\\clwintegral", '\u2231'], ["\\\\not\\\\approx", '\u2249'], ["\\\\mathtt\\{z\\}", '\uD835\uDEA3'], ["\\\\mathtt\\{y\\}", '\uD835\uDEA2'], ["\\\\mathtt\\{x\\}", '\uD835\uDEA1'], ["\\\\mathtt\\{w\\}", '\uD835\uDEA0'], ["\\\\mathtt\\{v\\}", '\uD835\uDE9F'], ["\\\\mathtt\\{u\\}", '\uD835\uDE9E'], ["\\\\mathtt\\{t\\}", '\uD835\uDE9D'], ["\\\\mathtt\\{s\\}", '\uD835\uDE9C'], ["\\\\mathtt\\{r\\}", '\uD835\uDE9B'], ["\\\\mathtt\\{q\\}", '\uD835\uDE9A'], ["\\\\mathtt\\{p\\}", '\uD835\uDE99'], ["\\\\mathtt\\{o\\}", '\uD835\uDE98'], ["\\\\mathtt\\{n\\}", '\uD835\uDE97'], ["\\\\mathtt\\{m\\}", '\uD835\uDE96'], ["\\\\mathtt\\{l\\}", '\uD835\uDE95'], ["\\\\mathtt\\{k\\}", '\uD835\uDE94'], ["\\\\mathtt\\{j\\}", '\uD835\uDE93'], ["\\\\mathtt\\{i\\}", '\uD835\uDE92'], ["\\\\mathtt\\{h\\}", '\uD835\uDE91'], ["\\\\mathtt\\{g\\}", '\uD835\uDE90'], ["\\\\mathtt\\{f\\}", '\uD835\uDE8F'], ["\\\\mathtt\\{e\\}", '\uD835\uDE8E'], ["\\\\mathtt\\{d\\}", '\uD835\uDE8D'], ["\\\\mathtt\\{c\\}", '\uD835\uDE8C'], ["\\\\mathtt\\{b\\}", '\uD835\uDE8B'], ["\\\\mathtt\\{a\\}", '\uD835\uDE8A'], ["\\\\mathtt\\{Z\\}", '\uD835\uDE89'], ["\\\\mathtt\\{Y\\}", '\uD835\uDE88'], ["\\\\mathtt\\{X\\}", '\uD835\uDE87'], ["\\\\mathtt\\{W\\}", '\uD835\uDE86'], ["\\\\mathtt\\{V\\}", '\uD835\uDE85'], ["\\\\mathtt\\{U\\}", '\uD835\uDE84'], ["\\\\mathtt\\{T\\}", '\uD835\uDE83'], ["\\\\mathtt\\{S\\}", '\uD835\uDE82'], ["\\\\mathtt\\{R\\}", '\uD835\uDE81'], ["\\\\mathtt\\{Q\\}", '\uD835\uDE80'], ["\\\\mathtt\\{P\\}", '\uD835\uDE7F'], ["\\\\mathtt\\{O\\}", '\uD835\uDE7E'], ["\\\\mathtt\\{N\\}", '\uD835\uDE7D'], ["\\\\mathtt\\{M\\}", '\uD835\uDE7C'], ["\\\\mathtt\\{L\\}", '\uD835\uDE7B'], ["\\\\mathtt\\{K\\}", '\uD835\uDE7A'], ["\\\\mathtt\\{J\\}", '\uD835\uDE79'], ["\\\\mathtt\\{I\\}", '\uD835\uDE78'], ["\\\\mathtt\\{H\\}", '\uD835\uDE77'], ["\\\\mathtt\\{G\\}", '\uD835\uDE76'], ["\\\\mathtt\\{F\\}", '\uD835\uDE75'], ["\\\\mathtt\\{E\\}", '\uD835\uDE74'], ["\\\\mathtt\\{D\\}", '\uD835\uDE73'], ["\\\\mathtt\\{C\\}", '\uD835\uDE72'], ["\\\\mathtt\\{B\\}", '\uD835\uDE71'], ["\\\\mathtt\\{A\\}", '\uD835\uDE70'], ["\\\\mathsf\\{z\\}", '\uD835\uDDD3'], ["\\\\mathsf\\{y\\}", '\uD835\uDDD2'], ["\\\\mathsf\\{x\\}", '\uD835\uDDD1'], ["\\\\mathsf\\{w\\}", '\uD835\uDDD0'], ["\\\\mathsf\\{v\\}", '\uD835\uDDCF'], ["\\\\mathsf\\{u\\}", '\uD835\uDDCE'], ["\\\\mathsf\\{t\\}", '\uD835\uDDCD'], ["\\\\mathsf\\{s\\}", '\uD835\uDDCC'], ["\\\\mathsf\\{r\\}", '\uD835\uDDCB'], ["\\\\mathsf\\{q\\}", '\uD835\uDDCA'], ["\\\\mathsf\\{p\\}", '\uD835\uDDC9'], ["\\\\mathsf\\{o\\}", '\uD835\uDDC8'], ["\\\\mathsf\\{n\\}", '\uD835\uDDC7'], ["\\\\mathsf\\{m\\}", '\uD835\uDDC6'], ["\\\\mathsf\\{l\\}", '\uD835\uDDC5'], ["\\\\mathsf\\{k\\}", '\uD835\uDDC4'], ["\\\\mathsf\\{j\\}", '\uD835\uDDC3'], ["\\\\mathsf\\{i\\}", '\uD835\uDDC2'], ["\\\\mathsf\\{h\\}", '\uD835\uDDC1'], ["\\\\mathsf\\{g\\}", '\uD835\uDDC0'], ["\\\\mathsf\\{f\\}", '\uD835\uDDBF'], ["\\\\mathsf\\{e\\}", '\uD835\uDDBE'], ["\\\\mathsf\\{d\\}", '\uD835\uDDBD'], ["\\\\mathsf\\{c\\}", '\uD835\uDDBC'], ["\\\\mathsf\\{b\\}", '\uD835\uDDBB'], ["\\\\mathsf\\{a\\}", '\uD835\uDDBA'], ["\\\\mathsf\\{Z\\}", '\uD835\uDDB9'], ["\\\\mathsf\\{Y\\}", '\uD835\uDDB8'], ["\\\\mathsf\\{X\\}", '\uD835\uDDB7'], ["\\\\mathsf\\{W\\}", '\uD835\uDDB6'], ["\\\\mathsf\\{V\\}", '\uD835\uDDB5'], ["\\\\mathsf\\{U\\}", '\uD835\uDDB4'], ["\\\\mathsf\\{T\\}", '\uD835\uDDB3'], ["\\\\mathsf\\{S\\}", '\uD835\uDDB2'], ["\\\\mathsf\\{R\\}", '\uD835\uDDB1'], ["\\\\mathsf\\{Q\\}", '\uD835\uDDB0'], ["\\\\mathsf\\{P\\}", '\uD835\uDDAF'], ["\\\\mathsf\\{O\\}", '\uD835\uDDAE'], ["\\\\mathsf\\{N\\}", '\uD835\uDDAD'], ["\\\\mathsf\\{M\\}", '\uD835\uDDAC'], ["\\\\mathsf\\{L\\}", '\uD835\uDDAB'], ["\\\\mathsf\\{K\\}", '\uD835\uDDAA'], ["\\\\mathsf\\{J\\}", '\uD835\uDDA9'], ["\\\\mathsf\\{I\\}", '\uD835\uDDA8'], ["\\\\mathsf\\{H\\}", '\uD835\uDDA7'], ["\\\\mathsf\\{G\\}", '\uD835\uDDA6'], ["\\\\mathsf\\{F\\}", '\uD835\uDDA5'], ["\\\\mathsf\\{E\\}", '\uD835\uDDA4'], ["\\\\mathsf\\{D\\}", '\uD835\uDDA3'], ["\\\\mathsf\\{C\\}", '\uD835\uDDA2'], ["\\\\mathsf\\{B\\}", '\uD835\uDDA1'], ["\\\\mathsf\\{A\\}", '\uD835\uDDA0'], ["\\\\mathbb\\{z\\}", '\uD835\uDD6B'], ["\\\\mathbb\\{y\\}", '\uD835\uDD6A'], ["\\\\mathbb\\{x\\}", '\uD835\uDD69'], ["\\\\mathbb\\{w\\}", '\uD835\uDD68'], ["\\\\mathbb\\{v\\}", '\uD835\uDD67'], ["\\\\mathbb\\{u\\}", '\uD835\uDD66'], ["\\\\mathbb\\{t\\}", '\uD835\uDD65'], ["\\\\mathbb\\{s\\}", '\uD835\uDD64'], ["\\\\mathbb\\{r\\}", '\uD835\uDD63'], ["\\\\mathbb\\{q\\}", '\uD835\uDD62'], ["\\\\mathbb\\{p\\}", '\uD835\uDD61'], ["\\\\mathbb\\{o\\}", '\uD835\uDD60'], ["\\\\mathbb\\{n\\}", '\uD835\uDD5F'], ["\\\\mathbb\\{m\\}", '\uD835\uDD5E'], ["\\\\mathbb\\{l\\}", '\uD835\uDD5D'], ["\\\\mathbb\\{k\\}", '\uD835\uDD5C'], ["\\\\mathbb\\{j\\}", '\uD835\uDD5B'], ["\\\\mathbb\\{i\\}", '\uD835\uDD5A'], ["\\\\mathbb\\{h\\}", '\uD835\uDD59'], ["\\\\mathbb\\{g\\}", '\uD835\uDD58'], ["\\\\mathbb\\{f\\}", '\uD835\uDD57'], ["\\\\mathbb\\{e\\}", '\uD835\uDD56'], ["\\\\mathbb\\{d\\}", '\uD835\uDD55'], ["\\\\mathbb\\{c\\}", '\uD835\uDD54'], ["\\\\mathbb\\{b\\}", '\uD835\uDD53'], ["\\\\mathbb\\{a\\}", '\uD835\uDD52'], ["\\\\mathbb\\{Y\\}", '\uD835\uDD50'], ["\\\\mathbb\\{X\\}", '\uD835\uDD4F'], ["\\\\mathbb\\{W\\}", '\uD835\uDD4E'], ["\\\\mathbb\\{V\\}", '\uD835\uDD4D'], ["\\\\mathbb\\{U\\}", '\uD835\uDD4C'], ["\\\\mathbb\\{T\\}", '\uD835\uDD4B'], ["\\\\mathbb\\{S\\}", '\uD835\uDD4A'], ["\\\\mathbb\\{O\\}", '\uD835\uDD46'], ["\\\\mathbb\\{M\\}", '\uD835\uDD44'], ["\\\\mathbb\\{L\\}", '\uD835\uDD43'], ["\\\\mathbb\\{K\\}", '\uD835\uDD42'], ["\\\\mathbb\\{J\\}", '\uD835\uDD41'], ["\\\\mathbb\\{I\\}", '\uD835\uDD40'], ["\\\\mathbb\\{G\\}", '\uD835\uDD3E'], ["\\\\mathbb\\{F\\}", '\uD835\uDD3D'], ["\\\\mathbb\\{E\\}", '\uD835\uDD3C'], ["\\\\mathbb\\{D\\}", '\uD835\uDD3B'], ["\\\\mathbb\\{B\\}", '\uD835\uDD39'], ["\\\\mathbb\\{A\\}", '\uD835\uDD38'], ["\\\\mathsl\\{z\\}", '\uD835\uDC67'], ["\\\\mathsl\\{y\\}", '\uD835\uDC66'], ["\\\\mathsl\\{x\\}", '\uD835\uDC65'], ["\\\\mathsl\\{w\\}", '\uD835\uDC64'], ["\\\\mathsl\\{v\\}", '\uD835\uDC63'], ["\\\\mathsl\\{u\\}", '\uD835\uDC62'], ["\\\\mathsl\\{t\\}", '\uD835\uDC61'], ["\\\\mathsl\\{s\\}", '\uD835\uDC60'], ["\\\\mathsl\\{r\\}", '\uD835\uDC5F'], ["\\\\mathsl\\{q\\}", '\uD835\uDC5E'], ["\\\\mathsl\\{p\\}", '\uD835\uDC5D'], ["\\\\mathsl\\{o\\}", '\uD835\uDC5C'], ["\\\\mathsl\\{n\\}", '\uD835\uDC5B'], ["\\\\mathsl\\{m\\}", '\uD835\uDC5A'], ["\\\\mathsl\\{l\\}", '\uD835\uDC59'], ["\\\\mathsl\\{k\\}", '\uD835\uDC58'], ["\\\\mathsl\\{j\\}", '\uD835\uDC57'], ["\\\\mathsl\\{i\\}", '\uD835\uDC56'], ["\\\\mathsl\\{g\\}", '\uD835\uDC54'], ["\\\\mathsl\\{f\\}", '\uD835\uDC53'], ["\\\\mathsl\\{e\\}", '\uD835\uDC52'], ["\\\\mathsl\\{d\\}", '\uD835\uDC51'], ["\\\\mathsl\\{c\\}", '\uD835\uDC50'], ["\\\\mathsl\\{b\\}", '\uD835\uDC4F'], ["\\\\mathsl\\{a\\}", '\uD835\uDC4E'], ["\\\\mathsl\\{Z\\}", '\uD835\uDC4D'], ["\\\\mathsl\\{Y\\}", '\uD835\uDC4C'], ["\\\\mathsl\\{X\\}", '\uD835\uDC4B'], ["\\\\mathsl\\{W\\}", '\uD835\uDC4A'], ["\\\\mathsl\\{V\\}", '\uD835\uDC49'], ["\\\\mathsl\\{U\\}", '\uD835\uDC48'], ["\\\\mathsl\\{T\\}", '\uD835\uDC47'], ["\\\\mathsl\\{S\\}", '\uD835\uDC46'], ["\\\\mathsl\\{R\\}", '\uD835\uDC45'], ["\\\\mathsl\\{Q\\}", '\uD835\uDC44'], ["\\\\mathsl\\{P\\}", '\uD835\uDC43'], ["\\\\mathsl\\{O\\}", '\uD835\uDC42'], ["\\\\mathsl\\{N\\}", '\uD835\uDC41'], ["\\\\mathsl\\{M\\}", '\uD835\uDC40'], ["\\\\mathsl\\{L\\}", '\uD835\uDC3F'], ["\\\\mathsl\\{K\\}", '\uD835\uDC3E'], ["\\\\mathsl\\{J\\}", '\uD835\uDC3D'], ["\\\\mathsl\\{I\\}", '\uD835\uDC3C'], ["\\\\mathsl\\{H\\}", '\uD835\uDC3B'], ["\\\\mathsl\\{G\\}", '\uD835\uDC3A'], ["\\\\mathsl\\{F\\}", '\uD835\uDC39'], ["\\\\mathsl\\{E\\}", '\uD835\uDC38'], ["\\\\mathsl\\{D\\}", '\uD835\uDC37'], ["\\\\mathsl\\{C\\}", '\uD835\uDC36'], ["\\\\mathsl\\{B\\}", '\uD835\uDC35'], ["\\\\mathsl\\{A\\}", '\uD835\uDC34'], ["\\\\mathbf\\{z\\}", '\uD835\uDC33'], ["\\\\mathbf\\{y\\}", '\uD835\uDC32'], ["\\\\mathbf\\{x\\}", '\uD835\uDC31'], ["\\\\mathbf\\{w\\}", '\uD835\uDC30'], ["\\\\mathbf\\{v\\}", '\uD835\uDC2F'], ["\\\\mathbf\\{u\\}", '\uD835\uDC2E'], ["\\\\mathbf\\{t\\}", '\uD835\uDC2D'], ["\\\\mathbf\\{s\\}", '\uD835\uDC2C'], ["\\\\mathbf\\{r\\}", '\uD835\uDC2B'], ["\\\\mathbf\\{q\\}", '\uD835\uDC2A'], ["\\\\mathbf\\{p\\}", '\uD835\uDC29'], ["\\\\mathbf\\{o\\}", '\uD835\uDC28'], ["\\\\mathbf\\{n\\}", '\uD835\uDC27'], ["\\\\mathbf\\{m\\}", '\uD835\uDC26'], ["\\\\mathbf\\{l\\}", '\uD835\uDC25'], ["\\\\mathbf\\{k\\}", '\uD835\uDC24'], ["\\\\mathbf\\{j\\}", '\uD835\uDC23'], ["\\\\mathbf\\{i\\}", '\uD835\uDC22'], ["\\\\mathbf\\{h\\}", '\uD835\uDC21'], ["\\\\mathbf\\{g\\}", '\uD835\uDC20'], ["\\\\mathbf\\{f\\}", '\uD835\uDC1F'], ["\\\\mathbf\\{e\\}", '\uD835\uDC1E'], ["\\\\mathbf\\{d\\}", '\uD835\uDC1D'], ["\\\\mathbf\\{c\\}", '\uD835\uDC1C'], ["\\\\mathbf\\{b\\}", '\uD835\uDC1B'], ["\\\\mathbf\\{a\\}", '\uD835\uDC1A'], ["\\\\mathbf\\{Z\\}", '\uD835\uDC19'], ["\\\\mathbf\\{Y\\}", '\uD835\uDC18'], ["\\\\mathbf\\{X\\}", '\uD835\uDC17'], ["\\\\mathbf\\{W\\}", '\uD835\uDC16'], ["\\\\mathbf\\{V\\}", '\uD835\uDC15'], ["\\\\mathbf\\{U\\}", '\uD835\uDC14'], ["\\\\mathbf\\{T\\}", '\uD835\uDC13'], ["\\\\mathbf\\{S\\}", '\uD835\uDC12'], ["\\\\mathbf\\{R\\}", '\uD835\uDC11'], ["\\\\mathbf\\{Q\\}", '\uD835\uDC10'], ["\\\\mathbf\\{P\\}", '\uD835\uDC0F'], ["\\\\mathbf\\{O\\}", '\uD835\uDC0E'], ["\\\\mathbf\\{N\\}", '\uD835\uDC0D'], ["\\\\mathbf\\{M\\}", '\uD835\uDC0C'], ["\\\\mathbf\\{L\\}", '\uD835\uDC0B'], ["\\\\mathbf\\{K\\}", '\uD835\uDC0A'], ["\\\\mathbf\\{J\\}", '\uD835\uDC09'], ["\\\\mathbf\\{I\\}", '\uD835\uDC08'], ["\\\\mathbf\\{H\\}", '\uD835\uDC07'], ["\\\\mathbf\\{G\\}", '\uD835\uDC06'], ["\\\\mathbf\\{F\\}", '\uD835\uDC05'], ["\\\\mathbf\\{E\\}", '\uD835\uDC04'], ["\\\\mathbf\\{D\\}", '\uD835\uDC03'], ["\\\\mathbf\\{C\\}", '\uD835\uDC02'], ["\\\\mathbf\\{B\\}", '\uD835\uDC01'], ["\\\\mathbf\\{A\\}", '\uD835\uDC00'], ["\\\\smwhitestar", '\u2B52'], ["\\\\RRightarrow", '\u2B46'], ["\\\\whtvertoval", '\u2B2F'], ["\\\\blkvertoval", '\u2B2E'], ["\\\\whthorzoval", '\u2B2D'], ["\\\\blkhorzoval", '\u2B2C'], ["\\\\lgblkcircle", '\u2B24'], ["\\\\mathtt\\{9\\}", '\uD835\uDFFF'], ["\\\\mathtt\\{8\\}", '\uD835\uDFFE'], ["\\\\textsection", '\xA7'], ["\\\\textonehalf", '\xBD'], ["\\\\shortuptack", '\u2AE0'], ["\\\\mathtt\\{7\\}", '\uD835\uDFFD'], ["\\\\mathtt\\{6\\}", '\uD835\uDFFC'], ["\\\\mathtt\\{5\\}", '\uD835\uDFFB'], ["\\\\mathtt\\{4\\}", '\uD835\uDFFA'], ["\\\\succnapprox", '\u2ABA'], ["\\\\precnapprox", '\u2AB9'], ["\\\\mathtt\\{3\\}", '\uD835\uDFF9'], ["\\\\eqqslantgtr", '\u2A9C'], ["\\\\eqslantless", '\u2A95'], ["\\\\backepsilon", '\u03F6'], ["\\\\mathtt\\{2\\}", '\uD835\uDFF8'], ["\\\\mathtt\\{1\\}", '\uD835\uDFF7'], ["\\\\mathtt\\{0\\}", '\uD835\uDFF6'], ["\\\\simminussim", '\u2A6C'], ["\\\\midbarwedge", '\u2A5C'], ["\\\\mathsf\\{9\\}", '\uD835\uDFEB'], ["\\\\mathsf\\{8\\}", '\uD835\uDFEA'], ["\\\\rcurvyangle", '\u29FD'], ["\\\\lcurvyangle", '\u29FC'], ["\\\\RuleDelayed", '\u29F4'], ["\\\\gleichstark", '\u29E6'], ["\\\\mathsf\\{7\\}", '\uD835\uDFE9'], ["\\\\mathsf\\{6\\}", '\uD835\uDFE8'], ["\\\\mathsf\\{5\\}", '\uD835\uDFE7'], ["\\\\mathsf\\{4\\}", '\uD835\uDFE6'], ["\\\\circledless", '\u29C0'], ["\\\\revemptyset", '\u29B0'], ["\\\\wideangleup", '\u29A7'], ["\\\\mathsf\\{3\\}", '\uD835\uDFE5'], ["\\\\mathsf\\{2\\}", '\uD835\uDFE4'], ["\\\\mathsf\\{1\\}", '\uD835\uDFE3'], ["\\\\mathsf\\{0\\}", '\uD835\uDFE2'], ["\\\\mathbb\\{9\\}", '\uD835\uDFE1'], ["\\\\mathbb\\{8\\}", '\uD835\uDFE0'], ["\\\\mathbb\\{7\\}", '\uD835\uDFDF'], ["\\\\nwovnearrow", '\u2932'], ["\\\\neovnwarrow", '\u2931'], ["\\\\neovsearrow", '\u292E'], ["\\\\seovnearrow", '\u292D'], ["\\\\mathbb\\{6\\}", '\uD835\uDFDE'], ["\\\\mathbb\\{5\\}", '\uD835\uDFDD'], ["\\\\leftdbltail", '\u291B'], ["\\\\mathbb\\{4\\}", '\uD835\uDFDC'], ["\\\\leftbkarrow", '\u290C'], ["\\\\nvLeftarrow", '\u2902'], ["\\\\mathbb\\{3\\}", '\uD835\uDFDB'], ["\\\\mathbb\\{2\\}", '\uD835\uDFDA'], ["\\\\mathbb\\{1\\}", '\uD835\uDFD9'], ["\\\\mathbb\\{0\\}", '\uD835\uDFD8'], ["\\\\multimapinv", '\u27DC'], ["\\\\mathbf\\{9\\}", '\uD835\uDFD7'], ["\\\\mathbf\\{8\\}", '\uD835\uDFD6'], ["\\\\threedangle", '\u27C0'], ["\\\\ding\\{254\\}", '\u27BE'], ["\\\\ding\\{253\\}", '\u27BD'], ["\\\\ding\\{252\\}", '\u27BC'], ["\\\\ding\\{251\\}", '\u27BB'], ["\\\\ding\\{250\\}", '\u27BA'], ["\\\\ding\\{249\\}", '\u27B9'], ["\\\\ding\\{248\\}", '\u27B8'], ["\\\\ding\\{247\\}", '\u27B7'], ["\\\\ding\\{246\\}", '\u27B6'], ["\\\\ding\\{245\\}", '\u27B5'], ["\\\\ding\\{244\\}", '\u27B4'], ["\\\\ding\\{243\\}", '\u27B3'], ["\\\\ding\\{242\\}", '\u27B2'], ["\\\\ding\\{241\\}", '\u27B1'], ["\\\\ding\\{239\\}", '\u27AF'], ["\\\\ding\\{238\\}", '\u27AE'], ["\\\\ding\\{237\\}", '\u27AD'], ["\\\\ding\\{236\\}", '\u27AC'], ["\\\\ding\\{235\\}", '\u27AB'], ["\\\\ding\\{234\\}", '\u27AA'], ["\\\\ding\\{233\\}", '\u27A9'], ["\\\\ding\\{232\\}", '\u27A8'], ["\\\\ding\\{231\\}", '\u27A7'], ["\\\\ding\\{230\\}", '\u27A6'], ["\\\\ding\\{229\\}", '\u27A5'], ["\\\\ding\\{228\\}", '\u27A4'], ["\\\\ding\\{227\\}", '\u27A3'], ["\\\\ding\\{226\\}", '\u27A2'], ["\\\\ding\\{225\\}", '\u27A1'], ["\\\\ding\\{224\\}", '\u27A0'], ["\\\\ding\\{223\\}", '\u279F'], ["\\\\ding\\{222\\}", '\u279E'], ["\\\\ding\\{221\\}", '\u279D'], ["\\\\ding\\{220\\}", '\u279C'], ["\\\\ding\\{219\\}", '\u279B'], ["\\\\ding\\{218\\}", '\u279A'], ["\\\\ding\\{216\\}", '\u2798'], ["\\\\ding\\{212\\}", '\u2794'], ["\\\\ding\\{211\\}", '\u2793'], ["\\\\ding\\{210\\}", '\u2792'], ["\\\\ding\\{209\\}", '\u2791'], ["\\\\ding\\{208\\}", '\u2790'], ["\\\\ding\\{207\\}", '\u278F'], ["\\\\ding\\{206\\}", '\u278E'], ["\\\\ding\\{205\\}", '\u278D'], ["\\\\ding\\{204\\}", '\u278C'], ["\\\\ding\\{203\\}", '\u278B'], ["\\\\ding\\{202\\}", '\u278A'], ["\\\\ding\\{201\\}", '\u2789'], ["\\\\ding\\{200\\}", '\u2788'], ["\\\\ding\\{199\\}", '\u2787'], ["\\\\ding\\{198\\}", '\u2786'], ["\\\\ding\\{197\\}", '\u2785'], ["\\\\ding\\{196\\}", '\u2784'], ["\\\\ding\\{195\\}", '\u2783'], ["\\\\ding\\{194\\}", '\u2782'], ["\\\\ding\\{193\\}", '\u2781'], ["\\\\ding\\{192\\}", '\u2780'], ["\\\\ding\\{191\\}", '\u277F'], ["\\\\ding\\{190\\}", '\u277E'], ["\\\\ding\\{189\\}", '\u277D'], ["\\\\ding\\{188\\}", '\u277C'], ["\\\\ding\\{187\\}", '\u277B'], ["\\\\ding\\{186\\}", '\u277A'], ["\\\\ding\\{185\\}", '\u2779'], ["\\\\ding\\{184\\}", '\u2778'], ["\\\\ding\\{183\\}", '\u2777'], ["\\\\ding\\{182\\}", '\u2776'], ["\\\\ding\\{167\\}", '\u2767'], ["\\\\ding\\{166\\}", '\u2766'], ["\\\\ding\\{165\\}", '\u2765'], ["\\\\ding\\{164\\}", '\u2764'], ["\\\\ding\\{163\\}", '\u2763'], ["\\\\ding\\{162\\}", '\u2762'], ["\\\\ding\\{161\\}", '\u2761'], ["\\\\ding\\{126\\}", '\u275E'], ["\\\\ding\\{125\\}", '\u275D'], ["\\\\ding\\{124\\}", '\u275C'], ["\\\\ding\\{123\\}", '\u275B'], ["\\\\ding\\{122\\}", '\u275A'], ["\\\\ding\\{121\\}", '\u2759'], ["\\\\ding\\{120\\}", '\u2758'], ["\\\\ding\\{118\\}", '\u2756'], ["\\\\ding\\{114\\}", '\u2752'], ["\\\\ding\\{113\\}", '\u2751'], ["\\\\ding\\{112\\}", '\u2750'], ["\\\\ding\\{111\\}", '\u274F'], ["\\\\ding\\{109\\}", '\u274D'], ["\\\\ding\\{107\\}", '\u274B'], ["\\\\ding\\{106\\}", '\u274A'], ["\\\\ding\\{105\\}", '\u2749'], ["\\\\ding\\{104\\}", '\u2748'], ["\\\\ding\\{103\\}", '\u2747'], ["\\\\ding\\{102\\}", '\u2746'], ["\\\\ding\\{101\\}", '\u2745'], ["\\\\ding\\{100\\}", '\u2744'], ["\\\\mathbf\\{7\\}", '\uD835\uDFD5'], ["\\\\quarternote", '\u2669'], ["\\\\varclubsuit", '\u2667'], ["\\\\ding\\{169\\}", '\u2666'], ["\\\\ding\\{170\\}", '\u2665'], ["\\\\ding\\{168\\}", '\u2663'], ["\\\\mathbf\\{6\\}", '\uD835\uDFD4'], ["\\\\ding\\{171\\}", '\u2660'], ["\\\\capricornus", '\u2651'], ["\\\\sagittarius", '\u2650'], ["\\\\backtrprime", '\u2037'], ["\\\\caretinsert", '\u2038'], ["\\\\nolinebreak", '\u2060'], ["\\\\mathbf\\{5\\}", '\uD835\uDFD3'], ["\\\\blacksmiley", '\u263B'], ["\\\\vertoverlay", '\u20D2'], ["\\\\mathbf\\{4\\}", '\uD835\uDFD2'], ["\\\\mathbf\\{3\\}", '\uD835\uDFD1'], ["\\\\smwhtcircle", '\u25E6'], ["\\\\asteraccent", '\u20F0'], ["\\\\mathbb\\{C\\}", '\u2102'], ["\\\\mathbf\\{2\\}", '\uD835\uDFD0'], ["\\\\ding\\{119\\}", '\u25D7'], ["\\\\mathbb\\{H\\}", '\u210D'], ["\\\\Planckconst", '\u210E'], ["\\\\ding\\{108\\}", '\u25CF'], ["\\\\mathbb\\{N\\}", '\u2115'], ["\\\\ding\\{117\\}", '\u25C6'], ["\\\\mathbb\\{P\\}", '\u2119'], ["\\\\ding\\{116\\}", '\u25BC'], ["\\\\mathbb\\{Q\\}", '\u211A'], ["\\\\vartriangle", '\u25B5'], ["\\\\ding\\{115\\}", '\u25B2'], ["\\\\mathbf\\{1\\}", '\uD835\uDFCF'], ["\\\\smwhtsquare", '\u25AB'], ["\\\\blacksquare", '\u25AA'], ["\\\\squarevfill", '\u25A5'], ["\\\\squarehfill", '\u25A4'], ["\\\\mathbb\\{R\\}", '\u211D'], ["\\\\ding\\{110\\}", '\u25A0'], ["\\\\mathbf\\{0\\}", '\uD835\uDFCE'], ["\\\\blockuphalf", '\u2580'], ["\\\\mathbb\\{Z\\}", '\u2124'], ["\\\\ding\\{181\\}", '\u2469'], ["\\\\ding\\{180\\}", '\u2468'], ["\\\\ding\\{179\\}", '\u2467'], ["\\\\ding\\{178\\}", '\u2466'], ["\\\\ding\\{177\\}", '\u2465'], ["\\\\ding\\{176\\}", '\u2464'], ["\\\\ding\\{175\\}", '\u2463'], ["\\\\ding\\{174\\}", '\u2462'], ["\\\\ding\\{173\\}", '\u2461'], ["\\\\ding\\{172\\}", '\u2460'], ["\\\\overbracket", '\u23B4'], ["\\\\intextender", '\u23AE'], ["\\\\sansLturned", '\u2142'], ["\\\\ExponetialE", '\u2147'], ["\\\\wasylozenge", '\u2311'], ['\\\\updownarrow', '\u2195'], ["\\\\nrightarrow", '\u219B'], ["\\\\sqsubsetneq", '\u22E4'], ["\\\\curlyeqsucc", '\u22DF'], ["\\\\curlyeqprec", '\u22DE'], ["\\\\nRightarrow", '\u21CF'], ['\\\\Updownarrow', '\u21D5'], ["\\\\Rrightarrow", '\u21DB'], ["\\\\ding\\{217\\}", '\u2799'], ["\\\\precapprox", '\u227E'], ["\\\\textdagger", '\u2020'], ["\\\\mbfDigamma", '\uD835\uDFCA'], ["\\\\twolowline", '\u2017'], ["\\\\textemdash", '\u2014'], ["\\\\textendash", '\u2013'], ["\\\\eighthnote", '\u266A'], ["\\\\ding\\{33\\}", '\u2701'], ["\\\\ding\\{34\\}", '\u2702'], ['\\\\underbrace', '\u23DF'], ["\\\\ding\\{35\\}", '\u2703'], ['\\\\underparen', '\u23DD'], ["\\\\ding\\{36\\}", '\u2704'], ["\\\\ding\\{38\\}", '\u2706'], ["\\\\ding\\{39\\}", '\u2707'], ["\\\\ding\\{40\\}", '\u2708'], ["\\\\sqrtbottom", '\u23B7'], ["\\\\ding\\{41\\}", '\u2709'], ["\\\\ding\\{44\\}", '\u270C'], ["\\\\succapprox", '\u227F'], ["\\\\ding\\{45\\}", '\u270D'], ["\\\\ding\\{46\\}", '\u270E'], ["\\\\rmoustache", '\u23B1'], ["\\\\lmoustache", '\u23B0'], ["\\\\ding\\{47\\}", '\u270F'], ["\\\\nLeftarrow", '\u21CD'], ["\\\\rbracelend", '\u23AD'], ["\\\\ding\\{48\\}", '\u2710'], ["\\\\rbraceuend", '\u23AB'], ["\\\\ding\\{49\\}", '\u2711'], ["\\\\lbracelend", '\u23A9'], ["\\\\ding\\{50\\}", '\u2712'], ["\\\\lbraceuend", '\u23A7'], ["\\\\rbracklend", '\u23A6'], ["\\\\ding\\{51\\}", '\u2713'], ["\\\\rbrackuend", '\u23A4'], ["\\\\ding\\{52\\}", '\u2714'], ["\\\\ding\\{53\\}", '\u2715'], ["\\\\lbrackuend", '\u23A1'], ["\\\\rparenlend", '\u23A0'], ["\\\\ding\\{54\\}", '\u2716'], ["\\\\rparenuend", '\u239E'], ["\\\\lparenlend", '\u239D'], ["\\\\ding\\{55\\}", '\u2717'], ["\\\\lparenuend", '\u239B'], ["\\\\ding\\{56\\}", '\u2718'], ["\\\\ding\\{57\\}", '\u2719'], ["\\\\ding\\{58\\}", '\u271A'], ["\\\\ding\\{59\\}", '\u271B'], ["\\\\ding\\{60\\}", '\u271C'], ["\\\\APLcomment", '\u235D'], ["\\\\ding\\{61\\}", '\u271D'], ["\\\\ding\\{62\\}", '\u271E'], ["\\\\ding\\{63\\}", '\u271F'], ["\\\\ding\\{64\\}", '\u2720'], ["\\\\ding\\{65\\}", '\u2721'], ["\\\\ding\\{66\\}", '\u2722'], ["\\\\ding\\{67\\}", '\u2723'], ["\\\\ding\\{68\\}", '\u2724'], ["\\\\ding\\{69\\}", '\u2725'], ["\\\\rightangle", '\u221F'], ["\\\\conictaper", '\u2332'], ["\\\\ding\\{70\\}", '\u2726'], ["\\\\ding\\{71\\}", '\u2727'], ["\\\\ding\\{74\\}", '\u272A'], ["\\\\ding\\{75\\}", '\u272B'], ["\\\\varnothing", '\u2205'], ["\\\\ding\\{76\\}", '\u272C'], ["\\\\ding\\{77\\}", '\u272D'], ["\\\\ding\\{78\\}", '\u272E'], ["\\\\ding\\{79\\}", '\u272F'], ["\\\\ding\\{80\\}", '\u2730'], ["\\\\ding\\{81\\}", '\u2731'], ["\\\\ding\\{82\\}", '\u2732'], ["\\\\ding\\{83\\}", '\u2733'], ["\\\\ding\\{84\\}", '\u2734'], ["\\\\ding\\{85\\}", '\u2735'], ["\\\\ding\\{86\\}", '\u2736'], ["\\\\ding\\{87\\}", '\u2737'], ["\\\\complement", '\u2201'], ["\\\\ding\\{88\\}", '\u2738'], ["\\\\ding\\{89\\}", '\u2739'], ["\\\\ding\\{90\\}", '\u273A'], ["\\\\ding\\{91\\}", '\u273B'], ["\\\\rightarrow", '\u2192'], ["\\\\ding\\{92\\}", '\u273C'], ["\\\\ding\\{93\\}", '\u273D'], ["\\\\sqsubseteq", '\u2291'], ["\\\\ding\\{94\\}", '\u273E'], ["\\\\nleftarrow", '\u219A'], ["\\\\ding\\{95\\}", '\u273F'], ["\\\\sqsupseteq", '\u2292'], ["\\\\ding\\{96\\}", '\u2740'], ["\\\\ding\\{97\\}", '\u2741'], ["\\\\ding\\{98\\}", '\u2742'], ["\\\\ding\\{99\\}", '\u2743'], ["\\\\subsetcirc", '\u27C3'], ["\\\\supsetcirc", '\u27C4'], ["\\\\Diamonddot", '\u27D0'], ["\\\\DDownarrow", '\u27F1'], ["\\\\longmapsto", '\u27FC'], ["\\\\Longmapsto", '\u27FE'], ["\\\\Ddownarrow", '\u290B'], ['\\\\UpArrowBar', '\u2912'], ['\\\\upfishtail', '\u297E'], ["\\\\lbrackubar", '\u298B'], ["\\\\rbrackubar", '\u298C'], ["\\\\Rparenless", '\u2996'], ["\\\\lblkbrbrak", '\u2997'], ["\\\\rblkbrbrak", '\u2998'], ["\\\\circledgtr", '\u29C1'], ["\\\\doubleplus", '\u29FA'], ["\\\\tripleplus", '\u29FB'], ["\\\\plussubtwo", '\u2A27'], ["\\\\commaminus", '\u2A29'], ["\\\\Lleftarrow", '\u21DA'], ["\\\\minusfdots", '\u2A2B'], ["\\\\minusrdots", '\u2A2C'], ["\\\\smashtimes", '\u2A33'], ["\\\\cupovercap", '\u2A46'], ["\\\\Rightarrow", '\u21D2'], ["\\\\circledast", '\u229B'], ["\\\\capovercup", '\u2A47'], ["\\\\veeonwedge", '\u2A59'], ["\\\\veemidvert", '\u2A5B'], ["\\\\equivVvert", '\u2A69'], ["\\\\lessapprox", '\u2A85'], ["\\\\lesseqqgtr", '\u2A8B'], ["\\\\gtreqqless", '\u2A8C'], ["\\\\eqslantgtr", '\u2A96'], ["\\\\rightslice", '\u2AA7'], ["\\{\\\\'\\{\\}O\\}|\\\\'\\{\\}O", '\u038C'], ["\\\\'\\{\\}\\{I\\}", '\u038A'], ["\\\\subsetplus", '\u2ABF'], ["\\\\supsetplus", '\u2AC0'], ["\\\\cyrchar\\\\C", '\u030F'], ["\\\\curlywedge", '\u22CF'], ["\\\\tone\\{11\\}", '\u02E9'], ["\\\\tone\\{22\\}", '\u02E8'], ["\\\\subsetneqq", '\u2ACB'], ["\\\\supsetneqq", '\u2ACC'], ["\\\\fbox\\{~~\\}", '\u25AD'], ["\\\\LEFTCIRCLE", '\u25D6'], ['\\\\ultriangle', '\u25F8'], ["\\\\tone\\{33\\}", '\u02E7'], ["\\\\tone\\{44\\}", '\u02E6'], ['\\\\urtriangle', '\u25F9'], ["\\\\lltriangle", '\u25FA'], ["\\\\tone\\{55\\}", '\u02E5'], ["\\\\varepsilon", '\u025B'], ["\\\\lrtriangle", '\u25FF'], ["\\\\ding\\{72\\}", '\u2605'], ["\\\\ding\\{73\\}", '\u2606'], ["\\\\ding\\{37\\}", '\u260E'], ["\\\\CheckedBox", '\u2611'], ["\\^\\\\circ|\\\\textdegree", '\xB0'], ["\\\\ding\\{42\\}", '\u261B'], ["\\\\interleave", '\u2AF4'], ["\\\\ding\\{43\\}", '\u261E'], ["\\\\talloblong", '\u2AFE'], ["\\\\mbfdigamma", '\uD835\uDFCB'], ["\\\\backdprime", '\u2036'], ["\\\\varhexagon", '\u2B21'], ["\\\\leftarrowx", '\u2B3E'], ["\\\\LLeftarrow", '\u2B45'], ["\\\\postalmark", '\u3012'], ["\\\\textdollar", '\\$'], ['\\\\upuparrows', '\u21C8'], ["\\\\not\\\\equiv", '\u2262'], ["\\\\not\\\\simeq", '\u2244'], ["\\\\homothetic", '\u223B'], ["\\\\textbullet", '\u2022'], ["\\\\geqqslant", '\u2AFA'], ["\\\\leqqslant", '\u2AF9'], ["\\\\supseteqq", '\u2AC6'], ["\\\\subseteqq", '\u2AC5'], ["\\\\supsetdot", '\u2ABE'], ["\\\\subsetdot", '\u2ABD'], ["\\\\leftslice", '\u2AA6'], ["\\\\gtrapprox", '\u2A86'], ["\\\\approxeqq", '\u2A70'], ["\\\\hatapprox", '\u2A6F'], ["\\\\equivVert", '\u2A68'], ["\\\\varveebar", '\u2A61'], ["\\\\Elzminhat", '\u2A5F'], ["\\\\midbarvee", '\u2A5D'], ["\\\\wedgeodot", '\u2A51'], ["\\\\capbarcup", '\u2A49'], ["\\\\cupbarcap", '\u2A48'], ["\\\\otimeshat", '\u2A36'], ["\\\\clockoint", '\u2A0F'], ["\\\\modtwosum", '\u2A0A'], ["\\\\bigcupdot", '\u2A03'], ["\\\\bigotimes", '\u2A02'], ["\\\\hourglass", '\u29D6'], ["\\\\triangles", '\u29CC'], ["\\\\boxcircle", '\u29C7'], ["\\\\boxbslash", '\u29C5'], ["\\\\angleubar", '\u29A4'], ["\\\\turnangle", '\u29A2'], ["\\\\Elzlpargt", '\u29A0'], ["\\\\Lparengtr", '\u2995'], ["\\\\rangledot", '\u2992'], ["\\\\langledot", '\u2991'], ["\\\\typecolon", '\u2982'], ["\\\\neswarrow", '\u2922'], ["\\\\nwsearrow", '\u2921'], ["\\\\righttail", '\u291A'], ["\\\\rrbracket", '\u27E7'], ["\\\\llbracket", '\u27E6'], ["\\\\longdashv", '\u27DE'], ["\\\\vlongdash", '\u27DD'], ["\\\\dashVdash", '\u27DB'], ["\\\\DashVDash", '\u27DA'], ["\\\\medbullet", '\u26AB'], ["\\\\heartsuit", '\u2661'], ["\\\\rightmoon", '\u263D'], ["\\\\biohazard", '\u2623'], ["\\\\radiation", '\u2622'], ["\\\\Elzrvbull", '\u25D8'], ["\\\\Elzvrecto", '\u25AF'], ["\\\\blockfull", '\u2588'], ["\\\\Elzdshfnc", '\u2506'], ["\\\\accurrent", '\u23E6'], ["\\\\trapezium", '\u23E2'], ["\\\\overbrace", '\u23DE'], ["\\\\overparen", '\u23DC'], ["\\\\rvboxline", '\u23B9'], ["\\\\lvboxline", '\u23B8'], ["\\\\sumbottom", '\u23B3'], ["\\\\rbracemid", '\u23AC'], ["\\\\lbracemid", '\u23A8'], ["\\\\Elzdlcorn", '\u23A3'], ["\\\\intbottom", '\u2321'], ["\\\\turnednot", '\u2319'], ["\\\\bagmember", '\u22FF'], ["\\\\varniobar", '\u22FD'], ["\\\\Elzsqspne", '\u22E5'], ["\\\\gtreqless", '\u22DB'], ["\\\\lesseqgtr", '\u22DA'], ["\\\\pitchfork", '\u22D4'], ["\\\\backsimeq", '\u22CD'], ["\\\\truestate", '\u22A7'], ["\\\\supsetneq", '\u228B'], ["\\\\subsetneq", '\u228A'], ["\\\\not\\\\succ", '\u2281'], ["\\\\not\\\\prec", '\u2280'], ["\\\\triangleq", '\u225C'], ["\\\\starequal", '\u225B'], ["\\\\estimates", '\u2259'], ["\\\\tildetrpl", '\u224B'], ["\\\\not\\\\cong", '\u2247'], ["\\\\therefore", '\u2234'], ["\\\\nparallel", '\u2226'], ["\\\\sqrt\\[4\\]", '\u221C'], ["\\\\sqrt\\[3\\]", '\u221B'], ["\\\\increment", '\u2206'], ["\\\\nHuparrow", '\u21DE'], ["\\\\Downarrow", '\u21D3'], ["\\\\Leftarrow", '\u21D0'], ["\\\\lightning", '\u21AF'], ["\\\\downarrow", '\u2193'], ["\\\\leftarrow", '\u2190'], ["\\\\fracslash", '\u2044'], ["\\\\backprime", '\u2035'], ["\\\\Elzreapos", '\u201B'], ["\\\\textTheta", '\u03F4'], ['\\\\underline', '\u0332'], ["\\\\textturnk", '\u029E'], ["\\\\Elzinglst", '\u0296'], ["\\\\Elzreglst", '\u0295'], ["\\\\Elzpupsil", '\u028A'], ["\\\\Elzrttrnr", '\u027B'], ["\\\\Elzclomeg", '\u0277'], ["\\\\Elztrnmlr", '\u0270'], ["\\\\Elzpgamma", '\u0263'], ["\\\\textnrleg", '\u019E'], ["\\\\texthvlig", '\u0195'], ["\\\\texttimes", '\xD7'], ["\\\\texttheta", '\u03B8'], ["\\\\Elzpscrv", '\u028B'], ["\\\\succnsim", '\u22E9'], ["\\\\Elzsqfnw", '\u2519'], ["\\\\circledS", '\u24C8'], ["\\\\elinters", '\u23E7'], ["\\\\varisins", '\u22F3'], ["\\\\bbrktbrk", '\u23B6'], ["\\\\MapsDown", '\u21A7'], ["\\\\APLinput", '\u235E'], ["\\\\notslash", '\u233F'], ["\\\\mapsfrom", '\u21A4'], ["\\\\pentagon", '\u2B20'], ["\\\\ComplexI", '\u2148'], ["\\\\isinobar", '\u22F7'], ["\\\\ComplexJ", '\u2149'], ["\\\\lrcorner", '\u231F'], ["\\\\llcorner", '\u231E'], ['\\\\urcorner', '\u231D'], ['\\\\ulcorner', '\u231C'], ["\\\\viewdata", '\u2317'], ["\\\\Elzdyogh", '\u02A4'], ["\\\\Elzverts", '\u02C8'], ["\\\\Elzverti", '\u02CC'], ["\\\\Elzhlmrk", '\u02D1'], ["\\\\diameter", '\u2300'], ["\\\\recorder", '\u2315'], ["\\\\Elzsbrhr", '\u02D2'], ["\\\\profsurf", '\u2313'], ["\\\\Elzsblhr", '\u02D3'], ["\\\\Elztdcol", '\u2AF6'], ["\\\\profline", '\u2312'], ["\\\\overline", '\u0305'], ["\\\\Elzsbbrg", '\u032A'], ["\\\\succneqq", '\u2AB6'], ["\\\\precneqq", '\u2AB5'], ['\\\\underbar', '\u0331'], ["\\\\varsigma", '\u03C2'], ["\\\\setminus", '\u2216'], ["\\\\varkappa", '\u03F0'], ["\\\\not\\\\sim", '\u2241'], ["\\\\gnapprox", '\u2A8A'], ["\\\\lnapprox", '\u2A89'], ["\\\\gesdotol", '\u2A84'], ["\\\\lesdotor", '\u2A83'], ["\\\\geqslant", '\u2A7E'], ["\\\\approxeq", '\u224A'], ["\\\\lazysinv", '\u223E'], ["\\\\leqslant", '\u2A7D'], ["\\\\varVdash", '\u2AE6'], ["\\\\=\\{\\\\i\\}", '\u012B'], ["\\\\Coloneqq", '\u2A74'], ["\\\\simrdots", '\u2A6B'], ["\\\\dotequiv", '\u2A67'], ["\\\\capwedge", '\u2A44'], ["\\\\not\\\\leq", '\u2270'], ["\\\\intprodr", '\u2A3D'], ["\\\\not\\\\geq", '\u2271'], ["\\\\subseteq", '\u2286'], ["\\\\timesbar", '\u2A31'], ["\\\\supseteq", '\u2287'], ["\\\\dottimes", '\u2A30'], ["\\\\ElzTimes", '\u2A2F'], ["\\\\sqsubset", '\u228F'], ["\\\\plustrif", '\u2A28'], ["\\\\sqsupset", '\u2290'], ["\\\\ringplus", '\u2A22'], ["\\\\zproject", '\u2A21'], ["\\\\intlarhk", '\u2A17'], ["\\\\pointint", '\u2A15'], ["\\\\scpolint", '\u2A13'], ["\\\\rppolint", '\u2A12'], ["\\\\Elxsqcup", '\u2A06'], ["\\\\Elxuplus", '\u2A04'], ["\\\\forksnot", '\u2ADD'], ["\\\\boxminus", '\u229F'], ["\\\\boxtimes", '\u22A0'], ["\\\\bigoplus", '\u2A01'], ["\\\\eqvparsl", '\u29E5'], ["\\\\smeparsl", '\u29E4'], ["\\\\tieinfty", '\u29DD'], ["\\\\Rvzigzag", '\u29DB'], ["\\\\Lvzigzag", '\u29DA'], ["\\\\rvzigzag", '\u29D9'], ["\\\\lvzigzag", '\u29D8'], ["\\\\rfbowtie", '\u29D2'], ["\\\\lfbowtie", '\u29D1'], ["\\\\rtriltri", '\u29CE'], ["\\\\Elzdefas", '\u29CB'], ["\\\\allequal", '\u224C'], ["\\\\doteqdot", '\u2251'], ["\\\\Elztrnsa", '\u0252'], ["\\\\Elzopeno", '\u0254'], ["\\\\boxonbox", '\u29C9'], ["\\\\boxslash", '\u29C4'], ["\\\\revangle", '\u29A3'], ["\\\\Elzddfnc", '\u2999'], ["\\\\Elzschwa", '\u0259'], ["\\\\Elzrarrx", '\u2947'], ["\\\\ElzrLarr", '\u2944'], ["\\\\original", '\u22B6'], ["\\\\ElzRlarr", '\u2942'], ["\\\\multimap", '\u22B8'], ["\\\\intercal", '\u22BA'], ["\\\\lefttail", '\u2919'], ["\\\\barwedge", '\u22BC'], ["\\\\drbkarow", '\u2910'], ['\\\\Uuparrow', '\u290A'], ["\\\\Mapsfrom", '\u2906'], ["\\\\Elzpbgam", '\u0264'], ['\\\\UUparrow', '\u27F0'], ["\\\\pullback", '\u27D3'], ["\\\\wedgedot", '\u27D1'], ["\\\\bsolhsub", '\u27C8'], ["\\\\curlyvee", '\u22CE'], ["\\\\acidfree", '\u267E'], ["\\\\twonotes", '\u266B'], ["\\\\mkern1mu", '\u200A'], ["\\\\aquarius", '\u2652'], ["\\\\textcent", '\xA2'], ["\\\\Elzltlmr", '\u0271'], ["\\\\Question", '\u2047'], ["\\\\:|\\\\mkern4mu", '\u205F'], ["\\\\steaming", '\u2615'], ["\\\\Elztrnrl", '\u027A'], ["\\\\parallel", '\u2225'], ["\\\\linefeed", '\u21B4'], ["\\\\Elzsqfse", '\u25EA'], ["\\\\Elzcirfb", '\u25D2'], ["\\\\Elzcirfr", '\u25D1'], ["\\\\Elzcirfl", '\u25D0'], ["\\\\bullseye", '\u25CE'], ["\\\\vphantom\\\\{", ''], ["\\\\eqcolon", '\u2239'], ["\\\\because", '\u2235'], ["\\\\revnmid", '\u2AEE'], ["\\\\between", '\u226C'], ["\\\\lessgtr", '\u2276'], ["\\\\gtrless", '\u2277'], ["\\\\dotplus", '\u2214'], ["\\\\smallni", '\u220D'], ["\\\\not\\\\ni", '\u220C'], ["\\\\smallin", '\u220A'], ["\\\\not\\\\in", '\u2209'], ["\\\\nexists", '\u2204'], ["\\\\partial", '\u2202'], ["\\\\boxplus", '\u229E'], ["\\\\Swarrow", '\u21D9'], ["\\\\Searrow", '\u21D8'], ["\\\\Nearrow", '\u21D7'], ["\\\\Nwarrow", '\u21D6'], ['\\\\Uparrow', '\u21D1'], ["\\\\diamond", '\u22C4'], ["\\\\lessdot", '\u22D6'], ["\\\\npreceq", '\u22E0'], ["\\\\nsucceq", '\u22E1'], ["\\\\nhVvert", '\u2AF5'], ["\\\\isindot", '\u22F5'], ["\\\\swarrow", '\u2199'], ["\\\\searrow", '\u2198'], ["\\\\nearrow", '\u2197'], ["\\\\nwarrow", '\u2196'], ["\\\\textyen", '\xA5'], ['\\\\uparrow', '\u2191'], ["\\\\hexagon", '\u2394'], ["\\\\obrbrak", '\u23E0'], ['\\\\ubrbrak', '\u23E1'], ["\\\\benzenr", '\u23E3'], ["\\\\Elzxrat", '\u211E'], ["\\\\squoval", '\u25A2'], ["\\\\Diamond", '\u25C7'], ["\\\\fisheye", '\u25C9'], ["\\\\lozenge", '\u25CA'], ["\\\\bigcirc", '\u25CB'], ["\\\\Elzsqfl", '\u25E7'], ["\\\\Elzsqfr", '\u25E8'], ["\\\\annuity", '\u20E7'], ["\\\\yinyang", '\u262F'], ["\\\\frownie", '\u2639'], ["\\\\mercury", '\u263F'], ["\\\\closure", '\u2050'], ["\\\\lllnest", '\u2AF7'], ["\\\\jupiter", '\u2643'], ["\\\\neptune", '\u2646'], ["\\\\gggnest", '\u2AF8'], ["\\\\scorpio", '\u264F'], ["\\\\natural", '\u266E'], ["\\\\recycle", '\u267B'], ["\\\\diceiii", '\u2682'], ["\\\\warning", '\u26A0'], ["\\\\medcirc", '\u26AA'], ["\\\\lbrbrak", '\u2772'], ["\\\\rbrbrak", '\u2773'], ["\\\\suphsol", '\u27C9'], ["\\\\pushout", '\u27D4'], ["\\\\Lbrbrak", '\u27EC'], ["\\\\Rbrbrak", '\u27ED'], ["\\\\dbkarow", '\u290F'], ["\\\\Elolarr", '\u2940'], ["\\\\Elorarr", '\u2941'], ["\\\\subrarr", '\u2979'], ["\\\\suplarr", '\u297B'], ["\\\\Elztfnc", '\u2980'], ["\\\\Elroang", '\u2986'], ["\\\\vzigzag", '\u299A'], ["\\\\olcross", '\u29BB'], ["\\\\cirscir", '\u29C2'], ["\\\\fbowtie", '\u29D3'], ["\\\\lftimes", '\u29D4'], ["\\\\rftimes", '\u29D5'], ["\\\\nvinfty", '\u29DE'], ["\\\\shuffle", '\u29E2'], ["\\\\thermod", '\u29E7'], ["\\\\rsolbar", '\u29F7'], ["\\\\bigodot", '\u2A00'], ["\\\\varprod", '\u2A09'], ["\\\\ElzCint", '\u2A0D'], ["\\\\npolint", '\u2A14'], ["\\\\plushat", '\u2A23'], ["\\\\simplus", '\u2A24'], ["\\\\plussim", '\u2A26'], ["\\\\twocups", '\u2A4A'], ["\\\\twocaps", '\u2A4B'], ["\\\\veeodot", '\u2A52'], ["\\\\congdot", '\u2A6D'], ["\\\\eqqplus", '\u2A71'], ["\\\\pluseqq", '\u2A72'], ["\\\\ddotseq", '\u2A77'], ["\\\\equivDD", '\u2A78'], ["\\\\ltquest", '\u2A7B'], ["\\\\gtquest", '\u2A7C'], ["\\\\lesdoto", '\u2A81'], ["\\\\gesdoto", '\u2A82'], ["\\\\digamma", '\u03DD'], ["\\\\Digamma", '\u03DC'], ['\\\\upsilon', '\u03C5'], ["\\\\epsilon", '\u03B5'], ["\\\\eqqless", '\u2A99'], ['\\\\Upsilon', '\u03A5'], ["\\\\bumpeqq", '\u2AAE'], ["\\\\backsim", '\u223D'], ["\\\\succneq", '\u2AB2'], ["\\\\preceqq", '\u2AB3'], ["\\\\succeqq", '\u2AB4'], ["\\\\trslash", '\u2AFB'], ["\\\\Elzpalh", '\u0321'], ["\\\\llcurly", '\u2ABB'], ["\\\\ggcurly", '\u2ABC'], ["\\\\submult", '\u2AC1'], ["\\\\supmult", '\u2AC2'], ["\\\\subedot", '\u2AC3'], ["\\\\supedot", '\u2AC4'], ["\\\\lsqhook", '\u2ACD'], ["\\\\rsqhook", '\u2ACE'], ["\\\\Elzrais", '\u02D4'], ["\\\\Elzlmrk", '\u02D0'], ["\\\\Elztesh", '\u02A7'], ["\\\\Elzglst", '\u0294'], ["\\\\Elzyogh", '\u0292'], ["\\\\Elzrtlz", '\u0290'], ["\\\\Elztrny", '\u028E'], ["\\\\Elzinvw", '\u028D'], ["\\\\Elzinvv", '\u028C'], ["\\\\Elzrtlt", '\u0288'], ["\\\\Elztrnt", '\u0287'], ["\\\\Elzrtls", '\u0282'], ["\\\\Elzrtlr", '\u027D'], ["\\\\Elztrnr", '\u0279'], ["\\\\textphi", '\u0278'], ["\\\\hzigzag", '\u3030'], ["\\\\Elzrtln", '\u0273'], ["\\\\Elzltln", '\u0272'], ["\\\\Elztrnm", '\u026F'], ["\\\\Elzrtll", '\u026D'], ["\\\\Elzbtdl", '\u026C'], ["\\\\Elztrnh", '\u0265'], ["\\\\Elzrtld", '\u0256'], ["\\\\Elztrna", '\u0250'], ["\\\\suphsub", '\u2AD7'], ["\\\\supdsub", '\u2AD8'], ["\\\\\\.z|\\\\\\.\\{z\\}", '\u017C'], ["\\\\\\.Z|\\\\\\.\\{Z\\}", '\u017B'], ["\\\\\\^y|\\\\\\^\\{y\\}", '\u0177'], ["\\\\\\^Y|\\\\\\^\\{Y\\}", '\u0176'], ["\\\\\\^w|\\\\\\^\\{w\\}", '\u0175'], ["\\\\\\^W|\\\\\\^\\{W\\}", '\u0174'], ["\\\\topfork", '\u2ADA'], ["\\\\\\^s|\\\\\\^\\{s\\}", '\u015D'], ["\\\\\\^S|\\\\\\^\\{S\\}", '\u015C'], ["\\\\\\^J|\\\\\\^\\{J\\}", '\u0134'], ["\\\\\\.I|\\\\\\.\\{I\\}", '\u0130'], ["\\\\\\^h|\\\\\\^\\{h\\}", '\u0125'], ["\\\\\\^H|\\\\\\^\\{H\\}", '\u0124'], ["\\\\\\.g|\\\\\\.\\{g\\}", '\u0121'], ["\\\\\\.G|\\\\\\.\\{G\\}", '\u0120'], ["\\\\\\^g|\\\\\\^\\{g\\}", '\u011D'], ["\\\\\\^G|\\\\\\^\\{G\\}", '\u011C'], ["\\\\\\.e|\\\\\\.\\{e\\}", '\u0117'], ["\\\\\\.E|\\\\\\.\\{E\\}", '\u0116'], ["\\\\\\.c|\\\\\\.\\{c\\}", '\u010B'], ["\\\\\\.C|\\\\\\.\\{C\\}", '\u010A'], ["\\\\\\^c|\\\\\\^\\{c\\}", '\u0109'], ["\\\\\\^C|\\\\\\^\\{C\\}", '\u0108'], ["\\\\\\^u|\\\\\\^\\{u\\}", '\xFB'], ["\\\\\\^o|\\\\\\^\\{o\\}", '\xF4'], ["\\\\\\^e|\\\\\\^\\{e\\}", '\xEA'], ["\\\\\\^a|\\\\\\^\\{a\\}", '\xE2'], ["\\\\\\^U|\\\\\\^\\{U\\}", '\xDB'], ["\\\\\\^O|\\\\\\^\\{O\\}", '\xD4'], ["\\\\\\^I|\\\\\\^\\{I\\}", '\xCE'], ["\\\\\\^E|\\\\\\^\\{E\\}", '\xCA'], ["\\\\\\^A|\\\\\\^\\{A\\}", '\xC2'], ["\\\\precneq", '\u2AB1'], ["\\\\bigtop", '\u27D9'], ["\\\\textmu", '\u03BC'], ["\\\\lgroup", '\u27EE'], ["\\\\rgroup", '\u27EF'], ["\\\\bigcup", '\u22C3'], ["\\\\Mapsto", '\u2907'], ["\\\\bigcap", '\u22C2'], ["\\\\approx", '\u2248'], ["\\\\barvee", '\u22BD'], ["\\\\veebar", '\u22BB'], ["\\\\'c|\\\\'\\{c\\}", '\u0107'], ["\\\\scurel", '\u22B1'], ["\\\\parsim", '\u2AF3'], ["\\\\ltlarr", '\u2976'], ["\\\\gtrarr", '\u2978'], ["\\\\'C|\\\\'\\{C\\}", '\u0106'], ["\\\\k\\{a\\}", '\u0105'], ["\\\\k\\{A\\}", '\u0104'], ["\\\\lBrace", '\u2983'], ["\\\\rBrace", '\u2984'], ["\\\\prurel", '\u22B0'], ["\\\\angles", '\u299E'], ["\\\\angdnr", '\u299F'], ["\\\\=a|\\\\=\\{a\\}", '\u0101'], ["\\\\=A|\\\\=\\{A\\}", '\u0100'], ["\\\\nVDash", '\u22AF'], ["\\\\boxast", '\u29C6'], ["\\\\boxbox", '\u29C8'], ["\\\\nVdash", '\u22AE'], ["\\\\ElzLap", '\u29CA'], ["\\\\nvDash", '\u22AD'], ["\\\\nvdash", '\u22AC'], ["\\\\Vvdash", '\u22AA'], ["\\\\\"y|\\\\\"\\{y\\}", '\xFF'], ["\\\\'y|\\\\'\\{y\\}", '\xFD'], ["\\\\topcir", '\u2AF1'], ["\\\\assert", '\u22A6'], ["\\\\\"u|\\\\\"\\{u\\}", '\xFC'], ["\\\\laplac", '\u29E0'], ["\\\\eparsl", '\u29E3'], ["\\\\'u|\\\\'\\{u\\}", '\xFA'], ["\\\\`u|\\\\`\\{u\\}", '\xF9'], ["\\\\tminus", '\u29FF'], ["\\\\boxdot", '\u22A1'], ["\\\\ElzThr", '\u2A05'], ["\\\\oslash", '\u2298'], ["\\\\ElzInf", '\u2A07'], ["\\\\ElzSup", '\u2A08'], ["\\\\sumint", '\u2A0B'], ["\\\\iiiint", '\u2A0C'], ["\\\\\"o|\\\\\"\\{o\\}", '\xF6'], ["\\\\intBar", '\u2A0E'], ["\\\\otimes", '\u2297'], ["\\\\ominus", '\u2296'], ["\\\\~o|\\\\~\\{o\\}", '\xF5'], ["\\\\sqrint", '\u2A16'], ["\\\\intcap", '\u2A19'], ["\\\\intcup", '\u2A1A'], ["\\\\lowint", '\u2A1C'], ["\\\\'o|\\\\'\\{o\\}", '\xF3'], ["\\\\`o|\\\\`\\{o\\}", '\xF2'], ["\\\\cupdot", '\u228D'], ["\\\\forall", '\u2200'], ["\\\\btimes", '\u2A32'], ["\\\\Otimes", '\u2A37'], ["\\\\exists", '\u2203'], ["\\\\capdot", '\u2A40'], ['\\\\uminus', '\u2A41'], ["\\\\barcup", '\u2A42'], ["\\\\barcap", '\u2A43'], ["\\\\supset", '\u2283'], ["\\\\cupvee", '\u2A45'], ["\\\\~n|\\\\~\\{n\\}", '\xF1'], ["\\\\ElzAnd", '\u2A53'], ["\\\\midcir", '\u2AF0'], ["\\\\dotsim", '\u2A6A'], ["\\\\eqqsim", '\u2A73'], ["\\\\\"e|\\\\\"\\{e\\}", '\xEB'], ["\\\\'e|\\\\'\\{e\\}", '\xE9'], ["\\\\`e|\\\\`\\{e\\}", '\xE8'], ["\\\\lesdot", '\u2A7F'], ["\\\\gesdot", '\u2A80'], ["\\\\coprod", '\u2210'], ["\\\\varrho", '\u03F1'], ["\\\\\"a|\\\\\"\\{a\\}", '\xE4'], ["\\\\stigma", '\u03DB'], ["\\\\Stigma", '\u03DA'], ["\\\\lesges", '\u2A93'], ["\\\\gesles", '\u2A94'], ["\\\\elsdot", '\u2A97'], ["\\\\egsdot", '\u2A98'], ["\\\\varphi", '\u03C6'], ["\\\\~a|\\\\~\\{a\\}", '\xE3'], ["\\\\lambda", '\u03BB'], ["\\\\'a|\\\\'\\{a\\}", '\xE1'], ["\\\\eqqgtr", '\u2A9A'], ["\\\\`a|\\\\`\\{a\\}", '\xE0'], ["\\\\Pi|\\\\P\\{i\\}", '\u03A0'], ["\\\\Xi|\\\\X\\{i\\}", '\u039E'], ["\\\\Lambda", '\u039B'], ["\\\\'H|\\\\'\\{H\\}", '\u0389'], ["\\\\preceq", '\u2AAF'], ["\\\\succeq", '\u2AB0'], ["\\\\TH|\\\\T\\{H\\}", '\xDE'], ["\\\\'Y|\\\\'\\{Y\\}", '\xDD'], ["\\\\\"U|\\\\\"\\{U\\}", '\xDC'], ["\\\\Elzbar", '\u0336'], ["\\\\'U|\\\\'\\{U\\}", '\xDA'], ['\\\\utilde', '\u0330'], ["\\\\bullet", '\u2219'], ["\\\\cirmid", '\u2AEF'], ["\\\\`U|\\\\`\\{U\\}", '\xD9'], ["\\\\droang", '\u031A'], ["\\\\\"O|\\\\\"\\{O\\}", '\xD6'], ["\\\\~O|\\\\~\\{O\\}", '\xD5'], ["\\\\candra", '\u0310'], ["\\\\'O|\\\\'\\{O\\}", '\xD3'], ["\\\\ovhook", '\u0309'], ["\\\\subsim", '\u2AC7'], ["\\\\supsim", '\u2AC8'], ["\\\\`O|\\\\`\\{O\\}", '\xD2'], ["\\\\~N|\\\\~\\{N\\}", '\xD1'], ["\\\\Elzlow", '\u02D5'], ["\\\\DH|\\\\D\\{H\\}", '\xD0'], ["\\\\propto", '\u221D'], ["\\\\subset", '\u2282'], ["\\\\\"I|\\\\\"\\{I\\}", '\xCF'], ["\\\\subsup", '\u2AD3'], ["\\\\rbrace", '\\}'], ["\\\\lbrace", '\\{'], ["\\\\'I|\\\\'\\{I\\}", '\xCD'], ["\\\\`I|\\\\`\\{I\\}", '\xCC'], ["\\\\\"E|\\\\\"\\{E\\}", '\xCB'], ["\\\\AC|\\\\A\\{C\\}", '\u223F'], ["\\\\'E|\\\\'\\{E\\}", '\xC9'], ["\\\\`E|\\\\`\\{E\\}", '\xC8'], ["\\\\AE|\\\\A\\{E\\}", '\xC6'], ["\\\\Elzesh", '\u0283'], ["\\\\AA|\\\\A\\{A\\}", '\xC5'], ["\\\\supsub", '\u2AD4'], ["\\\\Elzfhr", '\u027E'], ["\\\\\"A|\\\\\"\\{A\\}", '\xC4'], ["\\\\~A|\\\\~\\{A\\}", '\xC3'], ["\\\\'A|\\\\'\\{A\\}", '\xC1'], ["\\\\`A|\\\\`\\{A\\}", '\xC0'], ["\\\\vDdash", '\u2AE2'], ["\\\\subsub", '\u2AD5'], ["\\\\supsup", '\u2AD6'], ["\\\\'g|\\\\'\\{g\\}", '\u01F5'], ["\\\\not\\ =", '\u2260'], ["\\\\measeq", '\u225E'], ["\\\\'z|\\\\'\\{z\\}", '\u017A'], ["\\\\'Z|\\\\'\\{Z\\}", '\u0179'], ["\\\\\"Y|\\\\\"\\{Y\\}", '\u0178'], ["\\\\k\\{u\\}", '\u0173'], ["\\\\k\\{U\\}", '\u0172'], ["\\\\r\\{u\\}", '\u016F'], ["\\\\r\\{U\\}", '\u016E'], ["\\\\=u|\\\\=\\{u\\}", '\u016B'], ["\\\\=U|\\\\=\\{U\\}", '\u016A'], ["\\\\~u|\\\\~\\{u\\}", '\u0169'], ["\\\\~U|\\\\~\\{U\\}", '\u0168'], ["\\\\circeq", '\u2257'], ["\\\\'s|\\\\'\\{s\\}", '\u015B'], ["\\\\'S|\\\\'\\{S\\}", '\u015A'], ["\\\\'r|\\\\'\\{r\\}", '\u0155'], ["\\\\'R|\\\\'\\{R\\}", '\u0154'], ["\\\\OE|\\\\O\\{E\\}", '\u0152'], ["\\\\=o|\\\\=\\{o\\}", '\u014D'], ["\\\\=O|\\\\=\\{O\\}", '\u014C'], ["\\\\NG|\\\\N\\{G\\}", '\u014A'], ["\\\\'n|\\\\'\\{n\\}", '\u0144'], ["\\\\'N|\\\\'\\{N\\}", '\u0143'], ["\\\\'l|\\\\'\\{l\\}", '\u013A'], ["\\\\'L|\\\\'\\{L\\}", '\u0139'], ["\\\\eqcirc", '\u2256'], ["\\\\k\\{i\\}", '\u012F'], ["\\\\k\\{I\\}", '\u012E'], ['\\\\u\\ \\\\i', '\u012D'], ["\\\\lfloor", '\u230A'], ["\\\\rfloor", '\u230B'], ["\\\\invneg", '\u2310'], ["\\\\niobar", '\u22FE'], ["\\\\varnis", '\u22FB'], ["\\\\invamp", '\u214B'], ["\\\\inttop", '\u2320'], ["\\\\isinvb", '\u22F8'], ["\\\\langle", '\u2329'], ["\\\\rangle", '\u232A'], ["\\\\topbot", '\u2336'], ["\\\\APLinv", '\u2339'], ["\\\\MapsUp", '\u21A5'], ["\\\\mapsto", '\u21A6'], ["\\\\APLlog", '\u235F'], ["\\\\=I|\\\\=\\{I\\}", '\u012A'], ["\\\\daleth", '\u2138'], ["\\\\sumtop", '\u23B2'], ["\\\\~I|\\\\~\\{I\\}", '\u0128'], ["\\\\diagup", '\u2571'], ["\\\\square", '\u25A1'], ["\\\\hslash", '\u210F'], ["\\\\bumpeq", '\u224F'], ["\\\\boxbar", '\u25EB'], ["\\\\Square", '\u2610'], ["\\\\danger", '\u2621'], ["\\\\Bumpeq", '\u224E'], ["\\\\ddddot", '\u20DC'], ["\\\\smiley", '\u263A'], ["\\\\eqless", '\u22DC'], ["\\\\gtrdot", '\u22D7'], ["\\\\k\\{e\\}", '\u0119'], ["\\\\Exclam", '\u203C'], ["\\\\k\\{E\\}", '\u0118'], ["\\\\saturn", '\u2644'], ['\\\\uranus', '\u2645'], ["\\\\taurus", '\u2649'], ["\\\\gemini", '\u264A'], ["\\\\cancer", '\u264B'], ["\\\\pisces", '\u2653'], ["\\\\Supset", '\u22D1'], ["\\\\=e|\\\\=\\{e\\}", '\u0113'], ["\\\\Subset", '\u22D0'], ["\\\\diceii", '\u2681'], ["\\\\=E|\\\\=\\{E\\}", '\u0112'], ["\\\\diceiv", '\u2683'], ["\\\\dicevi", '\u2685'], ["\\\\anchor", '\u2693'], ["\\\\swords", '\u2694'], ["\\\\DJ|\\\\D\\{J\\}", '\u0110'], ["\\\\neuter", '\u26B2'], ["\\\\veedot", '\u27C7'], ["\\\\rtimes", '\u22CA'], ["\\\\ltimes", '\u22C9'], ["\\\\bowtie", '\u22C8'], ["\\\\bigbot", '\u27D8'], ["\\\\cirbot", '\u27DF'], ["\\\\mathrm", ''], ["\\\\LaTeX", 'L$^A$T$_E$X'], ["\\\\delta", '\u03B4'], ["\\\\image", '\u22B7'], ["\\\\llarc", '\u25DF'], ["\\\\simeq", '\u2243'], ["\\\\eqdef", '\u225D'], ["\\\\vBarv", '\u2AE9'], ["\\\\ElzOr", '\u2A54'], ["\\\\equiv", '\u2261'], ["\\\\space", ' '], ["\\\\isins", '\u22F4'], ["\\\\lnsim", '\u22E6'], ["\\\\Elzxl", '\u0335'], ["\\\\Theta", '\u0398'], ["\\\\barin", '\u22F6'], ["\\\\kappa", '\u03BA'], ["\\\\lblot", '\u2989'], ["\\\\rblot", '\u298A'], ["\\\\frown", '\u2322'], ["\\\\earth", '\u2641'], ["\\\\Angle", '\u299C'], ["\\\\Sqcup", '\u2A4F'], ["\\\\Sqcap", '\u2A4E'], ["\\\\nhpar", '\u2AF2'], ["\\\\operp", '\u29B9'], ["\\\\sigma", '\u03C3'], ["\\\\csube", '\u2AD1'], ["\\\\csupe", '\u2AD2'], ["\\\\house", '\u2302'], ["\\\\forks", '\u2ADC'], ["\\\\Elzxh", '\u0127'], ["\\\\strns", '\u23E4'], ["\\\\eqgtr", '\u22DD'], ["\\\\forkv", '\u2AD9'], ["\\\\relax", ''], ["\\\\amalg", '\u2A3F'], ["\\\\infty", '\u221E'], ["\\\\VDash", '\u22AB'], ["\\\\fltns", '\u23E5'], ["\\\\disin", '\u22F2'], ['\\\\uplus', '\u228E'], ["\\\\angle", '\u2220'], ["\\\\pluto", '\u2647'], ["\\\\Vdash", '\u22A9'], ["\\\\cdots", '\u22EF'], ["\\\\lceil", '\u2308'], ["\\\\sqcap", '\u2293'], ["\\\\smile", '\u2323'], ["\\\\omega", '\u03C9'], ["\\\\vdots", '\u22EE'], ["\\\\arceq", '\u2258'], ["\\\\dashv", '\u22A3'], ["\\\\vdash", '\u22A2'], ["\\\\skull", '\u2620'], ["\\\\rceil", '\u2309'], ["\\\\virgo", '\u264D'], ["\\\\perps", '\u2AE1'], ["\\\\zhide", '\u29F9'], ["\\\\tplus", '\u29FE'], ["\\\\ldots", '\u2026'], ["\\\\zpipe", '\u2A20'], ["\\\\dicei", '\u2680'], ["\\\\venus", '\u2640'], ["\\\\varpi", '\u03D6'], ["\\\\Elzrh", '\u0322'], ["\\\\Qoppa", '\u03D8'], ["\\\\aries", '\u2648'], ['\\\\upint', '\u2A1B'], ["\\\\dddot", '\u20DB'], ["\\\\sqcup", '\u2294'], ["\\\\qoppa", '\u03D9'], ["\\\\Koppa", '\u03DE'], ["\\\\awint", '\u2A11'], ["\\\\koppa", '\u03DF'], ["\\\\Colon", '\u2237'], ["\\\\gescc", '\u2AA9'], ["\\\\oplus", '\u2295'], ["\\\\asymp", '\u224D'], ["\\\\isinE", '\u22F9'], ["\\\\Elzrl", '\u027C'], ["\\\\Sampi", '\u03E0'], ["\\\\sampi", '\u03E1'], ["\\\\doteq", '\u2250'], ["\\\\slash", '\u2215'], ["\\\\gnsim", '\u22E7'], ["\\\\libra", '\u264E'], ["\\\\gsiml", '\u2A90'], ["\\\\wedge", '\u2227'], ["\\\\dbend", '\uFFFD'], ["\\\\dashV", '\u2AE3'], ["\\\\Dashv", '\u2AE4'], ["\\\\DashV", '\u2AE5'], ["\\\\Sigma", '\u03A3'], ["\\\\lsimg", '\u2A8F'], ["\\\\gsime", '\u2A8E'], ["\\\\lsime", '\u2A8D'], ["\\\\Equiv", '\u2263'], ["\\\\dicev", '\u2684'], ["\\\\Gamma", '\u0393'], ["\\\\\\^\\\\j", '\u0135'], ["\\\\gtcir", '\u2A7A'], ["\\\\ltcir", '\u2A79'], ["\\\\jmath", '\u0237'], ['\\\\ularc', '\u25DC'], ["\\\\gneqq", '\u2269'], ["\\\\gimel", '\u2137'], ["\\\\lneqq", '\u2268'], ["\\\\Omega", '\u03A9'], ["\\\\Equal", '\u2A75'], ["\\\\\\^\\\\i", '\xEE'], ["\\\\aleph", '\u2135'], ["\\\\nabla", '\u2207'], ["\\\\lescc", '\u2AA8'], ["\\\\simgE", '\u2AA0'], ["\\\\sharp", '\u266F'], ["\\\\imath", '\uD835\uDEA4'], ["\\\\simlE", '\u2A9F'], ["\\\\Delta", '\u0394'], ['\\\\urarc', '\u25DD'], ["\\\\alpha", '\u03B1'], ["\\\\gamma", '\u03B3'], ["\\\\eqdot", '\u2A66'], ["\\\\Euler", '\u2107'], ["\\\\lrarc", '\u25DE'], ["\\\\late", '\u2AAD'], ["\\\\v\\ d", '\u010F'], ["\\\\hash", '\u22D5'], ["\\\\circ", '\u2218'], ["\\\\Game", '\u2141'], ["\\\\surd", '\u221A'], ["\\\\v\\ D", '\u010E'], ["\\\\Lbag", '\u27C5'], ["\\\\beth", '\u2136'], ["\\\\lnot", '\xAC'], ["\\\\Finv", '\u2132'], ["\\\\~\\\\i", '\u0129'], ["\\\\csub", '\u2ACF'], ["\\\\csup", '\u2AD0'], ["\\\\succ", '\u227B'], ["\\\\prec", '\u227A'], ["\\\\Vert", '\u2016'], ["\\\\nmid", '\u2224'], ["\\\\c\\ C", '\xC7'], ["\\\\c\\ g", '\u0123'], ["\\\\c\\ G", '\u0122'], ["\\\\not<", '\u226E'], ["\\\\dlsh", '\u21B2'], ["\\\\Barv", '\u2AE7'], ["\\\\cdot", '\xB7'], ["\\\\vBar", '\u2AE8'], ["\\\\lang", '\u27EA'], ["\\\\rang", '\u27EB'], ["\\\\Zbar", '\u01B5'], ["\\\\star", '\u22C6'], ["\\\\psur", '\u2900'], ["\\\\v\\ z", '\u017E'], ["\\\\v\\ Z", '\u017D'], ["\\\\pinj", '\u2914'], ["\\\\finj", '\u2915'], ["\\\\bNot", '\u2AED'], ['\\\\u\\ e', '\u0115'], ['\\\\u\\ g', '\u011F'], ["\\\\spot", '\u2981'], ["\\\\H\\ u", '\u0171'], ['\\\\u\\ a', '\u0103'], ["\\\\limg", '\u2987'], ["\\\\rimg", '\u2988'], ["\\\\H\\ U", '\u0170'], ['\\\\u\\ A', '\u0102'], ["\\\\obot", '\u29BA'], ['\\\\u\\ u', '\u016D'], ['\\\\u\\ U', '\u016C'], ["\\\\cirE", '\u29C3'], ['\\\\u\\ G', '\u011E'], ["\\\\XBox", '\u2612'], ["\\\\v\\ t", '\u0165'], ["\\\\v\\ T", '\u0164'], ["\\\\c\\ t", '\u0163'], ["\\\\c\\ T", '\u0162'], ["\\\\v\\ s", '\u0161'], ["\\\\v\\ S", '\u0160'], ["\\\\perp", '\u22A5'], ["\\\\c\\ s", '\u015F'], ["\\\\c\\ S", '\u015E'], ["\\\\leqq", '\u2266'], ["\\\\dsol", '\u29F6'], ["\\\\Rbag", '\u27C6'], ["\\\\xsol", '\u29F8'], ["\\\\v\\ C", '\u010C'], ["\\\\v\\ r", '\u0159'], ["\\\\odot", '\u2299'], ["\\\\v\\ R", '\u0158'], ["\\\\c\\ r", '\u0157'], ["\\\\c\\ R", '\u0156'], ["\\\\flat", '\u266D'], ["\\\\LVec", '\u20D6'], ["\\\\H\\ o", '\u0151'], ["\\\\H\\ O", '\u0150'], ['\\\\u\\ o', '\u014F'], ['\\\\u\\ O', '\u014E'], ["\\\\intx", '\u2A18'], ["\\\\lvec", '\u20D0'], ["\\\\Join", '\u2A1D'], ["\\\\zcmp", '\u2A1F'], ["\\\\pfun", '\u21F8'], ["\\\\cong", '\u2245'], ["\\\\smte", '\u2AAC'], ["\\\\v\\ N", '\u0147'], ["\\\\ffun", '\u21FB'], ["\\\\c\\ n", '\u0146'], ["\\\\c\\ N", '\u0145'], ['\\\\u\\ E', '\u0114'], ["\\\\odiv", '\u2A38'], ["\\\\fcmp", '\u2A3E'], ["\\\\mlcp", '\u2ADB'], ["\\\\v\\ l", '\u013E'], ["\\\\v\\ L", '\u013D'], ["\\\\c\\ l", '\u013C'], ["\\\\c\\ L", '\u013B'], ["\\\\\"\\\\i|\\\\\"\\{\\\\i\\}|\\\\\"i|\\\\\"\\{i\\}", '\xEF'], ["\\\\v\\ e", '\u011B'], ["\\\\ElOr", '\u2A56'], ["\\\\dsub", '\u2A64'], ["\\\\rsub", '\u2A65'], ["\\\\oint", '\u222E'], ["\\\\'\\\\i|\\\\'i", '\xED'], ["\\\\`\\\\i|\\\\`i", '\xEC'], ["\\\\c\\ k", '\u0137'], ["\\\\Same", '\u2A76'], ["\\\\c\\ K", '\u0136'], ["\\\\geqq", '\u2267'], ["\\\\c\\ c|\\\\c\\{c\\}", '\xE7'], ["\\\\prod", '\u220F'], ["\\\\v\\ E", '\u011A'], ["\\\\lneq", '\u2A87'], ["\\\\gneq", '\u2A88'], ['\\\\upin', '\u27D2'], ['\\\\u\\ I', '\u012C'], ["\\\\not>", '\u226F'], ["_\\\\ast", '\u2217'], ["\\\\iota", '\u03B9'], ["\\\\zeta", '\u03B6'], ["\\\\beta", '\u03B2'], ["\\\\male", '\u2642'], ["\\\\nisd", '\u22FA'], ["\\\\quad", '\u2001'], ["\\\\text", ''], ["\\\\v\\ c", '\u010D'], ["\\\\v\\ n", '\u0148'], ["\\\\glj", '\u2AA4'], ["\\\\int", '\u222B'], ["\\\\cup", '\u222A'], ["\\\\QED", '\u220E'], ["\\\\cap", '\u2229'], ["\\\\gla", '\u2AA5'], ["\\\\Psi", '\u03A8'], ["\\\\Phi", '\u03A6'], ["\\\\sum", '\u2211'], ["\\\\Rsh", '\u21B1'], ["\\\\vee", '\u2228'], ["\\\\Lsh", '\u21B0'], ["\\\\sim", '\u223C'], ["\\\\lhd", '\u25C1'], ["\\\\LHD", '\u25C0'], ["\\\\rhd", '\u25B7'], ["\\\\phi", '\u03D5'], ["\\\\lgE", '\u2A91'], ["\\\\glE", '\u2A92'], ["\\\\RHD", '\u25B6'], ["\\\\cat", '\u2040'], ["\\\\Yup", '\u2144'], ["\\\\vec", '\u20D1'], ["\\\\div", '\xF7'], ["\\\\mid", '\u2223'], ["\\\\mho", '\u2127'], ["\\\\psi", '\u03C8'], ["\\\\chi", '\u03C7'], ["\\\\top", '\u22A4'], ["\\\\Not", '\u2AEC'], ["\\\\tau", '\u03C4'], ["\\\\smt", '\u2AAA'], ["\\\\rho", '\u03C1'], ["\\\\sun", '\u263C'], ["\\\\Cap", '\u22D2'], ["\\\\lat", '\u2AAB'], ["\\\\leo", '\u264C'], ["\\\\Sun", '\u2609'], ["\\\\Cup", '\u22D3'], ["\\\\eta", '\u03B7'], ["\\\\Top", '\u2AEA'], ["\\\\bij", '\u2916'], ["\\\\eth", '\u01AA'], ["\\\\geq", '\u2265'], ["\\\\nis", '\u22FC'], ["\\\\leq", '\u2264'], ["\\\\ll", '\u226A'], ["\\\\dj", '\u0111'], ["\\\\in", '\u2208'], ["\\\\\\-", '\xAD'], ["\\\\th", '\xFE'], ["\\\\wp", '\u2118'], ["\\\\aa", '\xE5'], ["\\\\ss", '\xDF'], ["\\\\ae", '\xE6'], ["\\\\ng", '\u014B'], ["\\\\mu", '\u03BC'], ["''''", '\u2057'], ["\\\\pi", '\u03C0'], ["\\\\gg", '\u226B'], ["\\\\xi", '\u03BE'], ["\\\\ni", '\u220B'], ["\\\\nu", '\u03BD'], ["\\\\pm", '\xB1'], ["\\\\mp", '\u2213'], ["\\\\wr", '\u2240'], ["\\\\\\.", '\u0307'], ["\\\\dh", '\xF0'], ["\\\\oe", '\u0153'], ['\\\\url', '\\XXurl'], ['\\\\u', '\u0306'], ["\\\\XXurl", '\\url'], ["\\\\L", '\u0141'], ["\\\\c", '\xB8'], ["\\\\i", '\u0131'], ["\\\\k", '\u02DB'], ["\\\\H", '\u02DD'], ["\\\\\"", '\u0308'], ["\\\\v", '\u030C'], ["\\\\o", '\xF8'], ["\\\\`", '\u0300'], ["\\\\'", '\u0301'], ["\\\\~", '\u0303'], ["\\\\r", '\u02DA'], ["\\\\O", '\xD8'], ["\\\\=", '\u0304'], ["\\\\l", '\u0142'], ["'''", '\u2034'], ["\\\\textasciitilde", '\\~']];

/***/ }),
/* 144 */
/*!************************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/import/name-parser.js ***!
  \************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexNameParser = undefined;

var _classCallCheck2 = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ 23);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(/*! babel-runtime/helpers/createClass */ 24);

var _createClass3 = _interopRequireDefault(_createClass2);

var _literalParser = __webpack_require__(/*! ./literal-parser */ 85);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BibLatexNameParser = exports.BibLatexNameParser = function () {
    function BibLatexNameParser(nameString) {
        (0, _classCallCheck3.default)(this, BibLatexNameParser);

        this.nameString = nameString.trim();
        this.nameDict = {};
        this._particle = [];
        this._suffix = [];
    }

    (0, _createClass3.default)(BibLatexNameParser, [{
        key: 'parseName',
        value: function parseName() {
            var parts = this.splitTexString(this.nameString, ',');
            if (parts.length > 1 && this.nameString.includes('=')) {
                // extended name detected.
                this.parseExtendedName(parts);
            } else if (parts.length === 3) {
                // von Last, Jr, First
                this.processVonLast(this.splitTexString(parts[0].replace(/[{}]/g, '')), this.splitTexString(parts[1]));
                this.processFirstMiddle(this.splitTexString(parts[2]));
            } else if (parts.length === 2) {
                // von Last, First
                this.processVonLast(this.splitTexString(parts[0].replace(/[{}]/g, '')));
                this.processFirstMiddle(this.splitTexString(parts[1]));
            } else if (parts.length === 1) {
                // First von Last
                var spacedParts = this.splitTexString(this.nameString);
                if (spacedParts.length === 1) {
                    if (this.nameString[0] === '{' && this.nameString[this.nameString.length - 1] === '}' && this.nameString.includes('=') && this.nameString.includes(',') && this.nameString.includes(' ') && (this.nameString.includes('given') || this.nameString.includes('family'))) {
                        parts = this.splitTexString(this.nameString.slice(1, this.nameString.length - 1), ',');
                        // extended name detected.
                        this.parseExtendedName(parts);
                    } else {
                        this.nameDict['literal'] = this._reformLiteral(spacedParts[0]);
                    }
                } else {
                    var split = this.splitAt(spacedParts);
                    var firstMiddle = split[0];
                    var vonLast = split[1];
                    if (vonLast.length === 0 && firstMiddle.length > 1) {
                        var last = firstMiddle.pop();
                        vonLast.push(last);
                    }
                    this.processFirstMiddle(firstMiddle);
                    this.processVonLast(vonLast);
                }
            } else {
                this.nameDict['literal'] = this._reformLiteral(this.nameString.trim());
            }
        }
    }, {
        key: 'parseExtendedName',
        value: function parseExtendedName(parts) {
            var _this = this;

            parts.forEach(function (part) {
                var attrParts = part.trim().replace(/^\"|\"$/g, '').split('=');
                var attrName = attrParts.shift().trim().toLowerCase();
                if (['family', 'given', 'prefix', 'suffix'].includes(attrName)) {
                    _this.nameDict[attrName] = _this._reformLiteral(attrParts.join('=').trim());
                } else if (attrName === 'useprefix') {
                    if (attrParts.join('').trim().toLowerCase() === 'true') {
                        _this.nameDict['useprefix'] = true;
                    } else {
                        _this.nameDict['useprefix'] = false;
                    }
                }
            });
        }
    }, {
        key: 'splitTexString',
        value: function splitTexString(string) {
            var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '[\\s~]+';

            var braceLevel = 0;
            var inQuotes = false;
            var nameStart = 0;
            var result = [];
            var stringLen = string.length;
            var pos = 0;
            while (pos < stringLen) {
                var char = string.charAt(pos);
                switch (char) {
                    case '{':
                        braceLevel += 1;
                        break;
                    case '}':
                        braceLevel -= 1;
                        break;
                    case '"':
                        inQuotes = !inQuotes;
                        break;
                    case '\\':
                        // skip next
                        pos++;
                        break;
                    default:
                        if (braceLevel === 0 && inQuotes === false && pos > 0) {
                            var match = string.slice(pos).match(RegExp('^' + sep));
                            if (match) {
                                var sepLen = match[0].length;
                                if (pos + sepLen < stringLen) {
                                    result.push(string.slice(nameStart, pos));
                                    nameStart = pos + sepLen;
                                }
                            }
                        }
                }

                pos++;
            }
            if (nameStart < stringLen) {
                result.push(string.slice(nameStart));
            }
            return result;
        }
    }, {
        key: 'processFirstMiddle',
        value: function processFirstMiddle(parts) {
            this.nameDict['given'] = this._reformLiteral(parts.join(' ').trim());
        }
    }, {
        key: 'processVonLast',
        value: function processVonLast(parts) {
            var lineage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            var rSplit = this.rsplitAt(parts);
            var von = rSplit[0];
            var last = rSplit[1];
            if (von && !last) {
                last.push(von.pop());
            }
            if (von.length) {
                this.nameDict['prefix'] = this._reformLiteral(von.join(' ').trim());
                this.nameDict['useprefix'] = true; // The info at hand is not clear, so we guess.
            }
            if (lineage.length) {
                this.nameDict['suffix'] = this._reformLiteral(lineage.join(' ').trim());
            }
            this.nameDict['family'] = this._reformLiteral(last.join(' ').trim());
        }
    }, {
        key: 'findFirstLowerCaseWord',
        value: function findFirstLowerCaseWord(lst) {
            // return index of first lowercase word in lst. Else return length of lst.
            for (var i = 0; i < lst.length; i++) {
                var word = lst[i];
                if (word === word.toLowerCase()) {
                    return i;
                }
            }
            return lst.length;
        }
    }, {
        key: 'splitAt',
        value: function splitAt(lst) {
            // Split the given list into two parts.
            // The second part starts with the first lowercase word.
            var pos = this.findFirstLowerCaseWord(lst);
            return [lst.slice(0, pos), lst.slice(pos)];
        }
    }, {
        key: 'rsplitAt',
        value: function rsplitAt(lst) {
            var rpos = this.findFirstLowerCaseWord(lst.slice().reverse());
            var pos = lst.length - rpos;
            return [lst.slice(0, pos), lst.slice(pos)];
        }
    }, {
        key: '_reformLiteral',
        value: function _reformLiteral(litString) {
            var parser = new _literalParser.BibLatexLiteralParser(litString);
            return parser.output;
        }
    }, {
        key: 'output',
        get: function get() {
            this.parseName();
            return this.nameDict;
        }
    }]);
    return BibLatexNameParser;
}();

/***/ }),
/* 145 */
/*!******************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/import/tools.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.splitTeXString = splitTeXString;
// split at each occurence of splitToken, but only if no braces are currently open.
function splitTeXString(texString) {
    var splitToken = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'and';

    var output = [];
    var tokenRe = /([^\s{}]+|\s|{|})/g;
    var j = 0;
    var k = 0;
    var item = void 0;
    while ((item = tokenRe.exec(texString)) !== null) {
        var token = item[0];
        if (k === output.length) {
            output.push('');
        }
        switch (token) {
            case '{':
                j += 1;
                output[k] += token;
                break;
            case '}':
                j -= 1;
                output[k] += token;
                break;
            case splitToken:
                if (0 === j) {
                    k++;
                } else {
                    output[k] += token;
                }
                break;
            default:
                output[k] += token;
        }
    }
    return output;
}

/***/ }),
/* 146 */
/*!*********************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/edtf/src/parser.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nearley = __webpack_require__(/*! nearley */ 147);
var grammar = __webpack_require__(/*! ./grammar */ 148);

function byLevel(a, b) {
  return a.level < b.level ? -1 : a.level > b.level ? 1 : 0;
}

function limit(results, _ref) {
  var level = _ref.level,
      types = _ref.types;

  if (!results.length) return results;
  if (typeof level !== 'number') level = 2;

  return results.filter(function (res) {
    return level >= res.level && (!types || types.includes(res.type));
  });
}

function best(results) {
  if (results.length < 2) return results[0];

  // If there are multiple results, pick the first
  // one on the lowest level!
  return results.sort(byLevel)[0];
}

module.exports = {
  parse: function parse(input) {
    var constraints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    try {
      var nep = module.exports.parser();
      var res = best(limit(nep.feed(input).results, constraints));

      if (!res) throw new Error('edtf: No possible parsings (@EOS)');

      return res;
    } catch (error) {
      error.message += ' for "' + input + '"';
      throw error;
    }
  },
  parser: function parser() {
    return new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  }
};

/***/ }),
/* 147 */
/*!**********************************************!*\
  !*** ../node_modules/nearley/lib/nearley.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.nearley = factory();
    }
}(this, function() {

function Rule(name, symbols, postprocess) {
    this.id = ++Rule.highestId;
    this.name = name;
    this.symbols = symbols;        // a list of literal | regex class | nonterminal
    this.postprocess = postprocess;
    return this;
}
Rule.highestId = 0;

Rule.prototype.toString = function(withCursorAt) {
    function stringifySymbolSequence (e) {
        return e.literal ? JSON.stringify(e.literal) :
               e.type ? '%' + e.type : e.toString();
    }
    var symbolSequence = (typeof withCursorAt === "undefined")
                         ? this.symbols.map(stringifySymbolSequence).join(' ')
                         : (   this.symbols.slice(0, withCursorAt).map(stringifySymbolSequence).join(' ')
                             + " ● "
                             + this.symbols.slice(withCursorAt).map(stringifySymbolSequence).join(' ')     );
    return this.name + " → " + symbolSequence;
}


// a State is a rule at a position from a given starting point in the input stream (reference)
function State(rule, dot, reference, wantedBy) {
    this.rule = rule;
    this.dot = dot;
    this.reference = reference;
    this.data = [];
    this.wantedBy = wantedBy;
    this.isComplete = this.dot === rule.symbols.length;
}

State.prototype.toString = function() {
    return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
};

State.prototype.nextState = function(child) {
    var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
    state.left = this;
    state.right = child;
    if (state.isComplete) {
        state.data = state.build();
    }
    return state;
};

State.prototype.build = function() {
    var children = [];
    var node = this;
    do {
        children.push(node.right.data);
        node = node.left;
    } while (node.left);
    children.reverse();
    return children;
};

State.prototype.finish = function() {
    if (this.rule.postprocess) {
        this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
    }
};


function Column(grammar, index) {
    this.grammar = grammar;
    this.index = index;
    this.states = [];
    this.wants = {}; // states indexed by the non-terminal they expect
    this.scannable = []; // list of states that expect a token
    this.completed = {}; // states that are nullable
}


Column.prototype.process = function(nextColumn) {
    var states = this.states;
    var wants = this.wants;
    var completed = this.completed;

    for (var w = 0; w < states.length; w++) { // nb. we push() during iteration
        var state = states[w];

        if (state.isComplete) {
            state.finish();
            if (state.data !== Parser.fail) {
                // complete
                var wantedBy = state.wantedBy;
                for (var i = wantedBy.length; i--; ) { // this line is hot
                    var left = wantedBy[i];
                    this.complete(left, state);
                }

                // special-case nullables
                if (state.reference === this.index) {
                    // make sure future predictors of this rule get completed.
                    var exp = state.rule.name;
                    (this.completed[exp] = this.completed[exp] || []).push(state);
                }
            }

        } else {
            // queue scannable states
            var exp = state.rule.symbols[state.dot];
            if (typeof exp !== 'string') {
                this.scannable.push(state);
                continue;
            }

            // predict
            if (wants[exp]) {
                wants[exp].push(state);

                if (completed.hasOwnProperty(exp)) {
                    var nulls = completed[exp];
                    for (var i = 0; i < nulls.length; i++) {
                        var right = nulls[i];
                        this.complete(state, right);
                    }
                }
            } else {
                wants[exp] = [state];
                this.predict(exp);
            }
        }
    }
}

Column.prototype.predict = function(exp) {
    var rules = this.grammar.byName[exp] || [];

    for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        var wantedBy = this.wants[exp];
        var s = new State(r, 0, this.index, wantedBy);
        this.states.push(s);
    }
}

Column.prototype.complete = function(left, right) {
    var inp = right.rule.name;
    if (left.rule.symbols[left.dot] === inp) {
        var copy = left.nextState(right);
        this.states.push(copy);
    }
}


function Grammar(rules, start) {
    this.rules = rules;
    this.start = start || this.rules[0].name;
    var byName = this.byName = {};
    this.rules.forEach(function(rule) {
        if (!byName.hasOwnProperty(rule.name)) {
            byName[rule.name] = [];
        }
        byName[rule.name].push(rule);
    });
}

// So we can allow passing (rules, start) directly to Parser for backwards compatibility
Grammar.fromCompiled = function(rules, start) {
    var lexer = rules.Lexer;
    if (rules.ParserStart) {
      start = rules.ParserStart;
      rules = rules.ParserRules;
    }
    var rules = rules.map(function (r) { return (new Rule(r.name, r.symbols, r.postprocess)); });
    var g = new Grammar(rules, start);
    g.lexer = lexer; // nb. storing lexer on Grammar is iffy, but unavoidable
    return g;
}


function StreamLexer() {
  this.reset("");
}

StreamLexer.prototype.reset = function(data, state) {
    this.buffer = data;
    this.index = 0;
    this.line = state ? state.line : 1;
    this.lastLineBreak = state ? -state.col : 0;
}

StreamLexer.prototype.next = function() {
    if (this.index < this.buffer.length) {
        var ch = this.buffer[this.index++];
        if (ch === '\n') {
          this.line += 1;
          this.lastLineBreak = this.index;
        }
        return {value: ch};
    }
}

StreamLexer.prototype.save = function() {
  return {
    line: this.line,
    col: this.index - this.lastLineBreak,
  }
}

StreamLexer.prototype.formatError = function(token, message) {
    // nb. this gets called after consuming the offending token,
    // so the culprit is index-1
    var buffer = this.buffer;
    if (typeof buffer === 'string') {
        var nextLineBreak = buffer.indexOf('\n', this.index);
        if (nextLineBreak === -1) nextLineBreak = buffer.length;
        var line = buffer.substring(this.lastLineBreak, nextLineBreak)
        var col = this.index - this.lastLineBreak;
        message += " at line " + this.line + " col " + col + ":\n\n";
        message += "  " + line + "\n"
        message += "  " + Array(col).join(" ") + "^"
        return message;
    } else {
        return message + " at index " + (this.index - 1);
    }
}


function Parser(rules, start, options) {
    if (rules instanceof Grammar) {
        var grammar = rules;
        var options = start;
    } else {
        var grammar = Grammar.fromCompiled(rules, start);
    }
    this.grammar = grammar;

    // Read options
    this.options = {
        keepHistory: false,
        lexer: grammar.lexer || new StreamLexer,
    };
    for (var key in (options || {})) {
        this.options[key] = options[key];
    }

    // Setup lexer
    this.lexer = this.options.lexer;
    this.lexerState = undefined;

    // Setup a table
    var column = new Column(grammar, 0);
    var table = this.table = [column];

    // I could be expecting anything.
    column.wants[grammar.start] = [];
    column.predict(grammar.start);
    // TODO what if start rule is nullable?
    column.process();
    this.current = 0; // token index
}

// create a reserved token for indicating a parse fail
Parser.fail = {};

Parser.prototype.feed = function(chunk) {
    var lexer = this.lexer;
    lexer.reset(chunk, this.lexerState);

    var token;
    while (token = lexer.next()) {
        // We add new states to table[current+1]
        var column = this.table[this.current];

        // GC unused states
        if (!this.options.keepHistory) {
            delete this.table[this.current - 1];
        }

        var n = this.current + 1;
        var nextColumn = new Column(this.grammar, n);
        this.table.push(nextColumn);

        // Advance all tokens that expect the symbol
        var literal = token.value;
        var value = lexer.constructor === StreamLexer ? token.value : token;
        var scannable = column.scannable;
        for (var w = scannable.length; w--; ) {
            var state = scannable[w];
            var expect = state.rule.symbols[state.dot];
            // Try to consume the token
            // either regex or literal
            if (expect.test ? expect.test(value) :
                expect.type ? expect.type === token.type
                            : expect.literal === literal) {
                // Add it
                var next = state.nextState({data: value, token: token, isToken: true, reference: n - 1});
                nextColumn.states.push(next);
            }
        }

        // Next, for each of the rules, we either
        // (a) complete it, and try to see if the reference row expected that
        //     rule
        // (b) predict the next nonterminal it expects by adding that
        //     nonterminal's start state
        // To prevent duplication, we also keep track of rules we have already
        // added

        nextColumn.process();

        // If needed, throw an error:
        if (nextColumn.states.length === 0) {
            // No states at all! This is not good.
            var message = this.lexer.formatError(token, "invalid syntax") + "\n";
            message += "Unexpected " + (token.type ? token.type + " token: " : "");
            message += JSON.stringify(token.value !== undefined ? token.value : token) + "\n";
            var err = new Error(message);
            err.offset = this.current;
            err.token = token;
            throw err;
        }

        // maybe save lexer state
        if (this.options.keepHistory) {
          column.lexerState = lexer.save()
        }

        this.current++;
    }
    if (column) {
      this.lexerState = lexer.save()
    }

    // Incrementally keep track of results
    this.results = this.finish();

    // Allow chaining, for whatever it's worth
    return this;
};

Parser.prototype.save = function() {
    var column = this.table[this.current];
    column.lexerState = this.lexerState;
    return column;
};

Parser.prototype.restore = function(column) {
    var index = column.index;
    this.current = index;
    this.table[index] = column;
    this.table.splice(index + 1);
    this.lexerState = column.lexerState;

    // Incrementally keep track of results
    this.results = this.finish();
};

// nb. deprecated: use save/restore instead!
Parser.prototype.rewind = function(index) {
    if (!this.options.keepHistory) {
        throw new Error('set option `keepHistory` to enable rewinding')
    }
    // nb. recall column (table) indicies fall between token indicies.
    //        col 0   --   token 0   --   col 1
    this.restore(this.table[index]);
};

Parser.prototype.finish = function() {
    // Return the possible parsings
    var considerations = [];
    var start = this.grammar.start;
    var column = this.table[this.table.length - 1]
    column.states.forEach(function (t) {
        if (t.rule.name === start
                && t.dot === t.rule.symbols.length
                && t.reference === 0
                && t.data !== Parser.fail) {
            considerations.push(t);
        }
    });
    return considerations.map(function(c) {return c.data; });
};

return {
    Parser: Parser,
    Grammar: Grammar,
    Rule: Rule,
};

}));


/***/ }),
/* 148 */
/*!**********************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/edtf/src/grammar.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _toConsumableArray2 = __webpack_require__(/*! babel-runtime/helpers/toConsumableArray */ 81);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) {
    return x[0];
  }

  var _require = __webpack_require__(/*! ./util */ 149),
      num = _require.num,
      zero = _require.zero,
      nothing = _require.nothing,
      pick = _require.pick,
      pluck = _require.pluck,
      join = _require.join,
      concat = _require.concat,
      merge = _require.merge,
      century = _require.century,
      interval = _require.interval,
      list = _require.list,
      masked = _require.masked,
      date = _require.date,
      datetime = _require.datetime,
      season = _require.season,
      qualify = _require.qualify,
      year = _require.year,
      decade = _require.decade;

  var _require2 = __webpack_require__(/*! ./bitmask */ 87),
      DAY = _require2.DAY,
      MONTH = _require2.MONTH,
      YEAR = _require2.YEAR,
      YMD = _require2.YMD,
      YM = _require2.YM,
      MD = _require2.MD,
      YYXX = _require2.YYXX,
      YYYX = _require2.YYYX,
      XXXX = _require2.XXXX;

  var grammar = {
    ParserRules: [{ "name": "edtf", "symbols": ["L0"], "postprocess": id }, { "name": "edtf", "symbols": ["L1"], "postprocess": id }, { "name": "edtf", "symbols": ["L2"], "postprocess": id }, { "name": "L0", "symbols": ["date_time"], "postprocess": id }, { "name": "L0", "symbols": ["century"], "postprocess": id }, { "name": "L0", "symbols": ["L0i"], "postprocess": id }, { "name": "L0i", "symbols": ["date_time", { "literal": "/" }, "date_time"], "postprocess": interval(0) }, { "name": "century", "symbols": ["positive_century"], "postprocess": function postprocess(data) {
        return century(data[0]);
      } }, { "name": "century$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "century", "symbols": ["century$string$1"], "postprocess": function postprocess(data) {
        return century(0);
      } }, { "name": "century", "symbols": [{ "literal": "-" }, "positive_century"], "postprocess": function postprocess(data) {
        return century(-data[1]);
      } }, { "name": "positive_century", "symbols": ["positive_digit", "digit"], "postprocess": num }, { "name": "positive_century", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": num }, { "name": "date_time", "symbols": ["date"], "postprocess": id }, { "name": "date_time", "symbols": ["datetime"], "postprocess": id }, { "name": "date", "symbols": ["year"], "postprocess": function postprocess(data) {
        return date(data);
      } }, { "name": "date", "symbols": ["year_month"], "postprocess": function postprocess(data) {
        return date(data[0]);
      } }, { "name": "date", "symbols": ["year_month_day"], "postprocess": function postprocess(data) {
        return date(data[0]);
      } }, { "name": "year", "symbols": ["positive_year"], "postprocess": id }, { "name": "year", "symbols": ["negative_year"], "postprocess": id }, { "name": "year$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "year", "symbols": ["year$string$1"], "postprocess": join }, { "name": "positive_year", "symbols": ["positive_digit", "digit", "digit", "digit"], "postprocess": join }, { "name": "positive_year", "symbols": [{ "literal": "0" }, "positive_digit", "digit", "digit"], "postprocess": join }, { "name": "positive_year$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_year", "symbols": ["positive_year$string$1", "positive_digit", "digit"], "postprocess": join }, { "name": "positive_year$string$2", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_year", "symbols": ["positive_year$string$2", "positive_digit"], "postprocess": join }, { "name": "negative_year", "symbols": [{ "literal": "-" }, "positive_year"], "postprocess": join }, { "name": "year_month", "symbols": ["year", { "literal": "-" }, "month"], "postprocess": pick(0, 2) }, { "name": "year_month_day", "symbols": ["year", { "literal": "-" }, "month_day"], "postprocess": pick(0, 2) }, { "name": "month", "symbols": ["d01_12"], "postprocess": id }, { "name": "month_day", "symbols": ["m31", { "literal": "-" }, "day"], "postprocess": pick(0, 2) }, { "name": "month_day", "symbols": ["m30", { "literal": "-" }, "d01_30"], "postprocess": pick(0, 2) }, { "name": "month_day$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "month_day", "symbols": ["month_day$string$1", { "literal": "-" }, "d01_29"], "postprocess": pick(0, 2) }, { "name": "day", "symbols": ["d01_31"], "postprocess": id }, { "name": "datetime$ebnf$1$subexpression$1", "symbols": ["timezone"], "postprocess": id }, { "name": "datetime$ebnf$1", "symbols": ["datetime$ebnf$1$subexpression$1"], "postprocess": id }, { "name": "datetime$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "datetime", "symbols": ["year_month_day", { "literal": "T" }, "time", "datetime$ebnf$1"], "postprocess": datetime }, { "name": "time", "symbols": ["hours", { "literal": ":" }, "minutes", { "literal": ":" }, "seconds", "milliseconds"], "postprocess": pick(0, 2, 4, 5) }, { "name": "time$string$1", "symbols": [{ "literal": "2" }, { "literal": "4" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "time", "symbols": ["time$string$1"], "postprocess": function postprocess() {
        return [24, 0, 0];
      } }, { "name": "hours", "symbols": ["d00_23"], "postprocess": num }, { "name": "minutes", "symbols": ["d00_59"], "postprocess": num }, { "name": "seconds", "symbols": ["d00_59"], "postprocess": num }, { "name": "milliseconds", "symbols": [] }, { "name": "milliseconds", "symbols": [{ "literal": "." }, "d3"], "postprocess": function postprocess(data) {
        return num(data.slice(1));
      } }, { "name": "timezone", "symbols": [{ "literal": "Z" }], "postprocess": zero }, { "name": "timezone", "symbols": [{ "literal": "-" }, "offset"], "postprocess": function postprocess(data) {
        return -data[1];
      } }, { "name": "timezone", "symbols": [{ "literal": "+" }, "positive_offset"], "postprocess": pick(1) }, { "name": "positive_offset", "symbols": ["offset"], "postprocess": id }, { "name": "positive_offset$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset", "symbols": ["positive_offset$string$1"], "postprocess": zero }, { "name": "positive_offset$subexpression$1$string$1", "symbols": [{ "literal": "1" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset$subexpression$1", "symbols": ["positive_offset$subexpression$1$string$1"] }, { "name": "positive_offset$subexpression$1$string$2", "symbols": [{ "literal": "1" }, { "literal": "3" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset$subexpression$1", "symbols": ["positive_offset$subexpression$1$string$2"] }, { "name": "positive_offset", "symbols": ["positive_offset$subexpression$1", { "literal": ":" }, "minutes"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60 + data[2];
      } }, { "name": "positive_offset$string$2", "symbols": [{ "literal": "1" }, { "literal": "4" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset", "symbols": ["positive_offset$string$2"], "postprocess": function postprocess() {
        return 840;
      } }, { "name": "positive_offset", "symbols": ["d00_14"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60;
      } }, { "name": "offset", "symbols": ["d01_11", { "literal": ":" }, "minutes"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60 + data[2];
      } }, { "name": "offset$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": ":" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "offset", "symbols": ["offset$string$1", "d01_59"], "postprocess": function postprocess(data) {
        return num(data[1]);
      } }, { "name": "offset$string$2", "symbols": [{ "literal": "1" }, { "literal": "2" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "offset", "symbols": ["offset$string$2"], "postprocess": function postprocess() {
        return 720;
      } }, { "name": "offset", "symbols": ["d01_12"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60;
      } }, { "name": "L1", "symbols": ["L1d"], "postprocess": id }, { "name": "L1", "symbols": ["L1Y"], "postprocess": id }, { "name": "L1", "symbols": ["L1S"], "postprocess": id }, { "name": "L1", "symbols": ["L1i"], "postprocess": id }, { "name": "L1d", "symbols": ["date_ua"], "postprocess": id }, { "name": "L1d", "symbols": ["L1X"], "postprocess": merge(0, { type: 'Date', level: 1 }) }, { "name": "date_ua", "symbols": ["date", "UA"], "postprocess": merge(0, 1, { level: 1 }) }, { "name": "L1i", "symbols": ["L1i_date", { "literal": "/" }, "L1i_date"], "postprocess": interval(1) }, { "name": "L1i", "symbols": ["date_time", { "literal": "/" }, "L1i_date"], "postprocess": interval(1) }, { "name": "L1i", "symbols": ["L1i_date", { "literal": "/" }, "date_time"], "postprocess": interval(1) }, { "name": "L1i_date", "symbols": [], "postprocess": nothing }, { "name": "L1i_date", "symbols": ["date_ua"], "postprocess": id }, { "name": "L1i_date", "symbols": ["INFINITY"], "postprocess": id }, { "name": "INFINITY", "symbols": [{ "literal": "*" }], "postprocess": function postprocess() {
        return Infinity;
      } }, { "name": "L1X$string$1", "symbols": [{ "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["nd4", { "literal": "-" }, "md", "L1X$string$1"], "postprocess": masked() }, { "name": "L1X$string$2", "symbols": [{ "literal": "-" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["nd4", "L1X$string$2"], "postprocess": masked() }, { "name": "L1X$string$3", "symbols": [{ "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["L1X$string$3"], "postprocess": masked() }, { "name": "L1X$string$4", "symbols": [{ "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["nd4", "L1X$string$4"], "postprocess": masked() }, { "name": "L1X$string$5", "symbols": [{ "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["L1X$string$5"], "postprocess": masked() }, { "name": "L1X$string$6", "symbols": [{ "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["nd2", "L1X$string$6"], "postprocess": masked() }, { "name": "L1X", "symbols": ["nd3", { "literal": "X" }], "postprocess": masked() }, { "name": "L1X$string$7", "symbols": [{ "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["L1X$string$7"], "postprocess": masked() }, { "name": "L1Y", "symbols": [{ "literal": "Y" }, "d5+"], "postprocess": function postprocess(data) {
        return year([num(data[1])], 1);
      } }, { "name": "L1Y$string$1", "symbols": [{ "literal": "Y" }, { "literal": "-" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1Y", "symbols": ["L1Y$string$1", "d5+"], "postprocess": function postprocess(data) {
        return year([-num(data[1])], 1);
      } }, { "name": "UA", "symbols": [{ "literal": "?" }], "postprocess": function postprocess() {
        return { uncertain: true };
      } }, { "name": "UA", "symbols": [{ "literal": "~" }], "postprocess": function postprocess() {
        return { approximate: true };
      } }, { "name": "UA", "symbols": [{ "literal": "%" }], "postprocess": function postprocess() {
        return { approximate: true, uncertain: true };
      } }, { "name": "L1S", "symbols": ["year", { "literal": "-" }, "d21_24"], "postprocess": function postprocess(data) {
        return season(data, 1);
      } }, { "name": "L2", "symbols": ["L2d"], "postprocess": id }, { "name": "L2", "symbols": ["L2Y"], "postprocess": id }, { "name": "L2", "symbols": ["L2S"], "postprocess": id }, { "name": "L2", "symbols": ["L2D"], "postprocess": id }, { "name": "L2", "symbols": ["L2i"], "postprocess": id }, { "name": "L2", "symbols": ["set"], "postprocess": id }, { "name": "L2", "symbols": ["list"], "postprocess": id }, { "name": "L2d", "symbols": ["ua_date"], "postprocess": id }, { "name": "L2d", "symbols": ["L2X"], "postprocess": merge(0, { type: 'Date', level: 2 }) }, { "name": "L2D", "symbols": ["decade"], "postprocess": id }, { "name": "L2D", "symbols": ["decade", "UA"], "postprocess": merge(0, 1) }, { "name": "ua_date", "symbols": ["ua_year"], "postprocess": qualify }, { "name": "ua_date", "symbols": ["ua_year_month"], "postprocess": qualify }, { "name": "ua_date", "symbols": ["ua_year_month_day"], "postprocess": qualify }, { "name": "ua_year", "symbols": ["UA", "year"], "postprocess": function postprocess(data) {
        return [data];
      } }, { "name": "ua_year_month$macrocall$2", "symbols": ["year"] }, { "name": "ua_year_month$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$1$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$1$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$1", "symbols": ["ua_year_month$macrocall$1$ebnf$1", "ua_year_month$macrocall$2", "ua_year_month$macrocall$1$ebnf$2"] }, { "name": "ua_year_month$macrocall$4", "symbols": ["month"] }, { "name": "ua_year_month$macrocall$3$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$3$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$3$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$3$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$3", "symbols": ["ua_year_month$macrocall$3$ebnf$1", "ua_year_month$macrocall$4", "ua_year_month$macrocall$3$ebnf$2"] }, { "name": "ua_year_month", "symbols": ["ua_year_month$macrocall$1", { "literal": "-" }, "ua_year_month$macrocall$3"], "postprocess": pluck(0, 2) }, { "name": "ua_year_month_day$macrocall$2", "symbols": ["year"] }, { "name": "ua_year_month_day$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month_day$macrocall$1$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month_day$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month_day$macrocall$1$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month_day$macrocall$1", "symbols": ["ua_year_month_day$macrocall$1$ebnf$1", "ua_year_month_day$macrocall$2", "ua_year_month_day$macrocall$1$ebnf$2"] }, { "name": "ua_year_month_day", "symbols": ["ua_year_month_day$macrocall$1", { "literal": "-" }, "ua_month_day"], "postprocess": function postprocess(data) {
        return [data[0]].concat((0, _toConsumableArray3.default)(data[2]));
      } }, { "name": "ua_month_day$macrocall$2", "symbols": ["m31"] }, { "name": "ua_month_day$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$1$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$1$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$1", "symbols": ["ua_month_day$macrocall$1$ebnf$1", "ua_month_day$macrocall$2", "ua_month_day$macrocall$1$ebnf$2"] }, { "name": "ua_month_day$macrocall$4", "symbols": ["day"] }, { "name": "ua_month_day$macrocall$3$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$3$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$3$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$3$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$3", "symbols": ["ua_month_day$macrocall$3$ebnf$1", "ua_month_day$macrocall$4", "ua_month_day$macrocall$3$ebnf$2"] }, { "name": "ua_month_day", "symbols": ["ua_month_day$macrocall$1", { "literal": "-" }, "ua_month_day$macrocall$3"], "postprocess": pluck(0, 2) }, { "name": "ua_month_day$macrocall$6", "symbols": ["m30"] }, { "name": "ua_month_day$macrocall$5$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$5$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$5$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$5$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$5", "symbols": ["ua_month_day$macrocall$5$ebnf$1", "ua_month_day$macrocall$6", "ua_month_day$macrocall$5$ebnf$2"] }, { "name": "ua_month_day$macrocall$8", "symbols": ["d01_30"] }, { "name": "ua_month_day$macrocall$7$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$7$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$7$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$7$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$7", "symbols": ["ua_month_day$macrocall$7$ebnf$1", "ua_month_day$macrocall$8", "ua_month_day$macrocall$7$ebnf$2"] }, { "name": "ua_month_day", "symbols": ["ua_month_day$macrocall$5", { "literal": "-" }, "ua_month_day$macrocall$7"], "postprocess": pluck(0, 2) }, { "name": "ua_month_day$macrocall$10$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "ua_month_day$macrocall$10", "symbols": ["ua_month_day$macrocall$10$string$1"] }, { "name": "ua_month_day$macrocall$9$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$9$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$9$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$9$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$9", "symbols": ["ua_month_day$macrocall$9$ebnf$1", "ua_month_day$macrocall$10", "ua_month_day$macrocall$9$ebnf$2"] }, { "name": "ua_month_day$macrocall$12", "symbols": ["d01_29"] }, { "name": "ua_month_day$macrocall$11$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$11$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$11$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$11$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$11", "symbols": ["ua_month_day$macrocall$11$ebnf$1", "ua_month_day$macrocall$12", "ua_month_day$macrocall$11$ebnf$2"] }, { "name": "ua_month_day", "symbols": ["ua_month_day$macrocall$9", { "literal": "-" }, "ua_month_day$macrocall$11"], "postprocess": pluck(0, 2) }, { "name": "L2X", "symbols": ["dx4"], "postprocess": masked() }, { "name": "L2X", "symbols": ["dx4", { "literal": "-" }, "mx"], "postprocess": masked() }, { "name": "L2X", "symbols": ["dx4", { "literal": "-" }, "mdx"], "postprocess": masked() }, { "name": "mdx", "symbols": ["m31x", { "literal": "-" }, "d31x"], "postprocess": join }, { "name": "mdx", "symbols": ["m30x", { "literal": "-" }, "d30x"], "postprocess": join }, { "name": "mdx$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }, { "literal": "-" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "mdx", "symbols": ["mdx$string$1", "d29x"], "postprocess": join }, { "name": "L2i", "symbols": ["L2i_date", { "literal": "/" }, "L2i_date"], "postprocess": interval(2) }, { "name": "L2i", "symbols": ["date_time", { "literal": "/" }, "L2i_date"], "postprocess": interval(2) }, { "name": "L2i", "symbols": ["L2i_date", { "literal": "/" }, "date_time"], "postprocess": interval(2) }, { "name": "L2i_date", "symbols": [], "postprocess": nothing }, { "name": "L2i_date", "symbols": ["ua_date"], "postprocess": id }, { "name": "L2i_date", "symbols": ["L2X"], "postprocess": id }, { "name": "L2i_date", "symbols": ["INFINITY"], "postprocess": id }, { "name": "L2Y", "symbols": ["exp_year"], "postprocess": id }, { "name": "L2Y", "symbols": ["exp_year", "significant_digits"], "postprocess": merge(0, 1) }, { "name": "L2Y", "symbols": ["L1Y", "significant_digits"], "postprocess": merge(0, 1, { level: 2 }) }, { "name": "L2Y", "symbols": ["year", "significant_digits"], "postprocess": function postprocess(data) {
        return year([data[0]], 2, data[1]);
      } }, { "name": "significant_digits", "symbols": [{ "literal": "S" }, "positive_digit"], "postprocess": function postprocess(data) {
        return { significant: num(data[1]) };
      } }, { "name": "exp_year", "symbols": [{ "literal": "Y" }, "exp"], "postprocess": function postprocess(data) {
        return year([data[1]], 2);
      } }, { "name": "exp_year$string$1", "symbols": [{ "literal": "Y" }, { "literal": "-" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "exp_year", "symbols": ["exp_year$string$1", "exp"], "postprocess": function postprocess(data) {
        return year([-data[1]], 2);
      } }, { "name": "exp", "symbols": ["digits", { "literal": "E" }, "digits"], "postprocess": function postprocess(data) {
        return num(data[0]) * Math.pow(10, num(data[2]));
      } }, { "name": "L2S", "symbols": ["year", { "literal": "-" }, "d25_41"], "postprocess": function postprocess(data) {
        return season(data, 2);
      } }, { "name": "decade", "symbols": ["positive_decade"], "postprocess": function postprocess(data) {
        return decade(data[0]);
      } }, { "name": "decade$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "decade", "symbols": ["decade$string$1"], "postprocess": function postprocess() {
        return decade(0);
      } }, { "name": "decade", "symbols": [{ "literal": "-" }, "positive_decade"], "postprocess": function postprocess(data) {
        return decade(-data[1]);
      } }, { "name": "positive_decade", "symbols": ["positive_digit", "digit", "digit"], "postprocess": num }, { "name": "positive_decade", "symbols": [{ "literal": "0" }, "positive_digit", "digit"], "postprocess": num }, { "name": "positive_decade$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_decade", "symbols": ["positive_decade$string$1", "positive_digit"], "postprocess": num }, { "name": "set", "symbols": ["LSB", "OL", "RSB"], "postprocess": list }, { "name": "list", "symbols": ["LLB", "OL", "RLB"], "postprocess": list }, { "name": "LSB", "symbols": [{ "literal": "[" }], "postprocess": function postprocess() {
        return { type: 'Set' };
      } }, { "name": "LSB$string$1", "symbols": [{ "literal": "[" }, { "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "LSB", "symbols": ["LSB$string$1"], "postprocess": function postprocess() {
        return { type: 'Set', earlier: true };
      } }, { "name": "LLB", "symbols": [{ "literal": "{" }], "postprocess": function postprocess() {
        return { type: 'List' };
      } }, { "name": "RSB", "symbols": [{ "literal": "]" }], "postprocess": nothing }, { "name": "RSB$string$1", "symbols": [{ "literal": "." }, { "literal": "." }, { "literal": "]" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "RSB", "symbols": ["RSB$string$1"], "postprocess": function postprocess() {
        return { later: true };
      } }, { "name": "RLB", "symbols": [{ "literal": "}" }], "postprocess": nothing }, { "name": "OL", "symbols": ["LI"], "postprocess": function postprocess(data) {
        return [data[0]];
      } }, { "name": "OL", "symbols": ["OL", "_", { "literal": "," }, "_", "LI"], "postprocess": function postprocess(data) {
        return [].concat((0, _toConsumableArray3.default)(data[0]), [data[4]]);
      } }, { "name": "LI", "symbols": ["date"], "postprocess": id }, { "name": "LI", "symbols": ["ua_date"], "postprocess": id }, { "name": "LI", "symbols": ["L2X"], "postprocess": id }, { "name": "LI", "symbols": ["consecutives"], "postprocess": id }, { "name": "consecutives$string$1", "symbols": [{ "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "consecutives", "symbols": ["year_month_day", "consecutives$string$1", "year_month_day"], "postprocess": function postprocess(d) {
        return [date(d[0]), date(d[2])];
      } }, { "name": "consecutives$string$2", "symbols": [{ "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "consecutives", "symbols": ["year_month", "consecutives$string$2", "year_month"], "postprocess": function postprocess(d) {
        return [date(d[0]), date(d[2])];
      } }, { "name": "consecutives$string$3", "symbols": [{ "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "consecutives", "symbols": ["year", "consecutives$string$3", "year"], "postprocess": function postprocess(d) {
        return [date([d[0]]), date([d[2]])];
      } }, { "name": "digit", "symbols": ["positive_digit"], "postprocess": id }, { "name": "digit", "symbols": [{ "literal": "0" }], "postprocess": id }, { "name": "digits", "symbols": ["digit"], "postprocess": id }, { "name": "digits", "symbols": ["digits", "digit"], "postprocess": join }, { "name": "nd4", "symbols": ["d4"] }, { "name": "nd4", "symbols": [{ "literal": "-" }, "d4"], "postprocess": join }, { "name": "nd3", "symbols": ["d3"] }, { "name": "nd3", "symbols": [{ "literal": "-" }, "d3"], "postprocess": join }, { "name": "nd2", "symbols": ["d2"] }, { "name": "nd2", "symbols": [{ "literal": "-" }, "d2"], "postprocess": join }, { "name": "d4", "symbols": ["d2", "d2"], "postprocess": join }, { "name": "d3", "symbols": ["d2", "digit"], "postprocess": join }, { "name": "d2", "symbols": ["digit", "digit"], "postprocess": join }, { "name": "d5+", "symbols": ["positive_digit", "d3", "digits"], "postprocess": num }, { "name": "d1x", "symbols": [/[1-9X]/], "postprocess": id }, { "name": "dx", "symbols": ["d1x"], "postprocess": id }, { "name": "dx", "symbols": [{ "literal": "0" }], "postprocess": id }, { "name": "dx2", "symbols": ["dx", "dx"], "postprocess": join }, { "name": "dx4", "symbols": ["dx2", "dx2"], "postprocess": join }, { "name": "dx4", "symbols": [{ "literal": "-" }, "dx2", "dx2"], "postprocess": join }, { "name": "md", "symbols": ["m31"], "postprocess": id }, { "name": "md", "symbols": ["m30"], "postprocess": id }, { "name": "md$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "md", "symbols": ["md$string$1"], "postprocess": id }, { "name": "mx", "symbols": [{ "literal": "0" }, "d1x"], "postprocess": join }, { "name": "mx", "symbols": [/[1X]/, /[012X]/], "postprocess": join }, { "name": "m31x", "symbols": [/[0X]/, /[13578X]/], "postprocess": join }, { "name": "m31x", "symbols": [/[1X]/, /[02]/], "postprocess": join }, { "name": "m31x$string$1", "symbols": [{ "literal": "1" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31x", "symbols": ["m31x$string$1"], "postprocess": id }, { "name": "m30x", "symbols": [/[0X]/, /[469]/], "postprocess": join }, { "name": "m30x$string$1", "symbols": [{ "literal": "1" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30x", "symbols": ["m30x$string$1"], "postprocess": join }, { "name": "d29x", "symbols": [{ "literal": "0" }, "d1x"], "postprocess": join }, { "name": "d29x", "symbols": [/[1-2X]/, "dx"], "postprocess": join }, { "name": "d30x", "symbols": ["d29x"], "postprocess": join }, { "name": "d30x$string$1", "symbols": [{ "literal": "3" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d30x", "symbols": ["d30x$string$1"], "postprocess": id }, { "name": "d31x", "symbols": ["d30x"], "postprocess": id }, { "name": "d31x", "symbols": [{ "literal": "3" }, /[1X]/], "postprocess": join }, { "name": "positive_digit", "symbols": [/[1-9]/], "postprocess": id }, { "name": "m31$subexpression$1$string$1", "symbols": [{ "literal": "0" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$1"] }, { "name": "m31$subexpression$1$string$2", "symbols": [{ "literal": "0" }, { "literal": "3" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$2"] }, { "name": "m31$subexpression$1$string$3", "symbols": [{ "literal": "0" }, { "literal": "5" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$3"] }, { "name": "m31$subexpression$1$string$4", "symbols": [{ "literal": "0" }, { "literal": "7" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$4"] }, { "name": "m31$subexpression$1$string$5", "symbols": [{ "literal": "0" }, { "literal": "8" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$5"] }, { "name": "m31$subexpression$1$string$6", "symbols": [{ "literal": "1" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$6"] }, { "name": "m31$subexpression$1$string$7", "symbols": [{ "literal": "1" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$7"] }, { "name": "m31", "symbols": ["m31$subexpression$1"], "postprocess": id }, { "name": "m30$subexpression$1$string$1", "symbols": [{ "literal": "0" }, { "literal": "4" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$1"] }, { "name": "m30$subexpression$1$string$2", "symbols": [{ "literal": "0" }, { "literal": "6" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$2"] }, { "name": "m30$subexpression$1$string$3", "symbols": [{ "literal": "0" }, { "literal": "9" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$3"] }, { "name": "m30$subexpression$1$string$4", "symbols": [{ "literal": "1" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$4"] }, { "name": "m30", "symbols": ["m30$subexpression$1"], "postprocess": id }, { "name": "d01_11", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": join }, { "name": "d01_11", "symbols": [{ "literal": "1" }, /[0-1]/], "postprocess": join }, { "name": "d01_12", "symbols": ["d01_11"], "postprocess": id }, { "name": "d01_12$string$1", "symbols": [{ "literal": "1" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_12", "symbols": ["d01_12$string$1"], "postprocess": id }, { "name": "d01_13", "symbols": ["d01_12"], "postprocess": id }, { "name": "d01_13$string$1", "symbols": [{ "literal": "1" }, { "literal": "3" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_13", "symbols": ["d01_13$string$1"], "postprocess": id }, { "name": "d00_14$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_14", "symbols": ["d00_14$string$1"], "postprocess": id }, { "name": "d00_14", "symbols": ["d01_13"], "postprocess": id }, { "name": "d00_14$string$2", "symbols": [{ "literal": "1" }, { "literal": "4" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_14", "symbols": ["d00_14$string$2"], "postprocess": id }, { "name": "d00_23$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_23", "symbols": ["d00_23$string$1"], "postprocess": id }, { "name": "d00_23", "symbols": ["d01_23"], "postprocess": id }, { "name": "d01_23", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": join }, { "name": "d01_23", "symbols": [{ "literal": "1" }, "digit"], "postprocess": join }, { "name": "d01_23", "symbols": [{ "literal": "2" }, /[0-3]/], "postprocess": join }, { "name": "d01_29", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": join }, { "name": "d01_29", "symbols": [/[1-2]/, "digit"], "postprocess": join }, { "name": "d01_30", "symbols": ["d01_29"], "postprocess": id }, { "name": "d01_30$string$1", "symbols": [{ "literal": "3" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_30", "symbols": ["d01_30$string$1"], "postprocess": id }, { "name": "d01_31", "symbols": ["d01_30"], "postprocess": id }, { "name": "d01_31$string$1", "symbols": [{ "literal": "3" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_31", "symbols": ["d01_31$string$1"], "postprocess": id }, { "name": "d00_59$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_59", "symbols": ["d00_59$string$1"], "postprocess": id }, { "name": "d00_59", "symbols": ["d01_59"], "postprocess": id }, { "name": "d01_59", "symbols": ["d01_29"], "postprocess": id }, { "name": "d01_59", "symbols": [/[345]/, "digit"], "postprocess": join }, { "name": "d21_24", "symbols": [{ "literal": "2" }, /[1-4]/], "postprocess": join }, { "name": "d25_41", "symbols": [{ "literal": "2" }, /[5-9]/], "postprocess": join }, { "name": "d25_41", "symbols": [{ "literal": "3" }, "digit"], "postprocess": join }, { "name": "d25_41", "symbols": [{ "literal": "4" }, /[01]/], "postprocess": join }, { "name": "_$ebnf$1", "symbols": [] }, { "name": "_$ebnf$1", "symbols": [{ "literal": " " }, "_$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "_", "symbols": ["_$ebnf$1"] }],
    ParserStart: "edtf"
  };
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();

/***/ }),
/* 149 */
/*!*******************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/edtf/src/util.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray2 = __webpack_require__(/*! babel-runtime/helpers/slicedToArray */ 86);

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _defineProperty2 = __webpack_require__(/*! babel-runtime/helpers/defineProperty */ 153);

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _typeof2 = __webpack_require__(/*! babel-runtime/helpers/typeof */ 59);

var _typeof3 = _interopRequireDefault(_typeof2);

var _from = __webpack_require__(/*! babel-runtime/core-js/array/from */ 82);

var _from2 = _interopRequireDefault(_from);

var _assign = __webpack_require__(/*! babel-runtime/core-js/object/assign */ 154);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bitmask = __webpack_require__(/*! ./bitmask */ 87);
var assign = _assign2.default;


var util = {
  num: function num(data) {
    return Number(Array.isArray(data) ? data.join('') : data);
  },
  join: function join(data) {
    return data.join('');
  },
  zero: function zero() {
    return 0;
  },
  nothing: function nothing() {
    return null;
  },
  pick: function pick() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.length === 1 ? function (data) {
      return data[args[0]];
    } : function (data) {
      return util.concat(data, args);
    };
  },
  pluck: function pluck() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return function (data) {
      return args.map(function (i) {
        return data[i];
      });
    };
  },
  concat: function concat(data) {
    var idx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : data.keys();

    return (0, _from2.default)(idx).reduce(function (memo, i) {
      return data[i] !== null ? memo.concat(data[i]) : memo;
    }, []);
  },
  merge: function merge() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    if ((0, _typeof3.default)(args[args.length - 1]) === 'object') var extra = args.pop();

    return function (data) {
      return assign(args.reduce(function (a, i) {
        return assign(a, data[i]);
      }, {}), extra);
    };
  },
  interval: function interval(level) {
    return function (data) {
      return {
        values: [data[0], data[2]],
        type: 'Interval',
        level: level
      };
    };
  },
  masked: function masked() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'unspecified';
    var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'X';

    return function (data, _, reject) {
      data = data.join('');

      var negative = data.startsWith('-');
      var mask = data.replace(/-/g, '');

      if (mask.indexOf(symbol) === -1) return reject;

      var values = Bitmask.values(mask, 0);
      if (negative) values[0] = -values[0];

      return (0, _defineProperty3.default)({
        values: values }, type, Bitmask.compute(mask));
    };
  },
  date: function date(values) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return assign({
      type: 'Date',
      level: level,
      values: Bitmask.normalize(values.map(Number))
    }, extra);
  },
  year: function year(values) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return assign({
      type: 'Year',
      level: level,
      values: values.map(Number)
    }, extra);
  },
  century: function century(_century) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    return {
      type: 'Century',
      level: level,
      values: [_century]
    };
  },
  decade: function decade(_decade) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

    return {
      type: 'Decade',
      level: level,
      values: [_decade]
    };
  },
  datetime: function datetime(data) {
    return {
      values: Bitmask.normalize(data[0].map(Number)).concat(data[2]),
      offset: data[3],
      type: 'Date',
      level: 0
    };
  },
  season: function season(data) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return {
      type: 'Season',
      level: level,
      values: [Number(data[0]), Number(data[2])]
    };
  },
  list: function list(data) {
    return assign({ values: data[1], level: 2 }, data[0], data[2]);
  },
  qualify: function qualify(_ref2, _, reject) {
    var _ref3 = (0, _slicedToArray3.default)(_ref2, 1),
        parts = _ref3[0];

    var q = {
      uncertain: new Bitmask(), approximate: new Bitmask()
    };

    var values = parts.map(function (_ref4, idx) {
      var _ref5 = (0, _slicedToArray3.default)(_ref4, 3),
          lhs = _ref5[0],
          part = _ref5[1],
          rhs = _ref5[2];

      for (var ua in lhs) {
        q[ua].qualify(idx * 2);
      }for (var _ua in rhs) {
        q[_ua].qualify(1 + idx * 2);
      }return part;
    });

    return !q.uncertain.value && !q.approximate.value ? reject : assign(util.date(values, 2), {
      uncertain: q.uncertain.value,
      approximate: q.approximate.value
    });
  }
};

module.exports = util;

/***/ }),
/* 150 */
/*!************************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/is-iterable.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/is-iterable */ 151), __esModule: true };

/***/ }),
/* 151 */
/*!*********************************************************!*\
  !*** ../node_modules/core-js/library/fn/is-iterable.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../modules/web.dom.iterable */ 37);
__webpack_require__(/*! ../modules/es6.string.iterator */ 28);
module.exports = __webpack_require__(/*! ../modules/core.is-iterable */ 152);


/***/ }),
/* 152 */
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/library/modules/core.is-iterable.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(/*! ./_classof */ 57);
var ITERATOR = __webpack_require__(/*! ./_wks */ 4)('iterator');
var Iterators = __webpack_require__(/*! ./_iterators */ 21);
module.exports = __webpack_require__(/*! ./_core */ 3).isIterable = function (it) {
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    // eslint-disable-next-line no-prototype-builtins
    || Iterators.hasOwnProperty(classof(O));
};


/***/ }),
/* 153 */
/*!***************************************************************!*\
  !*** ../node_modules/babel-runtime/helpers/defineProperty.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__(/*! ../core-js/object/define-property */ 84);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

/***/ }),
/* 154 */
/*!**************************************************************!*\
  !*** ../node_modules/babel-runtime/core-js/object/assign.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(/*! core-js/library/fn/object/assign */ 155), __esModule: true };

/***/ }),
/* 155 */
/*!***********************************************************!*\
  !*** ../node_modules/core-js/library/fn/object/assign.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es6.object.assign */ 156);
module.exports = __webpack_require__(/*! ../../modules/_core */ 3).Object.assign;


/***/ }),
/* 156 */
/*!********************************************************************!*\
  !*** ../node_modules/core-js/library/modules/es6.object.assign.js ***!
  \********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(/*! ./_export */ 11);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(/*! ./_object-assign */ 157) });


/***/ }),
/* 157 */
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/library/modules/_object-assign.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(/*! ./_object-keys */ 30);
var gOPS = __webpack_require__(/*! ./_object-gops */ 62);
var pIE = __webpack_require__(/*! ./_object-pie */ 39);
var toObject = __webpack_require__(/*! ./_to-object */ 31);
var IObject = __webpack_require__(/*! ./_iobject */ 51);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(/*! ./_fails */ 18)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 158 */
/*!*********************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/export/biblatex.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexExporter = undefined;

var _keys = __webpack_require__(/*! babel-runtime/core-js/object/keys */ 64);

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ 23);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(/*! babel-runtime/helpers/createClass */ 24);

var _createClass3 = _interopRequireDefault(_createClass2);

var _const = __webpack_require__(/*! ./const */ 159);

var _const2 = __webpack_require__(/*! ../const */ 40);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Export a list of bibliography items to bibLateX and serve the file to the user as a ZIP-file.
 * @class BibLatexExporter
 * @param pks A list of pks of the bibliography items that are to be exported.
 */

var TAGS = {
    'strong': { open: '\\mkbibbold{', close: '}' },
    'em': { open: '\\mkbibitalic{', close: '}' },
    'smallcaps': { open: '\\textsc{', close: '}' },
    'enquote': { open: '\\enquote{', close: '}' },
    'nocase': { open: '{{', close: '}}' },
    'sub': { open: '_{', close: '}' },
    'sup': { open: '^{', close: '}' },
    'math': { open: '$', close: '$' },
    'url': { open: "\\url{", close: '}', verbatim: true }
};

var BibLatexExporter = exports.BibLatexExporter = function () {
    function BibLatexExporter(bibDB) {
        var pks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        (0, _classCallCheck3.default)(this, BibLatexExporter);

        this.bibDB = bibDB; // The bibliography database to export from.
        if (pks) {
            this.pks = pks; // A list of pk values of the bibliography items to be exported.
        } else {
            this.pks = (0, _keys2.default)(bibDB); // If none are selected, all keys are exporter
        }
        this.config = config;
        this.warnings = [];
    }

    (0, _createClass3.default)(BibLatexExporter, [{
        key: "_reformKey",
        value: function _reformKey(theValue, fKey) {
            if (typeof theValue === 'string') {
                var fieldType = _const2.BibFieldTypes[fKey];
                if (Array.isArray(fieldType['options'])) {
                    return this._escapeTeX(theValue);
                } else {
                    return this._escapeTeX(fieldType['options'][theValue]['biblatex']);
                }
            } else {
                return this._reformText(theValue);
            }
        }
    }, {
        key: "_reformRange",
        value: function _reformRange(theValue) {
            var _this = this;

            var that = this;
            return theValue.map(function (range) {
                return range.map(function (text) {
                    return _this._reformText(text);
                }).join('--');
            }).join(',');
        }
    }, {
        key: "_reformName",
        value: function _reformName(theValue) {
            var names = [],
                that = this;
            theValue.forEach(function (name) {
                if (name.literal) {
                    var literal = that._reformText(name.literal);
                    names.push("{" + literal + "}");
                } else {
                    var family = name.family ? that._reformText(name.family) : '';
                    var given = name.given ? that._reformText(name.given) : '';
                    var suffix = name.suffix ? that._reformText(name.suffix) : false;
                    var prefix = name.prefix ? that._reformText(name.prefix) : false;
                    var useprefix = name.useprefix ? name.useprefix : false;
                    if (that.config.traditionalNames) {
                        if (suffix && prefix) {
                            names.push("{" + prefix + " " + family + "}, {" + suffix + "}, {" + given + "}");
                        } else if (suffix) {
                            names.push("{" + family + "}, {" + suffix + "}, {" + given + "}");
                        } else if (prefix) {
                            names.push("{" + prefix + " " + family + "}, {" + given + "}");
                        } else {
                            names.push("{" + family + "}, {" + given + "}");
                        }
                    } else {
                        var nameParts = [];
                        if (given.length) {
                            nameParts.push(that._protectNamePart("given={" + given + "}"));
                        }
                        if (family.length) {
                            nameParts.push(that._protectNamePart("family={" + family + "}"));
                        }
                        if (suffix) {
                            nameParts.push(that._protectNamePart("suffix={" + suffix + "}"));
                        }
                        if (prefix) {
                            nameParts.push(that._protectNamePart("prefix={" + prefix + "}"));
                            nameParts.push("useprefix=" + name.useprefix);
                        }
                        names.push("{" + nameParts.join(', ') + "}");
                    }
                }
            });
            return names.join(' and ');
        }
    }, {
        key: "_protectNamePart",
        value: function _protectNamePart(namePart) {
            if (namePart.includes(',')) {
                return "\"" + namePart + "\"";
            } else {
                return namePart;
            }
        }
    }, {
        key: "_escapeTeX",
        value: function _escapeTeX(theValue) {
            if ('string' != typeof theValue) {
                return false;
            }
            var len = _const.TexSpecialChars.length;
            for (var i = 0; i < len; i++) {
                theValue = theValue.replace(_const.TexSpecialChars[i][0], _const.TexSpecialChars[i][1]);
            }
            return theValue;
        }
    }, {
        key: "_reformText",
        value: function _reformText(theValue) {
            var _this2 = this;

            var that = this,
                latex = '',
                lastMarks = [];
            theValue.forEach(function (node) {
                if (node.type === 'variable') {
                    // This is an undefined variable
                    // This should usually not happen, as CSL doesn't know what to
                    // do with these. We'll put them into an unsupported tag.
                    latex += "} # " + node.attrs.variable + " # {";
                    _this2.warnings.push({
                        type: 'undefined_variable',
                        variable: node.attrs.variable
                    });
                    return;
                }
                var newMarks = [];
                if (node.marks) {
                    var mathMode = false;
                    node.marks.forEach(function (mark) {
                        // We need to activate mathmode for the lowest level sub/sup node.
                        if ((mark.type === 'sup' || mark.type === 'sub') && !mathMode) {
                            newMarks.push('math');
                            newMarks.push(mark.type);
                            mathMode = true;
                        } else if (mark.type === 'nocase') {
                            // No case has to be applied at the top level to be effective.
                            newMarks.unshift(mark.type);
                        } else {
                            newMarks.push(mark.type);
                        }
                    });
                }
                // close all tags that are not present in current text node.
                var closing = false,
                    closeTags = [];
                lastMarks.forEach(function (mark, index) {
                    if (mark != newMarks[index]) {
                        closing = true;
                    }
                    if (closing) {
                        var closeTag = TAGS[mark].close;
                        // If not inside of a nocase, add a protective brace around tag.
                        if (lastMarks[0] !== 'nocase' && TAGS[mark].open[0] === '\\') {
                            closeTag += '}';
                        }
                        closeTags.push(closeTag);
                    }
                });
                // Add close tags to latex in reverse order to close innermost tags
                // first.
                closeTags.reverse();
                latex += closeTags.join('');

                // open all new tags that were not present in the last text node.
                var opening = false,
                    verbatim = false;
                newMarks.forEach(function (mark, index) {
                    if (mark != lastMarks[index]) {
                        opening = true;
                    }
                    if (opening) {
                        // If not inside of a nocase, add a protective brace around tag.
                        if (newMarks[0] !== 'nocase' && TAGS[mark].open[0] === '\\') {
                            latex += '{';
                        }
                        latex += TAGS[mark].open;
                        if (TAGS[mark].verbatim) {
                            verbatim = true;
                        }
                    }
                });
                if (verbatim) {
                    latex += node.text;
                } else {
                    latex += that._escapeTeX(node.text);
                }
                lastMarks = newMarks;
            });
            // Close all still open tags
            lastMarks.slice().reverse().forEach(function (mark) {
                latex += TAGS[mark].close;
            });
            return latex;
        }
    }, {
        key: "_getBibtexString",
        value: function _getBibtexString(biblist) {
            var len = biblist.length,
                str = '';
            for (var i = 0; i < len; i++) {
                if (0 < i) {
                    str += '\n\n';
                }
                var data = biblist[i];
                str += "@" + data.type + "{" + data.key;
                for (var vKey in data.values) {
                    var value = ("{" + data.values[vKey] + "}").replace(/\{\} \# /g, '').replace(/\# \{\}/g, '');
                    str += ",\n" + vKey + " = " + value;
                }
                str += "\n}";
            }
            return str;
        }
    }, {
        key: "output",
        get: function get() {
            var _this3 = this;

            var that = this;
            this.bibtexArray = [];
            this.bibtexStr = '';

            var len = this.pks.length;

            for (var i = 0; i < len; i++) {
                var pk = this.pks[i];
                var bib = this.bibDB[pk];
                var bibEntry = {
                    'type': _const2.BibTypes[bib['bib_type']]['biblatex'],
                    'key': bib['entry_key'].length ? bib['entry_key'] : 'Undefined'
                };
                var fValues = {};

                var _loop = function _loop(fKey) {
                    if (!_const2.BibFieldTypes[fKey]) {
                        return "continue";
                    }
                    var fValue = bib.fields[fKey];
                    var fType = _const2.BibFieldTypes[fKey]['type'];
                    var key = _const2.BibFieldTypes[fKey]['biblatex'];
                    switch (fType) {
                        case 'f_date':
                            fValues[key] = fValue; // EDTF 1.0 level 0/1 compliant string.
                            break;
                        case 'f_integer':
                            fValues[key] = _this3._reformText(fValue);
                            break;
                        case 'f_key':
                            fValues[key] = _this3._reformKey(fValue, fKey);
                            break;
                        case 'f_literal':
                        case 'f_long_literal':
                            fValues[key] = _this3._reformText(fValue);
                            break;
                        case 'l_range':
                            fValues[key] = _this3._reformRange(fValue);
                            break;
                        case 'f_title':
                            fValues[key] = _this3._reformText(fValue);
                            break;
                        case 'f_uri':
                        case 'f_verbatim':
                            fValues[key] = fValue.replace(/{|}/g, ''); // TODO: balanced braces should probably be ok here.
                            break;
                        case 'l_key':
                            fValues[key] = _this3._escapeTeX(fValue.map(function (key) {
                                return that._reformKey(key, fKey);
                            }).join(' and '));
                            break;
                        case 'l_literal':
                            fValues[key] = fValue.map(function (text) {
                                return that._reformText(text);
                            }).join(' and ');
                            break;
                        case 'l_name':
                            fValues[key] = _this3._reformName(fValue);
                            break;
                        case 'l_tag':
                            fValues[key] = _this3._escapeTeX(fValue.join(', '));
                            break;
                        default:
                            console.warn("Unrecognized type: " + fType + "!");
                    }
                };

                for (var fKey in bib.fields) {
                    var _ret = _loop(fKey);

                    if (_ret === "continue") continue;
                }
                bibEntry.values = fValues;
                this.bibtexArray[this.bibtexArray.length] = bibEntry;
            }
            this.bibtexStr = this._getBibtexString(this.bibtexArray);
            return this.bibtexStr;
        }
    }]);
    return BibLatexExporter;
}();

/***/ }),
/* 159 */
/*!******************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/export/const.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
// A much smaller list for export than for import, as biblatex does understand utf8
var TexSpecialChars = exports.TexSpecialChars = [[/\\/g, '\\textbackslash '], [/\{/g, '\\{ '], [/\}/g, '\\} '], [/&/g, '{\\&}'], [/%/g, '{\\%}'], [/\$/g, '{\\$}'], [/#/g, '{\\#}'], [/_/g, '{\\_}'], [/~/g, '{\\textasciitilde}'], [/\^/g, '{\\textasciicircum}'], [/ and /g, ' {and} ']];

/***/ }),
/* 160 */
/*!****************************************************************!*\
  !*** ../node_modules/biblatex-csl-converter/lib/export/csl.js ***!
  \****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CSLExporter = undefined;

var _keys = __webpack_require__(/*! babel-runtime/core-js/object/keys */ 64);

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ 23);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(/*! babel-runtime/helpers/createClass */ 24);

var _createClass3 = _interopRequireDefault(_createClass2);

var _const = __webpack_require__(/*! ../const */ 40);

var _edtf = __webpack_require__(/*! ../edtf */ 65);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Converts a BibDB to a DB of the CSL type.
 * @param bibDB The bibliography database to convert.
 */

var TAGS = {
    'strong': { open: '<b>', close: '</b>' },
    'em': { open: '<i>', close: '</i>' },
    'sub': { open: '<sub>', close: '</sub>' },
    'sup': { open: '<sup>', close: '</sup>' },
    'smallcaps': { open: '<span style="font-variant:small-caps;">', close: '</span>' },
    'nocase': { open: '<span class="nocase">', close: '</span>' },
    'enquote': { open: '“', close: '”' },
    'url': { open: '', close: '' },
    'undefined': { open: '[', close: ']' }
};

var CSLExporter = exports.CSLExporter = function () {
    function CSLExporter(bibDB, pks) {
        (0, _classCallCheck3.default)(this, CSLExporter);

        this.bibDB = bibDB;
        if (pks) {
            this.pks = pks; // A list of pk values of the bibliography items to be exported.
        } else {
            this.pks = (0, _keys2.default)(bibDB); // If none are selected, all keys are exporter
        }
        this.cslDB = {};
        this.errors = [];
    }

    (0, _createClass3.default)(CSLExporter, [{
        key: "getCSLEntry",

        /** Converts one BibDB entry to CSL format.
         * @function getCSLEntry
         * @param id The id identifying the bibliography entry.
         */
        value: function getCSLEntry(id) {
            var _this = this;

            var that = this,
                bib = this.bibDB[id],
                fValues = {};

            var _loop = function _loop(fKey) {
                if (bib.fields[fKey] !== '' && fKey in _const.BibFieldTypes && 'csl' in _const.BibFieldTypes[fKey]) {
                    var fValue = bib.fields[fKey];
                    var fType = _const.BibFieldTypes[fKey]['type'];
                    var key = _const.BibFieldTypes[fKey]['csl'];
                    switch (fType) {
                        case 'f_date':
                            fValues[key] = _this._reformDate(fValue);
                            break;
                        case 'f_integer':
                            fValues[key] = _this._reformInteger(fValue);
                            break;
                        case 'f_key':
                            fValues[key] = _this._reformKey(fValue, fKey);
                            break;
                        case 'f_literal':
                        case 'f_long_literal':
                            fValues[key] = _this._reformText(fValue);
                            break;
                        case 'l_range':
                            fValues[key] = _this._reformRange(fValue);
                            break;
                        case 'f_title':
                            fValues[key] = _this._reformText(fValue);
                            break;
                        case 'f_uri':
                        case 'f_verbatim':
                            fValues[key] = fValue;
                            break;
                        case 'l_key':
                            fValues[key] = fValue.map(function (key) {
                                return that._reformKey(key, fKey);
                            }).join(' and ');
                            break;
                        case 'l_literal':
                            var reformedTexts = [];
                            fValue.forEach(function (text) {
                                reformedTexts.push(that._reformText(text));
                            });
                            fValues[key] = reformedTexts.join(', ');
                            break;
                        case 'l_name':
                            fValues[key] = _this._reformName(fValue);
                            break;
                        case 'l_tag':
                            fValues[key] = fValue.join(', ');
                            break;
                        default:
                            console.warn("Unrecognized type: " + fType + "!");
                    }
                }
            };

            for (var fKey in bib.fields) {
                _loop(fKey);
            }
            fValues['type'] = _const.BibTypes[bib.bib_type].csl;
            return fValues;
        }
    }, {
        key: "_reformKey",
        value: function _reformKey(theValue, fKey) {
            if (typeof theValue === 'string') {
                var fieldType = _const.BibFieldTypes[fKey];
                if (Array.isArray(fieldType['options'])) {
                    return theValue;
                } else {
                    return fieldType['options'][theValue]['csl'];
                }
            } else {
                return this._reformText(theValue);
            }
        }
    }, {
        key: "_reformRange",
        value: function _reformRange(theValue) {
            var _this2 = this;

            var that = this;
            return theValue.map(function (range) {
                return range.map(function (text) {
                    return _this2._reformText(text);
                }).join('--');
            }).join(',');
        }
    }, {
        key: "_reformInteger",
        value: function _reformInteger(theValue) {
            var theString = this._reformText(theValue);
            var theInt = parseInt(theString);
            if (theString !== String(theInt)) {
                return theString;
            }
            return theInt;
        }
    }, {
        key: "_reformText",
        value: function _reformText(theValue) {
            var _this3 = this;

            var that = this,
                html = '',
                lastMarks = [];
            theValue.forEach(function (node) {
                if (node.type === 'variable') {
                    // This is an undefined variable
                    // This should usually not happen, as CSL doesn't know what to
                    // do with these. We'll put them into an unsupported tag.
                    html += "" + TAGS.undefined.open + node.attrs.variable + TAGS.undefined.close;
                    _this3.errors.push({
                        type: 'undefined_variable',
                        variable: node.attrs.variable
                    });
                    return;
                }
                var newMarks = [];
                if (node.marks) {
                    node.marks.forEach(function (mark) {
                        newMarks.push(mark.type);
                    });
                }
                // close all tags that are not present in current text node.
                var closing = false,
                    closeTags = [];
                lastMarks.forEach(function (mark, index) {
                    if (mark != newMarks[index]) {
                        closing = true;
                    }
                    if (closing) {
                        closeTags.push(TAGS[mark].close);
                    }
                });
                // Add close tags in reverse order to close innermost tags
                // first.
                closeTags.reverse();
                html += closeTags.join('');

                // open all new tags that were not present in the last text node.
                var opening = false;
                newMarks.forEach(function (mark, index) {
                    if (mark != lastMarks[index]) {
                        opening = true;
                    }
                    if (opening) {
                        html += TAGS[mark].open;
                    }
                });
                html += node.text;
                lastMarks = newMarks;
            });
            // Close all still open tags
            lastMarks.slice().reverse().forEach(function (mark) {
                html += TAGS[mark].close;
            });
            return html;
        }
    }, {
        key: "_reformDate",
        value: function _reformDate(dateStr) {
            var dateObj = (0, _edtf.edtfParse)(dateStr);
            if (dateObj.type === 'Interval') {
                return {
                    'date-parts': [this._edtfToCSL(dateObj.values[0].values.slice(0, 3)), this._edtfToCSL(dateObj.values[1].values.slice(0, 3))]
                };
            } else {
                return {
                    'date-parts': [this._edtfToCSL(dateObj.values.slice(0, 3))]
                };
            }
        }
    }, {
        key: "_edtfToCSL",
        value: function _edtfToCSL(dateArray) {
            // Add 1 to month (0-11 in edtf.js === 1-12 in CSL json)
            if (dateArray.length > 1) {
                dateArray[1] = dateArray[1] + 1;
            }
            return dateArray;
        }
    }, {
        key: "_reformName",
        value: function _reformName(theNames) {
            var reformedNames = [],
                that = this;
            theNames.forEach(function (name) {
                var reformedName = {};
                if (name.literal) {
                    reformedName['literal'] = that._reformText(name.literal);
                } else {
                    reformedName['given'] = that._reformText(name.given);
                    reformedName['family'] = that._reformText(name.family);
                    if (name.suffix) {
                        reformedName['suffix'] = that._reformText(name.suffix);
                    }
                    if (name.prefix) {
                        if (name.useprefix === true) {
                            reformedName['non-dropping-particle'] = that._reformText(name.prefix);
                        } else {
                            reformedName['dropping-particle'] = that._reformText(name.prefix);
                        }
                    }
                    reformedName['family'] = that._reformText(name['family']);
                }
                reformedNames.push(reformedName);
            });
            return reformedNames;
        }
    }, {
        key: "output",
        get: function get() {
            for (var bibId in this.bibDB) {
                if (this.pks.indexOf(bibId) !== -1) {
                    this.cslDB[bibId] = this.getCSLEntry(bibId);
                    this.cslDB[bibId].id = bibId;
                }
            }
            return this.cslDB;
        }
    }]);
    return CSLExporter;
}();

/***/ })
/******/ ]);