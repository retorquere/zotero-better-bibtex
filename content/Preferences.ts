Components.utils.import('resource://gre/modules/Services.jsm')

import type { XUL } from '../typings/xul'

import { log } from './logger'
import { patch as $patch$ } from './monkey-patch'
import { DB as Cache } from './db/cache'

import { Preference } from '../gen/preferences'
import { options as preferenceOptions } from '../gen/preferences/meta'
import { Formatter } from './key-manager/formatter'
import { AutoExport } from './auto-export'
import { Translators } from './translators'
import { client } from './client'

const namespace = 'http://retorque.re/zotero-better-bibtex/'

class AutoExportPane {
  private label: { [key: string]: string }
  private globals: Record<string, any>
  private cacherate: Record<number, number> = {}

  constructor(globals: Record<string, any>) {
    this.globals = globals
    this.label = {}
    for (const label of ['scheduled', 'running', 'done', 'error', 'preparing']) {
      this.label[label] = Zotero.BetterBibTeX.getString(`Preferences.auto-export.status.${label}`)
    }

    this.refresh()
  }

  public refresh() {
    if (Zotero.BetterBibTeX.ready.isPending()) return null

    const auto_exports = AutoExport.db.find()

    const tabbox = this.globals.document.getElementById('better-bibtex-prefs-auto-export-tabbox')
    tabbox.setAttribute('hidden', !auto_exports.length)
    if (!auto_exports.length) return null

    const tabs = this.globals.document.getElementById('better-bibtex-prefs-auto-export-tabs')
    const tabpanels = this.globals.document.getElementById('better-bibtex-prefs-auto-export-tabpanels')

    const rebuild = {
      tabs: Array.from(tabs.children).map((node: Element) => ({ updated: parseInt(node.getAttributeNS(namespace, 'ae-updated')), id: parseInt(node.getAttributeNS(namespace, 'ae-id')) })),
      exports: auto_exports.map(ae => ({ updated: ae.meta.updated || ae.meta.created, id: ae.$loki })),
      rebuild: false,
      update: false,
    }
    rebuild.rebuild = (rebuild.tabs.length !== rebuild.exports.length) || (typeof rebuild.tabs.find((tab, index) => rebuild.exports[index].id !== tab.id) !== 'undefined')
    rebuild.update = rebuild.rebuild || (rebuild.tabs.length !== rebuild.exports.length) || (typeof rebuild.tabs.find((tab, index) => rebuild.exports[index].updated !== tab.updated) !== 'undefined')

    if (rebuild.rebuild) {
      while (tabs.children.length) tabs.removeChild(tabs.firstChild)
      while (tabpanels.children.length > 1) tabpanels.removeChild(tabpanels.firstChild)
    }

    for (const [index, ae] of auto_exports.entries()) {
      let tab, tabpanel

      if (rebuild.rebuild) {
        // tab
        tab = tabs.appendChild(this.globals.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'tab'))
        tab.setAttributeNS(namespace, 'ae-id', `${ae.$loki}`)
        tab.setAttributeNS(namespace, 'ae-updated', `${ae.meta.updated || ae.meta.created}`)

        // tabpanel
        tabpanel = (index === 0 ? tabpanels.firstChild : tabpanels.appendChild(tabpanels.firstChild.cloneNode(true)))

        // set IDs on clone
        for (const node of Array.from(tabpanel.querySelectorAll('[*|ae-id]'))) {
          (node as Element).setAttributeNS(namespace, 'ae-id', `${ae.$loki}`)
        }

        // hide/show per-translator options
        const enabled = `autoexport-${Translators.byId[ae.translatorID].label.replace(/ /g, '')}`
        // eslint is wrong here. tsc complains that hidden is not present on element, and I think tsc is correct here
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        for (const node of (Array.from(tabpanel.getElementsByClassName('autoexport-options')) as XUL.Element[])) {
          node.hidden = !node.classList.contains(enabled)
        }

      }
      else {
        tab = tabs.children[index]
        tabpanel = tabpanels.children[index]
      }

      tab.setAttribute('label', `${{ library: '\ud83d\udcbb', collection: '\ud83d\udcc2' }[ae.type]} ${this.name(ae, 'short')}`)

      const progress = AutoExport.progress.get(ae.$loki)
      for (const node of Array.from(tabpanel.querySelectorAll('[*|ae-field]'))) {
        const field = (node as Element).getAttributeNS(namespace, 'ae-field')

        if (!rebuild.update && (node as XUL.Textbox).readonly) continue

        switch (field) {
          case 'type':
            (node as XUL.Textbox).value = `${Zotero.BetterBibTeX.getString(`Preferences.auto-export.type.${ae.type}`)}:`
            break

          case 'name':
            (node as XUL.Textbox).value = this.name(ae, 'long')
            break

          case 'status':
            if (ae.status === 'running' && Preference.workersMax && typeof progress === 'number') {
              (node as XUL.Textbox).value = progress < 0 ? `${this.label.preparing} ${-progress}%` : `${progress}%`
            }
            else {
              (node as XUL.Textbox).value = this.label[ae.status]
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
            ((node as Element).parentElement as XUL.Element).hidden = !ae[field];
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
            throw new Error(`Unexpected field in refresh: ${field}`)
        }
      }
    }
  }

