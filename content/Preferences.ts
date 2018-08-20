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
// import { AutoExport } from './auto-export'
// import { Translators } from './translators'

// const prefOverrides = require('../gen/preferences/auto-export-overrides.json')
// const preferences = require('../gen/preferences/preferences.json')

export = new class PrefPane {
  private keyformat: any
  private refreshTimer: number

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

  public load() {
    log.debug('prefs: loading...')

    if (typeof Zotero_Preferences === 'undefined') return

    this.keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')

    // disable key format editing until DB clears because of course async
    this.keyformat.disabled = true
    Zotero.BetterBibTeX.ready
      .then(() => {
        this.keyformat.disabled = false

        this.getCitekeyFormat()
        this.update()
      })
      .catch(err => log.error('preferences.load: BBT init failed', err))

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
  }

  public unload() {
    if (this.refreshTimer) clearInterval(this.refreshTimer)
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
