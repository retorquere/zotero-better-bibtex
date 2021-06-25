declare const Zotero: any

import { Translator } from '../lib/translator'
import { Reference } from '../../gen/typings/serialized-item'
import { Cache } from '../../typings/cache'

import { JabRef } from '../bibtex/jabref' // not so nice... BibTeX-specific code
import * as itemfields from '../../gen/items/items'
import * as bibtexParser from '@retorquere/bibtex-parser'
import { Postfix } from './postfix'
import * as Extra from '../../content/extra'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Exporter = new class {
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

    if (Translator.BetterTeX && Translator.preferences.exportBibTeXStrings.startsWith('match')) {
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

  public get items(): Generator<Reference, void, unknown> {
    return this.itemsGenerator()
  }

  private *itemsGenerator(): Generator<Reference, void, unknown> {
    if (!this.postfix && Translator.BetterTeX) this.postfix = new Postfix(Translator.preferences.qualityReport)

    for (const item of Translator.references) {
      if (!item.citationKey) {
        throw new Error(`No citation key in ${JSON.stringify(item)}`)
      }
      this.citekeys[item.citationKey] = (this.citekeys[item.citationKey] || 0) + 1

      this.jabref.citekeys.set(item.itemID, item.citationKey)

      // this is not automatically lazy-evaluated?!?!
      const cached: Cache.ExportedItem = item.$cacheable && Translator.BetterTeX ? Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options, Translator.preferences) : null
      Translator.cache[cached ? 'hits' : 'misses'] += 1

      if (cached) {
        Zotero.write(cached.reference)
        this.postfix?.add(cached.metadata)
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

      item.raw = Translator.BetterTeX && Translator.preferences.rawLaTag === '*'
      item.tags = item.tags.filter(tag => {
        if (Translator.BetterTeX && tag.tag === Translator.preferences.rawLaTag) {
          item.raw = true
          return false
        }
        return true
      })

      yield item
    }
  }

  public complete() {
    this.jabref.exportGroups()
    if (this.postfix) Zotero.write(this.postfix.toString())
    if (Translator.BetterTeX && Translator.preferences.qualityReport) {
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
