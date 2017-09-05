{
  "translatorID": "f895aa0d-f28e-47fe-b247-2ea77c6ed583",
  "translatorType": 2,
  "label": "Better BibLaTeX",
  "creator": "Simon Kornblith, Richard Karnesky, Anders Johansson and Emiliano Heyns",
  "target": "bib",
  "minVersion": "4.0.27",
  "maxVersion": "",
  "configOptions": {
    "getCollections": true,
    "serializationCache": true
  },
  "displayOptions": {
    "exportNotes": false,
    "exportFileData": false,
    "useJournalAbbreviation": false,
    "Keep updated": false
  },
  "priority": 50,
  "inRepository": false,
  "lastUpdated": "2017-09-05 07:26:36"
}

var Translator = {
  initialize: function () {},
  version: "5.0.2.emile.java-cotton",
  BetterBibLaTeX: true,
  // header == ZOTERO_TRANSLATOR_INFO -- maybe pick it from there
  header: {"translatorID":"f895aa0d-f28e-47fe-b247-2ea77c6ed583","translatorType":2,"label":"Better BibLaTeX","creator":"Simon Kornblith, Richard Karnesky, Anders Johansson and Emiliano Heyns","target":"bib","minVersion":"4.0.27","maxVersion":"","configOptions":{"getCollections":true,"serializationCache":true},"displayOptions":{"exportNotes":false,"exportFileData":false,"useJournalAbbreviation":false,"Keep updated":false},"priority":50,"inRepository":false,"lastUpdated":"2017-09-05 07:26:36"},
  preferences: {"asciiBibLaTeX":false,"asciiBibTeX":true,"attachmentsNoMetadata":false,"autoAbbrev":false,"autoAbbrevStyle":"","autoExport":"idle","autoExportIdleWait":10,"cacheFlushInterval":5,"itemObserverDelay":100,"citeCommand":"cite","citekeyFormat":"[auth][shorttitle][year]","citekeyFold":true,"DOIandURL":"both","bibtexURL":"off","csquotes":"","keyConflictPolicy":"keep","langID":"babel","pinCitekeys":"manual","preserveBibTeXVariables":false,"rawImports":false,"citekeyScan":"","skipFields":"","skipWords":"a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum","warnBulkModify":10,"postscript":"","jabrefGroups":4,"defaultDateParserLocale":"","bibtexParticleNoOp":false,"biblatexExtendedNameFormat":false,"biblatexExtendedDateFormat":false,"quickCopyMode":"latex","quickCopyPandocBrackets":false,"jurismPreferredLanguage":"zh-alalc97","qualityReport":false,"suppressTitleCase":false,"parseParticles":true,"debug":false,"testing":false,"rawLaTag":"#LaTeX"},
  options: {"exportNotes":false,"exportFileData":false,"useJournalAbbreviation":false,"Keep updated":false},

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
/******/ 	return __webpack_require__(__webpack_require__.s = 90);
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

/***/ 10:
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

/***/ 14:
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

/***/ 27:
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

/***/ 42:
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

/***/ 43:
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

/***/ 44:
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

/***/ 6:
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

/***/ 7:
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


/***/ }),

/***/ 90:
/*!********************************!*\
  !*** ./Better BibLaTeX.coffee ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Exporter, Reference, datefield, debug,
  hasProp = {}.hasOwnProperty;

Reference = __webpack_require__(/*! ./bibtex/reference.coffee */ 42);

Exporter = __webpack_require__(/*! ./lib/exporter.coffee */ 6);

debug = __webpack_require__(/*! ./lib/debug.coffee */ 0);

datefield = __webpack_require__(/*! ./bibtex/datefield.coffee */ 91);

Reference.prototype.fieldEncoding = {
  url: 'url',
  doi: 'verbatim',
  eprint: 'verbatim',
  eprintclass: 'verbatim',
  crossref: 'raw',
  xdata: 'raw',
  xref: 'raw',
  entrykey: 'raw',
  childentrykey: 'raw',
  verba: 'verbatim',
  verbb: 'verbatim',
  verbc: 'verbatim',
  institution: 'literal',
  publisher: 'literal',
  location: 'literal'
};

Reference.prototype.caseConversion = {
  title: true,
  shorttitle: true,
  origtitle: true,
  booktitle: true,
  maintitle: true,
  type: true,
  eventtitle: true
};

