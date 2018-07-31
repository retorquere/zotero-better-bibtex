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
  exec(`gunzip -d ${dicts}/${dict} > ${unzipped}/${dat}`)
}
