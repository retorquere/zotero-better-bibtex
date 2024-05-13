/* eslint-disable @typescript-eslint/member-ordering */

import { log } from '../../logger'

import { Shim } from '../../os'
import { is7 } from '../../client'
if (!is7) Components.utils.import('resource://gre/modules/osfile.jsm')
const $OS = is7 ? Shim : OS

// Components.utils.import('resource://gre/modules/Sqlite.jsm')
// declare const Sqlite: any

export class File {
  public mode = 'reference'

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async exportDatabase(name: string, dbref: any, callback: ((v: null) => void)): Promise<void> {
    try {
      const parts = [
        this.save(name, {...dbref, ...{collections: dbref.collections.map((coll: { name: string }) => coll.name)}}, true),
      ]
      for (const coll of dbref.collections) {
        parts.push(this.save(`${name}.${coll.name}`, coll, coll.dirty))
      }

      await Zotero.Promise.all(parts)

      callback(null)
    }
    catch (err) {
      callback(err)
    }
  }

  private async save(name: string, data, dirty: boolean) {
    const path = $OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const save = dirty || !(await $OS.File.exists(path))

    if (!save) return null

    await $OS.File.writeAtomic(path, JSON.stringify(data), { encoding: 'utf-8', tmpPath: `${path}.tmp`})
  }

  public async loadDatabase(name: string, callback: ((v: null) => void)): Promise<void> {
    try {
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
          log.error('DB.Store.loadDatabaseVersionAsync:', `Could not load ${name}.${collname}`)
          return null
        }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      })).filter(coll => coll)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      callback(db)
    }
    catch (err) {
      log.error('DB.Store.loadDatabase', name, err)
      callback(err)
    }
  }

  private async load(name) {
    const path = $OS.Path.join(Zotero.BetterBibTeX.dir, `${name}.json`)
    const exists = await $OS.File.exists(path)

    if (!exists) return null

    const data = JSON.parse(await $OS.File.read(path, { encoding: 'utf-8' }) as unknown as string)

    // this is intentional. If all is well, the database will be retained in memory until it's saved at
    // shutdown. If all is not well, this will make sure the caches are rebuilt from scratch on next start
    await $OS.File.move(path, `${path}.bak`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data
  }
}
