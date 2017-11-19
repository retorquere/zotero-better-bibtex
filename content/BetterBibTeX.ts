declare const window: any
declare const document: any
declare const Components: any
declare const Zotero: any
declare const AddonManager: any

require('./prefs.ts') // needs to be here early, initializes the prefs observer
require('./pull-export.ts') // just require, initializes the pull-export end points
require('./scholmd.ts') // just require, initializes the scholmd end point

Components.utils.import('resource://gre/modules/AddonManager.jsm')

import debug = require('./debug.ts')
import flash = require('./flash.ts')
import Events = require('./events.ts')
import ZoteroConfig = require('./zotero-config.ts')

debug('Loading Better BibTeX')

import Translators = require('./translators.ts')
import DB = require('./db/main.ts')
import Cache = require('./db/cache.ts')
import Serializer = require('./serializer.ts')
import JournalAbbrev = require('./journal-abbrev.ts')
import AutoExport = require('./auto-export.ts')
import KeyManager = require('./keymanager.ts')
import AUXScanner = require('./aux-scanner.ts')
import format = require('string-template')

import $patch$ = require('./monkey-patch.ts')

const bbtReady = Zotero.Promise.defer()
const pane = Zotero.getActiveZoteroPane() // can Zotero 5 have more than one pane at all?

/*
  UNINSTALL
*/

AddonManager.addAddonListener({
  onUninstalling(addon, needsRestart) {
    if (addon.id !== 'better-bibtex@iris-advies.com') return
    debug('uninstall')

    const quickCopy = Zotero.Prefs.get('export.quickCopy.setting')
    for (const [label, metadata] of Object.entries(Translators.byName)) {
      if (quickCopy === `export=${metadata.translatorID}`) Zotero.Prefs.clear('export.quickCopy.setting')

      try {
        Translators.uninstall(label, metadata.translatorID)
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
    for (const [id, header] of Object.entries(Translators.byId)) {
      try {
        Translators.install(header)
      } catch (error) {}
    }

    delete Zotero.BetterBibTeX.uninstalled
  },
})

/*
  MONKEY PATCHES
*/

// https://github.com/retorquere/zotero-better-bibtex/issues/769
$patch$(Zotero.Items, 'parseLibraryKeyHash', original => function parseLibraryKeyHash(id) {
  try {
    id = decodeURIComponent(id)
    const m = id.match(/^bbt:(?:{([0-9]+)})?(.+)/)
    debug('parseLibraryKeyHash:', id, m)
    if (m) {
      const [ , lib, citekey ] = m
      const libraryID = (lib ? parseInt(lib) : 0) || Zotero.Libraries.userLibraryID
      const item = KeyManager.keys.findOne({ libraryID, citekey})
      debug('parseLibraryKeyHash:', libraryID, citekey, item)
      if (item) return { libraryID, key: item.itemKey }
    }
  } catch (err) {
    debug('parseLibraryKeyHash:', id, err)
  }

  return original.apply(this, arguments)
})

/*
// monkey-patch Zotero.Search::search to allow searching for citekey
$patch$(Zotero.Search.prototype, 'search', original => Zotero.Promise.coroutine(function *(asTempTable) {
  const searchText = Object.values(this._conditions).filter(c => c && c.condition === 'field').map(c => c.value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))
  if (!searchText.length) return yield original.apply(this, arguments)

  let ids = yield original.call(this, false) || []

  debug('search: looking for', searchText, 'from', this._conditions, 'to add to', ids)

  ids = Array.from(new Set(ids.concat(KeyManager.keys.find({ citekey: { $regex: new RegExp(searchText.join('|'), 'i') } }).map(item => item.itemID))))

  if (!ids.length) return false
  if (asTempTable) return yield Zotero.Search.idsToTempTable(ids)
  return ids
}))
*/

// Monkey patch because of https://groups.google.com/forum/#!topic/zotero-dev/zy2fSO1b0aQ
$patch$(pane, 'serializePersist', original => function() {
  original.apply(this, arguments)

  let persisted
  if (Zotero.BetterBibTeX.uninstalled && (persisted = Zotero.Prefs.get('pane.persist'))) {
    persisted = JSON.parse(persisted)
    delete persisted['zotero-items-column-citekey']
    Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))
  }
})

