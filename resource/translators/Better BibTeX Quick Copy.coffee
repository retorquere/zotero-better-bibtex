Mode =
  gitbook: ->
    citations = []
    while item = Translator.nextItem()
      citations.push("{{ \"#{item.__citekey__}\" | cite }}")
    Zotero.write(citations.join(''))

  atom: ->
    keys = []
    while item = Translator.nextItem()
      Translator.debug('item:', item)
      keys.push(item.__citekey__)
    if keys.length == 1
      Zotero.write("[](#@#{keys[0]})")
    else
      Zotero.write("[](?@#{keys.join(',')})")

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

  citekeys: ->
    keys = []
    while item = Translator.nextItem()
      keys.push(item.__citekey__)
    Zotero.write(keys.join(','))

  pandoc: ->
    keys = []
    while item = Translator.nextItem()
      keys.push("@#{item.__citekey__}")
    Zotero.write(keys.join('; '))

  orgmode: ->
    while item = Translator.nextItem()
      m = item.uri.match(/\/(users|groups)\/([0-9]+|(local\/[^\/]+))\/items\/([A-Z0-9]{8})$/)
      throw "Malformed item uri #{item.uri}" unless m

      type = m[1]
      groupID = m[2]
      key = m[4]

      switch type
        when 'users'
          Translator.debug("Link to synced item #{item.uri}") unless groupID.indexOf('local') == 0
          id = "0_#{key}"
        when 'groups'
          throw "Missing groupID in #{item.uri}" unless groupID
          id = "#{groupID}~#{key}"

      Zotero.write("[[zotero://select/items/#{id}][@#{item.__citekey__}]]")

doExport = ->
  mode = Mode['' + Zotero.getOption('quickCopyMode')] || Mode[Zotero.getHiddenPref('better-bibtex.quickCopyMode')]
  if mode
    mode.call(null)
  else
    throw "Unsupported Quick Copy format '#{Zotero.getHiddenPref('better-bibtex.quickCopyMode')}'"
