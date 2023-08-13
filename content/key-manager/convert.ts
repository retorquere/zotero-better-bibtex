import { parse } from 'acorn'
import { methods } from '../../gen/api/key-formatter'
const alias = require('./alias.json')
import * as items from '../../gen/items/items'

type Node = {
  type: string
  optional: boolean
  computed: boolean

  // expression
  expression: Node

  // program
  body: Node[]

  // identifier
  name: string

  // assignment
  left: Node
  right: Node

  // member
  object: Node
  property: Node

  // unary and binary
  operator: string

  // literal
  value: string | number
  raw: string
  regex?: {
    pattern: string
    flags: string
  }

  // unary
  prefix: boolean
  argument: Node

  // array
  elements: Node[]

  // callexpression
  callee: Node
  arguments: Node[]

  // conditionalexpression
  test: Node
  consequent: Node
  alternate: Node

  start?: number
  loc?: {
    start: {
      line: number
      column: number
    }
  }
}

type Argument = {
  name: string
  value: Node
}

class Compiler {
  error(node: Node, message) {
    if (node) {
      if (node.loc) {
        if (node.loc.start.line > 1) throw new Error(`${message} at line ${node.loc.start.line}, position ${node.loc.start.column + 1}`)
        throw new Error(`${message} at position ${node.loc.start.column + 1}`)
      }
      if (typeof (node as unknown as any).start === 'number') throw new Error(`${message} at position ${node.start + 1}`)
    }
    throw new Error(message)
  }

  get(node: Node, allowed): Node {
    if (typeof allowed === 'string') allowed = [ allowed ]
    if (!node) this.error(node, `expected ${allowed.join(' | ')} at end of input`)
    if (!allowed.includes(node.type) && !allowed.includes(node.operator)) this.error(node, `expected ${allowed.join(' | ')}, got ${node.type}`)
    if (node.computed) this.error(node, 'unsupported computed attribute')
    if (node.optional) this.error(node, 'unsupported optional attribute')
    return node
  }

  split(ast: Node, operator): Node[] {
    const parts: Node[] = []
    while (ast.type === 'BinaryExpression' && ast.operator === operator) {
      parts.unshift(ast.right)
      ast = ast.left
    }
    parts.unshift(ast)
    return parts
  }

  $formula(ast: Node, wrap=false): string {
    let formula = `this.finalize(this.reset() + ${this.split(ast, '+').map((term: Node) => this.$term(term)).join(' + ')})`
    if (wrap) formula = `sub(function() { return ${formula} })`
    return formula
  }

  compile(formula: string): string {
    // the typedefs from acorn are worse than useless
    const program = this.get(parse(formula, { locations: true, ecmaVersion: 2020 }) as unknown as Node, 'Program')
    if (!program.body.length) this.error(null, 'No input')
    const formulas: Node[] = program.body.length > 1
      ? program.body.map((stmt: Node) => this.get(stmt, 'ExpressionStatement').expression)
      : this.split(this.get(program.body[0], 'ExpressionStatement').expression, '|')

    const compiled = formulas.map((candidate: Node) => `    () => ${this.$formula(candidate)},`).join('\n')
    return `  const sub = f => f.call(Object.create(this))
  return [
${compiled}
  ].reduce((citekey, formula) => citekey || formula(), '') || ('zotero-' + this.item.id)`
  }

  flatten(node: Node): Node[] {
    switch (node.type) {
      case 'MemberExpression':
        return this.flatten(node.object).concat(this.flatten(node.property))
      case 'CallExpression':
        return this.flatten(node.callee).concat([node])
      case 'Identifier':
      case 'ConditionalExpression':
        return [node]
      case 'LogicalExpression':
        if (node.operator !== '||') this.error(node, `unexpected ${node.type} operator ${node.operator}`)
        return [node]
      case 'Literal':
        if (typeof node.value !== 'string') this.error(node, `expected string, got ${this.$typeof(node)}`)
        return [node]
      default:
        this.error(node, `unexpected ${node.type}`)
    }
  }

