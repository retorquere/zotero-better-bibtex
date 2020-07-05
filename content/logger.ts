declare const Zotero: any

import { stringify, asciify } from './stringify'

export let log = new class Logger {
  public prefix = 'better-bibtex'
  private timestamp: number

  private format(msg) {
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

    return ` +${diff} ${asciify(msg)}`
  }

  public debug(...msg) {
    if (Zotero.BetterBibTeX.debugEnabled()) Zotero.debug(this.prefix + this.format(msg))
  }

  public error(...msg) {
    (Zotero.logError || Zotero.debug)(`${this.prefix} error:` + this.format(msg))
  }
}
