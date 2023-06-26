import fast_safe_stringify from 'fast-safe-stringify'

export function asciify(str: string): string {
  return str.replace(/[\u007F-\uFFFF]/g, chr => `\\u${(`0000${chr.charCodeAt(0).toString(16)}`).substr(-4)}`) // eslint-disable-line no-magic-numbers
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function stable_stringify(obj: any, replacer?: any, indent?: string | number, ucode?: boolean): string {
  const stringified: string = fast_safe_stringify.stable(obj, replacer, indent)

  return ucode ? asciify(stringified) : stringified
}

function stringifyXPCOM(obj): string {
  if (!obj.QueryInterface) return ''
  let str: string

  try {
    str = obj.toString?.() || ''
  }
  catch (err) {
    str = err.message || '<toString error>'
  }

  try {
    if (obj.message) return `[XPCOM error ${obj.message} ${str}`
    if (obj.name) return `[XPCOM object ${obj.name} ${str}]`
    return `[XPCOM object ${str}]`
  }
  catch (err) {
    return `[unserialisable XPCOM object ${str}]`
  }
}

function stringifyError(obj) {
  if (obj instanceof Error) return `[error: ${obj.message || '<unspecified error>'}\n${obj.stack}]`
  // guess it is an errorevent
  if (obj.error instanceof Error && obj.message) return `[errorevent: ${obj.message} ${stringifyError(obj.error)}]`
  if (obj instanceof ErrorEvent) return `[errorevent: ${obj.message || '<unspecified errorevent>'}]`
  return ''
}

// safely handles circular references
export function stringify(obj, indent: number | string = 2, ucode?: boolean) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  let cache = []
  let replacement: string
  const stringified = JSON.stringify(
    obj,
    (key, value): any => {
      switch (typeof value) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'undefined':
          return value
      }

      if (value === null) return value
      if (cache.includes(value)) return '[circular]'

      if (replacement = stringifyXPCOM(value)) {
        value = replacement
      }
      else if (replacement = stringifyError(value)) {
        value = replacement
      }
      else {
        replacement = ''
      }
      if (!replacement) cache.push(value)
      return replacement || value
    },
    indent
  )
  cache = null
  return ucode ? asciify(stringified) : stringified
}
