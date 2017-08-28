Components.utils.import('resource://gre/modules/AsyncShutdown.jsm')

Ajv = require('ajv')
Loki = require('lokijs')
debug = require('../debug.coffee')

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

Loki.Collection::insert = ((original) ->
  return (doc) ->
    if @validate && !@validate(doc)
      debug('insert: validation failed', @validate.errors)
      throw new Error("insert: validation failed for #{JSON.stringify(doc)} (#{JSON.stringify(@validate.errors)})")
    return original.apply(@, arguments)
)(Loki.Collection::insert)

Loki.Collection::update = ((original) ->
  return (doc) ->
    if @validate && !@validate(doc)
      debug('update: validation failed', @validate.errors)
      throw new Error("update: validation failed for #{JSON.stringify(doc)} (#{JSON.stringify(@validate.errors)})")
    return original.apply(@, arguments)
)(Loki.Collection::update)

# TODO: workaround for https://github.com/techfort/LokiJS/issues/595#issuecomment-322032656
Loki::close = ((original) ->
  return (callback) ->
    return original.call(@, (errClose) =>
      if @persistenceAdapter && typeof @persistenceAdapter.close == 'function'
        return @persistenceAdapter.close(@filename, (errCloseAdapter) -> callback(errClose || errCloseAdapter))
      else
        return callback(errClose)
    )
)(Loki::close)

Loki::loadDatabaseAsync = (options) ->
  return new Zotero.Promise((resolve, reject) =>
    return @loadDatabase(options, (err) ->
      return reject(err) if err
      return resolve(null)
    )
  )

Loki::saveDatabaseAsync = ->
  return new Zotero.Promise((resolve, reject) =>
    return @saveDatabase((err) ->
      return reject(err) if err
      return resolve(null)
    )
  )

Loki::closeAsync = ->
  return new Zotero.Promise((resolve, reject) =>
    return @close((err) ->
      return reject(err) if err
      return resolve(null)
    )
  )

class NullStore
  mode: 'reference'

  exportDatabase: (name, dbref, callback) -> callback(null)
  loadDatabase: (name, callback) -> callback(null)

AutoSaveOnIdle = []

idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService)
idleService.addIdleObserver({
  observe: (subject, topic, data) ->
    do Zotero.Promise.coroutine(->
      for db in AutoSaveOnIdle
        continue unless db.autosaveDirty()
        debug('idle, saving', db.filename)
        try
          yield db.saveDatabaseAsync()
        catch err
          debug('idle, saving failed', db.filename, err)
      return
    )
    return
}, 5)

class XULoki extends Loki
  constructor: (name, options = {}) ->

    nullStore = !options.adapter
    options.adapter ||= new NullStore()
    options.env = 'XUL-Chrome'

    periodicSave = options.autosaveInterval
    options.autosave = true if periodicSave

    super(name, options)

    if periodicSave
      AutoSaveOnIdle.push(@)
    else
      # workaround for https://github.com/techfort/LokiJS/issues/597
      @autosaveDisable()

    if @persistenceAdapter && !nullStore
      AsyncShutdown.profileBeforeChange.addBlocker("Loki.#{@persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closing #{name}", Zotero.Promise.coroutine(=>
        debug("Loki.#{@persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closing #{name}")

        # setTimeout is disabled during shutdown and throws errors
        @throttledSaves = false

        try
          yield @closeAsync()
          debug("Loki.#{@persistenceAdapter.constructor.name || 'Unknown'}.shutdown: closed #{name}")
        catch err
          debug("Loki.#{@persistenceAdapter.constructor.name || 'Unknown'}.shutdown: close #{name} failed", err)

        return
      ))

  schemaCollection: (name, options) ->
    coll = @getCollection(name) || @addCollection(name, options)
    coll.validate = validator.compile(options.schema)
    return coll


module.exports = XULoki
