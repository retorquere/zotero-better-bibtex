import ISBN = require('isbnjs')
import ISSN = require('issn')
import EAN = require('barcoder')
import * as DateParser from './dateparser'

const isnm_prefix = '9790'

export function qualityReport(value, test, params = null) {
  switch (test) {
    case 'isbn':
      const isbn = ISBN.parse(value)
      return (isbn && (isbn.isIsbn10() || isbn.isIsbn13())) ? '' : 'not a valid ISBN'

    case 'issn':
      return ISSN(value) ? '' : 'not a valid ISSN'

    case 'ismn':
      value = value.replace(/[ -]/g, '')

      if (value.length === 10) { // tslint:disable-line:no-magic-numbers
        if (value[0] !== 'M') return 'not a valid ISMN'
        value = isnm_prefix + value.substring(1)
      }

      // tslint:disable-next-line:no-magic-numbers
      if (value.length !== 13 || !value.startsWith(isnm_prefix)) return 'not a valid ISMN'

      return EAN.validate(value) ? '' : 'not a valid ISMN'

    case 'date':
      return DateParser.isEDTF(value) ? '' : 'not a valid ETDF date'

    case 'pattern':
      return (new RegExp(`^${params}$`, 'i').test(value)) ? '' : 'not a valid value'

    default:
      throw new Error(`I don't know how to test for ${test}`)
  }
}
