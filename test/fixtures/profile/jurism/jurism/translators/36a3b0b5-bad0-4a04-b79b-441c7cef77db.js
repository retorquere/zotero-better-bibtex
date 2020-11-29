{
	"translatorID": "36a3b0b5-bad0-4a04-b79b-441c7cef77db",
	"label": "末 BetterBibTeX JSON (for debugging)",
	"description": "exports and imports references in BetterBibTeX debug format. Mostly for BBT-internal use",
	"creator": "Emiliano Heyns",
	"target": "json",
	"minVersion": "4.0.27",
	"maxVersion": "",
	"configOptions": {
		"async": true,
		"getCollections": true,
		"hash": "dee38c9b14725283d245756741ef3e19d62d987baabbcdddcb4aea782b2c2fd3"
	},
	"displayOptions": {
		"exportNotes": true,
		"exportFileData": false,
		"keepUpdated": false,
		"Normalize": false
	},
	"translatorType": 3,
	"browserSupport": "gcsv",
	"priority": 49,
	"inRepository": false,
	"lastUpdated": "2020-11-27 10:57:16"
}

ZOTERO_CONFIG = {"GUID":"juris-m@juris-m.github.io","ID":"jurism","CLIENT_NAME":"Juris-M","DOMAIN_NAME":"zotero.org","DOMAIN_NAME_JURISM":"juris-m.github.io","REPOSITORY_URL":"https://our.law.nagoya-u.ac.jp/updater/","REPOSITORY_CHECK_INTERVAL":86400,"REPOSITORY_RETRY_INTERVAL":3600,"BASE_URI":"http://zotero.org/","WWW_BASE_URL":"https://www.zotero.org/","PROXY_AUTH_URL":"https://zoteroproxycheck.s3.amazonaws.com/test","API_URL":"https://api.zotero.org/","STREAMING_URL":"wss://stream.zotero.org/","SERVICES_URL":"https://services.zotero.org/","API_VERSION":3,"CONNECTOR_MIN_VERSION":"5.0.59.1","PREF_BRANCH":"extensions.zotero.","BOOKMARKLET_ORIGIN":"https://www.zotero.org","BOOKMARKLET_URL":"https://www.zotero.org/bookmarklet/","START_URL":"https://juris-m.github.io/downloads/#start","QUICK_START_URL":"https://www.zotero.org/support/quick_start_guide","PDF_TOOLS_URL":"https://www.zotero.org/download/xpdf/","SUPPORT_URL":"https://juris-m.github.io/","TROUBLESHOOTING_URL":"https://juris-m.github.io/","FEEDBACK_URL":"https://juris-m.github.io/","CONNECTORS_URL":"https://juris-m.github.io/downloads/"}
var {Translator, detectImport, doImport, doExport} =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../gen/preferences/defaults.json":
/*!****************************************!*\
  !*** ../gen/preferences/defaults.json ***!
  \****************************************/
/*! default exports */
/*! export DOIandURL [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export ascii [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export asciiBibLaTeX [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export asciiBibTeX [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoAbbrev [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoAbbrevStyle [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoExport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoExportDelay [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoExportIdleWait [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoExportPathReplaceDiacritics [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoExportPathReplaceDirSep [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoExportPathReplaceSpace [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export autoPinDelay [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export automaticTags [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export auxImport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export biblatexExtendedDateFormat [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export biblatexExtendedNameFormat [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export biblatexExtractEprint [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export bibtexParticleNoOp [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export bibtexURL [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export cacheFlushInterval [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export citeCommand [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export citekeyFold [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export citekeyFormat [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export citeprocNoteCitekey [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export csquotes [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export debugLogDir [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export exportBibTeXStrings [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export exportBraceProtection [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export exportTitleCase [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export extraMergeCSL [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export extraMergeCitekeys [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export extraMergeTeX [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export git [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export ignorePostscriptErrors [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export import [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export importBibTeXStrings [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export importCaseProtection [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export importCitationKey [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export importExtra [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export importJabRefAbbreviations [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export importJabRefStrings [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export importSentenceCase [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export itemObserverDelay [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export jabrefFormat [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export keyConflictPolicy [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export keyScope [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export kuroshiro [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export mapMath [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export mapText [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export mapUnicode [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export newTranslatorsAskRestart [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export parseParticles [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export platform [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export postscript [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export postscriptOverride [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export qualityReport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export quickCopyMode [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export quickCopyPandocBrackets [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export rawImports [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export rawLaTag [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export relativeFilePaths [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export retainCache [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export scrubDatabase [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export skipFields [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export skipWords [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export strings [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export testing [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export verbatimFields [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export warnBulkModify [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export warnTitleCased [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export workers [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: module */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"DOIandURL\":\"both\",\"automaticTags\":true,\"asciiBibLaTeX\":false,\"ascii\":\"\",\"asciiBibTeX\":true,\"autoExport\":\"immediate\",\"quickCopyMode\":\"latex\",\"citeCommand\":\"cite\",\"quickCopyPandocBrackets\":false,\"citekeyFormat\":\"​[auth:lower][shorttitle3_3][year]\",\"citekeyFold\":true,\"keyConflictPolicy\":\"keep\",\"auxImport\":false,\"keyScope\":\"library\",\"exportBibTeXStrings\":\"off\",\"importBibTeXStrings\":true,\"bibtexParticleNoOp\":false,\"skipFields\":\"\",\"bibtexURL\":\"off\",\"warnBulkModify\":10,\"postscript\":\"\",\"strings\":\"\",\"autoAbbrev\":false,\"autoAbbrevStyle\":\"\",\"autoExportIdleWait\":10,\"cacheFlushInterval\":5,\"csquotes\":\"\",\"rawLaTag\":\"#LaTeX\",\"rawImports\":false,\"skipWords\":\"a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,to,toward,towards,un,una,unas,under,underneath,une,unlike,uno,unos,until,up,upon,versus,via,von,while,with,within,without,yet,zu,zum\",\"verbatimFields\":\"url,doi,file,eprint,verba,verbb,verbc,groups\",\"jabrefFormat\":0,\"qualityReport\":false,\"biblatexExtendedDateFormat\":true,\"biblatexExtractEprint\":true,\"biblatexExtendedNameFormat\":false,\"exportTitleCase\":true,\"exportBraceProtection\":true,\"retainCache\":false,\"importSentenceCase\":\"on+guess\",\"importCaseProtection\":\"as-needed\",\"autoExportDelay\":1,\"warnTitleCased\":false,\"itemObserverDelay\":5,\"autoPinDelay\":0,\"parseParticles\":true,\"citeprocNoteCitekey\":false,\"import\":true,\"importExtra\":true,\"importCitationKey\":true,\"extraMergeTeX\":true,\"extraMergeCSL\":true,\"extraMergeCitekeys\":true,\"importJabRefStrings\":true,\"importJabRefAbbreviations\":true,\"autoExportPathReplaceDirSep\":\"-\",\"autoExportPathReplaceSpace\":\" \",\"autoExportPathReplaceDiacritics\":false,\"postscriptOverride\":\"\",\"scrubDatabase\":false,\"ignorePostscriptErrors\":true,\"debugLogDir\":\"\",\"testing\":false,\"kuroshiro\":false,\"relativeFilePaths\":false,\"git\":\"config\",\"mapUnicode\":\"conservative\",\"mapText\":\"\",\"mapMath\":\"\",\"newTranslatorsAskRestart\":true,\"workers\":1,\"platform\":\"\"}");

/***/ }),

/***/ "../gen/version.js":
/*!*************************!*\
  !*** ../gen/version.js ***!
  \*************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = "5.2.89.emile.limonia";


/***/ }),

/***/ "../node_modules/safe-stable-stringify/index.js":
/*!******************************************************!*\
  !*** ../node_modules/safe-stable-stringify/index.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const stringify = __webpack_require__(/*! ./stable */ "../node_modules/safe-stable-stringify/stable.js")

module.exports = stringify
stringify.default = stringify


/***/ }),

