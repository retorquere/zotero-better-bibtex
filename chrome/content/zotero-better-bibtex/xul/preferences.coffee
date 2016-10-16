BetterBibTeXPref =
  paneLoad: ->

    Zotero_Preferences.openHelpLink = ((original) ->
      return ->
        helpTopic = document.getElementsByTagName("prefwindow")[0].currentPane.helpTopic
        if helpTopic == 'BetterBibTeX'
          id = document.getElementById('better-bibtex-prefs-tabbox').selectedPanel.id
          return unless id
          url = 'https://github.com/retorquere/zotero-better-bibtex/wiki/Configuration#' + id.replace('better-bibtex-prefs-', '')
          ### Just a temporary fix until https://github.com/zotero/zotero/issues/949 is fixed ###
          if Zotero.Prefs.get(['browser', 'preferences', 'instantApply'].join('.'), true)
            Zotero.getActiveZoteroPane().loadURI(url, { shiftKey: true, metaKey: true })
          else
            @openURL(url)
        else
          original.apply(@, arguments)
      )(Zotero_Preferences.openHelpLink)

    disabled = null
    tabs = document.getElementById('better-bibtex-prefs-tabs')
    for tab, i in tabs.getElementsByTagName('tab')
      tab.setAttribute('hidden', !(if tab.id == 'better-bibtex-prefs-disabled' then Zotero.BetterBibTeX.disabled else !Zotero.BetterBibTeX.disabled))
      disabled = i if tab.id == 'better-bibtex-prefs-disabled'

    if Zotero.BetterBibTeX.disabled
      document.getElementById('better-bibtex-prefs-tabpanels').selectedIndex = disabled
      document.getElementById('zotero-better-bibtex-disabled-message').value = Zotero.BetterBibTeX.disabled

    document.getElementById('better-bibtex-preferences-cache-stats').value = "#{Math.max(Zotero.BetterBibTeX.DB.cache.data.length, Zotero.BetterBibTeX.DB.serialized.data.length)} in cache"
    # document.getElementById('better-bibtex-preferences-zombies').setAttribute('label', "Purge zombies: #{JSON.stringify(Zotero.BetterBibTeX.DB.zombies())}")

    BetterBibTeXPref.savedPattern = Zotero.BetterBibTeX.Pref.get('citekeyFormat')
    BetterBibTeXPref.update()

    Zotero.BetterBibTeX.debug('prefs pane loaded:', document.location.hash)
    if document.location.hash == '#better-bibtex'
      ### runs into the 'TypeError: aId is undefined' problem for some reason. ###
      setTimeout((->
        document.getElementById('zotero-prefs').showPane(document.getElementById('zotero-prefpane-better-bibtex'))
      ), 500)

  saveCitekeyFormat: ->
    BetterBibTeXPref.savedPattern = Zotero.BetterBibTeX.Pref.get('citekeyFormat')

  checkCitekeyFormat: ->
    keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    try
      Zotero.BetterBibTeX.PatternParser.parse(keyformat.value)
    catch err
      if BetterBibTeXPref.savedPattern
        try
          Zotero.BetterBibTeX.PatternParser.parse(BetterBibTeXPref.savedPattern)
        catch
          BetterBibTeXPref.savedPattern = null

      if BetterBibTeXPref.savedPattern
        Zotero.BetterBibTeX.Pref.set('citekeyFormat', BetterBibTeXPref.savedPattern)
      else
        Zotero.BetterBibTeX.Pref.clear('citekeyFormat')

  paneUnload: ->
    try
      Zotero.BetterBibTeX.PatternParser.parse(Zotero.BetterBibTeX.Pref.get('citekeyFormat'))
    catch err
      Zotero.BetterBibTeX.Pref.set('citekeyFormat', BetterBibTeXPref.savedPattern)

  styleChanged: (index) ->
    stylebox = document.getElementById('better-bibtex-abbrev-style')
    selectedItem = if typeof index != 'undefined' then stylebox.getItemAtIndex(index) else stylebox.selectedItem
    styleID = selectedItem.getAttribute('value')
    Zotero.BetterBibTeX.Pref.set('autoAbbrevStyle', styleID)

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
    serverEnabled = !!serverCheckbox.checked
    serverCheckbox.setAttribute('hidden', Zotero.isStandalone && serverEnabled)

    for state in ['enabled', 'disabled']
      document.getElementById("better-bibtex-preferences-cacheActivity-#{state}").setAttribute('hidden', serverEnabled == (state == 'disabled'))

    keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')

    parseerror = null
    try
      Zotero.BetterBibTeX.PatternParser.parse(keyformat.value)
    catch err
      parseerror = err

    Zotero.BetterBibTeX.debug('parsing format', keyformat.value, ':', !parseerror, parseerror)
    keyformat.setAttribute('style', (if parseerror then '-moz-appearance: none !important; background-color: DarkOrange' else ''))
    keyformat.setAttribute('tooltiptext', '' + (parseerror || ''))

    document.getElementById('id-better-bibtex-preferences-pin-citekeys-on-change').setAttribute('disabled', not Zotero.BetterBibTeX.allowAutoPin())
    document.getElementById('id-better-bibtex-preferences-pin-citekeys-on-export').setAttribute('disabled', not Zotero.BetterBibTeX.allowAutoPin())
    document.getElementById('id-zotero-better-bibtex-server-warning').setAttribute('hidden', serverEnabled)

    styles = (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)

    stylebox = document.getElementById('better-bibtex-abbrev-style')
    refill = stylebox.children.length == 0
    selectedStyle = Zotero.BetterBibTeX.Pref.get('autoAbbrevStyle')
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
    Zotero.BetterBibTeX.cache.reset('user request')
    Zotero.BetterBibTeX.serialized.reset('user request')

