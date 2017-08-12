createFile = require('../create-file.coffee')
Loki = require('./loki.coffee')
debug = require('../debug.coffee')
Prefs = require('../preferences.coffee')

class FileStore
  mode: 'reference'
  testing: Prefs.get('testing')

  name: (name) -> name + '.json'

  serialize: (data) ->
    if @testing
      return JSON.stringify(data, null, 2)
    else
      return JSON.stringify(data)

  save: (name, data) ->
    debug('FileStore.save', name)
    db = createFile(name + '.saving')
    Zotero.File.putContents(db, @serialize(data))
    db.moveTo(null, @name(name))
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
    debug('Loki: saving', name)

    try
      for coll in dbref.collections
        if coll.dirty
          @save("#{name}.#{coll.name}", coll)
      # save header last for sort-of-transaction
      @save(name, Object.assign({}, dbref, {collections: dbref.collections.map((coll) -> coll.name)}))
    catch err
      debug('LokiJS.FileStore.exportDatabase: save failed', err)

    return callback(null)

  loadDatabase: (name, callback) ->
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

DB = new Loki('cached', {
  closeOnShutdown: true,
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

### old junk, only for json-backed storage
DB.removeCollection('metadata') if DB.getCollection('metadata')
DB.removeCollection('keys') if DB.getCollection('keys')
###

module.exports = DB
