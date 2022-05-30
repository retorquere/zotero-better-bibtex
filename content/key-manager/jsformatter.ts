/* eslint-disable @typescript-eslint/no-unsafe-return */

import * as types from '../../gen/items/items'
import * as recast from 'recast'
import { builders as b } from 'ast-types'
import _ from 'lodash'
import { ajv } from '../ajv'
import { sprintf } from 'sprintf-js'
import jsesc from 'jsesc'

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
      if (type.prefixItems) {
        return {
          type: 'object',
          properties: {
            type: { const: 'ArrayExpression' },
            elements: {
              type: 'array',
              prefixItems: type.prefixItems.map(upgrade),
              items: type.items,
              minItems: type.minItems,
              maxItems: type.maxItems,
            },
            ...basics,
          },
          required: [ 'type', 'elements' ],
          additionalProperties: false,
        }
      }
      else {
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

type AjvFormatValidator = {
  (schema: any, format: string): boolean
  errors: {
    keyword: string
    message: string
    params: {
      keyword: 'creatorname' | 'postfix'
    }
  }[]
}
const creatorname = <AjvFormatValidator>((_schema, format) => {
  creatorname.errors = []
  let error = ''
  try {
    const expected = `${Date.now()}`
    const vars = { f: expected, g: expected, i: expected, I: expected }
    const found = sprintf(format, vars)
    if (found.includes(expected)) return true
    error = `${format} does not contain ${Object.keys(vars).map(v => `%(${v})s`).join('/')}`
  }
  catch (err) {
    error = err.message
  }

  creatorname.errors.push({
    keyword: 'creatorname',
    message: error,
    params: { keyword: 'creatorname' },
  })
  return false
})
ajv.addKeyword({
  keyword: 'creatorname',
  validate: creatorname,
})

const postfix = <AjvFormatValidator>((_schema, format) => {
  postfix.errors = []
  let error = ''
  try {
    const expected = `${Date.now()}`
    const vars = { a: expected, A: expected, n: expected }
    const found = sprintf(format, vars)
    if (!found.includes(expected)) {
      error = `${format} does not contain ${Object.keys(vars).map(v => `%(${v})s`).join('/')}`
    }
    else if (found.split(expected).length > 2) {
      error = `${format} contains multiple instances of ${Object.keys(vars).map(v => `%(${v})s`).join('/')}`
    }
    else {
      return true
    }
  }
  catch (err) {
    error = err.message
  }

  postfix.errors.push({
    keyword: 'postfix',
    message: error,
    params: { keyword: 'postfix' },
  })
  return false
})
ajv.addKeyword({
  keyword: 'postfix',
  validate: postfix,
})

const api: typeof methods = _.cloneDeep(methods)
for (const meta of Object.values(api)) {
  for (const property of Object.keys(meta.schema.properties)) {
    meta.schema.properties[property] = upgrade(meta.schema.properties[property])

    if (meta.name === '_formatDate' || meta.name === '$date') {
      meta.schema.properties[property].properties.value.pattern = '^([^%]|(%-?o?[ymdYDHMS]))+$'
    }
    else if (meta.name === '$postfix' && property === 'format') {
      // @ts-ignore
      meta.schema.properties[property].properties.value = { postfix: true }
    }
    else if (meta.name === '$authors' && property === 'name') {
      // @ts-ignore
      meta.schema.properties[property].properties.value = { creatorname: true }
    }
  }
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
  public warning = ''

  private patterns: AST
  private ftype: string

  constructor(source: string) {
    const finder = recast.parse('[].find(pattern => { try { return pattern() } catch (err) { if (err.next) return ""; throw err } })')
    this.patterns = finder.program.body[0].expression.callee.object.elements

    this.addpattern(recast.parse(source).program.body[0].expression)

    // eslint-disable-next-line prefer-template
    this.code = [
      recast.prettyPrint(finder.program.body[0].expression, {quote: 'single', tabWidth: 2}).code,
      // this.citekey is set as a side-effect
      'return this.citekey || ("zotero-" + this.item.id)',
    ].join(';\n')
  }

  private error(expr): void {
    throw new Error(`Unexpected ${expr.type} at ${expr.loc.start.column}`)
  }

  protected UnaryExpression(expr: AST, _context: Context): AST {
    if (expr.operator === '-' && expr.argument.type === 'Literal' && typeof expr.argument.value === 'number') {
      return b.literal(-1 * expr.argument.value)
    }
    else {
      this.error(expr)
    }
  }

  protected Literal(expr: AST, context: Context): AST {
    if (context.arguments) {
      return expr
    }
    else {
      return b.callExpression(b.identifier('text'), [expr])
    }
  }

  kind(str: string): 'function' | 'filter' {
    switch (str[0]) {
      case '$': return 'function'
      case '_': return 'filter'
      default: throw new Error(`indeterminate type for ${str}`)
    }
  }

  private resolveArguments(fname: string, args: AST[]): AST[] {
    const method = api[fname.toLowerCase()] // transitional before rename in formatter.ts
    const kind = this.kind(fname)
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

      args = method.parameters.map((param: string, i: number) => parameters[param] || ( typeof method.defaults[i] !== 'undefined' ? b.literal(method.defaults[i]) : b.identifier('undefined') ))
      args.reverse()
      const defaults = [...method.defaults].reverse()
      while(args.length && ((args[0].type === 'Identifier' && args[0].name === 'undefined') || (args[0].type === 'Literal' && args[0].value === defaults[0]))) {
        args.shift()
        defaults.shift()
      }
      args.reverse()
    }

    let err: string
    if (err = method.validate(parameters)) {
      throw new Error(`${me}: ${err} ${jsesc(parameters)}`)
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
    if (expr.left.name === 'joiner' || expr.left.name === 'join') {
      this.warning = `please use "sep" instead of "${expr.left.name}"`
      expr.left.name = 'sep'
    }
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
    let passed: string
    let callee: any
    let prefix: string

    switch (expr.type) {
      case 'CallExpression':
        if (expr.callee.type === 'Identifier' && this.ftype === '$') {
          prefix = this.ftype
          this.ftype = '_'
        }
        else {
          prefix = '_'
        }

        if (expr.callee.type === 'Identifier') {
          callee = expr.callee
        }
        else if (expr.callee.type === 'MemberExpression' && expr.callee.property.type === 'Identifier') {
          callee = expr.callee.property
        }
        else {
          throw expr
        }
        passed = callee.name
        callee.name = api[`${prefix}${passed}`.toLowerCase()]?.name
        if (!callee.name) throw new Error(`No such ${this.kind(prefix)} ${passed}`)

        expr.arguments = this.resolveArguments(callee.name, expr.arguments)
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

    this.patterns.push(b.arrowFunctionExpression([], expr, false))
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
