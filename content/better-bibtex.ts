declare const Components: any
declare const Zotero: any

import { Preferences as Prefs } from './prefs' // needs to be here early, initializes the prefs observer
require('./pull-export') // just require, initializes the pull-export end points
require('./json-rpc') // just require, initializes the json-rpc end point
import { AUXScanner } from './aux-scanner'

Components.utils.import('resource://gre/modules/AddonManager.jsm')
declare const AddonManager: any

import * as log from './debug'
import { flash } from './flash'
import { Events } from './events'
import { ZoteroConfig } from './zotero-config'

log.debug('Loading Better BibTeX')

import { Translators } from './translators'
import { DB } from './db/main'
import { DB as Cache } from './db/cache'
import { upgrade as dbUpgrade } from './db/upgrade'
import { Serializer } from './serializer'
import { JournalAbbrev } from './journal-abbrev'
import { AutoExport } from './auto-export'
import { KeyManager } from './key-manager'
import * as Citekey from './key-manager/get-set'
import { TeXstudio } from './tex-studio'
import format = require('string-template')

import { patch as $patch$ } from './monkey-patch'

const prefOverrides = require('../gen/preferences/auto-export-overrides.json')

/*
  UNINSTALL
*/

AddonManager.addAddonListener({
  onUninstalling(addon, needsRestart) {
    if (addon.id !== 'better-bibtex@iris-advies.com') return null
    log.debug('uninstall')

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
    if (addon.id !== 'better-bibtex@iris-advies.com') return null
    // tslint:disable-next-line:no-bitwise
    if (addon.pendingOperations & (AddonManager.PENDING_UNINSTALL | AddonManager.PENDING_DISABLE)) return null

    for (const header of Object.values(Translators.byId)) {
      try {
        Translators.install(header)
      } catch (err) {
        log.error(err)
      }
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

// https://github.com/retorquere/zotero-better-bibtex/issues/1221
$patch$(Zotero.Items, 'merge', original => async function(item, otherItems) {
  try {
    const extra = Citekey.aliases.get(item.getField('extra'))

    // get citekeys of other items
    const otherIDs = otherItems.map(i => parseInt(i.id))
    extra.aliases = extra.aliases.concat(KeyManager.keys.find({ itemID: { $in: otherIDs }}).map(i => i.citekey))

    // add any aliases they were already holding
    for (const i of otherItems) {
      extra.aliases = extra.aliases.concat(Citekey.aliases.get(i.getField('extra')).aliases)
    }

    const citekey = KeyManager.keys.findOne({ itemID: item.id }).citekey
    extra.aliases = extra.aliases.filter(alias => alias && alias !== citekey)
    if (extra.aliases.length) extra.extra = Citekey.aliases.set(extra.extra, extra.aliases)
    item.setField('extra', extra.extra)

  } catch (err) {
    log.error('Zotero.Items.merge:', err)
  }

  return original.apply(this, arguments)
})

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
    log.error('parseLibraryKeyHash:', id, err)
  }

  return original.apply(this, arguments)
})

/*
// monkey-patch Zotero.Search::search to allow searching for citekey
$patch$(Zotero.Search.prototype, 'search', original => Zotero.Promise.coroutine(function *(asTempTable) {
  const searchText = Object.values(this._conditions).filter(c => c && c.condition === 'field').map(c => c.value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))
  if (!searchText.length) return yield original.apply(this, arguments)

  let ids = yield original.call(this, false) || []

  log.debug('search: looking for', searchText, 'from', this._conditions, 'to add to', ids)

  ids = Array.from(new Set(ids.concat(KeyManager.keys.find({ citekey: { $regex: new RegExp(searchText.join('|'), 'i') } }).map(item => item.itemID))))

  if (!ids.length) return false
  if (asTempTable) return yield Zotero.Search.idsToTempTable(ids)
  return ids
}))
*/

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
    log.error('patched getField:', {field, unformatted, includeBaseMapped, err})
  }

  return original.apply(this, arguments)
})

