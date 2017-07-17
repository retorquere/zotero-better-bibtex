debug = require('./debug.coffee')

class Preferences
  prefix: 'translators.better-bibtex'

  set: (key, value) ->
    debug("Preferences.set(#{key}):", value)
    Zotero.Prefs.set("#{@prefix}.#{key}", value)
    return

  get: (key) ->
    try
      return Zotero.Prefs.get("#{@prefix}.#{key}")
    catch err
      debug("Pref.get(#{key}):", err)
      return null

module.exports = new Preferences()
