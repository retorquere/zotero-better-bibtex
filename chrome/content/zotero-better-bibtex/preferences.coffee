Zotero.BetterBibTeX.pref.serverURL = (extension) ->
  collectionsView = Zotero.getActiveZoteroPane()?.collectionsView
  itemGroup = collectionsView?._getItemAtRow(collectionsView.selection?.currentIndex)
  return unless itemGroup

  try
    serverPort = Zotero.Prefs.get('httpServer.port')
  catch err
    return

  isLibrary = true
  for type in [ 'Collection', 'Search', 'Trash', 'Duplicates', 'Unfiled', 'Header', 'Bucket' ]
    if itemGroup["is#{type}"]()
      isLibrary = false
      break

  if itemGroup.isCollection()
    collection = collectionsView.getSelectedCollection()
    url = "collection?/#{collection.libraryID or 0}/#{collection.key + extension}"

  if isLibrary
    libid = collectionsView.getSelectedLibraryID()
    url = if libid then "library?/#{libid}/library#{extension}" else "library?library#{extension}"
  if not url then return

  return "http://localhost:#{serverPort}/better-bibtex/#{url}"

Zotero.BetterBibTeX.pref.styleChanged = (index) ->
  stylebox = document.getElementById('better-bibtex-abbrev-style')
  selectedItem = if index != 'undefined' then stylebox.getItemAtIndex(index) else stylebox.selectedItem
  styleID = selectedItem.getAttribute('value')
  Zotero.BetterBibTeX.pref.set('autoAbbrevStyle', styleID)
  Zotero.BetterBibTeX.keymanager.journalAbbrevCache = Object.create(null)
  return

Zotero.BetterBibTeX.pref.clone = (obj) ->
  clone = Object.create(null)
  for own key, value of obj
    clone[key] = value
  return clone

Zotero.BetterBibTeX.pref.display = (id, text) ->
  elt = document.getElementById(id)
  elt.value = text
  elt.setAttribute('tooltiptext', text) if text != ''
  return

Zotero.BetterBibTeX.pref.collectionPath = (id) ->
  return '' unless id
  coll = Zotero.Collections.get(id)
  return '' unless coll

  return @collectionPath(coll.parent) + '/' + coll.name if coll.parent
  return coll.name

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
  refill = stylebox.children.length is 0
  selectedStyle = Zotero.BetterBibTeX.pref.get('autoAbbrevStyle')
  selectedIndex = -1
  for style, i in styles
    if refill
      itemNode = document.createElement('listitem')
      itemNode.setAttribute('value', style.styleID)
      itemNode.setAttribute('label', style.title)
      stylebox.appendChild(itemNode)
    if style.styleID is selectedStyle then selectedIndex = i
  selectedIndex = 0 if selectedIndex is -1
  Zotero.BetterBibTeX.pref.styleChanged(selectedIndex)

  window.setTimeout((->
    stylebox.ensureIndexIsVisible(selectedIndex)
    stylebox.selectedIndex = selectedIndex
    return), 0)

  exportlist = document.getElementById('better-bibtex-export-list')
  refill = (1 for node in exportlist.children when node.nodeName == 'listitem').length is 0
  Zotero.BetterBibTeX.log('loading exports:', refill, exportlist.children.length)

  selectedExport = -1
  for ae in Zotero.DB.query("select * from betterbibtex.autoexport order by path")
    selectedExport = 0
    Zotero.BetterBibTeX.log(':::ae', Zotero.BetterBibTeX.pref.clone(ae))
    if refill
      itemNode = document.createElement('listitem')
      itemNode.setAttribute('value', ae.id)
      itemNode.setAttribute('label', "#{Zotero.Collections.get(ae.collection)?.name || ae.collection} -> #{ae.path.replace(/^.*[\\\/]/, '')}")
      itemNode.setAttribute('class', "export-state-#{if Zotero.BetterBibTeX.auto.running == ae.id then 'running' else ae.status}")
      itemNode.setAttribute('tooltiptext', "#{@collectionPath(ae.collection)} -> #{ae.path}")
      exportlist.appendChild(itemNode)
  if selectedExport >= 0
    @autoexport.selected(selectedIndex)
  else
    document.getElementById('auto-export-remove').setAttribute('disabled', true)
    document.getElementById('auto-export-mark').setAttribute('disabled', true)

  ca = document.getElementById('id-better-bibtex-preferences-cache-activity')
  ca.value = if Zotero.BetterBibTeX.pref.get('caching') then "+#{Zotero.BetterBibTeX.cache.stats.hits || 0}/-#{Zotero.BetterBibTeX.cache.stats.misses || 0}" else '-'

  return

Zotero.BetterBibTeX.pref.autoexport =
  selected: (index) ->
    exportbox = document.getElementById('better-bibtex-export-list')
    selectedItem = if (typeof index) == 'undefined' then exportbox.selectedItem else exportbox.getItemAtIndex(index)

    document.getElementById('auto-export-remove').setAttribute('disabled', false)
    document.getElementById('auto-export-mark').setAttribute('disabled', false)

    ae = Zotero.DB.rowQuery('select * from betterbibtex.autoexport ae join betterbibtex.exportoptions eo on ae.exportoptions = eo.id where ae.id = ?', [selectedItem.getAttribute('value')])
    Zotero.BetterBibTeX.log(':::selected', Zotero.BetterBibTeX.pref.clone(ae))

    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-collection', "#{Zotero.Collections.get(ae.collection)?.name || ae.collection}")
    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-target', ae.path)
    Zotero.BetterBibTeX.pref.display('id-better-bibtex-preferences-auto-export-translator', Zotero.BetterBibTeX.translatorName(ae.translatorID))
    document.getElementById('id-better-bibtex-preferences-auto-export-auto-abbrev').checked = (ae.useJournalAbbreviation == 'true')
    document.getElementById('id-better-bibtex-preferences-auto-export-notes').checked = (ae.exportNotes == 'true')
    document.getElementById('id-better-bibtex-preferences-auto-export-preserve-bibvars').checked = (ae.preserveBibTeXVariables == 'true')
    return

  remove: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selectedItem = exportlist.selectedItem
    return unless selectedItem
    id = selectedItem.getAttribute('value')
    Zotero.DB.query('delete from betterbibtex.autoexport where id = ?', [id])
    exportlist.removeChild(node) for node in exportlist.children when node.nodeName == 'listitem'
    Zotero.BetterBibTeX.pref.update()
    return

  mark: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selectedItem = exportlist.selectedItem
    return unless selectedItem
    id = selectedItem.getAttribute('value')
    Zotero.DB.query("update betterbibtex.autoexport set status = 'pending' where id = ?", [id])
    selectedItem.setAttribute('class', "export-state-#{if Zotero.BetterBibTeX.auto.running == id then 'running' else 'pending'}")
    return
