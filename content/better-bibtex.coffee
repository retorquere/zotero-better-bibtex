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
Serializer = require('./serializer.coffee')

###
  MONKEY PATCHES
###
### bugger this, I don't want megabytes of shared code in the translators ###
parseDate = require('./dateparser.coffee')
CiteProc = require('./citeproc.coffee')
titleCase = require('./title-case.coffee')
Zotero.Translate.Export::Sandbox.BetterBibTeX = {
  parseDate: (sandbox, date) -> parseDate(date)
  isEDTF: (sandbox, date) ->
    try
      edtf.parse(date)
      return true
    catch
      return false
  parseParticles: (sandbox, name) -> CiteProc.parseParticles(name) # && CiteProc.parseParticles(name)
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
TESTING = Prefs.get('testing')

ZoteroItemSavePatch = Zotero.Promise.coroutine((item) ->
  return if item.isAttachment() || item.isNote()
  debug('Zotero.Item::save: ', item.id)

  try
    Serializer.remove(item.id)
  catch err
    throw new Error("Zotero.Item::save: serializer failed: " + err)

  try
    extra = yield KeyManager.generate(item)
  catch err
    throw new Error("Zotero.Item::save: could not generate citekey: " + err)

  if extra
    item.setField('extra', extra)
    debug('Zotero.Item::save: citekey embedded in', extra)
  else
    debug('Zotero.Item::save: leave citekey as-is')

  return
)
Zotero.Item::save = ((original) ->
  return Zotero.Promise.coroutine((options)->
    Zotero.debug("Zotero.Item::save: pre")
    try
      yield ZoteroItemSavePatch(@)
    catch err
      debug('Zotero.Item::save: citekey embedding failed', err)

    try
      Zotero.debug("Zotero.Item::save: native...")
      return yield original.call(@, options)
    catch err
      Zotero.debug("Zotero.Item::save: actual save failed: " + err + "\n\n" + err.stack)

    return
  )
)(Zotero.Item::save)

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

  yield Serializer.init()
  bench('Serializer.init()')

  yield KeyManager.init()
  bench('KeyManager.init()')

  if Prefs.get('testing')
    Zotero.BetterBibTeX.TestSupport = require('./test/support.coffee')
    bench('Zotero.BetterBibTeX.TestSupport')
  else
    debug('starting, skipping test support')

  flash('waiting for Zotero translators...', 'Better BibTeX needs the translators to be loaded')
  yield Zotero.Schema.schemaUpdatePromise
  bench('Zotero.Schema.schemaUpdatePromise')

  yield Zotero.Translators.init()
  bench('Zotero.Translators.init()')
  flash('Zotero translators loaded', 'Better BibTeX ready for business')

  yield Translators.init()
  bench('Translators.init()')

  # should be safe to start tests at this point. I hate async.

  ready.resolve(true)

  return
)
