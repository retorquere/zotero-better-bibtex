#!/usr/bin/env npx ts-node

// test/fixtures/export/two ISSN number are freezing browser #110 + Generating keys and export broken #111.json 

import AJV from 'ajv'
const ajv = new AJV
const validate = ajv.compile(require('../schema/BetterBibTeX JSON.json'))
import * as jsonpatch from 'fast-json-patch'

import { normalize } from '../translators/lib/normalize'
import stringify from 'safe-stable-stringify'
import * as fs from 'fs'

import { defaults } from '../gen/preferences/meta'
const supported: string[] = Object.keys(defaults).filter(name => !['client', 'testing', 'platform', 'newTranslatorsAskRestart'].includes(name))

const argv = require("clp")()
if (argv.attachments && typeof argv.attachments !== 'boolean') {
  console.log('put --attachments at end of command line')
  process.exit(1)
}
if (argv.prefs && typeof argv.prefs !== 'boolean') {
  console.log('put --prefs at end of command line')
  process.exit(1)
}

const localeDateOrder = argv.localeDateOrder ? argv.localeDateOrder.split('=') : null

argv._.sort()
console.log(`## inspecting ${argv._.length} files`)

const extensions = [
  '.schomd.json',
  '.csl.json',
  '.json',
]
/*
function sortkey(item) {
  return [ item.dateModified || item.dateAdded, item.itemType, `${item.itemID}` ].join('\t')
}
*/

function stripCC(input) {
  var output = ''
  for (var i=0; i<input.length; i++) {
    if (input.charCodeAt(i) >= 32) output += input.charAt(i)
  }
  return output
}

function clean(item) {
  delete item.libraryID
  delete item.uri
  delete item.dateAdded
  delete item.dateModified
  delete item.relations
  delete item.select
  delete item.itemKey
  delete item.contentType
  delete item.filename
  delete item.defaultPath
}

for (const lib of argv._) {
  const ext = extensions.find(ext => lib.endsWith(ext))

  if (ext === '.schomd.json' || ext === '.csl.json') continue

  const pre = JSON.parse(stripCC(fs.readFileSync(lib, 'utf-8')))
  const post = JSON.parse(JSON.stringify(pre))

  switch (ext) {
    case '.json':
      normalize(post, false)
      delete post.version

      if (localeDateOrder && post.config.localeDateOrder === localeDateOrder[0]) post.config.localeDateOrder = localeDateOrder[1]

      if (post.config?.options) {
        for (const [option, on] of Object.entries(post.config.options)) {
          if (option === 'Normalize' && on) delete post.config.options[option]
          if (option !== 'Normalize' && !on) delete post.config.options[option]
        }
      }

      if (post.config?.preferences) {
        if (argv.prefs) post.config.preferences = {}
        for (const [pref, value] of Object.entries(post.config.preferences)) {
          if (!supported.includes(pref) || value === defaults[pref]) delete post.config.preferences[pref]
        }
      }

      // post.items.sort((a, b) => sortkey(a).localeCompare(sortkey(b)))
      if (argv.attachments) post.items = (post.items || []).filter(i => i.itemType != 'attachment')

      for (const item of (post.items || [])) {
        clean(item)

        delete item.multi

        for (const creator of (item.creators || [])) {
          delete creator.multi
        }

        if (argv.attachments && item.attachments) {
          item.attachments = item.attachments.filter(att => !att.url && !att.path)
          if (!item.attachments.length) delete item.attachments
        }
        if (item.attachments) {
          for (const att of item.attachments) {
            clean(att)
            if (att.path) att.path = att.path.replace(/.*\/zotero\/storage\/[^/]+/, 'ATTACHMENT_KEY')
          }
        }
      }
      console.log((post.items || []).length, 'items')
      break
    case '.csl.json':
      // post.sort((a, b) => stringify(a).localeCompare(stringify(b)))
      break
  }

  if (!validate(post)) {
    console.log(lib)
    console.log(validate.errors)
  }

  const diff = jsonpatch.compare(pre, post)
  if (diff.length > 0) {
    console.log(lib)
    console.log('  saving')
    fs.writeFileSync(lib, stringify(post, null, 2))
  }
}
