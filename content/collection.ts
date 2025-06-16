import * as Library from './library'

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

export async function resolve(library: Zotero.Library, path: string, create = false): Promise<Zotero.Collection> {
  let names = (path || '').split('/')
  if (names.shift() !== '') throw new CollectionError(`collection path ${JSON.stringify(path)} is not an absolute path`, 'notfound')
  names = names.filter(_ => _)
  if (names.length === 0) throw new CollectionError('path is too short', 'notfound')

  let children: Zotero.Collection[] = Zotero.Collections.getByLibrary(library.libraryID)
  let collection: Zotero.Collection
  path = ''
  for (const name of names) {
    path += `/${name}`
    let found: Zotero.Collection[]
    for (const tx of [ (n: string) => n, (n: string) => n.toLowerCase() ]) {
      found = children.filter(coll => tx(coll.name) === tx(name))
      switch (found.length) {
        case 0:
        case 1:
          break
        default:
          throw new CollectionError(`Collection '${ path }' is not unique`, 'duplicate')
      }
      if (found.length) break
    }

    if (found.length) {
      collection = found[0]
    }
    else if (!create) {
      throw new CollectionError(`Collection '${ path }' does not exist`, 'notfound')
    }
    else {
      collection = new Zotero.Collection({
        name,
        libraryID: library.libraryID,
        parentID: collection?.id,
      })
      await collection.saveTx()
    }
    children = Zotero.Collections.getByParent(parent.id)
  }

  return collection
}

export async function get(path: string, create = false): Promise<any> {
  if (path[0] !== '/') throw new CollectionError(`collection path ${JSON.stringify(path)} is not an absolute path`, 'notfound')
  const m = path.match(/[/](^.*?)[/](.+)/)
  if (!m) throw new CollectionError('path is too short', 'notfound')

  const library = Library.get({ libraryID: m[1], groupID: m[1], group: m[1] })
  if (!library) new CollectionError(`Library ${ m[1] } not found`, 'notfound')
  return await resolve(library, m[2], create)
}
