Zotero.BetterBibTeX.auto = new class
  constructor: ->
    @db = Zotero.BetterBibTeX.DB
    @search = {}
    @idle = false

  mark: (ae, status, options = {}) ->
    Zotero.BetterBibTeX.debug('mark:', {ae, status})
    ae.updated = (new Date()).toLocaleString()
    ae.status = status
    @db.autoexport.update(ae)

    @process(options.reason || 'no reason provided') if status == 'pending' && !options.defer

  markSearch: (id, options) ->
    search = Zotero.Searches.get(id)
    return false unless search

    items = (parseInt(itemID) for itemID in search.search())
    items.sort()
    return if items == @search[parseInt(search.id)]

    @search[parseInt(search.id)] = items

    ae = @db.autoexport.findObject({collection: "search:#{id}"})
    @mark(ae, 'pending', options) if ae

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

  markIDs: (ids, reason) ->
    collections = Zotero.Collections.getCollectionsContainingItems(ids, true) || []
    collections = @withParentCollections(collections) unless collections.length == 0
    collections = ("collection:#{id}" for id in collections)
    for libraryID in Zotero.DB.columnQuery("select distinct libraryID from items where itemID in #{@db.SQLite.Set(ids)}")
      if libraryID
        collections.push("library:#{libraryID}")
      else
        collections.push('library')

    for ae in @db.autoexport.where((o) -> o.collection.indexOf('search:') == 0)
      @markSearch(ae.collection.replace('search:', ''), {defer: true, reason: "#{reason}, assume search might be updated"})

    if collections.length > 0
      Zotero.BetterBibTeX.debug('marking:', collections)
      for ae in @db.autoexport.where((o) -> o.collection in collections)
        @mark(ae, 'pending', {defer: true, reason})

    @process(reason)

  withParentCollections: (collections) ->
    return collections unless @recursive()
    return collections if collections.length == 0

    return Zotero.DB.columnQuery("
      with recursive recursivecollections as (
        select collectionID, parentCollectionID
        from collections
        where collectionID in #{Zotero.BetterBibTeX.DB.SQLite.Set(collections)}

        union all

        select p.collectionID, p.parentCollectionID
        from collections p
        join recursivecollections as c on c.parentCollectionID = p.collectionID
      ) select distinct collectionID from recursivecollections")

  recursive: ->
    try
      return Zotero.Prefs.get('recursiveCollections')
    return false

  clear: ->
    @db.autoexport.removeDataOnly()
    @refresh()

  reset: ->
    for ae in @db.autoexport.chain().data()
      @mark(ae, 'pending', {defer: true, reason: 'reset'})
    @refresh()
    @process('reset')

  prepare: (ae) ->
    Zotero.BetterBibTeX.debug('auto.prepare: candidate', ae)
    path = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile)
    path.initWithPath(ae.path)

    if path.exists() && !(path.isFile() && path.isWritable())
      msg = "auto.prepare: candidate path '#{ae.path}' exists but is not writable"
      Zotero.BetterBibTeX.debug(msg)
      @mark(ae, 'error')
      throw new Error(msg)

    if !(path.parent.exists() && path.parent.isDirectory() && path.parent.isWritable())
      msg = "auto.prepare: parent of candidate path '#{ae.path}' exists but is not writable"
      Zotero.BetterBibTeX.debug(msg)
      @mark(ae, 'error')
      throw new Error(msg)

    switch
      when ae.collection == 'library'
        items = {library: null}

      when m = /^search:([0-9]+)$/.exec(ae.collection)
        # assumes that a markSearch will have executed the search and found the items
        items = {items: @search[parseInt(m[1])] || []}
        if items.items.length == 0
          Zotero.BetterBibTeX.debug('auto.prepare: empty search')
          return null
        else
          items.items = Zotero.Items.get(items.items)

      when m = /^library:([0-9]+)$/.exec(ae.collection)
        items = {library: parseInt(m[1])}

      when m = /^collection:([0-9]+)$/.exec(ae.collection)
        items = {collection: parseInt(m[1])}

      else #??
        Zotero.BetterBibTeX.debug('auto.prepare: unexpected collection id ', ae.collection)
        return null

    if items.items && items.items.length == 0
      Zotero.BetterBibTeX.debug('auto.prepare: candidate ', ae.path, ' has no items')
      return null

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
      try
        translation = @prepare(ae)
      catch err
        Zotero.BetterBibTeX.debug('auto.process:', err)
        continue

      if !translation
        @mark(ae, 'done')
      else
        break

    if translation
      @running = '' + ae.$loki
    else
      Zotero.BetterBibTeX.debug('auto.process: no pending jobs')
      return

    Zotero.BetterBibTeX.debug('auto.process: starting', ae)
    @refresh()

    translation.setHandler('done', (obj, worked) =>
      status = (if worked then 'done' else 'error')
      Zotero.BetterBibTeX.debug("auto.process: finished #{Zotero.BetterBibTeX.auto.running}: #{status}")
      @mark(ae, status)
      Zotero.BetterBibTeX.auto.running = null
      Zotero.BetterBibTeX.auto.refresh()
      Zotero.BetterBibTeX.auto.process(reason)
    )
    translation.translate()