/***/ "../node_modules/safe-stable-stringify/stable.js":
/*!*******************************************************!*\
  !*** ../node_modules/safe-stable-stringify/stable.js ***!
  \*******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = stringify

var indentation = ''
// eslint-disable-next-line
const strEscapeSequencesRegExp = /[\x00-\x1f\x22\x5c]/
// eslint-disable-next-line
const strEscapeSequencesReplacer = /[\x00-\x1f\x22\x5c]/g

// Escaped special characters. Use empty strings to fill up unused entries.
const meta = [
  '\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004',
  '\\u0005', '\\u0006', '\\u0007', '\\b', '\\t',
  '\\n', '\\u000b', '\\f', '\\r', '\\u000e',
  '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013',
  '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018',
  '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d',
  '\\u001e', '\\u001f', '', '', '\\"',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '\\\\'
]

function escapeFn (str) {
  return meta[str.charCodeAt(0)]
}

// Escape control characters, double quotes and the backslash.
// Note: it is faster to run this only once for a big string instead of only for
// the parts that it is necessary for. But this is only true if we do not add
// extra indentation to the string before.
function strEscape (str) {
  // Some magic numbers that worked out fine while benchmarking with v8 6.0
  if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
    return str
  }
  if (str.length > 100) {
    return str.replace(strEscapeSequencesReplacer, escapeFn)
  }
  var result = ''
  var last = 0
  for (var i = 0; i < str.length; i++) {
    const point = str.charCodeAt(i)
    if (point === 34 || point === 92 || point < 32) {
      if (last === i) {
        result += meta[point]
      } else {
        result += `${str.slice(last, i)}${meta[point]}`
      }
      last = i + 1
    }
  }
  if (last === 0) {
    result = str
  } else if (last !== i) {
    result += str.slice(last)
  }
  return result
}

// Full version: supports all options
function stringifyFullFn (key, parent, stack, replacer, indent) {
  var i, res, join
  const originalIndentation = indentation
  var value = parent[key]

  if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
    value = value.toJSON(key)
  }
  value = replacer.call(parent, key, value)

  switch (typeof value) {
    case 'object':
      if (value === null) {
        return 'null'
      }
      for (i = 0; i < stack.length; i++) {
        if (stack[i] === value) {
          return '"[Circular]"'
        }
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '[]'
        }
        stack.push(value)
        res = '['
        indentation += indent
        res += `\n${indentation}`
        join = `,\n${indentation}`
        // Use null as placeholder for non-JSON values.
        for (i = 0; i < value.length - 1; i++) {
          const tmp = stringifyFullFn(i, value, stack, replacer, indent)
          res += tmp !== undefined ? tmp : 'null'
          res += join
        }
        const tmp = stringifyFullFn(i, value, stack, replacer, indent)
        res += tmp !== undefined ? tmp : 'null'
        if (indentation !== '') {
          res += `\n${originalIndentation}`
        }
        res += ']'
        stack.pop()
        indentation = originalIndentation
        return res
      }

      var keys = insertSort(Object.keys(value))
      if (keys.length === 0) {
        return '{}'
      }
      stack.push(value)
      res = '{'
      indentation += indent
      res += `\n${indentation}`
      join = `,\n${indentation}`
      var separator = ''
      for (i = 0; i < keys.length; i++) {
        key = keys[i]
        const tmp = stringifyFullFn(key, value, stack, replacer, indent)
        if (tmp !== undefined) {
          res += `${separator}"${strEscape(key)}": ${tmp}`
          separator = join
        }
      }
      if (separator !== '') {
        res += `\n${originalIndentation}`
      } else {
        res = '{'
      }
      res += '}'
      stack.pop()
      indentation = originalIndentation
      return res
    case 'string':
      return `"${strEscape(value)}"`
    case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null'
    case 'boolean':
      return value === true ? 'true' : 'false'
  }
}

function stringifyFullArr (key, value, stack, replacer, indent) {
  var i, res, join
  const originalIndentation = indentation

  if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
    value = value.toJSON(key)
  }

  switch (typeof value) {
    case 'object':
      if (value === null) {
        return 'null'
      }
      for (i = 0; i < stack.length; i++) {
        if (stack[i] === value) {
          return '"[Circular]"'
        }
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '[]'
        }
        stack.push(value)
        res = '['
        indentation += indent
        res += `\n${indentation}`
        join = `,\n${indentation}`
        // Use null as placeholder for non-JSON values.
        for (i = 0; i < value.length - 1; i++) {
          const tmp = stringifyFullArr(i, value[i], stack, replacer, indent)
          res += tmp !== undefined ? tmp : 'null'
          res += join
        }
        const tmp = stringifyFullArr(i, value[i], stack, replacer, indent)
        res += tmp !== undefined ? tmp : 'null'
        if (indentation !== '') {
          res += `\n${originalIndentation}`
        }
        res += ']'
        stack.pop()
        indentation = originalIndentation
        return res
      }

      if (replacer.length === 0) {
        return '{}'
      }
      stack.push(value)
      res = '{'
      indentation += indent
      res += `\n${indentation}`
      join = `,\n${indentation}`
      var separator = ''
      for (i = 0; i < replacer.length; i++) {
        if (typeof replacer[i] === 'string' || typeof replacer[i] === 'number') {
          key = replacer[i]
          const tmp = stringifyFullArr(key, value[key], stack, replacer, indent)
          if (tmp !== undefined) {
            res += `${separator}"${strEscape(key)}": ${tmp}`
            separator = join
          }
        }
      }
      if (separator !== '') {
        res += `\n${originalIndentation}`
      } else {
        res = '{'
      }
      res += '}'
      stack.pop()
      indentation = originalIndentation
      return res
    case 'string':
      return `"${strEscape(value)}"`
    case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null'
    case 'boolean':
      return value === true ? 'true' : 'false'
  }
}

// Supports only the spacer option
function stringifyIndent (key, value, stack, indent) {
  var i, res, join
  const originalIndentation = indentation

  switch (typeof value) {
    case 'object':
      if (value === null) {
        return 'null'
      }
      if (typeof value.toJSON === 'function') {
        value = value.toJSON(key)
        // Prevent calling `toJSON` again.
        if (typeof value !== 'object') {
          return stringifyIndent(key, value, stack, indent)
        }
        if (value === null) {
          return 'null'
        }
      }
      for (i = 0; i < stack.length; i++) {
        if (stack[i] === value) {
          return '"[Circular]"'
        }
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '[]'
        }
        stack.push(value)
        res = '['
        indentation += indent
        res += `\n${indentation}`
        join = `,\n${indentation}`
        // Use null as placeholder for non-JSON values.
        for (i = 0; i < value.length - 1; i++) {
          const tmp = stringifyIndent(i, value[i], stack, indent)
          res += tmp !== undefined ? tmp : 'null'
          res += join
        }
        const tmp = stringifyIndent(i, value[i], stack, indent)
        res += tmp !== undefined ? tmp : 'null'
        if (indentation !== '') {
          res += `\n${originalIndentation}`
        }
        res += ']'
        stack.pop()
        indentation = originalIndentation
        return res
      }

      var keys = insertSort(Object.keys(value))
      if (keys.length === 0) {
        return '{}'
      }
      stack.push(value)
      res = '{'
      indentation += indent
      res += `\n${indentation}`
      join = `,\n${indentation}`
      var separator = ''
      for (i = 0; i < keys.length; i++) {
        key = keys[i]
        const tmp = stringifyIndent(key, value[key], stack, indent)
        if (tmp !== undefined) {
          res += `${separator}"${strEscape(key)}": ${tmp}`
          separator = join
        }
      }
      if (separator !== '') {
        res += `\n${originalIndentation}`
      } else {
        res = '{'
      }
      res += '}'
      stack.pop()
      indentation = originalIndentation
      return res
    case 'string':
      return `"${strEscape(value)}"`
    case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null'
    case 'boolean':
      return value === true ? 'true' : 'false'
  }
}

// Supports only the replacer option
function stringifyReplacerArr (key, value, stack, replacer) {
  var i, res
  // If the value has a toJSON method, call it to obtain a replacement value.
  if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
    value = value.toJSON(key)
  }

  switch (typeof value) {
    case 'object':
      if (value === null) {
        return 'null'
      }
      for (i = 0; i < stack.length; i++) {
        if (stack[i] === value) {
          return '"[Circular]"'
        }
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '[]'
        }
        stack.push(value)
        res = '['
        // Use null as placeholder for non-JSON values.
        for (i = 0; i < value.length - 1; i++) {
          const tmp = stringifyReplacerArr(i, value[i], stack, replacer)
          res += tmp !== undefined ? tmp : 'null'
          res += ','
        }
        const tmp = stringifyReplacerArr(i, value[i], stack, replacer)
        res += tmp !== undefined ? tmp : 'null'
        res += ']'
        stack.pop()
        return res
      }

      if (replacer.length === 0) {
        return '{}'
      }
      stack.push(value)
      res = '{'
      var separator = ''
      for (i = 0; i < replacer.length; i++) {
        if (typeof replacer[i] === 'string' || typeof replacer[i] === 'number') {
          key = replacer[i]
          const tmp = stringifyReplacerArr(key, value[key], stack, replacer)
          if (tmp !== undefined) {
            res += `${separator}"${strEscape(key)}":${tmp}`
            separator = ','
          }
        }
      }
      res += '}'
      stack.pop()
      return res
    case 'string':
      return `"${strEscape(value)}"`
    case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null'
    case 'boolean':
      return value === true ? 'true' : 'false'
  }
}

function stringifyReplacerFn (key, parent, stack, replacer) {
  var i, res
  var value = parent[key]
  // If the value has a toJSON method, call it to obtain a replacement value.
  if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
    value = value.toJSON(key)
  }
  value = replacer.call(parent, key, value)

  switch (typeof value) {
    case 'object':
      if (value === null) {
        return 'null'
      }
      for (i = 0; i < stack.length; i++) {
        if (stack[i] === value) {
          return '"[Circular]"'
        }
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '[]'
        }
        stack.push(value)
        res = '['
        // Use null as placeholder for non-JSON values.
        for (i = 0; i < value.length - 1; i++) {
          const tmp = stringifyReplacerFn(i, value, stack, replacer)
          res += tmp !== undefined ? tmp : 'null'
          res += ','
        }
        const tmp = stringifyReplacerFn(i, value, stack, replacer)
        res += tmp !== undefined ? tmp : 'null'
        res += ']'
        stack.pop()
        return res
      }

      var keys = insertSort(Object.keys(value))
      if (keys.length === 0) {
        return '{}'
      }
      stack.push(value)
      res = '{'
      var separator = ''
      for (i = 0; i < keys.length; i++) {
        key = keys[i]
        const tmp = stringifyReplacerFn(key, value, stack, replacer)
        if (tmp !== undefined) {
          res += `${separator}"${strEscape(key)}":${tmp}`
          separator = ','
        }
      }
      res += '}'
      stack.pop()
      return res
    case 'string':
      return `"${strEscape(value)}"`
    case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null'
    case 'boolean':
      return value === true ? 'true' : 'false'
  }
}

// Simple without any options
function stringifySimple (key, value, stack) {
  var i, res
  switch (typeof value) {
    case 'object':
      if (value === null) {
        return 'null'
      }
      if (typeof value.toJSON === 'function') {
        value = value.toJSON(key)
        // Prevent calling `toJSON` again
        if (typeof value !== 'object') {
          return stringifySimple(key, value, stack)
        }
        if (value === null) {
          return 'null'
        }
      }
      for (i = 0; i < stack.length; i++) {
        if (stack[i] === value) {
          return '"[Circular]"'
        }
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return '[]'
        }
        stack.push(value)
        res = '['
        // Use null as placeholder for non-JSON values.
        for (i = 0; i < value.length - 1; i++) {
          const tmp = stringifySimple(i, value[i], stack)
          res += tmp !== undefined ? tmp : 'null'
          res += ','
        }
        const tmp = stringifySimple(i, value[i], stack)
        res += tmp !== undefined ? tmp : 'null'
        res += ']'
        stack.pop()
        return res
      }

      var keys = insertSort(Object.keys(value))
      if (keys.length === 0) {
        return '{}'
      }
      stack.push(value)
      var separator = ''
      res = '{'
      for (i = 0; i < keys.length; i++) {
        key = keys[i]
        const tmp = stringifySimple(key, value[key], stack)
        if (tmp !== undefined) {
          res += `${separator}"${strEscape(key)}":${tmp}`
          separator = ','
        }
      }
      res += '}'
      stack.pop()
      return res
    case 'string':
      return `"${strEscape(value)}"`
    case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
      // Convert the numbers implicit to a string instead of explicit.
      return isFinite(value) ? String(value) : 'null'
    case 'boolean':
      return value === true ? 'true' : 'false'
  }
}

function insertSort (arr) {
  for (var i = 1; i < arr.length; i++) {
    const tmp = arr[i]
    var j = i
    while (j !== 0 && arr[j - 1] > tmp) {
      arr[j] = arr[j - 1]
      j--
    }
    arr[j] = tmp
  }

  return arr
}

function stringify (value, replacer, spacer) {
  var i
  var indent = ''
  indentation = ''

  if (arguments.length > 1) {
    // If the spacer parameter is a number, make an indent string containing that
    // many spaces.
    if (typeof spacer === 'number') {
      for (i = 0; i < spacer; i += 1) {
        indent += ' '
      }
    // If the spacer parameter is a string, it will be used as the indent string.
    } else if (typeof spacer === 'string') {
      indent = spacer
    }
    if (indent !== '') {
      if (replacer !== undefined && replacer !== null) {
        if (typeof replacer === 'function') {
          return stringifyFullFn('', { '': value }, [], replacer, indent)
        }
        if (Array.isArray(replacer)) {
          return stringifyFullArr('', value, [], replacer, indent)
        }
      }
      return stringifyIndent('', value, [], indent)
    }
    if (typeof replacer === 'function') {
      return stringifyReplacerFn('', { '': value }, [], replacer)
    }
    if (Array.isArray(replacer)) {
      return stringifyReplacerArr('', value, [], replacer)
    }
  }
  return stringifySimple('', value, [])
}


/***/ }),