  $term(node) {
    if (node.type === 'Literal') {
      if (typeof node.value !== 'string') this.error(node, `expected string, got ${this.$typeof(node)}`)
      return `this.$text(${node.raw})`
    }

    const flat = this.flatten(node)
    let compiled = 'this'
    let prefix = '$'
    while (flat.length) {
      const identifier = this.get(flat.shift(), ['Identifier'].concat(prefix === '$' ? ['LogicalExpression', 'ConditionalExpression'] : []))

      if (identifier.type === 'ConditionalExpression') {
        const test = this.$formula(identifier.test, true)
        const consequent = this.$formula(identifier.consequent, true)
        const alternate = this.$formula(identifier.alternate, true)
        compiled += `.$text(${test} ? ${consequent} : ${alternate})`
      }
      else if (identifier.type === 'LogicalExpression') {
        const left = this.$formula(identifier.left, true)
        const right = this.$formula(identifier.right, true)
        compiled += `.$text(${left} || ${right})`
      }
      else if (prefix === '$' && identifier.name[0] === identifier.name[0].toUpperCase()) {
        if (flat[0] && flat[0].type === 'CallExpression') this.error(flat[0], `field "${identifier.name}" cannot be called as a function`)
        const name = items.name.field[identifier.name.toLowerCase()]
        if (!name) this.error(identifier, `Zotero items do not have a field named "${identifier.name}"`)
        compiled += `.${prefix}getField("${name}")`
      }
      else {
        const name = `${prefix}${identifier.name.toLowerCase()}`
        const $name = alias[name] || name
        const method = methods[$name]
        if (!method) this.error(identifier, `Unknown ${prefix === '$' ? 'function' : 'filter'} ${identifier.name}`)

        compiled += `.${method.name}(`
        if (flat[0] && flat[0].type === 'CallExpression') {
          compiled += this.$arguments(method, flat.shift())
        }
        compiled += ')'
      }

      prefix = '_'
    }
    return compiled
  }

  methodName(method) {
    return `${method.name[0] === '$' ? 'function' : 'filter'} ${JSON.stringify(method.name.substring(1))}`
  }

  $arguments(method, node) {
    let named: Argument
    const allowed =  ['ArrayExpression', 'Identifier', 'UnaryExpression', 'Literal']
    const args: Argument[] = node.arguments
      .map(arg => {
        switch (arg.type) {
          case 'AssignmentExpression':
            named = { name: this.get(arg.left, 'Identifier').name, value: this.get(arg.right, allowed) }
            return named
          default:
            if (named) this.error(arg, `positional argument after named argument "${named.name}"`)
            return { name: '', value: this.get(arg, allowed) }
        }
      })
      .map((arg: Argument): Argument => {
        arg.value = this.$value(arg.value)
        if (!arg.value.raw) this.error(arg.value, `${arg.value.type} conversion error`)
        return arg
      })

    if (method.rest) {
      if (args.length) {
        const error: Argument = args.find(arg => arg.name)
        if (error) this.error(error.value, `${this.methodName(method)} does not support named arguments`)
        this.validateArg(method, args)
      }
      return args.map((arg: Argument) => arg.value.raw).join(',')
    }

    if (args.length > method.parameters.length) this.error(node, `${this.methodName(method)} expected ${method.parameters.length} arguments, got ${args.length}`)

    const resolved: { values: string[], params: Set<string>, required: Set<string> } = {
      values: method.defaults.map(d => typeof d === 'undefined' ? 'undefined' : JSON.stringify(d)),
      params: new Set,
      required: new Set(method.schema.required),
    }
    args.forEach((arg: Argument, n: number) => {
      // ignore deprecated parameter
      if (method.name.startsWith('$auth') && arg.name === 'clean') return

      if (arg.name) n = method.parameters.indexOf(arg.name)
      if (n === -1) this.error(arg.value, `${this.methodName(method)} passed unsupported parameter "${arg.name}"`)
      arg.name = arg.name || method.parameters[n]
      if (resolved.params.has(arg.name)) this.error(arg.value, `duplicate parameter ${n} ("${arg.name}") to ${this.methodName(method)}`)

      resolved.params.add(arg.name)
      if (arg.value.raw !== 'undefined') resolved.required.delete(arg.name)
      resolved.values[n] = this.validateArg(method, arg)
    })

    if (resolved.required.size) this.error(node, `missing required argument "${[...resolved.required][0]}" for ${this.methodName(method)}`)

    return resolved.values.join(',')
  }

