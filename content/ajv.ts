import betterAjvErrors from '@readme/better-ajv-errors'

export function validator(ajv, schema): (data: any) => string { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const ok = ajv.compile(schema)
  return function(data: any): string { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (ok(data)) return ''
    const error: string = betterAjvErrors(schema, data, ok.errors, { format: 'js' })[0].error // eslint-disable-line @typescript-eslint/no-unsafe-return
    return error[0] === '/' ? error.substr(1) : error
  }
}
