BetterBibTeXPref =
  serverURL: (extension) ->
    collectionsView = Zotero.getActiveZoteroPane()?.collectionsView
    itemGroup = collectionsView?._getItemAtRow(collectionsView.selection?.currentIndex)
    return unless itemGroup

    try
      serverPort = Zotero.Prefs.get('httpServer.port')
    catch err
      return

    if itemGroup.isCollection()
      collection = collectionsView.getSelectedCollection()
      url = "collection?/#{collection.libraryID or 0}/#{collection.key + extension}"

    if itemGroup.isLibrary(true)
      libid = collectionsView.getSelectedLibraryID()
      url = if libid then "library?/#{libid}/library#{extension}" else "library?library#{extension}"
    if not url then return

    return "http://localhost:#{serverPort}/better-bibtex/#{url}"

  paneLoad: ->
    Zotero.BetterBibTeX.debug('preferences.paneLoad:', Zotero.BetterBibTeX.disabled)
    disabled = null
    tabs = document.getElementById('better-bibtex-prefs-tabs')
    for tab, i in tabs.getElementsByTagName('tab')
      tab.setAttribute('hidden', !(if tab.id == 'better-bibtex-prefs-disabled' then Zotero.BetterBibTeX.disabled else !Zotero.BetterBibTeX.disabled))
      disabled = i if tab.id == 'better-bibtex-prefs-disabled'

    if Zotero.BetterBibTeX.disabled
      document.getElementById('better-bibtex-prefs-tabpanels').selectedIndex = disabled
      document.getElementById('zotero-better-bibtex-disabled-message').value = Zotero.BetterBibTeX.disabled

    BetterBibTeXPref.savedPattern = Zotero.BetterBibTeX.pref.get('citekeyFormat')
    BetterBibTeXPref.update()

  saveCitekeyFormat: ->
    BetterBibTeXPref.savedPattern = Zotero.BetterBibTeX.pref.get('citekeyFormat')

  checkCitekeyFormat: ->
    keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    try
      BetterBibTeXPatternParser.parse(keyformat.value)
    catch err
      Zotero.BetterBibTeX.pref.set('citekeyFormat', BetterBibTeXPref.savedPattern || '[auth][year]')

  paneUnload: ->
    try
      BetterBibTeXPatternParser.parse(Zotero.BetterBibTeX.pref.get('citekeyFormat'))
    catch err
      Zotero.BetterBibTeX.pref.set('citekeyFormat', BetterBibTeXPref.savedPattern)

  styleChanged: (index) ->
    stylebox = document.getElementById('better-bibtex-abbrev-style')
    selectedItem = if typeof index != 'undefined' then stylebox.getItemAtIndex(index) else stylebox.selectedItem
    styleID = selectedItem.getAttribute('value')
    Zotero.BetterBibTeX.pref.set('autoAbbrevStyle', styleID)

  clone: (obj) ->
    clone = Object.create(null)
    for own key, value of obj
      clone[key] = value
    return clone

  display: (id, text) ->
    elt = document.getElementById(id)
    elt.value = text
    elt.setAttribute('tooltiptext', text) if text != ''

  update: ->
    serverCheckbox = document.getElementById('id-better-bibtex-preferences-server-enabled')
    serverEnabled = serverCheckbox.checked
    serverCheckbox.setAttribute('hidden', Zotero.isStandalone && serverEnabled)

    keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')

    parseerror = null
    try
      BetterBibTeXPatternParser.parse(keyformat.value)
    catch err
      parseerror = err

    Zotero.BetterBibTeX.debug('parsing format', keyformat.value, ':', !!parseerror)
    keyformat.setAttribute('style', (if parseerror then 'color: red' else ''))
    keyformat.setAttribute('tooltiptext', '' + (parseerror || ''))

    document.getElementById('id-better-bibtex-preferences-pin-citekeys-on-change').setAttribute('disabled', not Zotero.BetterBibTeX.allowAutoPin())
    document.getElementById('id-better-bibtex-preferences-pin-citekeys-on-export').setAttribute('disabled', not Zotero.BetterBibTeX.allowAutoPin())
    document.getElementById('id-zotero-better-bibtex-server-warning').setAttribute('hidden', serverEnabled)
    document.getElementById('id-zotero-better-bibtex-recursive-warning').setAttribute('hidden', not document.getElementById('id-better-bibtex-preferences-getCollections').checked)

    styles = (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)

    stylebox = document.getElementById('better-bibtex-abbrev-style')
    refill = stylebox.children.length == 0
    selectedStyle = Zotero.BetterBibTeX.pref.get('autoAbbrevStyle')
    selectedIndex = -1
    for style, i in styles
      if refill
        itemNode = document.createElement('listitem')
        itemNode.setAttribute('value', style.styleID)
        itemNode.setAttribute('label', style.title)
        stylebox.appendChild(itemNode)
      if style.styleID == selectedStyle then selectedIndex = i
    selectedIndex = 0 if selectedIndex == -1
    BetterBibTeXPref.styleChanged(selectedIndex)

    window.setTimeout((->
      stylebox.ensureIndexIsVisible(selectedIndex)
      stylebox.selectedIndex = selectedIndex
      return), 0)

    BetterBibTeXAutoExportPref.refresh()

