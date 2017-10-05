citeproc = require('../citeproc-js/citeproc').CSL
citeproc.debug = require('./debug.ts')

#locales = require('../gen/csl-locales.json')
#for _, months of locales.months
#  citeproc.DateParser.addDateParserMonths(months)

module.exports = citeproc
