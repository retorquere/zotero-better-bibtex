import { Path, File } from './file'

import { Translators } from './translators'
import { Preference } from './prefs'
import { FilePickerHelper } from 'zotero-plugin-toolkit'
import { findBinary } from './path-search'
import { log } from './logger'
import { alert } from './prompt'

import { version } from '../gen/version.json'

type Source = 'MarkDown' | 'BibTeX AUX'

type Collection = {
  libraryID: number
  key: string
  replace?: boolean
}
export const AUXScanner = new class {
  private pandoc: string

  private filters: Record<'pandoc' | 'aux', [string, string][]> = {
    pandoc: [
      [ 'AUX file', '*.aux' ],
      [ 'Markdown', '*.md; *.txt; *.markdown; *.qmd; *.Rmd' ],
    ],
    aux: [[ 'AUX file', '*.aux' ]],
  }
  public async pick(): Promise<string> {
    if (typeof this.pandoc !== 'string') this.pandoc = await findBinary('pandoc')
    const filters = this.pandoc ? this.filters.pandoc : this.filters.aux
    return (await new FilePickerHelper(Zotero.getString('fileInterface.import'), 'open', filters).open()) || ''
  }

  public async scan(path: string, options: { tag?: string; libraryID?: number; collection?: Collection } = {}) {
    if ([ options.tag, options.libraryID, options.collection ].filter(tgt => tgt).length > 1) {
      throw new Error('You can only specify one of tag, libraryID, or collection')
    }

    const citekeys: string[] = []
    const bibfiles: Record<string, string> = Preference.auxImport ? {} : null
    const source: Source = await this.parse(path, citekeys, bibfiles)

    if (!source || !citekeys.length) return

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

    const found = Zotero.BetterBibTeX.KeyManager.find({ where: { libraryID, citationKey: { in: citekeys }}})

    const itemIDs = found.map(key => key.itemID)

    const found_keys = found.map(key => key.citationKey)
    let missing = citekeys.filter(key => !found_keys.includes(key))

    let newImports = []
    if (bibfiles) {
      if (missing.length) {
        const bibtex = Object.values(bibfiles).join('\n').trim()
        newImports = bibtex ? await Translators.importString(`@comment{zotero-better-bibtex:whitelist:${ missing.join(',') }}\n${ bibtex }`) : []
        itemIDs.push(...(newImports.map((item: { id: number }) => item.id)))
        missing = []
      }
    }

    const basename = Path.basename(path).replace(/\.[^.]*$/, '')
    if (options.tag) {
      await this.saveToTag(itemIDs, options.tag, libraryID)
    }
    else {
      if (collection && (options.collection?.replace || !collection.hasChildItems())) {
        await this.saveToCollection(source, itemIDs, missing, { collection })
      }
      else if (collection) {
        await this.saveToCollection(source, itemIDs, missing, { collection, basename })
      }
      else {
        await this.saveToCollection(source, itemIDs, missing, { libraryID, basename })
      }
    }
  }

  private async read(path) {
    const decoder: TextDecoder = new TextDecoder
    return decoder.decode(await IOUtils.read(path) as BufferSource)
  }

  private async parse(path: string, citekeys: string[], bibfiles: Record<string, string>): Promise<Source> {
    try {
      if (path.match(/[.]aux$/i)) {
        await this.parseAUX(path, citekeys, bibfiles)
        return 'BibTeX AUX'
      }
      else if (this.pandoc && path.match(/[.]([Rq]?md|txt|markdown)$/)) {
        await this.parseMD(path, citekeys)
        return 'MarkDown'
      }
      throw new Error(`Unsupported file type for ${ path }`)
    }
    catch (err) {
      alert({ text: `AUX/Markdown scan failed: ${ err.message }` })
    }
    return null
  }

  private async luaFilter(): Promise<string> {
    const filter: string = PathUtils.join(Zotero.BetterBibTeX.dir, `list-citekeys-${version}.lua`)

    for (const old of await IOUtils.getChildren(Zotero.BetterBibTeX.dir)) {
      if (old !== filter && PathUtils.filename(old).match(/^list-citekeys-.*[.]lua$/) && await File.isFile(old)) await IOUtils.remove(old)
    }

    if (!(await File.exists(filter))) {
      const url = 'chrome://zotero-better-bibtex/content/resource/list-citekeys.lua'
      const file = Zotero.File.pathToFile(filter)
      const contents = Zotero.File.getContentsFromURL(url)
      Zotero.File.putContents(file, contents)
    }
    return filter
  }

  private async parseMD(path: string, citekeys: string[]) {
    const filter = await this.luaFilter()
    const output: string = PathUtils.join(Zotero.getTempDirectory().path, `citekeys_${ Zotero.Utilities.randomString() }.txt`)
    try {
      await Zotero.Utilities.Internal.exec(this.pandoc, [ '--lua-filter', filter, '-t', 'markdown', '-o', output, path ])
      const md = await Zotero.File.getContentsAsync(output)
      if (typeof md === 'string') {
        for (const citekey of md.split(/\s+/)) {
          if (citekey) citekeys.push(citekey)
        }
      }
    }
    catch (e) {
      alert({ text: `pandoc parsing error ${ e }` })
      log.error('pandoc parsing error:', e)
      return
    }
    finally {
      await Zotero.File.removeIfExists(output)
    }
  }

  private async parseAUX(path: string, citekeys: string[], bibfiles: Record<string, string>) {
    let m, re

    const contents = await this.read(path)
    const parent = PathUtils.parent(path)

    if (bibfiles) {
      // bib files used
      re = /\\bibdata\{([^}]+)\}/g
      while (m = re.exec(contents)) {
        for (const bib of [ m[1], `${ m[1] }.bib` ]) {
          if (!bibfiles[bib] && await File.exists(bib)) {
            bibfiles[bib] = await this.read(bib)
            break
          }
        }
      }
    }

    re = /(?:\\citation|@cite|\\abx@aux@cite(?:[{]0[}])?)\{([^}]+)\}/g
    while (m = re.exec(contents)) {
      for (const key of m[1].split(',')) {
        if (!citekeys.includes(key)) citekeys.push(key)
      }
    }

    // include files
    re = /\\@input\{([^}]+)\}/g
    while (m = re.exec(contents)) {
      await this.parseAUX(PathUtils.join(parent, m[1]), citekeys, bibfiles)
    }
  }

  private async saveToCollection(source: Source, itemIDs: number[], missing_keys: string[], target: { collection?: any; libraryID?: number; basename?: string }) {
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
        await Zotero.Promise.delay(1500)
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
      let report = `<html><div><p><b>${ source } scan</b></p><p>Missing entries:</p><ul>`
      for (const citekey of missing_keys) {
        report += `<li>${ citekey.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#039;') }</li>`
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
