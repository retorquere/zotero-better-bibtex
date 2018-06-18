declare const document: any
declare const window: any
declare const Zotero: any
declare const Zotero_Preferences: any

import { debug } from './debug.ts'
import { ZoteroConfig } from './zotero-config.ts'
import { patch as $patch$ } from './monkey-patch.ts'

import { Preferences as Prefs } from './prefs.ts'
import { Formatter } from './key-manager/formatter.ts'
import { KeyManager } from './key-manager.ts'
import { AutoExport } from './auto-export.ts'
import { Translators } from './translators.ts'

class AutoExportTreeView {
  public rowCount: number
  public rows: Array<{ columns: { name: string, value: string}, level: number, parent: number, open?: boolean, autoexport: any }> = []

  private label: { [key: string]: string }
  private treeBox: any
  private open: { [key: string]: boolean }

  constructor() {
    this.open = {}

    this.label = {}
    for (const label of ['on', 'off', 'updated', 'target', 'translator', 'abbrev', 'notes']) {
      this.label[label] = Zotero.BetterBibTeX.getString(`Preferences.auto-export.setting.${label}`)
    }
    for (const label of ['collection', 'library']) {
      this.label[label] = Zotero.BetterBibTeX.getString(`Preferences.auto-export.type.${label}`)
    }
    for (const label of ['scheduled', 'running', 'done', 'error']) {
      this.label[label] = Zotero.BetterBibTeX.getString(`Preferences.auto-export.status.${label}`)
    }
  }

  public setTree(treeBox) {
    this.treeBox = treeBox
    debug('prefs: ae view set', !!this.treeBox)
    this.refresh()
  }

  public refresh() {
    if (!this.treeBox) return

    const rows = []
    let parent = 0
    for (const ae of AutoExport.db.find()) {
      parent = rows.length
      const name = { short: this.autoExportName(ae, 'short'), long: this.autoExportName(ae, 'long') }

      rows.push({
        columns: { name: this.label[ae.status] || ae.status, value: name.short },
        level: 0,
        parent: -1,
        open: !!this.open[ae.$loki],
        autoexport: ae,
      })

      if (this.open[ae.$loki]) {
        if (name.long !== name.short) rows.push({ columns: { name: this.label[ae.type] || ae.type, value: name.long }, level: 1, parent, autoexport: ae })
        rows.push({ columns: { name: this.label.updated, value: `${new Date(ae.meta.updated || ae.meta.created)}`}, level: 1, parent, autoexport: ae })
        if (ae.error) rows.push({ columns: { name: this.label.error, value: ae.error}, level: 1, parent, autoexport: ae })
        rows.push({ columns: { name: this.label.target, value: ae.path}, level: 1, parent, autoexport: ae })
        rows.push({ columns: { name: this.label.translator, value: Translators.byId[ae.translatorID] ? Translators.byId[ae.translatorID].label : '??'}, level: 1, parent, autoexport: ae })
        rows.push({ columns: { name: this.label.abbrev, value: ae.useJournalAbbreviation ? this.label.on : this.label.off}, level: 1, parent, autoexport: ae, toggle: 'useJournalAbbreviation' })
        rows.push({ columns: { name: this.label.notes, value: ae.exportNotes ? this.label.on : this.label.off}, level: 1, parent, autoexport: ae, toggle: 'exportNotes' })
      }
    }
    this.rowCount = rows.length
    this.treeBox.rowCountChanged(0, rows.length - this.rows.length)
    this.rows = rows
    debug('ae.prefs.refresh:', this.rows)
    this.treeBox.invalidate()
  }

  public getCellText(row, column) {
    column = column.id.split('-').slice(-1)[0]
    debug('ae.prefs: getCellText', row, column, this.rows[row])
    return this.rows[row].columns[column]
  }

  public isContainer(row) {
    return this.rows[row].level === 0
  }

  public isContainerOpen(row) {
    return this.rows[row].open
  }

