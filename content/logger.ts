declare const Zotero: any
declare const Translator: any

import { stringify, asciify } from './stringify'
import { worker } from './worker'

class Logger {
  protected timestamp: number

  private format(error, msg) {
    let diff = null
    const now = Date.now()
    if (this.timestamp) diff = now - this.timestamp
    this.timestamp = now

    if (typeof msg !== 'string') {
      let _msg = ''
      for (const m of msg) {
        const type = typeof m
        if (type === 'string' || m instanceof String || type === 'number' || type === 'undefined' || type === 'boolean' || m === null) {
          _msg += m
        } else if (m instanceof Error) {
          _msg += `<Error: ${m.message || m.name}${m.stack ? `\n${m.stack}` : ''}>`
        } else if (m && type === 'object' && m.message) { // mozilla exception, no idea on the actual instance type
          // message,fileName,lineNumber,column,stack,errorCode
          _msg += `<Error: ${m.message}#\n${m.stack}>`
        } else {
          _msg += stringify(m)
        }

        _msg += ' '
      }
      msg = _msg
    }

    const translator = typeof Translator !== 'undefined' && Translator.header.label
    const prefix = ['better-bibtex', translator, error, worker ? '(worker)' : ''].filter(p => p).join(' ')
    return `{${prefix}} +${diff} ${asciify(msg)}`
  }

  public debug(...msg) {
    if (Zotero.BetterBibTeX.debugEnabled()) Zotero.debug(this.format('', msg))
  }

  public error(...msg) {
    (Zotero.logError || Zotero.debug)(this.format('error', msg))
  }
}

export const log = new Logger
