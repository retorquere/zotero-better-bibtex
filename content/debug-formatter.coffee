stringify = require('json-stringify-safe')

module.exports = (prefix, msg) ->
  err = false
  str = ''
  for m in msg
    switch
      when m instanceof Error
        err = true
        m = "<Exception: #{m.message || m.name}#{if m.stack then '\n' + m.stack else ''}>"

      when m && typeof m == 'object' && m.stack # mozilla exception, no idea on the actual instance type
        err = true
        m = "<Exception: #{m}#\n#{m.stack}>"

      when m instanceof String || typeof m == 'string'
        # pass
      else
        m = stringify(m) # , null, 2)

    str += m + ' ' if m

  prefix += ':ERROR' if err

  return "{#{prefix}} #{str}"