// otherwise the display of the citekey in the item pane flames out
$patch$(Zotero.ItemFields, 'isFieldOfBase', original => function(field, baseField) {
  if (['citekey', 'itemID'].includes(field)) return false
  return original.apply(this, arguments)
})

// because the zotero item editor does not check whether a textbox is read-only. *sigh*
$patch$(Zotero.Item.prototype, 'setField', original => function(field, value, loadIn) {
  if (['citekey', 'itemID'].includes(field)) return false
  return original.apply(this, arguments)
})

// To show the citekey in the reference list
$patch$(Zotero.Item.prototype, 'getField', original => function(field, unformatted, includeBaseMapped) {
  switch (field) {
    case 'citekey':
      const citekey = KeyManager.get(this.id)
      if (citekey.retry) return '\uFFFD'
      return citekey.citekey + (!citekey.citekey || citekey.pinned ? '' : ' *')

    case 'itemID':
      return `${this.id}`

    default:
      return original.apply(this, arguments)
  }
})
$patch$(Zotero.ItemTreeView.prototype, 'getCellText', original => function(row, column) {
  if (column.id !== 'zotero-items-column-citekey') return original.apply(this, arguments)

  const obj = this.getRow(row)
  const itemID = obj.id
  const citekey = KeyManager.get(itemID)

  if (citekey.retry) {
    debug('Zotero.ItemTreeView::getCellText: could not get key for', itemID, ', waiting for BBT.ready...')
    bbtReady.promise.then(() => {
      debug('Zotero.ItemTreeView::getCellText: deferred update for', itemID)

      this._treebox.invalidateCell(row, column)
    })
  }

  return citekey.citekey + (!citekey.citekey || citekey.pinned ? '' : ' *')
})

import CAYW = require('./cayw.ts')
$patch$(Zotero.Integration, 'getApplication', original => function(agent, command, docId) {
  if (agent === 'BetterBibTeX') return CAYW
  return original.apply(this, arguments)
})

/* bugger this, I don't want megabytes of shared code in the translators */
import DateParser = require('./dateparser.ts')
import CiteProc = require('./citeproc.ts')
import titleCase = require('./title-case.ts')
Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  qrCheck(sandbox, value, test, params = null) { return require('./qr-check.ts')(value, test, params) },

  parseDate(sandbox, date) { return DateParser.parse(date) },
  isEDTF(sandbox, date, minuteLevelPrecision = false) { return DateParser.isEDTF(date, minuteLevelPrecision) },

  parseParticles(sandbox, name) { return CiteProc.parseParticles(name) },
  titleCase(sandbox, text) { return titleCase(text) },
  simplifyFields(sandbox, item) { return Serializer.simplify(item) },
  scrubFields(sandbox, item) { return Serializer.scrub(item) },
  extractFields(sandbox, item) { return require('./var-extract.ts')(item) },
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  version(sandbox) { return { Zotero: ZoteroConfig.Zotero, BetterBibTeX: require('../gen/version.js') } },

  cacheFetch(sandbox, itemID, options) {
    const collection = Cache.getCollection(sandbox.translator[0].label)
    if (!collection) {
      debug('cacheFetch:', sandbox.translator[0].label, 'not found')
      return false
    }

    const cached = collection.findOne({ itemID, exportNotes: !!options.exportNotes, useJournalAbbreviation: !!options.useJournalAbbreviation })
    if (!cached) {
      debug('cacheFetch: cache miss for', sandbox.translator[0].label)
      return false
    }

    collection.update(cached) // touches the cache object so it isn't reaped too early

    return cached
  },

  cacheStore(sandbox, itemID, options, reference, metadata) {
    if (!metadata) metadata = {}

    const collection = Cache.getCollection(sandbox.translator[0].label)
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
  simplifyFields(sandbox, item) { return Serializer.simplify(item) },
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  scrubFields(sandbox, item) { return Serializer.scrub(item) },
}

