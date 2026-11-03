declare const Zotero: any

import { strcmp } from '../../content/string-compare'
import { Translation } from '../lib/translator'

import { Serialized } from '../../gen/typings/serialized'

import { JabRef } from '../bibtex/jabref'
import { simplifyForExport } from '../../content/item-schema'
import { Postfix } from './postfix'
import * as Extra from '../../content/extra'
import type { ExportedItem } from '../../content/worker/cache'
import { HTMLConverter, ConverterOptions, TeX } from './unicode_translator'

export class Exporter {
  private static strings: Record<string, string> = {}
  private static strings_reverse: Record<string, string> = {}

  /** Replace the shared matching maps, including clearing removed strings. */
  public static setStrings(strings: Record<string, string>): void {
    Exporter.strings = strings
    Exporter.strings_reverse = {}
    for (const [ key, value ] of Object.entries(strings)) {
      Exporter.strings_reverse[value.toUpperCase()] = key.toUpperCase()
    }
  }

  public postfix?: Postfix
  public jabref: JabRef
  public strings: Record<string, string> = {}
  public strings_reverse: Record<string, string> = {}
  public citekeys: Record<string, number> = {}

  private translation: Translation
  private tx!: HTMLConverter

  /** Use the shared maps only when this export enables string matching. */
  constructor(translation: Translation) {
    this.translation = translation
    this.jabref = new JabRef(translation)
    // this.htmlconverterMode = translation.unicode ? 'minimal' : (translation.BetterBibTeX ? 'bibtex' : 'biblatex')

    if (translation.BetterTeX && translation.collected.preferences.exportBibTeXStrings.startsWith('match')) {
      this.strings = Exporter.strings
      this.strings_reverse = Exporter.strings_reverse
    }
  }

  public get items(): Generator<Serialized.RegularItem, void, unknown> {
    return this.itemsGenerator()
  }

  private *itemsGenerator(): Generator<Serialized.RegularItem, void, unknown> {
    if (!this.postfix && this.translation.BetterTeX) this.postfix = new Postfix(this.translation.collected.preferences.qualityReport)

    for (let item of this.translation.collected.items.regular) {
      if (this.translation.output.body) this.translation.output.body += '\n'

      if (typeof item.itemID !== 'number') item.$cacheable = false
      if (item.$cacheable && this.translation.BetterTeX) {
        const cached: ExportedItem = Zotero.BetterBibTeX.Cache.fetch(item.itemID)
        if (cached) {
          this.translation.output.body += cached.entry
          this.postfix?.add(cached.metadata)
          continue
        }
      }

      Object.assign(item, Extra.get(item.extra, 'zotero'))
      if (!item.citationKey && item.extraFields.kv!.citationKey) {
        item.citationKey = item.extraFields.kv!.citationKey
        delete item.extraFields.kv!.citationKey
      }
      if (typeof item.itemID !== 'number') { // https://github.com/diegodlh/zotero-cita/issues/145
        item.citationKey = Extra.citationKey(item.extra).citationKey
        item.$cacheable = false
      }

      this.citekeys[item.citationKey] = (this.citekeys[item.citationKey] || 0) + 1

      this.jabref.citekeys.set(item.itemID, item.citationKey)

      item = simplifyForExport(item, { clone: false }) as typeof item

      if (item.extraFields.tex) {
        // strip extra.tex fields that are not for me
        const prefix = this.translation.BetterBibLaTeX ? 'biblatex.' : 'bibtex.'
        for (const [ name, field ] of Object.entries(item.extraFields.tex).sort((a, b) => strcmp.variant(b[0], a[0]))) {
          // sorts the fields from tex. to biblatex. to bibtex.
          for (const type of [ prefix, 'tex.' ]) {
            if (name.startsWith(type)) {
              item.extraFields.tex[name.substr(type.length)] = field
              break
            }
          }

          delete item.extraFields.tex[name]
        }
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
    this.tx = this.tx ?? new HTMLConverter(this.translation)
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
      for (const [ citekey, n ] of Object.entries(this.citekeys).sort((a, b) => strcmp.variant(a[0], b[0]))) {
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
