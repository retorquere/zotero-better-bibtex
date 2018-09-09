{
	"translatorID": "e7859c61-54d4-466a-b236-aadcf1f7e83b",
	"label": "Collected notes",
	"creator": "Emiliano heyns",
	"target": "html",
	"minVersion": "4.0.27",
	"maxVersion": "",
	"translatorType": 2,
	"browserSupport": "gcsv",
	"inRepository": false,
	"configOptions": {
		"getCollections": true
	},
	"priority": 100,
	"lastUpdated": "2018-09-09 20:22:32"
}

var Translator = {
  initialize: function () {},
  version: "5.0.201.emile.titanarum",
  Collectednotes: true,
  // header == ZOTERO_TRANSLATOR_INFO -- maybe pick it from there
  header: {"translatorID":"e7859c61-54d4-466a-b236-aadcf1f7e83b","label":"Collected notes","description":"exports your notes","creator":"Emiliano heyns","target":"html","minVersion":"4.0.27","maxVersion":"","translatorType":2,"browserSupport":"gcsv","inRepository":false,"configOptions":{"getCollections":true},"priority":100,"lastUpdated":"2018-09-09 20:22:32"},
  override: {"DOIandURL":true,"asciiBibLaTeX":true,"asciiBibTeX":true,"autoAbbrev":false,"autoAbbrevStyle":false,"autoExport":false,"autoExportIdleWait":false,"autoPin":false,"biblatexExtendedDateFormat":false,"biblatexExtendedNameFormat":true,"bibtexParticleNoOp":true,"bibtexURL":true,"cacheFlushInterval":false,"citeCommand":false,"citekeyFold":false,"citekeyFormat":false,"citeprocNoteCitekey":false,"csquotes":false,"debug":false,"debugLog":false,"itemObserverDelay":false,"jabrefFormat":false,"jurismPreferredLanguage":false,"keyConflictPolicy":false,"keyScope":false,"kuroshiro":false,"lockedInit":false,"parseParticles":false,"postscript":false,"preserveBibTeXVariables":false,"qualityReport":false,"quickCopyMode":false,"quickCopyPandocBrackets":false,"rawLaTag":false,"scrubDatabase":false,"skipFields":false,"skipWords":false,"sorted":false,"strings":false,"suppressTitleCase":false,"testing":false,"warnBulkModify":false},
  options: {},

  stringCompare: (new Intl.Collator('en')).compare,

  configure: function(stage) {
    var version = Zotero.BetterBibTeX.version();
    this.isZotero = version.Zotero.isZotero;
    this.isJurisM = version.Zotero.isJurisM;

    this.BetterCSL = this.BetterCSLYAML || this.BetterCSLJSON;

    this.debugEnabled = Zotero.BetterBibTeX.debugEnabled();
    this.unicode = true; // set by Better Bib(La)TeX later

    if (stage == 'detectImport') {
      this.options = {}
    } else {
      if (stage == 'doImport') this.pathSep = (Zotero.BetterBibTeX.platform().toLowerCase().startsWith('win')) ? '\\' : '/'

      this.references = []

      for (var key in this.options) {
        if (typeof this.options[key] === 'boolean') {
          this.options[key] = !!Zotero.getOption(key)
        } else {
          this.options[key] = Zotero.getOption(key)
        }
      }
      // special handling
      this.options.exportPath = Zotero.getOption('exportPath')
      this.options.exportFilename = Zotero.getOption('exportFilename')
    }

    this.preferences = {}
    for (const [pref, override] of Object.entries(this.override)) {
      let value = undefined

      if (override) {
        try {
          value = Zotero.getOption(`preference_${pref}`)
        } catch (err) {
          value = undefined
        }
      }

      if (typeof value === 'undefined') value = Zotero.getHiddenPref('better-bibtex.' + pref)
      this.preferences[pref] = value
    }
    // special handling
    this.preferences.skipWords = this.preferences.skipWords.toLowerCase().trim().split(/\s*,\s*/).filter(function(s) { return s })
    this.preferences.skipFields = this.preferences.skipFields.toLowerCase().trim().split(/\s*,\s*/).filter(function(s) { return s })
    if (!this.preferences.rawLaTag) this.preferences.rawLaTag = '#LaTeX'
    Zotero.debug('prefs loaded: ' + JSON.stringify(this.preferences, null, 2))

    this.collections = {}
    if (stage == 'doExport' && this.header.configOptions && this.header.configOptions.getCollections && Zotero.nextCollection) {
      let collection
      while (collection = Zotero.nextCollection()) {
        let children = collection.children || collection.descendents || []
        let key = (collection.primary ? collection.primary : collection).key

        this.collections[key] = {
          id: collection.id,
          key: key,
          parent: collection.fields.parentKey,
          name: collection.name,
          items: collection.childItems,
          collections: children.filter(function(coll) { return coll.type === 'collection'}).map(function(coll) { return coll.key}),
          // items: (item.itemID for item in children when item.type != 'collection')
          // descendents: undefined
          // children: undefined
          // childCollections: undefined
          // primary: undefined
          // fields: undefined
          // type: undefined
          // level: undefined
        }
      }
      for (const collection of Object.values(this.collections)) {
        if (collection.parent && !this.collections[collection.parent]) {
          collection.parent = false
          Zotero.debug('BBT translator: collection with key ' + collection.key + ' has non-existent parent ' + collection.parent + ', assuming root collection')
        }
      }
    }
  }
};


  function doExport() {
    const start = Date.now()
    Translator.configure('doExport')
    Translator.initialize()
    Translator.doExport()
    Zotero.debug("Collected notes" + ' export took ' + (Date.now() - start))
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./Collected notes.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./Collected notes.ts":
/*!****************************!*\
  !*** ./Collected notes.ts ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

Zotero.debug('BBT: loading translators/Collected notes.ts'); try { "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const html_escape_1 = __webpack_require__(/*! ./lib/html-escape */ "./lib/html-escape.ts");
const html = {
    levels: 0,
    body: '',
};
function _collection(collection, level = 1) {
    if (level > html.levels)
        html.levels = level;
    html.body += `<h${level}>${html_escape_1.htmlEscape(collection.name)}</h${level}>\n`;
    for (const item of collection.items) {
        _item(item);
    }
    for (const subcoll of collection.collections) {
        _collection(subcoll, level + 1);
    }
}
function _item(item) {
    switch (item.itemType) {
        case 'note':
            _note(item.note, 'note');
            break;
        case 'attachment':
            _reference(item);
            break;
        default:
            _reference(item);
            break;
    }
}
function _prune(collection) {
    let keep = collection.items.length > 0;
    collection.collections = collection.collections.filter(subcoll => {
        if (_prune(subcoll)) {
            return false;
        }
        else {
            keep = true;
            return true;
        }
    });
    return !keep;
}
function _note(note, type) {
    switch (type) {
        case 'extra':
            if (!note)
                return;
            html.body += `<blockquote><pre>${html_escape_1.htmlEscape(note)}</pre></blockquote>\n`;
            break;
        case 'attachment':
            if (!note.note)
                return;
            html.body += `<blockquote><div><samp>${note.title}</samp></div>${note.note}</blockquote>\n`;
            break;
        default:
            if (!note.note)
                return;
            html.body += `<blockquote>${note.note}</blockquote>\n`;
            break;
    }
}
function _creator(cr) {
    return [cr.lastName, cr.firstName, cr.name].filter(v => v).join(', ');
}
function _reference(item) {
    let notes = [];
    let title = '';
    if (item.itemType === 'attachment') {
        if (item.note)
            notes = [{ note: item.note }];
        if (item.title)
            title = `<samp>${html_escape_1.htmlEscape(item.title)}</samp>`;
    }
    else {
        notes = item.notes.filter(note => note.note);
        const creators = item.creators.map(_creator).filter(v => v).join(' and ');
        let date = null;
        if (item.date) {
            date = Zotero.BetterBibTeX.parseDate(item.date);
            if (date.from)
                date = date.from;
            date = typeof date.year === 'number' ? date.year : item.date;
        }
        const author = [creators, date].filter(v => v).join(', ');
        if (item.title)
            title += `<i>${html_escape_1.htmlEscape(item.title)}</i>`;
        if (author)
            title += `(${html_escape_1.htmlEscape(author)})`;
        title = title.trim();
    }
    html.body += `<div>${title}</div>\n`;
    _note(item.extra, 'extra');
    for (const note of notes) {
        _note(note, 'note');
    }
    for (const att of item.attachments || []) {
        _note(att, 'attachment');
    }
}
function _reset(starting) {
    if (starting > html.levels)
        return '';
    let reset = 'counter-reset:';
    for (let level = starting; level <= html.levels; level++) {
        reset += ` h${level}counter 0`;
    }
    return reset + ';';
    // return `counter-reset: h${ starting }counter;`
}
function _keep(item) {
    if (item.extra)
        return true;
    if (item.note)
        return true;
    if (item.notes && item.notes.find(note => note.note))
        return true;
    if (item.attachments && item.attachments.find(att => att.note))
        return true;
    return false;
}
Translator.doExport = () => {
    // collect all notes
    const items = {};
    let z_item;
    while (z_item = Zotero.nextItem()) {
        Object.assign(z_item, Zotero.BetterBibTeX.extractFields(z_item));
        if (_keep(z_item))
            items[z_item.itemID] = z_item;
    }
    const filed = {};
    // expand collections
    for (const collection of Object.values(Translator.collections)) {
        collection.collections = collection.collections.map(key => Translator.collections[key]).filter(v => v);
        collection.items = collection.items.map(id => filed[id] = items[id]).filter(v => v);
    }
    // prune empty branches
    const collections = Object.values(Translator.collections).filter(collection => !collection.parent && !_prune(collection));
    html.body += '<html><body>';
    for (const item of Object.values(items)) {
        if (filed[item.itemID])
            continue;
        _item(item);
    }
    for (const collection of collections) {
        _collection(collection);
    }
    let style = `  body { ${_reset(1)} }\n`;
    for (let level = 1; level <= html.levels; level++) {
        style += `  h${level} { ${_reset(level + 1)} }\n`;
        const label = Array.from({ length: level }, (x, i) => `counter(h${i + 1}counter)`).join(' "." ');
        style += `  h${level}:before { counter-increment: h${level}counter; content: ${label} ".\\0000a0\\0000a0"; }\n`;
    }
    style += '  blockquote { border-left: 1px solid gray; }\n';
    Zotero.write(`<html><head><style>${style}</style></head><body>${html.body}</body></html>`);
};
; Zotero.debug('BBT: loaded translators/Collected notes.ts'); } catch ($wrap_loader_catcher_translators_Collected_notes_ts) { Zotero.logError('Error: BBT: load of translators/Collected notes.ts failed:' + $wrap_loader_catcher_translators_Collected_notes_ts + '::' + $wrap_loader_catcher_translators_Collected_notes_ts.stack) };

/***/ }),

/***/ "./lib/html-escape.ts":
/*!****************************!*\
  !*** ./lib/html-escape.ts ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

Zotero.debug('BBT: loading translators/lib/html-escape.ts'); try { "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function htmlEscape(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
exports.htmlEscape = htmlEscape;
; Zotero.debug('BBT: loaded translators/lib/html-escape.ts'); } catch ($wrap_loader_catcher_translators_lib_html_escape_ts) { Zotero.logError('Error: BBT: load of translators/lib/html-escape.ts failed:' + $wrap_loader_catcher_translators_lib_html_escape_ts + '::' + $wrap_loader_catcher_translators_lib_html_escape_ts.stack) };

/***/ })

/******/ });
