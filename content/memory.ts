/* eslint-disable no-restricted-syntax, @typescript-eslint/no-unsafe-return */

const kB = 1024
const MB = kB * kB

const memoryReporterManager = Components.classes['@mozilla.org/memory-reporter-manager;1'].getService(Components.interfaces.nsIMemoryReporterManager)
memoryReporterManager.init()

function minimize(): Promise<void> {
  return new Promise(resolve => {
    memoryReporterManager.minimizeMemoryUsage(() => {
      resolve()
    })
  })
}

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
  #timer: Timer
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
    if (this.#timer) clearInterval(this.#timer)
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

type AnyMethod<This = any, Args extends any[] = any[], Return = any> = (this: This, ...args: Args) => Return
type MethodContext<This = any, Args extends any[] = any[], Return = any> = ClassMethodDecoratorContext<This, AnyMethod<This, Args, Return>>
type MethodDecorator = <This, Args extends any[], Return>(target: AnyMethod<This, Args, Return>, context: MethodContext<This, Args, Return>) => AnyMethod<This, Args, Return> | void

const baseline = memory.resident
export const audit: MethodDecorator = function(target, context) {
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
      const result = target.call(this, ...args)

      if (result && typeof result === 'object' && typeof result.then === 'function') {
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
