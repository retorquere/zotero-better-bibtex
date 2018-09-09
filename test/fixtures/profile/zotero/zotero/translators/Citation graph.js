{
	"translatorID": "19afa3fd-1c7f-4eb8-a37e-8d07768493e8",
	"label": "Citation graph",
	"creator": "Emiliano heyns",
	"target": "gml",
	"minVersion": "4.0.27",
	"maxVersion": "",
	"translatorType": 2,
	"browserSupport": "gcsv",
	"inRepository": false,
	"priority": 100,
	"lastUpdated": "2018-09-09 20:22:31"
}

var Translator = {
  initialize: function () {},
  version: "5.0.201.emile.titanarum",
  Citationgraph: true,
  // header == ZOTERO_TRANSLATOR_INFO -- maybe pick it from there
  header: {"translatorID":"19afa3fd-1c7f-4eb8-a37e-8d07768493e8","label":"Citation graph","description":"exports a citation graph in graphml format. Use gephi or yEd to clean up and visualize","creator":"Emiliano heyns","target":"gml","minVersion":"4.0.27","maxVersion":"","translatorType":2,"browserSupport":"gcsv","inRepository":false,"priority":100,"lastUpdated":"2018-09-09 20:22:31"},
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
    Zotero.debug("Citation graph" + ' export took ' + (Date.now() - start))
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./Citation graph.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./Citation graph.ts":
/*!***************************!*\
  !*** ./Citation graph.ts ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

Zotero.debug('BBT: loading translators/Citation graph.ts'); try { "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __webpack_require__(/*! ./lib/debug */ "./lib/debug.ts");
function node(id, label, style = null) {
    Zotero.write('  node [\n');
    Zotero.write(`    id ${id}\n`);
    Zotero.write(`    label ${JSON.stringify(label)}\n`);
    if (style)
        Zotero.write(`    graphics [ outlineStyle "${style}" ]\n`);
    Zotero.write('  ]\n');
}
function edge(source, target) {
    Zotero.write('  edge [\n');
    Zotero.write(`    source ${source}\n`);
    Zotero.write(`    target ${target}\n`);
    Zotero.write('  ]\n');
}
Translator.doExport = () => {
    Zotero.write('Creator "Zotero Better BibTeX"\n');
    Zotero.write('Version "2.15"\n');
    Zotero.write('graph [\n');
    Zotero.write('  hierarchic 1\n');
    Zotero.write('  label ""\n');
    Zotero.write('  directed 1\n');
    const items = {};
    let _item;
    let id = -1;
    while ((_item = Zotero.nextItem())) {
        if (['note', 'attachment'].includes(_item.itemType))
            continue;
        id += 1;
        /*
        const label = []
    
        if (_item.creators && _item.creators.length) {
          const name = _item.creators[0].name || _item.creators[0].lastName
          if (name) label.push(name)
        }
    
        if (_item.date) {
          let date = Zotero.BetterBibTeX.parseDate(_item.date)
          if (date.from) date = date.from
          if (date.year) label.push(`(${date.year})`)
        }
    
        if (label.length || _item.title) {
          Zotero.write(`  ${_item.citekey} [`)
          if (label.length) Zotero.write(`label=${JSON.stringify(label.join(' '))}`)
          if (_item.title) Zotero.write(`xlabel=${JSON.stringify(_item.title)}`)
          Zotero.write('];\n')
        }
        */
        node(id, _item.citekey);
        items[_item.citekey] = {
            id,
            cites: (_item.extra || '').split('\n').filter(line => line.startsWith('cites:')).map(line => line.replace(/^cites:/, '').trim()).filter(key => key),
        };
    }
    debug_1.debug(items);
    for (const item of Object.values(items)) {
        for (const cited of item.cites) {
            if (!items[cited]) {
                id += 1;
                items[cited] = {
                    id,
                    cites: [],
                };
                node(id, cited, 'dashed');
            }
            edge(item.id, items[cited].id);
        }
    }
    Zotero.write(']\n');
};
; Zotero.debug('BBT: loaded translators/Citation graph.ts'); } catch ($wrap_loader_catcher_translators_Citation_graph_ts) { Zotero.logError('Error: BBT: load of translators/Citation graph.ts failed:' + $wrap_loader_catcher_translators_Citation_graph_ts + '::' + $wrap_loader_catcher_translators_Citation_graph_ts.stack) };

/***/ }),

/***/ "./lib/debug.ts":
/*!**********************!*\
  !*** ./lib/debug.ts ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

Zotero.debug('BBT: loading translators/lib/debug.ts'); try { "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { format } from '../../content/debug-formatter'
function debug(...msg) {
    // if (!Translator.debugEnabled && !Translator.preferences.testing) return
    // Zotero.debug(format(`better-bibtex:${Translator.header.label}`, msg))
    Zotero.BetterBibTeX.debug(Translator.header.label, ...msg);
}
exports.debug = debug;
; Zotero.debug('BBT: loaded translators/lib/debug.ts'); } catch ($wrap_loader_catcher_translators_lib_debug_ts) { Zotero.logError('Error: BBT: load of translators/lib/debug.ts failed:' + $wrap_loader_catcher_translators_lib_debug_ts + '::' + $wrap_loader_catcher_translators_lib_debug_ts.stack) };

/***/ })

/******/ });
