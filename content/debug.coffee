stringify = require('json-stringify-safe')
format = require('./debug-formatter.coffee')

module.exports = (msg...) ->
  return unless Zotero.Debug.enabled
  Zotero.debug(format('better-bibtex', msg))
  return
