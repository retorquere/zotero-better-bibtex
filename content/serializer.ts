declare const Zotero: any

import { JournalAbbrev } from './journal-abbrev.ts'
import { debug } from './debug.ts'

import { DB as Cache } from './db/cache.ts'
import KeyManager = require('./KeyManager.ts')
import * as ZoteroDB from './db/zotero.ts'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Serializer = new class { // tslint:disable-line:variable-name
  public simplify: Function
  public validFields: { [key: string]: { [key: string]: boolean } }

  private collection = 'itemToExportFormat'

//  # prune cache on old accessed
//  prune: Zotero.Promise.coroutine(->
//    ids = yield Zotero.DB.columnQueryAsync('select itemID from items where itemID not in (select itemID from deletedItems)')
//    for id in ids
//      delete cache[id] if entry.accessed

  public async init() {
    JournalAbbrev.init()

    debug('Serializer.init')

    let fields = await ZoteroDB.queryAsync(`
      SELECT DISTINCT bf.fieldName, f.fieldName as fieldAlias
      FROM itemTypes it
      JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
      JOIN fields f ON f.fieldID = itf.fieldID
      JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
      JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
      ORDER BY 1
    `)
    let simplify = ''
    const alias = {}
    for (const field of fields) {
      // just to make sure
      if (alias[field.fieldAlias] && alias[field.fieldAlias] !== field.fieldName) throw new Error(`field alias ${field.fieldAlias} maps to ${alias[field.fieldAlias]} and ${field.fieldName}`)
      alias[field.fieldAlias] = field.fieldName

      simplify += `if (typeof item.${field.fieldAlias} != 'undefined') { item.${field.fieldName} = item.${field.fieldAlias}; delete item.${field.fieldAlias}; }\n`
    }
    simplify += 'item.tags = item.tags ? item.tags.map(function(tag) { return tag.tag }) : [];\n'
    simplify += 'item.notes = item.notes ? item.notes.map(function(note) { return note.note }) : [];\n'
    simplify += 'return item;'
    debug('Serializer.init: simplify =\n', simplify)
    this.simplify = new Function('item', simplify)

    this.validFields = {}
    fields = await ZoteroDB.queryAsync(`
      SELECT it.typeName, COALESCE(bf.fieldName, f.fieldName) as fieldName, CASE WHEN bf.fieldName IS NULL THEN NULL ELSE f.fieldName END as fieldAlias
      FROM itemTypes it
      JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
      JOIN fields f ON f.fieldID = itf.fieldID
      LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
      LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
      ORDER BY 2
    `)
    this.validFields = {}
    for (const field of fields) {
      if (!this.validFields[field.typeName]) {
        this.validFields[field.typeName] = {
          itemType: true,
          creators: true,
          tags: true,
          attachments: true,
          notes: true,
          seeAlso: true,
          id: true,
          itemID: true,
          dateAdded: true,
          dateModified: true,
          multi: true, // accomodate Juris-M
        }
      }

      this.validFields[field.typeName][field.fieldName] = true
      if (field.fieldAlias) this.validFields[field.typeName][field.fieldAlias] = true
    }

    debug('Serializer.init: done')
  }

  public fetch(item, legacy, skipChildItems) {
    const cache = Cache.getCollection(this.collection)
    if (!cache) return null

    const cached = cache.findOne({ itemID: item.id, legacy: !!legacy, skipChildItems: !!skipChildItems})
    if (!cached) return null

    return this.enrich(cached.item, item)
  }

  public store(item, serialized, legacy, skipChildItems) {
    const cache = Cache.getCollection(this.collection)

    // come on -- these are used in the collections export but not provided on the items?!
    serialized.itemID = item.id
    serialized.key = item.key

    if (cache) {
      cache.insert({itemID: item.id, legacy, skipChildItems, item: serialized})
    } else {
      Zotero.logError(new Error('Serializer.store ignored, DB not yet loaded'))
    }

    return this.enrich(serialized, item)
  }

  public serialize(item) { return Zotero.Utilities.Internal.itemToExportFormat(item, false, true) }

  private enrich(serialized, item) {
    switch (serialized.itemType) {
      case 'note':
      case 'attachment':
        break

      default:
        serialized.citekey = KeyManager.get(item.id).citekey
        serialized.journalAbbreviation = JournalAbbrev.get(serialized)
        break
    }
    return serialized
  }
}
