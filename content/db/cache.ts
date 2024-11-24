import { log } from '../logger/simple'

import { is7, worker } from '../client'
import { flash } from '../flash'

var IDBKeyRange // eslint-disable-line no-var
if (!worker && typeof IDBKeyRange === 'undefined') IDBKeyRange = Components.classes['@mozilla.org/appshell/appShellService;1'].getService(Components.interfaces.nsIAppShellService).hiddenDOMWindow.IDBKeyRange

import type { Serialized, Serializer } from '../item-export-format'
import { bySlug } from '../../gen/translators'
import version from '../../gen/version'
// import { main as probe } from './cache-test'

import { CursorWithValue, ObjectStore, Database, Transaction, Factory } from '@retorquere/indexeddb-promise'

import type { Translators as Translator } from '../../typings/translators'
const skip = new Set([ 'keepUpdated', 'worker', 'exportFileData' ])

export function exportContext(translator: string, displayOptions: Partial<Translator.DisplayOptions>): string {
  const defaultOptions = bySlug[translator.replace(/ /g, '')]?.displayOptions
  if (!defaultOptions) throw new Error(`Unexpected translator ${ translator }`)
  const valid = new Set(Object.keys(defaultOptions).filter(option => !skip.has(option)))
  return JSON.stringify(Object.entries({ ...defaultOptions, ...displayOptions }).filter(([ k, _v ]) => valid.has(k)).sort((a, b) => a[0].localeCompare(b[0])))
}

export type ExportContext = {
  context: string
  id: number
}

