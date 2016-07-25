Zotero.BetterBibTeX.Pref = new class
  branch: Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.zotero.translators.better-bibtex.')
  cache: {}

  constructor: ->
    @load(@branch)

  load: (root, key = null) ->
    if key
      keys = [key]
    else
      keys = @branch.getChildList('')

    for key in keys
      try
        switch @branch.getPrefType(key)
          when @branch.PREF_BOOL
            @cache[key] = root.getBoolPref(key)
          when @branch.PREF_STRING
            @cache[key] = '' + root.getComplexValue(key, Components.interfaces.nsISupportsString)
          when @branch.PREF_INT
            @cache[key] = root.getIntPref(key)
          else
            throw "Zotero.BetterBibTeX.Pref: unexpected type for preference #{key}: #{@branch.getPrefType(key)}"
      catch e
        throw "Zotero.BetterBibTeX.Pref: error loading preference '#{key}': #{e}"
    Zotero.BetterBibTeX.debug('Zotero.BetterBibTeX.Pref: loaded', keys, 'into', @cache)

  observer:
    register: -> Zotero.BetterBibTeX.Pref.branch.addObserver('', @, false)
    unregister: -> Zotero.BetterBibTeX.Pref.branch.removeObserver('', @)
    observe: (subject, topic, data) ->
      Zotero.BetterBibTeX.debug('Zotero.BetterBibTeX.Pref: preference change:', subject, topic, data)
      # make sure the Prefs are up to date
      Zotero.BetterBibTeX.Pref.load.call(Zotero.BetterBibTeX.Pref, subject, data)

      switch data
        when 'debug'
          ### don't drop the cache just for this ###
          Zotero.BetterBibTeX.debugMode()
          return

        when  'removeStock',            \
              'autoExport',             \
              'autoExportIdleWait',     \
              'cacheFlushInterval',     \
              'cacheReset',             \
              'confirmCacheResetSize',  \
              'caching',                \
              'citeCommand',            \
              'debug',                  \
              'keyConflictPolicy',      \
              'pinCitekeys',            \
              'rawImports',             \
              'scanCitekeys',           \
              'showCitekeys',           \
              'showItemIDs',            \
              'tests',                  \
              'warnBulkModify',         \
              'quickCopyMode',          \
              'usePrefix'
          ### innocent changes ###
          return

        when 'test.timestamp'
          ### for testing only ###
          return

        when 'citekeyFormat', 'citekeyFold'
          Zotero.BetterBibTeX.keymanager.setFormatter()

        when 'autoAbbrevStyle'
          Zotero.BetterBibTeX.JournalAbbrev.reset()

        when  'asciiBibLaTeX',            \
              'asciiBibTeX',              \
              'attachmentsNoMetadata',    \
              'autoAbbrevStyle',          \
              'autoAbbrev',               \
              'citekeyFormat',            \
              'citekeyFold',              \
              'DOIandURL',                \
              'bibtexURL',                \
              'csquotes',                 \
              'langID',                   \
              'preserveBibTeXVariables',  \
              'skipFields',               \
              'skipWords',                \
              'postscript',               \
              'jabrefGroups',             \
              'defaultDateParserLocale',  \
              'parseParticles',           \
              'titleCase',                \
              'titleCaseLowerCase',       \
              'titleCaseUpperCase',       \
              'jurismPreferredLanguage'
          ### pass through to cache drop ###

        else
          Zotero.BetterBibTeX.debug("Zotero.BetterBibTeX.Pref: Did not expect change to preference #{data}")
          throw "Did not expect change to preference #{data}!"

      ### drop the cache and kick off all exports ###
      Zotero.BetterBibTeX.cache.reset("pref change: #{data}")
      Zotero.BetterBibTeX.auto.reset('preferences change')

  snapshot: -> JSON.parse(JSON.stringify(@cache))
  stash: -> @stashed = @snapshot()
  restore: -> @cache = JSON.parse(JSON.stringify(@stashed))

  set: (key, value) ->
    @cache[key] = value
    Zotero.Prefs.set("translators.better-bibtex.#{key}", value)

  get: (key) -> @cache[key]

  clear: (key) ->
    @branch.clearUserPref(key)
    @cache[key] = Zotero.Prefs.get("translators.better-bibtex.#{key}")
