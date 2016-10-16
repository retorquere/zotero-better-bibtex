Zotero.BetterBibTeX.Pref =
  branch: Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.zotero.translators.better-bibtex.')

  register: -> @branch.addObserver('', @, false)
  unregister: -> @branch.removeObserver('', @)
  observe: (subject, topic, data) ->
    Zotero.BetterBibTeX.debug('Pref.observe:', {key: data, value: @get(data)})
    try
      @observed(subject, topic, data)
    catch err
      Zotero.BetterBibTeX.debug('Pref.observe:', err)

  observed: (subject, topic, data) ->
    if data in [
        'asciiBibLaTeX'
        'asciiBibTeX'
        'attachmentsNoMetadata'
        'autoAbbrevStyle'
        'autoAbbrev'
        'citekeyFormat'
        'citekeyFold'
        'DOIandURL'
        'bibtexURL'
        'csquotes'
        'langID'
        'preserveBibTeXVariables'
        'skipFields'
        'skipWords'
        'postscript'
        'jabrefGroups'
        'defaultDateParserLocale'
        'bibtexParticleNoOp'
        'biblatexExtendedNameFormat'
        'jurismPreferredLanguage'
        'qualityReport'
        'suppressTitleCase']
      Zotero.BetterBibTeX.cache.reset("pref change: #{data}")
      Zotero.BetterBibTeX.auto.reset('preferences change')

    if data in ['citekeyFormat','citekeyFold']
      Zotero.BetterBibTeX.keymanager.setFormatter()

    if data == 'debug'
      Zotero.BetterBibTeX.debugMode()

    if data == 'autoAbbrevStyle'
      Zotero.BetterBibTeX.JournalAbbrev.reset()

    return

  set: (key, value) ->
    Zotero.BetterBibTeX.debug("Pref.set(#{key}):", value)
    Zotero.Prefs.set("translators.better-bibtex.#{key}", value)
  get: (key) ->
    try
      return Zotero.Prefs.get("translators.better-bibtex.#{key}")
    catch err
      Zotero.BetterBibTeX.debug("Pref.get(#{key}):", err)
      return null

  clear: (key) ->
    try
      @branch.clearUserPref(key)
    catch err
      Zotero.BetterBibTeX.debug('preferences.clear', key, err)
