const path = require('path')

module.exports = {
  name: 'shims',
  setup(build) {
    build.onResolve({ filter: /^(node:)?(path|fs|os)$/ }, args => {
      return { path: path.resolve(path.join(__dirname, args.path.replace(/^node:/, '') + '.js')) }
    })
  }
}
