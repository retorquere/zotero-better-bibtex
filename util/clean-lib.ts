#!/usr/bin/env npx ts-node

// test/fixtures/export/two ISSN number are freezing browser #110 + Generating keys and export broken #111.json 

import { normalize } from '../translators/lib/normalize'
import * as fs from 'fs'
import { stringify } from '../content/stringify'
import { sync as glob } from 'glob'

function serialize(data) {
  return stringify(data, null, 2, true)
}

const save = process.argv.length > 2
const libs = save ? process.argv.slice(2) : glob('test/fixtures/*/*.json')

for (const lib of libs) {
  if (lib.endsWith('.csl.json')) continue
  if (lib.endsWith('.schomd.json')) continue

  console.log(lib)

  const data = JSON.parse(fs.readFileSync(lib, 'utf-8'))
  const pre = serialize(data)

  normalize(data)

  const post = serialize(data)

  if (post !== pre) {
    console.log(' ', save ? 'saving' : 'should save', lib)
    if (save) fs.writeFileSync(lib, post)
  }
}
