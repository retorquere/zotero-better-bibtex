declare const Components: any
declare const Zotero: any

Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

import { clean_pane_persist, patch as $patch$ } from './monkey-patch'
import { flash } from './flash'
import { sleep } from './sleep'

import { Preferences as Prefs } from './prefs' // needs to be here early, initializes the prefs observer
require('./pull-export') // just require, initializes the pull-export end points
require('./json-rpc') // just require, initializes the json-rpc end point
import { AUXScanner } from './aux-scanner'
import * as Extra from './extra'
import { sentenceCase } from './case'

Components.utils.import('resource://gre/modules/AddonManager.jsm')
declare const AddonManager: any

import { log } from './logger'
import { Events, itemsChanged as notifyItemsChanged } from './events'

import { Translators } from './translators'
import { DB } from './db/main'
import { DB as Cache, selector as cacheSelector } from './db/cache'
import { upgrade as dbUpgrade } from './db/upgrade'
import { Serializer } from './serializer'
import { JournalAbbrev } from './journal-abbrev'
import { AutoExport } from './auto-export'
import { KeyManager } from './key-manager'
import { TeXstudio } from './tex-studio'
import format = require('string-template')

// UNINSTALL
AddonManager.addAddonListener({
  onUninstalling(addon, needsRestart) {
    if (addon.id !== 'better-bibtex@iris-advies.com') return null

    clean_pane_persist()
    const quickCopy = Zotero.Prefs.get('export.quickCopy.setting')
    for (const [label, metadata] of (Object.entries(Translators.byName) as [string, ITranslatorHeader][])) {
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
$patch$(Zotero.Items, 'merge', original => async function Zotero_Items_merge(item, otherItems) {
  try {
    const merge = {
      citekeys: Prefs.get('extraMergeCitekeys'),
      tex: Prefs.get('extraMergeTeX'),
      kv: Prefs.get('extraMergeCSL'),
    }

    const extra = Extra.get(item.getField('extra'), 'zotero', { aliases: merge.citekeys, tex: merge.tex, kv: merge.kv })

    // get citekeys of other items
    if (merge.citekeys) {
      const otherIDs = otherItems.map(i => parseInt(i.id))
      extra.extraFields.aliases = extra.extraFields.aliases.concat(KeyManager.keys.find({ itemID: { $in: otherIDs }}).map(i => i.citekey))
    }

    // add any aliases they were already holding
    for (const i of otherItems) {
      const otherExtra = Extra.get(i.getField('extra'), 'zotero', { aliases: merge.citekeys, tex: merge.tex, kv: merge.kv })

      if (merge.citekeys) extra.extraFields.aliases = extra.extraFields.aliases.concat(otherExtra.extraFields.aliases)

      if (merge.tex) {
        for (const [name, value] of Object.entries(otherExtra.extraFields.tex)) {
          if (!extra.extraFields.tex[name]) extra.extraFields.tex[name] = value
        }
      }

      if (merge.kv) {
        for (const [name, value] of Object.entries(otherExtra.extraFields.kv)) {
          const existing = extra.extraFields.kv[name]
          if (!existing) {
            extra.extraFields.kv[name] = value
          } else if (Array.isArray(existing) && Array.isArray(value)) {
            for (const creator in value) {
              if (!existing.includes(creator)) existing.push(creator)
            }
          }
        }
      }
    }

    if (merge.citekeys) {
      const citekey = KeyManager.keys.findOne({ itemID: item.id }).citekey
      extra.extraFields.aliases = extra.extraFields.aliases.filter(alias => alias && alias !== citekey)
    }

    item.setField('extra', Extra.set(extra.extra, {
      aliases: merge.citekeys ? extra.extraFields.aliases : undefined,
      tex: merge.tex ? extra.extraFields.tex : undefined,
      kv: merge.kv ? extra.extraFields.kv : undefined,
    }))

  } catch (err) {
    log.error('Zotero.Items.merge:', err)
  }

  return original.apply(this, arguments)
})

// https://github.com/retorquere/zotero-better-bibtex/issues/769
$patch$(Zotero.DataObjects.prototype, 'parseLibraryKeyHash', original => function Zotero_DataObjects_prototype_parseLibraryKeyHash(id) {
  try {
    const _id = decodeURIComponent(id)
    if (_id[0] === '@') {
      const item = KeyManager.keys.findOne({ citekey: _id.substring(1) })
      if (item) return { libraryID: item.libraryID, key: item.itemKey }
    }

    const m = _id.match(/^bbt:(?:{([0-9]+)})?(.*)/)
    if (m) {
      const [_libraryID, citekey] = m.slice(1)
      const libraryID: number = (!_libraryID || _libraryID === '1') ? Zotero.Libraries.userLibraryID : parseInt(_libraryID)
      const item = KeyManager.keys.findOne({ libraryID, citekey })
      if (item) return { libraryID: item.libraryID, key: item.itemKey }
    }
  } catch (err) {
    log.error('parseLibraryKeyHash:', id, err)
  }

  return original.apply(this, arguments)
})

// otherwise the display of the citekey in the item pane flames out
$patch$(Zotero.ItemFields, 'isFieldOfBase', original => function Zotero_ItemFields_isFieldOfBase(field, baseField) {
  if (['citekey', 'itemID'].includes(field)) return false
  return original.apply(this, arguments)
})

// because the zotero item editor does not check whether a textbox is read-only. *sigh*
$patch$(Zotero.Item.prototype, 'setField', original => function Zotero_Item_prototype_setField(field, value, loadIn) {
  if (['citekey', 'itemID'].includes(field)) return false
  return original.apply(this, arguments)
})

// To show the citekey in the reference list
$patch$(Zotero.Item.prototype, 'getField', original => function Zotero_Item_prototype_getField(field, unformatted, includeBaseMapped) {
  try {
    switch (field) {
      case 'citekey':
        if (BetterBibTeX.ready.isPending()) return '' // tslint:disable-line:no-use-before-declare
        const citekey = KeyManager.get(this.id)
        return citekey.citekey

      case 'itemID':
        return `${this.id}`

    }
  } catch (err) {
    log.error('patched getField:', {field, unformatted, includeBaseMapped, err})
  }

  return original.apply(this, arguments)
})

// #1579
$patch$(Zotero.Item.prototype, 'clone', original => function Zotero_Item_prototype_clone(libraryID, options = {}) {
  const item = original.apply(this, arguments)
  try {
    if (item.isRegularItem()) item.setField('extra', (item.getField('extra') || '').split('\n').filter(line => !(line.toLowerCase().startsWith('citation key:'))).join('\n'))
  } catch (err) {
    log.error('patched clone:', {libraryID, options, err})
  }
  return item
})

const itemTreeViewWaiting: Record<number, boolean> = {}
$patch$(Zotero.ItemTreeView.prototype, 'getCellText', original => function Zotero_ItemTreeView_prototype_getCellText(row, col) {
  if (col.id !== 'zotero-items-column-citekey') return original.apply(this, arguments)

  const item = this.getRow(row).ref
  if (item.isNote() || item.isAttachment()) return ''

  if (BetterBibTeX.ready.isPending()) { // tslint:disable-line:no-use-before-declare
    if (!itemTreeViewWaiting[item.id]) {
      // tslint:disable-next-line:no-use-before-declare
      BetterBibTeX.ready.then(() => this._treebox.invalidateCell(row, col))
      itemTreeViewWaiting[item.id] = true
    }

    return '\u231B'
  }

  const citekey = KeyManager.get(item.id)
  return (citekey.citekey || '\u26A0') + (citekey.pinned ? ' \uD83D\uDCCC' : '')
})

import * as CAYW from './cayw'
$patch$(Zotero.Integration, 'getApplication', original => function Zotero_Integration_getApplication(agent, command, docId) {
  if (agent === 'BetterBibTeX') return CAYW.Application
  return original.apply(this, arguments)
})

/* bugger this, I don't want megabytes of shared code in the translators */
import * as DateParser from './dateparser'
// import CiteProc = require('./citeproc.ts')
import { qualityReport } from './qr-check'
import { titleCase } from './case'
import { HTMLParser } from './markupparser'

Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  qrCheck(sandbox, value, test, params = null) { return qualityReport(value, test, params) },

  parseDate(sandbox, date) { return DateParser.parse(date, Zotero.BetterBibTeX.localeDateOrder) },
  getLocaleDateOrder(sandbox) { return Zotero.BetterBibTeX.localeDateOrder },

  isEDTF(sandbox, date, minuteLevelPrecision = false) { return DateParser.isEDTF(date, minuteLevelPrecision) },

  titleCase(sandbox, text) { return titleCase(text) },
  parseHTML(sandbox, text, options) {
    options = {
      ...options,
      exportBraceProtection: Prefs.get('exportBraceProtection'),
      csquotes: Prefs.get('csquotes'),
      exportTitleCase: Prefs.get('exportTitleCase'),
    }
    return HTMLParser.parse(text.toString(), options)
  },
  // extractFields(sandbox, item) { return Extra.get(item.extra) },
  debugEnabled(sandbox) { return Zotero.Debug.enabled },

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

  strToISO(sandbox, str) { return DateParser.strToISO(str, Zotero.BetterBibTeX.localeDateOrder) },
}

Zotero.Translate.Import.prototype.Sandbox.BetterBibTeX = {
  debugEnabled(sandbox) { return Zotero.Debug.enabled },
  parseHTML(sandbox, text, options) {
    options = {
      ...options,
      exportBraceProtection: Prefs.get('exportBraceProtection'),
      csquotes: Prefs.get('csquotes'),
      exportTitleCase: Prefs.get('exportTitleCase'),
    }
    return HTMLParser.parse(text.toString(), options)
  },
  parseDate(sandbox, date) { return DateParser.parse(date, Zotero.BetterBibTeX.localeDateOrder) },
}

$patch$(Zotero.Utilities.Internal, 'itemToExportFormat', original => function Zotero_Utilities_Internal_itemToExportFormat(zoteroItem, legacy, skipChildItems) {
  const serialized = original.apply(this, arguments)
  return Serializer.enrich(serialized, zoteroItem)
})

// so BBT-JSON can be imported without extra-field meddling
$patch$(Zotero.Utilities.Internal, 'extractExtraFields', original => function Zotero_Utilities_Internal_extractExtraFields(extra, item, additionalFields) {
  if (extra && extra.startsWith('\x1BBBT\x1B')) return { itemType: null, fields: new Map(), creators: [], extra: extra.replace('\x1BBBT\x1B', '') }
  return original.apply(this, arguments)
})

$patch$(Zotero.Translate.Export.prototype, 'translate', original => function Zotero_Translate_Export_prototype_translate() {
  try {
    /* requested translator */
    let translatorID = this.translator[0]
    if (translatorID.translatorID) translatorID = translatorID.translatorID
    const translator = Translators.byId[translatorID]

    if (translator) {
      if (this.location) {
        if (this._displayOptions.exportFileData) { // when exporting file data, the user was asked to pick a directory rather than a file
          this._displayOptions.exportDir = this.location.path
          this._displayOptions.exportPath = OS.Path.join(this.location.path, `${this.location.leafName}.${translator.target}`)
        } else {
          this._displayOptions.exportDir = this.location.parent.path
          this._displayOptions.exportPath = this.location.path
        }

        let postscript = Prefs.get('postscriptOverride')
        if (postscript) {
          postscript = OS.Path.join(this._displayOptions.exportDir, postscript)
          try {
            // cannot use await OS.File.exists here because we may be invoked in noWait mode
            if ((new FileUtils.File(postscript)).exists()) {
              // adding the literal 'Translator.exportDir' makes sure caching is disabled
              this._displayOptions.preference_postscript = `// postscript override in Translator.exportDir ${this._displayOptions.exportDir}\n\n${Zotero.File.getContents(postscript)}`
            }
          } catch (err) {
            log.error('failed to load postscript override', postscript, err)
          }
        }
      }

      let capture = this._displayOptions?.keepUpdated

      if (capture) {
        // this should never occur -- keepUpdated should only be settable if you do a file export
        if (! this.location?.path) {
          flash('Auto-export not registered', 'Auto-export only supported for exports to file -- please report this, you should not have seen this message')
          capture = false
        }

        // this should never occur -- the JS in exportOptions.ts should prevent it
        if (this._displayOptions.exportFileData) {
          flash('Auto-export not registered', 'Auto-export does not support file data export -- please report this, you should not have seen this message')
          capture = false
        }

        if (! ['library', 'collection'].includes(this._export?.type)) {
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

      // check for SMB path for #1396
      if (!this.noWait && Prefs.get('workers') && !Translators.workers.disabled && (!this.location || !this.location.path.startsWith('\\\\'))) {
        const path = this.location?.path

        // fake out the stuff that complete expects to be set by .translate
        this._currentState = 'translate'
        this.saveQueue = []
        this._savingAttachments = []

        Translators.exportItemsByQueuedWorker(translatorID, this._displayOptions, { scope: { ...this._export, getter: this._itemGetter }, path })
          .then(result => {
            this.string = result
            this.complete(result)
          })
          .catch(err => {
            log.error('worker translation failed, error:', err)
            this.complete(null, err)
          })
        return
      }
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
    async notify(...args) {
      await BetterBibTeX.ready
      await handler.apply(null, args)
    },
  }, [event], 'BetterBibTeX', 1)
}

notify('item-tag', (action, type, ids, extraData) => {
  ids = ids.map(item_tag => parseInt(item_tag.split('-')[0]))

  Cache.remove(ids, `item ${ids} changed`)
  Events.emit('items-changed', ids)
})

notify('item', async (action, type, ids, extraData) => {
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

  notifyItemsChanged(items)

  // do this last because it will trigger a re-call of this notifier handler
  if (['add', 'modify'].includes(action) && Prefs.get('correctTitleCase') !== 'off') {
    await sleep(Prefs.get('itemObserverDelay'))

    const save = action === 'add' && Prefs.get('correctTitleCase') === 'warn+change'
    const sentenceCased = await Zotero.BetterBibTeX.sentenceCase({ items, save, tag: true })

    if (!save && sentenceCased.length) {
      const actioned = action.replace('y', 'i') + 'ed'
      const title = `Possibly title-cased title${sentenceCased.length > 1 ? 's' : ''} ${actioned}`
      const body = sentenceCased.length === 1
        ? `${sentenceCased.length} item ${actioned} which looks like it has a title-cased title`
        : `${sentenceCased.length} items ${actioned} which look like they have title-cased titles`
      flash(title, body, 3) // tslint:disable-line:no-magic-numbers
    }
  }
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

type TimerHandle = ReturnType<typeof setInterval>
class Progress {
  private timestamp: number
  private started: number
  private msg: string
  private progressWin: any
  private progress: any
  private name: string = 'Startup progress'
  private timer: TimerHandle

  private waiting() {
    function show(v) {
      if (typeof v === 'undefined') return 'unset'
      return v ? 'pending' : 'resolved'
    }

    const initializationPromise = show(Zotero.initializationPromise?.isPending())
    const schemaUpdatePromise = show(Zotero.Schema?.schemaUpdatePromise?.isPending())

    log.debug(`${this.name}: Zotero locks after ${Date.now() - this.started}:`,
      'Zotero.initializationPromise:', initializationPromise,
      ', Zotero.Schema.schemaUpdatePromise:', schemaUpdatePromise
    )

    if (initializationPromise === 'resolved' && schemaUpdatePromise === 'resolved') {
      clearTimeout(this.timer)
    }
  }

  public async start(msg) {
    this.started = this.timestamp = Date.now()
    this.timer = setInterval(this.waiting.bind(this), 500) // tslint:disable-line:no-magic-numbers

    this.msg = msg || 'Initializing'

    log.debug(`${this.name}: waiting for Zotero locks...`)

    log.debug(`${this.name}: ${msg}...`)
    this.toggle(true)
    log.debug(`${this.name}: progress window up`)
  }

  public update(msg) {
    this.bench(msg)

    log.debug(`${this.name}: ${msg}...`)
    this.progress.setText(msg)
  }

  public done() {
    this.bench(null)

    this.toggle(false)
    log.debug(`${this.name}: done`)
    clearTimeout(this.timer)
  }

  private bench(msg) {
    const ts = Date.now()
    // tslint:disable-next-line:no-magic-numbers
    if (this.msg) log.debug(`${this.name}:`, this.msg, 'took', (ts - this.timestamp) / 1000.0, 's')
    this.msg = msg
    this.timestamp = ts
  }

  private toggle(busy) {
    if (busy) {
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
  public localeDateOrder: string = Zotero.Date.getLocaleDateOrder()
  public ready: any
  public loaded: any
  public dir: string

  private strings: any
  private firstRun: { citekeyFormat: String, dragndrop: boolean, unabbreviate: boolean, strings: boolean }
  private document: any

  public async load(document: any) {
    this.document = document

    this.strings = this.document.getElementById('zotero-better-bibtex-strings')

    if (!this.loaded) await this.init()
  }

  public debugEnabled() {
    return Zotero.Debug.enabled
  }

  public getString(id, params = null) {
    if (!this.strings || typeof this.strings.getString !== 'function') {
      log.error('getString called before strings were loaded', id)
      return id
    }

    try {
      const str = this.strings.getString(id)
      return params ? format(str, params) : str
    } catch (err) {
      log.error('getString', id, err)
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

        let name = OS.Path.basename(aux)
        name = name.lastIndexOf('.') > 0 ? name.substr(0, name.lastIndexOf('.')) : name
        const tag = { value: name }
        if (!ps.prompt(null, this.getString('BetterBibTeX.auxScan.title'), this.getString('BetterBibTeX.auxScan.prompt'), tag, null, {})) return
        if (!tag.value) return

        await AUXScanner.scan(aux, { tag: tag.value })
        break

      default:
        flash(`Unsupported aux-scan target ${target}`)
        break
    }
  }

  public async sentenceCase(options: { items?: any[], tag?: boolean, save?: boolean } = {}) {
    options.items = options.items || Zotero.getActiveZoteroPane().getSelectedItems()
    options.tag = options.tag || options.items.length > 1
    const tag = Prefs.get('tagCorrectedTitleCase')
    const items = options.items.filter(item => {
      if (item.hasTag(tag)) return false

      let modified = false

      const title = item.getField('title')
      let sentenceCased = sentenceCase(title)
      if (title !== sentenceCased) {
        modified = true
        if (options.save) item.setField('title', sentenceCased)
      }

      const shortTitle = item.getField('shortTitle')
      if (sentenceCased.toLowerCase().startsWith(shortTitle.toLowerCase())) {
        sentenceCased = sentenceCased.substr(0, shortTitle.length)
        if (shortTitle !== sentenceCased) {
          if (options.save) item.setField('shortTitle', sentenceCased)
          modified = true
        }
      }

      return modified
    })

    if (items.length && options.save) {
      async function save(item) {
        if (options.tag) item.addTag(tag, 1)
        await item.saveTx()
      }

      await Promise.all(items.map(save))
    }

    return items
  }

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
      const params = {
        wrappedJSObject: {
          citekeyFormat: 'bbt',
          dragndrop: true,
          unabbreviate: Prefs.get('importJabRefAbbreviations'),
          strings: Prefs.get('importJabRefStrings'),
        },
      }
      const ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
      ww.openWindow(null, 'chrome://zotero-better-bibtex/content/FirstRun.xul', 'better-bibtex-first-run', 'chrome,centerscreen,modal', params)
      this.firstRun = params.wrappedJSObject

      log.debug('firstRun:', this.firstRun)

      Prefs.set('citekeyFormat', (this.firstRun.citekeyFormat === 'zotero') ? '[zotero:clean]' : citekeyFormat.substr(1))
      Prefs.set('importJabRefAbbreviations', this.firstRun.unabbreviate)
      Prefs.set('importJabRefStrings', this.firstRun.strings)
    } else {
      this.firstRun = null
    }

    if (Zotero.BBTTRacer) {
      flash(
        'BBT TRACE LOGGING IS ENABLED',
        'BBT trace logging is enabled in this build.\nZotero will run very slowly.\nThis is intended for debugging ONLY.',
        20 // tslint:disable-line:no-magic-numbers
      )
    }
    const progress = new Progress
    await progress.start(this.getString('BetterBibTeX.startup.waitingForZotero'))

    // Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
    await Zotero.initializationPromise

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
