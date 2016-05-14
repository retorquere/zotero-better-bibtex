Components.utils.import('resource://gre/modules/Services.jsm')
Components.utils.import('resource://gre/modules/AddonManager.jsm')

Components.utils.import('resource://zotero/config.js') unless ZOTERO_CONFIG?

Zotero.BetterBibTeX = {
  serializer: Components.classes['@mozilla.org/xmlextras/xmlserializer;1'].createInstance(Components.interfaces.nsIDOMSerializer)
  document: Components.classes['@mozilla.org/xul/xul-document;1'].getService(Components.interfaces.nsIDOMDocument)
  Cache: new loki('betterbibtex.db', {env: 'BROWSER'})
}
Components.utils.import('resource://zotero-better-bibtex/citeproc.js', Zotero.BetterBibTeX)

Zotero.BetterBibTeX.startup = ->
  AddonManager.getAddonByID('better-bibtex@iris-advies.com', (extension) ->
    return unless extension
    Zotero.BetterBibTeX.release = extension.version
    Zotero.BetterBibTeX.init()
  )

Zotero.BetterBibTeX.titleCase = {
  state: {
    opt: { lang: 'en' }
    locale: {
      en: {
        opts: {
          'skip-words': Zotero.BetterBibTeX.CSL.SKIP_WORDS
          'leading-noise-words': 'a,an,the'
        }
      }
    }
  }
}
Zotero.BetterBibTeX.titleCase.state.locale.en.opts['skip-words-regexp'] = new RegExp('(?:(?:[?!:]*\\s+|-|^)(?:' + Zotero.BetterBibTeX.titleCase.state.locale.en.opts['skip-words'].slice().join('|') + ')(?=[!?:]*\\s+|-|$))', 'g')

Zotero.BetterBibTeX.HTMLParser = new class
  DOMParser: Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser)
  ELEMENT_NODE:                 1
  TEXT_NODE:                    3
  CDATA_SECTION_NODE:           4
  PROCESSING_INSTRUCTION_NODE:  7
  COMMENT_NODE:                 8
  DOCUMENT_NODE:                9
  DOCUMENT_TYPE_NODE:           10
  DOCUMENT_FRAGMENT_NODE:       11

  text: (html) ->
    doc = @DOMParser.parseFromString("<span>#{html}</span>", 'text/html')
    doc = doc.documentElement if doc.nodeType == @DOCUMENT_NODE
    txt = doc.textContent
    Zotero.BetterBibTeX.debug('html2text:', {html, txt})
    return txt

  parse: (html) ->
    return @walk(@DOMParser.parseFromString("<span>#{html}</span>", 'text/html'))

  walk: (node, json) ->
    tag = {name: node.nodeName.toLowerCase(), attrs: {}, class: {}, children: []}

    if node.nodeType in [@TEXT_NODE, @CDATA_SECTION_NODE]
      tag.text = node.textContent
    else
      tag.text = node.text if tag.name == 'script'
      if node.nodeType == @ELEMENT_NODE && node.hasAttributes()
        for attr in node.attributes
          tag.attrs[attr.name] = attr.value
        if tag.attrs.class
          for cls in tag.attrs.class.split(/\s+/)
            continue unless cls
            tag.class[cls] = true

      if node.childNodes
        for child in [0 ... node.childNodes.length]
          @walk(node.childNodes.item(child), tag)

    return tag unless json

    json.children.push(tag)
    return json

class Zotero.BetterBibTeX.DateParser
  parseDateToObject: (date, options) -> (new Zotero.BetterBibTeX.DateParser(date, options)).date
  parseDateToArray: (date, options) -> (new Zotero.BetterBibTeX.DateParser(date, options)).array()

  toArray: (suffix = '') ->
    date = {}
    for d in ['year', 'month', 'day', 'empty']
      date[d] = @date["#{d}#{suffix}"]

    ### [ 0 ] instead if [0, 0]; see https://github.com/retorquere/zotero-better-bibtex/issues/360#issuecomment-143540469 ###
    return [ 0 ] if date.empty

    return null unless date.year

    arr = [ date.year ]
    if date.month
      arr.push(date.month)
      arr.push(date.day) if date.day
    return arr

  array: ->
    date1 = @toArray()
    return {literal: @source} unless date1

    date2 = @toArray('_end')

    array = {'date-parts': (if date2 then [date1, date2] else [date1])}
    array.circa = true if @date.circa || @date.circa_end
    return array

  constructor: (@source, options = {}) ->
    @source = @source.trim() if @source
    @zoteroLocale ?= Zotero.locale.toLowerCase()

    return unless @source

    if options.verbatimDetection && @source.indexOf('[') >= 0
      @date = {literal: @source}
      return

    if options.locale
      locale = options.locale.toLowerCase()
      @dateorder = Zotero.BetterBibTeX.Locales.dateorder[locale]
      if @dateorder
        found = locale
      else
        for k, v of Zotero.BetterBibTeX.Locales.dateorder
          if k == locale || k.slice(0, locale.length) == locale
            found = k
            @dateorder = Zotero.BetterBibTeX.Locales.dateorder[options.locale] = v
            break

    if !@dateorder
      fallback = Zotero.BetterBibTeX.pref.get('defaultDateParserLocale')
      @dateorder = Zotero.BetterBibTeX.Locales.dateorder[fallback]
      if !@dateorder
        @dateorder = Zotero.BetterBibTeX.Locales.dateorder[fallback] = Zotero.BetterBibTeX.Locales.dateorder[fallback.trim().toLowerCase()]

    @dateorder ||= Zotero.BetterBibTeX.Locales.dateorder[@zoteroLocale]

    @date = @parse()

  swapMonth: (date, dateorder) ->
    return unless date.day && date.month

    switch
      when @dateorder && @dateorder == dateorder && date.day <= 12 then
      when date.month > 12 then
      else return
    [date.month, date.day] = [date.day, date.month]

  cruft: new Zotero.Utilities.XRegExp("[^\\p{Letter}\\p{Number}]+", 'g')
  parsedate: (date) ->
    date = date.trim()
    return {empty: true} if date == ''

    ### TODO: https://bitbucket.org/fbennett/citeproc-js/issues/189/8-juli-2011-parsed-as-literal ###
    date = date.replace(/^([0-9]+)\.\s+([a-z])/i, '$1 $2')

    if m = date.match(/^(-?[0-9]{3,4})(\?)?(~)?$/)
      return {
        year: @year(m[1])
        uncertain: (if m[2] == '?' then true else undefined)
        circa: (if m[3] == '?' then true else undefined)
      }

    ### CSL dateparser doesn't recognize d?/m/y ###
    if m = date.match(/^(([0-9]{1,2})[-\.\s\/])?([0-9]{1,2})[-\.\s\/]([0-9]{3,4})(\?)?(~)?$/)
      parsed = {
        year: parseInt(m[4])
        month: parseInt(m[3])
        day: parseInt(m[1]) || undefined
        uncertain: (if m[5] == '?' then true else undefined)
        circa: (if m[6] == '~' then true else undefined)
      }
      @swapMonth(parsed, 'mdy')
      return parsed

    if m = date.match(/^(-?[0-9]{3,4})[-\.\s\/]([0-9]{1,2})([-\.\s\/]([0-9]{1,2}))?(\?)?(~)?$/)
      parsed = {
        year: @year(m[1])
        month: parseInt(m[2])
        day: parseInt(m[4]) || undefined
        uncertain: (if m[5] == '?' then true else undefined)
        circa: (if m[6] == '~' then true else undefined)
      }
      ### only swap to repair -- assume yyyy-nn-nn == EDTF-0 ###
      @swapMonth(parsed)
      return parsed

    parsed = Zotero.BetterBibTeX.CSL.DateParser.parseDateToObject(date)
    for k, v of parsed
      switch
        when v == 'NaN' then  parsed[k] = undefined
        when typeof v == 'string' && v.match(/^-?[0-9]+$/) then parsed[k] = parseInt(v)

    return null if parsed.literal

    ### there's a season in there somewhere ###
    return null if parsed.month && parsed.month > 12

    shape = date
    shape = shape.slice(1) if shape[0] == '-'
    shape = Zotero.Utilities.XRegExp.replace(shape.trim(), @cruft, ' ', 'all')
    shape = shape.split(' ')

    fields = (if parsed.year then 1 else 0) + (if parsed.month then 1 else 0) + (if parsed.day then 1 else 0)

    return parsed if fields == 3 || shape.length == fields

    return null

  parserange: (separators) ->
    for sep in separators
      continue if @source == sep
      ### too hard to distinguish from negative year ###
      continue if sep == '-' && @source.match(/^-[0-9]{3,4}$/)

      range = @source.split(sep)
      continue unless range.length == 2

      range = [
        @parsedate(range[0])
        @parsedate(range[1])
      ]

      continue unless range[0] && range[1]

      return {
        empty: range[0].empty
        year: range[0].year
        month: range[0].month
        day: range[0].day
        circa: range[0].circa

        empty_end: range[1].empty
        year_end: range[1].year
        month_end: range[1].month
        day_end: range[1].day
        circa_end: range[1].circa
      }

    return null

  year: (y) ->
    y = parseInt(y)
    y -= 1 if y <= 0
    return y

  parse: ->
    return {} if !@source || @source in ['--', '/', '_']

    candidate = @parserange(['--', '_', '/', '-'])

    ### if no range was found, try to parse the whole input as a single date ###
    candidate ||= @parsedate(@source)

    ### if that didn't yield anything, assume literal ###
    candidate ||= {literal: @source}

    return candidate

