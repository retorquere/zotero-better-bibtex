declare const Zotero: any
declare const Components: any
declare const Subprocess: any

Components.utils.import('resource://gre/modules/Subprocess.jsm')

import * as log from './debug'

import Queue = require('better-queue')
import MemoryStore = require('better-queue-memory')
import * as ini from 'ini'
import { Events } from './events'
import { DB } from './db/main'
import { Translators } from './translators'
import { Preferences as Prefs } from './prefs'

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

        const { repo, name } = AutoExport.gitPush(ae.path) // tslint:disable-line:no-use-before-declare
        AutoExport.pull(repo) // tslint:disable-line:no-use-before-declare
        const displayOptions = {
          exportNotes: ae.exportNotes,
          useJournalAbbreviation: ae.useJournalAbbreviation,
        }
        for (const pref of this.prefOverrides) {
          displayOptions[`preference_${pref}`] = ae[pref]
        }
        await Translators.translate(ae.translatorID, displayOptions, items, ae.path)
        AutoExport.push(repo, name) // tslint:disable-line:no-use-before-declare

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
  private git: string
  private onWindows: boolean
  private prefOverrides = ['asciiBibTeX', 'bibtexParticleNoOp', 'bibtexURL', 'asciiBibLaTeX', 'biblatexExtendedNameFormat', 'DOIandURL', 'qualityReport']

  constructor() {
    Events.on('libraries-changed', ids => this.schedule('library', ids))
    Events.on('libraries-removed', ids => this.remove('library', ids))
    Events.on('collections-changed', ids => this.schedule('collection', ids))
    Events.on('collections-removed', ids => this.remove('collection', ids))
  }

  public async init() {
    this.db = DB.getCollection('autoexport')
    for (const ae of this.db.find({ status: { $ne: 'done' } })) {
      scheduler.push({ id: ae.$loki })
    }

    if (Prefs.get('autoExport') === 'immediate') { scheduler.resume() }

    this.onWindows = Zotero.platform.toLowerCase().startsWith('win')
    try {
      this.git = await Subprocess.pathSearch(`git${this.onWindows ? '.exe' : ''}`)
    } catch (err) {
      log.error('AutoExport.init: git not found:', err)
      this.git = null
    }
    if (this.git) log.debug('AutoExport: git found at', this.git)
  }

  public async pull(repo) {
    if (!repo) return

    await this.exec(this.git, ['pull'], repo)
  }

  public async push(repo, name) {
    if (!repo) return

    await this.exec(this.git, ['add', name], repo)
    await this.exec(this.git, ['commit', '-m', name], repo)
    await this.exec(this.git, ['push'], repo)
  }

  public add(ae) {
    for (const pref of this.prefOverrides) {
      ae[pref] = Prefs.get(pref)
    }
    log.debug('AutoExport.add', ae)
    this.db.removeWhere({ path: ae.path })
    this.db.insert(ae)

    if (this.gitPush(ae.path).repo) this.schedule(ae.type, [ae.id]) // causes initial push to overleaf at the cost of a unnecesary extra export
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

  public gitPush(path) {
    let found
    try {
      found = this._gitPush(path)
      log.debug('gitPush::', { found })
    } catch (err) {
      log.error('gitPush::', err)
      found = {}
    }
    return found
  }

  private gitDir(repo) {
    if (!repo.exists()) return null
    if (!repo.isDirectory()) return null

    const git = repo.clone()
    git.append('.git')

    if (!git.exists()) return null
    if (!git.isDirectory()) return null

    return git
  }

  private _gitPush(path) {
    if (!this.git) return {}

    log.debug('gitPush:', path)

    const name = Zotero.File.pathToFile(path)
    let repo = name.clone() // assumes that we're handed a bibfile!
    let git = null

    while (repo.parent) {
      repo = repo.parent
      git = this.gitDir(repo)
      if (git) break
    }

    if (!git) {
      log.debug('gitPush:', path, 'is not in a repo')
      return {}
    }

    log.debug('gitPush: repo found at', repo.path)

    git.append('config')
    log.debug('gitPush: looking for config at', git.path, git.exists())
    if (!git.exists() || !git.isFile()) {
      log.debug('gitPush: config', git.path, 'is not a file')
      return {}
    }

    log.debug('gitPush: repo config found at', git.path)

    let config = {}

    try {
      config = ini.parse(Zotero.File.getContents(git))
      log.debug('gitPush: config=', config)
    } catch (err) {
      log.debug('gitPush: error parsing config', git.path, err)
    }

    // enable with 'git config zotero.betterbibtex.push true'
    const enabled = (config['zotero "betterbibtex"'] || {}).push
    log.debug('git config found for', repo.path, 'enabled =', { enabled })

    if (enabled !== 'true' && enabled !== true) return {}

    if (!this.normalizePath(name.path).startsWith(this.normalizePath(repo.path))) throw new Error(`${name.path} not in ${repo.path}?!`)
    if (name.path[repo.path.length] !== (this.onWindows ? '\\' : '/')) throw new Error(`${name.path} not in directory ${repo.path} (${name.path[repo.path.length]} vs ${this.onWindows ? '\\' : '/'})?!`)

    return { repo: repo.path, name: name.path.substring(repo.path.length + 1) }
  }

  private normalizePath(path) {
    return this.onWindows ? path.toLowerCase() : path
  }

  // https://firefox-source-docs.mozilla.org/toolkit/modules/subprocess/toolkit_modules/subprocess/index.html
  private async exec(cmd, args, workdir) {
    const proc = await Subprocess.call({
      command: cmd,
      arguments: args,
      workdir,
    })
    log.debug('AutoExport.exec:', { cmd, args, workdir }, ':', await proc.stdout.readString())
  }
}
