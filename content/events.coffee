debug = require('./debug.coffee')
EventEmitter = require('eventemitter4')
emitter = new EventEmitter()

events = [
  'preference-changed'
  'item-updated'
  'item-deleted'
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
    debug('events: emitted', arguments[0])
    original.apply(@, arguments)
    return
)(emitter.emit)

module.exports = emitter
