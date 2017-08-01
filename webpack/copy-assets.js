const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

function include(file) {
  if (file[file.length -1] == '/') return false;

  switch (path.extname(file).toLowerCase()) {
    case '.json':
    case '.coffee':
    case '.pegjs':
      return false;
  }

  return true;
}

module.exports = function() {
  var files = [];

  files = files.concat(glob.sync('content/**/*.*', { cwd: path.join(__dirname, '..'), mark: true }).filter(include))
  files = files.concat(glob.sync('skin/**/*.*', { cwd: path.join(__dirname, '..'), mark: true }).filter(include))
  files = files.concat(glob.sync('locale/**/*.*', { cwd: path.join(__dirname, '..'), mark: true }).filter(include))
  files.push('chrome.manifest')

  console.log('copying assets');

  files.forEach(function(source) {
    console.log(`  ${source}`)
    var target = path.join('build', source)
    fs.ensureDirSync(path.dirname(target));
    fs.copySync(source, target);
  })
}
