import { log } from './logger'
import { TeXstudio } from './tex-studio'
import { patch as $patch$, unpatch as $unpatch$, Trampoline } from './monkey-patch'
import { clean_pane_persist } from './clean_pane_persist'
import { Preference } from './prefs'
import { AutoExport } from './auto-export'
import { flash } from './flash'
import { sentenceCase } from './text'
import * as CAYW from './cayw'
import { $and } from './db/loki'
import * as Extra from './extra'
import * as DateParser from './dateparser'
import * as l10n from './l10n'
import { Elements } from './create-element'

export class ZoteroPane {
  private patched: Trampoline[] = []
  private elements: Elements
  private ZoteroPane: any
  private window: Window

  public unload(): void {
    $unpatch$(this.patched)
    this.elements.remove()
  }

  constructor(win: Window, doc: Document) {
    const elements = this.elements = new Elements(doc)
    this.window = win
    this.ZoteroPane = (this.window as any).ZoteroPane
    this.ZoteroPane.BetterBibTeX = this

    this.window.addEventListener('unload', () => { this.unload() })

    if (!doc.getElementById('better-bibtex-tools-menu')) {
      const menupopup = doc.getElementById('menu_ToolsPopup')
        .appendChild(elements.create('menu', {
          id: 'better-bibtex-tools-menu',
          label: l10n.localize('better-bibtex.BetterBibTeX'),
          class: 'menu-iconic',
          image: 'chrome://zotero-better-bibtex/skin/bibtex-menu.svg',
        }))
        .appendChild(elements.create('menupopup'))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.auxScanner'),
        oncommand: () => Zotero.BetterBibTeX.scanAUX('tag'),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.Preferences.open'),
        oncommand: () => {
          (this.window as any).openDialog('chrome://zotero-better-bibtex/content/Preferences.xul', 'better-bibtex-prefs-window')
        },
      }))

      doc.getElementById('menu_HelpPopup').insertBefore(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.reportErrors'),
        oncommand: () => this.errorReport(),
      }), doc.getElementById('reportErrors').nextSibling)
    }

    const bbt_zotero_pane_helper = this // eslint-disable-line @typescript-eslint/no-this-alias

    $patch$(this.ZoteroPane, 'buildItemContextMenu', original => async function ZoteroPane_buildItemContextMenu() {
      await original.apply(this, arguments) // eslint-disable-line prefer-rest-params

      const id = 'better-bibtex-item-menu'
      doc.getElementById(id)?.remove()

      if (!this.getSelectedItems()) return

      const menupopup = doc.getElementById('zotero-itemmenu')
        .appendChild(elements.create('menu', {
          id,
          label: l10n.localize('better-bibtex.BetterBibTeX'),
          class: 'menu-iconic',
          image: 'chrome://zotero-better-bibtex/skin/bibtex-menu.svg',
        }))
        .appendChild(elements.create('menupopup'))

      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.citekey.set'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.set(),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.citekey.pin'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.pin('selected'),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.citekey.pinInspireHEP'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.pin('selected', true),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.citekey.unpin'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.unpin('selected'),
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.citekey.refresh'),
        oncommand: () => Zotero.BetterBibTeX.KeyManager.refresh('selected', true),
      }))

      menupopup.appendChild(elements.create('menuseparator'))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.patchDates'),
        oncommand: () => { bbt_zotero_pane_helper.patchDates().catch(err => log.error('patchDates', err)) },
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.sentenceCase'),
        oncommand: () => { bbt_zotero_pane_helper.sentenceCase().catch(err => log.error('sentenceCase', err)) },
      }))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.addCitationLinks'),
        oncommand: () => { bbt_zotero_pane_helper.addCitationLinks().catch(err => log.error('addCitationLinks', err)) },
      }))

      if (TeXstudio.enabled) {
        menupopup.appendChild(elements.create('menuseparator', { class: 'bbt-texstudio' }))
        menupopup.appendChild(elements.create('menuitem', {
          class: 'bbt-texstudio',
          label: l10n.localize('better-bibtex.BetterBibTeX.TeXstudio'),
          oncommand: () => { bbt_zotero_pane_helper.toTeXstudio().catch(err => log.error('toTeXstudio', err)) },
        }))
      }

      menupopup.appendChild(elements.create('menuseparator'))
      menupopup.appendChild(elements.create('menuitem', {
        label: l10n.localize('better-bibtex.BetterBibTeX.reportErrors'),
        oncommand: () => { bbt_zotero_pane_helper.errorReport('items') },
      }))
    })

    $patch$(this.ZoteroPane, 'buildCollectionContextMenu', original => async function() {
      // eslint-disable-next-line prefer-rest-params
      await original.apply(this, arguments)

      if (!doc.getElementById('bbt-collectionmenu-separator')) {
        const collectionmenu = doc.getElementById('zotero-collectionmenu')

        collectionmenu.appendChild(elements.create('menuseparator', { class: 'zotero-collectionmenu-bbt-autoexport', id: 'bbt-collectionmenu-separator' }))
        collectionmenu
          .appendChild(elements.create('menu', {
            class: 'zotero-collectionmenu-bbt-autoexport',
            label: l10n.localize('better-bibtex.Preferences.tab.auto-export'),
          }))
          .appendChild(elements.create('menupopup', {
            id: 'zotero-collectionmenu-bbt-autoexport-menupopup',
          }))
          .appendChild(elements.create('menuitem', {
            oncommand: event => { event.stopPropagation(); bbt_zotero_pane_helper.startAutoExport(event) },
          }))

        collectionmenu.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-pull-url',
          label: l10n.localize('better-bibtex.BetterBibTeX.show-collection-key'),
          oncommand: event => { event.stopPropagation(); bbt_zotero_pane_helper.pullExport() },
          class: 'menuitem-iconic',
          image: 'chrome://zotero-better-bibtex/skin/bibtex-menu.svg',
        }))

        collectionmenu.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-scan-aux',
          label: l10n.localize('better-bibtex.BetterBibTeX.auxScanner'),
          oncommand: async event => { event.stopPropagation(); await Zotero.BetterBibTeX.scanAUX('collection') },
          class: 'menuitem-iconic',
          image: 'chrome://zotero-better-bibtex/skin/bibtex-menu.svg',
        }))

        collectionmenu.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-tag-duplicates',
          label: l10n.localize('better-bibtex.ZoteroPane.tag-duplicates'),
          oncommand: async event => {
            event.stopPropagation()
            await Zotero.BetterBibTeX.KeyManager.tagDuplicates(parseInt(event.target.getAttribute('libraryID')))
          },
        }))

        collectionmenu.appendChild(elements.create('menuitem', {
          id: 'bbt-collectionmenu-report-errors',
          label: l10n.localize('better-bibtex.BetterBibTeX.reportErrors'),
          oncommand: event => { event.stopPropagation(); bbt_zotero_pane_helper.errorReport('collection') },
        }))
      }

      try {
        const treeRow = this.collectionsView.selectedTreeRow
        const isLibrary = treeRow && treeRow.isLibrary(true)
        const isCollection = treeRow && treeRow.isCollection()

        doc.getElementById('bbt-collectionmenu-separator').hidden = !(isLibrary || isCollection)
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
        if (Preference.autoExport !== 'immediate') {
          if (isCollection) {
            auto_exports = AutoExport.db.find($and({ type: 'collection', id: treeRow.ref.id }))
          }
          else if (isLibrary) {
            auto_exports = AutoExport.db.find($and({ type: 'library', id: treeRow.ref.libraryID }))
          }
        }

        for (const node of [...doc.getElementsByClassName('zotero-collectionmenu-bbt-autoexport')]) {
          (node as any).hidden = auto_exports.length === 0
        }

        if (auto_exports.length !== 0) {
          const menupopup = doc.getElementById('zotero-collectionmenu-bbt-autoexport-menupopup')
          while (menupopup.children.length > 1) menupopup.removeChild(menupopup.firstChild)
          for (const [index, ae] of auto_exports.entries()) {
            const menuitem = (index === 0 ? menupopup.firstChild : menupopup.appendChild(menupopup.firstChild.cloneNode(true)));
            (menuitem as any).label = ae.path
          }
        }
      }
      catch (err) {
        log.error('ZoteroPane.buildCollectionContextMenu:', err)
      }
    }, this.patched)

    // Monkey patch because of https://groups.google.com/forum/#!topic/zotero-dev/zy2fSO1b0aQ
    $patch$(this.ZoteroPane, 'serializePersist', original => function() {
      // eslint-disable-next-line prefer-rest-params
      original.apply(this, arguments)
      if (Zotero.BetterBibTeX.uninstalled) clean_pane_persist()
    }, this.patched)

    if (typeof Zotero.ItemTreeView === 'undefined') this.ZoteroPane.itemsView.refreshAndMaintainSelection()
    const selected = this.ZoteroPane.getSelectedItems(true)
    if (selected.length) Zotero.Notifier.trigger('refresh', 'item', selected)
  }

  public pullExport(): void {
    if (!this.ZoteroPane.collectionsView || !this.ZoteroPane.collectionsView.selection || !this.ZoteroPane.collectionsView.selection.count) return

    const row = this.ZoteroPane.collectionsView.selectedTreeRow

    const root = `http://127.0.0.1:${Zotero.Prefs.get('httpServer.port')}/better-bibtex/export`
    const params = {
      url: {
        long: '',
        short: '',
      },
    }

    if (row.isCollection()) {
      let collection = this.ZoteroPane.getSelectedCollection()
      params.url.short = `${root}/collection?/${collection.libraryID || 0}/${collection.key}`

      let path = `/${encodeURIComponent(collection.name)}`
      while (collection.parent) {
        collection = Zotero.Collections.get(collection.parent)
        path = `/${encodeURIComponent(collection.name)}/${path}`
      }
      params.url.long = `${root}/collection?/${collection.libraryID || 0}${path}`
    }

    if (row.isLibrary(true)) {
      const libId = this.ZoteroPane.getSelectedLibraryID()
      const short = libId ? `/${libId}/library` : 'library'
      params.url.short = `${root}/library?${short}`
    }

    if (!params.url.short) return

    (this.window as any).openDialog('chrome://zotero-better-bibtex/content/ServerURL.xul', '', 'chrome,dialog,centerscreen,modal', params)
  }

  public startAutoExport(event: Event): void {
    event.stopPropagation()
    const path = (event.target as Element).getAttribute('label')
    const ae = AutoExport.db.findOne($and({ path }))

    if (ae) {
      AutoExport.run(ae.$loki)
    }
    else {
      log.error('cannot find ae for', { path })
    }
  }

  public padNum(n: number, width: number): string {
    return `${n || 0}`.padStart(width, '0')
  }

  public async patchDates(): Promise<void> {
    const items = this.ZoteroPane.getSelectedItems()
    const mapping: Record<string, string> = {}
    try {
      for (const assignment of Preference.patchDates.trim().split(/\s*,\s*/)) {
        const [, k, v ] = assignment.trim().match(/^([-_a-z09]+)\s*=\s*(dateadded|datemodified)$/i)
        mapping[k.toLowerCase()] = mapping[`tex.${k.toLowerCase()}`] = { dateadded: 'dateAdded', datemodified: 'dateModified' }[v.toLowerCase()]
      }
    }
    catch (err) {
      flash('could not parse field mapping', `could not parse field mapping ${Preference.patchDates}`)
      return
    }

    for (const item of items) {
      let save = false
      try {
        const extra = Extra.get(item.getField('extra'), 'zotero', { tex: true })
        for (const [k, v] of Object.entries(extra.extraFields.tex)) {
          if (mapping[k]) {
            const date = DateParser.parse(v.value)
            if (date.type === 'date' && date.day) {
              delete extra.extraFields.tex[k]
              const time = typeof date.seconds === 'number'
              const timestamp = new Date(
                date.year, date.month - 1, date.day,
                time ? date.hour : 0, time ? date.minute - (date.offset || 0): 0, time ? date.seconds : 0, 0
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
      items[0].setField('extra', `${extra}\n${picked.join('\n')}`.trim())
      await items[0].saveTx()
    }
  }

  public async toTeXstudio(): Promise<void> {
    await TeXstudio.push()
  }

  public errorReport(includeItems?: string): void {
    let scope = null

    switch (this.ZoteroPane && includeItems) {
      case 'collection':
      case 'library':
        scope = { type: 'collection', collection: this.ZoteroPane.getSelectedCollection() }
        if (!scope.collection) scope = { type: 'library', id: this.ZoteroPane.getSelectedLibraryID() }
        break

      case 'items':
        try {
          scope = { type: 'items', items: this.ZoteroPane.getSelectedItems() }
        }
        catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
          log.error('Could not get selected items:', err)
          scope = {}
        }

        if (!scope.items || !scope.items.length) scope = null
        break
    }

    const params = {wrappedJSObject: { scope }}

    const ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    ww.openWindow(null, 'chrome://zotero-better-bibtex/content/ErrorReport.xul', 'better-bibtex-error-report', 'chrome,centerscreen,modal', params)
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
