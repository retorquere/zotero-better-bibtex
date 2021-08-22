// workerContext and Translator must be var-hoisted by esbuild to make this work
declare const ZOTERO_TRANSLATOR_INFO: any
declare const workerContext: { translator: string, debugEnabled: boolean, worker: string }

import { stringify, asciify } from './stringify'
import { worker as inWorker } from './environment'

const inTranslator = inWorker || typeof ZOTERO_TRANSLATOR_INFO !== 'undefined'

class Logger {
  public verbose = false

  protected timestamp: number

  private format({ error=false, worker='', translator=''}, msg) {
    let diff = null
    const now = Date.now()
    if (this.timestamp) diff = now - this.timestamp
    this.timestamp = now

    if (typeof msg !== 'string') {
      let output = ''
      for (const m of msg) {
        const type = typeof m
        if (type === 'string' || m instanceof String || type === 'number' || type === 'undefined' || type === 'boolean' || m === null) {
          output += m
        }
        else if (m instanceof Error || m instanceof ErrorEvent || m.toString() === '[object ErrorEvent]') {
          output += this.formatError(m)
        }
        else if (m && type === 'object' && m.message) { // mozilla exception, no idea on the actual instance type
          output += this.formatError({ message: m.errorCode ? `${m.message} (${m.errorCode})` : m.message, filename: m.fileName, lineno: m.lineNumber, colno: m.column, stack: m.stack })
        }
        else if (this.verbose) {
          output += stringify(m, null, 2)
        }
        else {
          output += stringify(m)
        }

        output += ' '
      }
      msg = output
    }

    if (inWorker) {
      worker = worker || workerContext.worker
      translator = translator || workerContext.translator
    }
    else {
      if (worker) worker = `${worker} (but inWorker is false?)`
      // Translator must be var-hoisted by esbuild for this to work
      if (!translator && inTranslator) translator = ZOTERO_TRANSLATOR_INFO.label
    }
    const prefix = ['better-bibtex', translator, error && 'error', worker && `(worker ${worker})`].filter(p => p).join(' ')
    return `{${prefix}} +${diff} ${asciify(msg)}`
  }

  private formatError(e, indent='') {
    let msg = `${e.message || e.name || ''}`
    if (e.filename || e.fileName) msg += ` in ${e.filename || e.fileName}`
    if (e.lineno || e.lineNumber) {
      msg += ` line ${e.lineno}`
      if (e.colno) msg += `, col ${e.colno}`
    }
    if (e.stack) msg += `\n${indent}${e.stack.replace(/\n/g, `${indent}\n`)}`
    if (e.error) msg += `\n${indent}${this.formatError(e.error, '  ')}\n`
    return `${indent}<Error: ${msg}>`
  }

  public get enabled(): boolean {
    if (!inTranslator) return Zotero.Debug.enabled as boolean
    if (!inWorker) return true
    return !workerContext || workerContext.debugEnabled
  }

  public debug(...msg) {
    if (this.enabled) Zotero.debug(this.format({}, msg))
  }

  public error(...msg) {
    Zotero.debug(this.format({error: true}, msg))
  }
  public status({ error=false, worker='', translator='' }, ...msg) {
    if (error || this.enabled) Zotero.debug(this.format({error, worker, translator}, msg))
  }
}

export const log = new Logger
