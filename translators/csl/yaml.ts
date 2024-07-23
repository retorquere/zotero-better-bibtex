declare const Zotero: any

import YAML = require('js-yaml')
import { Date as CSLDate, Data as CSLItem, LooseNumber } from 'csl-json'

import { Translation } from '../lib/translator'

import type { MarkupNode } from '../../typings/markup'

import { CSLExporter } from './csl'
import { simple as log } from '../../content/logger'
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

    if (['#text', 'pre', 'script'].includes(tag.nodeName)) {
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
        for (const [k, v] of Object.entries(tag.attr)) {
          span_attrs += ` ${k}="${v}"`
        }
        if (span_attrs) this.markdown += `<span${span_attrs}>`
        break

      case 'tbody':
      case '#document':
      case 'html':
      case 'head':
      case 'body':
        break // ignore

      default:
        log.error(`unexpected tag '${tag.nodeName}'`)
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
        if (tag.attr.href && tag.attr.href.length) this.markdown += `](${tag.attr.href})`
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
      throw new Error(`Expected date or open, got ${date.type}`)
  }
}

class Exporter extends CSLExporter {
  public date2CSL(date: ParsedDate): CSLDate { // fudge for CSL-YAML dates
    switch (date.type) {
      case 'date':
      case 'open':
      case 'season':
        return [ date2csl(date) ] as unknown as CSLDate

      case 'interval':
        return [ date2csl(date.from), date2csl(date.to) ] as unknown as CSLDate

      case 'verbatim':
        return [ { literal: date.verbatim } ] as unknown as CSLDate

      default:
        throw new Error(`Unexpected date type ${JSON.stringify(date)}`)
    }
  }

  public serialize(csl: CSLItem): string {
    for (const [k, v] of Object.entries(csl)) {
      if (typeof v === 'string' && v.indexOf('<') >= 0) csl[k] = htmlConverter.convert(v)
    }
    return YAML.dump([csl], {skipInvalid: true}) as string
  }

  public flush(items: string[]): string {
    return `---\nreferences:\n${items.join('\n')}...\n`
  }
}

export function generateCSLYAML(translation: Translation): void {
  const exporter = new Exporter(translation)
  exporter.doExport()
}

function parseInput(): any {
  let src = ''
  let chunk: string
  while (chunk = Zotero.read(102400)) {
    src += chunk
  }

  src = src.replace(/\n---[\r\n]*$/, '\n...\n')
  return YAML.load(src) // eslint-disable-line @typescript-eslint/no-unsafe-return
}

export function detectImport(): boolean {
  try {
    return parseInput().references // eslint-disable-line @typescript-eslint/no-unsafe-return
  }
  catch (err) {
    return false
  }
}

function fill(n: number, template: string): string {
  const str = `${Math.abs(n)}`
  const padded = `${template}${str}`
  return `${n < 0 ? '-' : ''}${padded.slice(-Math.max(str.length, template.length))}`
}

function circa(date) {
  return date.circa ? '?' : ''
}

const seasons = [undefined, 'Spring', 'Summer', 'Autumn', 'Winter']

function join(dates: string[]): string {
  switch (dates.length) {
    case 0:
      return ''
    case 1:
      return dates[0]
    case 2:
      // there is one date that is not a yyyy-mm-dd
      if (dates.find(date => date.includes(' '))) {
        return dates.join(' - ')
      }
      else {
        return dates.join('/')
      }
    default:
      return dates.join(', ')
  }
}

