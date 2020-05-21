#!/usr/bin/env npx ts-node

import * as ts from 'typescript'
import * as fs from 'fs'

const filename = 'content/key-manager/formatter.ts'
const ast = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest)

function find(root, kind) {
  const found = []
  root.forEachChild(child => {
    if (ts.SyntaxKind[child.kind] === kind) {
      found.push(child)
    }
  })
  return found
}

const valid = { functions: {}, filters: {} }
const formatter = find(ast, 'ClassDeclaration')[0]
let m
for (const method of find(formatter, 'MethodDeclaration')) {
  if (m = method.name.escapedText.match(/^([$_])(.+)/)) {
    valid[{$: 'functions', _: 'filters'}[m[1]]][m[2]] = method.parameters.map(p => p.name.escapedText)
  }
}

fs.writeFileSync('gen/key-formatter-methods.json', JSON.stringify(valid, null, 2))
