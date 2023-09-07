/* eslint-disable prefer-rest-params */

import Emittery from 'emittery'

import { log } from './logger'
import { is7 } from './client'

type IdleState = 'back' | 'active' | 'idle'
type Action = 'modify' | 'delete' | 'add'

type IdleObserver = {
  observe: (subject: string, topic: IdleState, data: any) => void
}
type IdleService = {
  idleTime: number
  addIdleObserver: (observer: IdleObserver, time: number) => void
  removeIdleObserver: (observer: IdleObserver, time: number) => void
}
type IdleTopic = 'auto-export' | 'save-database'

class Emitter extends Emittery<{
  'collections-changed': number[]
  'collections-removed': number[]
  'export-progress': { pct: number, message: string, ae?: number }
  'items-changed-prep': { ids: number[], action: Action }
  'items-changed': { items: ZoteroItem[], action: Action, reason?: string }
  'libraries-changed': number[]
  'libraries-removed': number[]
  'loaded': undefined
  'preference-changed': string
  'window-loaded': { win: Window, href: string }
  'idle': { state: IdleState, topic: IdleTopic }
}> {

  public idleService: IdleService = Components.classes[`@mozilla.org/widget/${is7 ? 'user' : ''}idleservice;1`].getService(Components.interfaces[is7 ? 'nsIUserIdleService' : 'nsIIdleService'])
  private listeners: any[] = []

  public startup(): void {
    log.debug('events.startup:', typeof this.idleService, typeof this.idleService.addIdleObserver)
    this.listeners.push(new WindowListener)
    this.listeners.push(new ItemListener)
    this.listeners.push(new TagListener)
    this.listeners.push(new CollectionListener)
    this.listeners.push(new MemberListener)
    this.listeners.push(new GroupListener)
  }

  public addIdleListener(topic: IdleTopic, delay: number): void {
    this.listeners.push(new IdleListener(topic, delay))
  }

  public shutdown(): void {
    for (const listener of this.listeners) {
      listener.unregister()
    }

    this.clearListeners()
  }
}

export const Events = new Emitter({
  debug: {
    name: 'better-bibtex event',
    enabled: Zotero.Prefs.get('translators.better-bibtex.logEvents'),
    logger: (type, debugName, eventName, eventData) => {
      try {
        if (typeof eventName === 'symbol') return
        log.debug('emit:', debugName, type, eventName, eventData)
      }
      catch (err) {
        log.debug(`emit: ${err}`)
      }
    },
  },
})

class WindowListener {
  constructor() {
    Services.wm.addListener(this)
  }

  unregister() {
    Services.wm.removeListener(this)
  }

  onOpenWindow(xulWindow) {
    const win = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow)
    win.addEventListener('load', function load() { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      win.removeEventListener('load', load)
      void Events.emit('window-loaded', { win, href: win.location.href })
    }, false)
  }
}

class IdleListener {
  private delay: number

  constructor(private topic: IdleTopic, delay: number) {
    this.delay = Math.max(1, delay)
    Events.idleService.addIdleObserver(this, this.delay)
  }

  observe(_subject: string, topic: IdleState, _data: any) {
    log.debug(`idle: ${new Date}, ${this.topic} ${topic}`)
    void Events.emit('idle', { state: topic, topic: this.topic })
  }

  unregister() {
    Events.idleService.removeIdleObserver(this, this.delay)
  }
}

class ZoteroListener {
  private id: string

  constructor(type: string) {
    this.id = Zotero.Notifier.registerObserver(this, [type], 'Better BibTeX', 1)
  }
  public unregister() {
    Zotero.Notifier.unregisterObserver(this.id)
  }
}

class ItemListener extends ZoteroListener {
  constructor() {
    super('item')
  }