Zotero.BetterBibTeX.error = (msg...) ->
  @_log.apply(@, [0].concat(msg))
Zotero.BetterBibTeX.warn = (msg...) ->
  @_log.apply(@, [1].concat(msg))

Zotero.BetterBibTeX.debug_off = ->
Zotero.BetterBibTeX.debug = Zotero.BetterBibTeX.debug_on = (msg...) ->
  @_log.apply(@, [5].concat(msg))

Zotero.BetterBibTeX.log_off = ->
Zotero.BetterBibTeX.log = Zotero.BetterBibTeX.log_on = (msg...) ->
  @_log.apply(@, [3].concat(msg))

Zotero.BetterBibTeX.addCacheHistory = ->
  Zotero.BetterBibTeX.cacheHistory ||= []
  Zotero.BetterBibTeX.cacheHistory.push({
    timestamp: new Date()
    serialized:
      hit: Zotero.BetterBibTeX.serialized.stats.hit
      miss: Zotero.BetterBibTeX.serialized.stats.miss
      clear: Zotero.BetterBibTeX.serialized.stats.clear
    cache:
      hit: Zotero.BetterBibTeX.cache.stats.hit
      miss: Zotero.BetterBibTeX.cache.stats.miss
      clear: Zotero.BetterBibTeX.cache.stats.clear
  })

Zotero.BetterBibTeX.debugMode = ->
  if @pref.get('debug')
    Zotero.Debug.setStore(true)
    Zotero.Prefs.set('debug.store', true)
    @debug = @debug_on
    @log = @log_on
    @flash('Debug mode active', 'Debug mode is active. This will affect performance.')

    clearInterval(Zotero.BetterBibTeX.debugInterval) if Zotero.BetterBibTeX.debugInterval
    try
      Zotero.BetterBibTeX.debugInterval = setInterval(->
        Zotero.BetterBibTeX.addCacheHistory()
      , 10000)
    catch
      delete Zotero.BetterBibTeX.debugInterval
  else
    clearInterval(Zotero.BetterBibTeX.debugInterval) if Zotero.BetterBibTeX.debugInterval
    delete Zotero.BetterBibTeX.debugInterval
    delete Zotero.BetterBibTeX.cacheHistory
    @debug = @debug_off
    @log = @log_off

Zotero.BetterBibTeX.stringify = (obj, replacer, spaces, cycleReplacer) ->
  str = JSON.stringify(obj, @stringifier(replacer, cycleReplacer), spaces)

  if Array.isArray(obj)
    hybrid = false
    keys = Object.keys(obj)
    if keys.length > 0
      o = {}
      for key in keys
        continue if key.match(/^\d+$/)
        o[key] = obj[key]
        hybrid = true
      str += '+' + @stringify(o) if hybrid
  return str

Zotero.BetterBibTeX.stringifier = (replacer, cycleReplacer) ->
  stack = []
  keys = []
  if cycleReplacer == null
    cycleReplacer = (key, value) ->
      return '[Circular ~]' if stack[0] == value
      return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'

  return (key, value) ->
    if stack.length > 0
      thisPos = stack.indexOf(this)
      if ~thisPos then stack.splice(thisPos + 1) else stack.push(this)
      if ~thisPos then keys.splice(thisPos, Infinity, key) else keys.push(key)
      value = cycleReplacer.call(this, key, value) if ~stack.indexOf(value)
    else
      stack.push(value)

    return value if replacer == null || replacer == undefined
    return replacer.call(this, key, value)

Zotero.BetterBibTeX._log = (level, msg...) ->
  str = []
  for m in msg
    switch
      when (typeof m) in ['boolean', 'string', 'number']
        str.push('' + m)
      when m instanceof Error
        str.push("<Exception: #{m.message || m.name}#{if m.stack then '\n' + m.stack else ''}>")
      else
        try
          str.push(Zotero.BetterBibTeX.stringify(m))
        catch
          str.push('' + m)
  str = (s for s in str when s != '')
  str = str.join(' ')

  if level == 0
    Zotero.logError('[better' + '-' + 'bibtex] ' + str)
  else
    Zotero.debug('[better' + '-' + 'bibtex] ' + str, level)

