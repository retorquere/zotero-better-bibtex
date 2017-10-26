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

function flatten(arr) {
  return [].concat.apply([], arr);
}

module.exports = function (source) {
  if (this.cacheable) this.cacheable();

  var config = typeof source === "string" ? JSON.parse(source) : source;

  var allOptional = config['*'] && config['*'].optional ? config['*'].optional : [];
  allOptional = flatten(allOptional.map(field => field.split('/')))

  for (const [type, fields] of Object.entries(config)) {
    if (type == '*') continue

    var allowed = fields.optional || [];
    allowed = flatten(allowed.map(field => field.split('/'))).concat(allOptional);
    if (allowed.length) {
      allowed = allowed.concat(fields.required.join('/').split('/'))
    } else {
      allowed = undefined
    }

    config[type] = { required: fields.required.map(field => field.split('/')) }
    if (allowed) { config[type].allowed = allowed }
  }

  config = jsesc(normalize(config), {
    compact: false,
    indent: '  ',
  })

  return `module.exports = ${config};\n`;
}