$patch$(Zotero.Utilities.Internal, 'itemToExportFormat', original => function(zoteroItem, legacy, skipChildItems) {
  try {
    return Serializer.fetch(zoteroItem, legacy, skipChildItems) || Serializer.store(zoteroItem, original.apply(this, arguments), legacy, skipChildItems)
  } catch (err) { // fallback for safety for non-BBT
    debug('Zotero.Utilities.Internal.itemToExportFormat', err)
  }

  return original.apply(this, arguments)
})

$patch$(Zotero.Translate.Export.prototype, 'translate', original => function() {
  try {
    /* requested translator */
    let translatorID = this.translator[0]
    if (translatorID.translatorID) translatorID = translatorID.translatorID

    let capture = this._displayOptions && this._displayOptions.keepUpdated

    debug('Zotero.Translate.Export::translate: ', translatorID, this._displayOptions, capture)

    if (capture) {
      // this should never occur -- keepUpdated should only be settable if you do a file export
      if (!this.location || !this.location.path) {
        flash('Auto-export not registered', 'Auto-export only supported for exports to file -- please report this, you should not have seen this message')
        capture = false
      }

      // this should never occur -- keepUpdated should only be set by BBT translators
      if (!Translators.byId[translatorID]) {
        flash('Auto-export not registered', 'Auto-export only supported for Better BibTeX translators -- please report this, you should not have seen this message')
        capture = false
      }

      // this should never occur -- the JS in exportOptions.ts should prevent it
      if (this._displayOptions.exportFileData) {
        flash('Auto-export not registered', 'Auto-export does not support file data export -- please report this, you should not have seen this message')
        capture = false
      }

      if (!this._export || !(['library', 'collection'].includes(this._export.type))) {
        flash('Auto-export not registered', 'Auto-export only supported for groups, collections and libraries')
        capture = false
      }
    }

    if (capture) {
      AutoExport.add({
        type: this._export.type,
        id: this._export.type === 'library' ? this._export.id : this._export.collection.id,
        path: this.location.path,
        status: 'done',
        translatorID,
        exportNotes: this._displayOptions.exportNotes,
        useJournalAbbreviation: this._displayOptions.useJournalAbbreviation,
      })
    }

  } catch (err) {
    debug('Zotero.Translate.Export::translate error:', err)
  }

  return original.apply(this, arguments)
})

/*
  EVENTS
*/
Zotero.Notifier.registerObserver({
  notify(action, type, ids, extraData) {
    debug('item.notify', {action, type, ids, extraData})

    // prevents update loop -- see KeyManager.init()
    if (action === 'modify') {
      ids = ids.filter(id => !extraData[id] || !extraData[id].bbtCitekeyUpdate)
      if (!ids.length) return
    }

    Cache.remove(ids)

    // safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
    // https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
    const parents = []
    const items = action === 'delete' ? [] : Zotero.Items.get(ids).filter(item => {
      if (item.isNote() || item.isAttachment()) {
        parents.push(item.parentID)
        return false
      }

      return true
    })
    if (parents.length) Cache.remove(parents)

    switch (action) {
      case 'delete':
      case 'trash':
        debug(`event.${type}.${action}`, {ids, extraData})
        KeyManager.remove(ids)
        Events.emit('items-removed', ids)
        break

      case 'add':
      case 'modify':
        for (const item of items) {
          KeyManager.update(item)
        }

        Events.emit('items-changed', ids)
        break

      default:
        debug('item.notify: unhandled', {action, type, ids, extraData})
        return
    }

    AutoExport.changed(items)
  },
}, ['item'], 'BetterBibTeX', 1)

Zotero.Notifier.registerObserver({
  notify(event, type, ids, extraData) {
    if ((event === 'delete') && ids.length) Events.emit('collections-removed', ids)
  },
}, ['collection'], 'BetterBibTeX', 1)

Zotero.Notifier.registerObserver({
  notify(event, type, ids, extraData) {
    if ((event === 'delete') && ids.length) Events.emit('libraries-removed', ids)
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

    if (changed.size) Events.emit('collections-changed', Array.from(changed))
  },
}, ['collection-item'], 'BetterBibTeX', 1)

/*
  INIT
*/

