import Emittery from 'emittery'

import { log } from './logger'
import { getItemsAsync } from './get-items-async'

type ZoteroAction = 'modify' | 'add' | 'trash' | 'delete'
type ZoteroType = 'item' | 'item-tag' | 'collection' | 'collection-item' | 'group'

type IdleState = 'active' | 'idle'
export type SyncState = 'syncing' | 'idle'
export type Action = 'modify' | 'delete' | 'add'

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

export const REASON_KEY_SAVE = 'key-save' as const
type Reason = typeof REASON_KEY_SAVE | 'key-refresh' | 'parent-modify' | 'parent-delete' | 'parent-add' | 'tagged'

const logEvents = Zotero.Prefs.get('extensions.zotero.translators.better-bibtex.logEvents')

function syncInProgress(): boolean {
  return !!(Zotero.Sync?.Runner?.syncInProgress || Events.syncing === 'syncing')
}

type EventMap = {
  'collections-changed': number[]
  'collections-removed': number[]
  'export-progress': { pct: number; message: string; ae?: string }
  'cache-touch': { itemIDs: number[] }
  'items-changed': { items: Zotero.Item[]; action: Action; reason?: Reason }
  'items-removed': { itemIDs: number[]; reason?: Reason }
  'libraries-changed': number[]
  'libraries-removed': number[]
  'preference-changed': string
  'window-loaded': { win: Window; href: string }
  idle: { state: IdleState; topic: IdleTopic }
  sync: { state: SyncState }
}

class Emitter extends Emittery<EventMap> {
  private listeners: any[] = []
  public idle: Partial<Record<IdleTopic, IdleState>> = {}
  public syncing: SyncState = 'idle'
  public itemObserverDelay = 5

  public startup(): void {
    this.addListener(WindowListener)
    this.addListener(ItemListener)
    this.addListener(TagListener)
    this.addListener(CollectionListener)
    this.addListener(MemberListener)
    this.addListener(GroupListener)
    this.addListener(SyncListener)
  }

  private addListener(listener) {
    this.listeners.push(listener)
    listener.startup()
  }

  override async emit<Name extends keyof EventMap>(eventName: Name, data?: EventMap[Name]): Promise<void> {
    switch (eventName) {
      case 'items-changed': {
        const d = data as EventMap['items-changed']
        if (d?.items) await super.emit('cache-touch', { itemIDs: d.items.map(item => item.id) })
        break
      }
      case 'items-removed': {
        const d = data as EventMap['items-removed']
        if (d?.itemIDs) await super.emit('cache-touch', { itemIDs: d.itemIDs })
        break
      }
    }

    return super.emit(eventName, data as any)
  }

  public addIdleListener(topic: IdleTopic, delay: number): void {
    this.listeners.push(new IdleListener(topic, delay))
  }

  public shutdown(): void {
    for (const listener of this.listeners) {
      listener.unregister()
    }

    this.listeners = []
    this.clearListeners()
  }
}

export const Events = new Emitter(logEvents ? { // eslint-disable-line @stylistic/multiline-ternary
  debug: {
    name: 'better-bibtex event',
    enabled: true,
    logger: (type, debugName, eventName, eventData) => {
      try {
        if (typeof eventName === 'symbol') return
        log.info('emit: event:', { type, debugName, eventName, eventData })
      }
      catch (err) {
        log.error(`emit: ${err}`)
      }
    },
  },
} : {})

