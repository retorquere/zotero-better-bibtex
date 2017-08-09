debug = require('./debug.coffee')
flash = require('./flash.coffee')
edtf = require('edtf')

Zotero.BetterBibTeX.PrefPane = require('./preferences/preferences.coffee')
Zotero.BetterBibTeX.ErrorReport = require('./error-report/error-report.coffee')

Prefs = require('./preferences.coffee') # needs to be here early, initializes the prefs observer

# TODO: remove after beta
Zotero.Prefs.get('debug.store', true)
Zotero.Debug.setStore(true)

Translators = require('./translators.coffee')
KeyManager = require('./keymanager.coffee')
JournalAbbrev = require('./journal-abbrev.coffee')
Serializer = require('./serializer.coffee')
parseDate = require('./dateparser.coffee')
citeproc = require('./citeproc.coffee')
titleCase = require('./title-case.coffee')
events = require('./events.coffee')
getCiteKey = require('./getCiteKey.coffee')

###
  MONKEY PATCHES
###
### bugger this, I don't want megabytes of shared code in the translators ###
Zotero.Translate.Export::Sandbox.BetterBibTeX = {
  parseDate: (sandbox, date) -> parseDate(date)
  isEDTF: (sandbox, date) ->
    try
      edtf.parse(date)
      return true
    catch
      return false
  parseParticles: (sandbox, name) -> citeproc.parseParticles(name) # && citeproc.parseParticles(name)
  titleCase: (sandbox, text) -> titleCase(text)
  simplifyFields: (sandbox, item) -> Serializer.simplify(item)
  debugEnabled: (sandbox) -> Zotero.Debug.enabled
}
Zotero.Translate.Import::Sandbox.BetterBibTeX = {
  simplifyFields: (sandbox, item) -> Serializer.simplify(item)
  debugEnabled: (sandbox) -> Zotero.Debug.enabled
}

###
  not safe to cache the results based on any field in the item because items are not reliably marked as changed. 'dateModified' is only updated for
  visual changes, and 'clientDateModified' is alwasy empty here (so far). What 'version' does? I have no idea.
###
Zotero.Item::save = ((original) ->
  return Zotero.Promise.coroutine(->
    try
      proposed = yield KeyManager.generate(@)
      @setField('extra', proposed) if proposed
      debug('Zotero.Item::save: cite key set to', proposed)
    catch err
      debug('Zotero.Item::save: could not update cite key:', err)

    ###
    TODO: caching
    try
      Serializer.remove(this.id)
    catch
      debug('Zotero.Item::save: could not update serializer:', err)
    ###

    return (yield original.apply(@, arguments))
  )
)(Zotero.Item::save)

Zotero.Utilities.Internal.itemToExportFormat = ((original) ->
  return (zoteroItem, legacy, skipChildItems) ->
    ###
      TODO: caching
    try
      return Serializer.fetch(zoteroItem.id, legacy, skipChildItems) || Serializer.store(zoteroItem.id, original.apply(@, arguments), legacy, skipChildItems)
    catch err # fallback for safety for non-BBT
      debug('Zotero.Item::save', err)
    ###

    serialized = original.apply(@, arguments)
    serialized.itemID = zoteroItem.id
    return serialized
)(Zotero.Utilities.Internal.itemToExportFormat)

###
  INIT
###

bench = (msg) ->
  now = new Date()
  debug("startup: #{msg} took #{(now - bench.start) / 1000.0}s")
  bench.start = now
  return
do Zotero.Promise.coroutine(->
  ready = Zotero.Promise.defer()
  Zotero.BetterBibTeX.ready = ready.promise
  bench.start = new Date()

  yield Zotero.initializationPromise
  bench('Zotero.initializationPromise')

  JournalAbbrev.init()
  bench('JournalAbbrev.init()')

  yield Serializer.init()
  bench('Serializer.init()')

  yield KeyManager.init()
  bench('KeyManager.init()')

  if Prefs.get('testing')
    Zotero.BetterBibTeX.TestSupport = require('./test/support.coffee')
    bench('Zotero.BetterBibTeX.TestSupport')
  else
    debug('starting, skipping test support')

  flash('waiting for Zotero...')
  yield Zotero.Schema.schemaUpdatePromise
  bench('Zotero.Schema.schemaUpdatePromise')

  yield Zotero.Translators.init()
  bench('Zotero.Translators.init()')
  flash('Hello Zotero!')

  yield Translators.init()
  bench('Translators.init()')

  # should be safe to start tests at this point. I hate async.

  ready.resolve(true)

  return
)
