export function readFileSync(filename) {
  if (filename.match(/^(resource|chrome):/)) return Zotero.File.getContentsFromURL(filename)
  throw new Exception(`could not read ${JSON.stringify(filename)}`)
}

export function existsSync(filename) {
  throw new Exception('not implemented')
}
