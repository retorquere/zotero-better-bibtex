import { log } from './logger'

export function editable(): Set<number> {
  const libraries = Zotero.Libraries.getAll().filter(lib => lib.editable).map(lib => lib.libraryID)
  return new Set(libraries)
}

export function selectedLibraryIDs(): number[] {
  const azp = Zotero.getActiveZoteroPane()
  if (!azp) return []

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

export type Query
  = { field: 'name'; value: string | undefined }
  | { field: 'library'; value: string | undefined }
  | { field: 'group'; value: string | undefined }
  | { field: 'libraryID'; value: number | string | undefined }
  | { field: 'groupID'; value: number | string | undefined }

export function get(query: Query | Query[], throws = false): Zotero.Library | undefined {
  function oops(err: string): undefined | never {
    log.error(err)
    if (throws) throw new Error(err)
  }

  let terms: Query[] = (Array.isArray(query) ? query : [ query ])
    .flatMap((t: Query) => { // legacy
      switch (t.field) {
        case 'group':
        case 'library':
          if (typeof t.value === 'string') {
            return [
              { field: 'name', value: t.value },
              { field: `${t.field}ID`, value: t.value.match(/^\d+$/) ? parseInt(t.value, 10) : undefined },
            ] as Query []
          }
          else {
            return [ { field: `${t.field}ID`, value: t.value } ] as Query[]
          }

        default:
          return t
      }
    })
    .filter((t: Query) => {
      if (typeof t.value === 'undefined') return false

      if (t.field.endsWith('ID')) {
        switch (typeof t.value) {
          case 'string':
            if (t.value.match(/^\d+$/)) {
              t.value = parseInt(t.value, 10)
              return true
            }
            else {
              return oops(`library.get: ${t.field} must be numeric, got ${t.value}`)
            }

          case 'number':
            return isFinite(t.value) ? true : oops(`library.get: ${t.field} must be numeric, got ${typeof t.value}`)

          default:
            return oops(`library.get: ${t.field} must be numeric, got ${typeof t.value}`)
        }
      }
      else {
        return typeof t.value === 'string' ? true : oops(`library.get: ${t.field} must be string, got ${typeof t.value}`)
      }
    })

  if (!terms.length) terms = [{ field: 'libraryID', value: Zotero.Libraries.userLibraryID }]

  const libraries = Zotero.Libraries.getAll()
  let filtered = libraries
  let hit = ''

  while (terms.length && !hit) {
    const t = terms.shift()!
    filtered = libraries.filter(library => {
      if (library[t.field] === t.value) {
        hit = t.field
        return true
      }
      else {
        return false
      }
    })
  }

  if (terms.length && hit) log.info('library.get: got hit on', hit, 'ignoring', terms)

  switch (filtered.length) {
    case 0:
      return oops(`library.get: ${JSON.stringify(query)} not found`)
    case 1:
      return filtered[0] as unknown as Zotero.Library
    default:
      return oops(`library.get: ${JSON.stringify(query)} is not unique`)
  }
}
