declare const Zotero: any

import { Translator } from '../lib/translator'

import { JabRef } from '../bibtex/jabref' // not so nice... BibTeX-specific code
import * as itemfields from '../../gen/items/items'
import * as bibtexParser from '@retorquere/bibtex-parser'
import { Postfix } from '../bibtex/postfix.ts'
import * as Extra from '../../content/extra'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Exporter = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public postfix: Postfix
  public jabref: JabRef
  public strings: {[key: string]: string} = {}
  public strings_reverse: {[key: string]: string} = {}
  public citekeys: Record<string, number> = {}

  constructor() {
    this.jabref = new JabRef()
  }

  public prepare_strings() {
    if (!Translator.BetterTeX || !Translator.preferences.strings) return

    if (Translator.preferences.exportBibTeXStrings.startsWith('match')) {
      this.strings = (bibtexParser.parse(Translator.preferences.strings, { markup: (Translator.csquotes ? { enquote: Translator.csquotes } : {}) }) as bibtexParser.Bibliography).strings
      for (const [k, v] of Object.entries(this.strings)) {
        this.strings_reverse[v.toUpperCase()] = k.toUpperCase()
      }
    }
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
    while (item = Translator.nextItem()) {
      if (['note', 'attachment'].includes(item.itemType)) continue

      if (!item.citekey) {
        throw new Error(`No citation key in ${JSON.stringify(item)}`)
      }
      this.citekeys[item.citekey] = (this.citekeys[item.citekey] || 0) + 1

      this.jabref.citekeys.set(item.itemID, item.citekey)

      // this is not automatically lazy-evaluated?!?!
      const cached: Types.DB.Cache.ExportedItem = item.cachable ? Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options, Translator.preferences) : null
      Translator.cache[cached ? 'hits' : 'misses'] += 1

      if (cached) {
        Zotero.write(cached.reference)
        this.postfix.add(cached)
        continue
      }

      itemfields.simplifyForExport(item)
      Object.assign(item, Extra.get(item.extra, 'zotero'))
      // strip extra.tex fields that are not for me
      const prefix = Translator.BetterBibLaTeX ? 'biblatex.' : 'bibtex.'
      for (const [name, field] of Object.entries(item.extraFields.tex).sort((a, b) => b[0].localeCompare(a[0]))) { // sorts the fields from tex. to biblatex. to bibtex.
        for (const type of [ prefix, 'tex.' ]) {
          if (name.startsWith(type)) {
            item.extraFields.tex[name.substr(type.length)] = field
            break
          }
        }

        delete item.extraFields.tex[name]
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

  public complete() {
    this.jabref.exportGroups()
    Zotero.write(this.postfix.toString())
    if (Translator.preferences.qualityReport) {
      let sep = '\n% == Citekey duplicates in this file:\n'
      for (const [citekey, n] of Object.entries(this.citekeys).sort((a, b) => a[0].localeCompare(b[0]))) {
        if (n > 1) {
          Zotero.write(`${sep}% ${citekey} duplicates: ${n}\n`)
          sep = '% '
        }
      }
    }
  }
}
