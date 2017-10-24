declare const Zotero: any

const EVENTEMITTER = require('eventemitter4')

import debug = require('./debug.ts')
import $patch$ = require('./monkey-patch.ts')
const emitter = new EVENTEMITTER()

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

  $patch$(emitter, 'on', original => function() {
    if (!events.includes(arguments[0])) throw new Error(`Unsupported event ${arguments[0]}`)
    debug('events: handler registered for', arguments[0])
    original.apply(this, arguments)
  })

  $patch$(emitter, 'emit', original => function() {
    if (!events.includes(arguments[0])) throw new Error(`Unsupported event ${arguments[0]}`)
    debug('events: emitted', Array.prototype.slice.call(arguments))
    original.apply(this, arguments)
  })

  for (const event of events) {
    (e => emitter.on(e, () => debug(`events: got ${e}`)))(event)
  }
}

export = emitter
