if !Zotero.BetterBibTeX.Test
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)
  loader.loadSubScript('chrome://zotero-better-bibtex/content/test/yadda.js')
  loader.loadSubScript('chrome://zotero-better-bibtex/content/test/setup.js')
  loader.loadSubScript('chrome://zotero-better-bibtex/content/test/tests.js')
