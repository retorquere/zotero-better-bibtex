Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

import { log } from './logger/simple'

import { Shim } from './os'
import { is7, platform } from './client'
const $OS = is7 ? Shim : OS

import { Cache } from './db/cache'
import { Events } from './events'
import { Translators, ExportJob } from './translators'
import { Preference } from './prefs'
import { Preferences, autoExport, affectedBy, PreferenceName } from '../gen/preferences/meta'
import { byId } from '../gen/translators'
import * as ini from 'ini'
import fold2ascii from 'fold-to-ascii'
import { findBinary } from './path-search'
import { Scheduler } from './scheduler'
import { flash } from './flash'
import * as l10n from './l10n'
import { orchestrator } from './orchestrator'
import { pick, fromPairs } from './object'

const NoParse = { noParseParams: true }

const cmdMeta = /(["^&|<>()%!])/
const cmdMetaOrSpace = /[\s"^&|<>()%!]/
const cmdMetaInsideQuotes = /(["%!])/

function win_quote(s: string, forCmd = true): string {
  if (!s) return '""'
  if (!cmdMetaOrSpace.test(s)) return s

  if (forCmd && cmdMeta.test(s)) {
    if (!cmdMetaInsideQuotes.test(s)) {
      const m = s.match(/\\+$/)
      return m ? `"${ s }${ m[0] }"` : `"${ s }"`
    }
    if (/[\\"]/.test(s)) s = win_quote(s, false)
    return s.replace(cmdMeta, '^$1')
  }

  const parts = []
  parts.push('"')
  for (const match of s.matchAll(/(\\*)(["+])|(\\+)|([^\\"]+)/g)) {
    const [ , slashes, quotes, onlySlashes, text ] = match
    if (quotes) {
      parts.push(slashes)
      parts.push(slashes)
      parts.push('\\"'.repeat(quotes.length))
    }
    else if (onlySlashes) {
      parts.push(onlySlashes)
      if (match.index === s.length) parts.push(onlySlashes)
    }
    else {
      parts.push(text)
    }
  }
  parts.push('"')
  return parts.join('')
}

const posix_quote = require('shell-quote/quote')

function quote(cmd: string[]): string {
  return platform.name === 'win' ? cmd.map(s => win_quote(s)).join(' ') : <string>posix_quote(cmd)
}

export const SQL = new class {
  public columns: { job: JobSetting[]; editable: JobSetting[] } = {
    job: [ 'type', 'id', 'translatorID', 'path' ],
    editable: [ 'enabled', 'recursive', 'status', 'error', 'updated' ],
  }

  public sql = {
    delete: 'DELETE FROM betterbibtex.autoexport WHERE path = :path',
    create: 'REPLACE INTO betterbibtex.autoexport',
    setting: 'REPLACE INTO betterbibtex.autoexport_setting (path, setting, value) VALUES (:path, :setting, :value)',
  }

  constructor() {
    this.columns.job = this.columns.job.concat(this.columns.editable)
    this.sql.create += ` (${ this.columns.job.join(',') }) VALUES (${ this.columns.job.map(col => `:${ col }`) })`
  }

  public async get(path: string): Promise<Job> {
    const job: Partial<Job> = {}

    if (typeof path !== 'string') throw new Error(`ae:sql:get: ${ path } is not a string but a ${ typeof path }`)

    for (const meta of await Zotero.DB.queryAsync('SELECT * FROM betterbibtex.autoexport WHERE path = ?', [path])) {
      Object.assign(job, pick(meta, this.columns.job))
    }

    const settings = autoExport[job.translatorID]
    const displayOptions = { ...(byId[job.translatorID]?.displayOptions || {}) }
    Object.assign(job, pick(Preference, settings.preferences))
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Object.assign(job, fromPairs(settings.options.map((option: PreferenceName) => [ option, job[option] ?? displayOptions[option] ?? false ])))

    for (const { setting, value } of await Zotero.DB.queryAsync('SELECT setting, value FROM betterbibtex.autoexport_setting WHERE PATH = ?', [path])) {
      job[setting] = value
    }

    return job as Job
  }

  public async edit(path: string, setting: JobSetting, value: boolean | number | string): Promise<void> {
    if (typeof value === 'boolean') value = value ? 1 : 0
    if (this.columns.editable.includes(setting)) {
      await Zotero.DB.queryTx(`UPDATE betterbibtex.autoexport SET ${ setting } = ? WHERE path = ?`, [ value, path ])
    }
    else {
      await Zotero.DB.queryTx(this.sql.setting, { setting, path, value }, NoParse)
    }
    queue.add(path)
  }

  public async create(job: Job) {
    await Zotero.DB.executeTransaction(async () => {
      await this.store(job)
    })
  }

  public async store(job: Job) {
    job.error = job.error || ''
    job.recursive = job.recursive ?? false
    job.updated = job.updated || Date.now()
    job.enabled = true

    for (const [ k, v ] of Object.entries(job)) {
      if (typeof v === 'boolean') job[k] = v ? 1 : 0
    }

    await Zotero.DB.queryAsync(this.sql.delete, { path: job.path }, NoParse)
    await Zotero.DB.queryAsync(this.sql.create, pick(job, this.columns.job), NoParse)

    const settings = autoExport[job.translatorID]
    const displayOptions = byId[job.translatorID]?.displayOptions || {}

    const preferences = settings.preferences.map(setting => ({ path: job.path, setting, value: job[setting] ?? Preference[setting] }))
    const options = settings.options.map(setting => ({ path: job.path, setting, value: job[setting] ?? displayOptions[setting] ?? false }))

    // await Promise.all(options.concat(preferences).map(setting => ZoteroDB.queryAsync(this.sql.setting, setting, NoParse) as Promise<void>))
    for (const setting of options.concat(preferences)) {
      await Zotero.DB.queryAsync(this.sql.setting, setting, NoParse)
    }
  }

  public async delete(path: string): Promise<void> {
    await Zotero.DB.queryTx('DELETE FROM betterbibtex.autoexport WHERE path = ?', [path])
  }

  public async find(type: string, ids: number[]): Promise<string[]> {
    if (!ids.length) return []
    const select = `SELECT path FROM betterbibtex.autoexport WHERE type = ? AND id IN (${ this.paramSet(ids) }) ORDER BY path`
    return (await Zotero.DB.columnQueryAsync(select, [ type, ...ids ])) as string[]
  }

  public paramSet(arr: any[]): string {
    return Array(arr.length).fill('?').join(',')
  }
}

class Git {
  public enabled: boolean
  public path: string
  public bib: string
  private root: Record<string, string>

  private git: string

  constructor(parent?: Git) {
    this.enabled = false

    if (parent) {
      this.git = parent.git
    }
  }

  public async init() {
    this.git = await findBinary('git')
    this.root = {}

    return this
  }

  public async repo(bib: string): Promise<Git> {
    const repo = new Git(this)

    if (!this.git) return repo

    let config: string = null

    const disabled = () => {
      this.root[bib] = ''
      return repo
    }

    switch (Preference.git) {
      case 'off':
        return repo

      case 'always':
        try {
          repo.path = $OS.Path.dirname(bib)
        }
        catch (err) {
          log.error('git.repo:', err)
          return repo
        }
        break

      case 'config':
        if (typeof this.root[bib] === 'undefined') {
          for (let root = $OS.Path.dirname(bib); root && (await $OS.File.exists(root)) && (await $OS.File.stat(root)).isDir && root !== $OS.Path.dirname(root); root = $OS.Path.dirname(root)) {
            const gitdir = $OS.Path.join(root, '.git')
            if ((await $OS.File.exists(gitdir)) && (await $OS.File.stat(gitdir)).isDir) {
              this.root[bib] = root
              break
            }
          }
        }
        if (!this.root[bib]) return disabled()
        repo.path = this.root[bib]

        config = $OS.Path.join(repo.path, '.git', 'config')
        if (!(await $OS.File.exists(config)) || (await $OS.File.stat(config)).isDir) return disabled()

        try {
          const enabled = ini.parse(Zotero.File.getContents(config))['zotero "betterbibtex"']?.push
          if (enabled !== 'true' && enabled !== true) return disabled()
        }
        catch (err) {
          log.error(`git.repo: error parsing config "${config}" (${err.message})`, err)
          return disabled()
        }
        break

      default:
        log.error(`git.repo: unexpected git config ${Preference.git}`)
        return disabled()
    }

    const sep = Zotero.isWin ? '\\' : '/'
    if (bib[repo.path.length] !== sep) throw new Error(`git.repo: ${ bib } not in directory ${ repo.path } (${ bib[repo.path.length] } vs ${ sep })?!`)

    repo.enabled = true
    repo.bib = bib.substring(repo.path.length + 1)

    return repo
  }

  public async pull() {
    if (!this.enabled) return

    try {
      await this.exec(this.git, [ '-C', this.path, 'checkout', this.bib ])
      await this.exec(this.git, [ '-C', this.path, 'pull' ])
      // fixes #2356
      await Zotero.Promise.delay(2000)
      await this.exec(this.git, [ '-C', this.path, 'pull' ])
    }
    catch (err) {
      flash('autoexport git pull failed', err.message, 1)
      log.error(`could not pull in ${ this.path }: ${err.message}`, err)
    }
  }

  public async push(msg) {
    if (!this.enabled) return

    try {
      await this.exec(this.git, [ '-C', this.path, 'add', this.bib ])
      await this.exec(this.git, [ '-C', this.path, 'commit', '-m', msg ])
      await this.exec(this.git, [ '-C', this.path, 'push' ])
    }
    catch (err) {
      flash('autoexport git push failed', err.message, 1)
      log.error(`could not push ${ this.bib } in ${ this.path }`, err.message)
    }
  }

  private async exec(exe: string, args?: string[]): Promise<boolean> { // eslint-disable-line @typescript-eslint/require-await
    // args = ['/K', exe].concat(args || [])
    // exe = await findBinary('CMD')

    args = args || []
    const command = quote([ exe, ...args ])

    const cmd = new FileUtils.File(exe)
    if (!cmd.isExecutable()) throw new Error(`${ cmd.path } is not an executable`)

    const proc = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess)
    proc.init(cmd)
    proc.startHidden = !Zotero.Prefs.get('extensions.zotero.translators.better-bibtex.path.git.show')
    const deferred = Zotero.Promise.defer()
    proc.runwAsync(args, args.length, {
      observe: (subject, topic) => {
        if (topic !== 'process-finished') {
          deferred.reject(new Error(`[ ${ command } ] failed: ${ topic }`))
        }
        else if (proc.exitValue > 0) {
          deferred.reject(new Error(`[ ${ command } ] failed with exit status: ${ proc.exitValue }`))
        }
        else {
          deferred.resolve(true)
        }
      },
    })

    return deferred.promise as Promise<boolean>
  }
}
const git = (new Git)

if (Preference.autoExportDelay < 1) Preference.autoExportDelay = 1
if (Preference.autoExportIdleWait < 1) Preference.autoExportIdleWait = 1
const queue = new class TaskQueue {
  private scheduler = new Scheduler<string>('autoExportDelay', 1000)
  private held: Set<string>

  constructor() {
    this.pause('startup')
    this.holdDuringSync()
  }

  public pause(_reason: 'startup' | 'end-of-idle' | 'preference-change') {
    this.scheduler.paused = true
  }

  public resume(_reason: 'startup' | 'start-of-idle' | 'preference-change') {
    this.scheduler.paused = false
  }

  public add(path: string) {
    this.cancel(path)
    if (this.held) {
      this.held.add(path)
    }
    else {
      this.scheduler.schedule(path, this.run.bind(this, path))
    }
  }

  public holdDuringSync() {
    if (Events.syncInProgress && !this.held) this.held = new Set
  }

  public releaseAfterSync() {
    if (this.held) {
      const held = this.held
      this.held = null
      for (const path of [...held]) {
        this.add(path)
      }
    }
  }

  public cancel(path: string) {
    this.scheduler.cancel(path)
  }

  public run(path: string) {
    this.runAsync(path).catch(err => log.error(`autoexport failed: ${ path }`, err))
  }

  private async runAsync(path: string) {
    await Zotero.BetterBibTeX.ready

    const ae = await AutoExport.get(path)
    if (!ae) throw new Error(`AutoExport for ${ JSON.stringify(path) } does not exist`)

    const translator = Translators.byId[ae.translatorID]
    void Events.emit('export-progress', { pct: 0, message: `Starting ${ translator.label }`, ae: path })

    await Zotero.DB.queryTx('UPDATE betterbibtex.autoexport SET status = \'running\' WHERE path = ?', [path])

    try {
      let scope
      switch (ae.type) {
        case 'collection':
          scope = { type: 'collection', collection: ae.id }
          break
        case 'library':
          scope = { type: 'library', id: ae.id }
          break
        default:
          throw new Error(`Unexpected auto-export scope ${ ae.type }`)
      }

      const repo = await git.repo(path)
      await repo.pull()
      const displayOptions: any = {
        exportNotes: ae.exportNotes,
        useJournalAbbreviation: ae.useJournalAbbreviation,
        biblatexAPA: ae.biblatexAPA || false,
        biblatexChicago: ae.biblatexChicago || false,
      }

      const jobs: ExportJob[] = [{
        translatorID: ae.translatorID,
        autoExport: path,
        displayOptions,
        scope,
        path,
        preferences: affectedBy[translator.label].reduce((acc: any, k: string): any => {
          if (k in ae && ae[k] !== null) acc[k] = ae[k]
          return acc
        }, {} as any) as Partial<Preferences>,
      }]

      if (ae.recursive) {
        const collections = scope.type === 'library' ? Zotero.Collections.getByLibrary(scope.id, true) : Zotero.Collections.getByParent(scope.collection, true)
        const ext = `.${ translator.target }`

        const root = scope.type === 'collection' ? scope.collection : false

        const dir = $OS.Path.dirname(ae.path)
        const base = $OS.Path.basename(ae.path).replace(new RegExp(`${ ext.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') }$`), '')

        const autoExportPathReplace = {
          diacritics: Preference.autoExportPathReplaceDiacritics,
          dirSep: Preference.autoExportPathReplaceDirSep,
          space: Preference.autoExportPathReplaceSpace,
        }

        for (const collection of collections) {
          const output = $OS.Path.join(dir, [base]
            .concat(this.getCollectionPath(collection, root))
            // eslint-disable-next-line no-control-regex
            .map((p: string) => p.replace(/[<>:'"/\\|?*\u0000-\u001F]/g, ''))
            .map((p: string) => p.replace(/ +/g, autoExportPathReplace.space || ''))
            .map((p: string) => autoExportPathReplace.diacritics ? (fold2ascii.foldMaintaining(p) as string) : p)
            .join(autoExportPathReplace.dirSep || '-') + ext
          )
          jobs.push({
            ...jobs[0],
            scope: { type: 'collection', collection: collection.id },
            path: output,
          })
        }
      }

      await Promise.all(jobs.map(job => Translators.queueJob(job)))

      await repo.push(l10n.localize('better-bibtex_preferences_auto-export_git_message', { type: translator.label.replace('Better ', '') }))

      ae.error = ''
    }
    catch (err) {
      log.error(`auto-export ${ae.type} (${ae.id}) failed: ${JSON.stringify(ae)}, err.message`, err)
      ae.error = `${ err }`
    }

    await Zotero.DB.queryTx('UPDATE betterbibtex.autoexport SET status = \'done\', updated = ? WHERE path = ?', [ Date.now(), path ])
  }

  private getCollectionPath(coll: { name: string; parentID: number }, root: number): string[] {
    let path: string[] = [coll.name]
    if (coll.parentID && coll.parentID !== root) path = this.getCollectionPath(Zotero.Collections.get(coll.parentID), root).concat(path)
    return path
  }

  public clear() {
    this.scheduler.clear()
  }
}

type Job = {
  enabled: boolean
  type: 'collection' | 'library'
  id: number
  translatorID: string
  path: string
  recursive: boolean
  status: 'scheduled' | 'running' | 'done' | 'error'
  updated: number
  error: string
  exportNotes: boolean
  useJournalAbbreviation: boolean
  asciiBibLaTeX?: boolean
  biblatexExtendedNameFormat?: boolean
  DOIandURL?: boolean
  bibtexURL?: boolean
  biblatexAPA?: boolean
  biblatexChicago?: boolean
}
export type JobSetting = keyof Job

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const AutoExport = new class $AutoExport { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public progress: Map<string, number> = new Map

  constructor() {
    Events.on('libraries-changed', ids => this.schedule('library', ids))
    Events.on('libraries-removed', ids => this.remove('library', ids))
    Events.on('collections-changed', ids => this.schedule('collection', ids))
    Events.on('collections-removed', ids => this.remove('collection', ids))
    Events.on('export-progress', ({ pct, ae }) => {
      if (typeof ae === 'string') this.progress.set(ae, pct)
    })

    orchestrator.add({
      id: 'git-push',
      description: 'git support',
      needs: ['start'],
      startup: async () => {
        await git.init()
      },
    })

    orchestrator.add({
      id: 'auto-export',
      description: 'auto-export',
      needs: [ 'sqlite', 'cache', 'translators' ],
      startup: async () => {
        for (const path of await Zotero.DB.columnQueryAsync('SELECT path FROM betterbibtex.autoexport WHERE status <> \'done\'')) {
          queue.add(path)
        }

        if (Preference.autoExport === 'immediate') queue.resume('startup')
        Events.addIdleListener('auto-export', Preference.autoExportIdleWait)
        Events.on('idle', state => {
          if (state.topic !== 'auto-export' || Preference.autoExport !== 'idle') return

          switch (state.state) {
            case 'active':
              queue.pause('end-of-idle')
              break

            case 'idle':
              queue.resume('start-of-idle')
              break

            default:
              log.error(`idle: unexpected idle state ${JSON.stringify(state)}`)
              break
          }
        })

        Events.on('sync', running => {
          if (running) {
            queue.holdDuringSync()
          }
          else {
            queue.releaseAfterSync()
          }
        })
      },
    })
  }

  public async add(ae: Job, schedule = false) {
    await SQL.create(ae)

    try {
      const repo = await git.repo(ae.path)
      if (repo.enabled || schedule) await this.schedule(ae.type, [ae.id]) // causes initial push to overleaf at the cost of a unnecesary extra export
    }
    catch (err) {
      log.error('AutoExport.add:', err)
    }
  }

  public async register(job: ExportJob) {
    if (!job.displayOptions.keepUpdated) return

    if (!job.path) {
      // this should never occur -- keepUpdated should only be settable if you do a file export
      flash('Auto-export not registered', 'Auto-export only supported for exports to file -- please report this, you should not have seen this message')
      return
    }

    if (job.displayOptions.exportFileData) {
      // likewise, the export UI should prevent this
      flash('Auto-export not registered', 'Auto-export does not support attachment export -- please report this, you should not have seen this message')
      return
    }

    if (job.scope.type !== 'library' && job.scope.type !== 'collection') {
      flash('Auto-export not registered', 'Auto-export only supported for groups, collections and libraries')
      return
    }

    await this.add({
      enabled: true,
      path: job.path,
      type: job.scope.type,
      id: job.scope.type === 'library' ? job.scope.id : job.scope.collection.id,
      recursive: false,
      error: '',
      updated: Date.now(),
      status: 'done',
      translatorID: job.translatorID,
      exportNotes: job.displayOptions.exportNotes,
      biblatexAPA: job.displayOptions.biblatexAPA,
      biblatexChicago: job.displayOptions.biblatexChicago,
      useJournalAbbreviation: job.displayOptions.useJournalAbbreviation,
    })
  }

  public async find(type: 'collection' | 'library', ids: number[]): Promise<Job[]> {
    return await Promise.all((await SQL.find(type, ids)).map(path => this.get(path)))
  }

  public async schedule(type: 'collection' | 'library', ids: number[]) {
    if (!ids.length) return

    for (const path of await SQL.find(type, ids)) {
      queue.add(path)
    }
  }

  public async get(path: string): Promise<Job> {
    return await SQL.get(path)
  }

  public async all(): Promise<Job[]> {
    const paths = await Zotero.DB.columnQueryAsync('SELECT path FROM betterbibtex.autoexport ORDER BY path')
    return await Promise.all(paths.map(path => this.get(path))) as Job[]
  }

  public async edit(path: string, setting: JobSetting, value: number | boolean | string): Promise<void> {
    await SQL.edit(path, setting, value)
  }

  public async remove(path: string): Promise<void>
  public async remove(type: 'collection' | 'library', ids: number[]): Promise<void>
  public async remove(arg: string, ids?: number[]): Promise<void> {
    const paths: string[] = (typeof ids === 'undefined') ? [arg] : await SQL.find(arg as 'collection' | 'library', ids)

    await Zotero.DB.queryTx(`DELETE FROM betterbibtex.autoexport WHERE path IN (${ Array(paths.length).fill('?').join(',') })`, paths)

    for (const path of paths) {
      queue.cancel(path)
      this.progress.delete(path)
    }
  }

  public async removeAll() {
    queue.clear()
    this.progress = new Map
    await Zotero.DB.queryTx('DELETE FROM betterbibtex.autoexport')
  }

  public run(path: string) {
    queue.run(path)
  }

  public async cached(path: string) {
    if (!Preference.cache) return 0

    const ae = await this.get(path)

    const itemTypeIDs: number[] = [ 'attachment', 'note', 'annotation' ].map(type => {
      try {
        return Zotero.ItemTypes.getID(type) as number
      }
      catch {
        return undefined
      }
    })

    const translator = Translators.byId[ae.translatorID]
    const itemIDset: Set<number> = new Set
    await this.itemIDs(ae, ae.id, itemTypeIDs, itemIDset)
    if (itemIDset.size === 0) return 100

    const cached = await Cache.cache(translator.label).count(path)
    return Math.min(100 * (cached / itemIDset.size), 100)
  }

  private async itemIDs(ae: Job, id: number, itemTypeIDs: number[], itemIDs: Set<number>) {
    let items
    if (ae.type === 'collection') {
      const coll = await Zotero.Collections.getAsync(id)
      if (ae.recursive) {
        for (const collID of coll.getChildren(true)) {
          await this.itemIDs(ae, collID, itemTypeIDs, itemIDs)
        }
      }
      items = coll.getChildItems()
    }
    else if (ae.type === 'library') {
      items = await Zotero.Items.getAll(id)
    }

    items.filter(item => !itemTypeIDs.includes(item.itemTypeID)).forEach(item => itemIDs.add(item.id))
  }
}

Events.on('preference-changed', pref => {
  if (pref !== 'autoExport') return

  switch (Preference.autoExport) {
    case 'immediate':
      queue.resume('preference-change')
      break

    case 'idle':
      if (Events.idle['auto-export'] === 'idle') queue.resume('start-of-idle')
      break

    default: // off / idle
      queue.pause('preference-change')
  }
})
