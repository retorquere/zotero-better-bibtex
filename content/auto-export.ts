const debug = require('./debug.ts')

const Queue = require('better-queue')
const MemoryStore = require('better-queue-memory')
const Events = require('./events.coffee')
const DB = require('./db/main.coffee')
const Translators = require('./translators.coffee')
const Prefs = require('./prefs.coffee')

const scheduled = new Queue(
  (task, cb) => {
    (async => {
      const db = DB.getCollection('autoexport')
      if (let ae = db.get(task.id)) {
        debug('AutoExport.starting export', ae)
        ae.status = 'running'
        db.update(ae)

        try {
          let items
          switch (ae.type) {
            case 'collection':
              items = { collection: ae.  id }
              break
            case 'library':
              items = { library: ae.  id }
              break
            default:
              items = null
          }

          await Translators.translate(ae.translatorID, { exportNotes: ae.exportNotes, useJournalAbbreviation: ae.useJournalAbbreviation}, items, ae.path)
          ae.error = ''
        } catch (err) {
          debug('AutoExport.scheduled failed for', ae, err)
          ae.error = `${error}`
        }

        ae.status = 'done'
        ae.updated = new Date()
        db.update(ae)
      }

      cb(null)
    })().catch(err => {
      cb(err)
    })
  },

  {
    store:        new MemoryStore(),
    setImmediate: setTimeout.bind(null), // https://bugs.chromium.org/p/v8/issues/detail?id=4718
  }
)
scheduled.resume()

const debounce_delay = 1000
const scheduler = new Queue((function(task, cb) {
  task = Object.assign({}, task)
  debug('AutoExport.scheduler.exec:', task)

  (async => {
    const db = DB.getCollection('autoexport')
    if (let ae = db.get(task.id)) {
      debug('AutoExport.scheduler.task found:', task, '->', ae, !!ae)
      ae.status = 'scheduled'
      db.update(ae)
      debug('AutoExport.scheduler.task scheduled, waiting...', task, ae)

      await Zotero.Promise.delay(debounce_delay)

      debug('AutoExport.scheduler.task scheduled, woken', task, ae)

      if (task.cancelled) {
        debug('AutoExport.canceled export', ae)
      } else {
        debug('AutoExport.scheduled export', ae)
        scheduled.push(task)
      }
    }

    cb(null)
  })().catch(err => {
    cb(err)
  })

  return {
    cancel() { task.cancelled = true }
  }
}), {
  store: new MemoryStore(),
  cancelIfRunning: true,
  setImmediate: setTimeout.bind(null), // https://bugs.chromium.org/p/v8/issues/detail?id=4718
})

if (Prefs.get('autoExport') !== 'immediate') { scheduler.pause(); }

if (Zotero.Debug.enabled) {
  for (let event of [ 'empty', 'drain', 'task_queued', 'task_accepted', 'task_started', 'task_finish', 'task_failed', 'task_progress', 'batch_finish', 'batch_failed', 'batch_progress' ]) {
    (event => scheduler.on(event, function() { return debug(`AutoExport.scheduler.${event}`, Array.prototype.slice.call(arguments)); }))(event)
    (event => scheduled.on(event, function() { return debug(`AutoExport.scheduled.${event}`, Array.prototype.slice.call(arguments)); }))(event)
  }
}

const idleObserver = {
  observe(subject, topic, data) {
    debug(`AutoExport.idle: ${topic}`)
    if (Prefs.get('autoExport') !== 'idle') { return; }
    switch (topic) {
      case 'back': case 'active':
        scheduler.pause()
        break

      case 'idle':
        scheduler.resume()
        break
    }
  }
}
const idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
idleService.addIdleObserver(idleObserver, Prefs.get('autoExportIdleWait'))

Events.on('preference-changed', function(pref) {
  if (pref !== 'autoExport') { return; }

  debug('AutoExport: preference changed')

  switch (Prefs.get('autoExport')) {
    case 'immediate':
      scheduler.resume()
      break
    default: // / off / idle
      scheduler.pause()
  }
})

class AutoExport {
  constructor() {
    Events.on('libraries-changed', ids => this.schedule('library', ids))
    Events.on('libraries-removed', ids => this.remove('library', ids))
    Events.on('collections-changed', ids => this.schedule('collection', ids))
    Events.on('collections-removed', ids => this.remove('collection', ids))
  }

  public init() {
    this.db = DB.getCollection('autoexport')
    for (let ae of this.db.find({ status: { $ne: 'done' } })) {
      scheduler.push({ id: ae.$loki })
    }

    if (Prefs.get('autoExport') === 'immediate') { scheduler.resume(); }
  }

  public add(ae) {
    debug('AutoExport.add', ae)
    this.db.removeWhere({ path: ae.path })
    this.db.insert(ae)
  }

  public schedule(type, ids) {
    debug('AutoExport.schedule', type, ids, {db: this.db.data, state: Prefs.get('autoExport'), scheduler: !scheduler._stopped, scheduled: !scheduled._stopped})
    for (let ae of this.db.find({ type, id: { $in: ids } })) {
      debug('AutoExport.scheduler.push', ae.$loki)
      scheduler.push({ id: ae.$loki })
    }
  }

  public remove(type, ids) {
    debug('AutoExport.remove', type, ids, {db: this.db.data, state: Prefs.get('autoExport'), scheduler: !scheduler._stopped, scheduled: !scheduled._stopped})
    for (let ae of this.db.find({ type, id: { $in: ids } })) {
      scheduled.cancel(ae.$loki)
      scheduler.cancel(ae.$loki)
      this.db.remove(ae)
    }
  }

  public run(ae) {
    if (typeof ae === 'number') { ae = this.db.get(ae); }

    debug('Autoexport.run:', ae)
    ae.status = 'scheduled'
    this.db.update(ae)
    scheduled.push({ id: ae.$loki })
  }
}

module.exports = new AutoExport()
