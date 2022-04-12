/* eslint-disable @typescript-eslint/no-unsafe-return */

import * as types from '../../gen/items/items'
import * as recast from 'recast'
import { builders as b } from 'ast-types'
import _ from 'lodash'

type AST = any

import { methods } from '../../gen/api/key-formatter'
// move this upgrade to setup/extract-api after migration
const object_or_null = { oneOf: [ { type: 'object' }, { type: 'null' } ] }
const basics = {
  loc: object_or_null,
  comments: object_or_null,
  regex: object_or_null,
}
function upgrade(type) {
  switch (type.type) {
    case 'string':
    case 'number':
    case 'boolean':
      return {
        type: 'object',
        properties: {
          type: { const: 'Literal' },
          value: { type: type.type },
          raw: { type: 'string' },
          ...basics,
        },
        required: [ 'type', 'value' ],
        additionalProperties: false,
      }

    case 'array':
      return {
        type: 'object',
        properties: {
          type: { const: 'ArrayExpression' },
          elements: { type: 'array', items: upgrade(type.items) },
          ...basics,
        },
        required: [ 'type', 'elements' ],
        additionalProperties: false,
      }
  }

  if (typeof type.const !== 'undefined') {
    return {
      type: 'object',
      properties: {
        type: { const: 'Literal' },
        value: { const: type.const },
        raw: { type: 'string' },
        ...basics,
      },
      required: [ 'type', 'value' ],
      additionalProperties: false,
    }
  }

  if (type.instanceof === 'RegExp') {
    return {
      type: 'object',
      properties: {
        type: { const: 'Literal' },
        value: { type: 'object' },
        raw: { type: 'string' },
        ...basics,
        regex: {
          type: 'object',
          properties: {
            pattern: { type: 'string' },
            flags: { type: 'string' },
            ...basics,
          },
          required: [ 'pattern', 'flags' ],
          additionalProperties: false,
        },
      },
      required: [ 'type', 'regex' ],
      additionalProperties: false,
    }
  }

  if (type.oneOf) {
    return { oneOf: type.oneOf.map(t => upgrade(t)) }
  }

  if (type.anyOf) {
    return { anyOf: type.anyOf.map(t => upgrade(t)) }
  }

  throw { notUpgradable: type } // eslint-disable-line no-throw-literal
}
const api: typeof methods = _.cloneDeep(methods)
for (const meta of Object.values(api)) {
  for (const property of Object.keys(meta.schema.properties)) {
    meta.schema.properties[property] = upgrade(meta.schema.properties[property])
  }
}

const methodnames: Record<string, string> = Object.keys(api).reduce((acc, name) => { acc[name.toLowerCase()]=name; return acc }, {} as Record<string, string>)
function findMethod(fname: string): string {
  return methodnames[fname.toLowerCase()] || ''
}

import { validator } from '../ajv'
for (const method of Object.values(api)) {
  (method  as any).validate = validator((method  as any).schema)
}

for (const fname in api) {
  if (fname[0] !== '_' && fname[0] !== '$') throw new Error(`Unexpected fname ${fname}`)
}

type Context = { arguments?: boolean, coerce?: boolean }
export class PatternParser {
  public code: string
  private finder: AST
  private ftype: string

  constructor(source: string) {
    this.finder = recast.parse('[].find(pattern => { try { return pattern() } catch (err) { if (err.next) return ""; throw err } })')
    this.addpattern(recast.parse(source).program.body[0].expression)
    this.insert(recast.parse('"zotero-" + this.item.id').program.body[0].expression, false)
    this.code = recast.prettyPrint(this.finder, {tabWidth: 2}).code
  }

  private error(expr): void {
    throw new Error(`Unexpected ${expr.type} at ${expr.loc.start.column}`)
  }

  protected Literal(expr: AST, _context: Context): AST {
    return expr
  }

  private resolveArguments(fname: string, args: AST[]): AST[] {
    const method = api[findMethod(fname)] // transitional before rename in formatter.ts
    const kind = {$: 'function', _: 'filter'}[fname[0]]
    fname = fname.slice(1)
    const me = `${kind} ${JSON.stringify(fname)}`
    if (!method) throw new Error(`No such ${me}`)

    let named = false
    args.forEach((arg, i) => {
      if (!arg.named_argument) {
        if (named) throw new Error(`${me}: positional argument ${i+1} after named argument`)
        arg.named_argument = method.parameters[i]
      }
      else {
        if (method.rest) throw new Error(`${me}: named argument not supported in rest function`)
        named = true
      }
    })

    let parameters: Record<string, AST> = {}
    args = args.map(arg => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { named_argument, loc, ...argc } = arg
      if (typeof parameters[named_argument] === 'undefined') {
        parameters[named_argument] = argc
      }
      else {
        throw new Error(`${me}: duplicate argument ${JSON.stringify(named_argument)}`)
      }
      return argc
    })

