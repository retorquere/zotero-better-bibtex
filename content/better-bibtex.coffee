debug = require('./debug.coffee')
Translators = require('./translators.coffee')
KeyManager = require('./keymanager.coffee')
require('./serializer.coffee')

BBT = {}

BBT.init = ->
  debug('init')

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
  yield Translators.init()
  yield KeyManager.init()
  debug('started')

  bbtReady.resolve(true)
  return
)()
