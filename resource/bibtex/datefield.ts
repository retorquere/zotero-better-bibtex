import { ITranslator } from '../../gen/translator'
declare const Translator: ITranslator

import debug = require('../lib/debug.ts')

function pad(v, padding) {
  if (v.length >= padding.length) return v
  return (padding + v).slice(-padding.length)
}

function year(y) {
  // tslint:disable-next-line:no-magic-numbers
  if (Math.abs(y) > 999) {
    return `${y}`
  } else {
    // tslint:disable-next-line:no-magic-numbers
    return (y < 0 ? '-' : '-') + (`000${Math.abs(y)}`).slice(-4)
  }
}

function format(date) {
  let formatted

  if (date.year && date.month && date.day) {
    formatted = `${year(date.year)}-${pad(date.month, '00')}-${pad(date.day, '00')}`

  } else if (date.year && (date.month || date.season)) {
    // tslint:disable-next-line:no-magic-numbers
    formatted = `${year(date.year)}-${pad((date.month || (date.season + 20)), '00')}`

  } else if (date.year) {
    formatted = year(date.year)

  } else {
    formatted = ''

  }

  if (formatted && Translator.preferences.biblatexExtendedDateFormat) {
    if (date.uncertain) formatted += '?'
    if (date.approximate) formatted += '~'
  }

  return formatted
}

export = (date, formatted_field, verbatim_field) => {
  let field
  debug('formatting date', date)

  if (!date) return {}
  if (!date.type) throw new Error(`Failed to parse ${date}: ${JSON.stringify(date)}`)

  if (date.type === 'verbatim') {
    field = { name: verbatim_field, value: date.verbatim }

  } else if (date.type === 'date' || date.type === 'season') {
    field = { name: formatted_field, value: format(date) }

  } else if (date.type === 'interval') {
    field = { name: formatted_field, value: `${format(date.from)}/${format(date.to)}` }

  } else if (date.year) {
    field = { name: formatted_field, value: format(date) }

  } else {
    field = {}
  }

  if (!field.name || !field.value) return {}

  // well this is fairly dense... the date field is not an verbatim field, so the 'circa' symbol ('~') ought to mean a
  // NBSP... but some magic happens in that field (always with the magic, BibLaTeX...). But hey, if I insert an NBSP,
  // guess what that gets translated to!
  if (field.value) field.value = field.value.replace(/~/g, '\u00A0')

  return field
}
