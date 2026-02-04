import Emittery from 'emittery'

import { log } from './logger'
import { getItemsAsync } from './get-items-async'

type ZoteroAction = 'modify' | 'add' | 'trash' | 'delete'

type IdleState = 'active' | 'idle'
export type Action = 'modify' | 'delete' | 'add'

type IntervalHandle = ReturnType<typeof setInterval>

type IdleObserver = {
  observe: (subject: string, topic: IdleState, data: any) => void
}
type IdleService = {
  idleTime: number
  addIdleObserver: (observer: IdleObserver, time: number) => void
  removeIdleObserver: (observer: IdleObserver, time: number) => void
}
type IdleTopic = 'auto-export' | 'cache-purge'

const idleService: IdleService = Components.classes['@mozilla.org/widget/useridleservice;1'].getService(Components.interfaces.nsIUserIdleService)

type Reason = 'key-refresh' | 'parent-modify' | 'parent-delete' | 'parent-add' | 'tagged'

class Emitter extends Emittery<{
  'collections-changed': number[]
  'collections-removed': number[]
  'export-progress': { pct: number; message: string; ae?: string }
  'items-changed': { items: Zotero.Item[]; action: Action; reason?: Reason }
  'libraries-changed': number[]
  'libraries-removed': number[]
  'preference-changed': string
  'window-loaded': { win: Window; href: string }
  idle: { state: IdleState; topic: IdleTopic }
  sync: boolean
}> {
  private listeners: any[] = []
  public idle: Partial<Record<IdleTopic, IdleState>> = {}
  public itemObserverDelay = 5
  public syncInProgress: boolean = Zotero?.Sync?.Runner?.syncInProgress ?? false

  public keymanagerUpdate: (action: ZoteroAction, ids: number[]) => void
  public cacheTouch: (ids: number[]) => Promise<void>

  public startup(): void {
    this.listeners.push(new WindowListener)
    this.listeners.push(new ItemListener)
    this.listeners.push(new TagListener)
    this.listeners.push(new CollectionListener)
    this.listeners.push(new MemberListener)
    this.listeners.push(new GroupListener)
    this.listeners.push(new SyncListener)
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

  public async itemsChanged(action, ids): Promise<void> {
    try {
      await this.cacheTouch(ids)
      this.keymanagerUpdate(action, ids)
    }
    catch (err) {
      log.error('cache update failed:', err)
    }
  }
}

export const Events = new Emitter({
  /*
  debug: {
    name: 'better-bibtex event',
    enabled: Zotero.Prefs.get('translators.better-bibtex.logEvents'),
    logger: (type, debugName, eventName, eventData) => {
      try {
        if (typeof eventName === 'symbol') return
      }
      catch (err) {
        log.error(`emit: ${err}`)
      }
    },
  },
  */
})

class SyncListener {
  private interval: IntervalHandle

  constructor() {
    this.interval = setInterval(() => {
      if (typeof Zotero.Sync?.Runner?.syncInProgress === 'boolean') {
        if (Events.syncInProgress !== Zotero.Sync.Runner.syncInProgress) {
          void Events.emit('sync', Zotero.Sync.Runner.syncInProgress)
          Events.syncInProgress = Zotero.Sync.Runner.syncInProgress
          log.info(`sync ${ Events.syncInProgress ? 'started' : 'stopped' }`)
        }
      }
    }, 1000)
  }

  unregister() {
    clearInterval(this.interval)
  }
}

class WindowListener {
  constructor() {
    Services.wm.addListener(this)
  }

  unregister() {
    Services.wm.removeListener(this)
  }

  onOpenWindow(xulWindow) {
    const win = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow)
    win.addEventListener('load', function load() {
      win.removeEventListener('load', load)
      void Events.emit('window-loaded', { win, href: win.location.href })
    }, false)
  }

  onCloseWindow(_window: nsIAppWindow): void {
    // pass
  }
}

class IdleListener {
  constructor(private topic: IdleTopic, private delay: number) {
    if (this.delay <= 0) throw new Error('idle listener: only positive times are allowed')
    if (Events.idle[topic]) throw new Error(`idle topic ${ topic } already registered`)

    Events.idle[topic] = (idleService.idleTime / 1000) > this.delay ? 'idle' : 'active'
    idleService.addIdleObserver(this, this.delay)
  }

  observe(_subject: string, topic: IdleState, _data: any) {
    if ((topic as any) === 'back') topic = 'active'
    Events.idle[this.topic] = topic
    void Events.emit('idle', { state: topic, topic: this.topic })
  }

  unregister() {
    delete Events.idle[this.topic]
    idleService.removeIdleObserver(this, this.delay)
  }
}

abstract class ZoteroListener {
  private id: string

  constructor(protected type) {
    this.id = Zotero.Notifier.registerObserver(this, [type], 'Better BibTeX', 1)
  }

