#!/usr/bin/env npx ts-node
/* eslint-disable prefer-template, @typescript-eslint/no-unsafe-return */

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

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const Method = new class {
  public signature: Record<string, any> = {}
  public doc: { function: Record<string, any>, filter: Record<string, any> } = { function: {}, filter: {} }

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
        throw {...node, kindName: ts.SyntaxKind[node.kind] } // eslint-disable-line no-throw-literal
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

  private typedoc(type): string {
    if (['boolean', 'string', 'number'].includes(type.type)) return type.type
    if (type.oneOf) return type.oneOf.map(t => this.typedoc(t)).join(' | ')
    if (type.const) return JSON.stringify(type.const)
    if (type.enum) return type.enum.map(t => this.typedoc({ const: t })).join(' | ')
    throw new Error(`no rule for ${JSON.stringify(type)}`)
  }

  initializer(init) {
    if (!init) return undefined
    switch (init.kind) {
      case ts.SyntaxKind.StringLiteral:
        return init.text

      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.FirstLiteralToken: // https://github.com/microsoft/TypeScript/issues/18062
        assert(!isNaN(parseFloat(init.text)), `${init.text} is not a number`)
        return parseFloat(init.text)

      default:
        throw new Error(`Unexpected type ${init.type} of initializer ${JSON.stringify(init)}`)
    }
  }

  add(method: ts.MethodDeclaration) {
    const method_name: string = method.name.kind === ts.SyntaxKind.Identifier ? method.name.escapedText as string : ''
    assert(method_name, method.name.getText(ast))
    if (!method_name.match(/^[$_]/)) return
    let method_name_edtr = ''

    assert(!this.signature[method_name], `${method_name} already exists`)
    const params = method.parameters.map(p => ({
      name: p.name.kind === ts.SyntaxKind.Identifier ? (p.name.escapedText as string) : '',
      type: p.type? this.type(p.type) : { type: typeof this.initializer(p.initializer) },
      optional: !!(p.initializer || p.questionToken),
      default: this.initializer(p.initializer),
    }))
    const kind = {$: 'function', _: 'filter'}[method_name[0]]
    let names = [ method_name.substr(1) ]
    if (params.find(p => p.name === 'onlyEditors')) {
      for (const [author, editor] of [['authors', 'editors'], ['auth.auth', 'edtr.edtr'], [ 'auth', 'edtr' ]]) {
        if (names[0].startsWith(author)) {
          names.push(names[0].replace(author, editor))
          method_name_edtr = editor
          break
        }
      }
    }
    names = names.map(n => n.replace(/__/g, '.').replace(/_/g, '-'))
    if (kind === 'function') {
      if (params.find(p => p.name === 'n')) names = names.map(n => `${n}N`)
      if (params.find(p => p.name === 'm')) names = names.map(n => `${n}_M`)
    }
    let quoted = names.map(n => '`' + n + '`').join(' / ')
    switch (kind) {
      case 'function':
        if (params.find(p => p.name === 'withInitials')) quoted += ', `+initials`'
        if (params.find(p => p.name === 'joiner')) quoted += ', `+<joinchar>`'
        break
      case 'filter':
        if (params.length) quoted += '=' + params.map(p => `${p.name}${p.optional ? '?' : ''} (${this.typedoc(p.type)})`).join(', ')
        break
    }

    const comment_ranges = ts.getLeadingCommentRanges(ast.getFullText(), method.getFullStart())
    assert(comment_ranges, `${method_name} has no documentation`)
    let comment = ast.getFullText().slice(comment_ranges[0].pos, comment_ranges[0].end)
    assert(comment.startsWith('/**'), `comment for ${method_name} does not start with a doc-comment indicator`)
    comment = comment.replace(/^\/\*\*/, '').replace(/\*\/$/, '').trim().split('\n').map(line => line.replace(/^\s*[*]\s*/, '')).join('\n').replace(/\n+/g, newlines => newlines.length > 1 ? '\n\n' : ' ')
    this.doc[kind][quoted] = comment

    const schema = {
      type: 'object',
      properties: {},
      additionalProperties: false,
      required: [],
    }
    names = []
    for (const p of params) {
      names.push(p.name)
      if (!p.optional) schema.required.push(p.name)
      schema.properties[p.name] = p.type
    }
    if (!schema.required.length) delete schema.required

    this.signature[method_name] = JSON.parse(JSON.stringify({
      arguments: names,
      schema,
    }))
    if (method_name_edtr) {
      this.signature[method_name_edtr] = JSON.parse(JSON.stringify({
        arguments: names,
        schema,
      }))

      for (const mname of [method_name, method_name_edtr]) {
        this.signature[mname].schema.properties.onlyEditors = { const: mname === method_name_edtr }
      }
    }
  }
}

ast.forEachChild((node: ts.Node) => {
  // process only classes
  if (node.kind === ts.SyntaxKind.ClassDeclaration) {

    // get feautures of ClassDeclarations
    const cls: ts.ClassDeclaration = node as ts.ClassDeclaration

    // process class childs
    cls.forEachChild((method: ts.Node) => {
      if (method.kind === ts.SyntaxKind.MethodDeclaration) Method.add(method as ts.MethodDeclaration)
    })
  }
})

fs.writeFileSync('gen/key-formatter-methods.json', JSON.stringify(Method.signature, null, 2))
fs.writeFileSync('site/data/citekeyformatters/functions.json', stringify(Method.doc.function, null, 2))
fs.writeFileSync('site/data/citekeyformatters/filters.json', stringify(Method.doc.filter, null, 2))
