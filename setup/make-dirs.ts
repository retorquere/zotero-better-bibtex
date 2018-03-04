// tslint:disable:no-console

import * as rimraf from 'rimraf'
import * as fs from 'fs-extra'
import * as path from 'path'

import root from 'zotero-plugin/root'

console.log('make build dirs under', root)
for (let dir of ['build', 'gen', 'gen/typings', 'xpi']) {
  dir = path.join(root, dir)
  console.log('creating', dir)
  rimraf.sync(dir)
  fs.mkdirSync(dir)
}
