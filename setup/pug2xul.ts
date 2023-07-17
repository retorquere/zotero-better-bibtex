#!/usr/bin/env npx ts-node

/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'
import { walk, SelfClosing, ASTWalker } from './pug-ast-walker'

class Z7Detector extends ASTWalker {
  public is7 = false

  Conditional(node) {
    if (node.test === 'is7' || node.test === '!is7') this.is7 = true

    return node
  }
}

function render(src, options) {
  return pug.renderFile(src, options).replace(/&amp;/g, '&').trim()
}

const pugs = [
  'content/ErrorReport.pug',
  'content/Preferences/xul.pug',
  'content/Preferences/xhtml.pug',
  'content/ServerURL.pug',
  'content/ZoteroPane.pug',
  'content/bulk-keys-confirm.pug',
  'content/regenerate-keys.pug',
  'content/zotero-preferences.pug',
]
for (const src of pugs) {
  // handled in preferences.ts
  switch (src) {
    case 'content/Preferences/xul.pug':
    case 'content/Preferences/xhtml.pug':
      continue
  }
  let tgt = `build/${src.replace(/pug$/, 'xul')}`

  const detector = new Z7Detector
  console.log(' ', tgt)
  fs.writeFileSync(tgt, render(src, {
    pretty: true,
    plugins: [{
      preCodeGen(ast) {
        detector.walk(ast)
        walk(SelfClosing, ast)
        return ast
      },
    }],
  }))

  if (detector.is7) {
    tgt = tgt.replace('.xul', '.xhtml')
    console.log(' ', tgt)
    fs.writeFileSync(tgt, render(src, { pretty: true, is7: true }))
  }
}
