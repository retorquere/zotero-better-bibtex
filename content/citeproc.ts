const citeproc = require('../citeproc-js/citeproc').CSL
citeproc.debug = require('./debug.ts')

/* this is only relevent when we use the citeproc dateparser -- we currently don't, as edtfy does a great job
locales = require('../gen/csl-locales.json')
for _, months of locales.months
  citeproc.DateParser.addDateParserMonths(months)
*/

export = citeproc
