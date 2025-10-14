import EDTF, { parse as EDTFnotz } from 'edtf'
import edtfy from 'edtfy'

// declare const dump: (msg: string) => void
// function dump(...msg) { console.log(...msg) }

import * as months from '../gen/dateparser-months.json'
const Month = new class {
  #re = new RegExp(`\\b${Object.keys(months).sort((a, b) => b.length - a.length).map(month => `${month}[.]?`).join('|')}\\b`, 'ugi')
  #no = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
    sprint: 13,
    summer: 14,
    autumn: 15,
    winter: 16,
  }

  public re = `\\b${[...(new Set(Object.values(months)))].sort((a, b) => b.length - a.length).map(month => `${month}[.]?`).join('|')}\\b`
  public map = months

  no(name: string): number {
    return this.#no[name.toLowerCase()] as number
  }

  english(date: string): string {
    return date.replace(this.#re, (month: string) => this.map[month.toLowerCase().replace('.', '')].toLowerCase() as string)
  }
}

import { getLocaleDateOrder } from '../submodules/zotero-utilities/date'

type SeasonID = 1 | 2 | 3 | 4

export type ParsedDate = {
  type?: 'date' | 'open' | 'verbatim' | 'season' | 'interval' | 'list'
  year?: number
  month?: number
  day?: number

  hour?: number
  minute?: number
  seconds?: number
  offset?: number

  orig?: ParsedDate
  verbatim?: string

  from?: ParsedDate
  to?: ParsedDate

  dates?: ParsedDate[]

  season?: SeasonID
  uncertain?: boolean
  approximate?: boolean
}

const Season = new class {
  private ranges = [
    [13, 14, 15, 16],
    [21, 22, 23, 24],
  ]

  public fromMonth(month: number): SeasonID {
    for (const range of this.ranges) {
      if (range.includes(month)) return (month - range[0]) + 1 as SeasonID
    }
    return undefined
  }

  public seasonize(date: ParsedDate): ParsedDate {
    const season = this.fromMonth(date.month)
    if (date.type === 'date' && typeof season === 'number') {
      date.type = 'season'
      date.season = season
      delete date.month
    }
    return date
  }
}

function normalize_edtf(date: any): ParsedDate {
  const type = date.type.replace('_', '')

  if (type === 'Date') {
    let [year, month, day, hour, minute, seconds] = date.values
    if (typeof month === 'number') month += 1
    return {
      type: 'date',
      year,
      month,
      day,
      hour,
      minute,
      seconds,
      offset: date.offset,
      approximate: !!(date.approximate || date.unspecified),
      uncertain: !!date.uncertain,
    }
  }

  if (type === 'Interval') {
    const [min, max] = date.values
    return {
      type: 'interval',
      from: normalize_edtf(min),
      to: normalize_edtf(max),
    }
  }

  if (type === 'Season') {
    let [year, month] = date.values
    if (typeof month === 'number') month += 1
    if (typeof Season.fromMonth(month) !== 'number') throw new Error(`normalize EDTF: Unexpected season ${month}`)
    return Season.seasonize({
      type: 'date',
      year,
      month,
    })
  }

  if (type === 'List') {
    return {
      type: 'list',
      dates: date.values.map(normalize_edtf),
    }
  }

  throw new Error(`normalize EDTF: failed to normalize ${type}`)
}

function upgrade_edtf(date: string): string {
  return date
    .replace(/unknown/g, '')
    .replace(/u/g, 'X')
    .replace(/(\?~)|(~\?)/g, '%')
    .replace(/open/g, '')
    .replace(/\.\./g, '')
    .replace(/y/g, 'Y')
}

function is_valid_month(month: number, allowseason: boolean) {
  if (month >= 1 && month <= 12) return true
  if (allowseason && Season.fromMonth(month)) return true

  return false
}

function has_valid_month(date: ParsedDate) {
  return date.type === 'date' && typeof date.month === 'number' && is_valid_month(date.month, true)
}

function is_valid_date(date: ParsedDate) {
  if (date.type !== 'date') return true
  if (typeof date.year !== 'number') return false
  date = { ...date }
  if (typeof date.month === 'number' && Season.fromMonth(date.month)) {
    if (typeof date.day !== 'undefined') return false
    date.month = 1
  }
  const d = new Date(`${date.year}-${date.month || 1}-${date.day || 1}`)
  return (d instanceof Date) && !isNaN(d as unknown as number)
}

// swap day/month for our American friends
function swap_day_month(date: ParsedDate, fix_only = false): ParsedDate {
  if (!date.day) return date

  if (!is_valid_month(date.month, false) && is_valid_month(date.day, false)) return { ...date, month: date.day, day: date.month }
  if (!fix_only && getLocaleDateOrder() === 'mdy' && is_valid_month(date.day, false)) return { ...date, month: date.day, day: date.month }
  return date
}

