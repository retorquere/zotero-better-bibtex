import { validate as isISBN } from 'is-isbn'
import { validate as isISSN } from './issn'
import EAN from 'barcoder'
import { isEDTF } from './dateparser'

const ismn_prefix = '9790'

export function qualityReport(value: string, test: string, params = null): string {
  switch (test) {
    case 'isbn':
      return isISBN(value.replace(/-/g, '')) ? '' : 'not a valid ISBN'

    case 'issn':
      return isISSN(value) ? '' : 'not a valid ISSN'

    case 'ismn':
      value = value.replace(/[ -]/g, '')

      if (value.length === 10) {
        if (value[0] !== 'M') return 'not a valid ISMN'
        value = ismn_prefix + value.substring(1)
      }

      if (value.length !== 13 || !value.startsWith(ismn_prefix)) return 'not a valid ISMN'

      return EAN.validate(value) ? '' : 'not a valid ISMN'

    case 'date':
      return isEDTF(value) ? '' : 'not a valid ETDF date'

    case 'pattern':
      return (new RegExp(`^${ params }$`, 'i').test(value)) ? '' : `must match /^${ params }$/`

    default:
      throw new Error(`I don't know how to test for ${ test }`)
  }
}