/***/ "../content/client.ts":
/*!****************************!*\
  !*** ../content/client.ts ***!
  \****************************/
/*! flagged exports */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export client [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.client = void 0;
// we may be running in a translator, which will have it pre-loaded
if (typeof Components !== 'undefined')
    Components.utils.import('resource://zotero/config.js');
exports.client = ZOTERO_CONFIG.GUID.replace(/@.*/, '').replace('-', '');


/***/ }),

/***/ "../content/logger.ts":
/*!****************************!*\
  !*** ../content/logger.ts ***!
  \****************************/
/*! flagged exports */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export log [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.log = void 0;
const stringify_1 = __webpack_require__(/*! ./stringify */ "../content/stringify.ts");
const worker_1 = __webpack_require__(/*! ./worker */ "../content/worker.ts");
class Logger {
    format(error, msg) {
        let diff = null;
        const now = Date.now();
        if (this.timestamp)
            diff = now - this.timestamp;
        this.timestamp = now;
        if (typeof msg !== 'string') {
            let _msg = '';
            for (const m of msg) {
                const type = typeof m;
                if (type === 'string' || m instanceof String || type === 'number' || type === 'undefined' || type === 'boolean' || m === null) {
                    _msg += m;
                }
                else if (m instanceof Error) {
                    _msg += `<Error: ${m.message || m.name}${m.stack ? `\n${m.stack}` : Object.keys(m).join(', ')}>`;
                }
                else if (m && type === 'object' && m.message) { // mozilla exception, no idea on the actual instance type
                    // message,fileName,lineNumber,column,stack,errorCode
                    _msg += `<Error: ${m.message}#\n${m.stack}>`;
                }
                else {
                    _msg += stringify_1.stringify(m);
                }
                _msg += ' ';
            }
            msg = _msg;
        }
        const translator = typeof Translator !== 'undefined' && Translator.header.label;
        const prefix = ['better-bibtex', translator, error, worker_1.worker ? '(worker)' : ''].filter(p => p).join(' ');
        return `{${prefix}} +${diff} ${stringify_1.asciify(msg)}`;
    }
    debug(...msg) {
        // cannot user Zotero.Debug.enabled because it is not available in foreground exporters
        if (!Zotero.BetterBibTeX || Zotero.BetterBibTeX.debugEnabled())
            Zotero.debug(this.format('', msg));
    }
    error(...msg) {
        Zotero.debug(this.format('error', msg));
    }
}
exports.log = new Logger;


/***/ }),

/***/ "../content/stringify.ts":
/*!*******************************!*\
  !*** ../content/stringify.ts ***!
  \*******************************/
/*! flagged exports */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export asciify [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export stringify [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringify = exports.asciify = void 0;
// import _stringify from 'fast-safe-stringify'
const safe_stable_stringify_1 = __webpack_require__(/*! safe-stable-stringify */ "../node_modules/safe-stable-stringify/index.js");
function asciify(str) {
    return str.replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4)); // tslint:disable-line:no-magic-numbers
}
exports.asciify = asciify;
function stringify(obj, replacer, indent, ucode) {
    const stringified = safe_stable_stringify_1.default(obj, replacer, indent);
    return ucode ? asciify(stringified) : stringified;
}
exports.stringify = stringify;


/***/ }),

/***/ "../content/worker.ts":
/*!****************************!*\
  !*** ../content/worker.ts ***!
  \****************************/
/*! flagged exports */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export worker [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.worker = void 0;
exports.worker = (typeof importScripts !== 'undefined');


/***/ }),

/***/ "../gen/items/items.ts":
/*!*****************************!*\
  !*** ../gen/items/items.ts ***!
  \*****************************/
