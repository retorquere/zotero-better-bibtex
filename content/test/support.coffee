KeyManager = require('../keymanager.coffee')
debug = require('../debug.coffee')
co = Zotero.Promise.coroutine

module.exports =
  reset: co(->
    prefs = require('../../defaults/preferences/defaults.json')

    prefix = 'translators.better-bibtex.'
    for pref, value of prefs
      continue if pref in ['debug', 'testing']
      Zotero.Prefs.set(prefix + pref, value)

    Zotero.Prefs.set(prefix + 'debug', true)
    Zotero.Prefs.set(prefix + 'testing', true)
    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    yield Zotero.Items.erase(items)
    yield Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID)
    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    throw new Error('library not empty after reset') if items.length != 0
    return
  )

  importFile: co((source, createNewCollection, preferences) ->
    preferences ||= {}
    if Object.keys(preferences).length
      debug("importing references and preferences from #{source}")
      prefix = 'translators.better-bibtex'
      for pref, value of preferences
        Zotero.Prefs.set("#{prefix}.#{pref}", value)
    else
      debug("importing references from #{source}")

    file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
    file.initWithPath(source)

    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    before = items.length

    debug('starting import at ' + new Date())
    yield Zotero_File_Interface.importFile(file, !!createNewCollection)
    debug('import finished at ' + new Date())

    items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    after = items.length

    debug('import found ' + (after - before) + ' items')
    return (after - before)
  )

  exportLibrary: co((translatorID, displayOptions) ->
    displayOptions ||= {}
    translation = new Zotero.Promise((resolve, reject) ->
      translation = new Zotero.Translate.Export()
      translation.setLibraryID(Zotero.Libraries.userLibraryID)
      translation.setTranslator(translatorID)
      translation.setDisplayOptions(displayOptions)
      translation.setHandler('done', (obj, success) ->
        if (success && obj && obj.string)
          return resolve(obj.string)
        else
          return reject('translation failed')
      )
      translation.translate()
      return
    )
    return yield translation
  )

  select: co((field, value) ->
    s = new Zotero.Search()
    s.addCondition('field', 'is', value) # field not used?
    ids = yield s.search()
    throw new Error("No item found with #{field}  = '#{value}'") unless ids && ids.length

    id = ids[0]

    for attempt in [1 .. 10]
      debug("select #{field} = '#{value}' = #{id}, attempt #{attempt}")
      zoteroPane = Zotero.getActiveZoteroPane()
      zoteroPane.show()
      continue if (yield zoteroPane.selectItem(id, true))

      selected = zoteroPane.getSelectedItems(true)
      debug('selected items = ', selected)
      return id if selected.length == 1 && id == selected[0]
      debug("select: expected #{id}, got #{selected}")
    throw new Error("failed to select " + id)
    return
  )

  pinCiteKey: co((itemID, action) ->
    switch action
      when 'pin', 'unpin'
        yield KeyManager.pin(itemID, action == 'pin')
      when 'refresh'
        yield KeyManager.refresh(itemID)
      else
        throw new Error("TestSupport.pinCiteKey: unsupported action #{action}")
    return
  )
