'use strict';

const fs = require('fs-extra');
const path = require('path');

module.exports = function() {
  console.log('generating defaults.js')
  fs.ensureDirSync(path.join(__dirname, '../build/defaults/preferences'));

  var prefs = require(path.join(__dirname, '..', 'gen/preferences.json'));
  var js = Object.keys(prefs);
  js.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
  js = js.map(key => `pref(${JSON.stringify('extensions.zotero.translators.better-bibtex.' + key)}, ${JSON.stringify(prefs[key])});`).join("\n") + "\n";
  fs.writeFileSync(path.join(__dirname, '../build/defaults/preferences/defaults.js'), js, 'utf8');
}