    if (method.rest) {
      if (method.parameters.length !== 1) throw new Error(`${me}: ...rest method may have only one parameter, got ${method.parameters.join(', ')}`)
      parameters = { [method.rest]: b.arrayExpression(args) }
    }
    else {
      if (method.parameters.length < args.length) throw new Error(`${me}: expected ${method.parameters.length} arguments, got ${args.length}`)

      args = method.parameters.map((param: string) => parameters[param] || b.identifier('undefined'))
      let arg
      while (args.length && (arg = args[args.length - 1]).type === 'Identifier' && arg.name === 'undefined') args.pop()
    }

    let err: string
    if (err = method.validate(parameters)) {
      throw new Error(`${me}: ${err}`)
    }

    return args
  }

  protected Identifier(expr: AST, context: Context): AST {
    if (context.arguments) {
      return b.literal(expr.name)
    }
    else if (expr.type !== 'Identifier') {
      return expr
    }
    else if (expr.name.match(/^(auth|edtr|editors)[a-zA-Z]*$/)) {
      return b.callExpression(b.identifier(expr.name), [])
    }
    else if (expr.name.match(/^[A-Z]/)) {
      const name = types.name.field[expr.name.toLowerCase()]
      if (!name) throw new Error(`No such field ${expr.name}`)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return b.callExpression(b.identifier('getField'), [ b.literal(name) ])
    }
    else {
      return b.callExpression(expr, [])
    }
  }

  protected CallExpression(expr: AST, context: Context): AST {
    const callee = (expr.callee.type === 'MemberExpression') ? { ...expr.callee, object: this.convert(expr.callee.object, context) } : expr.callee
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...expr,
      callee,
      arguments: expr.arguments.map((arg: AST) => this.convert(arg, {...context, arguments: true })),
    }
  }

  protected MemberExpression(expr: AST, context: Context): AST {
    return {
      ...expr,
      object: this.convert(expr.object, context),
      property: this.convert(expr.property, context),
    }
  }

  protected AssignmentExpression(expr: AST, context: Context): AST {
    if (!context.arguments) this.error(expr)
    return {...this.convert(expr.right, context), named_argument: expr.left.name}
  }

  protected BinaryExpression(expr: AST, context: Context): AST {
    if (expr.operator !== '+') this.error(expr)
    return {
      ...expr,
      left: this.convert(expr.left, context),
      right: this.convert(expr.right, context),
    }
  }

  private addThis(expr: AST, context: Context): AST {
    let this_expr: AST
    switch (expr.type) {
      case 'BinaryExpression':
        if (expr.operator !== '+') throw expr
        return {
          ...expr,
          left: this.addThis(expr.left, context),
          right: this.addThis(expr.right, context),
        }
      case 'Literal':
        return expr
      default:
        this_expr = b.memberExpression(b.thisExpression(), expr, false)
        if (context.coerce) { // add leading empty string to force coercion to string
          context.coerce = false
          // return b.binaryExpression('+', b.literal(''), this_expr)
          return b.binaryExpression('+',
            b.assignmentExpression(
              '=',
              b.memberExpression(b.thisExpression(), b.identifier('citekey'), false),
              b.literal('')
            ),
            this_expr
          )
        }
        else {
          return this_expr
        }
    }
  }

  private convert(expr: AST, context: Context): AST {
    if (!this[expr.type]) this.error(expr)
    return this[expr.type](expr, context) as AST
  }

  private resolve(expr: AST) {
    let fname: string

    switch (expr.type) {
      case 'CallExpression':
        if (expr.callee.type === 'Identifier' && this.ftype === '$') {
          fname = this.ftype
          this.ftype = '_'
        }
        else {
          fname = '_'
        }

        if (expr.callee.type === 'Identifier') {
          fname = expr.callee.name = `${fname}${expr.callee.name}`
        }
        else if (expr.callee.type === 'MemberExpression' && expr.callee.property.type === 'Identifier') {
          fname = expr.callee.property.name = `${fname}${expr.callee.property.name}`
        }
        else {
          throw expr
        }

        expr.arguments = this.resolveArguments(fname, expr.arguments)
        this.resolve(expr.callee)
        break

      case 'MemberExpression':
        this.resolve(expr.object)
        this.resolve(expr.property)
        break

      case 'BinaryExpression':
        this.ftype = '$'
        this.resolve(expr.left)
        this.ftype = '$'
        this.resolve(expr.right)
        break

      case 'Literal':
      case 'Identifier':
        break

      default:
        throw new Error(`Cannot resolve ${expr.type}`)
    }
  }

  private insert(expr: AST, convert=true) {
    if (convert) {
      expr = this.convert(expr, {})
      this.ftype = '$'
      this.resolve(expr)
      expr = this.addThis(expr, { coerce: true })
    }

    // const wrapper = reset this.citekey
    this.finder.program.body[0].expression.callee.object.elements.push(b.arrowFunctionExpression([], expr, true))
  }

  private addpattern(expr: AST) {
    if (expr.type === 'BinaryExpression' && expr.operator === '|') {
      this.addpattern(expr.left)
      this.insert(expr.right)
    }
    else {
      this.insert(expr)
    }
  }
}

export function parse(pattern: string): string {
  return (new PatternParser(pattern)).code
}
