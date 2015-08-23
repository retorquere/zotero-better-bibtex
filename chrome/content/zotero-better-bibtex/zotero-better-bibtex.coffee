Components.utils.import('resource://gre/modules/Services.jsm')
Components.utils.import('resource://gre/modules/AddonManager.jsm')
Components.utils.import('resource://zotero/config.js')

Zotero.BetterBibTeX = {
  serializer: Components.classes['@mozilla.org/xmlextras/xmlserializer;1'].createInstance(Components.interfaces.nsIDOMSerializer)
  document: Components.classes['@mozilla.org/xul/xul-document;1'].getService(Components.interfaces.nsIDOMDocument)
  Cache: new loki('betterbibtex.db', {env: 'BROWSER'})
}

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

Zotero.BetterBibTeX.debugMode = ->
  if @pref.get('debug')
    Zotero.Debug.setStore(true)
    Zotero.Prefs.set('debug.store', true)
    @debug = @debug_on
    @log = @log_on
    @flash('Debug mode active', 'Debug mode is active. This will affect performance.')
  else
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
        str.push("<Exception: #{m.msg}#{if m.stack then '\n' + m.stack else ''}>")
      else
        str.push(Zotero.BetterBibTeX.stringify(m))
  str = (s for s in str when s != '')
  str = str.join(' ')

  if level == 0
    Zotero.logError(msg)
  else
    Zotero.debug('[better' + '-' + 'bibtex] ' + str, level)

Zotero.BetterBibTeX.extensionConflicts = ->
  AddonManager.getAddonByID('zoteromaps@zotero.org', (maps) ->
    return unless maps
    return if Services.vc.compare(zutilo.version, '1.0.10') > 0
    Zotero.BetterBibTeX.removeTranslators()
    Zotero.BetterBibTeX.disabled = '''
      Better BibTeX has been disabled because it has detected conflicting extension "zotero-maps" 1.0.10 or
      earlier. Unfortunately this plugin appears to be abandoned, and their issue tracker at

      https://github.com/zotero/zotero-maps

      is not enabled.
    '''
    Zotero.BetterBibTeX.flash('Better BibTeX has been disabled', Zotero.BetterBibTeX.disabled)
  )

  AddonManager.getAddonByID('zutilo@www.wesailatdawn.com', (zutilo) ->
    return unless zutilo
    return if Services.vc.compare(zutilo.version, '1.2.10.1') > 0
    Zotero.BetterBibTeX.removeTranslators()
    Zotero.BetterBibTeX.disabled = '''
      Better BibTeX has been disabled because it has detected conflicting extension "zutilo" 1.2.10.1 or
      earlier. If have proposed a fix at

      https://github.com/willsALMANJ/Zutilo/issues/42

      Once that has been implemented, Better BibTeX will start up as usual. In the meantime, beta7 from

      https://addons.mozilla.org/en-US/firefox/addon/zutilo-utility-for-zotero/versions/

      should work; alternately, you can uninstall Zutilo.
    '''
    Zotero.BetterBibTeX.flash('Better BibTeX has been disabled', Zotero.BetterBibTeX.disabled)
  )

  AddonManager.getAddonByID('{359f0058-a6ca-443e-8dd8-09868141bebc}', (recoll) ->
    return unless recoll
    return if Services.vc.compare(recoll.version, '1.2.3') > 0
    Zotero.BetterBibTeX.removeTranslators()
    Zotero.BetterBibTeX.disabled = '''
      Better BibTeX has been disabled because it has detected conflicting extension "recoll-firefox" 1.2.3 or
      earlier. If have proposed a fix for recall-firefox at

      https://sourceforge.net/p/recollfirefox/discussion/general/thread/a31d3c89/

      Once that has been implemented, Better BibTeX will start up as usual.  Alternately, you can uninstall Recoll Firefox.

      In the meantime, unfortunately, Better BibTeX and recoll-firefox cannot co-exist, and the previous workaround
      Better BibTeX had in place conflicts with a Mozilla policy all Fireox extensions must soon comply with.
    '''
    Zotero.BetterBibTeX.flash('Better BibTeX has been disabled', Zotero.BetterBibTeX.disabled)
  )

  if ZOTERO_CONFIG.VERSION?.match(/\.SOURCE$/)
    #@flash(
    Zotero.logError(
      "You are on a custom Zotero build (#{ZOTERO_CONFIG.VERSION}). " +
      'Feel free to submit error reports for Better BibTeX when things go wrong, I will do my best to address them, but the target will always be the latest officially released version of Zotero'
    )
  if Services.vc.compare(ZOTERO_CONFIG.VERSION?.replace(/\.SOURCE$/, '') || '0.0.0', '4.0.27') < 0
    @removeTranslators()
    @disabled = "Better BibTeX has been disabled because it found Zotero #{ZOTERO_CONFIG.VERSION}, but requires 4.0.27 or later."
    @flash('Better BibTeX has been disabled', Zotero.BetterBibTeX.disabled)

