import { Translator } from './lib/translator'
export { Translator }

import { CSLExporter as Exporter } from './csl/csl'

function date2csl(date) {
  let csl
  switch (date.type) {
    case 'open':
      return [0]

    case 'date':
      csl = [date.year > 0 ? date.year : date.year - 1]
      if (date.month) {
        csl.push(date.month)
        if (date.day) {
          csl.push(date.day)
        }
      }
      return csl // eslint-disable-line @typescript-eslint/no-unsafe-return

    case 'season':
      // https://github.com/retorquere/zotero-better-bibtex/issues/860
      return [ date.year > 0 ? date.year : date.year - 1, date.season + 12 ] // eslint-disable-line no-magic-numbers, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-return

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

export function doExport(): void {
  Translator.init('export')
  Exporter.initialize()
  Exporter.doExport()
}
