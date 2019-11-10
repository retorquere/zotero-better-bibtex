declare const Translator: ITranslator

declare const Zotero: any

import { debug } from './lib/debug'
import * as itemfields from '../gen/itemfields'

const chunkSize = 0x100000

Translator.detectImport = () => {
  let str
  let json = ''
  while ((str = Zotero.read(chunkSize)) !== false) {
    json += str
    if (json[0] !== '{') return false
  }

  let data
  try {
    data = JSON.parse(json)
  } catch (err) {
    return false
  }

  if (!data.config || (data.config.id !== Translator.header.translatorID)) return false
  return true
}

Translator.doImport = async () => {
  let str
  let json = ''
  while ((str = Zotero.read(chunkSize)) !== false) {
    json += str
  }

  const data = JSON.parse(json)
  if (!data.items || !data.items.length) return

  const items = new Set
  for (const source of (data.items as any[])) {
    itemfields.simplifyForImport(source)

    // I do export these but the cannot be imported back
    delete source.relations
    delete source.citekey
    delete source.citationKey

    delete source.uri
    delete source.key
    delete source.version
    delete source.libraryID
    delete source.collections

    const validFields = itemfields.valid.get(source.itemType)
    if (!validFields) throw new Error(`unexpected item type '${source.itemType}'`)
    for (const field of Object.keys(source)) {
      const valid = validFields.get(field)
      if (valid) continue

      const msg = `${valid}: unexpected ${source.itemType}.${field} for ${Translator.isZotero ? 'zotero' : 'juris-m'} in ${JSON.stringify(source)} / ${JSON.stringify([...validFields.entries()])}`
      if (valid === false) {
        debug(msg)
      } else {
        throw new Error(msg)
      }
    }

    const item = new Zotero.Item()
    Object.assign(item, source)
    for (const att of item.attachments || []) {
      if (att.url) delete att.path
      delete att.relations
      delete att.uri
    }
    await item.complete()
    items.add(source.itemID)
    Zotero.setProgress(items.size / data.items.length * 100) // tslint:disable-line:no-magic-numbers
  }
  Zotero.setProgress(100) // tslint:disable-line:no-magic-numbers

  const collections: any[] = Object.values(data.collections || {})
  for (const collection of collections) {
    collection.zoteroCollection = (new Zotero.Collection()) as any
    collection.zoteroCollection.type = 'collection'
    collection.zoteroCollection.name = collection.name
    collection.zoteroCollection.children = collection.items.filter(id => {
      if (items.has(id)) return true
      debug(`Collection ${collection.key} has non-existent item ${id}`)
      return false
    }).map(id => ({type: 'item', id}))
  }
  for (const collection of collections) {
    if (collection.parent && data.collections[collection.parent]) {
      data.collections[collection.parent].zoteroCollection.children.push(collection.zoteroCollection)
    } else {
      if (collection.parent) debug(`Collection ${collection.key} has non-existent parent ${collection.parent}`)
      collection.parent = false
    }
  }
  for (const collection of collections) {
    if (collection.parent) continue
    collection.zoteroCollection.complete()
  }
}

Translator.doExport = () => {
  let item
  const data = {
    config: {
      id: Translator.header.translatorID,
      label: Translator.header.label,
      preferences: Translator.preferences,
      options: Translator.options,
    },
    collections: Translator.collections,
    items: [],
  }

  const validAttachmentFields = new Set([ 'relations', 'uri', 'itemType', 'title', 'path', 'tags', 'dateAdded', 'dateModified', 'seeAlso', 'mimeType' ])

  while ((item = Zotero.nextItem())) {
    if (item.itemType === 'attachment') continue

    itemfields.simplifyForExport(item, Translator.options.dropAttachments)
    item.relations = item.relations ? (item.relations['dc:relation'] || []) : []

    for (const att of item.attachments || []) {
      if (Translator.options.exportFileData && att.saveFile && att.defaultPath) {
        att.saveFile(att.defaultPath, true)
        att.path = att.defaultPath
      } else if (att.localPath) {
        att.path = att.localPath
      }

      if (!att.path) continue // amazon/googlebooks etc links show up as atachments without a path

      att.relations = att.relations ? (att.relations['dc:relation'] || []) : []
      for (const field of Object.keys(att)) {
        if (!validAttachmentFields.has(field)) {
          delete att[field]
        }
      }
    }

    data.items.push(item)
  }

  Zotero.write(JSON.stringify(data, null, '  '))
}
