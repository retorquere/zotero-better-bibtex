/* eslint-disable prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unsafe-return */
import { parse, types, prettyPrint } from 'recast'
const b = types.builders
// const { getFieldNames } = types
import * as items from '../../gen/items/items'
import { methods } from '../../gen/api/key-formatter'
import { validator, noncoercing } from '../ajv'
import { clone } from '../clone'

import { stringify } from '../stringify'

import alias = require('./alias.json')

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
          value: type,
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
const api: typeof methods = clone(methods)
for (const meta of Object.values(api)) {
  for (const property of Object.keys(meta.schema.properties)) {
    meta.schema.properties[property] = upgrade(meta.schema.properties[property])

    if (meta.name === '_formatDate' || meta.name === '$date') {
      meta.schema.properties[property].properties.value.pattern = '^([^%]|(%-?o?[ymdYDHMS]))+$'
    }
    else if (meta.name === '$postfix' && property === 'format') {
      (meta.schema.properties[property] as any).properties.value = { postfix: true }
    }
    else if (meta.name === '$authors' && property === 'name') {
      (meta.schema.properties[property] as any).properties.value = { creatorname: true }
    }
  }
}
for (const method of Object.values(api) as any[]) {
  method.validate = validator(method.schema, noncoercing)
}

function assign(node: any, meta: any) {
  node.meta = node.meta || {}
  Object.assign(node.meta, meta)
}

/*
function graphviz(ast) {
  let gv = 'digraph G {'
  let id = 0
  types.visit(ast, {

    visitNode(path) {
      this.traverse(path)

      assign(path.node, { id: id++ })

      let children = {}
      for (const child of getFieldNames(path.node)) {
        if (path.node[child] && path.node[child].meta) {
          children[child] = path.node[child].meta.id
        }
      }

      let type = path.node.type
      switch (path.node.type) {
        case 'ArrayExpression':
          type = '[...]'
          path.node.elements.forEach((child, i) => {
            children[i] = child.meta.id
          })
          break
        case 'SequenceExpression':
          type = '.., ..'
          path.node.expressions.forEach((child, i) => {
            children[i] = child.meta.id
          })
          break
        case 'LogicalExpression':
        case 'BinaryExpression':
          type = path.node.operator
          break
        case 'Literal':
          if (typeof path.node.value === 'string') {
            type = "'" + path.node.value + "'"
          }
          else {
            type = path.node.value
          }
          break
        case 'Identifier':
          type = path.node.name
          break
        case 'ConditionalExpression':
          type = '?:'
          break
        case 'MemberExpression':
          type = '.'
          break
        case 'CallExpression':
          type = '(...)'
          break
        case 'ThisExpression':
          type = 'this'
          break
        case 'ExpressionStatement':
          type = 'expr'
          break
      }

      gv += `node${path.node.meta.id} [label="${type}"]\n`
      for (const [rel, id] of Object.entries(children)) {
        gv += `node${path.node.meta.id} -> node${id} [label="${rel}"]\n`
      }
    }
  })
  gv += '}'
  return gv
}
*/

function error(msg, node) {
  if (node?.loc) {
    msg += ' @ '
    if (node.loc.start.line !== 1) msg += `line ${node.loc.start.line}, `
    msg += `position ${(node.loc.start.column as number) + 1}`
  }
  throw new Error(msg)
}

function argname(node) {
  if (node.type !== 'Identifier') error(`argument name must be identifier, not ${node.type}`, node)
  return node.name
}

function argvalue(node) {
  switch (node.type) {
    case 'Literal':
      return node
    case 'ArrayExpression':
      node.elements = node.elements.map(argvalue)
      return node
    case 'Identifier':
      return b.literal(node.name)
    case 'UnaryExpression':
      if (node.operator !== '-' || node.argument.type !== 'Literal' || typeof node.argument.value !== 'number') {
        error(`${node.operator}${node.argument.type} is not a number`, node)
      }
      return b.literal(-1 * node.argument.value)
    default:
      error(`argument value must be literal, array, or identifier, not ${node.type}`, node)
      break
  }
}

function resolveArguments(method, args, node) {
  const parameters = {}

  if (method.rest) {
    parameters[method.rest] = b.arrayExpression(args.map(argvalue))
  }
  else {
    if (method.parameters.length < args.length) error(`${method.name.slice(1)}: expected ${method.parameters.length} arguments, got ${args.length}`, node)

    let hasNamed = false
    // "shadowed" by the later let arg: any
    args.forEach((arg, i) => { // eslint-disable-line @typescript-eslint/no-shadow
      let name: string
      let value: any
      if (arg.type === 'AssignmentExpression') {
        name = argname(arg.left)
        // ignore deprecated parameter
        if (method.name.startsWith('$auth') && name === 'clean') return
        value = argvalue(arg.right)
        hasNamed = true
      }
      else if (hasNamed) {
        error('positional arguments cannot follow named arguments', arg)
      }
      else {
        name = method.parameters[i]
        value = argvalue(arg)
      }
      if (typeof parameters[name] !== 'undefined') error(`duplicate parameter ${name}`, arg)
      parameters[name] = value
    })
  }

  let err: string
  if (err = method.validate(parameters)) error(`${method.name.slice(1)}: ${err} ${stringify(parameters)}`, node)

  args = method.parameters.map((param: string, i: number) => parameters[param] || (typeof method.defaults[i] === 'undefined' ? b.identifier('undefined') : b.literal(method.defaults[i])))
  let end: number
  let arg: any
  while((end = args.length - 1) >= 0 && (((arg = args[end]).type === 'Identifier' && arg.name === 'undefined') || (arg.type === 'Literal' && arg.value === method.defaults[end]))) {
    args.pop()
  }

  return method.rest ? args[0].elements : args
}

