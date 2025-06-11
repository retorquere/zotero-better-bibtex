import * as client from './client'
import { Path } from './file'

import { log } from './logger'

import { Preference } from './prefs'
import { options as preferenceOptions, defaults as preferenceDefaults } from '../gen/preferences/meta'
import { Formatter } from './key-manager/formatter'
import { AutoExport } from './auto-export'
import { Translators } from './translators'
import * as l10n from './l10n'
import { Events } from './events'
import { FilePickerHelper } from 'zotero-plugin-toolkit'
import { flash } from './flash'
import { icons } from './icons'
import { Cache } from './translators/worker'

// safe to keep "global" since only one pref pane will be loaded at any one time
let $window: Window & { sizeToContent(): void }
Events.on('window-loaded', ({ win, href }: { win: Window; href: string }) => {
  switch (href) {
    case 'chrome://zotero/content/preferences/preferences.xul': // Zotero's own preferences on Z6
      new ZoteroPreferences(win)
      break

    case 'chrome://zotero-better-bibtex/content/preferences.xul': // BBT's own Z6 preferences
      Zotero.BetterBibTeX.PrefPane.load(win).catch(err => log.error(err))
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
    case 'chinese':
      $window?.document?.getElementById('bbt-chinese-splitname')?.setAttribute('disabled', Preference.chinese ? '' : 'true')
      break
  }
})

function setQuickCopy(node: XUL.MenuItem): void {
  if (!node) return

  let mode = ''
  let cmd = ''
  switch (Preference.quickCopyMode) {
    case 'latex':
      cmd = `${ Preference.citeCommand }`.trim()
      mode = (cmd === '') ? 'citation keys' : `\\${ cmd }{citation keys}`
      break

    case 'pandoc':
      mode = Preference.quickCopyPandocBrackets ? '[@citekeys]' : '@citekeys'
      break

    default:
      mode = preferenceOptions.quickCopyMode[Preference.quickCopyMode] || Preference.quickCopyMode
  }

  node.label = `Better BibTeX Quick Copy: ${ mode }`
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
        this.observed = [...node.getElementsByTagNameNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menulist')].find(added => added.id === 'zotero-quickCopy-menu')
        this.observer.observe(this.observed, { childList: true, subtree: true })
      }
      else if (this.observed?.tagName === 'menulist' && (node = [...mutation.addedNodes].find((added: XUL.MenuItem) => added.tagName === 'menuitem' && added.label?.match(/Better BibTeX.*Quick Copy/)))) {
        node.id = 'translator-bbt-quick-copy'
        setQuickCopy(node)
      }
    }
  }
}

class AutoExportPane {
  private status: Record<string, string>

  public async load() {
    if (!this.status) {
      this.status = {}
      for (const status of [ 'scheduled', 'running', 'done', 'error', 'preparing' ]) {
        this.status[status] = l10n.localize(`better-bibtex_preferences_auto-export_status_${ status }`)
      }
    }

    await this.refresh()

    Events.on('export-progress', async ({ pct, ae }) => {
      if (ae) if (pct >= 100) await this.refresh(ae)
    })
  }

  private label(ae) {
    let label: string = { library: icons.computer, collection: icons.folder }[ae.type]
    label += ` ${ this.name(ae, 'short') }`
    label += ` (${ Translators.byId[ae.translatorID].label })`
    label += ` ${ae.path.replace(Path.home, '~')}`
    return label
  }