Zotero.BetterBibTeX.extensionConflicts = ->
  AddonManager.getAddonByID('zotfile@columbia.edu', (extension) ->
    return unless extension
    return if Services.vc.compare(extension.version, '4.2.6') >= 0

    Zotero.BetterBibTeX.disable('''
      Better BibTeX has been disabled because it has detected conflicting extension "ZotFile" 4.2.5 or
      earlier. After upgrading to 4.2.6, Better BibTeX will start up as usual. A pre-release of ZotFile 4.2.6 can be
      found at

      https://addons.mozilla.org/en-US/firefox/addon/zotfile/versions/
    ''')
  )

  AddonManager.getAddonByID('zoteromaps@zotero.org', (extension) ->
    return unless extension
    return if Services.vc.compare(extension.version, '1.0.10.1') > 0

    Zotero.BetterBibTeX.disable('''
      Better BibTeX has been disabled because it has detected conflicting extension "zotero-maps" 1.0.10 or
      earlier. Unfortunately this plugin appears to be abandoned, and their issue tracker at

      https://github.com/zotero/zotero-maps

      is not enabled.
    ''')
  )

  AddonManager.getAddonByID('zutilo@www.wesailatdawn.com', (extension) ->
    return unless extension
    return if Services.vc.compare(extension.version, '1.2.10.1') > 0

    Zotero.BetterBibTeX.disable('''
      Better BibTeX has been disabled because it has detected conflicting extension "zutilo" 1.2.10.1 or
      earlier. If have proposed a fix at

      https://github.com/willsALMANJ/Zutilo/issues/42

      Once that has been implemented, Better BibTeX will start up as usual. In the meantime, beta7 from

      https://addons.mozilla.org/en-US/firefox/addon/zutilo-utility-for-zotero/versions/

      should work; alternately, you can uninstall Zutilo.
    ''')
  )

  AddonManager.getAddonByID('{359f0058-a6ca-443e-8dd8-09868141bebc}', (extension) ->
    return unless extension
    return if Services.vc.compare(extension.version, '1.2.3') > 0

    Zotero.BetterBibTeX.disable( '''
      Better BibTeX has been disabled because it has detected conflicting extension "recoll-firefox" 1.2.3 or
      earlier. If have proposed a fix for recall-firefox at

      https://sourceforge.net/p/recollfirefox/discussion/general/thread/a31d3c89/

      Once that has been implemented, Better BibTeX will start up as usual.  Alternately, you can uninstall Recoll Firefox.

      In the meantime, unfortunately, Better BibTeX and recoll-firefox cannot co-exist, and the previous workaround
      Better BibTeX had in place conflicts with a Mozilla policy all Fireox extensions must soon comply with.
    ''')
  )

  if ZOTERO_CONFIG.VERSION?.match(/\.SOURCE$/)
    @flash(
      "You are on a custom Zotero build (#{ZOTERO_CONFIG.VERSION}). " +
      'Feel free to submit error reports for Better BibTeX when things go wrong, I will do my best to address them, but the target will always be the latest officially released version of Zotero'
    )
  if Services.vc.compare(ZOTERO_CONFIG.VERSION?.replace(/\.SOURCE$/, '') || '0.0.0', '4.0.28') < 0
    @disable("Better BibTeX has been disabled because it found Zotero #{ZOTERO_CONFIG.VERSION}, but requires 4.0.28 or later.")

  @disableInConnector(Zotero.isConnector)

Zotero.BetterBibTeX.disableInConnector = (isConnector) ->
  return
  return unless isConnector
  @disable("""
    You are running Zotero in connector mode (running Zotero Firefox and Zotero Standalone simultaneously.
    This is not supported by Better BibTeX; see https://github.com/retorquere/zotero-better-bibtex/issues/143
  """)

Zotero.BetterBibTeX.disable = (message) ->
  @removeTranslators()
  @disabled = message
  @debug('Better BibTeX has been disabled:', message)
  @flash('Better BibTeX has been disabled', message)

Zotero.BetterBibTeX.flash = (title, body) ->
  try
    Zotero.BetterBibTeX.debug('flash:', title)
    pw = new Zotero.ProgressWindow()
    pw.changeHeadline(title)
    body ||= title
    body = body.join("\n") if Array.isArray(body)
    pw.addDescription(body)
    pw.show()
    pw.startCloseTimer(8000)
  catch err
    Zotero.BetterBibTeX.error('@flash failed:', {title, body}, err)

Zotero.BetterBibTeX.reportErrors = (includeReferences) ->
  data = {}

  pane = Zotero.getActiveZoteroPane()

  switch includeReferences
    when 'collection'
      collectionsView = pane?.collectionsView
      itemGroup = collectionsView?._getItemAtRow(collectionsView.selection?.currentIndex)
      switch itemGroup?.type
        when 'collection'
          data = {data: true, collection: collectionsView.getSelectedCollection() }
        when 'library'
          data = { data: true }
        when 'group'
          data = { data: true, collection: Zotero.Groups.get(collectionsView.getSelectedLibraryID()) }

    when 'items'
      data = { data: true, items: pane.getSelectedItems() }

  if data.data
    @translate(@translators.BetterBibTeXJSON.translatorID, data, { exportNotes: true, exportFileData: false }, (err, references) ->
      params = {wrappedJSObject: {references: (if err then null else references)}}
      ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
      ww.openWindow(null, 'chrome://zotero-better-bibtex/content/errorReport.xul', 'zotero-error-report', 'chrome,centerscreen,modal', params)
    )
  else
    params = {wrappedJSObject: {}}
    ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher)
    ww.openWindow(null, 'chrome://zotero-better-bibtex/content/errorReport.xul', 'zotero-error-report', 'chrome,centerscreen,modal', params)

Zotero.BetterBibTeX.pref = {}

Zotero.BetterBibTeX.pref.prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.zotero.translators.better-bibtex.')

Zotero.BetterBibTeX.pref.observer = {
  register: -> Zotero.BetterBibTeX.pref.prefs.addObserver('', @, false)
  unregister: -> Zotero.BetterBibTeX.pref.prefs.removeObserver('', @)
  observe: (subject, topic, data) ->
    switch data
      when 'citekeyFormat', 'citekeyFold'
        Zotero.BetterBibTeX.setCitekeyFormatter()
        ### delete all dynamic keys that have a different citekeyformat (should be all) ###
        Zotero.BetterBibTeX.keymanager.clearDynamic()

      when 'autoAbbrevStyle'
        Zotero.BetterBibTeX.keymanager.resetJournalAbbrevs()

      when 'debug'
        Zotero.BetterBibTeX.debugMode()
        ### don't drop the cache just for this ###
        return

    ### if any var changes, drop the cache and kick off all exports ###
    Zotero.BetterBibTeX.cache.reset("pref change: #{data}")
    Zotero.BetterBibTeX.auto.reset('preferences change')
    Zotero.BetterBibTeX.debug('preference change:', subject, topic, data)
}

