export type Actor = 'start' | 'done' | 'auto-export' | 'translators' | 'TeXstudio' | 'abbreviator' | 'keymanager' | 'serializer' | 'cache' | 'database' | 'sqlite'
export type Phase = 'startup' | 'shutdown'
import type { Reason } from './bootstrap'

type Handler = (reason: Reason) => void | string | Promise<void | string>

import { print } from './logger'

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

  started: number
  finished: number
}

export type Progress = (phase: string, name: string, done: number, total: number, message?: string) => void

export class Orchestrator {
  public start: Actor = 'start'
  public done: Actor = 'done'
  public started: number

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
      started: 0,
      finished: 0,
    }
  }

  private async run(phase: Phase, reason: Reason, progress?: Progress): Promise<void> {
    const total = Object.keys(this.tasks).length

    const finished: Set<string> = new Set
    const running: Set<string> = new Set

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

        .then(async () => {
          if (phase === 'startup') {
            Zotero.debug(`orchestrator progress: starting ${name}, running ${[...running]}`)
            this.tasks[name].started = Date.now()
            running.add(name)
            progress?.(phase, name, finished.size, total, description)
          }

          try {
            return await action(reason) as Promise<void | string>
          }

          catch (err) {
            print(`orchestrator error: ${phase}.${name} failed: ${err}\n${err.stack}`)
            throw err
          }

          finally {
            if (phase === 'startup') {
              this.tasks[name].finished = Date.now()
              finished.add(name)
              running.delete(name)
              Zotero.debug(`orchestrator progress: finished ${name}, running ${[...running]}`)

              progress?.(phase, name, finished.size, total, running.size ? this.tasks[[...running][0]].description : '')
            }
          }
        })

        .catch(err => {
          print(`better-bibtex orchestrator: ${name}.${phase} ${reason || ''} error: ${err}`)
          throw err
        })
    }

    await Promise.all(Object.keys(this.tasks).map(run))
  }

  private gantt() {
    let unsorted = Object.values(this.tasks)
    const sorted: string[] = []
    const tasks: Task[] = []
    while (unsorted.length) {
      unsorted = unsorted.filter(task => {
        if (task.needs.filter(needed => !sorted.includes(needed)).length) {
          return true
        }
        else {
          sorted.push(task.id)
          tasks.push(task)
          return false
        }
      })
    }

    const scale = n => Math.ceil(n/100)

    let g = '@startgantt\n'
    for (const task of tasks) {
      g += `  [${task.id}] lasts ${scale(task.finished - task.started)} days\n`
      for (const needed of task.needs) {
        g += `  [${task.id}] starts at [${needed}]'s end\n`
      }
    }
    g += '@endgantt\n'

    g += '@startgantt\n'
    for (const task of tasks) {
      g += `  [${task.id}] starts D+${scale(task.started - this.started)} and ends D+${scale(task.finished - this.started)}\n`
    }
    g += '@endgantt\n'
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

      task.needs = [...(new Set(task.needs))].sort()
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

    this.started = Date.now()
    await this.run('startup', reason, progress)
    progress?.('startup', 'ready', 100, 100, 'ready')

    Zotero.debug(`orchestrator:\n${this.gantt()}`)
  }

  public async shutdown(reason: Reason, progress?: Progress): Promise<void> {
    await this.run('shutdown', reason, progress)
  }
}

export const orchestrator = new Orchestrator