Reference.prototype.requiredFields = {
  article: ['author', 'title', 'journaltitle', 'year/date'],
  book: ['author', 'title', 'year/date'],
  mvbook: ['book'],
  inbook: ['author', 'title', 'booktitle', 'year/date'],
  bookinbook: ['inbook'],
  suppbook: ['inbook'],
  booklet: ['author/editor', 'title', 'year/date'],
  collection: ['editor', 'title', 'year/date'],
  mvcollection: ['collection'],
  incollection: ['author', 'title', 'booktitle', 'year/date'],
  suppcollection: ['incollection'],
  manual: ['author/editor', 'title', 'year/date'],
  misc: ['author/editor', 'title', 'year/date'],
  online: ['author/editor', 'title', 'year/date', 'url'],
  patent: ['author', 'title', 'number', 'year/date'],
  periodical: ['editor', 'title', 'year/date'],
  suppperiodical: ['article'],
  proceedings: ['title', 'year/date'],
  mvproceedings: ['proceedings'],
  inproceedings: ['author', 'title', 'booktitle', 'year/date'],
  reference: ['collection'],
  mvreference: ['collection'],
  inreference: ['incollection'],
  report: ['author', 'title', 'type', 'institution', 'year/date'],
  thesis: ['author', 'title', 'type', 'institution', 'year/date'],
  unpublished: ['author', 'title', 'year/date'],
  mastersthesis: ['author', 'title', 'institution', 'year/date'],
  techreport: ['author', 'title', 'institution', 'year/date']
};

Reference.prototype.requiredFields.conference = Reference.prototype.requiredFields.inproceedings;

Reference.prototype.requiredFields.electronic = Reference.prototype.requiredFields.online;

Reference.prototype.requiredFields.phdthesis = Reference.prototype.requiredFields.mastersthesis;

Reference.prototype.requiredFields.www = Reference.prototype.requiredFields.online;

Reference.prototype.addCreators = function() {
  var creator, creators, field, j, kind, len, ref1, value;
  if (!(this.item.creators && this.item.creators.length)) {
    return;
  }
  creators = {
    author: [],
    bookauthor: [],
    commentator: [],
    editor: [],
    editora: [],
    editorb: [],
    holder: [],
    translator: [],
    scriptwriter: [],
    director: []
  };
  ref1 = this.item.creators;
  for (j = 0, len = ref1.length; j < len; j++) {
    creator = ref1[j];
    kind = (function() {
      var ref2, ref3;
      switch (creator.creatorType) {
        case 'director':
          if ((ref2 = this.referencetype) === 'video' || ref2 === 'movie') {
            return 'director';
          } else {
            return 'author';
          }
          break;
        case 'author':
        case 'interviewer':
        case 'programmer':
        case 'artist':
        case 'podcaster':
        case 'presenter':
          return 'author';
        case 'bookAuthor':
          return 'bookauthor';
        case 'commenter':
          return 'commentator';
        case 'editor':
          return 'editor';
        case 'inventor':
          return 'holder';
        case 'translator':
          return 'translator';
        case 'seriesEditor':
          return 'editorb';
        case 'scriptwriter':
          if ((ref3 = this.referencetype) === 'video' || ref3 === 'movie') {
            return 'scriptwriter';
          } else {
            return 'editora';
          }
          break;
        default:
          return 'editora';
      }
    }).call(this);
    creators[kind].push(creator);
  }
  for (field in creators) {
    if (!hasProp.call(creators, field)) continue;
    value = creators[field];
    this.remove(field);
    this.add({
      name: field,
      value: value,
      enc: 'creators'
    });
  }
  if (creators.editora.length > 0) {
    this.add({
      editoratype: 'collaborator'
    });
  }
  if (creators.editorb.length > 0) {
    this.add({
      editorbtype: 'redactor'
    });
  }
};

