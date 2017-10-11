declare const Zotero: any

const abbrevs = require('./journal-abbrev.ts')
const debug = require('./debug.ts')

const CACHE = require('./db/cache.coffee')
const KEYMANAGER = require('./keymanager.coffee')
const ZOTERODB = require('./db/zotero.ts')

class Serializer {
  private static collection = 'itemToExportFormat'
  public simplify: Function
  public scrub: Function

//  # prune cache on old accessed
//  prune: Zotero.Promise.coroutine(->
//    ids = yield Zotero.DB.columnQueryAsync('select itemID from items where itemID not in (select itemID from deletedItems)')
//    for id in ids
//      delete cache[id] if entry.accessed

  public async init() {
    abbrevs.init()

    debug('Serializer.init')
    const fieldsWithAliases = await ZOTERODB.queryAsync(`
      SELECT it.typeName, f.fieldName, a.fieldName as fieldAlias
      FROM baseFieldMappingsCombined bfmc
      JOIN fields f ON f.fieldID = bfmc.baseFieldID
      JOIN fields a ON a.fieldID = bfmc.fieldID
      JOIN itemTypes it ON it.itemTypeID = bfmc.itemTypeID
    `)

    /* SIMPLIFY */
    const mapping = fieldsWithAliases.reduce((map, alias) => {
      if (!map[alias.typeName]) map[alias.typeName] = {}
      map[alias.typeName][alias.fieldAlias] = alias.fieldName
      return map
    }
    , {})

    let simplify = ''
    for (const [itemType, aliases] of Object.entries(mapping)) {
      simplify += `if (item.itemType == '${itemType}') {\n`
      for (const [alias, field] of Object.entries(aliases)) {
        simplify += `item.${field} = item.${field} || item.${alias};\n`
      }
      simplify += '}\n'
    }

    simplify += 'item.tags = item.tags ? item.tags.map(function(tag) { return tag.tag }) : [];\n'
    simplify += 'return item;'

    debug('Serializer.init: simplify =\n', simplify)
    this.simplify = new Function('item', simplify)

    /* SCRUB */
    const fields = await ZOTERODB.queryAsync(`
      SELECT it.typeName, f.fieldName
      FROM itemTypes it
      JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
      JOIN fields f ON f.fieldID = itf.fieldID
    `)

    let renames = ''
    let seen = {}
    for (const field of fieldsWithAliases) {
      seen[field.fieldAlias] = true
      renames += `if (item.${field.fieldAlias}) { item.${field.fieldName} = item.${field.fieldAlias}; delete item.${field.fieldAlias}; }\n`
      fields.push(field.fieldName)
    }

    fields.push.apply(fields, [
      'key',
      'itemType',
      'creators',
      'itemID',
      'seeAlso',
      // 'relations',
      'attachments',
      // 'collections',
      'tags',
      'notes',
      'related',
    ])

    let supported = ''
    seen = {}
    for (let field of fields) {
      if (typeof field === 'string') field = { fieldName: field }
      if (seen[field.fieldName]) continue
      seen[field.fieldName] = true
      supported += `case '${field.fieldName}':\n`
    }

    const scrub = `
      if (Array.isArray(item.tags) && item.tags.length && item.tags[0].note) {
        item.tags = item.tags.map(function(tag) { return tag.tag }).filter(function(tag) { return tag })
      }

      if (Array.isArray(item.notes) && item.notes.length && item.notes[0].note) {
        item.notes = item.notes.map(function(note) { return note.note }).filter(function(note) { return note })
      }

      if (Array.isArray(item.attachments) && item.attachments.length) {
        item.attachments.forEach(function(attachment) {
          attachment.path || (attachment.path = attachment.localPath)
        })
      }

      if (item.relations) {
        if (item.relations['dc:relation']) {
          var relations = item.relations['dc:relation']
          if (!Array.isArray(relations)) relations = [relations]

          item.relations = relations.map(rel => rel.replace(/.*\\//, ''))
        } else if (!Array.isArray(item.relations)) {
          delete item.relations
        }
      }

      ${renames}

      for (var key in item) {
        switch (key) {
          ${supported}
            if (item[key] == null || item[key] == '') delete item[key]
            else if (Array.isArray(item[key]) && !item[key].length) delete item[key]
            break
          default:
            Zotero.debug('{better-bibtex:<Translator>}: removing unsupported field ' + key + ': ' + item[key])
            delete item[key]
        }
      }
      return item
    `

    debug('Serializer.init: scrub =', scrub)
    this.scrub = new Function('item', scrub)

    debug('Serializer.init: done')
  }

  public fetch(item, legacy, skipChildItems) {
    const cache = CACHE.getCollection(Serializer.collection)
    if (cache) return null

    const cached = cache.findOne({ itemID: item.id, legacy: !!legacy, skipChildItems: !!skipChildItems})
    if (!cached) return null

    const serialized = cached.item
    serialized.journalAbbreviation = abbrevs.get(serialized)
    if (!['note', 'attachment'].includes(serialized.itemType)) serialized.citekey = KEYMANAGER.get(item.id).citekey
    return serialized
  }

  public store(item, serialized, legacy, skipChildItems) {
    const cache = CACHE.getCollection(Serializer.collection)

    // come on -- these are used in the collections export but not provided on the items?!
    serialized.itemID = item.id
    serialized.key = item.key

    if (cache) {
      cache.insert({itemID: item.id, legacy, skipChildItems, item: serialized})
    } else {
      Zotero.logError(new Error('Serializer.store ignored, DB not yet loaded'))
    }

    serialized.journalAbbreviation = abbrevs.get(serialized)
    if (!['note', 'attachment'].includes(serialized.itemType)) serialized.citekey = KEYMANAGER.get(item.id).citekey
    return serialized
  }

  public serialize(item) { return Zotero.Utilities.Internal.itemToExportFormat(item, false, true) }
}

export = new Serializer()
