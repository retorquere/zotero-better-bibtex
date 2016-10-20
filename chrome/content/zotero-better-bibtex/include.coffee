if not Zotero.BetterBibTeX
  do ->
    loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)

    for script in ["zotero-better-bibtex.js","lib/lokijs.js","lib/translit.js","lib/citeproc.js","lib/vardump.js","lib/fold-to-ascii.js","lib/punycode.js","preferences.js","translators.js","translator-metadata.js","db.js","csl-localedata.js","pattern-formatter.js","Zotero.BetterBibTeX.PatternParser.js","keymanager.js","journalAbbrev.js","web-endpoints.js","schomd.js","cayw.js","debug-bridge.js","cache.js","autoexport.js","serialized.js"]
      try
        Zotero.debug('BBT: ' + script)
        loader.loadSubScript("chrome://zotero-better-bibtex/content/#{script}")
      catch err
        Zotero.BetterBibTeX.disabled = "#{script} load failed: #{err}" if Zotero.BetterBibTeX
        Zotero.debug("BBT: #{script} load failed: #{err}")
        loader = null
        break

    if loader
      Zotero.debug('BBT: all loaded')
      try
        Zotero.debug('BBT: scheduling init')
        window.addEventListener('load', (load = (event) ->
          Zotero.debug('BBT: init')
          window.removeEventListener('load', load, false) #remove listener, no longer needed
          try
            Zotero.BetterBibTeX.init()
          catch err
            Zotero.BetterBibTeX.disabled = "Initialize failed: #{err}"
            Zotero.debug('BBT: failed to initialize: ' + err)
          return
        ), false)
      catch err
        Zotero.BetterBibTeX.disabled = "Initialize failed: #{err}"
