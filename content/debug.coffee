stringify = require('json-stringify-safe')
format = require('./debug-formatter.coffee')

module.exports = (msg...) ->
  return unless Zotero.Debug.enabled
  Zotero.debug("{better-bibtex}: #{format(msg)}")
  return
