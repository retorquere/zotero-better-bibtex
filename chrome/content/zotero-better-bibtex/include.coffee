if not Zotero.BetterBibTeX
  Zotero.debug('Loading BBT')
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)

  for script in " lokijs
                  zotero-better-bibtex
                  fold-to-ascii
                  release
                  BetterBibTeXPatternFormatter
                  BetterBibTeXPatternParser
                  preferences
                  keymanager
                  web-endpoints
                  schomd
                  debug-bridge
                  cache
                  serialized
                  ".trim().split(/\s+/)
    loader.loadSubScript("chrome://zotero-better-bibtex/content/#{script}.js")

  window.addEventListener('load', (load = (event) ->
    window.removeEventListener('load', load, false) #remove listener, no longer needed
    Zotero.BetterBibTeX.init()
    Zotero.debug('BBT loaded')
    return
  ), false)
