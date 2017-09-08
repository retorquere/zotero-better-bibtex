debug = require('./debug.coffee')
zotero_config = require('./zotero-config.coffee')

Prefs = require('./prefs.coffee')
Formatter = require('./keymanager/formatter.coffee')
KeyManager = require('./keymanager.coffee')
XmlNode = require('./xmlnode.coffee')
AutoExport = require('./auto-export.coffee')
Translators = require('./translators.coffee')

class AutoExportPrefPane
  remove: ->
    return unless exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport')
    Autoexport.db.remove(id)
    @refresh()
    return

  mark: ->
    return unless exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = parseInt(exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport'))
    AutoExport.run(id)
    @refresh()
    return

  name: (ae, full) ->
    switch ae.type
      when 'library'
        name = Zotero.Libraries.getName(ae.id)
      when 'collection'
        if full
          name = @collectionPath(ae.id)
        else
          name = Zotero.Collections.get(ae.id)
    return name || ae.path

  collectionPath: (id) ->
    return '' unless id
    coll = Zotero.Collections.get(id)
    return '' unless coll

    return @collectionPath(coll.parent) + '/' + coll.name if coll.parent
    return coll.name

  refresh: ->
    return unless exportlist = document.getElementById('better-bibtex-auto-exports')
    while exportlist.firstChild
      exportlist.removeChild(exportlist.firstChild)

    tree = new XUL('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', exportlist, document)

    for ae in AutoExport.chain().simplesort('path').data()
      debug('refresh:', {id: ae.$loki, status: ae.status})
      tree.treeitem({autoexport: "#{ae.$loki}", '': ->
        return @treerow(->
          @treecell({editable: 'false', label: "#{ae.type}: #{AutoExportPref.name(ae.collection)}"})
          @treecell({editable: 'false', label: "#{ae.status} (#{ae.updated})" })
          @treecell({editable: 'false', label: ae.path})
          @treecell({editable: 'false', label: Translators.byId[ae.translatorID]?.label || '??'})
          @treecell({editable: 'false', label: '' + ae.useJournalAbbreviation})
          @treecell({editable: 'false', label: '' + ae.exportNotes})
          return
        )
      })
    return

class XUL extends XmlNode
  constructor: (@namespace, @root, @doc) ->
    super(@namespace, @root, @doc)

  Node: XUL

  XUL::alias(['treerow', 'treeitem', 'treecell', 'treechildren', 'listitem'])

class PrefPane
  load: ->
    debug('PrefPane.new: loading...')
    return if typeof Zotero_Preferences == 'undefined'

    @AutoExport = new AutoExportPrefPane()

    document.getElementById('better-bibtex-prefs-tab-journal-abbrev').setAttribute('hidden', !zotero_config.isJurisM)

    if !Zotero_Preferences.openHelpLink.BetterBibTeX
      Zotero_Preferences.openHelpLink.BetterBibTeX = Zotero_Preferences.openHelpLink
      Zotero_Preferences.openHelpLink = ->
        helpTopic = document.getElementsByTagName('prefwindow')[0].currentPane.helpTopic
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
          Zotero_Preferences.openHelpLink.BetterBibTeX.apply(@, arguments)
        return

    @getCitekeyFormat()
    @update()

    debug('PrefPane.new loaded @', document.location.hash)

    if document.location.hash == '#better-bibtex'
      ### TODO: runs into the 'TypeError: aId is undefined' problem for some reason. ###
      setTimeout((-> document.getElementById('zotero-prefs').showPane(document.getElementById('zotero-prefpane-better-bibtex'))), 500)
    debug('PrefPane.new: ready')
    return

  getCitekeyFormat: ->
    debug('PrefPane.getCitekeyFormat...')
    keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    keyformat.value = Prefs.get('citekeyFormat')
    debug('PrefPane.getCitekeyFormat got', keyformat.value)
    return

  checkCitekeyFormat: ->
    keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')

    msg = ''
    try
      Formatter.parsePattern(keyformat.value)
      msg = ''
    catch err
      msg = '' + err

    keyformat.setAttribute('style', (if msg then '-moz-appearance: none !important; background-color: DarkOrange' else ''))
    keyformat.setAttribute('tooltiptext', msg)
    return

  saveCitekeyFormat: ->
    keyformat = document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    try
      Formatter.parsePattern(keyformat.value)
      Prefs.set('citekeyFormat', keyformat.value)
    catch
      @getCitekeyFormat()
    return

  checkPostscript: ->
    postscript = document.getElementById('zotero-better-bibtex-postscript')

    error = false
    try
      new Function(postscript.value)
    catch err
      debug('PrefPane.checkPostscript: error compiling postscript:', err)
      error = '' + err

    postscript.setAttribute('style', (if error then '-moz-appearance: none !important; background-color: DarkOrange' else ''))
    postscript.setAttribute('tooltiptext', error || '')
    return

  styleChanged: (index) ->
    return unless zotero_config.isJurisM

    stylebox = document.getElementById('better-bibtex-abbrev-style')
    selectedItem = if typeof index != 'undefined' then stylebox.getItemAtIndex(index) else stylebox.selectedItem
    styleID = selectedItem.getAttribute('value')
    Prefs.set('autoAbbrevStyle', styleID)
    return

  # TODO: allow clean-scan?
  rescanCitekeys: Zotero.Promise.coroutine(->
    debug('starting manual key rescan')
    yield KeyManager.rescan()
    debug('manual key rescan done')
    return
  )

  display: (id, text) ->
    elt = document.getElementById(id)
    elt.value = text
    elt.setAttribute('tooltiptext', text) if text != ''
    return

  update: ->
    @checkCitekeyFormat()

    patternError = null
    try
      Formatter.parsePattern(keyformat.value)
    catch err
      patternError = err

    if zotero_config.isJurisM
      Zotero.Styles.init().then(=>
        styles = (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)
        debug('prefPane.update: found styles', styles)

        stylebox = document.getElementById('better-bibtex-abbrev-style')
        refill = stylebox.children.length == 0
        selectedStyle = Prefs.get('autoAbbrevStyle')
        selectedIndex = -1
        for style, i in styles
          if refill
            itemNode = document.createElement('listitem')
            itemNode.setAttribute('value', style.styleID)
            itemNode.setAttribute('label', style.title)
            stylebox.appendChild(itemNode)
          if style.styleID == selectedStyle then selectedIndex = i
        selectedIndex = 0 if selectedIndex == -1
        @styleChanged(selectedIndex)

        setTimeout((->
          stylebox.ensureIndexIsVisible(selectedIndex)
          stylebox.selectedIndex = selectedIndex
          return), 0)

        return
      )

    @AutoExport.refresh()

    return

  # TODO: caching
#  cacheReset: ->
#    @cache.reset('user request')
#    @serialized.reset('user request')

module.exports = new PrefPane()

window.addEventListener('load', (-> module.exports.load()), false)
