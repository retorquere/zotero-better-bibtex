var version = require('../package.json').version;
var os = require("os");
require('./circle');

if (process.env.CIRCLE_BUILD_NUM && !process.env.CIRCLE_TAG) {
  var branch = process.env.CIRCLE_BRANCH;
  if (branch.match(/^[0-9]+$/)) branch = 'issue-' + branch;
  version += [ '', process.env.CIRCLE_BUILD_NUM, branch].join('.')
} else if (process.env.CIRCLECI != 'true') {
  version += [ '', os.userInfo().username, os.hostname() ].join('.')
}
module.exports = version;
