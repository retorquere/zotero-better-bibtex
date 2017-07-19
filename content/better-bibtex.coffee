debug = require('./debug.coffee')
Translators = require('./translators.coffee')
KeyManager = require('./keymanager.coffee')
citeproc = require('../citeproc-js/citeproc').CSL

BBT = {}

BBT.init = Zotero.Promise.coroutine ->
  debug('init')
  items = yield Zotero.Items.getAll(0) # main lib for now
  for item in items
    Zotero.debug('BBT:' + item.id)
  return

Zotero.Promise.coroutine(->
  bbtReady = Zotero.Promise.defer()
  Zotero.BetterBibTeX = {
    ready: bbtReady.promise
  }

  debug('starting, waiting for schema...')

  yield Zotero.Schema.schemaUpdatePromise
  debug('zotero schema done')

  yield BBT.init()
  yield Translators.init()
  yield KeyManager.init()
  debug('started')

  bbtReady.resolve(true)
  return
)()
