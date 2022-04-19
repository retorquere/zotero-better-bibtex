import { Preference } from './prefs'
import { log } from './logger'

type Handler = () => void
type TimerHandle = ReturnType<typeof setTimeout>

export class Scheduler {
  private _delay: string | number
  private factor: number
  private handlers: Map<number, TimerHandle> = new Map
  private held: Map<number, Handler> = null

  constructor(delay: string | number, factor = 1) {
    this._delay = delay
    this.factor = factor
  }

  public get delay(): number {
    // what preference is this actually grabbing?
    return (typeof this._delay === 'string' ? Preference[this._delay] : this._delay) * this.factor
  }

  public get enabled(): boolean {
    return this.delay !== 0
  }

  public get paused(): boolean {
    return this.held !== null
  }

  public set paused(paused: boolean) {
    if (paused === this.paused) {
      log.debug('scheduler: already', paused ? 'paused' : 'active')
      return
    }

    if (paused) {
      log.debug('scheduler: pausing')
      this.held = new Map
    }
    else {
      log.debug('scheduler: resuming')
      const held = this.held
      this.held = null

      for (const [id, handler] of held.entries()) {
        log.debug('scheduler: resuming', id)
        this.schedule(id, handler)
      }
    }
  }

  public schedule(id: number, handler: Handler): void {
    log.debug('scheduler.schedule:', { id, held: !!this.held })
    if (this.held) {
      this.held.set(id, handler)
    }
    else {
      if (this.handlers.has(id)) clearTimeout(this.handlers.get(id))
      this.handlers.set(id, setTimeout(handler, this.delay))
    }
  }

  public cancel(id: number): void {
    if (this.held) {
      this.held.delete(id)
    }
    else if (this.handlers.has(id)) {
      clearTimeout(this.handlers.get(id))
      this.handlers.delete(id)
    }
  }
}
