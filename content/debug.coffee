stringify = require('json-stringify-safe')
format = require('./debug-formatter.ts')

module.exports = (msg...) ->
  return unless Zotero.Debug.enabled
  Zotero.debug(format('better-bibtex', msg))
  return
