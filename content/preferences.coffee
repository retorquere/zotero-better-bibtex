debug = require('./debug.coffee')

class Preferences
  prefix: 'translators.better-bibtex'

  key: (key) -> "#{@prefix}.#{key}"

  set: (key, value) ->
    debug("Prefs.set(#{key}):", value)
    Zotero.Prefs.set(@key(key), value)
    return

  get: (key) ->
    try
      return Zotero.Prefs.get(@key(key))
    catch err
      debug("Prefs.get(#{key}):", err)
      return null

  clear: (key) ->
    try
      Zotero.Prefs.clear(@key(key))
    catch err
      debug('Prefs.clear', key, err)
    return

  observe: (observer) ->
    Zotero.Prefs.prefBranch.addObserver(@prefix, { observe: observer}, false)
    return

module.exports = new Preferences()
