// use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis for `document`

const path = require('path')
const fs = require('fs')
const { bibertool } = require('./setup/loaders/bibertool')
const esbuild = require('esbuild')
const pegjs = require('pegjs')
const exec = require('child_process').exec
const glob = require('glob-promise')
const crypto = require('crypto')

let shims = {
  name: 'shims',
  setup(build) {

    build.onResolve({ filter: /^(path|fs)$/ }, args => {
      return { path: path.resolve(path.join('shims', args.path + '.js')) }
    })
  }
}

let throwShims = {
  name: 'shims-throw',
  setup(build) {

    build.onResolve({ filter: /^(path|fs)$/ }, args => {
      return { path: path.resolve(path.join('shims', 'not-' + args.path + '.js')) }
    })
  }
}

const loaders = {
  name: 'loaders',
  setup(build) {
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

async function bundle(config) {
  console.log(Object.keys((await esbuild.build({...config, metafile: true})).metafile.outputs).join(', '))
}

async function rebuild() {
  for (const translator of (await glob('translators/*.json')).map(tr => path.parse(tr))) {
    const header = require('./' + path.join(translator.dir, translator.name + '.json'))
    const vars = ['Translator']
      .concat((header.translatorType & 1) ? ['detectImport', 'doImport'] : [])
      .concat((header.translatorType & 2) ? ['doExport'] : [])

    const globalName = translator.name.replace(/ /g, '') + '__' + vars.join('__')
    const outfile = path.join('build/resource', translator.name + '.js')

    // https://esbuild.github.io/api/#write
    // https://esbuild.github.io/api/#outbase
    // https://esbuild.github.io/api/#working-directory
    await bundle({
      entryPoints: [path.join(translator.dir, translator.name + '.ts')],
      format: 'iife',
      globalName,
      bundle: true,
      // charset: 'utf8',
      plugins: [loaders, throwShims],
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

  const vars = [ 'Zotero', 'onmessage', 'workerContext' ]
  const globalName = vars.join('__')
  await bundle({
    entryPoints: [ 'translators/worker/zotero.ts' ],
    format: 'iife',
    globalName,
    bundle: true,
    plugins: [loaders, shims],
    outdir: 'build/resource/worker',
    target: ['firefox60'],
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
    // banner: "const Global = Function('return this')();\n\n",
    banner: {
      js: 'importScripts("resource://zotero/config.js") // import ZOTERO_CONFIG\n\n',
    },
    footer: {
      js: `const { ${vars.join(', ')} } = ${globalName};` +'\n' + 'importScripts(`resource://zotero-better-bibtex/${workerContext.translator}.js`);\n',
    },
  })

  await bundle({
    entryPoints: [ 'content/better-bibtex.ts' ],
    format: 'iife',
    bundle: true,
    plugins: [loaders, shims],
    outdir: 'build/content',
    target: ['firefox60'],
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
    // banner: "const Global = Function('return this')();\n\n",
  })
}

rebuild().catch(err => console.log(err))
