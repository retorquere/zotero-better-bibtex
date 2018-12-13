declare const Zotero: any
declare const window: any
declare const document: any
declare const Components: any

import * as log from './debug'
import { BetterBibTeX } from './better-bibtex'
import { TeXstudio } from './tex-studio'
import { patch as $patch$ } from './monkey-patch'
import { Preferences as Prefs } from './prefs'
import { AutoExport } from './auto-export'
import { flash } from './flash'
import * as CAYW from './cayw'

const pane = Zotero.getActiveZoteroPane()

$patch$(pane, 'buildCollectionContextMenu', original => async function() {
  await original.apply(this, arguments)

  try {
    const treeRow = this.collectionsView.selectedTreeRow
    const isLibrary = treeRow && treeRow.isLibrary(true)
    const isCollection = treeRow && treeRow.isCollection()

    document.getElementById('bbt-collectionmenu-separator').hidden = !(isLibrary || isCollection)
    document.getElementById('bbt-collectionmenu-pull-url').hidden = !(isLibrary || isCollection)
    document.getElementById('bbt-collectionmenu-report-errors').hidden = !(isLibrary || isCollection)

    const tagDuplicates = document.getElementById('bbt-collectionmenu-tag-duplicates')
    if (isLibrary) {
      tagDuplicates.hidden = false
      tagDuplicates.setAttribute('libraryID', treeRow.ref.libraryID.toString())
    } else {
      tagDuplicates.hidden = true
    }

    let query = null
    if (Prefs.get('autoExport') === 'immediate') {
      query = null

    } else if (isCollection) {
      query = { type: 'collection', id: treeRow.ref.id }

    } else if (isLibrary) {
      query = { type: 'library', id: treeRow.ref.libraryID }

    }
    const auto_exports = query ? AutoExport.db.find(query) : []

    for (const node of [...document.getElementsByClassName('bbt-autoexport')]) {
      node.hidden = auto_exports.length === 0
    }

    if (auto_exports.length !== 0) {
      const menupopup = document.getElementById('zotero-itemmenu-BetterBibTeX-autoexport-menu')
      while (menupopup.children.length > 1) menupopup.removeChild(menupopup.firstChild)
      for (const [index, ae] of auto_exports.entries()) {
        const menuitem = (index === 0 ? menupopup.firstChild : menupopup.appendChild(menupopup.firstChild.cloneNode(true)))
        menuitem.label = ae.path
      }
    }

  } catch (err) {
    log.error('ZoteroPane.buildCollectionContextMenu:', err)
  }
})

// Monkey patch because of https://groups.google.com/forum/#!topic/zotero-dev/zy2fSO1b0aQ
$patch$(pane, 'serializePersist', original => function() {
  original.apply(this, arguments)

  let persisted
  if (Zotero.BetterBibTeX.uninstalled && (persisted = Zotero.Prefs.get('pane.persist'))) {
    persisted = JSON.parse(persisted)
    delete persisted['zotero-items-column-citekey']
    Zotero.Prefs.set('pane.persist', JSON.stringify(persisted))
  }
})

export = new class ZoteroPane {
  public constructor() {
    window.addEventListener('load', () => {
      BetterBibTeX.load(document).then(() => {
        log.debug('Better BibTeX load finished successfully')
      })
      .catch(err => {
        log.error('Better BibTeX load failed', err)
      })
    }, false)
  }

  public pullExport() {
    if (!pane.collectionsView || !pane.collectionsView.selection || !pane.collectionsView.selection.count) return ''

    const translator = 'biblatex'
    const row = pane.collectionsView.selectedTreeRow

    const root = `http://localhost:${Zotero.Prefs.get('httpServer.port')}/better-bibtex/`

    if (row.isCollection()) {
      let collection = pane.getSelectedCollection()
      const short = `collection?/${collection.libraryID || 0}/${collection.key}.${translator}`

      const path = [encodeURIComponent(collection.name)]
      while (collection.parent) {
        collection = Zotero.Collections.get(collection.parent)
        path.unshift(encodeURIComponent(collection.name))
      }
      const long = `collection?/${collection.libraryID || 0}/${path.join('/')}.${translator}`

      return `${root}${short}\nor\n${root}${long}`
    }

    if (row.isLibrary(true)) {
      const libId = pane.getSelectedLibraryID()
      const short = libId ? `library?/${libId}/library.${translator}` : `library?library.${translator}`
      return `${root}${short}`
    }

    return ''
  }

  public startAutoExport(event) {
    event.stopPropagation()
    const path = event.target.getAttribute('label')
    const ae = AutoExport.db.findOne({ path })

    if (ae) {
      AutoExport.run(ae.$loki)
    } else {
      log.error('cannot find ae for', { path })
    }
  }

  public async addCitationLinks() {
    const items = Zotero.getActiveZoteroPane().getSelectedItems()
    if (items.length !== 1) {
      flash('Citation links only works for a single reference')
      return
    }

    const extra = items[0].getField('extra') || ''
    const citations = new Set(extra.split('\n').filter(line => line.startsWith('cites:')))
    const picked = (await CAYW.pick({ format: 'citationLinks' })).split('\n').filter(citation => !citations.has(citation))

    if (picked.length) {
      items[0].setField('extra', `${extra}\n${picked.join('\n')}`.trim())
      await items[0].saveTx()
    }
  }

  public async toTeXstudio() {
    await TeXstudio.push()
  }

  public errorReport(includeReferences) {
    let items = null

    switch (pane && includeReferences) {
      case 'collection': case 'library':
        items = { collection: pane.getSelectedCollection() }
        if (!items.collection) items = { library: pane.getSelectedLibraryID() }
        break

      case 'items':
        try {
          items = { items: pane.getSelectedItems() }
        } catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
          log.error('Could not get selected items:', err)
          items = {}
        }

        if (!items.items || !items.items.length) items = null
        break
    }

    const params = {wrappedJSObject: { items }}

    const ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    ww.openWindow(null, 'chrome://zotero-better-bibtex/content/ErrorReport.xul', 'better-bibtex-error-report', 'chrome,centerscreen,modal', params)
  }
}

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
