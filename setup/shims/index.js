const path = require('path')

module.exports = {
  name: 'shims',
  setup(build) {
    build.onResolve({ filter: /^(path|fs)$/ }, args => {
      return { path: path.resolve(path.join('setup/shims', args.path + '.js')) }
    })
  }
}
