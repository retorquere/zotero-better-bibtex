createFile = require('../create-file.coffee')
Loki = require('./loki.coffee')
debug = require('../debug.coffee')
Translators = require('../../gen/translators.json')

class FileStore
  mode: 'reference'

  name: (name) -> name + '.json'

  save: (name, data) ->
    debug('FileStore.save', name)
    db = createFile(name + '.saving')
    Zotero.File.putContents(db, JSON.stringify(data))
    db.moveTo(null, @name(name))
    debug('FileStore.saved', name, 'to', @name(name))
    return

  load: (name) ->
    name = @name(name)
    debug('FileStore.load', name)
    db = createFile(name)
    throw {name: 'NoSuchFile', message: "#{db.path} not found", toString: -> "#{@name}: #{@message}"} unless db.exists()
    data = JSON.parse(Zotero.File.getContents(db))

    # this is intentional. If all is well, the database will be retained in memory until it's saved at
    # shutdown. If all is not well, this will make sure the caches are rebuilt from scratch
    db.remove()

    return data

  exportDatabase: (name, dbref, callback) ->
    debug('FileStore.exportDatabase: saving', name)

    try
      for coll in dbref.collections
        if coll.dirty
          @save("#{name}.#{coll.name}", coll)
      # save header last for sort-of-transaction
      @save(name, Object.assign({}, dbref, {collections: dbref.collections.map((coll) -> coll.name)}))
    catch err
      debug('LokiJS.FileStore.exportDatabase: save failed', err)

    debug('LokiJS.FileStore.exportDatabase: save completed', name)
    return callback(null)

  loadDatabase: (name, callback) ->
    debug('FileStore.loadDatabase: loading', name)
    try
      db = @load(name)
      collections = []
      for coll in db.collections
        try
          collections.push(@load("#{name}.#{coll}"))
      db.collections = collections
    catch err
      debug('LokiJS.FileStore.loadDatabase: load failed', err)
      db = null

    return callback(db)

DB = new Loki('cache', {
  autosave: true,
  adapter: new FileStore()
})

DB.loadDatabase()

DB.remove = (ids) ->
  query = if Array.isArray(ids) then { itemID : { $in : ids } } else { itemID: ids }

  for coll in @collections
    coll.findAndRemove(query)
  return

DB.schemaCollection('itemToExportFormat', {
  indices: [ 'itemID', 'legacy', 'skipChildItems' ],
  schema: {
    type: 'object'
    properties: {
      itemID: { type: 'integer' }
      legacy: { coerce: 'boolean', default: false }
      skipChildItems: { coerce: 'boolean', default: false }
    }
    required: [ 'itemID', 'legacy', 'skipChildItems' ]
  }
})

###
  TODO: for this to work, an object must be updated when it is fetched
###
#             secs  mins  hours days
ttl:          1000  * 60  * 60  * 24 * 30
ttlInterval:  1000  * 60  * 60  * 4
for translator of Translators.byName
  DB.schemaCollection(translator, {
    indices: [ 'itemID', 'exportNotes', 'useJournalAbbreviation' ],
    schema: {
      type: 'object'
      properties: {
        itemID: { type: 'integer' }
        exportNotes: { coerce: 'boolean', default: false }
        useJournalAbbreviation: { coerce: 'boolean', default: false }
        reference: { type: 'string' }
        metadata: { type: 'object', default: {} }
      }
      required: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', 'reference' ]
    },
    ttl
    ttlInterval
  })

###
  TODO: use preference-changed event to drop the translator caches
###

# cleanup
DB.removeCollection('cache') if DB.getCollection('cache')
DB.removeCollection('serialized') if DB.getCollection('serialized')

module.exports = DB
