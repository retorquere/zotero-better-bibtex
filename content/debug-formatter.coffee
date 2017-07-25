stringify = require('json-stringify-safe')

module.exports = (msg) ->
  str = ''
  for m in msg
    switch
      when m instanceof Error
        m = "<Exception: #{m.message || m.name}#{if m.stack then '\n' + m.stack else ''}>"
      when m instanceof String || typeof m == 'string'
        # pass
      else
        m = stringify(m)

    str += m + ' ' if m

  return str
