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

class NullStore
  mode: 'reference'
  exportDatabase: (name, dbref, callback) -> callback(null)
  loadDatabase: (name, callback) -> callback(null)

AutoSave = {
  onIdle: []
  onShutdown: []
}

debug('registering shutdown listeners')
Zotero.addShutdownListener(->
  debug('shutdown (Zotero), auto-saving', AutoSave.onShutdown.length)
  for db in AutoSave.onShutdown
    debug('shutdown (Zotero), auto-saving', db.filename)
    try
      db.close()
    catch err
      debug('shutdown (Zotero), auto-saving failed', db.filename, err)
  return
)
#observerService = Components.classes["@mozilla.org/observer-service;1"] .getService(Components.interfaces.nsIObserverService)
#observerService.addObserver({
#  observe: (subject, topic, data) ->
#    debug('shutdown (quit-application), closing', AutoSave.onShutdown.length)
#    for db in AutoSave.onShutdown
#      debug('shutdown (quit-application), closing', db.filename)
#      try
#        db.close()
#      catch err
#        debug('shutdown (quit-application), closing failed', db.filename, err)
#    return
#}, 'quit-application', false)

idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService)
idleService.addIdleObserver({
  observe: (subject, topic, data) ->
    debug('idle, saving', AutoSave.onShutdown.length)
    for db in AutoSave.onShutdown
      debug('idle, saving', db.filename)
      try
        db.saveDatabase()
      catch err
      debug('idle, saving failed', db.filename, err)
    return
}, 5)

class XULoki extends Loki
  constructor: (name, options = {}) ->
    AutoSave.onShutdown.push(@) if options.closeOnShutdown
    AutoSave.onIdle.push(@) if options.autosaveOnIdle

    options.adapter ||= NullStore
    options.env = 'XUL-Chrome'

    super(name, options)

  schemaCollection: (name, options) ->
    coll = @getCollection(name) || @addCollection(name, options)
    coll.validate = validator.compile(options.schema)
    return coll


module.exports = XULoki
