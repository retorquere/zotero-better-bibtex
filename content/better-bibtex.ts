/* eslint-disable prefer-rest-params */

declare const rootURI: string
const pluginID = 'better-bibtex@iris-advies.com'

import { Deferred } from './promise'
const Ready = new Deferred<boolean>

import { AltDebug } from './debug-log'

import { getItemsAsync } from './get-items-async'

import { DisplayOptions } from '../gen/translators'
import type { Reason } from './bootstrap'
import { clean_pane_persist } from './clean_pane_persist'
import { Elements } from './create-element'
import { ErrorReport } from './ErrorReport'
import * as ExportOptions from './ExportOptions'
import { flash } from './flash'
import * as MenuHelper from './menu-helper'
import { monkey } from './monkey-patch'
import { orchestrator } from './orchestrator'
import { PrefPane } from './Preferences'
import { prompt } from './prompt'
import { Scheduler } from './scheduler'
import { TeXstudio } from './tex-studio'
import { Cache } from './translators/worker'
import type { ExportedItem, ExportedItemMetadata } from './worker/cache'

import { Preference } from './prefs'

import { startup as pullExportStartup, showURLs as showPullExportURLs } from './pull-export'
pullExportStartup()

import { startup as JSONRPCStartup } from './json-rpc'
JSONRPCStartup()

import { AUXScanner } from './aux-scanner'
import * as Extra from './extra'
import { HTMLParser, HTMLParserOptions, sentenceCase } from './text'

import { AutoExport } from './auto-export'
import { uri } from './escape'

import { Events } from './events'
import { log } from './logger'

import * as CSL from 'citeproc'
import { fix as fixExportFormat } from './item-export-format'
import { CitekeyRecord, KeyManager } from './key-manager'
import { remigrate } from './key-manager/migrate'
import * as l10n from './l10n'
import { TestSupport } from './test-support'
import { Translators } from './translators'
import { Exporter } from './translators/worker'

import { generateBibLaTeX } from '../translators/bibtex/biblatex'
import { generateBibTeX, importBibTeX } from '../translators/bibtex/bibtex'
import { generateCSLJSON } from '../translators/csl/json'
import { generateCSLYAML, parseCSLYAML } from '../translators/csl/yaml'
import { generateBBTJSON, importBBTJSON } from '../translators/lib/bbtjson'
import type { Collected } from '../translators/lib/collect'

// MONKEY PATCHES

/*
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
*/

import { readonly } from './library'
monkey.patch(Zotero.Item.prototype, 'getField', original => function Zotero_Item_prototype_getField(field: any, _unformatted: any, _includeBaseMapped: any) {
  try {
    if (!Zotero.BetterBibTeX.starting && field === 'citationKey' && readonly(this.libraryID)) {
      return Zotero.BetterBibTeX.KeyManager.readonly(this)
    }
  }
  catch (err) {
    log.error('item.getField:', err)
  }

  return original.apply(this, arguments) as string
})

