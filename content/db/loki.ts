/* eslint-disable @typescript-eslint/explicit-module-boundary-types, prefer-arrow/prefer-arrow-functions, prefer-rest-params, @typescript-eslint/no-unsafe-return */

Components.utils.import('resource://gre/modules/AsyncShutdown.jsm')
declare const AsyncShutdown: any

// Components.utils.import('resource://gre/modules/Sqlite.jsm')
// declare const Sqlite: any

import { patch as $patch$ } from '../monkey-patch'
import { Preference } from '../../gen/preferences'

import { log } from '../logger'
// import { Preferences as Prefs } from '../prefs'

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
import Loki = require('lokijs')

import AJV from 'ajv'
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
    alert(`Better BibTeX: error saving ${this.name}, restart to repair`)
    Preference.scrubDatabase = true
    throw err
  }
  return original.apply(this, arguments)
})

$patch$(Loki.Collection.prototype, 'update', original => function(doc) {
  if (this.validate && !this.validate(doc)) {
    const err = new Error(`update: validation failed for ${JSON.stringify(doc)} (${JSON.stringify(this.validate.errors)})`)
    log.error('update: validation failed for', doc, this.validate.errors, err)
    alert(`Better BibTeX: error saving ${this.name}, restart to repair`)
    Preference.scrubDatabase = true
    throw err
  }
  return original.apply(this, arguments)
})

// TODO: workaround for https://github.com/techfort/LokiJS/issues/595#issuecomment-322032656
$patch$(Loki.prototype, 'close', original => function(callback) {
  const store: string = this.persistenceAdapter.constructor.name || 'Unknown'
  Zotero.debug(`BBT: patched ${store}.close started`)
  return original.call(this, errClose => {
    Zotero.debug(`BBT: patched ${store}.close has ran: ${errClose}`)
    if (this.persistenceAdapter && (typeof this.persistenceAdapter.close === 'function')) {
      Zotero.debug(`BBT: patched ${store}.persistenceAdapter.close started`)
      this.persistenceAdapter.close(this.filename, errCloseAdapter => {
        Zotero.debug(`BBT: patched ${store}.persistenceAdapter.close finished: ${errClose || errCloseAdapter}`)
        callback(errClose || errCloseAdapter)
      })
    }
    else {
      callback(errClose)
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
  async observe(_subject: string, _topic: string, _data: any) {
    for (const db of autoSaveOnIdle) {
      if (!db.autosaveDirty()) continue

      try {
        await db.saveDatabaseAsync()
      }
      catch (err) {
        log.error('idle, saving failed', db.filename, err)
      }
    }
  },
}, 5) // eslint-disable-line no-magic-numbers

// https://github.com/Microsoft/TypeScript/issues/17032
export class XULoki extends Loki {
  constructor(name: string, options: any = {}) {
    const nullStore = !options.adapter
    options.adapter = options.adapter || new NullStore()
    options.env = 'XUL-Chrome'

    const periodicSave = options.autosaveInterval
    if (periodicSave) options.autosave = true

    super(name, options)

    if (periodicSave) {
      autoSaveOnIdle.push(this)
    }
    else {
      // workaround for https://github.com/techfort/LokiJS/issues/597
      this.autosaveDisable()
    }

    if (this.persistenceAdapter && !nullStore) {
      (function(db, dbname) {
        const store: string = db.persistenceAdapter.constructor.name || 'Unknown'
        try {
          AsyncShutdown.profileBeforeChange.addBlocker(`Loki.${store}.shutdown: closing ${dbname}`, async () => {
          // Sqlite.shutdown.addBlocker(`Loki.${store}.shutdown: close of ${dbname}`, async () => {
            // setTimeout is disabled during shutdown and throws errors
            db.throttledSaves = false

            try {
              Zotero.debug(`Loki.${store}.shutdown: saving ${dbname}`)
              await db.saveDatabaseAsync()
              Zotero.debug(`Loki.${store}.shutdown: closing ${dbname}`)
              await db.closeAsync()
              Zotero.debug(`Loki.${store}.shutdown: shutdown of ${dbname} completed`)
            }
            catch (err) {
              Zotero.debug(`Loki.${store}.shutdown: shutdown of ${dbname} failed`)
              log.error(`Loki.${store}.shutdown: shutdown of ${dbname} failed`, err)
            }
          })
        }
        catch (err) {
          log.error(`Loki.${store} failed to install shutdown blocker!`, err)
        }
      })(this, name)
    }
  }

  public loadDatabaseAsync(options = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadDatabase(options, err => {
        if (err) return reject(err)
        resolve(null)
      })
    })
  }

  public saveDatabaseAsync(): Promise<void> {
    const store = this.persistenceAdapter.constructor.name
    Zotero.debug(`BBT: ${store}.saveDatabaseAsync started`)
    return new Promise((resolve, reject) => {
      this.saveDatabase(err => {
        Zotero.debug(`BBT: ${store}.saveDatabaseAsync finished: ${err}`)
        if (err) {
          reject(err)
        }
        else {
          resolve(null)
        }
      })
    })
  }

  public closeAsync(): Promise<void> {
    const store = this.persistenceAdapter.constructor.name
    Zotero.debug(`BBT: ${store}.closeAsync started`)
    return new Promise((resolve, reject) => {
      this.close(err => {
        Zotero.debug(`BBT: ${store}.closeAsync finished`)
        if (err) {
          reject(err)
        }
        else {
          resolve(null)
        }
      })
    })
  }

  public schemaCollection(name: string, options: any) {
    options.cloneObjects = true
    options.clone = true
    const coll: any = this.getCollection(name) || this.addCollection(name, options)
    coll.cloneObjects = true

    log.debug('compiling', JSON.stringify(options.schema, null, 2))
    coll.validate = validator.compile(options.schema)

    return coll
  }
}

type QueryPrimitive = number | boolean | string | undefined
export type Query
  = { [field: string]: { $eq: QueryPrimitive } }
  | { [field: string]: { $ne: QueryPrimitive } }
  | { [field: string]: { $in: QueryPrimitive[] } }
  | { $and: Query[] }

export function $and(query): Query {
  let and: Query = { $and: Object.entries(query).map(([k, v]: [string, QueryPrimitive | Query]) => ({ [k]: typeof v === 'object' ? v : {$eq: v } })) as Query[] }
  if (and.$and.length === 1) and = and.$and[0]
  return and
}

