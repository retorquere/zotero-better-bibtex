declare const window: any
declare const document: any
declare const Components: any
declare const Zotero: any
declare const AddonManager: any

import { Preferences as Prefs } from './prefs.ts' // needs to be here early, initializes the prefs observer
require('./pull-export.ts') // just require, initializes the pull-export end points
require('./json-rpc.ts') // just require, initializes the json-rpc end point

Components.utils.import('resource://gre/modules/AddonManager.jsm')

import { debug } from './debug'
import { flash } from './flash.ts'
import { Events } from './events.ts'
import { ZoteroConfig } from './zotero-config.ts'

debug('Loading Better BibTeX')

import { Translators } from './translators.ts'
import { DB } from './db/main.ts'
import { DB as Cache } from './db/cache.ts'
import { Serializer } from './serializer.ts'
import { JournalAbbrev } from './journal-abbrev.ts'
import { AutoExport } from './auto-export.ts'
import { KeyManager } from './key-manager.ts'
import { AUXScanner } from './aux-scanner.ts'
import { TeXstudio } from './tex-studio.ts'
import format = require('string-template')

import { patch as $patch$ } from './monkey-patch.ts'

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
    for (const [label, metadata] of (Object.entries(Translators.byName) as Array<[string, ITranslatorHeader]>)) {
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

if (Prefs.get('citeprocNoteCitekey')) {
  $patch$(Zotero.Utilities, 'itemToCSLJSON', original => function itemToCSLJSON(zoteroItem) {
    const cslItem = original.apply(this, arguments)

    if (typeof Zotero.Item !== 'undefined' && !(zoteroItem instanceof Zotero.Item)) {
      const citekey = KeyManager.get(zoteroItem.itemID)
      if (citekey) {
        cslItem.note = citekey.citekey
      } else {
        delete cslItem.note
      }
    }

    return cslItem
  })
}

// https://github.com/retorquere/zotero-better-bibtex/issues/769
$patch$(Zotero.DataObjects.prototype, 'parseLibraryKeyHash', original => function(id) {
  id = decodeURIComponent(id)
  try {
    if (id[0] === '@') {
      const item = KeyManager.keys.findOne({ citekey: id.substring(1) })
      if (item) return { libraryID: item.libraryID, key: item.itemKey }
    }

    const m = id.match(/^bbt:(?:{([0-9]+)})?(.*)/)
    if (m) {
      let [libraryID, citekey] = m.slice(1)
      if (!libraryID || libraryID === 1) libraryID = Zotero.Libraries.userLibraryID
      libraryID = parseInt(libraryID)
      const item = KeyManager.keys.findOne({ libraryID, citekey })
      if (item) return { libraryID: item.libraryID, key: item.itemKey }
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
  try {
    switch (field) {
      case 'citekey':
        const citekey = KeyManager.get(this.id)
        if (citekey.retry) return '\uFFFD'
        return citekey.citekey + (!citekey.citekey || citekey.pinned ? '' : ' *')

      case 'itemID':
        return `${this.id}`

    }
  } catch (err) {
    debug('patched getField:', {field, unformatted, includeBaseMapped, err})
  }

  return original.apply(this, arguments)
})
$patch$(Zotero.ItemTreeView.prototype, 'getCellText', original => function(row, column) {
  if (column.id !== 'zotero-items-column-citekey') return original.apply(this, arguments)

  const obj = this.getRow(row)
  const itemID = obj.id
  const citekey = KeyManager.get(itemID)

  if (citekey.retry) {
    bbtReady.promise.then(() => {
      this._treebox.invalidateCell(row, column)
    })
  }

  return citekey.citekey + (!citekey.citekey || citekey.pinned ? '' : ' *')
})

import * as CAYW from './cayw.ts'
$patch$(Zotero.Integration, 'getApplication', original => function(agent, command, docId) {
  if (agent === 'BetterBibTeX') return CAYW.Application
  return original.apply(this, arguments)
})

/* bugger this, I don't want megabytes of shared code in the translators */
import * as DateParser from './dateparser.ts'
// import CiteProc = require('./citeproc.ts')
import { qualityReport } from './qr-check.ts'
import { titleCase } from './title-case.ts'
import { HTMLParser } from './markupparser.ts'
import { Logger } from './logger.ts'
import { extract as varExtract } from './var-extract.ts'
Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  qrCheck(sandbox, value, test, params = null) { return qualityReport(value, test, params) },

  parseDate(sandbox, date) { return DateParser.parse(date) },
  isEDTF(sandbox, date, minuteLevelPrecision = false) { return DateParser.isEDTF(date, minuteLevelPrecision) },

  parseParticles(sandbox, name) { return Zotero.CiteProc.CSL.parseParticles(name) },
  titleCase(sandbox, text) { return titleCase(text) },
  parseHTML(sandbox, text, options) { return HTMLParser.parse(text.toString(), options) },
  simplifyFields(sandbox, item) { return Serializer.simplify(item) },
  validFields(sandbox) { return Serializer.validFields },
  extractFields(sandbox, item) { return varExtract(item) },
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  version(sandbox) { return { Zotero: ZoteroConfig.Zotero, BetterBibTeX: require('../gen/version.js') } },

  debug(sandbox, prefix, ...msg) { Logger.log(prefix, ...msg) },

  cacheFetch(sandbox, itemID, options) {
    const collection = Cache.getCollection(sandbox.translator[0].label)
    if (!collection) {
      return false
    }

    const cached = collection.findOne({ itemID, exportNotes: !!options.exportNotes, useJournalAbbreviation: !!options.useJournalAbbreviation })
    if (!cached) {
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
  validFields(sandbox) { return Serializer.validFields },
  version(sandbox) { return { Zotero: ZoteroConfig.Zotero, BetterBibTeX: require('../gen/version.js') } },
  parseHTML(sandbox, text, options) { return HTMLParser.parse(text.toString(), options) },
  debug(sandbox, prefix, ...msg) { Logger.log(prefix, ...msg) },

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

$patch$(pane, 'buildCollectionContextMenu', original => async function() {
  await original.apply(this, arguments)

  try {
    const treeRow = this.collectionsView.selectedTreeRow
    const hidden = !treeRow || treeRow.isFeed() || treeRow.isTrash() || treeRow.isUnfiled() || treeRow.isDuplicates()

    document.getElementById('bbt-collectionmenu-separator').hidden = hidden
    document.getElementById('bbt-collectionmenu-pull-url').hidden = hidden
    document.getElementById('bbt-collectionmenu-report-errors').hidden = hidden
  } catch (err) {
    debug('ZoteroPane.buildCollectionContextMenu:', err)
  }
})

/*
  EVENTS
*/

function notify(event, handler) {
  Zotero.Notifier.registerObserver({
    notify(...args) {
      bbtReady.promise.then(() => handler.apply(null, args))
    },
  }, [event], 'BetterBibTeX', 1)
}

notify('item', (action, type, ids, extraData) => {

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
      return
  }

  AutoExport.changed(items)
})

notify('collection', (event, type, ids, extraData) => {
  if ((event === 'delete') && ids.length) Events.emit('collections-removed', ids)
})

notify('group', (event, type, ids, extraData) => {
  if ((event === 'delete') && ids.length) Events.emit('libraries-removed', ids)
})

notify('collection-item', (event, type, collection_items) => {
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
})

/*
  INIT
*/

debug('Loading Better BibTeX: setup done')

class Progress {
  private timestamp: number
  private msg: string
  private locked: boolean
  private progressWin: any
  private progress: any
  private name: string

  constructor() {
    this.locked = Prefs.get('lockedInit')
    this.name = this.locked ? 'Startup lock' : 'Startup progress'
  }

  public async start(msg) {
    this.timestamp = (new Date()).valueOf()
    this.msg = msg || 'Initializing'

    debug(`${this.name}: waiting for Zotero locks...`)

    await Zotero.uiReadyPromise

    if (this.locked && Zotero.locked) await Zotero.unlockPromise

    debug(`${this.name}: ${msg}...`)
    this.toggle(true)
    debug(`${this.name}: ${this.locked ? 'locked' : 'progress window up'}`)
  }

  public update(msg) {
    this.bench(msg)

    debug(`${this.name}: ${msg}...`)
    if (this.locked) {
      Zotero.showZoteroPaneProgressMeter(`Better BibTeX: ${msg}...`)
    } else {
      this.progress.setText(msg)
    }
  }

  public done() {
    this.bench(null)

    this.toggle(false)
    debug(`${this.name}: done`)
  }

  private bench(msg) {
    const ts = (new Date()).valueOf()
    // tslint:disable-next-line:no-magic-numbers
    if (this.msg) debug(`${this.name}:`, this.msg, 'took', (ts - this.timestamp) / 1000.0, 's')
    this.msg = msg
    this.timestamp = ts
  }

  private toggle(busy) {
    if (this.locked) {
      for (const id of ['menu_import', 'menu_importFromClipboard', 'menu_newItem', 'menu_newNote', 'menu_newCollection', 'menu_exportLibrary']) {
        document.getElementById(id).hidden = busy
      }

      for (const id of ['zotero-collections-tree']) {
        document.getElementById(id).disabled = busy
      }

      if (busy) {
        Zotero.showZoteroPaneProgressMeter(`Better BibTeX: ${this.msg}...`)
      } else {
        Zotero.hideZoteroPaneOverlays()
      }
    } else if (busy) {
      this.progressWin = new Zotero.ProgressWindow({ closeOnClick: false })
      this.progressWin.changeHeadline('Better BibTeX: Initializing')
      // this.progressWin.addDescription(`Found ${this.scanning.length} references without a citation key`)
      const icon = `chrome://zotero/skin/treesource-unfiled${Zotero.hiDPI ? '@2x' : ''}.png`
      this.progress = new this.progressWin.ItemProgress(icon, `${this.msg}...`)
      this.progressWin.show()
    } else {
      this.progress.setText('Ready')
      this.progressWin.startCloseTimer(500) // tslint:disable-line:no-magic-numbers
    }
  }
}

export = new class BetterBibTeX {
  public ready: any
  private strings: any
  private firstRun: { citekeyFormat: String, dragndrop: boolean }

  constructor() {
    if (Zotero.BetterBibTeX) {
      debug("MacOS and its weird \"I'm sort of closed but not really\" app handling makes init run again...")
    } else {
      this.ready = bbtReady.promise
      window.addEventListener('load', () => {
        this.load().catch(err => {
          this.ready = false
          debug('Better BibTeX failed to load:', err)
        })
      }, false)
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

  public async addCitationLinks() {
    const items = Zotero.getActiveZoteroPane().getSelectedItems()
    if (items.length !== 1) {
      flash('Citation links only works for a single reference')
      return
    }

    const extra = items[0].getField('extra') || ''
    const citations = new Set(extra.split('\n').filter(line => line.startsWith('cites:')))
    const picked = (await CAYW.pick({ format: 'citationLinks' })).split('\n').filter(citation => !citations.has(citation))

    if (picked.length) {
      items[0].setField('extra', `${extra}\n${picked.join('\n')}`.trim())
      await items[0].saveTx()
    }
  }

  public async toTeXstudio() {
    await TeXstudio.push()
  }

  public errorReport(includeReferences) {
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

    const ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    ww.openWindow(null, 'chrome://zotero-better-bibtex/content/ErrorReport.xul', 'better-bibtex-error-report', 'chrome,centerscreen,modal', params)
  }

  public async scanAUX(path = null) {
    await bbtReady.promise
    await AUXScanner.scan(path)
  }

  public getString(id, params = null) {
    if (!this.strings || typeof this.strings.getString !== 'function') {
      debug('getString called before strings were loaded', id)
      return id
    }

    try {
      const str = this.strings.getString(id)
      return params ? format(str, params) : str
    } catch (err) {
      debug('getString', id, err)
      return id
    }
  }

  private async load() {
    this.strings = document.getElementById('zotero-better-bibtex-strings')

    debug('Loading Better BibTeX: starting...')

    await TeXstudio.init()

    for (const node of [...document.getElementsByClassName('bbt-texstudio')]) {
      node.hidden = !TeXstudio.enabled
    }

    // the zero-width-space is a marker to re-save the current default so it doesn't get replaced when the default changes later, which would change new keys suddenly
    // its presence also indicates first-run, so right after the DB is ready, configure BBT
    const citekeyFormat = Prefs.get('citekeyFormat') || Prefs.clear('citekeyFormat')
    if (citekeyFormat[0] === '\u200B') {
      const params = { wrappedJSObject: { citekeyFormat: 'bbt', dragndrop: true } }
      const ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
      ww.openWindow(null, 'chrome://zotero-better-bibtex/content/FirstRun.xul', 'better-bibtex-first-run', 'chrome,centerscreen,modal', params)
      this.firstRun = params.wrappedJSObject

      debug('firstRun:', this.firstRun)

      Prefs.set('citekeyFormat', (this.firstRun.citekeyFormat === 'zotero') ? '[zotero:clean]' : citekeyFormat.substr(1))
    } else {
      this.firstRun = null
    }

    const progress = new Progress()
    await progress.start(this.getString('BetterBibTeX.startup.waitingForZotero'))

    // Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
    await Zotero.Schema.schemaUpdatePromise
    debug("Schema ready, let's roll!")

    progress.update(this.getString('BetterBibTeX.startup.loadingKeys'))
    Cache.init() // oh FFS -- datadir is async now
    await DB.init()

    progress.update(this.getString('BetterBibTeX.startup.autoExport'))
    await AutoExport.init()

    progress.update(this.getString('BetterBibTeX.startup.keyManager'))
    await KeyManager.init() // inits the key cache by scanning the DB

    progress.update(this.getString('BetterBibTeX.startup.serializationCache'))
    await Serializer.init() // creates simplify et al

    progress.update(this.getString('BetterBibTeX.startup.journalAbbrev'))
    JournalAbbrev.init()

    progress.update(this.getString('BetterBibTeX.startup.installingTranslators'))
    await Translators.init()

    // should be safe to start tests at this point. I hate async.

    bbtReady.resolve(true)

    progress.done()

    if (this.firstRun && this.firstRun.dragndrop) Zotero.Prefs.set('export.quickCopy.setting', `export=${Translators.byLabel.BetterBibTeXCitationKeyQuickCopy.translatorID}`)

    Events.emit('loaded')
  }
}
