'use strict'
const estraverse = require('estraverse')
const meriyah = require('meriyah')
const astring = require('astring')
const API = require('../../gen/api/key-formatter')
const aliases = require('./alias.json')

for (const [_old, _new] of Object.entries(aliases)) {
  API.methods[_old] = API.methods[_new]
}
// this allows moving $len to _len after it has been validated
API.methods.$len = { ...API.methods._len, name: '$len', test: '$$len' }

const normalize = {
  enter(node, parent) {
    if (node.type === 'Program') {
      const body = node.body
      node.body = []
      while (body.length) {
        const stmt = body.shift()
        if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'BinaryExpression' && stmt.expression.operator === '|') {
          body.unshift({ type: 'ExpressionStatement', expression: stmt.expression.right })
          body.unshift({ type: 'ExpressionStatement', expression: stmt.expression.left })
        }
        else {
          node.body.push(stmt)
        }
      }
    }

    if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'Literal' && typeof node.argument.value === 'number') {
      return { type: 'Literal', value: -1 * node.argument.value }
    }
  },
}

const parens = {
  enter(node, parent) {
    if (this.visitor[node.type]) {
      return this.visitor[node.type].call(this, node, parent) || node
    }

    return node
  },

  Identifier(node, parent) {
    if (parent.type.match(/(?<!Call|Member)Expression$/) || parent.type === 'ExpressionStatement') {
      return {
        type: 'CallExpression',
        callee: node,
        arguments: [],
        optional: node.optional,
      }
    }
  },

  LogicalExpression(node, parent) {
    if (!['||', '&&'].includes(node.operator)) throw new Error(`${astring.generate(node)} not supported`)
  },

  BinaryExpression(node, parent) {
    if (node.operator !== '+') throw new Error(`${astring.generate(node)} not supported`)
  },

  MemberExpression(node, parent) {
    if (node.computed) throw new Error('Not implemented')

    if (node.object.type === 'Identifier') {
      node.object = {
        type: 'CallExpression',
        callee: node.object,
        arguments: [],
        optional: node.optional,
      }
    }
    if (node.property.type === 'Identifier') {
      if (parent && (parent.type !== 'CallExpression' || parent.callee !== node)) {
        return {
          type: 'CallExpression',
          callee: node,
          arguments: [],
          optional: node.optional,
        }
      }
    }
  },

  CallExpression(node, parent) {
  },

  keys: {
    CallExpression: ['callee'],
  },
}

const len = {
  enter: function(node, parent) {
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      if (node.right.type === 'CallExpression' && node.right.callee.type === 'MemberExpression' && node.right.callee.object.type === 'ThisExpression' && node.right.callee.property.name === '$len') {
        return {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: '_len' },
          },
          arguments: [node.left, ...node.right.arguments],
        }
      }
    }
    else if (node.type === 'BinaryExpression' && node.operator.match(/^[<>]=?|==$/)) {
      return {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            type: 'Identifier',
            name: '_len',
          },
        },
        arguments: [node.left, node.right],
      }
    }
  },
}

const structure = {
  enter(node, parent) {
    if (this.visitor[node.type]) {
      return this.visitor[node.type].call(this, node, parent)
    }
    throw new Error(`Unexpected ${node.type} ${astring.generate(node)} in formula`)
  },

  Program(node, parent) {
    const err = node.body.find(stmt => stmt.type !== 'ExpressionStatement')
    if (err) throw new Error(`Unexpected ${err.type} ${astring.generate(err)}`)
  },

  ExpressionStatement(node, parent) {
  },

  BinaryExpression(node, parent) {
    if (node.operator !== '+') throw new Error(`Unexpected ${node.operator} ${astring.generate(node)}`)
  },

  LogicalExpression(node, parent) {
    if (!['||', '&&'].includes(node.operator)) throw new Error(`Unexpected ${node.operator} ${astring.generate(node)}`)
  },

  ConditionalExpression(node, parent) {
  },

  ThisExpression(node, parent) {
  },

  CallExpression(node, parent) {
  },

  MemberExpression(node, parent) {
    if (node.computed) throw new Error('Not implemented')
  },

  Identifier(node, parent) {
  },

  Literal(node, parent) {
    if (typeof node.value !== 'string') throw new Error(`Unexpected ${typeof node.value} ${astring.generate(node)} in formula`)
  },

  keys: {
    CallExpression: ['callee'],
  },
}

function valueOf(node, expression) {
  switch (node.type) {
    case 'Literal':
      return node.regex ? new RegExp(node.regex.pattern) : node.value
    case 'ArrayExpression':
      return node.elements.map(e => valueOf(e, expression))
    case 'Identifier':
      if (node.name === 'undefined') return undefined
      throw new Error(`Unexpected identifier ${node.name}`)
    default:
      throw new Error(`Unexpected ${node.type} ${astring.generate(node)}`)
  }
}

