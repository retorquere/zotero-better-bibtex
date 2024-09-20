/* eslint-disable prefer-rest-params */

import flatMap from 'array.prototype.flatmap'
flatMap.shim()
import matchAll from 'string.prototype.matchall'
matchAll.shim()

import type Bluebird from 'bluebird'
const Ready = Zotero.Promise.defer()

import { Shim } from './os'
import { is7 } from './client'
const $OS = is7 ? Shim : OS

if (is7) Components.utils.importGlobalProperties(['FormData', 'indexedDB'])

Components.utils.import('resource://gre/modules/FileUtils.jsm')
declare const FileUtils: any

declare const __estrace: any // eslint-disable-line no-underscore-dangle

import type { XUL } from '../typings/xul'
import { DebugLog } from 'zotero-plugin/debug-log'
DebugLog.register('Better BibTeX', ['extensions.zotero.translators.better-bibtex.'])

import { icons } from './icons'
import { prompt } from './prompt'
import { Elements } from './create-element'
import { newZoteroPane } from './ZoteroPane'
import { newZoteroItemPane } from './ZoteroItemPane'
import { ExportOptions } from './ExportOptions'
import { PrefPane } from './Preferences'
import { ErrorReport } from './ErrorReport'
import * as $Patcher$ from './monkey-patch'
import { clean_pane_persist } from './clean_pane_persist'
import { flash } from './flash'
import { orchestrator } from './orchestrator'
import type { Reason } from './bootstrap'
import type { ExportedItem, ExportedItemMetadata } from './db/cache'
import { Cache } from './db/cache'

import { Preference } from './prefs' // needs to be here early, initializes the prefs observer
require('./pull-export') // just require, initializes the pull-export end points
require('./json-rpc') // just require, initializes the json-rpc end point
import { AUXScanner } from './aux-scanner'
import * as Extra from './extra'
import { sentenceCase, HTMLParser, HTMLParserOptions } from './text'

import { AutoExport } from './auto-export'
import { exportContext } from './db/cache'

import { log } from './logger'
// import { trace } from './logger'
import { Events } from './events'

import { Translators } from './translators'
import { fix as fixExportFormat } from './item-export-format'
import { KeyManager } from './key-manager'
import { TestSupport } from './test-support'
import * as l10n from './l10n'
import * as CSL from 'citeproc'

import { generateBibLaTeX } from '../translators/bibtex/biblatex'
import { generateBibTeX, importBibTeX } from '../translators/bibtex/bibtex'
import { generateBBTJSON, importBBTJSON } from '../translators/lib/bbtjson'
import { generateCSLYAML, parseCSLYAML } from '../translators/csl/yaml'
import { generateCSLJSON } from '../translators/csl/json'
import type { Collected } from '../translators/lib/collect'

// need coroutine here because Zotero calls '.done()' on the nonexistent! result, added automagically by bluebird
if (!is7) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  $Patcher$.patch(Zotero, 'shutdown', original => Zotero.Promise.coroutine(function* () {
    try {
      yield orchestrator.shutdown(Zotero.BetterBibTeX.uninstalled ? 'ADDON_UNINSTALL' : 'APP_SHUTDOWN')
    }
    catch (err) {
      log.error('BBT shutdown: shutdown failed', err)
    }

    yield original.apply(this, arguments)
  }))
}

declare const AddonManager: any
if (!is7) {
  Components.utils.import('resource://gre/modules/AddonManager.jsm')
  AddonManager.addAddonListener({
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    onUninstalling(addon: { id: string }) {
      if (addon.id === 'better-bibtex@iris-advies.com') Zotero.BetterBibTeX.uninstalled = true
    },

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    onDisabling(addon: { id: string }) {
      if (addon.id === 'better-bibtex@iris-advies.com') Zotero.BetterBibTeX.uninstalled = true
    },

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    onOperationCancelled(addon: { id: string; pendingOperations: number }) {
      if (addon.id !== 'better-bibtex@iris-advies.com') return null

      // eslint-disable-next-line no-bitwise
      if (addon.pendingOperations & (AddonManager.PENDING_UNINSTALL | AddonManager.PENDING_DISABLE)) Zotero.BetterBibTeX.uninstalled = false
    },
  })
}

