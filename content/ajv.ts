// 2020 for prefixItems
import AJV from 'ajv/dist/2020'

const options  = {
  strict: false,
  coerceTypes: true,
  discriminator: true,
  useDefaults: true,
}
export const ajv = new AJV(options)
import keywords from 'ajv-keywords'
keywords(ajv)

import betterAjvErrors from 'better-ajv-errors'

export function validator(schema): (data: any) => string { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const ok = ajv.compile(schema)
  return function(data: any): string { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (ok(data)) return ''
    return betterAjvErrors(schema, data, ok.errors, { format: 'js' }).map(err => err.error + (err.suggestion ? ', ' : '') + (err.suggestion || '')).join('\n')
  }
}
