declare const Zotero: any

import { Translation } from '../lib/translator'
import { RegularItem } from '../../gen/typings/serialized-item'
import { Cache } from '../../typings/cache'

import { JabRef } from '../bibtex/jabref' // not so nice... BibTeX-specific code
import { simplifyForExport } from '../../gen/items/simplify'
import * as bibtexParser from '@retorquere/bibtex-parser'
import { Postfix } from './postfix'
import * as Extra from '../../content/extra'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Exporter = new class {
  public postfix: Postfix
  public jabref = new JabRef
  public strings: {[key: string]: string} = {}
  public strings_reverse: {[key: string]: string} = {}
  public citekeys: Record<string, number> = {}

  public prepare_strings() {
    if (!Translation.BetterTeX || !Translation.preferences.strings) return

    if (Translation.BetterTeX && Translation.preferences.exportBibTeXStrings.startsWith('match')) {
      this.strings = bibtexParser.parse(Translation.preferences.strings, { markup: (Translation.csquotes ? { enquote: Translation.csquotes } : {}) }).strings
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

  public get items(): Generator<RegularItem, void, unknown> {
    return this.itemsGenerator()
  }

  private *itemsGenerator(): Generator<RegularItem, void, unknown> {
    if (!this.postfix && Translation.BetterTeX) this.postfix = new Postfix(Translation.preferences.qualityReport)

    for (const item of Translation.regularitems) {
      Object.assign(item, Extra.get(item.extra, 'zotero'))
      if (typeof item.itemID !== 'number') { // https://github.com/diegodlh/zotero-cita/issues/145
        item.citationKey = item.extraFields.citationKey
        item.$cacheable = false
      }
      if (!item.citationKey) throw new Error(`No citation key in ${JSON.stringify(item)}`)

      this.citekeys[item.citationKey] = (this.citekeys[item.citationKey] || 0) + 1

      this.jabref.citekeys.set(item.itemID, item.citationKey)

      let cached: Cache.ExportedItem = null
      if (item.$cacheable && Translation.BetterTeX) {
        Translation.cache.requests++
        if (cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translation.options, Translation.preferences)) {
          Translation.cache.hits += 100
          Zotero.write(cached.entry)
          this.postfix?.add(cached.metadata)
          continue
        }
      }

      simplifyForExport(item)

      // strip extra.tex fields that are not for me
      const prefix = Translation.BetterBibLaTeX ? 'biblatex.' : 'bibtex.'
      for (const [name, field] of Object.entries(item.extraFields.tex).sort((a, b) => b[0].localeCompare(a[0]))) { // sorts the fields from tex. to biblatex. to bibtex.
        for (const type of [ prefix, 'tex.' ]) {
          if (name.startsWith(type)) {
            item.extraFields.tex[name.substr(type.length)] = field
            break
          }
        }

        delete item.extraFields.tex[name]
      }

      item.raw = Translation.BetterTeX && Translation.preferences.rawLaTag === '*'
      item.tags = item.tags.filter(tag => {
        if (Translation.BetterTeX && tag.tag === Translation.preferences.rawLaTag) {
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
    if (Translation.BetterTeX && Translation.preferences.qualityReport) {
      let sep = '\n% == Citekey duplicates in this file:\n'
      for (const [citekey, n] of Object.entries(this.citekeys).sort((a, b) => a[0].localeCompare(b[0]))) {
        if (n > 1) {
          Zotero.write(`${sep}% ${citekey} duplicates: ${n}\n`)
          sep = '% '
        }
      }
    }
    if (Translation.BetterTeX && Translation.options.cacheUse) {
      if (Translation.cache.requests) {
        Zotero.write(`\n% cache use: ${Math.round(Translation.cache.hits/Translation.cache.requests)}%`)
      }
      else {
        Zotero.write('\n% cache use: no')
      }
    }
  }
}
