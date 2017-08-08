Components.utils.import('resource://gre/modules/AddonManager.jsm')

types = {
  2:    'extension'
  4:    'theme'
  8:    'locale'
  32:   'multiple item package'
  64:   'spell check dictionary'
  128:  'telemetry experiment'
  256:  'WebExtension experiment'
}

module.exports = Zotero.Promise.coroutine(->
  return yield new Zotero.Promise((resolve, reject) ->
    AddonManager.getAllAddons((addons) ->
      try
        state = { active: [], inactive: [] }
        for addon in addons
          state[if addon.appDisabled || addon.userDisabled then 'inactive' else 'active'].push({
            version: addon.version
            info: "#{addon.name} (#{types[addon.type] || addon.type}): #{addon.version}"
            name: addon.name
            guid: addon.id
          })
        state.active.sort((a, b) -> a.name.localeCompare(b.name))
        state.inactive.sort((a, b) -> a.name.localeCompare(b.name))

        resolve(state)
      catch err
        reject(err)
      return
    )
    return
  )
)
