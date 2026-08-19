export type Actor = 'worker' | 'start' | 'done' | 'auto-export' | 'translators' | 'TeXstudio' | 'abbreviator' | 'keymanager' | 'cache' | 'git-push' | 'citekeysearch' | 'cayw' | 'json-rpc' | 'pull-export'
export type PhaseID = 'startup' | 'shutdown'
import type { Reason } from './bootstrap'
import { log } from './logger'
type Handler = (reason: Reason, task?: Task) => void | string | Promise<void | string>

interface Task {
  id: Actor
  description?: string
  startup?: Handler
  shutdown?: Handler
  needs?: Actor[]
  started?: number
  finished?: number
}

export type Progress = (phase: string, name: string, done: number, total: number, message?: string) => void

export class Orchestrator {
  public id: string = Zotero.Utilities.generateObjectKey()
  public running!: Actor
  public start: Actor = 'start'
  public done: Actor = 'done'
  private tasks: Partial<Record<Actor, Task>> = {}
  private $ordered!: Task[]

  public add({ description, id, startup, shutdown, needs }: Task): void {
    if (this.$ordered) throw new Error(`orchestrator: add ${ id } after ordered`)

    needs = needs || []
    if (!startup && !shutdown) throw new Error(`orchestrator: ${ id }: no-op task`)
    if (this.tasks[id]) throw new Error(`orchestrator: ${ id } exists`)
    switch (id) {
      case 'start':
      case 'done':
        if (needs.length) throw new Error(`${ id } task cannot have dependencies`)
        break
      default:
        if (!needs.length) needs = ['start']
        break
    }

    this.tasks[id] = {
      id,
      description: description || id,
      startup,
      shutdown,
      needs,
    }
  }

  public get ordered(): Task[] {
    if (!this.$ordered) {
      if (this.tasks.done) this.tasks.done.needs = (Object.keys(this.tasks) as Actor[]).filter(id => id !== 'done')

      const tasks: Task[] = Object.values(this.tasks)

      const dependents: Record<string, string[]> = {}
      const needs: Record<string, Set<Actor>> = {}
      let edges = 0
      for (const task of tasks) {
        needs[task.id] = new Set(task.needs)
        edges += task.needs!.length
        if (!dependents[task.id]) dependents[task.id] = []

        for (const parent of task.needs!) {
          if (!this.tasks[parent]) throw new Error(`orchestrator: ${ task.id } needs non-existent task ${ parent }`)
          if (!dependents[parent]) dependents[parent] = []
          dependents[parent].push(task.id)
        }
      }

      const sources = tasks.filter(task => task.id !== 'done' && !task.needs!.length)
      this.$ordered = []

      while (sources.length) {
        const task = sources.shift()!
        this.$ordered.push(task)

        for (const dependent of dependents[task.id]) {
          needs[dependent].delete(task.id)
          edges--
          if (!needs[dependent].size) sources.push(this.tasks[dependent])
        }
      }
      if (edges) {
        const actors = [...new Set(Object.values(needs).flatMap(n => [...n]))].join(',')
        throw new Error(`orchestrator: cyclic dependency involving ${actors}`)
      }
    }

    return [...this.$ordered]
  }

  private async run(phase: PhaseID, reason: Reason, progress?: Progress): Promise<void> {
    const duration = (dur: number) => (new Date(dur)).toISOString().split('T')[1].replace(/Z/, '')

    const tasks: Task[] = this.ordered.filter(task => task[phase])
    if (phase === 'shutdown') tasks.reverse()

    const total = tasks.length

    const runtime = {
      zotero: 0,
      bbt: 0,
    }
    const finished: number[] = []
    log.info(`${ phase } orchestrator started: ${ reason }`)
    const action = phase === 'startup' ? 'starting' : 'shutting down'
    while (tasks.length) {
      const task = tasks.shift()!

      log.prefix = ` ${ phase }: [${ task.id }`
      if (tasks.length) log.prefix += `+${ tasks.length }`
      log.prefix += ']'

      progress?.(phase, task.id, finished.length, total, task.description)

      log.info(`orchestrator: ${ action } ${ task.id } [${ task.description }]`)

      task.started = Date.now()
      try {
        await task[phase]!(reason, task)
      }
      catch (err) {
        log.error(phase, task.id, 'failed:', err, `${err}`)
        if (phase === 'startup') throw err
      }
      task.finished = Date.now()

      log.info(`orchestrator: ${ task.id } took ${ duration(task.finished - task.started) }`)
      finished.unshift(task.finished)
      runtime[task.id === 'start' ? 'zotero' : 'bbt'] += task.finished - task.started

      progress?.(phase, task.id, finished.length, total, tasks.length ? tasks.map(t => t.id).join(',') : 'finished')
    }

    log.prefix = ''
    const waiting = phase === 'startup' ? ` after waiting ${ duration(runtime.zotero) } for zotero` : ''
    log.info(`orchestrator: ${ action } took ${ duration(runtime.bbt) }${ waiting }`)
  }

  public async startup(reason: Reason, progress?: Progress): Promise<void> {
    await this.run('startup', reason, progress)
    progress?.('startup', 'ready', 100, 100, 'ready')
  }

  public async shutdown(reason: Reason): Promise<void> {
    await this.run('shutdown', reason)
  }
}

export const orchestrator = new Orchestrator
