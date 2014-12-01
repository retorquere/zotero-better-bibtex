if not Zotero.BetterBibTeX
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)
  loader.loadSubScript('chrome://zotero-better-bibtex/content/zotero-better-bibtex.js')
  loader.loadSubScript('chrome://zotero-better-bibtex/content/Formatter.js')
  window.addEventListener('load', ((e) -> Zotero.BetterBibTeX.init()), false)