// MONKEY PATCHES

// zotero moved itemToCSLJSON to Zotero.Utilities.Item, jurism for the moment keeps it on ZU
$Patcher$.schedule(Zotero.Utilities.Item?.itemToCSLJSON ? Zotero.Utilities.Item : Zotero.Utilities, 'itemToCSLJSON', original => function itemToCSLJSON(zoteroItem: { itemID: any }) {
  const cslItem = original.apply(this, arguments)

  try {
    if (typeof Zotero.Item !== 'undefined' && !(zoteroItem instanceof Zotero.Item)) {
      const citekey = Zotero.BetterBibTeX.KeyManager.get(zoteroItem.itemID)
      if (citekey) {
        cslItem['citation-key'] = citekey.citationKey
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
$Patcher$.schedule(Zotero.Items, 'merge', original => async function Zotero_Items_merge(item: ZoteroItem, otherItems: ZoteroItem[]) {
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
        const pinned = Zotero.BetterBibTeX.KeyManager.get(item.id)
        if (pinned.pinned) extra.extraFields.citationKey = pinned.citationKey
      }

      // get citekeys of other items
      if (merge.citationKey) {
        const otherIDs = otherItems.map(i => i.id)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        extra.extraFields.aliases = [ ...extra.extraFields.aliases, ...Zotero.BetterBibTeX.KeyManager.find({ where: { itemID: { in: otherIDs }}}).map(key => key.citationKey) ]
      }

      // add any aliases they were already holding
      for (const i of otherItems) {
        const otherExtra = Extra.get(i.getField('extra') as string, 'zotero', { citationKey: merge.citationKey, aliases: merge.citationKey, tex: merge.tex, kv: merge.kv })

        if (merge.citationKey) {
          extra.extraFields.aliases = [ ...extra.extraFields.aliases, ...otherExtra.extraFields.aliases ]
          if (otherExtra.extraFields.citationKey) extra.extraFields.aliases.push(otherExtra.extraFields.citationKey)
        }

        if (merge.tex) {
          for (const [ name, value ] of Object.entries(otherExtra.extraFields.tex)) {
            if (!extra.extraFields.tex[name]) extra.extraFields.tex[name] = value
          }
        }

        if (merge.kv) {
          for (const [ name, value ] of Object.entries(otherExtra.extraFields.kv)) {
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
        const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id).citationKey
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
  const decoded = decodeURIComponent(libraryKey)
  const m = decoded.match(/^@(.+)|bbt:(?:[{](\d+)[}])?(.+)/)
  if (!m) return

  const [ , solo, library, combined ] = m
  const item = Zotero.BetterBibTeX.KeyManager.first({ where: {
    libraryID: library ? parseInt(library) : Zotero.Libraries.userLibraryID,
    citationKey: solo || combined,
  }})
  return item ? { libraryID: item.libraryID, key: item.itemKey } : false
}

$Patcher$.schedule(Zotero.API, 'getResultsFromParams', original => function Zotero_API_getResultsFromParams(params: Record<string, any>) {
  try {
    if (params.itemKey) {
      const libraryID = params.libraryID || Zotero.Libraries.userLibraryID
      params.itemKey = params.itemKey.map((itemKey: string) => {
        const m = itemKey.match(/^(bbt:|@)(.+)/)
        if (!m) return itemKey
        const citekey = Zotero.BetterBibTeX.KeyManager.first({ where: { libraryID, citationKey: m[2] }})
        return citekey?.itemKey || itemKey
      })
    }
  }
  catch (err) {
    log.error('getResultsFromParams', params, err)
  }

  return original.apply(this, arguments) as Record<string, any>
})

if (typeof Zotero.DataObjects.prototype.parseLibraryKeyHash === 'function') {
  $Patcher$.schedule(Zotero.DataObjects.prototype, 'parseLibraryKeyHash', original => function Zotero_DataObjects_prototype_parseLibraryKeyHash(libraryKey: string) {
    const item = parseLibraryKeyFromCitekey(libraryKey)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof item === 'undefined' ? original.apply(this, arguments) : item
  })
}
if (typeof Zotero.DataObjects.prototype.parseLibraryKey === 'function') {
  $Patcher$.schedule(Zotero.DataObjects.prototype, 'parseLibraryKey', original => function Zotero_DataObjects_prototype_parseLibraryKey(libraryKey: string) {
    const item = parseLibraryKeyFromCitekey(libraryKey)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof item === 'undefined' ? original.apply(this, arguments) : item
  })
}

// otherwise the display of the citekey in the item pane flames out
$Patcher$.schedule(Zotero.ItemFields, 'isFieldOfBase', original => function Zotero_ItemFields_isFieldOfBase(field: string, _baseField: any) {
  if (field === 'citationKey') return false
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

// because the zotero item editor does not check whether a textbox is read-only. *sigh*
$Patcher$.schedule(Zotero.Item.prototype, 'setField', original => function Zotero_Item_prototype_setField(field: string, value: string | undefined, _loadIn: any) {
  if (field === 'citationKey') {
    if (Zotero.BetterBibTeX.starting) return false

    const citekey = Zotero.BetterBibTeX.KeyManager.get(this.id)
    if (citekey.retry) return false

    if (typeof value !== 'string') value = ''
    if (!value) {
      this.setField('extra', Extra.get(this.getField('extra') as string, 'zotero', { citationKey: true }).extra)
      Zotero.BetterBibTeX.KeyManager.update(this)
      Zotero.Notifier.trigger('modify', 'item', [this.id])
      return true
    }
    else if (value !== citekey.citationKey) {
      this.setField('extra', Extra.set(this.getField('extra'), { citationKey: value }))
      // citekey.pinned = true
      // citekey.citekey = value
      // Zotero.BetterBibTeX.KeyManager.keys.update(citekey)
      return true
    }
    else {
      return false
    }
  }
  else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return original.apply(this, arguments)
  }
})

// To show the citekey in the item list
$Patcher$.schedule(Zotero.Item.prototype, 'getField', original => function Zotero_Item_prototype_getField(field: any, unformatted: any, includeBaseMapped: any) {
  try {
    if (field === 'citationKey' || field === 'citekey') {
      if (Zotero.BetterBibTeX.starting) return '' // eslint-disable-line @typescript-eslint/no-use-before-define
      return Zotero.BetterBibTeX.KeyManager.get(this.id).citationKey
    }
  }
  catch (err) {
    log.error('patched getField:', { field, unformatted, includeBaseMapped, err })
    return ''
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments) as string
})

// #1579
$Patcher$.schedule(Zotero.Item.prototype, 'clone', original => function Zotero_Item_prototype_clone(libraryID: number, options = {}) {
  const item = original.apply(this, arguments)
  try {
    if ((typeof libraryID === 'undefined' || this.libraryID === libraryID) && item.isRegularItem()) {
      item.setField('extra', item.getField('extra').replace(/(^|\n)citation key:[^\n]*(\n|$)/i, '\n').trim())
    }
  }
  catch (err) {
    log.error('patched clone:', { libraryID, options, err })
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return item
})

if (!is7) {
  const itemTree = require('zotero/itemTree')
  $Patcher$.patch(itemTree.prototype, 'getColumns', original => function Zotero_ItemTree_prototype_getColumns() {
    const columns = original.apply(this, arguments)
    try {
      const insertAfter: number = columns.findIndex(column => column.dataKey === 'title')
      columns.splice(insertAfter + 1, 0, {
        dataKey: 'citationKey',
        label: l10n.localize('better-bibtex_zotero-pane_column_citekey'),
        flex: '1',
        zoteroPersist: new Set([ 'width', 'ordinal', 'hidden', 'sortActive', 'sortDirection' ]),
      })
    }
    catch {
      log.error('could not install itemtree column')
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return columns
  })

  $Patcher$.patch(itemTree.prototype, '_renderCell', original => function Zotero_ItemTree_prototype_renderCell(index, data, col) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (col.dataKey !== 'citationKey') return original.apply(this, arguments)

    const item = this.getRow(index).ref
    const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id)

    const doc: Document = this.window.document
    const icon = doc.createElementNS('http://www.w3.org/1999/xhtml', 'span')
    icon.innerText = citekey.pinned ? icons.pin : ''
    // icon.className = 'icon icon-bg cell-icon'

    const text = doc.createElementNS('http://www.w3.org/1999/xhtml', 'span')
    text.className = 'cell-text'
    text.id = `better-bibtex-citekey-cell-${ item.id }`
    text.innerText = data

    const cell = doc.createElementNS('http://www.w3.org/1999/xhtml', 'span')
    cell.className = `cell ${ col.className }`
    cell.append(text, icon)

    return cell
  })
  Events.on('items-changed', ({ items }) => {
    const doc = Zotero.getMainWindow()?.document
    if (!doc) return
    for (const item of items) {
      const text = doc.getElementById(`better-bibtex-citekey-cell-${ item.id }`)
      const icon = doc.createElementNS('http://www.w3.org/1999/xhtml', 'span')
      const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id)
      if (text) text.innerText = citekey.citationKey
      if (icon) icon.innerText = citekey.pinned ? icons.pin : ''
    }
  })
}

import * as CAYW from './cayw'
$Patcher$.schedule(Zotero.Integration, 'getApplication', original => function Zotero_Integration_getApplication(agent: string, _command: any, _docId: any) {
  if (agent === 'BetterBibTeX') return CAYW.Application
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

import * as DateParser from './dateparser'
import type { ParsedDate } from './dateparser'

Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  clientName: Zotero.clientName,

  strToISO(_sandbox: any, str: string) { return DateParser.strToISO(str) },
  getContents(_sandbox: any, path: string): string { return Zotero.BetterBibTeX.getContents(path) },

  generateBibLaTeX(_sandbox: any, collected: Collected) { return generateBibLaTeX(collected) },
  generateBibTeX(_sandbox: any, collected: Collected) { return generateBibTeX(collected) },
  generateCSLYAML(_sandbox: any, collected: Collected) { return generateCSLYAML(collected) },
  generateCSLJSON(_sandbox: any, collected: Collected) { return generateCSLJSON(collected) },
  generateBBTJSON(_sandbox: any, collected: Collected) { return generateBBTJSON(collected) },

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

  async importBibTeX(_sandbox: any, collected: Collected) { return await importBibTeX(collected) },
  async importBBTJSON(_sandbox: any, collected: Collected) { return await importBBTJSON(collected) },
  parseCSLYAML(_sandbox: any, input: string): any { return parseCSLYAML(input) },
}

$Patcher$.schedule(Zotero.Utilities.Internal, 'itemToExportFormat', original => function Zotero_Utilities_Internal_itemToExportFormat(zoteroItem: any, _legacy: any, _skipChildItems: any) {
  const serialized = original.apply(this, arguments)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return typeof zoteroItem.id === 'number' ? fixExportFormat(serialized, zoteroItem) : serialized
})

// so BBT-JSON can be imported without extra-field meddling
$Patcher$.schedule(Zotero.Utilities.Internal, 'extractExtraFields', original => function Zotero_Utilities_Internal_extractExtraFields(extra: string, _item: any, _additionalFields: any) {
  if (extra && extra.startsWith('\x1BBBT\x1B')) {
    return { itemType: null, fields: (new Map), creators: [], extra: extra.replace('\x1BBBT\x1B', '') }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

$Patcher$.schedule(Zotero.Translate.Export.prototype, 'translate', original => function Zotero_Translate_Export_prototype_translate() {
  let translatorID = this.translator[0]
  if (translatorID.translatorID) translatorID = translatorID.translatorID
  // requested translator
  const translator = Translators.byId[translatorID]
  if (this.noWait || !translator) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return original.apply(this, arguments)
  }

  const displayOptions = this._displayOptions || {}

  if (this.location) {
    if (displayOptions.exportFileData) { // when exporting file data, the user was asked to pick a directory rather than a file
      displayOptions.exportDir = this.location.path
      displayOptions.exportPath = $OS.Path.join(this.location.path, `${ this.location.leafName }.${ translator.target }`)
      displayOptions.cache = false
    }
    else {
      displayOptions.exportDir = this.location.parent.path
      displayOptions.exportPath = this.location.path
      displayOptions.cache = true
    }
  }

  if (this._export && displayOptions.keepUpdated) {
    void AutoExport.register({
      translatorID,
      displayOptions,
      scope: this._export.type === 'collection'
        ? { type: 'collection', collection: this._export.collection }
        : { type: this._export.type as 'library', id: this._export.id },
      path: this.location.path,
    })
  }

  let useWorker = typeof translator.displayOptions.worker === 'boolean' && displayOptions.worker

  if (useWorker && !Translators.worker) {
    // there wasn't an error starting a worker earlier
    flash('failed to start a chromeworker')
    useWorker = false
  }
  if (!Cache.opened) {
    flash('cache not loaded, background exports are disabled')
    useWorker = false
  }

  if (useWorker) {
    return Translators.queueJob({
      translatorID,
      displayOptions,
      translate: this,
      scope: { ...this._export, getter: this._itemGetter },
      path: this.location?.path,
    })
  }
  else {
    return Translators.queue.add(async () => {
      try {
        await Cache.initExport(translator.label, exportContext(translator.label, displayOptions))
        await original.apply(this, arguments)
      }
      finally {
        await Cache.export.flush()
      }
    })
  }
})

export class BetterBibTeX {
  public uninstalled = false
  public Orchestrator = orchestrator
  public Cache = {
    fetch(itemID: number): ExportedItem {
      return Cache.export?.fetch(itemID)
    },
    store(itemID: number, entry: string, metadata: ExportedItemMetadata): void { // eslint-disable-line @typescript-eslint/no-empty-function
      Cache.export?.store({ itemID, entry, metadata })
    },
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types
  public CSL() { return CSL }
  public TestSupport: TestSupport
  public KeyManager = KeyManager
  public Text = { sentenceCase }

  // panes
  public ExportOptions: ExportOptions = new ExportOptions
  public ErrorReport = ErrorReport
  public PrefPane = new PrefPane
  public Translators = Translators

  public ready: Bluebird<boolean> = Ready.promise
  public dir: string

  public debugEnabledAtStart: boolean
  public outOfMemory = ''

  public generateCSLJSON = generateCSLJSON

  constructor() {
    this.debugEnabledAtStart = Zotero.Prefs.get('debug.store') || Zotero.Debug.storing
    if (Zotero.isWin && !is7) Zotero.Debug.addListener(this.logListener.bind(this))
    if (Preference.testing) this.TestSupport = new TestSupport
  }

  private logListener(message: string): void {
    if (Preference.cache && !this.outOfMemory && message.match(/Translate: Translation using Better .* failed:[\s\S]*out of memory/)) {
      this.outOfMemory = message
      flash('Zotero is out of memory', 'Zotero is out of memory. I will turn off the cache to help release memory pressure, but this is only a temporary fix until Zotero 7 comes out')
      Preference.cache = false
    }
  }

  public get starting(): boolean {
    return this.ready.isPending()
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
        let name = $OS.Path.basename(aux)
        name = name.lastIndexOf('.') > 0 ? name.substr(0, name.lastIndexOf('.')) : name
        // eslint-disable-next-line no-case-declarations
        const tag = prompt({
          title: l10n.localize(`better-bibtex_aux-scan_title_${ aux.endsWith('.aux') ? 'aux' : 'md' }`),
          text: l10n.localize('better-bibtex_aux-scan_prompt'),
          value: name,
        })
        if (!tag) return

        await AUXScanner.scan(aux, { tag })
        break

      default:
        flash(`Unsupported aux-scan target ${ target }`)
        break
    }
  }

  public openDialog(url: string, title: string, properties: string, params: Record<string, any>): void {
    Zotero.getMainWindow()?.openDialog(url, title, properties, params)
  }

  public setProgress(progress: number, msg: string): void {
    const doc = Zotero.getMainWindow()?.document
    if (!doc) return

    if (!doc.getElementById('better-bibtex-progress')) {
      const elements = new Elements(doc)
      // progress bar
      const progressToolbar = elements.create('hbox', {
        id: 'better-bibtex-progress',
        hidden: 'true',
        align: 'left',
        pack: 'start',
        flex: '1',
      })
      const container = doc.getElementById('zotero-item-toolbar') || doc.getElementById('zotero-pane-progressmeter-container')
      // after hbox-before-zotero-pq-buttons
      container.insertBefore(progressToolbar, container.firstChild.nextSibling)
      progressToolbar.appendChild(elements.create('hbox', {
        id: 'better-bibtex-progress-meter',
        width: '16px',
        height: '16px',
        style: `
          position: absolute;
          left: 0;
          top:  0;

          width: 16px;
          height: 16px;

          background-image: url(chrome://zotero/skin/progress_arcs.png);

          background-position: 0 0;
        `,
      }))
      progressToolbar.appendChild(elements.create('label', {
        id: 'better-bibtex-progress-label',
        value: 'nothing to see here',
      }))
    }

    const progressbox = doc.getElementById('better-bibtex-progress')
    if (progressbox.hidden = (progress >= 100 || progress < 0)) return

    const progressmeter: XUL.Element = doc.getElementById('better-bibtex-progress-meter') as unknown as XUL.Element
    const nArcs = 20
    progressmeter.style.backgroundPosition = `-${ Math.round(progress / 100 * nArcs) * 16 }px 0`
    const progressbar: XUL.Element = doc.getElementById('better-bibtex-progress') as unknown as XUL.Element
    progressbar.style.opacity = `${ progress / 200 + 0.5 }`

    const label: XUL.Label = doc.getElementById('better-bibtex-progress-label') as unknown as XUL.Label
    label.setAttribute('value', `better bibtex: ${ msg }`)
  }

  public async startup(reason: Reason): Promise<void> {
    orchestrator.add({
      id: 'start',
      description: 'waiting for zotero',
      startup: async () => {
        // https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/uvGObVNlCgAJ
        // this is what really takes long
        await Zotero.initializationPromise

        // and this
        if ((await Translators.needsInstall()).length) await Zotero.Translators.init()

        this.dir = $OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex')
        await $OS.File.makeDir(this.dir, { ignoreExisting: true })
        await Preference.startup(this.dir)
        Events.startup()

        await Cache.open(await Zotero.DB.valueQueryAsync('SELECT MAX(dateModified) FROM items'))
        Events.cacheTouch = async (ids: number[]) => {
          await Cache.touch(ids)
        }
        Events.addIdleListener('cache-purge', Preference.autoExportIdleWait)
        Events.on('idle', async state => {
          if (state.topic === 'cache-purge' && Cache.opened) await Cache.ZoteroSerialized.purge()
        })
      },
      shutdown() {
        Cache.close()
      },
    })

    orchestrator.add({
      id: 'sqlite',
      startup: async () => {
        await Zotero.DB.queryAsync('ATTACH DATABASE ? AS betterbibtex', [$OS.Path.join(Zotero.DataDirectory.dir, 'better-bibtex.sqlite')])

        const tables: Record<string, boolean> = {}
        for (const table of await Zotero.DB.columnQueryAsync('SELECT LOWER(REPLACE(name, \'-\', \'\')) FROM betterbibtex.sqlite_master where type=\'table\'')) {
          tables[table] = true
        }

        const NoParse = { noParseParams: true }

        for (const ddl of require('./db/citation-key.sql')) {
          await Zotero.DB.queryAsync(ddl, [], NoParse)
        }

        if (tables.betterbibtex) {
          if (!(await Zotero.DB.queryAsync('PRAGMA betterbibtex.table_info("better-bibtex")')).find(info => info.name === 'migrated')) {
            Zotero.DB.queryAsync('ALTER TABLE betterbibtex."better-bibtex" ADD migrated')
          }

          await Zotero.DB.executeTransaction(async () => {
            for (let { name, data } of await Zotero.DB.queryAsync('SELECT name, data FROM betterbibtex."better-bibtex" WHERE migrated IS NULL')) {
              data = JSON.parse(data)
              let migrated = name
              switch (name) {
                case 'better-bibtex.citekey':
                  try {
                    for (const key of data.data) {
                      await Zotero.DB.queryAsync('REPLACE INTO betterbibtex.citationkey (itemID, itemKey, libraryID, citationKey, pinned) VALUES (?, ?, ?, ?, ?)', [
                        key.itemID,
                        key.itemKey,
                        key.libraryID,
                        key.citekey,
                        key.pinned ? 1 : 0,
                      ])
                    }
                  }
                  catch (err) {
                    log.error('not migrated:', name, err)
                  }
                  break

                case 'better-bibtex.autoexport':
                  for (const ae of data.data) {
                    AutoExport.store({ ...ae, updated: ae.meta.updated })
                  }
                  break
                default:
                  migrated = ''
                  break
              }
              if (migrated) await Zotero.DB.queryAsync('UPDATE betterbibtex."better-bibtex" SET migrated = 1 WHERE name = ?', [migrated])
            }
          })

          const status = {}
          for (const { name, migrated } of await Zotero.DB.queryAsync('SELECT name, migrated FROM betterbibtex."better-bibtex"')) {
            status[name] = migrated
          }
        }
      },
      shutdown: async () => {
        await Zotero.DB.queryAsync('DETACH DATABASE betterbibtex')
      },
    })

    orchestrator.add({
      id: 'done',
      description: 'user interface',
      startup: async () => {
        Ready.resolve(true)
        await this.load(Zotero.getMainWindow())

        Zotero.Promise.delay(15000).then(() => {
          DebugLog.unregister('Better BibTeX')
        })
        Zotero.Promise.delay(3000).then(() => {
          DebugLog.convertLegacy()
        })

        if (is7) {
          await Zotero.ItemTreeManager.registerColumns({
            dataKey: 'citationKey',
            label: 'Citation key',
            pluginID: 'better-bibtex@iris-advies.com',
            dataProvider: (item, _dataKey) => {
              const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id)
              return citekey ? `${ citekey.citationKey }${ citekey.pinned ? icons.pin : '' }`.trim() : ''
            },
          })
        }
        $Patcher$.execute()
      },
      shutdown: async () => { // eslint-disable-line @typescript-eslint/require-await
        Events.shutdown()
        Elements.removeAll()
        $Patcher$.unpatch()
        clean_pane_persist()
        Preference.shutdown()
        for (const endpoint of Object.keys(Zotero.Server.Endpoints)) {
          if (endpoint.startsWith('/better-bibtex/')) delete Zotero.Server.Endpoints[endpoint]
        }
      },
    })

    await orchestrator.startup(reason, (phase: string, name: string, done: number, total: number, message: string): void => {
      this.setProgress(done * 100 / total, message || name)
    })
    this.setProgress(100, 'finished')
  }

  public async shutdown(reason: Reason): Promise<void> {
    await orchestrator.shutdown(reason)
  }

  public async load(win: Window): Promise<void> {
    if (!win) return
    // the zero-width-space is a marker to re-save the current default so it doesn't get replaced
    // when the default changes later, which would change new keys suddenly
    if (!Preference.citekeyFormat) Preference.citekeyFormat = Preference.default.citekeyFormat
    Preference.citekeyFormat = Preference.citekeyFormat.replace(/\u200B/g, '')

    if (typeof __estrace !== 'undefined') {
      flash(
        'BBT TRACE LOGGING IS ENABLED',
        'BBT trace logging is enabled in this build.\nZotero will run very slowly.\nThis is intended for debugging ONLY.',
        20
      )
    }

    await this.loadUI(win)

    void Events.emit('loaded')

    Events.on('export-progress', ({ pct, message }) => {
      this.setProgress(pct, message)
    })
  }

  async loadUI(win: Window): Promise<void> {
    if (is7) {
      // const show = (item: ZoteroItem): { id: number, type: string, citekey: string } | boolean => item ? { id: item.id, type: Zotero.ItemTypes.getName(item.itemTypeID), citekey: item.getField('citationKey') as string } : false
      let $done: () => void
      Zotero.ItemPaneManager.registerSection({
        paneID: 'betterbibtex-section-citationkey',
        pluginID: 'better-bibtex@iris-advies.com',
        header: {
          l10nID: 'better-bibtex_item-pane_section_header',
          icon: `${ rootURI }content/skin/item-section/header.svg`,
        },
        sidenav: {
          l10nID: 'better-bibtex_item-pane_section_sidenav',
          icon: `${ rootURI }content/skin/item-section/sidenav.svg`,
        },
        bodyXHTML: 'Citation Key <html:input type="text" data-itemid="" id="better-bibtex-citation-key" readonly="true" style="flex: 1" xmlns:html="http://www.w3.org/1999/xhtml"/>',
        // onRender: ({ body, item, editable, tabType }) => {
        onRender: ({ body, item, setSectionSummary }) => {
          const citekey = item.getField('citationKey')
          const textbox = body.querySelector('#better-bibtex-citation-key')
          body.style.display = 'flex'
          // const was = textbox.dataset.itemid || '<node>'
          textbox.value = citekey || ''
          textbox.dataset.itemid = citekey ? `${ item.id }` : ''
          setSectionSummary(citekey || '')
        },
        onInit: ({ body, refresh }) => {
          $done = Events.on('items-changed', ({ items }) => {
            const textbox = body.querySelector('#better-bibtex-citation-key')
            const itemID = textbox.dataset.itemid ? parseInt(textbox.dataset.itemid) : undefined
            const displayed: ZoteroItem = textbox.dataset.itemid ? items.find(item => item.id === itemID) : undefined
            if (displayed) refresh()
          })
        },
        onItemChange: ({ setEnabled, body, item }) => {
          const textbox = body.querySelector('#better-bibtex-citation-key')
          if (item.isRegularItem() && !item.isFeedItem) {
            const citekey = item.getField('citationKey')
            // const was = textbox.dataset.itemid
            textbox.dataset.itemid = citekey ? `${ item.id }` : ''
            textbox.value = citekey || '\u274C'
            setEnabled(true)
          }
          else {
            textbox.dataset.itemid = ''
            setEnabled(false)
          }
        },
        onDestroy: () => {
          $done?.()
          $done = undefined
        },
      })
    }

    try {
      await newZoteroPane(win)
      if (!is7) await newZoteroItemPane(win)
    }
    catch (err) {
      log.error('loadUI error:', err)
    }
  }

  public parseDate(date: string): ParsedDate { return DateParser.parse(date) }

  getContents(path: string): string {
    if (!path) {
      log.error('BetterBibTeX.getContents: no path')
      return null
    }

    const file = new FileUtils.File(path)
    // cannot use await $OS.File.exists here because we may be invoked in noWait mod
    if (!file.exists()) {
      log.error('BetterBibTeX.getContents:', path, 'does not exist')
      return null
    }

    try {
      return Zotero.File.getContents(file) as string
    }
    catch (err) {
      log.error('BetterBibTeX.getContents:', path, `${ err }`)
      return null
    }
  }
}

Events.on('window-loaded', async ({ win, href }: { win: Window; href: string }) => {
  switch (href) {
    case 'chrome://zotero/content/standalone/standalone.xul':
    case 'chrome://zotero/content/zoteroPane.xhtml':
      await Zotero.BetterBibTeX.loadUI(win)
      break
  }
})

Zotero.BetterBibTeX = Zotero.BetterBibTeX || new BetterBibTeX
