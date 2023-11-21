/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/explicit-module-boundary-types */

function normalize(query: string): string {
  return query.replace(/[\s\n]+/g, ' ').trim()
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
  return Zotero.DB.valueQueryAsync(normalize(query), args, options) as Promise<any>
}