/*! flagged exports */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export label [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export name [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export simplifyForExport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export simplifyForImport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export valid [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.simplifyForImport = exports.simplifyForExport = exports.label = exports.name = exports.valid = void 0;
const client_1 = __webpack_require__(/*! ../../content/client */ "../content/client.ts");
const jurism = client_1.client === 'jurism';
const zotero = !jurism;
exports.valid = {
    type: {
        artwork: true,
        attachment: true,
        audioRecording: true,
        bill: true,
        blogPost: true,
        book: true,
        bookSection: true,
        case: true,
        classic: jurism,
        computerProgram: true,
        conferencePaper: true,
        dictionaryEntry: true,
        document: true,
        email: true,
        encyclopediaArticle: true,
        film: true,
        forumPost: true,
        gazette: jurism,
        hearing: true,
        instantMessage: true,
        interview: true,
        journalArticle: true,
        legalCommentary: jurism,
        letter: true,
        magazineArticle: true,
        manuscript: true,
        map: true,
        newspaperArticle: true,
        note: true,
        patent: true,
        podcast: true,
        presentation: true,
        radioBroadcast: true,
        regulation: jurism,
        report: true,
        standard: jurism,
        statute: true,
        thesis: true,
        treaty: jurism,
        tvBroadcast: true,
        videoRecording: true,
        webpage: true,
    },
    field: {
        artwork: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            artworkMedium: true,
            artworkSize: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            medium: true,
            multi: true,
            notes: true,
            publicationTitle: jurism,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            websiteTitle: jurism,
        },
        attachment: {
            accessDate: true,
            dateAdded: true,
            dateModified: true,
            id: true,
            itemID: true,
            itemType: true,
            tags: true,
            title: true,
            url: true,
        },
        audioRecording: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            album: jurism,
            archive: true,
            archiveLocation: true,
            attachments: true,
            audioRecordingFormat: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            edition: jurism,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            label: true,
            language: true,
            libraryCatalog: true,
            medium: true,
            multi: true,
            notes: true,
            numberOfVolumes: true,
            opus: jurism,
            originalDate: jurism,
            place: true,
            publicationTitle: jurism,
            publisher: true,
            release: jurism,
            rights: true,
            runningTime: true,
            seeAlso: true,
            seriesTitle: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            volume: true,
        },
        bill: {
            abstractNote: true,
            accessDate: true,
            archiveLocation: jurism,
            assemblyNumber: jurism,
            attachments: true,
            billNumber: true,
            code: true,
            codePages: true,
            codeVolume: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            history: true,
            id: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: true,
            legislativeBody: true,
            multi: true,
            notes: true,
            number: true,
            pages: true,
            publicationTitle: jurism,
            reporter: jurism,
            resolutionLabel: jurism,
            rights: true,
            section: true,
            seeAlso: true,
            seriesNumber: jurism,
            session: true,
            sessionType: jurism,
            shortTitle: true,
            tags: true,
            title: true,
            type: jurism,
            url: true,
            volume: true,
        },
        blogPost: {
            abstractNote: true,
            accessDate: true,
            attachments: true,
            blogTitle: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            multi: true,
            notes: true,
            publicationTitle: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
            websiteType: true,
        },
        book: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            edition: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            medium: jurism,
            multi: true,
            notes: true,
            numPages: true,
            numberOfVolumes: true,
            place: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            series: true,
            seriesNumber: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            volume: true,
            volumeTitle: jurism,
        },
        bookSection: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            bookAbbreviation: jurism,
            bookTitle: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            edition: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            journalAbbreviation: jurism,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            numberOfVolumes: true,
            pages: true,
            place: true,
            publicationTitle: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            series: true,
            seriesNumber: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            volume: true,
            volumeTitle: jurism,
        },
        case: {
            DOI: jurism,
            abstractNote: true,
            accessDate: true,
            adminFlag: jurism,
            archive: jurism,
            archiveLocation: jurism,
            attachments: true,
            callNumber: jurism,
            caseName: true,
            court: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateDecided: true,
            dateModified: true,
            division: jurism,
            docketNumber: true,
            documentName: jurism,
            extra: true,
            filingDate: jurism,
            firstPage: true,
            history: true,
            id: true,
            issue: jurism,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: true,
            multi: true,
            notes: true,
            number: true,
            pages: true,
            place: jurism,
            publicationDate: jurism,
            publicationTitle: jurism,
            publisher: jurism,
            reign: jurism,
            reporter: true,
            reporterVolume: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            supplementName: jurism,
            tags: true,
            title: true,
            url: true,
            volume: true,
            yearAsVolume: jurism,
        },
        classic: {
            abstractNote: jurism,
            accessDate: jurism,
            archive: jurism,
            archiveLocation: jurism,
            attachments: true,
            callNumber: jurism,
            creators: true,
            date: jurism,
            dateAdded: true,
            dateModified: true,
            extra: jurism,
            id: true,
            itemID: true,
            itemType: true,
            language: jurism,
            libraryCatalog: jurism,
            manuscriptType: jurism,
            multi: true,
            notes: true,
            numPages: jurism,
            place: jurism,
            rights: jurism,
            seeAlso: true,
            shortTitle: jurism,
            tags: true,
            title: jurism,
            type: jurism,
            url: jurism,
            volume: jurism,
        },
        computerProgram: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            company: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            place: true,
            programmingLanguage: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            seriesTitle: true,
            shortTitle: true,
            system: true,
            tags: true,
            title: true,
            url: true,
            versionNumber: true,
        },
        conferencePaper: {
            DOI: true,
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            conferenceDate: jurism,
            conferenceName: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            institution: jurism,
            issue: jurism,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            pages: true,
            place: true,
            proceedingsTitle: true,
            publicationTitle: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            series: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            volume: true,
        },
        dictionaryEntry: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            dictionaryTitle: true,
            edition: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            numberOfVolumes: true,
            pages: true,
            place: true,
            publicationTitle: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            series: true,
            seriesNumber: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            volume: true,
        },
        document: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            versionNumber: jurism,
        },
        email: {
            abstractNote: true,
            accessDate: true,
            attachments: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            multi: true,
            notes: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            subject: true,
            tags: true,
            title: true,
            url: true,
        },
        encyclopediaArticle: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            edition: true,
            encyclopediaTitle: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            numberOfVolumes: true,
            pages: true,
            place: true,
            publicationTitle: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            series: true,
            seriesNumber: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            volume: true,
        },
        film: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            distributor: true,
            extra: true,
            genre: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            medium: true,
            multi: true,
            notes: true,
            publisher: true,
            rights: true,
            runningTime: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
            videoRecordingFormat: true,
        },
        forumPost: {
            abstractNote: true,
            accessDate: true,
            attachments: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            forumTitle: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            multi: true,
            notes: true,
            postType: true,
            publicationTitle: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
        },
        gazette: {
            abstractNote: jurism,
            accessDate: jurism,
            attachments: true,
            code: jurism,
            codeNumber: jurism,
            creators: true,
            date: jurism,
            dateAdded: true,
            dateEnacted: jurism,
            dateModified: true,
            extra: jurism,
            history: jurism,
            id: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: jurism,
            multi: true,
            nameOfAct: jurism,
            notes: true,
            number: jurism,
            pages: jurism,
            publicLawNumber: jurism,
            publicationDate: jurism,
            publisher: jurism,
            regnalYear: jurism,
            reign: jurism,
            rights: jurism,
            section: jurism,
            seeAlso: true,
            session: jurism,
            shortTitle: jurism,
            tags: true,
            title: jurism,
            url: jurism,
        },
        hearing: {
            abstractNote: true,
            accessDate: true,
            archiveLocation: jurism,
            assemblyNumber: jurism,
            attachments: true,
            committee: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            documentNumber: true,
            extra: true,
            history: true,
            id: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: true,
            legislativeBody: true,
            meetingName: jurism,
            meetingNumber: jurism,
            multi: true,
            notes: true,
            number: true,
            numberOfVolumes: true,
            pages: true,
            place: true,
            publicationTitle: jurism,
            publisher: true,
            reporter: jurism,
            resolutionLabel: jurism,
            rights: true,
            seeAlso: true,
            seriesNumber: jurism,
            session: true,
            sessionType: jurism,
            shortTitle: true,
            tags: true,
            title: true,
            type: jurism,
            url: true,
            volume: jurism,
        },
        instantMessage: {
            abstractNote: true,
            accessDate: true,
            attachments: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            multi: true,
            notes: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
        },
        interview: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            interviewMedium: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            medium: true,
            multi: true,
            notes: true,
            place: jurism,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
        },
        journalArticle: {
            DOI: true,
            ISSN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            issue: true,
            itemID: true,
            itemType: true,
            journalAbbreviation: true,
            jurisdiction: jurism,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            pages: true,
            place: jurism,
            publicationTitle: true,
            publisher: jurism,
            rights: true,
            seeAlso: true,
            series: true,
            seriesText: true,
            seriesTitle: true,
            shortTitle: true,
            status: jurism,
            tags: true,
            title: true,
            url: true,
            volume: true,
        },
        legalCommentary: {
            ISBN: jurism,
            abstractNote: jurism,
            accessDate: jurism,
            archive: jurism,
            archiveLocation: jurism,
            attachments: true,
            bookAbbreviation: jurism,
            bookTitle: jurism,
            callNumber: jurism,
            creators: true,
            date: jurism,
            dateAdded: true,
            dateModified: true,
            edition: jurism,
            extra: jurism,
            id: true,
            itemID: true,
            itemType: true,
            journalAbbreviation: jurism,
            language: jurism,
            libraryCatalog: jurism,
            multi: true,
            notes: true,
            numberOfVolumes: jurism,
            pages: jurism,
            place: jurism,
            publicationTitle: jurism,
            publisher: jurism,
            rights: jurism,
            seeAlso: true,
            series: jurism,
            seriesNumber: jurism,
            shortTitle: jurism,
            tags: true,
            title: jurism,
            url: jurism,
            versionNumber: jurism,
            volume: jurism,
            volumeTitle: jurism,
        },
        letter: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            letterType: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
        },
        magazineArticle: {
            ISSN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            issue: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            pages: true,
            place: jurism,
            publicationTitle: true,
            publisher: jurism,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            volume: true,
        },
        manuscript: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            manuscriptType: true,
            multi: true,
            notes: true,
            numPages: true,
            place: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
        },
        map: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            edition: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            mapType: true,
            multi: true,
            notes: true,
            place: true,
            publisher: true,
            rights: true,
            scale: true,
            seeAlso: true,
            seriesTitle: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
        },
        newspaperArticle: {
            ISSN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            court: jurism,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            edition: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: true,
            libraryCatalog: true,
            multi: true,
            newsCaseDate: jurism,
            notes: true,
            pages: true,
            place: true,
            publicationTitle: true,
            rights: true,
            section: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
        },
        note: {
            dateAdded: true,
            dateModified: true,
            id: true,
            itemID: true,
            itemType: true,
            note: true,
            tags: true,
        },
        patent: {
            abstractNote: true,
            accessDate: true,
            applicationNumber: true,
            assignee: true,
            attachments: true,
            country: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            filingDate: true,
            genre: jurism,
            id: true,
            issueDate: true,
            issuingAuthority: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: true,
            legalStatus: true,
            multi: true,
            notes: true,
            number: true,
            pages: true,
            patentNumber: true,
            place: true,
            priorityDate: jurism,
            priorityNumbers: true,
            publicationDate: jurism,
            publicationNumber: jurism,
            references: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: jurism,
            url: true,
        },
        podcast: {
            abstractNote: true,
            accessDate: true,
            attachments: true,
            audioFileType: true,
            creators: true,
            date: jurism,
            dateAdded: true,
            dateModified: true,
            episodeNumber: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            medium: true,
            multi: true,
            notes: true,
            number: true,
            publisher: jurism,
            rights: true,
            runningTime: true,
            seeAlso: true,
            seriesTitle: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
        },
        presentation: {
            abstractNote: true,
            accessDate: true,
            archive: jurism,
            archiveCollection: jurism,
            archiveLocation: jurism,
            attachments: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            meetingName: true,
            multi: true,
            notes: true,
            place: true,
            presentationType: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
        },
        radioBroadcast: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            audioRecordingFormat: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            episodeNumber: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            medium: true,
            multi: true,
            network: true,
            notes: true,
            number: true,
            place: true,
            programTitle: true,
            publicationTitle: true,
            publisher: true,
            rights: true,
            runningTime: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
        },
        regulation: {
            abstractNote: jurism,
            accessDate: jurism,
            attachments: true,
            code: jurism,
            codeNumber: jurism,
            creators: true,
            date: jurism,
            dateAdded: true,
            dateEnacted: jurism,
            dateModified: true,
            extra: jurism,
            gazetteFlag: jurism,
            history: jurism,
            id: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: jurism,
            legislativeBody: jurism,
            multi: true,
            nameOfAct: jurism,
            notes: true,
            number: jurism,
            pages: jurism,
            publicLawNumber: jurism,
            publicationDate: jurism,
            publisher: jurism,
            regulationType: jurism,
            regulatoryBody: jurism,
            rights: jurism,
            section: jurism,
            seeAlso: true,
            session: jurism,
            shortTitle: jurism,
            tags: true,
            title: jurism,
            type: jurism,
            url: jurism,
        },
        report: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            assemblyNumber: jurism,
            attachments: true,
            bookTitle: jurism,
            callNumber: true,
            committee: jurism,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            institution: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: true,
            libraryCatalog: true,
            medium: jurism,
            multi: true,
            notes: true,
            number: true,
            pages: true,
            place: true,
            publicationTitle: jurism,
            publisher: true,
            reportNumber: true,
            reportType: true,
            rights: true,
            seeAlso: true,
            seriesNumber: jurism,
            seriesTitle: true,
            shortTitle: true,
            status: jurism,
            tags: true,
            title: true,
            type: true,
            url: true,
        },
        standard: {
            abstractNote: jurism,
            accessDate: jurism,
            archive: jurism,
            archiveLocation: jurism,
            attachments: true,
            callNumber: jurism,
            creators: true,
            date: jurism,
            dateAdded: true,
            dateModified: true,
            extra: jurism,
            id: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: jurism,
            libraryCatalog: jurism,
            multi: true,
            notes: true,
            number: jurism,
            publisher: jurism,
            rights: jurism,
            seeAlso: true,
            shortTitle: jurism,
            tags: true,
            title: jurism,
            url: jurism,
            versionNumber: jurism,
        },
        statute: {
            abstractNote: true,
            accessDate: true,
            attachments: true,
            code: true,
            codeNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateAmended: jurism,
            dateEnacted: true,
            dateModified: true,
            extra: true,
            gazetteFlag: jurism,
            history: true,
            id: true,
            itemID: true,
            itemType: true,
            jurisdiction: jurism,
            language: true,
            multi: true,
            nameOfAct: true,
            notes: true,
            number: true,
            originalDate: jurism,
            pages: true,
            publicLawNumber: true,
            publicationDate: jurism,
            publisher: jurism,
            regnalYear: jurism,
            reign: jurism,
            rights: true,
            section: true,
            seeAlso: true,
            session: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
        },
        thesis: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            multi: true,
            notes: true,
            numPages: true,
            place: true,
            publisher: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            thesisType: true,
            title: true,
            type: true,
            university: true,
            url: true,
        },
        treaty: {
            abstractNote: jurism,
            accessDate: jurism,
            adoptionDate: jurism,
            archive: jurism,
            archiveLocation: jurism,
            attachments: true,
            callNumber: jurism,
            creators: true,
            date: jurism,
            dateAdded: true,
            dateModified: true,
            extra: jurism,
            id: true,
            itemID: true,
            itemType: true,
            language: jurism,
            libraryCatalog: jurism,
            multi: true,
            notes: true,
            number: jurism,
            openingDate: jurism,
            pages: jurism,
            parentTreaty: jurism,
            publicationTitle: jurism,
            publisher: jurism,
            reporter: jurism,
            rights: jurism,
            section: jurism,
            seeAlso: true,
            shortTitle: jurism,
            signingDate: jurism,
            supplementName: jurism,
            tags: true,
            title: jurism,
            treatyNumber: jurism,
            url: jurism,
            versionNumber: jurism,
            volume: jurism,
        },
        tvBroadcast: {
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            episodeNumber: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            medium: true,
            multi: true,
            network: true,
            notes: true,
            number: true,
            place: true,
            programTitle: true,
            publicationTitle: true,
            publisher: true,
            rights: true,
            runningTime: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            url: true,
            videoRecordingFormat: true,
        },
        videoRecording: {
            ISBN: true,
            abstractNote: true,
            accessDate: true,
            archive: true,
            archiveLocation: true,
            attachments: true,
            callNumber: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            libraryCatalog: true,
            medium: true,
            multi: true,
            notes: true,
            numberOfVolumes: true,
            place: true,
            publicationTitle: jurism,
            publisher: true,
            rights: true,
            runningTime: true,
            seeAlso: true,
            seriesTitle: true,
            shortTitle: true,
            studio: true,
            tags: true,
            title: true,
            url: true,
            videoRecordingFormat: true,
            volume: true,
            websiteTitle: jurism,
        },
        webpage: {
            abstractNote: true,
            accessDate: true,
            attachments: true,
            creators: true,
            date: true,
            dateAdded: true,
            dateModified: true,
            extra: true,
            id: true,
            itemID: true,
            itemType: true,
            language: true,
            multi: true,
            notes: true,
            publicationTitle: true,
            rights: true,
            seeAlso: true,
            shortTitle: true,
            tags: true,
            title: true,
            type: true,
            url: true,
            websiteTitle: true,
            websiteType: true,
        },
    },
};
exports.name = {
    type: {
        artwork: 'artwork',
        attachment: 'attachment',
        audiorecording: 'audioRecording',
        bill: 'bill',
        blogpost: 'blogPost',
        book: 'book',
        booksection: 'bookSection',
        case: 'case',
        classic: jurism && 'classic',
        computerprogram: 'computerProgram',
        conferencepaper: 'conferencePaper',
        dictionaryentry: 'dictionaryEntry',
        document: 'document',
        email: 'email',
        encyclopediaarticle: 'encyclopediaArticle',
        film: 'film',
        forumpost: 'forumPost',
        gazette: jurism && 'gazette',
        hearing: 'hearing',
        instantmessage: 'instantMessage',
        interview: 'interview',
        journalarticle: 'journalArticle',
        legalcommentary: jurism && 'legalCommentary',
        letter: 'letter',
        magazinearticle: 'magazineArticle',
        manuscript: 'manuscript',
        map: 'map',
        newspaperarticle: 'newspaperArticle',
        patent: 'patent',
        podcast: 'podcast',
        presentation: 'presentation',
        radiobroadcast: 'radioBroadcast',
        regulation: jurism && 'regulation',
        report: 'report',
        standard: jurism && 'standard',
        statute: 'statute',
        thesis: 'thesis',
        treaty: jurism && 'treaty',
        tvbroadcast: 'tvBroadcast',
        videorecording: 'videoRecording',
        webpage: 'webpage',
    },
    field: {
        abstractnote: 'abstractNote',
        accessdate: 'accessDate',
        adminflag: jurism && 'adminFlag',
        adoptiondate: jurism && 'adoptionDate',
        album: jurism && 'publicationTitle',
        applicationnumber: 'applicationNumber',
        archive: 'archive',
        archivecollection: jurism && 'archiveCollection',
        archivelocation: 'archiveLocation',
        artworkmedium: 'medium',
        artworksize: 'artworkSize',
        assemblynumber: jurism && 'seriesNumber',
        assignee: 'assignee',
        audiofiletype: 'medium',
        audiorecordingformat: 'medium',
        billnumber: 'number',
        blogtitle: 'publicationTitle',
        bookabbreviation: jurism && 'journalAbbreviation',
        booktitle: 'publicationTitle',
        callnumber: 'callNumber',
        casename: 'title',
        code: 'code',
        codenumber: 'codeNumber',
        codepages: 'pages',
        codevolume: 'volume',
        committee: 'committee',
        company: 'publisher',
        conferencedate: jurism && 'conferenceDate',
        conferencename: 'conferenceName',
        country: 'country',
        court: 'court',
        date: 'date',
        dateadded: 'dateAdded',
        dateamended: jurism && 'dateAmended',
        datedecided: 'date',
        dateenacted: 'date',
        datemodified: 'dateModified',
        dictionarytitle: 'publicationTitle',
        distributor: 'publisher',
        division: jurism && 'division',
        docketnumber: 'number',
        documentname: jurism && 'documentName',
        documentnumber: 'number',
        doi: 'DOI',
        edition: 'edition',
        encyclopediatitle: 'publicationTitle',
        episodenumber: 'number',
        extra: 'extra',
        filingdate: 'filingDate',
        firstpage: 'pages',
        forumtitle: 'publicationTitle',
        gazetteflag: jurism && 'gazetteFlag',
        genre: 'type',
        history: 'history',
        institution: zotero ? 'publisher' : 'institution',
        interviewmedium: 'medium',
        isbn: 'ISBN',
        issn: 'ISSN',
        issue: 'issue',
        issuedate: 'date',
        issuingauthority: 'issuingAuthority',
        journalabbreviation: 'journalAbbreviation',
        jurisdiction: jurism && 'jurisdiction',
        label: 'publisher',
        language: 'language',
        legalstatus: 'legalStatus',
        legislativebody: 'legislativeBody',
        lettertype: 'type',
        librarycatalog: 'libraryCatalog',
        manuscripttype: 'type',
        maptype: 'type',
        medium: 'medium',
        meetingname: 'meetingName',
        meetingnumber: jurism && 'meetingNumber',
        nameofact: 'title',
        network: 'publisher',
        newscasedate: jurism && 'newsCaseDate',
        number: 'number',
        numberofvolumes: 'numberOfVolumes',
        numpages: 'numPages',
        openingdate: jurism && 'openingDate',
        opus: jurism && 'opus',
        originaldate: jurism && 'originalDate',
        pages: 'pages',
        parenttreaty: jurism && 'parentTreaty',
        patentnumber: 'number',
        place: 'place',
        posttype: 'type',
        presentationtype: 'type',
        prioritydate: jurism && 'priorityDate',
        prioritynumbers: 'priorityNumbers',
        proceedingstitle: 'publicationTitle',
        programminglanguage: 'programmingLanguage',
        programtitle: 'publicationTitle',
        publicationdate: jurism && 'publicationDate',
        publicationnumber: jurism && 'publicationNumber',
        publicationtitle: 'publicationTitle',
        publiclawnumber: 'number',
        publisher: 'publisher',
        references: 'references',
        regnalyear: jurism && 'regnalYear',
        regulationtype: jurism && 'type',
        regulatorybody: jurism && 'legislativeBody',
        reign: jurism && 'reign',
        release: jurism && 'edition',
        reporter: zotero ? 'reporter' : 'publicationTitle',
        reportervolume: 'volume',
        reportnumber: 'number',
        reporttype: 'type',
        resolutionlabel: jurism && 'resolutionLabel',
        rights: 'rights',
        runningtime: 'runningTime',
        scale: 'scale',
        section: 'section',
        series: 'series',
        seriesnumber: 'seriesNumber',
        seriestext: 'seriesText',
        seriestitle: 'seriesTitle',
        session: 'session',
        sessiontype: jurism && 'type',
        shorttitle: 'shortTitle',
        signingdate: jurism && 'signingDate',
        status: jurism && 'status',
        studio: 'publisher',
        subject: 'title',
        supplementname: jurism && 'supplementName',
        system: 'system',
        thesistype: 'type',
        title: 'title',
        treatynumber: jurism && 'number',
        type: 'type',
        university: 'publisher',
        url: 'url',
        versionnumber: 'versionNumber',
        videorecordingformat: 'medium',
        volume: 'volume',
        volumetitle: jurism && 'volumeTitle',
        websitetitle: 'publicationTitle',
        websitetype: 'type',
        yearasvolume: jurism && 'yearAsVolume',
    },
};
// maps variable to its extra-field label
exports.label = {
    abstractnote: 'Abstract note',
    accessdate: 'Access date',
    adminflag: jurism && 'Admin flag',
    adoptiondate: jurism && 'Adoption date',
    album: jurism && 'Publication title',
    applicationnumber: 'Application number',
    archive: 'Archive',
    archivecollection: jurism && 'Archive collection',
    archivelocation: 'Archive location',
    artwork: 'Artwork',
    artworkmedium: 'Medium',
    artworksize: 'Artwork size',
    assemblynumber: jurism && 'Series number',
    assignee: 'Assignee',
    attachment: 'Attachment',
    audiofiletype: 'Medium',
    audiorecording: 'Audio recording',
    audiorecordingformat: 'Medium',
    bill: 'Bill',
    billnumber: 'Number',
    blogpost: 'Blog post',
    blogtitle: 'Publication title',
    book: 'Book',
    bookabbreviation: jurism && 'Journal abbreviation',
    booksection: 'Book section',
    booktitle: 'Publication title',
    callnumber: 'Call number',
    case: 'Case',
    casename: 'Title',
    classic: jurism && 'Classic',
    code: 'Code',
    codenumber: 'Code number',
    codepages: 'Pages',
    codevolume: 'Volume',
    committee: 'Committee',
    company: 'Publisher',
    computerprogram: 'Computer program',
    conferencedate: jurism && 'Conference date',
    conferencename: 'Conference name',
    conferencepaper: 'Conference paper',
    country: 'Country',
    court: 'Court',
    date: 'Date',
    dateamended: jurism && 'Date amended',
    datedecided: 'Date',
    dateenacted: 'Date',
    dictionaryentry: 'Dictionary entry',
    dictionarytitle: 'Publication title',
    distributor: 'Publisher',
    division: jurism && 'Division',
    docketnumber: 'Number',
    document: 'Document',
    documentname: jurism && 'Document name',
    documentnumber: 'Number',
    doi: 'DOI',
    edition: 'Edition',
    email: 'Email',
    encyclopediaarticle: 'Encyclopedia article',
    encyclopediatitle: 'Publication title',
    episodenumber: 'Number',
    extra: 'Extra',
    filingdate: 'Filing date',
    film: 'Film',
    firstpage: 'Pages',
    forumpost: 'Forum post',
    forumtitle: 'Publication title',
    gazette: jurism && 'Gazette',
    gazetteflag: jurism && 'Gazette flag',
    genre: 'Type',
    hearing: 'Hearing',
    history: 'History',
    instantmessage: 'Instant message',
    institution: zotero ? 'Publisher' : 'Institution',
    interview: 'Interview',
    interviewmedium: 'Medium',
    isbn: 'ISBN',
    issn: 'ISSN',
    issue: 'Issue',
    issuedate: 'Date',
    issuingauthority: 'Issuing authority',
    journalabbreviation: 'Journal abbreviation',
    journalarticle: 'Journal article',
    jurisdiction: jurism && 'Jurisdiction',
    label: 'Publisher',
    language: 'Language',
    legalcommentary: jurism && 'Legal commentary',
    legalstatus: 'Legal status',
    legislativebody: 'Legislative body',
    letter: 'Letter',
    lettertype: 'Type',
    librarycatalog: 'Library catalog',
    magazinearticle: 'Magazine article',
    manuscript: 'Manuscript',
    manuscripttype: 'Type',
    map: 'Map',
    maptype: 'Type',
    medium: 'Medium',
    meetingname: 'Meeting name',
    meetingnumber: jurism && 'Meeting number',
    nameofact: 'Title',
    network: 'Publisher',
    newscasedate: jurism && 'News case date',
    newspaperarticle: 'Newspaper article',
    number: 'Number',
    numberofvolumes: 'Number of volumes',
    numpages: 'Number of pages',
    openingdate: jurism && 'Opening date',
    opus: jurism && 'Opus',
    originaldate: jurism && 'Original date',
    pages: 'Pages',
    parenttreaty: jurism && 'Parent treaty',
    patent: 'Patent',
    patentnumber: 'Number',
    place: 'Place',
    podcast: 'Podcast',
    posttype: 'Type',
    presentation: 'Presentation',
    presentationtype: 'Type',
    prioritydate: jurism && 'Priority date',
    prioritynumbers: 'Priority numbers',
    proceedingstitle: 'Publication title',
    programminglanguage: 'Programming language',
    programtitle: 'Publication title',
    publicationdate: jurism && 'Publication date',
    publicationnumber: jurism && 'Publication number',
    publicationtitle: 'Publication title',
    publiclawnumber: 'Number',
    publisher: 'Publisher',
    radiobroadcast: 'Radio broadcast',
    references: 'References',
    regnalyear: jurism && 'Regnal year',
    regulation: jurism && 'Regulation',
    regulationtype: jurism && 'Type',
    regulatorybody: jurism && 'Legislative body',
    reign: jurism && 'Reign',
    release: jurism && 'Edition',
    report: 'Report',
    reporter: zotero ? 'Reporter' : 'Publication title',
    reportervolume: 'Volume',
    reportnumber: 'Number',
    reporttype: 'Type',
    resolutionlabel: jurism && 'Resolution label',
    rights: 'Rights',
    runningtime: 'Running time',
    scale: 'Scale',
    section: 'Section',
    series: 'Series',
    seriesnumber: 'Series number',
    seriestext: 'Series text',
    seriestitle: 'Series title',
    session: 'Session',
    sessiontype: jurism && 'Type',
    shorttitle: 'Short title',
    signingdate: jurism && 'Signing date',
    standard: jurism && 'Standard',
    status: jurism && 'Status',
    statute: 'Statute',
    studio: 'Publisher',
    subject: 'Title',
    supplementname: jurism && 'Supplement name',
    system: 'System',
    thesis: 'Thesis',
    thesistype: 'Type',
    title: 'Title',
    treaty: jurism && 'Treaty',
    treatynumber: jurism && 'Number',
    tvbroadcast: 'Tv broadcast',
    type: 'Type',
    university: 'Publisher',
    url: 'Url',
    versionnumber: 'Version number',
    videorecording: 'Video recording',
    videorecordingformat: 'Medium',
    volume: 'Volume',
    volumetitle: jurism && 'Volume title',
    webpage: 'Webpage',
    websitetitle: 'Publication title',
    websitetype: 'Type',
    yearasvolume: jurism && 'Year as volume',
};
function unalias(item) {
    delete item.inPublications;
    let v;
    if (v = (item.artworkMedium || item.audioRecordingFormat || item.videoRecordingFormat || item.interviewMedium || item.audioFileType))
        item.medium = v;
    delete item.artworkMedium;
    delete item.audioRecordingFormat;
    delete item.videoRecordingFormat;
    delete item.interviewMedium;
    delete item.audioFileType;
    if (v = (item.label || item.company || item.distributor || item.network || item.university || item.studio))
        item.publisher = v;
    delete item.label;
    delete item.company;
    delete item.distributor;
    delete item.network;
    delete item.university;
    delete item.studio;
    if (v = (item.billNumber || item.docketNumber || item.documentNumber || item.patentNumber || item.episodeNumber || item.reportNumber || item.publicLawNumber))
        item.number = v;
    delete item.billNumber;
    delete item.docketNumber;
    delete item.documentNumber;
    delete item.patentNumber;
    delete item.episodeNumber;
    delete item.reportNumber;
    delete item.publicLawNumber;
    if (v = (item.codeVolume || item.reporterVolume))
        item.volume = v;
    delete item.codeVolume;
    delete item.reporterVolume;
    if (v = (item.codePages || item.firstPage))
        item.pages = v;
    delete item.codePages;
    delete item.firstPage;
    if (v = (item.blogTitle || item.bookTitle || item.proceedingsTitle || item.dictionaryTitle || item.encyclopediaTitle || item.forumTitle || item.programTitle || item.websiteTitle))
        item.publicationTitle = v;
    delete item.blogTitle;
    delete item.bookTitle;
    delete item.proceedingsTitle;
    delete item.dictionaryTitle;
    delete item.encyclopediaTitle;
    delete item.forumTitle;
    delete item.programTitle;
    delete item.websiteTitle;
    if (v = (item.websiteType || item.genre || item.postType || item.letterType || item.manuscriptType || item.mapType || item.presentationType || item.reportType || item.thesisType))
        item.type = v;
    delete item.websiteType;
    delete item.genre;
    delete item.postType;
    delete item.letterType;
    delete item.manuscriptType;
    delete item.mapType;
    delete item.presentationType;
    delete item.reportType;
    delete item.thesisType;
    if (v = (item.caseName || item.subject || item.nameOfAct))
        item.title = v;
    delete item.caseName;
    delete item.subject;
    delete item.nameOfAct;
    if (v = (item.dateDecided || item.issueDate || item.dateEnacted))
        item.date = v;
    delete item.dateDecided;
    delete item.issueDate;
    delete item.dateEnacted;
    if (zotero) {
        if (item.institution)
            item.publisher = item.institution;
        delete item.institution;
    }
    if (jurism) {
        if (v = (item.album || item.reporter))
            item.publicationTitle = v;
        delete item.album;
        delete item.reporter;
        if (item.release)
            item.edition = item.release;
        delete item.release;
        if (item.assemblyNumber)
            item.seriesNumber = item.assemblyNumber;
        delete item.assemblyNumber;
        if (v = (item.sessionType || item.regulationType))
            item.type = v;
        delete item.sessionType;
        delete item.regulationType;
        if (item.bookAbbreviation)
            item.journalAbbreviation = item.bookAbbreviation;
        delete item.bookAbbreviation;
        if (item.regulatoryBody)
            item.legislativeBody = item.regulatoryBody;
        delete item.regulatoryBody;
        if (item.treatyNumber)
            item.number = item.treatyNumber;
        delete item.treatyNumber;
    }
}
// import & export translators expect different creator formats... nice
function simplifyForExport(item, dropAttachments = false) {
    unalias(item);
    if (item.filingDate)
        item.filingDate = item.filingDate.replace(/^0000-00-00 /, '');
    if (item.creators) {
        for (const creator of item.creators) {
            if (creator.fieldMode) {
                creator.name = creator.name || creator.lastName;
                delete creator.lastName;
                delete creator.firstName;
                delete creator.fieldMode;
            }
        }
    }
    if (item.itemType === 'attachment' || item.itemType === 'note') {
        delete item.attachments;
        delete item.notes;
    }
    else {
        item.attachments = (!dropAttachments && item.attachments) || [];
        item.notes = item.notes ? item.notes.map(note => note.note || note) : [];
    }
    return item;
}
exports.simplifyForExport = simplifyForExport;
function simplifyForImport(item) {
    unalias(item);
    if (item.creators) {
        for (const creator of item.creators) {
            if (creator.name) {
                creator.lastName = creator.lastName || creator.name;
                creator.fieldMode = 1;
                delete creator.firstName;
                delete creator.name;
            }
            if (!jurism)
                delete creator.multi;
        }
    }
    if (!jurism)
        delete item.multi;
    return item;
}
exports.simplifyForImport = simplifyForImport;