Zotero.BetterBibTeX.pref.snapshot = ->
  stash = Object.create(null)
  for key in @prefs.getChildList('')
    stash[key] = @get(key)
  return stash

Zotero.BetterBibTeX.pref.stash = -> @stashed = @snapshot()

Zotero.BetterBibTeX.pref.restore = ->
  for own key, value of @stashed ? {}
    @set(key, value)

Zotero.BetterBibTeX.pref.set = (key, value) ->
  return Zotero.Prefs.set("translators.better-bibtex.#{key}", value)

Zotero.BetterBibTeX.pref.get = (key) ->
  return Zotero.Prefs.get("translators.better-bibtex.#{key}")

Zotero.BetterBibTeX.setCitekeyFormatter = (enforce) ->
  if enforce
    attempts = ['get', 'reset']
  else
    attempts = ['get']

  for attempt in attempts
    if attempt == 'reset'
      msg = "Malformed citation pattern '#{@pref.get('citekeyFormat')}', resetting to default"
      @flash(msg)
      @error(msg)
      @pref.prefs.clearUserPref('citekeyFormat')

    try
      citekeyPattern = @pref.get('citekeyFormat')
      citekeyFormat = citekeyPattern.replace(/>.*/, '')
      throw new Error("no variable parts found in citekey pattern '#{citekeyFormat}'") unless citekeyFormat.indexOf('[') >= 0
      formatter = new BetterBibTeXPatternFormatter(BetterBibTeXPatternParser.parse(citekeyPattern), @pref.get('citekeyFold'))

      @citekeyPattern = citekeyPattern
      @citekeyFormat = citekeyFormat
      @formatter = formatter
      return
    catch err
      @error('Error parsing citekey pattern', {citekeyPattern, citekeyFormat}, err)

  if enforce
    @flash('Citation pattern reset failed! Please report an error to the Better BibTeX issue list.')

Zotero.BetterBibTeX.idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
Zotero.BetterBibTeX.idleObserver = observe: (subject, topic, data) ->
  Zotero.BetterBibTeX.debug("idle: #{topic}")
  Zotero.BetterBibTeX.DB.save(true)
  switch topic
    when 'idle'
      Zotero.BetterBibTeX.auto.idle = true
      Zotero.BetterBibTeX.auto.schedule('idle')

    when 'back', 'active'
      Zotero.BetterBibTeX.auto.idle = false

Zotero.BetterBibTeX.version = (version) ->
  return '' unless version
  v = version.split('.').slice(0, 2).join('.')
  @debug("full version: #{version}, canonical version: #{v}")
  return v

Zotero.BetterBibTeX.migrateData = ->
  return unless @DB.SQLite.migrate()

  for key in @pref.prefs.getChildList('')
    switch key
      when 'auto-abbrev.style' then @pref.set('autoAbbrevStyle', @pref.get(key))
      when 'auto-abbrev' then @pref.set('autoAbbrev', @pref.get(key))
      when 'auto-export' then @pref.set('autoExport', @pref.get(key))
      when 'citeKeyFormat' then @pref.set('citekeyFormat', @pref.get(key))
      when 'doi-and-url' then @pref.set('DOIandURL', @pref.get(key))
      when 'key-conflict-policy' then @pref.set('keyConflictPolicy', @pref.get(key))
      when 'langid' then @pref.set('langID', @pref.get(key))
      when 'pin-citekeys' then @pref.set('pinCitekeys', @pref.get(key))
      when 'raw-imports' then @pref.set('rawImports', @pref.get(key))
      when 'show-citekey' then @pref.set('showCitekeys', @pref.get(key))
      when 'skipfields' then @pref.set('skipFields', @pref.get(key))
      when 'unicode'
        @pref.set('asciiBibTeX', (@pref.get(key) != 'always'))
        @pref.set('asciiBibLaTeX', (@pref.get(key) == 'never'))
      when 'bibtexURLs' then @pref.set('bibtexURL', (if @pref.get(key) then 'note' else 'off'))
      else continue
    @pref.prefs.clearUserPref(key)
  @pref.prefs.clearUserPref('brace-all')
  @pref.prefs.clearUserPref('usePrefix')
  @pref.prefs.clearUserPref('useprefix')
  @pref.prefs.clearUserPref('verbatimDate')
  @pref.prefs.clearUserPref('confirmCacheResetSize')

