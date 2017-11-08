export = (value, test, params = null) => {
  switch (test) {
    case 'isbn':
      return ''

    case 'issn':
      return ''

    case 'ismn':
      return ''

    case 'date':
      return ''

    case 'pattern':
      if (new RegExp(`^${params}$`, 'i').test(value)) return ''
      return 'not a valid value'

    default:
      throw new Error(`I don't know how to test for ${test}`)
  }
}
