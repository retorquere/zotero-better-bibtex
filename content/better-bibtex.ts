/* eslint-disable prefer-rest-params */
import type BluebirdPromise from 'bluebird'

var window: Window // eslint-disable-line no-var
var document: Document // eslint-disable-line no-var

Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

declare const ZoteroPane: any
declare const __estrace: any // eslint-disable-line no-underscore-dangle

import type { XUL } from '../typings/xul'
import { started } from './startup' // disable monkey patching is unsupported environment

import { Elements } from './create-element'
import { ZoteroPane as ZoteroPaneHelper } from './ZoteroPane'
import { ExportOptions } from './ExportOptions'
import { ItemPane } from './ItemPane'
import { PrefPane } from './Preferences'
import { FirstRun } from './FirstRun'
import { ErrorReport } from './ErrorReport'
import { patch as $patch$ } from './monkey-patch'
import { clean_pane_persist } from './clean_pane_persist'
import { flash } from './flash'
import { Deferred } from './deferred'
import { orchestrator } from './orchestrator'

import { Preference } from './prefs' // needs to be here early, initializes the prefs observer
require('./pull-export') // just require, initializes the pull-export end points
require('./json-rpc') // just require, initializes the json-rpc end point
import { AUXScanner } from './aux-scanner'
import * as Extra from './extra'
import { sentenceCase, HTMLParser, HTMLParserOptions } from './text'

Components.utils.import('resource://gre/modules/AddonManager.jsm')
declare const AddonManager: any

import { log } from './logger'
import { Events, itemsChanged } from './events'

import { Translators } from './translators'
import { DB as Cache } from './db/cache'
import { Serializer } from './serializer'
import { AutoExport } from './auto-export'
import { KeyManager } from './key-manager'
import { TestSupport } from './test-support'
import { TeXstudio } from './tex-studio'
import { $and } from './db/loki'
import * as l10n from './l10n'
import * as CSL from 'citeproc'

import { generateBibLaTeX } from '../translators/bibtex/biblatex'
import { generateBibTeX, parseBibTeX } from '../translators/bibtex/bibtex'
import { generateCSLYAML, parseCSLYAML } from '../translators/csl/yaml'
import { generateCSLJSON } from '../translators/csl/json'
import { Translation } from '../translators/lib/translator'

// need coroutine here because Zotero calls '.done()' on the nonexistent! result, added automagically by bluebird
$patch$(Zotero, 'shutdown', original => Zotero.Promise.coroutine(function* () { // eslint-disable-line @typescript-eslint/no-unsafe-return
  try {
    yield orchestrator.shutdown()
  }
  catch (err) {
    log.error('BBT shutdown: shutdown failed', err)
  }

  yield original.apply(this, arguments)
}))

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

// zotero moved itemToCSLJSON to Zotero.Utilities.Item, jurism for the moment keeps it on ZU
$patch$(Zotero.Utilities.Item?.itemToCSLJSON ? Zotero.Utilities.Item : Zotero.Utilities, 'itemToCSLJSON', original => function itemToCSLJSON(zoteroItem: { itemID: any }) {
  const cslItem = original.apply(this, arguments)

  try {
    if (typeof Zotero.Item !== 'undefined' && !(zoteroItem instanceof Zotero.Item)) {
      const citekey = Zotero.BetterBibTeX.KeyManager.get(zoteroItem.itemID)
      if (citekey) {
        cslItem['citation-key'] = citekey.citekey
      }
    }
  }
  catch (err) {
    log.error('failed patching CSL-JSON:', err)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return cslItem
})

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
function parseLibraryKeyFromCitekey(libraryKey) {
  try {
    const decoded = decodeURIComponent(libraryKey)
    if (decoded[0] === '@') {
      const item = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ citekey: decoded.substring(1) }))

      return item ? { libraryID: item.libraryID, key: item.itemKey } : false
    }

    const m = decoded.match(/^bbt:(?:{([0-9]+)})?(.*)/)
    if (m) {
      const [_libraryID, citekey] = m.slice(1)
      const libraryID: number = (!_libraryID || _libraryID === '1') ? Zotero.Libraries.userLibraryID : parseInt(_libraryID)
      const item = Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ libraryID, citekey }))
      return item ? { libraryID: item.libraryID, key: item.itemKey } : false
    }
  }
  catch (err) {
    log.error('parseLibraryKeyFromCitekey:', libraryKey, err)
  }
  return null
}

