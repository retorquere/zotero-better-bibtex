declare const Zotero: any

import { createFile } from '../create-file'
import { XULoki as Loki } from './loki'
import * as log from '../debug'
import { Events } from '../events'
import { ZoteroConfig } from '../zotero-config'

const version = require('../../gen/version.js')
const translators = require('../../gen/translators.json')

const prefOverrides = require('../../gen/preferences/auto-export-overrides.json')
const prefOverridesSchema = require('../../gen/preferences/auto-export-overrides-schema.json')

class NoSuchFileError extends Error {
  public name = 'NoSuchFile'

  constructor(message) {
    super(message)
  }
}

class FileStore {
  public mode = 'reference'

  private collectionsMissing = false

  public name(name) { return name + '.json' }

  public save(name, data) {
    log.debug('FileStore.save', name)
    const db = createFile(name + '.saving')
    Zotero.File.putContents(db, JSON.stringify(data))
    db.moveTo(null, this.name(name))
    log.debug('FileStore.saved', name, 'to', this.name(name))
  }

  public load(name) {
    name = this.name(name)
    log.debug('FileStore.load', name)
    const db = createFile(name)
    if (!db.exists()) throw new NoSuchFileError(`${db.path} not found`)
    const data = JSON.parse(Zotero.File.getContents(db))

    // this is intentional. If all is well, the database will be retained in memory until it's saved at
    // shutdown. If all is not well, this will make sure the caches are rebuilt from scratch
    db.remove(true)

    return data
  }

  public exportDatabase(name, dbref, callback) {
    log.debug('FileStore.exportDatabase: saving', name)

    try {
      for (const coll of dbref.collections) {
        if (coll.dirty || this.collectionsMissing) this.save(`${name}.${coll.name}`, coll)
      }
      // save header last for sort-of-transaction
      this.save(name, {...dbref, ...{collections: dbref.collections.map(coll => coll.name)}})
      this.collectionsMissing = false
    } catch (err) {
      log.error('LokiJS.FileStore.exportDatabase: save failed', err)
    }

    log.debug('LokiJS.FileStore.exportDatabase: save completed', name)
    return callback(null)
  }

  public loadDatabase(name, callback) {
    log.debug('FileStore.loadDatabase: loading', name)

    let db
    try {
      db = this.load(name)
    } catch (err) {
      if (err.name === 'NoSuchFile') {
        log.debug('LokiJS.FileStore.loadDatabase: new database')
      } else {
        log.error(err)
      }
      return callback(null)
    }

    try {
      const collections = []
      for (const coll of db.collections) {
        try {
          const data = this.load(`${name}.${coll}`)
          data.cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
          data.adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654
          Zotero.debug(`Loaded ${name}.${coll}: ${JSON.stringify(data.transforms)}`)
          collections.push(data)
        } catch (err) {
          this.collectionsMissing = true
          log.error('LokiJS.FileStore.loadDatabase: collection load failed, proceeding', err)
        }
      }
      db.collections = collections
    } catch (err) {
      log.error('LokiJS.FileStore.loadDatabase: load failed', err)
    }

    return callback(db)
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let DB = new Loki('cache', { // tslint:disable-line:variable-name
  autosave: true,
  adapter: new FileStore(),
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

DB.init = () => {
  DB.loadDatabase()
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
