const fs = require('fs')
const path = require('path')
const diff = require('diff')

function loader(dir) {
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

module.exports = { loader }
