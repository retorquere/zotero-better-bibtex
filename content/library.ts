import { log } from './logger'

export type Library = { name: string; libraryID: number }

export function get(name?: string | number, groupOnly = false): Library {
  const id: Partial<Record<'library' | 'group', number>> = {}

  let libraries = Zotero.Libraries.getAll()

  if (!name) {
    id.library = Zotero.Libraries.userLibraryID
  }
  else if (typeof name === 'string' && name.match(/^\d+$/)) {
    id[groupOnly ? 'group' : 'library'] = parseInt(name)
  }
  else if (typeof name === 'number') {
    id[groupOnly ? 'group' : 'library'] = name
  }
  else {
    libraries = libraries.filter(lib => lib.name === name)
    switch (libraries.length) {
      case 0:
        log.error('library.get: library', JSON.stringify(name), 'not found')
        return
      case 1:
        id.library = libraries[0].id
      default:
        log.error('library.get: library name', JSON.stringify(name), 'is not unique')
        return
    }
  }

  let library: Library
  if (typeof id.library === 'number') library = libraries.find(lib => lib.id === id.library)

  if (!library) {
    if (!groupOnly) log.info('library.get: library', JSON.stringify(name), 'not found, trying as group ID')

    const groupID = id.group ?? id.library
    id.library = Zotero.Groups.getAll().find(g => g.groupID === groupID)?.libraryID
    if (typeof id.library !== 'number') {
      log.info('library.get: group', groupID, 'not found')
      return
    }

    log.info('library.get: found', id.library, 'from group', groupID)
    library = libraries.find(lib => lib.id === id.library)
  }

  if (!library) log.error('library.get: library', JSON.stringify(name), 'not found')
  return library
}
