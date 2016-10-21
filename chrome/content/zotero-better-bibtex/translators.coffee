Zotero.BetterBibTeX.Translators =
  install: ->
    cleanup = {
      'LaTeX Citation': 'b4a5ab19-c3a2-42de-9961-07ae484b8cb0',
      'Pandoc Citation': '4c52eb69-e778-4a78-8ca2-4edf024a5074',
      'Pandoc JSON': 'f4b52ab0-f878-4556-85a0-c7aeedd09dfc',
      'Better CSL-JSON': 'f4b52ab0-f878-4556-85a0-c7aeedd09dfc',
      'BibTeX AUX Scanner': '0af8f14d-9af7-43d9-a016-3c5df3426c98'
      'BibTeX Citation Keys': '0a3d926d-467c-4162-acb6-45bded77edbb'
      'Zotero TestCase': '82512813-9edb-471c-aebc-eeaaf40c6cf9'
    }
    if Zotero.BetterBibTeX.Pref.get('removeStock')
      cleanup['BibLaTeX'] = 'b6e39b57-8942-4d11-8259-342c46ce395f'
      cleanup['BibTeX'] = '9cb70025-a888-4a29-a210-93ec52da40d4'

    for label, translatorID of cleanup
      try
        Zotero.BetterBibTeX.debug('Translators.install: removing', {label, translatorID})
        @remove({label, translatorID})
      catch err
        Zotero.BetterBibTeX.debug('Translators.install: removing', {label, translatorID}, ':', err)

    try
      switch Zotero.Prefs.get('extensions.zotero.export.quickCopy.setting')
        when 'export=b4a5ab19-c3a2-42de-9961-07ae484b8cb0'
          Zotero.Prefs.set('extensions.zotero.export.quickCopy.setting', 'export=9b85ff96-ceb3-4ca2-87a9-154c18ab38b1')
          Zotero.BetterBibTeX.Pref.set('quickCopyMode', 'latex')

        when 'export=4c52eb69-e778-4a78-8ca2-4edf024a5074'
          Zotero.Prefs.set('extensions.zotero.export.quickCopy.setting', 'export=9b85ff96-ceb3-4ca2-87a9-154c18ab38b1')
          Zotero.BetterBibTeX.Pref.set('quickCopyMode', 'pandoc')

    for translator in @all
      @load(translator)

    Zotero.Translators.init()

  uninstall: ->
    for translator in @all
      @remove(translator)
    Zotero.Translators.init()

  remove: (header) ->
    try
      fileName = Zotero.Translators.getFileNameFromLabel(header.label, header.translatorID)
      destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)
      destFile.remove(false) if destFile.exists()
    catch err
      Zotero.BetterBibTeX.debug("failed to remove #{header.label}:", err)

  translate: (translator, items, displayOptions, path) ->
    return Promise.reject('null translator') unless translator

    return new Promise((resolve, reject) ->
      try
        translation = new Zotero.Translate.Export()
        for key, value of items
          switch key
            when 'library' then translation.setLibraryID(value)
            when 'items' then translation.setItems(value)
            when 'collection' then translation.setCollection(if typeof value == 'number' then Zotero.Collections.get(value) else value)

        translation.setTranslator(translator)
        translation.setDisplayOptions(displayOptions) if displayOptions && Object.keys(displayOptions).length != 0
        translation.setLocation(path) if path

        translation.setHandler('done', (obj, success) -> if success then resolve(obj?.string) else reject('translation failed'))
        translation.translate()
      catch err
        Zotero.BetterBibTeX.debug('Translator.translate: error', err)
        reject(err)
    )

  load: (translator) ->
    throw new Error('not a translator') unless translator.label
    @remove(translator)

    try
      code = Zotero.BetterBibTeX.getContentsFromURL("resource://zotero-better-bibtex/translators/#{translator.label}.translator")
    catch err
      Zotero.BetterBibTeX.debug('Translator.load: ', translator, 'could not be loaded:', err)
      throw err
    code += "\n\n#{@postscript}" if translator.BetterBibTeX?.postscript

    Zotero.BetterBibTeX.debug('Translator.load header:', translator)
    try
      fileName = Zotero.Translators.getFileNameFromLabel(translator.label, translator.translatorID)
      destFile = Zotero.getTranslatorsDirectory()
      destFile.append(fileName)

      existing = Zotero.Translators.get(translator.translatorID)
      if existing and destFile.equals(existing.file) and destFile.exists()
        msg = "Overwriting translator with same filename '#{fileName}'"
        Zotero.BetterBibTeX.warn(msg, translator)
        Components.utils.reportError(msg + ' in Zotero.BetterBibTeX.load()')

      existing.file.remove(false) if existing and existing.file.exists()

      Zotero.BetterBibTeX.log("Saving translator '#{translator.label}'")

      Zotero.File.putContents(destFile, code)

      Zotero.BetterBibTeX.debug('Translator.load', translator, 'succeeded')

    catch err
      Zotero.BetterBibTeX.debug('Translator.load', translator, 'failed:', err)

  getID: (name) -> @[name.replace(/\s/g, '')]?.translatorID

  getName: (id) -> @[id]?.label || "translator:#{id}"

  postscript: """
    Translator.initialize = (function(original) {
      return function() {
        if (this.initialized) {
          return;
        }
        original.apply(this, arguments);
        try {
          return Reference.prototype.postscript = new Function(Translator.postscript);
        } catch (err) {
          return Translator.debug('postscript failed to compile:', err, Translator.postscript);
        }
      };
    })(Translator.initialize);
    """
