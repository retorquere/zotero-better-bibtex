// tslint:disable:no-console

const edtf = require('edtf')
global.Zotero = {
  Debug: {
    enabled: true,
  },
  debug(str) { return console.log(str) },
}

const parseDate = require('../content/dateparser.coffee')
const dates = require('./dateparser.json')

function scrub(o) {
  if ((typeof o !== 'object') || !!Array.isArray(o)) return o

  for (const [k, v] of Object.entries(o)) {
    if ((typeof v === 'undefined') || (v === false) || (v === true)) {
      delete o[k]
    } else {
      scrub(v)
    }
  }
  return o
}

function deepEqual(a, b) {
  if (a === b) return true

  if ((a === null) || (typeof a !== 'object') || (b === null) || (typeof b !== 'object')) return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      v = a[i]
      if (!deepEqual(v, b[i])) return false
    }
    return true
  }

  if (Array.isArray(a) || Array.isArray(b)) return false

  if (Object.keys(a).length !== Object.keys(b).length) return false

  for (const [k, v] in Object.entries(a)) {
    if (!deepEqual(v, b[k])) return false
  }
  return true
}

for (const [raw, cooked] of Object.entries(dates)) {
  try {
    edtf.parse(raw)
    console.log(`${raw} is edtf`)
  } catch (error) {
    console.log(`${raw} is not edtf`)
  }
  const parsed = scrub(parseDate(raw))
  scrub(cooked)
  if (deepEqual(parsed, cooked)) continue
  console.log('input:', raw)
  console.log('expected:', JSON.stringify(cooked))
  console.log('found:   ', JSON.stringify(parsed))
  throw new Error(raw)
}

console.log(scrub(parseDate('März 1, 2008')))
