// use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis for `document`

const path = require('path')
const fs = require('fs')
const { bibertool } = require('./setup/loaders/bibertool')
const esbuild = require('esbuild')
const pegjs = require('pegjs')
const exec = require('child_process').exec
const glob = require('glob-promise')
const crypto = require('crypto')

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
  for (const translator of (await glob('translators/*.json')).map(tr => path.parse(tr))) {
    console.log(translator.name)
    const header = require('./' + path.join(translator.dir, translator.name + '.json'))
    const vars = ['Translator']
      .concat((header.translatorType & 1) ? ['detectImport', 'doImport'] : [])
      .concat((header.translatorType & 2) ? ['doExport'] : [])

    const globalName = translator.name.replace(/ /g, '') + '__' + vars.join('__')
    const outfile = path.join('build/resource', translator.name + '.js')

    // https://esbuild.github.io/api/#write
    // https://esbuild.github.io/api/#outbase
    // https://esbuild.github.io/api/#working-directory
    await esbuild.build({
      entryPoints: [path.join(translator.dir, translator.name + '.ts')],
      format: 'iife',
      globalName,
      bundle: true,
      charset: 'utf8',
      plugins: [resolveShims],
      outfile,
      footer: {
        js: `const { ${vars.join(', ')} } = ${globalName};`
      },
      target: ['firefox60'],
    })

    const source = await fs.promises.readFile(outfile, 'utf-8')
    const checksum = crypto.createHash('sha256')
    checksum.update(source)
    if (!header.configOptions) header.configOptions = {}
    header.configOptions.hash = checksum.digest('hex')
    header.lastUpdated = (new Date).toISOString().replace(/T.*/, '')
    await fs.promises.writeFile(path.join('build/resource', translator.name + '.json'), JSON.stringify(header, null, 2))
  }

  /*
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
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
      banner: "const Global = Function('return this')();\n\n",
    })
  }
  */
}

rebuild().catch(err => console.log(err))
