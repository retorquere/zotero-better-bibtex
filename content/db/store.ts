/* eslint-disable @typescript-eslint/member-ordering */

Components.utils.import('resource://gre/modules/osfile.jsm')

import { log } from '../logger'

// Components.utils.import('resource://gre/modules/Sqlite.jsm')
// declare const Sqlite: any

export class SQLite {
  public mode = 'reference'
  public conn: any

  private allowPartial: boolean
  private stored: Set<string>

  constructor(name: string, allowPartial?: boolean) {
    this.conn = new Zotero.DBConnection(name)
    this.allowPartial = typeof allowPartial === 'undefined' ? true : allowPartial
    this.stored = new Set
  }

  public close(name: string, callback: ((v: null) => void)): void {
    if (this.stored.has(name)) this.stored.delete(name)

    if (this.conn.closed) return callback(null)
    if (this.stored.size > 0) return callback(null)

    this.conn
      .closeDatabase(true)
      .then(() => callback(null))
      .catch(err => {
        log.debug(`store.SQLite: failed to close ${name}:`, err)
        callback(err)
      })
  }

  public loadDatabase(name: string, callback: ((v: any) => void)): void {
    (async () => {
      this.stored.add(name)

      await this.conn.queryAsync(`CREATE TABLE IF NOT EXISTS "${name}" (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)`)

      let db: any = null
      const collections: Record<string, any> = {}

      let failed = false

      for (const row of await this.conn.queryAsync(`SELECT name, data FROM "${name}" ORDER BY name ASC`)) {
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
          log.debug(`store.SQLite.loadDatabase: failed to load ${name}.${row.name}:`, err)
          failed = failed || !this.allowPartial
        }
      }

      if (db) {
        const missing = db.collections.filter(coll => !collections[coll])
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        db.collections = db.collections.map((coll: string) => collections[coll]).filter(coll => coll)
        if (missing.length) {
          failed = failed || !this.allowPartial
          log.debug(`store.SQLite.loadDatabase: failed to load ${name}${missing.join('+')}: partial load not allowed`)
        }
      }

      callback(failed ? null : db)
    })().catch(err => {
      log.debug('store.SQLite.loadDatabase:', name, 'failed:', err)
      callback(err)
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public exportDatabase(name: string, dbref: any, callback: ((v: any) => void)): void {
    this.conn.executeTransaction(async () => {
      const names = (await this.conn.queryAsync(`SELECT name FROM "${name}"`)).map((coll: { name: string }) => coll.name)

      const parts = []
      for (const coll of dbref.collections) {
        const collname = `${name}.${coll.name}`
        if (coll.dirty || !names.includes(collname)) {
          parts.push(this.conn.queryAsync(`REPLACE INTO "${name}" (name, data) VALUES (?, ?)`, [collname, JSON.stringify(coll)]))
        }
      }

      parts.push(this.conn.queryAsync(`REPLACE INTO "${name}" (name, data) VALUES (?, ?)`, [
        name,
        JSON.stringify({ ...dbref, ...{collections: dbref.collections.map(coll => `${name}.${coll.name}`)} }),
      ]))

      await Promise.all(parts)
      callback(null)
    }).catch(err => {
      log.debug('store.SQLite export of', name, 'failed:', err)
      callback(err)
    })
  }
}

export class File {
  public mode = 'reference'

  public loadDatabase(name: string, callback: ((v: null) => void)): void {
    (async (): Promise<void> => {
      const db = await this.load(name)
      if (!db) return callback(null)

      db.collections = await Zotero.Promise.all(db.collections.map(async collname => {
        const coll = await this.load(`${name}.${collname}`)
        if (coll) {
          coll.cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
          coll.adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return coll
        }
        else {
          log.debug(`FileStore.loadDatabase: Could not load ${name}.${collname}`)
          return null
        }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      })).filter(coll => coll)

      callback(db)
    })().catch(err => {
      log.debug('store.File load of', name, 'failed:', err)
      callback(err)
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public exportDatabase(name: string, dbref: any, callback: ((v: null) => void)): void {
    (async () => {
      const parts = [
        this.save(name, {...dbref, ...{collections: dbref.collections.map((coll: { name: string }) => coll.name)}}, true),
      ]
      for (const coll of dbref.collections) {
        parts.push(this.save(`${name}.${coll.name}`, coll, coll.dirty))
      }

      await Zotero.Promise.all(parts)
      callback(null)
    })().catch(err => {
      log.debug('store.File export of', name, 'failed:', err)
      callback(err)
    })
  }

  private async load(name): Promise<any> {
    const path = OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const exists = await OS.File.exists(path)

    if (!exists) return null

    const data = JSON.parse(await OS.File.read(path, { encoding: 'utf-8' }) as unknown as string)

    // this is intentional. If all is well, the database will be retained in memory until it's saved at
    // shutdown. If all is not well, this will make sure the caches are rebuilt from scratch on next start
    await OS.File.move(path, `${path}.bak`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data
  }

  private async save(name: string, data, dirty: boolean) {
    const path = OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const save = dirty || !(await OS.File.exists(path))

    if (!save) return null

    await OS.File.writeAtomic(path, JSON.stringify(data), { encoding: 'utf-8', tmpPath: `${path}.tmp`})
  }
}
