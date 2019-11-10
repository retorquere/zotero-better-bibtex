declare const Zotero: any
declare const Components: any

Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

import * as log from './debug'

import { Events } from './events'
import { DB } from './db/main'
import { Translators } from './translators'
import { Preferences as Prefs } from './prefs'
import * as ini from 'ini'
import { pathSearch } from './path-search'
import { flash } from './flash'
import Loki = require('lokijs')
import * as fold from './fold.json'

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

  public repo(bib): Git {
    const repo = new Git(this)

    if (!this.git) return repo

    switch (Prefs.get('git')) {
      case 'off':
        return repo

      case 'always':
        try {
          repo.path = Zotero.File.pathToFile(bib).parent.path
        } catch (err) {
          log.error('git.repo:', err)
          return repo
        }
        break

      case 'config':
        let config = null
        for (let root = Zotero.File.pathToFile(bib).parent; root && root.exists() && root.isDirectory(); root = root.parent) {
          config = root.clone()
          config.append('.git')
          if (config.exists() && config.isDirectory()) break
          config = null
        }
        if (!config) return repo
        repo.path = config.parent.path

        config.append('config')
        if (!config.exists() || !config.isFile()) return repo

        try {
          const enabled = (ini.parse(Zotero.File.getContents(config))['zotero "betterbibtex"'] || {}).push
          if (enabled !== 'true' && enabled !== true) return repo
        } catch (err) {
          log.debug('git.repo: error parsing config', config.path, err)
          return repo
        }
        break

      default:
        log.error('Unexpected git config', Prefs.get('git'))
        return repo
    }

    const sep = Zotero.isWin ? '\\' : '/'
    if (bib[repo.path.length] !== sep) throw new Error(`${bib} not in directory ${repo.path} (${bib[repo.path.length]} vs ${sep})?!`)

    repo.enabled = true
    repo.bib = bib.substring(repo.path.length + 1)

    return repo
  }

  public async pull() {
    if (!this.enabled) return

    try {
      await this.exec(this.git, ['-C', this.path, 'pull'])
      log.debug(`git.pull: pulled in ${this.path}`)
    } catch (err) {
      log.error(`could not pull in ${this.path}:`, err)
      this.enabled = false
    }
  }

  public async push(msg) {
    if (!this.enabled) return

    try {
      await this.exec(this.git, ['-C', this.path, 'add', this.bib])
      await this.exec(this.git, ['-C', this.path, 'commit', '-m', msg])
      await this.exec(this.git, ['-C', this.path, 'push'])
      log.debug(`git.push: pushed ${this.bib} in ${this.path}`)
    } catch (err) {
      log.error(`could not push ${this.bib} in ${this.path}`, err)
      this.enabled = false
    }
  }

  private async exec(cmd, args) {
    if (typeof cmd === 'string') cmd = new FileUtils.File(cmd)

    if (!cmd.isExecutable()) throw new Error(`${cmd.path} is not an executable`)

    const proc = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess)
    proc.init(cmd)
    // proc.startHidden = true // won't work until Zotero upgrades to post-55 Firefox

    log.debug(`Running ${cmd.path} ${JSON.stringify(args).slice(1, -1)}`)

    const deferred = Zotero.Promise.defer()
    proc.runwAsync(args, args.length, { observe: function(subject, topic) { // tslint:disable-line:object-literal-shorthand only-arrow-functions
      if (topic !== 'process-finished') {
        deferred.reject(new Error(`${cmd.path} failed`))
      } else if (proc.exitValue !== 0) {
        deferred.reject(new Error(`${cmd.path} returned exit status ${proc.exitValue}`))
      } else {
        deferred.resolve(true)
      }
    }})

    return deferred.promise
  }
}
const git = new Git()

