import { Translation } from '../lib/translator'

import { ParsedDate } from '../../content/dateparser'
import { CSLExporter } from './csl'
import { Date as CSLDate, Data as CSLItem, LooseNumber } from 'csl-json'

function date2csl(date: ParsedDate): [LooseNumber, LooseNumber?, LooseNumber?] {
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
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-return
      return [ `${ date.year > 0 ? date.year : date.year - 1 }`, date.season + 12 ]

    default:
      throw new Error(`Expected date or open, got ${ date.type }`)
  }
}

class Exporter extends CSLExporter {
  public date2CSL(date: ParsedDate): CSLDate {
    switch (date.type) {
      case 'date':
      case 'open':
        return {
          'date-parts': [date2csl(date)],
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
          'date-parts': [[date.year]],
          season: date.season,
          circa: (date.approximate || date.uncertain) ? true : undefined,
        }

      default:
        throw new Error(`Unexpected date type ${ JSON.stringify(date) }`)
    }
  }

  public serialize(csl: CSLItem): string {
    return JSON.stringify(csl)
  }

  public flush(items: string[]): string {
    return `[\n${ (items.map(item => `  ${ item }`)).join(',\n') }\n]\n`
  }
}

export function generateCSLJSON(translation: Translation): void {
  const exporter = new Exporter(translation)
  exporter.doExport()
}
