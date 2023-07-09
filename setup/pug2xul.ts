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
const l10nKeys: Set<string> = new Set
const valid = {
  text: /^[-a-z0-9_]+$/,
  attr: /^[-a-z0-9_]+[.][a-z0-9]+$/,
}
function correction(ist, attr = '') {
  let soll = ist
    .replace(/[.]/g, '_')
    .replace(/^[A-Z]/, m => m.toLowerCase())
    .replace(/_[A-Z]/g, m => m.toLowerCase())
    .replace(/([a-z])([A-Z]+)/g, (m, pre, post) => `${pre}-${post.toLowerCase()}`)
  soll += attr
  const prefix = 'better-bibtex_'
  if (!soll.startsWith(prefix)) soll = `${prefix}${soll}`
  if (attr && !soll.match(valid.attr)) throw new Error(soll)
  if (!attr && !soll.match(valid.text)) throw new Error(soll)
  if (soll !== ist) bulk_mod[ist] = soll
}

class Z7Detector extends ASTWalker {
  public is7 = false

  Conditional(node) {
    if (node.test === 'is7') this.is7 = true

    this.walk(node.consequent)
    this.walk(node.alternate)
    return node
  }

  Tag(node) {
    for (const attr of node.attrs) {
      let prefix = ''
      attr.val.replace(/&([^;]+);/g, (m, id) => {
        l10nKeys.add(id)
        if (!id.match(valid.attr) || !id.endsWith(`.${attr.name}`)) {
          correction(id, `.${attr.name}`)
        }
        else {
          if (!prefix) {
            prefix = id.split('.')[0]
          }
          else if (id.split('.')[0] !== prefix) {
            throw new Error(`${id} should start with ${prefix}`)
          }
        }
      })
    }

    this.walk(node.block)
    return node
  }

  Text(node) {
    node.val.replace(/&([^;]+);/g, (m, id) => {
      l10nKeys.add(id)
      if (!id.match(valid.text)) {
        correction(id)
      }
    })
    return node
  }
}

function render(src, options) {
  return pug.renderFile(src, options).replace(/&amp;/g, '&').trim()
}

for (const src of pugs) {
  console.log(' ', src)
  const tgt = `build/${src.replace(/pug$/, 'xul')}`

  const detector = new Z7Detector
  fs.writeFileSync(tgt, render(src, {
    pretty: true,
    plugins: [{
      preCodeGen(ast) {
        detector.walk(ast)
        return ast
      },
    }],
  }))

  if (detector.is7) {
    fs.writeFileSync(tgt.replace('.xul', '.xhtml'), render(src, { pretty: true, is7: true }))
  }
}

fs.writeFileSync('l10nkeys-static.json', JSON.stringify([...l10nKeys], null, 2))
fs.writeFileSync('bulk-mod.json', fast_safe_stringify.stable(bulk_mod, null, 2))
