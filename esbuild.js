const path = require('path')
const fs = require('fs')
const { bibertool } = require('./setup/loaders/bibertool')
const esbuild = require('esbuild')
const pegjs = require('pegjs')
const exec = require('child_process').exec

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

    build.onLoad({ filter: /\.pegjs$/ }, async (args) => {
      return {
        contents: pegjs.generate(await fs.promises.readFile(args.path, 'utf-8'), {
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

function execShellCommand(cmd) {
  console.log(cmd)
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }
      resolve(stdout? stdout : stderr)
    })
  })
}

async function rebuild() {
  for (const translator of process.argv.slice(2)) {
    if (!translator.startsWith('translators/')) continue

    tr = path.parse(translator)
    console.log(tr.base)

    const header = require('./' + path.join(tr.dir, tr.name + '.json'))
    const vars = ['Translator']
      .concat((header.translatorType & 1) ? ['detectImport', 'doImport'] : [])
      .concat((header.translatorType & 2) ? ['doExport'] : [])

    const globalName = tr.name.replace(/ /g, '') + '__' + vars.join('__')
    const outfile = path.join('build/dist', tr.name + '.js')

    // https://esbuild.github.io/api/#write
    // https://esbuild.github.io/api/#outbase
    // https://esbuild.github.io/api/#working-directory
    await esbuild.build({
      entryPoints: [translator],
      format: 'iife',
      globalName,
      bundle: true,
      charset: 'utf8',
      plugins: [resolveShims],
      outfile,
      footer: {
        js: `const { ${vars.join(', ')} } = ${globalName};`
      },
      // banner: { js: '// bloody insane speed', },
      target: ['firefox60'],
    })
  }

  const entryPoints = process.argv.slice(2).filter(src => {
    if (!src.startsWith('content/')) return false
    src = path.parse(src)
    return (src.base === 'better-bibtex.ts' || src.base.match(/^[A-Z]/))
  })
  if (entryPoints.length) {
    await esbuild.build({
      entryPoints,
      format: 'esm',
      bundle: true,
      charset: 'utf8',
      plugins: [resolveShims],
      splitting: true,
      outdir: 'build/dist/content',
      target: ['firefox60'],
    })
  }
  for (const entryPoint of entryPoints ) {
    await execShellCommand(`./node_modules/.bin/jscodeshift -t post.js 'build/dist/${entryPoint.replace('.ts', '.js')}'`)
  }
}

rebuild().catch(err => console.log(err))
