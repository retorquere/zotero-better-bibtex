stringify = require('json-stringify-safe')

module.exports = (msg...) ->
  if typeof Translator == 'undefined'
    return unless Zotero.Debug.enabled
  else
    return unless Translator.preferences.debug

  str = []
  for m in msg
    switch
      when m instanceof Error
        m = "<Exception: #{m.message || m.name}#{if m.stack then '\n' + m.stack else ''}>"
      when m instanceof String || typeof m == 'string'
        m = '' + m
      else
        m = stringify(m)
    str.push(m) if m
  str = str.join(' ')

  if typeof Translator == 'undefined'
    Zotero.debug("{better-bibtex}: #{str}")
  else
    Zotero.debug("{better-bibtex:#{Translator.header.label}}: #{str}")
  return
