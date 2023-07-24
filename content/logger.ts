import type { Translators as Translator } from '../typings/translators'
declare const workerEnvironment: any
declare const workerJob: Translator.Worker.Job
declare const dump: (msg: string) => void

import { asciify, stringify } from './stringify'

export function print(msg: string): void {
  dump(msg + '\n')
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

class Logger {
  protected timestamp: number

  private format({ error=false }, msg) {
    let diff = null
    const now = Date.now()
    if (this.timestamp) diff = now - this.timestamp
    this.timestamp = now

    if (Array.isArray(msg)) msg = msg.map(toString).join(' ')

    let prefix = ''
    if (typeof workerEnvironment !== 'undefined') {
      prefix += ' worker'
      if (typeof workerJob !== 'undefined') prefix += `${workerJob.job} ${workerJob.translator}`
    }

    if (error) prefix += ' error:'

    return `{better-bibtex${prefix}} +${diff} ${asciify(msg)}`
  }

  public get enabled(): boolean {
    return (
      (typeof workerJob !== 'undefined' && workerJob.debugEnabled)
      ||
      !Zotero
      ||
      Zotero.Debug?.enabled
      ||
      Zotero.Prefs?.get('debug.store')
    ) as boolean
  }

  public print(msg: string) {
    if (!this.enabled) return

    if (typeof Zotero !== 'undefined') {
      Zotero.debug(msg)
    }
    else {
      print(msg)
    }
  }

  public log(...msg) {
    this.print(this.format({}, msg))
  }

  public debug(...msg) {
    this.print(this.format({}, msg))
  }

  public warn(...msg) {
    this.print(this.format({}, msg))
  }

  public info(...msg) {
    this.print(this.format({}, msg))
  }

  public error(...msg) {
    this.print(this.format({error: true}, msg))
  }

  public dump(...msg) {
    if (this.enabled) print(this.format({}, msg))
  }

  public status({ error=false }, ...msg) {
    if (error || this.enabled) Zotero.debug(this.format({error}, msg))
  }
}

export const log = new Logger
