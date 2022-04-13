// 2020 for prefixItems
import AJV from 'ajv/dist/2020'

const ajv = new AJV({ strict: true, coerceTypes: true })
import keywords from 'ajv-keywords'
keywords(ajv, 'instanceof')

import betterAjvErrors from 'better-ajv-errors'

export function validator(schema): (data: any) => string { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const ok = ajv.compile(schema)
  return function(data: any): string { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (ok(data)) return ''
    const err = betterAjvErrors(schema, data, ok.errors, { format: 'js' })[0] // eslint-disable-line @typescript-eslint/no-unsafe-return
    let msg = err.error
    // if (ok.errors[0].path && ok.errors[0].path[0] === '/') msg = msg.replace(ok.errors[0].path, JSON.stringify(ok.errors[0].path.substr(1)))
    if (err.suggestion) msg += `, ${err.suggestion}`
    return msg
  }
}

