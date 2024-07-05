import { openDB, IDBPDatabase, DBSchema, IDBPTransaction } from 'idb'
import type { Attachment, Item, Note } from '../../gen/typings/serialized-item'
import { print } from '../logger'

type Serialized = Item | Attachment | Note
type Serializer = (item: any) => Serialized

import type { Translators as Translator } from '../../typings/translators'
const skip = [ 'keepUpdated', 'worker', 'exportFileData' ]
export function exportContext(displayOptions: Partial<Translator.DisplayOptions>): string {
  return JSON.stringify(Object.entries(displayOptions).filter(([k, v]) => !skip.includes(k)).sort((a, b) => a[0].localeCompare(b[0])))
}

export type ExportContext = {
  context: string
  id: number
}

export type ExportCacheContent = {
  context: number
  itemID: number
  entry: string
}

interface Schema extends DBSchema {
  ZoteroSerialized: {
    value: Serialized
    key: number
  }
  ZoteroSerializedTouched: {
    value: boolean
    key: number
  }

  ExportCacheContext: {
    value: ExportContext
    key: number
    indexes: { context: string }
  }

  BetterBibLaTeX: {
    value: ExportCacheContent
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }
  BetterBibTeX: {
    value: ExportCacheContent
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }
  BetterCSLJSON: {
    value: ExportCacheContent
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }
  BetterCSLYAML: {
    value: ExportCacheContent
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }

  metadata: {
    value: { key: string, value: string | number }
    key: string
  }
}
export type ExportCacheName = 'ZoteroSerialized' | 'ZoteroSerializedTouched' | 'ExportCacheContext' | 'BetterBibLaTeX' | 'BetterBibTeX' | 'BetterCSLJSON' | 'BetterCSLYAML'

class ExportCache {
  constructor(private db: IDBPDatabase<Schema>, private name: ExportCacheName) {
  }

  public async touch(ids: number[]): Promise<void> {
    const tx: IDBPTransaction = this.db.transaction(this.name, 'readwrite')
    const store = tx.objectStore(this.name)
    const index = store.index('itemID')
    for (const id of ids) {
      let cursor = await index.openCursor(IDBKeyRange.only(id))
      while (cursor) {
        await store.delete(cursor.primaryKey)
        cursor = await cursor.continue()
      }
    }
    await tx.done
  }
}

class ZoteroSerialized {
  public filled = 0 // exponential moving average
  private smoothing = 2 / (10 + 1) // keep average over last 10 fills

  constructor(private db: IDBPDatabase<Schema>, private serialize: Serializer) {
  }

  private cachable(item: any): boolean {
    return (!item.isFeedItem && (item.isRegularItem() || item.isNote() || item.isAttachment())) as boolean
  }

  public async fill(items: any[]): Promise<void> {
    items = items.filter(item => this.cachable(item))

    if (!items.length) {
      print(`indexed: fill, nothing to do, avg cache fill=${this.filled}`)
      return
    }

    const tx = this.db.transaction(['ZoteroSerialized', 'ZoteroSerializedTouched'], 'readwrite')
    const store = tx.objectStore('ZoteroSerialized')
    const touched = tx.objectStore('ZoteroSerializedTouched')
    const cached = new Set(await store.getAllKeys())

    const purge = (await touched.getAllKeys())
      .filter((id: number) => {
        if (cached.has(id)) {
          cached.delete(id)
          return false
        }
        else {
          return true
        }
      })
      .map((id: number) => store.delete(id))
    if (purge.length) await Promise.all(purge)
    await touched.clear()

    const requested = items.length
    items = items.filter(item => !cached.has(item.id))
    const current = (requested - items.length) / requested
    this.filled = (current - this.filled) * this.smoothing + this.filled

    if (items.length) {
      print(`indexed: storing ${items.map((item: { id: number }) => item.id)}`)
      const puts = items.map(item => store.put(this.serialize(item)))
      await Promise.all([...puts, tx.done])
    }
    else {
      await tx.done
    }
    print(`indexed: fill, cached ${requested - items.length}, filling ${items.length}, avg cache fill=${this.filled}`)
  }

  public async get(ids: number[]): Promise<Serialized[]> {
    const tx = this.db.transaction('ZoteroSerialized', 'readonly')
    const items: Serialized[] = (await Promise.all(ids.map(id => tx.store.get(id)))).filter(item => item)
    await tx.done
    const fetched = new Set(items.map(item => item.itemID))
    const missing = ids.filter(id => !fetched.has(id))
    if (missing.length) print(`indexed: failed to fetch ${missing}`)
    return items
  }

