// tslint:disable:no-console

import * as shell from 'shelljs'
import * as fs from 'fs-extra'
import * as path from 'path'

function exec(cmd) {
  if (shell.exec(cmd).code !== 0) throw new Error(`failed: ${cmd}`)
}

const root = path.normalize(path.dirname(path.dirname(__filename)))
const dicts = `${root}/node_modules/kuromoji/dict`
const unzipped = `${root}/build/resource/kuromoji`

exec(`mkdir -p ${unzipped}`)
console.log('copying kuromoji dicts...')
for (const dict of fs.readdirSync(dicts)) {
  console.log('  ', dict)
  const dat = dict.replace('.gz', '')
  exec(`gunzip -c ${dicts}/${dict} > ${unzipped}/${dat}`)
}

console.log('patching kuroshiro')
let kuroshiro = fs.readFileSync('node_modules/kuroshiro/src/core.js', 'utf8')
kuroshiro = kuroshiro
  .replace('@returns {Promise} Promise object represents the result of conversion', '@returns {Promise} result of conversion')
  .replace('async convert(str, options)', 'convert(str, options)')
  .replace('const tokens = await this._analyzer.parse(str);', 'const tokens = this._analyzer.parse(str);')
fs.writeFileSync('node_modules/kuroshiro/src/coreSync.js', kuroshiro, 'utf8')
