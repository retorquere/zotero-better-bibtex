if not Zotero.BetterBibTeX
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)

  for script in " lokijs
                  zotero-better-bibtex
                  csl-localedata
                  juris-m-dateparser
                  fold-to-ascii
                  punycode
                  release
                  BetterBibTeXPatternFormatter
                  BetterBibTeXPatternParser
                  preferences
                  keymanager
                  web-endpoints
                  schomd
                  cayw
                  debug-bridge
                  cache
                  serialized
                  ".trim().split(/\s+/)
    loader.loadSubScript("chrome://zotero-better-bibtex/content/#{script}.js")

  window.addEventListener('load', (load = (event) ->
    window.removeEventListener('load', load, false) #remove listener, no longer needed
    Zotero.BetterBibTeX.init()
    return
  ), false)
