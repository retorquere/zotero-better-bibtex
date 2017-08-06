var version = require('../package.json').version;

if (process.env.CIRCLE_BUILD_NUM && !!process.env.CIRCLE_TAG) {
  version += '.circle.' + process.env.CIRCLE_BUILD_NUM;
} else if (process.env.CIRCLECI != 'true') {
  version += '.local.' + process.pid;
}
// do stuff for circle/local.release builds here
module.exports = version;
