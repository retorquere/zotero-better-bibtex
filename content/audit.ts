/* eslint-disable no-restricted-syntax, @typescript-eslint/no-unsafe-return */

import { log } from './logger'

/*
const format = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false, // 24-hour time format
})

type Timer = ReturnType<typeof setInterval>

export const memory = new class {
  #header = true
  #scale = MB
  #timer: Timer | undefined
  #prefix = '[[better-bibtex memory state]]'

  constructor() {
    if (Zotero.Debug.storing) this.record(true)
  }

  public scale(scale: number) {
    this.#scale = scale
  }

  get resident() {
    return memoryReporterManager.resident / this.#scale
  }

  public async minimize() {
    await minimize()
  }

  public record(on: boolean) {
    if (this.#timer) {
      clearInterval(this.#timer)
      this.#timer = undefined
    }
    if (on) this.#timer = setInterval(this.log.bind(this, 'recording'), 10000)
  }

  public log(msg = ''): void {
    if (this.#header) {
      Zotero.debug(`${this.#prefix}timestamp,message,resident`)
      this.#header = false
    }

    if (msg && /[",\n\r]/.test(msg)) msg = `"${msg.replace(/"/g, '""')}"`
    Zotero.debug(`${this.#prefix}${format.format(new Date).replace(',', '')},${msg},${this.resident}`)
  }
}

const baseline = memory.resident
export const memory: MethodDecorator = function(target, context) {
  const methodName = String(context.name)
  let className = ''

  context.addInitializer(function(this: any) {
    const ctor = Object.getPrototypeOf(this)?.constructor
    className = (ctor && ctor.name !== 'Object' && ctor.name !== '')
      ? ctor.name
      : this.constructor?.name || 'Object'
  })

  return function(this: any, ...args: any[]) {
    const start = memory.resident

    const logIncrease = () => {
      const current = memory.resident
      const increase = current - start
      if (increase > 0) {
        memory.log(`${className}.${methodName}(${args.filter(a => JSON.stringify(a)).join(', ')}) increased memory use by ${increase}, total increase ${current - baseline}`)
      }
    }

    try {
      // @ts-expect-error TS2345 memory auditing is inherently icky
      const result = target.call(this, ...args)

      // @ts-expect-error TS2339 resturn val is a promise
      if (result && typeof result === 'object' && typeof result.then === 'function') {
        // @ts-expect-error TS2339 resturn val is a promise
        return result.finally(logIncrease)
      }

      logIncrease()
      return result
    }
    catch (err) {
      logIncrease()
      throw err
    }
  }
}
*/

function printDuration(ms: number) {
  const seconds = Math.floor(ms / 1000)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

type AnyMethod<This = any, Args extends any[] = any[], Return = any> = (this: This, ...args: Args) => Return
type MethodContext<This = any, Args extends any[] = any[], Return = any> = ClassMethodDecoratorContext<This, AnyMethod<This, Args, Return>>
type MethodDecorator = <This, Args extends any[], Return>(target: AnyMethod<This, Args, Return>, context: MethodContext<This, Args, Return>) => AnyMethod<This, Args, Return> | void

export const elapsed: MethodDecorator = function(target, context) {
  const methodName = String(context.name)
  let className = ''

  context.addInitializer(function(this: any) {
    const ctor = Object.getPrototypeOf(this)?.constructor
    className = (ctor && ctor.name !== 'Object' && ctor.name !== '')
      ? ctor.name
      : this.constructor?.name || 'Object'
  })

  return function(this: any, ...args: any[]) {
    const start = Date.now()

    const logElapsed = () => {
      log.debug(`audit: ${className}.${methodName}(${args.filter(a => JSON.stringify(a)).join(', ')}) took ${printDuration(Date.now() - start)}`)
    }

    try {
      // @ts-expect-error TS2345 decorator auditing is inherently icky
      const result: any = target.call(this, ...args)

      if (result && typeof result === 'object' && typeof result.then === 'function') {
        return result.finally(logElapsed)
      }

      logElapsed()
      return result
    }
    catch (err) {
      logElapsed()
      throw err
    }
  }
}

export interface ProfilerOptions {
  interval?: number
  entries?: number
  threads?: string[]
  features?: string[]
}

export const profiler = new class Profiler {
  private interval = 10
  private entries = 100_000_000
  private threads = ['GeckoMain']
  private features = [
    'js',
    'privacy',
    'stackwalk',
    'threads',
    'leaf',
    'cpu',
    'memory',
    'gc',
    'cc',
  ]
  private logDir = PathUtils.join(PathUtils.tempDir, 'better-bibtex-profiles')

  private started = 0

  public readonly logs: Record<string, string> = {}

  constructor() {
    this.logDir = (Zotero.Prefs.get('translators.better-bibtex.profileDir') as string | undefined) || this.logDir
  }

  public configure(options: ProfilerOptions) {
    this.interval = options.interval ?? this.interval
    this.entries = options.entries ?? this.entries
    this.threads = options.threads ?? this.threads
    this.features = options.features ?? this.features
  }

  public async start(): Promise<void> {
    if (this.started > 0 || Services.profiler.IsActive()) {
      throw new Error('[Profiler] A profiling session is already active.')
    }

    await Services.profiler.StartProfiler(this.entries, this.interval, this.features, this.threads)

    this.started = Date.now()
  }

  public async stop(label: string): Promise<string> {
    if (this.started === 0) {
      throw new Error('[Profiler] Cannot stop session: Profiler is not active.')
    }

    log.debug('profiler:', label, 'ran for', (Date.now() - this.started) / 1000, 's')

    const profile = await Services.profiler.getProfileDataAsync()
    await Services.profiler.StopProfiler()

    this.started = 0

    await IOUtils.makeDirectory(this.logDir, {
      ignoreExisting: true,
      createAncestors: true,
    })

    const path = PathUtils.join(this.logDir, `${label}-${Date.now()}.json`)
    await IOUtils.writeUTF8(path, JSON.stringify(profile))
    this.logs[label] = path

    return path
  }

  public get active(): boolean {
    return this.started > 0
  }
}

export const timeit = {
  Sync(label: string, block: () => void): void {
    const start = Date.now()
    block()
    this.log(label, start)
  },

  async Async(label: string, block: () => Promise<void>): Promise<void> {
    const start = Date.now()
    await block()
    this.log(label, start)
  },

  log(label: string, start: number): void {
    log.info(`Execution time ${label}: ${((Date.now() - start) / 1000).toFixed(3)} s`)
  },
}
