import type { XUL } from '../typings/xul'

import { log } from './logger'
import { TeXstudio } from './tex-studio'
import { Translators } from './translators'
import { Patcher } from './monkey-patch'
import { clean_pane_persist } from './clean_pane_persist'
import { Preference } from './prefs'
import { AutoExport } from './auto-export'
import { flash } from './flash'
import { sentenceCase } from './text'
import * as CAYW from './cayw'
import * as Extra from './extra'
import * as DateParser from './dateparser'
import * as l10n from './l10n'
import { Elements } from './create-element'
import { is7 } from './client'
import { busyWait } from './busy-wait'
import { toClipboard } from './text'

type XULWindow = Window & {
  openDialog?: (url: string, id: string, options?: string, io?: any) => void
  ZoteroPane?: any
}

export async function newZoteroPane(win: XULWindow): Promise<void> {
  const zp = win.ZoteroPane
  await busyWait(() => typeof zp.itemsView.waitForLoad === 'function')
  await zp.itemsView.waitForLoad()
  await (new ZoteroPane).load(win)
}

class ZoteroPane {
  private $patcher$: Patcher = new Patcher
  private elements: Elements
  private ZoteroPane: any
  private window: XULWindow

  public unload(): void {
    this.$patcher$.unpatch()
    this.elements.remove()
  }

