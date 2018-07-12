declare const Zotero: any

import stringify = require('json-stringify-safe')

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Logger = new class { // tslint:disable-line:variable-name
  public length: number
  public size: number

  private logged: number
  private index: number
  private lines: any[]
  private testing: boolean
  private timestamp: number

  constructor() {
    this.size = Zotero.Prefs.get('debug.store.limit')
    this.testing = Zotero.Prefs.get('translators.better-bibtex.testing')

    this.logged = 0

    this.reset()
  }

  public log(prefix, ...msg) {
    this.logged++
    let diff = null
    const now = Date.now()

    if (this.timestamp) diff = now - this.timestamp
    this.timestamp = now

    if (this.testing) {
      Zotero.debug(this.format({prefix, logged: this.logged, diff, msg}))
      return
    }

    Zotero.debug(this.prefix(prefix, this.logged, diff))

    this.lines[this.index] = {logged: this.logged, diff, prefix, msg}
    this.index = ++this.index % this.size

    if (this.length < this.size) this.length++
  }

  public flush() {
    for (let i = 0; i < this.length; i++) {
      if (typeof this.lines[i].msg !== 'string') {
        this.lines[i].msg = this.format(this.lines[i])
      }
    }
    const flushed = this.lines.slice(this.index, this.length).concat(this.lines.slice(0, this.index)).map(line => line.msg).join('\n')

    // this.reset()

    return flushed
  }

  private reset() {
    this.index = 0
    this.length = 0
    this.lines = []
  }

  private format(line: {prefix: string, logged: number, diff: number, msg: any[]}) {
    return this.prefix(line.prefix, line.logged, line.diff) + ' ' + line.msg.map((m, i) => { // tslint:disable-line:prefer-template
      if (m instanceof Error) return `<Error: ${m.message || m.name}${m.stack ? `\n${m.stack}` : ''}>`

      // mozilla exception, no idea on the actual instance type
      if (m && typeof m === 'object' && m.stack) return `<Error: ${m}#\n${m.stack}>`

      if (m instanceof String || typeof m === 'string') return m

      if (typeof m === 'undefined') return '<undefined>'

      // if (i === (line.msg.length - 1)) return stringify(m, null, 2) // last object

      return stringify(m)
    }).join(' ')
  }

  private prefix(prefix, logged, diff) {
    return `{${prefix} ${logged} +${diff}}`
  }
}
