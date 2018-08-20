declare const document: any
declare const window: any
declare const Zotero: any
declare const Zotero_Preferences: any

import * as log from './debug'
import { ZoteroConfig } from './zotero-config'
import { patch as $patch$ } from './monkey-patch'

import { Preferences as Prefs } from './prefs'
import { Formatter } from './key-manager/formatter'
import { KeyManager } from './key-manager'
import { AutoExport } from './auto-export'
import { Translators } from './translators'

class AutoExportPane {
  private label: { [key: string]: string }

  constructor() {
    this.label = {}
    for (const label of ['scheduled', 'running', 'done', 'error']) {
      this.label[label] = Zotero.BetterBibTeX.getString(`Preferences.auto-export.status.${label}`)
    }

    this.refresh()
  }

  public refresh() {
    if (Zotero.BetterBibTeX.ready.isPending()) return

    log.debug('refreshing auto-exports')
    const auto_exports = AutoExport.db.find()

    const tabbox = document.getElementById('better-bibtex-prefs-tabbox')
    if (auto_exports.length) {
      tabbox.hidden = false
    } else {
      tabbox.hidden = true
      return
    }

    const tabs = document.getElementById('better-bibtex-prefs-auto-export-tabs')
    const tabpanels = document.getElementById('better-bibtex-prefs-auto-export-tabpanels')

    const rebuild = {
      panels: Array.from(tabs.children).map(node => parseInt((node as Element).getAttribute('ae-id'))),
      exports: auto_exports.map(ae => ae.$loki),
      rebuild: false,
    }
    rebuild.rebuild = (rebuild.panels.length !== rebuild.exports.length) || !rebuild.panels.every(id => rebuild.exports.includes(id))

    log.debug('refreshing auto-exports:', auto_exports, rebuild)

    if (rebuild.rebuild) {
      while (tabs.firstChild) tabs.removeChild(tabs.firstChild)
      while (tabpanels.firstChild) tabpanels.removeChild(tabpanels.firstChild)

      const template = document.getElementById('better-bibtex-prefs-auto-export-tabpanel')

      for (const ae of auto_exports) {
        const tab = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'tab')
        tab.label = `${ae.$loki}`
        tab.setAttribute('ae-id', `${ae.$loki}`)
        tab.setAttribute('id', `better-bibtex-prefs-auto-export-tab-${ae.$loki}`)
        tabs.appendChild(tab)

        const tabpanel = template.cloneNode(true)
        tabpanel.setAttribute('id', `better-bibtex-prefs-auto-export-tabpanel-${ae.$loki}`)
        for (const node of Array.from(tabpanel.querySelectorAll('[ae-id]'))) {
          (node as Element).setAttribute('ae-id', `${ae.$loki}`)
        }
        for (const node of Array.from(tabpanel.getElementsByClassName(`autoexport-${Translators.byId[ae.translatorID].label.replace(/ /g, '')}`))) {
          (node as IXUL_Element).hidden = false
        }
        tabpanels.appendChild(tabpanel)
      }
    }
    log.debug('refreshing auto-exports: panels ready')
    return

    for (const ae of auto_exports) {
      log.debug('refreshing auto-exports:', ae.$loki)
      const tabpanel = document.getElementById(`better-bibtex-prefs-auto-export-tabpanel-${ae.$loki}`)
      const tab = document.getElementById(`better-bibtex-prefs-auto-export-tab-${ae.$loki}`)

      tab.label = this.name(ae, 'short')
      log.debug('refreshing auto-exports:', tab.label)

      for (const node of Array.from(tabpanel.querySelectorAll('[ae-field]'))) {
        const field = (node as Element).getAttribute('ae-field')

        switch (field) {
          case 'name':
            (node as IXUL_Label).label = this.name(ae, 'long')
            break

          case 'status':
            (node as IXUL_Label).label = this.label[ae.status]
            break

          case 'updated':
            (node as IXUL_Label).label = `${new Date(ae.meta.updated || ae.meta.created)}`
            break

          case 'translator':
            (node as IXUL_Label).label = Translators.byId[ae.translatorID].label
            break

          case 'path':
            (node as IXUL_Label).label = ae.path
            break

          case 'error':
            (node as IXUL_Label).hidden = !!ae.error;
            (node as IXUL_Label).label = ae.error
            break

          case 'exportNotes':
          case 'useJournalAbbreviation':
          case 'asciiBibTeX':
          case 'bibtexParticleNoOp':
          case 'asciiBibLaTeX':
          case 'biblatexExtendedNameFormat':
            (node as IXUL_Checkbox).checked = ae[field]
            break

          case 'DOIandURL':
          case 'bibtexURL':
            const menuitem = Array.from((node as IXUL_Menulist).children[0].children).find(mi => mi.value === ae[field])
            if (!menuitem) throw new Error(`cannot find menuitem ${ae[field]} for ${field} in ${(node as IXUL_Menulist).children[0].children.length}`);
            (node as IXUL_Menulist).selectedItem = menuitem
            break

          default:
            throw new Error(`Unexpected field in refresh: ${field}`)
        }
      }
    }

