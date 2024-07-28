import type { Serialized, Serializer } from '../item-export-format'
import { bySlug } from '../../gen/translators'
import { openDB, IDBPDatabase, DBSchema } from 'idb'
import { log } from '../logger'
import version from '../../gen/version'
import Deferred from 'p-defer'

import type { Translators as Translator } from '../../typings/translators'
const skip = new Set([ 'keepUpdated', 'worker', 'exportFileData' ])

export function exportContext(translator: string, displayOptions: Partial<Translator.DisplayOptions>): string {
  const defaultOptions = bySlug[translator.replace(/ /g, '')]?.displayOptions
  if (!defaultOptions) throw new Error(`Unexpected translator ${translator}`)
  const valid = new Set(Object.keys(defaultOptions).filter(option => !skip.has(option)))
  return JSON.stringify(Object.entries({ ...defaultOptions, ...displayOptions }).filter(([k, _v]) => valid.has(k)).sort((a, b) => a[0].localeCompare(b[0])))
}

export type ExportContext = {
  context: string
  id: number
}

export interface ExportedItemMetadata {
  DeclarePrefChars: string
  noopsort: boolean
  packages: string[]
}

export type ExportedItem = {
  context: number
  itemID: number
  entry: string
  metadata: ExportedItemMetadata
}

interface Schema extends DBSchema {
  ZoteroSerialized: {
    value: Serialized
    key: number
  }
  touched: {
    value: boolean
    key: number
  }

  ExportContext: {
    value: ExportContext
    key: number
    indexes: { context: string }
  }

  BetterBibLaTeX: {
    value: ExportedItem
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }
  BetterBibTeX: {
    value: ExportedItem
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }
  BetterCSLJSON: {
    value: ExportedItem
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }
  BetterCSLYAML: {
    value: ExportedItem
    key: [number, number]
    indexes: { context: number, itemID: number, 'context-itemID': [ number, number ] }
  }

  metadata: {
    value: { key: string, value: string | number }
    key: string
  }
}
export type ExportCacheName = 'BetterBibLaTeX' | 'BetterBibTeX' | 'BetterCSLJSON' | 'BetterCSLYAML'

class Running {
  public items: Map<number, ExportedItem>
  public cache: ExportCache

  private pending: ExportedItem[] = []
  private context: number
  private deferred = Deferred()
  public ready: Promise<void>

  constructor() {
    this.ready = this.deferred.promise as Promise<void>
  }

  public async load(cache: ExportCache, path: string) {
    if (Cache.export) {
      log.error('overlapping export cache')
      await Cache.export.ready
    }

    Cache.export = this
    if (cache) {
      this.cache = cache
      const { items, context } = await cache.load(path)
      this.items = items
      this.context = context
    }
  }

  public fetch(itemID: number): ExportedItem {
    return this.cache ? this.items.get(itemID) : null
  }

  public store(item: Omit<ExportedItem, 'context'>): void {
    if (this.cache) this.pending.push({ ...item, context: this.context })
  }

  public async flush(): Promise<void> {
    if (this.cache) await this.cache.store(this.pending)
    this.deferred.resolve()
    this.pending = []
    Cache.export = null
  }
}

export class ExportCache {
  constructor(private db: IDBPDatabase<Schema>, private name: ExportCacheName) {
  }

  public async touch(ids: number[]): Promise<void> {
    const tx = this.db.transaction(this.name, 'readwrite')
    const store = tx.objectStore(this.name as 'BetterBibTeX')
    const index = store.index('itemID')
    const deletes: Promise<void>[] = []
    for (const id of ids) {
      let cursor = await index.openCursor(IDBKeyRange.only(id))
      while (cursor) {
        deletes.push(store.delete(cursor.primaryKey))
        cursor = await cursor.continue()
      }
    }
    await Promise.all([...deletes, tx.done])
  }

  public async clear(path: string): Promise<void> {
    await this.remove(path, false)
  }

  public async remove(path: string, deleteContext = true): Promise<void> {
    const stores: Array<'ExportContext' | ExportCacheName> = deleteContext ? [this.name, 'ExportContext'] : [ this.name ]
    const tx = this.db.transaction(stores, 'readwrite')
    const deletes: Promise<void>[] = []

    const cache = tx.objectStore(this.name as 'BetterBibTeX')
    let cursor = await cache.index('context').openCursor(IDBKeyRange.only(path))
    while (cursor) {
      deletes.push(cache.delete(cursor.primaryKey))
      cursor = await cursor.continue()
    }

    if (deleteContext) {
      const context = tx.objectStore('ExportContext')
      const key = await context.index('context').getKey(path)
      if (key) deletes.push(context.delete(key))
    }

    await Promise.all([...deletes, tx.done])
  }

