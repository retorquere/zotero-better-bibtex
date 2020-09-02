import EDTF = require('edtf')
import edtfy = require('edtfy')

// import escapeStringRegexp = require('escape-string-regexp')

import * as months from '../gen/dateparser-months.json'
const months_re = new RegExp(Object.keys(months).sort((a, b) => b.length - a.length).join('|'), 'i')

/*
regex = {
  My: new RegExp('^(' + months.english.join('|') + ')\\s([0-9]{3,})$', 'i'),
  Mdy: new RegExp('^(' + months.english.join('|') + ')\\s([0-9]{1,2})\\s*,\\s*([0-9]{3,})$', 'i'),
  dMy: new RegExp('^([0-9]{1,2})\\.?\\s+(' + months.english.join('|') + ')\\s+([0-9]{3,})$', 'i'),
}
*/

const SPRING = 21
const WINTER = 24

function seasonize(date) {
  if (date.type === 'date' && typeof date.month === 'number' && date.month >= SPRING && date.month <= WINTER && !date.day) {
    date.type = 'season'
    date.season = (date.month - SPRING) + 1
    delete date.month
  }
  return date
}

function doubt(date, state) {
  if (state.uncertain) date.uncertain = true
  if (state.approximate) date.approximate = true
  return date
}

function normalize_edtf(date) {
  let year, month, day

  switch (date.type) {
    case 'Date':
      [ year, month, day ] = date.values
      if (typeof month === 'number') month += 1
      return doubt({ type: 'date', year, month, day}, {approximate: date.approximate || date.unspecified, uncertain: date.uncertain })

    case 'Interval':
      // tslint:disable-next-line:no-magic-numbers
      if (date.values.length !== 2) throw new Error(JSON.stringify(date))
      const from = date.values[0] ? normalize_edtf(date.values[0]) : { type: 'open' }
      const to = date.values[1] ? normalize_edtf(date.values[1]) : { type: 'open' }
      return { type: 'interval', from, to }

    case 'Season':
      [ year, month ] = date.values
      if (month < SPRING || month > WINTER) throw new Error(`Unexpected season ${month}`)
      return seasonize({ type: 'date', year, month })

    case 'List':
      return { type: 'list', dates: date.values.map(normalize_edtf) }

    default:
      throw new Error(JSON.stringify(date))
  }
}

function upgrade_edtf(date) {
  return date
    .replace(/unknown/g, '')
    .replace(/u/g, 'X')
    .replace(/(\?~)|(~\?)/g, '%')
    .replace(/open/g, '')
    .replace(/\.\./g, '')
    .replace(/y/g, 'Y')
}

function is_valid_month(month, allowseason) {
  if (month >= 1 && month <= 12) return true // tslint:disable-line:no-magic-numbers
  if (allowseason && month >= 21 && month <= 24) return true // tslint:disable-line:no-magic-numbers

  return false
}

// swap day/month for our American friends
function swap_day_month(day, month, localeDateOrder) {
  if (!day) day = undefined
  if (day && localeDateOrder === 'mdy' && is_valid_month(day, false)) {
    return [month, day]
  } else if (day && is_valid_month(day, false) && !is_valid_month(month, false)) {
    return [month, day]
  }
  return [day, month]
}

function stripTime(date) {
  return date.replace(/(\s+|T)[0-9]{2}:[0-9]{2}(:[0-9]{2}(Z|\+[0-9]{2}:?[0-9]{2})?)?$/, '')
}

