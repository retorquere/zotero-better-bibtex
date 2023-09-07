export type Actor = 'start' | 'done' | 'auto-export' | 'translators' | 'TeXstudio' | 'abbreviator' | 'keymanager' | 'serializer' | 'cache' | 'maindb' | 'databases'
export type Phase = 'startup' | 'shutdown'
import type { Reason } from './bootstrap'

type Handler = (reason: Reason) => void | string | Promise<void | string>

/*
type Task = {
  id?: Actor
  description: string
  startup?: (reason: Reason) => void | string | Promise<void | string>
  shutdown?: (reason: Reason) => void | string | Promise<void | string>
  needs?: Actor[]
  needed?: boolean
  dependencies?: Record<Phase, Set<Actor>>
}
*/

interface TaskOptions {
  description?: string
  startup?: Handler
  shutdown?: Handler
  needs?: Actor[]
}
export class Task {
  public startup: Handler
  public shutdown: Handler
  public dependencies : Record<Phase, Set<Actor>>
  public needs: Actor[]
  public needed: boolean
  public description: string

  constructor(public id: Actor, { startup, shutdown, needs, description }: TaskOptions) {
    if (!startup && !shutdown) throw new Error(`${this.id}: no-op task`)
    this.description = description || this.id
    this.needs = needs || []
  }
}

export type Progress = (phase: string, name: string, done: number, total: number, message?: string) => void

export class Orchestrator {
  public start: Actor = 'start'
  public done: Actor = 'done'

  private tasks: Partial<Record<Actor, Task>> = {}
  private promises: Record<Phase, Partial<Record<Actor, Promise<void>>>> = { startup: {}, shutdown: {} }

  public add(task: Task): void {
    if (this.tasks[task.id]) throw new Error(`${task.id} exists`)
    if (task.id === this.start && task.needs.length) throw new Error(`${task.id} task cannot have dependencies`)
    if (task.id === this.done && task.needs.length) throw new Error(`${task.id} task has dependencies auto-assigned`)
    if (task.needs.find(needed => needed === this.done)) throw new Error(`${task.id} cannot require ${this.done}`)
    this.tasks[task.id] = task
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

  private graphviz(phase: Phase) {
    let g = 'digraph G {\n'

    for (const task of Object.values(this.tasks)) {
      for (const dep of task.dependencies[phase]) {
        if (phase === 'startup') {
          g += `  ${JSON.stringify(dep)} -> ${JSON.stringify(task.id)};\n`
        }
        else {
          g += `  ${JSON.stringify(task.id)} -> ${JSON.stringify(dep)};\n`
        }
      }
    }

    g += '}\n'
    return g
  }

  public async startup(reason: Reason, progress?: Progress): Promise<void> {
    const tasks: Task[] = Object.values(this.tasks)
    const has = {
      start: this.tasks[this.start],
      done: this.tasks[this.done],
    }

    for (const task of tasks) {
      if (has.start && task.id !== this.start && !task.needs.length) {
        task.needs.push(this.start)
      }

      for (const needed of task.needs) {
        if (!this.tasks[needed]) throw new Error(`orchestrator: ${task.id} needs non-existent ${needed}`)
        this.tasks[needed].needed = true
      }

      task.dependencies = {
        startup: new Set(task.needs),
        shutdown: new Set,
      }
    }

    if (has.done) {
      has.done.needs = tasks.filter(task => task.id !== this.done && !task.needed).map(task => task.id)

      has.done.dependencies = {
        startup: new Set(has.done.needs),
        shutdown: new Set,
      }
    }

    for (const task of tasks) {
      for (const dep of task.dependencies.startup) {
        this.tasks[dep].dependencies.shutdown.add(task.id)
      }
    }

    Zotero.debug(`orchestrator startup:\n${this.graphviz('startup')}`)
    Zotero.debug(`orchestrator shutdown:\n${this.graphviz('shutdown')}`)

    await this.run('startup', reason, progress)
    progress?.('startup', 'ready', 100, 100, 'ready')
  }

  public async shutdown(reason: Reason, progress?: Progress): Promise<void> {
    await this.run('shutdown', reason, progress)
  }
}

export const orchestrator = new Orchestrator
