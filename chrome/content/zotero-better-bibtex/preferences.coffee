BetterBibTeXPref =
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
      if BetterBibTeXPref.savedPattern
        try
          BetterBibTeXPatternParser.parse(BetterBibTeXPref.savedPattern)
        catch
          BetterBibTeXPref.savedPattern = null

      if BetterBibTeXPref.savedPattern
        Zotero.BetterBibTeX.pref.set('citekeyFormat', BetterBibTeXPref.savedPattern)
      else
        Zotero.BetterBibTeX.pref.clearUserPref('citekeyFormat')

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
    keyformat.setAttribute('style', (if parseerror then '-moz-appearance: none !important; background-color: DarkOrange' else ''))
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

  cacheReset: ->
    Zotero.BetterBibTeX.cache.reset()
    Zotero.BetterBibTeX.serialized.reset()

BetterBibTeXAutoExportPref =
  remove: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport')
    Zotero.DB.query('delete from betterbibtex.autoexport where id = ?', [id])
    @refresh()

  mark: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport')

    ae = Zotero.DB.rowQuery('select * from betterbibtex.autoexport ae where id = ?', [id])
    return unless ae
    try
      translation = Zotero.BetterBibTeX.auto.prepare(ae)
    catch
      return

    if !translation
      Zotero.DB.query('update betterbibtex.autoexport set status = ? where id = ?', [Zotero.BetterBibTeX.auto.status('done'), ae.id])
      return

    translation.setHandler('done', (obj, worked) ->
      status = Zotero.BetterBibTeX.auto.status((if worked then 'done' else 'error'))
      Zotero.BetterBibTeX.debug("auto.force: finished #{ae.id}: #{status}")
      Zotero.DB.query('update betterbibtex.autoexport set status = ? where id = ?', [status, ae.id])
      Zotero.BetterBibTeX.auto.refresh()
    )
    translation.translate()

  exportType: (id) ->
    return switch
      when id == '' then ''
      when id == 'library' then 'library'
      when m = /^(library|search|collection):[0-9]+$/.exec(id) then m[1]
      else id

  exportName: (id, full) ->
    try
      name = switch
        when id == '' then ''
        when id == 'library' then Zotero.Libraries.getName()
        when m = /^library:([0-9]+)$/.exec(id) then Zotero.Libraries.getName(m[1])
        when m = /^search:([0-9]+)$/.exec(id) then Zotero.Searches.get(m[1])?.name
        when m = /^collection:([0-9]+)$/.exec(id) then (if full then @collectionPath(m[1]) else Zotero.Collections.get(m[1])?.name)
      return name || id
    catch err
      return "not found: #{id}"

  collectionPath: (id) ->
    return '' unless id
    coll = Zotero.Collections.get(id)
    return '' unless coll

    return @collectionPath(coll.parent) + '/' + coll.name if coll.parent
    return coll.name

  refresh: ->
    exportlist = document.getElementById('better-bibtex-auto-exports')
    while exportlist.firstChild
      exportlist.removeChild(exportlist.firstChild)

    tree = new BetterBibTeXAutoExport('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', exportlist, document)

    for ae in Zotero.DB.query("select * from betterbibtex.autoexport order by path")
      ae.status = 'running' if Zotero.BetterBibTeX.auto.running == ae.id
      tree.treeitem({autoexport: "#{ae.id}", '': ->
        @treerow(->
          @treecell({editable: 'false', label: "#{BetterBibTeXAutoExportPref.exportType(ae.collection)}: #{BetterBibTeXAutoExportPref.exportName(ae.collection)}"})
          @treecell({editable: 'false', label: ae.status})
          @treecell({editable: 'false', label: ae.path})
          @treecell({editable: 'false', label: Zotero.BetterBibTeX.translatorName(ae.translatorID)})
          @treecell({editable: 'false', label: ae.exportCharset})
          @treecell({editable: 'false', label: ae.useJournalAbbreviation})
          @treecell({editable: 'false', label: ae.exportNotes})
        )
      })

class BetterBibTeXAutoExport extends Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    super(@namespace, @root, @doc)

  Node: BetterBibTeXAutoExport

  BetterBibTeXAutoExport::alias(['treerow', 'treeitem', 'treecell', 'treechildren', 'listitem'])
