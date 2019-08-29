declare const Components: any
declare const Zotero: any

Components.utils.import('resource://gre/modules/osfile.jsm')
declare const OS: any

import * as log from './debug'
import { timeout } from './timeout'
import { KeyManager } from './key-manager'
import { Translators } from './translators'
import { Preferences as Prefs } from './prefs'

export let AUXScanner = new class { // tslint:disable-line:variable-name
  private citekeys: Set<string>
  private citationRE = /(?:\\citation|@cite){([^}]+)}/g
  private bibdataRE = /\\bibdata{([^}]+)}/g
  private includeRE = /\\@input{([^}]+)}/g
  private bibdata: string[] = []

  public async pick() {
    const fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker)
    fp.init(window, Zotero.getString('fileInterface.import'), Components.interfaces.nsIFilePicker.modeOpen)
    fp.appendFilter('AUX file', '*.aux')

    return new Zotero.Promise(resolve => {
      fp.open(userChoice => {
        switch (userChoice) {
          case Components.interfaces.nsIFilePicker.returnOK:
          case Components.interfaces.nsIFilePicker.returnReplace:
            resolve(fp.file)
            break

          default: // aka returnCancel
            resolve(false)
            break
        }
      })
    })
  }

  public async scan(file, tag = null) {
    this.citekeys = new Set
    await this.parse(file)

    if (!this.citekeys.size) return

    const azp = Zotero.getActiveZoteroPane()
    const collection = azp.getSelectedCollection()
    const libraryID = collection ? collection.libraryID : azp.getSelectedLibraryID()
    let imported = []

    if (Prefs.get('auxImport')) {
      const keys = new Set(KeyManager.keys.find({ libraryID }).map(key => key.citekey))
      const missing = Array.from(this.citekeys).filter(key => !keys.has(key))
      if (missing.length) {
        const bibfiles = {}

        const decoder = new TextDecoder
        for (const bibdata of this.bibdata) {
          for (const bib of [bibdata, bibdata + '.bib']) {
            if (await OS.File.exists(bib)) {
              log.debug('scanning', bib, 'for missing items')
              bibfiles[bib] = bibfiles[bib] || decoder.decode(await OS.File.read(bib))
              break
            }
          }
        }

        const bibtex = Object.values(bibfiles).join('\n').trim()

        imported = bibtex ? await Translators.importString(`@comment{zotero-better-bibtex:whitelist:${missing.join(',')}}\n${bibtex}`) : []
      }
    }

    if (tag) {
      await this.saveToTag(tag, libraryID, imported)
    } else {
      await this.saveToCollection(file.leafName, libraryID, collection, imported)
    }
  }

  private async parse(file) {
    log.debug('AUXScanner:', file.path)

    let m
    const contents = Zotero.File.getContents(file)

    // bib files used
    while ((m = this.bibdataRE.exec(contents))) {
      this.bibdata.push(OS.Path.join(file.parent.path, m[1]))
    }

    while ((m = this.citationRE.exec(contents))) {
      for (const key of m[1].split(',')) {
        this.citekeys.add(key)
      }
    }

    // include files
    while ((m = this.includeRE.exec(contents))) {
      const inc = file.parent.clone()
      inc.append(m[1])
      await this.parse(inc)
    }
  }

  private async saveToCollection(source, libraryID, collection, imported) {
    log.debug('AUXScanner.saveToCollection', source, { parent: collection ? collection.id : null })

    // if no collection is selected, or the selected collection contains references, create a new subcollection
    if (!collection || collection.getChildItems(true).length) {
      const siblings = new Set((collection ? Zotero.Collections.getByParent(collection.id) : Zotero.Collections.getByLibrary(libraryID)).map(coll => coll.name))

      let name = source.lastIndexOf('.') > 0 ? source.substr(0, source.lastIndexOf('.')) : source
      let timestamp = ''

      while (siblings.has(name + timestamp)) {
        await timeout(1500) // tslint:disable-line:no-magic-numbers
        timestamp = (new Date).toLocaleDateString('nl', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })
      }
      name += timestamp
      collection = new Zotero.Collection({
        name,
        libraryID,
        parentID: collection ? collection.id : undefined,
      })

      await collection.saveTx()
      log.debug('AUXScanner.saveToCollection', source, { collection: collection.id })
    }

    const missing = []
    const found = imported.map(item => item.id)
    for (const citekey of Array.from(this.citekeys)) {
      const item = KeyManager.keys.findOne({libraryID, citekey})
      if (item) {
        found.push(item.itemID)
      } else {
        missing.push(citekey)
      }
    }

    if (missing.length) {
      missing.sort((new Intl.Collator('en')).compare)
      let report = '<html><div><p><b>BibTeX AUX scan</b></p><p>Missing references:</p><ul>'
      for (const citekey of missing) {
        report += `<li>${citekey.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#039;')}</li>`
      }
      report += '</ul></div></html>'

      const item = new Zotero.Item('note')
      item.libraryID = libraryID
      item.setNote(report)
      await item.saveTx()
      found.push(item.id)
    }

    log.debug('AUX scan: adding', found)

    if (found.length) Zotero.DB.executeTransaction(function *() { yield collection.addItems(found) })
  }

  private async saveToTag(tag, libraryID, imported) {
    const cited = new Set(KeyManager.keys.find({ libraryID, citekey: { $in: Array.from(this.citekeys) } }).map(item => item.itemID))
    const tagged = new Set(await Zotero.DB.columnQueryAsync('SELECT itemID FROM itemTags JOIN tags ON tags.tagID = itemTags.tagID WHERE LOWER(tags.name) = LOWER(?)', [tag]))

    // cited but not tagged
    let itemIDs = [...cited].filter(item => !tagged.has(item))
    if (itemIDs.length) imported = imported.concat(await Zotero.Items.getAsync(itemIDs))
    if (imported.length) {
      for (const item of imported) {
        item.addTag(tag, 1)
        await item.saveTx()
      }
    }

    // tagged but not cited
    itemIDs = [...tagged].filter(item => !cited.has(item))
    if (itemIDs.length) {
      for (const item of await Zotero.Items.getAsync(itemIDs)) {
        item.removeTag(tag)
        await item.saveTx()
      }
    }
  }
}
