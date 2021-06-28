declare const Zotero: any

import YAML = require('js-yaml')

import { Translator } from './lib/translator'
import type { MarkupNode } from '../typings/markup'
export { Translator }

import { CSLExporter as Exporter } from './csl/csl'
import { log } from '../content/logger'

const htmlConverter = new class HTML {
  private markdown: string

  public convert(html) {
    this.markdown = ''
    this.walk(Zotero.BetterBibTeX.parseHTML(html))
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

function date2csl(date) {
  switch (date.type) {
    case 'open':
      return { year: 0 }

    case 'date':
      return {
        year: date.year > 0 ? date.year : date.year - 1,
        month: date.month || undefined,
        day: date.month && date.day ? date.day : undefined,
        circa: (date.approximate || date.uncertain) ? true : undefined,
      }

    case 'season':
      return {
        year: date.year > 0 ? date.year : date.year - 1,
        season: date.season,
        circa: (date.approximate || date.uncertain) ? true : undefined,
      }

    default:
      throw new Error(`Expected date or open, got ${date.type}`)
  }
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return
Exporter.date2CSL = function(date) {
  switch (date.type) {
    case 'date':
    case 'season':
      return [ date2csl(date) ]

    case 'interval':
      return [ date2csl(date.from), date2csl(date.to) ]

    case 'verbatim':
      return [ { literal: date.verbatim } ]

    default:
      throw new Error(`Unexpected date type ${JSON.stringify(date)}`)
  }
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
Exporter.serialize = function(csl): string {
  for (const [k, v] of Object.entries(csl)) {
    if (typeof v === 'string' && v.indexOf('<') >= 0) csl[k] = htmlConverter.convert(v)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return YAML.dump([csl], {skipInvalid: true})
}

Exporter.flush = items => `---\nreferences:\n${items.join('\n')}...\n`

export function doExport(): void {
  Translator.init('export')
  Exporter.initialize()
  Exporter.doExport()
}

function parseInput(): any {
  let src = ''
  let chunk: string
  while (chunk = Zotero.read(102400)) { // eslint-disable-line no-magic-numbers
    src += chunk
  }
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
    for (const offset of [20, 12]) { // eslint-disable-line no-magic-numbers
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
    for (const offset of [20, 12]) { // eslint-disable-line no-magic-numbers
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
      // yaml-specific date array
      else {
        value = join(source[csl].map(yamlDate))
      }

      if (zotero.includes(' ')) {
        item.extra = `${item.extra || ''}\n${zotero}: ${value}`.trim()
      }
      else {
        item[zotero] = value
      }
    }

    await item.complete()
  }
}
