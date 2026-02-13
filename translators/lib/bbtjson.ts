import type { Collected } from './collect'
import type { Library } from './normalize'

import { log } from '../../content/logger'
import { Translation } from './translator'
import { simplifyForImport, simplifyForExport } from '../../content/item-schema'
import BBT from '../../gen/version.cjs'

import { citationKey as extract } from '../../content/extra'

// import { validItem } from '../content/ajv'
// import { stringify } from '../content/stringify'

function addSelect(item: any, translation: Translation) {
  if (translation.collected.preferences.testing) return
  const [ , kind, lib, key ] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^/]+)\/items\/(.+)/)
  item.select = (kind === 'users') ? `zotero://select/library/items/${ key }` : `zotero://select/groups/${ lib }/items/${ key }`
}

const validAttachmentFields = new Set([
  'dateAdded',
  'dateModified',
  'itemType',
  'mimeType',
  'path',
  'relations',
  'seeAlso',
  'tags',
  'title',
  'uri',
  'url',
])

export function generateBBTJSON(collected: Collected): Translation {
  const translation = Translation.Export(collected)

  const preferences = { ...translation.collected.preferences }
  delete preferences.citekeyFormatEditing
  delete preferences.testing
  delete preferences.platform
  delete preferences.logEvents
  delete preferences.scrubDatabase

  const data = {
    config: {
      id: collected.translator.translatorID,
      label: collected.translator.label,
      preferences: collected.displayOptions.Preferences ? preferences : {},
      options: collected.displayOptions,
    },
    version: {
      zotero: Zotero.version,
      bbt: BBT.version,
    },
    collections: translation.collections,
    items: [],
  }

  if (translation.collected.displayOptions.Items) {
    function handle(att) {
      if (translation.collected.displayOptions.exportFileData && att.saveFile && att.defaultPath) {
        att.saveFile(att.defaultPath, true)
        att.path = att.defaultPath
      }
      else if (att.localPath) {
        att.path = att.localPath
      }

      for (const field of Object.keys(att)) {
        if (!validAttachmentFields.has(field)) {
          delete att[field]
        }
      }
      addSelect(att, translation)
    }

    for (const item of translation.collected.items) {
      delete item.$cacheable
      addSelect(item, translation)

      switch (item.itemType) {
        case 'attachment':
          handle(item)
          break

        case 'note':
        case 'annotation':
          break

        default:
          delete item.collections

          if (translation.collected.displayOptions.Normalize) simplifyForExport(item, {})

          for (const att of item.attachments || []) {
            handle(att)
          }
          break
      }

      data.items.push(item)
    }
  }

  translation.output.body = JSON.stringify(data, null, 2)

  return translation
}

export async function importBBTJSON(collected: Collected): Promise<void> {
  const data: Library = JSON.parse(collected.input)
  if (!data.items || !data.items.length) return

  const items = new Set<number>
  for (const source of (data.items as any[])) {
    simplifyForImport(source)

    // I do export these but the cannot be imported back
    delete source.relations
    delete source.citekey

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
    for (const [ field, value ] of Object.entries(source)) {
      if ((value ?? '') === '') delete source[field]
    }
    // validate tests for strings
    if (Array.isArray(source.extra)) source.extra = source.extra.join('\n')
    const { extra, citationKey } = extract(source.extra || '')
    source.citationKey = citationKey || source.citationKey
    source.extra = extra

    // marker so BBT-JSON can be imported without extra-field meddling
    if (source.extra) source.extra = `\x1BBBT\x1B${ source.extra }`

    // const error = validItem(source)
    // if (error) throw new Error(error)

    const item = collected.item()
    Object.assign(item, source)

    for (const att of item.attachments || []) {
      if (att.url) delete att.path
      delete att.relations
      delete att.uri
    }
    await item.complete()
    items.add(source.itemID)
    collected.progress(items.size / data.items.length * 100)
  }
  collected.progress(100)

  const collections: any[] = Object.values(data.collections || {})
  for (const collection of collections) {
    collection.zoteroCollection = collected.collection()
    collection.zoteroCollection.type = 'collection'
    collection.zoteroCollection.name = collection.name
    collection.zoteroCollection.children = collection.items.filter(id => {
      if (items.has(id)) return true
      log.error(`Collection ${ collection.key } has non-existent item ${ id }`)
      return false
    }).map(id => ({ type: 'item', id }))
  }
  for (const collection of collections) {
    if (collection.parent && data.collections[collection.parent]) {
      (data.collections[collection.parent] as unknown as any).zoteroCollection.children.push(collection.zoteroCollection)
    }
    else {
      if (collection.parent) log.error(`Collection ${ collection.key } has non-existent parent ${ collection.parent }`)
      collection.parent = false
    }
  }
  for (const collection of collections) {
    if (collection.parent) continue
    collection.zoteroCollection.complete()
  }
}
