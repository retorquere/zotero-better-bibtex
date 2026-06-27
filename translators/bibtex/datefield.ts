/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { RichDate } from '../../content/dateparser'
import { Translation } from '../lib/translator'
import type { Field } from './entry'
import { padInt } from '../../content/text'

function year(y) {
  return Math.abs(y) > 999 ? (y + '') : padInt(y, 4)
}

function format(date, translation: Translation): string {
  let formatted

  if (typeof date.year === 'number' && date.month && date.day) {
    formatted = `${year(date.year)}-${padInt(date.month, 2)}-${padInt(date.day, 2)}`
  }
  else if (typeof date.year === 'number' && (date.month || date.season)) {
    formatted = `${year(date.year)}-${padInt((date.month || ((date.season as number) + 20)), 2)}`
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

function isnumber(v) {
  if (typeof v === 'number') return true
  if (typeof v === 'string' && v.match(/^\d+$/)) return true
  return false
}

export function datefield(date: RichDate, field: Field, translation: Translation): Field {
  field = structuredClone({ ...field, value: '', enc: 'literal' })

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

  if (translation.BetterBibTeX && isnumber(field.value)) field.bare = true

  // well this is fairly dense... the date field is not an verbatim field, so the 'circa' symbol ('~') ought to mean a
  // NBSP... but some magic happens in that field (always with the magic, BibLaTeX...). But hey, if I insert an NBSP,
  // guess what that gets translated to!
  if (date.type !== 'verbatim' && typeof field.value == 'string') field.value = field.value.replace(/~/g, '\u00A0')

  return field
}
