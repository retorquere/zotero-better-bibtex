const path = require('path')
const fs = require('fs')
const exists = fs.existsSync
const esbuild = require('esbuild')
const exec = require('child_process').exec
const glob = require('glob-promise')
const crypto = require('crypto')
const branch = require('git-branch')

const loader = require('./setup/loaders')
const shims = require('./setup/shims')

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
    bundle: true,
    format: 'iife',
  }
  if (!config.platform) config.target = ['firefox60']

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

  let target
  if (config.outfile) {
    target = config.outfile
  }
  else if (config.entryPoints.length === 1 && config.outdir) {
    target = path.join(config.outdir, path.basename(config.entryPoints[0]))
  }
  else {
    target = `${config.outdir} [${config.entryPoints.join(', ')}]`
  }
  console.log('* bundling', target)
  const meta = (await esbuild.build(config)).metafile
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
    plugins: [loader.trace, loader.patcher('setup/patches'), loader.bibertool, loader.pegjs, loader.__dirname, shims],
    outdir: 'build/content',
    banner: { js: 'if (!Zotero.BetterBibTeX) {\n' },
    footer: { js: '\n}' },
    metafile: 'gen/plugin.json',
    globalThis: true,
    prepend: 'gen/process.js',
  })

  // worker code
  const vars = [ 'Zotero', 'workerContext' ]
  const globalName = vars.join('__')
  await bundle({
    entryPoints: [ 'translators/worker/zotero.ts' ],
    globalName,
    plugins: [loader.bibertool, loader.pegjs, loader.__dirname, shims],
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
    metafile: 'gen/worker.json',
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
      plugins: [loader.bibertool, loader.pegjs, loader.__dirname, shims],
      outfile,
      banner: { js: `if (typeof ZOTERO_TRANSLATOR_INFO === 'undefined') var ZOTERO_TRANSLATOR_INFO = ${JSON.stringify(header)};` },
      footer: { js: `const { ${vars.join(', ')} } = ${globalName};` },
      globalThis: true,
      metafile: `gen/${translator.name}.json`,
    })

    const source = await fs.promises.readFile(outfile, 'utf-8')
    const checksum = crypto.createHash('sha256')
    checksum.update(source)
    if (!header.configOptions) header.configOptions = {}
    header.configOptions.hash = checksum.digest('hex')
    header.lastUpdated = (new Date).toISOString().replace(/T.*/, '')
    await fs.promises.writeFile(path.join('build/resource', translator.name + '.json'), JSON.stringify(header, null, 2))
  }

  if (await branch() === 'headless') {
    let node_modules = loader.node_modules('setup/patches')
    await bundle({
      platform: 'node',
      // target: ['node12'],
      // inject: [ './headless/inject.js' ],
      plugins: [node_modules.plugin, loader.patcher('setup/patches'), loader.bibertool, loader.pegjs ],
      bundle: true,
      format: 'iife',
      globalName: 'Headless',
      entryPoints: [ 'headless/zotero.ts' ],
      outfile: 'gen/headless/zotero.js',
      banner: {
        js: 'var ZOTERO_CONFIG = { GUID: "zotero@" };\n',
      },
      footer: {
        js: 'const { Zotero, DOMParser } = Headless;\n'
      },
      metafile: 'gen/headless/zotero.json',
    })
    let external = node_modules.external

    node_modules = loader.node_modules('setup/patches')
    await bundle({
      platform: 'node',
      // target: ['node12'],
      // inject: [ './headless/inject.js' ],
      plugins: [node_modules.plugin, loader.patcher('setup/patches'), loader.bibertool, loader.pegjs ],
      bundle: true,
      format: 'iife',
      globalName: 'Headless',
      entryPoints: [ 'headless/index.ts' ],
      outfile: 'gen/headless/index.js',
      metafile: 'gen/headless/index.json',
      banner: {
        js: await fs.promises.readFile('gen/headless/zotero.js', 'utf-8')
      }
    })
    external = [...new Set(external.concat(node_modules.external))].sort()

    const package_json = JSON.parse(await fs.promises.readFile('package.json', 'utf-8'))
    const move = Object.keys(package_json.dependencies).filter(pkg => !external.includes(pkg))
    if (move.length) {
      console.log('  the following packages should be moved to devDependencies')
      for (const pkg of move.sort()) {
        console.log('  *', pkg)
      }
    }
  }
}

rebuild().catch(err => console.log(err))
