debug = require('./debug.coffee')

module.exports = Zotero.Promise.coroutine((ids) ->
  if Array.isArray(ids)
    returnSingle = false
  else
    returnSingle = true
    ids = [ids]

  items = yield Zotero.Items.getAsync(ids)

  # because getAsync isn't "same as get but asynchronously" but "sort
  # of same as get but asynchronously, however if the object was not
  # already loaded by some user interaction you're out of luck". BTW,
  # if you could know at this point that getAsync would get you a loaded
  # object, you could just have called "get". Nice.
  # https://groups.google.com/d/msg/zotero-dev/QYNGxqTSpaQ/nGKJakGnBAAJ
  # https://groups.google.com/d/msg/zotero-dev/naAxXIbpDhU/iSLpXo-UBQAJ
  for item in items
    yield item.loadAllData()

  items = items[0] if returnSingle
  return items
)
