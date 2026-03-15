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

const pugs = {
  'content/ErrorReport.pug': 'build/content/error-report.xhtml',
  'content/Preferences.pug': 'build/content/preferences.xhtml',
  'content/ServerURL.pug': 'build/content/server-url.xhtml',
  'content/key-manager/migrate.pug': 'build/content/keymanager-migrate.xhtml',
}
for (const [ src, tgt ] of Object.entries(pugs)) {
  console.log(' ', src, '=>', tgt)
  // const xhtml = new XHTML
  fs.writeFileSync(tgt, render(src, {
    pretty: true,
    plugins: [{
      preCodeGen(ast) {
        walk(StripConfig, ast)
        return ast
      },
    }],
  }))
}
