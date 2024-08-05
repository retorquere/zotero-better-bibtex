import { Preference } from './prefs'

type Handler = () => void
type TimerHandle = ReturnType<typeof setTimeout>
type Job = {
  start: number
  handler: Handler
  timer: TimerHandle
}

export class Scheduler<T> {
  private _delay: string | number
  private factor: number
  private job: Map<T, Job & { id: T }> = new Map
  private held: Map<T, Handler> = null

  constructor(delay: string | number, factor = 1) {
    this._delay = delay
    this.factor = factor
  }

  public get delay(): number {
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
      return
    }

    if (paused) {
      this.held = new Map
    }
    else {
      const held = this.held
      this.held = null

      for (const [ id, handler ] of held.entries()) {
        this.schedule(id, handler)
      }
    }
  }

  public schedule(id: T, handler: Handler): void {
    if (this.held) {
      this.held.set(id, handler)
      return
    }

    let job = this.job.get(id)
    if (job) {
      clearTimeout(job.timer)
    }
    else {
      job = {
        id,
        start: Date.now(),
        handler,
        timer: 0 as unknown as TimerHandle,
      }
    }

    job.timer = setTimeout(j => {
      this.job.delete(id)
      j.handler()
    }, this.delay, job)

    this.job.set(id, job)
  }

  public cancel(id: T): void {
    let job: Job & { id: T }
    if (this.held) {
      this.held.delete(id)
    }
    else if (job = this.job.get(id)) {
      clearTimeout(job.timer)
      this.job.delete(id)
    }
  }

  public clear(): void {
    if (this.held) {
      this.held = new Map
    }
    else {
      for (const job of this.job.values()) {
        clearTimeout(job.timer)
      }
      this.job = new Map
    }
  }
}
