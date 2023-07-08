Components.utils.import('resource://gre/modules/Services.jsm')

import type { XUL } from '../typings/xul'

import { log } from './logger'
import { DB as Cache } from './db/cache'

import { Preference } from './prefs'
import { options as preferenceOptions, defaults as preferenceDefaults } from '../gen/preferences/meta'
import { Formatter } from './key-manager/formatter'
import { AutoExport } from './auto-export'
import { Translators } from './translators'
import { client } from './client'
import * as l10n from './l10n'
import { Events } from './events'
import { pick } from './file-picker'
import { flash } from './flash'

// safe to keep "global" since only one pref pane will be loaded at any one time
var window: Window & { sizeToContent(): void } // eslint-disable-line no-var
Events.on('window-loaded', ({ win, href }: {win: Window, href: string}) => {
  switch (href) {
    case 'chrome://zotero/content/preferences/preferences.xul': // Z6
      new ZoteroPreferences(win)
      break

    case 'chrome://zotero/content/preferences/preferences.xhtml': // Z7
      break

    case 'chrome://zotero-better-bibtex/content/Preferences.xul':
      window = win as any;
      (window as any).Zotero = Zotero
      window.addEventListener('unload', () => {
        Zotero.BetterBibTeX.PrefPane.unload()
        window = null
      })
      Zotero.BetterBibTeX.PrefPane.load().catch(err => log.error(err))
      break
  }
})

Events.on('preference-changed', (pref: string) => {
  switch (pref) {
    case 'citekeyFormatEditing':
      Zotero.BetterBibTeX.PrefPane.checkCitekeyFormat()
      break
    case 'postscript':
      Zotero.BetterBibTeX.PrefPane.checkPostscript()
      break
  }
})

function setQuickCopy(node: XUL.Menuitem): void {
  if (!node) return

  let mode = ''
  let cmd = ''
  switch (Preference.quickCopyMode) {
    case 'latex':
      cmd = `${Preference.citeCommand}`.trim()
      mode = (cmd === '') ? 'citation keys' : `\\${cmd}{citation keys}`
      break

    case 'pandoc':
      mode = Preference.quickCopyPandocBrackets ? '[@citekeys]' : '@citekeys'
      break

    default:
      mode = preferenceOptions.quickCopyMode[Preference.quickCopyMode] || Preference.quickCopyMode
  }

  node.label = `Better BibTeX Quick Copy: ${mode}`
}

class ZoteroPreferences {
  private observer: MutationObserver
  private observed: XUL.Element

  constructor(win: Window) {
    this.observer = new MutationObserver(this.mutated.bind(this))
    this.observed = win.document.getElementById('zotero-prefpane-export') as unknown as XUL.Element
    this.observer.observe(this.observed, { childList: true, subtree: true })
    win.addEventListener('unload', () => {
      this.observer.disconnect()
    })
  }

  mutated(mutations: MutationRecord[], observer: MutationObserver): void {
    let node
    for (const mutation of mutations) {
      if (!mutation.addedNodes) continue

      if (this.observed?.id === 'zotero-prefpane-export' && (node = [...mutation.addedNodes].find((added: XUL.Element) => added.id === 'zotero-prefpane-export-groupbox'))) {
        observer.disconnect()
        this.observer = new MutationObserver(this.mutated.bind(this))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        this.observed = [...node.getElementsByTagNameNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menulist')].find(added => added.id === 'zotero-quickCopy-menu')
        this.observer.observe(this.observed, { childList: true, subtree: true })
      }
      else if (this.observed?.tagName === 'menulist' && (node = [...mutation.addedNodes].find((added: XUL.Menuitem) => added.tagName === 'menuitem' && added.label?.match(/Better BibTeX.*Quick Copy/)))) {
        node.id = 'translator-bbt-quick-copy'
        setQuickCopy(node)
      }
    }
  }
}

class AutoExportPane {
  private label: { [key: string]: string }
  private cacherate: Record<number, number> = {}

