// tslint:disable:member-ordering

declare const Zotero: any
declare const Components: any
declare const OS: any

Components.utils.import('resource://gre/modules/osfile.jsm')

import * as log from '../debug'

export class FileStore {
  public mode = 'reference'

  private versions: number
  private renameAfterLoad: boolean
  private allowPartial: boolean
  private root: string

  constructor(options: { renameAfterLoad?: boolean, allowPartial?: boolean, versions?: number }) {
    Object.assign(this, options)
    this.root = OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex')
  }

  public exportDatabase(name, dbref, callback) {
    this.exportDatabaseAsync(name, dbref)
      .then(() => callback(null))
      .catch(callback)
  }

  private async exportDatabaseAsync(name, dbref) {
    await this.roll(name)
    const version = this.versions ? '.0' : ''

    const parts = dbref.collections.map(coll => this.save(`${name}${version}.${coll.name}`, coll, coll.dirty))
    parts.push(this.save(`${name}${version}`, {...dbref, ...{collections: dbref.collections.map(coll => coll.name)}}, true))

    await Zotero.Promise.all(parts)
  }

  private async roll(name) {
    if (!this.versions) return

    const roll = []
    await (new OS.File.DirectoryIterator(this.root)).forEach(entry => { // really weird half-promise thing
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
        roll.push({ version, promise: OS.File.move(entry.path, OS.Path.join(this.root, parts.join('.'))) })
      }
    })

    roll.sort((a, b) => b.version - a.version) // sort reverse

    // this must be done sequentially
    for (const file of roll) {
      try {
        await file.promise
      } catch (err) {
        log.error('FileStore.roll:', err)
      }
    }
  }

  private async save(name, data, dirty) {
    log.debug('FileStore.save', name)

    const path = OS.path.join(this.root, `${name}.json`)
    if (!dirty && OS.Path.exists(path)) return

    await OS.File.writeAtomic(path, JSON.stringify(data), { encoding: 'utf-8', tmpPath: path + '.tmp'})
    log.debug('FileStore.saved', name)
  }

  public loadDatabase(name, callback) {
    this.loadDatabaseAsync(name)
      .then(callback)
      .catch(err => { log.error('Database load', name, err); callback(null)})
  }

  public async loadDatabaseAsync(name) {
    log.debug('FileStore.loadDatabase: loading', name)

    try {
      const db = this.migrate(name)
      if (db) return db
    } catch (err) {
      log.error('Filestore.migrate:', err)
    }

    const versions = this.versions || 1
    for (let version = 0; version < versions; version++) {
      const db = await this.loadDatabaseVersionAsync(name, version)
      if (db) return db
    }

    return null
  }

  private async migrate(name) {
    const sqlite = OS.Path.join(Zotero.DataDirectory.dir, `${name}.sqlite`)
    if (!OS.File.exists(sqlite)) return null

    log.debug('FileStore.migrate:', name)

    const conn = new Zotero.DBConnection(name)

    let db = null
    const collections = {}
    for (const row of await conn.queryAsync(`SELECT name, data FROM "${name}" ORDER BY name ASC`)) {
      log.debug('DBStore.loadDatabase:', name, '.', row.name)

      if (row.name === name) {
        log.debug(`DBStore.loadDatabase: loading ${name}`)
        db = JSON.parse(row.data)
      } else {
        log.debug(`DBStore.loadDatabase: loading ${row.name}`)
        collections[row.name] = JSON.parse(row.data)

        collections[row.name].cloneObjects = true // https://github.com/techfort/LokiJS/issues/47#issuecomment-362425639
        collections[row.name].adaptiveBinaryIndices = false // https://github.com/techfort/LokiJS/issues/654

        log.debug(`DBStore.loadDatabase: ${row.name} has`, collections[row.name].data.length, 'records')
      }
    }

    if (!db) {
      log.error('FileStore.migrate: could not find metadata for', name)
      return null
    }

    db.collections = db.collections.map(coll => collections[coll] || coll)
    const missing = db.collections.find(coll => typeof coll === 'string')
    if (missing) {
      log.error(`FileStore.migrate: could not find ${name}.${missing}`)
      return null
    }

    await conn.closeDatabase(true)
    await OS.File.move(sqlite, `${sqlite}.migrated`)
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
        log.error(msg)
        return null
      } else {
        throw new Error(msg)
      }
    })).filter(coll => coll)

    log.debug('FileStore: loaded', name, version)
    return db
  }

  private async load(name) {
    const path = OS.path.join(this.root, `${name}.json`)
    log.debug('FileStore.load', path)

    if (!OS.Path.exists(path)) return null

    const data = JSON.parse(OS.File.read(path, { encoding: 'utf-8' }))

    // this is intentional. If all is well, the database will be retained in memory until it's saved at
    // shutdown. If all is not well, this will make sure the caches are rebuilt from scratch on next start
    if (this.renameAfterLoad) await OS.File.move(path, path + '.bak')

    return data
  }
}
