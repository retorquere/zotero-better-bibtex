// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await
export async function queryAsync(query: string, args?: any[]): Promise<any[]> { return Zotero.DB.queryAsync(query.replace(/[\s\n]+/g, ' ').trim(), args) }
