Ajv = require('ajv')
Loki = require('lokijs')
createFile = require('./create-file.coffee')
debug = require('./debug.coffee')
flash = require('./flash.coffee')

validator = new Ajv({ useDefaults: true, coerceTypes: true })

validator.addKeyword('coerce', {
  modifying: true,
  compile: (type) ->
    validateCoerced = validator.compile({ type })
    return (data, dataPath, parentData, parentDataProperty) ->
      msg = "Unable to coerce #{typeof data} '#{data}' to #{type}"

      switch type
        when 'float', 'number'
          data = parseFloat(data || 0)
          throw new Error(msg) if isNaN(data) || !isFinite(data)

        when 'integer'
          data = parseInt(data || 0)
          throw new Error(msg) if isNaN(data) || !isFinite(data)

        when 'boolean'
          data = !!data

        when 'string'
          data = if data? then '' + data else ''

        when 'date'
          if data then data = new Date(data) else data = null

        else
          throw new Error(msg)

      parentData[parentDataProperty] = data

      return !data || !isNaN(data.getTime()) if type == 'date'
      return validateCoerced(data)
})

Loki::schemaCollection = (name, options) ->
  coll = @getCollection(name) || @addCollection(name, options)
  coll.validate = validator.compile(options.schema)
  return coll

Loki.Collection::insert = ((original) ->
  return (doc) ->
    throw @validate.errors if @validate && !@validate(doc)
    return original.apply(@, arguments)
)(Loki.Collection::insert)

Loki.Collection::update = ((original) ->
  return (doc) ->
    throw @validate.errors if @validate && !@validate(doc)
    return original.apply(@, arguments)
)(Loki.Collection::update)

class FileStore
  backups: 3

  versioned: (name, id) ->
    return name unless id
    return "#{name}.#{id}"

  @name: (name) -> name + '.json'

  saveDatabase: (name, serialized, callback) ->
    name = @name(name)
    debug('Loki: saving', name)

    try
      db = createFile(name)
      if db.exists()
        for id in [@backups..0]
          db = createFile(@versioned(name, id))
          continue unless db.exists()
          debug("FileStore: backing up #{db.path}")
          db.moveTo(null, name + ".#{id + 1}")
    catch err
      debug('LokiJS.FileStore.saveDatabase: backup failed', err)

    try
      db = createFile(name + '.saving')
      Zotero.File.putContents(db, serialized)
      db.moveTo(null, name)
      callback(null)
    catch err
      callback(err)
    return

  tryDatabase: (name) ->
    debug("LokiJS.FileStore.tryDatabase: trying #{name}")
    file = createFile(name)
    throw {name: 'NoSuchFile', message: "#{file.path} not found", toString: -> "#{@name}: #{@message}"} unless file.exists()

    data = Zotero.File.getContents(file)

    # will throw an error if not valid JSON -- too bad we're doing this twice, but better safe than sorry, and only
    # happens at startup
    JSON.parse(data)

    return data

  loadDatabase: (name, callback) ->
    name = @name(name)

    data = null
    error = null
    for id in [0..@backups]
      try
        data = @tryDatabase(@versioned(name, id))
        error = null
        break
      catch err
        error = err unless err.name == 'NoSuchFile'
        data = null

    if error
      debug("LokiJS.FileStore.loadDatabase: failed to load #{name}", error)
      flash("failed to load #{name} (#{error})")
      return callback(error)

    return callback(data || '{}')

class NullStore
  mode: 'reference'
  exportDatabase: (name, dbref, callback) -> callback(null)
  loadDatabase: (name, callback) -> callback(null)

class DBStore
  mode: 'reference'
  loaded: {}
  validName: /^_better_bibtex[_a-zA-Z0-9]*$/

  name: (name) -> '_' + name.replace(/[^a-zA-Z]/, '_')

  exportDatabase: (dbname, dbref, callback) ->
    dbname = @name(dbname)
    debug('Saving', dbname, 'to DBStore')

    throw new Error("Invalid database name '#{dbname}'") unless dbname.match(@validName)
    throw new Error("Database #{dbname} not loaded") unless @loaded[dbname]

    do Zotero.Promise.coroutine(->
      try
        yield Zotero.DB.executeTransaction(=>
          header = {}
          dirty = false
          for k, v of dbref
            if k == 'collections'
              for coll in v
                name = "#{dbname}.#{coll.name}"
                if coll.dirty
                  dirty = true
                  Zotero.DB.queryAsync("REPLACE INTO #{dbname} (name, data) VALUES (?, ?)", [name, JSON.stringify(coll)])
              header[k] = v.map((coll) -> coll.name)
            else
              header[k] = v

          # TODO: only save if dirty? What about collection removal? Other data that may have changed on the DB?
          Zotero.DB.queryAsync("REPLACE INTO #{dbname} (name, data) VALUES (?, ?)", [dbname, JSON.stringify(header)])
          return
        )
        return callback(null)
      catch err
        return callback(err)
    )

    return

  # this assumes Zotero.initializationPromise has resolved, will throw an error if not
  loadDatabase: (dbname, callback) ->
    dbname = @name(dbname)
    debug('Loading', dbname, 'from DBStore')
    throw new Error("Invalid database name '#{dbname}'") unless dbname.match(@validName)

    do Zotero.Promise.coroutine(=>
      try
        yield Zotero.DB.executeTransaction(=>
          yield Zotero.DB.queryAsync("CREATE TABLE IF NOT EXISTS #{dbname} (name TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL)")

          data = yield Zotero.DB.queryAsync("SELECT name, data FROM #{dbname}")

          if data.length == 0
            db = null
          else
            data = data.reduce(((collections, row) ->
              try
                collections[row.name] = JSON.parse(row.data)
              catch err
                debug("DBStore.loadDatabase: failed to parse #{dbname}.#{row.name}")
              return collections
            ), {})

            db = data[dbname]
            db.collections = (data[coll] for coll in db.collections when data[coll]) if db.collections

          @loaded[dbname] = true
          return callback(db)
        )
      catch err
        callback(err)
      return
    )
    return

module.exports = (name, options = {}) ->
  if options.autosave
    options.adapter = new DBStore()
    options.autosaveInterval ||= 5000
  else
    delete options.autosaveInterval
    options.adapter = new NullStore()

  options.env = 'XUL-CHROME'

  debug('Setting up database', name, 'with options', options)
  return new Loki(name, options)
