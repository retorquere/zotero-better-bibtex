/* eslint-disable @typescript-eslint/explicit-module-boundary-types, prefer-arrow/prefer-arrow-functions, prefer-rest-params, @typescript-eslint/no-unsafe-return */

declare const Components: any

Components.utils.import('resource://gre/modules/AsyncShutdown.jsm')
declare const AsyncShutdown: any

// Components.utils.import('resource://gre/modules/Sqlite.jsm')
// declare const Sqlite: any

import { patch as $patch$ } from '../monkey-patch'

import AJV from 'ajv'
import { log } from '../logger'
// import { Preferences as Prefs } from '../prefs'

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
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
    }
    else {
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
      try {
        AsyncShutdown.profileBeforeChange.addBlocker(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closing ${name}`, async () => {
        // Sqlite.shutdown.addBlocker(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close of ${name}`, async () => {
          // setTimeout is disabled during shutdown and throws errors
          this.throttledSaves = false

          try {
            Zotero.debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close of ${name}`)
            await this.saveDatabaseAsync()
            await this.closeAsync()
            Zotero.debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close of ${name} completed`)
          }
          catch (err) {
            Zotero.debug(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close of ${name} failed`)
            log.error(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close of ${name} failed`, err)
          }
        })
      }
      catch (err) {
        log.error(`Loki.${this.persistenceAdapter.constructor.name || 'Unknown'} failed to install shutdown blocker!`, err)
      }
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
    return new Promise((resolve, reject) => {
      this.saveDatabase(err => {
        if (err) return reject(err)
        resolve(null)
      })
    })
  }

  public closeAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.close(err => {
        if (err) return reject(err)
        resolve(null)
      })
    })
  }

  public schemaCollection(name: string, options: any) {
    options.cloneObjects = true
    options.clone = true
    const coll: any = this.getCollection(name) || this.addCollection(name, options)

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

