/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types */

export function get(name: string) {
  if (!name) return Zotero.Libraries.get(Zotero.Libraries.userLibraryID)

  const libraries = Zotero.Libraries.getAll().filter(lib => lib.name === name)
  switch (libraries.length) {
    case 0:
      throw new Error(`Library '${name}' not found`)
    case 1:
      return libraries[0]
    default:
      throw new Error(`Library name '${name}' is not unique`)
  }
}