function astFor(expression) {
  if (Array.isArray(expression)) return { type: 'ArrayExpression', elements: expression.map(astFor) }
  switch (typeof expression) {
    case 'string':
    case 'number':
    case 'boolean':
      return { type: 'Literal', value: expression }
    case 'object':
      if (expression instanceof RegExp) return { type: 'Literal', regex: { pattern: expression.source, flags: expression.flags } }
      throw new Error(`Unexpected object ${expression}`)
    case 'undefined':
      return { type: 'Identifier', name: 'undefined' }
    default:
      throw new Error(`Unexpected ${typeof expression}`)
  }
}

const invert = {
  test: [],

  enter(node, parent) {
    if (parent && parent.type === 'ConditionalExpression') this.visitor.test.unshift(node === parent.test)

    const test = this.visitor.test[0]

    if (node.type === 'CallExpression') {
      this.skip()

      const methodChain = []
      let current = node

      while (current && current.type === 'CallExpression') {
        switch (current.callee.type) {
          case 'Identifier':
            if (current.callee.name.match(/^[A-Z]/)) { // direct field access
              const fieldName = API.fields[current.callee.name.toLowerCase()]
              if (!fieldName) throw new Error(`Direct field ${current.callee.name} does not exist`)
              if (current.arguments.length) throw new Error(`Direct field access ${current.callee.name} does not take arguments`)
              methodChain.unshift({
                kind: 'function',
                method: '$field',
                args: [{ type: 'Literal', value: fieldName }],
              })
            }
            else {
              methodChain.unshift({
                kind: 'function',
                method: `$${current.callee.name}`,
                args: current.arguments,
              })
            }
            current = null
            break
          case 'MemberExpression':
            methodChain.unshift({
              kind: 'filter',
              method: `_${current.callee.property.name}`,
              args: current.arguments,
            })
            if (current.callee.object.type.match(/(?<!Call|Member)Expression$/)) {
              methodChain.unshift(estraverse.replace(current.callee.object, invert))
              current = null
            }
            else {
              current = current.callee.object
            }
            break
          default:
            throw new Error(`Unexpected callee ${current.callee.type} in ${astring.generate(current)}`)
        }
      }

      const ident2string = (arg, allowNamed) => {
        switch (arg.type) {
          case 'AssignmentExpression':
            if (!allowNamed) throw new Error(`Unexpected named argument ${astring.generate(arg)}`)
            return ident2string(arg.right, false)

          case 'Identifier':
            if (arg.name !== 'undefined') {
              arg.type = 'Literal'
              arg.value = arg.name
            }
            return

          case 'ArrayExpression':
            return arg.elements.forEach(e => ident2string(e, false))

          case 'Literal':
            return

          default:
            throw new Error(`Unexpected argument ${arg.type} ${astring.generate(arg)}`)
        }
      }
      const getOrdinal = num => {
        const suffixes = ['th', 'st', 'nd', 'rd']
        const value = num % 100
        return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
      }
      const argError = err => err.errors.map(e => e.message).join(', ').replace(/ not of a type\(s\) /g, ' not of type ')
      for (const method of methodChain) {
        if (method.type) continue // binary expression being filtered

        method._method = method.method.toLowerCase()

        const whoami = `${method.kind} ${method.method.substring(1)}`
        const api = API.methods[method._method]
        if (!api) throw new Error(`unknown ${whoami}`)
        method.args.forEach(arg => ident2string(arg, !api.rest))

        if (api.rest) {
          if (!method.args.length) throw new Error(`${whoami} requires at least one argument`)
          const validate = api.validate[api.rest]
          for (const arg of method.args) {
            if (!validate(valueOf(arg))) {
              throw new Error(`${whoami}: invalid argument ${astring.generate(arg)}: ${argError(validate)}`)
            }
          }
        }
        else {
          const args = api.parameters.map((name, i) => ({
            name,
            required: api.required.includes(name),
            default: api.defaults[i],
          }))

          let named = ''
          method.args.forEach((arg, i) => {
            if (!args[i]) throw new Error(`${whoami}: unexpected ${getOrdinal(i + 1)} argument ${astring.generate(arg)}`)

            if (arg.type === 'AssignmentExpression') {
              named = arg.left.name
              i = api.parameters.indexOf(arg.left.name)
              if (i === -1) throw new Error(`${whoami}: unexpected named argument ${named}`)
              arg = arg.right
            }
            else if (named) {
              throw new Error(`${whoami}: unexpected positional argument ${astring.generate(arg)} after named argument ${named}`)
            }

            if (args[i].ast) throw new Error(`${whoami}: unexpected duplicate argument ${astring.generate(arg)}`)

            args[i] = {
              ...args[i],
              ast: arg,
              value: valueOf(arg),
            }
          })

          for (const arg of args) {
            if (arg.required && !arg.ast) throw new Error(`${whoami}: missing required argument ${arg.name}`)
            if (arg.ast) {
              const validate = api.validate[arg.name]
              if (!validate(arg.value)) {
                throw new Error(`${whoami}: invalid argument '${arg.name}': ${astring.generate(arg.ast)} ${argError(validate)}`)
              }
            }
            else {
              arg.ast = astFor(arg.default)
            }
          }
          method.args = args.map(arg => arg.ast)
        }
      }

      function wrap(method, wrapped) {
        const api = API.methods[method._method]
        return {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            // replace calls with __/$$ calls for tests in conditionals so that a non-throwing result is always truthy
            property: { type: 'Identifier', name: (test && api.test) || api.name },
            computed: false,
          },
          arguments: wrapped ? [wrapped, ...method.args] : method.args,
        }
      }
      let transformed = methodChain[0].type ? methodChain[0] : wrap(methodChain[0])
      for (const method of methodChain.slice(1)) {
        transformed = wrap(method, transformed)
      }

      return transformed
    }
  },

  leave(node, parent) {
    if (parent && parent.type === 'ConditionalExpression') this.visitor.test.shift()
  },

  keys: {
    CallExpression: [],
    MemberExpression: [],
  },
}

