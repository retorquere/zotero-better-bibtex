/* eslint-disable prefer-rest-params */

import type BluebirdPromise from 'bluebird'

Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

import type { XUL } from '../typings/xul'
import './startup' // disable monkey patching is unsupported environment

import { ZoteroPane, ZoteroPaneConstructable } from './ZoteroPane'
import { ExportOptions, ExportOptionsConstructable } from './ExportOptions'
import { ItemPane, ItemPaneConstructable } from './ItemPane'
import { FirstRun } from './FirstRun'
import { PrefPane, PrefPaneConstructable } from './Preferences'
import { ErrorReport } from './ErrorReport'
import { patch as $patch$ } from './monkey-patch'
import { clean_pane_persist } from './clean_pane_persist'
import { flash } from './flash'
import { Deferred } from './deferred'

import { Preference } from '../gen/preferences' // needs to be here early, initializes the prefs observer
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
import { Serializer } from './serializer'
import { JournalAbbrev } from './journal-abbrev'
import { AutoExport } from './auto-export'
import { KeyManager } from './key-manager'
import { TestSupport } from './test-support'
import { TeXstudio } from './tex-studio'
import { $and } from './db/loki'
import format = require('string-template')
import { cloneDeep } from 'lodash'

// UNINSTALL
AddonManager.addAddonListener({
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  onUninstalling(addon: { id: string }, _needsRestart: any) {
    if (addon.id !== 'better-bibtex@iris-advies.com') return null

    clean_pane_persist()
    const quickCopy = Zotero.Prefs.get('export.quickCopy.setting')
    for (const [label, metadata] of (Object.entries(Translators.byName) )) {
      if (quickCopy === `export=${metadata.translatorID}`) Zotero.Prefs.clear('export.quickCopy.setting')

      try {
        Translators.uninstall(label)
      }
      catch (error) {}
    }

    Zotero.BetterBibTeX.uninstalled = true
  },

  onDisabling(addon: any, needsRestart: any) { this.onUninstalling(addon, needsRestart) },

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  async onOperationCancelled(addon: { id: string, pendingOperations: number }, _needsRestart: any) {
    if (addon.id !== 'better-bibtex@iris-advies.com') return null
    // eslint-disable-next-line no-bitwise
    if (addon.pendingOperations & (AddonManager.PENDING_UNINSTALL | AddonManager.PENDING_DISABLE)) return null

    for (const header of Object.values(Translators.byId)) {
      try {
        await Translators.install(header)
      }
      catch (err) {
        log.error(err)
      }
    }

    delete Zotero.BetterBibTeX.uninstalled
  },
})

/*
  MONKEY PATCHES
*/

if (Preference.citeprocNoteCitekey) {
  $patch$(Zotero.Utilities, 'itemToCSLJSON', original => function itemToCSLJSON(zoteroItem: { itemID: any }) {
    const cslItem = original.apply(this, arguments)

    if (typeof Zotero.Item !== 'undefined' && !(zoteroItem instanceof Zotero.Item)) {
      const citekey = Zotero.BetterBibTeX.KeyManager.get(zoteroItem.itemID)
      if (citekey) {
        cslItem.note = citekey.citekey
      }
      else {
        delete cslItem.note
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cslItem
  })
}

// https://github.com/retorquere/zotero-better-bibtex/issues/1221
$patch$(Zotero.Items, 'merge', original => async function Zotero_Items_merge(item: ZoteroItem, otherItems: ZoteroItem[]) {
  try {
    // log.verbose = true
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const merge = {
      citationKey: Preference.extraMergeCitekeys,
      tex: Preference.extraMergeTeX,
      kv: Preference.extraMergeCSL,
    }

    if (merge.citationKey || merge.tex || merge.kv) {
      const extra = Extra.get(item.getField('extra') as string, 'zotero', { citationKey: merge.citationKey, aliases: merge.citationKey, tex: merge.tex, kv: merge.kv })
      if (!extra.extraFields.citationKey) { // why is the citationkey stripped from extra before we get to this point?!
        const pinned = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ itemID: item.id }))
        if (pinned.pinned) extra.extraFields.citationKey = pinned.citekey
      }

      // get citekeys of other items
      if (merge.citationKey) {
        const otherIDs = otherItems.map(i => i.id)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        extra.extraFields.aliases = [...extra.extraFields.aliases, ...(Zotero.BetterBibTeX.KeyManager.keys.find($and({ itemID: { $in: otherIDs }})).map((i: { citekey: string }) => i.citekey))]
      }

      // add any aliases they were already holding
      for (const i of otherItems) {
        const otherExtra = Extra.get(i.getField('extra') as string, 'zotero', { citationKey: merge.citationKey, aliases: merge.citationKey, tex: merge.tex, kv: merge.kv })

        if (merge.citationKey) {
          extra.extraFields.aliases = [...extra.extraFields.aliases, ...otherExtra.extraFields.aliases]
          if (otherExtra.extraFields.citationKey) extra.extraFields.aliases.push(otherExtra.extraFields.citationKey)
        }

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
            }
            else if (Array.isArray(existing) && Array.isArray(value)) {
              for (const creator in value) {
                if (!existing.includes(creator)) existing.push(creator)
              }
            }
          }
        }
      }

      if (merge.citationKey) {
        const citekey = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ itemID: item.id })).citekey
        extra.extraFields.aliases = extra.extraFields.aliases.filter(alias => alias !== citekey)
      }

      item.setField('extra', Extra.set(extra.extra, {
        // keep pinned if it was before
        citationKey: merge.citationKey ? extra.extraFields.citationKey : undefined,
        aliases: merge.citationKey ? extra.extraFields.aliases : undefined,
        tex: merge.tex ? extra.extraFields.tex : undefined,
        kv: merge.kv ? extra.extraFields.kv : undefined,
      }))
    }

  }
  catch (err) {
    log.error('Zotero.Items.merge:', err)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await original.apply(this, arguments)
})

