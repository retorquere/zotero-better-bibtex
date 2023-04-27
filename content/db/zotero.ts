// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await

function normalize(query: string): string {
  return query.replace(/[\s\n]+/g, ' ').trim()
}
export async function queryAsync(query: string, args?: any[]): Promise<any[]> {
  return Zotero.DB.queryAsync(normalize(query), args) as Promise<any[]>
}
export async function columnQueryAsync(query: string, args?: any[]): Promise<any[]> {
  return Zotero.DB.columnQueryAsync(normalize(query), args) as Promise<any[]>
}