  validateArg(method, arg: Argument | Argument[]): string {
    const name = Array.isArray(arg) ? method.rest : arg.name
    const rule = method.schema.properties[name]
    if (!rule) this.error(Array.isArray(arg) ? arg[0].value : arg.value, `${this.methodName(method)} passed unsupported parameter "${name}"`)

    const context = `for "${name}" parameter of ${this.methodName(method)}`

    if (Array.isArray(arg)) { // only passed for rest
      if (!method.rest) this.error(arg[0]?.value, `variable number of arguments passed to non-rest ${this.methodName(method)}`)
      if (rule.type !== 'array') throw new Error(`${rule.type} expected, got array for ${this.methodName(method)}`)
      return `${arg.map(a => this.validate(rule.items, a.value, context)).join(',')}`
    }
    else {
      if (method.rest) this.error(arg.value, `rest ${this.methodName(method)} expects a variable number of arguments`)
      return this.validate(rule, arg.value, context)
    }
  }

  validate(rule, value: Node, context: string, softfail=false): string {
    const fail = (msg: string): string => {
      if (!softfail) this.error(value, msg)
      return null
    }

    if (rule.anyOf) {
      for (const subrule of rule.anyOf) {
        const validated = this.validate(subrule, value, context, true)
        if (validated !== null) return validated
      }
      this.error(value, `expected ${rule.anyOf.map(r => (r.instanceof || r.type) as string).join(' | ')}, got ${this.$typeof(value)} ${context}`)
    }

    switch (rule.instanceof || rule.type) {
      case 'RegExp':
      case 'number':
      case 'string':
      case 'boolean':
        if ((rule.instanceof || rule.type) !== this.$typeof(value)) return fail(`${rule.instanceof || rule.type} expected, got ${this.$typeof(value)} ${context}`)
        if (rule.enum && !rule.enum.includes(value.value)) return fail(`${rule.enum.join(' | ')} expected, got ${value.value} ${context}`)
        break

      case 'array':
        return fail(`array expected, got ${this.$typeof(value)} ${context}`)

      default:
        throw new Error(`cannot validate ${rule.type}`)
    }

    return value.raw
  }

  $typeof(node: Node): string {
    switch (node.type) {
      case 'Literal':
        if (node.raw === 'null' || node.raw === 'undefined') return node.raw as string
        if (node.regex) return 'RegExp'
        return typeof node.value

      default:
        return node.type
    }
  }

  $value(node: Node): Node {
    let elements: Node[]

    switch (node.type) {
      case 'Identifier':
        return {
          ...node,
          type: 'Literal',
          value: node.name === 'undefined' ? undefined : node.name,
          raw: node.name === 'undefined' ? 'undefined' : JSON.stringify(node.name),
        }

      case 'Literal':
        return node

      case 'ArrayExpression':
        elements = node.elements.map(e => this.$value(e))
        return {
          ...node,
          elements,
          raw: `[${elements.map(e => e.raw).join(',')}]`,
        }

      case 'UnaryExpression':
        if (node.operator !== '-' || !node.prefix) this.error(node, `unsupported unary ${node.prefix ? 'prefix' : 'postfix'} operator ${JSON.stringify(node.operator)}`)
        if (typeof this.get(node.argument, 'Literal').value !== 'number') this.error(node.argument, `expected numeric value, found ${this.$typeof(node.argument)}`)
        return {
          ...node,
          type: 'Literal',
          value: -1 * (node.argument.value as number),
          raw: `${node.operator}${node.argument.raw}`,
        }

      default:
        this.error(node, `unexpected argument of type ${node.type}`)
    }
  }
}

const compiler =  new Compiler
export function convert(formulas: string): string {
  return compiler.compile(formulas)
}
