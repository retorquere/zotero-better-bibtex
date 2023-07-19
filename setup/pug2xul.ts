#!/usr/bin/env npx ts-node

/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'
import { walk, Lint, SelfClosing, ASTWalker } from './pug-ast-walker'

class XHTML extends ASTWalker {
  public modified = false

  Mixin(mixin) {
    throw new Error('mixin')
  }

  Conditional(node) {
    throw new Error('conditional')
  }

  Tag(tag, history) {
    switch (tag.name) {
      case 'textbox':
        this.modified = true
        if (tag.attrs.find(a => a.name === 'multiline')) {
          tag.name = 'html:textarea'
          tag.attrs.push({ name: 'cols', val: '"40"', mustEscape: false })
          tag.attrs.push({ name: 'rows', val: '"5"', mustEscape: false })
        }
        else {
          tag.name = 'html:input'
          tag.attrs.push({ name: 'type', val: '"text"', mustEscape: false })
        }
        break

      case 'wizard':
      case 'dialog':
        if (!history.find(n => n.name === 'window')) {
          this.modified = true
          const attrs = tag.attrs
          tag = this.tag('window', {}, [
            this.tag('linkset', {}, [ this.tag('html:link', { rel: 'localization', href: 'better-bibtex.ftl' }) ]),
            this.tag('script', { src: 'chrome://global/content/customElements.js' }),
            tag,
          ])
          tag.attrs = attrs
        }
        break
    }

    this.walk(tag.block, [tag].concat(history.slice(1)))
    return tag
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

  console.log(' ', tgt)
  fs.writeFileSync(tgt, render(src, {
    pretty: true,
    plugins: [{
      preCodeGen(ast) {
        walk(SelfClosing, ast)
        walk(Lint, ast)
        return ast
      },
    }],
  }))

  tgt = tgt.replace('.xul', '.xhtml')
  const xhtml = new XHTML
  fs.writeFileSync(tgt, render(src, {
    pretty: true,
    plugins: [{
      preCodeGen(ast) {
        xhtml.walk(ast, [])
        walk(SelfClosing, ast)
        walk(Lint, ast)
        return ast
      },
    }],
  }))
  if (xhtml.modified) {
    console.log(' ', tgt)
  }
  else {
    fs.unlinkSync(tgt)
  }
}
