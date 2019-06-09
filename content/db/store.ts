// tslint:disable:member-ordering

declare const Zotero: any
declare const Components: any
declare const Services: any

Components.utils.import('resource://gre/modules/osfile.jsm')

import * as log from '../debug'

export class Store {
  public mode = 'reference'

  private versions: number
  private deleteAfterLoad: boolean
  private allowPartial: boolean
  private storage: string

  private conn: any = {}

  constructor(options: { deleteAfterLoad?: boolean, allowPartial?: boolean, versions?: number, storage: string }) {
    Object.assign(this, options)
    if (this.storage !== 'sqlite' && this.storage !== 'file') throw new Error(`Unsupported DBStore storage ${this.storage}`)
    if (this.storage === 'sqlite' && this.versions) throw new Error('DBStore storage "sqlite" does not support versions')
  }

  public close(name, callback) {
    if (this.storage !== 'sqlite') return callback(null)

    log.error('DB.Store.close:', close, name)

    if (!this.conn[name]) return callback(null)

    const conn = this.conn[name]
    this.conn[name] = false

    conn.closeDatabase(true)
      .then(() => {
        log.debug('DB.Store.close OK', name)
        callback(null)
      })
      .catch(err => {
        log.error('DB.Store.close FAILED', name, err)
        callback(err)
      })
  }

  public exportDatabase(name, dbref, callback) {
    this.exportDatabaseAsync(name, dbref)
      .then(() => callback(null))
      .catch(callback)
  }

  private async exportDatabaseAsync(name, dbref) {
    switch (this.storage) {
      case 'sqlite':
        await this.exportDatabaseSQLiteAsync(name, dbref)
        break

      default:
        await this.exportDatabaseFileAsync(name, dbref)
        break
    }
  }

  private async exportDatabaseFileAsync(name, dbref) {
    await this.roll(name)
    const version = this.versions ? '.0' : ''

    const parts = [
      this.save(`${name}${version}`, {...dbref, ...{collections: dbref.collections.map(coll => coll.name)}}, true),
    ]
    for (const coll of dbref.collections) {
      parts.push(this.save(`${name}${version}.${coll.name}`, coll, coll.dirty))
    }

    await Zotero.Promise.all(parts)
  }

  private async exportDatabaseSQLiteAsync(name, dbref) {
    const conn = this.conn[name]

    if (conn === false) {
      log.error('DB.Store.exportDatabaseSQLiteAsync: save of', name, 'attempted after close')
      return
    }

    if (!conn) {
      log.error('DB.Store.exportDatabaseSQLiteAsync: save of', name, 'to unopened database')
      return
    }

    await conn.executeTransaction(async () => {
      const names = (await conn.queryAsync(`SELECT name FROM "${name}"`)).map(coll => coll.name)

      const parts = []
      for (const coll of dbref.collections) {
        const collname = `${name}.${coll.name}`
        if (coll.dirty || !names.includes(collname)) {
          parts.push(conn.queryAsync(`REPLACE INTO "${name}" (name, data) VALUES (?, ?)`, [collname, JSON.stringify(coll)]))
        }
      }

      parts.push(conn.queryAsync(`REPLACE INTO "${name}" (name, data) VALUES (?, ?)`, [
        name,
        JSON.stringify({ ...dbref, ...{collections: dbref.collections.map(coll => `${name}.${coll.name}`)} }),
      ]))

      await Promise.all(parts)
    })
  }

  private async roll(name) {
    if (!this.versions) return

    const roll = []

    await (new OS.File.DirectoryIterator(Zotero.BetterBibTeX.dir)).forEach(entry => { // really weird half-promise thing
      if (!entry.name.endsWith('.json')) return

      const parts = entry.name.split('.')
      if (parts[0] !== name) return
      if (parts.length < 3) return // tslint:disable-line:no-magic-numbers

      const version = parseInt(parts[1], 10)
      if (parts[1] !== `${version}`) return // not a digit

      if (version >= this.versions) {
        roll.push({ version, promise: OS.File.remove(entry.path, { ignoreAbsent: true }) })
      } else {
        parts[1] = `${version + 1}`
        roll.push({ version, promise: OS.File.move(entry.path, OS.Path.join(Zotero.BetterBibTeX.dir, parts.join('.'))) })
      }
    })

    roll.sort((a, b) => b.version - a.version) // sort reverse

    // this must be done sequentially
    for (const file of roll) {
      try {
        await file.promise
      } catch (err) {
        log.error('DB.Store.roll:', err)
      }
    }
  }

  private async save(name, data, dirty) {
    const path = OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const save = dirty || !(await OS.File.exists(path))

    if (!save) return null

    await OS.File.writeAtomic(path, JSON.stringify(data), { encoding: 'utf-8', tmpPath: path + '.tmp'})
  }

  public loadDatabase(name, callback) {
    this.loadDatabaseAsync(name)
      .then(callback)
      .catch(err => { log.error('DB.Store.loadDatabase', name, err); callback(null)})
  }

