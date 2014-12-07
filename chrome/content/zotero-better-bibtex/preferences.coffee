Zotero.BetterBibTeX.pref = {}

Zotero.BetterBibTeX.pref.prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.zotero.translators.better-bibtex.')

Zotero.BetterBibTeX.pref.observer =
  register: -> Zotero.BetterBibTeX.pref.prefs.addObserver('', this, false)
  unregister: -> Zotero.BetterBibTeX.pref.prefs.removeObserver('', this)
  observe: (subject, topic, data) ->
    if data == 'citeKeyFormat'
      Zotero.BetterBibTeX.DB.query('delete from keys where citeKeyFormat is not null and citeKeyFormat <> ?', [Zotero.BetterBibTeX.pref.get('citeKeyFormat')])
    return

Zotero.BetterBibTeX.pref.stash = ->
  @stashed = Object.create(null)
  keys = @prefs.getChildList('')
  Zotero.BetterBibTeX.log(":::stash prep:", keys)
  for key in keys
    @stashed[key] = @get(key)
  Zotero.BetterBibTeX.log(":::preferences stashed:", @stashed)
  return @stashed

Zotero.BetterBibTeX.pref.restore = ->
  Zotero.BetterBibTeX.log(":::restoring stashed preferences:", @stashed)
  for own key, value of @stashed ? {}
    @set(key, value)
  return

Zotero.BetterBibTeX.pref.serverURL = (collectionsView, extension) ->
  return if not collectionsView
  itemGroup = collectionsView._getItemAtRow(collectionsView.selection.currentIndex)
  return if not itemGroup

  try
    serverPort = Zotero.Prefs.get('httpServer.port')
  catch err
    return

  isLibrary = true
  for type of [ 'Collection', 'Search', 'Trash', 'Duplicates', 'Unfiled', 'Header', 'Bucket' ]
    if itemGroup['is' + type]()
      isLibrary = false
      break

  if itemGroup.isCollection()
    collection = collectionsView.getSelectedCollection()
    url = 'collection?/' + (collection.libraryID or 0) + '/' + collection.key + extension

  if isLibrary
    libid = collectionsView.getSelectedLibraryID()
    url = if libid then 'library?/' + libid + '/library' + extension else 'library?library' + extension
  if not url then return

  return "http://localhost:#{serverPort}/better-bibtex/#{url}"

Zotero.BetterBibTeX.pref.set = (key, value) ->
  Zotero.BetterBibTeX.log(":::pref #{key} = #{value}")
  return Zotero.Prefs.set("translators.better-bibtex.#{key}", value)

Zotero.BetterBibTeX.pref.get = (key) ->
  return Zotero.Prefs.get("translators.better-bibtex.#{key}")

Zotero.BetterBibTeX.pref.styleChanged = (index) ->
  listbox = document.getElementById('better-bibtex-abbrev-style')
  selectedItem = if index != 'undefined' then listbox.getItemAtIndex(index) else listbox.selectedItem
  styleID = selectedItem.getAttribute('value')
  Zotero.BetterBibTeX.pref.set('auto-abbrev.style', styleID)
  Zotero.BetterBibTeX.keymanager.journalAbbrevCache = Object.create(null)
  return

Zotero.BetterBibTeX.pref.update = (load) ->
  serverCheckbox = document.getElementById('id-better-bibtex-preferences-server-enabled')
  serverEnabled = serverCheckbox.checked
  serverCheckbox.setAttribute('hidden', Zotero.isStandalone && serverEnabled)

  keyformat = document.getElementById('id-better-bibtex-preferences-citeKeyFormat')

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
  document.getElementById('id-better-bibtex-preferences-fancyURLs-warning').setAttribute('hidden', not document.getElementById('id-better-bibtex-preferences-fancyURLs').checked)

  styles = Zotero.Styles.getVisible().filter((style) -> style.usesAbbreviation)

  listbox = document.getElementById('better-bibtex-abbrev-style')
  fillList = listbox.children.length is 0
  selectedStyle = Zotero.BetterBibTeX.pref.get('auto-abbrev.style')
  selectedIndex = -1
  for style, i in styles
    if fillList
      itemNode = document.createElement('listitem')
      itemNode.setAttribute('value', style.styleID)
      itemNode.setAttribute('label', style.title)
      listbox.appendChild(itemNode)
    if style.styleID is selectedStyle then selectedIndex = i
  if selectedIndex is -1 then selectedIndex = 0
  @styleChanged(selectedIndex)

  window.setTimeout((->
    listbox.ensureIndexIsVisible(selectedIndex)
    listbox.selectedIndex = selectedIndex
    return), 0)
  return
