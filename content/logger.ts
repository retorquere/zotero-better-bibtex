declare const Zotero: any

import stringify = require('json-stringify-safe')

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Logger = new class { // tslint:disable-line:variable-name
  public length: number
  public size: number

  private logged: number
  private index: number
  private lines: any[]

  constructor() {
    this.size = Zotero.Prefs.get('debug.store.limit')

    this.logged = 0

    this.reset()
  }

  public log(prefix, ...msg) {
    Zotero.debug(this.prefix(prefix, this.logged))

    this.lines[this.index] = {logged: this.logged, prefix, msg}
    this.index = ++this.index % this.size

    if (this.length < this.size) this.length++
    this.logged++
  }

  public array() {
    return this.lines.slice(this.index, this.length).concat(this.lines.slice(0, this.index))
  }

  public flush() {
    const flushed = this.array().map(line => {
      Zotero.debug('wtf:' + stringify(line.msg))
      return this.prefix(line.prefix, line.logged) + ' ' + line.msg.map((m, i) => { // tslint:disable-line:prefer-template
        if (m instanceof Error) return `<Error: ${m.message || m.name}${m.stack ? `\n${m.stack}` : ''}>`

        // mozilla exception, no idea on the actual instance type
        if (m && typeof m === 'object' && m.stack) return `<Error: ${m}#\n${m.stack}>`

        if (m instanceof String || typeof m === 'string') return m

        if (typeof m === 'undefined') return '<undefined>'

        if (i === (line.msg.length - 1)) return stringify(m, null, 2) // last object

        return stringify(m)
      }).join(' ')
    }).join('\n')

    // this.reset()

    return flushed
  }

  private reset() {
    this.index = 0
    this.length = 0
    this.lines = []
  }

  private prefix(prefix, logged) {
    return `{${prefix} ${logged}}`
  }
}