const re = {
  // February 28, 1969
  Mdy: new RegExp(`^(?<month>${Month.re})\\s+(?<day>\\d+)[,\\s]\\s*(?<year>\\d+)$`, 'ui'),

  // https://forums.zotero.org/discussion/73729/name-and-year-import-issues-with-new-nasa-ads
  nasa: {
    dash: /^(?<date>-?\d+)-00-00$/,
    slash: /^(?<date>-?\d+)\/00\/00$/,
    ym: /^(?<date>-?\d+-\d+)-00$/,
  },

  // https://github.com/retorquere/zotero-better-bibtex/issues/1513
  spanish: new RegExp(`^(?<day>\\d+)\\s+(de\\s+)?(?<month>${Month.re})\\s+(de\\s+)?(?<year>\\d+)$`, 'ui'),

  // '30-Mar-2020'
  d_M_y: new RegExp(`^(?<day>\\d+)-(?<month>${Month.re})-(?<year>\\d+)$`, 'ui'),

  My: new RegExp(`^(?<month>${Month.re})(?:[-/]|\\s+)(?<year>\\d+)$`, 'ui'),
  yM: new RegExp(`^(?<year>\\d+)(?:[-/]|\\s+)(?<month>${Month.re})$`, 'ui'),

  // '[origdate] date' and '[origdate]'
  orig_date: /^\[(?<orig>.+?)\]\s*(?<date>.*)$/,
  // 'date [origdate]'
  date_orig: /^(?<date>.+?)\s*\[(?<orig>.+)\]$/,

  // 747 'jan 20-22 1977'
  M_d_d_y: new RegExp(`^(?<month>${Month.re})\\s+(?<day1>\\d+)(?:--|-|\u2013)(?<day2>\\d+)[, ]\\s*(?<year>\\d+)$`, 'ui'),

  // #747: January 30–February 3, 1989
  M_d_M_d_y: new RegExp(`^(?<month1>${Month.re})\\s+(?<day1>\\d+)(?:--|-|\u2013)(?<month2>${Month.re})\\s+(?<day2>\\d+)[, ]\\s*(?<year>\\d+)$`, 'ui'),

  // #746: 22-26 June 2015, 29 June-1 July 2011
  d_M_d_M_y: new RegExp(`^(?<day1>\\d+)\\s*(?<month1>${Month.re})?(?:--|-|\u2013)\\s*(?<day2>\\d+)\\s+(?<month2>${Month.re})\\s+(?<year>\\d+)$`, 'ui'),

  // July-October 1985
  M_M_y: new RegExp(`^(?<month1>${Month.re})(?:--|-|\u2013)(?<month2>${Month.re})(?:--|-|\u2013|\\s+)(?<year>\\d+)$`, 'ui'),

  y_d_m: /^(?<year>\d{3,})([-\s/.])(?<month>\d{1,2})(?:\2(?<day>\d{1,2}))?$/,

  // https://github.com/retorquere/zotero-better-bibtex/issues/1112
  pubmed: /^(?<day>\d{1,2})\s+(?<month>\d{1,2})\s*,\s*(?<year>\d{4,})$/,

  d_m_y: /^(?<day>\d{1,2})([-\s/.])(?<month>\d{1,2})(?:\2(?<year>\d{3,}))$/,

  m_y: /^(?<month>\d{1,2})[-\s/.](?<year>\d{3,})$/,

  y_m: /^(?<year>\d{3,})[-\s/.](?<month>\d{1,2})$/,

  y: /^(?<year>-?\d{3,})$/,

  // https://github.com/retorquere/zotero-better-bibtex/issues/868
  y_M_d: new RegExp(`^(?<year>\\d{3,})\\s+(?<month>${Month.re})(?:\\s+(?<day>\\d+))$`, 'ui'),

  withtime: /(?:(?:\s*|T)(?<hour>\d{2}):(?<minute>\d{2})(?::(?<seconds>\d{2}(?:[.]\d+)?)\s*(?:Z|(?<offsetH>[+-]\d{2}):?(?<offsetM>\d{2})?)?)?)?(?<doubt>[~?]*)$/,

  edtf: /^(?<year>\d+)[^\d]+(?<month>\d+)[^\d]+(?<day>\d+)[^\d]+(?<time>\d{2}:\d{2}:\d{2}(?:[.]\d+)?)(?<tz>.*?)/,
}

class DateParser {
  edtf(date: string): any {
    return EDTF(date)
  }

