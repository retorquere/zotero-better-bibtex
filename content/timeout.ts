declare const Zotero: any

export function timeout(ms) {
  return new Promise(resolve => Zotero.setTimeout(resolve, ms))
}
