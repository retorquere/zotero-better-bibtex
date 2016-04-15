Mode =
  latex: ->
    keys = []
    while item = Translator.nextItem()
      Translator.debug('item:', item)
      keys.push(item.__citekey__)

    cmd = "#{Zotero.getHiddenPref('better-bibtex.citeCommand')}".trim()
    if cmd == ''
      Zotero.write(keys.join(','))
    else
      Zotero.write("\\#{cmd}{#{keys.join(',')}}")

  pandoc: ->
    keys = []
    while item = Translator.nextItem()
      keys.push("@#{item.__citekey__}")
    Zotero.write(keys.join('; '))

  org: ->
    while item = Translator.nextItem()
      m = item.uri.match(/\/(users|groups)/([0-9]+|((local)\/[^\/]+))/items/([A-Z0-9]{8})$/)
      libraryID = m[2]
      local = m[4]
      key = m[5]

      if library != 'local'
        Translator.debug("Zotero doesn't support getting the group ID inside a translator, sorry")
        # Can change to zotero://select/library/items/report.html?itemKey=JHYDCRBD later
        next

      Zotero.write("[[zotero://select/item/0_#{key}][@#{item.__citekey__}]]")
    return

doExport = ->
  mode = Zotero.getHiddenPref('better-bibtex.quickCopyMode')
  if Mode[mode]
    Mode[mode].call(null)
  else
    throw "Unsupported Quick Copy format '#{mode}'"
