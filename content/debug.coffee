stringify = require('json-stringify-safe')

module.exports = (msg...) ->
  if typeof Zotero != 'undefined' # not in minitest
    if typeof BetterBibTeX == 'undefined'
      return unless Zotero.Debug.enabled
    else
      return unless BetterBibTeX.preferences.debug

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

  if typeof BetterBibTeX == 'undefined'
    str = "{better-bibtex}: #{str}"
  else
    str = "{better-bibtex:#{BetterBibTeX.header.label}}: #{str}"

  if typeof Zotero == 'undefined'
    console.log(str)
  else
    Zotero.debug(str)

  return
