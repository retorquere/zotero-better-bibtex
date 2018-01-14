// import citeproc = require('citeproc')

/* this is only relevent when we use the citeproc dateparser -- we currently don't, as edtfy does a great job
locales = require('../gen/csl-locales.json')
for _, months of locales.months
  citeproc.DateParser.addDateParserMonths(months)
*/

// citeproc.debug = require('./debug.ts')

declare const Zotero: any
const citeproc = Zotero.CiteProc.CSL

export = citeproc
