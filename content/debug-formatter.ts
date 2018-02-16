import stringify = require('json-stringify-safe')

export function format(prefix, msg) {
  let str = ''

  str = msg.map((m, i) => {
    if (m instanceof Error) return `<Error: ${m.message || m.name}${m.stack ? `\n${m.stack}` : ''}>`

    // mozilla exception, no idea on the actual instance type
    if (m && typeof m === 'object' && m.stack) return `<Error: ${m}#\n${m.stack}>`

    if (m instanceof String || typeof m === 'string') return m

    if (typeof m === 'undefined') return '<undefined>'

    if (i === (msg.length - 1)) return stringify(m, null, 2) // last object

    return stringify(m)
  }).join(' ')

  return `{${prefix}} ${str}`
}
