import * as Library from './library'

/* eslint-disable no-redeclare, @typescript-eslint/no-unsafe-return */
export function selectedCollections(asIDs?: false): Zotero.Collection[]
export function selectedCollections(asIDs: true): number[]
export function selectedCollections(asIDs = false): Zotero.Collection[] | number[] {
  const azp = Zotero.getActiveZoteroPane()!
  if (typeof azp.getSelectedCollections === 'function') {
    return azp.getSelectedCollections(asIDs as any) as any[]
  }
  else {
    const collection = azp.getSelectedCollection(asIDs as any)
    return typeof collection !== 'boolean' ? [ collection ] as any[] : []
  }
}

export function selectedCollection(asID?: false): Zotero.Collection | undefined
export function selectedCollection(asID: true): number | undefined
export function selectedCollection(asID = false): Zotero.Collection | number | undefined {
  const collections = selectedCollections(asID as any)
  return collections.length === 1 ? collections[0] : undefined
}
/* eslint-enable no-redeclare, @typescript-eslint/no-unsafe-return */

class CollectionError extends Error {
  kind: 'duplicate' | 'notfound'
  code: number

  constructor(message: string, kind: 'duplicate' | 'notfound') {
    // 'Error' breaks prototype chain here
    super(message)

    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)

    this.kind = kind
    this.code = (this.kind === 'notfound' ? 404 : 409)
  }
}

const CS_CI: Array<(n: string) => string> = [
  n => n,
  n => n.toLowerCase(),
]
export async function resolve(library: _ZoteroTypes.Library.LibraryLike, path: string, create = false): Promise<Zotero.Collection | undefined> {
  let names = (path || '').split('/')
  if (names.shift() !== '') throw new CollectionError(`collection path ${JSON.stringify(path)} is not an absolute path`, 'notfound')
  names = names.filter(_ => _)
  if (names.length === 0) throw new CollectionError('path is too short', 'notfound')

  let children: Zotero.Collection[] = Zotero.Collections.getByLibrary(library.libraryID)
  let collection: Zotero.Collection | undefined
  path = ''
  for (const name of names) {
    path += `/${name}`

    const found: Zotero.Collection[] = CS_CI.reduce<Zotero.Collection[]>((acc, tx) => {
      // If a match was already found in a previous transform, pass it forward
      if (acc.length) return acc

      const matches = children.filter(coll => tx(coll.name) === tx(name))
      if (matches.length > 1) throw new CollectionError(`Collection '${path}' is not unique`, 'duplicate')
      return matches
    }, [])

    if (found.length) {
      collection = found[0]
    }
    else if (!create) {
      throw new CollectionError(`Collection '${ path }' does not exist`, 'notfound')
    }
    else {
      const parentID = collection?.id
      collection = new Zotero.Collection({ name, libraryID: library.libraryID, parentID })
      await collection.saveTx()
    }
    children = Zotero.Collections.getByParent(collection.id)
  }

  return collection
}

export async function get(path: string, create = false): Promise<any> {
  if (path[0] !== '/') throw new CollectionError(`collection path ${JSON.stringify(path)} is not an absolute path`, 'notfound')
  const m = path.match(/^\/([^/]*)\/(.+)/)
  if (!m) throw new CollectionError('path is too short', 'notfound')

  const library = Library.get({ libraryID: m[1], groupID: m[1], group: m[1] })
  if (!library) throw new CollectionError(`Library ${ m[1] } not found`, 'notfound')
  return await resolve(library, `/${m[2]}`, create)
}
