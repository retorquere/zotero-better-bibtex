#!/usr/bin/env node

import fs from 'node:fs'
const bib = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'))

console.log(Object.keys(bib), typeof bib.collections, Array.isArray(bib.collections))
for (const [id, coll] of (Object.entries(bib.collections || {}))) {
  console.log(id, coll.collections.length, coll.items.length)
}
console.log(bib.items.length)
