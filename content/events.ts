/* eslint-disable prefer-rest-params */

import { EventEmitter } from 'eventemitter3'
import { patch as $patch$ } from './monkey-patch'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Events = new EventEmitter() // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match

if (Zotero.Debug.enabled) {
  const events = [
    'preference-changed',
    'item-tag',
    'items-changed',
    'items-removed',
    'libraries-changed',
    'collections-changed',
    'collections-removed',
    'libraries-removed',
    'export-progress',
    'loaded',
  ]

  $patch$(Events, 'on', original => function() {
    if (!events.includes(arguments[0])) throw new Error(`Unsupported event ${arguments[0]}`)
    original.apply(this, arguments)
  })

  $patch$(Events, 'emit', original => function() {
    if (!events.includes(arguments[0])) throw new Error(`Unsupported event ${arguments[0]}`)
    Zotero.debug(`event-emit: ${JSON.stringify(Array.from(arguments))}`)
    original.apply(this, arguments)
  })
}

export function itemsChanged(items: ZoteroItem[]): void {
  if (! items.length) return

  const changed = {
    collections: new Set,
    libraries: new Set,
  }

  for (const item of items) {
    changed.libraries.add(item.libraryID)

    for (let collectionID of item.getCollections()) {
      if (changed.collections.has(collectionID)) continue

      while (collectionID) {
        changed.collections.add(collectionID)
        collectionID = Zotero.Collections.get(collectionID).parentID
      }
    }
  }

  if (changed.collections.size) Events.emit('collections-changed', [...changed.collections])
  if (changed.libraries.size) Events.emit('libraries-changed', [...changed.libraries])
}
