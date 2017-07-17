const fs = require('fs');
const path = require('path');

module.exports = function () {
  return fs.readdirSync(path.join(__dirname, '../resource')).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
}
