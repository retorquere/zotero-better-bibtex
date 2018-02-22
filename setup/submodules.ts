// tslint:disable:no-console

import * as shell from 'shelljs'
import rp = require('request-promise')

async function main() {
  let online = true
  try {
    await rp('https://github.com')
  } catch (err) {
    console.log(err)
    online = false
  }

  if (online) {
    console.log('update submodules')
    if (shell.exec('git submodule update --init --recursive --remote').code !== 0) throw new Error('submodule update failed')
  } else {
    console.log('offline, skipping submodules update')
  }
}

main()
