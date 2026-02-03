/* eslint-disable prefer-rest-params */

import { Deferred } from './promise'
const Ready = new Deferred<boolean>

import { MenuManager } from 'zotero-plugin-toolkit'
const Menu = new MenuManager

import { DebugLog } from 'zotero-plugin/debug-log'
import { jwk as pubkey } from './public'

import { Scheduler } from './scheduler'
import { TeXstudio } from './tex-studio'
import { prompt } from './prompt'
import { Elements } from './create-element'
import * as ExportOptions from './ExportOptions'
import * as MenuHelper from './menu-helper'
import { PrefPane } from './Preferences'
import { ErrorReport } from './ErrorReport'
import { monkey } from './monkey-patch'
import { clean_pane_persist } from './clean_pane_persist'
import { flash } from './flash'
import { orchestrator } from './orchestrator'
import type { Reason } from './bootstrap'
import type { ExportedItem, ExportedItemMetadata } from './worker/cache'
import { Cache } from './translators/worker'
import { DisplayOptions } from '../gen/translators'

import { Preference } from './prefs'

import { startup as pullExportStartup } from './pull-export'
pullExportStartup()

import { startup as JSONRPCStartup } from './json-rpc'
JSONRPCStartup()

import { AUXScanner } from './aux-scanner'
import * as Extra from './extra'
import { sentenceCase, HTMLParser, HTMLParserOptions } from './text'

import { AutoExport } from './auto-export'
import { uri } from './escape'

import { log } from './logger'
import { Events } from './events'

import { Translators } from './translators'
import { Exporter } from './translators/worker'
import { fix as fixExportFormat } from './item-export-format'
import { KeyManager, CitekeyRecord } from './key-manager'
import { TestSupport } from './test-support'
import * as l10n from './l10n'
import * as CSL from 'citeproc'

import { generateBibLaTeX } from '../translators/bibtex/biblatex'
import { generateBibTeX, importBibTeX } from '../translators/bibtex/bibtex'
import { generateBBTJSON, importBBTJSON } from '../translators/lib/bbtjson'
import { generateCSLYAML, parseCSLYAML } from '../translators/csl/yaml'
import { generateCSLJSON } from '../translators/csl/json'
import type { Collected } from '../translators/lib/collect'

// MONKEY PATCHES

