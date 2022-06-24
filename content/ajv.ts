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
  Zotero.debug(`compiling options ${JSON.stringify(schema)}`)
  Zotero.debug(`compiling schema ${JSON.stringify(schema)}`)
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
