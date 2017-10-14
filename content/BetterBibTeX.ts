declare const window: any
declare const document: any
declare const Zotero: any
declare const Components: any
declare const AddonManager: any

Components.utils.import('resource://gre/modules/AddonManager.jsm')

const debug = require('./debug.ts')
const flash = require('./flash.ts')
const edtf = require('edtf')
const events = require('./events.ts')
const zoteroConfig = require('./zotero-config.ts')

debug('Loading Better BibTeX')

const prefs = require('./prefs.ts') // needs to be here early, initializes the prefs observer

// TODO: remove after beta
Zotero.Prefs.set('debug.store', true)
Zotero.Debug.setStore(true)

const translators = require('./translators.ts')
const DB = require('./db/main.ts')
const CACHE = require('./db/cache.ts')
const serializer = require('./serializer.ts')
const journalAbbrev = require('./journal-abbrev.ts')
const autoExport = require('./auto-export.ts')
const keyManager = require('./keymanager.ts')

const $patch$ = require('./monkey-patch.ts')

const ready = Zotero.Promise.defer()

/*
  UNINSTALL
*/

AddonManager.addAddonListener({
  onUninstalling(addon, needsRestart) {
    if (addon.id !== 'better-bibtex@iris-advies.com') return
    debug('uninstall')

    const quickCopy = Zotero.Prefs.get('export.quickCopy.setting')
    for (const [label, metadata] of Object.entries(translators.byName)) {
      if (quickCopy === `export=${metadata.translatorID}`) Zotero.Prefs.clear('export.quickCopy.setting')

      try {
        translators.uninstall(label, metadata.translatorID)
      } catch (error) {}
    }

    Zotero.BetterBibTeX.uninstalled = true

  },

  onDisabling(addon, needsRestart) { this.onUninstalling(addon, needsRestart) },

  onOperationCancelled(addon, needsRestart) {
    if (addon.id !== 'better-bibtex@iris-advies.com') return

    // tslint:disable-next-line:no-bitwise
    if (addon.pendingOperations & (AddonManager.PENDING_UNINSTALL | AddonManager.PENDING_DISABLE)) return

    // tslint:disable-next-line:no-unused-variable
    for (const [id, header] of Object.entries(translators.byId)) {
      try {
        translators.install(header)
      } catch (error) {}
    }

    delete Zotero.BetterBibTeX.uninstalled

  },
})

/*
  MONKEY PATCHES
*/

// Monkey patch because of https://groups.google.com/forum/#!topic/zotero-dev/zy2fSO1b0aQ
let pane = Zotero.getActiveZoteroPane() // can Zotero 5 have more than one pane at all?
$patch$(pane, 'serializePersist', original => function() {
  let persisted
  original.apply(this, arguments)

  if (Zotero.BetterBibTeX.uninstalled && (persisted = Zotero.Prefs.get('pane.persist'))) {
    persisted = JSON.parse(persisted)
    delete persisted['zotero-items-column-citekey']
    Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))
  }
})

// without this the display of the citekey in the item pane flames out
$patch$(Zotero.ItemFields, 'isFieldOfBase', original => function(field, baseField) {
  if (['citekey', 'itemID'].includes(field)) return false
  return original.apply(this, arguments)
})

// because the zotero item editor does not check whether a textbox is read-only. *sigh*
$patch$(Zotero.Item.prototype, 'setField', original => function(field, value, loadIn) {
  if (!['citekey', 'itemID'].includes(field)) return original.apply(this, arguments)
  return false
})

// To show the citekey in the reference list
$patch$(Zotero.Item.prototype, 'getField', original => function(field, unformatted, includeBaseMapped) {
  if (!['citekey', 'itemID'].includes(field)) return original.apply(this, arguments)

  switch (field) {
    case 'citekey':
      const citekey = keyManager.get(this.id)
      if (citekey.retry) return '\uFFFD'
      return citekey.citekey + (!citekey.citekey || citekey.pinned ? '' : ' *')
    case 'itemID':
      return `${this.id}`
    default:
      return field
  }
})

$patch$(Zotero.ItemTreeView.prototype, 'getCellText', original => function(row, column) {
  if (!['zotero-items-column-citekey'].includes(column.id)) return original.apply(this, arguments)

  const obj = this.getRow(row)
  const itemID = obj.id
  const citekey = keyManager.get(itemID)

  if (citekey.retry) {
    debug('Zotero.ItemTreeView::getCellText: could not get key for', itemID, ', waiting for BBT.ready...')
    ready.promise.then(() => {
      debug('Zotero.ItemTreeView::getCellText: deferred update for', itemID)

      this._treebox.invalidateCell(row, column)
    })
  }

  return citekey.citekey + (!citekey.citekey || citekey.pinned ? '' : ' *')
})

