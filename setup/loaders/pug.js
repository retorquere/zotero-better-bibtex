const pug = require('pug')

/*
const options = {}
options.pretty = true
options.plugins = [{
  preCodeGen(ast, options) {
    
    return walk(ast, node => {
      switch (node.type) {
        case 'Tag':
          if (node.name !== 'script') node.name = `xul:${node.name}`
          for (const attr of node.attrs) {
            if (attr.name === 'xmlns') attr.name = 'xmlns:xul'
          }
          break
      }
    })
  }
}]

class CodeGenerator {
  constructor(ast) {
    this.node = 0
    this.js = 'module.exports.load = function(root) {'
    this.generate(ast)
    this.js += '}'
  }

  generate(ast) {
    this[node.type](ast)
  }

  Tag(node) {
    this.node += 1
    this.js += `const node${this.node
  }
}
*/

module.exports.pug = {
  name: 'pug',
  setup(build) {
    build.onLoad({ filter: /\.pug$/ }, async (args) => {
      options.filename = args.path
      const xul = pug.compile(src, options)
      
      return {
        contents: peggy.generate(await fs.promises.readFile(args.path, 'utf-8'), {
          output: 'source',
          cache: false,
          optimize: 'speed',
          trace: false,
          format: 'commonjs',
        }),
        loader: 'js'
      }
    })
  }
}

const xul = pug.renderFile(src, options)

const build = path.dirname(tgt)
if (!fs.existsSync(build)) fs.mkdirSync(build, { recursive: true })
fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())