function try_catch(body, fallback) {
  fallback = fallback ? [ fallback ] : []

  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [body],
    },
    handler: {
      type: 'CatchClause',
      param: {
        type: 'Identifier',
        name: 'err',
      },
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: {
              type: 'UnaryExpression',
              operator: '!',
              prefix: true,
              argument: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'err' },
                property: { type: 'Identifier', name: 'next' },
              },
            },
            consequent: {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'err' },
            },
          },
          ...fallback
        ],
      },
    },
  }
}
function _return(v) {
  return {
    type: 'ReturnStatement',
    argument: v,
  }
}
function _assign(v) {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: 'citekey' },
    right: {
      type: 'LogicalExpression',
      operator: '||',
      left: { type: 'Identifier', name: 'citekey' },
      right:  v,
    }
  }
}
const protect = {
  leave(node, parent) {
    switch (node.type) {
      case 'Program': {
        node.body = node.body.map(stmt => try_catch(_assign(stmt)))
        break
      }

      case 'ConditionalExpression': {
        node.test = {
          type: 'CallExpression',
          callee: {
            type: 'ArrowFunctionExpression',
            id: null,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [try_catch(_return(node.test), _return({ type: 'Literal', value: '' }))],
            },
          },
          arguments: [],
        }
        break
      }
    }

    return node
  },
}

const logging = {
  leave(node, parent) {
    if (node.type === 'CallExpression') {
      if (node.callee.type !== 'MemberExpression') return node
      if (node.callee.object.type !== 'ThisExpression') return node
      if (node.callee.property.type !== 'Identifier') return node
      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'log' },
        arguments: [ { type: 'Literal', value: node.callee.property.name }, node ],
      }
    }
    else if (node.type === 'CatchClause') {
      node.body.body.unshift({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'log' },
        arguments: [ { type: 'Literal' }, { type: 'Literal' }, { type: 'Identifier', name: 'err' } ],
      })
    }
    else {
      return node
    }
  }
}

const generator = Object.assign({}, astring.GENERATOR, {
  BinaryExpression: function(node, state) {
    state.write('( ( ')
    this[node.left.type](node.left, state)
    state.write(` ) ${node.operator} ( `)
    this[node.right.type](node.right, state)
    state.write(' ) )')
  },

  LogicalExpression: function(node, state) {
    state.write('( ( ')
    this[node.left.type](node.left, state)
    state.write(` ) ${node.operator} ( `)
    this[node.right.type](node.right, state)
    state.write(' ) )')
  },

  ConditionalExpression: function(node, state) {
    state.write('( (')
    this[node.test.type](node.test, state)
    state.write(' ) ? ( ')
    this[node.consequent.type](node.consequent, state)
    state.write(' ) : ( ')
    this[node.alternate.type](node.alternate, state)
    state.write(' ) )')
  },
})

const logger = `
  function log(k, v, e) {
    let msg
    if (e && e.next) {
      msg = 'skip'
    }
    else if (e) {
      msg = 'error: ' + e.message
    }
    else {
      msg = 'exec: ' + k + ' => ' + JSON.stringify(v)
    }
    Zotero.debug('formula: ' + msg)
    return v
  }
`
function compile(code, options) {
  const ast = meriyah.parse(code, { ecmaVersion: 2020 })

  estraverse.replace(ast, normalize)
  estraverse.replace(ast, parens)
  estraverse.replace(ast, invert)
  estraverse.replace(ast, len)
  estraverse.traverse(ast, structure)
  estraverse.replace(ast, protect)
  if (options?.logging) estraverse.replace(ast, logging)

  const generatedCode = [
    options?.logging ? logger : '',
    'let citekey',
    astring.generate(ast, { generator: options?.braces && generator }),
    'return citekey || `zotero-item-${this.item.id}`',
  ]
  return generatedCode.join('\n')
}

module.exports.compile = compile

/*
const code = "auth(n=1,m=1,creator=\"*\",initials=false).fold + auth(n=1,m=2,creator=\"*\",initials=false).fold + auth(n=1,m=3,creator=\"*\",initials=false).fold + auth(n=1,m=4,creator=\"*\",initials=false).fold + len('>',1) + shortyear;\nauth(n=3,m=1,creator=\"*\",initials=false).fold + shortyear;"
console.log(code)
console.log(compile(code))
*/
