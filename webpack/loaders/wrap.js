const utils = require('loader-utils')
const indent = require('indent-string');

module.exports = function (source) {
  // this.cacheable()

  var src = this.resourcePath.substring(process.cwd().length + 1);
  // const opts = utils.getOptions(this) || {}

  var pre = '';
  pre   += `Zotero.debug('BBT: loading ${src}')\n`;
  pre   += 'try\n';

  var post = '';
  post  += `  Zotero.debug('BBT: loaded ${src}')\n`;
  post  += 'catch err\n';
  post  += `  Zotero.debug('Error: BBT: load of ${src} failed:' + err)\n`;

  return pre + indent(source, 2) + post;
}
