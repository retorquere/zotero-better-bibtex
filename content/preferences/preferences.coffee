Prefs = require('../preferences.coffee')
debug = require('../debug.coffee')
parsePattern = require('../keymanager/formatter.coffee')::parsePattern

class PrefPane
  # AutoExport: require('./auto-export.coffee')

  onLoad: (@global) ->
    return if typeof @global.Zotero_Preferences == 'undefined'

    if !@openHelpLink
      @openHelpLink = @global.Zotero_Preferences.openHelpLink
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
          @openHelpLink.apply(@, arguments)
        return

    @savedPattern = Prefs.get('citekeyFormat')
    @saveCitekeyFormat()
    @update()

    debug('prefs pane loaded:', @global.document.location.hash)
    if @global.document.location.hash == '#better-bibtex'
      ### TODO: runs into the 'TypeError: aId is undefined' problem for some reason. ###
      setTimeout((-> @global.document.getElementById('zotero-prefs').showPane(@global.document.getElementById('zotero-prefpane-better-bibtex'))), 500)
    return

  onUnload: ->
    try
      parsePattern(Prefs.get('citekeyFormat'))
      return
    catch err
      debug('error parsing pattern', Prefs.get('citekeyFormat'), err)

    if @savedPattern
      try
        parsePattern(@savedPattern)
        Prefs.set('citekeyFormat', @savedPattern)
        return
      catch err
        debug('error parsing saved pattern', @savedPattern, err)

    Prefs.clear('citekeyFormat')
    return

  saveCitekeyFormat: -> @savedPattern = Prefs.get('citekeyFormat')

  checkCitekeyFormat: ->
    keyformat = @global.document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    try
      parsePattern(keyformat.value)
      @savedPattern = keyformat.value
    catch err
      if @savedPattern
        try
          parsePattern(@savedPattern)
        catch
          @savedPattern = null

      if @savedPattern
        Prefs.set('citekeyFormat', @savedPattern)
      else
        Prefs.clear('citekeyFormat')
    return

  checkPostscript: ->
    postscript = @global.document.getElementById('zotero-better-bibtex-postscript')

    error = false
    try
      new Function(postscript.value)
    catch err
      debug('error compiling postscript:', err)
      error = '' + err

    postscript.setAttribute('style', (if error then '-moz-appearance: none !important; background-color: DarkOrange' else ''))
    postscript.setAttribute('tooltiptext', error || '')
    return

  styleChanged: (index) ->
    stylebox = @global.document.getElementById('better-bibtex-abbrev-style')
    selectedItem = if typeof index != 'undefined' then stylebox.getItemAtIndex(index) else stylebox.selectedItem
    styleID = selectedItem.getAttribute('value')
    Prefs.set('autoAbbrevStyle', styleID)
    return

  display: (id, text) ->
    elt = @global.document.getElementById(id)
    elt.value = text
    elt.setAttribute('tooltiptext', text) if text != ''
    return

  update: ->
    keyformat = @global.document.getElementById('id-better-bibtex-preferences-citekeyFormat')
    debug('loading preference pane: update', {
      keyformat: if keyformat? then typeof keyformat else 'null',
      value: if keyformat then typeof keyformat.value else 'keyformat not found'
    })

    patternError = null
    try
      parsePattern(keyformat.value)
    catch err
      patternError = err

    debug('parsed pattern', keyformat.value, ':', !patternError, patternError)
    keyformat.setAttribute('style', (if patternError then '-moz-appearance: none !important; background-color: DarkOrange' else ''))
    keyformat.setAttribute('tooltiptext', '' + (patternError || ''))

    Zotero.Styles.init().then(=>
      styles = (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)
      debug('prefPane: found styles', styles)

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

      @global.window.setTimeout((->
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

module.exports = new PrefPane()
