import { openDB, IDBPDatabase, IDBPTransaction, DBSchema } from 'idb'
import { Events } from '../events'
import { orchestrator } from '../orchestrator'
import { fix, itemToPOJO } from '../item-export-format'

type ExportFormat = { itemID: number } & Omit<Record<string, any>, 'itemID'>

interface Schema extends DBSchema {
  ExportFormat: {
    value: ExportFormat
    key: number
  }
}

export class Cache {
  public version = 1

  private lastUpdated = 'translators.better-bibtex.cache.lastUpdated'
  private db: IDBPDatabase<Schema>

  public touch(): void {
    Zotero.Prefs.set(this.lastUpdated, Zotero.Date.dateToSQL(new Date(), true))
  }

  public async fill(items: any[]): Promise<void> {
    const tx = this.db.transaction('ExportFormat', 'readwrite')
    const cached = new Set(await tx.store.getAllKeys())
    await this.store(items.filter(item => !cached.has(item.id)), tx)
  }

  public async store(items: any[], tx?: IDBPTransaction<Schema, ['ExportFormat'], 'readwrite'>): Promise<void> {
    items = items.filter(item => !item.isFeedItem && item.isRegularItem())
    if (!tx) tx = this.db.transaction('ExportFormat', 'readwrite')
    const puts = items.map(item => tx.store.put(fix(itemToPOJO(item), item)))
    await Promise.all([...puts, tx.done])
  }

  public async open(): Promise<void> {
    this.db = await openDB<Schema>('BetterBibTeXCache', this.version, {
      upgrade: (db, oldVersion, newVersion) => {
        if (oldVersion !== newVersion) {
          for (const store of db.objectStoreNames) {
            db.deleteObjectStore(store)
          }
        }
        db.createObjectStore('ExportFormat', { keyPath: 'itemID' })
      },
    })

    const clear = ((await Zotero.DB.valueQueryAsync('SELECT MAX(dateModified) FROM items')) || '') > (Zotero.Prefs.get(this.lastUpdated) || '')
    if (clear) await this.db.clear('ExportFormat')
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

  public close(): void {
    this.db.close()
  }

  public async delete(ids: number[]): Promise<void> {
    const tx = this.db.transaction('ExportFormat', 'readwrite')
    const deletes = ids.map(id => tx.store.delete(id))
    await Promise.all([...deletes, tx.done])
  }

  public async export(): Promise<Record<string, any>> {
    const tables: Record<string, any> = {}
    for (const store of this.db.objectStoreNames) {
      const tx = this.db.transaction(store, 'readonly')
      tables[store] = await tx.store.getAll()
      await tx.done
    }
    return tables
  }
}

export const cache = new Cache

orchestrator.add({
  id: 'worker-cache',
  description: 'worker-cache',
  startup: async () => {
    await cache.open()

    Events.on('items-update-cache', async ({ ids, action }) => {
      if (action === 'delete') {
        await cache.delete(ids)
      }
      else {
        await cache.store(await Zotero.Items.getAsync(ids))
        cache.touch()
      }
    })
  },
  shutdown: async () => { // eslint-disable-line @typescript-eslint/require-await
    cache.close()
  },
})