// https://github.com/retorquere/zotero-better-bibtex/issues/769
$patch$(Zotero.DataObjects.prototype, 'parseLibraryKeyHash', original => function Zotero_DataObjects_prototype_parseLibraryKeyHash(id: string) {
  try {
    const decoded_id = decodeURIComponent(id)
    if (decoded_id[0] === '@') {
      const item = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ citekey: decoded_id.substring(1) }))
      if (item) return { libraryID: item.libraryID, key: item.itemKey }
    }

    const m = decoded_id.match(/^bbt:(?:{([0-9]+)})?(.*)/)
    if (m) {
      const [_libraryID, citekey] = m.slice(1)
      const libraryID: number = (!_libraryID || _libraryID === '1') ? Zotero.Libraries.userLibraryID : parseInt(_libraryID)
      const item = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ libraryID, citekey }))
      if (item) return { libraryID: item.libraryID, key: item.itemKey }
    }
  }
  catch (err) {
    log.error('parseLibraryKeyHash:', id, err)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

// otherwise the display of the citekey in the item pane flames out
$patch$(Zotero.ItemFields, 'isFieldOfBase', original => function Zotero_ItemFields_isFieldOfBase(field: string, _baseField: any) {
  if (['citekey', 'itemID'].includes(field)) return false
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

// because the zotero item editor does not check whether a textbox is read-only. *sigh*
$patch$(Zotero.Item.prototype, 'setField', original => function Zotero_Item_prototype_setField(field: string, _value: any, _loadIn: any) {
  if (['citekey', 'itemID'].includes(field)) return false
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

// To show the citekey in the reference list
$patch$(Zotero.Item.prototype, 'getField', original => function Zotero_Item_prototype_getField(field: any, unformatted: any, includeBaseMapped: any) {
  try {
    switch (field) {
      case 'citekey':
      case 'citationKey':
        if (Zotero.BetterBibTeX.ready.isPending()) return '' // eslint-disable-line @typescript-eslint/no-use-before-define
        return Zotero.BetterBibTeX.KeyManager.get(this.id).citekey as string

      case 'itemID':
        return `${this.id}`

    }
  }
  catch (err) {
    log.error('patched getField:', {field, unformatted, includeBaseMapped, err})
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments) as string
})

// #1579
$patch$(Zotero.Item.prototype, 'clone', original => function Zotero_Item_prototype_clone(libraryID: any, options = {}) {
  const item = original.apply(this, arguments)
  try {
    if (item.isRegularItem()) item.setField('extra', (item.getField('extra') || '').split('\n').filter((line: string) => !(line.toLowerCase().startsWith('citation key:'))).join('\n'))
  }
  catch (err) {
    log.error('patched clone:', {libraryID, options, err})
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return item
})

const itemTreeViewWaiting: Record<number, boolean> = {}
$patch$(Zotero.ItemTreeView.prototype, 'getCellText', original => function Zotero_ItemTreeView_prototype_getCellText(row: any, col: { id: string }): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (col.id !== 'zotero-items-column-citekey') return original.apply(this, arguments)

  const item = this.getRow(row).ref
  if (item.isNote() || item.isAttachment() || item.isAnnotation?.()) return ''

  if (Zotero.BetterBibTeX.ready.isPending()) { // eslint-disable-line @typescript-eslint/no-use-before-define
    if (!itemTreeViewWaiting[item.id]) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      Zotero.BetterBibTeX.ready.then(() => this._treebox.invalidateCell(row, col)) // eslint-disable-line @typescript-eslint/no-floating-promises
      itemTreeViewWaiting[item.id] = true
    }

    return '\u231B'
  }

  const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id)
  return `${citekey.citekey || '\u26A0'}${citekey.pinned ? ' \uD83D\uDCCC' : ''}`
})

import * as CAYW from './cayw'
$patch$(Zotero.Integration, 'getApplication', original => function Zotero_Integration_getApplication(agent: string, _command: any, _docId: any) {
  if (agent === 'BetterBibTeX') return CAYW.Application
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

/* bugger this, I don't want megabytes of shared code in the translators */
import * as DateParser from './dateparser'
// import CiteProc = require('./citeproc.ts')
import { qualityReport } from './qr-check'
import { titleCase } from './case'
import { HTMLParser } from './markupparser'
import type { ParsedDate } from './dateparser'

Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  qrCheck(_sandbox: any, value: string, test: string, params = null) { return qualityReport(value, test, params) },

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  parseDate(_sandbox: any, date: string): ParsedDate { return DateParser.parse(date, Zotero.BetterBibTeX.localeDateOrder) },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getLocaleDateOrder(_sandbox: any): string { return Zotero.BetterBibTeX.localeDateOrder },

  isEDTF(_sandbox: any, date: string, minuteLevelPrecision = false) { return DateParser.isEDTF(date, minuteLevelPrecision) },

  titleCase(_sandbox: any, text: string): string { return titleCase(text) },
  parseHTML(_sandbox: any, text: { toString: () => any }, options: { html?: boolean, caseConversion?: boolean, exportBraceProtection: boolean, csquotes: string, exportTitleCase: boolean }) {
    options = {
      ...options,
      exportBraceProtection: Preference.exportBraceProtection,
      csquotes: Preference.csquotes,
      exportTitleCase: Preference.exportTitleCase,
    }
    return HTMLParser.parse(text.toString(), options)
  },
  // extractFields(_sandbox, item) { return Extra.get(item.extra) },
  debugEnabled(_sandbox: any): boolean { return (Zotero.Debug.enabled as boolean) },

  cacheFetch(sandbox: { translator: { label: string }[] }, itemID: number, options: { exportNotes: boolean, useJournalAbbreviation: boolean }, prefs: any) {
    const collection = Cache.getCollection(sandbox.translator[0].label)
    if (!collection) return false

    // not safe in async!
    const cloneObjects = collection.cloneObjects
    collection.cloneObjects = false
    const cached = collection.findOne($and({...cacheSelector(sandbox.translator[0].label, options, prefs), itemID}))
    collection.cloneObjects = cloneObjects

    if (!cached) return false

    // collection.update(cached) // touches the cache object so it isn't reaped too early

    // direct-DB access for speed...
    cached.meta.updated = (new Date).getTime() // touches the cache object so it isn't reaped too early
    collection.dirty = true

    // isolate object, because it was not fetched using clone
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cloneDeep(cached)
  },

  cacheStore(sandbox: { translator: { label: string }[] }, itemID: number, options: { exportNotes: boolean, useJournalAbbreviation: boolean }, prefs: any, reference: any, metadata: any) {
    if (!metadata) metadata = {}

    const collection = Cache.getCollection(sandbox.translator[0].label)
    if (!collection) {
      log.error('cacheStore: cache', sandbox.translator[0].label, 'not found')
      return false
    }

    const selector = {...cacheSelector(sandbox.translator[0].label, options, prefs), itemID}
    let cached = collection.findOne($and(selector))

    if (cached) {
      cached.reference = reference
      cached.metadata = metadata
      cached = collection.update(cached)

    }
    else {
      cached = collection.insert({...selector, reference, metadata})

    }

    return true
  },

  strToISO(_sandbox: any, str: string) { return DateParser.strToISO(str, Zotero.BetterBibTeX.localeDateOrder) },
}

Zotero.Translate.Import.prototype.Sandbox.BetterBibTeX = {
  debugEnabled(_sandbox: any): boolean { return (Zotero.Debug.enabled as boolean) },
  parseHTML(_sandbox: any, text: { toString: () => any }, options: { html?: boolean, caseConversion?: boolean, exportBraceProtection: boolean, csquotes: string, exportTitleCase: boolean }) {
    options = {
      ...options,
      exportBraceProtection: Preference.exportBraceProtection,
      csquotes: Preference.csquotes,
      exportTitleCase: Preference.exportTitleCase,
    }
    return HTMLParser.parse(text.toString(), options)
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  parseDate(_sandbox: any, date: string): ParsedDate { return DateParser.parse(date, Zotero.BetterBibTeX.localeDateOrder) },
}

$patch$(Zotero.Utilities.Internal, 'itemToExportFormat', original => function Zotero_Utilities_Internal_itemToExportFormat(zoteroItem: any, _legacy: any, _skipChildItems: any) {
  const serialized = original.apply(this, arguments)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Serializer.enrich(serialized, zoteroItem)
})

// so BBT-JSON can be imported without extra-field meddling
$patch$(Zotero.Utilities.Internal, 'extractExtraFields', original => function Zotero_Utilities_Internal_extractExtraFields(extra: string, _item: any, _additionalFields: any) {
  if (extra && extra.startsWith('\x1BBBT\x1B')) {
    return { itemType: null, fields: new Map(), creators: [], extra: extra.replace('\x1BBBT\x1B', '') }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
        }
        else {
          this._displayOptions.exportDir = this.location.parent.path
          this._displayOptions.exportPath = this.location.path
        }

        let postscript = Preference.postscriptOverride
        if (postscript) {
          postscript = OS.Path.join(this._displayOptions.exportDir, postscript)
          try {
            // cannot use await OS.File.exists here because we may be invoked in noWait mode
            if ((new FileUtils.File(postscript)).exists()) {
              // adding the literal 'Translator.exportDir' makes sure caching is disabled
              this._displayOptions.preference_postscript = `// postscript override in Translator.exportDir ${this._displayOptions.exportDir}\n\n${Zotero.File.getContents(postscript)}`
            }
          }
          catch (err) {
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

      let disabled = ''
      if (this.noWait) { // noWait must be synchronous
        disabled = 'noWait is active'
      }
      else if (!Preference.workersMax) {
        disabled = 'user has disabled worker export'
      }
      else if (Translators.workers.disabled) {
        // there wasn't an error starting a worker earlier
        disabled = 'failed to start a chromeworker, disabled until restart'
      }
      else if (this.location && this.location.path.startsWith('\\\\')) {
        // check for SMB path for #1396
        disabled = 'chrome workers fail on smb paths'
      }
      else {
        disabled = Object.keys(this._handlers).filter(handler => !['done', 'itemDone', 'error'].includes(handler)).join(', ')
        if (disabled) disabled = `handlers: ${disabled}`
      }
      log.debug('worker translation:', !disabled, disabled)
      if (!disabled) {
        const path = this.location?.path

        // fake out the stuff that complete expects to be set by .translate
        this._currentState = 'translate'
        this.saveQueue = []
        this._savingAttachments = []

        return Translators.exportItemsByQueuedWorker(translatorID, this._displayOptions, { translate: this, scope: { ...this._export, getter: this._itemGetter }, path })
          .then(result => {
            log.debug('worker translation done, result:', !!result)
            // eslint-disable-next-line id-blacklist
            this.string = result
            this.complete(result || true)
          })
          .catch(err => {
            log.error('worker translation failed, error:', err)
            this.complete(null, err)
          })
      }
    }
  }
  catch (err) {
    log.error('Zotero.Translate.Export::translate error:', err)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

/*
  EVENTS
*/

function notify(event: string, handler: any) {
  Zotero.Notifier.registerObserver({
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    notify(...args: any[]) {
      Zotero.BetterBibTeX.ready.then(() => { // eslint-disable-line @typescript-eslint/no-use-before-define, @typescript-eslint/no-floating-promises
        // eslint-disable-next-line prefer-spread
        handler.apply(null, args)
      })
    },
  }, [event], 'BetterBibTeX', 1)
}

notify('item-tag', (_action: any, _type: any, ids: any[], _extraData: any) => {
  ids = ids.map((item_tag: string) => parseInt(item_tag.split('-')[0]))

  Cache.remove(ids, `item ${ids} changed`)
  Events.emit('items-changed', ids)
})

notify('item', (action: string, type: any, ids: any[], extraData: { [x: string]: { bbtCitekeyUpdate: any } }) => {
  // prevents update loop -- see KeyManager.init()
  if (action === 'modify') {
    ids = ids.filter((id: string | number) => !extraData[id] || !extraData[id].bbtCitekeyUpdate)
    if (!ids.length) return
  }

  Cache.remove(ids, `item ${ids} changed`)

  // safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
  // https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
  const parents = []
  const items = action === 'delete' ? [] : Zotero.Items.get(ids).filter((item: ZoteroItem) => {
    if (item.isNote() || item.isAttachment() || item.isAnnotation?.()) {
      if (typeof item.parentID !== 'boolean') parents.push(item.parentID)
      return false
    }

    return true
  })
  if (parents.length) Cache.remove(parents, `parent items ${parents} changed`)

  switch (action) {
    case 'delete':
    case 'trash':
      Zotero.BetterBibTeX.KeyManager.remove(ids)
      Events.emit('items-removed', ids)
      break

    case 'add':
    case 'modify':
      // eslint-disable-next-line no-case-declarations
      let warn_titlecase = Preference.warnTitleCased ? 0 : null
      for (const item of items) {
        Zotero.BetterBibTeX.KeyManager.update(item)
        if (typeof warn_titlecase === 'number' && !item.isNote() && !item.isAttachment() && !item.isAnnotation?.()) {
          const title = item.getField('title')
          if (title !== sentenceCase(title)) warn_titlecase += 1
        }
      }
      if (typeof warn_titlecase === 'number' && warn_titlecase) {
        const actioned = action === 'add' ? 'added' : 'saved'
        const msg = warn_titlecase === 1
          ? `${warn_titlecase} item ${actioned} which looks like it has a title-cased title`
          : `${warn_titlecase} items ${actioned} which look like they have title-cased titles`
        flash(`Possibly title-cased title${warn_titlecase > 1 ? 's' : ''} ${actioned}`, msg, 3) // eslint-disable-line no-magic-numbers
      }
      break

    default:
      return
  }

  notifyItemsChanged(items)
})

notify('collection', (event: string, _type: any, ids: string | any[], _extraData: any) => {
  if ((event === 'delete') && ids.length) Events.emit('collections-removed', ids)
})

notify('group', (event: string, _type: any, ids: string | any[], _extraData: any) => {
  if ((event === 'delete') && ids.length) Events.emit('libraries-removed', ids)
})

notify('collection-item', (_event: any, _type: any, collection_items: any) => {
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

// type TimerHandle = ReturnType<typeof setInterval>
class Progress {
  private timestamp: number
  private msg: string
  private progressWin: any
  private progress: any
  private name = 'Startup progress'
  private mode: string
  private label: XUL.Label
  private progressmeter: XUL.ProgressMeter

  public start(msg: string) {
    this.timestamp = Date.now()

    this.msg = msg || 'Initializing'

    if (!['progressbar', 'popup'].includes(Preference.startupProgress)) Preference.startupProgress = 'popup'
    this.mode = Preference.startupProgress

    log.debug(`${this.name}: waiting for Zotero locks...`)

    log.debug(`${this.name}: ${msg}...`)
    if (this.mode === 'popup') {
      this.progressWin = new Zotero.ProgressWindow({ closeOnClick: false })
      this.progressWin.changeHeadline('Better BibTeX: Initializing')
      // this.progressWin.addDescription(`Found ${this.scanning.length} references without a citation key`)
      const icon = `chrome://zotero/skin/treesource-unfiled${Zotero.hiDPI ? '@2x' : ''}.png`
      this.progress = new this.progressWin.ItemProgress(icon, `${this.msg}...`)
      this.progressWin.show()
    }
    else {
      document.getElementById('better-bibtex-progress').hidden = false
      this.progressmeter = (document.getElementById('better-bibtex-progress-meter') as unknown as XUL.ProgressMeter)
      this.progressmeter.value = 0
      this.label = (document.getElementById('better-bibtex-progress-label') as unknown as XUL.Label)
      this.label.value = msg
    }
  }

  public update(msg: string, progress: number) {
    this.bench(msg)

    log.debug(`${this.name}: ${msg}...`)
    if (this.mode === 'popup') {
      this.progress.setText(msg)
    }
    else {
      this.progressmeter.value = progress
      this.label.value = msg
    }
  }

  public done() {
    this.bench(null)

    if (this.mode === 'popup') {
      this.progress.setText('Ready')
      this.progressWin.startCloseTimer(500) // eslint-disable-line no-magic-numbers
    }
    else {
      document.getElementById('better-bibtex-progress').hidden = true
    }

    log.debug(`${this.name}: done`)
  }

  private bench(msg: string) {
    const ts = Date.now()
    // eslint-disable-next-line no-magic-numbers
    if (this.msg) log.debug(`${this.name}:`, this.msg, 'took', (ts - this.timestamp) / 1000.0, 's')
    this.msg = msg
    this.timestamp = ts
  }
}

export class BetterBibTeX {
  public TestSupport = new TestSupport
  public KeyManager = new KeyManager
  public ZoteroPane: ZoteroPaneConstructable = ZoteroPane
  public ExportOptions: ExportOptionsConstructable = ExportOptions
  public ItemPane: ItemPaneConstructable = ItemPane
  public FirstRun = FirstRun
  public ErrorReport = ErrorReport
  public PrefPane: PrefPaneConstructable = PrefPane

  public localeDateOrder: string = Zotero.Date.getLocaleDateOrder()
  public ready: BluebirdPromise<boolean>
  public loaded: BluebirdPromise<boolean>
  public dir: string

  private strings: any
  private firstRun: { citekeyFormat: string, dragndrop: boolean, unabbreviate: boolean, strings: boolean }
  private globals: Record<string, any>
  public debugEnabledAtStart: boolean

  constructor() {
    this.debugEnabledAtStart = Zotero.Debug.enabled
  }

  public debugEnabled(): boolean {
    return (Zotero.Debug.enabled as boolean)
  }

  public getString(id: string, params: any = null): string {
    if (!this.strings || typeof this.strings.getString !== 'function') {
      log.error('getString called before strings were loaded', id)
      return id
    }

    try {
      const str: string = this.strings.getString(id)
      return params ? (format(str, params) as string) : str
    }
    catch (err) {
      log.error('getString', id, err)
      return id
    }
  }

  public async scanAUX(target: string): Promise<void> {
    if (!this.loaded) return // eslint-disable-line @typescript-eslint/no-misused-promises
    await this.loaded

    const aux = await AUXScanner.pick()
    if (!aux) return

    switch (target) {
      case 'collection':
        await AUXScanner.scan(aux)
        break

      case 'tag':
        // eslint-disable-next-line no-case-declarations
        const ps = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService)

        // eslint-disable-next-line no-case-declarations
        let name = OS.Path.basename(aux)
        name = name.lastIndexOf('.') > 0 ? name.substr(0, name.lastIndexOf('.')) : name
        // eslint-disable-next-line no-case-declarations
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

  public openDialog(url: string, title: string, properties: string, params: Record<string, any>): void {
    this.globals.window.openDialog(url, title, properties, params)
  }

  public async load(globals: any): Promise<void> { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    this.globals = globals
    if (this.loaded) return // eslint-disable-line @typescript-eslint/no-misused-promises

    this.strings = globals.document.getElementById('zotero-better-bibtex-strings')

    const deferred = {
      loaded: new Deferred<boolean>(),
      ready: new Deferred<boolean>(),
    }
    this.ready = deferred.ready.promise
    this.loaded = deferred.loaded.promise

    if (typeof this.ready.isPending !== 'function') throw new Error('Zotero.Promise is not using Bluebird')

    log.debug('Loading Better BibTeX: starting...')

    await TeXstudio.init()

    for (const node of [...globals.document.getElementsByClassName('bbt-texstudio')]) {
      node.hidden = !TeXstudio.enabled
    }

    // the zero-width-space is a marker to re-save the current default so it doesn't get replaced when the default changes later, which would change new keys suddenly
    // its presence also indicates first-run, so right after the DB is ready, configure BBT
    if (!Preference.citekeyFormat) Preference.citekeyFormat = Preference.default.citekeyFormat
    const citekeyFormat = Preference.citekeyFormat
    if (citekeyFormat.includes('\u200B')) {
      const params = {
        wrappedJSObject: {
          citekeyFormat: 'bbt',
          dragndrop: true,
          unabbreviate: Preference.importJabRefAbbreviations,
          strings: Preference.importJabRefStrings,
        },
      }
      const ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
      ww.openWindow(null, 'chrome://zotero-better-bibtex/content/FirstRun.xul', 'better-bibtex-first-run', 'chrome,centerscreen,modal', params)
      this.firstRun = params.wrappedJSObject

      log.debug('firstRun:', this.firstRun)

      Preference.citekeyFormat = (this.firstRun.citekeyFormat === 'zotero') ? '[zotero:clean]' : citekeyFormat.replace(/\u200B/g, '')
      Preference.importJabRefAbbreviations = this.firstRun.unabbreviate
      Preference.importJabRefStrings = this.firstRun.strings
    }
    else {
      this.firstRun = null
    }

    if (Zotero.BBTTRacer) {
      flash(
        'BBT TRACE LOGGING IS ENABLED',
        'BBT trace logging is enabled in this build.\nZotero will run very slowly.\nThis is intended for debugging ONLY.',
        20 // eslint-disable-line no-magic-numbers
      )
    }
    const progress = new Progress
    progress.start(this.getString('BetterBibTeX.startup.waitingForZotero'))

    // Zotero startup is a hot mess; https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
    // await (Zotero.isStandalone ? Zotero.uiReadyPromise : Zotero.initializationPromise)
    await Zotero.Schema.schemaUpdatePromise

    this.dir = OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex')
    await OS.File.makeDir(this.dir, { ignoreExisting: true })

    log.debug("Zotero ready, let's roll!")

    progress.update(this.getString('BetterBibTeX.startup.loadingKeys'), 10) // eslint-disable-line no-magic-numbers
    await Promise.all([Cache.init(), DB.init()])

    await this.KeyManager.init() // loads the existing keys

    progress.update(this.getString('BetterBibTeX.startup.serializationCache'), 20) // eslint-disable-line no-magic-numbers
    Serializer.init()

    progress.update(this.getString('BetterBibTeX.startup.autoExport.load'), 30) // eslint-disable-line no-magic-numbers
    await AutoExport.init()

    // not yet started
    deferred.loaded.resolve(true)

    // this is what really takes long
    progress.update(this.getString('BetterBibTeX.startup.waitingForTranslators'), 40) // eslint-disable-line no-magic-numbers
    await Zotero.Schema.schemaUpdatePromise

    progress.update(this.getString('BetterBibTeX.startup.journalAbbrev'), 60) // eslint-disable-line no-magic-numbers
    await JournalAbbrev.init()

    progress.update(this.getString('BetterBibTeX.startup.installingTranslators'), 70) // eslint-disable-line no-magic-numbers
    await Translators.init()

    progress.update(this.getString('BetterBibTeX.startup.keyManager'), 80) // eslint-disable-line no-magic-numbers
    await this.KeyManager.start() // inits the key cache by scanning the DB and generating missing keys

    progress.update(this.getString('BetterBibTeX.startup.autoExport'), 90) // eslint-disable-line no-magic-numbers
    AutoExport.start()

    deferred.ready.resolve(true)

    progress.done()

    if (this.firstRun && this.firstRun.dragndrop) Zotero.Prefs.set('export.quickCopy.setting', `export=${Translators.byLabel.BetterBibTeXCitationKeyQuickCopy.translatorID}`)

    Events.emit('loaded')

    Events.on('export-progress', (percent: number, translator: string) => {
      const preparing = percent < 0 ? this.getString('Preferences.auto-export.status.preparing') : ''
      percent = Math.abs(percent)
      if (percent && percent < 100) { // eslint-disable-line no-magic-numbers
        document.getElementById('better-bibtex-progress').hidden = false
        const progressmeter = (document.getElementById('better-bibtex-progress-meter') as unknown as XUL.ProgressMeter)
        progressmeter.value = Math.abs(percent)

        const label = (document.getElementById('better-bibtex-progress-label') as unknown as XUL.Label)
        label.value = `${preparing} ${translator}`.trim()
      }
      else {
        document.getElementById('better-bibtex-progress').hidden = true
      }
    })
  }
}
Zotero.BetterBibTeX = Zotero.BetterBibTeX || new BetterBibTeX
