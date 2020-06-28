#!/usr/bin/env npx ts-node

import * as ts from 'typescript'
import * as fs from 'fs'

const filename = 'content/key-manager/formatter.ts'
const ast = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest)

const types = { function: {}, filter: {} }
let m

ast.forEachChild((node: ts.Node) => {
  // process only classes
  if (node.kind === ts.SyntaxKind.ClassDeclaration) {

    // get feautures of ClassDeclarations
    const cls: ts.ClassDeclaration = node as ts.ClassDeclaration

    // process class childs
    cls.forEachChild((_method: ts.Node) => {

      // limit proecssing to methods
      if (_method.kind === ts.SyntaxKind.MethodDeclaration) {
        const method = _method as ts.MethodDeclaration

        // process the right method with the right count of parameters
        // if (m = method.name.getText(ast).match(/^([$_])(.+)/)) {
        if (m = method.name.getText(ast).match(/^([$_])(.+)/)) {
          const [ , kind, name ] = m
          const parameters = method.parameters.map(p => ({ name: p.name.getText(ast), type: p.type?.getText(ast) || null, optional: !!(p.initializer || p.questionToken)}))
          parameters.forEach(p => { if (!p.optional) delete p.optional })
          if (kind === '_') {
            if (parameters[0]?.name !== 'value') throw new Error(`${kind}${name}: ${JSON.stringify(parameters)}`)
            parameters.shift()
          }
          if (parameters.find(p => !p.type)) throw new Error(`${kind}${name}: ${JSON.stringify(parameters)}`)

          types[{$: 'function', _: 'filter'}[kind]][name] = parameters
        }
      }
    })
  }
})

fs.writeFileSync('gen/key-formatter-methods.json', JSON.stringify(types, null, 2))
