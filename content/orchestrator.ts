export type Actor = | 'start' | 'done' | 'auto-export' | 'translators' | 'TeXstudio' | 'abbreviator' | 'keymanager' | 'serializer' | 'cache' | 'database' | 'sqlite'
export type PhaseID = 'startup' | 'shutdown'
import type { Reason } from './bootstrap'
import { log } from './logger'

type Handler = (reason: Reason, task?: Task) => void | string | Promise<void | string>

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
  action: Handler
  needs: Actor[]
  needed: boolean

  started: number
  finished: number
  milestones: Map<number, string>
}

export type Progress = (phase: string, name: string, done: number, total: number, message?: string) => void

type Phase = {
  started: number
  promises: Partial<Record<Actor, Promise<void>>>
  tasks: Partial<Record<Actor, Task>>
}

export class Orchestrator {
  public id: string = Zotero.Utilities.generateObjectKey()
  public started: number = Date.now()
  public start: Actor = 'start'
  public done: Actor = 'done'
  private resolved = false

  private phase: Record<PhaseID, Phase> = {
    startup: {
      started: 0,
      promises: {},
      tasks: {},
    },
    shutdown: {
      started: 0,
      promises: {},
      tasks: {},
    },
  }

  public add(id: Actor, { startup, shutdown, needs, description }: TaskOptions): void {
    if (!startup && !shutdown) throw new Error(`${id}: no-op task`)
    if (this.phase.startup.tasks[id]) throw new Error(`${id} exists`)
    if (id === this.start && needs) throw new Error('start task cannot have dependencies')
    if (id === this.done && needs) throw new Error('done task has dependencies auto-assigned')

    this.phase.startup.tasks[id] = {
      id,
      description: description || id,
      action: startup,
      needs: needs || [],
      needed: false,
      started: 0,
      finished: 0,
      milestones: new Map,
    }

    this.phase.shutdown.tasks[id] = {
      ...this.phase.startup.tasks[id],
      action: shutdown,
      needs: [],
      milestones: new Map,
    }
  }

  private resolve() {
    if (this.resolved) throw new Error('orchestrator: resolve ran twice')
    this.resolved = true

    const tasks: Task[] = Object.values(this.phase.startup.tasks)

    const has = {
      start: this.phase.startup.tasks[this.start],
      done: this.phase.startup.tasks[this.done],
    }

    for (const task of tasks) {
      if (has.start && task.id !== this.start && !task.needs.length) {
        task.needs.push(this.start)
      }

      for (const needed of task.needs) {
        if (!this.phase.startup.tasks[needed]) throw new Error(`orchestrator: ${task.id} needs non-existent ${needed}`)
        this.phase.startup.tasks[needed].needed = true
      }

      task.needs = [...(new Set(task.needs))].sort()
    }

    if (has.done) {
      has.done.needs = tasks.filter(task => task.id !== this.done && !task.needed).map(task => task.id)
      has.done.needs = [...(new Set(has.done.needs))].sort()
    }

    for (const task of tasks) {
      for (const needed of task.needs) {
        const shutdown = this.phase.shutdown.tasks[needed]
        shutdown.needs.push(task.id)
        shutdown.needs = [...(new Set(shutdown.needs))].sort()
      }
    }

    for (const task of Object.values(this.phase.shutdown.tasks)) {
      for (const needed of task.needs) {
        this.phase.shutdown.tasks[needed].needed = true
      }
    }
  }

