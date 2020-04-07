#!/usr/bin/env npx ts-node

// test/fixtures/export/two ISSN number are freezing browser #110 + Generating keys and export broken #111.json 

import { normalize } from '../translators/lib/normalize'
import * as fs from 'fs'
import stringify from 'fast-safe-stringify'

for (const lib of process.argv.slice(2)) {
  if (lib.endsWith('.csl.json')) continue
  if (lib.endsWith('.schomd.json')) continue

  const data = JSON.parse(fs.readFileSync(lib, 'utf-8'))
  const pre = stringify(data, null, 2)

  normalize(data)

  const post = stringify(data, null, 2)

  if (post != pre) {
    console.log('saving', lib)
    fs.writeFileSync(lib, post)
  }
}
