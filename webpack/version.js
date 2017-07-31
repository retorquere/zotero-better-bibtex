var version = require('../package.json').version;

if (process.env.CIRCLE_BUILD_NUM && !!process.env.CIRCLE_TAG) {
  version += '.circle.' + process.env.CIRCLE_BUILD_NUM;
}
// do stuff for circle/local.release builds here
module.exports = version;
