// tslint:disable:no-console

import * as fs from 'fs-extra'
import * as path from 'path'

import root from '../zotero-webpack/root'

console.log('generate translator list')
const translators = {byId: {}, byName: {}, byLabel: {}}
for (const translator of fs.readdirSync(path.join(root, 'resource')).filter(f => f.endsWith('.json'))) {
  const header = require(path.join(root, 'resource', translator))
  header.lastUpdated = (new Date).toISOString().replace('T', ' ').replace(/\..*/, '')
  translators.byId[header.translatorID] = header
  translators.byName[header.label] = header
  translators.byLabel[header.label.replace(/[^a-zA-Z]/g, '')] = header
}
fs.writeFileSync(path.join(root, 'gen/translators.json'), JSON.stringify(translators, null, 2))
