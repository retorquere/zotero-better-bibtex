'use strict';

const ConcatSource = require('webpack-sources').ConcatSource;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const jxon = require('jxon');
const fs = require('fs');
const path = require('path');
const version = require('./version');

function InstallRDFPlugin(options) {
  this.options = options || {}
};
module.exports = InstallRDFPlugin;

InstallRDFPlugin.prototype.apply = function(compiler) {
  var options = this.options;
  var self = this;

  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
      for (let chunk of chunks) {
        if ('isInitial' in chunk && !chunk.isInitial()) continue;

        var install_rdf = fs.readFileSync(path.join(__dirname, '..', 'install.rdf'), 'utf8');
        install_rdf = jxon.stringToJs(install_rdf);
        install_rdf.RDF.Description['em:version'] = version;
        install_rdf = jxon.jsToString(install_rdf);

        for (let file of chunk.files.filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))) {
          compilation.assets[file] = new ConcatSource(install_rdf);
        }
      }
      callback();
    });
  });
}
