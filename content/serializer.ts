declare const Zotero: any

import Abbrevs = require('./journal-abbrev.ts')
import debug = require('./debug.ts')

import Cache = require('./db/cache.ts')
import KeyManager = require('./keymanager.ts')
import ZoteroDB = require('./db/zotero.ts')

class Serializer {
  private static collection = 'itemToExportFormat'

  public simplify: Function
  public validFields: { [key: string]: { [key: string]: boolean } }

//  # prune cache on old accessed
//  prune: Zotero.Promise.coroutine(->
//    ids = yield Zotero.DB.columnQueryAsync('select itemID from items where itemID not in (select itemID from deletedItems)')
//    for id in ids
//      delete cache[id] if entry.accessed

  public async init() {
    Abbrevs.init()

    debug('Serializer.init')

    // SIMPLIFY
    let fields = await ZoteroDB.queryAsync(`
      SELECT DISTINCT f.fieldName, a.fieldName as fieldAlias
      FROM baseFieldMappingsCombined bfmc
      JOIN fields f ON f.fieldID = bfmc.baseFieldID
      JOIN fields a ON a.fieldID = bfmc.fieldID
    `)
    const alias = {}
    let simplify = ''
    for (const field of fields) {
      if (alias[field.fieldAlias] && alias[field.fieldAlias] !== field.fieldName) throw new Error(`field alias ${field.fieldAlias} maps to ${alias[field.fieldAlias]} and ${field.fieldName}`)
      alias[field.fieldAlias] = field.fieldName
      simplify += `if (item.${field.fieldAlias} || typeof item.${field.fieldAlias} === 'number') item.${field.fieldName} = item.${field.fieldAlias};\n`
      simplify += `delete item.${field.fieldAlias};\n`
    }
    simplify += 'item.tags = item.tags ? item.tags.map(function(tag) { return tag.tag }) : [];\n'
    simplify += 'return item;'
    debug('Serializer.init: simplify =\n', simplify)
    this.simplify = new Function('item', simplify)

    // VALIDATE
    fields = await ZoteroDB.queryAsync(`
      SELECT * FROM (
        SELECT it.typeName, f.fieldName, a.fieldName AS fieldAlias
        FROM baseFieldMappingsCombined bfmc
        JOIN fields f ON f.fieldID = bfmc.baseFieldID
        JOIN fields a ON a.fieldID = bfmc.fieldID
        JOIN itemTypes it ON it.itemTypeID = bfmc.itemTypeID

        UNION

        SELECT it.typeName, f.fieldName, NULL
        FROM itemTypes it
        JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
        JOIN fields f ON f.fieldID = itf.fieldID
      ) ORDER BY typeName, fieldName
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
    const cache = Cache.getCollection(Serializer.collection)
    if (!cache) return null

    const cached = cache.findOne({ itemID: item.id, legacy: !!legacy, skipChildItems: !!skipChildItems})
    if (!cached) return null

    return this.enrich(cached.item, item)
  }

  public store(item, serialized, legacy, skipChildItems) {
    const cache = Cache.getCollection(Serializer.collection)

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
        serialized.journalAbbreviation = Abbrevs.get(serialized)
        break
    }
    return serialized
  }
}

export = new Serializer()
