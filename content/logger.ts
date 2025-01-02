/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-function, no-restricted-syntax */

declare const Zotero: any

import * as client from './client'
const version = require('./../gen/version.js')
export const run = `<${version} ${client.run}>`

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

function replacer() {
  const seen = new WeakSet
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }

    if (value === null) return value
    if (value instanceof Set) return [...value]
    if (value instanceof Map) return Object.fromEntries(value)

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        return value

      case 'object':
        return stringifyXPCOM(value) || stringifyError(value) || value
    }

    if (Array.isArray(value)) return value

    return undefined
  }
}

function to_s(obj: any): string {
  if (typeof obj === 'string') return obj
  return JSON.stringify(obj, replacer(), 2)
}

export function format(...msg): string {
  return msg.map(to_s).join(' ')
}

export const log = new class {
  public prefix = ''

  #prefix(error?: any) {
    return `{${ error ? 'error: ' : '' }${ client.worker ? 'worker: ' : '' }${this.prefix}better-bibtex: ${run}} `
  }

  public debug(...msg): void {
    Zotero.debug(`${this.#prefix()}${format(...msg)}\n`)
  }

  public info(...msg): void {
    Zotero.debug(`${this.#prefix()}${format(...msg)}\n`)
  }

  public error(...msg): void {
    Zotero.debug(`${this.#prefix(true)}${format(...msg)}\n`)
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
