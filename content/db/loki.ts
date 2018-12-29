declare const Components: any
declare const Zotero: any
declare const AsyncShutdown: any

Components.utils.import('resource://gre/modules/AsyncShutdown.jsm')
import { patch as $patch$ } from '../monkey-patch'

import AJV = require('ajv')
import * as log from '../debug'
import { Preferences as Prefs } from '../prefs'

// tslint:disable-next-line:variable-name
import Loki = require('lokijs')

const validator = new AJV({ useDefaults: true, coerceTypes: true })
require('ajv-keywords')(validator)

// 894
$patch$(Loki.Collection.prototype, 'findOne', original => function() {
  if (!this.data.length) return null

  return original.apply(this, arguments)
})

$patch$(Loki.Collection.prototype, 'insert', original => function(doc) {
  if (this.validate && !this.validate(doc)) {
    const err = new Error(`insert: validation failed for ${JSON.stringify(doc)} (${JSON.stringify(this.validate.errors)})`)
    log.error('insert: validation failed for', doc, this.validate.errors, err)
    throw err
  }
  return original.apply(this, arguments)
})

$patch$(Loki.Collection.prototype, 'update', original => function(doc) {
  if (this.validate && !this.validate(doc)) {
    const err = new Error(`update: validation failed for ${JSON.stringify(doc)} (${JSON.stringify(this.validate.errors)})`)
    log.error('update: validation failed for', doc, this.validate.errors, err)
    throw err
  }
  return original.apply(this, arguments)
})

// TODO: workaround for https://github.com/techfort/LokiJS/issues/595#issuecomment-322032656
$patch$(Loki.prototype, 'close', original => function(callback) {
  return original.call(this, errClose => {
    if (this.persistenceAdapter && (typeof this.persistenceAdapter.close === 'function')) {
      return this.persistenceAdapter.close(this.filename, errCloseAdapter => callback(errClose || errCloseAdapter))
    } else {
      return callback(errClose)
    }
  })
})

class NullStore {
  public mode = 'reference'

  public exportDatabase(name, dbref, callback) { return callback(null) }
  public loadDatabase(name, callback) { return callback(null) }
}

const autoSaveOnIdle = []

const idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
idleService.addIdleObserver({
  async observe(subject, topic, data) {
    for (const db of autoSaveOnIdle) {
      if (!db.autosaveDirty()) continue

      log.debug('idle, saving', db.filename)
      try {
        await db.saveDatabaseAsync()
      } catch (err) {
        log.error('idle, saving failed', db.filename, err)
      }
    }
  },
}, 5) // tslint:disable-line:no-magic-numbers

// https://github.com/Microsoft/TypeScript/issues/17032
export class XULoki extends Loki {
  constructor(name, options: any = {}) {
    const nullStore = !options.adapter
    options.adapter = options.adapter || new NullStore()
    options.env = 'XUL-Chrome'

    const periodicSave = options.autosaveInterval
    if (periodicSave) options.autosave = true

    super(name, options)

    if (periodicSave) {
      autoSaveOnIdle.push(this)
    } else {
      // workaround for https://github.com/techfort/LokiJS/issues/597
      this.autosaveDisable()
    }

    if (this.persistenceAdapter && !nullStore) {
      AsyncShutdown.profileBeforeChange.addBlocker(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closing ${name}`, async () => {
        log.debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closing ${name}`)

        // setTimeout is disabled during shutdown and throws errors
        this.throttledSaves = false

        try {
          await this.saveDatabaseAsync()
          await this.closeAsync()
          log.debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closed ${name}`)
        } catch (err) {
          log.error(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close ${name} failed`, err)
        }
      })
    }
  }

  public loadDatabaseAsync(options = {}) {
    const deferred = Zotero.Promise.defer()
    this.loadDatabase(options, err => {
      if (err) return deferred.reject(err)
      deferred.resolve(null)
    })
    return deferred.promise
  }

  public saveDatabaseAsync() {
    const deferred = Zotero.Promise.defer()
    this.saveDatabase(err => {
      if (err) return deferred.reject(err)
      deferred.resolve(null)
    })
    return deferred.promise
  }

  public closeAsync() {
    const deferred = Zotero.Promise.defer()
    this.close(err => {
      if (err) return deferred.reject(err)
      deferred.resolve(null)
    })
    return deferred.promise
  }

  public schemaCollection(name, options) {
    options.cloneObjects = true
    options.clone = true
    const coll = this.getCollection(name) || this.addCollection(name, options)

    if (options.logging && Prefs.get('testing')) {
      for (const event of ['insert', 'delete', 'update']) {
        ((e, n, db) => coll.on(e, data => log.debug(`DB Event: ${db}.${n}.${e}`, data)))(event, name, this.filename)
      }
    }

    log.debug('installing schema for', name, options.schema);

    (coll as any).validate = validator.compile(options.schema)

    return coll
  }
}
