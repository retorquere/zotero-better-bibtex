'use strict';

const ConcatSource = require('webpack-sources').ConcatSource;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const jxon = require('jxon');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function PreferencesPlugin(options) {
  this.options = options || {}
};
module.exports = PreferencesPlugin;

PreferencesPlugin.prototype.apply = function(compiler) {
  var options = this.options;
  var self = this;

  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
      var prefs = fs.readFileSync(path.join(__dirname, '..', 'defaults/preferences/defaults.yml'), 'utf8');
      prefs = yaml.safeLoad(prefs);

      var js = Object.keys(prefs);
      js.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
      js = js.map(key => `pref(${JSON.stringify(key)}, ${JSON.stringify(prefs[key])});`).join("\n") + "\n";
      compilation.assets['defaults/preferences/defaults.js'] = new ConcatSource(js);
      callback();
      return;
    })
  });
}