/* bugger this, I don't want megabytes of shared code in the translators */
const parseDate = require('./dateparser.ts')
const citeProc = require('./citeproc.ts')
const titleCase = require('./title-case.ts')
Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  parseDate(sandbox, date) { return parseDate(date) },
  isEDTF(sandbox, date) {
    try {
      edtf.parse(date)
      return true
    } catch (error) {
      return false
    }
  },
  parseParticles(sandbox, name) { return citeProc.parseParticles(name) /* && citeProc.parseParticles(name) */ },
  titleCase(sandbox, text) { return titleCase(text) },
  simplifyFields(sandbox, item) { return serializer.simplify(item) },
  scrubFields(sandbox, item) { return serializer.scrub(item) },
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  version(sandbox) { return { Zotero: zoteroConfig.Zotero, BetterBibTeX: require('../gen/version.js') } },

  cacheFetch(sandbox, itemID, options) {
    const collection = CACHE.getCollection(sandbox.translator[0].label)
    if (!collection) {
      debug('cacheFetch:', sandbox.translator[0].label, 'not found')
      return false
    }

    const cached = collection.findOne({ itemID, exportNotes: !!options.exportNotes, useJournalAbbreviation: !!options.useJournalAbbreviation })
    if (!cached) {
      debug('cacheFetch: cache miss for', sandbox.translator[0].label)
      return false
    }

    collection.update(cached) // touches the cache object
    return cached
  },

  cacheStore(sandbox, itemID, options, reference, metadata) {
    if (!metadata) metadata = {}

    const collection = CACHE.getCollection(sandbox.translator[0].label)
    if (!collection) return false

    const cached = collection.findOne({ itemID, exportNotes: !!options.exportNotes, useJournalAbbreviation: !!options.useJournalAbbreviation })
    if (cached) {
      cached.reference = reference
      cached.metadata = metadata
      collection.update(cached)
    } else {
      collection.insert({
        itemID,
        exportNotes: options.exportNotes,
        useJournalAbbreviation: options.useJournalAbbreviation,
        reference,
        metadata,
      })
    }

    return true
  },
}

Zotero.Translate.Import.prototype.Sandbox.BetterBibTeX = {
  simplifyFields(sandbox, item) { return serializer.simplify(item) },
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  scrubFields(sandbox, item) { return serializer.scrub(item) },
}

$patch$(Zotero.Utilities.Internal, 'itemToExportFormat', original => function(zoteroItem, legacy, skipChildItems) {
  try {
    return serializer.fetch(zoteroItem, legacy, skipChildItems) || serializer.store(zoteroItem, original.apply(this, arguments), legacy, skipChildItems)
  } catch (err) { // fallback for safety for non-BBT
    debug('Zotero.Utilities.Internal.itemToExportFormat', err)
  }

  return original.apply(this, arguments)
})

$patch$(Zotero.Translate.Export.prototype, 'translate', original => function() {
  try {
    debug(`Zotero.Translate.Export::translate: ${this._export ? Object.keys(this._export) : 'no @_export'}`, this._displayOptions)

    /* requested translator */
    let translatorID = this.translator ? this.translator[0] : undefined
    if (translatorID.translatorID) translatorID = translatorID.translatorID
    debug('Zotero.Translate.Export::translate: ', translatorID)

    /* regular behavior for non-BBT translators, or if translating to string */
    if (!translatorID || !this._displayOptions || !translators.byId[translatorID] || !this.location || !this.location.path) return

    if (this._displayOptions.exportFileData) { // export directory selected
      this._displayOptions.exportPath = this.location.path
    } else {
      this._displayOptions.exportPath = this.location.parent.path
    }
    this._displayOptions.exportFilename = this.location.leafName

    if (!this._displayOptions || !this._displayOptions['Keep updated']) return

    debug('Keep updated set -- trying to register auto-export')

    if (this._displayOptions.exportFileData) {
      flash('Auto-export not registered', 'Auto-export is not supported when file data is exported')
      return
    }

    let id, name
    switch ((this._export || {}).type) {
      case 'library':
        name = this._export.id === Zotero.Libraries.userLibraryID ? Zotero.Libraries.get(this._export.id).name : `library ${Zotero.Libraries.get(this._export.id).name}`
        id = this._export.id
        break

      case 'collection':
        name = this._export.collection.name
        id = this._export.collection.id
        break

      default:
        flash('Auto-export not registered', 'Auto-export only supported for groups, collections and libraries')
        return
    }

    autoExport.add({
      type: this._export.type,
      id,
      path: this.location.path,
      status: 'done',
      translatorID,
      exportNotes: this._displayOptions.exportNotes,
      useJournalAbbreviation: this._displayOptions.useJournalAbbreviation,
    })
  } catch (err) {
    debug('Zotero.Translate.Export::translate error:', err)
  }

  return original.apply(this, arguments)
})

/*
 * EVENTS
*/

