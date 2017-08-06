var version = require('../package.json').version;
var os = require("os");

console.log('version: base=', version);
console.log('version: CIRCLE_BUILD_NUM=', process.env.CIRCLE_BUILD_NUM)
console.log('version: CIRCLE_TAG=', process.env.CIRCLE_TAG)
if (process.env.CIRCLE_BUILD_NUM && !!process.env.CIRCLE_TAG) {
  version += '.circle.' + process.env.CIRCLE_BUILD_NUM;
} else if (process.env.CIRCLECI != 'true') {
  var hostname = os.hostname();
  var username = os.userInfo().username
  version += '.' + hostname + '.' + username;
}
console.log('version: final=', version);
module.exports = version;
