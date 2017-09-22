const fs = require('fs');
const path = require('path');

module.exports = fs.readdirSync(path.join(__dirname, '../resource')).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
