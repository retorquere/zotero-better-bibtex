debug = require('./debug.coffee')
Translators = require('./translators.coffee')

BBT = {}

BBT.init = Zotero.Promise.coroutine ->
  debug('init')
  items = yield Zotero.Items.getAll(0) # main lib for now
  for item in items
    Zotero.debug('BBT:' + item.id)
  return

Zotero.Promise.coroutine(->
  debug('starting, waiting for schema...')
  yield Zotero.Schema.schemaUpdatePromise
  debug('schema done')
  yield BBT.init()
  yield Translators.init()
  debug('started')
  return
)()