/***/ }),

/***/ "./BetterBibTeX JSON.ts":
/*!******************************!*\
  !*** ./BetterBibTeX JSON.ts ***!
  \******************************/
/*! flagged exports */
/*! export Translator [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export detectImport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export doExport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export doImport [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.doExport = exports.doImport = exports.detectImport = exports.Translator = void 0;
const translator_1 = __webpack_require__(/*! ./lib/translator */ "./lib/translator.ts");
Object.defineProperty(exports, "Translator", ({ enumerable: true, get: function () { return translator_1.Translator; } }));
const itemfields = __webpack_require__(/*! ../gen/items/items */ "../gen/items/items.ts");
const normalize_1 = __webpack_require__(/*! ./lib/normalize */ "./lib/normalize.ts");
const version = __webpack_require__(/*! ../gen/version.js */ "../gen/version.js");
const stringify_1 = __webpack_require__(/*! ../content/stringify */ "../content/stringify.ts");
const logger_1 = __webpack_require__(/*! ../content/logger */ "../content/logger.ts");
const chunkSize = 0x100000;
function detectImport() {
    let str;
    let json = '';
    while ((str = Zotero.read(chunkSize)) !== false) {
        json += str;
        if (json[0] !== '{')
            return false;
    }
    let data;
    try {
        data = JSON.parse(json);
    }
    catch (err) {
        return false;
    }
    if (!data.config || (data.config.id !== translator_1.Translator.header.translatorID))
        return false;
    return true;
}
exports.detectImport = detectImport;
async function doImport() {
    translator_1.Translator.init('import');
    let str;
    let json = '';
    while ((str = Zotero.read(chunkSize)) !== false) {
        json += str;
    }
    const data = JSON.parse(json);
    if (!data.items || !data.items.length)
        return;
    const items = new Set;
    for (const source of data.items) {
        itemfields.simplifyForImport(source);
        // I do export these but the cannot be imported back
        delete source.relations;
        delete source.citekey;
        delete source.citationKey;
        delete source.uri;
        delete source.key;
        delete source.version;
        delete source.libraryID;
        delete source.collections;
        delete source.autoJournalAbbreviation;
        if (source.creators) {
            for (const creator of source.creators) {
                // if .name is not set, *both* first and last must be set, even if empty
                if (!creator.name) {
                    creator.lastName = creator.lastName || '';
                    creator.firstName = creator.firstName || '';
                }
            }
        }
        if (!itemfields.valid.type[source.itemType])
            throw new Error(`unexpected item type '${source.itemType}'`);
        const validFields = itemfields.valid.field[source.itemType];
        for (const field of Object.keys(source)) {
            const valid = validFields[field];
            if (valid)
                continue;
            const msg = `${valid}: unexpected ${source.itemType}.${field} for ${translator_1.Translator.isZotero ? 'zotero' : 'juris-m'} in ${JSON.stringify(source)} / ${JSON.stringify(validFields)}`;
            if (valid === false) {
                logger_1.log.error(msg);
            }
            else {
                throw new Error(msg);
            }
        }
        if (Array.isArray(source.extra))
            source.extra = source.extra.join('\n');
        const item = new Zotero.Item();
        Object.assign(item, source);
        // marker so BBT-JSON can be imported without extra-field meddling
        item.extra = '\x1BBBT\x1B' + (item.extra || '');
        for (const att of item.attachments || []) {
            if (att.url)
                delete att.path;
            delete att.relations;
            delete att.uri;
        }
        await item.complete();
        items.add(source.itemID);
        Zotero.setProgress(items.size / data.items.length * 100); // tslint:disable-line:no-magic-numbers
    }
    Zotero.setProgress(100); // tslint:disable-line:no-magic-numbers
    const collections = Object.values(data.collections || {});
    for (const collection of collections) {
        collection.zoteroCollection = (new Zotero.Collection());
        collection.zoteroCollection.type = 'collection';
        collection.zoteroCollection.name = collection.name;
        collection.zoteroCollection.children = collection.items.filter(id => {
            if (items.has(id))
                return true;
            logger_1.log.error(`Collection ${collection.key} has non-existent item ${id}`);
            return false;
        }).map(id => ({ type: 'item', id }));
    }
    for (const collection of collections) {
        if (collection.parent && data.collections[collection.parent]) {
            data.collections[collection.parent].zoteroCollection.children.push(collection.zoteroCollection);
        }
        else {
            if (collection.parent)
                logger_1.log.debug(`Collection ${collection.key} has non-existent parent ${collection.parent}`);
            collection.parent = false;
        }
    }
    for (const collection of collections) {
        if (collection.parent)
            continue;
        collection.zoteroCollection.complete();
    }
}
exports.doImport = doImport;
function doExport() {
    translator_1.Translator.init('export');
    let item;
    const data = {
        config: {
            id: translator_1.Translator.header.translatorID,
            label: translator_1.Translator.header.label,
            preferences: translator_1.Translator.preferences,
            options: translator_1.Translator.options,
            localeDateOrder: Zotero.BetterBibTeX.getLocaleDateOrder(),
        },
        version: {
            zotero: Zotero.Utilities.getVersion(),
            bbt: version,
        },
        collections: translator_1.Translator.collections,
        items: [],
    };
    const validAttachmentFields = new Set(['relations', 'uri', 'itemType', 'title', 'path', 'tags', 'dateAdded', 'dateModified', 'seeAlso', 'mimeType']);
    while ((item = Zotero.nextItem())) {
        if (translator_1.Translator.options.dropAttachments && item.itemType === 'attachment')
            continue;
        if (!translator_1.Translator.options.Normalize) {
            const [, kind, lib, key] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/);
            item.select = (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`;
        }
        delete item.collections;
        itemfields.simplifyForExport(item, translator_1.Translator.options.dropAttachments);
        item.relations = item.relations ? (item.relations['dc:relation'] || []) : [];
        for (const att of item.attachments || []) {
            if (translator_1.Translator.options.exportFileData && att.saveFile && att.defaultPath) {
                att.saveFile(att.defaultPath, true);
                att.path = att.defaultPath;
            }
            else if (att.localPath) {
                att.path = att.localPath;
            }
            if (!translator_1.Translator.options.Normalize) {
                const [, kind, lib, key] = att.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/);
                att.select = (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`;
            }
            if (!att.path)
                continue; // amazon/googlebooks etc links show up as atachments without a path
            att.relations = att.relations ? (att.relations['dc:relation'] || []) : [];
            for (const field of Object.keys(att)) {
                if (!validAttachmentFields.has(field)) {
                    delete att[field];
                }
            }
        }
        data.items.push(item);
    }
    if (translator_1.Translator.options.Normalize)
        normalize_1.normalize(data);
    Zotero.write(stringify_1.stringify(data, null, '  '));
}
exports.doExport = doExport;


