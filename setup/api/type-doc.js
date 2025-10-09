#!/usr/bin/env node

import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import tmp from 'tmp'
import ts from 'typescript'
import { fileURLToPath } from 'url'

const plugin = './setup/api/type-doc-all-defaults.mjs'

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

export function parse(src, tgt) {
  src = path.resolve(src)
  tgt = tgt
    ? { name: path.resolve(tgt), removeCallback: () => {} }
    : tmp.fileSync({ postfix: '.json' })

  // fs.writeFileSync(tsconfig, JSON.stringify({ ...require('../../tsconfig.json'), moduleResolution: 'node' }))
  const result = run('npx', [
    'typedoc',
    '--tsconfig', 'tsconfig.setup.json',
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

const currentFilePath = fileURLToPath(import.meta.url)
const mainFilePath = path.resolve(process.argv[1])
const isMainModule = currentFilePath === mainFilePath
if (isMainModule) {
  for (const ts of process.argv.slice(2)) {
    parse(ts, path.resolve(path.parse(ts).name + '.json'))
  }
}
