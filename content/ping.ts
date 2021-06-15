/* eslint-disable no-magic-numbers */
declare const Zotero: any

type Parameters = {
  total: number
  step?: number
  callback: (pct: number) => void
  start?: number
  name?: string
}

export class Pinger {
  private name: string
  private pct: number
  private step: number
  private callback: (pct: number) => void

  private next: number
  private incr: number

  constructor({ start = 0, total, step = 5, name = '', callback }: Parameters) {
    this.incr = 100 / total

    this.name = name
    this.pct = start * this.incr
    this.step = step
    this.callback = callback

    this.next = Math.floor(this.pct / step) * step

    if (this.name) Zotero.debug(`ping: ${name} start ${JSON.stringify({...this, start, total})}`)

    this.emit()
  }

  public update(): void {
    this.pct += this.incr
    if (this.name) Zotero.debug(`ping: ${this.name} update to ${this.pct}`)
    if (Math.round(this.pct) >= this.next) this.emit()
  }

  private emit() {
    if (this.callback) {
      if (this.name) Zotero.debug(`ping: ${this.name} emit ${Math.min(this.next, 100)}`)
      this.callback(Math.min(this.next, 100))
      if (this.next > 100) this.callback = null
      this.next += this.step
    }
  }

  public done(): void {
    if (this.name) Zotero.debug(`ping: ${this.name} done`)
    if (this.callback && this.pct < this.next) this.callback(Math.min(this.next, 100))
  }
}
