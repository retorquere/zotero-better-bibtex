// tslint:disable:no-console

import parseXML = require('xml-parser')
import * as fs from 'fs-extra'
import * as path from 'path'

import root from '../webpack/root'

console.log('generating date parser data')
const localesRoot = path.join(root, 'citeproc-js/locale')

const result = {}
const translate = {
  'month-01': 'january',
  'month-02': 'february',
  'month-03': 'march',
  'month-04': 'april',
  'month-05': 'may',
  'month-06': 'june',
  'month-07': 'july',
  'month-08': 'august',
  'month-09': 'september',
  'month-10': 'october',
  'month-11': 'november',
  'month-12': 'december',
  'season-01': 'spring',
  'season-02': 'summer',
  'season-03': 'autumn',
  'season-04': 'winter',
}

const locales = require(path.join(localesRoot, 'locales.json'))

for (const short of Object.keys(locales['primary-dialects'])) {
  const full = locales['primary-dialects'][short]

  const locale = parseXML(fs.readFileSync(path.join(localesRoot, `locales-${full}.xml`), 'utf8'))

  const months = locale.root.children.find(e => e.name === 'terms').children.filter(e => e.attributes.name.startsWith('month-') || e.attributes.name.startsWith('season-'))
  for (const month of months) {
    const name = month.content.toLowerCase().replace(/\./g, '').trim().normalize('NFKC')
    if (name.match(/^[0-9]+$/)) continue

    if (result[name] && result[name] !== translate[month.attributes.name]) {
      console.log(`  ignoring ${month.attributes.name} ${name}`)
      continue
    }

    result[name] = translate[month.attributes.name]
  }
}

fs.writeFileSync(path.join(root, 'gen/dateparser-data.json'), JSON.stringify(result, null, 2))
