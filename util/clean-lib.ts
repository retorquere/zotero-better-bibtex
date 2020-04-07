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
const libs = save ? process.argv.slice(2) : glob('test/fixtures/*/*.json').sort()

const extensions = [
  '.schomd.json',
  '.csl.json',
  '.json',
]
for (const lib of libs) {
  const ext = extensions.find(ext => lib.endsWith(ext))

  if (ext === '.schomd.json' || ext === '.csl.json') continue

  if (save) console.log(lib)

  const pre = fs.readFileSync(lib, 'utf-8')
  const data = JSON.parse(pre)

  switch (ext) {
    case '.json':
      normalize(data, true)
      break
    case '.csl.json':
      // data.sort((a, b) => stringify(a).localeCompare(stringify(b)))
      break
  }

  const post = serialize(data)

  if (post !== pre) {
    if (!save) console.log(lib)
    if (save) console.log(' ', save ? 'saving' : 'should save')
    if (save) fs.writeFileSync(lib, post)
  }
}
