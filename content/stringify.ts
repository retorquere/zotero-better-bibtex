import safe_stable_stringify from 'safe-stable-stringify'

function stringifyXPCOM(obj): string {
  if (!obj.QueryInterface) return ''
  if (obj.message) return `[XPCOM error ${ obj.message }]`
  if (obj.name) return `[XPCOM object ${ obj.name }]`
  return '[XPCOM object]'
}

function stringifyError(obj) {
  if (obj instanceof Error) return `[error: ${ obj.message || '<unspecified error>' }\n${ obj.stack }]`
  // guess it is an errorevent
  if (obj.error instanceof Error && obj.message) return `[errorevent: ${ obj.message } ${ stringifyError(obj.error) }]`
  if (typeof ErrorEvent !== 'undefined' && obj instanceof ErrorEvent) return `[errorevent: ${ obj.message || '<unspecified errorevent>' }]`
  return ''
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function replacer(key: string, value: any): any {
  switch (typeof value) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'undefined':
      return value
    case 'function':
      return `[function ${ key }]`
  }

  if (value === null) return value
  if (value.openDialog || value.querySelector) return value.toString() // window/document
  if (value instanceof Set) return [...value]
  if (value instanceof RegExp) return value.source
  return stringifyXPCOM(value) || stringifyError(value) || value
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function stringify(obj: any, indent?: number | string): string {
  return safe_stable_stringify(obj, replacer, indent)
}
