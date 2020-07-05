import { get as getLibrary } from './library'

async function getCollection(parent, name, path, create) {
  const children = parent instanceof Zotero.Library ? Zotero.Collections.getByLibrary(parent.id) : Zotero.Collections.getByParent(parent.id)
  let found = children.filter(coll => coll.name === name)
  switch (found.length) {
    case 0:
      break
    case 1:
      return found[0]
    default:
      throw new Error(`Collection '${path}' is not unique`)
  }

  found = children.filter(coll => coll.name.toLowerCase() === name.toLowerCase())
  switch (found.length) {
    case 0:
      break
    case 1:
      return found[0]
    default:
      throw new Error(`Collection '${path}' is not unique`)
  }

  if (!create) throw new Error(`Collection '${path}' does not exist`)
  const collection = new Zotero.Collection({
    name,
    libraryID: parent instanceof Zotero.Library ? parent.id : parent.libraryID,
    parentID: parent instanceof Zotero.Library ? undefined : parent.id,
  })
  await collection.saveTx()
  return collection
}

export async function get(path: string, create: boolean = false) {
  const names = (path || '').split('/')
  if (names.shift() !== '') throw new Error('path must be absolute')
  const root = names.shift()
  if (names.length === 0) throw new Error('path is too short')

  let collection = root.match(/^[0-9]+$/) ? Zotero.Libraries.get(root) : getLibrary(root)
  if (!collection) throw new Error(`Library ${root} not found`)
  let _path = `/${root}`

  for (const name of names) {
    _path += `/${name}`
    collection = await getCollection(collection, name, _path, create)
  }

  return collection
}
