Prefs = require('./preferences.coffee')
debug = require('./debug.coffee')

class Translators

  init: Zotero.Promise.coroutine(->
    start = new Date()
    Object.assign(@, require('../gen/translators.json'))

    debug('Translator.init: waiting for translators...')
    yield Zotero.Translators.init()
    debug('Translator.init: translators ready @', (new Date() - start))

    if Prefs.get('removeStock')
      @uninstall('BibLaTeX', 'b6e39b57-8942-4d11-8259-342c46ce395f')
      @uninstall('BibTeX', '9cb70025-a888-4a29-a210-93ec52da40d4')

    for id, header of @byId
      @install(header)
      debug('Translator.init: installed', header.label, '@', (new Date() - start))

    debug('Translator.init: reinit translators...')
    yield Zotero.Translators.reinit()
    debug('Translator.init: ready @', (new Date() - start))
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
    @uninstall(header.label, header.translatorID)

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
      if existing and destFile.equals(existing.file) and destFile.exists()
        msg = "Overwriting translator with same filename '#{fileName}'"
        debug(msg, header)
        Components.utils.reportError("#{msg} in Translators.install()")

      existing.file.remove(false) if existing and existing.file.exists()

      debug("Saving translator '#{header.label}'")

      Zotero.File.putContents(destFile, code)

      debug('Translator.install', header, 'succeeded')

    catch err
      debug('Translator.load', header, 'failed:', err)

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
        when 'library' then translation.setLibraryID(items)
        when 'items' then translation.setItems(items)
        # TODO: check whether Zotero.Collections.get is async
        when 'collection' then translation.setCollection(if typeof value == 'number' then Zotero.Collections.get(value) else value)

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
