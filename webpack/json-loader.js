module.exports = function (source) {
  if (this.cacheable) this.cacheable();

  var value = typeof source === "string" ? JSON.parse(source) : source;

  value = JSON.stringify(value, null, 2).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

  return `// strings are normalized to NFKC\nmodule.exports = ${value};\n`.normalize('NFKC');
}
