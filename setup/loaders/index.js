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
const pug = require('pug')

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

module.exports.resettableBinary = {
  name: 'resettable-binary',
  setup(build) {
    build.onLoad({ filter: /[.]wasm$/i }, async (args) => {
      const contents = `
        var table = new Uint8Array(128);
        for (var i = 0; i < 64; i++) table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i;
        function decode(base64) {
          var n = base64.length, bytes = new Uint8Array((n - (base64[n - 1] == "=") - (base64[n - 2] == "=")) * 3 / 4 | 0);
          for (var i2 = 0, j = 0; i2 < n; ) {
            var c0 = table[base64.charCodeAt(i2++)], c1 = table[base64.charCodeAt(i2++)];
            var c2 = table[base64.charCodeAt(i2++)], c3 = table[base64.charCodeAt(i2++)];
            bytes[j++] = c0 << 2 | c1 >> 4;
            bytes[j++] = c1 << 4 | c2 >> 2;
            bytes[j++] = c2 << 6 | c3;
          }
          return bytes;
        }

        var wasm = { bytes: decode(${JSON.stringify(fs.readFileSync(args.path).toString('base64'))}) }
        export default wasm
      `
      return {
        contents,
        loader: 'js'
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

module.exports.pug = {
  name: 'pug',
  setup(build) {
    build.onLoad({ filter: /\.pug$/ }, async (args) => {
      const template = await fs.promises.readFile(args.path, 'utf-8')
      const template_function = pug.compileClient(template, { globals: [ 'Date', 'Math' ] })
        .split('\n')
        .filter(line => !line.trim().match(/^;pug_debug_line = [0-9]+;$/))
        .join('\n')
        .replace(/\\u003C/g, '<')
        .replace(/\\u003E/g, '>')
        .replace(/\\u002F/g, '/')
      console.log(template_function);

      return {
        contents: `module.exports = ${template_function}`,
        loader: 'js'
      }
    })
  }
}
