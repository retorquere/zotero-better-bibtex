const utils = require('loader-utils')
const indent = require('indent-string');

module.exports = function (source) {
  // this.cacheable()

  var src = this.resourcePath.substring(process.cwd().length + 1);

  var loading = `Zotero.debug('BBT: loading ${src}')`;
  var loaded = `Zotero.debug('BBT: loaded ${src}')`;
  var errvar = '$wrap_loader_catcher_' + src.replace(/[^a-zA-Z0-9]/g, '_');
  var failed = `Zotero.debug('Error: BBT: load of ${src} failed:' + ${errvar} + '::' + ${errvar}.stack)`;

  switch (src.split('.').pop()) {
    case 'coffee':
      var pre = '';
      pre   += loading + '\n';
      pre   += 'try\n';

      var post = '';
      post  += `  ${loaded}\n`;
      post  += `catch ${errvar}\n`;
      post  += `  ${failed}\n`;

      return pre + indent(source, 2) + post;
      break;

    case 'ts':
      return `${loading}; try { ${source}; ${loaded}; } catch (${errvar}) { ${failed} };`

    default:
      throw new Error(`Unexpected extension on ${src}`);
  }
}
