Prefs = require('./prefs.coffee')
debug = require('./debug.coffee')

class Translators

  init: Zotero.Promise.coroutine(->
    start = new Date()
    Object.assign(@, require('../gen/translators.json'))

    debug('Translator.init: waiting for translators...')
    yield Zotero.Schema.schemaUpdatePromise
    debug('Translator.init: translators ready @', (new Date() - start))

    if Prefs.get('removeStock')
      @uninstall('BibLaTeX', 'b6e39b57-8942-4d11-8259-342c46ce395f')
      @uninstall('BibTeX', '9cb70025-a888-4a29-a210-93ec52da40d4')

    for id, header of @byId
      @install(header)
      debug('Translator.init: installed', header.label, '@', (new Date() - start))

    debug('Translator.init: reinit translators...')
    try
      yield Zotero.Translators.reinit()
      debug('Translator.init: reinit ready @', (new Date() - start))
    catch err
      debug('Translator.init: reinit failed @', (new Date() - start), err)
    return
  )

  uninstall: (label, id) ->
    try
      fileName = Zotero.Translators.getFileNameFromLabel(label, id)
      destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)
      destFile.remove(false) if destFile.exists()
    catch err
      debug("failed to remove #{header.label}:", err)
    return

  install: (header) ->
    throw new Error('not a translator') unless header.label && header.translatorID

    try
      code = Zotero.File.getContentsFromURL("resource://zotero-better-bibtex/#{header.label}.js")
    catch err
      debug('Translator.install: ', header, 'could not be loaded:', err)
      throw err

    debug('Translator.load header:', header)
    try
      fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
      destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)

      existing = Zotero.Translators.get(header.translatorID)
      if existing
        if fileName != Zotero.Translators.getFileNameFromLabel(existing.label, existing.translatorID)
          msg = "Translator with ID #{header.translatorID} and label '#{header.label}' overwrites translator with label '#{existing.label}'"
          debug(msg)
          Components.utils.reportError("#{msg} in Translators.install()")

      debug("Saving translator", header.label)

      Zotero.File.putContents(destFile, code)

      debug('Translator.install', header, 'succeeded')

    catch err
      debug('Translator.load', header, 'failed:', err)
      @uninstall(header.label, header.translatorID)

    return

  translate: Zotero.Promise.coroutine((translatorID, displayOptions, items, path) ->
    items ||= {}
    translation = new Zotero.Promise((resolve, reject) ->
      translation = new Zotero.Translate.Export()

      todo = Object.keys(items)[0]
      items = items[todo]
      if ! items?
        todo = 'library'
        id = Zotero.Libraries.userLibraryID
      switch todo
        when 'library'
          translation.setLibraryID(items)
        when 'items'
          translation.setItems(items)
        when 'collection'
          translation.setCollection(if typeof items == 'number' then Zotero.Collections.get(items) else items)

      translation.setLibraryID(Zotero.Libraries.userLibraryID)
      translation.setTranslator(translatorID)
      translation.setDisplayOptions(displayOptions) if displayOptions && Object.keys(displayOptions).length != 0
      translation.setLocation(path) if path
      translation.setHandler('done', (obj, success) ->
        if success
          return resolve(obj?.string)
        else
          return reject('translation failed')
      )
      translation.translate()
      return
    )

    return yield translation
  )


module.exports = new Translators()
