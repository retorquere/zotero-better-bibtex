declare const Components: any
declare const Zotero: any

import debug = require('./debug.ts')
import KeyManager = require('./keymanager.ts')

export = class AUXScanner {
  private citekeys: Set<string>
  private citationRE = /(?:\\citation|@cite){([^}]+)}/g
  private includeRE = /\\@input{([^}]+)}/g

  public async scan() {
    const fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker)
    fp.init(window, Zotero.getString('fileInterface.import'), Components.interfaces.nsIFilePicker.modeOpen)
    fp.appendFilter('AUX file', '*.aux')
    const rv = fp.show()
    if (![Components.interfaces.nsIFilePicker.returnOK, Components.interfaces.nsIFilePicker.returnReplace].includes(rv)) return false

    this.citekeys = new Set
    this.parse(fp.file)
    await this.save(fp.file.leafName)
  }

  private parse(file) {
    debug('AUXScanner:', file.path)

    let m
    const contents = Zotero.File.getContents(file)

    while ((m = this.citationRE.exec(contents))) {
      for (const key of m[1].split(',')) {
        this.citekeys.add(key)
      }
    }

    // include files
    while ((m = this.includeRE.exec(contents))) {
      const inc = file.parent.clone()
      inc.append(m[1])
      this.parse(inc)
    }
  }

  private async save(source) {
    if (!this.citekeys.size) return

    let collection = Zotero.getActiveZoteroPane().getSelectedCollection()
    // hasChildItems counts items in trash
    // MFG getChildItems returns false rather than an empty list
    if (!collection || ((collection.getChildItems(true) || []).length !== 0)) {
      const name = `${source.substr(0, source.lastIndexOf('.'))} ${(new Date()).toLocaleString()}`
      collection = Zotero.Collections.add(name , collection ? collection.id : null)
    }

    const missing = []
    for (const citekey of Array.from(this.citekeys)) {
      const found = KeyManager.keys.find({libraryID: collection.libraryID, citekey})
      if (citekey) {
        collection.addItem(found.itemID)
      } else {
        missing.push(citekey)
      }
    }

    if (missing.length) {
      let report = '<html><div><p><b>BibTeX AUX scan</b></p><p>Missing references:</p><ul>'
      for (const citekey of missing) {
        report += `<li>${citekey.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#039;')}</li>`
      }
      report += '</ul></div></html>'

      const item = new Zotero.Item('note')
      item.libraryID = collection.libraryID
      item.setNote(report)
      await item.saveTx()
      collection.addItem(item.id)
    }
  }
}
