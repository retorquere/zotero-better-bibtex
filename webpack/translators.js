const fs = require('fs');
const path = require('path');

module.exports = fs.readdirSync(path.join(__dirname, '../resource'))
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace(/\.json$/, ''))
  .reduce((map, label) => {
    var ext = ['js', 'coffee'].find(e => fs.existsSync(path.join(__dirname, '../resource', `${label}.${e}`)));
    if (!ext) throw new Error(`No extension found for ${path.join(__dirname, '../resource', label)}`);
    map[label] = `${label}.${ext}`;
    return map;
  }, {});