    log.debug('refreshing auto-exports: done')
  }

  public remove(node) {
    AutoExport.db.remove(parseInt(node.getAttribute('ae-id')))
    this.refresh()
  }

  public run(node) {
    AutoExport.run(parseInt(node.getAttribute('ae-id')))
    this.refresh()
  }

  public edit(node) {
    const field = node.getAttribute('ae-field')
    const ae = AutoExport.db.findOne(parseInt(node.getAttribute('ae-id')))

    switch (field) {
      case 'exportNotes':
      case 'useJournalAbbreviation':
      case 'asciiBibTeX':
      case 'bibtexParticleNoOp':
      case 'asciiBibLaTeX':
      case 'biblatexExtendedNameFormat':
        ae[field] = node.checked
        break

      case 'DOIandURL':
      case 'bibtexURL':
        ae[field] = node.selectedItem.value
        break
    }

    AutoExport.db.update(ae)
  }

  private collection_path(id, form) {
    if (!id) return ''
    const coll = Zotero.Collections.get(id)
    if (!coll) return ''

    if (form === 'long' && typeof coll.parentID !== 'undefined') {
      return `${this.collection_path(coll.parentID, form)} / ${coll.name}`
    } else {
      return `${Zotero.Libraries.get(coll.libraryID).name} : ${coll.name}`
    }
  }

  private name(ae, form) {
    switch (ae.type) {
      case 'library':
        return Zotero.Libraries.get(ae.id).name

      case 'collection':
        return this.collection_path(ae.id, form)

      default:
        return ae.path
    }
  }
}

