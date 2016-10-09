if not Zotero.BetterBibTeX
  loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)

  for script in " lokijs
                  zotero-better-bibtex
                  lib/citeproc
                  vardump
                  preferences
                  translators
                  db
                  csl-localedata
                  fold-to-ascii
                  punycode
                  BetterBibTeXPatternFormatter
                  BetterBibTeXPatternParser
                  preferences
                  keymanager
                  journalAbbrev
                  web-endpoints
                  schomd
                  cayw
                  debug-bridge
                  cache
                  autoexport
                  serialized
                  ".trim().split(/\s+/)
    try
      Zotero.debug('BBT: ' + script)
      loader.loadSubScript("chrome://zotero-better-bibtex/content/#{script}.js")
    catch err
      Zotero.debug('BBT: failed to load' + script + ': ' + err)

  try
    Zotero.debug('BBT: scheduling init')
    do ->
      window.addEventListener('load', (load = (event) ->
        Zotero.debug('BBT: init')
        window.removeEventListener('load', load, false) #remove listener, no longer needed
        try
          Zotero.BetterBibTeX.init()
        catch err
          Zotero.debug('BBT: failed to initialize: ' + err)
        return
      ), false)
  catch err
    Zotero.debug('BBT: failed to schedule init: ' + err)