/***/ }),

/***/ "./lib/normalize.ts":
/*!**************************!*\
  !*** ./lib/normalize.ts ***!
  \**************************/
/*! flagged exports */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! export normalize [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalize = void 0;
const stringify_1 = __webpack_require__(/*! ../../content/stringify */ "../content/stringify.ts");
function rjust(str, width, padding) {
    if (typeof str === 'number')
        str = '' + str;
    padding = (padding || ' ')[0];
    return str.length < width ? padding.repeat(width - str.length) + str : str;
}
function key(item) {
    var _a, _b, _c, _d;
    return [item.itemType, item.citationKey || '', item.title || '', ((_b = (_a = item.creators) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.lastName) || ((_d = (_c = item.creators) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.name) || ''].join('\t').toLowerCase();
}
function strip(obj) {
    if (Array.isArray(obj)) {
        obj = obj.map(strip).filter(e => e);
        return obj.length ? obj : undefined;
    }
    if (typeof obj === 'object') {
        let keep = false;
        for (let [k, v] of Object.entries(obj)) {
            v = strip(v);
            if (typeof v === 'undefined') {
                delete obj[k];
            }
            else {
                obj[k] = v;
                keep = true;
            }
        }
        return keep ? obj : undefined;
    }
    if (typeof obj === 'string' && !obj)
        return undefined;
    if (obj === null)
        return undefined;
    return obj;
}
function normalize(library) {
    var _a, _b, _c, _d, _e;
    library.items.sort((a, b) => key(a).localeCompare(key(b)));
    for (const item of library.items) {
        delete item.citekey;
        delete item.autoJournalAbbreviation;
        delete item.libraryID;
        delete item.key;
        delete item.version;
        delete item.uniqueFields;
        delete item.collections;
        if ((_a = item.notes) === null || _a === void 0 ? void 0 : _a.length) {
            item.notes = item.notes.map(note => typeof note === 'string' ? note : note.note).sort();
        }
        else {
            delete item.notes;
        }
        if ((_b = item.tags) === null || _b === void 0 ? void 0 : _b.length) {
            item.tags = item.tags.map(tag => typeof tag === 'string' ? { tag } : tag).sort((a, b) => a.tag.localeCompare(b.tag));
        }
        else {
            delete item.tags;
        }
        if ((_c = item.attachments) === null || _c === void 0 ? void 0 : _c.length) {
            for (const att of item.attachments) {
                att.contentType = att.contentType || att.mimeType;
                delete att.mimeType;
                for (const prop of ['localPath', 'itemID', 'charset', 'dateAdded', 'parentItem', 'dateModified', 'version', 'relations', 'id']) {
                    delete att[prop];
                }
            }
        }
        else {
            delete item.attachments;
        }
        if ((_d = item.creators) === null || _d === void 0 ? void 0 : _d.length) {
            for (const creator of item.creators) {
                if (!creator.fieldMode)
                    delete creator.fieldMode;
            }
        }
        else {
            delete item.creators;
        }
        // I want to keep empty lines in extra
        if (item.extra && typeof item.extra !== 'string')
            item.extra = item.extra.join('\n');
        strip(item);
        if ((_e = item.extra) === null || _e === void 0 ? void 0 : _e.length) {
            item.extra = item.extra.split('\n');
        }
        else {
            delete item.extra;
        }
    }
    if (library.preferences) {
        delete library.preferences.client;
        delete library.preferences.platform;
        delete library.preferences.newTranslatorsAskRestart;
        delete library.preferences.testing;
    }
    // sort items and normalize their IDs
    library.items.sort((a, b) => stringify_1.stringify(Object.assign(Object.assign({}, a), { itemID: 0 })).localeCompare(stringify_1.stringify(Object.assign(Object.assign({}, b), { itemID: 0 }))));
    const itemIDs = library.items.reduce((acc, item, i) => {
        item.itemID = acc[item.itemID] = i + 1; // Zotero does not recognize items with itemID 0 in collections...
        return acc;
    }, {});
    if (library.collections && Object.keys(library.collections).length) {
        const collectionOrder = Object.values(library.collections).sort((a, b) => stringify_1.stringify(Object.assign(Object.assign({}, a), { key: '', parent: '' })).localeCompare(stringify_1.stringify(Object.assign(Object.assign({}, b), { key: '', parent: '' }))));
        const collectionKeys = collectionOrder.reduce((acc, coll, i) => {
            coll.key = acc[coll.key] = `coll:${rjust(i, 5, '0')}`; // tslint:disable-line:no-magic-numbers
            return acc;
        }, {});
        library.collections = collectionOrder.reduce((acc, coll) => {
            if (!(coll.parent = collectionKeys[coll.parent]))
                delete coll.parent;
            coll.items = coll.items.map(itemID => itemIDs[itemID]).filter(itemID => typeof itemID === 'number').sort();
            coll.collections = coll.collections.map(collectionKey => collectionKeys[collectionKey]).filter(collectionKey => collectionKey).sort();
            acc[coll.key] = coll;
            return acc;
        }, {});
    }
    else {
        delete library.collections;
    }
}
exports.normalize = normalize;


/***/ }),

/***/ "./lib/translator.ts":
/*!***************************!*\
  !*** ./lib/translator.ts ***!
  \***************************/
/*! flagged exports */
/*! export Translator [provided] [used in BetterBibTeX JSON] [usage prevents renaming] */
/*! export __esModule [provided] [maybe used in BetterBibTeX JSON (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in BetterBibTeX JSON (runtime-defined)] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Translator = void 0;
const preferences = __webpack_require__(/*! ../../gen/preferences/defaults.json */ "../gen/preferences/defaults.json");
const client_1 = __webpack_require__(/*! ../../content/client */ "../content/client.ts");
const cacheDisabler = new class {
    get(target, property) {
        // collections: jabref 4 stores collection info inside the reference, and collection info depends on which part of your library you're exporting
        if (['collections'].includes(property))
            target.cachable = false;
        return target[property];
    }
};
exports.Translator = new class {
    constructor() {
        this.export = { dir: undefined, path: undefined };
        this.initialized = false;
        this.header = {"browserSupport":"gcsv","configOptions":{"async":true,"getCollections":true},"creator":"Emiliano Heyns","description":"exports and imports references in BetterBibTeX debug format. Mostly for BBT-internal use","displayOptions":{"Normalize":false,"exportFileData":false,"exportNotes":true,"keepUpdated":false},"inRepository":false,"label":"BetterBibTeX JSON","maxVersion":"","minVersion":"4.0.27","priority":49,"target":"json","translatorID":"36a3b0b5-bad0-4a04-b79b-441c7cef77db","translatorType":3};
        this[this.header.label.replace(/[^a-z]/ig, '')] = true;
        this.BetterTeX = this.BetterBibTeX || this.BetterBibLaTeX;
        this.BetterCSL = this.BetterCSLJSON || this.BetterCSLYAML;
        this.preferences = preferences;
        this.options = this.header.displayOptions || {};
        this.stringCompare = (new Intl.Collator('en')).compare;
    }
    get exportDir() {
        this.currentItem.cachable = false;
        return this.export.dir;
    }
    get exportPath() {
        this.currentItem.cachable = false;
        return this.export.path;
    }
    typefield(field) {
        field = field.trim();
        if (field.startsWith('bibtex.'))
            return this.BetterBibTeX ? field.replace(/^bibtex\./, '') : '';
        if (field.startsWith('biblatex.'))
            return this.BetterBibLaTeX ? field.replace(/^biblatex\./, '') : '';
        return field;
    }
    init(mode) {
        var _a;
        this.platform = Zotero.getHiddenPref('better-bibtex.platform');
        this.isJurisM = client_1.client === 'jurism';
        this.isZotero = !this.isJurisM;
        this.paths = {
            caseSensitive: this.platform !== 'mac' && this.platform !== 'win',
            sep: this.platform === 'win' ? '\\' : '/',
        };
        for (const key in this.options) {
            if (typeof this.options[key] === 'boolean') {
                this.options[key] = !!Zotero.getOption(key);
            }
            else {
                this.options[key] = Zotero.getOption(key);
            }
        }
        // special handling
        if (mode === 'export') {
            this.cache = {
                hits: 0,
                misses: 0,
            };
            this.export = {
                dir: Zotero.getOption('exportDir'),
                path: Zotero.getOption('exportPath'),
            };
            if (this.export.dir && this.export.dir.endsWith(this.paths.sep))
                this.export.dir = this.export.dir.slice(0, -1);
        }
        for (const pref of Object.keys(this.preferences)) {
            let value;
            try {
                value = Zotero.getOption(`preference_${pref}`);
            }
            catch (err) {
                value = undefined;
            }
            if (typeof value === 'undefined')
                value = Zotero.getHiddenPref(`better-bibtex.${pref}`);
            this.preferences[pref] = value;
        }
        // special handling
        this.skipFields = this.preferences.skipFields.toLowerCase().split(',').map(field => this.typefield(field)).filter(s => s);
        this.skipField = this.skipFields.reduce((acc, field) => { acc[field] = true; return acc; }, {});
        this.verbatimFields = this.preferences.verbatimFields.toLowerCase().split(',').map(field => this.typefield(field)).filter(s => s);
        if (!this.verbatimFields.length)
            this.verbatimFields = null;
        this.csquotes = this.preferences.csquotes ? { open: this.preferences.csquotes[0], close: this.preferences.csquotes[1] } : null;
        this.preferences.testing = Zotero.getHiddenPref('better-bibtex.testing');
        if (mode === 'export') {
            this.unicode = (this.BetterBibTeX && !exports.Translator.preferences.asciiBibTeX) || (this.BetterBibLaTeX && !exports.Translator.preferences.asciiBibLaTeX);
            // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
            // relative file paths are going to be different based on the file being exported to
            this.cachable = !(this.options.exportFileData || this.preferences.relativeFilePaths);
        }
        this.collections = {};
        if (mode === 'export' && ((_a = this.header.configOptions) === null || _a === void 0 ? void 0 : _a.getCollections) && Zotero.nextCollection) {
            let collection;
            while (collection = Zotero.nextCollection()) {
                const children = collection.children || collection.descendents || [];
                const key = (collection.primary ? collection.primary : collection).key;
                this.collections[key] = {
                    // id: collection.id,
                    key,
                    parent: collection.fields.parentKey,
                    name: collection.name,
                    items: collection.childItems,
                    collections: children.filter(coll => coll.type === 'collection').map(coll => coll.key),
                };
            }
            for (collection of Object.values(this.collections)) {
                if (collection.parent && !this.collections[collection.parent]) {
                    collection.parent = false;
                    Zotero.debug(`BBT translator: collection with key ${collection.key} has non-existent parent ${collection.parent}, assuming root collection`);
                }
            }
        }
        this.initialized = true;
    }
    items() {
        if (!this.sortedItems) {
            this.sortedItems = [];
            let item;
            while (item = Zotero.nextItem()) {
                item.cachable = this.cachable;
                item.journalAbbreviation = item.journalAbbreviation || item.autoJournalAbbreviation;
                this.sortedItems.push(new Proxy(item, cacheDisabler));
            }
            // fallback to itemType.itemID for notes and attachments. And some items may have duplicate keys
            this.sortedItems.sort((a, b) => {
                const ka = [a.citationKey || a.itemType, a.dateModified || a.dateAdded, a.itemID].join('\t');
                const kb = [b.citationKey || b.itemType, b.dateModified || b.dateAdded, b.itemID].join('\t');
                return ka.localeCompare(kb, undefined, { sensitivity: 'base' });
            });
        }
        return this.sortedItems;
    }
    nextItem() {
        return (this.currentItem = this.items().shift());
    }
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./BetterBibTeX JSON.ts");
/******/ })()
;