  public load() {
    if (!this.label) {
      this.label = {}
      for (const status of ['scheduled', 'running', 'done', 'error', 'preparing']) {
        this.label[status] = l10n.localize(`better-bibtex_preferences_auto-export_status_${status}`)
      }
    }

    this.refresh()

    Events.on('export-progress', ( { pct, ae }) => {
      if (pct >= 100 && typeof ae === 'number') {
        this.refreshCacheRate(ae).catch(err => log.error('failed to refresh cacherate for completed auto-export', ae, err))
      }
    })
  }

  public refresh() {
    if (!window || Zotero.BetterBibTeX.ready.isPending()) return null

    const ui = {
      data: AutoExport.db.find(),
      select: window.document.getElementById('better-bibtex-prefs-auto-export-select'),
      deck: window.document.getElementById('better-bibtex-prefs-auto-export-deck'),
    }

    window.document.getElementById('better-bibtex-prefs-auto-exports').setAttribute('hidden', `${!ui.data.length}`)
    if (!ui.data.length) return null

    const rebuild = {
      tabs: Array.from(ui.select.children).map((node: Element) => ({ updated: parseInt(node.getAttribute('data-ae-updated')), id: parseInt(node.getAttribute('data-ae-id')) })),
      exports: ui.data.map(ae => ({ updated: ae.meta.updated || ae.meta.created, id: ae.$loki })),
      rebuild: false,
      refresh: false,
    }
    rebuild.rebuild = (rebuild.tabs.length !== rebuild.exports.length) || (typeof rebuild.tabs.find((tab, index) => rebuild.exports[index].id !== tab.id) !== 'undefined')
    rebuild.refresh = rebuild.rebuild || (rebuild.tabs.length !== rebuild.exports.length) || (typeof rebuild.tabs.find((tab, index) => rebuild.exports[index].updated !== tab.updated) !== 'undefined')

    if (rebuild.rebuild) {
      while (ui.select.children.length) ui.select.removeChild(ui.select.firstChild)
      while (ui.deck.children.length > 1) ui.deck.removeChild(ui.deck.firstChild)
    }

    for (const [index, ae] of ui.data.entries()) {
      let option, pane

      if (rebuild.rebuild) {
        option = ui.select.appendChild(window.document.createElementNS('http://www.w3.org/1999/xhtml', 'option'))
        option.setAttribute('value', `${ae.$loki}`)
        option.setAttribute('data-ae-id', `${ae.$loki}`)
        option.setAttribute('data-ae-updated', `${ae.meta.updated || ae.meta.created}`)

        pane = (index === 0 ? ui.deck.firstChild : ui.deck.appendChild(ui.deck.firstChild.cloneNode(true)))

        // set IDs on clone
        for (const node of Array.from(pane.querySelectorAll('*[data-ae-id]'))) {
          (node as Element).setAttribute('data-ae-id', `${ae.$loki}`)
        }

        const enabled = `autoexport-${Translators.byId[ae.translatorID].label.replace(/ /g, '')}`
        // eslint is wrong here. tsc complains that hidden is not present on element, and I think tsc is correct here
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        for (const node of (Array.from(pane.getElementsByClassName('autoexport-options')) as XUL.Element[])) {
          node.hidden = !node.classList.contains(enabled)
        }
      }
      else {
        option = ui.select.children[index]
        pane = ui.deck.children[index]
      }

      const path = ae.path.startsWith(OS.Constants.Path.homeDir) ? ae.path.replace(OS.Constants.Path.homeDir, '~') : ae.path
      option.textContent = `${{ library: '\ud83d\udcbb', collection: '\ud83d\udcc2' }[ae.type]} ${this.name(ae, 'short')} (${Translators.byId[ae.translatorID].label}) ${path}`

      const progress = AutoExport.progress.get(ae.$loki)
      for (const node of Array.from(pane.querySelectorAll('*[data-ae-field]'))) {
        const field = (node as Element).getAttribute('data-ae-field')

        if (!rebuild.refresh && (node as XUL.Textbox).readonly) continue

        switch (field) {
          case 'type':
            (node as XUL.Textbox).value = `${l10n.localize(`better-bibtex_preferences_auto-export_type_${ae.type}`)}:`
            break

          case 'name':
            (node as XUL.Textbox).value = this.name(ae, 'long')
            break

          case 'status':
            if (ae.status === 'running' && typeof progress === 'number') {
              (node as XUL.Textbox).value = progress < 0 ? `${this.label?.preparing || 'preparing'} ${-progress}%` : `${progress}%`
            }
            else {
              (node as XUL.Textbox).value = this.label?.[ae.status] || ae.status
            }
            break

          case 'updated':
            (node as XUL.Textbox).value = `${new Date(ae.meta.updated || ae.meta.created)}`
            break

          case 'translator':
            (node as XUL.Textbox).value = Translators.byId[ae.translatorID].label
            break

          case 'path':
            (node as XUL.Textbox).value = ae[field]
            break

          case 'error':
            ((node as Element).parentElement as unknown as XUL.Element).hidden = !ae[field];
            (node as XUL.Textbox).value = ae[field]
            break

          case 'exportNotes':
          case 'useJournalAbbreviation':
          case 'asciiBibTeX':
          case 'bibtexParticleNoOp':
          case 'asciiBibLaTeX':
          case 'biblatexExtendedNameFormat':
          case 'recursive':
            (node as XUL.Checkbox).checked = ae[field]
            break

          case 'DOIandURL':
          case 'bibtexURL':
            (node as XUL.Menulist).value = ae[field]
            break

          case 'cacherate':
            (node as XUL.Textbox).value = typeof this.cacherate[ae.$loki] === 'number' ? `${this.cacherate[ae.$loki]}%`: '? %'
            break

          default:
            throw new Error(`Unexpected field in auto-export refresh: ${field}`)
        }
      }
    }
  }

