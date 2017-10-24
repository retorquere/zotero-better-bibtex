declare const Components: any
declare const AsyncShutdown: any

Components.utils.import('resource://gre/modules/AsyncShutdown.jsm')
import $patch$ = require('../monkey-patch.ts')

import AJV = require('ajv')
import debug = require('../debug.ts')
import Prefs = require('../prefs.ts')

// tslint:disable-next-line:variable-name
import Loki = require('lokijs')

const validator = new AJV({ useDefaults: true, coerceTypes: true })
require('ajv-keywords')(validator)

$patch$(Loki.Collection.prototype, 'insert', original => function(doc) {
  if (this.validate && !this.validate(doc)) {
    const err = new Error(`insert: validation failed for ${JSON.stringify(doc)} (${JSON.stringify(this.validate.errors)})`)
    debug('insert: validation failed for', doc, this.validate.errors, err)
    throw err
  }
  return original.apply(this, arguments)
})

$patch$(Loki.Collection.prototype, 'update', original => function(doc) {
  if (this.validate && !this.validate(doc)) {
    const err = new Error(`update: validation failed for ${JSON.stringify(doc)} (${JSON.stringify(this.validate.errors)})`)
    debug('update: validation failed for', doc, this.validate.errors, err)
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

Loki.prototype.loadDatabaseAsync = function(options) {
  return new Promise((resolve, reject) => this.loadDatabase(options, err => err ? reject(err) : resolve(null)))
}

Loki.prototype.saveDatabaseAsync = function() {
  return new Promise((resolve, reject) => this.saveDatabase(err => err ? reject(err) : resolve(null)))
}

Loki.prototype.closeAsync = function() {
  return new Promise((resolve, reject) => this.close(err => err ? reject(err) : resolve(null)))
}

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

      debug('idle, saving', db.filename)
      try {
        await db.saveDatabaseAsync()
      } catch (err) {
        debug('idle, saving failed', db.filename, err)
      }
    }
  },
}, 5) // tslint:disable-line:no-magic-numbers

// https://github.com/Microsoft/TypeScript/issues/17032
export = class XULoki extends (Loki as { new(name, options): any }) {
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
        debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closing ${name}`)

        // setTimeout is disabled during shutdown and throws errors
        this.throttledSaves = false

        try {
          await this.closeAsync()
          debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closed ${name}`)
        } catch (err) {
          debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close ${name} failed`, err)
        }
      })
    }
  }

  public schemaCollection(name, options) {
    const coll = this.getCollection(name) || this.addCollection(name, options)

    if (options.logging && Prefs.get('testing')) {
      for (const event of ['insert', 'delete', 'update']) {
        ((e, n, db) => coll.on(e, data => debug(`DB Event: ${db}.${n}.${e}`, data)))(event, name, this.filename)
      }
    }

    coll.validate = validator.compile(options.schema)
    return coll
  }
}
