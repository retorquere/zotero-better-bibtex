import { XULoki as Loki } from './loki'
import { Events } from '../events'
import { File } from './store/file'
import { Preference } from '../prefs'
import { affects, schema } from '../../gen/preferences/meta'
import { log } from '../logger'

const version = require('../../gen/version.js')

import type { Preferences } from '../../gen/preferences/meta'

const METADATA = 'Better BibTeX metadata'

class Cache extends Loki {
  private initialized = false

  public remove(ids, _reason) {
    if (!this.initialized) return

    const query = Array.isArray(ids) ? { itemID : { $in : ids } } : { itemID: { $eq: ids } }

    for (const coll of this.collections) {
      coll.findAndRemove(query)
    }
  }

  public reset(reason: string, affected?: string[]) {
    if (!this.initialized) return

    log.debug('cache drop:', reason, affected || '*')

    for (const coll of this.collections) {
      if (!affected || affected.includes(coll.name)) this.drop(coll, reason)
    }
  }

  private drop(coll: any, reason: string) {
    log.debug(`dropping cache.${coll.name}:`, reason)
    coll.removeDataOnly()
  }

  public async init() {
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
      if (!translator.cached) continue

      coll = this.schemaCollection(name, {
        logging: false,
        indices: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', ...(translator.preferences) ],
        schema: {
          type: 'object',
          properties: {
            itemID: { type: 'integer' },
            entry: { type: 'string' },

            // options
            exportNotes: { type: 'boolean' },
            useJournalAbbreviation: { type: 'boolean' },

            // prefs
            ...(translator.types),

            // Optional
            metadata: { type: 'object' },

            // LokiJS
            meta: { type: 'object' },
            $loki: { type: 'integer' },
          },
          required: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', ...(translator.preferences), 'entry' ],
          additionalProperties: false,
        },
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
}
// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const DB = new Cache('cache', { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  autosave: true,
  adapter: new File(),
})

// the preferences influence the output way too much, no keeping track of that
Events.on('preference-changed', pref => {
  Zotero.BetterBibTeX.loaded.then(() => { DB.reset(`pref ${pref} changed`, affects[pref]) })
})
Events.on('items-changed', ids => {
  Zotero.BetterBibTeX.loaded.then(() => { DB.remove(ids, 'items-changed') })
  DB.remove(ids, 'items-changed')
})

// cleanup
if (DB.getCollection('cache')) { DB.removeCollection('cache') }
if (DB.getCollection('serialized')) { DB.removeCollection('serialized') }

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function selector(translator: string, options: any, prefs: Partial<Preferences>) {
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