$patch$(Zotero.ItemTreeView.prototype, 'getCellText', original => function(row, column) {
  if (column.id !== 'zotero-items-column-citekey') return original.apply(this, arguments)

  if (BetterBibTeX.loaded.isPending()) { // tslint:disable-line:no-use-before-declare
    BetterBibTeX.loaded.then(() => { // tslint:disable-line:no-use-before-declare
      this._treebox.invalidateCell(row, column)
    })

    return '\uFFFD'
  }

  const item = this.getRow(row).ref
  if (item.isNote() || item.isAttachment()) return ''

  const citekey = KeyManager.get(item.id)

  if (citekey.retry) {
    BetterBibTeX.loaded.then(() => { // tslint:disable-line:no-use-before-declare
      this._treebox.invalidateCell(row, column)
    })
  }

  if (!citekey.citekey) return '\uFFFD'

  return citekey.citekey + (citekey.pinned ? '' : ' *')
})

import * as CAYW from './cayw'
$patch$(Zotero.Integration, 'getApplication', original => function(agent, command, docId) {
  if (agent === 'BetterBibTeX') return CAYW.Application
  return original.apply(this, arguments)
})

/* bugger this, I don't want megabytes of shared code in the translators */
import * as DateParser from './dateparser'
// import CiteProc = require('./citeproc.ts')
import { qualityReport } from './qr-check'
import { titleCase } from './title-case'
import { HTMLParser } from './markupparser'
import { Logger } from './logger'
import { extract as varExtract } from './var-extract'

function cacheSelector(itemID, options, prefs) {
  const selector = {
    itemID,

    exportNotes: !!options.exportNotes,
    useJournalAbbreviation: !!options.useJournalAbbreviation,
  }
  for (const pref of prefOverrides) {
    selector[pref] = prefs[pref]
  }
  return selector
}

Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  qrCheck(sandbox, value, test, params = null) { return qualityReport(value, test, params) },

  platform(sandbox) { return Zotero.platform },

  parseDate(sandbox, date) { return DateParser.parse(date) },
  isEDTF(sandbox, date, minuteLevelPrecision = false) { return DateParser.isEDTF(date, minuteLevelPrecision) },

  parseParticles(sandbox, name) { return Zotero.CiteProc.CSL.parseParticles(name) },
  titleCase(sandbox, text) { return titleCase(text) },
  parseHTML(sandbox, text, options) { return HTMLParser.parse(text.toString(), options) },
  extractFields(sandbox, item) { return varExtract(item) },
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  version(sandbox) { return { Zotero: ZoteroConfig.Zotero, BetterBibTeX: require('../gen/version.js') } },

  debug(sandbox, prefix, ...msg) { Logger.log(prefix, ...msg) },

  cacheFetch(sandbox, itemID, options, prefs) {
    const collection = Cache.getCollection(sandbox.translator[0].label)
    if (!collection) return false

    const query = cacheSelector(itemID, options, prefs)

    // not safe in async!
    const cloneObjects = collection.cloneObjects
    collection.cloneObjects = false
    const cached = collection.findOne(query)
    collection.cloneObjects = cloneObjects

    if (!cached) return false

    // collection.update(cached) // touches the cache object so it isn't reaped too early

    // direct-DB access for speed...
    cached.meta.updated = (new Date).getTime() // touches the cache object so it isn't reaped too early
    collection.dirty = true

    // freeze object, because it was not fetched using clone
    return Object.freeze(cached)
  },

  cacheStore(sandbox, itemID, options, prefs, reference, metadata) {
    if (!metadata) metadata = {}

    const collection = Cache.getCollection(sandbox.translator[0].label)
    if (!collection) {
      log.error('cacheStore: cache', sandbox.translator[0].label, 'not found')
      return false
    }

    const selector = cacheSelector(itemID, options, prefs)
    let cached = collection.findOne(selector)

    if (cached) {
      cached.reference = reference
      cached.metadata = metadata
      cached = collection.update(cached)

    } else {
      cached = collection.insert({...selector, reference, metadata})

    }

    return true
  },
}
Zotero.Translate.Import.prototype.Sandbox.BetterBibTeX = {
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  version(sandbox) { return { Zotero: ZoteroConfig.Zotero, BetterBibTeX: require('../gen/version.js') } },
  parseHTML(sandbox, text, options) { return HTMLParser.parse(text.toString(), options) },
  platform(sandbox) { return Zotero.platform },
  debug(sandbox, prefix, ...msg) { Logger.log(prefix, ...msg) },
  parseDate(sandbox, date) { return DateParser.parse(date) },
}

