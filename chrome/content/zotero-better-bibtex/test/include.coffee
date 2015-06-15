if not Zotero.BetterBibTeX.Test
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)
  loader.loadSubScript('chrome://zotero-better-bibtex/content/test/chai.js')
  loader.loadSubScript('chrome://zotero-better-bibtex/content/test/mocha.js')
  loader.loadSubScript('chrome://zotero-better-bibtex/content/test/setup.js')
