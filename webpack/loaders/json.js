// const stringify = require('./escaped-json')
const jsesc = require('jsesc');

function normalize(obj) {
  if (Array.isArray(obj)) {
    return obj.map(function(e) { return normalize(e) })
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce(function(n, p) {
      n[p.normalize('NFC')] = normalize(obj[p]);
      return n;
    }, {})
  }

  if (typeof obj === 'string') {
    return obj.normalize('NFC')
  }

  return obj
}

module.exports = function (source) {
  if (this.cacheable) this.cacheable();

  var value = typeof source === "string" ? JSON.parse(source) : source;

  // value = stringify(value, null, 2);

  value = jsesc(normalize(value), {
    compact: false,
    indent: '  ',
  })

  return `
    module.exports = ${value};
  `;
}
