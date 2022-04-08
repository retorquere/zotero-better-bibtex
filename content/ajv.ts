import AJV from 'ajv'
import betterAjvErrors from 'better-ajv-errors'

const ajv = new AJV({ coerceTypes: true })

const CLASSES = {
  Buffer: Buffer,
  RegExp: RegExp,
}

ajv.addKeyword('instanceof', {
  compile: function(schema) {
    var Class = CLASSES[schema]
    return function(data) {
      return data instanceof Class
    }
  }
})

export function validator(schema): (data: any) => string { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const ok = ajv.compile(schema)
  return function(data: any): string { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (ok(data)) return ''
    const err = betterAjvErrors(schema, data, ok.errors, { format: 'js' })[0] // eslint-disable-line @typescript-eslint/no-unsafe-return
    let msg = err.error
    if (err.path && err.path[0] === '/') msg = msg.replace(err.path, JSON.stringify(err.path.substr(1)))
    if (err.suggestion) msg += `, ${err.suggestion}`
    return msg
  }
}

