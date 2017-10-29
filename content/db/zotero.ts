declare const Zotero: any

export = {
  queryAsync: (query, args = undefined) => Zotero.DB.queryAsync(query.replace(/[\s\n]+/g, ' ').trim(), args),
}