  public refresh(path?: string) {
    if (!$window) return
    const doc = $window.document

    const auto_exports = AutoExport.all()
    const details = doc.querySelector<HTMLElement>('#bbt-prefs-auto-exports')
    if (details) details.style.display = auto_exports.length ? 'grid' : 'none'
    if (!auto_exports.length) return null

    const menulist = doc.querySelector<XUL.MenuList>('#bbt-prefs-auto-export-select')
    const menupopup = doc.querySelector('#bbt-prefs-auto-export-select menupopup')
    let selected
    if (menulist.selectedItem) {
      const selected$path = menulist.selectedItem.value
      selected = auto_exports.find(ae => ae.path === selected$path)
    }

    if (!selected && !path) selected = auto_exports.sort((a, b) => b.updated - a.updated)[0]

    // list changed
    if (Array.from(menupopup.children).map(ae => (ae as unknown as XUL.MenuItem).value).join('\t') !== auto_exports.map(ae => ae.path).join('\t')) {
      menulist.querySelectorAll('menuitem').forEach(e => e.remove())
      for (const ae of auto_exports) {
        const menuitem = menulist.appendItem(this.label(ae), ae.path)
        if (selected && ae.path === selected.path) menulist.selectedItem = menuitem
      }
    }
    if (!selected || !menulist.selectedItem) {
      selected = auto_exports[0]
      menulist.selectedIndex = 0
    }

    if (typeof path === 'string' && path !== selected.path) return

    if (details.getAttribute('data-ae-path') !== selected.path || details.getAttribute('data-ae-updated') !== `${ selected.updated }`) {
      details.setAttribute('data-ae-path', selected.path)
      details.setAttribute('data-ae-updated', `${ selected.updated }`)

      const displayed = `bbt-autoexport-${ Translators.byId[selected.translatorID].label.replace(/ /g, '') }`
      for (const node of (Array.from(details.getElementsByClassName('bbt-autoexport-options')) as unknown[] as XUL.Element[])) {
        node.style.display = node.classList.contains(displayed) ? 'initial' : 'none'
      }

      for (const node of Array.from(details.querySelectorAll('*[data-ae-field]')) as HTMLElement[]) {
        const field = node.getAttribute('data-ae-field')

        switch (field) {
          case 'type':
            (node as unknown as XUL.Textbox).value = `${ l10n.localize(`better-bibtex_preferences_auto-export_type_${ selected.type }`) }:`
            break

          case 'name':
            (node as unknown as XUL.Textbox).value = this.name(selected, 'long')
            break

          case 'updated':
            (node as unknown as XUL.Textbox).value = `${ new Date(selected.updated) }`
            break

          case 'translator':
            (node as unknown as XUL.Textbox).value = Translators.byId[selected.translatorID].label
            break

          case 'path':
            (node as unknown as XUL.Textbox).value = selected[field]
            break

          case 'exportNotes':
          case 'useJournalAbbreviation':
          case 'asciiBibTeX':
          case 'bibtexParticleNoOp':
          case 'asciiBibLaTeX':
          case 'biblatexExtendedNameFormat':
          case 'recursive':
          case 'biblatexAPA':
          case 'biblatexChicago':
            (node as unknown as XUL.Checkbox).checked = selected[field]
            break

          case 'DOIandURL':
          case 'bibtexURL':
            (node as unknown as XUL.MenuList).value = selected[field]
            break

          case 'cacherate':
          case 'status':
            // always set below on refresh
            break

          default:
            throw new Error(`Unexpected field in auto-export refresh: ${ field }`)
        }
      }
    }

    const status = details.querySelector("*[data-ae-field='status']") as unknown as XUL.Textbox
    const progress = AutoExport.progress.get(selected.path)
    if (selected.status === 'running' && typeof progress === 'number') {
      status.value = progress < 0 ? `${ icons.running } ${ this.status?.preparing || 'preparing' } ${ -progress }%` : `${ icons.running } ${ progress }%`
    }
    else {
      const icon: string = {
        running: icons.running,
        done: icons.check,
        scheduled: icons.waiting,
        error: icons.error,
        preparing: `${ icons.running }${ icons.waiting }`,
      }[selected.status] || selected.status

      status.value = `${ icon } ${ selected.error || '' }`.trim()
    }

    const cacherate = details.querySelector("*[data-ae-field='cacherate']") as unknown as XUL.Textbox
    cacherate.value = `${ Cache.rate[selected.path] || 0 }%`
  }

  public async remove() {
    const menulist: XUL.MenuList = $window.document.querySelector('#bbt-prefs-auto-export-select') as unknown as XUL.MenuList
    if (!menulist.selectedItem) return

    if (!Services.prompt.confirm(null, l10n.localize('better-bibtex_auto-export_delete'), l10n.localize('better-bibtex_auto-export_delete_confirm'))) return

    const path = menulist.selectedItem.getAttribute('value')
    await Cache.Exports.dropAutoExport(path, true)
    AutoExport.remove(path)
    await this.refresh()
  }

  public async run() {
    const menulist: XUL.MenuList = $window.document.querySelector('#bbt-prefs-auto-export-select') as unknown as XUL.MenuList
    if (!menulist.selectedItem) return

    AutoExport.run(menulist.selectedItem.getAttribute('value'))
    await this.refresh()
  }

  public async edit(node) {
    let path: string
    if (!(path = node.getAttribute('data-ae-path'))) {
      const menulist: XUL.MenuList = $window.document.querySelector('#bbt-prefs-auto-export-select') as unknown as XUL.MenuList
      path = menulist.selectedItem.getAttribute('value')
    }

    await Cache.Exports.dropAutoExport(path, false)

    let value: number | boolean | string
    let disable: 'biblatexChicago' | 'biblatexAPA' = null

    const field = node.getAttribute('data-ae-field')
    switch (field) {
      case 'exportNotes':
      case 'useJournalAbbreviation':
      case 'asciiBibTeX':
      case 'bibtexParticleNoOp':
      case 'asciiBibLaTeX':
      case 'biblatexExtendedNameFormat':
      case 'recursive':
      case 'biblatexAPA':
      case 'biblatexChicago':
        value = node.checked
        if (node.checked && field === 'biblatexAPA') {
          disable = 'biblatexChicago'
        }
        else if (node.checked && field === 'biblatexChicago') {
          disable = 'biblatexAPA'
        }
        break

      case 'DOIandURL':
      case 'bibtexURL':
        value = node.value
        break

      default:
        log.error('edit autoexport: unexpected field', field)
    }
    AutoExport.edit(path, field, value)
    if (disable) AutoExport.edit(path, disable, false)
    await this.refresh()
  }

