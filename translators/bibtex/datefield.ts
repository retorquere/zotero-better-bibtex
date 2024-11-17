/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { ParsedDate } from '../../content/dateparser'
import { Translation } from '../lib/translator'
import type { Translators } from '../../typings/translators'

function pad(v: string, padding: string): string {
  if (v.length >= padding.length) return v
  return (padding + v).slice(-padding.length)
}

function year(y) {
  if (Math.abs(y) > 999) {
    return `${ y }`
  }
  else {
    return (y < 0 ? '-' : '') + (`000${ Math.abs(y) }`).slice(-4)
  }
}

function format(date, translation: Translation): string {
  let formatted

  if (typeof date.year === 'number' && date.month && date.day) {
    formatted = `${ year(date.year) }-${ pad(date.month, '00') }-${ pad(date.day, '00') }`
  }
  else if (typeof date.year === 'number' && (date.month || date.season)) {
    formatted = `${ year(date.year) }-${ pad((date.month || ((date.season as number) + 20)), '00') }`
  }
  else if (typeof date.year === 'number') {
    formatted = year(date.year)
  }
  else {
    formatted = ''
  }

  if (formatted && translation.BetterBibLaTeX && translation.collected.preferences.biblatexExtendedDateFormat) {
    if (date.uncertain) formatted += '?'
    if (date.approximate) formatted += '~'
  }

  return formatted
}

export function datefield(date: ParsedDate, field: Translators.BibTeX.Field, translation: Translation): Translators.BibTeX.Field {
  field = JSON.parse(JSON.stringify({ ...field, value: '', enc: 'literal' }))

  if (!date) return field
  if (date && !date.type && date.orig) return field
  if (!date.type) throw new Error(`Failed to parse ${ JSON.stringify(date) }`)

  if (date.type === 'verbatim') {
    field.name = field.verbatim || field.name

    if (date.verbatim === 'n.d.') {
      field.value = '<pre>\\bibstring{nodate}</pre>'
    }
    else {
      field.value = date.verbatim
    }
  }
  else if (date.type === 'date' || date.type === 'season') {
    field.value = format(date, translation)
  }
  else if (date.type === 'interval') {
    field.value = `${ format(date.from, translation) }/${ format(date.to, translation) }`
  }
  else if (date.year) {
    field.value = format(date, translation)
  }

  if (!field.value || !field.name) return field

  // well this is fairly dense... the date field is not an verbatim field, so the 'circa' symbol ('~') ought to mean a
  // NBSP... but some magic happens in that field (always with the magic, BibLaTeX...). But hey, if I insert an NBSP,
  // guess what that gets translated to!
  if (date.type !== 'verbatim' && typeof field.value == 'string') field.value = field.value.replace(/~/g, '\u00A0')

  return field
}
