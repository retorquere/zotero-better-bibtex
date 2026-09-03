#!/usr/bin/env node

import fs from 'node:fs/promises'
import { compile } from 'json-schema-to-typescript'
import { parse } from 'lightning-yaml'

const SCHEMA_URL = 'https://raw.githubusercontent.com/jassielof/json-schemas/refs/heads/main/docs/hayagriva.yaml'
const TYPEDEF = 'gen/typings/hayagriva.d.ts'

console.log(`Downloading Hayagriva schema from ${SCHEMA_URL}...`)
const response = await fetch(SCHEMA_URL)

if (!response.ok) throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`)

const yamlText = await response.text()
const schemaObj = parse(yamlText)

schemaObj.definitions.entryType.enum = schemaObj.definitions.entryType.pattern.replace(/[^a-z|]/g, '').split('|')
delete schemaObj.definitions.entryType.pattern

console.log('  Generating TypeScript types...')
const tsDefinitions = await compile(schemaObj, 'Hayagriva', {
  bannerComment: '/* eslint-disable */\n/**\n* This file was automatically generated from the Hayagriva YAML JSON Schema.\n* Do not modify this file directly.\n*/',
})

await fs.writeFile(TYPEDEF, tsDefinitions, 'utf-8')
console.log(`  Written TypeScript definitions to ${TYPEDEF}`)