  private collection(id: number | string, form: 'long' | 'short'): string {
    if (typeof id === 'string') id = parseInt(id)
    if (isNaN(id)) return ''
    const coll = Zotero.Collections.get(id)
    if (!coll) return ''

    if (form === 'long') {
      return `${this.collection(coll.parentID, form)} / ${coll.name}`
    }
    else {
      const lib = Zotero.Libraries.get(coll.libraryID)

      return `${lib ? lib.name : `:${coll.libraryID}`} : ${coll.name}`
    }
  }

  private name(ae: { type: string; id: number; path: string }, form: 'long' | 'short'): string {
    switch (ae.type) {
      case 'library': {
        const lib = Zotero.Libraries.get(ae.id)
        return lib ? lib.name : ''
      }

      case 'collection':
        return this.collection(ae.id, form)

      default:
        return ae.path
    }
  }
}

export class PrefPane {
  public autoexport = new AutoExportPane
  private timer: ReturnType<typeof setInterval>
  // private prefwindow: HTMLElement

  public async exportPrefs(): Promise<void> {
    let file = await new FilePickerHelper(Zotero.getString('fileInterface.export'), 'save', [[ 'BBT JSON file', '*.json' ]]).open()
    if (!file) return
    if (!file.match(/.json$/)) file = `${file}.json`

    const options = structuredClone(Zotero.BetterBibTeX.lastExport.displayOptions)
    delete options.cache
    delete options.exportDir
    delete options.exportPath
    delete options.keepUpdated
    delete options.worker

    Zotero.File.putContents(Zotero.File.pathToFile(file), JSON.stringify({
      config: {
        options,
        preferences: Preference.all,
      },
    }, null, 2))
  }

  public async importPrefs(): Promise<void> {
    const preferences: { path: string; contents?: string; parsed?: any } = {
      path: (await new FilePickerHelper(Zotero.getString('fileInterface.import'), 'open', [[ 'BBT JSON file', '*.json' ]]).open()) || '',
    }
    if (!preferences.path) return

    try {
      preferences.contents = (await Zotero.File.getContentsAsync(preferences.path, 'utf-8')) as string
    }
    catch {
      flash(`could not read contents of ${ preferences.path }`)
      return
    }

    try {
      preferences.parsed = JSON.parse(preferences.contents)
    }
    catch {
      flash(`could not parse contents of ${ preferences.path }`)
      return
    }

    if (typeof preferences.parsed?.config?.preferences !== 'object' && !Array.isArray(preferences.parsed.items)) {
      flash(`no preferences or items in ${ preferences.path }`)
      return
    }

    try {
      for (let [ pref, value ] of Object.entries(preferences.parsed.config.preferences || {})) {
        if (pref === 'citekeyFormatEditing') continue
        if (pref === 'citekeyFormat') pref = 'citekeyFormatEditing'

        if (typeof value === 'undefined' || typeof value !== typeof preferenceDefaults[pref]) {
          flash(`Invalid ${ typeof value } value for ${ pref }, expected ${ preferenceDefaults[pref] }`)
        }
        else if (Preference[pref] !== value) {
          Preference[pref] = value
          flash(`${ pref } set`, `${ pref } set to ${ JSON.stringify(value) }`)
        }
      }
    }
    catch (err) {
      flash(err.message)
    }

    try {
      Zotero.BetterBibTeX.KeyManager.import((preferences.parsed.items || []).reduce((updates, item) => {
        if (item.citationKey && item.itemKey) updates[item.itemKey] = item.citationKey
        return updates as Record<string, string>
      }, {}))
    }
    catch (err) {
      flash(err.message)
    }
  }

