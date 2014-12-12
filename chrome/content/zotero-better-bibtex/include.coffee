if not Zotero.BetterBibTeX
  Zotero.debug('Loading BBT')
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)
  loader.loadSubScript('chrome://zotero-better-bibtex/content/zotero-better-bibtex.js')
  window.addEventListener('load', (load = (event) ->
    window.removeEventListener('load', load, false) #remove listener, no longer needed
    Zotero.BetterBibTeX.init()
    return
  ), false)
Zotero.debug('BBT loaded')
