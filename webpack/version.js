var version = require('../package.json').version;
var os = require("os");

if (process.env.CIRCLE_BUILD_NUM && !process.env.CIRCLE_TAG) {
  version += '.' + process.env.CIRCLE_BRANCH + '.' + process.env.CIRCLE_BUILD_NUM;
} else if (process.env.CIRCLECI != 'true') {
  var hostname = os.hostname();
  var username = os.userInfo().username
  version += '.' + hostname + '.' + username;
}
module.exports = version;
