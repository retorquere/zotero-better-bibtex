declare const Zotero: any

import { XULoki as Loki } from './loki'
import * as log from '../debug'
import { Preferences as Prefs } from '../prefs'
import { getItemsAsync } from '../get-items-async'

import { createFile } from '../create-file'

class DBStore {
  public mode = 'reference'

  private conn: any = {}
  private validName = /^better-bibtex[-_a-zA-Z0-9]*$/

  public async exportDatabase(dbname, dbref, callback) {
    log.debug('DBStore.exportDatabase:', dbname)

    const conn = this.conn[dbname]
    if (conn === false) {
      log.debug('DBStore: save of', dbname, 'attempted after close')
      return callback(null)
    }

    if (!conn) throw new Error(`Database ${dbname} not loaded`)

    try {
      await conn.executeTransaction(async () => {
        for (const coll of dbref.collections) {
          if (coll.dirty) {
            const name = `${dbname}.${coll.name}`
            log.debug('DBStore.exportDatabase:', name)
            await conn.queryAsync(`REPLACE INTO "${dbname}" (name, data) VALUES (?, ?)`, [name, JSON.stringify(coll)])
          }
        }

        // TODO: only save if dirty? What about collection removal? Other data that may have changed on the DB?
        await conn.queryAsync(`REPLACE INTO "${dbname}" (name, data) VALUES (?, ?)`, [
          dbname,
          JSON.stringify({ ...dbref, ...{collections: dbref.collections.map(coll => `${dbname}.${coll.name}`)} }),
        ])
      })
      callback(null)
    } catch (err) {
      callback(err)
    }
  }

  // this assumes Zotero.initializationPromise has resolved, will throw an error if not
  public async loadDatabase(dbname, callback) {
    log.debug('DBStore.loadDatabase:', dbname)
    if (!dbname.match(this.validName)) throw new Error(`Invalid database name '${dbname}'`)
    if (this.conn[dbname] === false) throw new Error(`Database '${dbname}' already closed`)
    if (this.conn[dbname]) throw new Error(`Database '${dbname}' already loaded`)

    const conn = (this.conn[dbname] = new Zotero.DBConnection(dbname))

    try {
      await conn.executeTransaction(async () => {
        await conn.queryAsync(`CREATE TABLE IF NOT EXISTS \"${dbname}\" (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)`)

        let db = null
        const collections = {}
        for (const row of await conn.queryAsync(`SELECT name, data FROM "${dbname}" ORDER BY name ASC`)) {
          log.debug('DBStore.loadDatabase:', dbname, '.', row.name)
          if (row.name === dbname) {
            log.debug(`DBStore.loadDatabase: loading ${dbname}`)
            db = JSON.parse(row.data)
          } else {
            try {
              log.debug(`DBStore.loadDatabase: loading ${row.name}`)
              collections[row.name] = JSON.parse(row.data)

              collections[row.name].cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
              collections[row.name].adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654

              log.debug(`DBStore.loadDatabase: ${row.name} has`, collections[row.name].data.length, 'records')
            } catch (err) {
              log.error(`DBStore.loadDatabase: failed to parse ${row.name}`)
            }
          }
        }

        if (db) {
          log.debug('DBStore.loadDatabase: restoring collections:', db.collections)
          db.collections = db.collections.filter(coll => collections[coll]).map(coll => collections[coll])
        }

        const dump = createFile(`_${dbname}.json`)
        Zotero.File.putContents(dump, JSON.stringify(db))

        callback(db)
      })
    } catch (err) {
      log.error('DBStore.loadDatabase: error loading', dbname, err)
      callback(err)
    }
  }

