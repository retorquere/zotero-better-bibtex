export function sleep(ms: number): Promise<void> {
  // return new Promise(resolve => Zotero.setTimeout(resolve, ms))
  return new Promise(resolve => setTimeout(resolve, ms))
}
