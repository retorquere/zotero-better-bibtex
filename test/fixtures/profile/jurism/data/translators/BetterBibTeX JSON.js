{
  "translatorID": "36a3b0b5-bad0-4a04-b79b-441c7cef77db",
  "label": "BetterBibTeX JSON",
  "creator": "Emiliano Heyns",
  "target": "json",
  "minVersion": "3.0b3",
  "maxVersion": "",
  "configOptions": {
    "getCollections": true,
    "serializationCache": true
  },
  "displayOptions": {
    "exportNotes": true,
    "exportFileData": false
  },
  "translatorType": 3,
  "browserSupport": "gcsv",
  "priority": 100,
  "inRepository": false,
  "lastUpdated": "2017-09-05 07:26:36"
}

var Translator = {
  initialize: function () {},
  version: "5.0.2.emile.java-cotton",
  BetterBibTeXJSON: true,
  // header == ZOTERO_TRANSLATOR_INFO -- maybe pick it from there
  header: {"translatorID":"36a3b0b5-bad0-4a04-b79b-441c7cef77db","label":"BetterBibTeX JSON","creator":"Emiliano Heyns","target":"json","minVersion":"3.0b3","maxVersion":"","configOptions":{"getCollections":true,"serializationCache":true},"displayOptions":{"exportNotes":true,"exportFileData":false},"translatorType":3,"browserSupport":"gcsv","priority":100,"inRepository":false,"lastUpdated":"2017-09-05 07:26:36"},
  preferences: {"asciiBibLaTeX":false,"asciiBibTeX":true,"attachmentsNoMetadata":false,"autoAbbrev":false,"autoAbbrevStyle":"","autoExport":"idle","autoExportIdleWait":10,"cacheFlushInterval":5,"itemObserverDelay":100,"citeCommand":"cite","citekeyFormat":"[auth][shorttitle][year]","citekeyFold":true,"DOIandURL":"both","bibtexURL":"off","csquotes":"","keyConflictPolicy":"keep","langID":"babel","pinCitekeys":"manual","preserveBibTeXVariables":false,"rawImports":false,"citekeyScan":"","skipFields":"","skipWords":"a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum","warnBulkModify":10,"postscript":"","jabrefGroups":4,"defaultDateParserLocale":"","bibtexParticleNoOp":false,"biblatexExtendedNameFormat":false,"biblatexExtendedDateFormat":false,"quickCopyMode":"latex","quickCopyPandocBrackets":false,"jurismPreferredLanguage":"zh-alalc97","qualityReport":false,"suppressTitleCase":false,"parseParticles":true,"debug":false,"testing":false,"rawLaTag":"#LaTeX"},
  options: {"exportNotes":true,"exportFileData":false},

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
/******/ 	return __webpack_require__(__webpack_require__.s = 190);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
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

/***/ 190:
/*!**********************************!*\
  !*** ./BetterBibTeX JSON.coffee ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Collections, debug;

debug = __webpack_require__(/*! ./lib/debug.coffee */ 0);

Collections = __webpack_require__(/*! ./lib/collections.coffee */ 8);


/*
scrub = (item) ->
  delete item.libraryID
  delete item.key
  delete item.uniqueFields
  delete item.dateAdded
  delete item.dateModified
  delete item.uri
  delete item.attachmentIDs
  delete item.relations

  delete item.collections

  item.attachments = ({
    path: attachment.localPath || undefined,
    title: attachment.title || undefined,
    url: attachment.url || undefined,
    linkMode: if typeof attachment.linkMode == 'number' then attachment.linkMode else undefined,
    contentType: attachment.contentType || undefined,
    mimeType: attachment.mimeType || undefined,
  } for attachment in item.attachments || [])

  item.notes = (note.note.trim() for note in item.notes || [])

  item.tags = (tag.tag for tag in item.tags || [])
  item.tags.sort()

  for own attr, val of item
    continue if typeof val is 'number'
    continue if Array.isArray(val) and val.length != 0

    switch typeof val
      when 'string'
        delete item[attr] if val.trim() == ''
      when 'undefined'
        delete item[attr]

  return item
 */

Translator.detectImport = function() {
  var data, json, ref, ref1, ref2, str;
  debug('BetterBibTeX JSON.detect: start');
  json = '';
  while ((str = Zotero.read(0x100000)) !== false) {
    json += str;
    if (json[0] !== '{') {
      return false;
    }
  }
  data = JSON.parse(json);
  if (((ref = data.config) != null ? ref.id : void 0) !== Translator.header.translatorID) {
    throw "ID mismatch: got " + ((ref1 = data.config) != null ? ref1.id : void 0) + ", expected " + Translator.header.translatorID;
  }
  if (!((ref2 = data.items) != null ? ref2.length : void 0)) {
    throw 'No items';
  }
  return true;
};

Translator.doImport = function() {
  var att, coll, collection, data, i, id, item, j, json, key, len, len1, ref, ref1, ref2, ref3, ref4, source, str;
  json = '';
  while ((str = Zotero.read(0x100000)) !== false) {
    json += str;
  }
  data = JSON.parse(json);
  ref = data.items;
  for (i = 0, len = ref.length; i < len; i++) {
    source = ref[i];

    /* works around https://github.com/Juris-M/zotero/issues/20 */
    Zotero.BetterBibTeX.scrubFields(source);
    item = new Zotero.Item();
    Object.assign(item, source, {
      itemID: source.key
    });
    ref1 = item.attachments || [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      att = ref1[j];
      if (att.url) {
        delete att.path;
      }
    }
    item.complete();
  }
  ref2 = data.collections || {};
  for (key in ref2) {
    collection = ref2[key];
    collection.imported = new Zotero.Collection();
    collection.imported.type = 'collection';
    collection.imported.name = collection.name;
    collection.imported.children = (function() {
      var k, len2, ref3, results;
      ref3 = collection.items;
      results = [];
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        id = ref3[k];
        results.push({
          type: 'item',
          id: id
        });
      }
      return results;
    })();
  }
  ref3 = data.collections;
  for (key in ref3) {
    collection = ref3[key];
    collection.imported.children = collection.imported.children.concat((function() {
      var k, len2, ref4, results;
      ref4 = collection.collections;
      results = [];
      for (k = 0, len2 = ref4.length; k < len2; k++) {
        coll = ref4[k];
        results.push(data.collections[coll.key].imported);
      }
      return results;
    })());
  }
  ref4 = data.collections;
  for (key in ref4) {
    collection = ref4[key];
    if (collection.parent) {
      continue;
    }
    collection.imported.complete();
  }
};

Translator.doExport = function() {
  var data, item;
  debug('starting export');
  data = {
    config: {
      id: Translator.header.translatorID,
      label: Translator.header.label,
      release: Zotero.BetterBibTeX.version(),
      preferences: Translator.preferences,
      options: Translator.options
    },
    items: []
  };
  debug('header ready');
  while (item = Zotero.nextItem()) {
    debug('adding item', item.itemID);
    data.items.push(item);
  }
  debug('data ready');
  Zotero.write(JSON.stringify(data, null, '  '));
  debug('export done');
};


/***/ }),

/***/ 2:
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

/***/ 5:
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

/***/ 8:
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


/***/ })

/******/ });