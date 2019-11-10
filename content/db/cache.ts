declare const Zotero: any

import { XULoki as Loki } from './loki'
import * as log from '../debug'
import { Events } from '../events'
import { ZoteroConfig } from '../zotero-config'
import { Store } from './store'

const version = require('../../gen/version.js')
import * as translators from '../../gen/translators.json'

import * as prefOverrides from '../../gen/preferences/auto-export-overrides.json'
import * as prefOverridesSchema from '../../gen/preferences/auto-export-overrides-schema.json'

class Cache extends Loki {
  private initialized = false

  public remove(ids, reason) {
    if (!this.initialized) {
      log.debug(':Cache:remove', reason, 'skipped, not initialized')
      return
    }

    log.debug(':Cache:remove', reason, ids)

    const query = Array.isArray(ids) ? { itemID : { $in : ids } } : { itemID: ids }

    for (const coll of this.collections) {
      coll.findAndRemove(query)
    }
  }

  public reset() {
    if (!this.initialized) {
      log.debug(':Cache:reset skipped, not initialized')
      return
    }
    for (const coll of this.collections) {
      coll.removeDataOnly()
    }
  }

  public async init() {
    await this.loadDatabaseAsync()

    let coll = this.schemaCollection('itemToExportFormat', {
      indices: [ 'itemID', 'legacy', 'skipChildItems' ],
      logging: true,
      cloneObjects: true,
      schema: {
        type: 'object',
        properties: {
          itemID: { type: 'integer' },
          legacy: { type: 'boolean' },
          skipChildItems: { type: 'boolean' },
          item: { type: 'object' },

          // LokiJS
          meta: { type: 'object' },
          $loki: { type: 'integer' },
        },
        required: [ 'itemID', 'legacy', 'skipChildItems', 'item' ],
        additionalProperties: false,
      },
    })

    clearOnUpgrade(coll, 'Zotero', ZoteroConfig.Zotero.version)

    // this reaps unused cache entries -- make sure that cacheFetchs updates the object
    //                  secs    mins  hours days
    const ttl =         1000  * 60  * 60  * 24 * 30 // tslint:disable-line:no-magic-numbers
    const ttlInterval = 1000  * 60  * 60  * 4       // tslint:disable-line:no-magic-numbers

    const modified = {}
    // SQLITE gives time in seconds, LokiJS time is in milliseconds
    for (const item of await Zotero.DB.queryAsync('SELECT itemID, strftime("%s", dateModified) * 1000 AS modified FROM items WHERE itemID NOT IN (select itemID from deletedItems)')) {
      modified[item.itemID] = item.modified
    }

    for (const translator of Object.keys(translators.byName)) {
      coll = this.schemaCollection(translator, {
        logging: true,
        indices: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', ...prefOverrides ],
        schema: {
          type: 'object',
          properties: {
            itemID: { type: 'integer' },
            reference: { type: 'string' },

            // options
            exportNotes: { type: 'boolean' },
            useJournalAbbreviation: { type: 'boolean' },

            // prefs
            ...prefOverridesSchema,

            // Optional
            metadata: { type: 'object' },

            // LokiJS
            meta: { type: 'object' },
            $loki: { type: 'integer' },
          },
          required: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', ...prefOverrides, 'reference' ],
          additionalProperties: false,
        },
        ttl,
        ttlInterval,
      })

      // old cache, drop
      if (coll.findOne({ [prefOverrides[0]]: undefined })) coll.removeDataOnly()

      // should have been dropped after object change/delete
      for (const oudated of coll.data.filter(item => !modified[item.itemID] || modified[item.itemID] >= (item.meta.updated || item.meta.created))) {
        coll.remove(oudated)
      }

      clearOnUpgrade(coll, 'BetterBibTeX', version)
    }

    this.initialized = true
  }
}
// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let DB = new Cache('cache', { // tslint:disable-line:variable-name
  autosave: true,
  adapter: new Store({ storage: 'file', deleteAfterLoad: true, allowPartial: true }),
})

const METADATA = 'Better BibTeX metadata'

function clearOnUpgrade(coll, property, current) {
  const dbVersion = (coll.getTransform(METADATA) || [{value: {}}])[0].value[property]
  if (current && dbVersion === current) {
    Zotero.debug(`:Cache:retaining cache ${coll.name} because stored ${property} is ${dbVersion} (current: ${current})`)
    return
  }

  if (dbVersion) {
    Zotero.debug(`:Cache:dropping cache ${coll.name} because ${property} went from ${dbVersion} to ${current}`)
  } else {
    Zotero.debug(`:Cache:dropping cache ${coll.name} because ${property} was not set (current: ${current})`)
  }

  coll.removeDataOnly()

  coll.setTransform(METADATA, [{
    type: METADATA,
    value : { [property]: current },
  }])
}

// the preferences influence the output way too much, no keeping track of that
Events.on('preference-changed', async () => {
  await Zotero.BetterBibTeX.loaded
  DB.reset()
})

// cleanup
if (DB.getCollection('cache')) { DB.removeCollection('cache') }
if (DB.getCollection('serialized')) { DB.removeCollection('serialized') }