Reference.prototype.typeMap = {
  csl: {
    article: 'article',
    'article-journal': 'article',
    'article-magazine': {
      type: 'article',
      subtype: 'magazine'
    },
    'article-newspaper': {
      type: 'article',
      subtype: 'newspaper'
    },
    bill: 'legislation',
    book: 'book',
    broadcast: {
      type: 'misc',
      subtype: 'broadcast'
    },
    chapter: 'incollection',
    dataset: 'data',
    entry: 'inreference',
    'entry-dictionary': 'inreference',
    'entry-encyclopedia': 'inreference',
    figure: 'image',
    graphic: 'image',
    interview: {
      type: 'misc',
      subtype: 'interview'
    },
    legal_case: 'jurisdiction',
    legislation: 'legislation',
    manuscript: 'unpublished',
    map: {
      type: 'misc',
      subtype: 'map'
    },
    motion_picture: 'movie',
    musical_score: 'audio',
    pamphlet: 'booklet',
    'paper-conference': 'inproceedings',
    patent: 'patent',
    personal_communication: 'letter',
    post: 'online',
    'post-weblog': 'online',
    report: 'report',
    review: 'review',
    'review-book': 'review',
    song: 'music',
    speech: {
      type: 'misc',
      subtype: 'speech'
    },
    thesis: 'thesis',
    treaty: 'legal',
    webpage: 'online'
  },
  zotero: {
    artwork: 'artwork',
    audioRecording: 'audio',
    bill: 'legislation',
    blogPost: 'online',
    book: 'book',
    bookSection: 'incollection',
    "case": 'jurisdiction',
    computerProgram: 'software',
    conferencePaper: 'inproceedings',
    dictionaryEntry: 'inreference',
    document: 'misc',
    email: 'letter',
    encyclopediaArticle: 'inreference',
    film: 'movie',
    forumPost: 'online',
    hearing: 'jurisdiction',
    instantMessage: 'misc',
    interview: 'misc',
    journalArticle: 'article',
    letter: 'letter',
    magazineArticle: {
      type: 'article',
      subtype: 'magazine'
    },
    manuscript: 'unpublished',
    map: 'misc',
    newspaperArticle: {
      type: 'article',
      subtype: 'newspaper'
    },
    patent: 'patent',
    podcast: 'audio',
    presentation: 'unpublished',
    radioBroadcast: 'audio',
    report: 'report',
    statute: 'legislation',
    thesis: 'thesis',
    tvBroadcast: 'video',
    videoRecording: 'video',
    webpage: 'online'
  }
};

Translator.initialize = function() {
  Reference.installPostscript();
  Translator.unicode = !Translator.preferences.asciiBibLaTeX;
};