  public remove(node) {
    if (!Services.prompt.confirm(null, l10n.localize('better-bibtex_auto-export_delete'), l10n.localize('better-bibtex_auto-export_delete_confirm'))) return

    const ae = AutoExport.db.get(parseInt(node.getAttribute('data-ae-id')))
    Cache.getCollection(Translators.byId[ae.translatorID].label)?.removeDataOnly()
    AutoExport.db.remove(ae)
    this.refresh()
  }

  public run(node) {
    AutoExport.run(parseInt(node.getAttribute('data-ae-id')))
    this.refresh()
  }

  public async refreshCacheRate(ae: Element | number) {
    if (typeof ae !== 'number') ae = parseInt(ae.getAttribute('data-ae-id'))

    if (typeof ae !== 'number') {
      log.error('refresh cacherate on unknown ae?', typeof ae)
    }
    else {
      try {
        this.cacherate[ae] = await AutoExport.cached(ae)
      }
      catch (err) {
        log.error('could not refresh cacherate for', ae, err)
        delete this.cacherate[ae]
      }
    }
    this.refresh()
  }

  public edit(node) {
    const field = node.getAttribute('data-ae-field')
    const ae = AutoExport.db.get(parseInt(node.getAttribute('data-ae-id')))
    Cache.getCollection(Translators.byId[ae.translatorID].label).removeDataOnly()

    switch (field) {
      case 'exportNotes':
      case 'useJournalAbbreviation':
      case 'asciiBibTeX':
      case 'bibtexParticleNoOp':
      case 'asciiBibLaTeX':
      case 'biblatexExtendedNameFormat':
      case 'recursive':
        ae[field] = node.checked
        break

      case 'DOIandURL':
      case 'bibtexURL':
        ae[field] = node.value
        break

      default:
        log.error('unexpected field', field)
    }

    AutoExport.db.update(ae)
    AutoExport.run(ae.$loki)
    this.refresh()
  }

  private collection(id: number | string, form: 'long' | 'short'): string {
    if (typeof id === 'string') id = parseInt(id)
    if (isNaN(id)) return ''
    const coll = Zotero.Collections.get(id)
    if (!coll) return ''

    if (form === 'long' && !isNaN(parseInt(coll.parentID))) {
      return `${this.collection(coll.parentID, form)} / ${coll.name}`
    }
    else {
      return `${Zotero.Libraries.get(coll.libraryID).name} : ${coll.name}`
    }
  }