  public async load(win: XULWindow) {
    const doc = win.document
    const elements = this.elements = new Elements(doc)
    this.window = win
    this.ZoteroPane = (this.window as any).ZoteroPane
    this.ZoteroPane.BetterBibTeX = this

    this.window.addEventListener('unload', () => { this.unload() })

    if (!doc.getElementById('better-bibtex-tools-menu')) {
      const menupopup = doc.getElementById('menu_ToolsPopup')
        .appendChild(elements.create('menu', {
          id: 'better-bibtex-tools-menu',
          label: 'Better BibTeX',
          class: 'menuitem-iconic',
          image: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
        }))
        .appendChild(elements.create('menupopup'))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_aux-scanner'),
        oncommand: () => Zotero.BetterBibTeX.scanAUX('tag'),
      }))
      if (!is7) {
        menupopup.appendChild(elements.create('menuitem', {
          label: l10n.localize('better-bibtex_preferences_open.label'),
          oncommand: () => {
            this.window.openDialog('chrome://zotero-better-bibtex/content/preferences.xul', 'better-bibtex-prefs-window')
          },
        }))
      }
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_report-errors'),
        oncommand: () => this.errorReport(),
      }))

      doc.getElementById('menu_HelpPopup').insertBefore(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_report-errors'),
        oncommand: () => this.errorReport(),
      }), doc.getElementById('reportErrors').nextSibling)
    }

    const bbt_zotero_pane_helper = this // eslint-disable-line @typescript-eslint/no-this-alias

    const zp = this.ZoteroPane
    this.$patcher$.patch(this.ZoteroPane, 'buildItemContextMenu', original => async function ZoteroPane_buildItemContextMenu() {
      await original.apply(this, arguments) // eslint-disable-line prefer-rest-params

      const id = 'better-bibtex-item-menu'
      doc.getElementById(id)?.remove()

      if (!this.getSelectedItems()) return

      const menupopup = doc.getElementById('zotero-itemmenu')
        .appendChild(elements.create('menu', {
          id,
          label: 'Better BibTeX',
          class: 'menuitem-iconic',
          image: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
        }))
        .appendChild(elements.create('menupopup'))

      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_citekey_set'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.set(),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_citekey_pin'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.pin('selected'),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_citekey_pin_inspire-hep'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.pin('selected', true),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_citekey_unpin'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.unpin('selected'),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_citekey_refresh'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.refresh('selected', true),
      }))

      const clipSelected = async (translatorID: string) => {
        const items = zp.getSelectedItems()
        toClipboard(await Translators.exportItems({
          translatorID,
          displayOptions: {},
          scope: { type: 'items', items },
        }))
      }
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_copy_biblatex_to_clipboard'),
        oncommand: async () => {
          await clipSelected(Translators.bySlug.BetterBibLaTeX.translatorID)
        },
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_copy_bibtex_to_clipboard'),
        oncommand: async () => {
          await clipSelected(Translators.bySlug.BetterBibTeX.translatorID)
        },
      }))

      menupopup.appendChild(elements.create('menuseparator'))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_patch-dates'),
        oncommand: () => { bbt_zotero_pane_helper.patchDates().catch(err => log.error('patchDates', err)) },
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_sentence-case'),
        oncommand: () => { bbt_zotero_pane_helper.sentenceCase().catch(err => log.error('sentenceCase', err)) },
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_zotero-pane_add-citation-links'),
        oncommand: () => { bbt_zotero_pane_helper.addCitationLinks().catch(err => log.error('addCitationLinks', err)) },
      }))

      if (TeXstudio.enabled) {
        menupopup.appendChild(elements.create('menuseparator', { class: 'bbt-texstudio' }))
        menupopup.appendChild(elements.create('menuitem', {
          class: 'bbt-texstudio',
          label: l10n.localize('better-bibtex_zotero-pane_tex-studio'),
          oncommand: () => { bbt_zotero_pane_helper.toTeXstudio().catch(err => log.error('toTeXstudio', err)) },
        }))
      }

      menupopup.appendChild(elements.create('menuseparator'))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex_report-errors'),
        oncommand: () => { void bbt_zotero_pane_helper.errorReport('items') },
      }))
    })

    this.$patcher$.patch(this.ZoteroPane, 'buildCollectionContextMenu', original => async function() {
      // eslint-disable-next-line prefer-rest-params
      await original.apply(this, arguments)

      const id = 'better-bibtex-collection-menu'

      if (!doc.getElementById(id)) {
        const menupopup = doc.getElementById('zotero-collectionmenu')
          .appendChild(elements.create('menu', {
            id,
            label: 'Better BibTeX',
            class: 'menuitem-iconic',
            image: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
          }))
          .appendChild(elements.create('menupopup'))

        menupopup
          .appendChild(elements.create('menu', {
            id: 'zotero-collectionmenu-bbt-autoexport',
            label: l10n.localize('better-bibtex_preferences_tab_auto-export.label'),
          }))
          .appendChild(elements.create('menupopup'))

        menupopup.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-pull-url',
          label: l10n.localize('better-bibtex_zotero-pane_show_collection-key'),
          oncommand: event => { event.stopPropagation(); bbt_zotero_pane_helper.pullExport() },
          // class: 'menuitem-iconic',
          // image: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
        }))

        menupopup.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-scan-aux',
          label: l10n.localize('better-bibtex_aux-scanner'),
          oncommand: async event => { event.stopPropagation(); await Zotero.BetterBibTeX.scanAUX('collection') },
          // class: 'menuitem-iconic',
          // image: 'chrome://zotero-better-bibtex/content/skin/bibtex-menu.svg',
        }))

        menupopup.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-tag-duplicates',
          label: l10n.localize('better-bibtex_zotero-pane_tag_duplicates'),
          oncommand: async event => {
            event.stopPropagation()
            await Zotero.BetterBibTeX.KeyManager.tagDuplicates(parseInt(event.target.getAttribute('libraryID')))
          },
        }))

        menupopup.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-report-errors',
          label: l10n.localize('better-bibtex_report-errors'),
          oncommand: event => { event.stopPropagation(); void bbt_zotero_pane_helper.errorReport('collection') },
        }))
      }

      try {
        const treeRow = this.collectionsView.selectedTreeRow
        const isLibrary = treeRow && treeRow.isLibrary(true)
        const isCollection = treeRow && treeRow.isCollection()

        doc.getElementById('bbt-collectionmenu-pull-url').hidden = !(isLibrary || isCollection)
        doc.getElementById('bbt-collectionmenu-report-errors').hidden = !(isLibrary || isCollection)

        const tagDuplicates = doc.getElementById('bbt-collectionmenu-tag-duplicates')
        if (isLibrary) {
          tagDuplicates.hidden = false
          tagDuplicates.setAttribute('libraryID', treeRow.ref.libraryID.toString())
        }
        else {
          tagDuplicates.hidden = true
        }

        let auto_exports = []
        const type = isCollection ? 'collection' : isLibrary ? 'library' : ''
        if (Preference.autoExport !== 'immediate' && type) {
          auto_exports = await AutoExport.find(type, [treeRow.ref.id])
        }

        const menulist: XUL.Menulist = doc.getElementById('zotero-collectionmenu-bbt-autoexport') as XUL.Menulist
        if (!(menulist.hidden = auto_exports.length === 0)) {
          const menupopup = doc.querySelector<HTMLElement>('#zotero-collectionmenu-bbt-autoexport menupopup')
          while (menupopup.firstChild) menupopup.firstChild.remove()
          for (const ae of auto_exports) {
            menupopup.appendChild(elements.create('menuitem', {
              label: ae.path,
              oncommand: () => AutoExport.run(ae.$loki),
            }))
          }
        }
      }
      catch (err) {
        log.error('ZoteroPane.buildCollectionContextMenu:', err)
      }
    })

    // Monkey patch because of https://groups.google.com/forum/#!topic/zotero-dev/zy2fSO1b0aQ
    this.$patcher$.patch(this.ZoteroPane, 'serializePersist', original => function() {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)
      if (Zotero.BetterBibTeX.uninstalled) clean_pane_persist()
    })

    if (!is7) {
      if (this.ZoteroPane.itemsView.collectionTreeRow) await this.ZoteroPane.itemsView.refreshAndMaintainSelection()
      const selected = this.ZoteroPane.getSelectedItems(true)
      if (selected.length === 1) Zotero.Notifier.trigger('refresh', 'item', selected)
    }
  }

  public pullExport(): void {
    if (!this.ZoteroPane.collectionsView || !this.ZoteroPane.collectionsView.selection || !this.ZoteroPane.collectionsView.selection.count) return

    const row = this.ZoteroPane.collectionsView.selectedTreeRow

    const root = `http://127.0.0.1:${ Zotero.Prefs.get('httpServer.port') }/better-bibtex/export`
    const params = {
      url: {
        long: '',
        short: '',
      },
    }

    if (row.isCollection()) {
      let collection = this.ZoteroPane.getSelectedCollection()
      params.url.short = `${ root }/collection?/${ collection.libraryID || 0 }/${ collection.key }`

      let path = `/${ encodeURIComponent(collection.name) }`
      while (collection.parent) {
        collection = Zotero.Collections.get(collection.parent)
        path = `/${ encodeURIComponent(collection.name) }${ path }`
      }
      params.url.long = `${ root }/collection?/${ collection.libraryID || 0 }${ path }`
    }

    if (row.isLibrary(true)) {
      const libId = this.ZoteroPane.getSelectedLibraryID()
      const short = libId ? `/${ libId }/library` : 'library'
      params.url.short = `${ root }/library?${ short }`
    }

    if (!params.url.short) return

    this.window.openDialog(`chrome://zotero-better-bibtex/content/ServerURL.${ is7 ? 'xhtml' : 'xul' }`, '', 'chrome,dialog,centerscreen,modal', params)
  }

  public padNum(n: number, width: number): string {
    return `${ n || 0 }`.padStart(width, '0')
  }

  public async patchDates(): Promise<void> {
    const items = this.ZoteroPane.getSelectedItems()
    const mapping: Record<string, string> = {}
    try {
      for (const assignment of Preference.patchDates.trim().split(/\s*,\s*/)) {
        const [ , k, v ] = assignment.trim().match(/^([-_a-z09]+)\s*=\s*(dateadded|datemodified)$/i)
        mapping[k.toLowerCase()] = mapping[`tex.${ k.toLowerCase() }`] = { dateadded: 'dateAdded', datemodified: 'dateModified' }[v.toLowerCase()]
      }
    }
    catch {
      flash('could not parse field mapping', `could not parse field mapping ${ Preference.patchDates }`)
      return
    }

    for (const item of items) {
      let save = false
      try {
        const extra = Extra.get(item.getField('extra'), 'zotero', { tex: true })
        for (const [ k, v ] of Object.entries(extra.extraFields.tex)) {
          if (mapping[k]) {
            const date = DateParser.parse(v.value)
            if (date.type === 'date' && date.day) {
              delete extra.extraFields.tex[k]
              const time = typeof date.seconds === 'number'
              const timestamp = new Date(
                date.year, date.month - 1, date.day,
                time ? date.hour : 0, time ? date.minute - (date.offset || 0) : 0, time ? date.seconds : 0, 0
              )
              item.setField(mapping[k], timestamp.toISOString())
              save = true
            }
          }
        }
        if (save) {
          item.setField('extra', Extra.set(extra.extra, extra.extraFields))
          await item.saveTx()
        }
      }
      catch (err) {
        log.error('patchDates:', err)
      }
    }
  }

  public async addCitationLinks(): Promise<void> {
    const items = this.ZoteroPane.getSelectedItems()
    if (items.length !== 1) {
      flash('Citation links only works for a single item')
      return
    }

    const extra = items[0].getField('extra') || ''
    const citations = new Set(extra.split('\n').filter((line: string) => line.startsWith('cites:')))
    const picked = (await CAYW.pick({ format: 'citationLinks' })).split('\n').filter(citation => !citations.has(citation))

    if (picked.length) {
      items[0].setField('extra', `${ extra }\n${ picked.join('\n') }`.trim())
      await items[0].saveTx()
    }
  }

  public async toTeXstudio(): Promise<void> {
    await TeXstudio.push()
  }

  public async errorReport(items?: string): Promise<void> {
    // absolutely no idea why this does not run in the error report dialog anymore
    const selection = async () => {
      let scope = null
      const zp = Zotero.getActiveZoteroPane()
      switch (items) {
        case 'collection':
        case 'library':
          scope = { type: 'collection', collection: zp.getSelectedCollection() }
          if (!scope.collection) scope = { type: 'library', id: zp.getSelectedLibraryID() }
          break

        case 'items':
          try {
            scope = { type: 'items', items: zp.getSelectedItems() }
          }
          catch (err) { // ZoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
            log.error('Could not get selected items:', err)
          }
      }

      if (!scope) return ''

      try {
        return await Translators.queueJob({
          translatorID: Translators.bySlug.BetterBibTeXJSON.translatorID,
          displayOptions: { exportNotes: true, dropAttachments: true, Normalize: true },
          scope,
          timeout: 40,
        })
      }
      catch (err) {
        if (err.timeout) {
          log.error('errorreport: items timed out after', err.timeout, 'seconds')
          return 'Timeout retrieving items'
        }
        else {
          log.error('errorreport: could not get items', err)
          return `Error retrieving items: ${ err }`
        }
      }
    }

    items = items ? await selection() : ''

    this.window.openDialog(
      `chrome://zotero-better-bibtex/content/ErrorReport.${ is7 ? 'xhtml' : 'xul' }`,
      'better-bibtex-error-report',
      'chrome,centerscreen,modal',
      { wrappedJSObject: { items }})
  }

  public async sentenceCase(): Promise<void> {
    const items = this.ZoteroPane.getSelectedItems()
    for (const item of items) {
      let save = false

      const title = item.getField('title')
      let sentenceCased = sentenceCase(title)
      if (title !== sentenceCased) {
        save = true
        item.setField('title', sentenceCased)
      }

      const shortTitle = item.getField('shortTitle')
      if (sentenceCased.toLowerCase().startsWith(shortTitle.toLowerCase())) {
        sentenceCased = sentenceCased.substr(0, shortTitle.length)
        if (shortTitle !== sentenceCased) {
          item.setField('shortTitle', sentenceCased)
          save = true
        }
      }

      if (save) await item.saveTx()
    }
  }
}
