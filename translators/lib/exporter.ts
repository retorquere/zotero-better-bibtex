declare const Translator: ITranslator

declare const Zotero: any

import { JabRef } from '../bibtex/jabref' // not so nice... BibTeX-specific code
import * as itemfields from '../../gen/itemfields'
import * as bibtexParser from '@retorquere/bibtex-parser'
import { Postfix } from '../bibtex/postfix.ts'
import * as Extra from '../../content/extra'
import * as cslMapping from '../../gen/csl-mapping.json'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Exporter = new class { // tslint:disable-line:variable-name
  public postfix: Postfix
  public jabref: JabRef
  public strings: {[key: string]: string}

  constructor() {
    this.jabref = new JabRef()
    this.strings = {}
  }

  public prepare_strings() {
    if (!Translator.BetterTeX || !Translator.preferences.strings) return

    if (Translator.preferences.exportBibTeXStrings === 'match') {
      this.strings = (bibtexParser.parse(Translator.preferences.strings, { markup: (Translator.csquotes ? { enquote: Translator.csquotes } : {}) }) as bibtexParser.Bibliography).strings
    }

    /*
    if (Translator.preferences.exportBibTeXStrings !== 'off') {
      Zotero.write(`${Translator.preferences.strings}\n\n`)
    }
    */
  }

  public unique_chars(str) {
    let uniq = ''
    for (const c of str) {
      if (uniq.indexOf(c) < 0) uniq += c
    }
    return uniq
  }

  public nextItem(): ISerializedItem {
    this.postfix = this.postfix || (new Postfix(Translator.preferences.qualityReport))

    let item
    while (item = Zotero.nextItem()) {
      if (['note', 'attachment'].includes(item.itemType)) continue

      if (!item.citekey) {
        throw new Error(`No citation key in ${JSON.stringify(item)}`)
      }

      this.jabref.citekeys.set(item.itemID, item.citekey)

      // this is not automatically lazy-evaluated?!?!
      const cached: Types.DB.Cache.ExportedItem = Translator.caching ? Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options, Translator.preferences) : null
      Translator.cache[cached ? 'hits' : 'misses'] += 1

      if (cached) {
        if (Translator.preferences.sorted && (Translator.BetterBibTeX || Translator.BetterBibLaTeX)) {
          Translator.references.push({ citekey: item.citekey, reference: cached.reference })
        } else {
          Zotero.write(cached.reference)
        }

        this.postfix.add(cached)
        continue
      }

      itemfields.simplifyForExport(item)
      Object.assign(item, Extra.get(item.extra))
      for (const [name, value] of Object.entries(item.extraFields.csl)) {
        if (cslMapping.field[name]) {
          for (const field of cslMapping.field[name]) {
            item[field] = value
          }
          delete item.extraFields.csl[name]
        }
      }

      item.raw = Translator.preferences.rawLaTag === '*'
      item.tags = item.tags.filter(tag => {
        if (tag.tag === Translator.preferences.rawLaTag) {
          item.raw = true
          return false
        }
        return true
      })

      return item
    }

    return null
  }

  // TODO: move to bibtex-exporters
  public complete() {
    if (Translator.preferences.sorted && (Translator.BetterBibTeX || Translator.BetterBibLaTeX)) {
      Translator.references.sort((a, b) => Translator.stringCompare(a.citekey, b.citekey))
      Zotero.write(Translator.references.map(ref => ref.reference).join(''))
    }

    this.jabref.exportGroups()

    Zotero.write(this.postfix.toString())
  }
}
