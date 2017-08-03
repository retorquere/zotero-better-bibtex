Ajv = require('ajv')
Loki = require('lokijs')

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

        else
          throw new Error(msg)

      parentData[parentDataProperty] = data
      return validateCoerced(data)
})

Loki::addCollection = ((original) ->
  return (name, options) ->
    coll = original.apply(@, arguments)
    coll.validate = validator.compile(options.schema) if options.schema
    return coll
)(Loki::addCollection)

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

module.exports = (name) ->
  return new Loki(name, {
    persistenceMethod: null
    # autosave: true
    # autosaveInterval: 5000
    # adapter: Zotero.BetterBibTeX.DBStore
    env: 'BROWSER'
  })
