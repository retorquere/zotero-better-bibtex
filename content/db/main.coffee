Loki = require('./loki.coffee')
debug = require('../debug.coffee')
Prefs = require('../prefs.coffee')

if Prefs.get('testing')
  stringify = (data) -> JSON.stringify(data, null, 2)
else
  stringify = (data) -> JSON.stringify(data)

class DBStore
  mode: 'reference'

  conn: {}
  validName: /^better-bibtex[-_a-zA-Z0-9]*$/

  exportDatabase: (dbname, dbref, callback) ->
    debug('DBStore.exportDatabase:', dbname)

    conn = @conn[dbname]
    if conn == false
      debug('DBStore: save of', dbname, 'attempted after close')
      return callback(null)

    throw new Error("Database #{dbname} not loaded") unless conn

    do Zotero.Promise.coroutine(->
      try
        yield conn.executeTransaction(->
          for coll in dbref.collections
            if coll.dirty
              name = "#{dbname}.#{coll.name}"
              debug('DBStore.exportDatabase:', name)
              conn.queryAsync("REPLACE INTO \"#{dbname}\" (name, data) VALUES (?, ?)", [name, stringify(coll)])

          # TODO: only save if dirty? What about collection removal? Other data that may have changed on the DB?
          conn.queryAsync("REPLACE INTO \"#{dbname}\" (name, data) VALUES (?, ?)", [dbname, stringify(Object.assign(
            {},
            dbref,
            {collections: dbref.collections.map((coll) -> "#{dbname}.#{coll.name}")}
          ))])

          return
        )
        return callback(null)
      catch err
        return callback(err)
    )

    return

  # this assumes Zotero.initializationPromise has resolved, will throw an error if not
  loadDatabase: (dbname, callback) ->
    debug('DBStore.loadDatabase:', dbname)
    throw new Error("Invalid database name '#{dbname}'") unless dbname.match(@validName)
    throw new Error("Database '#{dbname}' already closed") if @conn[dbname] == false
    throw new Error("Database '#{dbname}' already loaded") if @conn[dbname]

    conn = @conn[dbname] = new Zotero.DBConnection(dbname)

    do Zotero.Promise.coroutine(->
      try
        yield conn.executeTransaction(->
          yield conn.queryAsync("CREATE TABLE IF NOT EXISTS \"#{dbname}\" (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)")

          db = null
          collections = {}
          for row in yield conn.queryAsync("SELECT name, data FROM \"#{dbname}\" ORDER BY name ASC")
            debug('DBStore.loadDatabase:', dbname, '.', row.name)
            if row.name == dbname
              debug("DBStore.loadDatabase: loading #{dbname}")
              db = JSON.parse(row.data)
            else
              try
                debug("DBStore.loadDatabase: loading #{row.name}")
                collections[row.name] = JSON.parse(row.data)
                debug("DBStore.loadDatabase: #{row.name} has", collections[row.name].data.length, 'records')
              catch err
                debug("DBStore.loadDatabase: failed to parse #{row.name}")

          if db
            debug("DBStore.loadDatabase: restoring collections:", db.collections)
            db.collections = (collections[coll] for coll in db.collections when collections[coll])

          return callback(db)
        )
      catch err
        debug('DBStore.loadDatabase: error loading', dbname, err)
        return callback(err)
    )
    return

  close: (dbname, callback) ->
    debug('DBStore.close', dbname)

    return callback(null) unless @conn[dbname]

    conn = @conn[dbname]
    @conn[dbname] = false

    do Zotero.Promise.coroutine(->
      try
        yield conn.closeDatabase(true)
        debug('DBStore.close OK', dbname)
        return callback(null)
      catch err
        debug('DBStore.close FAILED', dbname, err)
        return callback(err)
    )
    return

DB = new Loki('better-bibtex', {
  autosave: true,
  autosaveInterval: 5000,
  autosaveOnIdle: true,
  adapter: new DBStore(),
  autoexport: {
    proto: Object,
    inflate: (src, dest) ->
      Object.assign(dest, src)
      dest.updated = Date.parse(dest.updated) if dest.updated
      return
  }
})

DB.init = Zotero.Promise.coroutine(->
  yield DB.loadDatabaseAsync()

  debug('before DB schemaCollection:', { keys: DB.getCollection('citekey') })
  DB.schemaCollection('citekey', {
    indices: [ 'itemID', 'libraryID', 'citekey', 'pinned' ],
    unique: [ 'itemID' ],
    schema: {
      type: 'object'
      properties: {
        itemID: { type: 'integer' }
        libraryID: { type: 'integer' }
        citekey: { type: 'string', minLength: 1 }
        pinned: { type: 'boolean', default: false }

        # LokiJS
        meta: { type: 'object' }
        $loki: { type: 'integer' }
      }
      required: [ 'itemID', 'libraryID', 'citekey', 'pinned' ],
      additionalProperties: false
    }
  })
  debug('after DB schemaCollection:', { keys: DB.getCollection('citekey') })

  DB.schemaCollection('autoexport', {
    indices: [ 'type', 'id', 'status', 'path', 'exportNotes', 'translatorID', 'useJournalAbbreviation'],
    unique: [ 'path' ],
    logging: true,
    schema: {
      type: 'object'
      properties: {
        type: { enum: [ 'collection', 'library' ] }
        id: { type: 'integer' }
        path: { type: 'string', minLength: 1 }
        status: { enum: [ 'scheduled', 'running', 'done', 'error' ] }
        translatorID: { type: 'string', minLength: 1 }
        exportNotes: { type: 'boolean', default: false }
        useJournalAbbreviation: { type: 'boolean', default: false }
        error: { type: 'string', default: '' }

        # optional
        updated: { instanceof: 'Date' }

        # LokiJS
        meta: { type: 'object' }
        $loki: { type: 'integer' }
      }
      required: [ 'type', 'id', 'path', 'status', 'translatorID', 'exportNotes', 'useJournalAbbreviation' ],

      additionalProperties: false
    }
  })

  return
)

### old junk, only for json-backed storage
DB.removeCollection('metadata') if DB.getCollection('metadata')
DB.removeCollection('keys') if DB.getCollection('keys')
###

### only for json-backed storage
for ae in autoexports.data()
  # upgrade old autoexports
  if ae.collection
    [ ae.type, ae.id ] = ae.collection.split(':')
    ae.id ?= Zotero.Libraries.userLibraryID
    delete ae.collection
    autoexports.update(ae)

  # interrupted at start
  if ae.status == 'running'
    ae.scheduled = new Date()
    ae.status = 'done'
  else
    delete ae.scheduled
  autoexports.update(ae)
###

module.exports = DB
