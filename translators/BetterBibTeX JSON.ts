declare const Translator: ITranslator

declare const Zotero: any

import { debug } from './lib/debug'
import * as itemfields from '../gen/itemfields'

const chunkSize = 0x100000

Translator.detectImport = () => {
  let str
  debug('BetterBibTeX JSON.detect: start')
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
  debug('importing', data.items.length, 'items')
  for (const source of (data.items as any[])) {
    itemfields.simplifyForImport(source)

    // I do export these but the cannot be imported back
    delete source.relations
    delete source.citekey
    delete source.uri

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
  debug('starting export')
  const data = {
    config: {
      id: Translator.header.translatorID,
      label: Translator.header.label,
      release: Zotero.BetterBibTeX.version(),
      preferences: Translator.preferences,
      options: Translator.options,
    },
    collections: Translator.collections,
    items: [],
  }
  debug('header ready')

  const validItemFields = new Set([
    'citekey',
    'uri',
    'relations',
  ])
  const validAttachmentFields = new Set([ 'relations', 'uri', 'itemType', 'title', 'path', 'tags', 'dateAdded', 'dateModified', 'seeAlso', 'mimeType' ])

  while ((item = Zotero.nextItem())) {
    if (item.itemType === 'attachment') continue

    itemfields.simplifyForExport(item, Translator.options.dropAttachments)
    item.relations = item.relations ? (item.relations['dc:relation'] || []) : []

    const validFields = itemfields.valid.get(item.itemType)
    for (const field of Object.keys(item)) {
      if (validItemFields.has(field)) continue

      if (validFields && !validFields.get(field)) {
        debug('bbt json: delete', item.itemType, field, item[field])
        delete item[field]
      }
    }

    for (const att of item.attachments || []) {
      att.path = att.localpath
      for (const field of Object.keys(att)) {
        att.relations = att.relations ? (att.relations['dc:relation'] || []) : []
        if (!validAttachmentFields.has(field)) delete att[field]
      }
    }

    if (item.relations) debug('adding item', item)
    data.items.push(item)
  }
  debug('data ready')

  Zotero.write(JSON.stringify(data, null, '  '))
  debug('export done')
}
