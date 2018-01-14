import stringify = require('json-stringify-safe')

export function format(prefix, msg) {
  let err = false
  let str = ''

  for (let m of msg) {
    if (m instanceof Error) {
      err = true
      m = `<Exception: ${m.message || m.name}${m.stack ? `\n${m.stack}` : ''}>`

    } else if (m && typeof m === 'object' && m.stack) { // mozilla exception, no idea on the actual instance type
      err = true
      m = `<Exception: ${m}#\n${m.stack}>`

    } else if (m instanceof String || typeof m === 'string') {
      // pass

    } else {
      m = stringify(m) // , null, 2)

    }

    if (m) str += m + ' '
  }

  return `{${prefix}} ${err ? 'Error: ' : ''}${str}`
}
