declare const Zotero: any

import { Translation } from '../lib/translator'

import { RegularItem } from '../../gen/typings/serialized-item'
import { Cache } from '../../typings/cache'

import { JabRef } from '../bibtex/jabref'
import { simplifyForExport } from '../../gen/items/simplify'
import * as bibtexParser from '@retorquere/bibtex-parser'
import { Postfix } from './postfix'
import * as Extra from '../../content/extra'
import { HTMLConverter, ConverterOptions, ParseResult } from './unicode_translator'

export class Exporter {
  public postfix: Postfix
  public jabref = new JabRef
  public strings: {[key: string]: string} = {}
  public strings_reverse: {[key: string]: string} = {}
  public citekeys: Record<string, number> = {}

  private translation: Translation
  private htmlconverter: HTMLConverter

  constructor(translation: Translation) {
    this.translation = translation
    this.htmlconverter = new HTMLConverter(translation.preferences.texmap)
  }

  public prepare_strings(): void {
    if (!this.translation.BetterTeX || !this.translation.preferences.strings) return

    if (this.translation.BetterTeX && this.translation.preferences.exportBibTeXStrings.startsWith('match')) {
      this.strings = bibtexParser.parse(this.translation.preferences.strings, { markup: (this.translation.csquotes ? { enquote: this.translation.csquotes } : {}) }).strings
      for (const [k, v] of Object.entries(this.strings)) {
        this.strings_reverse[v.toUpperCase()] = k.toUpperCase()
      }
    }
  }

  public get items(): Generator<RegularItem, void, unknown> {
    return this.itemsGenerator()
  }

  private *itemsGenerator(): Generator<RegularItem, void, unknown> {
    if (!this.postfix && this.translation.BetterTeX) this.postfix = new Postfix(this.translation.preferences.qualityReport)

    for (const item of this.translation.regularitems) {
      Object.assign(item, Extra.get(item.extra, 'zotero'))
      if (typeof item.itemID !== 'number') { // https://github.com/diegodlh/zotero-cita/issues/145
        item.citationKey = item.extraFields.citationKey
        item.$cacheable = false
      }
      if (!item.citationKey) throw new Error(`No citation key in ${JSON.stringify(item)}`)

      this.citekeys[item.citationKey] = (this.citekeys[item.citationKey] || 0) + 1

      this.jabref.citekeys.set(item.itemID, item.citationKey)

      let cached: Cache.ExportedItem = null
      if (item.$cacheable && this.translation.BetterTeX) {
        this.translation.cache.requests++
        if (cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, this.translation.options, this.translation.preferences)) {
          this.translation.cache.hits += 100
          Zotero.write(cached.entry)
          this.postfix?.add(cached.metadata)
          continue
        }
      }

      simplifyForExport(item)

      // strip extra.tex fields that are not for me
      const prefix = this.translation.BetterBibLaTeX ? 'biblatex.' : 'bibtex.'
      for (const [name, field] of Object.entries(item.extraFields.tex).sort((a, b) => b[0].localeCompare(a[0]))) { // sorts the fields from tex. to biblatex. to bibtex.
        for (const type of [ prefix, 'tex.' ]) {
          if (name.startsWith(type)) {
            item.extraFields.tex[name.substr(type.length)] = field
            break
          }
        }

        delete item.extraFields.tex[name]
      }

      item.raw = this.translation.BetterTeX && this.translation.preferences.rawLaTag === '*'
      item.tags = item.tags.filter(tag => {
        if (this.translation.BetterTeX && tag.tag === this.translation.preferences.rawLaTag) {
          item.raw = true
          return false
        }
        return true
      })

      yield item
    }
  }

  text2latex(text:string, options: ConverterOptions = {}): ParseResult {
    if (typeof options.html === 'undefined') options.html = false
    return this.htmlconverter.tolatex(text, options)
  }

  public complete(): void {
    this.jabref.exportGroups()
    if (this.postfix) Zotero.write(this.postfix.toString())
    if (this.translation.BetterTeX && this.translation.preferences.qualityReport) {
      let sep = '\n% == Citekey duplicates in this file:\n'
      for (const [citekey, n] of Object.entries(this.citekeys).sort((a, b) => a[0].localeCompare(b[0]))) {
        if (n > 1) {
          Zotero.write(`${sep}% ${citekey} duplicates: ${n}\n`)
          sep = '% '
        }
      }
    }
    if (this.translation.BetterTeX && this.translation.options.cacheUse) {
      if (this.translation.cache.requests) {
        Zotero.write(`\n% cache use: ${Math.round(this.translation.cache.hits/this.translation.cache.requests)}%`)
      }
      else {
        Zotero.write('\n% cache use: no')
      }
    }
  }
}
