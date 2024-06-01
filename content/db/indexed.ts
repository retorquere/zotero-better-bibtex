import { default as AsyncIndexedDB, AsyncIDBObjectStore } from 'async-indexed-db'

export class Cache extends AsyncIndexedDB {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    super('better-bibtex:cache', async (_db: IDBDatabase) => {}, 1)
  }

  async open(lastUpdated?: string): Promise<Cache> {
    if (this.db) return this

    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(this.name, 1)

      openRequest.onerror = openRequest.onblocked = (): void => {
        const error = `could not open cache ${this.name}: ${openRequest.error?.message || 'Unknown error'}`
        Zotero.debug(error)
        reject(new Error(error))
      }

      openRequest.onsuccess = async () => {
        try {
          this.db = openRequest.result
          const clear = lastUpdated && (lastUpdated > (Zotero.Prefs.get('translators.better-bibtex.cache.lastUpdated') || ''))
          if (clear) {
            /*
            await this.tx(['ExportFormat', 'Exported', 'ExportContext'], 'readwriteflush', async ({ ExportFormat, Exported, ExportContext }) => {
              await Promise.all([ExportFormat.clear(), Exported.clear(), ExportContext.clear()])
            })
            */
            await this.tx(['ExportFormat'], 'readwriteflush', async ({ ExportFormat }) => {
              await Promise.all([ExportFormat.clear()])
            })
          }
          resolve(this)
        }
        catch (err) {
          reject(err)
        }
      }

      openRequest.onupgradeneeded = () => {
        const cache = openRequest.result
        const stores = {
          ExportFormat: { keyPath: 'itemID', indices: undefined },
          /*
          Exported: { keyPath: ['context', 'itemID'], indices: { // keyPath order matters for key retrieval!
            itemID: { unique: false },
            context: { unique: false }
          } },
          ExportContext:{ keyPath: 'id', autoIncrement: true, indices: {
            properties: { unique: false, multiEntry: true },
          } }
          */
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

  public async tx(stores: string | string[], mode: 'readonly' | 'readwrite' | 'readwriteflush' = 'readonly', handler: (stores: Record<string, AsyncIDBObjectStore>) => Promise<void>): Promise<void> {
    if (typeof stores === 'string') stores = [ stores ]
    const tx = this.db.transaction(stores, mode as IDBTransactionMode)
    const env: Record<string, AsyncIDBObjectStore> = {}
    for (const store of stores) {
      env[store] = AsyncIndexedDB.proxy(tx.objectStore(store)) as AsyncIDBObjectStore
    }
    await handler(env)
    tx.commit()
  }
}
