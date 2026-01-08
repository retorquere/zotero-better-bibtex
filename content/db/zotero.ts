/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { log } from '../logger'

function normalize(query: string): string {
  query = query.replace(/[\s\n]+/g, ' ').trim()
  log.info('executing', query)
  return query
}

const options = {
  // noParseParams: true
}

export async function queryAsync(query: string, args?: any): Promise<any[]> {
  return (await Zotero.DB.queryAsync(normalize(query), args, options)) || []
}
export async function queryTx(query: string, args?: any): Promise<any> {
  return Zotero.DB.queryTx(normalize(query), args, options) as Promise<any>
}
export async function columnQueryAsync(query: string, args?: any): Promise<any[]> {
  return (await Zotero.DB.columnQueryAsync(normalize(query), args, options)) || []
}
export async function valueQueryAsync(query: string, args?: any): Promise<any> {
  return Zotero.DB.valueQueryAsync(normalize(query), args, options)
}