  private async run(phase: PhaseID, reason: Reason, progress?: Progress): Promise<void> {
    if (this.phase[phase].started) throw new Error(`orchestrator: re-run of ${phase}`)
    this.phase[phase].started = Date.now()
    const taskmap: Partial<Record<Actor, Task>> = this.phase[phase].tasks
    const tasks: Task[] = Object.values(taskmap)
    const promises = this.phase[phase].promises

    const circular = Promise.reject(new Error('circular dependency'))
    circular.catch(() => { /* ignore */ }) // prevent unhandled rejection

    const time = ts => (new Date(ts)).toISOString()

    const report = (name: string) => {
      const task = taskmap[name]
      const running: string[] = tasks.filter((t: Task) => t.started && !t.finished).map(t => t.id)

      const runname = `[${this.id}.${name}]`.padEnd(30, ' ') // eslint-disable-line no-magic-numbers
      const mark = (task.finished ? ' finished at ' : ' started at ').padEnd(15, ' ') // eslint-disable-line no-magic-numbers
      // eslint-disable-next-line no-magic-numbers
      print(`orchestrator: ${runname} ${phase.padEnd(10, ' ')} ${mark}${time(task.finished || task.started)} running [${running}]`)

      if (phase === 'startup') progress?.(phase, name, tasks.filter(t => t.finished).length, tasks.length, task.description)
      log.prefix = running.length ? ` ${phase}: [${running}]` : ''
    }

    const run = name => {
      const promise: Promise<void> = promises[name]
      if (promise != null) return promise

      const task = taskmap[name]
      let { action, needs } = task
      if (!action) action = async () => `nothing to do for ${name}.${phase} ${reason || ''}` // eslint-disable-line @typescript-eslint/require-await

      const needed = async () => {
        await Promise.all(needs.map(run))
        // for (const dep of needs) await run(dep)
      }

      promises[name] = circular

      return promises[name] = needed()

        .then(async () => {
          task.started = Date.now()
          report(name)

          try {
            return await action(reason, task) as Promise<void | string>
          }

          catch (err) {
            print(`orchestrator error: ${phase}.${name} failed: ${err}\n${err.stack}`)
            throw err
          }

          finally {
            task.finished = Date.now()
            report(name)
          }
        })

        .catch(err => {
          print(`better-bibtex orchestrator: ${name}.${phase} ${reason || ''} error: ${err}`)
          throw err
        })
    }

    await Promise.all(Object.keys(taskmap).map(run))
  }

  private gantt(phase: PhaseID) {
    // const start = phase === 'startup' ? this.started : this.phase.shutdown.started
    const taskmap = this.phase[phase].tasks
    let unsorted = Object.values(taskmap)
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
    // const url = g => `http://plantuml.com/plantuml/uml/~h${Array.from(g).map((c: string) => c.charCodeAt(0).toString(16)).join('')}\n` // eslint-disable-line no-magic-numbers

    let g = '@startgantt\n'
    g += `  header ${phase}\n\n`
    for (const task of tasks) {
      for (const needed of task.needs) {
        g += `  [${task.id}] starts at [${needed}]'s end\n`
      }
      g += `  [${task.id}] lasts ${scale(task.finished - task.started)} days\n`
      let last = { milestone: '', ended: task.started }
      for (const timestamp of [...task.milestones.keys()].sort()) {
        const milestone = `${task.id}:${task.milestones.get(timestamp)}`
        g += `    [${milestone}] starts at [${last.milestone || task.id}]'s ${last.milestone ? 'end' : 'start'} and lasts ${scale(timestamp - last.ended)} days\n`
        g += `    [${milestone}] is colored in Fuchsia/FireBrick\n`
        last = { milestone, ended: timestamp }
      }
      g += '\n'
    }
    g += '@endgantt\n'
    // g += url(g)
    const g1 = g

    /*
    g = '@startgantt\n'
    g += `  header ${phase}\n\n`
    for (const task of tasks) {
      g += `  [${task.id}] starts D+${scale(task.started - start)} and ends D+${scale(task.finished - start)}\n`
      for (const milestone of [...task.milestones.keys()].sort()) {
        g += `  [${task.id}:${task.milestones.get(milestone)}] happens on D+${scale(milestone - task.started)}\n`
      }
      g += '\n'
    }
    g += '@endgantt\n'
    // g += url(g)
    const g2 = g
    */

    return g1
  }

  public async startup(reason: Reason, progress?: Progress): Promise<void> {
    this.resolve()
    await this.run('startup', reason, progress)
    progress?.('startup', 'ready', 100, 100, 'ready')

    Zotero.debug(`orchestrator:\n${this.gantt('startup')}`)
  }

  public async shutdown(reason: Reason): Promise<void> {
    if (!this.resolved) throw new Error('orchestrator: shutdown before startup')
    await this.run('shutdown', reason)
    Zotero.debug(`orchestrator:\n${this.gantt('shutdown')}`)
  }
}

export const orchestrator = new Orchestrator