import * as prefOverrides from '../gen/preferences/auto-export-overrides.json'
const queue = new class {
  private tasks = new Loki('autoexport').addCollection('tasks')
  private paused: Set<number>
  private autoexports: any
  private debounce_delay: number
  private sorry = true
  private started = false

  constructor() {
    this.paused = new Set()

    this.debounce_delay = Prefs.get('autoExportDelay')
    if (this.debounce_delay < 1) this.debounce_delay = 1
    this.debounce_delay = this.debounce_delay * 1000 // tslint:disable-line:no-magic-numbers
  }

  public start() {
    if (this.started) return
    this.started = true
    if (Prefs.get('autoExport') === 'immediate') this.resume()

    const idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
    idleService.addIdleObserver(this, Prefs.get('autoExportIdleWait'))
  }

  public init(autoexports) {
    this.autoexports = autoexports
  }

  public pause() {
    if (!this.paused) this.paused = new Set([])
  }

  public resume() {
    if (!this.paused) return

    const ids = this.paused.values()
    this.paused = null

    for (const ae of ids) {
      this.add(ae)
    }
  }

  public add(ae) {
    const id = (typeof ae === 'number' ? ae : ae.$loki)

    this.cancel(id)

    if (this.paused) return this.paused.add(id)

    const task = this.tasks.insert({id})

    Zotero.Promise.delay(this.debounce_delay)
      .then(() => this.run(task))
      .catch(err => log.error('autoexport failed:', {id}, err))
      .finally(() => this.tasks.remove(task))
  }

  public cancel(ae) {
    const id = (typeof ae === 'number' ? ae : ae.$loki)

    for (const task of this.tasks.find({ id })) {
      task.canceled = true // this relies on 'clone' *not* being set
    }
  }

  public async run(task) {
    if (task.canceled) return
    await Zotero.BetterBibTeX.ready
    if (task.canceled) return

    const ae = this.autoexports.get(task.id)
    if (!ae) throw new Error(`AutoExport ${task.id} not found`)
    log.debug(fold.start, 'AutoExport.queue.run: starting', ae)

    ae.status = 'running'
    this.autoexports.update(ae)

    try {
      let items
      switch (ae.type) {
        case 'collection':
          items = { collection: ae.id }
          break
        case 'library':
          items = { library: ae.id }
          break
        default:
          items = null
      }

      const repo = git.repo(ae.path)
      await repo.pull()
      const displayOptions: any = {
        exportNotes: ae.exportNotes,
        useJournalAbbreviation: ae.useJournalAbbreviation,
      }

      /*
        the reason this is reasonable and works is the following:

        1. If you have an auto-export, you really want to use the cache. Trust me.
        2. If you have jabrefFormat set to 4, BBT will not cache because the contents of any given item is dependent on which groups you happen to export (BTW Jabref: booh)
        3. Since it's not in the cache, whatever we choose here will not matter, because any other exports will bypass the cache and generate fresh jabrefFormat 4 items
        4. If you change the jabrefFormat to anything but 4, all caches will be dropped anyhow, and we will follow that cache format from that point on
      if (Prefs.get('jabrefFormat') === 4) displayOptions.preference_jabrefFormat = 0 // tslint:disable-line:no-magic-numbers
      */

      for (const pref of prefOverrides) {
        displayOptions[`preference_${pref}`] = ae[pref]
      }

      let start = Date.now()
      log.debug(fold.start, 'AutoExport.queue.run: start priming')
      await Translators.primeCache(ae.translatorID, displayOptions, items)
      let elapsed = (Date.now() - start) / 1000 // tslint:disable-line no-magic-numbers
      log.debug('AutoExport.queue.run: priming took', elapsed, 'seconds', fold.end)

      start = Date.now()
      log.debug(fold.start, 'AutoExport.queue.run: start')
      await Translators.exportItems(ae.translatorID, displayOptions, items, ae.path)
      elapsed = (Date.now() - start) / 1000 // tslint:disable-line no-magic-numbers
      log.debug('AutoExport.queue.run: export took', elapsed, 'seconds', fold.end)

      if (elapsed > Prefs.get('autoExportTooLong')) {
        const title = Zotero.BetterBibTeX.getString('AutoExport.too-long.title')
        let body = Zotero.BetterBibTeX.getString('AutoExport.too-long.body', {
          translator: Translators.byId[ae.translatorID].label,
          path: ae.path,
          seconds: Math.round(elapsed),
        })
        let linger = 10

        if (!Prefs.get('autoExportPrimeExportCacheThreshold')) {
          body += ' ' + Zotero.BetterBibTeX.getString('AutoExport.too-long.primeEnabled')
          Prefs.set('autoExportPrimeExportCacheThreshold', 20) // tslint:disable-line no-magic-numbers

        } else if (Prefs.get('autoExport') === 'immediate') {
          body += ' ' + Zotero.BetterBibTeX.getString('AutoExport.too-long.suggestIdle')

        } else if (this.sorry) {
          body += ' ' + Zotero.BetterBibTeX.getString('AutoExport.too-long.sorry')
          this.sorry = false

        } else {
          linger = 5 // tslint:disable-line:no-magic-numbers

        }

        flash(title, body, linger)
      }
      await repo.push(Zotero.BetterBibTeX.getString('Preferences.auto-export.git.message', { type: Translators.byId[ae.translatorID].label.replace('Better ', '') }))

      ae.error = ''
    } catch (err) {
      log.error('AutoExport.queue.run: failed', ae, err)
      ae.error = `${err}`
    }

    ae.status = 'done'
    this.autoexports.update(ae)
    log.debug('AutoExport.queue.run: done', fold.end)
  }

  // idle observer
  protected observe(subject, topic, data) {
    if (!this.started || Prefs.get('autoExport') === 'off') return

    switch (topic) {
      case 'back':
      case 'active':
        if (Prefs.get('autoExport') === 'idle') this.pause()
        break

      case 'idle':
        this.resume()
        break
    }
  }
}

