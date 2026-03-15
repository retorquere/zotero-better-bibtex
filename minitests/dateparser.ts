#!/usr/bin/env bun

function date2csl(date) {
  let csl
  switch (date.type) {
    case 'open':
      return [0]

    case 'date':
      csl = [`${ date.year > 0 ? date.year : date.year - 1 }`]
      if (date.month) {
        csl.push(date.month)
        if (date.day) {
          csl.push(date.day)
        }
      }
      return csl // eslint-disable-line @typescript-eslint/no-unsafe-return

    case 'season':
      // https://github.com/retorquere/zotero-better-bibtex/issues/860
      return [ `${ date.year > 0 ? date.year : date.year - 1 }`, date.season + 12 ]

    default:
      throw new Error(`Expected date or open, got ${ date.type }`)
  }
}

import { parse, strToISO } from '../content/dateparser'
const value = "1973/74"
console.log(value)
console.log('parse: +tz', parse(value, true))
// console.log('parse: -tz', parse(value, false))
