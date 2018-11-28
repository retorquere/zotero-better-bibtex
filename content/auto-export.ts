declare const Zotero: any
declare const Components: any
declare const Subprocess: any

Components.utils.import('resource://gre/modules/Subprocess.jsm')

import * as log from './debug'

import Queue = require('better-queue')
import MemoryStore = require('better-queue-memory')
import { Events } from './events'
import { DB } from './db/main'
import { Translators } from './translators'
import { Preferences as Prefs } from './prefs'
import * as ini from 'ini'

const prefOverrides = require('../gen/preferences/auto-export-overrides.json')

function queueHandler(kind, handler) {
  return (task, cb) => {
    log.debug('AutoExport.queue:', kind, task)

    handler(task).then(() => {
      log.debug('AutoExport.queue:', kind, task, 'completed')
      cb(null)
    }).catch(err => {
      log.error('AutoExport.queue:', kind, task, 'failed:', err)
      cb(err)
    })

    return {
      cancel() { task.cancelled = true },
    }
  }
}

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
      log.error('git.init: git not found:', err)
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
        const path = Zotero.File.pathToFile(bib)
        let root = path.clone() // assumes that we're handed a bibfile!
        let config = null

        while (root.parent) {
          root = root.parent

          if (!root.exists() || !root.isDirectory()) return repo

          config = root.clone()
          config.append('.git')
          if (config.exists() && config.isDirectory()) break
          config = null
        }
        if (!config) return repo
        repo.path = root.path

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
        /*
        make async
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

const scheduled = new Queue(
  queueHandler('scheduled',
    async task => {
      const db = DB.getCollection('autoexport')
      const ae = db.get(task.id)
      if (!ae) throw new Error(`AutoExport ${task.id} not found`)

      log.debug('AutoExport.scheduled:', ae)
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

        log.debug('AutoExport.scheduled: starting export', ae)

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

        log.debug('AutoExport.scheduled: export finished', ae)
        ae.error = ''
      } catch (err) {
        log.error('AutoExport.scheduled: failed', ae, err)
        ae.error = `${err}`
      }

      ae.status = 'done'
      db.update(ae)
      log.debug('AutoExport.scheduled: completed', task, ae)
    }
  ),

  {
    store: new MemoryStore(),
    // https://bugs.chromium.org/p/v8/issues/detail?id=4718
    setImmediate: setTimeout.bind(null),
  }
)
scheduled.resume()

const debounce_delay = 1000
const scheduler = new Queue(
  queueHandler('scheduler',
    async task => {
      task = {...task}

      const db = DB.getCollection('autoexport')
      const ae = db.get(task.id)
      if (!ae) throw new Error(`AutoExport ${task.id} not found`)

      log.debug('AutoExport.scheduler:', task, '->', ae, !!ae)
      ae.status = 'scheduled'
      db.update(ae)
      log.debug('AutoExport.scheduler: waiting...', task, ae)

      await Zotero.Promise.delay(debounce_delay)

      log.debug('AutoExport.scheduler: woken', task, ae)

      if (task.cancelled) {
        log.debug('AutoExport.scheduler: cancel', ae)
      } else {
        log.debug('AutoExport.scheduler: start', ae)
        scheduled.push(task)
      }
    }
  ),

  {
    store: new MemoryStore(),
    cancelIfRunning: true,
    // https://bugs.chromium.org/p/v8/issues/detail?id=4718
    setImmediate: setTimeout.bind(null),
  }
)

if (Prefs.get('autoExport') !== 'immediate') { scheduler.pause() }

if (Zotero.Debug.enabled) {
  for (const event of [ 'empty', 'drain', 'task_queued', 'task_accepted', 'task_started', 'task_finish', 'task_failed', 'task_progress', 'batch_finish', 'batch_failed', 'batch_progress' ]) {
    (e => scheduler.on(e, (...args) => { log.debug(`AutoExport.scheduler.${e}`, args) }))(event);
    (e => scheduled.on(e, (...args) => { log.debug(`AutoExport.scheduled.${e}`, args) }))(event)
  }
}

const idleObserver = {
  observe(subject, topic, data) {
    log.debug(`AutoExport.idle: ${topic}`)
    if (Prefs.get('autoExport') !== 'idle') { return }
    switch (topic) {
      case 'back': case 'active':
        scheduler.pause()
        break

      case 'idle':
        scheduler.resume()
        break
    }
  },
}
const idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
idleService.addIdleObserver(idleObserver, Prefs.get('autoExportIdleWait'))

Events.on('preference-changed', pref => {
  if (pref !== 'autoExport') { return }

  log.debug('AutoExport: preference changed')

  switch (Prefs.get('autoExport')) {
    case 'immediate':
      scheduler.resume()
      break
    default: // / off / idle
      scheduler.pause()
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
      scheduler.push({ id: ae.$loki })
    }

    if (Prefs.get('autoExport') === 'immediate') { scheduler.resume() }
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
    log.debug('AutoExport.schedule:', type, ids, {db: this.db.data, state: Prefs.get('autoExport'), scheduler: !scheduler._stopped, scheduled: !scheduled._stopped})
    for (const ae of this.db.find({ type, id: { $in: ids } })) {
      log.debug('AutoExport.schedule: push', ae.$loki)
      scheduler.push({ id: ae.$loki })
    }
  }

  public remove(type, ids) {
    log.debug('AutoExport.remove:', type, ids, {db: this.db.data, state: Prefs.get('autoExport'), scheduler: !scheduler._stopped, scheduled: !scheduled._stopped})
    for (const ae of this.db.find({ type, id: { $in: ids } })) {
      scheduled.cancel(ae.$loki)
      scheduler.cancel(ae.$loki)
      this.db.remove(ae)
    }
  }

  public run(ae) {
    if (typeof ae === 'number') { ae = this.db.get(ae) }

    log.debug('Autoexport.run:', ae)
    ae.status = 'scheduled'
    this.db.update(ae)
    scheduled.push({ id: ae.$loki })
  }
}
