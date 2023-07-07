#!/usr/bin/env npx ts-node

/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'
import { ASTWalker } from './pug-ast-walker'

const pugs = [
  'content/Preferences.pug',
  'content/zotero-preferences.pug',
  'content/ErrorReport.pug',
  'content/FirstRun.pug',
  'content/ServerURL.pug',
  'content/ZoteroPane.pug',
]

// const attributes: Set<string> = new Set
class WizardDetector extends ASTWalker {
  public foundWizard = false

  Tag(node) {
    /*
    for (const attr of node.attrs) {
      attr.val.replace(/&([^;]+);/g, (m, id) => {
        attributes.add(id)
      })
    }
    */
    if (node.name === 'wizard') this.foundWizard = true
    this.walk(node.block)
    return node
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

// console.log(JSON.stringify([...attributes], null, 2))
