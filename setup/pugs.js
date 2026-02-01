#!/usr/bin/env node

/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

console.log('converting pug to XUL/XHTML')
import * as pug from 'pug'
import * as fs from 'fs'

import { walk, ASTWalker } from './pug-ast-walker.js'

function render(src, options) {
  return pug.renderFile(src, options).replace(/&amp;/g, '&').trim()
}

class StripConfig extends ASTWalker {
  Tag(node) {
    node.attrs = node.attrs.filter(attr => !attr.name.startsWith('bbt:'))
    node.block = this.walk(node.block)
    return node
  }

  Block(node) {
    node.nodes = node.nodes.filter(n => !n.name || !n.name.startsWith('bbt:')).map(n => this.walk(n)).filter(n => n)
    return node
  }
}

const pugs = [
  'content/ErrorReport.pug',
  'content/Preferences.pug',
  'content/ServerURL.pug',
]
for (const src of pugs) {
  let tgt = `build/${ src.replace(/[.]pug$/, '.xhtml') }`
  console.log('=', src)
  // const xhtml = new XHTML
  fs.writeFileSync(tgt, render(src, {
    pretty: true,
    plugins: [{
      preCodeGen(ast) {
        walk(StripConfig, ast)
        // xhtml.walk(ast, [])
        // walk(SelfClosing, ast)
        // walk(Lint, ast)
        // fs.writeFileSync(modified, printPug(ast))
        return ast
      },
    }],
  }))
}