  public isContainerEmpty(row) { return false }
  public isSeparator(row) { return false }
  public isSorted() { return false }
  public isEditable(row, column) { return false }

  public getParentIndex(row) {
    return this.rows[row].parent
  }

  public getLevel(row) {
    return this.rows[row].level
  }

  public hasNextSibling(row, after) {
    const thisLevel = this.rows[row].level
    for (row = after + 1; row < this.rows.length; row++) {
      if (this.rows[row].level === thisLevel) return true
      if (this.rows[row].level < thisLevel) return false
    }
    return false
  }

  public toggleOpenState(row) {
    debug('ae.prefs.toggleOpenState', this.rows[row])
    if (this.rows[row].level !== 0) return

    this.open[this.rows[row].autoexport.$loki] = !this.open[this.rows[row].autoexport.$loki]
    this.refresh()
  }

  public getImageSrc(row, column) { /* do nothing */ }
  public getProgressMode(row, column) { /* do nothing */ }
  public getCellValue(row, column) { /* do nothing */ }
  public cycleHeader(col, elem) { /* do nothing */ }
  public selectionChanged() { /* do nothing */ }
  public cycleCell(row, column) { /* do nothing */ }
  public performActionOnCell(action, index, column) { /* do nothing */ }
  public getRowProperties(idx, prop) { /* do nothing */ }
  public getCellProperties(idx, column, prop) { /* do nothing */ }
  public getColumnProperties(column, element, prop) { /* do nothing */ }
  public performAction(action) { /* do nothing */ }

  private autoExportNameCollectionPath(id, form) {
    if (!id) return ''
    const coll = Zotero.Collections.get(id)
    if (!coll) return ''

    if (form === 'long' && coll.parent) {
      return `${this.autoExportNameCollectionPath(coll.parent, form)} / ${coll.name}`
    } else {
      return `${Zotero.Libraries.getName(coll.libraryID)} : ${coll.name}`
    }
  }

  private autoExportName(ae, form) {
    let name
    switch (ae.type) {
      case 'library':
        name = Zotero.Libraries.getName(ae.id)
        break
      case 'collection':
        name = this.autoExportNameCollectionPath(ae.id, form)
        break
    }
    return name || ae.path
  }
}

