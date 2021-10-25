export function readFileSync(filename) {
  if (filename.startsWith('resource:')) return Zotero.File.getContentsFromURL(filename)
  throw new Exception(`could not read ${JSON.stringify(filename)}`)
}

export function existsSync(filename) {
  throw new Exception('not implemented')
}