Translator.doExport = function() {
  var archive, date, eprinttype, i, item, j, k, l, lang, languages, len, len1, len2, m, main, note, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, thesistype;
  debug('Translation started with prefs', Translator.preferences);
  Exporter = new Exporter();
  Zotero.write('\n');
  while (item = Exporter.nextItem()) {
    ref = new Reference(item);
    if (((ref1 = item.__type__) === 'bookSection' || ref1 === 'chapter') && ref.hasCreator('bookAuthor')) {
      ref.referencetype = 'inbook';
    }
    if (item.__type__ === 'book' && !ref.hasCreator('author') && ref.hasCreator('editor')) {
      ref.referencetype = 'collection';
    }
    if (ref.referencetype === 'book' && item.numberOfVolumes) {
      ref.referencetype = 'mvbook';
    }
    if (m = (ref2 = item.url) != null ? ref2.match(/^http:\/\/www.jstor.org\/stable\/([\S]+)$/i) : void 0) {
      ref.add({
        eprinttype: 'jstor'
      });
      ref.add({
        eprint: m[1]
      });
      delete item.url;
      ref.remove('url');
    }
    if (m = (ref3 = item.url) != null ? ref3.match(/^http:\/\/books.google.com\/books?id=([\S]+)$/i) : void 0) {
      ref.add({
        eprinttype: 'googlebooks'
      });
      ref.add({
        eprint: m[1]
      });
      delete item.url;
      ref.remove('url');
    }
    if (m = (ref4 = item.url) != null ? ref4.match(/^http:\/\/www.ncbi.nlm.nih.gov\/pubmed\/([\S]+)$/i) : void 0) {
      ref.add({
        eprinttype: 'pubmed'
      });
      ref.add({
        eprint: m[1]
      });
      delete item.url;
      ref.remove('url');
    }
    ref5 = ['pmid', 'arxiv', 'jstor', 'hdl', 'googlebooks'];
    for (j = 0, len = ref5.length; j < len; j++) {
      eprinttype = ref5[j];
      if (ref.has[eprinttype]) {
        if (!ref.has.eprinttype) {
          ref.add({
            eprinttype: eprinttype
          });
          ref.add({
            eprint: ref.has[eprinttype].value
          });
        }
        ref.remove(eprinttype);
      }
    }
    if (item.archive && item.archiveLocation) {
      archive = true;
      switch (item.archive.toLowerCase()) {
        case 'arxiv':
          if (!ref.has.eprinttype) {
            ref.add({
              eprinttype: 'arxiv'
            });
          }
          ref.add({
            eprintclass: item.callNumber
          });
          break;
        case 'jstor':
          if (!ref.has.eprinttype) {
            ref.add({
              eprinttype: 'jstor'
            });
          }
          break;
        case 'pubmed':
          if (!ref.has.eprinttype) {
            ref.add({
              eprinttype: 'pubmed'
            });
          }
          break;
        case 'hdl':
          if (!ref.has.eprinttype) {
            ref.add({
              eprinttype: 'hdl'
            });
          }
          break;
        case 'googlebooks':
        case 'google books':
          if (!ref.has.eprinttype) {
            ref.add({
              eprinttype: 'googlebooks'
            });
          }
          break;
        default:
          archive = false;
      }
      if (archive) {
        if (!ref.has.eprint) {
          ref.add({
            eprint: item.archiveLocation
          });
        }
      }
    }
    ref.add({
      langid: ref.language
    });
    ref.add({
      location: item.place
    });
    ref.add({
      chapter: item.chapter
    });
    ref.add({
      edition: item.edition
    });
    ref.add({
      name: 'title',
      value: item.title
    });
    ref.add({
      volume: item.volume
    });
    ref.add({
      rights: item.rights
    });
    ref.add({
      isbn: item.ISBN
    });
    ref.add({
      issn: item.ISSN
    });
    ref.add({
      url: item.url
    });
    ref.add({
      doi: item.DOI
    });
    ref.add({
      shorttitle: item.shortTitle
    });
    ref.add({
      abstract: item.abstractNote
    });
    ref.add({
      volumes: item.numberOfVolumes
    });
    ref.add({
      version: item.versionNumber
    });
    ref.add({
      eventtitle: item.conferenceName
    });
    ref.add({
      pagetotal: item.numPages
    });
    ref.add({
      type: item.type
    });
    ref.add({
      number: item.seriesNumber || item.number || item.docketNumber
    });
    ref.add({
      name: (isNaN(parseInt(item.issue)) || (('' + parseInt(item.issue)) !== ('' + item.issue)) ? 'issue' : 'number'),
      value: item.issue
    });
    switch (item.__type__) {
      case 'case':
      case 'gazette':
      case 'legal_case':
        ref.add({
          name: 'journaltitle',
          value: item.reporter,
          preserveBibTeXVariables: true
        });
        break;
      case 'statute':
      case 'bill':
      case 'legislation':
        ref.add({
          name: 'journaltitle',
          value: item.code,
          preserveBibTeXVariables: true
        });
    }
    if (item.publicationTitle) {
      switch (item.__type__) {
        case 'bookSection':
        case 'conferencePaper':
        case 'dictionaryEntry':
        case 'encyclopediaArticle':
        case 'chapter':
          ref.add({
            name: 'booktitle',
            value: item.bookTitle || item.publicationTitle,
            preserveBibTeXVariables: true
          });
          break;
        case 'magazineArticle':
        case 'newspaperArticle':
        case 'article-magazine':
        case 'article-newspaper':
          ref.add({
            name: 'journaltitle',
            value: item.publicationTitle,
            preserveBibTeXVariables: true
          });
          if ((ref6 = item.__type__) === 'newspaperArticle' || ref6 === 'article-newspaper') {
            ref.add({
              journalsubtitle: item.section
            });
          }
          break;
        case 'journalArticle':
        case 'article':
        case 'article-journal':
          if (ref.isBibVar(item.publicationTitle)) {
            ref.add({
              name: 'journaltitle',
              value: item.publicationTitle,
              preserveBibTeXVariables: true
            });
          } else {
            if (Translator.options.useJournalAbbreviation && item.journalAbbreviation) {
              ref.add({
                name: 'journaltitle',
                value: item.journalAbbreviation,
                preserveBibTeXVariables: true
              });
            } else {
              ref.add({
                name: 'journaltitle',
                value: item.publicationTitle,
                preserveBibTeXVariables: true
              });
              ref.add({
                name: 'shortjournal',
                value: item.journalAbbreviation,
                preserveBibTeXVariables: true
              });
            }
          }
          break;
        default:
          if (!ref.has.journaltitle && item.publicationTitle !== item.title) {
            ref.add({
              journaltitle: item.publicationTitle
            });
          }
      }
    }
    if (!ref.has.booktitle) {
      ref.add({
        name: 'booktitle',
        value: item.bookTitle || item.encyclopediaTitle || item.dictionaryTitle || item.proceedingsTitle
      });
    }
    if (((ref7 = ref.referencetype) === 'movie' || ref7 === 'video') && !ref.has.booktitle) {
      ref.add({
        name: 'booktitle',
        value: item.websiteTitle || item.forumTitle || item.blogTitle || item.programTitle
      });
    }
    if (((ref8 = item.multi) != null ? (ref9 = ref8._keys) != null ? ref9.title : void 0 : void 0) && (main = ((ref10 = item.multi) != null ? (ref11 = ref10.main) != null ? ref11.title : void 0 : void 0) || item.language)) {
      languages = Object.keys(item.multi._keys.title).filter(function(lang) {
        return lang !== main;
      });
      main += '-';
      languages.sort(function(a, b) {
        if (a === b) {
          return 0;
        }
        if (a.indexOf(main) === 0 && b.indexOf(main) !== 0) {
          return -1;
        }
        if (a.indexOf(main) !== 0 && b.indexOf(main) === 0) {
          return 1;
        }
        if (a < b) {
          return -1;
        }
        return 1;
      });
      for (i = k = 0, len1 = languages.length; k < len1; i = ++k) {
        lang = languages[i];
        ref.add({
          name: (i === 0 ? 'titleaddon' : 'user' + String.fromCharCode('d'.charCodeAt() + i)),
          value: item.multi._keys.title[lang]
        });
      }
    }
    ref.add({
      series: item.seriesTitle || item.series
    });
    switch (item.__type__) {
      case 'report':
      case 'thesis':
        ref.add({
          institution: item.institution || item.publisher || item.university
        });
        break;
      case 'case':
      case 'hearing':
      case 'legal_case':
        ref.add({
          institution: item.court
        });
        break;
      default:
        ref.add({
          publisher: item.publisher
        });
    }
    switch (item.__type__) {
      case 'letter':
      case 'personal_communication':
        ref.add({
          name: 'type',
          value: item.letterType || 'Letter',
          replace: true
        });
        break;
      case 'email':
        ref.add({
          name: 'type',
          value: 'E-mail',
          replace: true
        });
        break;
      case 'thesis':
        thesistype = (ref12 = item.thesisType) != null ? ref12.toLowerCase() : void 0;
        if (thesistype === 'phdthesis' || thesistype === 'mastersthesis') {
          ref.referencetype = thesistype;
          ref.remove('type');
        } else {
          ref.add({
            name: 'type',
            value: item.thesisType,
            replace: true
          });
        }
        break;
      case 'report':
        if ((item.type || '').toLowerCase().trim() === 'techreport') {
          ref.referencetype = 'techreport';
        } else {
          ref.add({
            name: 'type',
            value: item.type,
            replace: true
          });
        }
        break;
      default:
        ref.add({
          name: 'type',
          value: item.type || item.websiteType || item.manuscriptType,
          replace: true
        });
    }
    ref.add({
      howpublished: item.presentationType || item.manuscriptType
    });
    ref.add({
      name: 'eventtitle',
      value: item.meetingName
    });
    ref.addCreators();
    if (item.accessDate && item.url) {
      ref.add({
        urldate: Zotero.Utilities.strToISO(item.accessDate)
      });
    }
    if (item.date) {
      if (Translator.preferences.biblatexExtendedDateFormat && Zotero.BetterBibTeX.isEDTF(item.date)) {
        ref.add({
          name: 'date',
          value: item.date,
          enc: 'verbatim'
        });
      } else {
        date = Zotero.BetterBibTeX.parseDate(item.date);
        ref.add(datefield(date, 'date', 'year'));
        ref.add(datefield(date.orig, 'origdate', 'origdate'));
      }
    }
    switch (false) {
      case !item.pages:
        ref.add({
          pages: item.pages.replace(/[-\u2012-\u2015\u2053]+/g, '--')
        });
        break;
      case !(item.firstPage && item.lastPage):
        ref.add({
          pages: item.firstPage + "--" + item.lastPage
        });
        break;
      case !item.firstPage:
        ref.add({
          pages: "" + item.firstPage
        });
    }
    ref.add({
      name: (ref.has.note ? 'annotation' : 'note'),
      value: item.extra,
      allowDuplicates: true
    });
    ref.add({
      name: 'keywords',
      value: item.tags,
      enc: 'tags'
    });
    if (item.notes && Translator.options.exportNotes) {
      ref13 = item.notes;
      for (l = 0, len2 = ref13.length; l < len2; l++) {
        note = ref13[l];
        ref.add({
          name: 'annotation',
          value: Zotero.Utilities.unescapeHTML(note.note),
          allowDuplicates: true,
          html: true
        });
      }
    }

    /*
     * 'juniorcomma' needs more thought, it isn't for *all* suffixes you want this. Or even at all.
    #ref.add({ name: 'options', value: (option for option in ['useprefix', 'juniorcomma'] when ref[option]).join(',') })
     */
    if (ref.useprefix) {
      ref.add({
        options: 'useprefix=true'
      });
    }
    ref.add({
      name: 'file',
      value: item.attachments,
      enc: 'attachments'
    });
    if (item.volumeTitle) {
      debug('volumeTitle: true, type:', item._type__, 'has:', Object.keys(ref.has));
      if (item.__type__ === 'book' && ref.has.title) {
        debug('volumeTitle: for book, type:', item.__type__, 'has:', Object.keys(ref.has));
        ref.add({
          name: 'maintitle',
          value: item.volumeTitle
        });
        ref14 = [ref.has.maintitle.bibtex, ref.has.title.bibtex], ref.has.title.bibtex = ref14[0], ref.has.maintitle.bibtex = ref14[1];
        ref15 = [ref.has.maintitle.value, ref.has.title.value], ref.has.title.value = ref15[0], ref.has.maintitle.value = ref15[1];
      }
      if (((ref16 = item.__type__) === 'bookSection' || ref16 === 'chapter') && ref.has.booktitle) {
        debug('volumeTitle: for bookSection, type:', item.__type__, 'has:', Object.keys(ref.has));
        ref.add({
          name: 'maintitle',
          value: item.volumeTitle
        });
        ref17 = [ref.has.maintitle.bibtex, ref.has.booktitle.bibtex], ref.has.booktitle.bibtex = ref17[0], ref.has.maintitle.bibtex = ref17[1];
        ref18 = [ref.has.maintitle.value, ref.has.booktitle.value], ref.has.booktitle.value = ref18[0], ref.has.maintitle.value = ref18[1];
      }
    }
    ref.complete();
  }
  Exporter.complete();
  Zotero.write('\n');
};


