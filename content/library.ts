import { log } from './logger'

export function get(query: Record<string, string | number>, throws = false): Zotero.Library {
  const oops = err => {
    log.error(err)
    if (throws) throw new Error(err)
  }

  const groups = Zotero.Groups.getAll()
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
        libraries.filter(l => l.id === value || l.id === parseInt(value as string)).forEach(l => found.libraryID.add(l.id))
        break

      case 'groupID':
        groups.filter(g => g.id === value || g.id === parseInt(value as string)).forEach(g => found.groupID.add(g.libraryID))
        break

      case 'group':
      case 'library': // legacy compat, libraries don't have names
        groups.filter(g => g.name === `${value}`).forEach(g => found.group.add(g.libraryID))
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
