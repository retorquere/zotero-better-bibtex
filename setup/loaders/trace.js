const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const { filePathFilter } = require('file-path-filter')
const esbuild = require('esbuild')
const Acorn = require('acorn')
const Aran = require('aran')
const Astring = require('astring')

let selected = false
if (fs.existsSync(path.join(__dirname, '../../.trace.json'))) {
  const branch = (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith('refs/heads/')) ? process.env.GITHUB_REF.replace('refs/heads/') : shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim()
  if (branch !== 'master' && branch !== 'main') {
    let trace = require('../../.trace.json')
    trace = trace[branch]
    if (trace) selected = filePathFilter(trace)
  }
}

module.exports.trace = ({ logArguments = false, logExceptions = true } = {}) => ({
  name: 'tracer',
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const localpath = path.relative(process.cwd(), args.path)
      if (!selected || !selected(localpath)) return null

      console.log(`!!!!!!!!!!!!!! Instrumenting ${localpath} for trace logging !!!!!!!!!!!!!`)

      const source = await esbuild.transform(await fs.promises.readFile(args.path, 'utf-8'), { loader: 'ts' })

      
      return {
        contents: tracer + injector.injectTracing(localpath, source, logExceptions, logArguments),
        loader: 'js',
      }
    })
  }
})