/***/ }),

/***/ 91:
/*!*********************************!*\
  !*** ./bibtex/datefield.coffee ***!
  \*********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var debug, format, pad, year;

debug = __webpack_require__(/*! ../lib/debug.coffee */ 0);

pad = function(v, pad) {
  if (v.length >= pad.length) {
    return v;
  }
  return (pad + v).slice(-pad.length);
};

year = function(y) {
  if (Math.abs(y) > 999) {
    return '' + y;
  } else {
    return (y < 0 ? '-' : '-') + ('000' + Math.abs(y)).slice(-4);
  }
};

format = function(date) {
  var formatted;
  switch (false) {
    case !(date.year && date.month && date.day):
      formatted = (year(date.year)) + "-" + (pad(date.month, '00')) + "-" + (pad(date.day, '00'));
      break;
    case !(date.year && date.month):
      formatted = (year(date.year)) + "-" + (pad(date.month, '00'));
      break;
    case !date.year:
      formatted = year(date.year);
      break;
    default:
      formatted = '';
  }
  if (Translator.preferences.biblatexExtendedDateFormat) {
    if (date.uncertain) {
      formatted += '?';
    }
    if (date.approximate) {
      formatted += '~';
    }
  }
  return formatted;
};

module.exports = function(date, formatted_field, verbatim_field) {
  var field;
  debug('formatting date', date);
  if (!date) {
    return {};
  }
  if (!date.type) {
    throw "Failed to parse " + date + ": " + (JSON.stringify(date));
  }
  switch (false) {
    case date.type !== 'verbatim':
      field = {
        name: verbatim_field,
        value: date.verbatim
      };
      break;
    case date.type !== 'date':
      field = {
        name: formatted_field,
        value: format(date)
      };
      break;
    case date.type !== 'interval':
      field = {
        name: formatted_field,
        value: format(date.from) + '/' + format(date.to)
      };
      break;
    case !date.year:
      field = {
        name: formatted_field,
        value: format(date)
      };
      break;
    default:
      field = {};
  }
  if (!(field.name && field.value)) {
    return {};
  }
  if (field.value) {
    field.value = field.value.replace(/~/g, '\u00A0');
  }
  return field;
};


/***/ })

/******/ });