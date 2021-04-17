const fs = require('fs')
const path = require('path')
const diff = require('diff')
const { bibertool } = require('./bibertool')
const pegjs = require('pegjs')

module.exports.patcher = function(dir) {
  const patches = {}
  for (let patchfile of fs.readdirSync(dir)) {
    for (const patch of diff.parsePatch(fs.readFileSync(path.join(dir, patchfile), 'utf-8'))) {
      console.log('patch:', patch.oldFileName)
      if (patch.oldFileName != patch.newFileName) throw new Error(`${patchfile} renames ${JSON.stringify(patch.oldFileName)} to ${JSON.stringify(patch.newFileName)}`)
      if (patches[patch.oldFileName]) throw new Error(`${patchfile} re-patches ${JSON.stringify(patch.oldFileName)}`)
      if (!patch.oldFileName.startsWith('node_modules/')) throw new Error(`${patchfile} patches ${JSON.stringify(patch.oldFileName)} outside node_modules`)
      patches[patch.oldFileName] = patch
    }
  }

  const filter = '.*\\/(' + Object.keys(patches).map(source => source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')$'

  return {
    name: 'patcher',
    setup(build) {
      build.onLoad({ filter: new RegExp(filter) }, async (args) => {
        const target = args.path.replace(/.*[/]node_modules[/]/, 'node_modules/')
        console.log('patching', target)
        const source = await fs.promises.readFile(args.path, 'utf-8')
        const patch = patches[target]

        return {
          contents: diff.applyPatch(source, patch),
          loader: 'js',
        }
      })
    }
  }
}

module.exports.bibertool = {
  name: 'bibertool',
  setup(build) {
    build.onLoad({ filter: /\.bibertool$/ }, async (args) => {
      return {
        contents: bibertool(await fs.promises.readFile(args.path, 'utf-8')),
        loader: 'js'
      }
    })
  }
}

module.exports.pegjs = {
  name: 'pegjs',
  setup(build) {
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

module.exports.__dirname = {
  name: '__dirname',
  setup(build) {
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
