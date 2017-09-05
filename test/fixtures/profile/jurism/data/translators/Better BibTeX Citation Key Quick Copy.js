{
  "translatorID": "a515a220-6fef-45ea-9842-8025dfebcc8f",
  "label": "Better BibTeX Citation Key Quick Copy",
  "creator": "Emiliano heyns",
  "target": "txt",
  "minVersion": "4.0.27",
  "translatorType": 2,
  "browserSupport": "gcsv",
  "priority": 100,
  "inRepository": false,
  "lastUpdated": "2017-09-05 07:26:36"
}

var Translator = {
  initialize: function () {},
  version: "5.0.2.emile.java-cotton",
  BetterBibTeXCitationKeyQuickCopy: true,
  // header == ZOTERO_TRANSLATOR_INFO -- maybe pick it from there
  header: {"translatorID":"a515a220-6fef-45ea-9842-8025dfebcc8f","label":"Better BibTeX Citation Key Quick Copy","creator":"Emiliano heyns","target":"txt","minVersion":"4.0.27","translatorType":2,"browserSupport":"gcsv","priority":100,"inRepository":false,"lastUpdated":"2017-09-05 07:26:36"},
  preferences: {"asciiBibLaTeX":false,"asciiBibTeX":true,"attachmentsNoMetadata":false,"autoAbbrev":false,"autoAbbrevStyle":"","autoExport":"idle","autoExportIdleWait":10,"cacheFlushInterval":5,"itemObserverDelay":100,"citeCommand":"cite","citekeyFormat":"[auth][shorttitle][year]","citekeyFold":true,"DOIandURL":"both","bibtexURL":"off","csquotes":"","keyConflictPolicy":"keep","langID":"babel","pinCitekeys":"manual","preserveBibTeXVariables":false,"rawImports":false,"citekeyScan":"","skipFields":"","skipWords":"a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum","warnBulkModify":10,"postscript":"","jabrefGroups":4,"defaultDateParserLocale":"","bibtexParticleNoOp":false,"biblatexExtendedNameFormat":false,"biblatexExtendedDateFormat":false,"quickCopyMode":"latex","quickCopyPandocBrackets":false,"jurismPreferredLanguage":"zh-alalc97","qualityReport":false,"suppressTitleCase":false,"parseParticles":true,"debug":false,"testing":false,"rawLaTag":"#LaTeX"},
  options: {},

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
/******/ 	return __webpack_require__(__webpack_require__.s = 92);
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

/***/ 92:
/*!******************************************************!*\
  !*** ./Better BibTeX Citation Key Quick Copy.coffee ***!
  \******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Exporter, Mode, debug;

Exporter = __webpack_require__(/*! ./lib/exporter.coffee */ 6);

debug = __webpack_require__(/*! ./lib/debug.coffee */ 0);

Mode = {
  gitbook: function(items) {
    var citations, item;
    citations = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push("{{ \"" + item.citekey + "\" | cite }}");
      }
      return results;
    })();
    Zotero.write(citations.join(''));
  },
  atom: function(items) {
    var item, keys;
    keys = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push(item.citekey);
      }
      return results;
    })();
    if (keys.length === 1) {
      Zotero.write("[](#@" + keys[0] + ")");
    } else {
      Zotero.write("[](?@" + (keys.join(',')) + ")");
    }
  },
  latex: function(items) {
    var cmd, item, keys;
    keys = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push(item.citekey);
      }
      return results;
    })();
    cmd = ("" + Translator.preferences.citeCommand).trim();
    if (cmd === '') {
      Zotero.write(keys.join(','));
    } else {
      Zotero.write("\\" + cmd + "{" + (keys.join(',')) + "}");
    }
  },
  citekeys: function(items) {
    var item, keys;
    keys = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push(item.citekey);
      }
      return results;
    })();
    Zotero.write(keys.join(','));
  },
  pandoc: function(items) {
    var item, keys;
    keys = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push("@" + item.citekey);
      }
      return results;
    })();
    keys = keys.join('; ');
    if (Translator.preferences.quickCopyPandocBrackets) {
      keys = "[" + keys + "]";
    }
    Zotero.write(keys);
  },
  orgmode: function(items) {
    var groupID, i, id, item, key, len, m, type;
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      m = item.uri.match(/\/(users|groups)\/([0-9]+|(local\/[^\/]+))\/items\/([A-Z0-9]{8})$/);
      if (!m) {
        throw "Malformed item uri " + item.uri;
      }
      type = m[1];
      groupID = m[2];
      key = m[4];
      switch (type) {
        case 'users':
          if (groupID.indexOf('local') !== 0) {
            debug("Link to synced item " + item.uri);
          }
          id = "0_" + key;
          break;
        case 'groups':
          if (!groupID) {
            throw "Missing groupID in " + item.uri;
          }
          id = groupID + "~" + key;
      }
      Zotero.write("[[zotero://select/items/" + id + "][@" + item.citekey + "]]");
    }
  }
};

Translator.doExport = function() {
  var item, items, mode;
  Exporter = new Exporter();
  items = [];
  while (item = Exporter.nextItem()) {
    items.push(item);
  }
  mode = Mode["" + Translator.options.quickCopyMode] || Mode["" + Translator.preferences.quickCopyMode];
  if (mode) {
    mode.call(null, items);
  } else {
    throw "Unsupported Quick Copy format '" + (Translator.options.quickCopyMode || Translator.preferences.quickCopyMode) + "'";
  }
};


/***/ })

/******/ });