debug = require('./debug.coffee')

Zotero.BBT = {}

Zotero.BBT.init = Zotero.Promise.coroutine ->
  debug('init')
  items = yield Zotero.Items.getAll(0) # main lib for now
  for item in items
    Zotero.debug('BBT:' + item.id)
  return

Zotero.Promise.coroutine(->
  debug('starting, waiting for schema...')
  yield Zotero.Schema.schemaUpdatePromise
  debug('schema done')
  yield Zotero.BBT.init()
  debug('started')
  return
)()
