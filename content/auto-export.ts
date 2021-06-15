Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

import { log } from './logger'

import { Events } from './events'
import { DB } from './db/main'
import { DB as Cache, selector as cacheSelector } from './db/cache'
import { Translators } from './translators'
import { Preferences, Preference } from '../gen/preferences'
import * as ini from 'ini'
import fold2ascii from 'fold-to-ascii'
import { pathSearch } from './path-search'
import { Scheduler } from './scheduler'
import { flash } from './flash'

class Git {
  public enabled: boolean
  public path: string
  public bib: string

  private git: string

  constructor(parent?: Git) {
    this.enabled = false

    if (parent) {
      this.git = parent.git
    }
  }

  public async init() {
    this.git = await pathSearch('git')

    return this
  }

  public async repo(bib): Promise<Git> {
    const repo = new Git(this)

    if (!this.git) return repo

    switch (Preference.git) {
      case 'off':
        return repo

      case 'always':
        try {
          repo.path = OS.Path.dirname(bib)
        }
        catch (err) {
          log.error('git.repo:', err)
          return repo
        }
        break

      case 'config':
        // eslint-disable-next-line no-case-declarations
        let config = null
        for (let root = OS.Path.dirname(bib); (await OS.File.exists(root)) && (await OS.File.stat(root)).isDir && root !== OS.Path.dirname(root); root = OS.Path.dirname(root)) {
          config = OS.Path.join(root, '.git')
          if ((await OS.File.exists(config)) && (await OS.File.stat(config)).isDir) break
          config = null
        }
        if (!config) return repo
        repo.path = OS.Path.dirname(config)

        config = OS.Path.join(config, 'config')
        if (!(await OS.File.exists(config)) || (await OS.File.stat(config)).isDir) {
          return repo
        }

        try {
          const enabled = ini.parse(Zotero.File.getContents(config))['zotero "betterbibtex"']?.push
          if (enabled !== 'true' && enabled !== true) return repo
        }
        catch (err) {
          log.error('git.repo: error parsing config', config.path, err)
          return repo
        }
        break

      default:
        log.error('git.repo: unexpected git config', Preference.git)
        return repo
    }

    const sep = Zotero.isWin ? '\\' : '/'
    if (bib[repo.path.length] !== sep) throw new Error(`git.repo: ${bib} not in directory ${repo.path} (${bib[repo.path.length]} vs ${sep})?!`)

    repo.enabled = true
    repo.bib = bib.substring(repo.path.length + 1)

    return repo
  }

  public async pull() {
    if (!this.enabled) return

    try {
      const warning = await this.exec(this.git, ['-C', this.path, 'pull'])
      if (warning) flash('autoexport git pull warning', `${this.quote(this.path)}: ${warning}`, 1)
    }
    catch (err) {
      flash('autoexport git pull failed', `${this.quote(this.path)}: ${err.message}`, 1)
      log.error(`could not pull in ${this.path}:`, err)
    }
  }

  public async push(msg) {
    if (!this.enabled) return

    const warnings: string[] = []
    try {
      warnings.push(await this.exec(this.git, ['-C', this.path, 'add', this.bib]))
      warnings.push(await this.exec(this.git, ['-C', this.path, 'commit', '-m', msg]))
      warnings.push(await this.exec(this.git, ['-C', this.path, 'push']))
      const warning = warnings.find(w => w)
      if (warning) flash('autoexport git pull warning', `${this.quote(this.path)}: ${warning}`, 1)
    }
    catch (err) {
      flash('autoexport git push failed', `${this.quote(this.path)}: ${err.message}`, 1)
      log.error(`could not push ${this.bib} in ${this.path}`, err)
    }
  }

