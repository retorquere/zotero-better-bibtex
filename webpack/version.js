var version = require('../package.json').version;
var os = require("os");

if (process.env.CIRCLE_BUILD_NUM && !process.env.CIRCLE_TAG) {
  version += [ '', process.env.CIRCLE_BUILD_NUM, process.env.CIRCLE_BRANCH].join('.')
} else if (process.env.CIRCLECI != 'true') {
  version += [ '', os.userInfo().username, os.hostname() ].join('.')
}
module.exports = version;