  parse(value: string, options = { range: true, reparse: true }): ParsedDate {
    const { reparse, range } = options

    value = (value || '').trim()
    let $date: ParsedDate

    let m: RegExpMatchArray

    if (value === 'today') {
      const now = new Date
      return { type: 'date', year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
    }

    if (value === '') return { type: 'open' }

    // if (value.match(/[T ]/) && !(date = this.parseEDTF(value)).verbatim) return date

    const english = Month.english(value.normalize('NFC').replace(/[.] /, ' ')) // 8. july 2011

    if (m = english.match(re.Mdy)) {
      return { type: 'date', year: parseInt(m.groups.year), month: Month.no(m.groups.month), day: parseInt(m.groups.day) }
    }

    if (reparse && (m = value.match(re.nasa.dash) || value.match(re.nasa.slash) || value.match(re.nasa.ym))) {
      return this.parse(m.groups.date, { range, reparse: false })
    }

    if (reparse && (m = english.match(re.spanish))) {
      return this.parse(`${m.groups.day} ${Month.map[m.groups.month.toLowerCase()]} ${m.groups.year}`, { range, reparse: false })
    }

    if (reparse && (m = english.match(re.d_M_y))) {
      let { day, month, year } = m.groups
      if (parseInt(m.groups.day) > 31 && parseInt(m.groups.year) < 31) [day, year] = [year, day]
      const parsed = this.parse(`${month} ${day} ${year}`, { range, reparse: false })
      if (parsed.type === 'date') return parsed
    }

    if (m = english.match(re.My) || english.match(re.yM)) {
      return { type: 'date', year: parseInt(m.groups.year), month: Month.no(m.groups.month) }
    }

    if (reparse && (m = value.match(re.orig_date) || value.match(re.date_orig))) {
      const { orig, date } = m.groups
      const parsed = {
        orig: this.parse(orig, { range, reparse: false }),
        date: date ? this.parse(date, { range, reparse: false }) : undefined,
      }
      if (parsed.orig.type === 'date' && (!parsed.date || parsed.date.type === 'date')) return { ...parsed.date, orig: parsed.orig }
    }

    if (reparse && (m = english.match(re.M_d_d_y))) {
      const { month, day1, day2, year } = m.groups

      const from = this.parse(`${month} ${day1} ${year}`, { range, reparse: false })
      const to = this.parse(`${month} ${day2} ${year}`, { range, reparse: false })

      if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
    }

    // #747: January 30–February 3, 1989
    if (m = value.match(re.M_d_M_d_y)) {
      const { month1, day1, month2, day2, year } = m.groups

      return {
        type: 'interval',
        from: { type: 'date', year: parseInt(year), month: Month.no(month1), day: parseInt(day1) },
        to: { type: 'date', year: parseInt(year), month: Month.no(month2), day: parseInt(day2) },
      }
    }

    // #746: 22-26 June 2015, 29 June-1 July 2011
    if (m = value.match(re.d_M_d_M_y)) {
      const { day1, month1, day2, month2, year } = m.groups

      return {
        type: 'interval',
        from: { type: 'date', year: parseInt(year), month: Month.no(month1 || month2), day: parseInt(day1) },
        to: { type: 'date', year: parseInt(year), month: Month.no(month2), day: parseInt(day2) },
      }
    }

    // July-October 1985
    if (m = english.match(re.M_M_y)) {
      const { month1, month2, year } = m.groups

      return {
        type: 'interval',
        from: { type: 'date', year: parseInt(year), month: Month.no(month1) },
        to: { type: 'date', year: parseInt(year), month: Month.no(month2) },
      }
    }

    const time_doubt: ParsedDate = {}
    const date_only = value
      .replace(re.withtime, (...match) => {
        const { hour, minute, seconds, offsetH, offsetM, doubt } = match.pop()
        if (hour) time_doubt.hour = parseInt(hour)
        if (minute) time_doubt.minute = parseInt(minute)
        if (seconds) time_doubt.seconds = parseFloat(seconds)
        if (offsetH) time_doubt.offset = 60 * parseInt(offsetH)
        if (offsetM) time_doubt.offset += (offsetH[0] === '-' ? -1 : 1) * parseInt(offsetM)
        if (doubt && doubt.indexOf('~') >= 0) time_doubt.approximate = true
        if (doubt && doubt.indexOf('?') >= 0) time_doubt.uncertain = true
        return ''
      })
      .replace(/\s+/g, ' ')

    // these assume a sensible y/m/d format by default. There's no sane way to guess between y/d/m and y/m/d, and y/d/m is
    // just wrong. https://en.wikipedia.org/wiki/Date_format_by_country
    if (m = value.match(re.y_d_m) || date_only.match(re.d_m_y) || date_only.match(re.m_y) || date_only.match(re.y_m)) {
      const { year, month, day } = m.groups
      const parsed = swap_day_month({
        type: 'date',
        year: parseInt(year),
        month: parseInt(month),
        day: day && parseInt(day),
        ...time_doubt,
      }, true)

      // if (!month && !day) return { type: 'date', year, ...time_doubt }
      if (!day && has_valid_month($date = { type: 'date', year: parsed.year, month: parsed.month })) return Season.seasonize({ ...$date, ...time_doubt })
      if (is_valid_date(parsed)) return parsed
    }

    // https://github.com/retorquere/zotero-better-bibtex/issues/1112
    if (m = date_only.match(re.pubmed)) {
      const { day, month, year } = m.groups
      const parsed = swap_day_month({
        type: 'date',
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        ...time_doubt,
      })

      if (is_valid_date(parsed)) return parsed
    }

    if (m = date_only.match(re.y)) {
      const { year } = m.groups
      return { type: 'date', year: parseInt(year), ...time_doubt }
    }

    if ($date = this.parseEDTF(value, english)) return $date

    // https://github.com/retorquere/zotero-better-bibtex/issues/868
    if (m = english.match(re.y_M_d)) {
      const { year, month, day } = m.groups
      try {
        const edtf = normalize_edtf(this.edtf(edtfy(`${day || ''} ${month} ${year}`.trim())))
        if (edtf) return edtf
      }
      catch {
        // dump(`edtf error: ${err}\n`)
      }
    }

    if (range) {
      for (const sep of ['--', '-', '/', '_', '\u2013']) {
        const split = value.split(sep)
        if (split.length === 2) {
          let dates = 0

          const from = this.parse(split[0], { reparse, range: false })
          switch (from.type) {
            case 'date':
            case 'season':
              dates++
              break
            case 'open':
              break
            default:
              continue
          }

          const to = this.parse(split[1], { reparse, range: false })
          switch (to.type) {
            case 'date':
            case 'season':
              dates++
              break
            case 'open':
              break
            default:
              continue
          }

          if (dates) return { type: 'interval', from, to }
        }
      }
    }

    return { type: 'verbatim', verbatim: value }
  }

  parseEDTF(value: string, english: string): ParsedDate {
    // 2378 + 2275
    let date = value

    const m = date.match(re.edtf)
    if (m) {
      let { year, month, day, time, tz } = m.groups
      year = year.padStart(4, '0')
      month = month.padStart(2, '0')
      day = day.padStart(2, '0')
      tz = (tz || '').replace(/\s/g, '')
      date = `${year}-${month}-${day}T${time}${tz}`
    }

    try {
      // https://github.com/inukshuk/edtf.js/issues/5
      const edtf = normalize_edtf(this.edtf(upgrade_edtf(date.replace(/_|--/, '/'))))
      if (edtf) return edtf
    }
    catch {
      // dump(`edtf (upgrade) error: ${err}\n`)
    }

    try {
      const edtf = normalize_edtf(this.edtf(edtfy(english)))
      if (edtf) return edtf
    }
    catch {
      // dump(`parseEDTF (edtfy) error: ${err}\n`)
    }

    return null
  }
}

class NOTZParser extends DateParser {
  edtf(date: string): any {
    return EDTFnotz(date)
  }
}

const parser = {
  withtz: new DateParser,
  notz: new NOTZParser,
}

export function parse(date: string, tz = true): ParsedDate {
  return tz ? parser.withtz.parse(date) : parser.notz.parse(date)
}

function testEDTF(value: string): boolean {
  try {
    return (EDTF(value, { level: 1 }) as boolean)
  }
  catch {
    return false
  }
}

export function isEDTF(value: string, minuteLevelPrecision = false): boolean {
  value = upgrade_edtf(value)

  return testEDTF(value) || (minuteLevelPrecision && testEDTF(`${value}:00`))
}

export function dateToISO(date: ParsedDate): string {
  if (date.type === 'interval') return `${dateToISO(date.from)}/${dateToISO(date.to)}`.replace(/^[/]$/, '')

  if (typeof date.year !== 'number') return ''

  let iso = `${date.year}`.padStart(4, '0')

  if (typeof date.month === 'number') {
    const month = `${date.month}`.padStart(2, '0')
    iso += `-${month}`
    if (date.day) {
      const day = `${date.day}`.padStart(2, '0')
      iso += `-${day}`
    }
  }

  return iso
}

export function strToISO(str: string): string {
  return dateToISO(parse(str))
}
