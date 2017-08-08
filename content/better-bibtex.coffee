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
  return (options) ->
    Serializer.remove(this.id)
    return original.apply(@, arguments)
)(Zotero.Item::save)
Zotero.BetterBibTeX.itemToExportFormat = Zotero.Utilities.Internal.itemToExportFormat # TODO: remove this, only for debugging
Zotero.Utilities.Internal.itemToExportFormat = ((original) ->
  return (zoteroItem, legacy, skipChildItems) ->
    try
      return Serializer.fetch(zoteroItem.id, legacy, skipChildItems) || Serializer.store(zoteroItem.id, original.apply(@, arguments), legacy, skipChildItems)
    catch err # fallback for safety for non-BBT
      debug('Zotero.Item::save', err)
      return original.apply(@, arguments)
)(Zotero.Utilities.Internal.itemToExportFormat)

###
  INIT
###

Zotero.Promise.coroutine(->
  ready = Zotero.Promise.defer()
  flash('waiting for Zotero to load translators')
  Zotero.BetterBibTeX.ready = ready.promise

  start = new Date()
  debug('starting...')

  if Prefs.get('testing')
    Zotero.BetterBibTeX.TestSupport = require('./test/support.coffee')
    debug('starting, test support @', (new Date() - start) / 1000.0, 's')
  else
    debug('starting, skipping test support')
  debug('starting, test support ready @', (new Date() - start) / 1000.0, 's')

  yield Translators.init()
  debug('starting, translators ready @', (new Date() - start) / 1000.0, 's')

  # should be safe to start tests at this point. I hate async.
  ready.resolve(true)
  flash('Zotero translators loaded')

  yield Zotero.Schema.schemaUpdatePromise
  debug('starting, schema ready @', (new Date() - start) / 1000.0, 's')

  Serializer.init()
  debug('starting, serializer ready @', (new Date() - start) / 1000.0, 's')

  JournalAbbrev.init()
  debug('starting, journal abbrev ready @', (new Date() - start) / 1000.0, 's')

  # must start after the schemaUpdatePromise
  yield KeyManager.init()
  debug('starting, keymanager @', (new Date() - start) / 1000.0, 's')

  debug('starting took', (new Date() - start) / 1000.0, 's')

  return
)()
