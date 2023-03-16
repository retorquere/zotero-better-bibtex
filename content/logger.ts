import type { Translators as Translator } from '../typings/translators'
import type { TranslatorMetadata } from '../translators/lib/translator'
// workerJob and Translator must be var-hoisted by esbuild to make this work
declare var ZOTERO_TRANSLATOR_INFO: TranslatorMetadata // eslint-disable-line no-var
declare const workerJob: Translator.Worker.Job
declare const dump: (msg: string) => void

import { asciify, stringify } from './stringify'
import { worker as inWorker } from './client'

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
  public verbose = false

  protected timestamp: number

  private format({ error=false, worker=0, translator='' }, msg) {
    let workername = `${worker}`
    let diff = null
    const now = Date.now()
    if (this.timestamp) diff = now - this.timestamp
    this.timestamp = now

    if (Array.isArray(msg)) msg = msg.map(toString).join(' ')

    if (inWorker) {
      if (!worker && typeof workerJob !== 'undefined') {
        worker = workerJob.job
        workername = `${workerJob.job}`
      }
      translator = translator || workerJob.translator
    }
    else {
      if (worker) workername = `${worker} (ceci n'est pas une ouvrier)`
      // Translator must be var-hoisted by esbuild for this to work
      if (!translator && typeof ZOTERO_TRANSLATOR_INFO !== 'undefined') translator = ZOTERO_TRANSLATOR_INFO.label
    }
    const prefix = ['better-bibtex', translator, error && ':error:', worker && `(worker ${workername})`].filter(p => p).join(' ')
    return `{${prefix}} +${diff} ${asciify(msg)}`
  }

  /*
  public formatError(e, indent='') {
    let msg = [e.name, e.message].filter(s => s).join(': ')
    if (e.filename || e.fileName) msg += ` in ${e.filename || e.fileName}`
    if (e.lineno || e.lineNumber) {
      msg += ` line ${e.lineno}`
      if (e.colno) msg += `, col ${e.colno}`
    }
    if (e.stack) msg += `\n${indent}${e.stack.replace(/\n/g, `${indent}\n`)}`
    if (e.error) msg += `\n${indent}${this.formatError(e.error, '  ')}\n`
    return `${indent}<Error: ${msg}>`
  }
  */

  public get enabled(): boolean {
    return (
      (typeof workerJob !== 'undefined' && workerJob.debugEnabled)
      ||
      Zotero.Debug?.enabled
      ||
      Zotero.Prefs?.get('debug.store')
    ) as boolean
  }

  public debug(...msg) {
    if (this.enabled) Zotero.debug(this.format({}, msg))
  }

  public dump(...msg) {
    if (this.enabled) print(this.format({}, msg))
  }

  public error(...msg) {
    Zotero.debug(this.format({error: true}, msg))
  }
  public status({ error=false, worker=0, translator='' }, ...msg) {
    if (error || this.enabled) Zotero.debug(this.format({error, worker, translator}, msg))
  }
}

export const log = new Logger