$patch$(Zotero.API, 'getResultsFromParams', original => function Zotero_API_getResultsFromParams(params: Record<string, any>) {
  try {
    if (params.itemKey) {
      const libraryID = params.libraryID || Zotero.Libraries.userLibraryID
      params.itemKey = params.itemKey.map((itemKey: string) => {
        const m = itemKey.match(/^(bbt:|@)(.+)/)
        const citekey: { itemKey: string } = m ? Zotero.BetterBibTeX.KeyManager.keys.findOne($and({ libraryID, citekey: m[2] })) : {}
        return citekey.itemKey || itemKey
      })
    }
  }
  catch (err) {
    log.debug('getResultsFromParams', params, err)
  }

  return original.apply(this, arguments) as Record<string, any>
})

if (typeof Zotero.DataObjects.prototype.parseLibraryKeyHash === 'function') {
  $patch$(Zotero.DataObjects.prototype, 'parseLibraryKeyHash', original => function Zotero_DataObjects_prototype_parseLibraryKeyHash(libraryKey: string) {
    const item = parseLibraryKeyFromCitekey(libraryKey)
    if (item !== null) return item

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return original.apply(this, arguments)
  })
}
if (typeof Zotero.DataObjects.prototype.parseLibraryKey === 'function') {
  $patch$(Zotero.DataObjects.prototype, 'parseLibraryKey', original => function Zotero_DataObjects_prototype_parseLibraryKey(libraryKey: string) {
    const item = parseLibraryKeyFromCitekey(libraryKey)
    if (item) return item
    if (item === false) return { libraryID: Zotero.Libraries.userLibraryID, key: undefined }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return original.apply(this, arguments)
  })
}

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

