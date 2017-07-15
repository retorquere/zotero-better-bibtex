Zotero.debug('BBT: attempting start')
if !Zotero.BBT
  Zotero.debug('BBT: starting')
  Zotero.BBT = {}
  Zotero.Promise.coroutine(->
    Zotero.debug('BBT: waiting for schema...')
    yield Zotero.Schema.schemaUpdatePromise
    Zotero.debug('BBT: schema done')
    require('./better-bibtex.coffee')
    yield Zotero.BBT.init()
    return
  )()