async function allSettled(promises): Promise<string> {
  if (!promises.length) return ''

  try {
    const settled = await Promise.allSettled(promises)
    const rejected = settled.filter(result => result.status === 'rejected').length
    return rejected ? `${rejected}/${settled.length}` : ''
  }
  catch (err) {
    return `[[${err.message}]]`
  }
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

/*
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
    indexes: {
      context: number
      itemID: number
      'context-itemID': [ number, number ]
    }
  }
  BetterBibTeX: {
    value: ExportedItem
    key: [number, number]
    indexes: {
      context: number
      itemID: number
      'context-itemID': [ number, number ]
    }
  }
  BetterCSLJSON: {
    value: ExportedItem
    key: [number, number]
    indexes: {
      context: number
      itemID: number
      'context-itemID': [ number, number ]
    }
  }
  BetterCSLYAML: {
    value: ExportedItem
    key: [number, number]
    indexes: {
      context: number
      itemID: number
      'context-itemID': [ number, number ]
    }
  }

  metadata: {
    value: { key: string; value: string | number }
    key: string
  }
}
*/
export type ExportCacheName = 'BetterBibLaTeX' | 'BetterBibTeX' | 'BetterCSLJSON' | 'BetterCSLYAML'

class CacheDB extends Database {
  #stores = {
    ZoteroSerialized: { keyPath: 'itemID' },
    metadata: { keyPath: 'key' },
    ExportContext: { keyPath: 'id', autoIncrement: true },
    BetterBibTeX: { keyPath: [ 'context', 'itemID' ]},
    BetterBibLaTeX: { keyPath: [ 'context', 'itemID' ]},
    BetterCSLJSON: { keyPath: [ 'context', 'itemID' ]},
    BetterCSLYAML: { keyPath: [ 'context', 'itemID' ]},
    touched: undefined,
  }

  public _upgrade(_transaction: Transaction, oldVersion: number, newVersion: number | null): void {
    if (typeof newVersion !== 'number') {
      log.info(`cache: creating ${newVersion}`)
    }
    else {
      log.info(`cache: upgrading ${oldVersion} => ${newVersion}`)
    }
    for (const store of this.objectStoreNames) {
      this.deleteObjectStore(store)
    }

    const stores: Record<string, ObjectStore> = {}
    for (const [store, options] of Object.entries(this.#stores)) {
      stores[store] = this.createObjectStore(store, options)
    }

    stores.ExportContext.createIndex('context', 'context', { unique: true })

    for (const store of ['BetterBibTeX', 'BetterBibLaTeX', 'BetterCSLJSON', 'BetterCSLYAML']) {
      stores[store].createIndex('context', 'context')
      stores[store].createIndex('itemID', 'itemID')
      stores[store].createIndex('context-itemID', [ 'context', 'itemID' ], { unique: true })
    }
  }

  public get complete() {
    return [...this.objectStoreNames].sort().join(',') === Object.keys(this.#stores).sort().join(',')
  }
}

class Running {
  public items: Map<number, ExportedItem>
  public cache: ExportCache

  private pending: ExportedItem[] = []
  private context: number

  public async load(cache: ExportCache, path: string) {
    if (Cache.export) throw new Error('cache: waiting for previous export')

    Cache.export = this
    if (cache) {
      this.cache = cache
      // trace('export cache: load')
      const { items, context } = await cache.load(path)
      // trace(`export cache: load done, ${items.size} items`)
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
    this.pending = []
    Cache.export = null
  }
}

export class ExportCache {
  constructor(private db: CacheDB, private name: ExportCacheName) {
  }

  public async touch(ids: number[]): Promise<void> {
    const tx = this.db.transaction(this.name, 'readwrite')
    const store = tx.objectStore(this.name as 'BetterBibTeX')
    const index = store.index('itemID')
    const deletes: Promise<void>[] = []

    for (const id of ids) {
      const cursor = await index.openCursor(id)
      if (cursor) deletes.push(store.delete(cursor.primaryKey))
    }
    const rejected = await allSettled(deletes)
    await tx.commit()
    if (rejected) log.error(`cache: failed to touch ${rejected} entries in ${this.name}`)
  }

  public async clear(path: string): Promise<void> {
    await this.remove(path, false)
  }

  public async remove(path: string, deleteContext = true): Promise<void> {
    const stores: Array<'ExportContext' | ExportCacheName> = deleteContext ? [ this.name, 'ExportContext' ] : [this.name]
    const tx = this.db.transaction(stores, 'readwrite')
    const deletes: Promise<void>[] = []

    const cache = tx.objectStore(this.name as 'BetterBibTeX')
    const cursor = await cache.index('context').openCursor(path)
    if (cursor) deletes.push(cache.delete(cursor.primaryKey))

    if (deleteContext) {
      const context = tx.objectStore('ExportContext')
      const key = await context.index('context').getKey(path)
      if (key) deletes.push(context.delete(key))
    }

    const rejected = await allSettled(deletes)
    await tx.commit()
    if (rejected) log.error(`cache: failed to remove ${rejected} entries from ${this.name}::${path}`)
  }

  public async count(path: string): Promise<number> {
    const tx = this.db.transaction(this.name, 'readonly')
    const store = tx.objectStore(this.name)
    const index = store.index('context')
    const count = await index.count(path)
    return count
  }

  public async load(path: string): Promise<{ context: number; items: Map<number, ExportedItem> }> {
    const stores: Array<'ExportContext' | ExportCacheName> = [ this.name, 'ExportContext' ]
    const tx = this.db.transaction(stores, 'readwrite')

    let context: number
    const items: Map<number, ExportedItem> = new Map

    // trace(`${this.name} load: get export context`)
    try {
      const store = tx.objectStore('ExportContext')
      const index = store.index('context')
      // force type to get auto-increment field
      context = (await index.get(path))?.id || (await store.add({ context: path } as unknown as ExportContext))
    }
    catch {
      return { context, items }
    }
    // trace(`${this.name} load: export context = ${context}`)

    try {
      // trace(`${this.name} load`)
      const store = tx.objectStore(this.name)
      const index = store.index('context')
      const all = await index.getAll(context)
      // trace(`${this.name} loaded`)
      for (const entry of all) {
        items.set(entry.itemID, entry)
      }
      // trace(`${this.name} mapped`)
    }
    catch {
      return { context, items }
    }

    // trace(`${this.name} returned`)
    return { context, items }
  }

  public async store(items: ExportedItem[]): Promise<void> {
    const tx = this.db.transaction(this.name, 'readwrite')
    const store = tx.objectStore(this.name)
    const rejected = await allSettled(items.map(item => store.put(item)))
    await tx.commit()
    if (rejected) log.error(`cache: failed to store ${rejected} for ${this.name}`)
  }
}

class ZoteroSerialized {
  public filled = 0 // exponential moving average
  private smoothing = 2 / (10 + 1) // keep average over last 10 fills

  constructor(private db: CacheDB) {
  }

  private cachable(item: any): boolean {
    return (!item.isFeedItem && (item.isRegularItem() || item.isNote() || item.isAttachment())) as boolean
  }

  public async fill(items: ZoteroItem[], serializer: Serializer): Promise<void> {
    items = items.filter(item => this.cachable(item))
    if (!items.length) return

    let tx = this.db.transaction(['ZoteroSerialized', 'touched'], 'readwrite')
    let store = tx.objectStore('ZoteroSerialized')
    const cached = new Set(await store.getAllKeys())
    const touched = tx.objectStore('touched')
    const purge = new Set(await touched.getAllKeys())

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

    let rejected = await allSettled([...purge].map(id => store.delete(id)))
    await touched.clear()
    await tx.commit()
    if (rejected) log.error(`cache: failed to purge ${rejected}`)

    const current = (items.length - fill.length) / items.length
    this.filled = (current - this.filled) * this.smoothing + this.filled

    if (fill.length) {
      const serialized = await serializer.serialize(fill)
      tx = this.db.transaction(['ZoteroSerialized'], 'readwrite')
      store = tx.objectStore('ZoteroSerialized')
      const puts = serialized.map(item => store.put(item))
      rejected = await allSettled(puts)
      await tx.commit()
      if (rejected) log.error(`cache: failed to store ${rejected}`)
    }
  }

  public async get(ids: number[]): Promise<Serialized[]> {
    // trace(`serialized: ${ids.length} items`)
    let items: Serialized[]
    const tx = this.db.transaction('ZoteroSerialized', 'readonly')
    const store = tx.objectStore('ZoteroSerialized')
    if (Zotero.isWin && !is7) {
      items = (await Promise.all(ids.map(id => store.get(id)))).filter(item => item)
    }
    else {
      const requested = new Set(ids)
      items = (await store.getAll()).filter(item => requested.has(item.itemID))
    }

    if (ids.length !== items.length) log.error(`indexed: failed to fetch ${ ids.length - items.length } items`)
    return items
  }

  public async touch(ids: number[]): Promise<void> {
    const tx = this.db.transaction('touched', 'readwrite')
    const store = tx.objectStore('touched')
    const puts = ids.map(id => store.put(true, id))
    await Promise.all(puts)
    await tx.commit()
  }

  public async purge(): Promise<void> {
    const tx = this.db.transaction(['ZoteroSerialized', 'touched'], 'readwrite')
    const serialized = tx.objectStore('ZoteroSerialized')
    const touched = tx.objectStore('touched')

    const purge = (await touched.getAllKeys()).map(id => serialized.delete(id))
    const rejected = await allSettled(purge)
    await touched.clear()
    await tx.commit()
    if (rejected) log.error(`cache: failed to purge ${rejected}`)
  }
}

export const Cache = new class $Cache {
  public version = 10
  public name = 'BetterBibTeXCache'

  private db: CacheDB

  public ZoteroSerialized: ZoteroSerialized

  public BetterBibTeX: ExportCache
  public BetterBibLaTeX: ExportCache
  public BetterCSLJSON: ExportCache
  public BetterCSLYAML: ExportCache

  private async $open(action: string): Promise<CacheDB> {
    try {
      log.info(`cache: ${action} ${this.version}`)
      const db = new CacheDB(this.name, this.version)
      await db.open()
      return db
    }
    catch (err) {
      log.error(`cache: ${action} ${this.version} failed: ${err.message}`)
      return null
    }
  }

  private async schema(): Promise<string> {
    let schema = '\n'
    for (const storeName of [...this.db.objectStoreNames].sort()) {
      const tx = this.db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      schema += `Object Store: ${JSON.stringify(storeName)}, Key Path: ${JSON.stringify(store.keyPath)}\n`

      for (const indexName of [...store.indexNames].sort()) {
        const index = store.index(indexName)
        schema += `  Index: ${JSON.stringify(indexName)}, Key Path: ${JSON.stringify(index.keyPath)}, Unique: ${!!index.unique}\n`
      }
      await tx.commit()
    }
    return schema
  }

  private async metadata(): Promise<Record<string, string>> {
    const metadata: Record<string, string> = {}

    try {
      const tx = this.db.transaction('metadata', 'readonly')
      const store = tx.objectStore('metadata')
      for (const rec of (await store.getAll()) as { key: string; value: string }[]) {
        metadata[rec.key] = rec.value
      }
    }
    catch (err) {
      log.error(`failed to fetch metadata: ${err.message}`)
    }

    return metadata
  }

  public async open(lastUpdated?: string): Promise<void> {
    if (this.db) throw new Error('database reopened')
    const del = 'translators.better-bibtex.cacheDelete'

    log.info(`opening cache ${worker ? 'worker' : 'main'}`)
    if (!worker) {
      if (Zotero.Prefs.get(del)) {
        log.info('cache delete requested')
        await Factory.deleteDatabase(this.name)
      }
      Zotero.Prefs.clear(del)
    }

    this.db = await this.$open('open')
    if (!this.db || !this.db.complete) {
      this.db?.close()
      log.info('cache: could not open, delete and reopen') // #2995, downgrade 6 => 7
      await Factory.deleteDatabase(this.name)
      this.db = await this.$open('reopen')
    }

    if (this.db) {
      log.info(await this.schema())
    }
    else {
      Zotero.Prefs.set(del, true)
      flash('Cache could not be opened', 'Cache could not be opened, please restart Zotero')
    }

    if (this.db && !worker) {
      const metadata = { Zotero: '', BetterBibTeX: '', lastUpdated: '', ...(await this.metadata()) }
      const reasons = [
        { reason: `Zotero version changed from ${metadata.Zotero || 'none'} to ${Zotero.version}`, test: metadata.Zotero && metadata.Zotero !== metadata.Zotero },
        { reason: `Better BibTeX version changed from ${metadata.BetterBibTeX || 'none'} to ${version}`, test: metadata.BetterBibTeX && metadata.BetterBibTeX !== version },
        { reason: `cache gap found ${metadata.lastUpdated} => ${lastUpdated}`, test: (lastUpdated || false) && metadata.lastUpdated && lastUpdated !== metadata.lastUpdated },
      ]
      const reason = reasons.filter(r => r.test).map(r => r.reason).join(' and ') || false

      log.info(`cache: ${JSON.stringify(metadata)} + ${JSON.stringify({ Zotero: Zotero.version, BetterBibTeX: version, lastUpdated })} => ${JSON.stringify(reasons)} => ${reason}`)
      if (reason) {
        log.info(`cache: reopening because ${reason}`)
        this.db.close()
        await Factory.deleteDatabase(this.name)
        this.db = await this.$open('upgrade')
      }
      const tx = this.db.transaction('metadata', 'readwrite')
      const store = tx.objectStore('metadata')
      log.debug(`3070: ${JSON.stringify({ zotero: Zotero.version, bbt: version })}`)
      await store.put({ key: 'Zotero', value: Zotero.version })
      await store.put({ key: 'BetterBibTeX', value: version })
      await tx.commit()
    }

    this.ZoteroSerialized = new ZoteroSerialized(this.db)

    this.BetterBibTeX = new ExportCache(this.db, 'BetterBibTeX')
    this.BetterBibLaTeX = new ExportCache(this.db, 'BetterBibLaTeX')
    this.BetterCSLJSON = new ExportCache(this.db, 'BetterCSLJSON')
    this.BetterCSLYAML = new ExportCache(this.db, 'BetterCSLYAML')
  }

  public get opened() {
    return !!this.db
  }

  private available(name: string) {
    if (!this.db) {
      log.error(`Cache.${name} on closed cache`)
      return false
    }
    return true
  }

  public async touch(ids: number[]): Promise<void> {
    if (ids.length) {
      for (const store of [ this.ZoteroSerialized, this.BetterBibTeX, this.BetterBibLaTeX, this.BetterCSLJSON, this.BetterCSLYAML ]) {
        await store.touch(ids)
      }
    }
    const tx = this.db.transaction('metadata', 'readwrite')
    const metadata = tx.objectStore('metadata')
    await metadata.put({ key: 'lastUpdated', value: Zotero.Date.dateToSQL((new Date), true) })
    await tx.commit()
  }

  public cache(store: string): ExportCache {
    return this[store.replace(/ /g, '') as 'Better BibTeX'] as ExportCache
  }

  public async clear(store: string) {
    if (!this.available('clear')) return

    store = store.replace(/ /g, '')
    const stores = this.db.objectStoreNames.filter(name => name !== 'metadata' && (store === '*' || name === store))
    if (stores.length) {
      const tx = this.db.transaction(stores, 'readwrite')
      const cleared = await Promise.allSettled(stores.map(name => tx.objectStore(name).clear()))
      await tx.commit()
      const rejected = cleared.map((result, i) => result.status === 'rejected' ? stores[i] : '').filter(_ => _).join(', ')
      if (rejected) log.error(`cache: failed to clear ${rejected}`)
    }
  }

  public async remove(translator: string, path: string) {
    if (!this.available('remove')) return

    await this.cache(translator)?.remove(path)
  }

  public close(): void {
    if (!this.available('close')) return

    this.db.close()
    this.db = null
  }

  public async count() {
    if (!this.available('count')) return 0

    let count = 0
    const stores = this.db.objectStoreNames.filter(name => name !== 'metadata' && name !== 'touched')
    for (const name of stores) {
      const tx = this.db.transaction(name, 'readonly')
      count += await tx.objectStore(name).count()
    }
    return count
  }

  public export: Running
  public async initExport(store: string, path: string) {
    await (new Running).load(this.cache(store), path)
  }

  public async dump(): Promise<Record<string, any>> {
    if (!this.available('dump')) return {}

    const tables: Record<string, any> = {}
    let cursor: CursorWithValue | void
    for (const name of this.db.objectStoreNames) {
      try {
        const tx = this.db.transaction(name, 'readonly')
        const store = tx.objectStore(name)
        switch (name) {
          case 'touched':
            tables[name] = {}
            cursor = await store.openCursor()
            while (cursor) {
              tables[name][cursor.key as string] = cursor.value
              if (!await cursor.continue()) cursor = undefined
            }
            break

          case 'metadata':
            tables[name] = await this.metadata()
            break

          default:
            tables[name] = await store.getAll()
            break
        }
      }
      catch (err) {
        tables[name] = { error: err.message }
        log.error(`cache dump of ${name} failed:`, err)
      }
    }

    return tables
  }
}
