Zotero.BetterBibTeX.pref.serverURL = (extension) ->
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

Zotero.BetterBibTeX.pref.styleChanged = (index) ->
  stylebox = document.getElementById('better-bibtex-abbrev-style')
  selectedItem = if typeof index != 'undefined' then stylebox.getItemAtIndex(index) else stylebox.selectedItem
  styleID = selectedItem.getAttribute('value')
  Zotero.BetterBibTeX.pref.set('autoAbbrevStyle', styleID)

Zotero.BetterBibTeX.pref.clone = (obj) ->
  clone = Object.create(null)
  for own key, value of obj
    clone[key] = value
  return clone

Zotero.BetterBibTeX.pref.display = (id, text) ->
  elt = document.getElementById(id)
  elt.value = text
  elt.setAttribute('tooltiptext', text) if text != ''

Zotero.BetterBibTeX.pref.update = ->
  return unless Zotero.BetterBibTeX.initialized # ?!?!

  serverCheckbox = document.getElementById('id-better-bibtex-preferences-server-enabled')
  serverEnabled = serverCheckbox.checked
  serverCheckbox.setAttribute('hidden', Zotero.isStandalone && serverEnabled)

  keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')

  try
    Zotero.BetterBibTeX.formatter(keyformat.value)
    keyformat.setAttribute('style', '')
    keyformat.setAttribute('tooltiptext', '')
  catch err
    keyformat.setAttribute('style', 'color: red')
    keyformat.setAttribute('tooltiptext', '' + err)

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
  Zotero.BetterBibTeX.pref.styleChanged(selectedIndex)

  # oh FFS AMO!
  amoShim = ->
    stylebox.ensureIndexIsVisible(selectedIndex)
    stylebox.selectedIndex = selectedIndex
  window.setTimeout(amoShim, 0)

  @autoexport.refresh()

Zotero.BetterBibTeX.pref.autoexport =
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

    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-status', ae.status)
    name = switch
      when ae.collection == '' then ''
      when ae.collection == 'library' then Zotero.Libraries.getName() || ae.collection
      when m = /^library:([0-9]+)$/.exec(ae.collection) then Zotero.Libraries.getName(m[1]) || ae.collection
      else @collectionPath(ae.collection) || "collection:#{ae.collection}"
    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-collection', name)
    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-target', ae.path)
    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-translator', Zotero.BetterBibTeX.translatorName(ae.translatorID))
    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-charset', Zotero.BetterBibTeX.translatorName(ae.exportCharset))
    document.getElementById('id-better-bibtex-preferences-auto-export-auto-abbrev').checked = (ae.useJournalAbbreviation == 'true')
    document.getElementById('id-better-bibtex-preferences-auto-export-notes').checked = (ae.exportNotes == 'true')
    document.getElementById('id-better-bibtex-preferences-auto-export-preserve-bibvars').checked = (ae.preserveBibTeXVariables == 'true')

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

        name = switch
          when ae.collection == 'library' then Zotero.Libraries.getName() || ae.collection
          when m = /^library:([0-9]+)$/.exec(ae.collection) then Zotero.Libraries.getName(m[1]) || ae.collection
          else Zotero.Collections.get(ae.collection)?.name || "collection:#{ae.collection}"

        itemNode.setAttribute('label', "#{name} -> #{ae.path.replace(/^.*[\\\/]/, '')}")
        itemNode.setAttribute('class', "export-state-#{if Zotero.BetterBibTeX.auto.running == ae.id then 'running' else ae.status}")
        itemNode.setAttribute('tooltiptext', "#{@collectionPath(ae.collection)} -> #{ae.path}")
        exportlist.appendChild(itemNode)

    @selected()

    #ca = document.getElementById('id-better-bibtex-preferences-cache-activity')
    #ca.value = if Zotero.BetterBibTeX.pref.get('caching') then "+#{Zotero.BetterBibTeX.cache.stats.hits || 0}/-#{Zotero.BetterBibTeX.cache.stats.misses || 0}" else '-'
