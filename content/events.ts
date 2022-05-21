/* eslint-disable prefer-rest-params */

import { EventEmitter as EventEmitter3 } from 'eventemitter3'
import { log } from './logger'

const events: string[] = [
  'error',
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
const event_prefix = events.map(name => name + '.')

const log_events = Zotero.Prefs.get('translators.better-bibtex.log-events')

export const Events = new class EventEmitter extends EventEmitter3 {
  constructor() {
    super()
    this.on('error', err => {
      throw Zotero.debug(err)
    })
  }

  private verify(event: string | symbol) {
    if (!log_events) return true
    if (typeof event === 'symbol') return false
    if (events.includes(event) || event_prefix.find(prefix => event.startsWith(prefix))) return true
    throw new Error(`Unsupported event ${event}`)
  }

  public on(event: string | symbol, handler: (...args: any[]) => void, self?: any): this {
    this.verify(event)
    super.on(event, handler, self)
    return this
  }

  public emit(event: string | symbol, ...args: any[]): boolean {
    this.verify(event)

    const prefix: string = typeof event === 'string' ? event + '.' : '\0'
    const results: boolean[] = []
    for (const listening of this.eventNames()) {
      log.debug('event.emit(', listening, args, ')')
      if (listening === event || (typeof listening === 'string' && listening.startsWith(prefix))) results.push(super.emit.apply(this, [listening, ...args]))
    }
    return results.length === 0 ? false : !results.find(r => !r)
  }

  public itemsChanged(items: ZoteroItem[]): void {
    if (!items.length) return

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

    if (changed.collections.size) this.emit('collections-changed', [...changed.collections])
    if (changed.libraries.size) this.emit('libraries-changed', [...changed.libraries])
  }
}
