import YAML from 'js-yaml'
import { Date as CSLDate, Data as CSLItem, LooseNumber } from 'csl-json'

import type { Collected } from '../lib/collect'
import { Translation } from '../lib/translator'

import type { MarkupNode } from '../../typings/markup'

import { CSLExporter } from './csl'
import { log } from '../../content/logger'
import { ParsedDate } from '../../content/dateparser'
import { HTMLParser } from '../../content/text'

const htmlConverter = new class HTML {
  private markdown: string

  public convert(html) {
    this.markdown = ''
    this.walk(HTMLParser.parse(html, {}))
    return this.markdown
  }

  private walk(tag: MarkupNode) {
    if (!tag) return

    if ([ '#text', 'pre', 'script' ].includes(tag.nodeName)) {
      this.markdown += tag.value.replace(/([[*~^])/g, '\\$1')
      return
    }

    let span_attrs = ''
    switch (tag.nodeName) {
      case 'i': case 'em': case 'italic':
        this.markdown += '*'
        break

      case 'b': case 'strong':
        this.markdown += '**'
        break

      case 'a':
        /* zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. */
        if (tag.attr.href && tag.attr.href.length) this.markdown += '['
        break

      case 'sup':
        this.markdown += '^'
        break

      case 'sub':
        this.markdown += '~'
        break

      case 'sc':
        this.markdown += '<span style="font-variant:small-caps;">'
        tag.attr.style = 'font-variant:small-caps;'
        break

      case 'span':
        for (const [ k, v ] of Object.entries(tag.attr)) {
          span_attrs += ` ${ k }="${ v }"`
        }
        if (span_attrs) this.markdown += `<span${ span_attrs }>`
        break

      case 'tbody':
      case '#document':
      case 'html':
      case 'head':
      case 'body':
        break // ignore

      default:
        log.error(`unexpected tag '${ tag.nodeName }'`)
    }

    for (const child of tag.childNodes) {
      this.walk(child)
    }

    switch (tag.nodeName) {
      case 'i': case 'italic': case 'em':
        this.markdown += '*'
        break

      case 'b': case 'strong':
        this.markdown += '**'
        break

      case 'sup':
        this.markdown += '^'
        break

      case 'sub':
        this.markdown += '~'
        break

      case 'a':
        if (tag.attr.href && tag.attr.href.length) this.markdown += `](${ tag.attr.href })`
        break

      case 'sc':
        this.markdown += '</span>'
        break

      case 'span':
        if (span_attrs) this.markdown += '</span>'
        break
    }
  }
}

function date2csl(date): [LooseNumber, LooseNumber?, LooseNumber?] { // fudge for CSL-YAML dates
  switch (date.type) {
    case 'open':
      return { year: 0 } as unknown as [LooseNumber, LooseNumber?, LooseNumber?]

    case 'date':
      return {
        year: date.year > 0 ? date.year : date.year - 1,
        month: date.month || undefined,
        day: date.month && date.day ? date.day : undefined,
        circa: (date.approximate || date.uncertain) ? true : undefined,
      } as unknown as [LooseNumber, LooseNumber?, LooseNumber?]

    case 'season':
      return {
        year: date.year > 0 ? date.year : date.year - 1,
        season: date.season,
        circa: (date.approximate || date.uncertain) ? true : undefined,
      } as unknown as [LooseNumber, LooseNumber?, LooseNumber?]

    default:
      throw new Error(`Expected date or open, got ${ date.type }`)
  }
}

class Exporter extends CSLExporter {
  public date2CSL(date: ParsedDate): CSLDate { // fudge for CSL-YAML dates
    switch (date.type) {
      case 'date':
      case 'open':
      case 'season':
        return [date2csl(date)] as unknown as CSLDate

      case 'interval':
        return [ date2csl(date.from), date2csl(date.to) ] as unknown as CSLDate

      case 'verbatim':
        return [{ literal: date.verbatim }] as unknown as CSLDate

      case 'century':
        return [{ literal: `${date.century}th century` }] as unknown as CSLDate

      default:
        throw new Error(`Unexpected date type ${ JSON.stringify(date) }`)
    }
  }

  public serialize(csl: CSLItem): string {
    for (const [ k, v ] of Object.entries(csl)) {
      if (typeof v === 'string' && v.indexOf('<') >= 0) csl[k] = htmlConverter.convert(v)
    }
    return YAML.dump([csl], { skipInvalid: true }) as string
  }

  public flush(items: string[]): string {
    return `---\nreferences:\n${ items.join('\n') }...\n`
  }
}

export function generateCSLYAML(collected: Collected): Translation {
  const translation = Translation.Export(collected)
  const exporter = new Exporter(translation)
  exporter.doExport()
  return translation
}

export function parseCSLYAML(input: string): any {
  input = input.replace(/\n---[\r\n]*$/, '\n...\n')
  return YAML.load(input)
}
