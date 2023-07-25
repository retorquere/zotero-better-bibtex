export type Actor = 'start' | 'done' | 'auto-export' | 'translators' | 'TeXstudio' | 'abbreviator' | 'keymanager' | 'serializer' | 'cache' | 'maindb' | 'databases'
export type Phase = 'startup' | 'shutdown'
import type { Reason } from './bootstrap'

type Handler = (reason: Reason) => void | string | Promise<void | string>

interface TaskOptions {
  description?: string
  startup?: Handler
  shutdown?: Handler
  needs?: Actor[]
}

export type Task = {
  id: Actor
  description: string
  startup: (reason: Reason) => void | string | Promise<void | string>
  shutdown: (reason: Reason) => void | string | Promise<void | string>
  needs: Actor[]
  needed: boolean
  dependencies?: Record<Phase, Set<Actor>>
}

export type Progress = (phase: string, name: string, done: number, total: number, message?: string) => void

export class Orchestrator {
  public start: Actor = 'start'
  public done: Actor = 'done'

  private tasks: Partial<Record<Actor, Task>> = {}
  private promises: Record<Phase, Partial<Record<Actor, Promise<void>>>> = { startup: {}, shutdown: {} }

  public add(id: Actor, { startup, shutdown, needs, description }: TaskOptions): void {
    if (!startup && !shutdown) throw new Error(`${id}: no-op task`)
    if (this.tasks[id]) throw new Error(`${id} exists`)
    if (id === this.start && needs) throw new Error('start task cannot have dependencies')
    if (id === this.done && needs) throw new Error('done task has dependencies auto-assigned')
    this.tasks[id] = {
      id,
      description: description || id,
      startup,
      shutdown,
      needed: false,
      needs: needs || [],
    }
  }

  private async run(phase: Phase, reason: Reason, progress?: Progress): Promise<void> {
    const total = Object.keys(this.tasks).length
    let ran = 0

    const circular = Promise.reject(new Error('circular dependency'))
    circular.catch(() => { /* ignore */ }) // prevent unhandled rejection

    const run = name => {
      const promise: Promise<void> = this.promises[phase][name]
      if (promise != null) return promise

      let { [phase]: action, description, dependencies: { [phase]: dependencies } } = this.tasks[name]
      if (!action) action = async () => `nothing to do for ${name}.${phase} ${reason || ''}` // eslint-disable-line @typescript-eslint/require-await

      this.promises[phase][name] = circular
      return this.promises[phase][name] = Promise
        .all(Array.from(dependencies).map(run))
        .then(() => { if (phase === 'startup') progress?.(phase, name, ran++, total, `starting ${description}`) })
        .then(() => action(reason) as Promise<void | string>)
        /*
        .then(result => {
          result = result ? `: ${result}` : ''
          progress?.(phase, name, ++ran, total, `${description} started${result}`)
        })
        */
        .catch(err => {
          Zotero.debug(`${name}.${phase} ${reason || ''} error: ${err}`)
          throw err
        })
    }
    await Promise.all(Object.keys(this.tasks).map(run))
  }

  public async startup(reason: Reason, progress?: Progress): Promise<void> {
    if (this.tasks[this.start]) {
      for (const [id, task] of Object.entries(this.tasks)) {
        if (id === this.start) continue
        task.needs = task.needs || []
        task.needs.push(this.start)
      }
    }

    if (this.tasks[this.done]) {
      this.tasks[this.done].needs = (Object.keys(this.tasks) as Actor[]).filter(task => task !== this.done)
    }

    for (const task of Object.values(this.tasks)) {
      task.dependencies = {
        startup: new Set(task.needs || []),
        shutdown: new Set,
      }
      for (const dep of task.dependencies.startup) {
        if (!this.tasks[dep]) throw new Error(`${task.id} relies on non-existent task ${dep}`)
      }
    }

    for (const [id, task] of Object.entries(this.tasks) as [Actor, Task][]) {
      for (const dep of task.dependencies.startup) {
        this.tasks[dep].dependencies.shutdown.add(id)
      }
    }

    await this.run('startup', reason, progress)
    progress?.('startup', 'ready', 100, 100, 'ready')
  }

  public async shutdown(reason: Reason, progress?: Progress): Promise<void> {
    await this.run('shutdown', reason, progress)
  }
}

export const orchestrator = new Orchestrator