const WindowListener = new class $WindowListener {
  public startup() {
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

const SyncListener = new class $SyncListener {
  private id: string | null = null

  public startup() {
    if (this.id) return
    this.id = Zotero.Notifier.registerObserver(this, ['sync'], 'Better BibTeX', 1)
  }

  notify(action: string, _type: string, _ids: string[], _extraData?: any) {
    let state: SyncState
    switch (action) {
      case 'start':
        state = 'syncing'
        break
      case 'finish':
        state = 'idle'
        break
      default:
        return
    }

    Events.syncing = state

    // Keep notifier callbacks non-blocking: sync startup awaits observers.
    void Zotero.Promise.delay(0).then(async () => {
      await Events.emit('sync', { state })

      if (state === 'idle') {
        await ItemListener.flushBuffered()
        await TagListener.flushBuffered()
        CollectionListener.flushBuffered()
        await MemberListener.flushBuffered()
        GroupListener.flushBuffered()
      }
    })
  }

  unregister() {
    if (!this.id) return
    Zotero.Notifier.unregisterObserver(this.id)
    this.id = null
  }
}

type ExtraData = {
  [K in string]: K extends typeof REASON_KEY_SAVE
    ? boolean
    : { libraryID?: number }
}

abstract class ZoteroListener {
  private id: string | null = null
  protected abstract type: ZoteroType

  public startup() {
    if (this.id) return
    this.id = Zotero.Notifier.registerObserver(this, [this.type], 'Better BibTeX', 1)
  }

  abstract notify(action: ZoteroAction, type: string, ids: string[] | number[], extraData?: ExtraData): Promise<void>

  public unregister() {
    if (!this.id) return
    Zotero.Notifier.unregisterObserver(this.id)
    this.id = null
  }
}

/*
function types(items) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return items.reduce((acc, item) => ({...acc, [item.id]: Zotero.ItemTypes.getName(item.itemTypeID) }), {})
}
*/

const ItemListener = new class $ItemListener extends ZoteroListener {
  protected type: ZoteroListener['type'] = 'item'
  private buffered = new Map<number, { action: ZoteroAction; keySave?: boolean; libraryID?: number }>

  public async flushBuffered(): Promise<void> {
    if (syncInProgress() || this.buffered.size === 0) return

    const buffered = this.buffered
    this.buffered = new Map

    const grouped: Record<string, { ids: number[]; extraData: ExtraData }> = {}
    for (const [id, event] of buffered) {
      const key = `${ event.action }:${ event.keySave ? '1' : '0' }`
      grouped[key] = grouped[key] || { ids: [], extraData: {} }
      grouped[key].ids.push(id)
      grouped[key].extraData[`${ id }`] = {
        ...(typeof event.libraryID === 'number' ? { libraryID: event.libraryID } : {}),
        ...(event.keySave ? { [REASON_KEY_SAVE]: true } : {}),
      }
    }

    for (const [key, group] of Object.entries(grouped)) {
      const [action] = key.split(':')
      await this.process(action as ZoteroAction, 'item', group.ids, group.extraData)
    }
  }

  private async process(action: ZoteroAction, type: string, ids: number[], extraData?: ExtraData) {
    if (logEvents) log.info('item event:', { action, ids, extraData })
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

      if (action === 'delete') {
        await Events.emit('items-removed', { itemIDs: ids })
        if (extraData && typeof extraData === 'object') {
          for (const { libraryID } of Object.values(extraData)) {
            if (typeof libraryID === 'number') touched.libraries.add(libraryID)
          }
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

      await Events.emit('cache-touch', { itemIDs: ids })
      if (items.length) {
        await Events.emit('items-changed', { items, action, reason: extraData?.[REASON_KEY_SAVE] ? REASON_KEY_SAVE : undefined })
      }

      if (parentIDs.size) {
        const parents = Zotero.Items.get([...parentIDs])
        for (const item of parents) {
          touch(item)
        }
        await Events.emit('cache-touch', { itemIDs: parents.map(p => p.id) })
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

  public async notify(action: ZoteroAction, type: string, ids: number[], extraData?: ExtraData) {
    if (syncInProgress()) {
      for (const id of ids) {
        const event = {
          action,
          keySave: !!extraData?.[REASON_KEY_SAVE],
          libraryID: typeof extraData?.[`${id}`]?.libraryID === 'number' ? extraData[`${id}`].libraryID : undefined,
        }
        this.buffered.set(id, event)
      }
      return
    }

    await this.process(action, type, ids, extraData)
  }
}

const TagListener = new class $TagListener extends ZoteroListener {
  protected type: ZoteroListener['type'] = 'item-tag'
  private buffered = new Set<number>

  public async flushBuffered(): Promise<void> {
    if (syncInProgress() || this.buffered.size === 0) return

    const ids = [...this.buffered]
    this.buffered.clear()

    await Zotero.BetterBibTeX.ready
    void Events.emit('items-changed', { items: Zotero.Items.get(ids), action: 'modify', reason: 'tagged' })
  }

  public async notify(action: string, type: string, pairs: string[]) {
    try {
      const ids = [...new Set(pairs.map(pair => parseInt(pair.split('-')[0])))]
      if (syncInProgress()) {
        for (const id of ids) this.buffered.add(id)
        return
      }

      await Zotero.BetterBibTeX.ready

      void Events.emit('items-changed', { items: Zotero.Items.get(ids), action: 'modify', reason: 'tagged' })
    }
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(pairs)}: ${err.message}`)
    }
  }
}

const CollectionListener = new class $CollectionListener extends ZoteroListener {
  protected type: ZoteroListener['type'] = 'collection'
  private buffered = new Map<number, string>

  public flushBuffered(): void {
    if (syncInProgress() || this.buffered.size === 0) return

    const buffered = this.buffered
    this.buffered = new Map

    const removed = [...buffered.entries()].filter(([_id, action]) => action === 'delete').map(([id, _action]) => id)
    if (removed.length) void Events.emit('collections-removed', removed)
  }

  public async notify(action: string, type: string, ids: number[]) {
    try {
      if (syncInProgress()) {
        for (const id of ids) this.buffered.set(id, action)
        return
      }

      await Zotero.BetterBibTeX.ready
      if ((action === 'delete') && ids.length) void Events.emit('collections-removed', ids)
    }
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(ids)}: ${err.message}`)
    }
  }
}

const MemberListener = new class $MemberListener extends ZoteroListener {
  protected type: ZoteroListener['type'] = 'collection-item'
  private buffered = new Map<number, string>

  public async flushBuffered(): Promise<void> {
    if (syncInProgress() || this.buffered.size === 0) return

    const buffered = [...this.buffered.entries()]
    this.buffered.clear()

    await Zotero.BetterBibTeX.ready

    const changed: Set<number> = new Set
    for (let [id, action] of buffered) {
      if (action === 'delete') continue
      while (id) {
        changed.add(id)
        id = Zotero.Collections.get(id).parentID
      }
    }

    if (changed.size) void Events.emit('collections-changed', Array.from(changed))
  }

  public async notify(action: string, type: string, pairs: string[]) {
    try {
      if (syncInProgress()) {
        for (const pair of pairs) {
          const id = parseInt(pair.split('-')[0])
          if (!Number.isNaN(id)) this.buffered.set(id, action)
        }
        return
      }

      await Zotero.BetterBibTeX.ready

      const changed: Set<number> = new Set

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

const GroupListener = new class $GroupListener extends ZoteroListener {
  protected type: ZoteroListener['type'] = 'group'
  private buffered = new Map<number, string>

  public flushBuffered(): void {
    if (syncInProgress() || this.buffered.size === 0) return

    const buffered = this.buffered
    this.buffered = new Map

    const removed = [...buffered.entries()].filter(([_id, action]) => action === 'delete').map(([id, _action]) => id)
    if (removed.length) void Events.emit('libraries-removed', removed)
  }

  public async notify(action: string, type: string, ids: number[]) {
    try {
      if (syncInProgress()) {
        for (const id of ids) this.buffered.set(id, action)
        return
      }

      await Zotero.BetterBibTeX.ready
      if ((action === 'delete') && ids.length) void Events.emit('libraries-removed', ids)
    }
    catch (err) {
      log.error(`error in ${type} ${action} handler for ${JSON.stringify(ids)}: ${err.message}`)
    }
  }
}
