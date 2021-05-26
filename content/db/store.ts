/* eslint-disable @typescript-eslint/member-ordering */

Components.utils.import('resource://gre/modules/osfile.jsm')

import { log } from '../logger'

// Components.utils.import('resource://gre/modules/Sqlite.jsm')
// declare const Sqlite: any

export class SQLite {
  public mode = 'reference'

  private storage: string

  private conn: any = {}

  constructor(options: { storage: string }) {
    Object.assign(this, options)
    if (this.storage !== 'sqlite' && this.storage !== 'file') throw new Error(`Unsupported DBStore storage ${this.storage}`)
  }

  public async close(name: string, callback: ((v: null) => void)): Promise<void> {
    try {
      if (this.storage !== 'sqlite') return callback(null)

      if (!this.conn[name]) return callback(null)

      const conn = this.conn[name]
      this.conn[name] = false


      await this.closeDatabase(conn, name, 'DB.Store.close called')
      callback(null)
    }
    catch (err) {
      callback(err)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async exportDatabase(name: string, dbref: any, callback: ((v: null) => void)): Promise<void> {
    try {
      await this.exportDatabaseAsync(name, dbref)
      callback(null)
    }
    catch (err) {
      callback(err)
    }
  }

  private async closeDatabase(conn, name, _reason) {
    if (!conn) {
      log.debug('DB.Store.closeDatabase: ', name, typeof conn)
      return
    }

    if (conn.closed) {
      log.debug('DB.Store.closeDatabase: not re-closing connection', name)
      return
    }

    try {
      await conn.closeDatabase(true)
    }
    catch (err) {
      log.debug('DB.Store.closeDatabase FAILED', name, err)
    }
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
    const parts = [
      this.save(name, {...dbref, ...{collections: dbref.collections.map((coll: { name: string }) => coll.name)}}, true),
    ]
    for (const coll of dbref.collections) {
      parts.push(this.save(`${name}.${coll.name}`, coll, coll.dirty))
    }

    await Zotero.Promise.all(parts)
  }

  private async exportDatabaseSQLiteAsync(name, dbref) {
    const conn = this.conn[name]

    if (conn === false) {
      log.debug('DB.Store.exportDatabaseSQLiteAsync: save of', name, 'attempted after close')
      return
    }

    if (!conn) {
      log.debug('DB.Store.exportDatabaseSQLiteAsync: save of', name, 'to unopened database')
      return
    }

    await conn.executeTransaction(async () => {
      const names = (await conn.queryAsync(`SELECT name FROM "${name}"`)).map((coll: { name: string }) => coll.name)

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

  private async save(name: string, data, dirty: boolean) {
    const path = OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const save = dirty || !(await OS.File.exists(path))

    if (!save) return null

    await OS.File.writeAtomic(path, JSON.stringify(data), { encoding: 'utf-8', tmpPath: `${path}.tmp`})
  }

  public async loadDatabase(name: string, callback: ((v: null) => void)): Promise<void> {
    try {
      const db = await this.loadDatabaseAsync(name)
      callback(db)
    }
    catch (err) {
      log.debug('DB.Store.loadDatabase', name, err)
      callback(null)
    }
  }

  public async loadDatabaseAsync(name: string): Promise<any> {
    if (this.storage === 'sqlite') {
      const db = await this.loadDatabaseSQLiteAsync(name) // always try sqlite first, may be a migration to file
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (db) return db
    }

    if (this.storage === 'file') {
      const db = await this.loadJSONAsync(name)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (db) return db
    }

    return null
  }

  private async loadDatabaseSQLiteAsync(name: string): Promise<any> {
    const path = OS.Path.join(Zotero.DataDirectory.dir, `${name}.sqlite`)
    const exists = await OS.File.exists(path)

    if (!exists && this.storage !== 'sqlite') return null // don't create the DB for a migration load

    const conn = await this.openDatabaseSQLiteAsync(name)
    await conn.queryAsync(`CREATE TABLE IF NOT EXISTS "${name}" (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)`)

    let db = null
    const collections: Record<string, any> = {}

    let failed = false

    let rows = 0
    for (const row of await conn.queryAsync(`SELECT name, data FROM "${name}" ORDER BY name ASC`)) {
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
        log.debug(`DB.Store.loadDatabaseSQLiteAsync: failed to load ${name}:`, row.name)
        failed = true
      }
    }

    if (db) {
      const missing = db.collections.filter(coll => !collections[coll])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      db.collections = db.collections.map((coll: string) => collections[coll]).filter(coll => coll)
      if (missing.length) {
        log.debug(`DB.Store.loadDatabaseSQLiteAsync: could not find ${name}.${missing.join('.')}`)
      }

    }
    else if (exists && rows) {
      log.debug('DB.Store.loadDatabaseSQLiteAsync: could not find metadata for', name, rows)
      failed = true

    }

    if (this.storage !== 'sqlite') { // migrate but move after
      await this.closeDatabase(conn, name, 'migrated')
      await OS.File.move(path, `${path}.migrated`)

    }
    else {
      this.conn[name] = conn

    }

    if (failed) {
      log.debug('DB.Store.loadDatabaseSQLiteAsync failed, returning empty database')
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return db
  }

  private async openDatabaseSQLiteAsync(name, fatal = false) {
    const path = OS.Path.join(Zotero.DataDirectory.dir, `${name}.sqlite`)

    const conn = new Zotero.DBConnection(name)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (await conn.integrityCheck()) return conn
      throw new Error(`DB.Store.openDatabaseSQLiteAsync(${JSON.stringify(name)}) failed: integrity check not OK`)

    }
    catch (err) {
      log.debug('DB.Store.openDatabaseSQLiteAsync:', { name, fatal }, err)
      if (fatal) throw err

      // restore disabled until I Zotero supports after-open restore
      const ps = Services.prompt
      const index = ps.confirmEx(
        null, // parent
        Zotero.BetterBibTeX.getString('DB.corrupt'), // dialogTitle
        Zotero.BetterBibTeX.getString('DB.corrupt.explanation', { error: err.message }), // text
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        ps.BUTTON_POS_0 * ps.BUTTON_TITLE_IS_STRING + ps.BUTTON_POS_0_DEFAULT // buttons
          + ps.BUTTON_POS_1 * ps.BUTTON_TITLE_IS_STRING
          + 0, // disabled: (fatal ? 0 : ps.BUTTON_POS_2 * ps.BUTTON_TITLE_IS_STRING),
        Zotero.BetterBibTeX.getString('DB.corrupt.quit'), // button 0
        Zotero.BetterBibTeX.getString('DB.corrupt.reset'), // button 1
        null, // disabled: (fatal ? null : Zotero.BetterBibTeX.getString('DB.corrupt.restore')), // button 2
        null, // check message
        {} // check state
      )

      await this.closeDatabase(conn, name, 'corrupted')

      switch (index) {
        case 0: // quit
          Zotero.Utilities.Internal.quit()
          break

        case 1: // reset
          if (await OS.File.exists(path)) await OS.File.move(path, `${path}.ignore.corrupt`)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await this.openDatabaseSQLiteAsync(name, true)

        default: // restore
          if (await OS.File.exists(path)) await OS.File.move(path, `${path}.is.corrupt`)
          Zotero.Utilities.Internal.quit(true)
          break
      }
    }
  }

  private async loadJSONAsync(name: string) {
    const db = await this.load(name)
    if (!db) return null

    db.collections = await Zotero.Promise.all(db.collections.map(async collname => {
      const coll = await this.load(`${name}.${collname}`)
      if (coll) {
        coll.cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
        coll.adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return coll
      }

      log.debug('DB.Store.loadDatabaseVersionAsync:', `Could not load ${name}.${collname}`)
      return null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    })).filter(coll => coll)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return db
  }

  private async load(name) {
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
}

export class File {
  public mode = 'reference'

  private storage: string

  private conn: any = {}

  constructor(options: { storage: string }) {
    Object.assign(this, options)
    if (this.storage !== 'sqlite' && this.storage !== 'file') throw new Error(`Unsupported DBStore storage ${this.storage}`)
  }

  public async close(name: string, callback: ((v: null) => void)): Promise<void> {
    try {
      if (this.storage !== 'sqlite') return callback(null)

      if (!this.conn[name]) return callback(null)

      const conn = this.conn[name]
      this.conn[name] = false


      await this.closeDatabase(conn, name, 'DB.Store.close called')
      callback(null)
    }
    catch (err) {
      callback(err)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async exportDatabase(name: string, dbref: any, callback: ((v: null) => void)): Promise<void> {
    try {
      await this.exportDatabaseAsync(name, dbref)
      callback(null)
    }
    catch (err) {
      callback(err)
    }
  }

  private async closeDatabase(conn, name, _reason) {
    if (!conn) {
      log.debug('DB.Store.closeDatabase: ', name, typeof conn)
      return
    }

    if (conn.closed) {
      log.debug('DB.Store.closeDatabase: not re-closing connection', name)
      return
    }

    try {
      await conn.closeDatabase(true)
    }
    catch (err) {
      log.debug('DB.Store.closeDatabase FAILED', name, err)
    }
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
    const parts = [
      this.save(name, {...dbref, ...{collections: dbref.collections.map((coll: { name: string }) => coll.name)}}, true),
    ]
    for (const coll of dbref.collections) {
      parts.push(this.save(`${name}.${coll.name}`, coll, coll.dirty))
    }

    await Zotero.Promise.all(parts)
  }

  private async exportDatabaseSQLiteAsync(name, dbref) {
    const conn = this.conn[name]

    if (conn === false) {
      log.debug('DB.Store.exportDatabaseSQLiteAsync: save of', name, 'attempted after close')
      return
    }

    if (!conn) {
      log.debug('DB.Store.exportDatabaseSQLiteAsync: save of', name, 'to unopened database')
      return
    }

    await conn.executeTransaction(async () => {
      const names = (await conn.queryAsync(`SELECT name FROM "${name}"`)).map((coll: { name: string }) => coll.name)

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

  private async save(name: string, data, dirty: boolean) {
    const path = OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const save = dirty || !(await OS.File.exists(path))

    if (!save) return null

    await OS.File.writeAtomic(path, JSON.stringify(data), { encoding: 'utf-8', tmpPath: `${path}.tmp`})
  }

  public async loadDatabase(name: string, callback: ((v: null) => void)): Promise<void> {
    try {
      const db = await this.loadDatabaseAsync(name)
      callback(db)
    }
    catch (err) {
      log.debug('DB.Store.loadDatabase', name, err)
      callback(null)
    }
  }

  public async loadDatabaseAsync(name: string): Promise<any> {
    if (this.storage === 'sqlite') {
      const db = await this.loadDatabaseSQLiteAsync(name) // always try sqlite first, may be a migration to file
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (db) return db
    }

    if (this.storage === 'file') {
      const db = await this.loadJSONAsync(name)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (db) return db
    }

    return null
  }

  private async loadDatabaseSQLiteAsync(name: string): Promise<any> {
    const path = OS.Path.join(Zotero.DataDirectory.dir, `${name}.sqlite`)
    const exists = await OS.File.exists(path)

    if (!exists && this.storage !== 'sqlite') return null // don't create the DB for a migration load

    const conn = await this.openDatabaseSQLiteAsync(name)
    await conn.queryAsync(`CREATE TABLE IF NOT EXISTS "${name}" (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)`)

    let db = null
    const collections: Record<string, any> = {}

    let failed = false

    let rows = 0
    for (const row of await conn.queryAsync(`SELECT name, data FROM "${name}" ORDER BY name ASC`)) {
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
        log.debug(`DB.Store.loadDatabaseSQLiteAsync: failed to load ${name}:`, row.name)
        failed = true
      }
    }

    if (db) {
      const missing = db.collections.filter(coll => !collections[coll])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      db.collections = db.collections.map((coll: string) => collections[coll]).filter(coll => coll)
      if (missing.length) {
        log.debug(`DB.Store.loadDatabaseSQLiteAsync: could not find ${name}.${missing.join('.')}`)
      }

    }
    else if (exists && rows) {
      log.debug('DB.Store.loadDatabaseSQLiteAsync: could not find metadata for', name, rows)
      failed = true

    }

    if (this.storage !== 'sqlite') { // migrate but move after
      await this.closeDatabase(conn, name, 'migrated')
      await OS.File.move(path, `${path}.migrated`)

    }
    else {
      this.conn[name] = conn

    }

    if (failed) {
      log.debug('DB.Store.loadDatabaseSQLiteAsync failed, returning empty database')
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return db
  }

  private async openDatabaseSQLiteAsync(name, fatal = false) {
    const path = OS.Path.join(Zotero.DataDirectory.dir, `${name}.sqlite`)

    const conn = new Zotero.DBConnection(name)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (await conn.integrityCheck()) return conn
      throw new Error(`DB.Store.openDatabaseSQLiteAsync(${JSON.stringify(name)}) failed: integrity check not OK`)

    }
    catch (err) {
      log.debug('DB.Store.openDatabaseSQLiteAsync:', { name, fatal }, err)
      if (fatal) throw err

      // restore disabled until I Zotero supports after-open restore
      const ps = Services.prompt
      const index = ps.confirmEx(
        null, // parent
        Zotero.BetterBibTeX.getString('DB.corrupt'), // dialogTitle
        Zotero.BetterBibTeX.getString('DB.corrupt.explanation', { error: err.message }), // text
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        ps.BUTTON_POS_0 * ps.BUTTON_TITLE_IS_STRING + ps.BUTTON_POS_0_DEFAULT // buttons
          + ps.BUTTON_POS_1 * ps.BUTTON_TITLE_IS_STRING
          + 0, // disabled: (fatal ? 0 : ps.BUTTON_POS_2 * ps.BUTTON_TITLE_IS_STRING),
        Zotero.BetterBibTeX.getString('DB.corrupt.quit'), // button 0
        Zotero.BetterBibTeX.getString('DB.corrupt.reset'), // button 1
        null, // disabled: (fatal ? null : Zotero.BetterBibTeX.getString('DB.corrupt.restore')), // button 2
        null, // check message
        {} // check state
      )

      await this.closeDatabase(conn, name, 'corrupted')

      switch (index) {
        case 0: // quit
          Zotero.Utilities.Internal.quit()
          break

        case 1: // reset
          if (await OS.File.exists(path)) await OS.File.move(path, `${path}.ignore.corrupt`)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await this.openDatabaseSQLiteAsync(name, true)

        default: // restore
          if (await OS.File.exists(path)) await OS.File.move(path, `${path}.is.corrupt`)
          Zotero.Utilities.Internal.quit(true)
          break
      }
    }
  }

  private async loadJSONAsync(name: string) {
    const db = await this.load(name)
    if (!db) return null

    db.collections = await Zotero.Promise.all(db.collections.map(async collname => {
      const coll = await this.load(`${name}.${collname}`)
      if (coll) {
        coll.cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
        coll.adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return coll
      }

      log.debug('DB.Store.loadDatabaseVersionAsync:', `Could not load ${name}.${collname}`)
      return null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    })).filter(coll => coll)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return db
  }

  private async load(name) {
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
}
