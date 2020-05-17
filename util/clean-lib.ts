#!/usr/bin/env npx ts-node

// test/fixtures/export/two ISSN number are freezing browser #110 + Generating keys and export broken #111.json 

const AJV = require('ajv')
const ajv = new AJV
const validate = ajv.compile(require('../test/features/steps/bbtjsonschema.json'))

import { normalize } from '../translators/lib/normalize'
import * as fs from 'fs'
import { stringify } from '../content/stringify'
import { sync as glob } from 'glob'
import cleaner = require('deep-cleaner')
const preferences = {
  defaults: require('../gen/preferences/defaults.json'),
  supported: []
}
for (const pref of ['client', 'testing', 'platform', 'newTranslatorsAskRestart']) {
  delete preferences.defaults[pref]
}
preferences.supported = Object.keys(preferences.defaults)

const argv = require('rasper')(process.argv.slice(2))
if (argv.save && typeof argv.save !== 'boolean') {
  console.log('put --save at end of command line')
  process.exit(1)
}
if (argv.saveAll && typeof argv.saveAll !== 'boolean') {
  console.log('put --save-all at end of command line')
  process.exit(1)
}

const localeDateOrder = argv.localeDateOrder ? argv.localeDateOrder.split('=') : null

if (argv._.length === 0) {
  if (argv.save) {
    console.log('use --save-all for global replace')
    process.exit(1)
  }
  argv._ = glob('test/fixtures/*/*.json')
  argv.save = argv.saveAll
}
argv._.sort()
console.log(`## inspecting ${argv._.length} files`)

function serialize(data) {
  return stringify(data, null, 2, true)
}

const extensions = [
  '.schomd.json',
  '.csl.json',
  '.json',
]
for (const lib of argv._) {
  const ext = extensions.find(ext => lib.endsWith(ext))

  if (ext === '.schomd.json' || ext === '.csl.json') continue

  const pre = fs.readFileSync(lib, 'utf-8')
  const data = JSON.parse(pre)

  switch (ext) {
    case '.json':
      normalize(data)
      delete data.version

      if (localeDateOrder && data.config.localeDateOrder === localeDateOrder[0]) data.config.localeDateOrder = localeDateOrder[1]

      if (data.config?.options) {
        for (const [option, on] of Object.entries(data.config.options)) {
          if (option === 'Normalize' && on) delete data.config.options[option]
          if (option !== 'Normalize' && !on) delete data.config.options[option]
        }
      }

      if (data.config?.preferences) {
        for (const [pref, value] of Object.entries(data.config.preferences)) {
          if (!preferences.supported.includes(pref) || value === preferences.defaults[pref]) delete data.config.preferences[pref]
        }
      }

      for (const item of (data.items || [])) {
        delete item.uri
        delete item.dateAdded
        delete item.dateModified
        delete item.relations

        cleaner(item.multi)
        if (item.multi && Object.keys(item.multi).length === 0) delete item.multi

        for (const creator of (item.creators || [])) {
          cleaner(creator.multi)
          if (creator.multi && Object.keys(creator.multi).length === 0) delete creator.multi
        }

        for (const att of (item.attachments || [])) {
          delete att.libraryID
        }
      }
      break
    case '.csl.json':
      // data.sort((a, b) => stringify(a).localeCompare(stringify(b)))
      break
  }

  const post = serialize(data)
  if (!validate(data)) {
    console.log(lib)
    console.log(validate.errors)
  }

  if (post !== pre) {
    console.log(lib)
    console.log(' ', argv.save ? 'saving' : 'should save')
    if (argv.save) fs.writeFileSync(lib, post)
  }
}
