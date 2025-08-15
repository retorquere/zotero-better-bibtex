#!/usr/bin/env node

const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const tmp = require('tmp')
const ts = require('typescript')

const plugin = path.resolve(path.join(__dirname, 'type-doc-all-defaults.mjs'))

function shlexQuote(s) {
  if (typeof s !== 'string') {
    throw new TypeError(`Expected a string, git ${typeof s}`)
  }
  if (/^[a-zA-Z0-9_\/.-]+$/.test(s)) {
    return s;
  }
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function run(cmd, args) {
  console.log(shlexQuote(cmd), ...args.map(shlexQuote))
  return spawnSync(cmd, args)
}

function parse(src, tgt) {
  src = path.resolve(src)
  tgt = tgt
    ? { name: path.resolve(tgt), removeCallback: () => {} }
    : tmp.fileSync({ postfix: '.json' })

  // const tsconfig = path.resolve(__dirname, `../../tsconfig${Math.random()}.json`)
  // fs.writeFileSync(tsconfig, JSON.stringify({ ...require('../../tsconfig.json'), moduleResolution: 'node' }))
  const result = run('npx', [
    'typedoc',
    // '--tsconfig', tsconfig,
    '--json', tgt.name,
    '--plugin', plugin,
    '--externalPattern', '**/*/{items,zotero}.ts',
    '--excludeExternals',
    src,
  ])
  if (result.error) {
    console.error(`Error: ${result.error}`)
    process.exit(1)
  }
  if (result.status !== 0) { // Check for non-zero exit code
    console.error(`Command failed with exit code ${result.status}`)
    console.error(`stderr: ${result.stderr.toString()}`)
    process.exit(1)
  }
  console.log(`${result.stdout.toString()}`)

  let doc = require(tgt.name)
  const orphanKind = {
    1024: 'FirstTypeNode',
    16384: 'FirstJSDocTagNode',
    2048: 'FirstPunctuation',
    2097152: 'FirstContextualKeyword',
    32768: 'FirstJSDocNode',
    4096: 'FirstNode',
    512: 'FirstToken',
    65536: 'FirstTypeNode',
  }
  doc = JSON.parse(JSON.stringify(doc, function(key, value) {
    if (key === 'kind' && typeof value === 'number') {
      return ts.SyntaxKind[value] || orphanKind[value] || value
    }

    return value
  }))
  fs.writeFileSync(tgt.name, JSON.stringify(doc, null, 2))
  tgt.removeCallback()
  // fs.unlinkSync(tsconfig)
  return doc
}

if (require.main === module) {
  for (const ts of process.argv.slice(2)) {
    parse(ts, path.resolve(path.parse(ts).name + '.json'))
  }
}
else {
  module.exports = { parse }
}
