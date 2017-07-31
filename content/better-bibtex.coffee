debug = require('./debug.coffee')
edtf = require('edtf')

require('./preferences.coffee') # initializes the prefs observer

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
Zotero.Utilities.Internal.itemToExportFormat = ((original) ->
  return (zoteroItem, legacy, skipChildItems) ->
    try
      return Serializer.fetch(zoteroItem.id, legacy, skipChildItems) || Serializer.store(zoteroItem.id, original.apply(@, arguments), legacy, skipChildItems)
    catch err # fallback for safety for non-BBT
      debug('Zotero.Item::save', err)
      return original.apply(@, arguments)
)(Zotero.Utilities.Internal.itemToExportFormat)

###
  EVENTS
###

events.on('item-updated', ->
  debug('events.triggered: item-updated', Array.prototype.slice.call(arguments))
  return
)

###
  INIT
###

Zotero.Promise.coroutine(->
  bbtReady = Zotero.Promise.defer()
  Zotero.BetterBibTeX = {
    ready: bbtReady.promise
  }

  debug('starting, waiting for schema...')
  yield Zotero.Schema.schemaUpdatePromise
  debug('zotero schema done')

  Serializer.init()
  yield JournalAbbrev.init()
  yield Translators.init()
  yield KeyManager.init()
  Zotero.BetterBibTeX.TestSupport = require('./test/support.coffee')
  debug('started')

  bbtReady.resolve(true)
  return
)()
