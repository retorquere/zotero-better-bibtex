// tslint:disable:no-console

import * as shell from 'shelljs'
import * as fs from 'fs-extra'

function exec(cmd) {
  if (shell.exec(cmd).code !== 0) throw new Error(`failed: ${cmd}`)
}

const dicts = 'node_modules/kuromoji/dict'
const unzipped = 'build/resource/kuromoji'

exec(`mkdir -p ${unzipped}`)
for (const dict of fs.readdirSync(dicts)) {
  console.log(dict)
  const dat = dict.replace('.gz', '')
  exec(`zcat ${dicts}/${dict} > ${unzipped}/${dat}`)
}
