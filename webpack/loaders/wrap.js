const utils = require('loader-utils')

module.exports = function (source) {
  // this.cacheable()

  var src = this.resourcePath.substring(process.cwd().length + 1);
  // const opts = utils.getOptions(this) || {}
  return [].concat(`Zotero.debug('BBT: loading ${src}')`, source, `Zotero.debug('BBT: loaded ${src}')`).join('\n').trim()
}
