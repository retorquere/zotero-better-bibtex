Zotero.BetterBibTeX.auto = new class
  constructor: ->
    @db = Zotero.BetterBibTeX.DB
    @search = {}
    @idle = false

  mark: (ae, status) ->
    Zotero.BetterBibTeX.debug('mark:', {ae, status})
    ae.updated = (new Date()).toLocaleString()
    ae.status = status
    @db.autoexport.update(ae)

  markSearch: (id) ->
    search = Zotero.Searches.get(id)
    return false unless search

    items = (parseInt(itemID) for itemID in search.search())
    items.sort()
    return if items == @search[parseInt(search.id)]

    @search[parseInt(search.id)] = items

    ae = @db.autoexport.findObject({collection: "search:#{id}"})
    @mark(ae, 'pending') if ae

  refresh: ->
    wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
    enumerator = wm.getEnumerator('zotero:pref')
    if enumerator.hasMoreElements()
      win = enumerator.getNext()
      win.BetterBibTeXAutoExportPref.refresh(true)

  add: (collection, path, context) ->
    Zotero.BetterBibTeX.debug("auto-export set up for #{collection} to #{path}")

    # aren't unique constraints being enforced?
    @db.autoexport.removeWhere({path})

    @db.autoexport.insert({
      collection
      path
      translatorID: context.translatorID
      exportCharset: (context.exportCharset || 'UTF-8').toUpperCase()
      exportNotes: !!context.exportNotes
      useJournalAbbreviation: !!context.useJournalAbbreviation
      exportedRecursively: @recursive()
      status: 'done'
    })
    @refresh()

  recursive: ->
    try
      return Zotero.Prefs.get('recursiveCollections')
    return false

  clear: ->
    @db.autoexport.removeDataOnly()
    @refresh()

  reset: ->
    for ae in @db.autoexport.chain().data()
      @mark(ae, 'pending')
    @refresh()

  prepare: (ae) ->
    Zotero.BetterBibTeX.debug('auto.prepare: candidate', ae)
    path = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile)
    path.initWithPath(ae.path)

    if !(path.exists() && path.isFile() && path.isWritable())
      @mark(ae, 'error')
      msg = "auto.prepare: candidate path '#{path.path}' exists but is not writable"
      Zotero.BetterBibTeX.debug(msg)
      throw new Error(msg)

    if !(path.parent.exists() && path.parent.isDirectory() && path.isWritable())
      @mark(ae, 'error')
      msg = "auto.prepare: parent of candidate path '#{path.path}' exists but is not writable"
      Zotero.BetterBibTeX.debug(msg)
      throw new Error(msg)

    switch
      when ae.collection == 'library'
        items = {library: null}

      when m = /^search:([0-9]+)$/.exec(ae.collection)
        # assumes that a markSearch will have executed the search and found the items
        items = {items: @search[parseInt(m[1])] || []}
        if items.items.length == 0
          Zotero.BetterBibTeX.debug('auto.process: empty search')
          return null
        else
          items.items = Zotero.Items.get(items.items)

      when m = /^library:([0-9]+)$/.exec(ae.collection)
        items = {library: parseInt(m[1])}

      when m = /^collection:([0-9]+)$/.exec(ae.collection)
        items = {collection: parseInt(m[1])}

      else #??
        Zotero.BetterBibTeX.debug('auto.process: unexpected collection id ', ae.collection)
        return null

    return null if items.items && items.items.length == 0

    translation = new Zotero.Translate.Export()

    for own k, v of items
      switch k
        when 'items'
          Zotero.BetterBibTeX.debug('preparing auto-export from', items.length, 'items')
          translation.setItems(items.items)
        when 'collection'
          Zotero.BetterBibTeX.debug('preparing auto-export from collection', items.collection)
          translation.setCollection(Zotero.Collections.get(items.collection))
        when 'library'
          Zotero.BetterBibTeX.debug('preparing auto-export from library', items.library)
          translation.setLibraryID(items.library)

    translation.setLocation(path)
    translation.setTranslator(ae.translatorID)

    translation.setDisplayOptions({
      exportCharset: ae.exportCharset
      exportNotes: ae.exportNotes
      useJournalAbbreviation: ae.useJournalAbbreviation
    })

    return translation

  process: (reason) ->
    Zotero.BetterBibTeX.debug("auto.process: started (#{reason}), idle: #{@idle}")

    if @running
      Zotero.BetterBibTeX.debug('auto.process: export already running')
      return

    switch Zotero.BetterBibTeX.pref.get('autoExport')
      when 'off'
        Zotero.BetterBibTeX.debug('auto.process: off')
        return
      when 'idle'
        if !@idle
          Zotero.BetterBibTeX.debug('auto.process: not idle')
          return

    skip = {error: [], done: []}
    translation = null

    for ae in @db.autoexport.findObjects({status: 'pending'})
      break if translation
      try
        translation = @prepare(ae)
      catch err
        Zotero.BetterBibTeX.debug('auto.process:', err)
        continue

      if !translation
        @mark(ae, 'done')

    if translation
      @running = '' + ae.id
    else
      Zotero.BetterBibTeX.debug('auto.process: no pending jobs')
      return

    Zotero.BetterBibTeX.debug('auto.process: starting', ae)
    @refresh()

    translation.setHandler('done', (obj, worked) =>
      status = Zotero.BetterBibTeX.auto.status((if worked then 'done' else 'error'))
      Zotero.BetterBibTeX.debug("auto.process: finished #{Zotero.BetterBibTeX.auto.running}: #{status}")
      @mark(ae, status)
      Zotero.BetterBibTeX.auto.running = null
      Zotero.BetterBibTeX.auto.refresh()
      Zotero.BetterBibTeX.auto.process(reason)
    )
    translation.translate()
