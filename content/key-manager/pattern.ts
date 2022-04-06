const fs = require("fs");
const recast = require("recast");
const util = require('util')
function show(obj) {
  return JSON.stringify(obj, null, 2)
}

const api = require('./gen/api/key-formatter.json')
const methodnames = {}
function findMethod(fname) {
  if (typeof methodnames[fname] !== 'undefined') return methodnames[fname]

  const uscore = fname.replace(/([A-Z])/g, chr => '_' + chr.toLowerCase())
  const duscore = fname.replace(/([A-Z])/g, chr => '__' + chr.toLowerCase())
  for (const name of Object.keys(api)) {
    if ([uscore, duscore].includes(name.toLowerCase())) {
      return (methodnames[fname] = name)
    }
  }
  return (methodnames[fname] = '')
}

type AST = any

const Ajv = require("ajv")
const ajv = new Ajv()
const betterAjvErrors = require('better-ajv-errors').default

for (const method of Object.values(api)) {
  (method as unknown as any).validate = ajv.compile((method as unknown as any).schema)
}

for (const fname in api) {
  if (fname[0] !== '_' && fname[0] !== '$') throw new Error(`Unexpected fname ${fname}`)
}

var source = [
  'Auth.lower.capitalize() + "xxx"',
  'auth.lower',
`
 type(forumPost, WebPage)
  + Auth.lower.capitalize
  + journal(abbrev=abbrev)
  + Date.formatDate('%Y-%m-%d.%H:%M:%S').prefix('.').replace(/x/g, 'a')
  + PublicationTitle.select(1,1).lower.capitalize.prefix('.')
  + shorttitle(3,3).lower.capitalize.prefix('.')
  + Pages.prefix('.p.')
  + Volume.prefix('.Vol.')
  + NumberofVolumes.prefix(de)
`,
`Auth.lower.capitalize
  + date('%oY').prefix('.')
  + PublicationTitle.select(1,1).lower.capitalize.prefix('.')
  + shorttitle(3,3).lower.capitalize.prefix('.')
  + Pages.prefix('.p.')
  + Volume.prefix('.Vol.')
  + NumberofVolumes.prefix(de)
  `
].join(' | ')

class PatternParser {
  public code: string
  private finder: AST

  constructor(source) {
    this.finder = recast.parse('[].find(pattern => { try { return pattern() } catch (err) { if (err.next) return ""; throw err } })')
    this.addpattern(recast.parse(source).program.body[0].expression)
    this.code = recast.prettyPrint(this.finder, {tabWidth: 2}).code
  }

  error(expr) {
    throw new Error(`Unexpected ${expr.type} at ${expr.loc.start.column}`)
  }

  Literal(expr, context) {
    return expr
  }

  /*
  function creator(name) {
    const m = name.match(/^(([Aa]uthors|[Aa]uth)|([Ee]dtr|[Ee]ditors))([.a-zA-Z]*)$/)
    if (!m) return m

    const [ , prefix, author, editor, rest ] = m
    const function_name = `${prefix}${rest}`
    
    const scrub = prefix[0] === prefix[0].toLowerCase()

    
  }
  */

  private resolveArguments(fname: string, args: AST[]): AST[] {
    const method = api[findMethod(fname)] // transitional before rename in formatter.ts
    const kind = {$: 'function', _: 'filter'}[fname[0]]
    fname = fname.slice(1)
    const me = `${kind} ${JSON.stringify(fname)}`
    if (!method) throw new Error(`No such ${me}`)

    const disarray = args.find((arg, i) => arg.named_argument && args[i+1] && !args[i+1].named_argument)
    if (disarray) throw new Error(`${me}: named argument ${disarray.named_argument} is followed by positional arguments`)

    const parameters = {}
    if (method.rest) {
      if (method.parameters.length !== 1) throw new Error(`${me}: ...rest method may have only one parameter, got ${method.parameters.join(', ')}`)
      if (args.find(arg => arg.named_argument)) throw new Error(`${me}: named argument not supported in rest function`)
      args = args.map(({ loc, ...arg }) => arg)
      parameters[method.rest] = { type: 'ArrayExpression', elements: args }
    }
    else {
      if (method.parameters.length < args.length) throw new Error(`${me}: expected ${method.parameters.length} arguments, got ${args.length}`)

      const names = []
      args = args.map((arg, i) => {
        let { named_argument, loc, ...argc } = arg
        const name = named_argument || method.parameters[i]
        if (names.includes(name)) throw new Error(`${me}: duplicate parameter ${name}`)
        names.push(name)
        parameters[name] = argc
        return argc
      })
      args = method.parameters.map(param => parameters[param] || { type: 'Identifier', name: 'undefined' })
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

  private Identifier(expr: AST, context: any): AST {
    let m
    if (context.arguments) {
      return { type: 'Literal', value: expr.name }
    }
    else if (expr.type !== 'Identifier') {
      return expr
    }
    else if (m = expr.name.match(/^(([Aa]uth|[Aa]uthors)|([Ee]dtr|[Ee]ditors))([\.a-zA-Z]*)$/)) {
      const [ fname , prefix, author, editor, rest ] = m
      const onlyEditors = !!editor
      const scrub = !!prefix.match(/^[ae]/)

      const method = api[findMethod(`$${fname}`)]
      if (!method) throw new Error(`No such function ${fname}`)

      const args = [ { 'type': 'Literal', value: scrub, named_argument: 'scrub' } ]
      if (method.parameters.includes('onlyEditors')) args.push({ 'type': 'Literal', value: onlyEditors, named_argument: 'onlyEditors' })
      return {
        type: 'CallExpression',
        callee: { 'type': 'Identifier', name: method },
        arguments: args,
      } as AST
    }
    else if (expr.name.match(/^[A-Z]/)) {
      // TODO: field lookup here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {type: 'CallExpression', callee: { 'type': 'Identifier', name: 'get_field' }, arguments: [ { type: 'Literal', value: expr.name.replace(/^./, c => c.toLowerCase()) } ]} as AST
    }
    else {
      return { type: 'CallExpression', callee: expr, arguments: [] } as AST
    }
  }

  private CallExpression(expr: AST, context: any): AST {
    const callee = (expr.callee.type === 'MemberExpression') ? { ...expr.callee, object: this.convert(expr.callee.object, context) } : expr.callee
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...expr,
      callee,
      arguments: expr.arguments.map((arg: AST) => this.convert(arg, {...context, arguments: true })),
    }
  }

  private MemberExpression(expr: AST, context: any): AST {
    return {
      ...expr,
      object: this.convert(expr.object, context),
      property: this.convert(expr.property, context),
    }
  }

  private AssignmentExpression(expr: AST, context: any): AST {
    if (!context.arguments) this.error(expr)
    return {...this.convert(expr.right, context), named_argument: expr.left.name}
  }

  private BinaryExpression(expr: AST, context: any): AST {
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

  resolve(expr) {
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

  insert(expr) {
    expr = this.convert(expr, {})
    this.ftype = '$'
    this.resolve(expr)
    expr = this.addThis(expr, { coerce: true })

    this.finder.program.body[0].expression.callee.object.elements.push({ type: 'ArrowFunctionExpression', params: [], body: expr, expression: true })
  }

  addpattern(expr) {
    if (expr.type === 'BinaryExpression' && expr.operator === '|') {
      this.addpattern(expr.left)
      this.insert(expr.right)
    }
    else {
      this.insert(expr)
    }
  }
}

// console.log(new PatternParser(source).code)
