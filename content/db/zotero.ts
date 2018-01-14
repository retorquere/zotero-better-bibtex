declare const Zotero: any

export function queryAsync(query, args?) { return Zotero.DB.queryAsync(query.replace(/[\s\n]+/g, ' ').trim(), args) }
