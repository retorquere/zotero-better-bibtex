#!/usr/bin/env node

const putout = require('putout')
const { replaceWith } = putout.operator
const { isFunction, BinaryExpression, MemberExpression, NumericLiteral, StringLiteral, ReturnStatement, ThrowStatement } = putout.types

const fs = require('fs')
const Path = require('path')

function mksync(src) {
  const source = fs.readFileSync(Path.join('node_modules', src), 'utf-8')

  const unyield = {
    report: () => `strip 'yield'`,
    fix: (path) => {
      if (isFunction(path)) return path.node.generator = false
      path.replaceWith(path.node.argument)
    },
    traverse: ({push}) => ({
      YieldExpression(path) {
        push(path);
      },
      Program: {
        exit(path) {
          path.traverse({
            Function(path) {
              push(path)
            }
          })
        }
      }
    }),
  }

  const unpromise = {
    report: () => 'async should be stripped',

    replace: () => ({
      'require(__a)'({__a}, path) {
        if (__a.value[0] === '.' && !__a.value.match(/^[.][/][a-z]+Many$/)) {
          path.replaceWithSourceString(`require(${JSON.stringify(Path.normalize(Path.join(Path.dirname(src), __a.value)))})`)
        }
        return path
      },
      'return Promise.reject(__a)'({__a}, path) {
        replaceWith(path, ThrowStatement(__a));
        return path
      },
      'return Promise.resolve(__a)'({__a}, path) {
        replaceWith(path, ReturnStatement(__a));
        return path
      },
      'return Promise.resolve()'({}, path) {
        replaceWith(path, ReturnStatement());
        return path
      },
      '__a.then((ids) => ids[0])'({__a}, path) {
        replaceWith(path, MemberExpression(__a, NumericLiteral(0), true))
        return path
      },
      '__a.then((n) => n === 1)'({__a}, path) {
        replaceWith(path, BinaryExpression('===', __a, NumericLiteral(1)))
        return path
      },
      '{return __awaiter(__args)}': ({__args}) => {
        return __args.at(-1).body
      },
    }),
  }

  const { code } = putout(source, {
    fixCount: 1,
    plugins: [
      [ 'unyield', unyield ],
      [ 'unpromise', unpromise ],
    ],
  })

  return code
}

console.log('blinkdb.sync:')
let xface = ''
for (const f of 'clear one first many insert insertMany update updateMany upsert upsertMany remove removeMany'.split(' ')) {
  console.log(' ', f)
  fs.writeFileSync(`gen/blinkdb/${f}.js`, mksync(`blinkdb/dist/core/${f}.js`))
  const d_ts = fs.readFileSync(`node_modules/blinkdb/dist/core/${f}.d.ts`, 'utf-8')
    .replace(/Promise<([^>]+)>/g, '$1')
    .replace(/"[.][.]?[/][^"]+"/g, '"blinkdb"')
  fs.writeFileSync(`gen/blinkdb/${f}.d.ts`, d_ts)

  xface += `export { internal${f.replace(/^(.)/, c => c.toUpperCase())} as ${f} } from './${f}'\n`
}
fs.writeFileSync('gen/blinkdb/index.ts', xface)