export = new class PrefPane {
  private exportlist: any
  // private exportlist_view: AutoExportTreeView // because the verflixten Mozilla tree implementation proxies this object and makes the inner data unavailable
  private keyformat: any
  private refreshTimer: number

  public getCitekeyFormat() {
    debug('prefs: fetching citekey for display...')
    this.keyformat.value = Prefs.get('citekeyFormat')
    debug('prefs: fetched citekey for display:', this.keyformat.value)
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
      debug('prefs: key format error:', msg)
    }

    this.keyformat.setAttribute('style', (msg ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    this.keyformat.setAttribute('tooltiptext', msg)
  }

  public saveCitekeyFormat() {
    try {
      debug('prefs: saving new citekey format', this.keyformat.value)
      Formatter.parsePattern(this.keyformat.value)
      Prefs.set('citekeyFormat', this.keyformat.value)
    } catch (error) {
      // restore previous value
      debug('prefs: error saving new citekey format', this.keyformat.value, 'restoring previous')
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
      debug('PrefPane.checkPostscript: error compiling postscript:', err)
      error = `${err}`
    }

    postscript.setAttribute('style', (error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    postscript.setAttribute('tooltiptext', error)
  }

  public async rescanCitekeys() {
    debug('starting manual key rescan')
    await KeyManager.rescan()
    debug('manual key rescan done')
  }

  public load() {
    debug('prefs: loading...')

    if (typeof Zotero_Preferences === 'undefined') return

    this.keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')

    // disable key format editing until DB clears because of course async
    this.keyformat.disabled = true
    Zotero.BetterBibTeX.ready
      .then(() => {
        this.keyformat.disabled = false

        this.exportlist = document.getElementById('better-bibtex-export-list')
        this.exportlist.view = this.exportlist._view = new AutoExportTreeView // because the verflixten Mozilla tree implementation proxies this object and makes the inner data unreachable

        this.refreshTimer = setInterval(() => { this.aeRefresh() }, 1000) as any // tslint:disable-line:no-magic-numbers

        this.getCitekeyFormat()
        this.update()
      })
      .catch(err => debug('preferences.load: BBT init failed', err))

    // no other way that I know of to know that I've just been selected
    const timer = window.setInterval(() => {
      const pane = document.getElementById('zotero-prefpane-better-bibtex')
      if (pane) {
        if (pane.selected) window.sizeToContent()
      } else {
        window.clearInterval(timer)
      }
    }, 500) // tslint:disable-line:no-magic-numbers

    // document.getElementById('better-bibtex-prefs-tab-journal-abbrev').setAttribute('hidden', !ZoteroConfig.Zotero.isJurisM)
    document.getElementById('better-bibtex-abbrev-style').setAttribute('hidden', !ZoteroConfig.Zotero.isJurisM)
    document.getElementById('better-bibtex-abbrev-style-label').setAttribute('hidden', !ZoteroConfig.Zotero.isJurisM)

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

    debug('prefs: loaded @', document.location.hash)

    if (document.location.hash === '#better-bibtex') {
      // runs into the 'TypeError: aId is undefined' problem for some reason unless I delay the activation of the pane
      // tslint:disable-next-line:no-magic-numbers
      setTimeout(() => document.getElementById('zotero-prefs').showPane(document.getElementById('zotero-prefpane-better-bibtex')), 500)
    }
    debug('prefs: ready')

    window.sizeToContent()
  }

  public unload() {
    if (this.refreshTimer) clearInterval(this.refreshTimer)
  }

  public aeSelected() {
    if (!this.exportlist) return false
    if (this.exportlist.currentIndex < 0) return false
    return this.exportlist._view.rows[this.exportlist.currentIndex]
  }
  public aeRemove() {
    const selected = this.aeSelected()
    if (!selected) return

    debug('AutoExport: removing', { selected })
    AutoExport.db.remove(selected.autoexport)
    this.aeRefresh()
  }

  public aeRun() {
    const selected = this.aeSelected()
    if (!selected) return

    AutoExport.run(selected.autoexport.$loki)
    this.aeRefresh()
  }

  public aeToggle(event) {
    const selected = this.aeSelected()
    if (!selected || !selected.toggle) return

    selected.autoexport[selected.toggle] = !selected.autoexport[selected.toggle]
    AutoExport.db.update(selected.autoexport)
    AutoExport.run(selected.autoexport.$loki)
    this.aeRefresh()
  }

  public aeRefresh() {
    if (!this.exportlist) return

    this.exportlist._view.refresh()
  }

  private update() {
    this.checkCitekeyFormat()

    if (ZoteroConfig.Zotero.isJurisM) {
      Zotero.Styles.init().then(() => {
        const styles = Zotero.Styles.getVisible().filter(style => style.usesAbbreviation)
        debug('prefPane.update: found styles', styles)

        const stylebox = document.getElementById('better-bibtex-abbrev-style')
        const refill = stylebox.children.length === 0
        const selectedStyle = Prefs.get('autoAbbrevStyle')
        let selectedIndex = -1
        for (const [i, style] of styles.entries()) {
          if (refill) {
            const itemNode = document.createElement('listitem')
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

    this.aeRefresh()

    window.sizeToContent()
  }

  private styleChanged(index) {
    if (!ZoteroConfig.Zotero.isJurisM) return

    const stylebox = document.getElementById('better-bibtex-abbrev-style')
    const selectedItem = typeof index !== 'undefined' ? stylebox.getItemAtIndex(index) : stylebox.selectedItem
    const styleID = selectedItem.getAttribute('value')
    Prefs.set('autoAbbrevStyle', styleID)
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