  public async touch(ids: number[]): Promise<void> {
    const tx = this.db.transaction('ZoteroSerializedTouched', 'readwrite')
    const puts = ids.map(id => tx.store.put(true, id))
    await Promise.all([...puts, tx.done])
  }

  public async purge(): Promise<void> {
    const tx = this.db.transaction(['ZoteroSerialized', 'ZoteroSerializedTouched'], 'readwrite')
    const store = tx.objectStore('ZoteroSerialized')
    const touched = tx.objectStore('ZoteroSerializedTouched')

    const purge = (await touched.getAllKeys()).map(id => store.delete(id))
    await Promise.all([...purge, touched.clear(), tx.done])
  }
}

export const cache = new class Cache {
  public schema = 6
  private db: IDBPDatabase<Schema>
  public opened = false

  public ZoteroSerialized: ZoteroSerialized

  public BetterBibTeX: ExportCache
  public BetterBibLaTeX: ExportCache
  public BetterCSLJSON: ExportCache
  public BetterCSLYAML: ExportCache

  public async open(): Promise<void>
  public async open(serialize: Serializer, lastUpdated: string)
  public async open(serialize?: Serializer, lastUpdated?: string): Promise<void> {
    if (this.opened) throw new Error('database reopened')

    print('indexed: opening cache')
    this.db = await openDB<Schema>('BetterBibTeXCache', this.schema, {
      upgrade: (db, oldVersion, newVersion) => {
        if (oldVersion !== newVersion) {
          for (const store of db.objectStoreNames) {
            db.deleteObjectStore(store)
          }
        }

        db.createObjectStore('ZoteroSerialized', { keyPath: 'itemID' })
        db.createObjectStore('ZoteroSerializedTouched')
        db.createObjectStore('metadata')

        const context = db.createObjectStore('ExportCacheContext', { keyPath: 'id', autoIncrement: true })
        context.createIndex('context', 'context', { unique: true })

        for (const cache of ['BetterBibTeX', 'BetterBibLaTeX', 'BetterCSL JSON', 'BetterCSLYAML']) {
          const store = db.createObjectStore(cache, { keyPath: [ 'context', 'itemID' ] })
          store.createIndex('context', 'context')
          store.createIndex('itemID', 'itemID')
          store.createIndex('context-itemID', [ 'context', 'itemID' ], { unique: true })
        }
      },
    })

    print('indexed: attaching ZoteroSerialized')
    this.ZoteroSerialized = new ZoteroSerialized(this.db, serialize)
    print('indexed: attached ZoteroSerialized')

    this.BetterBibTeX = new ExportCache(this.db, 'BetterBibTeX')
    this.BetterBibLaTeX = new ExportCache(this.db, 'BetterBibLaTeX')
    this.BetterCSLJSON = new ExportCache(this.db, 'BetterCSLJSON')
    this.BetterCSLYAML = new ExportCache(this.db, 'BetterCSLYAML')

    if (lastUpdated) {
      const lastTouched = await this.db.get('metadata', 'lastUpdated') || ''
      if (lastUpdated > lastTouched) {
        print('indexed: store gap, clearing')
        await this.db.clear('ZoteroSerialized')
        for (const cache of ['BetterBibTeX', 'BetterBibLaTeX', 'BetterCSLJSON', 'BetterCSLYAML']) {
          await this.db.clear(cache)
        }
      }
    }

    print('indexed: opened cache')
    this.opened = true
  }

  public async touch(ids: number[]): Promise<void> {
    if (ids.length) {
      for (const store of [this.ZoteroSerialized, this.BetterBibTeX, this.BetterBibLaTeX, this.BetterCSLJSON, this.BetterCSLYAML ]) {
        await store.touch(ids)
      }
    }
    await this.db.put('metadata', Zotero.Date.dateToSQL(new Date(), true), 'lastUpdated')
  }

  public async clear(store: string) {
    const tx = this.db.transaction(store.replace(/ /g, '') as ExportCacheName, 'readonly')
    await tx.store.clear(store)
    await tx.done
  }

  public close(): void {
    this.db.close()
    this.opened = false
  }

  public async export(): Promise<Record<string, any>> {
    const tables: Record<string, any> = {}
    for (const store of this.db.objectStoreNames) {
      if (store === 'metadata') {
        tables[store] = {}
        for (const key of await this.db.getAllKeys(store)) {
          tables[store][key] = await this.db.get(store, key)
        }
      }
      else {
        const tx = this.db.transaction(store, 'readonly')
        tables[store] = await tx.store.getAll()
        await tx.done
      }
    }

    return tables
  }
}