Zotero.Notifier.registerObserver({
  notify(action, type, ids, extraData) {
    debug('item.notify', {action, type, ids, extraData})

    // prevents update loop -- see keyManager.init()
    if (action === 'modify') ids = ids.filter(id => !extraData[id] || !extraData[id].bbtCitekeyUpdate)

    // not needed as the parents will be signaled themselves
    // parents = (item.parentID for item in items when item.parentID)
    // CACHE.remove(parents)

    CACHE.remove(ids)

    // safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
    // https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
    const items = action === 'delete' ? [] : Zotero.Items.get(ids).filter(item => !(item.isNote() || item.isAttachment()))

    switch (action) {
      case 'delete':
      case 'trash':
        debug(`event.${type}.${action}`, {ids, extraData})
        keyManager.remove(ids)
        events.emit('items-removed', ids)
        break

      case 'add':
      case 'modify':
        for (const item of items) {
          keyManager.update(item)
        }

        events.emit('items-changed', ids)
        break

      default:
        debug('item.notify: unhandled', {action, type, ids, extraData})
        return
    }

    const changed = {
      collections: new Set(),
      libraries: new Set(),
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

    if (changed.collections.size) events.emit('collections-changed', Array.from(changed.collections))
    if (changed.libraries.size) events.emit('libraries-changed', Array.from(changed.libraries))

  },
}, ['item'], 'BetterBibTeX', 1)

Zotero.Notifier.registerObserver({
  notify(event, type, ids, extraData) {
    if ((event === 'delete') && ids.length) events.emit('collections-removed', ids)
  },
}, ['collection'], 'BetterBibTeX', 1)

Zotero.Notifier.registerObserver({
  notify(event, type, ids, extraData) {
    if ((event === 'delete') && ids.length) events.emit('libraries-removed', ids)
  },
}, ['group'], 'BetterBibTeX', 1)

Zotero.Notifier.registerObserver({
  notify(event, type, collection_items) {
    const changed = new Set()

    for (const collection_item of collection_items) {
      let collectionID = parseInt(collection_item.split('-')[0])
      if (changed.has(collectionID)) continue
      while (collectionID) {
        changed.add(collectionID)
        collectionID = Zotero.Collections.get(collectionID).parentID
      }
    }

    if (changed.size) events.emit('collections-changed', Array.from(changed))

  },
}, ['collection-item'], 'BetterBibTeX', 1)

/*
  INIT
*/

function errorReport(includeReferences) {
  debug('ErrorReport::start', includeReferences)

  let items = null

  pane = Zotero.getActiveZoteroPane()

  switch (pane && includeReferences) {
    case 'collection':
    case 'library':
      items = { collection: pane.getSelectedCollection() }
      if (!items.collection) items = { library: pane.getSelectedLibraryID() }
      break

    case 'items':
      try {
        items = { items: pane.getSelectedItems() }
      } catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
        debug('Could not get selected items:', err)
        items = {}
      }

      if (!items.items || !items.items.length) items = null
      break
  }

  const params = {wrappedJSObject: { items }}

  debug('ErrorReport::start popup', params)
  const ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
  ww.openWindow(null, 'chrome://zotero-better-bibtex/content/ErrorReport.xul', 'better-bibtex-error-report', 'chrome,centerscreen,modal', params)
  debug('ErrorReport::start done')

}

debug('Loading Better BibTeX: setup done')

class Lock {
  private mark: {ts: number, msg?: string }

  constructor() {
    this.mark = { ts: (new Date()).valueOf() }
  }

  public async lock(msg){
    await Zotero.uiReadyPromise

    if (Zotero.locked) await Zotero.unlockPromise

    this.update(msg || 'Initializing')

    this.toggle(true)

  }

  private bench(msg) {
    const ts = (new Date()).valueOf()
    if (this.mark.msg) debug('Lock:', this.mark.msg, 'took', (ts - this.mark.ts) / 1000.0, 's') // tslint:disable-line:no-magic-numbers
    this.mark = { ts, msg }
  }

  public update(msg) {
    this.bench(msg)
    Zotero.showZoteroPaneProgressMeter(`Better BibTeX: ${msg}...`)
  }

  public unlock() {
    this.bench('')

    Zotero.hideZoteroPaneOverlays()
    this.toggle(false)

  }

  private toggle(locked) {
    for (const id of ['menu_import', 'menu_importFromClipboard', 'menu_newItem', 'menu_newNote', 'menu_newCollection', 'menu_exportLibrary']) {
      document.getElementById(id).hidden = locked
    }

    for (const id of ['zotero-collections-tree']) {
      document.getElementById(id).disabled = locked
    }
  }
}

async function load() {
  debug('Loading Better BibTeX: starting...')

  // oh FFS -- datadir is async now

  const lock = new Lock()
  await lock.lock('Waiting for Zotero database')

  CACHE.init()

  // Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
  await Zotero.Schema.schemaUpdatePromise

  lock.update('Loading citation keys')
  await DB.init()

  lock.update('Starting auto-export')
  autoExport.init()

  lock.update('Starting key manager')
  await keyManager.init() // inits the key cache by scanning the DB

  lock.update('Starting serialization cache')
  await serializer.init() // creates simplify et al

  lock.update('Loading journal abbreviator')
  journalAbbrev.init()

  lock.update('Installing bundled translators')
  await translators.init()

  // should be safe to start tests at this point. I hate async.

  ready.resolve(true)

  lock.unlock()
}

// actual start
window.addEventListener('load', load, false)

export = {
  keyManager,
  errorReport,
  ready: ready.promise,
  TestSupport: prefs.get('testing') ? require('./test/support.ts') : undefined,
}
