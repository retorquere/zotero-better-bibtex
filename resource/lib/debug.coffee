stringify = require('json-stringify-safe')
format = require('../../content/debug-formatter.coffee')

module.exports = (msg...) ->
  return unless BetterBibTeX.preferences.debug || BetterBibTeX.preferences.testing
  Zotero.debug("{better-bibtex:#{BetterBibTeX.header.label}}: #{format(msg)}")
  return