// To show the citekey in the item list
$patch$(Zotero.Item.prototype, 'getField', original => function Zotero_Item_prototype_getField(field: any, unformatted: any, includeBaseMapped: any) {
  try {
    switch (field) {
      case 'citekey':
      case 'citationKey':
        if (Zotero.BetterBibTeX.ready.isPending()) return '' // eslint-disable-line @typescript-eslint/no-use-before-define
        return Zotero.BetterBibTeX.KeyManager.get(this.id).citekey

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
$patch$(Zotero.Item.prototype, 'clone', original => function Zotero_Item_prototype_clone(libraryID: number, options = {}) {
  const item = original.apply(this, arguments)
  try {
    if ((typeof libraryID === 'undefined' || this.libraryID === libraryID) && item.isRegularItem()) {
      item.setField('extra', item.getField('extra').replace(/(^|\n)citation key:[^\n]*(\n|$)/i, '\n').trim())
    }
  }
  catch (err) {
    log.error('patched clone:', {libraryID, options, err})
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return item
})


const itemTree = require('zotero/itemTree')

$patch$(itemTree.prototype, 'getColumns', original => function Zotero_ItemTree_prototype_getColumns() {
  const columns = original.apply(this, arguments)
  const insertAfter: number = columns.findIndex(column => column.dataKey === 'title')
  columns.splice(insertAfter + 1, 0, {
    dataKey: 'citationKey',
    label: l10n.localize('ZoteroPane.column.citekey'),
    flex: '1',
    zoteroPersist: new Set(['width', 'ordinal', 'hidden', 'sortActive', 'sortDirection']),
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return columns
})

$patch$(itemTree.prototype, '_renderCell', original => function Zotero_ItemTree_prototype_renderCell(index, data, col) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (col.dataKey !== 'citationKey') return original.apply(this, arguments)

  const item = this.getRow(index).ref
  const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id)

  const icon = document.createElementNS('http://www.w3.org/1999/xhtml', 'span')
  icon.innerText = citekey.pinned ? '\uD83D\uDCCC' : ''
  // icon.className = 'icon icon-bg cell-icon'

  const text = document.createElementNS('http://www.w3.org/1999/xhtml', 'span')
  text.className = 'cell-text'
  text.innerText = data

  const cell = document.createElementNS('http://www.w3.org/1999/xhtml', 'span')
  cell.className = `cell ${col.className}`
  cell.append(text, icon)

  return cell
})

import * as CAYW from './cayw'
$patch$(Zotero.Integration, 'getApplication', original => function Zotero_Integration_getApplication(agent: string, _command: any, _docId: any) {
  if (agent === 'BetterBibTeX') return CAYW.Application
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

/* bugger this, I don't want megabytes of shared code in the translators */
import * as DateParser from './dateparser'
import type { ParsedDate } from './dateparser'

Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  clientName: Zotero.clientName,
  /*
  titleCase(_sandbox: any, text: string): string { return titleCase(text) },
  parseHTML(_sandbox: any, text: { toString: () => any }, options: HTMLParserOptions) {
    options = {
      ...options,
      exportBraceProtection: Preference.exportBraceProtection,
      csquotes: Preference.csquotes,
      exportTitleCase: Preference.exportTitleCase,
    }
    return HTMLParser.parse(text.toString(), options)
  },
  */
  // extractFields(_sandbox, item) { return Extra.get(item.extra) },

  strToISO(_sandbox: any, str: string) { return DateParser.strToISO(str) },
  getContents(_sandbox: any, path: string): string { return Zotero.BetterBibTeX.getContents(path) },

  generateBibLaTeX(_sandbox: any, translation: Translation) { generateBibLaTeX(translation) },
  generateBibTeX(_sandbox: any, translation: Translation) { generateBibTeX(translation) },
  generateCSLYAML(_sandbox: any, translation: Translation) { generateCSLYAML(translation) },
  generateCSLJSON(_sandbox: any, translation: Translation) { generateCSLJSON(translation) },

  cacheFetch(sandbox: { translator: { label: string }[] }, itemID: number, options: { exportNotes: boolean, useJournalAbbreviation: boolean }, prefs: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Cache.fetch(sandbox.translator[0].label, itemID, options, prefs)
  },

  cacheStore(sandbox: { translator: { label: string }[] }, itemID: number, options: { exportNotes: boolean, useJournalAbbreviation: boolean }, prefs: any, entry: any, metadata: any) {
    return Cache.store(sandbox.translator[0].label, itemID, options, prefs, entry, metadata)
  },
  parseDate(_sandbox: any, date: string): ParsedDate { return DateParser.parse(date) },
}

Zotero.Translate.Import.prototype.Sandbox.BetterBibTeX = {
  clientName: Zotero.clientName,

  parseHTML(_sandbox: any, text: { toString: () => any }, options: HTMLParserOptions) {
    options = {
      ...options,
      exportBraceProtection: Preference.exportBraceProtection,
      csquotes: Preference.csquotes,
      exportTitleCase: Preference.exportTitleCase,
    }
    return HTMLParser.parse(text.toString(), options)
  },

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  parseDate(_sandbox: any, date: string): ParsedDate { return DateParser.parse(date) },

  async parseBibTeX(_sandbox: any, input: string, translation: Translation) { return parseBibTeX(input, translation) },
  parseCSLYAML(_sandbox: any, input: string): any { return parseCSLYAML(input) },
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

    const displayOptions = this._displayOptions || {}

    if (translator) {
      if (this.location) {
        if (displayOptions.exportFileData) { // when exporting file data, the user was asked to pick a directory rather than a file
          displayOptions.exportDir = this.location.path
          displayOptions.exportPath = OS.Path.join(this.location.path, `${this.location.leafName}.${translator.target}`)
          displayOptions.cache = false
        }
        else {
          displayOptions.exportDir = this.location.parent.path
          displayOptions.exportPath = this.location.path
          displayOptions.cache = true
        }
      }

      let capture = displayOptions.keepUpdated

      if (capture) {
        // this should never occur -- keepUpdated should only be settable if you do a file export
        if (! this.location?.path) {
          flash('Auto-export not registered', 'Auto-export only supported for exports to file -- please report this, you should not have seen this message')
          capture = false
        }

        // this should never occur -- the JS in exportOptions.ts should prevent it
        if (displayOptions.exportFileData) {
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
          exportNotes: displayOptions.exportNotes,
          useJournalAbbreviation: displayOptions.useJournalAbbreviation,
        })
      }

      let noworker = ''
      if (this.noWait) { // noWait must be synchronous
        noworker = 'noWait is active'
      }
      else if (!Translators.worker) {
        // there wasn't an error starting a worker earlier
        noworker = 'failed to start a chromeworker, disabled until restart'
      }
      else if (typeof translator.displayOptions.worker === 'undefined') {
        noworker = `${translator.label} does not support background export`
      }
      else if (!displayOptions.worker) {
        noworker = `user has chosen foreground export for ${translator.label}`
      }
      /*
      else if (this.location?.path.startsWith('\\\\')) {
        // check for SMB path for #1396
        noworker = 'chrome workers fail on smb paths'
      }
      */
      else {
        noworker = Object.keys(this._handlers).filter(handler => !['done', 'itemDone', 'error'].includes(handler)).join(', ')
        if (noworker) noworker = `found async handlers: ${noworker}`
      }

      if (noworker) {
        log.debug('worker export skipped,', noworker)
      }
      else {
        const path = this.location?.path

        // fake out the stuff that complete expects to be set by .translate
        this._currentState = 'translate'
        this.saveQueue = []
        this._savingAttachments = []

        return Translators.exportItemsByWorker({ translatorID, displayOptions, translate: this, scope: { ...this._export, getter: this._itemGetter }, path })
          .then(result => {
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
  void Events.emit('items-changed', ids)
})

notify('item', (action: string, type: any, ids: any[], extraData: { [x: string]: { bbtCitekeyUpdate: any } }) => {
  // prevents update loop -- see KeyManager.init()
  if (action === 'modify') {
    ids = ids.filter((id: string | number) => !extraData[id] || !extraData[id].bbtCitekeyUpdate)
    if (!ids.length) {
      log.debug('item.notify: no items actually changed')
      return
    }
  }

  Cache.remove(ids, `item ${ids} changed`)

  // safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
  // https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
  const parentIDs = []
  const items = action === 'delete' ? [] : Zotero.Items.get(ids).filter((item: ZoteroItem) => {
    // check .deleted for #2401 -- we're getting *updated* (?!) notifications for trashed items which reinstates them into the BBT DB
    if (action === 'modify' && item.deleted) return false
    if (item.isFeedItem) return false

    if (item.isAttachment() || item.isNote()) {
      const parentID = item.parentID
      if (typeof parentID === 'number') parentIDs.push(parentID)
      return false
    }
    if (item.isAnnotation?.()) {
      const parentID = item.parentItem?.parentID
      if (typeof parentID === 'number') parentIDs.push(parentID)
      return false
    }

    return true
  })
  if (parentIDs.length) Cache.remove(parentIDs, `parent items ${parentIDs} changed`)
  const parents = parentIDs.length ? Zotero.Items.get(parentIDs) : []

  switch (action) {
    case 'delete':
    case 'trash':
      Zotero.BetterBibTeX.KeyManager.remove(ids)
      void Events.emit('items-removed', ids)
      break

    case 'add':
    case 'modify':
      // eslint-disable-next-line no-case-declarations
      let warn_titlecase = Preference.warnTitleCased ? 0 : null
      for (const item of items) {
        Zotero.BetterBibTeX.KeyManager.update(item)
        if (typeof warn_titlecase === 'number' && item.isRegularItem()) {
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

  itemsChanged(items.concat(parents))
})

notify('collection', (event: string, _type: any, ids: number[], _extraData: any) => {
  if ((event === 'delete') && ids.length) void Events.emit('collections-removed', ids)
})

notify('group', (event: string, _type: any, ids: number[], _extraData: any) => {
  if ((event === 'delete') && ids.length) void Events.emit('libraries-removed', ids)
})

notify('collection-item', (_event: any, _type: any, collection_items: any) => {
  const changed: Set<number> = new Set()

  for (const collection_item of collection_items) {
    let collectionID = parseInt(collection_item.split('-')[0])
    if (changed.has(collectionID)) continue
    while (collectionID) {
      changed.add(collectionID)
      collectionID = Zotero.Collections.get(collectionID).parentID
    }
  }

  if (changed.size) void Events.emit('collections-changed', Array.from(changed))
})

/*
  INIT
*/

// type TimerHandle = ReturnType<typeof setInterval>
/*
class Progress {
  private timestamp: number
  private msg: string
  private progressWin: any
  private progress: any
  private name = 'Startup progress'
  private mode: string

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
      // this.progressWin.addDescription(`Found ${this.scanning.length} items without a citation key`)
      const icon = `chrome://zotero/skin/treesource-unfiled${Zotero.hiDPI ? '@2x' : ''}.png`
      this.progress = new this.progressWin.ItemProgress(icon, `${this.msg}...`)
      this.progressWin.show()
    }
    else {
      setProgress(0, msg)
    }
  }

  public update(msg: string, progress: number) {
    this.bench(msg)

    log.debug(`${this.name}: ${msg}...`)
    if (this.mode === 'popup') {
      this.progress.setText(msg)
    }
    else {
      setProgress(progress, msg)
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
*/

export class BetterBibTeX {
  public uninstalled = false
  public Orchestrator = orchestrator
  public Cache = Cache

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types
  public CSL() { return CSL }
  public TestSupport = new TestSupport
  public KeyManager = KeyManager
  public Text = { sentenceCase }
  public elements: Elements

  // panes
  public ZoteroPane: ZoteroPaneHelper = new ZoteroPaneHelper
  public ExportOptions: ExportOptions = new ExportOptions
  public ItemPane: ItemPane = new ItemPane
  public FirstRun = new FirstRun
  public ErrorReport = new ErrorReport
  public PrefPane = new PrefPane

  public ready: BluebirdPromise<boolean>
  private deferred = new Deferred<boolean>()
  public dir: string

  private firstRun: { citekeyFormat: string, dragndrop: boolean, unabbreviate: boolean, strings: boolean }
  public debugEnabledAtStart: boolean

  public generateCSLJSON = generateCSLJSON

  constructor() {
    this.debugEnabledAtStart = Zotero.Prefs.get('debug.store')

    this.ready = this.deferred.promise
  }

  public async scanAUX(target: string): Promise<void> {
    await this.ready

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
        if (!ps.prompt(null, l10n.localize(`BetterBibTeX.auxScan.title.${aux.endsWith('.aux') ? 'aux' : 'md'}`), l10n.localize('BetterBibTeX.auxScan.prompt'), tag, null, {})) return
        if (!tag.value) return

        await AUXScanner.scan(aux, { tag: tag.value })
        break

      default:
        flash(`Unsupported aux-scan target ${target}`)
        break
    }
  }

  public openDialog(url: string, title: string, properties: string, params: Record<string, any>): void {
    (window as any).openDialog(url, title, properties, params)
  }

  public setProgress(progress: number, msg: string): void {
    if (!document.getElementById('better-bibtex-progress')) {
      // progress bar
      const progressToolbar = this.elements.create('hbox', {
        id: 'better-bibtex-progress',
        hidden: 'true',
        align: 'left',
        pack: 'start',
        flex: '1',
      })
      const itemToolbar = document.getElementById('zotero-item-toolbar')
      // after hbox-before-zotero-pq-buttons
      itemToolbar.insertBefore(progressToolbar, itemToolbar.firstChild.nextSibling)
      progressToolbar.appendChild(this.elements.create('hbox', {
        id: 'better-bibtex-progress-meter',
        width: '20',
        height: '20',
        style: `
          position: absolute;
          left: 0;
          top:  0;

          width: 20px;
          height: 20px;

          background-image: url(chrome://zotero-better-bibtex/skin/progress.svg);

          background-position: 0 0;
        `,
      }))
      progressToolbar.appendChild(this.elements.create('label', {
        id: 'better-bibtex-progress-label',
        value: 'nothing to see here',
      }))
    }

    progress = Math.max(Math.min(Math.round(progress), 100), 0)
    log.debug('progress:', progress, msg)
    const progressbox = document.getElementById('better-bibtex-progress')
    if (progressbox.hidden = (progress >= 100)) return

    const progressmeter: XUL.Element = (document.getElementById('better-bibtex-progress-meter') as unknown as XUL.Element)
    progressmeter.style.backgroundPosition = `-${progress * 20}px 0` // eslint-disable-line no-magic-numbers

    const label: XUL.Label = (document.getElementById('better-bibtex-progress-label') as unknown as XUL.Label)
    label.setAttribute('value', `better bibtex: ${msg}`)
  }

  public async startup(): Promise<void> {
    if (typeof this.ready.isPending !== 'function') throw new Error('Zotero.Promise is not using Bluebird')

    window = Zotero.getMainWindow()
    document = window.document
    this.elements = new Elements(document, 'zoteropane')

    log.debug('Loading Better BibTeX: starting...')

    orchestrator.add({
      id: 'start',
      description: 'zotero',
      startup: async () => {
        // https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
        // this is what really takes long
        await Zotero.initializationPromise

        this.dir = OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex')
        await OS.File.makeDir(this.dir, { ignoreExisting: true })
        await Preference.initAsync(this.dir)
      },
    })

    orchestrator.add({
      id: 'databases',
      description: 'databases',
      needs: ['start'],
      startup: async () => {
        await Zotero.DB.queryAsync('ATTACH DATABASE ? AS betterbibtex', [OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex.sqlite')])
        await Zotero.DB.queryAsync('ATTACH DATABASE ? AS betterbibtexsearch', [OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex-search.sqlite')])
      },
      shutdown: async () => {
        await Zotero.DB.queryAsync('DETACH DATABASE betterbibtex')
        await Zotero.DB.queryAsync('DETACH DATABASE betterbibtexsearch')
      },
    })

    orchestrator.add({
      id: 'done',
      description: 'user interface',
      startup: async () => {
        this.deferred.resolve(true)
        await this.load()
      },
    })

    await orchestrator.startup((phase: string, name: string, done: number, total: number, message: string): void => {
      if (phase === 'startup') this.setProgress(done * 100 / total, message || `${phase}: ${name}`)
    })
    this.setProgress(100, 'finished')
  }

  public async load(): Promise<void> { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    Zotero.debug(`{better-bibtex-startup} waiting for Zotero @ ${Date.now() - started}`)
    // progress.start(l10n.localize('BetterBibTeX.startup.waitingForZotero'))

    for (const node of [...document.getElementsByClassName('bbt-texstudio')]) {
      (node as any).hidden = !TeXstudio.enabled
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

      Preference.citekeyFormat = (this.firstRun.citekeyFormat === 'zotero') ? 'zotero.clean' : citekeyFormat.replace(/\u200B/g, '')
      Preference.importJabRefAbbreviations = this.firstRun.unabbreviate
      Preference.importJabRefStrings = this.firstRun.strings
    }
    else {
      this.firstRun = null
    }

    if (typeof __estrace !== 'undefined') {
      flash(
        'BBT TRACE LOGGING IS ENABLED',
        'BBT trace logging is enabled in this build.\nZotero will run very slowly.\nThis is intended for debugging ONLY.',
        20 // eslint-disable-line no-magic-numbers
      )
    }

    // progress.update(l10n.localize('BetterBibTeX.startup.serializationCache'), 20) // eslint-disable-line no-magic-numbers
    // Serializer.init()

    // progress.update(l10n.localize('BetterBibTeX.startup.autoExport.load'), 30) // eslint-disable-line no-magic-numbers
    // await AutoExport.init()

    // progress.update(l10n.localize('BetterBibTeX.startup.journalAbbrev'), 60) // eslint-disable-line no-magic-numbers
    // await JournalAbbrev.init()

    // progress.update(l10n.localize('BetterBibTeX.startup.installingTranslators'), 70) // eslint-disable-line no-magic-numbers
    // await Translators.init()

    // progress.update(l10n.localize('BetterBibTeX.startup.keyManager'), 80) // eslint-disable-line no-magic-numbers
    // await this.KeyManager.start() // inits the key cache by scanning the DB and generating missing keys

    // progress.update(l10n.localize('BetterBibTeX.startup.autoExport'), 90) // eslint-disable-line no-magic-numbers
    // AutoExport.start()

    Zotero.debug(`{better-bibtex-startup} startup ready @ ${Date.now() - started}`)

    this.ZoteroPane.load()
    await this.ItemPane.load()

    // progress.done()

    if (typeof Zotero.ItemTreeView === 'undefined') ZoteroPane.itemsView.refreshAndMaintainSelection()

    const selected = ZoteroPane.getSelectedItems(true)
    if (selected.length) Zotero.Notifier.trigger('refresh', 'item', selected)

    if (this.firstRun && this.firstRun.dragndrop) Zotero.Prefs.set('export.quickCopy.setting', `export=${Translators.byLabel.BetterBibTeXCitationKeyQuickCopy.translatorID}`)

    void Events.emit('loaded')

    Events.on('export-progress', ({ pct, message }) => {
      /*
      let status = `${percent < 0 ? l10n.localize('Preferences.auto-export.status.preparing') : ''} ${translator}`.trim()
      if (Translators.queue.queued) status += ` +${Translators.queue.queued}`
      setProgress(percent && percent < 100 && Math.abs(percent), status) // eslint-disable-line no-magic-numbers
      */
      this.setProgress(pct, message) // eslint-disable-line no-magic-numbers
    })
  }

  public parseDate(date: string): ParsedDate { return DateParser.parse(date) }
  public unload(): void {
    Zotero.debug('Unloading BBT?')
  }

  getContents(path: string): string {
    // cannot use await OS.File.exists here because we may be invoked in noWait mod
    if (path && (new FileUtils.File(path)).exists()) {
      return Zotero.File.getContents(path) as string
    }
    else {
      return null
    }
  }
}

Zotero.BetterBibTeX = Zotero.BetterBibTeX || new BetterBibTeX
