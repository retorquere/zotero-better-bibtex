module.exports = function (source) {
  var src = this.resourcePath.substring(process.cwd().length + 1);

  if (source.indexOf('module.exports') >= 0) throw new Error(`${src} contains module.exports`);
  return source;
}