Zotero.BetterBibTeX.init = ->
  return if @initialized
  @initialized = true

  @testing = (@pref.get('tests') != '')

  try
    BetterBibTeXPatternFormatter::skipWords = @pref.get('skipWords').split(',')
    Zotero.BetterBibTeX.debug('skipwords:', BetterBibTeXPatternFormatter::skipWords)
  catch err
    Zotero.BetterBibTeX.error('could not read skipwords:', err)
    BetterBibTeXPatternFormatter::skipWords = []
  @setCitekeyFormatter(true)

  @debugMode()

  @translators = Object.create(null)
  @threadManager = Components.classes['@mozilla.org/thread-manager;1'].getService()
  @windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)

  @migrateData()
  @DB.purge()

  if @pref.get('scanCitekeys')
    @flash('Citation key rescan', "Scanning 'extra' fields for fixed keys\nFor a large library, this might take a while")
    @cache.reset('scanCitekeys')
    @keymanager.scan()
    @pref.set('scanCitekeys', false)

  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    keymanager: {
      months:         @keymanager.months
      journalAbbrev:  (sandbox, params...) => @keymanager.journalAbbrev.apply(@keymanager, params)
      extract:        (sandbox, params...) => @keymanager.extract.apply(@keymanager, params)
      get:            (sandbox, params...) => @keymanager.get.apply(@keymanager, params)
      alternates:     (sandbox, params...) => @keymanager.alternates.apply(@keymanager, params)
      cache:          (sandbox, params...) => @keymanager.cache.apply(@keymanager, params)
    }
    cache: {
      fetch:  (sandbox, params...) => @cache.fetch.apply(@cache, params)
      store:  (sandbox, params...) => @cache.store.apply(@cache, params)
      dump:   (sandbox, params...) => @cache.dump.apply(@cache, params)
      stats:  (sandbox)            -> Zotero.BetterBibTeX.cacheHistory
    }
    CSL: {
      parseParticles: (sandbox, name) ->
        ### twice to work around https://bitbucket.org/fbennett/citeproc-js/issues/183/particle-parser-returning-non-dropping ###
        Zotero.BetterBibTeX.CSL.parseParticles(name)
        Zotero.BetterBibTeX.CSL.parseParticles(name)
      titleCase: (sandbox, string) ->
        ### TODO: workaround for https://bitbucket.org/fbennett/citeproc-js/issues/187/title-case-formatter-does-not-title-case ###
        string = string.replace(/\(/g, "(\x02 ")
        string = string.replace(/\)/g, " \x03)")
        string = Zotero.BetterBibTeX.CSL.Output.Formatters.title(Zotero.BetterBibTeX.titleCase.state, string)
        string = string.replace(/\x02 /g, '')
        string = string.replace(/ \x03/g, '')
        return string
    }
    parseDateToObject: (sandbox, date, locale) -> Zotero.BetterBibTeX.DateParser::parseDateToObject(date, {locale, verbatimDetection: true})
    parseDateToArray: (sandbox, date, locale) -> Zotero.BetterBibTeX.DateParser::parseDateToArray(date, {locale, verbatimDetection: true})
    HTMLParser: (sandbox, html) -> Zotero.BetterBibTeX.HTMLParser.parse(html)
  }

  for own name, endpoint of @endpoints
    url = "/better-bibtex/#{name}"
    ep = Zotero.Server.Endpoints[url] = ->
    ep:: = endpoint

  @loadTranslators()
  @extensionConflicts()

  for k, months of Zotero.BetterBibTeX.Locales.months
    Zotero.BetterBibTeX.CSL.DateParser.addDateParserMonths(months)

  ### monkey-patch unwieldy BBT db logging ###
  Zotero.DBConnection::_debug = ((original) ->
    return (str, level) ->
      try
        if @_dbName == 'betterbibtex-lokijs' && str && str.length > 200
          return original.call(@, str.substr(0, 200) + '...', level)
      return original.apply(@, arguments)
    )(Zotero.DBConnection::_debug)

  ### monkey-patch to fake the missing item notification after a zip is unpacked ###
  Zotero.Sync.Storage.processDownload = ((original) ->
    return (data) ->
      r = original.apply(@, arguments)
      try
        setTimeout((-> Zotero.BetterBibTeX.itemChanged.notify('modify', 'item', [data.item.id], [])), 1000)
      catch e
        Zotero.BetterBibTeX.debug('Zotero.Sync.Storage.processDownload:', e)
      return r
    )(Zotero.Sync.Storage.processDownload)

  ### monkey-patch Zotero.Items.parseLibraryKeyHash(id) so you can get by ID -- mainly for SelectExtension ###
  Zotero.Items.parseLibraryKeyHash = ((original) ->
    return (libraryKey) ->
      if libraryKey && libraryKey[0] == '@'
        libraryKey = libraryKey.split('@')
        libraryKey.reverse()
        [citekey, libraryID] = libraryKey
        libraryID = libraryID || null
        item = Zotero.BetterBibTeX.DB.keys.findObject({citekey, libraryID})
        return false unless item && item.itemID
        item = Zotero.Items.get(item.itemID)
        return false unless item
        return {libraryID, key: item.key }

      if libraryKey && (m = libraryKey.match(/^([0-9]+)~(.*)/))
        try
          return {libraryID: Zotero.Groups.getLibraryIDFromGroupID(m[1]), key: m[2]}
        catch
          Zotero.BetterBibTeX.debug('Zotero.Items.parseLibraryKeyHash: no library for group', libraryKey)

      return original.call(@, libraryKey)
    )(Zotero.Items.parseLibraryKeyHash)

  ### monkey-patch Zotero.Server.DataListener.prototype._generateResponse for async handling ###
  Zotero.Server.DataListener::_generateResponse = ((original) ->
    return (status, contentType, promise) ->
      try
        if typeof promise?.then == 'function'
          return promise.then((body) =>
            throw new Error("Zotero.Server.DataListener::_generateResponse: circular promise!") if typeof body?.then == 'function'
            original.apply(@, [status, contentType, body])
          ).catch((e) =>
            original.apply(@, [500, 'text/plain', e.message || e.name])
          )

      return original.apply(@, arguments)
    )(Zotero.Server.DataListener::_generateResponse)

  ### monkey-patch Zotero.Server.DataListener.prototype._requestFinished for async handling of web api translation requests ###
  Zotero.Server.DataListener::_requestFinished = ((original) ->
    return (promise) ->
      try
        if typeof promise?.then == 'function'
          promise.then((response) =>
            throw new Error("Zotero.Server.DataListener::_requestFinished: circular promise!") if typeof response?.then == 'function'
            original.apply(@, [response])
          ).catch((e) =>
            original.apply(@, e.message || e.name)
          )
          return
      catch err
        Zotero.debug("Zotero.Server.DataListener::_requestFinished: error handling promise: #{err.message || err.name}")

      return original.apply(@, arguments)
    )(Zotero.Server.DataListener::_requestFinished)

  ### monkey-patch Zotero.Search.prototype.save to trigger auto-exports ###
  Zotero.Search::save = ((original) ->
    return (fixGaps) ->
      id = original.apply(@, arguments)
      Zotero.BetterBibTeX.auto.markSearch(id, 'search updated')
      return id
    )(Zotero.Search::save)

  ###
    monkey-patch Zotero.ItemTreeView::getCellText to replace the 'extra' column with the citekey

    I wish I didn't have to hijack the extra field, but Zotero has checks in numerous places to make sure it only
    displays 'genuine' Zotero fields, and monkey-patching around all of those got to be way too invasive (and thus
    fragile)
  ###
  Zotero.ItemTreeView::getCellText = ((original) ->
    return (row, column) ->
      switch
        when column.id == 'zotero-items-column-callNumber' && Zotero.BetterBibTeX.pref.get('showItemIDs')
          type = 'itemid'
        when column.id == 'zotero-items-column-extra' && Zotero.BetterBibTeX.pref.get('showCitekeys')
          type = 'citekey'
      item = @._getItemAtRow(row) if type

      return original.apply(@, arguments) unless item
      return '' if !item.ref || item.ref.isAttachment() || item.ref.isNote()

      switch type
        when 'itemid'
          return ('\u2003\u2003\u2003\u2003\u2003\u2003' + item.id).slice(-6)

        when 'citekey'
          key = Zotero.BetterBibTeX.keymanager.get({itemID: item.id})
          return '' if key.citekey.match(/^zotero-(null|[0-9]+)-[0-9]+$/)
          return key.citekey + (if key.citekeyFormat then ' *' else '')

      return original.apply(@, arguments)
    )(Zotero.ItemTreeView::getCellText)

  ### monkey-patch translate to capture export path and auto-export ###
  Zotero.Translate.Export::translate = ((original) ->
    return ->
      Zotero.BetterBibTeX.debug("Zotero.Translate.Export::translate: #{if @_export then Object.keys(@_export) else 'no @_export'}", @_displayOptions)
      ### requested translator ###
      translatorID = @translator?[0]
      translatorID = translatorID.translatorID if translatorID.translatorID
      Zotero.BetterBibTeX.debug('export: ', translatorID)
      return original.apply(@, arguments) unless translatorID

      ### pick up sentinel from patched Zotero_File_Interface.exportCollection in zoteroPane.coffee ###
      if @_export?.items?.search
        saved_search = @_export.items.search
        @_export.items = @_export.items.items
        throw new Error('Cannot export empty search') unless @_export.items

      ### regular behavior for non-BBT translators, or if translating to string ###
      header = Zotero.BetterBibTeX.translators[translatorID]
      return original.apply(@, arguments) unless header && @location?.path

      if @_displayOptions
        if @_displayOptions.exportFileData
          ### export directory selected ###
          @_displayOptions.exportPath = @location.path
        else
          @_displayOptions.exportPath = @location.parent.path
        @_displayOptions.exportFilename = @location.leafName

      Zotero.BetterBibTeX.debug("export", @_export, " to #{if @_displayOptions?.exportFileData then 'directory' else 'file'}", @location.path, 'using', @_displayOptions)

      ### If no capture, we're done ###
      return original.apply(@, arguments) unless @_displayOptions?['Keep updated'] && !@_displayOptions.exportFileData

      if !(@_export?.type in ['library', 'collection']) && !saved_search
        Zotero.BetterBibTeX.flash('Auto-export only supported for searches, groups, collections and libraries')
        return original.apply(@, arguments)

      progressWin = new Zotero.ProgressWindow()
      progressWin.changeHeadline('Auto-export')

      switch
        when saved_search
          progressWin.addLines(["Saved search #{saved_search.name} set up for auto-export"])
          to_export = "search:#{saved_search.id}"

        when @_export?.type == 'library'
          to_export = if @_export.id then "library:#{@_export.id}" else 'library'
          try
            name = Zotero.Libraries.getName(@_export.id)
          catch
            name = to_export
          progressWin.addLines(["#{name} set up for auto-export"])

        when @_export?.type == 'collection'
          progressWin.addLines(["Collection #{@_export.collection.name} set up for auto-export"])
          to_export = "collection:#{@_export.collection.id}"

        else
          progressWin.addLines(['Auto-export only supported for searches, groups, collections and libraries'])
          to_export = null

      progressWin.show()
      progressWin.startCloseTimer()

      if to_export
        @_displayOptions.translatorID = translatorID
        Zotero.BetterBibTeX.auto.add(to_export, @location.path, @_displayOptions)
        Zotero.BetterBibTeX.debug('Captured auto-export:', @location.path, @_displayOptions)

      return original.apply(@, arguments)
    )(Zotero.Translate.Export::translate)

  ### monkey-patch _prepareTranslation to notify itemgetter whether we're doing exportFileData ###
  Zotero.Translate.Export::_prepareTranslation = ((original) ->
    return ->
      r = original.apply(@, arguments)

      ### caching shortcut sentinels ###
      translatorID = @translator?[0]
      translatorID = translatorID.translatorID if translatorID.translatorID

      @_itemGetter._BetterBibTeX = Zotero.BetterBibTeX.translators[translatorID]
      @_itemGetter._exportFileData = @_displayOptions.exportFileData

      return r
    )(Zotero.Translate.Export::_prepareTranslation)

  ### monkey-patch Zotero.Translate.ItemGetter::nextItem to fetch from pre-serialization cache. ###
  ### object serialization is approx 80% of the work being done while translating! Seriously! ###
  Zotero.Translate.ItemGetter::nextItem = ((original) ->
    return ->
      ### don't mess with this unless I know it's in BBT ###
      return original.apply(@, arguments) if @legacy || !@_BetterBibTeX

      ###
        If I wanted to access serialized items when exporting file data, I'd have to pass "@" to serialized.get
        and call attachmentToArray.call(itemGetter, ...) there rather than ::attachmentToArray(...) so attachmentToArray would have access to
        @_exportFileDirectory
      ###
      if @_exportFileData
        id = @_itemsLeft[0]?.id
        item = original.apply(@, arguments)
        Zotero.BetterBibTeX.serialized.fixup(item, id) if item
        return item

      while @_itemsLeft.length != 0
        item = Zotero.BetterBibTeX.serialized.get(@_itemsLeft.shift())
        continue unless item

        return item

      return false
    )(Zotero.Translate.ItemGetter::nextItem)

  ### monkey-patch zotfile wildcard table to add bibtex key ###
  if Zotero.ZotFile
    Zotero.ZotFile.wildcardTable = ((original) ->
      return (item) ->
        table = original.apply(@, arguments)
        table['%b'] = Zotero.BetterBibTeX.keymanager.get(item).citekey unless item.isAttachment() || item.isNote()
        return table
      )(Zotero.ZotFile.wildcardTable)

  @schomd.init()

  @pref.observer.register()
  Zotero.addShutdownListener(->
    Zotero.BetterBibTeX.log('shutting down')
    Zotero.BetterBibTeX.DB.save(true)
    Zotero.BetterBibTeX.debugMode()
    return
  )
  Zotero.getActiveZoteroPane().addBeforeReloadListener((mode) =>
    @debug('before reload:', {mode})
    Zotero.BetterBibTeX.DB.save() if Zotero.BetterBibTeX.DB && mode != 'connector'
  )

  nids = []
  nids.push(Zotero.Notifier.registerObserver(@itemChanged, ['item']))
  nids.push(Zotero.Notifier.registerObserver(@collectionChanged, ['collection']))
  nids.push(Zotero.Notifier.registerObserver(@itemAdded, ['collection-item']))
  window.addEventListener('unload', ((e) -> Zotero.Notifier.unregisterObserver(id) for id in nids), false)

  zoteroPane = Zotero.getActiveZoteroPane()
  zoteroPane.addReloadListener(->
    Zotero.BetterBibTeX.DB.load('reload out of connector mode') if !Zotero.initialized || Zotero.isConnector
  )
  zoteroPane.addBeforeReloadListener((mode) ->
    Zotero.BetterBibTeX.DB.save() if Zotero.BetterBibTeX.DB && mode != 'connector'
  )

  @idleService.addIdleObserver(@idleObserver, @pref.get('autoExportIdleWait'))

  uninstaller = {
    onUninstalling: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      Zotero.BetterBibTeX.removeTranslators()

    onOperationCancelled: (addon, needsRestart) ->
      return unless addon.id == 'better-bibtex@iris-advies.com'
      Zotero.BetterBibTeX.loadTranslators() unless addon.pendingOperations & AddonManager.PENDING_UNINSTALL
  }
  AddonManager.addAddonListener(uninstaller)

  if @testing
    tests = @pref.get('tests')
    @pref.set('tests', '')
    try
      loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)
      loader.loadSubScript("chrome://zotero-better-bibtex/content/test/include.js")
      @Test.run(tests.trim().split(/\s+/))

