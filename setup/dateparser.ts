// tslint:disable:no-console

import parseXML = require('xml-parser')
import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'

import root from '../webpack/root'

console.log('generating date parser data')
const localesRoot = path.join(root, 'citation-style-language-locales')

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

for (const translation of glob.sync(path.join(localesRoot, 'locales-*.xml'))) {
  const locale = parseXML(fs.readFileSync(translation, 'utf8'))

  const months = locale.root.children.find(e => e.name === 'terms').children.filter(e => e.attributes.name.startsWith('month-') || e.attributes.name.startsWith('season-'))
  for (const month of months) {
    const name = month.content.toLowerCase().replace(/\./g, '').trim().normalize('NFKC')
    if (name.match(/^[0-9]+$/)) continue

    if (result[name] && result[name] !== translate[month.attributes.name]) {
      console.log(`  ${name} (${month.attributes.name}) already mapped to ${result[name]}, ignoring ${translate[month.attributes.name]}`)
      continue
    }

    result[name] = translate[month.attributes.name]
  }
}

fs.writeFileSync(path.join(root, 'gen/dateparser-data.json'), JSON.stringify(result, null, 2))
