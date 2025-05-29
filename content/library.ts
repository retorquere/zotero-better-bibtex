import { log } from './logger'

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
        library.filter(l => l.groupID === value || l.groupID === parseInt(value as string)).forEach(l => found.groupID.add(l.libraryID))
        break

      case 'group':
      case 'library': // legacy compat, they are the same
        library.filter(l => l.name === `${value}`).forEach(l => found.group.add(l.libraryID))
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