Zotero.BetterBibTeX.flash = (title, body) ->
  Zotero.BetterBibTeX.debug('flash:', title)
  pw = new Zotero.ProgressWindow()
  pw.changeHeadline(title)
  body ||= title
  body = body.join("\n") if Array.isArray(body)
  pw.addDescription(body)
  pw.show()
  pw.startCloseTimer(8000)

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
        # delete all dynamic keys that have a different citekeyformat (should be all)
        Zotero.BetterBibTeX.keymanager.clearDynamic()

      when 'autoAbbrevStyle'
        Zotero.BetterBibTeX.keymanager.resetJournalAbbrevs()

      when 'debug'
        Zotero.BetterBibTeX.debugMode()
        return # don't drop the cache just for this

    # if any var changes, drop the cache and kick off all exports
    Zotero.BetterBibTeX.cache.reset()
    Zotero.BetterBibTeX.auto.reset()
    Zotero.BetterBibTeX.auto.process('preferences change')
    Zotero.BetterBibTeX.debug('preference change:', subject, topic, data)
}

Zotero.BetterBibTeX.pref.ZoteroObserver = {
  register: -> Zotero.Prefs.prefBranch.addObserver('', @, false)
  unregister: -> Zotero.Prefs.prefBranch.removeObserver('', @)
  observe: (subject, topic, data) ->
    switch data
      when 'recursiveCollections'
        recursive = "#{!!Zotero.BetterBibTeX.auto.recursive()}"
        # libraries are always recursive
        Zotero.DB.query("update betterbibtex.autoexport set exportedRecursively = ?, status = ? where exportedRecursively <> ? and collection not like 'library:%'", [recursive, Zotero.BetterBibTeX.auto.status('pending'), recursive])
        Zotero.BetterBibTeX.auto.process("recursive export: #{recursive}")
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
      msg = "Malformed citation '#{@pref.get('citekeyFormat')}' found, resetting to default"
      @flash(msg)
      @error(msg)
      @pref.clearUserPref('citekeyFormat')

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
      @error(err)

  if enforce
    @flash('Citation pattern reset failed! Please report an error to the Better BibTeX issue list.')

Zotero.BetterBibTeX.idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
Zotero.BetterBibTeX.idleObserver = observe: (subject, topic, data) ->
  Zotero.BetterBibTeX.debug("idle: #{topic}")
  switch topic
    when 'idle'
      Zotero.BetterBibTeX.cache.flush()
      Zotero.BetterBibTeX.keymanager.flush()
      Zotero.BetterBibTeX.auto.idle = true
      Zotero.BetterBibTeX.auto.process('idle')

    when 'back', 'active'
      Zotero.BetterBibTeX.auto.idle = false

Zotero.BetterBibTeX.version = (version) ->
  return '' unless version
  v = version.split('.').slice(0, 2).join('.')
  @debug("full version: #{version}, canonical version: #{v}")
  return v

Zotero.BetterBibTeX.foreign_keys = (enabled) ->
  statement = Zotero.DB.getStatement("PRAGMA foreign_keys = #{if enabled then 'ON' else 'OFF'}", null, true)
  statement.executeStep()
  statement.finalize()

Zotero.BetterBibTeX.parseTable = (name) ->
  name = name.split('.')
  switch name.length
    when 1
      schema = ''
      name = name[0]
    when 2
      schema = name[0] + '.'
      name = name[1]
  name = name.slice(1, -1) if name[0] == '"'
  return {schema: schema, name: name}

Zotero.BetterBibTeX.table_info = (table) ->
  table = @parseTable(table)
  statement = Zotero.DB.getStatement("pragma #{table.schema}table_info(\"#{table.name}\")", null, true)

  fields = (statement.getColumnName(i).toLowerCase() for i in [0...statement.columnCount])

  columns = {}
  while statement.executeStep()
    values = (Zotero.DB._getTypedValue(statement, i) for i in [0...statement.columnCount])
    column = {}
    for name, i in fields
      column[name] = values[i]
    columns[column.name] = column
  statement.finalize()

  return columns

Zotero.BetterBibTeX.columnNames = (table) ->
  return Object.keys(@table_info(table))

Zotero.BetterBibTeX.copyTable = (source, target, ignore = []) -> # assumes tables have identical layout!
  ignore = [ignore] if typeof ignore == 'string'

  columns = (column for column in @columnNames(target) when column not in ignore).join(', ')
  Zotero.DB.query("insert into #{target} (#{columns}) select #{columns} from #{source}")

Zotero.BetterBibTeX.tableExists = (name, mustHaveData = false) ->
  table = @parseTable(name)
  exists = (Zotero.DB.valueQuery("SELECT count(*) FROM #{table.schema}sqlite_master WHERE type='table' and name=?", [table.name]) != 0)
  return exists && (!mustHaveData || Zotero.DB.valueQuery("select count(*) from #{name}") != 0)

Zotero.BetterBibTeX.upgradeDatabase = ->
  @flash('Better BibTeX: updating database', 'Updating database, this could take a while')

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
      when 'useprefix' then @pref.set('usePrefix', @pref.get(key))
      when 'unicode'
        @pref.set('asciiBibTeX', (@pref.get(key) != 'always'))
        @pref.set('asciiBibLaTeX', (@pref.get(key) == 'never'))
      else continue
    @pref.prefs.clearUserPref(key)
  @pref.prefs.clearUserPref('brace-all')

  try
    translatorSettings = JSON.parse(Zotero.Prefs.get('export.translatorSettings'))
    @pref.set('preserveBibTeXVariables', true) if translatorSettings['Preserve BibTeX variables']

  # cleanup any junk
  for table in Zotero.DB.columnQuery("SELECT name FROM betterbibtex.sqlite_master WHERE type='table' AND name like '-%-'") || []
    Zotero.DB.query("drop table if exists betterbibtex.\"#{table}\"")

  tables = Zotero.DB.columnQuery("SELECT name FROM betterbibtex.sqlite_master WHERE type='table' AND name <> 'schema' ORDER BY name") || []

  if @tableExists('betterbibtex.autoexport') && @table_info('betterbibtex.autoexport').collection
    Zotero.DB.query("update betterbibtex.autoexport set collection = (select 'library:' || libraryID from groups where 'group:' || groupID = collection) where collection like 'group:%'")
    Zotero.DB.query("update betterbibtex.autoexport set collection = 'collection:' || collection where collection <> 'library' and collection not like '%:%'")

  tip = Zotero.DB.transactionInProgress()
  Zotero.DB.beginTransaction() unless tip

  @pref.set('scanCitekeys', true)

  for table in tables
    @debug('initDatabase: backing up', table)
    Zotero.DB.query("alter table betterbibtex.#{table} rename to \"-#{table}-\"")

  ### clean slate ###

  Zotero.DB.query('create table betterbibtex.keys (itemID primary key, citekey not null, citekeyFormat)')

  Zotero.DB.query("
    create table betterbibtex.cache (
      itemID not null,

      exportCharset not null,
      exportNotes default 'false' CHECK(exportNotes in ('true', 'false')),
      getCollections default 'false' CHECK(getCollections in ('true', 'false')),
      translatorID not null,
      useJournalAbbreviation default 'false' CHECK(useJournalAbbreviation in ('true', 'false')),

      citekey not null,
      bibtex not null,
      lastaccess not null default CURRENT_TIMESTAMP,
      PRIMARY KEY (itemID, exportCharset, exportNotes, getCollections, translatorID, useJournalAbbreviation)
      )
    ")

  Zotero.DB.query("
    create table betterbibtex.autoexport (
      id INTEGER PRIMARY KEY NOT NULL DEFAULT NULL,

      collection not null,
      path not null,

      exportCharset not null,
      exportNotes default 'false' CHECK(exportNotes in ('true', 'false')),
      translatorID not null,
      useJournalAbbreviation default 'false' CHECK(useJournalAbbreviation in ('true', 'false')),

      exportedRecursively CHECK(exportedRecursively in ('true', 'false')),
      status,

      UNIQUE (path)
      )
    ")

  ### migrate data where needed ###

  if @tableExists('betterbibtex."-keys-"', true)
    @debug('initDatabase: migrating keys')
    if @table_info('betterbibtex."-keys-"').pinned
      @debug('initDatabase: migrating old-style keys')
      Zotero.BetterBibTeX.debug('Upgrading betterbibtex.keys')
      Zotero.DB.query('insert into betterbibtex.keys (itemID, citekey, citekeyFormat)
                      select itemID, citekey, case when pinned = 1 then null else ? end from betterbibtex."-keys-"', [@citekeyFormat])
    else
      @debug('initDatabase: migrating keys')
      @copyTable('betterbibtex."-keys-"', 'betterbibtex.keys')

  if @tableExists('betterbibtex."-autoexport-"', true)
    @debug('initDatabase: migrating autoexport')
    if @table_info('betterbibtex."-autoexport-"').context
      # sorry my dear colleague, but this was a mess
    else
      @copyTable('betterbibtex."-autoexport-"', 'betterbibtex.autoexport', 'id')

  ### cleanup ###

  for table in Zotero.DB.columnQuery("SELECT name FROM betterbibtex.sqlite_master WHERE type='table' AND name like '-%-'") || []
    @debug('initDatabase: deleting', table)
    Zotero.DB.query("drop table if exists betterbibtex.\"#{table}\"")

  Zotero.DB.commitTransaction() unless tip

  Zotero.DB.query("update betterbibtex.autoexport set status = ?", [Zotero.BetterBibTeX.auto.status('pending')])

  @flash('Better BibTeX: database updated', 'Database update finished')

Zotero.BetterBibTeX.initDatabase = ->
  db = Zotero.getZoteroDatabase('betterbibtex')
  Zotero.DB.query('ATTACH ? AS betterbibtex', [db.path])

  Zotero.DB.query("create table if not exists betterbibtex.schema (lock primary key default 'schema' check (lock='schema'), version not null)")
  Zotero.DB.query("insert or ignore into betterbibtex.schema (lock, version) values ('schema', '')")
  Zotero.DB.query("update betterbibtex.schema set version = '' where not version like '%.%.%'")

  installed = Zotero.DB.valueQuery("select version from betterbibtex.schema")

  # always upgrade on version change
  upgrade = Services.vc.compare(installed, @release) != 0

  for check in [
    'SELECT itemID, citekey, citekeyFormat FROM betterbibtex.keys'
    'SELECT id, collection, path, exportCharset, exportNotes, translatorID, useJournalAbbreviation, exportedRecursively, status FROM betterbibtex.autoexport'
    'SELECT itemID, exportCharset, exportNotes, getCollections, translatorID, useJournalAbbreviation, citekey, bibtex, lastaccess FROM betterbibtex.cache'
    ]
    continue if upgrade
    try
      Zotero.DB.query(check + ' LIMIT 1')
    catch e
      @log('Unexpected schema:', check, e)
      upgrade = true

  @upgradeDatabase() if upgrade

  if @pref.get('scanCitekeys')
    @flash('Citation key rescan', "Scanning 'extra' fields for fixed keys\nFor a large library, this might take a while")
    @keymanager.reset()
    @cache.reset()
    @pref.set('scanCitekeys', false)

  @keymanager.load()
  @keymanager.clearDynamic()

  mismatched = Zotero.DB.query('select c.itemID, c.citekey as cached, k.citekey from betterbibtex.cache c join betterbibtex.keys k on c.itemID = k.itemID and c.citekey <> k.citekey') || []
  for m in mismatched
    Zotero.BetterBibTeX.log("export cache: citekey mismatch! #{m.itemID} cached=#{m.cached} key=#{m.citekey}")
  if mismatched.length > 0
    Zotero.DB.query('delete from betterbibtex.cache')

  if Zotero.BetterBibTeX.pref.get('cacheReset') > 0
    @cache.reset()
    @serialized.reset()
    Zotero.BetterBibTeX.pref.set('cacheReset', Zotero.BetterBibTeX.pref.get('cacheReset') - 1)
    Zotero.BetterBibTeX.debug('cache.load forced reset', Zotero.BetterBibTeX.pref.get('cacheReset'), 'left')
  else
    @cache.load()
    @serialized.load()

  Zotero.DB.query("insert or replace into betterbibtex.schema (lock, version) values ('schema', ?)", [@release])

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

  @initDatabase()
  cfi = @pref.get('cacheFlushInterval')
  cfi = 1 if typeof cfi != 'number' || cfi < 1
  cfi = 5 if cfi > 5
  setInterval((-> Zotero.BetterBibTeX.cache.flush(); Zotero.BetterBibTeX.keymanager.flush()), cfi * 1000 * 60)

  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    keymanager: {
      months:         @keymanager.months
      journalAbbrev:  @keymanager.journalAbbrev.bind(@keymanager)
      extract:        @keymanager.extract.bind(@keymanager)
      get:            @keymanager.get.bind(@keymanager)
      alternates:     @keymanager.alternates.bind(@keymanager)
      cache:          @keymanager.cache.bind(@keymanager)
    }
    cache: {
      fetch:  @cache.fetch.bind(@cache)
      store:  @cache.store.bind(@cache)
      dump:   @cache.dump.bind(@cache)
    }
    CSL: {
      parseParticles: (sandbox, name, normalizeApostrophe) -> Zotero.CiteProc.CSL.parseParticles(name, normalizeApostrophe)
    }
  }

  for own name, endpoint of @endpoints
    url = "/better-bibtex/#{name}"
    ep = Zotero.Server.Endpoints[url] = ->
    ep:: = endpoint

  @loadTranslators()
  @extensionConflicts()

  # monkey-patch Zotero.Server.DataListener.prototype._generateResponse for async handling
  Zotero.Server.DataListener::_generateResponse = ((original) ->
    return (status, contentType, promise) ->
      try
        if typeof promise?.then == 'function'
          return promise.then((body) =>
            throw new Error("Zotero.Server.DataListener::_generateResponse: circular promise!") if typeof body?.then == 'function'
            original.apply(@, [status, contentType, body])
          ).catch((e) =>
            original.apply(@, [500, 'text/plain', e.message])
          )

      return original.apply(@, arguments)
    )(Zotero.Server.DataListener::_generateResponse)

  # monkey-patch Zotero.Server.DataListener.prototype._requestFinished for async handling of web api translation requests
  Zotero.Server.DataListener::_requestFinished = ((original) ->
    return (promise) ->
      try
        if typeof promise?.then == 'function'
          promise.then((response) =>
            throw new Error("Zotero.Server.DataListener::_requestFinished: circular promise!") if typeof response?.then == 'function'
            original.apply(@, [response])
          ).catch((e) =>
            original.apply(@, e.message)
          )
          return
      catch err
        Zotero.debug("Zotero.Server.DataListener::_requestFinished: error handling promise: #{err.message}")

      return original.apply(@, arguments)
    )(Zotero.Server.DataListener::_requestFinished)

  # monkey-patch Zotero.Search.prototype.save to trigger auto-exports
  Zotero.Search::save = ((original) ->
    return (fixGaps) ->
      id = original.apply(@, arguments)
      Zotero.BetterBibTeX.auto.markSearch(id)
      return id
    )(Zotero.Search::save)

  # monkey-patch Zotero.ItemTreeView::getCellText to replace the 'extra' column with the citekey
  # I wish I didn't have to hijack the extra field, but Zotero has checks in numerous places to make sure it only
  # displays 'genuine' Zotero fields, and monkey-patching around all of those got to be way too invasive (and thus
  # fragile)
  Zotero.ItemTreeView::getCellText = ((original) ->
    return (row, column) ->
      if column.id == 'zotero-items-column-extra' && Zotero.BetterBibTeX.pref.get('showCitekeys')
        item = @._getItemAtRow(row)
        if !(item?.ref) || item.ref.isAttachment() || item.ref.isNote()
          return ''
        else
          key = Zotero.BetterBibTeX.keymanager.get({itemID: item.id})
          return '' if key.citekey.match(/^zotero-(null|[0-9]+)-[0-9]+$/)
          return key.citekey + (if key.citekeyFormat then ' *' else '')

      return original.apply(@, arguments)
    )(Zotero.ItemTreeView::getCellText)

  # monkey-patch translate to capture export path and auto-export
  Zotero.Translate.Export::translate = ((original) ->
    return ->
      # requested translator
      Zotero.BetterBibTeX.debug("Zotero.Translate.Export::translate: #{if @_export then Object.keys(@_export) else 'no @_export'}")
      translatorID = @translator?[0]
      translatorID = translatorID.translatorID if translatorID.translatorID
      Zotero.BetterBibTeX.debug('export: ', translatorID)
      return original.apply(@, arguments) unless translatorID

      # pick up sentinel from patched Zotero_File_Interface.exportCollection in zoteroPane.coffee
      if @_export?.items?.search
        saved_search = @_export.items.search
        @_export.items = @_export.items.items
        throw new Error('Cannot export empty search') unless @_export.items

      # regular behavior for non-BBT translators, or if translating to string
      header = Zotero.BetterBibTeX.translators[translatorID]
      return original.apply(@, arguments) unless header && @location?.path

      if @_displayOptions
        if @_displayOptions.exportFileData # export directory selected
          @_displayOptions.exportPath = @location.path
        else
          @_displayOptions.exportPath = @location.parent.path
        @_displayOptions.exportFilename = @location.leafName

      Zotero.BetterBibTeX.debug("export", @_export, " to #{if @_displayOptions?.exportFileData then 'directory' else 'file'}", @location.path, 'using', @_displayOptions)

      # If no capture, we're done
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

  # monkey-patch _prepareTranslation to notify itemgetter whether we're doing exportFileData
  Zotero.Translate.Export::_prepareTranslation = ((original) ->
    return ->
      r = original.apply(@, arguments)

      # caching shortcut sentinels
      translatorID = @translator?[0]
      translatorID = translatorID.translatorID if translatorID.translatorID

      @_itemGetter._BetterBibTeX = Zotero.BetterBibTeX.translators[translatorID] if Zotero.BetterBibTeX.translators[translatorID]?.BetterBibTeX?.cache?.nextItem
      @_itemGetter._exportFileData = @_displayOptions.exportFileData

      return r
    )(Zotero.Translate.Export::_prepareTranslation)

  # monkey-patch Zotero.Translate.ItemGetter::nextItem to fetch from pre-serialization cache.
  # object serialization is approx 80% of the work being done while translating! Seriously!
  Zotero.Translate.ItemGetter::nextItem = ((original) ->
    return ->
      # don't mess with this unless I know it's in BBT
      return original.apply(@, arguments) unless @_BetterBibTeX

      while @_itemsLeft.length != 0
        item = @_itemsLeft.shift()
        item = Zotero.BetterBibTeX.serialized.get.apply(@, [item, {exportFileData: @_exportFileData}])
        continue unless item

        return item if item.itemType == 'attachment'

        item.attachments = []
        for attachmentID in item.attachmentIDs
          attachment = Zotero.BetterBibTeX.serialized.get.apply(@, [attachmentID, {attachmentID: true, exportFileData: @_exportFileData}])
          item.attachments.push(attachment) if attachment
        return item
      return false
    )(Zotero.Translate.ItemGetter::nextItem)

  # monkey-patch zotfile wildcard table to add bibtex key
  if Zotero.ZotFile
    Zotero.ZotFile.wildcardTable = ((original) ->
      return (item) ->
        table = original.apply(@, arguments)
        table['%b'] = Zotero.BetterBibTeX.keymanager.get(item).citekey unless item.isAttachment() || item.isNote()
        return table
      )(Zotero.ZotFile.wildcardTable)

  @schomd.init()

  @pref.observer.register()
  @pref.ZoteroObserver.register()
  Zotero.addShutdownListener(->
    Zotero.BetterBibTeX.log('shutting down')
    Zotero.BetterBibTeX.cache.flush()
    Zotero.BetterBibTeX.keymanager.flush()
    Zotero.BetterBibTeX.serialized.save()

    Zotero.BetterBibTeX.debugMode()
  )

  nids = []
  nids.push(Zotero.Notifier.registerObserver(@itemChanged, ['item']))
  nids.push(Zotero.Notifier.registerObserver(@collectionChanged, ['collection']))
  nids.push(Zotero.Notifier.registerObserver(@itemAdded, ['collection-item']))
  window.addEventListener('unload', ((e) -> Zotero.Notifier.unregisterObserver(id) for id in nids), false)

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
  f.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0o666) unless f.exists()
  return f

Zotero.BetterBibTeX.loadTranslators = ->
  @load('Better BibTeX')
  @load('Better BibLaTeX')
  @load('LaTeX Citation')
  @load('Pandoc Citation')
  @load('Pandoc JSON')
  @load('BetterBibTeX JSON')
  @load('BibTeXAuxScanner')
  @load('Collected Notes')

  # clean up junk
  try
    @removeTranslator({label: 'BibTeX Citation Keys', translatorID: '0a3d926d-467c-4162-acb6-45bded77edbb'})
  try
    @removeTranslator({label: 'Zotero TestCase', translatorID: '82512813-9edb-471c-aebc-eeaaf40c6cf9'})

  Zotero.Translators.init()

Zotero.BetterBibTeX.removeTranslators = ->
  for own id, header of @translators
    @removeTranslator(header)
  @translators = Object.create(null)
  Zotero.Translators.init()

Zotero.BetterBibTeX.removeTranslator = (header) ->
  try
    fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
    destFile = Zotero.getTranslatorsDirectory()
    destFile.append(fileName)
    destFile.remove(false) if destFile.exists()
  catch err
    @debug("failed to remove #{header.label}:", err)

Zotero.BetterBibTeX.itemAdded = notify: ((event, type, collection_items) ->
  collections = []
  items = []

  # monitor items added to collection to find BibTeX AUX Scanner data. The scanner adds a dummy item whose 'extra'
  # field has instructions on what to do after import

  return if collection_items.length == 0

  for collection_item in collection_items
    [collectionID, itemID] = collection_item.split('-')
    collections.push(collectionID)
    items.push(itemID)

    # aux-scanner only triggers on add
    continue unless event == 'add'
    collection = Zotero.Collections.get(collectionID)
    continue unless collection

    try
      extra = JSON.parse(Zotero.Items.get(itemID).getField('extra').trim())
    catch error
      @debug('no AUX scanner/import error info found on collection add')
      continue

    note = null
    switch extra.translator
      when 'ca65189f-8815-4afe-8c8b-8c7c15f0edca' # Better BibTeX
        if extra.notimported && extra.notimported.length > 0
          report = new @HTMLNode('http://www.w3.org/1999/xhtml', 'html')
          report.div(->
            @p(-> @b('Better BibTeX could not import'))
            @add(' ')
            @pre(extra.notimported)
          )
          note = report.serialize()

      when '0af8f14d-9af7-43d9-a016-3c5df3426c98' # BibTeX AUX Scanner
        missing = []
        for own citekey, found of @keymanager.resolve(extra.citations, collection.libraryID)
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

  collections = @withParentCollections(collections) if collections.length != 0
  collections = ("'collection:#{id}'" for id in collections)
  # collection changes do not affect the library
  #for libraryID in Zotero.DB.columnQuery("select distinct libraryID from items where itemID in #{@SQLSet(items)}")
  #  if libraryID
  #    collections.push("'library:#{libraryID}'")
  #  else
  #    collections.push("'library'")
  if collections.length > 0
    collections = @SQLSet(collections)
    Zotero.DB.query("update betterbibtex.autoexport set status = ? where collection in #{collections}", [Zotero.BetterBibTeX.auto.status('pending')])
    @auto.process("collection changed: #{collections}")
).bind(Zotero.BetterBibTeX)

Zotero.BetterBibTeX.collectionChanged = notify: (event, type, ids, extraData) ->
  Zotero.DB.query("delete from betterbibtex.autoexport where collection in #{Zotero.BetterBibTeX.SQLSet(extraData)}") if event == 'delete' && extraData.length > 0

Zotero.BetterBibTeX.SQLSet = (values) -> '(' + ('' + v for v in values).join(', ') + ')'

Zotero.BetterBibTeX.itemChanged = notify: ((event, type, ids, extraData) ->
  return unless type == 'item' && event in ['delete', 'trash', 'add', 'modify']
  ids = extraData if event == 'delete'
  return unless ids.length > 0

  for itemID in ids.concat(Zotero.DB.columnQuery("SELECT linkedItemID FROM itemSeeAlso WHERE itemID in #{@SQLSet(ids)}"))
    itemID = parseInt(itemID) unless typeof itemID == 'number'
    @serialized.remove(itemID)
    @cache.remove({itemID})

  @keymanager.scan(ids, event)

  collections = Zotero.Collections.getCollectionsContainingItems(ids, true) || []
  collections = @withParentCollections(collections) unless collections.length == 0
  collections = ("'collection:#{id}'" for id in collections)
  for libraryID in Zotero.DB.columnQuery("select distinct libraryID from items where itemID in #{@SQLSet(ids)}")
    if libraryID
      collections.push("'library:#{libraryID}'")
    else
      collections.push("'library'")

  for ae in Zotero.DB.query("select collection from betterbibtex.autoexport where status = 'done' and collection like 'search:%'")
    @auto.markSearch(ae.collection.replace('search:', ''))

  if collections.length > 0
    collections = @SQLSet(collections)
    Zotero.DB.query("update betterbibtex.autoexport set status = ? where collection in #{collections}", [Zotero.BetterBibTeX.auto.status('pending')])
    @auto.process("items changed: #{collections}")

).bind(Zotero.BetterBibTeX)

Zotero.BetterBibTeX.withParentCollections = (collections) ->
  return collections unless Zotero.BetterBibTeX.auto.recursive()
  return collections if collections.length == 0

  return Zotero.DB.columnQuery("
    with recursive recursivecollections as (
      select collectionID, parentCollectionID
      from collections
      where collectionID in #{Zotero.BetterBibTeX.SQLSet(collections)}

      union all

      select p.collectionID, p.parentCollectionID
      from collections p
      join recursivecollections as c on c.parentCollectionID = p.collectionID
    ) select distinct collectionID from recursivecollections")

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
    catch
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
  translation.setDisplayOptions(displayOptions)

  translation.setHandler('done', (obj, success) -> callback(!success, if success then obj?.string else null))
  translation.translate()

Zotero.BetterBibTeX.load = (translator) ->
  header = JSON.parse(Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator}.json"))
  @removeTranslator(header)

  sources = ['xregexp-all', 'json5', 'translator', "#{translator}.header", translator].concat(header.BetterBibTeX?.dependencies || [])
  @debug('translator.load:', translator, 'from', sources)
  code = "exports = void 0;\nmodule = void 0;\n"
  for src in sources
    try
      code += Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/translators/#{src}.js") + "\n"
    catch err
      @debug('translator.load: source', src, 'for', translator, 'could not be loaded:', err)
      throw err

  if @pref.get('debug')
    js = @createFile('translators', "#{translator}.js")
    @debug("Saving #{translator} to #{js.path}")
    Zotero.File.putContents(js, code)

  @translators[header.translatorID] = @translators[header.label.replace(/\s/, '')] = header

  # remove BBT metadata -- Zotero doesn't like it
  header = JSON.parse(JSON.stringify(header))
  delete header.BetterBibTeX
  @debug('Translator.load header:', translator, header)
  try
    fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
    destFile = Zotero.getTranslatorsDirectory()
    destFile.append(fileName)

    metadataJSON = JSON.stringify(header, null, "\t")

    existing = Zotero.Translators.get(header.translatorID)
    if existing and destFile.equals(existing.file) and destFile.exists()
      msg = "Overwriting translator with same filename '#{fileName}'"
      Zotero.BetterBibTeX.warn(msg, header)
      Components.utils.reportError(msg + ' in Zotero.BetterBibTeX.load()')

    existing.file.remove(false) if existing and existing.file.exists()

    Zotero.BetterBibTeX.log("Saving translator '#{header.label}'")

    Zotero.File.putContents(destFile, metadataJSON + "\n\n" + code)

    @debug('translator.load', translator, 'succeeded')
  catch err
    @debug('translator.load', translator, 'failed:', err)

Zotero.BetterBibTeX.getTranslator = (name) ->
  return @translators[name.replace(/\s/, '')].translatorID if @translators[name.replace(/\s/, '')]

  name = name.toLowerCase().replace(/[^a-z]/, '')
  translators = {}
  for id, header of @translators
    label = header.label.toLowerCase().replace(/[^a-z]/, '')
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
        # @doc['createElementNS'] rather than @doc.createElementNS to work around overzealous extension validator.
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
