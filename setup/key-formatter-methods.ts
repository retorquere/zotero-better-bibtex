#!/usr/bin/env npx ts-node
/* eslint-disable prefer-template */

import * as ts from 'typescript'
import * as fs from 'fs'
import stringify = require('json.sortify')

const filename = 'content/key-manager/formatter.ts'
const ast = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest)

const types = { function: {}, filter: {} }
let m

const doc = {
  filters: {},
  functions: {},
}

function function_name(name: string, parameters: { name: string }[]) {
  name = name.replace(/_/g, '.')
  let names = [ name ]

  if (parameters.find(p => p.name === 'onlyEditors')) {
    if (name.startsWith('authors')) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      names = [ 'authors', 'editors' ].map((prefix: string) => name.replace(/^authors/, prefix))
    }
    else if (name === 'auth.auth.ea') {
      names = [ 'auth.auth.ea', 'edtr.edtr.ea' ]
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      names = [ 'auth', 'edtr' ].map((prefix: string) => name.replace(/^auth/, prefix))
    }
  }
  if (parameters.find(p => p.name === 'n')) {
    names = names.map(n => `${n}N`)
  }
  if (parameters.find(p => p.name === 'm')) {
    names = names.map(n => `${n}_M`)
  }
  let quoted = names.map(n => '`' + n + '`').join(' / ')
  if (parameters.find(p => p.name === 'withInitials')) {
    quoted += ', `+initials`'
  }
  if (parameters.find(p => p.name === 'joiner')) {
    quoted += ', `+<joinchar>`'
  }
  return quoted
}

function filter_name({ name, parameters }: { name: string, parameters: { name: string, optional: boolean, type: string} [] }) {
  name = '`' + name.replace(/_/g, '-') + '`'
  if (parameters && parameters.length) {
    name += '=' + parameters.map(p => `${p.name}${p.optional ? '?' : ''} (${p.type})`).join(', ')
  }
  return name
}

ast.forEachChild((node: ts.Node) => {
  // process only classes
  if (node.kind === ts.SyntaxKind.ClassDeclaration) {

    // get feautures of ClassDeclarations
    const cls: ts.ClassDeclaration = node as ts.ClassDeclaration

    // process class childs
    cls.forEachChild((_method: ts.Node) => {

      // limit proecssing to methods
      if (_method.kind === ts.SyntaxKind.MethodDeclaration) {
        const method = _method as ts.MethodDeclaration

        // process the right method with the right count of parameters
        // if (m = method.name.getText(ast).match(/^([$_])(.+)/)) {
        if (m = method.name.getText(ast).match(/^([$_])(.+)/)) {
          const [ , kind, name ] = m
          const parameters = method.parameters.map(p => ({ name: p.name.getText(ast), type: p.type?.getText(ast) || null, optional: !!(p.initializer || p.questionToken)}))
          parameters.forEach(p => { if (!p.optional) delete p.optional })
          if (kind === '_') {
            if (parameters[0]?.name !== 'value') throw new Error(`${kind}${name}: ${JSON.stringify(parameters)}`)
            parameters.shift()
          }
          if (parameters.find(p => !p.type)) throw new Error(`${kind}${name}: ${JSON.stringify(parameters)}`)

          types[{$: 'function', _: 'filter'}[kind]][name] = parameters

          const comment_ranges = ts.getLeadingCommentRanges(ast.getFullText(), method.getFullStart())
          if (comment_ranges) {
            let comment = ast.getFullText().slice(comment_ranges[0].pos, comment_ranges[0].end)
            if (comment.startsWith('/**')) {
              comment = comment.replace(/^\/\*\*/, '').replace(/\*\/$/, '').trim().split('\n').map(line => line.replace(/^\s*[*]\s*/, '')).join('\n').replace(/\n+/g, newlines => newlines.length > 1 ? '\n\n' : ' ')

              switch(kind) {
                case '$':
                  doc.functions[function_name(name, parameters)] = comment
                  break
                case '_':
                  doc.filters[filter_name({ name, parameters })] = comment
                  break
              }
            }
          }
        }
      }
    })
  }
})

fs.writeFileSync('gen/key-formatter-methods.json', JSON.stringify(types, null, 2))
fs.writeFileSync('site/data/citekeyformatters/functions.json', stringify(doc.functions, null, 2))
fs.writeFileSync('site/data/citekeyformatters/filters.json', stringify(doc.filters, null, 2))
