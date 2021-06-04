const putout = require('putout')
const esbuild = require('esbuild')
const fs = require('fs')

const source = esbuild.transformSync(fs.readFileSync('../../content/cayw/formatter.ts', 'utf-8'), { loader: 'ts' })
fs.writeFileSync('pre.js', source.code)
fs.writeFileSync('post.js', putout(source.code, {
    fixCount: 1,
    plugins: [
        ['trace', require('./trace')],
    ]
}).code)
