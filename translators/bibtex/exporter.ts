declare const Zotero: any

import { Translation } from '../lib/translator.js'

import { RegularItem } from '../../gen/typings/serialized-item.js'

import { JabRef } from '../bibtex/jabref.js'
import { simplifyForExport } from '../../gen/items/simplify.js'
import * as bibtexParser from '@retorquere/bibtex-parser'
import { Postfix } from './postfix.js'
import * as Extra from '../../content/extra.js'
import type { ExportedItem } from '../../content/worker/cache.js'
import { HTMLConverter, ConverterOptions, TeX } from './unicode_translator.js'

export class Exporter {
  public postfix: Postfix
  public jabref: JabRef
  public strings: Record<string, string> = {}
  public strings_reverse: Record<string, string> = {}
  public citekeys: Record<string, number> = {}

  private translation: Translation
  private tx: HTMLConverter

  constructor(translation: Translation) {
    this.translation = translation
    this.jabref = new JabRef(translation)
    // this.htmlconverterMode = translation.unicode ? 'minimal' : (translation.BetterBibTeX ? 'bibtex' : 'biblatex')
  }

  public prepare_strings(): void {
    if (!this.translation.BetterTeX || !this.translation.collected.preferences.strings) return

    if (this.translation.BetterTeX && this.translation.collected.preferences.exportBibTeXStrings.startsWith('match')) {
      this.strings = bibtexParser.parse(this.translation.collected.preferences.strings).strings
      for (const [ k, v ] of Object.entries(this.strings)) {
        this.strings_reverse[v.toUpperCase()] = k.toUpperCase()
      }
    }
  }

  public get items(): Generator<RegularItem, void, unknown> {
    return this.itemsGenerator()
  }

  private *itemsGenerator(): Generator<RegularItem, void, unknown> {
    if (!this.postfix && this.translation.BetterTeX) this.postfix = new Postfix(this.translation.collected.preferences.qualityReport)

    for (const item of this.translation.collected.items.regular) {
      if (this.translation.output.body) this.translation.output.body += '\n'

      if (typeof item.itemID !== 'number') item.$cacheable = false
      if (item.$cacheable && this.translation.BetterTeX) {
        let cached: ExportedItem = null
        if (cached = Zotero.BetterBibTeX.Cache.fetch(item.itemID)) {
          this.translation.output.body += cached.entry
          this.postfix?.add(cached.metadata)
          continue
        }
      }

      Object.assign(item, Extra.get(item.extra, 'zotero'))
      if (typeof item.itemID !== 'number') { // https://github.com/diegodlh/zotero-cita/issues/145
        item.citationKey = item.extraFields.citationKey
        item.$cacheable = false
      }
      if (!item.citationKey) throw new Error(`No citation key in ${ JSON.stringify(item) }`)

      this.citekeys[item.citationKey] = (this.citekeys[item.citationKey] || 0) + 1

      this.jabref.citekeys.set(item.itemID, item.citationKey)

      simplifyForExport(item)

      // strip extra.tex fields that are not for me
      const prefix = this.translation.BetterBibLaTeX ? 'biblatex.' : 'bibtex.'
      for (const [ name, field ] of Object.entries(item.extraFields.tex).sort((a, b) => b[0].localeCompare(a[0]))) { // sorts the fields from tex. to biblatex. to bibtex.
        for (const type of [ prefix, 'tex.' ]) {
          if (name.startsWith(type)) {
            item.extraFields.tex[name.substr(type.length)] = field
            break
          }
        }

        delete item.extraFields.tex[name]
      }

      item.raw = this.translation.BetterTeX && this.translation.collected.preferences.rawLaTag === '*'
      item.tags = item.tags.filter(tag => {
        if (this.translation.BetterTeX && tag.tag === this.translation.collected.preferences.rawLaTag) {
          item.raw = true
          return false
        }
        return true
      })

      yield item
    }
  }

  text2latex(text: string, options: ConverterOptions = {}): TeX {
    if (typeof options.html === 'undefined') options.html = false
    this.tx = this.tx || new HTMLConverter(this.translation)
    return this.tx.tolatex(text, options)
  }

  public complete(): void {
    const postfix: string[] = [
      this.jabref.toString(),
      this.postfix?.toString() || '',
    ].filter(m => m)

    if (this.translation.collected.preferences.qualityReport) {
      const duplicates = [
        '% == Citekey duplicates in this file:\n',
      ]
      for (const [ citekey, n ] of Object.entries(this.citekeys).sort((a, b) => a[0].localeCompare(b[0]))) {
        if (n > 1) duplicates.push(`% ${ citekey } duplicates: ${ n }\n`)
      }
      if (duplicates.length > 1) postfix.push(duplicates.join(''))
    }

    if (postfix.length) {
      if (this.translation.output.body) this.translation.output.body += '\n'
      this.translation.output.body += postfix.join('')
    }
  }
}
