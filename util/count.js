#!/usr/bin/env node

var bib = require(process.argv[2])

console.log(Object.keys(bib), typeof bib.collections, Array.isArray(bib.collections))
for (const coll of bib.collections) {
  console.log(coll.name, coll.data.length)
}
