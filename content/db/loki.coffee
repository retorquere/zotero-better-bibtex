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
    throw @validate.errors if @validate && !@validate(doc)
    return original.apply(@, arguments)
)(Loki.Collection::insert)

Loki.Collection::update = ((original) ->
  return (doc) ->
    throw @validate.errors if @validate && !@validate(doc)
    return original.apply(@, arguments)
)(Loki.Collection::update)

# TODO: workaround for https://github.com/techfort/LokiJS/issues/595#issuecomment-322032656
Loki::closeAsync = ->
  return new Zotero.Promise((resolve, reject) =>
    debug('Loki::closeAsync')

    try
      return @close((err) =>
        debug('Loki::closeAsync: close', err)
        return reject(err) if err
        return resolve(null) unless @persistenceAdapter && typeof @persistenceAdapter.close == 'function'

        # close adapter after DB, as the DB may need the adapter in 'close'
        debug('Loki::closeAsync:', @persistenceAdapter.constructor.name)
        return @persistenceAdapter.close(@filename, (err) =>
          debug('Loki::closeAsync:', @persistenceAdapter.constructor.name, err)
          return reject(err) if err
          return resolve(null)
        )
      )
    catch err
      debug('Loki::closeAsync??', err)
      return reject(err)
  )

Loki::saveDatabaseAsync = ->
  return new Zotero.Promise((resolve, reject) =>
    return @saveDatabase((err) ->
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

    if @persistenceAdapter
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