  private name(ae: { type: string, id: number, path: string }, form: 'long' | 'short'): string {
    switch (ae.type) {
      case 'library':
        return (Zotero.Libraries.get(ae.id).name as string)

      case 'collection':
        return this.collection(ae.id, form)

      default:
        return ae.path
    }
  }
}

export class PrefPane {
  public autoexport = new AutoExportPane
  private timer: number
  // private prefwindow: HTMLElement

  public async exportPrefs(): Promise<void> {
    let file = await pick(Zotero.getString('fileInterface.export'), 'save', [['BBT JSON file', '*.json']])
    if (!file) return
    if (!file.match(/.json$/)) file = `${file}.json`
    Zotero.File.putContents(Zotero.File.pathToFile(file), JSON.stringify({ config: { preferences: Preference.all } }, null, 2))
  }

  public async importPrefs(): Promise<void> {
    const preferences: { path: string, contents?: string, parsed?: any } = {
      path: await pick(Zotero.getString('fileInterface.import'), 'open', [['BBT JSON file', '*.json']]),
    }
    if (!preferences.path) return

    try {
      preferences.contents = Zotero.File.getContents(preferences.path)
    }
    catch (err) {
      flash(`could not read contents of ${preferences.path}`)
      return
    }

    try {
      preferences.parsed = JSON.parse(preferences.contents)
    }
    catch (err) {
      flash(`could not parse contents of ${preferences.path}`)
      return
    }

    if (typeof preferences.parsed?.config?.preferences !== 'object') {
      flash(`no preferences in ${preferences.path}`)
      return
    }

    try {
      for (let [pref, value] of Object.entries(preferences.parsed.config.preferences)) {
        if (pref === 'citekeyFormatEditing') continue
        if (pref === 'citekeyFormat') pref = 'citekeyFormatEditing'

        if (typeof value === 'undefined' || typeof value !== typeof preferenceDefaults[pref]) {
          flash(`Invalid ${typeof value} value for ${pref}, expected ${preferenceDefaults[pref]}`)
        }
        else if (Preference[pref] !== value) {
          Preference[pref] = value
          flash(`${pref} set`, `${pref} set to ${JSON.stringify(value)}`)
        }
      }
    }
    catch (err) {
      flash(err.message)
    }
  }

  public checkCitekeyFormat(): void {
    if (!window || Zotero.BetterBibTeX.ready.isPending()) return // itemTypes not available yet

    const error = Formatter.update([Preference.citekeyFormatEditing, Preference.citekeyFormat])
    const style = error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''

    const editing = window.document.getElementById('id-better-bibtex-preferences-citekeyFormatEditing')
    editing.setAttribute('style', style)
    editing.setAttribute('tooltiptext', error)

    const msg = window.document.getElementById('better-bibtex-citekeyFormat-error') as HTMLInputElement
    msg.value = error
    msg.setAttribute('style', style)
    msg.style.visibility = error ? 'visible' : 'hidden'

    const active = window.document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    const label = window.document.getElementById('id-better-bibtex-label-citekeyFormat')
    active.style.visibility = label.style.visibility = Preference.citekeyFormat === Preference.citekeyFormatEditing ? 'hidden' : 'visible'
  }

