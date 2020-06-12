declare const Zotero: any

import { Translator } from './lib/translator'
export { Translator }

import { debug } from './lib/debug'
import * as itemfields from '../gen/items/items'
import { normalize } from './lib/normalize'
const version = require('../gen/version.js')
import { stringify } from '../content/stringify'

const chunkSize = 0x100000

export function detectImport() {
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

export async function doImport() {
  Translator.init('import')

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
    delete source.autoJournalAbbreviation

    if (source.creators) {
      for (const creator of source.creators) {
        // if .name is not set, *both* first and last must be set, even if empty
        if (!creator.name) {
          creator.lastName = creator.lastName || ''
          creator.firstName = creator.firstName || ''
        }
      }
    }

    if (!itemfields.valid.type[source.itemType]) throw new Error(`unexpected item type '${source.itemType}'`)
    const validFields = itemfields.valid.field[source.itemType]
    for (const field of Object.keys(source)) {
      const valid = validFields[field]
      if (valid) continue

      const msg = `${valid}: unexpected ${source.itemType}.${field} for ${Translator.isZotero ? 'zotero' : 'juris-m'} in ${JSON.stringify(source)} / ${JSON.stringify(validFields)}`
      if (valid === false) {
        debug(msg)
      } else {
        throw new Error(msg)
      }
    }

    if (Array.isArray(source.extra)) source.extra = source.extra.join('\n')

    debug('importing:', source)
    const item = new Zotero.Item()
    Object.assign(item, source)

    // so BBT-JSON can be imported without extra-field meddling
    item.bbt_no_extractExtraFields = true

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

export function doExport() {
  Translator.init('export')

  let item
  const data = {
    config: {
      id: Translator.header.translatorID,
      label: Translator.header.label,
      preferences: Translator.preferences,
      options: Translator.options,
      localeDateOrder: Zotero.BetterBibTeX.getLocaleDateOrder(),
    },
    version: {
      zotero: Zotero.Utilities.getVersion(),
      bbt: version,
    },
    collections: Translator.collections,
    items: [],
  }

  const validAttachmentFields = new Set([ 'relations', 'uri', 'itemType', 'title', 'path', 'tags', 'dateAdded', 'dateModified', 'seeAlso', 'mimeType' ])

  while ((item = Zotero.nextItem())) {
    if (Translator.options.dropAttachments && item.itemType === 'attachment') continue

    if (!Translator.options.Normalize) {
      const [ , kind, lib, key ] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
      item.select = (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`
    }

    delete item.collections

    itemfields.simplifyForExport(item, Translator.options.dropAttachments)
    item.relations = item.relations ? (item.relations['dc:relation'] || []) : []

    for (const att of item.attachments || []) {
      if (Translator.options.exportFileData && att.saveFile && att.defaultPath) {
        att.saveFile(att.defaultPath, true)
        att.path = att.defaultPath
      } else if (att.localPath) {
        att.path = att.localPath
      }

      if (!Translator.options.Normalize) {
        const [ , kind, lib, key ] = att.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
        att.select = (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`
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

  if (Translator.options.Normalize) normalize(data)

  Zotero.write(stringify(data, null, '  '))
}
