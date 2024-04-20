import * as idb from './idb'

export let db: IDBDatabase | null = null

export async function initialize(lastUpdated?: string): Promise<boolean> {
  if (db) return

  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('better-bibtex', 1)

    openRequest.onerror = openRequest.onblocked = function (e) {
      Zotero.debug(`could not open cache: ${(event.target as IDBRequest).error}`)
      reject(new Error(`could not open cache: ${(event.target as IDBRequest).error}`))
    }

    openRequest.onsuccess = async function (e) {
      try {
        db = (e.target as IDBRequest).result
        const clear = lastUpdated && (lastUpdated > (Zotero.Prefs.get('translators.better-bibtex.cache.lastUpdated') || ''))
        if (clear) {
          const { tx, ExportFormat, Exported, ExportContext } = idb.tx(db, ['ExportFormat', 'Exported', 'ExportContext'], 'readwriteflush')
          await Promise.all([ExportFormat.clear(), Exported.clear(), ExportContext.clear()])
          await tx
        }
        resolve(true)
      }
      catch (err) {
        reject(err)
      }
    }

    openRequest.onupgradeneeded = function(e) {
      const cache = (e.target as IDBRequest).result
      const stores = {
        ExportFormat: { keyPath: 'itemID', indices: undefined },
        Exported: { keyPath: ['context', 'itemID'], indices: { // keyPath order matters for key retrieval!
          itemID: { unique: false },
          context: { unique: false } 
        } },
        ExportContext:{ keyPath: 'id', autoIncrement: true, indices: {
          properties: { unique: false, multiEntry: true },
        } }
      }

      for (const [name, config] of Object.entries(stores)) {
        if (cache.objectStoreNames.contains(name)) cache.deleteObjectStore(name)
        const indices = config.indices
        delete config.indices
        const store = cache.createObjectStore(name, config)
        if (indices) {
          for (const [index, setup] of Object.entries(indices)) {
            store.createIndex(index, index, setup)
          }
        }
      }
    }
  })
}

export function close() {
  db?.close()
}

export const exportFormat = new class ExportFormat {
  async get(itemID: number) {
    if (!db) return undefined
    const { ExportFormat } = idb.tx(db, 'ToExportFormat', 'readonly')
    return await ExportFormat.get(itemID)
  }

  async store(item: ZoteroItem) {
    if (!db) return
    if (item.isFeedItem || !item.isRegularItem()) return

    const exportFormat = Zotero.Utilities.Internal.itemToExportFormat(item, false, true)
    const { tx, ExportFormat } = idb.tx(db, 'ExportFormat', 'readwriteflush')
    await ExportFormat.put(exportFormat)
    await tx
    Zotero.Prefs.set('translators.better-bibtex.cache.lastUpdated', exportFormat.dateModified)
  }

  async delete(itemID: number) {
    if (!db) return undefined
    const { tx, ExportFormat } = idb.tx(db, 'ExportFormat', 'readwriteflush')
    await ExportFormat.delete(itemID)
    await tx
  }

  async clear() {
    if (!db) return undefined
    const { tx, ExportFormat } = idb.tx(db, 'ExportFormat', 'readwriteflush')
    await ExportFormat.clear()
    await tx
  }

  async missing(itemIDs: number[]) {
    const { tx, ExportFormat } = idb.tx(db, 'ExportFormat', 'readonly')
    const stored = new Set((await ExportFormat.getAllKeys()) as number[])
    await tx
    return itemIDs.filter(itemID => !stored.has(itemID))
  }
}

export type ExportContext = {
  context: number
  preferences: string[]
  options: string[]
}
export type CacheEntry = {
  context: number
  itemID: number
  exported: string
}

type Properties = Record<string, string | number | boolean>

function serialize(properties: Properties): string[] {
  return Object.entries(properties).map(([k, v]) => `${k}=${JSON.stringify(v)}`).sort()
}
function key(context: { preferences: Properties, options?: Properties }) {
  return serialize(context.preferences).concat(context.options ? serialize(context.options) : []).join('\x1B')
}
export const exported = new class Exported {
  async context(preferences: Properties, options: Properties): Promise<number> {
    const { tx, ExportContext } = idb.tx(db, 'ExportContext', 'readwriteflush')
    try {
      for await (const stored of ExportContext.each()) {
        if (key(stored == key({ preferences, options}) return stored.id
      }
      return await ExportContext.add(, { properties }) as number
    }
    finally {
      await tx
    }
  }

  async add(context: number, entry: CacheEntry) {
    const { exported } = idb.tx(db, ['exported'], 'readwrite')
    idb.add(exported, { context, ...entry }) // order matters -- context *must* be first for compound key retrieval!
  }

  async get(context: number, itemID: number) {
    const { exported } = idb.tx(db, ['exported'], 'readwrite')
    idb.get(exported, [context, itemID]) // order matters!
  }

  async remove(itemID: number) {
    return await this.drop('itemID', itemID)
  }

  async drop(name: string, value: number) {
    return new Promise((resolve, reject) => {
      const { exported } = idb.tx(db, ['exported'], 'readwrite')
      const index = exported.index(name)
      const request = index.openCursor(IDBKeyRange.only(value))
      request.onsuccess = function(e) {
        let cursor = e.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
        else {
          resolve(true)
        }
      }

      request.onerror = function(e) {
        reject(new Error(e.target.error))
      }
    })
  }

  async touch(property: string, keep: any[]) {
    for (const context of await this.touched(property, keep)) {
      await this.drop('context', context)
    }
  }

  private async touched(property: string, keep: any[]): Promise<number[]> {
    const keeps = keep.map(context => Object.entries(context).map(([k, v]) => `${k}=${JSON.stringify(v)}`).sort().join('\x1B'))

    return new Promise((resolve, reject) => {
      const { exportContext } = idb.tx(db, ['exportContext'], 'readwrite')
      
      const request = property
        ? exportContext.index('properties').openCursor(IDBKeyRange.bound(`${property}=`, `${property}=\x7f`))
        : exportContext.openCursor()
      const contexts = []
      request.onsuccess = function(e) {
        const cursor = (e.target as IDBRequest).result
        if (cursor) {
          if (!keeps.includes(cursor.value.properties.join('\x1B'))) {
            contexts.push(cursor.value.context)
            cursor.delete()
          }
          cursor.continue()
        }
        else {
          resolve(contexts)
        }
      }
      request.onerror = function(e) {
        reject(new Error(e.target.error))
      }
    })
  }

  async clear() {
    if (!db) return undefined
    const { exported } = idb.tx(db, ['exported'], 'readwrite')
    return await idb.clear(exported)
  }

}

export async function reset(): Promise<void> {
  await Promise.all([exportFormat.clear(), exported.clear()])
}
