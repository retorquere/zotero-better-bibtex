var version = require('../package.json').version;

if (process.env.CIRCLE_BUILD_NUM) {
  version += '.circle.' + process.env.CIRCLE_BUILD_NUM;
}
// do stuff for circle/local.release builds here
module.exports = version;
