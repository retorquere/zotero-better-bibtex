import * as recast from 'recast'
// import * as fs from 'fs'

export = function instrument(source) {
  const ast = recast.parse(source)

  const origin = this.resourcePath.substring(process.cwd().length + 1)
  // fs.writeFileSync('loader/' + this.resourcePath.replace(/.*\//, ''), source, 'utf8')

  recast.visit(ast, {
    origin,

    visitFunctionDeclaration: function(path) { // tslint:disable-line:object-literal-shorthand
      this.insertLogger(path.value.body, path.value.id.name)

      this.traverse(path)
    },

    visitMethodDefinition: function(path) { // tslint:disable-line:object-literal-shorthand
      const parent = path.parent.parent.node
      const parentName = parent.type === 'ClassExpression' ? '<anonymous>' : parent.id.name
      const name = `${parentName}.${path.value.key.name}`

      this.insertLogger(path.value.value.body, name)

      this.traverse(path)
    },

    insertLogger: function(body, name) { // tslint:disable-line:object-literal-shorthand
      if (body && body.type === 'BlockStatement') {
        const logger = recast.parse(`Zotero.debug("better-bibtex-trace: ${this.origin}@${name}");`)
        body.body = logger.program.body.concat(body.body)
      }
    },
  })

  return recast.print(ast).code
}
