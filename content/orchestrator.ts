export type Actor = | 'start' | 'done' | 'auto-export' | 'translators' | 'TeXstudio' | 'abbreviator' | 'keymanager' | 'serializer' | 'cache' | 'sqlite' | 'git-push' | 'citekeysearch'
export type PhaseID = 'startup' | 'shutdown'
import type { Reason } from './bootstrap'
import { log } from './logger'
import { Preference } from './prefs'

import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS

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

    const running = (): string[] => tasks.filter((t: Task) => t.started && !t.finished).map(t => t.id)
    const time = ts => (new Date(ts)).toISOString()
    const line = (name: string, event: string, timestamp: number) => { // eslint-disable-line arrow-body-style
      return `better-bibtex orchestrator: [${name.padEnd(50, ' ')}] ${phase.padEnd(10, ' ')} ${event.padEnd(15, ' ')} at ${time(timestamp)} running [${running()}]`
    }

    const report = (name: string) => {
      const task = taskmap[name]

      for (const timestamp of [...task.milestones.keys()].sort()) {
        print(line(`${this.id}.${name}.${task.milestones.get(timestamp)}`, 'finished', timestamp))
      }
      print(line(`${this.id}.${name}`, task.finished ? 'finished' : 'started', task.finished || task.started))

      progress?.(phase, name, tasks.filter(t => t.finished).length, tasks.length, (task.finished ? running()[0] : task.description) || task.description)
      log.prefix = running().length ? ` ${phase}: [${running()}]` : ''
    }

    const run = name => {
      const promise: Promise<void> = promises[name]
      if (promise != null) return promise

      const task = taskmap[name]
      const { action, needs } = task
      if (!action) {
        promises[name] = Promise.resolve()
        return
      }

      const needed = async () => {
        await Promise.all(needs.map(run))
        // for (const dep of needs) await run(dep)
      }

      const perform = async (): Promise<void | string> => {
        print(`better-bibtex orchestrator: task ${phase}.${name} starting`)
        try {
          const res = await action(reason, task) as Promise<void | string>
          print(`better-bibtex orchestrator: task ${phase}.${name} finished`)
          return res
        }
        catch (err) {
          print(`better-bibtex orchestrator: error: task ${phase}.${name} failed: ${err}\n${err.stack}`)
          throw err
        }
      }

      promises[name] = circular

      return promises[name] = needed()

        .then(async () => {
          task.started = Date.now()
          report(name)

          try {
            return await perform()
          }
          finally {
            task.finished = Date.now()
            report(name)
          }
        })

        .catch(err => {
          print(`better-bibtex better-bibtex orchestrator: ${name}.${phase} ${reason || ''} error: ${err}`)
          throw err
        })
    }

    await Promise.all(Object.keys(taskmap).map(run))
  }

  private gantt(phase: PhaseID) {
    const taskmap = this.phase[phase].tasks
    let unsorted = Object.values(taskmap)
    const sorted: string[] = []
    const tasks: (Task & { taskid: number })[] = []
    while (unsorted.length) {
      unsorted = unsorted.filter(task => {
        if (task.needs.filter(needed => !sorted.includes(needed)).length) {
          return true
        }
        else {
          sorted.push(task.id)
          tasks.push({...task, taskid: tasks.length})
          return false
        }
      })
    }

    const today = new Date().toISOString().slice(0, 10)
    let gantt = `<?xml version="1.0" encoding="UTF-8"?>
      <project
        name="Better BibTeX ${phase}"
        company=""
        webLink="https://"
        view-date="${today}"
        view-index="0"
        gantt-divider-location="614"
        resource-divider-location="300"
        version="3.3.3295"
        locale="en_GB"
      >
        <description/>
        <view zooming-state="default:7" id="gantt-chart">
          <field id="tpd3" name="Name" width="140" order="0"/>
          <field id="tpc0" name="Runtime" width="58" order="2"/>
        </view>
        <calendars>
          <day-types>
            <day-type id="0"/>
            <day-type id="1"/>
            <default-week id="1" name="default" sun="0" mon="0" tue="0" wed="0" thu="0" fri="0" sat="0"/>
            <days/>
          </day-types>
        </calendars>
        <tasks empty-milestones="true">
          <taskproperties>
            <taskproperty id="tpd0" name="type" type="default" valuetype="icon"/>
            <taskproperty id="tpd1" name="priority" type="default" valuetype="icon"/>
            <taskproperty id="tpd2" name="info" type="default" valuetype="icon"/>
            <taskproperty id="tpd3" name="name" type="default" valuetype="text"/>
            <taskproperty id="tpd4" name="begindate" type="default" valuetype="date"/>
            <taskproperty id="tpd5" name="enddate" type="default" valuetype="date"/>
            <taskproperty id="tpd6" name="duration" type="default" valuetype="int"/>
            <taskproperty id="tpd7" name="completion" type="default" valuetype="int"/>
            <taskproperty id="tpd8" name="coordinator" type="default" valuetype="text"/>
            <taskproperty id="tpd9" name="predecessorsr" type="default" valuetype="text"/>
            <taskproperty id="tpc0" name="Runtime" type="custom" valuetype="double"/>
          </taskproperties>
    `
    for (const task of tasks) {
      gantt += `
          <task
            id="${task.taskid}"
            uid="${task.id}${Math.random()}"
            name="${task.id}" meeting="false"
            ${task.needs.length ? '' : `start="${today}"`}
            duration="${Math.ceil((task.finished - task.started)/100)}"
            complete="0"
            expand="true"
          >`
      for (const dependent of tasks.filter(t => t.needs.includes(task.id))) {
        gantt += `
            <depend id="${dependent.taskid}" type="2" difference="0" hardness="Strong"/>
        `
      }
      gantt += `
            <customproperty taskproperty-id="tpc0" value="${((task.finished - task.started)/1000).toFixed(2)}"/>
          </task>
      `
    }
    gantt += `
        </tasks>
        <resources/>
        <allocations/>
        <vacations/>
        <previous/>
        <roles roleset-name="Default"/>
        <roles roleset-name="SoftwareDevelopment"/>
      </project>
    `

    Zotero.File.putContents(Zotero.File.pathToFile($OS.Path.join(Zotero.BetterBibTeX.dir, `${phase}.gan`)), gantt)
  }

  public async startup(reason: Reason, progress?: Progress): Promise<void> {
    this.resolve()
    await this.run('startup', reason, progress)
    progress?.('startup', 'ready', 100, 100, 'ready')

    if (Preference.testing) this.gantt('startup')
  }

  public async shutdown(reason: Reason): Promise<void> {
    if (!this.resolved) throw new Error('orchestrator: shutdown before startup')
    await this.run('shutdown', reason)

    if (Preference.testing) this.gantt('shutdown')
  }
}

export const orchestrator = new Orchestrator