  public checkPostscript(): void {
    if (!window) {
      log.debug('Preferences.checkPostscript: window not loaded yet?')
      return
    }

    let error = ''
    try {
      // don't care about the return value, just if it throws an error
      new Function(Preference.postscript) // eslint-disable-line @typescript-eslint/no-unused-expressions
    }
    catch (err) {
      log.error('PrefPane.checkPostscript: error compiling postscript:', err)
      error = `${err}`
    }

    const postscript = window.document.getElementById('zotero-better-bibtex-postscript')
    postscript.setAttribute('style', (error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    postscript.setAttribute('tooltiptext', error)
    window.document.getElementById('better-bibtex-cache-warn-postscript').setAttribute('hidden', `${!Preference.postscript.includes('Translator.options.exportPath')}`)
  }

  public async rescanCitekeys(): Promise<void> {
    await Zotero.BetterBibTeX.KeyManager.rescan()
  }

  public cacheReset(): void {
    Cache.reset('user-initiated')
  }

  public async load(): Promise<void> {
    const deck = window.document.getElementById('better-bibtex-prefs-deck') as unknown as XUL.Deck
    deck.selectedIndex = 0

    await Zotero.BetterBibTeX.ready

    // bloody *@*&^@# html controls only sorta work for prefs
    for (const node of Array.from(window.document.querySelectorAll("select[preference], input[preference][type='range']"))) {
      (node as HTMLInputElement).value = Preference[node.getAttribute('preference').replace('extensions.zotero.translators.better-bibtex.', '')]
    }

    window.document.getElementById('rescan-citekeys').hidden = !Zotero.Debug.enabled

    deck.selectedIndex = 1

    this.autoexport.load()

    this.checkCitekeyFormat()
    this.checkPostscript()
    this.refresh()
    this.timer = typeof this.timer === 'number' ? this.timer : window.setInterval(this.refresh.bind(this), 500)  // eslint-disable-line no-magic-numbers
  }

  public unload(): void {
    if (typeof this.timer !== 'undefined') {
      window.clearInterval(this.timer)
      this.timer = undefined
    }
  }

  public refresh(): void {
    if (!window) return

    const pane = window.document.getElementById('zotero-prefpane-better-bibtex')
    // unloaded
    if (!pane) {
      this.unload()
      return
    }

    const quickCopyDetails: XUL.Deck = window.document.getElementById('quickCopyDetails') as unknown as XUL.Deck
    const quickCopyId = `better-bibtex-preferences-quickcopy-${Preference.quickCopyMode}`
    quickCopyDetails.selectedIndex = Array.from(quickCopyDetails.children).findIndex(details => details.id === quickCopyId)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    for (const node of (Array.from(window.document.getElementsByClassName('jurism')) as unknown[] as XUL.Element[])) {
      node.hidden = client !== 'jurism'
    }

    if (client === 'jurism') {
      Zotero.Styles.init().then(() => {
        const styles = Zotero.Styles.getVisible().filter((style: { usesAbbreviation: boolean }) => style.usesAbbreviation)

        const stylebox = window.document.getElementById('better-bibtex-abbrev-style-popup') as unknown as XUL.Menulist
        const refill = stylebox.children.length === 0
        const selectedStyle = Preference.autoAbbrevStyle
        let selectedIndex = -1
        for (const [i, style] of styles.entries()) {
          if (refill) {
            const itemNode = window.document.createElement('menuitem')
            itemNode.setAttribute('value', style.styleID)
            itemNode.setAttribute('label', style.title)
            stylebox.appendChild(itemNode)
          }
          if (style.styleID === selectedStyle) selectedIndex = i
        }
        if (selectedIndex === -1) selectedIndex = 0
        this.styleChanged(selectedIndex)

        setTimeout(() => {
          stylebox.ensureIndexIsVisible(selectedIndex)
          stylebox.selectedIndex = selectedIndex
        }, 0)
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    for (const state of (Array.from(window.document.getElementsByClassName('better-bibtex-preferences-worker-state')) as unknown[] as XUL.Textbox[])) {
      state.value = l10n.localize('better-bibtex_workers_status', {
        total: Translators.workers.total,
        running: Translators.workers.running.size,
      })
      state.classList.remove('textbox-emph')
    }

    if (this.autoexport) this.autoexport.refresh()
  }

  private styleChanged(index) {
    if (client !== 'jurism') return null

    const stylebox = window.document.getElementById('better-bibtex-abbrev-style-popup') as unknown as XUL.Menulist
    const selectedItem: XUL.Element = typeof index !== 'undefined' ? stylebox.getItemAtIndex(index) : stylebox.selectedItem
    const styleID = selectedItem.getAttribute('value')
    Preference.autoAbbrevStyle = styleID
  }
}
