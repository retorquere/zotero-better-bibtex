import { XULoki as Loki } from './loki'
import { Events } from '../events'
import { Store } from './store'
import { Preference } from '../../gen/preferences'

const version = require('../../gen/version.js')
import * as translators from '../../gen/translators.json'

import { override } from '../prefs-meta'
import type { Preferences } from '../../gen/preferences'

class Cache extends Loki {
  private initialized = false

  public remove(ids, _reason) {
    if (!this.initialized) return

    const query = Array.isArray(ids) ? { itemID : { $in : ids } } : { itemID: { $eq: ids } }

    for (const coll of this.collections) {
      coll.findAndRemove(query)
    }
  }

  public reset() {
    if (!this.initialized) return

    for (const coll of this.collections) {
      coll.removeDataOnly()
    }
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

    // old cache, drop
    if (coll.where(o => typeof o.legacy === 'boolean').length) coll.removeDataOnly()

    clearOnUpgrade(coll, 'Zotero', Zotero.version)

    // this reaps unused cache entries -- make sure that cacheFetchs updates the object
    //                  secs    mins  hours days
    const ttl =         1000  * 60  * 60  * 24 * 30 // eslint-disable-line no-magic-numbers
    const ttlInterval = 1000  * 60  * 60  * 4       // eslint-disable-line no-magic-numbers

    const modified = {}
    // SQLITE gives time in seconds, LokiJS time is in milliseconds
    for (const item of await Zotero.DB.queryAsync('SELECT itemID, strftime("%s", dateModified) * 1000 AS modified FROM items WHERE itemID NOT IN (select itemID from deletedItems)')) {
      modified[item.itemID] = item.modified
    }

    for (const translator of Object.keys(translators.byName)) {
      coll = this.schemaCollection(translator, {
        logging: false,
        indices: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', ...(override.names) ],
        schema: {
          type: 'object',
          properties: {
            itemID: { type: 'integer' },
            reference: { type: 'string' },

            // options
            exportNotes: { type: 'boolean' },
            useJournalAbbreviation: { type: 'boolean' },

            // prefs
            ...(override.types),

            // Optional
            metadata: { type: 'object' },

            // LokiJS
            meta: { type: 'object' },
            $loki: { type: 'integer' },
          },
          required: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', ...(override.names), 'reference' ],
          additionalProperties: false,
        },
        ttl,
        ttlInterval,
      })

      // old cache, drop
      if (coll.findOne({ [override.names[0]]: {$eq: undefined} })) coll.removeDataOnly()

      // should have been dropped after object change/delete
      for (const outdated of coll.data.filter(item => !modified[item.itemID] || modified[item.itemID] >= (item.meta?.updated || item.meta?.created || 0))) {
        coll.remove(outdated)
      }

      clearOnUpgrade(coll, 'BetterBibTeX', version)
    }

    this.initialized = true
  }
}
// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const DB = new Cache('cache', { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  autosave: true,
  adapter: new Store({ storage: 'file', deleteAfterLoad: true, allowPartial: true }),
})

const METADATA = 'Better BibTeX metadata'

function clearOnUpgrade(coll, property, current) {
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

  if (drop) coll.removeDataOnly()

  coll.setTransform(METADATA, [{
    type: METADATA,
    value : { [property]: current },
  }])
}

// the preferences influence the output way too much, no keeping track of that
Events.on('preference-changed', () => {
  Zotero.BetterBibTeX.loaded.then(() => { DB.reset() })
})
Events.on('items-changed', ids => {
  Zotero.BetterBibTeX.loaded.then(() => { DB.remove(ids, 'items-changed') })
})

// cleanup
if (DB.getCollection('cache')) { DB.removeCollection('cache') }
if (DB.getCollection('serialized')) { DB.removeCollection('serialized') }

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function selector(itemID: number | number[], options: any, prefs: Preferences) {
  const query = {
    exportNotes: !!options.exportNotes,
    useJournalAbbreviation: !!options.useJournalAbbreviation,
    itemID: Array.isArray(itemID) ? {$in: itemID} : itemID,
  }
  for (const pref of override.names) {
    query[pref] = prefs[pref]
  }
  return query
}
