declare const document: any
declare const window: any
declare const Zotero: any
declare const Zotero_Preferences: any

declare const Components: any
Components.utils.import('resource://gre/modules/Services.jsm')
declare const Services: any

import { log } from './logger'
import { patch as $patch$ } from './monkey-patch'
import * as ZoteroDB from './db/zotero'
import { DB as Cache } from './db/cache'

import { Preferences as Prefs } from './prefs'
import { Formatter } from './key-manager/formatter'
import { KeyManager } from './key-manager'
import { AutoExport } from './auto-export'
import { Translators } from './translators'
import { client } from './client'

import { override } from './prefs-meta'

const namespace = 'http://retorque.re/zotero-better-bibtex/'

class AutoExportPane {
  public items: { [key: string]: number[] } = {}

  private label: { [key: string]: string }

  constructor() {
    this.label = {}
    for (const label of ['scheduled', 'running', 'done', 'error']) {
      this.label[label] = Zotero.BetterBibTeX.getString(`Preferences.auto-export.status.${label}`)
    }

    this.refresh()
  }

  public refresh() {
    if (Zotero.BetterBibTeX.ready.isPending()) return null

    const auto_exports = AutoExport.db.find()

    const tabbox = document.getElementById('better-bibtex-prefs-auto-export-tabbox')
    tabbox.setAttribute('hidden', !auto_exports.length)
    if (!auto_exports.length) return null

    const tabs = document.getElementById('better-bibtex-prefs-auto-export-tabs')
    const tabpanels = document.getElementById('better-bibtex-prefs-auto-export-tabpanels')

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
        tab = tabs.appendChild(document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'tab'))
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
            (node as XUL.Textbox).value = this.label[ae.status]
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

          case 'cached':
            // eslint-disable-next-line no-case-declarations
            const items = this.items[`${ae.type}=${ae.id}`] || []
            // eslint-disable-next-line no-case-declarations
            let ratio = 100

