declare const Zotero: any

import { XULoki as Loki } from './loki'
import * as log from '../debug'
import { Events } from '../events'
import { ZoteroConfig } from '../zotero-config'
import { Store } from './store'

const version = require('../../gen/version.js')
const translators = require('../../gen/translators.json')

const prefOverrides = require('../../gen/preferences/auto-export-overrides.json')
const prefOverridesSchema = require('../../gen/preferences/auto-export-overrides-schema.json')

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let DB = new Loki('cache', { // tslint:disable-line:variable-name
  autosave: true,
  adapter: new Store({ storage: 'file', deleteAfterLoad: true, allowPartial: true }),
})

const METADATA = 'Better BibTeX metadata'

DB.remove = function(ids) {
  const query = Array.isArray(ids) ? { itemID : { $in : ids } } : { itemID: ids }

  for (const coll of this.collections) {
    coll.findAndRemove(query)
  }
}

function clearOnUpgrade(coll, property, current) {
  const dbVersion = (coll.getTransform(METADATA) || [{value: {}}])[0].value[property]
  if (current && dbVersion === current) {
    Zotero.debug(`CACHE: retaining cache ${coll.name} because stored ${property} is ${dbVersion} (current: ${current})`)
    return
  }

  if (dbVersion) {
    Zotero.debug(`CACHE: dropping cache ${coll.name} because ${property} went from ${dbVersion} to ${current}`)
  } else {
    Zotero.debug(`CACHE: dropping cache ${coll.name} because ${property} was not set (current: ${current})`)
  }

  coll.removeDataOnly()

  coll.setTransform(METADATA, [{
    type: METADATA,
    value : { [property]: current },
  }])
}

DB.init = async () => {
  await DB.loadDatabaseAsync()

  let coll = DB.schemaCollection('itemToExportFormat', {
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
  for (const translator of Object.keys(translators.byName)) {
    coll = DB.schemaCollection(translator, {
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
          metadata: { type: 'object', default: {} },

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

    clearOnUpgrade(coll, 'BetterBibTeX', version)
  }
}

// the preferences influence the output way too much, no keeping track of that
Events.on('preference-changed', async () => {
  await Zotero.BetterBibTeX.ready

  for (const translator of Object.keys(translators.byName)) {
    log.debug('DB Event: drop', translator)
    DB.getCollection(translator).removeDataOnly()
  }
})

// cleanup
if (DB.getCollection('cache')) { DB.removeCollection('cache') }
if (DB.getCollection('serialized')) { DB.removeCollection('serialized') }