  public async count(path: string): Promise<number> {
    return await this.db.countFromIndex(this.name as 'BetterBibTeX', 'context', IDBKeyRange.only(path))
  }

  public async load(path: string): Promise<{ context: number, items: Map<number, ExportedItem>}> {
    const stores: Array<'ExportContext' | ExportCacheName> = [this.name, 'ExportContext']
    const tx = this.db.transaction(stores, 'readwrite')

    let context: number
    const items: Map<number, ExportedItem> = new Map

    try {
      const store = tx.objectStore('ExportContext')
      const index = store.index('context')
      // force type to get auto-increment field
      context = (await index.get(path))?.id || (await store.add({ context: path } as unknown as ExportContext))
    }
    catch (err) {
      return { context, items }
    }

    try {
      const store = tx.objectStore(this.name)
      const index = store.index('context')
      for (const entry of (await index.getAll(context))) {
        items.set(entry.itemID, entry)
      }
    }
    catch (err) {
      return { context, items }
    }

    return { context, items }
  }

  public async store(items: ExportedItem[]): Promise<void> {
    const tx = this.db.transaction(this.name, 'readwrite')
    await Promise.all([...items.map(item => tx.store.put(item)), tx.done])
  }
}

class ZoteroSerialized {
  public filled = 0 // exponential moving average
  private smoothing = 2 / (10 + 1) // keep average over last 10 fills

  constructor(private db: IDBPDatabase<Schema>, private serializer: Serializer) {
  }

  private cachable(item: any): boolean {
    return (!item.isFeedItem && (item.isRegularItem() || item.isNote() || item.isAttachment())) as boolean
  }

  public async fill(items: ZoteroItem[]): Promise<void> {
    items = items.filter(item => this.cachable(item))
    if (!items.length) return

    let tx = this.db.transaction(['ZoteroSerialized', 'touched'], 'readwrite')
    let store = tx.objectStore('ZoteroSerialized')
    const touched = tx.objectStore('touched')
    const purge = new Set(await touched.getAllKeys())

    const cached = new Set(await store.getAllKeys())
    const fill = items.filter(item => {
      if (cached.has(item.id)) {
        if (purge.has(item.id)) {
          purge.delete(item.id)
        }
        else {
          return false
        }
      }
      return true
    })

    await Promise.all([ ...[...purge].map(id => store.delete(id)), touched.clear(), tx.done])

    const current = (items.length - fill.length) / items.length
    this.filled = (current - this.filled) * this.smoothing + this.filled

    if (fill.length) {
      const serialized = await this.serializer.serialize(fill)
      tx = this.db.transaction(['ZoteroSerialized'], 'readwrite')
      store = tx.objectStore('ZoteroSerialized')
      const puts = serialized.map(item => store.put(item))
      await Promise.all([...puts, tx.done])
    }
  }

  public async get(ids: number[]): Promise<Serialized[]> {
    const tx = this.db.transaction('ZoteroSerialized', 'readonly')
    const items: Serialized[] = (await Promise.all(ids.map(id => tx.store.get(id)))).filter(item => item)
    await tx.done
    const fetched = new Set(items.map(item => item.itemID))
    const missing = ids.filter(id => !fetched.has(id))
    if (missing.length) log.error(`indexed: failed to fetch ${missing}`)
    return items
  }

  public async touch(ids: number[]): Promise<void> {
    const tx = this.db.transaction('touched', 'readwrite')
    const puts = ids.map(id => tx.store.put(true, id))
    await Promise.all([...puts, tx.done])
  }

  public async purge(): Promise<void> {
    const tx = this.db.transaction(['ZoteroSerialized', 'touched'], 'readwrite')
    const store = tx.objectStore('ZoteroSerialized')
    const touched = tx.objectStore('touched')

    const purge = (await touched.getAllKeys()).map(id => store.delete(id))
    await Promise.all([...purge, touched.clear(), tx.done])
  }
}