            if (items.length) {
              const query = {
                exportNotes: ae.exportNotes,
                useJournalAbbreviation: ae.useJournalAbbreviation,
                itemID: { $in: items },
              }
              for (const pref of override.names) {
                query[pref] = ae[pref]
              }
              const cached = Cache.getCollection(Translators.byId[ae.translatorID].label).find(query)
              ratio = Math.round((cached.length * 100) / items.length) // eslint-disable-line no-magic-numbers
            }
            (node as XUL.Textbox).value = `${ratio}%`

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

export = new class PrefPane {
  public autoexport: AutoExportPane
  private keyformat: any
  private timer: number

  public getCitekeyFormat(target = null) {
    if (target) this.keyformat = target
    this.keyformat.value = Prefs.get('citekeyFormat')
  }

  public checkCitekeyFormat(target = null) {
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

  public saveCitekeyFormat(target = null) {
    if (target) this.keyformat = target
    try {
      Formatter.parsePattern(this.keyformat.value)
      Prefs.set('citekeyFormat', this.keyformat.value)
    }
    catch (error) {
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
      new Function(postscript.value) // eslint-disable-line @typescript-eslint/no-unused-expressions
    }
    catch (err) {
      log.error('PrefPane.checkPostscript: error compiling postscript:', err)
      error = `${err}`
    }

    postscript.setAttribute('style', (error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    postscript.setAttribute('tooltiptext', error)

    document.getElementById('better-bibtex-cache-warn-postscript').setAttribute('hidden', (postscript.value || '').indexOf('Translator.options.exportPath') < 0)
  }

  public async rescanCitekeys() {
    await KeyManager.rescan()
  }

  public cacheReset() {
    Cache.reset()
  }

  public load() {
    this.loadAsync().catch(err => { log.error('Preferences.load:', err) })
  }

  public async loadAsync() {
    const tabbox = document.getElementById('better-bibtex-prefs-tabbox')
    tabbox.hidden = true

    await Zotero.BetterBibTeX.ready

    this.keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    this.keyformat.disabled = false

    tabbox.hidden = false

    if (typeof Zotero_Preferences === 'undefined') {
      log.error('Preferences.load: Zotero_Preferences not ready')
      return
    }

    this.autoexport = new AutoExportPane

    let sql

    sql = `
      SELECT libraryID, itemID
      FROM items item
      WHERE
        item.itemTypeID NOT IN (${KeyManager.query.type.attachment}, ${KeyManager.query.type.note})
        AND
        item.itemID NOT IN (select itemID from deletedItems)
    `
    for (const item of await ZoteroDB.queryAsync(sql)) {
      const id = `library=${item.libraryID}`
      this.autoexport.items[id] = this.autoexport.items[id] || []
      this.autoexport.items[id].push(item.itemID)
    }
    sql = `
      SELECT collectionID, itemID
      FROM collectionItems item
      WHERE
        item.itemID NOT IN (SELECT itemID FROM items WHERE itemTypeID IN (${KeyManager.query.type.attachment}, ${KeyManager.query.type.note}))
        AND
        item.itemID NOT IN (select itemID from deletedItems)
    `
    for (const item of await ZoteroDB.queryAsync(sql)) {
      const id = `collection=${item.collectionID}`
      this.autoexport.items[id] = this.autoexport.items[id] || []
      this.autoexport.items[id].push(item.itemID)
    }

    document.getElementById('better-bibtex-abbrev-style').setAttribute('collapsed', client !== 'jurism')
    document.getElementById('better-bibtex-abbrev-style-label').setAttribute('collapsed', client !== 'jurism')
    document.getElementById('better-bibtex-abbrev-style-separator').setAttribute('collapsed', client !== 'jurism')

    $patch$(Zotero_Preferences, 'openHelpLink', original => function() {
      if (document.getElementsByTagName('prefwindow')[0].currentPane.helpTopic === 'BetterBibTeX') {
        const id = document.getElementById('better-bibtex-prefs-tabbox').selectedPanel.id
        if (id) this.openURL(`https://retorque.re/zotero-better-bibtex/configuration/#${id.replace('better-bibtex-prefs-', '')}`)
      }
      else {
        // eslint-disable-next-line prefer-rest-params
        original.apply(this, arguments)
      }
    })

    this.getCitekeyFormat()
    this.update()

    if (document.location.hash === '#better-bibtex') {
      // runs into the 'TypeError: aId is undefined' problem for some reason unless I delay the activation of the pane
      // eslint-disable-next-line no-magic-numbers, @typescript-eslint/no-unsafe-return
      Zotero.setTimeout(() => document.getElementById('zotero-prefs').showPane(document.getElementById('zotero-prefpane-better-bibtex')), 500)
    }

    window.sizeToContent()

    // no other way that I know of to know that I've just been selected
    this.timer = this.timer || window.setInterval(this.refresh.bind(this), 500)  // eslint-disable-line no-magic-numbers
  }

  private refresh() {
    const pane = document.getElementById('zotero-prefpane-better-bibtex')

    // unloaded
    if (!pane) {
      if (this.timer) {
        window.clearInterval(this.timer)
        this.timer = null
      }
      return
    }

    // no other way that I know of to know that I've just been selected
    // and if I just alway do sizeToContent regardless of what's selected,
    // it makes the zotero panes too big.
    if (pane.selected) window.sizeToContent()

    this.update()
    if (this.autoexport) this.autoexport.refresh()
  }

  private update() {
    this.checkCitekeyFormat()
    this.checkPostscript()

    if (client === 'jurism') {
      Zotero.Styles.init().then(() => {
        const styles = Zotero.Styles.getVisible().filter((style: { usesAbbreviation: boolean }) => style.usesAbbreviation)

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

        Zotero.setTimeout(() => { stylebox.ensureIndexIsVisible(selectedIndex); stylebox.selectedIndex = selectedIndex }, 0)
      })
    }

    const quickCopyNode = document.getElementById('id-better-bibtex-preferences-quickCopyMode').selectedItem
    const quickCopyMode = quickCopyNode ? quickCopyNode.getAttribute('value') : ''
    for (const [row, enabledFor] of [['citeCommand', 'latex'], ['quickCopyPandocBrackets', 'pandoc']]) {
      document.getElementById(`id-better-bibtex-preferences-${row}`).setAttribute('hidden', quickCopyMode !== enabledFor)
    }

    for (const state of Array.from(document.getElementsByClassName('better-bibtex-preferences-worker-state'))) {
      (state as XUL.Textbox).value = Zotero.BetterBibTeX.getString(`BetterBibTeX.workers.${Prefs.get('workers') ? 'status' : 'disabled'}`, {
        total: Translators.workers.total,
        workers: Prefs.get('workers'),
        running: Translators.workers.running.size,
      })
    }
    window.sizeToContent()
  }

  private styleChanged(index) {
    if (client !== 'jurism') return null

    const stylebox = document.getElementById('better-bibtex-abbrev-style-popup')
    const selectedItem = typeof index !== 'undefined' ? stylebox.getItemAtIndex(index) : stylebox.selectedItem
    const styleID = selectedItem.getAttribute('value')
    Prefs.set('autoAbbrevStyle', styleID)
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
