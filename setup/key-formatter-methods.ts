#!/usr/bin/env npx ts-node
/* eslint-disable prefer-template */

import * as ts from 'typescript'
import * as fs from 'fs'
const stringify = require('safe-stable-stringify')

const filename = 'content/key-manager/formatter.ts'
const ast = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest)

function kindName(node) {
  node.kindName = ts.SyntaxKind[node.kind]
  node.forEachChild(kindName)
}
kindName(ast)

const typesFor = { function: {}, filter: {} }

const doc = {
  filters: {},
  functions: {},
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const Method = new class {
  public signature: Record<string, any> = {}

  const2enum(types) {
    const consts = []
    const other = types.filter(type => {
      if (typeof type.const === 'undefined') return true
      consts.push(type.const)
      return false
    })

    switch (consts.length) {
      case 0:
      case 1:
        return types
      default:
        return other.concat({ enum: consts })
    }
  }

  types(node) {
    switch (node.kind) {
      case ts.SyntaxKind.UnionType:
        return { oneOf: this.const2enum(node.types.map(t => this.types(t)).filter(type => type)) }

      case ts.SyntaxKind.LiteralType:
        return { const: node.literal.text }

      case ts.SyntaxKind.StringKeyword:
        return { type: 'string' }

      case ts.SyntaxKind.BooleanKeyword:
        return { type: 'boolean' }

      case ts.SyntaxKind.TypeReference:
        return null

      case ts.SyntaxKind.NumberKeyword:
        return { type: 'number' }

      default:
        throw {...node, kindName: ts.SyntaxKind[node.kind] }
    }
  }

  type(node) {
    const types = this.types(node)

    if (types.oneOf) {
      assert(types.oneOf.length, types)
      if (types.oneOf.length === 1) {
        return types.oneOf[0]
      }
    }

    return types
  }

  add(method, method_name?: string): string {
    if (!method_name) method_name = method.name.kind === ts.SyntaxKind.Identifier ? method.name.escapedText : ''
    assert(method_name, method.name.getText(ast))
    if (!method_name.match(/^[$_])/)) return ''

    assert(!this.signature[method_name], `${method_name} already exists`))
    this.signature[method_name] = method.parameters.map(p => ({
      name: p.name.kind === ts.SyntaxKind.Identifier ? p.name.escapedText : '',
      type: this.type(p.type),
      optional: !!(p.initializer || p.questionToken),
      default: p.initializer,
    })
    this.signature[method_name].forEach(p => {
      if (!p.optional) delete p.optional
      if (typeof p.default === 'undefined') delete p.default
    })

    return method_name
  }
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
  let method_name

  // process only classes
  if (node.kind === ts.SyntaxKind.ClassDeclaration) {

    // get feautures of ClassDeclarations
    const cls: ts.ClassDeclaration = node as ts.ClassDeclaration

    // process class childs
    cls.forEachChild((_method: ts.Node) => {

      // limit proecssing to methods
      if (method.kind === ts.SyntaxKind.MethodDeclaration && (method_name = Method.add(method as ts.MethodDeclaration))) {
        const kind = method_name[0]
        const name = method_name.substr(1)

        if (kind === '_') {
          if (Method.signature[method_name][0]?.name !== 'value') throw new Error(`${kind}${name}: ${JSON.stringify(parameters)}`)
          parameters.shift()
        }

        const comment_ranges = ts.getLeadingCommentRanges(ast.getFullText(), method.getFullStart())
        assert(comment_ranges, `${method_name} has no documentation`)
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
    })
  }
})

fs.writeFileSync('gen/key-formatter-methods.json', JSON.stringify(typesFor, null, 2))
fs.writeFileSync('site/data/citekeyformatters/functions.json', stringify(doc.functions, null, 2))
fs.writeFileSync('site/data/citekeyformatters/filters.json', stringify(doc.filters, null, 2))