  public async notify(action: 'modify' | 'add' | 'trash' | 'delete', type: string, ids: number[], extraData?: Record<number, { libraryID?: number, bbtCitekeyUpdate: boolean }>) {
    await Zotero.BetterBibTeX.ready

    log.debug('itemlistener.emit:', { action, type, ids, extraData })
    // prevents update loop -- see KeyManager.init()
    if (action === 'modify') ids = ids.filter(id => !extraData?.[id]?.bbtCitekeyUpdate)
    if (!ids.length) return

    const parentIDs: number[] = []
    // safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
    // https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
    const items = action === 'delete' ? [] : Zotero.Items.get(ids).filter((item: ZoteroItem) => {
      // check .deleted for #2401 -- we're getting *updated* (?!) notifications for trashed items which reinstates them into the BBT DB
      if (action === 'modify' && item.deleted) return false
      if (item.isFeedItem) return false

      if (item.isAttachment() || item.isNote() || item.isAnnotation?.()) { // should I keep top-level notes/attachments for BBT-JSON?
        if (typeof item.parentID === 'number' && ids.includes(item.parentID)) parentIDs.push(item.parentID)
        return false
      }

      return true
    }) as ZoteroItem[]

    const event_action = action === 'trash' ? 'delete' : action
    await Events.emit('items-changed-prep', { ids, action: event_action })
    if (items.length && action !== 'delete') void Events.emit('items-changed', { items, action: event_action })

    let parents: ZoteroItem[] = []
    if (parentIDs.length) {
      parents = Zotero.Items.get(parents)
      void Events.emit('items-changed', { items: Zotero.Items.get(parents), action: 'modify', reason: `parent-${action}` })
    }

    const libraries: Set<number> = new Set(
      action === 'delete' && extraData
        ? Object.values(extraData).map(ed => ed.libraryID).filter(libraryID => typeof libraryID === 'number')
        : []
    )
    if (items.length + parents.length) {
      const collections: Set<number> = new Set

      for (const item of items.concat(parents)) {
        libraries.add(typeof item.libraryID === 'number' ? item.libraryID : Zotero.Libraries.userLibraryID)

        for (let collectionID of item.getCollections()) {
          if (collections.has(collectionID)) continue

          while (collectionID) {
            collections.add(collectionID)
            collectionID = Zotero.Collections.get(collectionID).parentID
          }
        }
      }

      log.debug('emit: items touched', [...libraries])

      if (collections.size) void Events.emit('collections-changed', [...collections])
    }
    if (libraries.size) void Events.emit('libraries-changed', [...libraries])
  }
}

class TagListener extends ZoteroListener {
  constructor() {
    super('item-tag')
  }

  public async notify(action: string, type: string, pairs: string[]) {
    await Zotero.BetterBibTeX.ready

    const ids = [...new Set(pairs.map(pair => parseInt(pair.split('-')[0])))]
    await Events.emit('items-changed-prep', { ids, action: 'modify' })
    void Events.emit('items-changed', { items: Zotero.Items.get(ids), action: 'modify', reason: 'tagged' })
  }
}

class CollectionListener extends ZoteroListener {
  constructor() {
    super('collection')
  }

  public async notify(action: string, type: string, ids: number[]) {
    await Zotero.BetterBibTeX.ready
    if ((action === 'delete') && ids.length) void Events.emit('collections-removed', ids)
  }
}

class MemberListener extends ZoteroListener {
  constructor() {
    super('collection-item')
  }

  public async notify(action: string, type: string, pairs: string[]) {
    await Zotero.BetterBibTeX.ready

    const changed: Set<number> = new Set()

    for (const pair of pairs) {
      let id = parseInt(pair.split('-')[0])
      if (changed.has(id)) continue
      while (id) {
        changed.add(id)
        id = Zotero.Collections.get(id).parentID
      }
    }

    if (changed.size) void Events.emit('collections-changed', Array.from(changed))
  }
}

class GroupListener extends ZoteroListener {
  constructor() {
    super('group')
  }

  public async notify(action: string, type: string, ids: number[]) {
    await Zotero.BetterBibTeX.ready
    if ((action === 'delete') && ids.length) void Events.emit('libraries-removed', ids)
  }
}