function split(ast, operator) {
  const parts = []
  while (ast.type === 'BinaryExpression' && ast.operator === operator) {
    parts.unshift(ast.right)
    ast = ast.left
  }
  parts.unshift(ast)

  /* the visitNode -> Error does an en-passant check on stray binary expressions
  const CheckNesting = {
    visitBinaryExpression(path) {
      if (path.node.operator === operator) error(`improperly nested ${operator} expression ${print(path.node)}`, path.node)
      this.traverse(path)
    },
  }
  return parts.map(part => types.visit(part, CheckNesting))
  */
  return parts
}

function stitch(terms, operator) {
  if (terms.length === 1) return terms[0]
  const left = terms.shift()
  const right = terms.shift()
  let ast = b.binaryExpression(operator, left, right)
  for (const term of terms) {
    ast = b.binaryExpression(operator, ast, term)
  }
  return ast
}

function print(ast): string {
  return prettyPrint(ast, {tabWidth: 2, quote: 'single'}).code
}

export function convert(formulas: string): string {
  let ast = parse(formulas).program
  if (ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement') throw new Error(`${stringify(formulas)}: expected 1 expression statement`)
  ast = ast.body[0].expression

  const asts = split(ast, '|').map(formula => {
    formula = split(formula, '+').map(term => {
      let namespace = '$'
      return types.visit(term, {
        visitCallExpression(path) {
          if ((path.node as any).meta?.called) error('double call', path.node)
          assign(path.node.callee, { called: path.node })
          this.visitor.visitWithoutReset(path.get('callee'))

          return false
        },
        visitMemberExpression(path) {
          if (path.node.computed || path.node.property.type !== 'Identifier') error('computed property not supported', path.node)
          if ((path.node as any).meta?.called) assign(path.node.property, { called: (path.node as any).meta.called })
          this.traverse(path)
        },
        visitIdentifier(path) {
          this.traverse(path)

          try {
            if (path.node.name.match(/^[A-Z]/)) {
              const name = items.name.field[path.node.name.toLowerCase()]
              if (!name) error(`No such field ${path.node.name}`, path.node)
              if ((path.node as any).meta?.called) error('fields cannot be called', path.node)
              if (namespace !== '$' || (path.node as any).meta?.called) error('field access not allowed here', path.node)
              return b.callExpression(b.memberExpression(b.thisExpression(), b.identifier('$getField')), [b.literal(name)])
            }
            else {
              let name = `${namespace}${path.node.name.toLowerCase()}`
              name = alias[name] || name
              const method = api[name]
              if (!method) {
                const me = `${namespace === '$' ? 'function' : 'filter'} ${JSON.stringify(path.node.name)}`
                error(`No such ${me}`, path.node)
              }

              if ((path.node as any).meta?.called) {
                (path.node as any).meta.called.arguments = resolveArguments(method, (path.node as any).meta?.called.arguments || [], path.node)
              }

              if (namespace === '$') {
                const node = b.memberExpression(b.thisExpression(), b.identifier(method.name))
                if (!(path.node as any).meta?.called) return b.callExpression(node, [])
                return node
              }
              else {
                path.node.name = method.name
                if (!(path.node as any).meta?.called) return b.callExpression(path.node, [])
              }
            }
          }
          finally {
            namespace = '_'
          }
        },

        visitLiteral(path) {
          this.traverse(path)
          return b.callExpression(b.memberExpression(b.thisExpression(), b.identifier('$text')), [b.literal(path.node.value)])
        },

        visitNode(path) {
          this.traverse(path)
          error(`Unexpected ${path.node.type}`, path.node)
        },
      })
    })

    // reset accumulator and force string coercion
    formula.unshift(b.callExpression(b.memberExpression(b.thisExpression(), b.identifier('reset')), []))

    formula = stitch(formula, '+')
    return b.callExpression(b.memberExpression(b.thisExpression(), b.identifier('finalize')), [formula])
  })

  ast = types.visit(parse('formulas.find(pattern => { try { return pattern() } catch (err) { if (err.next) return ""; throw err } })'), {
    visitIdentifier(path) {
      if (path.node.name === 'formulas') return b.arrayExpression(asts.map(formula => b.arrowFunctionExpression([], formula, false)))
      return false
    },
  })
  return print(ast) + `;
// this.citekey is set as a side-effect
return this.citekey || ('zotero-' + this.item.id)`
}
