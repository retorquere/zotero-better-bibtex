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
exec('patch -u -p0 -o node_modules/kuroshiro/src/core-sync.js < setup/kuroshiro.patch')
exec('patch -u -p0 -o node_modules/kuroshiro-analyzer-kuromoji/src/kuroshiro-analyzer-kuromoji-sync.js < setup/kuroshiro-analyzer-kuromoji-sync.patch')