  public async loadDatabaseAsync(name) {
    try {
      const db = await this.loadDatabaseSQLiteAsync(name) // always try sqlite first, may be a migration to file
      if (db) return db
    } catch (err) {
      log.error('DB.Store.loadDatabaseAsync:', err)
    }

    if (this.storage === 'file') {
      const versions = this.versions || 1
      for (let version = 0; version < versions; version++) {
        const db = await this.loadDatabaseVersionAsync(name, version)
        if (db) return db
      }
    }

    return null
  }

  private async loadDatabaseSQLiteAsync(name) {
    const path = OS.Path.join(Zotero.DataDirectory.dir, `${name}.sqlite`)
    const exists = await OS.File.exists(path)
    log.debug('DB.Store.loadDatabaseSQLiteAsync:', { path, exists })

    if (!exists) {
      if (this.storage === 'sqlite') {
        this.conn[name] = new Zotero.DBConnection(name)
        await this.conn[name].queryAsync(`CREATE TABLE IF NOT EXISTS "${name}" (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)`)
      }
      return null
    }

    let conn
    try {
      conn = new Zotero.DBConnection(name)
      if (this.storage === 'sqlite') this.conn[name] = conn
    } catch (err) {
      log.error('DB.Store.loadDatabaseSQLiteAsync:', err)
      // this will error out the queryAsync below and fall through to the corruption handling
      conn = null
    }

    let db = null
    const collections = {}

    try {
      for (const row of await conn.queryAsync(`SELECT name, data FROM "${name}" ORDER BY name ASC`)) {
        if (row.name === name) {
          db = JSON.parse(row.data)
        } else {
          collections[row.name] = JSON.parse(row.data)

          collections[row.name].cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
          collections[row.name].adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654
          collections[row.name].dirty = true
        }
      }
    } catch (err) {
      log.error('DB.Store.loadDatabaseSQLiteAsync:', err)

      if (this.storage === 'sqlite') {
        const ps = Services.prompt
        const index = ps.confirmEx(
          null, // parent
          Zotero.BetterBibTeX.getString('DB.corrupt'), // dialogTitle
          Zotero.BetterBibTeX.getString('DB.corrupt.explanation', { error: err.message }), // text
          ps.BUTTON_POS_0 * ps.BUTTON_TITLE_IS_STRING + ps.BUTTON_POS_0_DEFAULT // buttons
            + ps.BUTTON_POS_1 * ps.BUTTON_TITLE_IS_STRING
            + ps.BUTTON_POS_2 * ps.BUTTON_TITLE_IS_STRING,
          Zotero.BetterBibTeX.getString('DB.corrupt.quit'), // button 0
          Zotero.BetterBibTeX.getString('DB.corrupt.restore'), // button 1
          Zotero.BetterBibTeX.getString('DB.corrupt.reset'), // button 2
          null, // check message
          {} // check state
        )

        if (conn) await conn.closeDatabase(true)

        switch (index) {
          case 0: // quit
            Zotero.Utilities.Internal.quit()
            break
          case 1: // attempt restore
            if (await OS.File.exists(path)) await OS.File.move(path, `${path}.is.corrupt`)
            Zotero.Utilities.Internal.quit(true)
            break
          default:
            if (await OS.File.exists(path)) await OS.File.move(path, `${path}.ignore.corrupt`)
            try {
              this.conn[name] = new Zotero.DBConnection(name)
            } catch (err) {
              log.error('DB.Store.loadDatabaseSQLiteAsync:', err)
              alert('Database reset failed')
            }
            break
        }

        return null
      }
    }

    if (!db) {
      log.error('DB.Store.loadDatabaseSQLiteAsync: could not find metadata for', name)
      return null
    }

    db.collections = db.collections.map(coll => collections[coll] || coll)
    const missing = db.collections.find(coll => typeof coll === 'string')
    if (missing && !this.allowPartial) {
      log.error(`DB.Store.loadDatabaseSQLiteAsync: could not find ${name}.${missing}`)
      return null
    }

    if (this.storage === 'file') { // migrate but move after
      await conn.closeDatabase(true)
      await OS.File.move(path, `${path}.migrated`)
    }

    if (this.storage === 'sqlite' && this.deleteAfterLoad) await this.conn[name].queryAsync(`DELETE FROM "${name}"`)

    return db
  }

  private async loadDatabaseVersionAsync(name: string, version: number) {
    if (this.versions) name += `.${version}`

    const db = await this.load(name)
    if (!db) return null

    db.collections = await Zotero.Promise.all(db.collections.map(async collname => {
      const coll = await this.load(`${name}.${collname}`)
      if (coll) {
        coll.cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
        coll.adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654
        return coll
      }

      const msg = `Could not load ${name}.${collname}`

      if (this.allowPartial) {
        log.error('DB.Store.loadDatabaseVersionAsync:', msg)
        return null
      } else {
        throw new Error(msg)
      }
    })).filter(coll => coll)
    return db
  }

  private async load(name) {
    const path = OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const exists = await OS.File.exists(path)

    if (!exists) return null

    const data = JSON.parse(await OS.File.read(path, { encoding: 'utf-8' }))

    // this is intentional. If all is well, the database will be retained in memory until it's saved at
    // shutdown. If all is not well, this will make sure the caches are rebuilt from scratch on next start
    if (this.deleteAfterLoad) await OS.File.move(path, path + '.bak')

    return data
  }
}
