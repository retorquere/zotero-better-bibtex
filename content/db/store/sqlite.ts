/* eslint-disable @typescript-eslint/member-ordering */

Components.utils.import('resource://gre/modules/osfile.jsm')

import { log } from '../../logger'

// Components.utils.import('resource://gre/modules/Sqlite.jsm')
// declare const Sqlite: any

export class SQLite {
  public mode = 'reference'

  public async close(name: string, callback: ((v: null | Error) => void)): Promise<void> { // eslint-disable-line @typescript-eslint/require-await
    if (name !== 'better-bibtex') {
      callback(new Error('Private sqlite storage is deprecated'))
    }
    else {
      callback(null)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async exportDatabase(name: string, dbref: any, callback: ((v: null) => void)): Promise<void> {
    if (name !== 'better-bibtex') throw new Error('Private sqlite storage is deprecated')

    await Zotero.DB.executeTransaction(async () => {
      const names = (await Zotero.DB.queryAsync('SELECT name FROM betterbibtex."better-bibtex"')).map((coll: { name: string }) => coll.name)

      const parts = []
      for (const coll of dbref.collections) {
        const collname = `${name}.${coll.name}`
        if (coll.dirty || !names.includes(collname)) {
          parts.push(Zotero.DB.queryTx('REPLACE INTO betterbibtex."better-bibtex" (name, data) VALUES (?, ?)', [collname, JSON.stringify(coll)]))
        }
      }

      parts.push(Zotero.DB.queryTx('REPLACE INTO betterbibtex."better-bibtex" (name, data) VALUES (?, ?)', [
        name,
        JSON.stringify({ ...dbref, ...{collections: dbref.collections.map(coll => `${name}.${coll.name}`)} }),
      ]))

      await Promise.all(parts)
    })

    callback(null)
  }

  public async loadDatabase(name: string, callback: ((v: null) => void)): Promise<void> {
    if (name !== 'better-bibtex') { throw new Error('Private sqlite storage is deprecated') }

    try {
      await Zotero.DB.queryAsync('CREATE TABLE IF NOT EXISTS betterbibtex."better-bibtex" (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)')

      let db = null
      const collections: Record<string, any> = {}

      let failed = false

      let rows = 0
      for (const row of await Zotero.DB.queryAsync('SELECT name, data FROM betterbibtex."better-bibtex" ORDER BY name ASC')) {
        rows += 1
        try {
          if (row.name === name) {
            db = JSON.parse(row.data)
          }
          else {
            collections[row.name] = JSON.parse(row.data)

            collections[row.name].cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
            collections[row.name].adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654
            collections[row.name].dirty = true
          }
        }
        catch (err) {
          log.error(`DB.Store.loadDatabaseSQLiteAsync: failed to load ${name}:`, row.name)
          failed = true
        }
      }

      if (db) {
        const missing = db.collections.filter(coll => !collections[coll])
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        db.collections = db.collections.map((coll: string) => collections[coll]).filter(coll => coll)
        if (missing.length) {
          log.error(`DB.Store.loadDatabaseSQLiteAsync: could not find ${name}.${missing.join('.')}`)
        }
      }
      else if (rows) {
        log.error('DB.Store.loadDatabaseSQLiteAsync: could not find metadata for', name, rows)
        failed = true
      }

      if (failed) {
        log.error('DB.Store.loadDatabaseSQLiteAsync failed, returning empty database')
        callback(null)
      }
      else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        callback(db)
      }
    }
    catch (err) {
      callback(err)
    }
  }
}