export const Cache = new class $Cache {
  public schema = 8
  private db: IDBPDatabase<Schema>
  public opened = false

  public ZoteroSerialized: ZoteroSerialized

  public BetterBibTeX: ExportCache
  public BetterBibLaTeX: ExportCache
  public BetterCSLJSON: ExportCache
  public BetterCSLYAML: ExportCache

  public async open(): Promise<void>
  public async open(lastUpdated: string, serializer: Serializer)
  public async open(lastUpdated?: string, serializer?: Serializer): Promise<void> {
    if (this.opened) throw new Error('database reopened')

    this.db = await openDB<Schema>('BetterBibTeXCache', this.schema, {
      upgrade: (db, oldVersion, newVersion) => {
        if (oldVersion !== newVersion) {
          for (const store of db.objectStoreNames) {
            db.deleteObjectStore(store)
          }
        }

        db.createObjectStore('ZoteroSerialized', { keyPath: 'itemID' })
        db.createObjectStore('touched')
        db.createObjectStore('metadata')

        const context = db.createObjectStore('ExportContext', { keyPath: 'id', autoIncrement: true })
        context.createIndex('context', 'context', { unique: true })

        const stores = [
          db.createObjectStore('BetterBibTeX', { keyPath: [ 'context', 'itemID' ] }),
          db.createObjectStore('BetterBibLaTeX', { keyPath: [ 'context', 'itemID' ] }),
          db.createObjectStore('BetterCSLJSON', { keyPath: [ 'context', 'itemID' ] }),
          db.createObjectStore('BetterCSLYAML', { keyPath: [ 'context', 'itemID' ] }),
        ]
        for (const store of stores) {
          store.createIndex('context', 'context')
          store.createIndex('itemID', 'itemID')
          store.createIndex('context-itemID', [ 'context', 'itemID' ], { unique: true })
        }
      },
    })

    this.ZoteroSerialized = new ZoteroSerialized(this.db, serializer)

    this.BetterBibTeX = new ExportCache(this.db, 'BetterBibTeX')
    this.BetterBibLaTeX = new ExportCache(this.db, 'BetterBibLaTeX')
    this.BetterCSLJSON = new ExportCache(this.db, 'BetterCSLJSON')
    this.BetterCSLYAML = new ExportCache(this.db, 'BetterCSLYAML')

    if (lastUpdated) {
      const clear = [
        lastUpdated > (await this.db.get('metadata', 'lastUpdated') || '') ? 'store gap' : '',
        Zotero.version !== (await this.db.get('metadata', 'Zotero') || '') ? `Zotero version changed to ${Zotero.version}` : '',
        version !== (await this.db.get('metadata', 'BetterBibteX') || '') ? `Better BibTeX version changed to ${version}` : '',
      ].filter(reason => reason)
      if (clear.length) {
        log.info(`clearing cache: ${clear.join(', ')}`)
        for (const store of this.db.objectStoreNames) {
          switch (store) {
            case 'metadata':
              break
            default:
              await this.db.clear(store)
              break
          }
        }

        await this.db.put('metadata', Zotero.version, 'Zotero')
        await this.db.put('metadata', version, 'BetterBibTeX')
      }
    }

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

  public cache(store: string): ExportCache {
    return this[store.replace(/ /g, '') as 'Better BibTeX'] as ExportCache
  }

  public async clear(store: string) {
    store = store.replace(/ /g, '')
    for (store of [...this.db.objectStoreNames].filter(name => name !== 'metadata' && (store === '*' || name === store))) {
      await this.db.clear(store as 'BetterBibTeX')
    }
  }

  public async remove(translator: string, path: string) {
    await this.cache(translator)?.remove(path)
  }

  public close(): void {
    this.db.close()
    this.opened = false
  }

  public async count() {
    let entries = 0
    for (const store of this.db.objectStoreNames) {
      switch (store) {
        case 'metadata':
        case 'touched':
          break
        default:
          entries += await this.db.count(store)
      }
    }
    return entries
  }

  public export: Running
  public async initExport(store: string, path: string) {
    await (new Running).load(this.cache(store), path)
  }

  public async dump(): Promise<Record<string, any>> {
    const tables: Record<string, any> = {}
    for (const store of [...this.db.objectStoreNames]) {
      switch (store) {
        case 'touched':
        case 'metadata':
          tables[store] = {}
          for (const key of await this.db.getAllKeys(store)) {
            tables[store][key] = await this.db.get(store, key)
          }
          break

        default:
          const tx = this.db.transaction(store, 'readonly') // eslint-disable-line no-case-declarations
          tables[store] = await tx.store.getAll()
          await tx.done
          break
      }
    }

    return tables
  }
}
