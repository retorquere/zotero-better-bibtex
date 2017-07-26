global.Zotero = {
  Debug: {
    enabled: true
  },
  debug: (str) -> console.log(str)
}

parseDate = require('../content/dateparser.coffee')
dates = require('./dateparser.json')

scrub = (o) ->
  return o unless typeof o == 'object' && !Array.isArray(o)

  for k, v of o
    if typeof v == 'undefined' || v == false || v == true
      delete o[k]
    else
      scrub(v)
  return o

deepEqual = (a, b) ->
  return true if a == b

  return false if a == null || typeof a != 'object' || b == null || typeof b != 'object'

  if Array.isArray(a) && Array.isArray(b)
    return false unless a.length == b.length
    for v, i in a
      return false unless deepEqual(v, b[i])
    return true

  return false if Array.isArray(a) || Array.isArray(b)

  return false if Object.keys(a).length != Object.keys(b).length

  for k, v of a
    return false unless deepEqual(v, b[k])
  return true

for raw, cooked of dates
  parsed = scrub(parseDate(raw))
  scrub(cooked)
  continue if deepEqual(parsed, cooked)
  console.log('input:', raw)
  console.log('expected:', JSON.stringify(cooked))
  console.log('found:', JSON.stringify(parsed))
  throw new Error(raw)

console.log(scrub(parseDate("März 1, 2008")))
