createFile = require('../create-file.ts')
Loki = require('./loki.ts')
debug = require('../debug.ts')
events = require('../events.ts')
zoteroCconfig = require('../zotero-config.ts')

version = require('../../gen/version.js')
Translators = require('../../gen/translators.json')

Prefs = require('../prefs.ts')

if Prefs.get('testing')
  stringify = (data) -> JSON.stringify(data, null, 2)
else
  stringify = (data) -> JSON.stringify(data)

class FileStore
  mode: 'reference'

  name: (name) -> name + '.json'

  save: (name, data) ->
    debug('FileStore.save', name)
    db = createFile(name + '.saving')
    Zotero.File.putContents(db, stringify(data))
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
    db.remove(true)

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
    catch err
      if err.name == 'NoSuchFile'
        debug('LokiJS.FileStore.loadDatabase: new database')
      else
        Zotero.logError(err)
      return callback(null)

    try
      collections = []
      for coll in db.collections
        try
          collections.push(@load("#{name}.#{coll}"))
        catch err
          debug('LokiJS.FileStore.loadDatabase: collection load failed, proceeding', err)
      db.collections = collections
    catch err
      debug('LokiJS.FileStore.loadDatabase: load failed', err)

    return callback(db)

DB = new Loki('cache', {
  autosave: true,
  adapter: new FileStore()
})

METADATA = 'Better BibTeX metadata'

DB.remove = (ids) ->
  query = if Array.isArray(ids) then { itemID : { $in : ids } } else { itemID: ids }

  for coll in @collections
    coll.findAndRemove(query)
  return

DB.init = ->
  DB.loadDatabase()
  coll = DB.schemaCollection('itemToExportFormat', {
    indices: [ 'itemID', 'legacy', 'skipChildItems' ],
    schema: {
      type: 'object'
      properties: {
        itemID: { type: 'integer' }
        legacy: { type: 'boolean', default: false }
        skipChildItems: { type: 'boolean', default: false }
        item: { type: 'object' }

        # LokiJS
        meta: { type: 'object' }
        $loki: { type: 'integer' }
      }
      required: [ 'itemID', 'legacy', 'skipChildItems', 'item' ],
      additionalProperties: false
    }
  })
  if (coll.getTransform(METADATA)?[0].value || {}).Zotero != zoteroCconfig.Zotero.version
    debug('CACHE: dropping cache', coll.name, 'because Zotero is now', zoteroCconfig.Zotero.version)
    coll.removeDataOnly()
  coll.setTransform(METADATA, [{
    type: METADATA,
    value : { Zotero: zoteroCconfig.Zotero.version }
  }])

  ###
    TODO: for this to work, an object must be updated when it is fetched
  ###
  #             secs  mins  hours days
  ttl =         1000  * 60  * 60  * 24 * 30
  ttlInterval = 1000  * 60  * 60  * 4
  for translator of Translators.byName
    coll = DB.schemaCollection(translator, {
      indices: [ 'itemID', 'exportNotes', 'useJournalAbbreviation' ],
      schema: {
        type: 'object'
        properties: {
          itemID: { type: 'integer' }
          exportNotes: { type: 'boolean', default: false }
          useJournalAbbreviation: { type: 'boolean', default: false }
          reference: { type: 'string' }

          # Optional
          metadata: { type: 'object', default: {} }

          # LokiJS
          meta: { type: 'object' }
          $loki: { type: 'integer' }
        }
        required: [ 'itemID', 'exportNotes', 'useJournalAbbreviation', 'reference' ],
        additionalProperties: false
      },
      ttl
      ttlInterval
    })
    if (coll.getTransform(METADATA)?[0].value || {}).BetterBibTeX != version
      debug('CACHE: dropping cache', coll.name, 'because BetterBibTeX is now', version)
      coll.removeDataOnly()
    coll.setTransform(METADATA, [{
      type: METADATA,
      value : { BetterBibTeX: version }
    }])

  return

# the preferences influence the output way too much, no keeping track of that
events.on('preference-changed', ->
  for translator of Translators.byName
    DB.getCollection(translator).removeDataOnly()
  return
)

###
  TODO: use preference-changed event to drop the translator caches
###

# cleanup
DB.removeCollection('cache') if DB.getCollection('cache')
DB.removeCollection('serialized') if DB.getCollection('serialized')

module.exports = DB
