// use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis for `document`

const path = require('path')
const fs = require('fs')
const esbuild = require('esbuild')
const pegjs = require('pegjs')
const exec = require('child_process').exec
const glob = require('glob-promise')
const crypto = require('crypto')
const { bibertool } = require('./setup/loaders/bibertool')
const patch = require('./setup/loaders/patch').loader

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

const kuroshiro = patch('setup/patches')

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

    build.onLoad({ filter: /\/node_modules\/.+\.js$/ }, async (args) => {
      let contents = await fs.promises.readFile(args.path, 'utf-8')
      const filename = 'resource://zotero-better-bibtex/' + args.path.replace(/.*\/node_modules\/(\.pnpm)?/, '')
      const dirname = path.dirname(filename)

      contents = [
        `var __dirname=${JSON.stringify(dirname)};`,
        `var __filename=${JSON.stringify(filename)};`,
        contents,
      ].join('\n')

      return {
        contents,
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
  config = {
    ...config,
    target: ['firefox60'],
    bundle: true,
    format: 'iife',
  }
  const metafile = config.metafile
  config.metafile = true

  if (config.globalThis || config.prepend) {
    if (!config.banner) config.banner = {}
    if (!config.banner.js) config.banner.js = ''
  }

  if (config.prepend) {
    if (!Array.isArray(config.prepend)) config.prepend = [config.prepend]
    for (const source of config.prepend.reverse()) {
      config.banner.js = `${await fs.promises.readFile(source, 'utf-8')}\n${config.banner.js}`
    }
    delete config.prepend
  }

  if (config.globalThis) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
    config.banner.js = `var global = Function("return this")();\n${config.banner.js}`
    delete config.globalThis
  }

  const meta = (await esbuild.build(config)).metafile
  console.log('** bundled', Object.keys(meta.outputs).join(', '))
  if (typeof metafile === 'string') await fs.promises.writeFile(metafile, JSON.stringify(meta, null, 2))
}

async function rebuild() {
  // process
  await bundle({
    globalName: 'process',
    entryPoints: [ 'node_modules/process/browser.js' ],
    outfile: 'gen/process.js',
  })

  // plugin code
  await bundle({
    entryPoints: [ 'content/better-bibtex.ts' ],
    plugins: [kuroshiro, loaders, shims],
    outdir: 'build/content',
    banner: { js: 'if (!Zotero.BetterBibTeX) {\n' },
    footer: { js: '\n}' },
    metafile: 'gen/esbuild.json',
    globalThis: true,
    prepend: 'gen/process.js',
  })

  // worker code
  const vars = [ 'Zotero', 'workerContext' ]
  const globalName = vars.join('__')
  await bundle({
    entryPoints: [ 'translators/worker/zotero.ts' ],
    globalName,
    plugins: [loaders, shims],
    outdir: 'build/resource/worker',
    banner: { js: 'importScripts("resource://zotero/config.js") // import ZOTERO_CONFIG' },
    footer: {
      js: [
        `const { ${vars.join(', ')} } = ${globalName};`,
        'importScripts(`resource://zotero-better-bibtex/${workerContext.translator}.js`);',
      ].join('\n'),
    },
    globalThis: true,
    prepend: 'gen/process.js',
  })

  // translators
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
      globalName,
      plugins: [loaders, throwShims],
      outfile,
      banner: { js: `if (typeof ZOTERO_TRANSLATOR_INFO === 'undefined') var ZOTERO_TRANSLATOR_INFO = ${JSON.stringify(header)};` },
      footer: { js: `const { ${vars.join(', ')} } = ${globalName};` },
      globalThis: true,
    })

    const source = await fs.promises.readFile(outfile, 'utf-8')
    const checksum = crypto.createHash('sha256')
    checksum.update(source)
    if (!header.configOptions) header.configOptions = {}
    header.configOptions.hash = checksum.digest('hex')
    header.lastUpdated = (new Date).toISOString().replace(/T.*/, '')
    await fs.promises.writeFile(path.join('build/resource', translator.name + '.json'), JSON.stringify(header, null, 2))
  }
}

rebuild().catch(err => console.log(err))
