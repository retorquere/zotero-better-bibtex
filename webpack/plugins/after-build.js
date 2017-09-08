function WebpackAfterBuildPlugin(callback) {
  this.callback = callback;
};

WebpackAfterBuildPlugin.prototype.apply = function(compiler) {
  var callback = this.callback;
  compiler.plugin('done', function(stats) {
    callback(stats, compiler.options);
  });
};

module.exports = WebpackAfterBuildPlugin;
