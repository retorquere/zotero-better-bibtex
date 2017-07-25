debug = require('./debug.coffee')
Translators = require('./translators.coffee')
KeyManager = require('./keymanager.coffee')
JournalAbbrev = require('./journal-abbrev.coffee')
require('./serializer.coffee')
dateparser = require('./dateparser.coffee')
citeproc = require('./citeproc.coffee')
titleCase = require('./title-case.coffee')

BBT = {}

BBT.init = ->
  debug('init')

  ### bugger this, I don't want megabytes of shared code in the translators ###
  Zotero.Translate.Export::Sandbox.BetterBibTeX = {
    parseDate: (sandbox, date) -> dateparser(date)
    parseParticles: (sandbox, name) -> citeproc.parseParticles(name) # && citeproc.parseParticles(name)
    titleCase: (sandbox, text) -> titleCase(text)
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
  yield JournalAbbrev.init()
  yield Translators.init()
  yield KeyManager.init()
  debug('started')

  bbtReady.resolve(true)
  return
)()
