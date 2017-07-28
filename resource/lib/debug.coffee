stringify = require('json-stringify-safe')
format = require('../../content/debug-formatter.coffee')

module.exports = (msg...) ->
  return unless BetterBibTeX.debugEnabled || BetterBibTeX.preferences.testing
  Zotero.debug(format("better-bibtex:#{BetterBibTeX.header.label}", msg))
  return
