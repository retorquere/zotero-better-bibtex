const { parse, print, prettyPrint } = require('recast')
const { visit, builders, namedTypes, eachField } = require('ast-types')
const b = builders

// const formula = '(auth + title).lower + year'
// const formula = '(auth(creator="*").lower(1) + year).postfix(_) + (title > 0).lower | title.lower | year'
const formula = '(x ? y : z) + a() + len + ((auth(creator="*").lower(1) + year) > 0).postfix(_) + (title > 0).lower + other | b'

function error(node, msg) {
  throw new Error(`${print(node).code} ${msg}`)
}
function assert(cond, node, msg) {
  if (!cond) error(node, msg)
}
function context(node) {
  return (node.context = node.context || {})
}

const toArrayExpression = {
  visitProgram(path) {
    const body = path.node.body
    if (!body.length) error(path.node, 'empty formula')

    if (body.length > 1) { // multiple semi-colon separated statements
      path.node.body = [
        b.expressionStatement(
          b.arrayExpression(
            path.node.body.map(es => es.type === 'ExpressionStatement' ? b.arrowFunctionExpression([], es.expression) : error(es, 'is not an expression statement'))
          )
        )
      ]
    }

    if (!body[0].type === 'ExpressionStatement') error(body[0], `Unexpected ${body[0].type}`)
    const expression = body[0].expression

    if (expression.type === 'BinaryExpression' && expression.operator === '|') {
      let head = expression
      const expressions = []
      while (head.type === 'BinaryExpression' && head.operator === '|') {
        expressions.unshift(head.right)
        head = head.left
      }
      expressions.unshift(head)
      path.node.body = [ b.expressionStatement(b.arrayExpression(expressions.map(ex => b.arrowFunctionExpression([], ex)))) ]
    }
    else if (expression.type === 'SequenceExpression') {
      path.node.body = [ b.expressionStatement(b.arrayExpression(expression.expressions.map(ex => b.arrowFunctionExpression([], ex)))) ]
    }
    else {
      path.node.body = [ b.expressionStatement(b.arrayExpression([b.arrowFunctionExpression([], expression)])) ]
    }

    this.traverse(path)
  },

  // change > n to .len('>', n)
  visitBinaryExpression(path) {
    if (path.node.operator.match(/^(<|<=|==|!=|>=|>)$/)) {
      assert(path.node.right.type === 'Literal' && typeof path.node.right.value === 'number' && path.node.right.value >= 0, path.node, 'needs number value')
      const object = path.node.left
      const property = b.identifier('len')

      const callee = b.memberExpression(object, property)
      const args = [ b.literal(path.node.operator), path.node.right ]
      return b.callExpression(callee, args)
    }
    else if (path.node.operator === '+') {
      let len = path.node.right
      if (len.type === 'CallExpression') len = len.callee
      if (len.type === 'Identifier' && len.name === 'len') {
        return b.memberExpression(path.node.left, len)
      }
    }

    this.traverse(path)
  },
}

function parents(path) {
  let head = path
  let history = []
  while (head) {
    history.push(head.node)
    head = head.parent
  }

  return history.map((node, i) => {
    if (node.type === 'BinaryExpression') {
      if (node.left === history[i-1]) return `${node.operator}l`
      if (node.right === history[i-1]) return `${node.operator}r`
      return node.operator
    }
    else if (node.type === 'MemberExpression') {
      if (node.object === history[i-1]) return '.o'
      if (node.property === history[i-1]) return '.p'
      return '.'
    }
    else {
      return node.type
    }
  }).slice(1)
}

const markArgument = {
  visitNode(path) {
    context(path.node).inArgument = true
    this.traverse(path)
  }
}

const addCallExpression = {
  visitUnaryExpression(path) {
    assert(path.node.operator === '-', path.node, 'unexpected unary expression')
    assert(path.node.argument.type === 'Literal' && typeof path.node.argument.value === 'number', path.node, '- can only be applied to literal')
    path.node.argument.value = -1 * path.node.argument.value
    return false
  },

  visitCallExpression(path) {
    const args = path.node.arguments
    path.node.arguments = []

    this.traverse(path)
    // do something with args here

    path.node.arguments = args
  },

  visitIdentifier(path) {
    if (path.parent.node.type === 'CallExpression') {
      const prefix = (path.parent.parent.node.type.match(/^(ArrowFunction|Conditional|Binary)Expression$/)) ? '$' : '_'
      path.node.name = `${prefix}${path.node.name}`

      console.log(path.node.name, path.parent.parent.node.type)
      return false
    }
    if (path.parent.node.type === 'MemberExpression' && path.parent.node.property === path.node && path.parent.parent.node.type === 'CallExpression') {
      path.node.name = `_${path.node.name}`
      return false
    }

    console.log(path.node.name, path.parent.parent.node.type)
    return b.callExpression(path.node, [])
  }
}

function wrap(formula) {
  const sub = b.callExpression(b.identifier('sub'), [
    b.functionExpression(null, [], b.blockStatement([ b.returnStatement(formula) ]))
  ])
  const text = b.callExpression(b.memberExpression(b.thisExpression(), b.identifier('$text')), [sub])
  return text
}
function finalize(formula) {
  const finalized = parse(`this.finalize(this.reset() + ${print(formula).code})`)
  return finalized.program.body[0].expression
}

const nameSpace = {
  visitIdentifier(path) {
    this.traverse(path)
  },

  visitCallExpression(path) {
    const args = path.node.arguments
    path.node.arguments = []

    this.traverse(path)
    // do something with args here

    path.node.arguments = args
  },
}

const _nameSpace = {
  visitIdentifier(path) {
    if (!path.node.inArgument) {
      const par = parents(path).join(' ')
      const prefix = par.match(/^CallExpression ([.]o|[+]|ArrowFunctionExpression)/) ? '$' : '_'
      path.node.name = `${prefix}${path.node.name}`
    }

    this.traverse(path)
  },

  visitConditionalExpression(path) {
    this.traverse(path)
    for (const field of ['test', 'consequent', 'alternate']) {
      path.node[field] = wrap(finalize(path.node[field]))
    }
  },

  visitMemberExpression(path) {
    this.traverse(path)
    if (path.node.object.type === 'BinaryExpression') {
      path.node.object = wrap(finalize(path.node.object))
    }
  },

  visitCallExpression(path) {
    path.node.arguments = path.node.arguments.map(a => a.type === 'Identifier' ? b.literal(a.name) : a)

    this.traverse(path)

    if (path.node.callee.type === 'Identifier' && path.node.callee.name[0] === '$') {
      path.node.callee = b.memberExpression(b.thisExpression(), path.node.callee)
    }
  },

  visitArrowFunctionExpression(path) {
    this.traverse(path)
    path.node.body = finalize(path.node.body)
  }
}

console.log(formula)
let ast = parse(formula)
ast = visit(ast, toArrayExpression)
ast = visit(ast, addCallExpression)
console.log(prettyPrint(ast).code)
// ast = visit(ast, nameSpace)
console.log(prettyPrint(ast).code)
