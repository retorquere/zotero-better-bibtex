declare const Zotero: any

import { Translation, collect } from './lib/translator'
import type { Translators } from '../typings/translators.d.ts'
declare var ZOTERO_TRANSLATOR_INFO: Translators.Header // eslint-disable-line no-var

// import { validItem } from '../content/ajv'
import { simplifyForImport, simplifyForExport } from '../gen/items/simplify'
const version = require('../gen/version.js')
// import { stringify } from '../content/stringify'
import { log } from '../content/logger'
import type { Library } from './lib/normalize'
import  { asciify } from '../content/text'

const chunkSize = 0x100000

export function detectImport(): boolean {
  let str
  let json = ''
  while ((str = Zotero.read(chunkSize)) !== false) {
    json += str
    if (json[0] !== '{') return false
  }

  let data
  try {
    data = JSON.parse(json)
  }
  catch (err) {
    return false
  }

  if (!data.config || (data.config.id !== ZOTERO_TRANSLATOR_INFO.translatorID)) return false
  return true
}

export async function doImport(): Promise<void> {
  let str
  let json = ''
  while ((str = Zotero.read(chunkSize)) !== false) {
    json += str
  }

  const data: Library = JSON.parse(json)
  if (!data.items || !data.items.length) return

  const items = new Set<number>
  for (const source of (data.items as any[])) {
    simplifyForImport(source)

    // I do export these but the cannot be imported back
    delete source.relations
    delete source.citekey
    delete source.citationKey

    delete source.uri
    delete source.key
    delete source.itemKey
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

    // clear out junk data
    for (const [field, value] of Object.entries(source)) {
      if ((value ?? '') === '') delete source[field]
    }
    // validate tests for strings
    if (Array.isArray(source.extra)) source.extra = source.extra.join('\n')
    // marker so BBT-JSON can be imported without extra-field meddling
    if (source.extra) source.extra = `\x1BBBT\x1B${source.extra}`

    // const error = validItem(source)
    // if (error) throw new Error(error)

    const item = new Zotero.Item()
    Object.assign(item, source)

    for (const att of item.attachments || []) {
      if (att.url) delete att.path
      delete att.relations
      delete att.uri
    }
    await item.complete()
    items.add(source.itemID)
    Zotero.setProgress(items.size / data.items.length * 100)
  }
  Zotero.setProgress(100)

  const collections: any[] = Object.values(data.collections || {})
  for (const collection of collections) {
    collection.zoteroCollection = new Zotero.Collection()
    collection.zoteroCollection.type = 'collection'
    collection.zoteroCollection.name = collection.name
    collection.zoteroCollection.children = collection.items.filter(id => {
      if (items.has(id)) return true
      Zotero.debug(`Collection ${collection.key} has non-existent item ${id}`)
      return false
    }).map(id => ({type: 'item', id}))
  }
  for (const collection of collections) {
    if (collection.parent && data.collections[collection.parent]) {
      (data.collections[collection.parent] as unknown as any).zoteroCollection.children.push(collection.zoteroCollection)
    }
    else {
      if (collection.parent) Zotero.debug(`Collection ${collection.key} has non-existent parent ${collection.parent}`)
      collection.parent = false
    }
  }
  for (const collection of collections) {
    if (collection.parent) continue
    collection.zoteroCollection.complete()
  }
}

function addSelect(item: any) {
  const [ , kind, lib, key ] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^/]+)\/items\/(.+)/)
  item.select = (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`
}

export function doExport(): void {
  const translation = Translation.Export(ZOTERO_TRANSLATOR_INFO, collect())

  const preferences = {...translation.preferences}
  delete preferences.citekeyFormatEditing
  delete preferences.testing
  delete preferences.platform
  delete preferences.logEvents
  delete preferences.scrubDatabase

  const data = {
    config: {
      id: ZOTERO_TRANSLATOR_INFO.translatorID,
      label: ZOTERO_TRANSLATOR_INFO.label,
      preferences : translation.options.Preferences ? preferences : {},
      options: translation.options,
    },
    version: {
      zotero: Zotero.Utilities.getVersion(),
      bbt: version,
    },
    collections: translation.collections,
    items: [],
  }

  if (translation.options.Items) {
    const validAttachmentFields = new Set([ 'relations', 'uri', 'itemType', 'title', 'path', 'tags', 'dateAdded', 'dateModified', 'seeAlso', 'mimeType' ])

    log.debug('indexed: exporting', [...translation.input.items].map(item => item.itemType))
    for (const item of translation.input.items) {
      if (!translation.preferences.testing) addSelect(item)
      delete (item as any).$cacheable

      switch (item.itemType) {
        case 'attachment':
          if (translation.options.dropAttachments) continue
          break

        case 'note':
        case 'annotation':
          break

        default:
          delete item.collections

          if (translation.options.Normalize) simplifyForExport(item, { dropAttachments: translation.options.dropAttachments})

          for (const att of item.attachments || []) {
            if (translation.options.exportFileData && att.saveFile && att.defaultPath) {
              att.saveFile(att.defaultPath, true)
              att.path = att.defaultPath
            }
            else if (att.localPath) {
              att.path = att.localPath
            }

            if (!att.path) continue // amazon/googlebooks etc links show up as atachments without a path

            for (const field of Object.keys(att)) {
              if (!validAttachmentFields.has(field)) {
                delete att[field]
              }
            }
            if (!translation.preferences.testing) addSelect(att)

          }
          break
      }

      data.items.push(item)
      log.debug('added', item, 'now', data.items.length, 'in total')
    }
  }

  log.debug('exported', data.items.length)

  Zotero.write(asciify(JSON.stringify(data, null, 2)))
  translation.erase()
}
