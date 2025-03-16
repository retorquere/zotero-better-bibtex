import * as client from '../client'
import type { Item } from '../../gen/typings/serialized-item'
import { Client as WorkerClient } from '../worker/json-rpc'
import { Exporter as ExporterInterface, Cache as CacheInterface } from '../worker/interface'
import { orchestrator } from '../orchestrator'
import type { Collection } from '../../gen/typings/serialized-item'
import { $dump } from '../logger'

export type Message =
//    { kind: 'initialize', CSL_MAPPINGS: any, dateFormatsJSON: any }
//  | { kind: 'terminate' }
//  | { kind: 'configure', environment: Environment }
//  | { kind: 'start', config: Job }
//  | { kind: 'done', output: string, cacheRate: number }
    { kind: 'debug'; message: string }
  | { kind: 'error'; message: string; stack?: string }
//  | { kind: 'item'; item: number }
  | { kind: 'cache-delete' }
  | { kind: 'progress'; percent: number; translator: string; autoExport: string }

export type Job = {
  translator: string
  autoExport?: string

  preferences: any
  options: any

  output: string
  debugEnabled: boolean

  data?: {
    items: number[]
    collections: Collection[]
  }
}

const url = new URL('chrome://zotero-better-bibtex/content/worker/zotero.js')
const params = new URLSearchParams({
  ...(client as unknown as Record<string, string>),
  worker: 'true',
})
url.search = params.toString()

declare class ChromeWorker extends Worker { }
$dump(`json-rpc: main booting worker ${url.toString()}`)
export const worker: ChromeWorker = new ChromeWorker(url.toString())
$dump('json-rpc: main worker started')

class ExporterClient extends WorkerClient implements ExporterInterface {
  public ready = false
  public initialize: (config: { CSL_MAPPINGS: any; dateFormatsJSON: any; lastUpdated: string }) => Promise<void>
  public terminate: () => Promise<void>
  public start: (config: Job) => Promise<{ cacheRate: number; output: string }>

  constructor() {
    super(worker)
  }
}
export const Exporter = new ExporterClient

class ExportsCacheClient extends WorkerClient {
  dropTranslator: (translator: string) => Promise<void>
  dropAutoExport: (path: string, deleted: boolean) => Promise<void>
}

class SerializedCacheClient extends WorkerClient {
  missing: (itemIDs: number[]) => Promise<number[]>
  fill: (items: Item[]) => Promise<void>
  drop: () => Promise<any>
  purge: () => Promise<any>
}

class CacheClient extends WorkerClient implements CacheInterface {
  public ready = false
  public rate: Record<string, number> = {}
  public async stats(): Promise<{ rate: number; count: number }> {
    const rate = Object.values(this.rate)
    return { rate: rate.length ? rate.reduce((acc, v) => acc + v) / rate.length : 0, count: await this.count() }
  }

  public count: () => Promise<number>
  public touch: (itemIDs: number[]) => Promise<void>
  public drop: () => Promise<void>
  public dump: () => Promise<any>

  public Exports: ExportsCacheClient
  public Serialized: SerializedCacheClient

  constructor() {
    super(worker, 'Cache.')
    this.Exports = new ExportsCacheClient(worker, 'Cache.Exports.')
    this.Serialized = new SerializedCacheClient(worker, 'Cache.Serialized.')
  }
}

export const Cache = new CacheClient

orchestrator.add({
  id: 'worker',
  description: 'worker',
  needs: [ 'start' ],
  startup: async () => {
    const cacheDelete = 'translators.better-bibtex.cacheDelete'
    // post dynamically to fix #2485
    await Exporter.initialize({
      CSL_MAPPINGS: Object.entries(Zotero.Schema).reduce((acc, [ k, v ]) => { if (k.startsWith('CSL')) acc[k] = v; return acc }, {}),
      dateFormatsJSON: Zotero.File.getResource('resource://zotero/schema/dateFormats.json'),
      lastUpdated: Zotero.Prefs.get(cacheDelete) ? 'delete' : (await Zotero.DB.valueQueryAsync('SELECT MAX(dateModified) FROM items') as string || ''),
    })
    Zotero.Prefs.clear(cacheDelete)
    Exporter.ready = true
    Cache.ready = true
  },
  shutdown: async () => {
    Exporter.ready = false
    Cache.ready = false
    await Exporter.terminate()
    worker.terminate()
  },
})
