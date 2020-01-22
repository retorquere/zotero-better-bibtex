declare const Zotero: any

export function sleep(ms) {
  return new Promise(resolve => Zotero.setTimeout(resolve, ms))
}