BetterBibTeXAutoExportPref =
  selected: (index) ->
    Zotero.BetterBibTeX.debug('pref.autoexport.selected:', index)
    exportbox = document.getElementById('better-bibtex-export-list')
    selectedItem = if (typeof index) == 'undefined' then exportbox.selectedItem else exportbox.getItemAtIndex(index)

    document.getElementById('auto-export-remove').setAttribute('disabled', !selectedItem)
    document.getElementById('auto-export-mark').setAttribute('disabled', !selectedItem)

    if selectedItem
      ae = Zotero.DB.rowQuery('select * from betterbibtex.autoexport where id = ?', [selectedItem.getAttribute('value')])
    ae ||= {status: '', collection: '', path: '', translatorID: '', exportCharset: '', useJournalAbbreviation: false, exportNotes: false, preserveBibTeXVariables: false }
    Zotero.BetterBibTeX.debug('pref.autoexport.selected =', ae)

    BetterBibTeXPref.display('id-better-bibtex-preferences-auto-export-status', ae.status)
    BetterBibTeXPref.display('id-better-bibtex-preferences-auto-export-collection', "#{@exportType(ae.collection)}: #{@exportName(ae.collection)}")
    BetterBibTeXPref.display('id-better-bibtex-preferences-auto-export-target', ae.path)
    BetterBibTeXPref.display('id-better-bibtex-preferences-auto-export-translator', Zotero.BetterBibTeX.translatorName(ae.translatorID))
    BetterBibTeXPref.display('id-better-bibtex-preferences-auto-export-charset', Zotero.BetterBibTeX.translatorName(ae.exportCharset))
    document.getElementById('id-better-bibtex-preferences-auto-export-auto-abbrev').checked = (ae.useJournalAbbreviation == 'true')
    document.getElementById('id-better-bibtex-preferences-auto-export-notes').checked = (ae.exportNotes == 'true')
    return

  remove: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selectedItem = exportlist.selectedItem
    return unless selectedItem
    id = selectedItem.getAttribute('value')
    Zotero.DB.query('delete from betterbibtex.autoexport where id = ?', [id])
    @refresh(true)

  mark: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selectedItem = exportlist.selectedItem
    return unless selectedItem
    id = selectedItem.getAttribute('value')
    Zotero.DB.query("update betterbibtex.autoexport set status = 'pending' where id = ?", [id])
    selectedItem.setAttribute('class', "export-state-#{if Zotero.BetterBibTeX.auto.running == id then 'running' else 'pending'}")
    @selected()

  exportType: (id) ->
    return switch
      when id == '' then ''
      when id == 'library' then 'library'
      when m = /^library:([0-9]+)$/.exec(id) then 'library'
      when m = /^search:([0-9]+)$/.exec(id) then 'search'
      else 'collection'

  exportName: (id, full) ->
    name = switch
      when id == '' then ''
      when id == 'library' then Zotero.Libraries.getName()
      when m = /^library:([0-9]+)$/.exec(id) then Zotero.Libraries.getName(m[1])
      when m = /^search:([0-9]+)$/.exec(id) then Zotero.Searches.get(m[1])?.name
      when full then @collectionPath(id)
      else Zotero.Collections.get(id)?.name
    return name || id

  collectionPath: (id) ->
    return '' unless id
    coll = Zotero.Collections.get(id)
    return '' unless coll

    return @collectionPath(coll.parent) + '/' + coll.name if coll.parent
    return coll.name

  refresh: (refill) ->
    exportlist = document.getElementById('better-bibtex-export-list')
    refill ||= ((1 for node in exportlist.children when node.nodeName == 'listitem').length == 0)
    Zotero.BetterBibTeX.debug("pref.autoexport.refresh: refill=#{!!refill}")

    if refill
      exportlist.removeChild(node) for node in exportlist.children when node.nodeName == 'listitem'

      for ae in Zotero.DB.query("select * from betterbibtex.autoexport order by path")
        Zotero.BetterBibTeX.debug('pref.autoexport.refresh: refill', Zotero.BetterBibTeX.log.object(ae))
        itemNode = document.createElement('listitem')
        itemNode.setAttribute('value', ae.id)

        itemNode.setAttribute('label', "#{@exportName(ae.collection)} -> #{ae.path.replace(/^.*[\\\/]/, '')}")
        itemNode.setAttribute('class', "export-state-#{if Zotero.BetterBibTeX.auto.running == ae.id then 'running' else ae.status}")
        itemNode.setAttribute('tooltiptext', "#{@exportType(ae.collection)}: #{@exportName(ae.collection, true)} -> #{ae.path}")
        exportlist.appendChild(itemNode)

    @selected()

    #ca = document.getElementById('id-better-bibtex-preferences-cache-activity')
    #ca.value = if Zotero.BetterBibTeX.pref.get('caching') then "+#{Zotero.BetterBibTeX.cache.stats.hits || 0}/-#{Zotero.BetterBibTeX.cache.stats.misses || 0}" else '-'