Zotero.BetterBibTeX.createFile = (paths...) ->
  f = Zotero.getZoteroDirectory()
  throw new Error('no path specified') if paths.length == 0

  paths.unshift('better-bibtex')
  Zotero.BetterBibTeX.debug('createFile:', paths)

  leaf = paths.pop()
  for path in paths
    f.append(path)
    f.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0o777) unless f.exists()
  f.append(leaf)
  return f

Zotero.BetterBibTeX.postscript = """
Translator.initialize = (function(original) {
  return function() {
    if (this.initialized) {
      return;
    }
    original.apply(this, arguments);
    try {
      return Reference.prototype.postscript = new Function(Translator.postscript);
    } catch (err) {
      return Translator.debug('postscript failed to compile:', err, Translator.postscript);
    }
  };
})(Translator.initialize);
"""

Zotero.BetterBibTeX.loadTranslators = ->
  for label, translatorID of {
    'LaTeX Citation': 'b4a5ab19-c3a2-42de-9961-07ae484b8cb0',
    'Pandoc Citation': '4c52eb69-e778-4a78-8ca2-4edf024a5074',
    'Pandoc JSON': 'f4b52ab0-f878-4556-85a0-c7aeedd09dfc',
    'Better CSL-JSON': 'f4b52ab0-f878-4556-85a0-c7aeedd09dfc'
  }
    try
      Zotero.BetterBibTeX.debug('loadTranslators: removing', {label, translatorID})
      @removeTranslator({label, translatorID})
    catch err
      Zotero.BetterBibTeX.debug('loadTranslators: removing', {label, translatorID}, ':', err)

  try
    if Zotero.BetterBibTeX.pref.get('removeStock')
      @removeTranslator({translatorID: 'b6e39b57-8942-4d11-8259-342c46ce395f', label: 'BibLaTeX'})
      @removeTranslator({translatorID: '9cb70025-a888-4a29-a210-93ec52da40d4', label: 'BibTeX'})

  try
    switch Zotero.Prefs.get('extensions.zotero.export.quickCopy.setting')
      when 'export=b4a5ab19-c3a2-42de-9961-07ae484b8cb0'
        Zotero.Prefs.set('extensions.zotero.export.quickCopy.setting', 'export=9b85ff96-ceb3-4ca2-87a9-154c18ab38b1')
        Zotero.BetterBibTeX.pref.set('quickCopyMode', 'latex')

      when 'export=4c52eb69-e778-4a78-8ca2-4edf024a5074'
        Zotero.Prefs.set('extensions.zotero.export.quickCopy.setting', 'export=9b85ff96-ceb3-4ca2-87a9-154c18ab38b1')
        Zotero.BetterBibTeX.pref.set('quickCopyMode', 'pandoc')

  for translator in @Translators
    @load(translator)

  ### clean up junk ###
  try
    @removeTranslator({label: 'BibTeX Citation Keys', translatorID: '0a3d926d-467c-4162-acb6-45bded77edbb'})
  try
    @removeTranslator({label: 'Zotero TestCase', translatorID: '82512813-9edb-471c-aebc-eeaaf40c6cf9'})

  Zotero.Translators.init()

