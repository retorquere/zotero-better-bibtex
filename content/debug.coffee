stringify = require('json-stringify-safe')
format = require('./debug-formatter.coffee')

module.exports = (msg...) ->
  for m in msg
    Zotero.logError(m) if m instanceof Error

  return unless Zotero.Debug.enabled
  Zotero.debug(format('better-bibtex', msg))
  return