export function parse(value: string, localeDateOrder: string, as_range_part: boolean = false) {
  value = (value || '').trim()

  let parsed, m

  if (value === 'today') {
    const now = new Date
    return { type: 'date', year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  }

  if (as_range_part && value === '') return { type: 'open' }

  // https://forums.zotero.org/discussion/73729/name-and-year-import-issues-with-new-nasa-ads#latest
  if (m = (/^(-?[0-9]+)-00-00$/.exec(value) || /^(-?[0-9]+)\/00\/00$/.exec(value) || /^(-?[0-9]+-[0-9]+)-00$/.exec(value))) return parse(m[1], localeDateOrder, as_range_part)

  // https://github.com/retorquere/zotero-better-bibtex/issues/1513
  // tslint:disable-next-line:no-magic-numbers
  if ((m = (/^([0-9]+) (de )?([a-z]+) (de )?([0-9]+)$/i).exec(value)) && (m[2] || m[4]) && (months[m[3].toLowerCase()])) return parse(`${m[1]} ${m[3]} ${m[5]}`, localeDateOrder, as_range_part)

  // '30-Mar-2020'
  if (!as_range_part && (m = (/^([0-9]+)-([a-z]+)-([0-9]+)$/i).exec(value))) {
    let [ , day, month, year ] = m
    if (day > 31 && year < 31) [ day, year ] = [ year, day ] // tslint:disable-line:no-magic-numbers
    const date = parse(`${month} ${day} ${year}`, localeDateOrder, false)
    if (date.type === 'date') return date
  }

  // '[origdate] date'
  if (!as_range_part && (m = /^\[(.+)\]\s*(.+)$/.exec(value))) {
    const [ , _orig, _date ] = m
    const date = parse(_date, localeDateOrder, false)
    const orig = parse(_orig, localeDateOrder, false)
    if (date.type === 'date' && orig.type === 'date') return {...date, ...{ orig } }
  }

  // 'date [origdate]'
  if (!as_range_part && (m = /^(.+)\s*\[(.+)\]$/.exec(value))) {
    const [ , _date, _orig ] = m
    const date = parse(_date, localeDateOrder, false)
    const orig = parse(_orig, localeDateOrder, false)
    if (date.type === 'date' && orig.type === 'date') return {...date, ...{ orig } }
  }

  // '[origdate]'
  if (!as_range_part && (m = /^\[(.+)\]$/.exec(value))) {
    const [ , _orig ] = m
    const orig = parse(_orig, localeDateOrder, false)
    if (orig.type === 'date') return { ...{ orig } }
  }

  // 747 'jan 20-22 1977'
  if (!as_range_part && (m = /^([a-zA-Z]+)\s+([0-9]+)(?:--|-|–)([0-9]+)[, ]\s*([0-9]+)$/.exec(value))) {
    const [ , month, day1, day2, year ] = m

    const from = parse(`${month} ${day1} ${year}`, localeDateOrder, false)
    const to = parse(`${month} ${day2} ${year}`, localeDateOrder, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // 747, January 30–February 3, 1989
  if (!as_range_part && (m = /^([a-zA-Z]+\s+[0-9]+)(?:--|-|–)([a-zA-Z]+\s+[0-9]+)[, ]\s*([0-9]+)$/.exec(value))) {
    const [ , date1, date2, year ] = m

    const from = parse(`${date1} ${year}`, localeDateOrder, false)
    const to = parse(`${date2} ${year}`, localeDateOrder, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // 746, 22-26 June 2015, 29 June-1 July 2011
  if (!as_range_part && (m = /^([0-9]+)\s*([a-zA-Z]+)?\s*(?:--|-|–)\s*([0-9]+)\s+([a-zA-Z]+)\s+([0-9]+)$/.exec(value))) {
    const [ , day1, month1, day2, month2, year ] = m

    const from = parse(`${month1 || month2} ${day1} ${year}`, localeDateOrder, false)
    const to = parse(`${month2} ${day2} ${year}`, localeDateOrder, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // July-October 1985
  if (!as_range_part && (m = (/^([a-z]+)(?:--|-|–)([a-z]+)(?:--|-|–|\s+)([0-9]+)$/i).exec(value))) {
    const [ , month1, month2, year ] = m

    const from = parse(`${month1} ${year}`, localeDateOrder, false)
    const to = parse(`${month2} ${year}`, localeDateOrder, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  const state = {approximate: false, uncertain: false}
  const exactish = stripTime(value.replace(/[~?]+$/, match => {
    state.approximate = match.indexOf('~') >= 0
    state.uncertain = match.indexOf('?') >= 0
    return ''
  }).replace(/\s+/g, ' '))

  // these assume a sensible d/m/y format by default. There's no sane way to guess between m/d/y and d/m/y, and m/d/y is
  // just wrong. https://en.wikipedia.org/wiki/Date_format_by_country
  if (m = /^(-?[0-9]{3,})([-\s\/\.])([0-9]{1,2})(\2([0-9]{1,2}))?$/.exec(exactish)) {
    const [ , _year, , _month, , _day ] = m
    const year = parseInt(_year)
    const [day, month] = swap_day_month(parseInt(_day), parseInt(_month), 'ymd')

    if (!month && !day) return seasonize(doubt({ type: 'date', year }, state))
    if (is_valid_month(month, !day) && !day) return seasonize(doubt({ type: 'date', year, month }, state))
    if (is_valid_month(month, !day)) return seasonize(doubt({ type: 'date', year, month, day }, state))
  }

  // https://github.com/retorquere/zotero-better-bibtex/issues/1112
  if (m = /^([0-9]{1,2})\s+([0-9]{1,2})\s*,\s*([0-9]{4,})$/.exec(exactish)) {
    const [ , _day, _month, _year ] = m
    const year = parseInt(_year)
    const [day, month] = swap_day_month(parseInt(_day), parseInt(_month), localeDateOrder)

    if (!month && !day) return seasonize(doubt({ type: 'date', year }, state))
    if (is_valid_month(month, !day) && !day) return seasonize(doubt({ type: 'date', year, month }, state))
    if (is_valid_month(month, false)) return seasonize(doubt({ type: 'date', year, month, day }, state))
  }

  if (m = /^([0-9]{1,2})([-\s\/\.])([0-9]{1,2})(\2([0-9]{3,}))$/.exec(exactish)) {
    const [ , _day, , _month, , _year ] = m
    const year = parseInt(_year)
    const [day, month] = swap_day_month(parseInt(_day), parseInt(_month), localeDateOrder)

    if (!month && !day) return seasonize(doubt({ type: 'date', year }, state))
    if (is_valid_month(month, !day) && !day) return seasonize(doubt({ type: 'date', year, month }, state))
    if (is_valid_month(month, false)) return seasonize(doubt({ type: 'date', year, month, day }, state))
  }

  if (m = /^([0-9]{1,2})[-\s\/\.]([0-9]{3,})$/.exec(exactish)) {
    const [ , _month, _year ] = m
    const month = parseInt(_month)
    const year = parseInt(_year)

    if (!month) return seasonize(doubt({ type: 'date', year }, state))
    if (is_valid_month(month, false)) return seasonize(doubt({ type: 'date', year, month }, state))
  }

  if (m = /^([0-9]{3,})[-\s\/\.]([0-9]{1,2})$/.exec(exactish)) {
    const [ , _year, _month ] = m
    const year = parseInt(_year)
    const month = parseInt(_month)

    if (!month) return seasonize(doubt({ type: 'date', year }, state))
    if (is_valid_month(month, false)) return seasonize(doubt({ type: 'date', year, month }, state))
  }

  if (exactish.match(/^-?[0-9]+$/)) {
    return doubt({ type: 'date', year: parseInt(exactish) }, state)
  }

  try {
    // https://github.com/inukshuk/edtf.js/issues/5
    parsed = normalize_edtf(EDTF.parse(upgrade_edtf(stripTime(value.replace(/_|--/, '/')))))
  } catch (err) {
    parsed = null
  }

  if (!parsed) {
    try {
      parsed = normalize_edtf(EDTF.parse(edtfy(value
        .normalize('NFC')
        .replace(/\. /, ' ') // 8. july 2011
        .replace(months_re, _ => months[_.toLowerCase()] || _)
      )))
    } catch (err) {
      parsed = null
    }
  }

  // https://github.com/retorquere/zotero-better-bibtex/issues/868
  if (!parsed) {
    if (m = /^([0-9]+)\s([^0-9]+)(?:\s+([0-9]+))?$/.exec(value.normalize('NFC').replace(months_re, _ => months[_.toLowerCase()] || _))) {
      const [ , year, month, day ] = m
      if (months[month]) {
        try {
          parsed = normalize_edtf(EDTF.parse(edtfy(`${day || ''} ${month} ${year}`.trim())))
        } catch (err) {
          parsed = null
        }
      }
    }
  }

  if (!as_range_part && !parsed) {
    for (const sep of ['--', '-', '/', '_', '–']) {
      const split = value.split(sep)
      if (split.length === 2) {
        const from = parse(split[0], localeDateOrder, false)
        if (from.type !== 'date' && from.type !== 'season') continue
        const to = parse(split[1], localeDateOrder, false)
        if (to.type !== 'date' && to.type !== 'season') continue
        return { type: 'interval', from, to }
      }
    }
  }

  return parsed || { type: 'verbatim', verbatim: value }
}

function testEDTF(value) {
  try {
    return EDTF.parse(value, { level: 1 })
  } catch (err) {
    return false
  }
}

export function isEDTF(value, minuteLevelPrecision = false) {
  value = upgrade_edtf(value)

  return testEDTF(value) || (minuteLevelPrecision && testEDTF(`${value}:00`))
}

export function strToISO(str, localeDateOrder: string) {
  let date = parse(str, localeDateOrder)
  if (date.type === 'interval') date = date.from

  if (typeof date.year !== 'number') return ''

  let iso = `${date.year}`.padStart(4, '0') // tslint:disable-line:no-magic-numbers

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
