export type Actor = | 'start' | 'done' | 'auto-export' | 'translators' | 'TeXstudio' | 'abbreviator' | 'keymanager' | 'cache' | 'sqlite' | 'git-push' | 'citekeysearch' | 'cayw' | 'json-rpc' | 'pull-export'
export type PhaseID = 'startup' | 'shutdown'
import type { Reason } from './bootstrap'
import { log } from './logger'
import { Preference } from './prefs'

import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS

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
  public running: Actor
  public start: Actor = 'start'
  public done: Actor = 'done'
  private tasks: Partial<Record<Actor, Task>> = {}
  private $ordered: Task[]

  public add({ description, id, startup, shutdown, needs }: Task): void {
    if (this.$ordered) throw new Error(`orchestrator: add ${ id } after ordered`)

    needs = needs || []
    if (!startup && !shutdown) throw new Error(`orchestrator: ${ id }: no-op task`)
    if (this.tasks[id]) throw new Error(`orchestrator: ${ id } exists`)
    switch (id) {
      case this.start:
      case this.done:
        if (needs.length) throw new Error(`${ id } task cannot have dependencies`)
        break
      default:
        if (!needs.length) needs = [this.start]
        break
    }

    this.tasks[id] = {
      id,
      description: description || id,
      startup,
      shutdown,
      needs: needs || [],
    }
  }

  public get ordered(): Task[] {
    if (!this.$ordered) {
      if (this.tasks[this.done]) this.tasks[this.done].needs = (Object.keys(this.tasks) as Actor[]).filter(id => id !== this.done)

      const tasks: Task[] = Object.values(this.tasks)

      const dependents: Record<string, string[]> = {}
      const needs: Record<string, Set<Actor>> = {}
      let edges = 0
      for (const task of tasks) {
        needs[task.id] = new Set(task.needs)
        edges += task.needs.length
        if (!dependents[task.id]) dependents[task.id] = []

        for (const parent of task.needs) {
          if (!this.tasks[parent]) throw new Error(`orchestrator: ${ task.id } needs non-existent task ${ parent }`)
          if (!dependents[parent]) dependents[parent] = []
          dependents[parent].push(task.id)
        }
      }

      const sources = tasks.filter(task => task.id !== this.done && !task.needs.length)
      this.$ordered = []

      while (sources.length) {
        const task = sources.shift()
        this.$ordered.push(task)

        for (const dependent of dependents[task.id]) {
          needs[dependent].delete(task.id)
          edges--
          if (!needs[dependent].size) sources.push(this.tasks[dependent])
        }
      }
      if (edges) throw new Error(`orchestrator: cyclic dependency involving ${ [...(new Set([].concat(...(Object.values(needs).map(n => [...n])))))].join(',') }`)
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
    while (tasks.length) {
      const task = tasks.shift()

      log.prefix = ` ${ phase }: [${ task.id }`
      if (tasks.length) log.prefix += `+${ tasks.length }`
      log.prefix += ']'

      progress?.(phase, task.id, finished.length, total, task.description)

      log.info(`orchestrator: starting ${ task.id } [${ task.description }]`)

      task.started = Date.now()
      await task[phase](reason, task)
      task.finished = Date.now()

      log.info(`orchestrator: ${ task.id } took ${ duration(task.finished - task.started) }`)
      finished.unshift(task.finished)
      runtime[task.id === 'start' ? 'zotero' : 'bbt'] += task.finished - task.started

      progress?.(phase, task.id, finished.length, total, tasks.length ? tasks.map(t => t.id).join(',') : 'finished')
    }

    log.prefix = ''
    log.info(`orchestrator: startup took ${ duration(runtime.bbt) } after waiting ${ duration(runtime.zotero) } for zotero`)
  }

  private gantt(phase: PhaseID) {
    const tasks: (Task & { taskid: number })[] = this.ordered.map((task: Task, taskid: number) => ({ ...task, taskid }))

    const today = (new Date).toISOString().slice(0, 10)
    let gantt = `<?xml version="1.0" encoding="UTF-8"?>
      <project
        name="Better BibTeX ${ phase }"
        company=""
        webLink="https://"
        view-date="${ today }"
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
            id="${ task.taskid }"
            uid="${ task.id }${ Math.random() }"
            name="${ task.id }" meeting="false"
            ${ task.needs.length ? '' : `start="${ today }"` }
            duration="${ Math.ceil((task.finished - task.started) / 100) }"
            complete="0"
            expand="true"
          >`
      for (const dependent of tasks.filter(t => t.needs.includes(task.id))) {
        gantt += `
            <depend id="${ dependent.taskid }" type="2" difference="0" hardness="Strong"/>
        `
      }
      gantt += `
            <customproperty taskproperty-id="tpc0" value="${ ((task.finished - task.started) / 1000).toFixed(2) }"/>
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

    Zotero.File.putContents(Zotero.File.pathToFile($OS.Path.join(Zotero.BetterBibTeX.dir, `${ phase }.gan`)), gantt)
  }

  public async startup(reason: Reason, progress?: Progress): Promise<void> {
    await this.run('startup', reason, progress)
    progress?.('startup', 'ready', 100, 100, 'ready')

    if (Preference.testing) this.gantt('startup')
  }

  public async shutdown(reason: Reason): Promise<void> {
    await this.run('shutdown', reason)

    if (Preference.testing) this.gantt('shutdown')
  }
}

export const orchestrator = new Orchestrator