  public checkCitekeyFormat(): void {
    if (!$window || Zotero.BetterBibTeX.starting) return // itemTypes not available yet

    const error = Formatter.test(Preference.citekeyFormatEditing || Preference.citekeyFormat)
    const editing = $window.document.getElementById('bbt-preferences-citekeyFormatEditing')
    editing.classList[error ? 'add' : 'remove']('bbt-prefs-error')
    editing.setAttribute('title', error)
    editing.setAttribute('tooltip', 'html-tooltip')

    const msg = $window.document.getElementById('bbt-citekeyFormat-error') as HTMLInputElement
    msg.value = error
    msg.style.display = error ? 'initial' : 'none'

    const active = $window.document.getElementById('bbt-preferences-citekeyFormat')
    const label = $window.document.getElementById('bbt-label-citekeyFormat')
    active.style.display = label.style.display = Preference.citekeyFormat === Preference.citekeyFormatEditing ? 'none' : 'initial'

    if (!error) Formatter.update([ Preference.citekeyFormatEditing, Preference.citekeyFormat ])

    const preview = $window.document.getElementById('bbt-citekey-preview') as HTMLInputElement
    preview.style.display = 'initial'
    const previews = Zotero.getActiveZoteroPane().getSelectedItems().slice(0, 10).map(item => Zotero.BetterBibTeX.KeyManager.propose(item)).filter(key => !key.pinned).map(key => key.citationKey)
    preview.value = previews.join(', ')
  }

  public checkPostscript(): void {
    if (!$window) return

    let error = ''
    try {
      // don't care about the return value, just if it throws an error
      new Function(Preference.postscript)
    }
    catch (err) {
      log.error('PrefPane.checkPostscript: error compiling postscript:', err)
      error = `${ err }`
    }

    const postscript = $window.document.getElementById('bbt-postscript')
    postscript.setAttribute('style', (error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    postscript.setAttribute('title', error)
    postscript.setAttribute('tooltip', 'html-tooltip')
    $window.document.getElementById('bbt-cache-warn-postscript').setAttribute('hidden', `${ !Preference.postscript.includes('Translator.options.exportPath') }`)
  }

  public async cacheReset(): Promise<void> {
    Preference.cacheDelete = true
    await Cache.drop()
  }

  public async load(win: Window): Promise<void> {
    try {
      if (!win) {
        log.error('Preferences: no window?')
        return
      }
      $window = win as any

      ($window as any).Zotero = Zotero
      $window.addEventListener('unload', () => {
        Zotero.BetterBibTeX.PrefPane.unload()
        $window = null
      })

      $window?.document?.getElementById('bbt-chinese-splitname')?.setAttribute('disabled', Preference.chinese ? '' : 'true')

      await this.autoexport.load()

      $window.document.getElementById('bbt-preferences-quickcopy').addEventListener('command', () => this.showQuickCopyDetails())
      this.showQuickCopyDetails()

      this.checkCitekeyFormat()
      this.checkPostscript()
      await this.refresh()
      if (typeof this.timer === 'undefined') this.timer = setInterval(this.refresh.bind(this), 500)
    }
    catch (err) {
      log.error('error loading preferences:', err)
    }
  }

  private showQuickCopyDetails() {
    const quickcopy = 'bbt-preferences-quickcopy-details'
    const selected = `${ quickcopy }-${ Zotero.Prefs.get('translators.better-bibtex.quickCopyMode') }`
    for (const details of ([...$window.document.querySelectorAll(`.${ quickcopy }`)] as HTMLElement[])) {
      details.style.display = details.id === selected ? 'initial' : 'none'
    }
  }

  public unload(): void {
    if (typeof this.timer !== 'undefined') {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  public async refresh(): Promise<void> {
    if (!$window) return

    const pane = $window.document.getElementById('bbt-zotero-prefpane')
    // unloaded
    if (!pane) {
      this.unload()
      return
    }

    for (const node of (Array.from($window.document.getElementsByClassName('bbt-jurism')) as unknown[] as XUL.Element[])) {
      node.hidden = client.slug !== 'jurism'
    }

    this.showQuickCopyDetails()

    /*
    if (client.slug === 'jurism') {
      Zotero.Styles.init().then(() => {
        const styles = Zotero.Styles.getVisible().filter((style: { usesAbbreviation: boolean }) => style.usesAbbreviation)

        const stylebox = $window.document.getElementById('bbt-abbrev-style') as unknown as XUL.Menulist
        const refill = stylebox.children.length === 0
        const selectedStyle = Preference.autoAbbrevStyle
        let selectedIndex = -1
        for (const [ i, style ] of styles.entries()) {
          if (refill) {
            const itemNode = $window.document.createElement('menuitem')
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
    */

    if (this.autoexport) await this.autoexport.refresh()
  }

  /*
  private styleChanged(index) {
    if (client.slug !== 'jurism') return null

    const stylebox = $window.document.getElementById('bbt-abbrev-style') as unknown as XUL.Menulist
    const selectedItem: XUL.Element = typeof index !== 'undefined' ? stylebox.getItemAtIndex(index) : stylebox.selectedItem
    const styleID = selectedItem.getAttribute('value')
    Preference.autoAbbrevStyle = styleID
  }
  */
}
