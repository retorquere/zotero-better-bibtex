Zotero.BBT.init = Zotero.Promise.coroutine ->
  items = yield Zotero.Items.getAll(0) # main lib for now
  for item in items
    console.log(item.id)
  return
