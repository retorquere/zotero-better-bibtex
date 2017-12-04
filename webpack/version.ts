// tslint:disable:no-console

import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs-extra'

import root from './root'
import './circle'

let version = null

const version_js = path.join(root, 'gen/version.js')
if (fs.existsSync(version_js)) {
  version = require(version_js)
} else {
  console.log('writing version')

  version = require(path.join(root, 'package.json')).version

  if (process.env.CIRCLE_BUILD_NUM && !process.env.CIRCLE_TAG) {
    let branch = process.env.CIRCLE_BRANCH
    if (branch.match(/^[0-9]+$/)) branch = 'issue-' + branch
    version += [ '', process.env.CIRCLE_BUILD_NUM, branch].join('.')
  } else if (process.env.CIRCLECI !== 'true') {
    version += [ '', os.userInfo().username, os.hostname() ].join('.')
  }

  fs.writeFileSync(version_js, `module.exports = ${JSON.stringify(version)};\n`, 'utf8')
}

export default version
