/* eslint-disable @typescript-eslint/no-unsafe-return */

import * as recast from 'recast'
import api from '../../gen/api/key-formatter.json'
const methodnames: Record<string, string> = Object.keys(api).reduce((acc, name) => { acc[name.toLowerCase()]=name; return acc }, {} as Record<string, string>)
function findMethod(fname: string): string {
  const uscore = fname.replace(/[a-z][A-Z]/g, chr => `${chr[0]}_${chr[1]}`).toLowerCase()
  const duscore = fname.replace(/[a-z][A-Z]/g, chr => `${chr[0]}__${chr[1]}`).toLowerCase()
  for (const prefix of ['', '$', '_']) {
    for (let name of [uscore, duscore]) {
      if (name = methodnames[prefix + name]) return name
    }
  }
  return ''
}

type AST = any
type Creator = { fname?: string, onlyEditors?: boolean, scrub?: boolean, joiner?: string }

const Ajv = require('ajv')
const ajv = new Ajv()
const betterAjvErrors = require('better-ajv-errors').default

for (const method of Object.values(api)) {
  (method  as any).validate = ajv.compile((method  as any).schema)
}

for (const fname in api) {
  if (fname[0] !== '_' && fname[0] !== '$') throw new Error(`Unexpected fname ${fname}`)
}

console.log('started', new Date)

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

  protected Literal(expr: AST, _context: any): AST {
    return expr
  }

  private creator(name :string): Creator {
    const m = name.match(/^[$]?(([Aa]uthors|[Aa]uth)|([Ee]dtr|[Ee]ditors))([.a-zA-Z]*)$/)
    if (!m) return null

    const [ , prefix, , editor, rest ] = m
    const function_name = `${prefix}${rest}`
    const onlyEditors = !!editor
    const scrub = !!prefix.match(/^[ae]/)
    const joiner = ''

    let fname = ''
    for (let [author, editor] of [['authors', 'editors'], ['author', 'editor'], ['authAuth', 'edtrEdtr'], [ 'auth', 'edtr' ]]) {
      fname = function_name.startsWith(editor) ? fname = function_name.replace(editor, author) : function_name
      if (fname = findMethod(fname)) break

      author = author[0].toUpperCase() + author.slice(1)
      editor = editor[0].toUpperCase() + editor.slice(1)
      fname = function_name.startsWith(editor) ? fname = function_name.replace(editor, author) : function_name
      if (fname = findMethod(fname)) break
    }

    const method = api[fname]
    if (!method) return null

    const auth = { fname: fname.substr(1), joiner, scrub, onlyEditors, withInitials: false }
    for (const field of Object.keys(auth)) {
      if (!method.parameters.includes(field) && field !== 'fname') delete auth[field]
    }
    return auth
  }

  private resolveArguments(fname: string, args: AST[], extra: Record<string, number | string | boolean> = {}): AST[] {
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

    for (const [named_argument, value] of Object.entries(extra)) {
      if (method.rest) throw new Error(`${me}: unexpected extra arguments for rest method`)
      if (typeof value !== 'undefined' && !args.find(arg => arg.named_argument === named_argument)) {
        args.push({ type: 'Literal', value, named_argument })
      }
    }

    let parameters = {}
    args = args.map((arg, i) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let { named_argument, loc, ...argc } = arg
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
      parameters = { [method.rest]: { type: 'ArrayExpression', elements: args } }
    }
    else {
      if (method.parameters.length < args.length) throw new Error(`${me}: expected ${method.parameters.length} arguments, got ${args.length}`)

      args = method.parameters.map((param: string) => parameters[param] as AST || { type: 'Identifier', name: 'undefined' } as AST)
      let arg
      while (args.length && (arg = args[args.length - 1]).type === 'Identifier' && arg.name === 'undefined') args.pop()
    }

    if (!method.validate(parameters)) {
      const err = betterAjvErrors(method.schema, parameters, method.validate.errors, { format: 'js' })[0]
      let msg = err.error
      if (err.path && err.path[0] === '/') msg = msg.replace(err.path, JSON.stringify(err.path.substr(1)))
      if (err.suggestion) msg += `, ${err.suggestion}`
      throw new Error(`${me}: ${msg}`)
    }

    return args
  }

  protected Identifier(expr: AST, context: any): AST {
    let author: Creator
    let fname: string
    if (context.arguments) {
      return { type: 'Literal', value: expr.name }
    }
    else if (expr.type !== 'Identifier') {
      return expr
    }
    else if (author = this.creator(expr.name)) {
      ({ fname, ...author } = author)
      const method = api[`$${fname}`]
      if (!method) throw new Error(`No such function ${fname}`)

      const args = Object.entries(author).map(([named_argument, value]) => ({ type: 'Literal', value, named_argument }))
      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: fname },
        arguments: args,
      } as AST
    }
    else if (expr.name.match(/^[A-Z]/)) {
      // TODO: field lookup here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {type: 'CallExpression', callee: { type: 'Identifier', name: 'get_field' }, arguments: [ { type: 'Literal', value: expr.name.replace(/^./, c => c.toLowerCase()) } ]} as AST
    }
    else {
      return { type: 'CallExpression', callee: expr, arguments: [] } as AST
    }
  }

  protected CallExpression(expr: AST, context: any): AST {
    const callee = (expr.callee.type === 'MemberExpression') ? { ...expr.callee, object: this.convert(expr.callee.object, context) } : expr.callee
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...expr,
      callee,
      arguments: expr.arguments.map((arg: AST) => this.convert(arg, {...context, arguments: true })),
    }
  }

  protected MemberExpression(expr: AST, context: any): AST {
    return {
      ...expr,
      object: this.convert(expr.object, context),
      property: this.convert(expr.property, context),
    }
  }

  protected AssignmentExpression(expr: AST, context: any): AST {
    if (!context.arguments) this.error(expr)
    return {...this.convert(expr.right, context), named_argument: expr.left.name}
  }

  protected BinaryExpression(expr: AST, context: any): AST {
    if (expr.operator !== '+') this.error(expr)
    return {
      ...expr,
      left: this.convert(expr.left, context),
      right: this.convert(expr.right, context),
    }
  }

  private addThis(expr: AST, context: any): AST {
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
        this_expr = { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: expr }
        if (context.coerce) {
          context.coerce = false
          return {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: '' },
            right: this_expr,
          }
        }
        else {
          return this_expr
        }
    }
  }

  private convert(expr: AST, context: any): AST {
    if (!this[expr.type]) this.error(expr)
    return this[expr.type](expr, context) as AST
  }

  private resolve(expr: AST) {
    let fname: string
    let author: Partial<Creator>

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

        if (author = this.creator(fname)) {
          ({ fname, ...author } = author)
          fname = `$${fname}`
        }
        else {
          author = {}
        }

        expr.arguments = this.resolveArguments(fname, expr.arguments, author)
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

    this.finder.program.body[0].expression.callee.object.elements.push({ type: 'ArrowFunctionExpression', params: [], body: expr, expression: true })
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