// zotero moved itemToCSLJSON to Zotero.Utilities.Item, jurism for the moment keeps it on ZU
monkey.patch(Zotero.Utilities.Item?.itemToCSLJSON ? Zotero.Utilities.Item : Zotero.Utilities, 'itemToCSLJSON', original => function itemToCSLJSON(zoteroItem: { itemID: any }) {
  const cslItem = original.apply(this, arguments)

  try {
    if (typeof Zotero.Item !== 'undefined' && !(zoteroItem instanceof Zotero.Item)) {
      const citekey = Zotero.BetterBibTeX.KeyManager.get(zoteroItem.itemID)
      if (citekey?.citationKey) {
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
monkey.patch(Zotero.Items, 'merge', original => async function Zotero_Items_merge(item: Zotero.Item, otherItems: Zotero.Item[]) {
  try {
    // log.verbose = true
    const merge = {
      citationKey: Preference.extraMergeCitekeys,
      tex: Preference.extraMergeTeX,
      kv: Preference.extraMergeCSL,
    }

    if (merge.citationKey || merge.tex || merge.kv) {
      const extra = Extra.get(item.getField('extra'), 'zotero', { aliases: merge.citationKey, tex: merge.tex, kv: merge.kv })
      // get citekeys of other items
      if (merge.citationKey) {
        const otherIDs = otherItems.map(i => i.id)
        extra.extraFields.aliases = [
          ...extra.extraFields.aliases,
          ...Zotero.BetterBibTeX.KeyManager.find({ itemID: { $in: otherIDs } }).map((key: CitekeyRecord) => key.citationKey),
        ]
      }

      // add any aliases they were already holding
      for (const i of otherItems) {
        const otherExtra = Extra.get(i.getField('extra'), 'zotero', { aliases: merge.citationKey, tex: merge.tex, kv: merge.kv })

        if (merge.citationKey) {
          extra.extraFields.aliases = [ ...extra.extraFields.aliases, ...otherExtra.extraFields.aliases ]
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
              for (const creator of value) {
                if (!existing.includes(creator)) existing.push(creator)
              }
            }
          }
        }
      }

      if (merge.citationKey) {
        const citekey = Zotero.BetterBibTeX.KeyManager.get(item.id)?.citationKey
        extra.extraFields.aliases = extra.extraFields.aliases.filter(alias => alias !== citekey)
      }

      item.setField('extra', Extra.set(extra.extra, {
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
  const decoded = uri.decode(libraryKey)
  const m = decoded.match(/^@(.+)|bbt:(?:[{](\d+)[}])?(.+)/)
  if (!m) return

  const [ , solo, library, combined ] = m
  const item = Zotero.BetterBibTeX.KeyManager.first({
    libraryID: library ? parseInt(library) : Zotero.Libraries.userLibraryID,
    citationKey: solo || combined,
  })
  return item ? { libraryID: item.libraryID, key: item.itemKey } : false
}

monkey.patch(Zotero.API, 'getResultsFromParams', original => function Zotero_API_getResultsFromParams(params: Record<string, any>) {
  const libraryID = params.libraryID || Zotero.Libraries.userLibraryID
  function ck(key: string): string {
    const m = key.match(/^(bbt:|@)(.+)/)
    if (!m) return key
    const citekey: CitekeyRecord = Zotero.BetterBibTeX.KeyManager.first({ libraryID, citationKey: m[2] })
    return citekey ? citekey.itemKey : key
  }

  if (params.objectType === 'item' && params.objectKey) {
    params.objectKey = ck(params.objectKey)
  }
  else if (Array.isArray(params.itemKey)) {
    params.itemKey = params.itemKey.map(ck)
    params.url = params.url.replace(/itemKey=.*/, `itemKey=${params.itemKey.join(',')}`)
  }

  return original.apply(this, arguments) as Record<string, any>
})

// @ts-expect-error prototype not exported by zotero-types
if (typeof Zotero.DataObjects.prototype.parseLibraryKeyHash === 'function') {
  // @ts-expect-error prototype not exported by zotero-types
  monkey.patch(Zotero.DataObjects.prototype, 'parseLibraryKeyHash', original => function Zotero_DataObjects_prototype_parseLibraryKeyHash(libraryKey: string) {
    const item = parseLibraryKeyFromCitekey(libraryKey)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof item === 'undefined' ? original.apply(this, arguments) : item
  })
}
// @ts-expect-error prototype not exported by zotero-types
if (typeof Zotero.DataObjects.prototype.parseLibraryKey === 'function') {
  // @ts-expect-error prototype not exported by zotero-types
  monkey.patch(Zotero.DataObjects.prototype, 'parseLibraryKey', original => function Zotero_DataObjects_prototype_parseLibraryKey(libraryKey: string) {
    const item = parseLibraryKeyFromCitekey(libraryKey)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof item === 'undefined' ? original.apply(this, arguments) : item
  })
}

import * as CAYW from './cayw'
monkey.patch(Zotero.Integration, 'getApplication', original => function Zotero_Integration_getApplication(agent: string, _command: any, _docId: any) {
  if (agent === 'BetterBibTeX') return CAYW.Application
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

import * as DateParser from './dateparser'
import type { ParsedDate } from './dateparser'

Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  clientName: Zotero.clientName,
  clientVersion: Zotero.version,

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
  clientVersion: Zotero.version,

  parseHTML(_sandbox: any, text: { toString: () => any }, options: HTMLParserOptions) {
    options = {
      ...options,
      exportBraceProtection: Preference.exportBraceProtection,
      csquotes: Preference.csquotes,
      exportTitleCase: Preference.exportTitleCase,
    }
    return HTMLParser.parse(text.toString(), options)
  },

  parseDate(_sandbox: any, date: string): ParsedDate { return DateParser.parse(date) },

  async importBibTeX(_sandbox: any, collected: Collected) { return await importBibTeX(collected) },
  async importBBTJSON(_sandbox: any, collected: Collected) { return await importBBTJSON(collected) },
  parseCSLYAML(_sandbox: any, input: string): any { return parseCSLYAML(input) },
}

monkey.patch(Zotero.Utilities.Internal, 'itemToExportFormat', original => function Zotero_Utilities_Internal_itemToExportFormat(zoteroItem: any, _legacy: any, _skipChildItems: any) {
  const serialized = original.apply(this, arguments)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return typeof zoteroItem.id === 'number' ? fixExportFormat(serialized, zoteroItem) : serialized
})

// so BBT-JSON can be imported without extra-field meddling
monkey.patch(Zotero.Utilities.Internal, 'extractExtraFields', original => function Zotero_Utilities_Internal_extractExtraFields(extra: string, _item: any, _additionalFields: any) {
  if (extra && extra.startsWith('\x1BBBT\x1B')) {
    return { itemType: null, fields: (new Map), creators: [], extra: extra.replace('\x1BBBT\x1B', '') }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return original.apply(this, arguments)
})

monkey.patch(Zotero.Translate.Export.prototype, 'translate', original => function Zotero_Translate_Export_prototype_translate() {
  let translatorID = this.translator[0]
  if (translatorID.translatorID) translatorID = translatorID.translatorID
  // requested translator
  const translator = Translators.byId[translatorID]
  if (this.noWait || !translator) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return original.apply(this, arguments)
  }

  const displayOptions = this._displayOptions = this._displayOptions || {}
  Zotero.BetterBibTeX.lastExport = {
    translatorID,
    displayOptions,
  }

  if (this.location) {
    if (displayOptions.exportFileData) { // when exporting file data, the user was asked to pick a directory rather than a file
      displayOptions.exportDir = this.location.path
      displayOptions.exportPath = PathUtils.join(this.location.path, `${ this.location.leafName }.${ translator.target }`)
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

  if (useWorker && !Exporter.ready) {
    // there wasn't an error starting a worker earlier
    flash('failed to start a chromeworker')
    useWorker = false
  }

  if (useWorker) {
    return Translators.queueJob({
      translatorID,
      displayOptions: {...displayOptions, worker: true},
      translate: this,
      scope: { ...this._export, getter: this._itemGetter },
      path: this.location?.path,
    })
  }
  else {
    return original.apply(this, arguments) // eslint-disable-line @typescript-eslint/no-unsafe-return
  }
})

const scheduler = new Scheduler<'column-refresh'>(500)

export class BetterBibTeX {
  public clientName = Zotero.clientName
  public clientVersion = Zotero.version

  public uninstalled = false
  public Orchestrator = orchestrator
  public Cache = {
    fetch(_itemID: number): ExportedItem | null {
      return null
    },
    store(_itemID: number, _entry: string, _metadata: ExportedItemMetadata): void {
      return
    },
  }

  public lastExport: { translatorID: string; displayOptions: DisplayOptions } = { translatorID: '', displayOptions: {} }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types
  public CSL() { return CSL }
  public TestSupport: TestSupport
  public KeyManager = KeyManager
  public AutoExport = AutoExport
  public Text = { sentenceCase }

  // panes
  public ErrorReport = new ErrorReport
  public PrefPane = new PrefPane
  public Translators = Translators
  public MenuHelper = MenuHelper

  public ready: Promise<boolean> = Ready.promise
  public dir: string

  public debugEnabledAtStart: boolean

  public generateCSLJSON = generateCSLJSON

  constructor() {
    this.debugEnabledAtStart = Zotero.Prefs.get('debug.store') || Zotero.Debug.storing
    if (Preference.testing) this.TestSupport = new TestSupport
  }

  public get starting(): boolean {
    return Ready.pending
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
        let name = PathUtils.filename(aux)
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
    (Zotero.getMainWindow() as any)?.openDialog(url, title, properties, params)
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
        await Promise.all([
          Zotero.initializationPromise,
          Zotero.unlockPromise,
          // Zotero.uiReadyPromise,
        ])
        while (await Zotero.DB.valueQueryAsync("SELECT COUNT(*) FROM settings WHERE setting='globalSchema' AND key='migrateExtra'")) {
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
        DebugLog.register('Better BibTeX', ['translators.better-bibtex.'], pubkey)

        // and this
        if ((await Translators.needsInstall()).length) await Zotero.Translators.init()

        await l10n.initialize()

        this.dir = PathUtils.join(Zotero.DataDirectory.dir, 'better-bibtex')
        await IOUtils.makeDirectory(this.dir, { ignoreExisting: true, createAncestors: true })
        await Preference.startup(this.dir)

        Events.startup()
        Events.on('export-progress', ({ pct, message }) => {
          this.setProgress(pct, message)
        })

        Events.cacheTouch = async (ids: number[]) => {
          const withParents: Set<number> = new Set(ids)
          for (const item of await Zotero.Items.getAsync(ids)) {
            if (typeof item.parentID === 'number') withParents.add(item.parentID)
          }
          await Cache.touch([...withParents])
        }
        Events.addIdleListener('cache-purge', Preference.autoExportIdleWait)
        Events.on('idle', async state => {
          if (state.topic === 'cache-purge' && Cache.ready) await Cache.Serialized.purge()
        })
      },
    })

    orchestrator.add({
      id: 'done',
      description: 'user interface',
      startup: () => {
        Ready.resolve(true)

        ExportOptions.enable()
        Zotero.getMainWindows().forEach(win => {
          this.onMainWindowLoad({ window: win })
        })

        Zotero.Promise.delay(15000).then(() => {
          DebugLog.unregister('Better BibTeX')
        })

        monkey.enable()
      },
      shutdown: async () => { // eslint-disable-line @typescript-eslint/require-await
        Zotero.getMainWindows().forEach(win => {
          this.onMainWindowUnload({ window: win })
        })
        scheduler.clear()
        ExportOptions.disable()
        Events.shutdown()
        Elements.removeAll()
        Menu.unregisterAll()
        monkey.disableAll()
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

  public onMainWindowLoad({ window }: { window: Window }): void {
    window.MozXULElement.insertFTLIfNeeded('better-bibtex.ftl')

    const doc = window.document

    if (!doc.querySelector('#better-bibtex-menuFile')) {
      Menu.register('menuFile', {
        id: 'better-bibtex-menuFile',
        tag: 'menu',
        label: 'Better BibTeX',
        children: [
          { tag: 'menuitem', label: l10n.localize('better-bibtex_aux-scanner'), oncommand: "Zotero.BetterBibTeX.scanAUX('tag')" },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_report-errors'), oncommand: 'Zotero.BetterBibTeX.ErrorReport.open()' },
        ],
      })
    }

    if (!doc.querySelector('#better-bibtex-menuHelp')) {
      Menu.register('menuHelp', {
        id: 'better-bibtex-menuHelp',
        tag: 'menuitem',
        label: l10n.localize('better-bibtex_report-errors'),
        oncommand: 'Zotero.BetterBibTeX.ErrorReport.open()',
      })
    }

    if (!doc.querySelector('#better-bibtex-menuItem')) {
      Menu.register('item', {
        id: 'better-bibtex-menuItem',
        tag: 'menu',
        label: 'Better BibTeX',
        icon: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
        children: [
          { tag: 'menuitem', label: l10n.localize('better-bibtex_citekey_set'), oncommand: 'Zotero.BetterBibTeX.KeyManager.set()' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_citekey_pin'), oncommand: 'Zotero.BetterBibTeX.KeyManager.pin("selected")' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_citekey_pin_inspire-hep'), oncommand: 'Zotero.BetterBibTeX.KeyManager.pin("selected", true)' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_citekey_refresh'), oncommand: 'Zotero.BetterBibTeX.KeyManager.refresh("selected", true)' },
          {
            tag: 'menuitem',
            label: l10n.localize('better-bibtex_zotero-pane_biblatex_to_clipboard'),
            oncommand: `Zotero.BetterBibTeX.MenuHelper.clipSelected('${Translators.bySlug.BetterBibLaTeX.translatorID}')`,
          },
          {
            tag: 'menuitem',
            label: l10n.localize('better-bibtex_zotero-pane_bibtex_to_clipboard'),
            oncommand: `Zotero.BetterBibTeX.MenuHelper.clipSelected('${Translators.bySlug.BetterBibTeX.translatorID}')`,
          },
          { tag: 'menuseparator' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_patch-dates'), oncommand: 'Zotero.BetterBibTeX.MenuHelper.patchDates()' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_sentence-case'), oncommand: 'Zotero.BetterBibTeX.MenuHelper.sentenceCase()' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_add-citation-links'), oncommand: 'Zotero.BetterBibTeX.MenuHelper.addCitationLinks()' },
          { tag: 'menuseparator', isHidden: () => !TeXstudio.enabled },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_tex-studio'), oncommand: 'Zotero.BetterBibTeX.MenuHelper.toTeXstudio()', isHidden: () => !TeXstudio.enabled },
          { tag: 'menuseparator' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_report-errors'), oncommand: 'Zotero.BetterBibTeX.ErrorReport.open("items")' },
        ],
      })
    }

    if (!doc.querySelector('#better-bibtex-menuCollection')) {
      Menu.register('collection', {
        id: 'better-bibtex-menuCollection',
        tag: 'menu',
        label: 'Better BibTeX',
        icon: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
        children: [
          {
            tag: 'menu',
            isHidden: MenuHelper.AEisHidden,
            label: l10n.localize('zotero-collectionmenu-bbt-autoexport'),
            children: Array.from({length: 10}).map((_, i) => ({
              tag: 'menuitem',
              id: `better-bibtex-collection-menu-ae-${i}`,
              label: '',
              isHidden: MenuHelper.AEisHidden,
              oncommand: 'Zotero.BetterBibTeX.AutoExport.run(this.getAttribute("label"))',
            })),
          },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_show_collection-key'), oncommand: 'Zotero.BetterBibTeX.MenuHelper.pullExport()' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_aux-scanner'), oncommand: 'Zotero.BetterBibTeX.scanAUX("collection")' },
          // { tag: 'menuitem', label: l10n.localize('better-bibtex_zotero-pane_tag_duplicates'), oncommand: 'Zotero.BetterBibTeX.KeyManager.tagDuplicates("libraryID")' },
          { tag: 'menuitem', label: l10n.localize('better-bibtex_report-errors'), oncommand: 'Zotero.BetterBibTeX.ErrorReport.open("collection")' },
        ],
      })
    }
  }

  public onMainWindowUnload({ window }: { window: Window }): void {
    log.info(`onMainWindowUnload ${typeof window}`)
    window.document.querySelector('[href="better-bibtex.ftl"]')?.remove()
    Menu.unregisterAll()
  }

  public parseDate(date: string): ParsedDate { return DateParser.parse(date) }

  getContents(path: string): string {
    if (!path) {
      log.error('BetterBibTeX.getContents: no path')
      return null
    }

    const file = new FileUtils.File(path)
    // cannot use await File.exists here because we may be invoked in noWait mod
    if (!file.exists()) {
      log.error('BetterBibTeX.getContents:', path, 'does not exist')
      return null
    }

    try {
      // @ts-expect-error deprecated method
      return Zotero.File.getContents(file) as string
    }
    catch (err) {
      log.error('BetterBibTeX.getContents:', path, `${ err }`)
      return null
    }
  }
}

Zotero.BetterBibTeX = Zotero.BetterBibTeX || new BetterBibTeX
