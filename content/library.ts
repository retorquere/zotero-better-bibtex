/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types */

export function get(name?: string | number): { name: string, libraryID: number } {
  if (typeof name === 'undefined') name = Zotero.Libraries.userLibraryID
  const num = typeof name === 'number' ? name : parseInt(name)
  if (!isNaN(num)) return Zotero.Libraries.get(num || Zotero.Libraries.userLibraryID)

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
