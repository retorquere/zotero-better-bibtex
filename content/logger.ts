/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-empty-function, no-restricted-syntax */

import * as client from './client'

declare const dump: (msg: string) => void

export const discard = {
  log(): void {},
  error(): void {},
  warn(): void {},
  debug(): void {},
  info(): void {},
  clear(): void {},
  dir(): void {},
  table(): void {},
}

function stringifyXPCOM(obj: any): string {
  if (!obj.QueryInterface) return ''
  if (obj.message) return `[XPCOM error ${obj.message}]`
  if (obj.name) return `[XPCOM object ${obj.name}]`
  return '[XPCOM object]'
}

function stringifyError(obj: any): string {
  if (obj instanceof Error) return `[error: ${obj.message || '<unspecified error>'}\n${obj.stack}]`
  // guess it is an errorevent
  if (obj.error instanceof Error && obj.message) return `[errorevent: ${obj.message} ${stringifyError(obj.error)}]`
  if (typeof ErrorEvent !== 'undefined' && obj instanceof ErrorEvent) return `[errorevent: ${obj.message || '<unspecified errorevent>'}]`
  return ''
}

function $serialize(val: any, seen: WeakSet<any>): string | undefined {
  if (val === null) return 'null'
  if (val === undefined) return undefined

  switch (typeof val) {
    case 'number': return isFinite(val) ? String(val) : 'null'

    case 'boolean': return val ? 'true' : 'false'

    case 'string': return JSON.stringify(val)

    case 'symbol':
    case 'function':
      return undefined

    case 'object':
      break // handled below

    default:
      return undefined
  }

  if (seen.has(val)) {
    return '"[Circular]"'
  }

  seen.add(val)

  let res: string

  if (typeof val.toJSON === 'function') {
    const serialized = $serialize(val.toJSON(), seen)
    seen.delete(val)
    return serialized
  }

  if ('getField' in val) {
    res = JSON.stringify(Zotero.Utilities.Internal.itemToExportFormat(val, false, true))
  }

  else if (val.openDialog || val.querySelector) { // window/document
    res = JSON.stringify(val.toString())
  }

  else if (res = stringifyXPCOM(val) || stringifyError(val)) {
    res = JSON.stringify(res)
  }

  else if (Array.isArray(val)) {
    let out = '['
    for (let i = 0; i < val.length; i++) {
      if (i > 0) out += ','
      const item = $serialize(val[i], seen)
      out += item === undefined ? 'null' : item
    }
    res = out + ']'
  }

  else if (val instanceof RegExp) {
    res = JSON.stringify(val.toString())
  }

  else if (val instanceof Set) {
    let out = '['
    let first = true
    for (const entry of val) {
      const item = $serialize(entry, seen)
      if (item !== undefined) {
        if (!first) out += ','
        out += item
        first = false
      }
    }
    res = out + ']'
  }

  else if (val instanceof Map) {
    let out = '{'
    let first = true
    for (const [key, entryVal] of val) {
      const item = $serialize(entryVal, seen)
      if (item !== undefined) {
        if (!first) out += ','
        const formattedKey = typeof key === 'string' ? key : String(key)
        out += JSON.stringify(formattedKey) + ':' + item
        first = false
      }
    }
    res = out + '}'
  }

  else {
    let out = '{'
    let first = true
    const keys = Object.keys(val)
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const item = $serialize(val[key], seen)
      if (item !== undefined) {
        if (!first) out += ','
        out += JSON.stringify(key) + ':' + item
        first = false
      }
    }
    res = out + '}'
  }

  seen.delete(val)
  return res
}

function serialize(val: any, seen: WeakSet<any>): string {
  try {
    return $serialize(val, seen) || ''
  }
  catch (err) {
    const msg = `\n\nstringify error: ${(err as any).message}\n${(err as any).stack}\n\n`
    log.error(msg)
    return msg
  }
}

export function stringify(obj: any): string {
  return serialize(obj, new WeakSet)
}

function to_s(obj: any): string {
  if (typeof obj === 'string') return obj
  return stringify(obj) || ''
}

export function print(strings: TemplateStringsArray, ...expressions: any[]) {
  let err: string
  let prefix = ''
  // acc will initially be the lead string
  const s = strings.reduce((acc, v, i) => {
    acc = acc + (typeof expressions[i] === 'string' ? expressions[i] : (err = stringifyError(expressions[i])) || stringify(expressions[i])) + v
    if (err) prefix = 'error: '
    return acc
  })
  return prefix + s
}

export function format(...msg): string {
  return msg.map(to_s).join(' ')
}

export const log = new class {
  public prefix = ''

  #prefix(error?: any) {
    return `{${ error ? 'error: ' : '' }${ client.worker ? 'worker: ' : '' }${this.prefix}better-bibtex:} `
  }

  public debug(...msg): void {
    Zotero.debug(`${this.#prefix()}${format(...msg)}\n`)
  }

  public info(...msg): void {
    Zotero.debug(`${this.#prefix()}${format(...msg)}\n`, 1)
  }

  public error(...msg): void {
    Zotero.debug(`${this.#prefix(true)}${format(...msg)}\n`, 1)
  }

  public dump(msg: string, error?: Error): void {
    if (error) {
      dump(`${this.#prefix(error)}${format(msg, error)}\n`)
    }
    else {
      dump(`${this.#prefix()}${format(msg)}\n`)
    }
  }
}

export function $dump(msg: string, error?: Error): void {
  log.dump(msg, error)
}

export function trace(msg: string, mode = ''): void {
  dump(`trace${ mode }\t${ Date.now() }\t${ msg }\n`)
}
