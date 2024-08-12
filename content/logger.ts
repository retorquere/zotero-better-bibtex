/* eslint-disable @typescript-eslint/no-empty-function, no-restricted-syntax */

import type { Translators as Translator } from '../typings/translators'
declare const workerEnvironment: any
declare const TranslationWorker: { job: Translator.Worker.Job }
declare const dump: (msg: string) => void

import { stringify } from './stringify'
import { asciify } from './text'
import { worker } from './client'

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

function format(msg: string, error?: Error) {
  const err = error ? ` (${ error.message })\n${ error.stack }`.trim() : ''
  return `${ error ? 'error: ' : '' }${ worker ? 'worker:' : '' }better-bibtex::${ msg }${ err }`
}

function $dump(msg: string, error?: Error): void {
  dump(format(msg, error) + '\n')
}

export function trace(msg: string, mode = ''): void {
  dump(`trace${ mode }\t${ Date.now() }\t${ msg }\n`)
}

export const simple = {
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
    $dump(msg)
  },
}

function toString(obj): string {
  try {
    if (typeof obj === 'string') return obj
    return stringify(obj, 0)
  }
  catch (err) {
    return stringify(err, 0)
  }
}

export const log = new class Logger {
  protected timestamp: number
  public prefix = ''

  private format({ ascii = true, error = false }, msg) {
    if (Array.isArray(msg)) msg = msg.map(toString).join(' ')

    let prefix = ''
    if (typeof workerEnvironment !== 'undefined') {
      prefix += ' worker'
      if (typeof TranslationWorker !== 'undefined') prefix += `:${ TranslationWorker.job.translator }`
    }

    if (error) prefix += ' error:'
    if (ascii) msg = asciify(msg)

    return `{better-bibtex${ this.prefix }${ prefix }} ${ msg }`
  }

  public get enabled(): boolean {
    return (
      (typeof TranslationWorker !== 'undefined' && TranslationWorker.job.debugEnabled)
      || !Zotero
      || Zotero.Debug?.enabled
      || Zotero.Prefs?.get('debug.store')
    ) as boolean
  }

  public debug(...msg) {
    Zotero.debug(this.format({}, msg))
  }

  public info(msg: string) {
    Zotero.debug(this.format({ ascii: false }, msg))
  }

  public error(...msg) {
    Zotero.debug(this.format({ error: true }, msg))
  }

  public status({ error = false }, ...msg) {
    if (error || this.enabled) Zotero.debug(this.format({ error }, msg))
  }

  public async timed(msg: string, code: () => void | Promise<void>) {
    const start = Date.now()
    await code()
    this.debug(msg, 'took', Date.now() - start, 'ms')
  }

  public dump(msg: string) {
    $dump(msg)
  }
}
