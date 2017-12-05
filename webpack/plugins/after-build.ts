function WebpackAfterBuildPlugin(callback) {
  this.callback = callback
}

WebpackAfterBuildPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', stats => { this.callback(stats, compiler.options) })
}

export = WebpackAfterBuildPlugin
