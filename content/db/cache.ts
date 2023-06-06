import { XULoki as Loki, $and } from './loki'
import { Events } from '../events'
import { File } from './store/file'
import { Preference } from '../prefs'
import { affects, schema } from '../../gen/preferences/meta'
import { log } from '../logger'
import { Cache as CacheTypes } from '../../typings/cache'
import { clone } from '../clone'

import { orchestrator } from '../orchestrator'

const version = require('../../gen/version.js')

import type { Preferences } from '../../gen/preferences/meta'

const METADATA = 'Better BibTeX metadata'

class Cache extends Loki {
  private initialized = false

  constructor(name: string, options) {
    super(name, options)

    orchestrator.add({
      id: 'cache',
      description: 'cache',
      needs: ['start', 'databases'],
      startup: async () => {
        await this.init()
        return 'cache load ready'
      },
      shutdown: async () => {
        const store = this.persistenceAdapter?.constructor?.name || 'Unknown'
        this.throttledSaves = false
        log.debug(`Loki.${store}.shutdown: saving ${this.filename}`)
        await this.saveDatabaseAsync()
        log.debug(`Loki.${store}.shutdown: closing ${this.filename}`)
        await this.closeAsync()
      },
    })
  }

  private async init() {
    await this.loadDatabaseAsync()

    let coll = this.schemaCollection('itemToExportFormat', {
      indices: [ 'itemID' ],
      logging: false,
      cloneObjects: false,
      schema: {
        type: 'object',
        properties: {
          itemID: { type: 'integer' },
          item: { type: 'object' },

          // LokiJS
          meta: { type: 'object' },
          $loki: { type: 'integer' },
        },
        required: [ 'itemID', 'item' ],
        additionalProperties: false,
      },
    })
    if (!Preference.cache) coll.removeDataOnly()

    this.clearOnUpgrade(coll, 'Zotero', Zotero.version)

    // this reaps unused cache entries -- make sure that cacheFetchs updates the object
    //                  secs    mins  hours days
    const ttl =         1000  * 60  * 60  * 24 * 30 // eslint-disable-line no-magic-numbers
    const ttlInterval = 1000  * 60  * 60  * 4       // eslint-disable-line no-magic-numbers

    const modified = {}
    // SQLITE gives time in seconds, LokiJS time is in milliseconds
    for (const item of await Zotero.DB.queryAsync('SELECT itemID, strftime("%s", dateModified) * 1000 AS modified FROM items WHERE itemID NOT IN (select itemID from deletedItems)')) {
      modified[item.itemID] = item.modified
    }

    for (const [name, translator] of Object.entries(schema.translator)) {
      if (!translator.cache) continue

      coll = this.schemaCollection(name, {
        logging: false,
        indices: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', ...(translator.preferences) ],
        schema: translator.cache,
        ttl,
        ttlInterval,
      })
      if (!Preference.cache) {
        coll.removeDataOnly()
      }
      else if (! (coll.data[0]?.entry) ) { // phase out reference
        coll.removeDataOnly()
      }
      else {
        this.clearOnUpgrade(coll, 'BetterBibTeX', version)
      }
    }

    this.initialized = true
  }

  public remove(ids, _reason) {
    if (!this.initialized) return

    const query = Array.isArray(ids) ? { itemID : { $in : ids } } : { itemID: { $eq: ids } }

    for (const coll of this.collections) {
      coll.findAndRemove(query)
    }
  }

  public reset(reason: string, affected?: string[]) {
    if (!this.initialized) return

    for (const coll of this.collections) {
      if (!affected || affected.includes(coll.name)) this.drop(coll, reason)
    }
  }

  private drop(coll: any, _reason: string) {
    coll.removeDataOnly()
  }

  private clearOnUpgrade(coll, property, current) {
    const dbVersion = (coll.getTransform(METADATA) || [{value: {}}])[0].value[property]
    if (current && dbVersion === current) return

    const drop = !Preference.retainCache
    const msg = drop ? { dropping: 'dropping', because: 'because' } : { dropping: 'keeping', because: 'even though' }
    if (dbVersion) {
      Zotero.debug(`:Cache:${msg.dropping} cache ${coll.name} ${msg.because} ${property} went from ${dbVersion} to ${current}`)
    }
    else {
      Zotero.debug(`:Cache:${msg.dropping} cache ${coll.name} ${msg.because} ${property} was not set (current: ${current})`)
    }

    if (drop) this.drop(coll, 'clear on upgrade')

    coll.setTransform(METADATA, [{
      type: METADATA,
      value : { [property]: current },
    }])
  }

  public state(): { entries: number } {
    return {
      entries: this.collections.reduce((acc, coll) => acc + coll.data.length, 0),
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  selector(translator: string, options: any, prefs: Partial<Preferences>) {
    const query = {
      exportNotes: !!options.exportNotes,
      useJournalAbbreviation: !!options.useJournalAbbreviation,
      // itemID: Array.isArray(itemID) ? {$in: itemID} : itemID,
    }
    for (const pref of schema.translator[translator].preferences) {
      query[pref] = prefs[pref]
    }
    return query
  }

  fetch(translator: string, itemID: number, options: { exportNotes?: boolean, useJournalAbbreviation?: boolean }, prefs: Preferences): CacheTypes.ExportedItem {
    if (!Preference.cache) return null

    const collection = this.getCollection(translator)
    if (!collection) return null

    options = {
      exportNotes: false,
      useJournalAbbreviation: false,
      ...options,
    }

    // not safe in async!
    const cloneObjects = collection.cloneObjects
    collection.cloneObjects = false
    const cached = collection.findOne($and({...this.selector(translator, options, prefs), itemID}))
    collection.cloneObjects = cloneObjects

    if (!cached) return null

    // collection.update(cached) // touches the cache object so it isn't reaped too early

    // direct-DB access for speed...
    cached.meta.updated = (new Date).getTime() // touches the cache object so it isn't reaped too early
    collection.dirty = true

    // isolate object, because it was not fetched using clone
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return clone(cached)
  }

  store(translator: string, itemID: number, options: { exportNotes?: boolean, useJournalAbbreviation?: boolean }, prefs: any, entry: any, metadata: any) {
    if (!Preference.cache) return false

    if (!metadata) metadata = {}

    options = {
      exportNotes: false,
      useJournalAbbreviation: false,
      ...options,
    }

    const collection = this.getCollection(translator)
    if (!collection) {
      log.error('cacheStore: cache', translator, 'not found')
      return false
    }

    const selector = {...this.selector(translator, options, prefs), itemID}
    let cached = collection.findOne($and(selector))

    if (cached) {
      cached.entry = entry
      cached.metadata = metadata
      cached = collection.update(cached)
    }
    else {
      collection.insert({...selector, entry, metadata})
    }

    return true
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const DB = new Cache('cache', { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  autosave: true,
  adapter: new File(),
})

// the preferences influence the output way too much, no keeping track of that
Events.on('preference-changed', async pref => {
  await Zotero.BetterBibTeX.ready
  DB.reset(`pref ${pref} changed`, affects[pref])
})
Events.on('items-changed', async ids => {
  await Zotero.BetterBibTeX.ready
  DB.remove(ids, 'items-changed')
})

// cleanup
if (DB.getCollection('cache')) { DB.removeCollection('cache') }
if (DB.getCollection('serialized')) { DB.removeCollection('serialized') }
