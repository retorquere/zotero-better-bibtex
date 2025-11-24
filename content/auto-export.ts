import { log } from './logger'
import { Path, File } from './file'

import * as client from './client'

import { Events } from './events'
import { Translators, ExportJob } from './translators'
import { Preference } from './prefs'
import { Preferences, autoExport, affectedBy, affects } from '../gen/preferences/meta'
import { byId } from '../gen/translators'
import schema from '../gen/auto-export-schema.json' with { type: 'json' }
import * as ini from 'ini'
import fold2ascii from 'fold-to-ascii'
import { findBinary } from './path-search'
import { Scheduler } from './scheduler'
import { flash } from './flash'
import * as l10n from './l10n'
import { orchestrator } from './orchestrator'
import * as blink from 'blinkdb'
import { pick } from './object'
import { uri } from './escape'

const cmdMeta = /(["^&|<>()%!])/
const cmdMetaOrSpace = /[\s"^&|<>()%!]/
const cmdMetaInsideQuotes = /(["%!])/

type UnwatchCallback = () => void

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

import { quote as posix_quote } from 'shell-quote'

function quote(cmd: string[]): string {
  return client.isWin ? cmd.map(s => win_quote(s)).join(' ') : <string>posix_quote(cmd)
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

  private async findRoot(path: string): Promise<string> {
    if (!path) return ''
    if (!await File.exists(path)) return ''
    if (!await File.isDir(path)) return ''
    const gitdir = PathUtils.join(path, '.git')
    if ((await File.exists(gitdir)) && (await File.isDir(gitdir))) return path

    const parent = PathUtils.parent(path)
    if (parent === path) return '' // at root, and is not git repo. Who does this?
    return await this.findRoot(parent)
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
          repo.path = PathUtils.parent(bib)
        }
        catch (err) {
          log.error('git.repo:', err)
          return repo
        }
        break

      case 'config':
        if (typeof this.root[bib] === 'undefined') this.root[bib] = await this.findRoot(PathUtils.parent(bib))
        if (!this.root[bib]) return disabled()
        repo.path = this.root[bib]

        config = PathUtils.join(repo.path, '.git', 'config')
        if (!(await File.exists(config)) || (await File.isDir(config))) return disabled()

        try {
          const enabled = ini.parse(await Zotero.File.getContentsAsync(config))['zotero "betterbibtex"']?.push
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

  private async exec(exe: string, args?: string[]): Promise<void> {
    // args = ['/K', exe].concat(args || [])
    // exe = await findBinary('CMD')

    args = args || []
    const command = quote([ exe, ...args ])

    const cmd = new FileUtils.File(exe)
    if (!cmd.isExecutable()) throw new Error(`${ cmd.path } is not an executable`)

    const proc = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess)
    proc.init(cmd)
    proc.startHidden = !Zotero.Prefs.get('extensions.zotero.translators.better-bibtex.path.git.show')

    return new Promise((resolve, reject) => {
      proc.runwAsync(args, args.length, {
        observe: (subject, topic) => {
          if (topic !== 'process-finished') {
            reject(new Error(`[ ${ command } ] failed: ${ topic }`))
          }
          else if (proc.exitValue > 0) {
            reject(new Error(`[ ${ command } ] failed with exit status: ${ proc.exitValue }`))
          }
          else {
            resolve()
          }
        },
      })
    })
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

    const ae = AutoExport.get(path)
    if (!ae) throw new Error(`AutoExport for ${ JSON.stringify(path) } does not exist`)

    const translator = Translators.byId[ae.translatorID]
    void Events.emit('export-progress', { pct: 0, message: `Starting ${ translator.label }`, ae: path })

    AutoExport.status(path, 'running')

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
        worker: true,
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

        const dir = PathUtils.parent(ae.path)
        const base = Path.basename(ae.path).replace(new RegExp(`${ ext.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') }$`), '')

        const autoExportPathReplace = {
          diacritics: Preference.autoExportPathReplaceDiacritics,
          dirSep: Preference.autoExportPathReplaceDirSep,
          space: Preference.autoExportPathReplaceSpace,
        }

        for (const collection of collections) {
          const output = PathUtils.join(dir, [base]
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

      await Promise.allSettled(jobs.map(job => Translators.queueJob(job)))

      await repo.push(l10n.localize('better-bibtex_preferences_auto-export_git_message', { type: translator.label.replace('Better ', '') }))

      ae.error = ''
    }
    catch (err) {
      log.error(`auto-export ${ae.type} (${ae.id}) failed: ${JSON.stringify(ae)}, err.message`, err)
      ae.error = `${ err }`
    }

    void Events.emit('export-progress', { pct: 100, message: `${ translator.label } export finished`, ae: path })
    AutoExport.status(path, 'done')
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
  error: string
  exportNotes?: boolean
  useJournalAbbreviation?: boolean
  asciiBibLaTeX?: boolean
  biblatexExtendedNameFormat?: boolean
  DOIandURL?: boolean
  bibtexURL?: boolean
  biblatexAPA?: boolean
  biblatexChicago?: boolean

  created: number
  updated: number
}
export type JobSetting = keyof Job

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const AutoExport = new class $AutoExport {
  public progress: Map<string, number> = new Map

  public db = blink.createTable<Job>(blink.createDB({ clone: true }), 'autoExports')({
    primary: 'path',
    indexes: [ 'translatorID', 'type', 'id' ],
  })
  private unwatch: UnwatchCallback[] = []

  private key(path: string): string {
    return uri.encode(path).replace(/[.!'()*]/g, c => `%${c.charCodeAt(0).toString(16)}`)
  }

  constructor() {
    Events.on('libraries-changed', ids => this.schedule('library', ids))
    Events.on('libraries-removed', ids => this.remove('library', ids))
    Events.on('collections-changed', ids => this.schedule('collection', ids))
    Events.on('collections-removed', ids => this.remove('collection', ids))
    Events.on('export-progress', ({ pct, ae }) => {
      if (typeof ae === 'string') this.progress.set(ae, pct)
    })

    this.unwatch = [
      this.db[blink.BlinkKey].events.onInsert.register(changes => {
        for (const change of changes) {
          Zotero.Prefs.set(`translators.better-bibtex.autoExport.${this.key(change.entity.path)}`, JSON.stringify(change.entity))
        }
      }),
      this.db[blink.BlinkKey].events.onUpdate.register(changes => {
        for (const change of changes) {
          Zotero.Prefs.clear(`translators.better-bibtex.autoExport.${this.key(change.oldEntity.path)}`)
          Zotero.Prefs.set(`translators.better-bibtex.autoExport.${this.key(change.newEntity.path)}`, JSON.stringify(change.newEntity))
        }
      }),
      this.db[blink.BlinkKey].events.onRemove.register(changes => {
        for (const change of changes) {
          Zotero.Prefs.clear(`translators.better-bibtex.autoExport.${this.key(change.entity.path)}`)
        }
      }),
      this.db[blink.BlinkKey].events.onClear.register(() => {
        for (const key of Services.prefs.getBranch('extensions.zotero.translators.better-bibtex.autoExport.').getChildList('')) {
          Zotero.Prefs.clear(`translators.better-bibtex.autoExport.${key}`)
        }
      }),
    ]

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
      needs: [ 'sqlite', 'translators' ],
      startup: async () => {
        // detect
        const $ae = 'autoexport'
        const $ae$setting = 'autoexport_setting'
        const exists = async (table: string) => Zotero.DB.tableExists(table, 'betterbibtex')
        if (await exists($ae) && await exists($ae$setting)) {
          try {
            const migrate: Record<string, any> = {}
            for (const ae of await Zotero.DB.queryAsync(`SELECT * FROM betterbibtex.${$ae}`)) {
              migrate[ae.path] = pick(ae, ['path', 'translatorID', 'type', 'id', 'recursive', 'enabled', 'status', 'error', 'updated'])
              migrate[ae.path].recursive = migrate[ae.path].recursive === 1
              migrate[ae.path].enabled = migrate[ae.path].enabled === 1
            }
            for (const ae of await Zotero.DB.queryAsync(`SELECT * FROM betterbibtex.${$ae$setting}`)) {
              const label = Translators.byId[migrate[ae.path].translatorID].label
              if (schema[label][ae.setting].type === 'boolean') {
                migrate[ae.path][ae.setting] = ae.value === 1
              }
              else {
                migrate[ae.path][ae.setting] = ae.value
              }
            }

            for (const [ path, ae ] of Object.entries(migrate)) {
              Zotero.Prefs.set(`translators.better-bibtex.autoExport.${this.key(path)}`, JSON.stringify(ae))
            }

            await Zotero.DB.queryAsync(`DELETE FROM betterbibtex.${$ae$setting}`)
            await Zotero.DB.queryAsync(`DELETE FROM betterbibtex.${$ae}`)
            await Zotero.DB.queryAsync(`DROP TABLE betterbibtex.${$ae$setting}`)
            await Zotero.DB.queryAsync(`DROP TABLE betterbibtex.${$ae}`)
          }
          catch (err) {
            log.error('auto-export migration failed', err)
          }
        }
        try {
          if (!(await exists($ae)) && await exists($ae$setting)) {
            await Zotero.DB.queryAsync(`DROP TABLE betterbibtex.${$ae$setting}`)
          }
          if (await exists($ae) && !(await exists($ae$setting))) {
            await Zotero.DB.queryAsync(`DROP TABLE betterbibtex.${$ae}`)
          }
        }
        catch (err) {
          log.error('auto-export migration failed', err)
        }

        for (const key of Services.prefs.getBranch('extensions.zotero.translators.better-bibtex.autoExport.').getChildList('')) {
          try {
            const ae = JSON.parse(Zotero.Prefs.get(`translators.better-bibtex.autoExport.${key}`) as string)
            blink.insert(this.db, { ...ae, created: Date.now(), updated: Date.now() })
            if (ae.status !== 'done') queue.add(ae.path)
          }
          catch {
          }
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

        Events.on('preference-changed', pref => {
          if (pref === 'autoExport') {
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
          }

          for (const translator of (affects[pref] || []).map(label => Translators.byLabel[label])) {
            for (const ae of blink.many(this.db, { where: { translatorID: translator.translatorID }})) {
              if (!(pref in ae)) queue.add(ae.path)
            }
          }
        })
      },
      shutdown: () => {
        for (const cb of this.unwatch) {
          cb()
        }
      },
    })
  }

  public store(job: Job) {
    const ae: Job = {
      ...pick(job, ['path', 'translatorID', 'type', 'id', 'status']),
      error: job.error || '',
      recursive: job.recursive ?? false,
      created: job.created || Date.now(),
      updated: job.updated || Date.now(),
      enabled: true,
    }

    const valid = autoExport[job.translatorID]
    const displayOptions = byId[job.translatorID]?.displayOptions || {}
    for (const pref of valid.preferences) {
      ae[pref] = ae[pref] ?? job[pref] ?? Preference[pref]
    }
    for (const option of valid.options) {
      ae[option] = ae[option] ?? job[option] ?? displayOptions[option] ?? false
    }

    blink.upsert(this.db, { created: Date.now(), ...ae, updated: Date.now() })
    queue.add(ae.path)
  }

  public find(type: 'collection' | 'library', ids: number[]): Job[] {
    if (!ids.length) return []

    return blink.many(this.db, { where: {
      type,
      id: { in: ids },
    }})
  }

  public async add(ae: Job, schedule = false) {
    this.store(ae)

    try {
      const repo = await git.repo(ae.path)
      if (repo.enabled || schedule) this.schedule(ae.type, [ae.id]) // causes initial push to overleaf at the cost of a unnecesary extra export
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
      created: Date.now(),
      updated: Date.now(),
      status: 'done',
      translatorID: job.translatorID,
      exportNotes: job.displayOptions.exportNotes,
      biblatexAPA: job.displayOptions.biblatexAPA,
      biblatexChicago: job.displayOptions.biblatexChicago,
      useJournalAbbreviation: job.displayOptions.useJournalAbbreviation,
    })
  }

  public schedule(type: 'collection' | 'library', ids: number[]) {
    if (!ids.length) return

    for (const ae of this.find(type, ids)) {
      queue.add(ae.path)
    }
  }

  public get(path: string): Job {
    return blink.first(this.db, { where: { path }})
  }

  public all(): Job[] {
    return blink.many(this.db)
  }

  public edit(path: string, setting: JobSetting, value: number | boolean | string): void {
    const ae: Job = blink.first(this.db, { where: { path }});
    (ae[setting] as any) = value as any
    blink.upsert(this.db, { created: Date.now(), ...ae, updated: Date.now() })
    queue.add(ae.path)
  }

  public remove(path: string): void
  public remove(type: 'collection' | 'library', ids: number[]): void
  public remove(arg: string, ids?: number[]): void {
    const paths: string[] = (typeof ids === 'undefined') ? [arg] : this.find(arg as 'collection' | 'library', ids).map(ae => ae.path)

    blink.removeMany(this.db, paths.map(path => ({ path })))

    for (const path of paths) {
      queue.cancel(path)
      this.progress.delete(path)
    }
  }

  public status(path: string, status: 'running' | 'done') {
    const ae = blink.first(this.db, { where: { path }})
    if (ae) blink.update(this.db, { ...ae, status, updated: Date.now() })
  }

  public removeAll() {
    queue.clear()
    this.progress = new Map
    blink.clear(this.db)
  }

  public run(path: string) {
    queue.run(path)
  }

  forCollection(collectionID: number) {
    return blink.many(this.db, {
      where: { type: 'collection', id: collectionID },
      sort: { key: 'path', order: 'asc' },
    })
  }
}
