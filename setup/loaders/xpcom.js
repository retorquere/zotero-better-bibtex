const fs = require('fs').promises
const path = require('path')
const esbuild = require('esbuild')
const ejs = require('ejs')

module.exports.xpcom = {
  name: 'xpcom',
  setup(build) {

    // Do another parallel ESM build to get the exported symbol list
    const esmBuild = esbuild.build({
      ...build.initialOptions,
      logLevel: 'silent',
      format: 'esm',
      metafile: true,
      write: false,
      plugins: build.initialOptions.plugins.filter(plugin => plugin.name !== 'xpcom'),
    })

    // Do a CommonJS build with a metafile
    build.initialOptions.format = 'cjs'
    build.initialOptions.metafile = true

    // When the build ends, wait for the other build
    build.onEnd(async cjsResult => {
      const esmResult = await esmBuild.catch(() => ({}))

      // If both builds succeeded, rewrite each entry point output file
      if (cjsResult.metafile && esmResult.metafile) {
        for (const output in cjsResult.metafile.outputs) {
          const cjs = cjsResult.metafile.outputs[output]
          if (!cjs.entryPoint) continue
          const esm = esmResult.metafile.outputs[output]

          // Wrap the CommonJS module
          const EXPORTED_SYMBOLS = esm.exports
          let js = await fs.readFile(output, 'utf8')
          js = ejs.render(await fs.readFile(path.join(__dirname, 'xpcom.ejs'), 'utf8'), { external: build.initialOptions.external || [], EXPORTED_SYMBOLS, javascript: js })

          console.log('writing', output)
          await fs.writeFile(output, js)
        }
      }
    })
  },
}
