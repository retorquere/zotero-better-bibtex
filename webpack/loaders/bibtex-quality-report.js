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

  var raw = typeof source === "string" ? JSON.parse(source) : source;
  var cooked = {};

  var allOptional = {}
  for (var optional of (raw['*'] && raw['*'].optional ? raw['*'].optional : [])) {
    let [fields, status] = optional.split(':')
    status = status || true;
    for (var field of fields.split('/')) {
      allOptional[field] = status;
    }
  }

  for (const [type, fields] of Object.entries(raw)) {
    if (type == '*') continue

    var config = {
      required: fields.required.map(field => field.split('/'))
    }

    if (fields.optional && fields.optional.length) {
      config.allowed = {}

      for (var optional of fields.optional) {
        let [fields, status] = optional.split(':')
        status = status || true;
        for (var field of fields.split('/')) {
          config.allowed[field] = status;
        }
      }
      for (var required of config.required) {
        for (field of required) {
          config.allowed[field] = true;
        }
      }

      config.allowed = Object.assign({}, allOptional, config.allowed)
    }

    cooked[type] = config;
  }

  cooked = jsesc(normalize(cooked), {
    compact: false,
    indent: '  ',
  })

  return `module.exports = ${cooked};\n`;
}
