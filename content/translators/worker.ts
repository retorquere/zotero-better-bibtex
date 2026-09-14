import * as client from '../client'
import type { Serialized } from '../../gen/typings/serialized'
import { Client as WorkerClient } from '../worker/json-rpc'
import { Exporter as ExporterInterface, Cache as CacheInterface } from '../worker/interface'
import { orchestrator } from '../orchestrator'
import { log } from '../logger'
import { timeit } from '../audit'

export type Message
//    { kind: 'initialize', CSL_MAPPINGS: any, dateFormatsJSON: any }
//  | { kind: 'terminate' }
//  | { kind: 'configure', environment: Environment }
//  | { kind: 'start', config: Job }
//  | { kind: 'done', output: string, cacheRate: number }
  = { kind: 'debug'; message: string }
  | { kind: 'error'; message: string; stack?: string }
  | { kind: 'cache-delete' }
  | { kind: 'progress'; percent: number; translator: string; autoExport?: string }

export type Job = {
  translator: string
  autoExport?: string

  preferences: any
  options: any

  output: string
  debugEnabled: boolean

  data: {
    items: number[]
    collections: Serialized.Collection[]
  }
}

const url = new URL('chrome://zotero-better-bibtex/content/worker/zotero.js')
url.search = (new URLSearchParams({
  ...(client as unknown as Record<string, string>),
  worker: 'true',
})).toString()

declare class ChromeWorker extends Worker { }
log.info(`json-rpc: main booting worker ${url.toString()}`)
export const worker: ChromeWorker = new ChromeWorker(url.toString())
log.info('json-rpc: main worker started')

class ExporterClient extends WorkerClient implements ExporterInterface {
  public ready = false
  declare public initialize: (config: { CSL_MAPPINGS: any; dateFormatsJSON: any; lastUpdated: string }) => Promise<void>
  declare public terminate: () => Promise<void>
  declare public start: (config: Job) => Promise<{ cacheRate: number; output: string }>

  constructor() {
    super(worker)
  }
}
export const Exporter = new ExporterClient

class ExportsCacheClient extends WorkerClient {
  declare dropTranslator: (translator: string) => Promise<void>
  declare dropAutoExport: (path: string, deleted: boolean) => Promise<void>
}

class SerializedCacheClient extends WorkerClient {
  declare missing: (itemIDs: number[]) => Promise<number[]>
  declare fill: (items: Serialized.Item[]) => Promise<void>
  declare drop: () => Promise<any>
  declare purge: () => Promise<any>
}

class CacheClient extends WorkerClient implements CacheInterface {
  public ready = false
  public rate: Record<string, number> = {}
  public async stats(): Promise<{ rate: number; count: number }> {
    const rate = Object.values(this.rate)
    return { rate: rate.length ? rate.reduce((acc, v) => acc + v) / rate.length : 0, count: await this.count() }
  }

  declare public count: () => Promise<number>
  declare public touch: (itemIDs: number[]) => Promise<void>
  declare public drop: () => Promise<void>
  declare public dump: () => Promise<any>

  public Exports: ExportsCacheClient
  public Serialized: SerializedCacheClient

  constructor() {
    super(worker, 'Cache.')
    this.Exports = new ExportsCacheClient(worker, 'Cache.Exports.')
    this.Serialized = new SerializedCacheClient(worker, 'Cache.Serialized.')
  }
}

export const Cache = new CacheClient

async function lastModified(): Promise<string> {
  try {
    return await Zotero.DB.valueQueryAsync('SELECT MAX(dateModified) FROM items') as string || ''
  }
  catch (err) {
    log.error('worker: failed to retrieve item last modified:', err)
    return ''
  }
}

orchestrator.add({
  id: 'worker',
  description: 'worker',
  needs: [ 'start' ],
  startup: async () => {
    const cacheDelete = 'translators.better-bibtex.cacheDelete'

    let cslMappings: any
    timeit.Sync('worker CSL mappings', () => {
      cslMappings = Object.entries(Zotero.Schema).reduce((acc, [ k, v ]) => { if (k.startsWith('CSL')) acc[k] = v; return acc }, {})
    })
    let dateFormatsJSON: any
    timeit.Sync('worker date formats', () => {
      dateFormatsJSON = Zotero.File.getResource('resource://zotero/schema/dateFormats.json')
    })
    let lastUpdated: string
    await timeit.Async('worker last updated', async () => {
      lastUpdated = Zotero.Prefs.get(cacheDelete) ? 'delete' : await lastModified()
    })

    // post dynamically to fix #2485
    await timeit.Async('worker constants', async () => {
      await Exporter.initialize({
        CSL_MAPPINGS: cslMappings,
        dateFormatsJSON,
        lastUpdated,
      })
    })

    timeit.Sync('worker finalization', () => {
      Zotero.Prefs.clear(cacheDelete)
      Exporter.ready = true
      Cache.ready = true
    })
  },
  shutdown: async () => {
    Exporter.ready = false
    Cache.ready = false
    await Exporter.terminate()
    worker.terminate()
  },
})