function cslDate(date): string {
  if (date.raw || date.literal) return date.raw || date.literal // eslint-disable-line @typescript-eslint/no-unsafe-return

  const datepart = date['date-part']
  if (!datepart || !datepart[0]) return ''

  let year = datepart.unshift()
  if (!year) return ''
  if (year < 0) year += 1

  let month = datepart.unshift()
  const day = datepart.unshift()

  let season
  if (date.season) {
    season = date.season
  }
  else {
    for (const offset of [20, 12]) {
      if (month && month > offset) {
        season = month - offset
        month = undefined
      }
    }
  }

  if (typeof season === 'number') season = seasons[season] || season
  if (typeof season === 'number') return `${fill(year, '0000')}-${fill(season, '00')}${circa(date)}`
  if (season) return `${season} ${fill(year, '0000')}`

  if (day && month) return `${fill(year, '0000')}-${fill(month, '00')}-${fill(day, '0000')}${circa(date)}`
  if (month) return `${fill(year, '0000')}-${fill(month, '00')}${circa(date)}`
  return `${fill(year, '0000')}${circa(date)}`
}

function yamlDate(date): string {
  if (date.literal) return date.literal // eslint-disable-line @typescript-eslint/no-unsafe-return

  if (!date.year) return ''
  if (date.year < 0) date.year += 1

  if (!date.season) {
    for (const offset of [20, 12]) {
      if (date.month && date.month > offset) {
        date.season = date.month - offset
        delete date.month
      }
    }
  }

  if (typeof date.season === 'number') date.season = seasons[date.season] || date.season
  if (typeof date.season === 'number') return `${fill(date.year, '0000')}-${fill(date.season, '00')}${circa(date)}`
  if (date.season) return `${date.season} ${fill(date.year, '0000')}`

  if (date.day && date.month) return `${fill(date.year, '0000')}-${fill(date.month, '00')}-${fill(date.day, '0000')}${circa(date)}`
  if (date.month) return `${fill(date.year, '0000')}-${fill(date.month, '00')}${circa(date)}`
  return `${fill(date.year, '0000')}${circa(date)}`
}

export async function doImport(): Promise<void> {
  for (const source of parseInput().references) {
    const item = new Zotero.Item()

    // Default to 'article' (Document) if no type given. 'type' is required in CSL-JSON,
    // but some DOI registration agencies provide bad data, and this is better than failing.
    // (itemFromCSLJSON() will already default to 'article' for unknown 'type' values.)
    //
    // Technically this should go in the DOI Content Negotation translator, but it's easier
    // to do this here after the JSON has been parsed, and it might benefit other translators.
    //
    // This is just for imports from other translators. File/clipboard imports without
    // 'type' still won't work, because a valid 'type' is required in detectImport().
    //
    // https://forums.zotero.org/discussion/85273/error-importing-dois-via-add-item-by-identifier
    if (!source.type) source.type = 'article'
    Zotero.Utilities.itemFromCSLJSON(item, source)

    for (const [csl, zotero] of Object.entries({ accessed: 'accessDate', issued: 'date', submitted: 'filingDate', 'original-date': 'Original date' })) {
      // empty
      if (typeof source[csl] === 'undefined') continue

      let value
      if (source[csl].raw || source[csl].literal) {
        value = source[csl].raw || source[csl].literal
      }
      else if (source[csl]['date-parts']) {
        value = join(source[csl]['date-parts'].map(dp => cslDate({...source[csl], 'date-part': dp})))
      }
      else if (typeof source[csl] === 'number' || typeof source[csl] === 'string') {
        value = source[csl]
      }
      else { // yaml-specific date array
        value = join(source[csl].map(yamlDate))
      }

      if (zotero.includes(' ')) {
        item.extra = `${item.extra || ''}\n${zotero}: ${value}`.trim()
      }
      else {
        item[zotero] = value
      }
    }

    if (typeof source.id === 'string' && !source.id.match(/^[0-9]+$/) && !(item.extra || '').toLowerCase().match(/(^|\n)citation key:/)) {
      item.extra = `${item.extra || ''}\nCitation Key: ${source.id}`.trim()
    }
    await item.complete()
  }
}

export function parseCSLYAML(input: string): any {
  input = input.replace(/\n---[\r\n]*$/, '\n...\n')
  return YAML.load(input) // eslint-disable-line @typescript-eslint/no-unsafe-return
}
