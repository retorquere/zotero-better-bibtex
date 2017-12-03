// tslint:disable:no-console

import * as rimraf from 'rimraf'
import * as fs from 'fs-extra'
import * as path from 'path'

import root from './root'

console.log('make build dirs')
for (const dir of [path.join(root, 'build'), path.join(root, 'gen'), path.join(root, 'xpi')]) {
  rimraf.sync(dir)
  fs.mkdirSync(dir)
}