export = new class PrefPane {
  public autoexport: AutoExportPane
  private keyformat: any
  private timer: number

  public getCitekeyFormat() {
    log.debug('prefs: fetching citekey for display...')
    this.keyformat.value = Prefs.get('citekeyFormat')
    log.debug('prefs: fetched citekey for display:', this.keyformat.value)
  }

  public checkCitekeyFormat() {
    if (this.keyformat.disabled) return // itemTypes not available yet

    let msg
    try {
      Formatter.parsePattern(this.keyformat.value)
      msg = ''
    } catch (err) {
      msg = err.message
      if (err.location) msg += ` at ${err.location.start.offset + 1}`
      log.error('prefs: key format error:', msg)
    }

    this.keyformat.setAttribute('style', (msg ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    this.keyformat.setAttribute('tooltiptext', msg)
  }

  public saveCitekeyFormat() {
    try {
      log.debug('prefs: saving new citekey format', this.keyformat.value)
      Formatter.parsePattern(this.keyformat.value)
      Prefs.set('citekeyFormat', this.keyformat.value)
    } catch (error) {
      // restore previous value
      log.error('prefs: error saving new citekey format', this.keyformat.value, 'restoring previous')
      this.getCitekeyFormat()
      this.keyformat.setAttribute('style', '')
      this.keyformat.setAttribute('tooltiptext', '')
    }
  }

  public checkPostscript() {
    const postscript = document.getElementById('zotero-better-bibtex-postscript')

    let error = ''
    try {
      // don't care about the return value, just if it throws an error
      new Function(postscript.value) // tslint:disable-line:no-unused-expression
    } catch (err) {
      log.error('PrefPane.checkPostscript: error compiling postscript:', err)
      error = `${err}`
    }

    postscript.setAttribute('style', (error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    postscript.setAttribute('tooltiptext', error)
  }

  public async rescanCitekeys() {
    log.debug('starting manual key rescan')
    await KeyManager.rescan()
    log.debug('manual key rescan done')
  }

  public async load() {
    const tabbox = document.getElementById('better-bibtex-prefs-tabbox')
    tabbox.hidden = true

    Zotero.BetterBibTeX.ready.then(() => {
      tabbox.hidden = false
      log.debug('prefs: loading...')

      if (typeof Zotero_Preferences === 'undefined') {
        log.error('Preferences.load: Zotero_Preferences not ready')
        return
      }

      this.autoexport = new AutoExportPane

      this.keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
      this.keyformat.disabled = false

      // no other way that I know of to know that I've just been selected
      this.timer = window.setInterval(this.refresh.bind(this), 500) as any // tslint:disable-line:no-magic-numbers

      // document.getElementById('better-bibtex-prefs-tab-journal-abbrev').hidden = !ZoteroConfig.Zotero.isJurisM
      document.getElementById('better-bibtex-abbrev-style').setAttribute('collapsed', !ZoteroConfig.Zotero.isJurisM)
      document.getElementById('better-bibtex-abbrev-style-label').setAttribute('collapsed', !ZoteroConfig.Zotero.isJurisM)
      document.getElementById('better-bibtex-abbrev-style-separator').setAttribute('collapsed', !ZoteroConfig.Zotero.isJurisM)

      $patch$(Zotero_Preferences, 'openHelpLink', original => function() {
        if (document.getElementsByTagName('prefwindow')[0].currentPane.helpTopic === 'BetterBibTeX') {
          const id = document.getElementById('better-bibtex-prefs-tabbox').selectedPanel.id
          if (id) this.openURL(`https://github.com/retorquere/zotero-better-bibtex/wiki/Configuration#${id.replace('better-bibtex-prefs-', '')}`)
        } else {
          original.apply(this, arguments)
        }
      })

      this.getCitekeyFormat()
      this.update()

      log.debug('prefs: loaded @', document.location.hash)

      if (document.location.hash === '#better-bibtex') {
        // runs into the 'TypeError: aId is undefined' problem for some reason unless I delay the activation of the pane
        // tslint:disable-next-line:no-magic-numbers
        setTimeout(() => document.getElementById('zotero-prefs').showPane(document.getElementById('zotero-prefpane-better-bibtex')), 500)
      }
      log.debug('prefs: ready')

      window.sizeToContent()

    }).catch(err => {
      log.error('Preferences.load:', err)
    })
  }

  private refresh() {
    const pane = document.getElementById('zotero-prefpane-better-bibtex')

    // unloaded
    if (!pane && this.timer) return window.clearInterval(this.timer)

    // no other way that I know of to know that I've just been selected
    if (pane && pane.selected) window.sizeToContent()

    if (this.autoexport) this.autoexport.refresh()
  }

  private update() {
    this.checkCitekeyFormat()

    if (ZoteroConfig.Zotero.isJurisM) {
      Zotero.Styles.init().then(() => {
        const styles = Zotero.Styles.getVisible().filter(style => style.usesAbbreviation)
        log.debug('prefPane.update: found styles', styles)

        const stylebox = document.getElementById('better-bibtex-abbrev-style-popup')
        const refill = stylebox.children.length === 0
        const selectedStyle = Prefs.get('autoAbbrevStyle')
        let selectedIndex = -1
        for (const [i, style] of styles.entries()) {
          if (refill) {
            const itemNode = document.createElement('menuitem')
            itemNode.setAttribute('value', style.styleID)
            itemNode.setAttribute('label', style.title)
            stylebox.appendChild(itemNode)
          }
          if (style.styleID === selectedStyle) selectedIndex = i
        }
        if (selectedIndex === -1) selectedIndex = 0
        this.styleChanged(selectedIndex)

        setTimeout(() => { stylebox.ensureIndexIsVisible(selectedIndex); stylebox.selectedIndex = selectedIndex }, 0)
      })
    }

    const quickCopyNode = document.getElementById('id-better-bibtex-preferences-quickCopyMode').selectedItem
    const quickCopyMode = quickCopyNode ? quickCopyNode.getAttribute('value') : ''
    for (const [row, enabledFor] of [['citeCommand', 'latex'], ['quickCopyPandocBrackets', 'pandoc']]) {
      document.getElementById(`id-better-bibtex-preferences-${row}`).setAttribute('hidden', quickCopyMode !== enabledFor)
    }

    window.sizeToContent()
  }

  private styleChanged(index) {
    if (!ZoteroConfig.Zotero.isJurisM) return

    const stylebox = document.getElementById('better-bibtex-abbrev-style-popup')
    const selectedItem = typeof index !== 'undefined' ? stylebox.getItemAtIndex(index) : stylebox.selectedItem
    const styleID = selectedItem.getAttribute('value')
    Prefs.set('autoAbbrevStyle', styleID)
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