$patch$(Zotero.Utilities.Internal, 'itemToExportFormat', original => function(zoteroItem, legacy, skipChildItems) {
  try {
    return Serializer.fetch(zoteroItem, !!legacy, !!skipChildItems) || Serializer.store(zoteroItem, original.apply(this, arguments), !!legacy, !!skipChildItems)
  } catch (err) { // fallback for safety for non-BBT
    log.error('Zotero.Utilities.Internal.itemToExportFormat', err)
  }

  return original.apply(this, arguments)
})

$patch$(Zotero.Translate.Export.prototype, 'translate', original => function() {
  try {
    /* requested translator */
    let translatorID = this.translator[0]
    if (translatorID.translatorID) translatorID = translatorID.translatorID

    if (this._displayOptions && this.location) {
      if (this._displayOptions.exportFileData) { // when exporting file data, the user was asked to pick a directory rather than a file
        this._displayOptions.exportPath = this.location.path
      } else {
        this._displayOptions.exportPath = this.location.parent.path
      }
    }

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
    log.error('Zotero.Translate.Export::translate error:', err)
  }

  return original.apply(this, arguments)
})

/*
  EVENTS
*/

function notify(event, handler) {
  Zotero.Notifier.registerObserver({
    notify(...args) {
      BetterBibTeX.ready.then(() => { // tslint:disable-line:no-use-before-declare
        handler.apply(null, args)
      })
    },
  }, [event], 'BetterBibTeX', 1)
}

notify('item-tag', (action, type, ids, extraData) => {
  ids = ids.map(item_tag => parseInt(item_tag.split('-')[0]))

  Cache.remove(ids, `item ${ids} changed`)
  Events.emit('items-changed', ids)
})

