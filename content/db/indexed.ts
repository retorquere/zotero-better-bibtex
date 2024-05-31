import Dexie, { type EntityTable } from 'dexie'
import { Events } from '../events'
import { orchestrator } from '../orchestrator'
import { fix, itemToPOJO } from '../item-export-format'

type ExportFormat = { itemID: number } & Omit<Record<string, any>, 'itemID'>

export class Cache extends Dexie {
  private lastUpdated = 'translators.better-bibtex.cache.lastUpdated'

  public ExportFormat!: EntityTable<ExportFormat, 'itemID'>

  constructor() {
    super('BetterBibTeXCache')
    this.version(1).stores({
      ExportFormat: 'itemID',
    })
  }

  public touch(): void {
    Zotero.Prefs.set(this.lastUpdated, Zotero.Date.dateToSQL(new Date(), true))
  }

  public async fill(items: any[]): Promise<void> {
    const cached = new Set(await this.ExportFormat.toCollection().primaryKeys())
    await this.store(items.filter(item => !cached.has(item.id)))
  }

  public async store(items: any[]): Promise<void> {
    items = items.filter(item => !item.isFeedItem && item.isRegularItem())
    await Promise.all(items.map(item => cache.ExportFormat.put(fix(itemToPOJO(item), item))))
  }

  public async init(): Promise<void> {
    await this.open()

    await Zotero.initializationPromise
    const clear = ((await Zotero.DB.valueQueryAsync('SELECT MAX(dateModified) FROM items')) || '') > (Zotero.Prefs.get(this.lastUpdated) || '')

    if (clear) await this.ExportFormat.clear()
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

  public async export(): Promise<Record<string, any>> {
    const tables: Record<string, any> = {}
    for (const table of this.tables) {
      tables[table.name] = await table.toArray()
    }
    return tables
  }
}

export const cache = new Cache

orchestrator.add('worker-cache', {
  description: 'worker-cache',
  startup: async () => {
    await cache.init()

    Events.on('items-update-cache', async ({ ids, action }) => {
      if (action === 'delete') {
        await Promise.all(ids.map(id => cache.ExportFormat.delete(id)))
      }
      else {
        await cache.store(await Zotero.Items.getAsync(ids))
        cache.touch()
      }
    })
  },
})