Zotero.BetterBibTeX.removeTranslators = ->
  for translator in @Translators
    @removeTranslator(translator)
  @translators = {}
  Zotero.Translators.init()

Zotero.BetterBibTeX.removeTranslator = (header) ->
  try
    fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
    destFile = Zotero.getTranslatorsDirectory()
    destFile.append(fileName)
    destFile.remove(false) if destFile.exists()

    delete @translators[header.translatorID]
    delete @translators[header.label.replace(/\s/, '')]
  catch err
    @debug("failed to remove #{header.label}:", err)

Zotero.BetterBibTeX.itemAdded = notify: ((event, type, collection_items) ->
  Zotero.BetterBibTeX.debug('itemAdded:', {event, type, collection_items})
  collections = []
  items = []

  ###
    monitor items added to collection to find BibTeX AUX Scanner data. The scanner adds a dummy item whose 'extra'
    field has instructions on what to do after import
  ###

  return if collection_items.length == 0

  for collection_item in collection_items
    [collectionID, itemID] = collection_item.split('-')
    collections.push(collectionID)
    items.push(itemID)

    ### aux-scanner only triggers on add ###
    continue unless event == 'add'
    collection = Zotero.Collections.get(collectionID)
    continue unless collection

    try
      extra = JSON.parse(Zotero.Items.get(itemID).getField('extra').trim())
      @debug('AUX scanner/import error info found on collection add')
    catch error
      continue

    note = null
    switch extra.translator
      when 'ca65189f-8815-4afe-8c8b-8c7c15f0edca'
        ### Better BibTeX ###
        if extra.notimported && extra.notimported.length > 0
          report = new @HTMLNode('http://www.w3.org/1999/xhtml', 'html')
          report.div(->
            @p(-> @b('Better BibTeX could not import'))
            @add(' ')
            @pre(extra.notimported)
          )
          note = report.serialize()

      when '0af8f14d-9af7-43d9-a016-3c5df3426c98'
        ### BibTeX AUX Scanner ###
        missing = []
        for own citekey, found of @keymanager.resolve(extra.citations, {libraryID: collection.libraryID})
          if found
            collection.addItem(found.itemID)
          else
            missing.push(citekey)

        if missing.length != 0
          report = new @HTMLNode('http://www.w3.org/1999/xhtml', 'html')
          report.div(->
            @p(-> @b('BibTeX AUX scan'))
            @p('Missing references:')
            @ul(->
              for citekey in missing
                @li(citekey)
            )
          )
          note = report.serialize()

    if note
      Zotero.Items.trash([itemID])
      item = new Zotero.Item('note')
      item.libraryID = collection.libraryID
      item.setNote(note)
      item.save()
      collection.addItem(item.id)

  collections = @auto.withParentCollections(collections) if collections.length != 0
  collections = ("collection:#{id}" for id in collections)
  Zotero.BetterBibTeX.debug('marking:', collections, 'from', (o.collection for o in @DB.autoexport.data))
  if collections.length > 0
    for ae in @DB.autoexport.where((o) -> o.collection in collections)
      @auto.mark(ae, 'pending', "itemAdded: #{collections}")
).bind(Zotero.BetterBibTeX)

Zotero.BetterBibTeX.collectionChanged = notify: (event, type, ids, extraData) ->
  return unless event == 'delete' && extraData.length > 0
  extraData = ("collection:#{id}" for id in extraData)
  @DB.autoexport.removeWhere((o) -> o.collection in extraData)

Zotero.BetterBibTeX.itemChanged = notify: ((event, type, ids, extraData) ->
  Zotero.BetterBibTeX.debug('itemChanged:', {event, type, ids, extraData})

  return unless type == 'item' && event in ['delete', 'trash', 'add', 'modify']
  ids = extraData if event == 'delete'
  return unless ids.length > 0

  ids = (parseInt(id) for id in ids)

  for item in Zotero.Items.get(ids)
    if item.isAttachment() || item.isNote()
      parent = item.getSource()
      ids.push(parseInt(parent)) if parent

  @keymanager.scan(ids, event) if ids.length > 0

  Zotero.BetterBibTeX.debug('itemChanged items:', {event, ids})

  for id in ids
    @serialized.remove(id)
    @cache.remove({itemID: id})

  @auto.markIDs(ids, 'itemChanged')
).bind(Zotero.BetterBibTeX)

