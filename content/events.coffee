debug = require('./debug.coffee')
EventEmitter = require('eventemitter4')
emitter = new EventEmitter()

if Zotero.Debug.enabled
  events = [
    'preference-changed'
    'items-changed'
    'items-removed'
    'libraries-changed'
    'collections-changed'
    'collections-removed'
    'libraries-removed'
  ]

  emitter.on = ((original) ->
    return ->
      throw new Error("Unsupported event #{arguments[0]}") unless arguments[0] in events
      debug('events: handler registered for', arguments[0])
      original.apply(@, arguments)
      return
  )(emitter.on)

  emitter.emit = ((original) ->
    return ->
      throw new Error("Unsupported event #{arguments[0]}") unless arguments[0] in events
      debug('events: emitted', Array.prototype.slice.call(arguments))
      original.apply(@, arguments)
      return
  )(emitter.emit)

module.exports = emitter