  public async close(dbname, callback) {
    log.debug('DBStore.close', dbname)

    if (!this.conn[dbname]) return callback(null)

    const conn = this.conn[dbname]
    this.conn[dbname] = false

    try {
      await conn.closeDatabase(true)
      log.debug('DBStore.close OK', dbname)
      callback(null)
    } catch (err) {
      log.error('DBStore.close FAILED', dbname, err)
      callback(err)
    }
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let DB = new Loki('better-bibtex', { // tslint:disable-line:variable-name
  autosave: true,
  autosaveInterval: 5000,
  autosaveOnIdle: true,
  adapter: new DBStore(),
})

DB.init = async () => {
  await DB.loadDatabaseAsync()

  const citekeys = DB.schemaCollection('citekey', {
    indices: [ 'itemID', 'itemKey', 'libraryID', 'citekey', 'pinned' ],
    unique: [ 'itemID' ],
    schema: {
      type: 'object',
      properties: {
        itemID: { type: 'integer' },
        itemKey: { type: 'string' },
        libraryID: { type: 'integer' },
        citekey: { type: 'string', minLength: 1 },
        pinned: { type: 'boolean', default: false },

        // LokiJS
        meta: { type: 'object' },
        $loki: { type: 'integer' },
      },
      required: [ 'itemID', 'libraryID', 'citekey', 'pinned' ],
      additionalProperties: false,
    },
  })

  log.debug('Keymanager: userLibraryID =', Zotero.Libraries.userLibraryID)
  if (Zotero.Libraries.userLibraryID) {
    for (const citekey of citekeys.where(ck => ck.libraryID === 1 || !ck.libraryID )) {
      citekey.libraryID = Zotero.Libraries.userLibraryID
      citekeys.update(citekey)
    }
  }

  const autoexport = DB.schemaCollection('autoexport', {
    indices: [ 'type', 'id', 'status', 'path', 'exportNotes', 'translatorID', 'useJournalAbbreviation'],
    unique: [ 'path' ],
    logging: true,
    schema: {
      type: 'object',
      properties: {
        type: { enum: [ 'collection', 'library' ] },
        id: { type: 'integer' },
        path: { type: 'string', minLength: 1 },
        status: { enum: [ 'scheduled', 'running', 'done', 'error' ] },
        translatorID: { type: 'string', minLength: 1 },
        exportNotes: { type: 'boolean', default: false },
        useJournalAbbreviation: { type: 'boolean', default: false },
        error: { type: 'string', default: '' },

        // LokiJS
        meta: { type: 'object' },
        $loki: { type: 'integer' },
      },
      required: [ 'type', 'id', 'path', 'status', 'translatorID', 'exportNotes', 'useJournalAbbreviation' ],

      additionalProperties: false,
    },
  })

  // directly change the data objects and rebuild indexes https://github.com/techfort/LokiJS/issues/660
  const length = autoexport.data.length
  autoexport.data = autoexport.data.filter(doc => typeof doc.$loki === 'number' && typeof doc.meta === 'object')
  if (length !== autoexport.data.length) {
    autoexport.ensureId()
    autoexport.ensureAllIndexes(true)
  }

  // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
  for (const [name, coll] of Object.entries({ citekeys, autoexport })) {
    let corrupt
    try {
      corrupt = coll.checkAllIndexes({ repair: true })
    } catch (err) {
      corrupt = [ '*' ]
      coll.ensureAllIndexes(true)
    }
    if (corrupt.length > 0) {
      for (const index of corrupt) {
        if (index === '*') {
          Zotero.logError(new Error(`LokiJS: rebuilt index ${name}.${index}`))
        } else {
          Zotero.logError(new Error(`LokiJS: corrupt index ${name}.${index} repaired`))
        }
      }
    }
  }

  // https://github.com/retorquere/zotero-better-bibtex/issues/903
  for (const ae of autoexport.find()) {
    if (ae.updated) {
      delete ae.updated
      autoexport.update(ae)
    }
  }

  if (Prefs.get('scrubDatabase')) {
    const re = /(?:^|\s)bibtex\*:[^\S\n]*([^\s]*)(?:\s|$)/
    const itemIDs = await Zotero.DB.columnQueryAsync('SELECT itemID FROM items')
    const items = await getItemsAsync(itemIDs)
    for (const item of items) {
      const extra = item.getField('extra')
      if (!extra) continue

      const clean = extra.replace(re, '\n').trim()

      if (clean === extra) continue

      item.setField('extra', clean)
      await item.saveTx()
    }
  }
}

/* old junk, only for json-backed storage
DB.removeCollection('metadata') if DB.getCollection('metadata')
DB.removeCollection('keys') if DB.getCollection('keys')
*/

/* only for json-backed storage
for ae in autoexports.data()
  * upgrade old autoexports
  if ae.collection
    [ ae.type, ae.id ] = ae.collection.split(':')
    ae.id ?= Zotero.Libraries.userLibraryID
    delete ae.collection
    autoexports.update(ae)

  * interrupted at start
  if ae.status == 'running'
    ae.scheduled = new Date()
    ae.status = 'done'
  else
    delete ae.scheduled
  autoexports.update(ae)
*/
