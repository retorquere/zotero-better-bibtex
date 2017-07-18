Prefs = require('./preferences.coffee')
debug = require('./debug.coffee')
translators = require('../gen/translators.json')

class Translators
  init: Zotero.Promise.coroutine ->
    debug('Translator.init()')
    yield Zotero.Translators.init()

    if Prefs.get('removeStock')
      @uninstall('BibLaTeX', 'b6e39b57-8942-4d11-8259-342c46ce395f')
      @uninstall('BibTeX', '9cb70025-a888-4a29-a210-93ec52da40d4')

    for id, header of translators.byId
      @install(header)

    yield Zotero.Translators.reinit()
    debug('Translator.init() ready')
    return

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

module.exports = new Translators()