notify('item', (action, type, ids, extraData) => {
  log.debug('notify.item', { action, type, ids, extraData })

  // prevents update loop -- see KeyManager.init()
  if (action === 'modify') {
    ids = ids.filter(id => !extraData[id] || !extraData[id].bbtCitekeyUpdate)
    if (!ids.length) return
  }

  Cache.remove(ids, `item ${ids} changed`)

  // safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
  // https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
  const parents = []
  const items = action === 'delete' ? [] : Zotero.Items.get(ids).filter(item => {
    if (item.isNote() || item.isAttachment()) {
      if (typeof item.parentID !== 'boolean') parents.push(item.parentID)
      return false
    }

    return true
  })
  if (parents.length) Cache.remove(parents, `parent items ${parents} changed`)

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

log.debug('Loading Better BibTeX: setup done')

class Progress {
  private timestamp: number
  private msg: string
  private locked: boolean
  private progressWin: any
  private progress: any
  private name: string
  private document: any

  constructor(document) {
    this.document = document
    this.locked = Prefs.get('lockedInit')
    this.name = this.locked ? 'Startup lock' : 'Startup progress'
  }

  public async start(msg) {
    this.timestamp = (new Date()).valueOf()
    this.msg = msg || 'Initializing'

    log.debug(`${this.name}: waiting for Zotero locks...`)

    await Zotero.uiReadyPromise

    if (this.locked && Zotero.locked) await Zotero.unlockPromise

    log.debug(`${this.name}: ${msg}...`)
    this.toggle(true)
    log.debug(`${this.name}: ${this.locked ? 'locked' : 'progress window up'}`)
  }

  public update(msg) {
    this.bench(msg)

    log.debug(`${this.name}: ${msg}...`)
    if (this.locked) {
      Zotero.showZoteroPaneProgressMeter(`Better BibTeX: ${msg}...`)
    } else {
      this.progress.setText(msg)
    }
  }

  public done() {
    this.bench(null)

    this.toggle(false)
    log.debug(`${this.name}: done`)
  }

  private bench(msg) {
    const ts = (new Date()).valueOf()
    // tslint:disable-next-line:no-magic-numbers
    if (this.msg) log.debug(`${this.name}:`, this.msg, 'took', (ts - this.timestamp) / 1000.0, 's')
    this.msg = msg
    this.timestamp = ts
  }

  private toggle(busy) {
    if (this.locked) {
      for (const id of ['menu_import', 'menu_importFromClipboard', 'menu_newItem', 'menu_newNote', 'menu_newCollection', 'menu_exportLibrary']) {
        this.document.getElementById(id).hidden = busy
      }

      for (const id of ['zotero-collections-tree']) {
        this.document.getElementById(id).disabled = busy
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

export let BetterBibTeX = new class { // tslint:disable-line:variable-name
  public ready: any
  public loaded: any
  public dir: string

  private strings: any
  private firstRun: { citekeyFormat: String, dragndrop: boolean }
  private document: any

  // #load
  public async load(document: any) {
    this.document = document

    this.strings = this.document.getElementById('zotero-better-bibtex-strings')

    if (!this.loaded) await this.init()
  }

  public getString(id, params = null) {
    if (!this.strings || typeof this.strings.getString !== 'function') {
      log.debug('getString called before strings were loaded', id)
      return id
    }

    try {
      const str = this.strings.getString(id)
      return params ? format(str, params) : str
    } catch (err) {
      log.debug('getString', id, err)
      return id
    }
  }

  public async scanAUX(target) {
    if (!this.loaded) return
    await this.loaded

    const aux = await AUXScanner.pick()
    if (!aux) return

    switch (target) {
      case 'collection':
        await AUXScanner.scan(aux)
        break

      case 'tag':
        const ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)

        let name = aux.leafName
        name = name.lastIndexOf('.') > 0 ? name.substr(0, name.lastIndexOf('.')) : name
        const tag = { value: name }
        if (!ps.prompt(null, this.getString('BetterBibTeX.auxScan.title'), this.getString('BetterBibTeX.auxScan.prompt'), tag, null, {})) return
        if (!tag.value) return

        await AUXScanner.scan(aux, tag.value)
        break

      default:
        flash(`Unsupported aux-scan target ${target}`)
        break
    }
  }

  // #init
  private async init() {
    const deferred = {
      loaded: Zotero.Promise.defer(),
      ready: Zotero.Promise.defer(),
    }
    this.ready = deferred.ready.promise
    this.loaded = deferred.loaded.promise

    if (typeof this.ready.isPending !== 'function') throw new Error('Zotero.Promise is not using Bluebird')

    log.debug('Loading Better BibTeX: starting...')

    await TeXstudio.init()

    for (const node of [...this.document.getElementsByClassName('bbt-texstudio')]) {
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

      log.debug('firstRun:', this.firstRun)

      Prefs.set('citekeyFormat', (this.firstRun.citekeyFormat === 'zotero') ? '[zotero:clean]' : citekeyFormat.substr(1))
    } else {
      this.firstRun = null
    }

    const progress = new Progress(this.document)
    await progress.start(this.getString('BetterBibTeX.startup.waitingForZotero'))

    // Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
    await Zotero.Schema.initializationPromise

    this.dir = OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex')
    await OS.File.makeDir(this.dir, { ignoreExisting: true })

    log.debug("Zotero ready, let's roll!")

    progress.update(this.getString('BetterBibTeX.startup.loadingKeys'))
    await Promise.all([Cache.init(), DB.init()])

    await KeyManager.init() // loads the existing keys

    progress.update(this.getString('BetterBibTeX.startup.serializationCache'))
    Serializer.init()

    progress.update(this.getString('BetterBibTeX.startup.autoExport.load'))
    await AutoExport.init()

    // not yet started
    deferred.loaded.resolve(true)

    // this is what really takes long
    progress.update(this.getString('BetterBibTeX.startup.waitingForTranslators'))
    await Zotero.Schema.schemaUpdatePromise

    // after the caches because I may need to drop items from the cache
    await dbUpgrade(progress.update.bind(progress))

    progress.update(this.getString('BetterBibTeX.startup.journalAbbrev'))
    await JournalAbbrev.init()

    progress.update(this.getString('BetterBibTeX.startup.installingTranslators'))
    await Translators.init()

    progress.update(this.getString('BetterBibTeX.startup.keyManager'))
    await KeyManager.start() // inits the key cache by scanning the DB and generating missing keys

    progress.update(this.getString('BetterBibTeX.startup.autoExport'))
    await AutoExport.start()

    deferred.ready.resolve(true)

    progress.done()

    if (this.firstRun && this.firstRun.dragndrop) Zotero.Prefs.set('export.quickCopy.setting', `export=${Translators.byLabel.BetterBibTeXCitationKeyQuickCopy.translatorID}`)

    Events.emit('loaded')
  }
}
