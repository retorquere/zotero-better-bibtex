import { ITranslator } from '../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import Exporter = require('./csl/csl.ts')

function date2csl(date) {
  switch (date.type) {
    case 'open':
      return [0]

    case 'date':
      const csl = [date.year > 0 ? date.year : date.year - 1]
      if (date.month) {
        csl.push(date.month)
        if (date.day) {
          csl.push(date.day)
        }
      }
      return csl

    case 'season':
      // https://github.com/retorquere/zotero-better-bibtex/issues/860
      return [ date.year > 0 ? date.year : date.year - 1, date.season + 12 ] // tslint:disable-line:no-magic-numbers

    default:
      throw new Error(`Expected date or open, got ${date.type}`)
  }
}

Exporter.parseDate = date => {
  const parsed = Zotero.BetterBibTeX.parseDate(date)

  switch (parsed.type) {
    case 'date':
      return {
        'date-parts': [ date2csl(parsed) ],
        circa: (parsed.approximate || parsed.uncertain) ? true : undefined,
      }

    case 'interval':
      return {
        'date-parts': [ date2csl(parsed.from), date2csl(parsed.to) ],
        circa: (parsed.from.approximate || parsed.from.uncertain || parsed.to.approximate || parsed.to.uncertain) ? true : undefined,
      }

    case 'verbatim':
      return { literal: parsed.verbatim }

    case 'season':
      return {
        'date-parts': [ [ parsed.year ] ],
        season: parsed.season,
        circa: (parsed.approximate || parsed.uncertain) ? true : undefined,
      }

    default:
      throw new Error(`Unexpected date type ${JSON.stringify(parsed)}`)
  }
}

Exporter.serialize = csl => JSON.stringify(csl)

Exporter.flush = items => `[\n${(items.map(item => `  ${item}`)).join(',\n')}\n]\n`

Translator.doExport = () => Exporter.doExport()
