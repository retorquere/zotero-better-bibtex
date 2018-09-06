declare const Translator: ITranslator

declare const Zotero: any

import { debug } from './lib/debug'

const chunkSize = 0x100000

Translator.detectImport = () => {
  let str
  debug('BetterBibTeX JSON.detect: start')
  let json = ''
  while ((str = Zotero.read(chunkSize)) !== false) {
    json += str
    if (json[0] !== '{') return false
  }

  // a failure to parse will throw an error which a) is actually logged, and b) will count as "false"
  const data = JSON.parse(json)

  if (!data.config || (data.config.id !== Translator.header.translatorID)) throw new Error(`ID mismatch: got ${data.config && data.config.id}, expected ${Translator.header.translatorID}`)
  if (!data.items || !data.items.length) throw new Error('No items')
  return true
}

Translator.doImport = async () => {
  let str
  let json = ''
  while ((str = Zotero.read(chunkSize)) !== false) {
    json += str
  }

  const data = JSON.parse(json)
  const validFields = Zotero.BetterBibTeX.validFields()

  const items = new Set
  debug('importing', data.items.length, 'items')
  for (const source of (data.items as any[])) {
    Zotero.BetterBibTeX.simplifyFields(source)

    // I do export these but the cannot be imported back
    delete source.relations
    delete source.citekey
    delete source.uri

    if (!validFields[source.itemType]) throw new Error(`unexpected item type '${source.itemType}'`)
    for (const field of Object.keys(source)) {
      if (!validFields[source.itemType][field]) throw new Error(`unexpected ${source.itemType}.${field} in ${JSON.stringify(source)}`)
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

  const validFields = Zotero.BetterBibTeX.validFields()
  const validItemFields = new Set([
    'citekey',
    'uri',
    'relations',
  ])
  const validAttachmentFields = new Set([ 'relations', 'uri', 'itemType', 'title', 'path', 'tags', 'dateAdded', 'dateModified', 'seeAlso', 'mimeType' ])

  while ((item = Zotero.nextItem())) {
    if (item.itemType === 'attachment' || item.itemType === 'note') continue

    Zotero.BetterBibTeX.simplifyFields(item)
    item.relations = item.relations ? (item.relations['dc:relation'] || []) : []

    for (const field of Object.keys(item)) {
      if (validItemFields.has(field)) continue

      if (validFields[item.itemType] && !validFields[item.itemType][field]) {
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
