/* eslint-disable no-case-declarations */
import EDTF = require('edtf')
import edtfy = require('edtfy')

// import escapeStringRegexp = require('escape-string-regexp')

import * as months from '../gen/dateparser-months.json'

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

const months_re = new RegExp(Object.keys(months).sort((a, b) => b.length - a.length).join('|'), 'i')

const Season = new class {
  private ranges = [
    [ 13, 14, 15, 16 ],
    [ 21, 22, 23, 24 ],
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
  let year, month, day, hour, minute, seconds

  switch (date.type) {
    case 'Date':
      [ year, month, day, hour, minute, seconds ] = date.values
      if (typeof month === 'number') month += 1
      return { type: 'date', year, month, day, hour, minute, seconds, offset: date.offset, approximate: date.approximate || date.unspecified, uncertain: date.uncertain }

    case 'Interval':
      if (date.values.length !== 2) throw new Error(JSON.stringify(date))
      const from: ParsedDate = date.values[0] ? normalize_edtf(date.values[0]) : { type: 'open' }
      const to: ParsedDate = date.values[1] ? normalize_edtf(date.values[1]) : { type: 'open' }
      return { type: 'interval', from, to }

    case 'Season':
      [ year, month ] = date.values
      if (typeof Season.fromMonth(month) !== 'number') throw new Error(`Unexpected season ${ month }`)
      return Season.seasonize({ type: 'date', year, month })

    case 'List':
      return { type: 'list', dates: date.values.map(normalize_edtf) }

    default:
      throw new Error(JSON.stringify(date))
  }
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
  const d = new Date(`${ date.year }-${ date.month || 1 }-${ date.day || 1 }`)
  return (d instanceof Date) && !isNaN(d as unknown as number)
}

// swap day/month for our American friends
function swap_day_month(day: number, month: number, fix_only = false): number[] {
  if (!day) return [ undefined, month ]

  if (!is_valid_month(month, false) && is_valid_month(day, false)) return [ month, day ]
  if (!fix_only && getLocaleDateOrder() === 'mdy' && is_valid_month(day, false)) return [ month, day ]
  return [ day, month ]
}

export function parse(value: string): ParsedDate {
  return parseToDate(value, false)
}

function parseEDTF(value: string): ParsedDate {
  // 2378 + 2275
  let date = value

  let m: RegExpMatchArray
  if (m = /^(\d+)[^\d]+(\d+)[^\d]+(\d+)[^\d]+(\d{2}:\d{2}:\d{2}(?:[.]\d+)?)(.*)/.exec(date)) {
    const [ , year, month, day, time, tz ] = m
    date = `${ year.padStart(4, '0') }-${ month.padStart(2, '0') }-${ day.padStart(2, '0') }T${ time }${ (tz || '').replace(/\s/g, '') }`
  }

  try {
    // https://github.com/inukshuk/edtf.js/issues/5
    const edtf = normalize_edtf(EDTF.parse(upgrade_edtf(date.replace(/_|--/, '/'))))
    if (edtf) return edtf
  }
  catch {}

  try {
    const edtf = normalize_edtf(EDTF.parse(edtfy(date
      .normalize('NFC')
      .replace(/\. /, ' ') // 8. july 2011
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .replace(months_re, _ => months[_.toLowerCase()] || _)
    )))
    if (edtf) return edtf
  }
  catch {}

  return { verbatim: value }
}

function parseToDate(value: string, try_range = true): ParsedDate {
  value = (value || '').trim()
  let date: ParsedDate

  let m: RegExpMatchArray

  if (value === 'today') {
    const now = new Date
    return { type: 'date', year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  }

  if (value === '') return { type: 'open' }

  // if (value.match(/[T ]/) && !(date = parseEDTF(value)).verbatim) return date

  // https://forums.zotero.org/discussion/73729/name-and-year-import-issues-with-new-nasa-ads#latest
  if (m = (/^(-?[0-9]+)-00-00$/.exec(value) || /^(-?[0-9]+)\/00\/00$/.exec(value) || /^(-?[0-9]+-[0-9]+)-00$/.exec(value))) return parseToDate(m[1], true)

  // https://github.com/retorquere/zotero-better-bibtex/issues/1513
  if ((m = (/^([0-9]+) (de )?([a-z]+) (de )?([0-9]+)$/i).exec(value)) && (m[2] || m[4]) && (months[m[3].toLowerCase()])) return parseToDate(`${ m[1] } ${ m[3] } ${ m[5] }`, true)

  // '30-Mar-2020'
  if (m = (/^([0-9]+)-([a-z]+)-([0-9]+)$/i).exec(value)) {
    let [ , day, month, year ] = m
    if (parseInt(day) > 31 && parseInt(year) < 31) [ day, year ] = [ year, day ]
    date = parseToDate(`${ month } ${ day } ${ year }`, false)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (date.type === 'date') return date
  }

  // '[origdate] date'
  if (try_range && (m = /^\[(.+)\]\s*(.+)$/.exec(value))) {
    const [ , _orig, _date ] = m
    date = parseToDate(_date, false)
    const orig = parseToDate(_orig, false)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (date.type === 'date' && orig.type === 'date') return { ...date, ...{ orig }}
  }

  // 'date [origdate]'
  if (try_range && (m = /^(.+)\s*\[(.+)\]$/.exec(value))) {
    const [ , _date, _orig ] = m
    date = parseToDate(_date, false)
    const orig = parseToDate(_orig, false)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (date.type === 'date' && orig.type === 'date') return { ...date, ...{ orig }}
  }

  // '[origdate]'
  if (try_range && (m = /^\[(.+)\]$/.exec(value))) {
    const [ , _orig ] = m
    const orig = parseToDate(_orig, false)
    if (orig.type === 'date') return { ...{ orig }}
  }

  // 747 'jan 20-22 1977'
  if (try_range && (m = /^([a-zA-Z]+)\s+([0-9]+)(?:--|-|\u2013)([0-9]+)[, ]\s*([0-9]+)$/.exec(value))) {
    const [ , month, day1, day2, year ] = m

    const from = parseToDate(`${ month } ${ day1 } ${ year }`, false)
    const to = parseToDate(`${ month } ${ day2 } ${ year }`, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // 747, January 30–February 3, 1989
  if (try_range && (m = /^([a-zA-Z]+\s+[0-9]+)(?:--|-|\u2013)([a-zA-Z]+\s+[0-9]+)[, ]\s*([0-9]+)$/.exec(value))) {
    const [ , date1, date2, year ] = m

    const from = parseToDate(`${ date1 } ${ year }`, false)
    const to = parseToDate(`${ date2 } ${ year }`, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // 746, 22-26 June 2015, 29 June-1 July 2011
  if (try_range && (m = /^([0-9]+)\s*([a-zA-Z]+)?\s*(?:--|-|\u2013)\s*([0-9]+)\s+([a-zA-Z]+)\s+([0-9]+)$/.exec(value))) {
    const [ , day1, month1, day2, month2, year ] = m

    const from = parseToDate(`${ month1 || month2 } ${ day1 } ${ year }`, false)
    const to = parseToDate(`${ month2 } ${ day2 } ${ year }`, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // July-October 1985
  if (try_range && (m = (/^([a-z]+)(?:--|-|\u2013)([a-z]+)(?:--|-|\u2013|\s+)([0-9]+)$/i).exec(value))) {
    const [ , month1, month2, year ] = m

    const from = parseToDate(`${ month1 } ${ year }`, false)
    const to = parseToDate(`${ month2 } ${ year }`, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  const time_doubt: ParsedDate = {}
  const date_only = value
    .replace(/(?:(?:\s+|T)(\d{2}):(\d{2})(?::(\d{2}(?:[.]\d+)?)\s*(?:Z|([+-]\d{2}):?(\d{2})?)?)?)?([~?]*)$/, (match, H, M, S, offsetH, offsetM, doubt) => {
      time_doubt.hour = parseInt(H)
      time_doubt.minute = parseInt(M)
      if (S) time_doubt.seconds = parseFloat(S)
      if (offsetH) time_doubt.offset = 60 * parseInt(offsetH)
      if (offsetM) time_doubt.offset += (offsetH[0] === '-' ? -1 : 1) * parseInt(offsetM)
      if (doubt && doubt.indexOf('~') >= 0) time_doubt.approximate = true
      if (doubt && doubt.indexOf('?') >= 0) time_doubt.uncertain = true
      return ''
    })
    .replace(/\s+/g, ' ')

  // these assume a sensible y/m/d format by default. There's no sane way to guess between y/d/m and y/m/d, and y/d/m is
  // just wrong. https://en.wikipedia.org/wiki/Date_format_by_country
  if (m = /^(-?[0-9]{3,})([-\s/.])([0-9]{1,2})(\2([0-9]{1,2}))?$/.exec(date_only)) {
    const [ , _year, , _month, , _day ] = m
    const year = parseInt(_year)
    const [ day, month ] = swap_day_month(parseInt(_day), parseInt(_month), true)

    // if (!month && !day) return { type: 'date', year, ...time_doubt }
    if (!day && has_valid_month(date = { type: 'date', year, month })) return Season.seasonize({ ...date, ...time_doubt })
    if (is_valid_date(date = { type: 'date', year, month, day })) return { ...date, ...time_doubt }
  }

  // https://github.com/retorquere/zotero-better-bibtex/issues/1112
  if (m = /^([0-9]{1,2})\s+([0-9]{1,2})\s*,\s*([0-9]{4,})$/.exec(date_only)) {
    const [ , _day, _month, _year ] = m
    const year = parseInt(_year)
    const [ day, month ] = swap_day_month(parseInt(_day), parseInt(_month))

    if (!month && !day) return { type: 'date', year, ...time_doubt }
    if (!day && has_valid_month(date = { type: 'date', year, month })) return Season.seasonize({ ...date, ...time_doubt })
    if (is_valid_date(date = { type: 'date', year, month, day })) return { ...date, ...time_doubt }
  }

  if (m = /^([0-9]{1,2})([-\s/.])([0-9]{1,2})(\2([0-9]{3,}))$/.exec(date_only)) {
    const [ , _day, , _month, , _year ] = m
    const year = parseInt(_year)
    const [ day, month ] = swap_day_month(parseInt(_day), parseInt(_month))

    if (!month && !day) return { type: 'date', year, ...time_doubt }
    if (!day && has_valid_month(date = { type: 'date', year, month })) return Season.seasonize({ ...date, ...time_doubt })
    if (is_valid_date(date = { type: 'date', year, month, day })) return { ...date, ...time_doubt }
  }

  if (m = /^([0-9]{1,2})[-\s/.]([0-9]{3,})$/.exec(date_only)) {
    const [ , _month, _year ] = m
    const month = parseInt(_month)
    const year = parseInt(_year)

    if (!month) return { type: 'date', year, ...time_doubt }
    if (has_valid_month(date = { type: 'date', year, month })) return Season.seasonize({ ...date, ...time_doubt })
  }

  if (m = /^([0-9]{3,})[-\s/.]([0-9]{1,2})$/.exec(date_only)) {
    const [ , _year, _month ] = m
    const year = parseInt(_year)
    const month = parseInt(_month)

    if (!month) return { type: 'date', year, ...time_doubt }
    if (has_valid_month(date = { type: 'date', year, month })) return Season.seasonize({ ...date, ...time_doubt })
  }

  if (date_only.match(/^-?[0-9]{3,}$/)) {
    return { type: 'date', year: parseInt(date_only), ...time_doubt }
  }

  if (!(date = parseEDTF(value)).verbatim) return date

  // https://github.com/retorquere/zotero-better-bibtex/issues/868
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (m = /^([0-9]{3,})\s([^0-9]+)(?:\s+([0-9]+))?$/.exec(value.normalize('NFC').replace(months_re, _ => months[_.toLowerCase()] || _))) {
    const [ , year, month, day ] = m
    if (months[month]) {
      try {
        const edtf = normalize_edtf(EDTF.parse(edtfy(`${ day || '' } ${ month } ${ year }`.trim())))
        if (edtf) return edtf
      }
      catch {}
    }
  }

  if (try_range) { // try ranges
    for (const sep of [ '--', '-', '/', '_', '\u2013' ]) {
      const split = value.split(sep)
      if (split.length === 2) {
        const from = parseToDate(split[0], false)
        if (from.type !== 'date' && from.type !== 'season') continue
        const to = parseToDate(split[1], false)
        if (to.type !== 'date' && to.type !== 'season') continue
        return { type: 'interval', from, to }
      }
    }
  }

  return { type: 'verbatim', verbatim: value }
}

function testEDTF(value: string): boolean {
  try {
    return (EDTF.parse(value, { level: 1 }) as boolean)
  }
  catch {
    return false
  }
}

export function isEDTF(value: string, minuteLevelPrecision = false): boolean {
  value = upgrade_edtf(value)

  return testEDTF(value) || (minuteLevelPrecision && testEDTF(`${ value }:00`))
}

export function strToISO(str: string): string {
  return dateToISO(parse(str))
}

export function dateToISO(date: ParsedDate): string {
  if (date.type === 'interval') return `${ dateToISO(date.from) }/${ dateToISO(date.to) }`.replace(/^[/]$/, '')

  if (typeof date.year !== 'number') return ''

  let iso = `${ date.year }`.padStart(4, '0')

  if (typeof date.month === 'number') {
    const month = `${ date.month }`.padStart(2, '0')
    iso += `-${ month }`
    if (date.day) {
      const day = `${ date.day }`.padStart(2, '0')
      iso += `-${ day }`
    }
  }

  return iso
}
