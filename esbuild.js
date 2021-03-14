const path = require('path')
const fs = require('fs')
const { bibertool } = require('./setup/loaders/bibertool')
const recast = require("recast")
const esbuild = require('esbuild')
const acorn = require('acorn')
const acornParser = acorn.Parser

let resolveShims = {
  name: 'node-shims',
  setup(build) {

    build.onResolve({ filter: /^(path|fs)$/ }, args => {
      return { path: path.resolve(path.join('shims', args.path + '.js')) }
    })

    build.onLoad({ filter: /\.bibertool$/ }, async (args) => {
      return {
        contents: bibertool(await fs.promises.readFile(args.path, 'utf-8')),
        loader: 'js'
      }
    })
  }
}

async function rebuild() {
  for (const translator of process.argv.slice(2)) {
    // if (translator === 'translators/Better BibLaTeX.ts') continue
    console.log(path.parse(translator).base)

    const globalName = 'BBTTranslator' + path.parse(translator).name.replace(/ /g, '')
    const outfile = path.join('build/dist', path.parse(translator).name + '.js')

    await esbuild.build({
      entryPoints: [translator],
      format: 'iife',
      globalName,
      bundle: true,
      plugins: [resolveShims],
      outfile,
      footer: {
        js: 'const { var1, var2, var3 } = ' + globalName,
      },
      banner: {
        js: '// bloody insane speed',
      },
      target: ['firefox60'],
    })

    const ast = recast.parse(await fs.promises.readFile(outfile, 'utf-8'), {
      parser: {
        parse (src) {
          return acornParser.parse(src)
        }
      }
    })
    console.log(typeof ast.program.body)
  }
}

rebuild().catch(err => console.log(err))
