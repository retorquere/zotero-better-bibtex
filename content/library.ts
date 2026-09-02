import { log } from './logger'

export function editable(): Set<number> {
  const libraries = Zotero.Libraries.getAll().filter(lib => lib.editable).map(lib => lib.libraryID)
  return new Set(libraries)
}

export function selectedLibraryIDs(): number[] {
  const azp = Zotero.getActiveZoteroPane()!
  if (typeof azp.getSelectedLibraryIDs === 'function') {
    return azp.getSelectedLibraryIDs() as number[]
  }
  else {
    const libraryID = azp.getSelectedLibraryID()
    return typeof libraryID === 'number' ? [ libraryID ] : []
  }
}
export function selectedLibraryID(): number | undefined {
  const libraryIDs = selectedLibraryIDs()
  return libraryIDs.length === 1 ? libraryIDs[0] : undefined
}

export function readonly(source: number | Zotero.Item | _ZoteroTypes.Library.LibraryLike): boolean {
  let lib: _ZoteroTypes.Library.LibraryLike | undefined

  if (typeof source === 'number') {
    lib = Zotero.Libraries.get(source) || undefined
  }
  else if ((source as _ZoteroTypes.Library.LibraryLike).libraryType) {
    lib = source as _ZoteroTypes.Library.LibraryLike
  }
  else if (((source as Zotero.Item).objectType === 'item' || (source as Zotero.Item).objectType === 'feedItem') && typeof (source as Zotero.Item).libraryID !== 'number') {
    return true
  }
  else if (typeof (source as Zotero.Item).libraryID === 'number') {
    lib = Zotero.Libraries.get(source.libraryID) || undefined
  }

  return lib ? !lib.editable : false
}

export type Query = {
  name?: string
  library?: string
  group?: string
  libraryID?: number | string
  groupID?: number | string
}
function isNumber(v: any) {
  return (typeof v === 'number') && isFinite(v)
}
export function get(query: Query, throws = false): Zotero.Library | undefined {
  function oops(err: string): undefined {
    log.error(err)
    if (throws) throw new Error(err)
  }

  for (const term of ['libraryID', 'groupID']) {
    if (typeof query[term] === 'string') {
      if (!term.match(/^\d+$/)) return oops(`${term} must be numeric`)
      query[term] = parseInt(query[term], 10)
    }
  }
  for (const alias of ['library', 'group']) {
    if (typeof query[alias] !== 'undefined') {
      if (typeof query.name !== 'undefined') return oops(`invalid library search query ${JSON.stringify(query)}`)
      query.name = query[alias]
    }
  }
  let { name, libraryID, groupID } = query

  switch ([name, libraryID, groupID].filter(arg => typeof arg !== 'undefined').length) {
    case 0:
      libraryID = Zotero.Libraries.userLibraryID
    case 1:
      break
    default:
      return oops(`invalid library search query ${JSON.stringify(query)}`)
  }

  let libraries = Zotero.Libraries.getAll()

  if (typeof name !== 'undefined') {
    if (typeof name !== 'string') return oops(`invalid library search query ${JSON.stringify(query)}, name must be a string`)
    libraries = libraries.filter(l => l.name === name)
  }
  else if (typeof libraryID !== 'undefined') {
    if (!isNumber(libraryID)) return oops(`invalid library search query ${JSON.stringify(query)}, libraryID must be a number`)
    libraries = libraries.filter(l => l.libraryID === libraryID)
  }
  else if (typeof groupID !== 'undefined') {
    if (!isNumber(groupID)) return oops(`invalid library search query ${JSON.stringify(query)}, groupID must be a number`)
    libraries = (libraries as unknown as Zotero.Group[]).filter(l => l.groupID === groupID)
  }

  switch (libraries.length) {
    case 0:
      return oops(`library.get: ${JSON.stringify(query)} not found`)
    case 1:
      return libraries[0] as unknown as Zotero.Library
    default:
      return oops(`library search: ${JSON.stringify(query)} is not unique`)
  }
}
