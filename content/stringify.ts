import fast_safe_stringify from 'fast-safe-stringify'

export function asciify(str: string): string {
  return str.replace(/[\u007F-\uFFFF]/g, chr => `\\u${(`0000${chr.charCodeAt(0).toString(16)}`).substr(-4)}`) // eslint-disable-line no-magic-numbers
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function stable_stringify(obj: any, replacer?: any, indent?: string | number, ucode?: boolean): string {
  const stringified: string = fast_safe_stringify.stable(obj, replacer, indent)

  return ucode ? asciify(stringified) : stringified
}

// safely handles circular references
export function stringify(obj, indent: number | string = 2, ucode?: boolean) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  let cache = []
  let err
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

      if (value.QueryInterface && value.message) {
        err = `${value.message} ${value.toString?.()}`
      }
      else if ((value instanceof Error || value instanceof ErrorEvent) && value.message) {
        err = err.message
      }
      else if (value.toString && value.toString() === '[object ErrorEvent]') {
        err = `XPCOM error ${value.name || '<unknown>'}`
      }
      else {
        err = null
      }
      if (err) {
        return `[error: ${err}${value.stack ? `\n${value.stack}` : ''}]`
      }

      if (value.QueryInterface) return `[XPCOM object ${value.name} ${value.toString?.()}]`
      if (cache.includes(value)) return '[circular]'
      cache.push(value)
      return value
    },
    indent
  )
  cache = null
  return ucode ? asciify(stringified) : stringified
}
