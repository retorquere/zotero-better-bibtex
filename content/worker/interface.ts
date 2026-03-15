import type { Serialized } from '../../gen/typings/serialized'
import type { Job } from '../translators/worker'

export interface Cache {
  count(): Promise<number>
  touch(itemIDs: number[]): Promise<void>
  drop(stores: '*' | string[]): Promise<void>
  dump(): Promise<any>

  Serialized: {
    missing(itemIDs: number[]): Promise<number[]>
    fill(items: Serialized.Item[]): Promise<void>
    drop(): Promise<any>
    purge(): Promise<any>
  }

  Exports: {
    dropTranslator(translator: string): Promise<void>
    dropAutoExport(path: string, deleted: boolean): Promise<void>
  }
}

export interface Exporter {
  initialize(config: { CSL_MAPPINGS: any; dateFormatsJSON: any; lastUpdated: string }): Promise<void>
  terminate(): Promise<void>
  start(config: Job): Promise<{ cacheRate: number; output: string }>
}
