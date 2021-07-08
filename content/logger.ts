declare const Translator: any
declare const workerContext: { worker: string }

import { stringify, asciify } from './stringify'
import { worker as inWorker } from './environment'

let running_translator = null

try {
  running_translator = Translator || null
}
catch (err) {
  running_translator = null
}

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

    translator = translator || running_translator?.header.label
    if (inWorker && !worker) worker = workerContext.worker || '??'
    const prefix = ['better-bibtex', translator, error && 'error', worker && `(worker ${worker})`].filter(p => p).join(' ')
    return `{${prefix}} +${diff} ${asciify(msg)}`
  }

  private formatError(e, indent='') {
    let msg = `${indent}${e.message || e.name || ''}`
    if (e.filename) msg += ` in ${e.filename}`
    if (e.lineno && e.colno) msg += ` line ${e.lineno}, col ${e.colno}`
    if (e.stack) msg += `\n${indent}${e.stack.replace(/\n/g, `${indent}\n`)}`
    if (e.error) msg += `\n${indent}${this.formatError(e.error, '  ')}\n`
    return `${indent}<Error: ${msg}>`
  }

  public debug(...msg) {
    // cannot user Zotero.Debug.enabled in foreground exporters
    if (!Zotero.BetterBibTeX || running_translator?.debug || Zotero.Debug?.enabled) Zotero.debug(this.format({}, msg))
  }

  public error(...msg) {
    Zotero.debug(this.format({error: true}, msg))
  }
  public status({ error=false, worker='', translator='' }, ...msg) {
    Zotero.debug(this.format({error, worker, translator}, msg))
  }
}

export const log = new Logger
