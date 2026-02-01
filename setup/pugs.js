#!/usr/bin/env node

/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

console.log('converting pug to XUL/XHTML')
import * as pug from 'pug'
import * as fs from 'fs'

/*
import { walk, Lint, SelfClosing, ASTWalker } from './pug-ast-walker.js'

class XHTML extends ASTWalker {
  modified = false

  Mixin(_mixin) {
    throw new Error('mixin')
  }

  Conditional(_node) {
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
          const linkset = this.tag('linkset', {}, [
            this.tag('html:link', { rel: 'localization', href: 'better-bibtex.ftl' }),
            tag.name === 'wizard' ? this.tag('html:link', { rel: 'localization', href: 'toolkit/global/wizard.ftl' }) : null,
          ].filter(link => link))
          const windowAttrs = tag.attrs.filter(a => a.name.startsWith('xmlns') || a.name === 'onload')
          tag.attrs = tag.attrs.filter(a => !windowAttrs.find(wa => wa.name === a.name))
          tag = this.tag('window', {}, [
            linkset,
            this.tag('script', { src: 'chrome://global/content/customElements.js' }),
            { ...tag },
          ])
          tag.attrs = windowAttrs
        }
        break
    }

    this.walk(tag.block, [tag].concat(history.slice(1)))
    return tag
  }
}
*/

function render(src, options) {
  return pug.renderFile(src, options).replace(/&amp;/g, '&').trim()
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
    /*
    plugins: [{
      preCodeGen(ast) {
        // xhtml.walk(ast, [])
        // walk(SelfClosing, ast)
        // walk(Lint, ast)
        // fs.writeFileSync(modified, printPug(ast))
        return ast
      },
    }],
    */
  }))
}
