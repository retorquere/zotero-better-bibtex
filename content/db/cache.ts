import { XULoki as Loki } from './loki'
import { Events } from '../events'
import { File } from './store/file'
import { affects, Preference } from '../../gen/preferences'
import { log } from '../logger'

const version = require('../../gen/version.js')
import * as translators from '../../gen/translators.json'

import { override } from '../prefs-meta'
import type { Preferences } from '../../gen/preferences'

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
    log.debug('cache.itemToExportFormat:', coll.data.length)

    // old cache, drop
    if (coll.where(o => typeof o.legacy === 'boolean').length) this.drop(coll, 'legacy cache')


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
      log.debug(`cache.${coll.name}:`, coll.data.length)

      // old cache, drop
      if (coll.findOne({ [override.names[0]]: {$eq: undefined} })) {
        this.drop(coll, 'legacy cache without overrides')
      }
      // how did this get in here? #1809
      else if (coll.data.find(rec => !rec.$loki)) {
        this.drop(coll, 'entries without id')
      }
      else {
        // should have been dropped after object change/delete
        const outdated = coll.data.filter(item => !modified[item.itemID] || modified[item.itemID] >= (item.meta?.updated || item.meta?.created || false))
        if (outdated.length) log.debug('removing', outdated.length, 'mis-cached items')
        for (const item of outdated) {
          coll.remove(item)
        }
      }

      this.clearOnUpgrade(coll, 'BetterBibTeX', version)
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
export function selector(itemID: number | number[], options: any, prefs: Partial<Preferences>) {
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
