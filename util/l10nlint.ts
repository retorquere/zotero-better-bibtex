#!/usr/bin/env npx ts-node

/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as peggy from 'peggy'
import * as pug from 'pug'
import * as fs from 'fs'
import { pugs, walk as pugwalk, ASTWalker } from '../setup/pug-ast-walker'

import { parse } from 'acorn'
import jswalk = require('acorn-walk')

const valid = {
  text: /^[-a-z0-9_]+$/,
  attr: /^[-a-z0-9_]+[.][a-z0-9]+$/,
}
function lint(ist, attr = '') {
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
  if (soll !== ist) throw new Error(`${ist} should be ${soll}`)
}

const dtd = peggy.generate(fs.readFileSync('content/dtd-file.peggy', 'utf-8')).parse(fs.readFileSync('build/locale/en-US/zotero-better-bibtex.dtd', 'utf-8')) as Record<string, string>
const l10n: { used: Set<string>, defined: Set<string> } = {
  used: new Set,
  defined: new Set(Object.keys(dtd)),
}

jswalk.simple(parse(fs.readFileSync('build/content/better-bibtex.js', 'utf-8'), { ecmaVersion: 2020 }), {
  CallExpression(call_expression: any) {
    if (call_expression.callee.type !== 'Identifier') return
    if (call_expression.callee.name !== 'localize') return
    let id = ''
    switch (call_expression.arguments[0]?.type) {
      case 'Literal':
        id = call_expression.arguments[0].value
        break
      case 'TemplateLiteral':
        id = call_expression.arguments[0].quasis.map(q => q.value.raw).join('')
        break
      default:
        throw new Error(call_expression.arguments[0]?.type)
    }

    switch (id) {
      case 'better-bibtex_aux-scan_title_':
        l10n.used.add('better-bibtex_aux-scan_title_aux')
        l10n.used.add('better-bibtex_aux-scan_title_md')
        break
      case 'better-bibtex_preferences_auto-export_type_':
        l10n.used.add('better-bibtex_preferences_auto-export_type_library')
        l10n.used.add('better-bibtex_preferences_auto-export_type_collection')
        break
      case 'better-bibtex_preferences_auto-export_status_':
        for (const status of ['scheduled', 'running', 'done', 'error', 'preparing']) {
          l10n.used.add(`better-bibtex_preferences_auto-export_status_${status}`)
        }
        break
    }

    if (id) l10n.used.add(id)
  },
})

class L10NDetector extends ASTWalker {
  Tag(node) {
    for (const attr of node.attrs) {
      let prefix = ''
      attr.val.replace(/&([^;]+);/g, (m, id) => {
        l10n.used.add(id)
        if (!id.match(valid.attr) || !id.endsWith(`.${attr.name}`)) {
          lint(id, `.${attr.name}`)
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
      l10n.used.add(id)
      if (!id.match(valid.text)) {
        lint(id)
      }
    })
    return node
  }
}

for (const src of pugs('content')) {
  console.log(' ', src)

  fs.writeFileSync('/dev/null', pug.renderFile(src, {
    plugins: [{
      preCodeGen(ast) {
        pugwalk(L10NDetector, ast)
        return ast
      },
    }],
  }))
}

console.log('used but not defined:', [...l10n.used].filter(id => !l10n.defined.has(id)))
console.log('defined but not used:', [...l10n.defined].filter(id => !id.startsWith('unused_') && !l10n.used.has(id)))
