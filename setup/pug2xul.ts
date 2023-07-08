#!/usr/bin/env npx ts-node

/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'
import { ASTWalker } from './pug-ast-walker'
import fast_safe_stringify from 'fast-safe-stringify'

const pugs = [
  'content/ErrorReport.pug',
  'content/FirstRun.pug',
  'content/Preferences.pug',
  'content/ServerURL.pug',
  'content/ZoteroPane.pug',
  'content/bulk-keys-confirm.pug',
  'content/regenerate-keys.pug',
  'content/zotero-preferences.pug',
]

const bulk_mod: Record<string, string> = {}
function correction(ist, attr = '') {
  const soll = ist
    .replace(/[.]/g, '_')
    .replace(/^[A-Z]/, m => m.toLowerCase())
    .replace(/_[A-Z]/g, m => m.toLowerCase())
    .replace(/([a-z])([A-Z]+)/g, (m, pre, post) => `${pre}-${post.toLowerCase()}`)
  bulk_mod[ist] = soll + attr
}

// const attributes: Set<string> = new Set
class WizardDetector extends ASTWalker {
  public foundWizard = false

  public valid = {
    text: /^[-a-z0-9_]+$/,
    attr: /^[-a-z0-9_]+[.][a-z0-9]+$/,
  }

  Tag(node) {
    if (node.name === 'wizard') this.foundWizard = true

    for (const attr of node.attrs) {
      attr.val.replace(/&([^;]+);/g, (m, id) => {
        if (!id.match(this.valid.attr) || !id.endsWith(`.${attr.name}`)) {
          correction(id, `.${attr.name}`)
        }
        // attributes.add(id)
      })
    }

    this.walk(node.block)
    return node
  }

  Text(node) {
    node.val.replace(/&([^;]+);/g, (m, id) => {
      if (!id.match(this.valid.text)) {
        correction(id)
      }
    })
  }
}

class Z7Wizard extends ASTWalker {
  Tag(node) {
    if (node.name === 'wizard') {
      return {
        type: 'Tag',
        name: 'window',
        attrs: node.attrs.filter(a => a.name.startsWith('xmlns')),
        attributeBlocks: [],
        block: {
          type: 'Block',
          nodes: [
            {
              type: 'Tag',
              name: 'script',
              selfClosing: true,
              block: { type: 'Block', nodes: [] },
              attrs: [ { name: 'src', val: '"chrome://global/content/customElements.js"', mustEscape: true } ],
              attributeBlocks: [],
            },
            { ...node, attrs: node.attrs.filter(a => !a.name.startsWith('xmlns')) },
          ],
        },
      }
    }

    return node
  }
}

function render(src, options) {
  return pug.renderFile(src, options).replace(/&amp;/g, '&').trim()
}

for (const src of pugs) {
  console.log(' ', src)
  const tgt = `build/${src.replace(/pug$/, 'xul')}`

  const wizardDetector = new WizardDetector
  fs.writeFileSync(tgt, render(src, {
    pretty: true,
    plugins: [{
      preCodeGen(ast) {
        return wizardDetector.walk(ast)
      },
    }],
  }))

  if (wizardDetector.foundWizard) {
    fs.writeFileSync(
      tgt.replace('.xul', '.xhtml'),
      render(src, {
        pretty: true,
        plugins: [{
          preCodeGen(ast) {
            return (new Z7Wizard).walk(ast)
          },
        }],
      })
    )
  }
}

// fs.writeFileSync('attributes.json', JSON.stringify([...attributes], null, 2))
fs.writeFileSync('bulk-mod.json', fast_safe_stringify.stable(bulk_mod, null, 2))
