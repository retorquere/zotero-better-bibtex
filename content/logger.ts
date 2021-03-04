declare const Zotero: any
declare const Translator: any

import { stringify, asciify } from './stringify'
import { worker } from './worker'

class Logger {
  public verbose = false

  protected timestamp: number

  private format(error, msg) {
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

    const translator = typeof Translator !== 'undefined' && Translator.header.label
    const prefix = ['better-bibtex', translator, error, worker ? '(worker)' : ''].filter(p => p).join(' ')
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
    // cannot user Zotero.Debug.enabled because it is not available in foreground exporters
    if (!Zotero.BetterBibTeX || Zotero.BetterBibTeX.debugEnabled()) Zotero.debug(this.format('', msg))
  }

  public error(...msg) {
    Zotero.debug(this.format('error', msg))
  }
}

export const log = new Logger