BetterBibTeXAutoExportPref =
  remove: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport')
    Zotero.BetterBibTeX.DB.autoexport.remove(parseInt(id))
    @refresh()

  mark: ->
    exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = parseInt(exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport'))

    ae = Zotero.BetterBibTeX.DB.autoexport.get(id)
    if !ae
      Zotero.BetterBibTeX.debug('No autoexport', id)
      return

    try
      translation = Zotero.BetterBibTeX.auto.prepare(ae)
    catch err
      Zotero.BetterBibTeX.debug('failed to prepare', ae, err)
      return

    if !translation
      Zotero.BetterBibTeX.auto.mark(ae, 'done')
      return

    translation.setHandler('done', (obj, worked) ->
      Zotero.BetterBibTeX.auto.mark(ae, (if worked then 'done' else 'error'))
      Zotero.BetterBibTeX.auto.updated()
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

    for ae in Zotero.BetterBibTeX.DB.autoexport.chain().simplesort('path').data()
      Zotero.BetterBibTeX.debug('refresh:', {id: ae.$loki, status: ae.status})
      status = "#{ae.status} (#{ae.updated})"
      tree.treeitem({autoexport: "#{ae['$loki']}", '': ->
        @treerow(->
          @treecell({editable: 'false', label: "#{BetterBibTeXAutoExportPref.exportType(ae.collection)}: #{BetterBibTeXAutoExportPref.exportName(ae.collection)}"})
          @treecell({editable: 'false', label: status})
          @treecell({editable: 'false', label: ae.path})
          @treecell({editable: 'false', label: Zotero.BetterBibTeX.Translators.getName(ae.translatorID)})
          @treecell({editable: 'false', label: ae.exportCharset})
          @treecell({editable: 'false', label: '' + ae.useJournalAbbreviation})
          @treecell({editable: 'false', label: '' + ae.exportNotes})
        )
      })

class BetterBibTeXAutoExport extends Zotero.BetterBibTeX.XmlNode
  constructor: (@namespace, @root, @doc) ->
    super(@namespace, @root, @doc)

  Node: BetterBibTeXAutoExport

  BetterBibTeXAutoExport::alias(['treerow', 'treeitem', 'treecell', 'treechildren', 'listitem'])