Events.on('preference-changed', pref => {
  if (pref !== 'autoExport') return

  switch (Prefs.get('autoExport')) {
    case 'immediate':
      queue.resume()
      break
    default: // off / idle
      queue.pause()
  }
})

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let AutoExport = new class { // tslint:disable-line:variable-name
  public db: any

  constructor() {
    Events.on('libraries-changed', ids => this.schedule('library', ids))
    Events.on('libraries-removed', ids => this.remove('library', ids))
    Events.on('collections-changed', ids => this.schedule('collection', ids))
    Events.on('collections-removed', ids => this.remove('collection', ids))
  }

  public async init() {
    await git.init()

    this.db = DB.getCollection('autoexport')
    queue.init(this.db)

    for (const ae of this.db.find({ status: { $ne: 'done' } })) {
      queue.add(ae)
    }

    if (Prefs.get('autoExport') === 'immediate') { queue.resume() }
  }

  public start() {
    queue.start()
  }

  public add(ae) {
    for (const pref of prefOverrides) {
      ae[pref] = Prefs.get(pref)
    }
    this.db.removeWhere({ path: ae.path })
    this.db.insert(ae)

    if (git.repo(ae.path).enabled) this.schedule(ae.type, [ae.id]) // causes initial push to overleaf at the cost of a unnecesary extra export
  }

  public changed(items) {
    const changed = {
      collections: new Set,
      libraries: new Set,
    }

    for (const item of items) {
      changed.libraries.add(item.libraryID)

      for (let collectionID of item.getCollections()) {
        if (changed.collections.has(collectionID)) continue

        while (collectionID) {
          changed.collections.add(collectionID)
          collectionID = Zotero.Collections.get(collectionID).parentID
        }
      }
    }

    if (changed.collections.size) Events.emit('collections-changed', Array.from(changed.collections))
    if (changed.libraries.size) Events.emit('libraries-changed', Array.from(changed.libraries))
  }

  public schedule(type, ids) {
    for (const ae of this.db.find({ type, id: { $in: ids } })) {
      queue.add(ae)
    }
  }

  public remove(type, ids) {
    for (const ae of this.db.find({ type, id: { $in: ids } })) {
      queue.cancel(ae)
      this.db.remove(ae)
    }
  }

  public run(id) {
    queue.run({id})
  }
}
