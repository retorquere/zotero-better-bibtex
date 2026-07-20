declare const Zotero: any

import { Collected, slurp } from './lib/collect'
import { padInt } from '../content/text'
import { detectFormat } from './lib/yaml'
import type { Header } from '../gen/translators'
declare var ZOTERO_TRANSLATOR_INFO: Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Zotero.BetterBibTeX.generateCSLYAML(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))
  Zotero.write(translation.output.body)
}

export function detectImport(): boolean {
  try {
    const parsed = Zotero.BetterBibTeX.parseYAML(slurp())
    return detectFormat(parsed) === 'csl'
  }
  catch {
    return false
  }
}

function circa(date) {
  return date.circa ? '?' : ''
}

const seasons = [ undefined, 'Spring', 'Summer', 'Autumn', 'Winter' ]

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
    for (const offset of [ 20, 12 ]) {
      if (month && month > offset) {
        season = month - offset
        month = undefined
      }
    }
  }

  if (typeof season === 'number') season = seasons[season] || season
  if (typeof season === 'number') return `${padInt(year, 4)}-${padInt(season, 2)}${circa(date)}`
  if (season) return `${ season } ${padInt(year, 4)}`

  if (day && month) return `${padInt(year, 4)}-${padInt(month, 2)}-${padInt(day, 2)}${circa(date)}`
  if (month) return `${padInt(year, 4)}-${padInt(month, 2)}${circa(date)}`
  return `${padInt(year, 4)}${circa(date)}`
}

function yamlDate(date): string {
  if (date.literal) return date.literal // eslint-disable-line @typescript-eslint/no-unsafe-return

  if (!date.year) return ''
  if (date.year < 0) date.year += 1

  if (!date.season) {
    for (const offset of [ 20, 12 ]) {
      if (date.month && date.month > offset) {
        date.season = date.month - offset
        delete date.month
      }
    }
  }

  if (typeof date.season === 'number') date.season = seasons[date.season] || date.season
  if (typeof date.season === 'number') return `${padInt(date.year, 4)}-${padInt(date.season, 2)}${circa(date)}`
  if (date.season) return `${ date.season } ${padInt(date.year, 4)}`

  if (date.day && date.month) return `${padInt(date.year, 4)}-${padInt(date.month, 2)}-${padInt(date.day, 2)}${circa(date)}`
  if (date.month) return `${padInt(date.year, 4)}-${padInt(date.month, 2)}${circa(date)}`
  return `${padInt(date.year, 4)}${circa(date)}`
}

export async function doImport(): Promise<void> {
  const parsed = Zotero.BetterBibTeX.parseYAML(slurp())
  if (detectFormat(parsed) !== 'csl') {
    throw new Error('Input is not in CSL-YAML format')
  }

  const { references } = parsed
  for (const source of references) {
    const item = (new Zotero.Item)

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

    for (const [ csl, zotero ] of Object.entries({ accessed: 'accessDate', issued: 'date', submitted: 'filingDate', 'original-date': 'Original date' })) {
      // empty
      if (typeof source[csl] === 'undefined') continue

      let value
      if (source[csl].raw || source[csl].literal) {
        value = source[csl].raw || source[csl].literal
      }
      else if (source[csl]['date-parts']) {
        value = join(source[csl]['date-parts'].map(dp => cslDate({ ...source[csl], 'date-part': dp })))
      }
      else if (typeof source[csl] === 'number' || typeof source[csl] === 'string') {
        value = source[csl]
      }
      else { // yaml-specific date array
        value = join(source[csl].map(yamlDate))
      }

      if (zotero.includes(' ')) {
        item.extra = `${ item.extra || '' }\n${ zotero }: ${ value }`.trim()
      }
      else {
        item[zotero] = value
      }
    }

    await item.complete()
  }
}
