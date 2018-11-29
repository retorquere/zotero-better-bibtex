declare const Zotero: any
declare const Components: any
declare const Subprocess: any

Components.utils.import('resource://gre/modules/Subprocess.jsm')

import * as log from './debug'

import { Events } from './events'
import { DB } from './db/main'
import { Translators } from './translators'
import { Preferences as Prefs } from './prefs'
import * as ini from 'ini'
import Loki = require('lokijs')
import { Logger } from './logger'

class Git {
  public enabled: boolean
  public path: string
  public bib: string

  private git: string
  private onWindows: boolean

  constructor(parent?: Git) {
    this.enabled = false

    if (parent) {
      this.git = parent.git
      this.onWindows = parent.onWindows
    }
  }

  public async init() {
    this.onWindows = Zotero.platform.toLowerCase().startsWith('win')

    try {
      this.git = await Subprocess.pathSearch(`git${this.onWindows ? '.exe' : ''}`)
      log.debug('git: git found at', this.git)
    } catch (err) {
      log.debug('git.init: git not found:', err)
      this.git = null
    }

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

      /* async
      case 'config':
        try {
          const path = Zotero.File.pathToFile(bib).parent.path
          repo.enabled = (await this.exec(this.git, ['config', 'zotero.betterbibtex.push'], path)).trim() === 'true'
          if (!repo.enabled) return repo

          repo.path = (await this.exec(this.git, ['rev-parse', '--show-toplevel'], path)).trim()

        } catch (err) {
          log.error('git.repo:', err)
          repo.enabled = false
          return repo

        }
      */

      default:
        log.error('Unexpected git config', Prefs.get('git'))
        return repo
    }

    const sep = this.onWindows ? '\\' : '/'
    if (bib[repo.path.length] !== sep) throw new Error(`${bib} not in directory ${repo.path} (${bib[repo.path.length]} vs ${sep})?!`)

    repo.enabled = true
    repo.bib = bib.substring(repo.path.length + 1)

    return repo
  }

  public async pull() {
    if (!this.enabled) return

    try {
      await this.exec(this.git, ['pull'], this.path)
    } catch (err) {
      log.error(`could not pull in ${this.path}: ${Object.keys(err)}/${err}`)
      this.enabled = false
    }
  }

  public async push() {
    if (!this.enabled) return

    try {
      await this.exec(this.git, ['add', this.bib], this.path)
      await this.exec(this.git, ['commit', '-m', this.bib], this.path)
      await this.exec(this.git, ['push'], this.path)
    } catch (err) {
      log.error(`could not push ${this.bib} in ${this.path}: ${Object.keys(err)}/${err}`)
      this.enabled = false
    }
    log.error(`git.push: pushed ${this.bib} in ${this.path}`)
  }

  // https://firefox-source-docs.mozilla.org/toolkit/modules/subprocess/toolkit_modules/subprocess/index.html
  private async exec(cmd, args, workdir) {
    const proc = await Subprocess.call({
      command: cmd,
      arguments: args,
      workdir,
    })
    const output = await proc.stdout.readString()
    const exitCode = await proc.wait()
    log.debug('git.exec:', { cmd, args, workdir }, ':', exitCode, output)
    return output
  }
}
const git = new Git()

const debounce_delay = 1000
const prefOverrides = require('../gen/preferences/auto-export-overrides.json')
const queue = new class {
  public paused = false

  private tasks = new Loki('autoexport').addCollection('tasks')
  private held: Set<number>

  constructor() {
    this.paused = Prefs.get('autoExport') !== 'immediate'
    this.held = new Set([])

    const idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
    idleService.addIdleObserver(this, Prefs.get('autoExportIdleWait'))
  }

  public pause() {
    this.paused = true
  }

  public resume() {
    this.paused = false
    for (const ae of this.held.values()) {
      this.add(ae)
    }
    this.held = new Set([])
  }

  public add(ae) {
    const id = (typeof ae === 'number' ? ae : ae.$loki)

    this.cancel(id)

    if (this.paused) return this.held.add(id)

    const task = this.tasks.insert({id})

    Zotero.Promise.delay(debounce_delay)
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

    log.debug('AutoExport.queue.run:', task)

    const db = DB.getCollection('autoexport')
    const ae = db.get(task.id)
    if (!ae) throw new Error(`AutoExport ${task.id} not found`)

    log.debug('AutoExport.queue.run:', ae)
    ae.status = 'running'
    db.update(ae)

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

      log.debug('AutoExport.queue.run: starting export', ae)

      const repo = git.repo(ae.path)
      await repo.pull()
      const displayOptions = {
        exportNotes: ae.exportNotes,
        useJournalAbbreviation: ae.useJournalAbbreviation,
      }
      for (const pref of prefOverrides) {
        displayOptions[`preference_${pref}`] = ae[pref]
      }
      await Translators.translate(ae.translatorID, displayOptions, items, ae.path)
      await repo.push()

      log.debug('AutoExport.queue.run: export finished', ae)
      ae.error = ''
    } catch (err) {
      log.error('AutoExport.queue.run: failed', ae, err)
      ae.error = `${err}`
    }

    ae.status = 'done'
    db.update(ae)
    log.debug('AutoExport.queue.run: completed', task, ae)
  }

  // idle observer
  protected observe(subject, topic, data) {
    if (Prefs.get('autoExport') === 'off') return

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

  log.debug('AutoExport: preference changed')

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
    for (const ae of this.db.find({ status: { $ne: 'done' } })) {
      queue.add(ae)
    }

    if (Prefs.get('autoExport') === 'immediate') { queue.resume() }
  }

  public add(ae) {
    for (const pref of prefOverrides) {
      ae[pref] = Prefs.get(pref)
    }
    log.debug('AutoExport.add', ae)
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
      log.debug('AutoExport.schedule: push', ae.$loki)
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
    Logger.trigger()
    log.debug('Autoexport.run:', id)
    queue.run({id})
  }
}