debug('Loading Better BibTeX: setup done')

class Lock {
  private mark: { ts: number, msg: string }

  constructor() {
    this.mark = { ts: (new Date()).valueOf(), msg: '' }
  }

  public async lock(msg){
    await Zotero.uiReadyPromise

    if (Zotero.locked) await Zotero.unlockPromise

    this.update(msg || 'Initializing')

    this.toggle(true)
    debug('Lock: locked')
  }

  public update(msg) {
    this.bench(msg)
    Zotero.showZoteroPaneProgressMeter(`Better BibTeX: ${msg}...`)
  }

  public unlock() {
    this.bench('')

    Zotero.hideZoteroPaneOverlays()
    this.toggle(false)
    debug('Lock: unlocked')
  }

  private bench(msg) {
    const ts = (new Date()).valueOf()
    // tslint:disable-next-line:no-magic-numbers
    if (this.mark.msg) debug('Lock:', this.mark.msg, 'took', (ts - this.mark.ts) / 1000.0, 's')
    this.mark = { ts, msg }
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

export = new class BetterBibTeX {
  public ready: any
  private strings: any

  constructor() {
    if (Zotero.BetterBibTeX) {
      debug("MacOS and its weird \"I'm sort of closed but not really\" app handling makes init run again...")
    } else {
      this.ready = bbtReady.promise
      window.addEventListener('load', this.load.bind(this), false)
    }
  }

  public pullExport() {
    if (!pane.collectionsView || !pane.collectionsView.selection || !pane.collectionsView.selection.count) return ''

    const translator = 'biblatex'
    const row = pane.collectionsView.selectedTreeRow

    const root = `http://localhost:${Zotero.Prefs.get('httpServer.port')}/better-bibtex/`

    if (row.isCollection()) {
      let collection = pane.getSelectedCollection()
      const short = `collection?/${collection.libraryID || 0}/${collection.key}.${translator}`

      const path = [encodeURIComponent(collection.name)]
      while (collection.parent) {
        collection = Zotero.Collections.get(collection.parent)
        path.unshift(encodeURIComponent(collection.name))
      }
      const long = `collection?/${collection.libraryID || 0}/${path.join('/')}.${translator}`

      return `${root}${short}\nor\n${root}${long}`
    }

    if (row.isLibrary(true)) {
      const libId = pane.getSelectedLibraryID()
      const short = libId ? `library?/${libId}/library.${translator}` : `library?library.${translator}`
      return `${root}${short}`
    }

    return ''
  }

  public errorReport(includeReferences) {
    debug('ErrorReport::start', includeReferences)

    let items = null

    switch (pane && includeReferences) {
      case 'collection': case 'library':
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

  public scanAUX(path = null) {
    (new AUXScanner).scan(path)
  }

  public getString(id, params = null) {
    try {
      return params ? this.strings.getString(id) : format(this.strings.getString(id), params)
    } catch (err) {
      debug('getString', id, err)
      return id
    }
  }

  private async load() {
    debug('Loading Better BibTeX: starting...')

    this.strings = document.getElementById('zotero-better-bibtex-strings')

    // oh FFS -- datadir is async now

    const lock = new Lock()
    await lock.lock(this.getString('BetterBibTeX.startup.waitingForZotero'))

    Cache.init()

    // Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
    await Zotero.Schema.schemaUpdatePromise

    lock.update(this.getString('BetterBibTeX.startup.loadingKeys'))
    await DB.init()

    lock.update(this.getString('BetterBibTeX.startup.autoExport'))
    AutoExport.init()

    lock.update(this.getString('BetterBibTeX.startup.keyManager'))
    await KeyManager.init() // inits the key cache by scanning the DB

    lock.update(this.getString('BetterBibTeX.startup.serializationCache'))
    await Serializer.init() // creates simplify et al

    lock.update(this.getString('BetterBibTeX.startup.journalAbbrev'))
    JournalAbbrev.init()

    lock.update(this.getString('BetterBibTeX.startup.installingTranslators'))
    await Translators.init()

    // should be safe to start tests at this point. I hate async.

    bbtReady.resolve(true)

    lock.unlock()
  }
}
