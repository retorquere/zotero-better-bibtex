// tslint:disable:no-console

import * as fs from 'fs-extra'
import * as glob from 'glob'
import * as path from 'path'

import root from './root'

function include(file) {
  if (fs.lstatSync(file).isDirectory()) return false

  switch (path.extname(file).toLowerCase()) {
    case '.json':
    case '.ts':
    case '.pegjs':
      return false
  }

  return true
}

console.log('copying assets')

let files = []
for (const dir of ['content', 'skin', 'locale']) {
files = files.concat(glob.sync(`${dir}/**/*.*`, { cwd: root, mark: true }).filter(include))
}
files.push('chrome.manifest')

for (const source of files) {
  console.log(`  ${source}`)
  const target = path.join(root, 'build', source)
  fs.ensureDirSync(path.dirname(target))
  fs.copySync(source, target)
}
