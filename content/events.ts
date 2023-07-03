/* eslint-disable prefer-rest-params */

import Emittery from 'emittery'

import { log } from './logger'

export const Events = new Emittery<{
  'collections-changed': number[]
  'collections-removed': number[]
  'export-progress': { pct: number, message: string, ae?: number }
  'items-changed': number[]
  'items-removed': number[]
  'libraries-changed': number[]
  'libraries-removed': number[]
  'loaded': undefined
  'preference-changed': string
  'window-loaded': { win: Window, href: string }
}>({
  debug: {
    name: 'better-bibtex event',
    enabled: Zotero.Prefs.get('translators.better-bibtex.logEvents'),
    logger: (type, debugName, eventName, eventData) => {
      try {
        if (typeof eventName === 'symbol') return
        log.debug(debugName, type, eventName, eventData)
      }
      catch (err) {
        log.debug(`${err}`)
      }
    },
  },
})

export function itemsChanged(items: ZoteroItem[]): void {
  if (!items.length) return

  const collections: Set<number> = new Set
  const libraries: Set<number> = new Set

  for (const item of items) {
    libraries.add(item.libraryID)

    for (let collectionID of item.getCollections()) {
      if (collections.has(collectionID)) continue

      while (collectionID) {
        collections.add(collectionID)
        collectionID = Zotero.Collections.get(collectionID).parentID
      }
    }
  }

  if (collections.size) void Events.emit('collections-changed', [...collections])
  if (libraries.size) void Events.emit('libraries-changed', [...libraries])
}

const windowListener = {
  onOpenWindow: xulWindow => {
    const win = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow)
    win.addEventListener('load', function listener() { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      void Events.emit('window-loaded', { win, href: win.location.href })
    }, false)
  },
  // onCloseWindow: () => { },
  // onWindowTitleChange: _xulWindow => { },
}
Services.wm.addListener(windowListener)
