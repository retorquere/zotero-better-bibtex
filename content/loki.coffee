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

FileStore = new class
  backups: 3

  versioned: (name, id) ->
    return name unless id
    return "#{name}.#{id}"

  saveDatabase: (name, serialized, callback) ->
    try
      db = createFile(name)
      if db.exists()
        for id in [@backups..0]
          db = createFile(@versioned(name, id))
          continue unless db.exists()
          Zotero.BetterBibTeX.debug("DBStore: backing up #{db.path}")
          db.moveTo(null, name + ".#{id + 1}")
    catch err
      debug('LokiJS.FileStore.saveDatabase: backup failed', err)

    db = createFile(name + '.saving')
    Zotero.File.putContents(db, serialized)
    db.moveTo(null, name)

    callback()
    return

  tryDatabase: (name) ->
    Zotero.BetterBibTeX.debug("LokiJS.FileStore.tryDatabase: trying #{name}")
    file = createFile(name)
    throw {name: 'NoSuchFile', message: "#{file.path} not found", toString: -> "#{@name}: #{@message}"} unless file.exists()

    data = Zotero.File.getContents(file)

    # will throw an error if not valid JSON -- too bad we're doing this twice, but better safe than sorry, and only
    # happens at startup
    JSON.parse(data)

    return data

  loadDatabase: (name, callback) ->
    data = null
    for id in [0..@backups]
      try
        data = @tryDatabase(@versioned(name, id))
        break
      catch err
        debug("LokiJS.FileStore.loadDatabase: failed to load #{@versioned(name, id)}", err)
        data = null

    flash("failed to load #{name}") unless data

    callback(data)
    return

module.exports = (name, options = {}) ->
  if options.autosave
    options.adapter = FileStore
    options.autosaveInterval ||= 5000
    delete options.persistenceMethod
  else
    delete options.adapter
    options.persistenceMethod = null
  options.env = 'BROWSER'
  return new Loki(name, options)
