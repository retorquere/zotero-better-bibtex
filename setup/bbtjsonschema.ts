#!/usr/bin/env npx ts-node

import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob-promise'
import fast_safe_stringify from 'fast-safe-stringify'

import { options, defaults } from '../gen/preferences/meta'

const baseline = './schema/BetterBibTeX JSON.json'
const schema = JSON.parse(fs.readFileSync(baseline, 'utf-8'))

schema.properties.config.properties.options.properties = {}
for (const translator of glob.sync('translators/*.json')) {
  const header = JSON.parse(fs.readFileSync(translator, 'utf-8'))
  for (const [ option, dflt ] of Object.entries(header.displayOptions || {})) {
    const type = typeof dflt
    switch (type) {
      case 'boolean':
      case 'string':
        schema.properties.config.properties.options.properties[option] = { type }
        break
      default:
        throw new Error(`${ path.basename(translator) }.${ option } = ${ type }`)
    }
  }
}

schema.properties.config.properties.preferences.properties = {}
for (const [ pref, dflt ] of Object.entries(defaults)) {
  const type = typeof dflt
  if ([ 'client', 'platform', 'newTranslatorsAskRestart', 'testing', 'citekeyFormatEditing' ].includes(pref)) continue

  if (type === 'string' && options[pref]) {
    schema.properties.config.properties.preferences.properties[pref] = { type: 'string', enum: Object.keys(options[pref]) }
  }
  else if ([ 'string', 'boolean', 'number' ].includes(type)) {
    schema.properties.config.properties.preferences.properties[pref] = { type }
  }
  else {
    throw new Error(`Unexpected preference ${ pref } of type ${ type }`)
  }
}

schema.properties.items.items.properties = { ...schema.properties.items.items.properties }
for (const k of Object.keys(schema.properties.items.items.properties)) {
  switch (k) { // keep these because they are not in the Zotero schema declaration
    case 'note':
    case 'multi':
    case 'citationKey':
    case 'itemID':
    case 'key':
    case 'dateAdded':
    case 'dateModified':
    case 'uri':
    case 'creators':
    case 'tags':
    case 'notes':
    case 'collections':
    case 'relations':
    case 'attachments':
      break
    default:
      delete schema.properties.items.items.properties[k]
      break
  }
}

const itemTypes = new Set<string>
const creatorType = schema.properties.items.items.properties.creators.items.properties.creatorType
for (const client of [ 'schema/zotero.json', 'schema/jurism.json' ]) {
  const data = JSON.parse(fs.readFileSync(client, 'utf-8'))
  for (const itemType of data.itemTypes) {
    itemTypes.add(itemType.itemType)
    for (const field of itemType.fields) {
      let fieldType
      if (field.field === 'extra') {
        fieldType = { type: 'array', items: { type: 'string' }}
      }
      else {
        fieldType = { type: 'string' }
      }
      schema.properties.items.items.properties[field.baseField || field.field] = fieldType
    }

    for (const creator of itemType.creatorTypes) {
      creatorType.enum = [...(new Set([ ...creatorType.enum, creator.creatorType ]))].sort()
    }
  }
}

schema.properties.items.items.properties.itemType = { enum: [...itemTypes].sort() }

fs.writeFileSync(baseline, fast_safe_stringify.stable(schema, null, 2))
