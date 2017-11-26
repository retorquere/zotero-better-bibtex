import EDTF = require('edtf')
import edtfy = require('edtfy')
import debug = require('./debug.ts')
import Prefs = require('./prefs.ts')

// import escapeStringRegexp = require('escape-string-regexp')

const months = require('../gen/dateparser-data.json')
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

//    when 'Set'
//      if date.values.length == 1
//        return { type: 'set', orig: { type: 'date', year: date.values[0].values[0] } }

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
    .replace(/unknown/g, '*')
    .replace(/u/g, 'X')
    .replace(/(\?~)|(~\?)/g, '%')
    .replace(/open/g, '')
    .replace(/\.\./g, '')
    .replace(/y/g, 'Y')
}

function parse(value, descend = true) {
  value = value.trim()

  const december = 12
  let parsed, m

  debug('dateparser: parsing', value)

  if (descend && (m = /^\[(.+)\]\s*(.+)$/.exec(value))) {
    const [ , _orig, _year ] = m
    const year = parse(_year, false)
    const orig = parse(_orig, false)
    if (year.type === 'date' && orig.type === 'date') return {...year, ...{ orig } }
  }

  if (descend && (m = /^(-?[0-9]+)\s*\[(-?[0-9]+)\]$/.exec(value))) {
    const [ , _year, _orig ] = m
    const year = parse(_year, false)
    const orig = parse(_orig, false)
    if (year.type === 'date' && orig.type === 'date') return {...year, ...{ orig } }
  }

  if (descend && (m = /^\[(-?[0-9]+)\]$/.exec(value))) {
    const [ , _orig ] = m
    const orig = parse(_orig, false)
    if (orig.type === 'date') return { ...{ orig } }
  }

  // 747
  if (descend && (m = /^([a-zA-Z]+)\s+([0-9]+)(?:--|-|–)([0-9]+)[, ]\s*([0-9]+)$/.exec(value))) {
    const [ , month, day1, day2, year ] = m

    const from = parse(`${month} ${day1} ${year}`, false)
    const to = parse(`${month} ${day2} ${year}`, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // 747, January 30–February 3, 1989
  if (descend && (m = /^([a-zA-Z]+\s+[0-9]+)(?:--|-|–)([a-zA-Z]+\s+[0-9]+)[, ]\s*([0-9]+)$/.exec(value))) {
    const [ , date1, date2, year ] = m

    const from = parse(`${date1} ${year}`, false)
    const to = parse(`${date2} ${year}`, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  // 746
  if (descend && (m = /^([0-9]+)(?:--|-|–)([0-9]+)\s+([a-zA-Z]+)\s+([0-9]+)$/.exec(value))) {
    const [ , day1, day2, month, year ] = m

    const from = parse(`${month} ${day1} ${year}`, false)
    const to = parse(`${month} ${day2} ${year}`, false)

    if (from.type === 'date' && to.type === 'date') return { type: 'interval', from, to }
  }

  const state = {approximate: false, uncertain: false}
  const exactish = value.replace(/[~?]+$/, match => {
    state.approximate = match.indexOf('~') >= 0
    state.uncertain = match.indexOf('?') >= 0
    return ''
  })

  // these assume a sensible d/m/y format by default. There's no sane way to guess between m/d/y and d/m/y, and m/d/y is
  // just wrong. https://en.wikipedia.org/wiki/Date_format_by_country
  if (m = /^(-?[0-9]{3,})([-\/\.])([0-9]{1,2})(\2([0-9]{1,2}))?$/.exec(exactish)) {
    const [ , _year, , _month, , _day ] = m
    const year = parseInt(_year)
    let month = parseInt(_month)
    let day = _day ? parseInt(_day) : undefined
    if (day && month > december && day < december) [day, month] = [month, day]
    debug('parseDate:', value, exactish, state)
    return seasonize(doubt({ type: 'date', year, month, day }, state))
  }

  if (m = /^([0-9]{1,2})([-\/\.])([0-9]{1,2})(\2([0-9]{3,}))$/.exec(exactish)) {
    const [ , _day, , _month, , _year ] = m
    const year = parseInt(_year)
    let month = parseInt(_month)
    let day = parseInt(_day)
    if (day && month > december && day < december) [day, month] = [month, day]
    return seasonize(doubt({ type: 'date', year, month, day }, state))
  }

  if (exactish.match(/^-?[0-9]+$/)) {
    return doubt({ type: 'date', year: parseInt(exactish) }, state)
  }

  try {
    // https://github.com/inukshuk/edtf.js/issues/5
    parsed = normalize_edtf(EDTF.parse(upgrade_edtf(value
      .replace(/_|--/, '/')
      .replace(/(\s+|T)[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|\+[0-9]{2}:?[0-9]{2})?$/, '')
    )))
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

  debug('parseDate:', value, parsed)

  return parsed || { type: 'verbatim', verbatim: value }

/*
  if (value.trim() === '') return {type: 'open'}

  for (const sep of ['--', '-', '/', '_', '–']) {
    if ((m = value.split(sep)).length === 2) { // potential range
      const [ _from, _to ] = m
      if ((_from.length > 2 || (sep === '/' && _from.length === 0)) && (_to.length > 2 || (sep === '/' && _to.length === 0))) {
        const from = parse(_from) // tslint:disable-line:no-magic-numbers
        const to = parse(_to)   // tslint:disable-line:no-magic-numbers
        if (['date', 'open'].includes(from.type) && ['date', 'open'].includes(to.type)) return { type: 'interval', from, to }
      }
    }
  }

  const cleaned = value.normalize('NFC').replace(months_re, (_ => months[_.toLowerCase()]))
  debug('dateparser:', value, 'cleaned up to', cleaned)

  let approximate = false
  let uncertain = false
  const trimmed = cleaned.trim().replace(/(\s+|T)[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|\+[0-9]{2}:?[0-9]{2})?$/, '').toLowerCase().replace(/[~?]+$/, match => {
    approximate = match.indexOf('~') >= 0
    uncertain = match.indexOf('?') >= 0
    return ''
  })

//  if m = regex.dMy.exec(trimmed)
//    year = parseInt(m[3])
//    day = parseInt(m[1])
//    month = months.english.indexOf(m[2]) + 1
//    month += 8 if month > december
//    return { type: 'date', year, month, day }

//  if m = regex.Mdy.exec(trimmed)
//    year = parseInt(m[3])
//    day = parseInt(m[2])
//    month = months.english.indexOf(m[1]) + 1
//    month += 8 if month > december
//    return { type: 'date', year, month, day }

//  if m = regex.My.exec(trimmed)
//    year = parseInt(m[2])
//    month = months.english.indexOf(m[1]) + 1
//    month += 8 if month > december
//    return { type: 'date', year, month }

  if (m = /^(-?[0-9]{3,})-([0-9]{2})-([0-9]{2})T/.exec(trimmed)) {
    const [ , year, month, day ] = m
    return { type: 'date', year: parseInt(year), month: parseInt(month), day: parseInt(day), approximate, uncertain }
  }

  if (m = /^([0-9]{1,2})(?:[-\/\. ])([0-9]{1,2})(?:[-\/\. ])([0-9]{3,})$/.exec(trimmed)) {
    let [ , day, month, year ] = m
    // you can be detectably wrong though
    if (parseInt(month) > december && parseInt(day) < december) [day, month] = [month, day]
    return { type: 'date', year: parseInt(year), month: parseInt(month), day: parseInt(day), approximate, uncertain }
  }

  if (m = /^([0-9]{1,2})[-\/\.]([0-9]{3,})$/.exec(trimmed)) {
    const [ , month, year ] = m
    return { type: 'date', year: parseInt(year), month: parseInt(month), approximate, uncertain }
  }

  if (m = /^([0-9]{3,})[-\/\.]([0-9]{1,2})$/.exec(trimmed)) {
    const [ , _year, _month ] = m
    const year = parseInt(_year)
    const month = parseInt(_month)

    return seasonize({ type: 'date', year, month, approximate, uncertain })
  }

//  if m = /^(-?[0-9]{3,})([?~]*)$/.exec(trimmed)
//    return { type: 'date', year: parseInt(m[1]), approximate: m[2].indexOf('~') >=0, uncertain: m[2].indexOf('?') >= 0 }

  if (m = /^\[(-?[0-9]+)\]$/.exec(trimmed)) {
    // 704
    // return { type: 'date', orig: { type: 'date', year: parseInt(m[1]) } }
    return { type: 'verbatim', verbatim: value }
  }

  const parsed = parse_edtf(cleaned)
  return parsed || { type: 'verbatim', verbatim: value }
  */
}

function testEDTF(value) {
  try {
    const date = EDTF.parse(value)
    return date && (date.type !== 'Set' || !Prefs.get('dateOrigHack'))
  } catch (err) {
    return false
  }
}

export = {
  isEDTF(value, minuteLevelPrecision = false) {
    value = upgrade_edtf(value)

    return testEDTF(value) || (minuteLevelPrecision && testEDTF(`${value}:00`))
  },

  parse,
}
