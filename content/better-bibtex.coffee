Zotero.BBT.init = Zotero.Promise.coroutine ->
  Zotero.debug('BBT: init')
  items = yield Zotero.Items.getAll(0) # main lib for now
  for item in items
    Zotero.debug('BBT:' + item.id)
  return
