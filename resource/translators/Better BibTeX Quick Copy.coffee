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

  orgmode: ->
    while item = Translator.nextItem()
      m = item.uri.match(/\/(users|groups)\/([0-9]+|(local\/[^\/]+))\/items\/([A-Z0-9]{8})$/)
      type = m[1]
      libraryID = m[2]
      key = m[4]

      if type != 'users'
        Translator.debug("Zotero doesn't support getting the group ID inside a translator, sorry", item.uri, {libraryID, type, key})
        # Can change to zotero://select/library/items/report.html?itemKey=JHYDCRBD later
        continue

      Zotero.write("[[zotero://select/item/0_#{key}][@#{item.__citekey__}]]")

doExport = ->
  mode = Mode['' + Zotero.getOption('quickCopyMode')] || Mode[Zotero.getHiddenPref('better-bibtex.quickCopyMode')]
  if mode
    mode.call(null)
  else
    throw "Unsupported Quick Copy format '#{Zotero.getHiddenPref('better-bibtex.quickCopyMode')}'"