  abstract notify(action: ZoteroAction, type: string, ids: string[] | number[], extraData?: Record<number, { libraryID?: number }>): Promise<void>

  public unregister() {
    Zotero.Notifier.unregisterObserver(this.id)
  }
}

/*
function types(items) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return items.reduce((acc, item) => ({...acc, [item.id]: Zotero.ItemTypes.getName(item.itemTypeID) }), {})
}
*/

class ItemListener extends ZoteroListener {
  constructor() {
    super('item')
  }

  public async notify(action: ZoteroAction, type: string, ids: number[], extraData?: Record<number, { libraryID?: number }>) {
    try {
      let load = false
      switch (action) {
        case 'trash':
          action = 'delete'
          break
        case 'modify':
        case 'add':
          load = true
          break
        case 'delete':
          break
        default:
          return
      }

      await Zotero.BetterBibTeX.ready

      // async is just a heap of fun. Who doesn't enjoy a good race condition?
      // https://github.com/retorquere/zotero-better-bibtex/issues/774
      // https://groups.google.com/forum/#!topic/zotero-dev/yGP4uJQCrMc
      await Zotero.Promise.delay(Events.itemObserverDelay)

      if (load) await getItemsAsync(ids)

      const touched = {
        collections: new Set<number>,
        libraries: new Set<number>,
      }

      if (action === 'delete' && extraData) {
        for (const ed of Object.values(extraData)) {
          if (typeof ed.libraryID === 'number') touched.libraries.add(ed.libraryID)
        }
      }

      const touch = item => {
        touched.libraries.add(typeof item.libraryID === 'number' ? item.libraryID : Zotero.Libraries.userLibraryID)

        for (let collectionID of item.getCollections()) {
          while (collectionID && !touched.collections.has(collectionID)) {
            touched.collections.add(collectionID)
            collectionID = Zotero.Collections.get(collectionID).parentID
          }
        }
      }

      const parentIDs: Set<number> = new Set
      // safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
      // https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0

      const items = Zotero.Items.get(ids).filter(item => {
        if (item.deleted) touch(item) // because trashing an item *does not* trigger collection-item?!?!

        if (action === 'delete') return false
        // check .deleted for #2401/#2676 -- we're getting *modify* (?!) notifications for trashed items which reinstates them into the BBT DB
        if (action === 'modify' && item.deleted) return false
        if (item.isFeedItem) return false

        touch(item)

        if (item.isAttachment() || item.isNote() || item.isAnnotation?.()) { // should I keep top-level notes/attachments for BBT-JSON?
          if (typeof item.parentID === 'number' && !ids.includes(item.parentID)) parentIDs.add(item.parentID)
          return false
        }

        return true
      })

      await Events.itemsChanged(action, ids)
      if (items.length) await Events.emit('items-changed', { items, action })
      if (parentIDs.size) {
        const parents = Zotero.Items.get([...parentIDs])
        for (const item of parents) {
          touch(item)
        }
        void Events.emit('items-changed', { items: parents, action: 'modify', reason: `parent-${ action }` })
      }

      Zotero.Promise.delay(Events.itemObserverDelay).then(() => {
        if (touched.collections.size) void Events.emit('collections-changed', [...touched.collections])
        if (touched.libraries.size) void Events.emit('libraries-changed', [...touched.libraries])
      })
    }
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(ids)}: ${err.message}`)
    }
  }
}

class TagListener extends ZoteroListener {
  constructor() {
    super('item-tag')
  }

  public async notify(action: string, type: string, pairs: string[]) {
    try {
      await Zotero.BetterBibTeX.ready

      const ids = [...new Set(pairs.map(pair => parseInt(pair.split('-')[0])))]
      await Events.itemsChanged('modify', ids)
      void Events.emit('items-changed', { items: Zotero.Items.get(ids), action: 'modify', reason: 'tagged' })
    }
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(pairs)}: ${err.message}`)
    }
  }
}

class CollectionListener extends ZoteroListener {
  constructor() {
    super('collection')
  }

  public async notify(action: string, type: string, ids: number[]) {
    try {
      await Zotero.BetterBibTeX.ready
      if ((action === 'delete') && ids.length) void Events.emit('collections-removed', ids)
    }
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(ids)}: ${err.message}`)
    }
  }
}

class MemberListener extends ZoteroListener {
  constructor() {
    super('collection-item')
  }

  public async notify(action: string, type: string, pairs: string[]) {
    try {
      await Zotero.BetterBibTeX.ready

      const changed: Set<number> = (new Set)

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
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(pairs)}: ${err.message}`)
    }
  }
}

class GroupListener extends ZoteroListener {
  constructor() {
    super('group')
  }

  public async notify(action: string, type: string, ids: number[]) {
    try {
      await Zotero.BetterBibTeX.ready
      if ((action === 'delete') && ids.length) void Events.emit('libraries-removed', ids)
    }
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(ids)}: ${err.message}`)
    }
  }
}
