import { Path, File } from './file'

import { Translators } from './translators'
import { Preference } from './prefs'
import { FilePickerHelper } from 'zotero-plugin-toolkit'
import { findBinary } from './path-search'
import { log } from './logger'
import { alert } from './prompt'

import { version } from '../gen/version.json'

type Parsed = {
  source: 'MarkDown' | 'BibTeX AUX'
  citationKeys: string[]
  bib?: string
}

type Target = {
  collection?: any
  libraryID?: number
  basename?: string
}

type Collection = {
  libraryID: number
  key: string
  replace?: boolean
}

const ext = {
  markdown: '*.md; *.txt; *.markdown; *.qmd; *.Rmd',
  aux: '*.aux',
}

export const AUXScanner = new class {
  private pandoc: string
  private filters: Record<'pandoc' | 'aux', [string, string][]> = {
    pandoc: [
      [ `AUX file (${ext.aux})`, ext.aux ],
      [ `Markdown (${ext.markdown})`, ext.markdown ],
    ],
    aux: [
      [ `AUX file (${ext.aux})`, ext.aux ],
    ],
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

    const parsed = await this.parse(path)

    if (!parsed || !parsed.citationKeys.length) return

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

    const itemIDs: number[] = []
    const citationKeys: string[] = []
    for (const found of Zotero.BetterBibTeX.KeyManager.find({ where: { libraryID, citationKey: { in: parsed.citationKeys }}})) {
      itemIDs.push(found.itemID)
      citationKeys.push(found.citationKey)
    }
    let missing = parsed.citationKeys.filter(key => !citationKeys.includes(key))

    if (missing && parsed.bib) {
      if (missing.length) {
        const items = await Translators.importString(`@comment{zotero-better-bibtex:whitelist:${missing.join(',')}}\n${parsed.bib}`)
        for (const item of items) {
          itemIDs.push(item.id)
        }
        missing = []
      }
    }

    const basename = Path.basename(path).replace(/\.[^.]*$/, '')
    if (options.tag) {
      await this.saveToTag(itemIDs, options.tag, libraryID)
    }
    else {
      if (collection && (options.collection?.replace || !collection.hasChildItems())) {
        await this.saveToCollection(parsed.source, itemIDs, missing, { collection })
      }
      else if (collection) {
        await this.saveToCollection(parsed.source, itemIDs, missing, { collection, basename })
      }
      else {
        await this.saveToCollection(parsed.source, itemIDs, missing, { libraryID, basename })
      }
    }
  }

  private async read(path) {
    const decoder: TextDecoder = new TextDecoder
    return decoder.decode(await IOUtils.read(path) as BufferSource)
  }

  private async parse(path: string): Promise<Parsed> {
    try {
      if (path.match(/[.]aux$/i)) {
        return await this.parseAUX(path)
      }
      else if (this.pandoc && path.match(/[.]([Rq]?md|txt|markdown)$/)) {
        return await this.parseMD(path)
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

  private async parseMD(md: string): Promise<Parsed> {
    const citationKeys: Set<string> = new Set
    const filter = await this.luaFilter()
    const output: string = PathUtils.join(Zotero.getTempDirectory().path, `citekeys_${ Zotero.Utilities.randomString() }.txt`)
    try {
      await Zotero.Utilities.Internal.exec(this.pandoc, [ '--lua-filter', filter, '-t', 'markdown', '-o', output, md ])
      const citekeys = await Zotero.File.getContentsAsync(output)
      if (typeof citekeys === 'string') {
        for (const citekey of citekeys.split(/\s+/)) {
          if (citekey) citationKeys.add(citekey)
        }
      }
    }
    catch (e) {
      alert({ text: `pandoc parsing error ${ e }` })
      log.error('pandoc parsing error:', e)
    }
    finally {
      await Zotero.File.removeIfExists(output)
    }

    return { source: 'MarkDown', citationKeys: [ ...citationKeys ] }
  }

  public async parseAUX(aux: string): Promise<Parsed> {
    const parsed: Record<string, boolean> = { [aux]: false }
    const citationKeys: Set<string> = new Set
    const bibs: Record<string, string> = {}

    while (aux = Object.keys(parsed).find(path => !parsed[path])) {
      parsed[aux] = true
      if (!await File.exists(aux)) {
        log.info('aux scanner:', aux, 'does not exist')
        continue
      }

      const contents = await this.read(aux)
      const parent = PathUtils.parent(aux)

      for (let [ , command, arg, arg2 ] of contents.matchAll(/(\\citation|\\abx@aux@cite|@cite|\\bibdata|\\@input)\s*\{(.*?)\}(?:\{(.*?)\})?/g)) {
        if (command === '\\abx@aux@cite' && arg.match(/^\d+$/) && arg2) arg = arg2
        arg = arg.trim()
        if (!arg) continue

        switch (command) {
          case '\\@input':
            parsed[PathUtils.join(parent, arg)] ||= false
            break

          case '\\bibdata':
            if (Preference.auxImport) {
              for (const bib of [ `${arg}.bib`, arg ]) {
                if (typeof bibs[bib] === 'string') continue

                if (await File.exists(bib)) {
                  bibs[bib] = await this.read(bib)
                  break
                }
                else {
                  log.info('aux scanner:', bib, 'does not exist')
                  bibs[bib] = ''
                }
              }
            }
            break

          default:
            for (const key of arg.split(/\s*,\s*/)) {
              if (key) citationKeys.add(key)
            }
            break
        }
      }
    }

    return { source: 'BibTeX AUX', citationKeys: [...citationKeys], bib: Object.values(bibs).join('\n\n').trim() }
  }

  private async saveToCollection(source: string, itemIDs: number[], missing_keys: string[], target: Target) {
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
