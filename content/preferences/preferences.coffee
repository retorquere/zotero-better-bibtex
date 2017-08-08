Prefs = require('../preferences.coffee')
debug = require('../debug.coffee')
parsePattern = require('../keymanager/formatter.coffee')::parsePattern
zotero_config = require('../zotero-config.coffee')
KeyManager = require('../keymanager.coffee')

class PrefPane
  # AutoExport: require('./auto-export.coffee')

  constructor: (@global) ->
    debug('PrefPane.new: loading...')
    return if typeof @global.Zotero_Preferences == 'undefined'

    @global.document.getElementById('better-bibtex-prefs-tab-journal-abbrev').setAttribute('hidden', !zotero_config.isJurisM)

    if !@global.Zotero_Preferences.openHelpLink.BetterBibTeX
      @global.Zotero_Preferences.openHelpLink.BetterBibTeX = @global.Zotero_Preferences.openHelpLink
      @global.Zotero_Preferences.openHelpLink = ->
        helpTopic = @global.document.getElementsByTagName('prefwindow')[0].currentPane.helpTopic
        if helpTopic == 'BetterBibTeX'
          id = @global.document.getElementById('better-bibtex-prefs-tabbox').selectedPanel.id
          return unless id
          url = 'https://github.com/retorquere/zotero-better-bibtex/wiki/Configuration#' + id.replace('better-bibtex-prefs-', '')
          ### Just a temporary fix until https://github.com/zotero/zotero/issues/949 is fixed ###
          if Zotero.Prefs.get(['browser', 'preferences', 'instantApply'].join('.'), true)
            Zotero.getActiveZoteroPane().loadURI(url, { shiftKey: true, metaKey: true })
          else
            @openURL(url)
        else
          @global.Zotero_Preferences.openHelpLink.BetterBibTeX.apply(@, arguments)
        return

    @getCitekeyFormat()
    @update()

    debug('PrefPane.new loaded @', @global.document.location.hash)

    if @global.document.location.hash == '#better-bibtex'
      ### TODO: runs into the 'TypeError: aId is undefined' problem for some reason. ###
      setTimeout((-> @global.document.getElementById('zotero-prefs').showPane(@global.document.getElementById('zotero-prefpane-better-bibtex'))), 500)
    debug('PrefPane.new: ready')

  getCitekeyFormat: ->
    debug('PrefPane.getCitekeyFormat...')
    keyformat = @global.document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    keyformat.value = Prefs.get('citekeyFormat')
    debug('PrefPane.getCitekeyFormat got', keyformat.value)
    return

  checkCitekeyFormat: ->
    keyformat = @global.document.getElementById('id-better-bibtex-preferences-citekeyFormat')

    msg = ''
    try
      parsePattern(keyformat.value)
      msg = ''
    catch err
      msg = '' + err

    keyformat.setAttribute('style', (if msg then '-moz-appearance: none !important; background-color: DarkOrange' else ''))
    keyformat.setAttribute('tooltiptext', msg)
    return

  saveCitekeyFormat: ->
    keyformat = @global.document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    try
      parsePattern(keyformat.value)
      Prefs.set('citekeyFormat', keyformat.value)
    catch
      @getCitekeyFormat()
    return

  checkPostscript: ->
    postscript = @global.document.getElementById('zotero-better-bibtex-postscript')

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

    stylebox = @global.document.getElementById('better-bibtex-abbrev-style')
    selectedItem = if typeof index != 'undefined' then stylebox.getItemAtIndex(index) else stylebox.selectedItem
    styleID = selectedItem.getAttribute('value')
    Prefs.set('autoAbbrevStyle', styleID)
    return

  rescanCitekeys: Zotero.Promise.coroutine(->
    debug('starting manual key rescan')
    yield KeyManager.rescan()
    debug('manual key rescan done')
    return
  )

  display: (id, text) ->
    elt = @global.document.getElementById(id)
    elt.value = text
    elt.setAttribute('tooltiptext', text) if text != ''
    return

  update: ->
    @checkCitekeyFormat()

    patternError = null
    try
      parsePattern(keyformat.value)
    catch err
      patternError = err

    if zotero_config.isJurisM
      Zotero.Styles.init().then(=>
        styles = (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)
        debug('prefPane.update: found styles', styles)

        stylebox = @global.document.getElementById('better-bibtex-abbrev-style')
        refill = stylebox.children.length == 0
        selectedStyle = Prefs.get('autoAbbrevStyle')
        selectedIndex = -1
        for style, i in styles
          if refill
            itemNode = @global.document.createElement('listitem')
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

    # TODO: @AutoExport.refresh()

    return

  # TODO: caching
#  cacheReset: ->
#    @cache.reset('user request')
#    @serialized.reset('user request')

module.exports = PrefPane