// https://github.com/retorquere/zotero-better-bibtex/issues/1221
monkey.patch(Zotero.Items, 'merge', original =>
  async function Zotero_Items_merge(item: Zotero.Item, otherItems: Zotero.Item[]) {
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
            extra.extraFields.aliases = [...extra.extraFields.aliases, ...otherExtra.extraFields.aliases]
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

  const [, solo, library, combined] = m
  const item = Zotero.BetterBibTeX.KeyManager.first({
    libraryID: library ? parseInt(library) : Zotero.Libraries.userLibraryID,
    citationKey: solo || combined,
  })
  return item ? { libraryID: item.libraryID, key: item.itemKey } : false
}

monkey.patch(Zotero.API, 'getResultsFromParams', original =>
  function Zotero_API_getResultsFromParams(params: Record<string, any>) {
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
  monkey.patch(Zotero.DataObjects.prototype, 'parseLibraryKeyHash', original =>
    function Zotero_DataObjects_prototype_parseLibraryKeyHash(libraryKey: string) {
      const item = parseLibraryKeyFromCitekey(libraryKey)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return typeof item === 'undefined' ? original.apply(this, arguments) : item
    })
}
// @ts-expect-error prototype not exported by zotero-types
if (typeof Zotero.DataObjects.prototype.parseLibraryKey === 'function') {
  // @ts-expect-error prototype not exported by zotero-types
  monkey.patch(Zotero.DataObjects.prototype, 'parseLibraryKey', original =>
    function Zotero_DataObjects_prototype_parseLibraryKey(libraryKey: string) {
      const item = parseLibraryKeyFromCitekey(libraryKey)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return typeof item === 'undefined' ? original.apply(this, arguments) : item
    })
}

import * as CAYW from './cayw'
monkey.patch(Zotero.Integration, 'getApplication', original =>
  function Zotero_Integration_getApplication(agent: string, _command: any, _docId: any) {
    if (agent === 'BetterBibTeX') return CAYW.Application
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return original.apply(this, arguments)
  })

import * as DateParser from './dateparser'
import type { ParsedDate } from './dateparser'

Zotero.Translate.Export.prototype.Sandbox.BetterBibTeX = {
  clientName: Zotero.clientName,
  clientVersion: Zotero.version,

  strToISO(_sandbox: any, str: string) {
    return DateParser.strToISO(str)
  },
  getContents(_sandbox: any, path: string): string {
    return Zotero.BetterBibTeX.getContents(path)
  },

  generateBibLaTeX(_sandbox: any, collected: Collected) {
    return generateBibLaTeX(collected)
  },
  generateBibTeX(_sandbox: any, collected: Collected) {
    return generateBibTeX(collected)
  },
  generateCSLYAML(_sandbox: any, collected: Collected) {
    return generateCSLYAML(collected)
  },
  generateCSLJSON(_sandbox: any, collected: Collected) {
    return generateCSLJSON(collected)
  },
  generateBBTJSON(_sandbox: any, collected: Collected) {
    return generateBBTJSON(collected)
  },

  parseDate(_sandbox: any, date: string): ParsedDate {
    return DateParser.parse(date)
  },
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

  parseDate(_sandbox: any, date: string): ParsedDate {
    return DateParser.parse(date)
  },

  async importBibTeX(_sandbox: any, collected: Collected) {
    return await importBibTeX(collected)
  },
  async importBBTJSON(_sandbox: any, collected: Collected) {
    return await importBBTJSON(collected)
  },
  parseCSLYAML(_sandbox: any, input: string): any {
    return parseCSLYAML(input)
  },
}

monkey.patch(Zotero.Utilities.Internal, 'itemToExportFormat', original =>
  function Zotero_Utilities_Internal_itemToExportFormat(zoteroItem: any, _legacy: any, _skipChildItems: any) {
    const serialized = original.apply(this, arguments)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof zoteroItem.id === 'number' ? fixExportFormat(serialized, zoteroItem) : serialized
  })

// so BBT-JSON can be imported without extra-field meddling
monkey.patch(Zotero.Utilities.Internal, 'extractExtraFields', original =>
  function Zotero_Utilities_Internal_extractExtraFields(extra: string, _item: any, _additionalFields: any) {
    if (extra && extra.startsWith('\x1BBBT\x1B')) {
      return { itemType: null, fields: new Map, creators: [], extra: extra.replace('\x1BBBT\x1B', '') }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return original.apply(this, arguments)
  })

monkey.patch(Zotero.Translate.Export.prototype, 'translate', original =>
  function Zotero_Translate_Export_prototype_translate() {
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
        displayOptions.exportPath = PathUtils.join(this.location.path, `${this.location.leafName}.${translator.target}`)
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
        displayOptions: { ...displayOptions, worker: true },
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

  public CSL() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return CSL // eslint-disable-line @typescript-eslint/no-unsafe-return
  }
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
          title: l10n.localize(`better-bibtex_aux-scan_title_${aux.endsWith('.aux') ? 'aux' : 'md'}`),
          text: l10n.localize('better-bibtex_aux-scan_prompt'),
          value: name,
        })
        if (!tag) return

        await AUXScanner.scan(aux, { tag })
        break

      default:
        flash(`Unsupported aux-scan target ${target}`)
        break
    }
  }

  public openDialog(url: string, title: string, properties: string, params: Record<string, any>): void {
    ;(Zotero.getMainWindow() as any)?.openDialog(url, title, properties, params)
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
    if (progressbox.hidden = progress >= 100 || progress < 0) return

    const progressmeter: XUL.Element = doc.getElementById('better-bibtex-progress-meter') as unknown as XUL.Element
    const nArcs = 20
    progressmeter.style.backgroundPosition = `-${Math.round(progress / 100 * nArcs) * 16}px 0`
    const progressbar: XUL.Element = doc.getElementById('better-bibtex-progress') as unknown as XUL.Element
    progressbar.style.opacity = `${progress / 200 + 0.5}`

    const label: XUL.Label = doc.getElementById('better-bibtex-progress-label') as unknown as XUL.Label
    label.setAttribute('value', `better bibtex: ${msg}`)
  }

  public async startup(reason: Reason): Promise<void> {
    orchestrator.add({
      id: 'start',
      description: 'waiting for zotero',
      startup: async () => {
        AltDebug.on()

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

        Events.on('cache-touch', async ({ itemIDs }) => {
          const withParents: Set<number> = new Set(itemIDs)
          for (const item of await getItemsAsync(itemIDs)) {
            if (typeof item?.parentID === 'number') withParents.add(item.parentID)
          }
          await Cache.touch([...withParents])
        })
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

        void Zotero.PreferencePanes.register({
          pluginID,
          src: `${rootURI}content/preferences.xhtml`,
          stylesheets: [`${rootURI}content/preferences.css`],
          label: 'Better BibTeX',
          defaultXUL: true,
        })

        ExportOptions.enable()
        Zotero.getMainWindows().forEach(win => {
          this.onMainWindowLoad({ window: win })
        })

        Zotero.Promise.delay(15000).then(() => {
          AltDebug.off()
        })

        Zotero.MenuManager.registerMenu({
          menuID: `${pluginID}-menu-file`,
          pluginID,
          target: 'main/menubar/file',
          menus: [
            {
              menuType: 'submenu',
              l10nID: 'better-bibtex',
              menus: [
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                { menuType: 'menuitem', l10nID: 'better-bibtex_aux-scanner', onCommand: (_event, _context) => Zotero.BetterBibTeX.scanAUX('tag') },
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                { menuType: 'menuitem', l10nID: 'better-bibtex_report-errors', onCommand: (_event, _context) => Zotero.BetterBibTeX.ErrorReport.open() },
              ],
            },
          ],
        })
        Zotero.MenuManager.registerMenu({
          menuID: `${pluginID}-menu-help`,
          pluginID,
          target: 'main/menubar/help',
          menus: [
            { menuType: 'menuitem', l10nID: 'better-bibtex_report-errors', onCommand: (_event, _context) => void Zotero.BetterBibTeX.ErrorReport.open() },
            {
              menuType: 'menuitem',
              onShowing: (event, context) => {
                context.setVisible(Preference.remigrate)
                context.menuElem?.setAttribute('label', 'Attempt re-migration of BetterBibTeX citation keys')
              },
              onCommand: (_event, _context) => void Zotero.BetterBibTeX.remigrate(),
            },
          ],
        })

        Zotero.MenuManager.registerMenu({
          menuID: `${pluginID}-menu-item`,
          pluginID,
          target: 'main/library/item',
          menus: [
            {
              menuType: 'submenu',
              l10nID: 'better-bibtex',
              icon: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
              menus: [
                {
                  menuType: 'menuitem',
                  l10nID: 'better-bibtex_zotero-pane_citekey_pin_inspire-hep',
                  onCommand: (_event, _context) => void Zotero.BetterBibTeX.KeyManager.fill('selected', { warn: true, inspireHEP: true, replace: true }),
                },
                { menuType: 'menuitem', l10nID: 'better-bibtex_zotero-pane_citekey_fill', onCommand: (_event, _context) => void Zotero.BetterBibTeX.KeyManager.fill('selected') },
                { menuType: 'menuitem', l10nID: 'better-bibtex_zotero-pane_citekey_refresh', onCommand: (_event, _context) => void Zotero.BetterBibTeX.KeyManager.fill('selected', { warn: true, replace: true }) },
                {
                  menuType: 'menuitem',
                  l10nID: 'better-bibtex_zotero-pane_biblatex_to_clipboard',
                  onCommand: (_event, _context) => void Zotero.BetterBibTeX.MenuHelper.clipSelected(Translators.bySlug.BetterBibLaTeX.translatorID),
                },
                {
                  menuType: 'menuitem',
                  l10nID: 'better-bibtex_zotero-pane_bibtex_to_clipboard',
                  onCommand: (_event, _context) => void Zotero.BetterBibTeX.MenuHelper.clipSelected(Translators.bySlug.BetterBibTeX.translatorID),
                },
                { menuType: 'separator' },
                { menuType: 'menuitem', l10nID: 'better-bibtex_zotero-pane_patch-dates', onCommand: (_event, _context) => void Zotero.BetterBibTeX.MenuHelper.patchDates() },
                { menuType: 'menuitem', l10nID: 'better-bibtex_zotero-pane_sentence-case', onCommand: (_event, _context) => void Zotero.BetterBibTeX.MenuHelper.sentenceCase() },
                {
                  menuType: 'menuitem',
                  l10nID: 'better-bibtex_zotero-pane_add-citation-links',
                  onCommand: (_event, _context) => void Zotero.BetterBibTeX.MenuHelper.addCitationLinks(),
                },
                { menuType: 'separator', onShowing: (_event, context) => context.setVisible(TeXstudio.enabled) },
                {
                  menuType: 'menuitem',
                  l10nID: 'better-bibtex_zotero-pane_tex-studio',
                  onCommand: (_event, _context) => void Zotero.BetterBibTeX.MenuHelper.toTeXstudio(),
                  onShowing: (_event, context) => context.setVisible(TeXstudio.enabled),
                },
                { menuType: 'separator' },
                { menuType: 'menuitem', l10nID: 'better-bibtex_report-errors', onCommand: (_event, _context) => void Zotero.BetterBibTeX.ErrorReport.open('items') },
              ],
            },
          ],
        })

        function selectedAutoExports(_mode: 'collection') {
          return AutoExport.db.chain()
            .find({ type: 'collection', id: Zotero.getActiveZoteroPane().getSelectedCollection(true) })
            .simplesort('path')
            .data()
        }
        Zotero.MenuManager.registerMenu({
          menuID: `${pluginID}-menu-collection`,
          pluginID,
          target: 'main/library/collection',
          menus: [
            {
              menuType: 'submenu',
              l10nID: 'better-bibtex',
              icon: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
              menus: [
                {
                  menuType: 'submenu',
                  onShowing: (_event, context) => context.setVisible(selectedAutoExports('collection').length !== 0),
                  l10nID: 'better-bibtex_preferences_auto-export',
                  menus: Array.from({ length: 10 }).map((_, i) => ({
                    menuType: 'menuitem',
                    onShowing: (event: Event, context: _ZoteroTypes.MenuManager.MenuContext) => {
                      const aes = selectedAutoExports('collection')
                      context.setVisible(typeof aes[i] !== 'undefined')
                      context.menuElem.setAttribute('label', aes[i]?.path || '[path not set]')
                    },
                    onCommand: (_event: Event, _context: _ZoteroTypes.MenuManager.MenuContext) => {
                      const ae = selectedAutoExports('collection')[i]
                      if (ae) Zotero.BetterBibTeX.AutoExport.run(ae.path)
                    },
                  })),
                },
                { menuType: 'menuitem', l10nID: 'better-bibtex_zotero-pane_show_collection-key', onCommand: (_event, _context) => showPullExportURLs('collection') },
                { menuType: 'menuitem', l10nID: 'better-bibtex_aux-scanner', onCommand: (_event, _context) => void Zotero.BetterBibTeX.scanAUX('collection') },
                { menuType: 'menuitem', l10nID: 'better-bibtex_report-errors', onCommand: (_event, _context) => void Zotero.BetterBibTeX.ErrorReport.open('collection') },
              ],
            },
          ],
        })

        Zotero.ItemTreeManager.registerColumn({
          dataKey: 'citationKey',
          label: l10n.localize('better-bibtex_zotero-pane_column_citekey'),
          pluginID,
          dataProvider: (item, _dataKey) => {
            try {
              return item.getField('citationKey') || ''
            }
            catch {
              return ''
            }
          },
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

  public async remigrate(): Promise<void> {
    try {
      await remigrate()
    }
    catch (err) {
      flash(`Better BibTeX remigrate: ${err.message}`)
    }
  }

  public onMainWindowLoad({ window }: { window: Window }): void {
    window.MozXULElement.insertFTLIfNeeded('better-bibtex.ftl')
  }

  public onMainWindowUnload({ window }: { window: Window }): void {
    window.document.querySelector('[href="better-bibtex.ftl"]')?.remove()
  }

  public parseDate(date: string): ParsedDate {
    return DateParser.parse(date)
  }

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
      log.error('BetterBibTeX.getContents:', path, `${err}`)
      return null
    }
  }
}

Zotero.BetterBibTeX ??= new BetterBibTeX
