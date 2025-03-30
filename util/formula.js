#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const { compile } = require('../content/key-manager/compile')

function show(formula) {
  console.log('\n==========================')
  console.log(formula)
  console.log('--------------------------')
  console.time('formula')
  try {
    console.log(compile(formula))
  }
  catch (err) {
    console.log(err)
  }
  console.timeEnd('formula')
}

if (process.argv[2]) {
  for (let formula of process.argv.slice(2)) {
    if (fs.existsSync(formula)) {
      formula = JSON.parse(fs.readFileSync(formula, 'utf-8')).config?.preferences?.citekeyFormat
    }
    if (formula) show(formula)
  }
}
else {
  let formula = ''
  process.stdin.on('data', (chunk) => {
    formula += chunk
  });

  process.stdin.on('end', () => {
    show(formula)
    console.log(compile(formula))
  })
}