  public remove(node) {
    if (!Services.prompt.confirm(null, Zotero.BetterBibTeX.getString('AutoExport.delete'), Zotero.BetterBibTeX.getString('AutoExport.delete.confirm'))) return

    const ae = AutoExport.db.get(parseInt(node.getAttributeNS(namespace, 'ae-id')))
    Cache.getCollection(Translators.byId[ae.translatorID].label).removeDataOnly()
    AutoExport.db.remove(ae)
    this.refresh()
  }

  public run(node) {
    AutoExport.run(parseInt(node.getAttributeNS(namespace, 'ae-id')))
    this.refresh()
  }

  public async refreshCacheRate(node) {
    try {
      const $loki = parseInt(node.getAttributeNS(namespace, 'ae-id'))
      this.cacherate[$loki] = await AutoExport.cached($loki)
      log.debug('cacherate:', this.cacherate)
      this.refresh()
    }
    catch (err) {
      log.error('could not refresh cacherate:', err)
      this.cacherate = {}
    }
  }

  public edit(node) {
    const field = node.getAttributeNS(namespace, 'ae-field')
    const ae = AutoExport.db.get(parseInt(node.getAttributeNS(namespace, 'ae-id')))
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

export interface PrefPaneConstructable {
  new(): PrefPane // eslint-disable-line @typescript-eslint/prefer-function-type
}
export class PrefPane {
  public autoexport: AutoExportPane
  private keyformat: any
  private timer: number
  private observer: MutationObserver
  private observed: XUL.Element
  private globals: Record<string, any>

  public getCitekeyFormat(target = null): void {
    if (target) this.keyformat = target
    this.keyformat.value = Preference.citekeyFormat
  }

  public checkCitekeyFormat(target = null): void {
    if (target) this.keyformat = target
    if (this.keyformat.disabled) return // itemTypes not available yet

    let msg
    try {
      Formatter.parsePattern(this.keyformat.value)
      msg = ''
      if (this.keyformat.value) this.saveCitekeyFormat(target)
    }
    catch (err) {
      msg = err.message
      if (err.location) msg += ` at ${(err.location.start.offset as number) + 1}`
      log.error('prefs: key format error:', msg)
    }

    if (!this.keyformat.value && !msg) { msg = 'pattern is empty' }

    this.keyformat.setAttribute('style', (msg ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    this.keyformat.setAttribute('tooltiptext', msg)
  }

  public saveCitekeyFormat(target = null): void {
    if (target) this.keyformat = target
    try {
      Formatter.parsePattern(this.keyformat.value)
      Preference.citekeyFormat = this.keyformat.value
    }
    catch (error) {
      // restore previous value
      log.error('prefs: error saving new citekey format', this.keyformat.value, 'restoring previous')
      this.getCitekeyFormat()
      this.keyformat.setAttribute('style', '')
      this.keyformat.setAttribute('tooltiptext', '')
    }
  }

  public checkPostscript(): void {
    const postscript = this.globals.document.getElementById('zotero-better-bibtex-postscript')

    let error = ''
    try {
      // don't care about the return value, just if it throws an error
      new Function(postscript.value) // eslint-disable-line @typescript-eslint/no-unused-expressions
    }
    catch (err) {
      log.error('PrefPane.checkPostscript: error compiling postscript:', err)
      error = `${err}`
    }

    postscript.setAttribute('style', (error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    postscript.setAttribute('tooltiptext', error)

    this.globals.document.getElementById('better-bibtex-cache-warn-postscript').setAttribute('hidden', (postscript.value || '').indexOf('Translator.options.exportPath') < 0)
  }

  public async rescanCitekeys(): Promise<void> {
    await Zotero.BetterBibTeX.KeyManager.rescan()
  }

  public cacheReset(): void {
    Cache.reset('user-initiated')
  }

  public setQuickCopy(node: XUL.Menuitem): void {
    if (node) {
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
  }

  mutated(mutations: MutationRecord[], observer: MutationObserver): void {
    let node
    for(const mutation of mutations) {
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
        this.setQuickCopy(node)
      }
    }
  }

  public async load(globals: Record<string, any>): Promise<void> {
    this.globals = globals
    this.observer = new MutationObserver(this.mutated.bind(this))
    this.observed = this.globals.document.getElementById('zotero-prefpane-export')
    this.observer.observe(this.observed, { childList: true, subtree: true })

    const tabbox = globals.document.getElementById('better-bibtex-prefs-tabbox')
    tabbox.hidden = true

    await Zotero.BetterBibTeX.ready

    this.keyformat = this.globals.document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    this.keyformat.disabled = false

    tabbox.hidden = false

    if (typeof this.globals.Zotero_Preferences === 'undefined') {
      log.error('Preferences.load: Zotero_Preferences not ready')
      return
    }

    this.autoexport = new AutoExportPane(globals)

    $patch$(this.globals.Zotero_Preferences, 'openHelpLink', original => function() {
      if (globals.document.getElementsByTagName('prefwindow')[0].currentPane.helpTopic === 'BetterBibTeX') {
        const id = tabbox.selectedPanel.id
        if (id) this.openURL(`https://retorque.re/zotero-better-bibtex/configuration/#${id.replace('better-bibtex-prefs-', '')}`)
      }
      else {
        // eslint-disable-next-line prefer-rest-params
        original.apply(this, arguments)
      }
    })

    this.getCitekeyFormat()
    this.update()

    if (this.globals.document.location.hash === '#better-bibtex') {
      // runs into the 'TypeError: aId is undefined' problem for some reason unless I delay the activation of the pane
      // eslint-disable-next-line no-magic-numbers, @typescript-eslint/no-unsafe-return
      Zotero.setTimeout(() => this.globals.document.getElementById('zotero-prefs').showPane(this.globals.document.getElementById('zotero-prefpane-better-bibtex')), 500)
    }

    globals.window.sizeToContent()

    // no other way that I know of to know that I've just been selected
    this.timer = this.timer || this.globals.window.setInterval(this.refresh.bind(this), 500)  // eslint-disable-line no-magic-numbers
  }

  private refresh() {
    const pane = this.globals.document.getElementById('zotero-prefpane-better-bibtex')

    // unloaded
    if (!pane) {
      if (this.timer) {
        this.globals.window.clearInterval(this.timer)
        this.timer = null
      }
      return
    }

    // no other way that I know of to know that I've just been selected
    // and if I just alway do sizeToContent regardless of what's selected,
    // it makes the zotero panes too big.
    if (pane.selected) this.globals.window.sizeToContent()

    this.update()
    if (this.autoexport) this.autoexport.refresh()
  }

  private update() {
    this.checkCitekeyFormat()
    this.checkPostscript()
    this.setQuickCopy(this.globals.document.getElementById('translator-bbt-quick-copy'))

    if (client === 'jurism') {
      Zotero.Styles.init().then(() => {
        const styles = Zotero.Styles.getVisible().filter((style: { usesAbbreviation: boolean }) => style.usesAbbreviation)

        const stylebox = this.globals.document.getElementById('better-bibtex-abbrev-style-popup')
        const refill = stylebox.children.length === 0
        const selectedStyle = Preference.autoAbbrevStyle
        let selectedIndex = -1
        for (const [i, style] of styles.entries()) {
          if (refill) {
            const itemNode = this.globals.document.createElement('menuitem')
            itemNode.setAttribute('value', style.styleID)
            itemNode.setAttribute('label', style.title)
            stylebox.appendChild(itemNode)
          }
          if (style.styleID === selectedStyle) selectedIndex = i
        }
        if (selectedIndex === -1) selectedIndex = 0
        this.styleChanged(selectedIndex)

        Zotero.setTimeout(() => { stylebox.ensureIndexIsVisible(selectedIndex); stylebox.selectedIndex = selectedIndex }, 0)
      })
    }

    const quickCopyNode = this.globals.document.getElementById('id-better-bibtex-preferences-quickCopyMode').selectedItem
    const quickCopyMode = quickCopyNode ? quickCopyNode.getAttribute('value') : ''
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    for (const node of (Array.from(this.globals.document.getElementsByClassName('better-bibtex-preferences-quickcopy-details')) as XUL.Element[])) {
      node.hidden = (node.id !== `better-bibtex-preferences-quickcopy-${quickCopyMode}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    for (const state of (Array.from(this.globals.document.getElementsByClassName('better-bibtex-preferences-worker-state')) as XUL.Textbox[])) {
      state.value = Zotero.BetterBibTeX.getString(`BetterBibTeX.workers.${Preference.workersMax ? 'status' : 'disabled'}`, {
        total: Translators.workers.total,
        workers: Preference.workersMax,
        running: Translators.workers.running.size,
      })
      state.classList[Preference.workersMax ? 'remove' : 'add']('textbox-emph')
    }
    this.globals.window.sizeToContent()
  }

  private styleChanged(index) {
    if (client !== 'jurism') return null

    const stylebox = this.globals.document.getElementById('better-bibtex-abbrev-style-popup')
    const selectedItem = typeof index !== 'undefined' ? stylebox.getItemAtIndex(index) : stylebox.selectedItem
    const styleID = selectedItem.getAttribute('value')
    Preference.autoAbbrevStyle = styleID
  }
}
