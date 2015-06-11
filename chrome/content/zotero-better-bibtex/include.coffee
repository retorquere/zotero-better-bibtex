if not Zotero.BetterBibTeX
  Zotero.debug('Loading BBT')
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)

  loader.loadSubScript('chrome://zotero-better-bibtex/content/lokijs.js')

  loader.loadSubScript('chrome://zotero-better-bibtex/content/zotero-better-bibtex.js')

  for script in ['BetterBibTeXPatternFormatter', 'BetterBibTeXPatternParser', 'preferences', 'keymanager', 'web-endpoints', 'schomd', 'debug-bridge', 'cache', 'serialized']
    loader.loadSubScript("chrome://zotero-better-bibtex/content/#{script}.js")

  window.addEventListener('load', (load = (event) ->
    window.removeEventListener('load', load, false) #remove listener, no longer needed
    Zotero.BetterBibTeX.init()
    Zotero.debug('BBT loaded')
    return
  ), false)
