/* eslint-disable @typescript-eslint/no-empty-function, no-restricted-syntax */

declare const Zotero: any

import * as client from '../client'
const version = require('../../gen/version.js')
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

export function format(msg: string, error?: Error): string {
  const err = error ? ` (${ error.message })\n${ error.stack }`.trim() : ''
  return `${ error ? 'error: ' : '' }${ client.worker ? 'worker:' : '' }better-bibtex: ${run}::${ msg }${ err }`
}

export function $dump(msg: string, error?: Error): void {
  dump(format(msg, error) + '\n')
}

export function trace(msg: string, mode = ''): void {
  dump(`trace${ mode }\t${ Date.now() }\t${ msg }\n`)
}

export const log = {
  debug(msg: string): void {
    Zotero.debug(format(msg))
  },
  info(msg: string): void {
    Zotero.debug(format(msg))
  },
  error(msg: string, error?: Error): void {
    Zotero.debug(format(msg, error))
  },
  dump(msg: string): void {
    $dump(format(msg))
  },
}
