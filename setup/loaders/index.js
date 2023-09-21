const fs = require('fs-extra')
const path = require('path')
const diff = require('diff')
const peggy = require('peggy')
const shell = require('shelljs')
const { filePathFilter } = require('file-path-filter')
const esbuild = require('esbuild')
const putout = require('putout')
const child_process = require('child_process')
const jsesc = require('jsesc')

const patcher = module.exports.patcher = new class {
  constructor() {
    this.current = null
    this.silent = false
    this.patched = {}
    this.used = new Set
  }

  load(dir) {
    let filter = []
    for (let patchfile of fs.readdirSync(dir)) {
      patchfile = path.join(dir, patchfile)
      const patches = diff.parsePatch(fs.readFileSync(patchfile, 'utf-8'))
      if (patches.length !== 1) throw new Error(`${patchfile} has ${patches.length} patches, expected 1`)
      for (const patch of patches) {
        if (!patch.oldFileName.endsWith('.js')) throw new Error(`${patchfile} patches non-js file ${patch.oldFileName}`)
        if (patch.newFileName != patch.oldFileName) {
          throw new Error(`${patchfile} renames ${JSON.stringify(patch.oldFileName)} to ${JSON.stringify(patch.newFileName)}`)
        }
        if (!patch.oldFileName.match(/^(node_modules|submodules)/)) {
          throw new Error(`${patchfile} patches ${JSON.stringify(patch.oldFileName)} outside node_modules/submodules`)
        }
        filter.push(patch.oldFileName)

        const patched = path.join(process.cwd(), patch.oldFileName)

        if (this.patched[patched]) throw new Error(`${patchfile} re-patches ${JSON.stringify(patch.oldFileName)}`)
        if (!fs.existsSync(patched)) throw new Error(`${patchfile} patches non-existent ${JSON.stringify(patch.oldFileName)}`)

        const cmd = `patch --quiet -o - ${JSON.stringify(patched)} ${JSON.stringify(patchfile)}`
        this.patched[patched] = child_process.execSync(cmd).toString()
        if (!this.patched[patched]) throw new Error(`${cmd} failed:\n${stderr || ''}`)
      }
    }
    
    filter = filter
      .map(p => p.replace(/[.*+?^${}()\|\[\]\\\/]/g, c => c === '[' || c === ']' ? `\\${c}` : `[${c}]`))
      .map(p => `([/]${p}$)`)
      .join('|')

    this.plugin = {
      name: 'patcher',
      setup(build) {
        build.onLoad({ filter: new RegExp(filter) }, (args) => {
          const contents = patcher.patched[args.path]
          if (!contents) throw new Error(`${args.path} should have been patched, but no patch was found among ${JSON.stringify(Object.keys(patcher.patched))}`)
          patcher.used.add(args.path)
          if (!patcher.silent) console.log('  loading patched', path.relative(process.cwd(), args.path))
          // , Object.keys(patcher.patched).filter(p => !patcher.used.has(p)).length, 'unused')
          return { contents, loader: 'js' }
        })
      }
    }
  }
}

module.exports.text = {
  name: 'text',
  setup(build) {
    build.onLoad({ filter: /[.]bib$/i }, async (args) => {
      let text = await fs.promises.readFile(args.path, 'utf-8')
      return {
        contents: text,
        loader: 'text'
      }
    })
  }
}

module.exports.sql = {
  name: 'text',
  setup(build) {
    build.onLoad({ filter: /[.]sql$/i }, async (args) => {
      let text = await fs.promises.readFile(args.path, 'utf-8')
      const ddl = text.split('\n--\n')
        //.map(ddl => ddl.replace(/[\s\n]+/g, ' '))
        .filter(stmt => !stmt.startsWith('#'))
      return {
        contents: `module.exports = ${jsesc(ddl)}`,
        loader: 'js'
      }
    })
  }
}

module.exports.json = {
  name: 'json',
  setup(build) {
    build.onLoad({ filter: /\.json$/ }, async (args) => {
      const json = JSON.parse(await fs.promises.readFile(args.path, 'utf-8'))
      return {
        contents: `module.exports = ${jsesc(json)}`,
        loader: 'js'
      }
    })
  }
}

module.exports.peggy = {
  name: 'peggy',
  setup(build) {
    build.onLoad({ filter: /\.peggy$/ }, async (args) => {
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

module.exports.__dirname = {
  name: '__dirname',
  setup(build) {
    build.onLoad({ filter: /\/node_modules\/.+\.js$/ }, async (args) => {
      let contents = await fs.promises.readFile(args.path, 'utf-8')
      const filename = 'chrome://zotero-better-bibtex/' + (args.path.includes('/node_modules/') ? args.path.replace(/.*\/node_modules\//, '') : path.resolve(__dirname, args.path))
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

let trace
if (fs.existsSync(path.join(__dirname, '../../.trace.json'))) {
  const branch = (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith('refs/heads/')) ? process.env.GITHUB_REF.replace('refs/heads/', '') : shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim()
  console.log('building on', branch)
  if (branch !== 'master' && branch !== 'main') {
    trace = require('../../.trace.json')
    trace = trace[branch]
    console.log(`instrumenting ${branch}: ${!!trace}`)
  }
}

const prefix = fs.readFileSync(path.join(__dirname, 'trace.js'), 'utf-8')
module.exports.trace = function(section) {
  const selected = trace && trace[section] ? filePathFilter(trace[section]) : null

  return {
    name: 'trace',
    setup(build) {
      build.onLoad({ filter: selected ? /\.ts$/ : /^$/ }, async (args) => {
        const source = await esbuild.transform(await fs.promises.readFile(args.path, 'utf-8'), { loader: 'ts' })
        for (const warning of source.warnings) {
          console.log('!!', warning)
        }

        const localpath = path.relative(process.cwd(), args.path)

        // inject __estrace so sources can tell an instrumented build is active even if not on the current source
        if (!selected(localpath)) {
          const contents = `const __estrace = true;\n${source.code}`
          return {
            contents,
            loader: 'js',
          }
        }

        console.log(`!!!!!!!!!!!!!! Instrumenting ${localpath} for trace logging !!!!!!!!!!!!!`)

        try {
          const { estracePlugin: estrace } = await import('estrace/plugin')
          const { code } = putout(source.code, {
            fixCount: 1,
            rules: {
              // 'estrace/trace': ['on', { url: localpath, exclude: [ 'FunctionExpression', 'ArrowFunctionExpression' ] }],
              'estrace/trace': ['on', { url: localpath }],
            },
            plugins: [ estrace ],
          })

          return {
            contents: `${prefix};${code}`,
            loader: 'js',
          }
        }
        catch (err) {
          await fs.promises.writeFile('/tmp/tt', `/* ${localpath.replace(/\.ts$/, '')}\n${err.stack}\n*/\n/${source.code}`)
          throw err
        }
      })
    }
  }
}
