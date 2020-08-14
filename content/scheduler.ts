import { Preferences as Prefs } from './prefs'

type Handler = () => void
type TimerHandle = ReturnType<typeof setTimeout>

export class Scheduler {
  private _delay: string | number
  private factor: number
  private handlers: Record<number, TimerHandle> = {}

  constructor(delay: string | number, factor: number = 1) {
    this._delay = delay
    this.factor = factor
  }

  public get delay() {
    return (this._delay === 'string' ? Prefs.get(this._delay) : this._delay) * this.factor
  }

  public get enabled() {
    return this.delay !== 0
  }

  // setTimeout numbers are guaranteed posive: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
  public schedule(id: number, handler: Handler) {
    if (this.handlers[id]) clearTimeout(this.handlers[id])
    this.handlers[id] = setTimeout(handler, this.delay)
  }
}