  private quote(cmd: string, args?: string[]) {
    return [cmd].concat(args || []).map((arg: string) => arg.match(/['"]|\s/) ? JSON.stringify(arg) : arg).join(' ')
  }

  private async exec(cmd, args): Promise<string> {
    if (typeof cmd === 'string') cmd = new FileUtils.File(cmd)

    if (!cmd.isExecutable()) throw new Error(`${cmd.path} is not an executable`)

    const proc = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess)
    proc.init(cmd)
    // proc.startHidden = true // won't work until Zotero upgrades to post-55 Firefox

    return new Promise<string>((resolve, reject) => {
      proc.runwAsync(args, args.length, { observe: function(subject, topic) { // eslint-disable-line object-shorthand, prefer-arrow/prefer-arrow-functions
        if (topic !== 'process-finished') {
          reject(new Error(`${this.quote(cmd.path, args)} failed, exit status: ${topic}`))
        }
        else if (proc.exitValue !== 0) {
          resolve(`${this.quote(cmd.path, args)} returned exit status ${proc.exitValue}`)
        }
        else {
          resolve('')
        }
      }})
    })
  }
}
const git = new Git()

import { override } from './prefs-meta'

if (Preference.autoExportDelay < 1) Preference.autoExportDelay = 1
const queue = new class TaskQueue {
  private scheduler = new Scheduler('autoExportDelay', 1000) // eslint-disable-line no-magic-numbers
  private autoexports: any
  private started = false

  constructor() {
    this.pause()
  }

  public start() {
    if (this.started) return
    this.started = true
    if (Preference.autoExport === 'immediate') this.resume()

    const idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
    idleService.addIdleObserver(this, Preference.autoExportIdleWait)

    Zotero.Notifier.registerObserver(this, ['sync'], 'BetterBibTeX', 1)
  }

  public init(autoexports) {
    this.autoexports = autoexports
  }

  public pause() {
    this.scheduler.paused = true
  }

  public resume() {
    this.scheduler.paused = false
  }

  public add(ae) {
    const $loki = (typeof ae === 'number' ? ae : ae.$loki)
    Events.emit('export-progress', 0, Translators.byId[ae.translatorID].label, $loki)
    this.scheduler.schedule($loki, () => { this.run($loki).catch(err => log.error('autoexport failed:', {$loki}, err)) })
  }

  public cancel(ae) {
    const $loki = (typeof ae === 'number' ? ae : ae.$loki)
    this.scheduler.cancel($loki)
  }

  public async run($loki: number) {
    await Zotero.BetterBibTeX.ready

    const ae = this.autoexports.get($loki)
    Events.emit('export-progress', 0, Translators.byId[ae.translatorID].label, $loki)
    if (!ae) throw new Error(`AutoExport ${$loki} not found`)

    ae.status = 'running'
    this.autoexports.update(ae)
    const started = Date.now()
    log.debug('auto-export', ae.type, ae.id, 'started')

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
          throw new Error(`Unexpected auto-export scope ${ae.type}`)
      }

      const repo = await git.repo(ae.path)
      await repo.pull()
      const displayOptions: any = {
        exportNotes: ae.exportNotes,
        useJournalAbbreviation: ae.useJournalAbbreviation,
      }

      /*
        the reason this is reasonable and works is the following:

        1. If you have an auto-export, you really want to use the cache. Trust me.
        2. If you have jabrefFormat set to 4 or higher, BBT will not cache because the contents of any given item is dependent on which groups you happen to export (BTW Jabref: booh)
        3. Since it's not in the cache, whatever we choose here will not matter, because any other exports will bypass the cache and generate fresh jabrefFormat 4+ items
        4. If you change the jabrefFormat to anything back to 3 or 0, all caches will be dropped anyhow, and we will follow that cache format from that point on
      */

      for (const pref of override.names) {
        displayOptions[`preference_${pref}`] = ae[pref]
      }
      displayOptions.auto_export_id = ae.$loki

      const jobs = [ { scope, path: ae.path } ]

      if (ae.recursive) {
        const collections = scope.type === 'library' ? Zotero.Collections.getByLibrary(scope.id, true) : Zotero.Collections.getByParent(scope.collection, true)
        const ext = `.${Translators.byId[ae.translatorID].target}`

        const root = scope.type === 'collection' ? scope.collection : false

        const dir = OS.Path.dirname(ae.path)
        const base = OS.Path.basename(ae.path).replace(new RegExp(`${ext.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`), '')

        const autoExportPathReplaceDiacritics: boolean = Preference.autoExportPathReplaceDiacritics
        const autoExportPathReplaceDirSep: string = Preference.autoExportPathReplaceDirSep
        const autoExportPathReplaceSpace: string = Preference.autoExportPathReplaceSpace
        for (const collection of collections) {
          const path = OS.Path.join(dir, [base]
            .concat(this.getCollectionPath(collection, root))
            // eslint-disable-next-line no-control-regex
            .map((p: string) => p.replace(/[<>:'"/\\|?*\u0000-\u001F]/g, ''))
            .map((p: string) => p.replace(/ +/g, autoExportPathReplaceSpace || ''))
            .map((p: string) => autoExportPathReplaceDiacritics ? (fold2ascii.foldMaintaining(p) as string) : p)
            .join(autoExportPathReplaceDirSep || '-') + ext
          )
          jobs.push({ scope: { type: 'collection', collection: collection.id }, path } )
        }
      }

      await Promise.all(jobs.map(job => Translators.exportItems(ae.translatorID, displayOptions, job.scope, job.path)))

      await repo.push(Zotero.BetterBibTeX.getString('Preferences.auto-export.git.message', { type: Translators.byId[ae.translatorID].label.replace('Better ', '') }))

      ae.error = ''
      log.debug('auto-export', ae.type, ae.id, 'took', Date.now() - started, 'msecs')
    }
    catch (err) {
      log.error('auto-export', ae.type, ae.id, 'failed:', ae, err)
      ae.error = `${err}`
    }

    ae.status = 'done'
    log.debug('auto-export done')
    this.autoexports.update(ae)
  }

  private getCollectionPath(coll: {name: string, parentID: number}, root: number): string[] {
    let path: string[] = [ coll.name ]
    if (coll.parentID && coll.parentID !== root) path = this.getCollectionPath(Zotero.Collections.get(coll.parentID), root).concat(path)
    return path
  }

  // idle observer
  protected observe(_subject, topic, _data) {
    if (!this.started || Preference.autoExport === 'off') return

    switch (topic) {
      case 'back':
      case 'active':
        if (Preference.autoExport === 'idle') this.pause()
        break

      case 'idle':
        this.resume()
        break

      default:
        log.error('Unexpected idle state', topic)
        break
    }
  }

  // pause during sync.
  // It is theoretically possible that auto-export is paused because Zotero is idle and then restarted when the sync finishes, but
  // I can't see how a system can be considered idle when Zotero is syncing.
  protected notify(action, type) {
    if (!this.started || Preference.autoExport === 'off') return

    switch(`${type}.${action}`) {
      case 'sync.start':
        this.pause()
        break

      case 'sync.finish':
        this.resume()
        break

      default:
        log.error('Unexpected Zotero notification state', { action, type })
        break
    }
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const AutoExport = new class _AutoExport { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public db: any
  public progress: Map<number, number>

  constructor() {
    this.progress = new Map

    Events.on('libraries-changed', ids => this.schedule('library', ids))
    Events.on('libraries-removed', ids => this.remove('library', ids))
    Events.on('collections-changed', ids => this.schedule('collection', ids))
    Events.on('collections-removed', ids => this.remove('collection', ids))
    Events.on('export-progress', (percent, _translator, ae) => {
      if (typeof ae === 'number') this.progress.set(ae, percent)
    })
  }

  public async init() {
    await git.init()

    this.db = DB.getCollection('autoexport')
    queue.init(this.db)

    for (const ae of this.db.find({ status: { $ne: 'done' } })) {
      queue.add(ae)
    }

    this.db.on(['delete'], ae => {
      this.progress.delete(ae.$loki)
    })

    if (Preference.autoExport === 'immediate') { queue.resume() }
  }

  public start() {
    queue.start()
  }

  public add(ae, schedule = false) {
    for (const pref of override.names) {
      ae[pref] = Preference[pref]
    }
    this.db.removeWhere({ path: ae.path })
    this.db.insert(ae)

    git.repo(ae.path).then(repo => {
      if (repo.enabled || schedule) this.schedule(ae.type, [ae.id]) // causes initial push to overleaf at the cost of a unnecesary extra export
    }).catch(err => {
      log.error('AutoExport.add:', err)
    })
  }

  public schedule(type, ids) {
    for (const ae of this.db.find({$and: [{ type: {$eq: type} }, {id: { $in: ids } }] })) {
      queue.add(ae)
    }
  }

  public remove(type, ids) {
    for (const ae of this.db.find({$and: [{ type: {$eq: type} }, {id: { $in: ids } }] })) {
      queue.cancel(ae)
      this.db.remove(ae)
    }
  }

  public run(id) {
    queue.run(id).catch(err => log.error('AutoExport.run:', err))
  }

  public async cached($loki) {
    log.debug('cache-rate: calculating cache rate for', $loki)
    const start = Date.now()
    const ae = this.db.get($loki)

    const itemTypeIDs: number[] = ['attachment', 'note', 'annotation'].map(type => {
      try {
        return Zotero.ItemTypes.getID(type) as number
      }
      catch (err) {
        return undefined
      }
    })

    const itemIDs: Set<number> = new Set
    await this.itemIDs(ae, ae.id, itemTypeIDs, itemIDs)
    if (itemIDs.size === 0) return 100 // eslint-disable-line no-magic-numbers

    const options = {
      exportNotes: !!ae.exportNotes,
      useJournalAbbreviation: !!ae.useJournalAbbreviation,
    }
    const prefs: Partial<Preferences> = override.names.reduce((acc, pref) => {
      acc[pref] = ae[pref]
      return acc
    }, {})

    const cached = {
      serialized: Cache.getCollection('itemToExportFormat').find({ itemID: { $in: [...itemIDs] } }).length,
      export: Cache.getCollection(Translators.byId[ae.translatorID].label).find(cacheSelector([...itemIDs], options, prefs)).length,
    }

    log.debug('cache-rate: cache rate for', $loki, {...cached, items: itemIDs.size}, 'took', Date.now() - start)
    return Math.min(Math.round((100 * (cached.serialized + cached.export)) / (itemIDs.size * 2)), 100) // eslint-disable-line no-magic-numbers
  }

  private async itemIDs(ae, id: number, itemTypeIDs: number[], itemIDs: Set<number>) {
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
      queue.resume()
      break
    default: // off / idle
      queue.pause()
  }
})
