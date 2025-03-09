// import { DatabaseFactory, Database, ObjectStoreInterface } from '@idxdb/promised'
import { DatabaseFactory, Database } from '@idxdb/promised'
// import { SynchronousPromise } from 'synchronous-promise'

import type { Serialized, Serializer } from '../item-export-format'
export type ExportContext = {
  context: string
  translator: string
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

export type CacheMetadata = {
  key: string
  value: string
}

import { log } from '../logger'
import stringify from 'safe-stable-stringify'

import { worker } from '../client'
import { flash } from '../flash'
import { pick, unpick } from '../object'

var IDBKeyRange // eslint-disable-line no-var
if (!worker && typeof IDBKeyRange === 'undefined') IDBKeyRange = Components.classes['@mozilla.org/appshell/appShellService;1'].getService(Components.interfaces.nsIAppShellService).hiddenDOMWindow.IDBKeyRange

import { byLabel } from '../../gen/translators'
import { version } from '../../gen/version.json'
// import { main as probe } from './cache-test'

import type { Translators as Translator } from '../../typings/translators'

export const Context = new class {
  private defaults: Record<string, Partial<Translator.DisplayOptions & { translator: string }>> = {}

  constructor() {
    for (const [ label, header ] of Object.entries(byLabel)) {
      if (typeof header.displayOptions?.worker !== 'boolean') continue
      this.defaults[label] = { ...unpick(header.displayOptions, ['keepUpdated', 'worker']), translator: '' }
    }
  }

  make(translator: string, displayOptions: Partial<Translator.DisplayOptions>): string {
    const cp: Partial<Translator.DisplayOptions & { translator: string }> = this.defaults[translator]
    if (!cp) return ''
    // @ts-expect-error TS2345
    return stringify(pick({ ...cp, ...displayOptions, translator }, Object.keys(cp)))
  }
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

export class Running {
  public serialized: Serialized[]
  public exported: Map<number, ExportedItem>
  public context: number
  public hits = 0
  public misses = 0

  private pending: ExportedItem[] = []

  public async load(itemIDs: number[], translator: string, context: string): Promise<Running> {
    if (context) {
      ({ context: this.context, items: this.exported } = await Cache.Exports.load(translator, context))
    }
    else {
      this.context = -1
      this.exported = new Map
    }
    this.serialized = await Cache.Serialized.get(itemIDs)
    return this
  }

  public fetch(itemID: number): ExportedItem {
    const item = this.exported.get(itemID)
    if (item) {
      this.hits++
    }
    else {
      this.misses++
    }
    return item
  }

  public store(item: Omit<ExportedItem, 'context'>): void {
    this.pending.push({ ...item, context: this.context })
  }

  public async flush(): Promise<void> {
    await Cache.Exports.store(this.pending)
    Cache.updateStats(this)
    this.pending = []
  }
}

export class ExportCache {
  public async touch(itemIDs: number[]): Promise<void> {
    const tx = Cache.db.transaction('Export', 'readwrite')
    const store = tx.objectStore('Export')
    const index = store.index('itemID')
    const deletes: Promise<void>[] = []

    for (const itemID of itemIDs) {
      const cursor = index.openKeyCursor(itemID)
      while (!(await cursor.end())) {
        deletes.push(store.delete(cursor.primaryKey))
        cursor.continue()
      }
    }
    const rejected = await allSettled(deletes)
    await tx.commit()
    if (rejected) log.error(`cache: failed to touch ${rejected} of ${itemIDs.length} entries`)
  }

  public async dropAutoExport(path: string, deleteContext: boolean): Promise<void> {
    const tx = Cache.db.transaction(['ExportContext', 'Export'], 'readwrite')
    const exportContextStore = tx.objectStore('ExportContext')
    const exportContextIndex = exportContextStore.index('context')
    const exportContext = await exportContextIndex.get<ExportContext, string>(path)

    if (exportContext) {
      const deletes: Promise<void>[] = []

      const exportsStore = tx.objectStore('Export')
      const exportsIndex = exportsStore.index('context')
      const cursor = exportsIndex.openKeyCursor<[number, number], number>(exportContext.id)

      while (!(await cursor.end())) {
        deletes.push(exportsStore.delete(cursor.primaryKey))
        cursor.continue()
      }

      if (deleteContext) deletes.push(exportContextStore.delete<number>(exportContext.id))
    }

    await tx.commit()
  }

  public async dropTranslator(translator: string): Promise<void> {
    const tx = Cache.db.transaction(['ExportContext', 'Export'], 'readwrite')
    const exportContextStore = tx.objectStore('ExportContext')
    const exportContextIndex = exportContextStore.index('translator')
    const contextIDs: number[] = await exportContextIndex.getAllKeys<number>(IDBKeyRange.only(translator))

    if (contextIDs.length > 0) {
      const deletes: Promise<void>[] = []

      const exportsStore = tx.objectStore('Export')
      const exportsIndex = exportsStore.index('context')

      for (const contextID of contextIDs) {
        const cursor = exportsIndex.openKeyCursor<[number, number], number>(contextID)
        while (!(await cursor.end())) {
          deletes.push(exportsStore.delete(cursor.primaryKey))
          cursor.continue()
        }
      }

      const rejected = await allSettled(deletes)
      if (rejected) log.error(`cache: failed to remove ${rejected} entries for ${translator}`)
    }

    await tx.commit()
  }

  public async load(translator: string, context: string): Promise<{ context: number; items: Map<number, ExportedItem> }> {
    const tx = Cache.db.transaction([ 'Export', 'ExportContext' ], 'readwrite')

    let contextID = -1
    const items: Map<number, ExportedItem> = new Map

    try {
      let store = tx.objectStore('ExportContext')
      let index = store.index('context')
      // force type to get auto-increment field
      contextID = (await index.get<ExportContext, string>(context))?.id
      if (typeof contextID !== 'number') contextID = await store.add<ExportContext, number>(<ExportContext>{ context, translator })

      store = tx.objectStore('Export')
      index = store.index('context')
      const all: ExportedItem[] = await index.getAll(contextID)
      for (const entry of all) {
        items.set(entry.itemID, entry)
      }
    }
    catch (err) {
      log.error('failed to load export cache', context, err)
    }

    return { context: contextID, items }
  }

  public async store(items: ExportedItem[]): Promise<void> {
    const tx = Cache.db.transaction('Export', 'readwrite')
    const store = tx.objectStore('Export')
    const rejected = await allSettled(items.map(item => store.put(item)))
    await tx.commit()
    if (rejected) log.error(`cache: failed to store ${rejected}`)
  }

  public async drop(): Promise<void> {
    await Cache.drop(['Export', 'ExportContext'])
  }
}

class SerializedCache {
  private cachable(item: any): boolean {
    return (!item.isFeedItem && (item.isRegularItem() || item.isNote() || item.isAttachment())) as boolean
  }

  public async fill(items: Zotero.Item[], serializer: Serializer): Promise<void> {
    items = items.filter(item => this.cachable(item))
    if (!items.length) return

    let tx = Cache.db.transaction(['Serialized', 'touched'], 'readwrite')
    let store = tx.objectStore('Serialized')
    const cached = new Set(await store.getAllKeys())
    const touched = tx.objectStore('touched')
    const purge: Set<number> = new Set(await touched.getAllKeys())

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

    if (fill.length) {
      const serialized = await serializer.serialize(fill)
      tx = Cache.db.transaction(['Serialized'], 'readwrite')
      store = tx.objectStore('Serialized')
      const puts = serialized.map(item => store.put(item))
      rejected = await allSettled(puts)
      await tx.commit()
      if (rejected) log.error(`cache: failed to store ${rejected}`)
    }
  }

  public async get(ids: number[]): Promise<Serialized[]> {
    const tx = Cache.db.transaction('Serialized', 'readonly')
    const store = tx.objectStore('Serialized')
    const requested = new Set(ids)
    const items: Serialized[] = (await store.getAll<Serialized, number>()).filter(item => requested.has(item.itemID))

    if (ids.length !== items.length) log.error(`indexed: failed to fetch ${ ids.length - items.length } items`)
    return items
  }

  public async touch(ids: number[]): Promise<void> {
    const tx = Cache.db.transaction('touched', 'readwrite')
    const store = tx.objectStore('touched')
    const puts = ids.map(id => store.put(true, id))
    await Promise.all(puts)
    await tx.commit()
  }

  public async purge(): Promise<void> {
    const tx = Cache.db.transaction(['Serialized', 'touched'], 'readwrite')
    const serialized = tx.objectStore('Serialized')
    const touched = tx.objectStore('touched')

    const purge = (await touched.getAllKeys()).map(id => serialized.delete(id))
    const rejected = await allSettled(purge)
    await touched.clear()
    await tx.commit()
    if (rejected) log.error(`cache: failed to purge ${rejected}`)
  }

  public async drop(): Promise<void> {
    await Cache.drop(['Serialized', 'touched'])
  }
}

class $Cache {
  #schema = {
    Serialized: {
      $: { keyPath: 'itemID' },
    },
    metadata: {
      $: { keyPath: 'key' },
    },
    ExportContext: {
      $: { keyPath: 'id', autoIncrement: true },
      context: ['context', { unique: true }],
      translator: ['translator'],
    },
    Export: {
      $: { keyPath: [ 'context', 'itemID' ]},
      context: ['context'],
      itemID: ['itemID'],
    },
    touched: {},
  }

  public cacheRate: Record<string, number> = {}

  public version = 11
  public name = 'BetterBibTeXCache'

  public db: Database
  public Serialized = new SerializedCache
  public Exports = new ExportCache

  private async $open(action: string): Promise<Database> {
    try {
      log.info(`cache: ${action} ${this.version}`)
      return await DatabaseFactory.open(this.name, this.version, [{
        version: this.version,
        // eslint-disable-next-line @typescript-eslint/require-await
        migration: async ({db, dbOldVersion, dbNewVersion }) => {
          if (typeof dbNewVersion !== 'number') {
            log.info(`cache: creating ${dbNewVersion}`)
          }
          else {
            log.info(`cache: upgrading ${dbOldVersion} => ${dbNewVersion}`)
          }
          for (const store of db.objectStoreNames) {
            db.deleteObjectStore(store)
          }

          for (const [storeName, storeConfig] of Object.entries(this.#schema)) {
            const store = db.createObjectStore(storeName, (storeConfig as any).$)

            for (const [indexName, indexConfig] of Object.entries(storeConfig)) {
              if (indexName !== '$') store.createIndex(indexName, ...(indexConfig as [string]))
            }
          }
        },
      }])
    }
    catch (err) {
      log.error(`cache: ${action} ${this.version} failed: ${err.message}`)
      return null
    }
  }

  private async validate(): Promise<boolean> {
    if (worker) return true

    log.info('cache: validating schema')

    // #3111 -- what the *actual*?!?!
    if (!this.db.objectStoreNames.length) return false

    const tx = this.db.transaction(this.db.objectStoreNames, 'readonly')
    const schema: Record<string, any> = {}
    for (const storeName of this.db.objectStoreNames) {
      schema[storeName] = {}
      const store = tx.objectStore(storeName)

      if (store.autoIncrement || store.keyPath) {
        schema[storeName].$ = {
          ...(store.keyPath ? { keyPath: store.keyPath } : {}),
          ...(store.autoIncrement ? { autoIncrement: true } : {}),
        }
      }

      for (const indexName of store.indexNames) {
        const index = store.index(indexName)
        schema[storeName][indexName] = [ index.keyPath, ...(index.unique ? [{ unique: true }] : []) ]
      }
    }
    await tx.commit()

    const expected = stringify(this.#schema, null, 2)
    const found = stringify(schema, null, 2)
    log.info(`cache: schema: ${found}`)
    if (expected !== found) {
      log.error(`cache: schema mismatch!\nexpected:${expected}\nfound:${found}`)
      return false
    }
    return true
  }

  private async metadata(): Promise<Record<string, string>> {
    const metadata: Record<string, string> = {}

    try {
      const tx = this.db.transaction('metadata', 'readonly')
      const store = tx.objectStore('metadata')
      for (const rec of (await store.getAll<CacheMetadata, string>())) {
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
        await DatabaseFactory.deleteDatabase(this.name)
      }
      Zotero.Prefs.clear(del)
    }

    await Zotero.proxyAuthComplete

    this.db = await this.$open('open')
    if (!this.db || !(await this.validate())) {
      this.db?.close()
      log.info('cache: could not open, delete and reopen') // #2995, downgrade 6 => 7
      await DatabaseFactory.deleteDatabase(this.name)
      this.db = await this.$open('reopen')
    }

    if (!this.db) {
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
        await DatabaseFactory.deleteDatabase(this.name)
        this.db = await this.$open('upgrade')
      }
      const tx = this.db.transaction('metadata', 'readwrite')
      const store = tx.objectStore('metadata')
      await store.put<CacheMetadata, string>({ key: 'Zotero', value: Zotero.version })
      await store.put<CacheMetadata, string>({ key: 'BetterBibTeX', value: version })
      await tx.commit()
    }
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
      await this.Exports.touch(ids)
    }
    const tx = this.db.transaction('metadata', 'readwrite')
    const metadata = tx.objectStore('metadata')
    await metadata.put({ key: 'lastUpdated', value: Zotero.Date.dateToSQL((new Date), true) })
    await tx.commit()
  }

  public async xclear(store: string) {
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

  public async initExport(itemIDs: number[], translator: string, path: string): Promise<Running> {
    return await (new Running).load(itemIDs, translator, path)
  }

  public updateStats(run: Running): void {
    // average over 10 runs
    this.cacheRate[''] = this.cacheRate[''] + (run.hits - (this.cacheRate[''] * (run.hits + run.misses))) / 10
  }

  public async dump(): Promise<Record<string, any>> {
    if (!this.available('dump')) return {}

    const tables: Record<string, any> = {}
    for (const name of this.db.objectStoreNames) {
      try {
        const tx = this.db.transaction(name, 'readonly')
        const store = tx.objectStore(name)
        switch (name) {
          case 'touched': {
            tables[name] = {}
            const cursor = store.openCursor<number, number, boolean>()
            while (!(await cursor.end())) {
              tables[name][cursor.primaryKey] = cursor.value
              cursor.continue()
            }
            break
          }

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

  public async drop(names: string[]): Promise<void> {
    const tx = Cache.db.transaction(names, 'readwrite')
    for (const name of names) {
      const store = tx.objectStore(name)
      await store.clear()
    }
    await tx.commit()
  }
}

export const Cache = new $Cache
