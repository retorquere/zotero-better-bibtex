declare const Zotero: any

import { Translation } from '../lib/translator'

import { RegularItem } from '../../gen/typings/serialized-item'

import { JabRef } from '../bibtex/jabref'
import { simplifyForExport } from '../../gen/items/simplify'
import * as bibtexParser from '@retorquere/bibtex-parser'
import { Postfix } from './postfix'
import * as Extra from '../../content/extra'
import type { ExportedItem } from '../../content/db/cache'
import { HTMLConverter, Mode as ConversionMode, ConverterOptions, ParseResult } from './unicode_translator'

export class Exporter {
  public postfix: Postfix
  public jabref: JabRef
  public strings: {[key: string]: string} = {}
  public strings_reverse: {[key: string]: string} = {}
  public citekeys: Record<string, number> = {}

  private translation: Translation
  private htmlconverter: Partial<Record<ConversionMode, HTMLConverter>> = {}
  private htmlconverterMode: ConversionMode

  constructor(translation: Translation) {
    this.translation = translation
    this.jabref = new JabRef(translation)
    this.htmlconverterMode = translation.unicode ? 'minimal' : (translation.BetterBibTeX ? 'bibtex' : 'biblatex')
  }

  public prepare_strings(): void {
    if (!this.translation.BetterTeX || !this.translation.preferences.strings) return

    if (this.translation.BetterTeX && this.translation.preferences.exportBibTeXStrings.startsWith('match')) {
      this.strings = bibtexParser.parse(this.translation.preferences.strings).strings
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

    for (const item of this.translation.input.items.regular) {
      if (this.translation.output.body) this.translation.output.body += '\n'

      Object.assign(item, Extra.get(item.extra, 'zotero'))
      if (typeof item.itemID !== 'number') { // https://github.com/diegodlh/zotero-cita/issues/145
        item.citationKey = item.extraFields.citationKey
        item.$cacheable = false
      }
      if (!item.citationKey) throw new Error(`No citation key in ${JSON.stringify(item)}`)

      this.citekeys[item.citationKey] = (this.citekeys[item.citationKey] || 0) + 1

      this.jabref.citekeys.set(item.itemID, item.citationKey)

      let cached: ExportedItem = null
      if (item.$cacheable && this.translation.BetterTeX) {
        if (cached = Zotero.BetterBibTeX.Cache.fetch(item.itemID)) {
          this.translation.output.body += cached.entry
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

  text2latex(text:string, options: ConverterOptions = {}, mode?: ConversionMode): ParseResult {
    if (typeof options.html === 'undefined') options.html = false
    mode = mode || this.htmlconverterMode
    if (!this.htmlconverter[mode]) this.htmlconverter[mode] = new HTMLConverter(this.translation, mode)
    return this.htmlconverter[mode].tolatex(text, options)
  }

  public complete(): void {
    const postfix: string[] = [
      this.jabref.toString(),
      this.postfix?.toString() || '',
    ].filter(m => m)

    if (this.translation.preferences.qualityReport) {
      const duplicates = [
        '% == Citekey duplicates in this file:\n',
      ]
      for (const [citekey, n] of Object.entries(this.citekeys).sort((a, b) => a[0].localeCompare(b[0]))) {
        if (n > 1) duplicates.push(`% ${citekey} duplicates: ${n}\n`)
      }
      if (duplicates.length > 1) postfix.push(duplicates.join(''))
    }

    if (postfix.length) {
      if (this.translation.output.body) this.translation.output.body += '\n'
      this.translation.output.body += postfix.join('')
    }
  }
}
