stringify = require('json-stringify-safe')
format = require('../../content/debug-formatter.ts')

module.exports = (msg...) ->
  return unless Translator.debugEnabled || Translator.preferences.testing
  Zotero.debug(format("better-bibtex:#{Translator.header.label}", msg))
  return
