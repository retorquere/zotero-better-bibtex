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

benchmark = Zotero.Promise.coroutine((options) ->
  start = new Date()

  debug("waiting for #{options.msg}...")
  flash("waiting for #{options.msg}...") if options.flash

  if options.async
    yield options.async
  else
    options.code()

  debug("#{options.msg} done in #{(new Date() - start) / 1000.0}s")
  flash("#{options.msg} done") if options.flash

  return
)
do Zotero.Promise.coroutine(->
  ready = Zotero.Promise.defer()
  Zotero.BetterBibTeX.ready = ready.promise

  yield benchmark({
    msg: 'Zotero initialization'
    async: Zotero.initializationPromise
    flash: true
  })

  # must start after the initializationPromise
  yield benchmark({
    msg: 'keymanager'
    async: KeyManager.init()
  })

  yield benchmark({
    msg: 'abbreviater'
    code: -> JournalAbbrev.init()
  })

  # must start after journal abbrev
  yield benchmark({
    msg: 'serializer'
    code: -> Serializer.init()
  })

  if Prefs.get('testing')
    benchmark({
      msg: 'test support'
      code: -> Zotero.BetterBibTeX.TestSupport = require('./test/support.coffee')
    })
  else
    debug('starting, skipping test support')

  benchmark({
    msg: 'Zotero translators'
    async: Zotero.Translators.init()
    flash: true
  })
  benchmark({
    msg: 'Better BibTeX translators'
    async: Translators.init()
  })

  # should be safe to start tests at this point. I hate async.

  ready.resolve(true)

  return
)