Zotero.BetterBibTeX.displayOptions = (url) ->
  params = {}
  hasParams = false
  for key in [ 'exportCharset', 'exportNotes?', 'useJournalAbbreviation?' ]
    try
      isBool = key.match(/[?]$/)
      key = key.replace(isBool[0], '') if isBool
      params[key] = url.query[key]
      params[key] = [ 'y', 'yes', 'true' ].indexOf(params[key].toLowerCase()) >= 0 if isBool
      hasParams = true

  return params if hasParams
  return null

Zotero.BetterBibTeX.translate = (translator, items, displayOptions, callback) ->
  throw 'null translator' unless translator

  translation = new Zotero.Translate.Export()

  for own key, value of items
    switch key
      when 'library' then translation.setLibraryID(value)
      when 'items' then translation.setItems(value)
      when 'collection' then translation.setCollection(value)

  translation.setTranslator(translator)
  translation.setDisplayOptions(displayOptions) if displayOptions && Object.keys(displayOptions).length != 0

  translation.setHandler('done', (obj, success) -> callback(!success, if success then obj?.string else null))
  translation.translate()

Zotero.BetterBibTeX.getContentsFromURL = (url) ->
  try
    return Zotero.File.getContentsFromURL(url)
  catch err
    throw new Error("Failed to load #{url}: #{err.message || err.name}")

Zotero.BetterBibTeX.load = (translator) ->
  throw new Error('not a translator') unless translator.label
  @removeTranslator(translator)

  try
    code = Zotero.BetterBibTeX.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator.label}.translator")
  catch err
    @debug('translator.load: ', translator, 'could not be loaded:', err)
    throw err
  code += "\n\n#{@postscript}" if translator.BetterBibTeX?.postscript

  @debug('Translator.load header:', translator)
  try
    fileName = Zotero.Translators.getFileNameFromLabel(translator.label, translator.translatorID)
    destFile = Zotero.getTranslatorsDirectory()
    destFile.append(fileName)

    existing = Zotero.Translators.get(translator.translatorID)
    if existing and destFile.equals(existing.file) and destFile.exists()
      msg = "Overwriting translator with same filename '#{fileName}'"
      Zotero.BetterBibTeX.warn(msg, translator)
      Components.utils.reportError(msg + ' in Zotero.BetterBibTeX.load()')

    existing.file.remove(false) if existing and existing.file.exists()

    Zotero.BetterBibTeX.log("Saving translator '#{translator.label}'")

    Zotero.File.putContents(destFile, code)

    @debug('translator.load', translator, 'succeeded')

    @translators[translator.translatorID] = @translators[translator.label.replace(/\s/g, '')] = translator
  catch err
    @debug('translator.load', translator, 'failed:', err)

Zotero.BetterBibTeX.getTranslator = (name) ->
  return @translators[name.replace(/\s/g, '')].translatorID if @translators[name.replace(/\s/g, '')]

  name = name.toLowerCase().replace(/[^a-z]/g, '')
  translators = {}
  for id, header of @translators
    label = header.label.toLowerCase().replace(/[^a-z]/g, '')
    translators[label] = header.translatorID
    translators[label.replace(/^zotero/, '')] = header.translatorID
    translators[label.replace(/^better/, '')] = header.translatorID
  return translators[name] if translators[name]
  throw "No translator #{name}; available: #{JSON.stringify(translators)} from #{JSON.stringify(@translators)}"

Zotero.BetterBibTeX.translatorName = (id) ->
  Zotero.BetterBibTeX.debug('translatorName:', id, 'from', Object.keys(@translators))
  return @translators[id]?.label || "translator:#{id}"

Zotero.BetterBibTeX.safeGetAll = ->
  try
    all = Zotero.Items.getAll()
    all = [all] if all and not Array.isArray(all)
  catch err
    all = false
  if not all then all = []
  return all

Zotero.BetterBibTeX.safeGet = (ids) ->
  return [] if ids.length == 0
  all = Zotero.Items.get(ids)
  if not all then return []
  return all

Zotero.BetterBibTeX.allowAutoPin = -> Zotero.Prefs.get('sync.autoSync') or not Zotero.Sync.Server.enabled

Zotero.BetterBibTeX.exportGroup = ->
  zoteroPane = Zotero.getActiveZoteroPane()
  itemGroup = zoteroPane.collectionsView._getItemAtRow(zoteroPane.collectionsView.selection.currentIndex)
  return unless itemGroup.isGroup()

  group = Zotero.Groups.get(itemGroup.ref.id)
  if !Zotero.Items.getAll(false, group.libraryID)
    @flash('Cannot export empty group')
    return

  exporter = new Zotero_File_Exporter()
  exporter.collection = group
  exporter.name = group.name
  exporter.save()

class Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    if !@doc
      @doc = Zotero.BetterBibTeX.document.implementation.createDocument(@namespace, @root, null)
      @root = @doc.documentElement

  serialize: -> Zotero.BetterBibTeX.serializer.serializeToString(@doc)

  alias: (names) ->
    for name in names
      @Node::[name] = do (name) -> (v...) -> XmlNode::add.apply(@, [{"#{name}": v[0]}].concat(v.slice(1)))

  set: (node, attrs...) ->
    for attr in attrs
      for own name, value of attr
        switch
          when typeof value == 'function'
            value.call(new @Node(@namespace, node, @doc))

          when name == ''
            node.appendChild(@doc.createTextNode('' + value))

          else
            node.setAttribute(name, '' + value)

  add: (content...) ->
    if typeof content[0] == 'object'
      for own name, attrs of content[0]
        continue if name == ''
        # @doc['createElementNS'] rather than @doc.createElementNS because someone thinks there's a relevant difference
        node = @doc['createElementNS'](@namespace, name)
        @root.appendChild(node)
        content = [attrs].concat(content.slice(1))
        break # there really should only be one pair here!
    node ||= @root

    content = (c for c in content when typeof c == 'number' || c)

    for attrs in content
      switch
        when typeof attrs == 'string'
          node.appendChild(@doc.createTextNode(attrs))

        when typeof attrs == 'function'
          attrs.call(new @Node(@namespace, node, @doc))

        when attrs.appendChild
          node.appendChild(attrs)

        else
          @set(node, attrs)

class Zotero.BetterBibTeX.HTMLNode extends Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    super(@namespace, @root, @doc)

  Node: HTMLNode

  HTMLNode::alias(['pre', 'b', 'p', 'div', 'ul', 'li'])
