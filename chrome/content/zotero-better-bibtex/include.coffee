if not Zotero.BetterBibTeX
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)

  for script in " lokijs
                  zotero-better-bibtex
                  cacheVersion
                  db
                  csl-localedata
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
                  autoexport
                  serialized
                  ".trim().split(/\s+/)
    Zotero.debug('BBT: ' + script)
    loader.loadSubScript("chrome://zotero-better-bibtex/content/#{script}.js")

  window.addEventListener('load', (load = (event) ->
    window.removeEventListener('load', load, false) #remove listener, no longer needed
    Zotero.BetterBibTeX.init()
    return
  ), false)
