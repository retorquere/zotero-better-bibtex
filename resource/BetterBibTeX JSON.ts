import { ITranslator } from '../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import debug = require('./lib/debug.ts')

/*
scrub = (item) ->
  delete item.libraryID
  delete item.key
  delete item.uniqueFields
  delete item.dateAdded
  delete item.dateModified
  delete item.uri
  delete item.attachmentIDs
  delete item.relations

  delete item.collections

  item.attachments = ({
    path: attachment.localPath || undefined,
    title: attachment.title || undefined,
    url: attachment.url || undefined,
    linkMode: if typeof attachment.linkMode == 'number' then attachment.linkMode else undefined,
    contentType: attachment.contentType || undefined,
    mimeType: attachment.mimeType || undefined,
  } for attachment in item.attachments || [])

  item.notes = (item.notes || []).map((note) -> note.note.trim())

  item.tags = (item.tags || []).map((tag) -> tag.tag)
  item.tags.sort()

  for own attr, val of item
    continue if typeof val is 'number'
    continue if Array.isArray(val) and val.length != 0

    switch typeof val
      when 'string'
        delete item[attr] if val.trim() == ''
      when 'undefined'
        delete item[attr]

  return item
*/

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

Translator.doImport = () => {
  let str
  let json = ''
  while ((str = Zotero.read(chunkSize)) !== false) {
    json += str
  }

  const data = JSON.parse(json)

  for (const source of data.items) {
    /* works around https://github.com/Juris-M/zotero/issues/20 */
    // delete source.multi.main if source.multi
    Zotero.BetterBibTeX.scrubFields(source)

    const item = new Zotero.Item()
    Object.assign(item, source, { itemID: source.key })
    for (const att of item.attachments || []) {
      if (att.url) delete att.path
    }
    item.complete()
  }

  const object = data.collections || {}
  for (const [key, collection] of Object.entries(object)) { // tslint:disable-line:no-unused-variable
    collection.imported = new Zotero.Collection()
    collection.imported.type = 'collection'
    collection.imported.name = collection.name
    collection.imported.children = collection.items.map(id => ({type: 'item', id}))
  }
  for (const [key, collection] of Object.entries(data.collections)) { // tslint:disable-line:no-unused-variable
    collection.imported.children = collection.imported.children.concat(collection.collections.map(coll => data.collections[coll.key].imported))
  }
  for (const [key, collection] of Object.entries(data.collections)) { // tslint:disable-line:no-unused-variable
    if (collection.parent) continue
    collection.imported.complete()
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

  while ((item = Zotero.nextItem())) {
    debug('adding item', item.itemID)
    data.items.push(item)
  }
  debug('data ready')

  Zotero.write(JSON.stringify(data, null, '  '))
  debug('export done')
}
