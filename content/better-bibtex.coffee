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

BBT = {}

BBT.init = ->
  debug('init')

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

  return

Zotero.Promise.coroutine(->
  bbtReady = Zotero.Promise.defer()
  Zotero.BetterBibTeX = {
    ready: bbtReady.promise
  }

  debug('starting, waiting for schema...')
  yield Zotero.Schema.schemaUpdatePromise
  debug('zotero schema done')

  BBT.init()
  Serializer.init()
  yield JournalAbbrev.init()
  yield Translators.init()
  yield KeyManager.init()
  Zotero.BetterBibTeX.TestSupport = require('./test/support.coffee')
  debug('started')

  bbtReady.resolve(true)
  return
)()
