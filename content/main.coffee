if !Zotero.BBT
  Zotero.BBT = {}
  Zotero.Promise.coroutine(->
    yield Zotero.schemaUpdatePromise
    require('./better-bibtex.coffee')
    yield Zotero.BBT.init()
    return
  )()
