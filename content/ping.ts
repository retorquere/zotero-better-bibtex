// declare const Zotero: any

type Parameters = {
  total: number
  step?: number
  callback: (pct: number) => void
  start?: number
}

export class Pinger {
  private pct: number
  private step: number
  private callback: (pct: number) => void

  private next: number
  private incr: number

  constructor({ start = 0, total, step = 5, callback }: Parameters) { // eslint-disable-line no-magic-numbers
    this.incr = 100 / total // eslint-disable-line no-magic-numbers

    this.pct = start * this.incr
    this.step = step
    this.callback = callback

    this.next = Math.floor(this.pct / step) * step

    // Zotero.debug(`ping: start ${JSON.stringify({...this, start, total})}`)

    this.emit()
  }

  public update(): void {
    // Zotero.debug(`ping: update ${JSON.stringify(this)}`)
    this.pct += this.incr
    if (Math.round(this.pct) > this.next) this.emit()
  }

  private emit() {
    if (this.callback) {
      // Zotero.debug(`ping: emit ${JSON.stringify(this)}`)
      this.callback(this.next)
      this.next += this.step
      if (this.next > 100) this.callback = null // eslint-disable-line no-magic-numbers
      // Zotero.debug(`ping: after-emit ${JSON.stringify(this)}`)
    }
  }

  public done(total?: number): void {
    const pct = typeof total === 'number' ? Math.ceil(total * this.incr) : 100 // eslint-disable-line no-magic-numbers
    if (this.pct < pct) this.callback(pct)
  }
}
