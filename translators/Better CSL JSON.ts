declare const Translator: ITranslator

import { CSLExporter as Exporter } from './csl/csl.ts'

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

Exporter.date2CSL = date => {
  switch (date.type) {
    case 'date':
      return {
        'date-parts': [ date2csl(date) ],
        circa: (date.approximate || date.uncertain) ? true : undefined,
      }

    case 'interval':
      return {
        'date-parts': [ date2csl(date.from), date2csl(date.to) ],
        circa: (date.from.approximate || date.from.uncertain || date.to.approximate || date.to.uncertain) ? true : undefined,
      }

    case 'verbatim':
      return { literal: date.verbatim }

    case 'season':
      return {
        'date-parts': [ [ date.year ] ],
        season: date.season,
        circa: (date.approximate || date.uncertain) ? true : undefined,
      }

    default:
      throw new Error(`Unexpected date type ${JSON.stringify(date)}`)
  }
}

Exporter.serialize = csl => JSON.stringify(csl)

Exporter.flush = items => `[\n${(items.map(item => `  ${item}`)).join(',\n')}\n]\n`

Translator.doExport = () => Exporter.doExport()
