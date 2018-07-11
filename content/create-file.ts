declare const Zotero: any
declare const Components: any

import { debug } from './debug'

const a_rwx = 0o777

export function createFile(...paths) {
  if (paths.length === 0) throw new Error('no path specified')

  const f = Zotero.File.pathToFile(Zotero.DataDirectory.dir)

  paths.unshift('better-bibtex') // only create files in the 'better-bibtex' directory
  debug('createFile:', paths)

  const leaf = paths.pop()
  for (const path of paths) {
    f.append(path)
    if (!f.exists()) f.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, a_rwx)
  }
  f.append(leaf)
  return f
}
