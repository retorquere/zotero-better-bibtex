import { Preference } from './prefs'

type Handler = () => void
type TimerHandle = ReturnType<typeof setTimeout>
type Job = {
  start: number
  handler: Handler
  timer: TimerHandle
}

export class Scheduler<T> {
  #delay: string | number
  private factor: number
  private job: Map<T, Job & { id: T }> = new Map
  private held: Map<T, Handler> | undefined

  constructor(delay: string | number, factor = 1) {
    this.#delay = delay
    this.factor = factor
  }

  public get delay(): number {
    return (typeof this.#delay === 'string' ? Preference[this.#delay] : this.#delay) * this.factor
  }

  public get enabled(): boolean {
    return this.delay !== 0
  }

  public get paused(): boolean {
    return !!this.held
  }

  public set paused(paused: boolean) {
    const make = {
      paused,
      running: !paused,
    }

    if (this.held && make.running) {
      const held = this.held
      this.held = undefined

      for (const [ id, handler ] of held.entries()) {
        this.schedule(id, handler)
      }
    }
    else if (!this.held && make.paused) {
      this.held = new Map
    }
  }

  public schedule(id: T, handler: Handler): void {
    if (!this.enabled) return

    if (this.held) {
      this.held.set(id, handler)
      return
    }

    this.cancel(id)
    this.job.set(id, {
      id,
      start: Date.now(),
      handler,
      timer: setTimeout(this.run.bind(this), this.delay, id),
    })
  }

  private run(id: T) {
    this.job.get(id)?.handler()
    this.job.delete(id)
  }

  public cancel(id: T): void {
    if (this.held) this.held.delete(id)

    const job = this.job.get(id)
    if (job) {
      clearTimeout(job.timer)
      this.job.delete(id)
    }
  }

  public clear(): void {
    if (this.held) this.held = new Map

    for (const job of this.job.values()) {
      clearTimeout(job.timer)
    }
    this.job = new Map
  }
}
