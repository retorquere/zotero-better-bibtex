declare const document: any
declare const window: any
declare const Zotero: any
declare const Zotero_Preferences: any

import debug = require('./debug.ts')
import ZoteroConfig = require('./zotero-config.ts')
import $patch$ = require('./monkey-patch.ts')

import Prefs = require('./prefs.ts')
import Formatter = require('./keymanager/formatter.ts')
import KeyManager = require('./keymanager.ts')
import AutoExport = require('./auto-export.ts')
import Translators = require('./translators.ts')

function autoExportNameCollectionPath(id) {
  if (!id) return ''
  const coll = Zotero.Collections.get(id)
  if (!coll) return ''

  if (coll.parent) return `${autoExportNameCollectionPath(coll.parent)}/${coll.name}`
  return coll.name
}
function autoExportName(ae, full = false) {
  let name
  switch (ae.type) {
    case 'library':
      name = Zotero.Libraries.getName(ae.id)
      break
    case 'collection':
      name = full ? autoExportNameCollectionPath(ae.id) : Zotero.Collections.get(ae.id).name
      break
  }
  return name || ae.path
}

class AutoExportPrefPane {
  protected AutoExport: AutoExportPrefPane // tslint:disable-line:variable-name

  public remove() {
    const exportlist = document.getElementById('better-bibtex-export-list')
    if (!exportlist) return
    const selected = exportlist.currentIndex
    if (selected < 0) return

    const id = parseInt(exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport'))
    debug('AutoExport: removing', { id })
    AutoExport.db.remove(id)
    this.refresh()
  }

  public mark() {
    const exportlist = document.getElementById('better-bibtex-export-list')
    if (!exportlist) return
    const selected = exportlist.currentIndex
    if (selected < 0) return

    const id = parseInt(exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport'))
    AutoExport.run(id)
    this.refresh()
  }

  public refresh() {
    if (!AutoExport.db) {
      debug('AutoExportPrefPane.refresh: DB not loaded')
      return
    }

    const exportlist = document.getElementById('better-bibtex-export-list')
    if (!exportlist) return
    while (exportlist.hasChildNodes()) {
      exportlist.removeChild(exportlist.firstChild)
    }

    for (const ae of AutoExport.db.chain().simplesort('path').data()) {
      const treeitem = exportlist.appendChild(document.createElement('treeitem'))
      treeitem.setAttribute('autoexport', `${ae.$loki}`)

      const treerow = treeitem.appendChild(document.createElement('treerow'))
      // TODO: https://github.com/Microsoft/TypeScript/issues/19186
      // TODO: https://github.com/Microsoft/TypeScript/issues/1260
      const cells: Array<{label: string, tooltip?: string}> = [
        { label: `${ae.type}: ${autoExportName(ae)}` },
        { label: ae.status + (ae.updated ? ` (${ae.updated})` : ''), tooltip: ae.error },
        { label: ae.path.replace(/.*[\\\/]/, ''), tooltip: ae.path },
        { label: (Translators.byId[ae.translatorID] ? Translators.byId[ae.translatorID].label : undefined) || '??' },
        { label: `${ae.useJournalAbbreviation}` },
        { label: `${ae.exportNotes}` },
      ]
      for (const cell of cells) {
        debug('Preferences.AutoExport.refresh:', cell)
        const treecell = treerow.appendChild(document.createElement('treecell'))
        treecell.setAttribute('editable', 'false')
        treecell.setAttribute('label', cell.label)
        if (cell.tooltip) treecell.setAttribute('tooltiptext', cell.tooltip)
      }
    }

  }
}

export = new class PrefPane {
  private AutoExport: AutoExportPrefPane // tslint:disable-line:variable-name

  constructor() {
    window.addEventListener('load', () => this.load(), false)
  }

  public getCitekeyFormat() {
    debug('PrefPane.getCitekeyFormat...')
    const keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    keyformat.value = Prefs.get('citekeyFormat')
    debug('PrefPane.getCitekeyFormat got', keyformat.value)
  }

  public checkCitekeyFormat() {
    const keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')

    let msg
    try {
      Formatter.parsePattern(keyformat.value)
      msg = ''
    } catch (err) {
      msg = `${err}`
    }

    keyformat.setAttribute('style', (msg ? '-moz-appearance: none !important; background-color: DarkOrange' : ''))
    keyformat.setAttribute('tooltiptext', msg)
  }

  public saveCitekeyFormat() {
    const keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    try {
      Formatter.parsePattern(keyformat.value)
      Prefs.set('citekeyFormat', keyformat.value)
    } catch (error) {
      this.getCitekeyFormat()
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

  public update() {
    this.checkCitekeyFormat()

    if (ZoteroConfig.isJurisM) {
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

    this.AutoExport.refresh()
  }

  private load() {
    debug('PrefPane.new: loading...')
    if (typeof Zotero_Preferences === 'undefined') return

    this.AutoExport = new AutoExportPrefPane()

    // document.getElementById('better-bibtex-prefs-tab-journal-abbrev').setAttribute('hidden', !ZoteroConfig.isJurisM)
    document.getElementById('better-bibtex-abbrev-style').setAttribute('hidden', !ZoteroConfig.isJurisM)

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

    debug('PrefPane.new loaded @', document.location.hash)

    if (document.location.hash === '#better-bibtex') {
      // runs into the 'TypeError: aId is undefined' problem for some reason unless I delay the activation of the pane
      // tslint:disable-next-line:no-magic-numbers
      setTimeout(() => document.getElementById('zotero-prefs').showPane(document.getElementById('zotero-prefpane-better-bibtex')), 500)
    }
    debug('PrefPane.new: ready')
  }

  private styleChanged(index) {
    if (!ZoteroConfig.isJurisM) return

    const stylebox = document.getElementById('better-bibtex-abbrev-style')
    const selectedItem = typeof index !== 'undefined' ? stylebox.getItemAtIndex(index) : stylebox.selectedItem
    const styleID = selectedItem.getAttribute('value')
    Prefs.set('autoAbbrevStyle', styleID)
  }

  /* Unused?
  private display(id, text) {
    const elt = document.getElementById(id)
    elt.value = text
    if (text !== '') elt.setAttribute('tooltiptext', text)
  }
  */
}

// TODO: caching
//  cacheReset: ->
//    @cache.reset('user request')
//    @serialized.reset('user request')

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
