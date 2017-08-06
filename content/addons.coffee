Components.utils.import('resource://gre/modules/AddonManager.jsm')

activeAddons = null

module.exports = Zotero.Promise.coroutine(->
  if !activeAddons
    activeAddons = yield new Zotero.Promise((resolve, reject) ->
      AddonManager.getAllAddons((addons) ->
        resolve(addons.reduce(((acc, addon) -> acc[addon.id] = addon.version; return acc), {}))
        return
      )
      return
    )
  return activeAddons
)
