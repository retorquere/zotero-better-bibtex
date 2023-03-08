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

      if (value instanceof Error || value instanceof ErrorEvent || (value.QueryInterface && value.message) || value.toString() === '[object ErrorEvent]') {
        return `[error: ${[value.name, value.message].filter(m => m).join(': ')}${value.stack ? `\n${value.stack}` : ''}]`
      }
      if (value.QueryInterface && value.name) return `[XPCOM Object ${value.name}]`
      if (value.QueryInterface) return '[XPCOM Object]'

      if (cache.includes(value)) return '[circular]'
      cache.push(value)
      return value
    },
    indent
  )
  cache = null
  return ucode ? asciify(stringified) : stringified
}
