declare const Zotero: any

// tslint:disable-next-line:variable-name
const EventEmitter = require('eventemitter4')

const debug = require('./debug.ts')
const emitter = new EventEmitter()

if (Zotero.Debug.enabled) {
  const events = [
    'preference-changed',
    'items-changed',
    'items-removed',
    'libraries-changed',
    'collections-changed',
    'collections-removed',
    'libraries-removed',
  ]

  emitter.on = (original =>
    function() {
      if (!events.includes(arguments[0])) throw new Error(`Unsupported event ${arguments[0]}`)
      debug('events: handler registered for', arguments[0])
      original.apply(this, arguments)
    }
  )(emitter.on)

  emitter.emit = (original =>
    function() {
      if (!events.includes(arguments[0])) throw new Error(`Unsupported event ${arguments[0]}`)
      debug('events: emitted', Array.prototype.slice.call(arguments))
      original.apply(this, arguments)
    }
  )(emitter.emit)

  for (const event of events) {
    (e => emitter.on(e, () => debug(`events: got ${e}`)))(event)
  }
}

export = emitter
