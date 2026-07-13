import { log } from './logger'

export function editable(): Set<number> {
  const libraries = Zotero.Libraries.getAll().filter(lib => lib.editable).map(lib => lib.libraryID)
  return new Set(libraries)
}

export function readonly(library: number | Zotero.Item | _ZoteroTypes.Library.LibraryLike): boolean {
  let lib: _ZoteroTypes.Library.LibraryLike

  if (typeof library === 'number') {
    lib = Zotero.Libraries.get(library) || undefined
  }
  else if ((library as _ZoteroTypes.Library.LibraryLike).libraryType) {
    lib = library as _ZoteroTypes.Library.LibraryLike
  }
  else if ((library as Zotero.Item).objectType === 'item') {
    lib = Zotero.Libraries.get(library.libraryID) || undefined
  }
  if (!lib) throw new Error('LibraryLike not found')

  return !lib.editable
}

export function get(query: Record<string, string | number>, throws = false): Zotero.Library {
  const oops = err => {
    log.error(err)
    if (throws) throw new Error(err)
  }

  const libraries = Zotero.Libraries.getAll()

  const found: Record<'libraryID' | 'groupID' | 'group', Set<number>> = {
    libraryID: new Set,
    groupID: new Set,
    group: new Set,
  }
  let searched = false
  for (const [search, value] of Object.entries(query)) {
    if (typeof value === 'undefined') continue
    searched = true
    switch (search) {
      case 'libraryID':
        libraries.filter(l => l.libraryID === value || l.libraryID === parseInt(value as string)).forEach(l => found.libraryID.add(l.libraryID))
        break

      case 'groupID':
        (libraries as unknown as Zotero.Group[]).filter(l => l.groupID === value || l.groupID === parseInt(value as string)).forEach(l => found.groupID.add(l.libraryID))
        break

      case 'group':
      case 'library': // legacy compat, they are the same
        libraries.filter(l => l.name === `${value}`).forEach(l => found.group.add(l.libraryID))
        break

      default:
        oops(`library.get: unsupported parameter ${JSON.stringify(search)}`)
        return
    }
  }
  if (!searched) found.libraryID.add(Zotero.Libraries.userLibraryID)

  for (const kind of ['libraryID', 'groupID', 'group']) {
    switch (found[kind].size) {
      case 0:
        continue
      case 1:
        return Zotero.Libraries.get([...found[kind]][0]) as Zotero.Library
      default:
        oops(`library.get: ${kind} in ${JSON.stringify(query)} is not unique`)
        return
    }
  }

  oops(`library.get: ${JSON.stringify(query)} not found`)
  return
}
