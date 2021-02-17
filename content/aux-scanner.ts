declare const Components: any
declare const Zotero: any

Components.utils.import('resource://gre/modules/osfile.jsm')
declare const OS: any

import { sleep } from './sleep'
import { KeyManager } from './key-manager'
import { Translators } from './translators'
import { Preference } from '../gen/preferences'

export const AUXScanner = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private decoder = new TextDecoder

  // eslint-disable-next-line @typescript-eslint/require-await
  public async pick(): Promise<string> {
    const fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker)
    fp.init(window, Zotero.getString('fileInterface.import'), Components.interfaces.nsIFilePicker.modeOpen)
    fp.appendFilter('AUX file', '*.aux')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new Zotero.Promise(resolve => {
      fp.open(userChoice => {
        switch (userChoice) {
          case Components.interfaces.nsIFilePicker.returnOK:
          case Components.interfaces.nsIFilePicker.returnReplace:
            resolve(fp.file.path)
            break

          default: // aka returnCancel
            resolve('')
            break
        }
      })
    })
  }

  public async scan(path: string, options: { tag?: string, libraryID?: number, collection?: { libraryID: number, key: string, replace?: boolean } } = {}) {
    if ([options.tag, options.libraryID, options.collection].filter(tgt => tgt).length > 1) throw new Error('You can only specify one of tag, libraryID, or collection')

    const citekeys: string[] = []
    const bibfiles: Record<string, string> = Preference.auxImport ? {} : null
    await this.parse(path, citekeys, bibfiles)

    if (!citekeys.length) return

    let collection, libraryID
    if (typeof options.libraryID === 'number') {
      collection = null
      libraryID = options.libraryID
    }
    else if (options.collection) {
      collection = Zotero.Collections.getByLibraryAndKey(options.collection.libraryID, options.collection.key)
      libraryID = options.collection.libraryID
    }
    else {
      const azp = Zotero.getActiveZoteroPane()
      collection = azp.getSelectedCollection()
      libraryID = collection ? collection.libraryID : azp.getSelectedLibraryID()
    }

    const found = (KeyManager.keys.find({ libraryID, citekey: { $in: citekeys } }) as { itemID: number, citekey: string }[])

    const itemIDs = found.map(key => key.itemID)

    const found_keys = found.map(key => key.citekey)
    let missing = citekeys.filter(key => !found_keys.includes(key))

    let newImports = []
    if (bibfiles) {
      if (missing.length) {
        const bibtex = Object.values(bibfiles).join('\n').trim()
        newImports = bibtex ? await Translators.importString(`@comment{zotero-better-bibtex:whitelist:${missing.join(',')}}\n${bibtex}`) : []
        itemIDs.push(...(newImports.map((item: { id: number}) => item.id)))
        missing = []
      }
    }

    const basename = OS.Path.basename(path).replace(/\.[^.]*$/, '')
    if (options.tag) {
      await this.saveToTag(itemIDs, options.tag, libraryID)
    }
    else {
      if (collection && (options.collection?.replace || !collection.hasChildItems())) {
        await this.saveToCollection(itemIDs, missing, { collection })
      }
      else if (collection) {
        await this.saveToCollection(itemIDs, missing, { collection, basename })
      }
      else {
        await this.saveToCollection(itemIDs, missing, { libraryID, basename })
      }
    }
  }

  private async read(path) {
    return this.decoder.decode(await OS.File.read(path))
  }

  private async parse(path: string, citekeys: string[], bibfiles: Record<string, string> ) {
    let m, re

    const contents = await this.read(path)
    const parent = OS.Path.dirname(path)

    if (bibfiles) {
      // bib files used
      re = /\\bibdata\{([^}]+)\}/g
      while (m = re.exec(contents)) {
        for (const bib of [m[1], `${m[1]}.bib`]) {
          if (!bibfiles[bib] && await OS.File.exists(bib)) {
            bibfiles[bib] = await this.read(bib)
            break
          }
        }
      }
    }

    re = /(?:\\citation|@cite)\{([^}]+)\}/g
    while (m = re.exec(contents)) {
      for (const key of m[1].split(',')) {
        if (!citekeys.includes(key)) citekeys.push(key)
      }
    }

    // include files
    re = /\\@input\{([^}]+)\}/g
    while (m = re.exec(contents)) {
      await this.parse(OS.Path.join(parent, m[1]), citekeys, bibfiles)
    }
  }

  private async saveToCollection(itemIDs: number[], missing_keys: string[], target: { collection?: any, libraryID?: number, basename?: string }) {
    if (typeof target.libraryID === 'number') {
      if (target.collection) throw new Error('cannot have both collection and library target')
      if (!target.basename) throw new Error('Saving to library needs a name')
    }
    else if (!target.collection) {
      throw new Error('need either library + name or collection')
    }

    const libraryID = typeof target.libraryID === 'number' ? target.libraryID : target.collection.libraryID

    if (target.basename) {
      const siblings = new Set(
        (target.collection
          ? Zotero.Collections.getByParent(target.collection.id)
          : Zotero.Collections.getByLibrary(target.libraryID)
        ).map((coll: { name: string }) => coll.name)
      )

      let timestamp = ''

      while (siblings.has(target.basename + timestamp)) {
        await sleep(1500) // eslint-disable-line no-magic-numbers
        timestamp = (new Date).toLocaleDateString('nl', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })
      }

      target.collection = new Zotero.Collection({
        name: target.basename + timestamp,
        libraryID,
        parentID: target.collection ? target.collection.id : undefined,
      })
      await target.collection.saveTx()

    }
    else {
      // saving into existing collection, remove items that are not cited
      const obsolete = target.collection.getChildItems(true).filter(itemID => !itemIDs.includes(itemID))
      if (obsolete.length) await Zotero.DB.executeTransaction(async () => { await target.collection.removeItems(obsolete) })

    }

    if (missing_keys.length) {
      const collator = new Intl.Collator('en')
      missing_keys.sort(collator.compare.bind(collator))
      let report = '<html><div><p><b>BibTeX AUX scan</b></p><p>Missing references:</p><ul>'
      for (const citekey of missing_keys) {
        report += `<li>${citekey.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#039;')}</li>`
      }
      report += '</ul></div></html>'

      const item = new Zotero.Item('note')
      item.libraryID = libraryID
      item.setNote(report)
      await item.saveTx()
      itemIDs.push(item.id)
    }

    if (itemIDs.length) await Zotero.DB.executeTransaction(async () => { await target.collection.addItems(itemIDs) })
  }

  private async saveToTag(cited: number[], tag: string, _libraryID: number) {
    const tagged: number[] = await Zotero.DB.columnQueryAsync('SELECT itemID FROM itemTags JOIN tags ON tags.tagID = itemTags.tagID WHERE LOWER(tags.name) = LOWER(?)', [tag])

    // cited but not tagged
    let itemIDs = cited.filter(item => !tagged.includes(item))
    if (itemIDs.length) {
      for (const item of await Zotero.Items.getAsync(itemIDs)) {
        item.addTag(tag, 1)
        await item.saveTx()
      }
    }

    // tagged but not cited
    itemIDs = tagged.filter(item => !cited.includes(item))
    if (itemIDs.length) {
      for (const item of await Zotero.Items.getAsync(itemIDs)) {
        item.removeTag(tag)
        await item.saveTx()
      }
    }
  }
}
