Zotero.BetterBibTeX.auto = new class
  constructor: ->
    @db = Zotero.BetterBibTeX.DB
    @search = {}
    @idle = false

    for ae in @db.autoexport.data
      if ae.status == 'running'
        ae.status = 'pending'
        @db.autoexport.update(ae)

  mark: (ae, status, reason) ->
    Zotero.BetterBibTeX.debug('auto.mark:', {ae, status})
    ae.updated = (new Date()).toLocaleString()
    ae.status = status
    @db.autoexport.update(ae)

    @schedule(reason || 'no reason provided') if status == 'pending'

  markSearch: (id, reason) ->
    search = Zotero.Searches.get(id)
    return false unless search

    items = (parseInt(itemID) for itemID in search.search())
    items.sort()
    return if items == @search[parseInt(search.id)]

    @search[parseInt(search.id)] = items

    ae = @db.autoexport.findObject({collection: "search:#{id}"})
    @mark(ae, 'pending', reason) if ae

  updated: ->
    wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator)
    enumerator = wm.getEnumerator('zotero:pref')
    if enumerator.hasMoreElements()
      win = enumerator.getNext()
      win.BetterBibTeXAutoExportPref.refresh(true)

  add: (collection, path, context) ->
    Zotero.BetterBibTeX.debug("auto.add: auto-export set up for #{collection} to #{path}")

    @db.autoexport.removeWhere({path})

    @db.autoexport.insert({
      collection
      path
      translatorID: context.translatorID
      exportCharset: (context.exportCharset || 'UTF-8').toUpperCase()
      exportNotes: !!context.exportNotes
      useJournalAbbreviation: !!context.useJournalAbbreviation
      status: 'done'
      updated: (new Date()).toLocaleString()
    })
    @updated()
    @db.save('main')

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
      @markSearch(ae.collection.replace('search:', ''), "#{reason}, assume search might be updated")

    if collections.length > 0
      Zotero.BetterBibTeX.debug('auto.markIDs:', collections, 'from', (o.collection for o in @db.autoexport.data))
      for ae in @db.autoexport.where((o) -> o.collection in collections)
        @mark(ae, 'pending', reason)

  withParentCollections: (collections) ->
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

  clear: ->
    @db.autoexport.removeDataOnly()
    @updated()

  reset: ->
    for ae in @db.autoexport.data
      @mark(ae, 'pending', 'reset')
    @updated()

  prepare: (ae) ->
    Zotero.BetterBibTeX.debug('auto.prepare: candidate', ae)
    path = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile)
    path.initWithPath(ae.path)

    if path.exists() && (!path.isFile() || !path.isWritable())
      Zotero.BetterBibTeX.flash("Auto-Export: candidate path '#{ae.path}' exists but is not writable")
      return null

    if path.parent.exists() && !path.parent.isWritable()
      Zotero.BetterBibTeX.flash("Auto-Export: parent of candidate path '#{ae.path}' exists but is not writable")
      return null

    if !path.parent.exists()
      Zotero.BetterBibTeX.flash("Auto-Export: parent of candidate path '#{ae.path}' does not exist")
      return null

    switch
      when ae.collection == 'library'
        items = {library: null}

      when m = /^search:([0-9]+)$/.exec(ae.collection)
        ### assumes that a markSearch will have executed the search and found the items ###
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
        Zotero.BetterBibTeX.flash("Auto-Export: unexpected collection id #{ae.collection}")
        return null

    return Zotero.BetterBibTeX.Translators.translate(ae.translatorID, items, { exportCharset: ae.exportCharset, exportNotes: ae.exportNotes, useJournalAbbreviation: ae.useJournalAbbreviation }, path)

  schedule: (reason) ->
    Zotero.BetterBibTeX.debug('auto.schedule:', reason)
    clearTimeout(@scheduled) if @scheduled
    @scheduled = setTimeout(->
      Zotero.BetterBibTeX.auto.scheduled = null
      Zotero.BetterBibTeX.auto.process(reason)
    , 1000)

  process: (reason) ->
    Zotero.BetterBibTeX.debug("auto.process: started (#{reason}), idle: #{@idle}")

    unless Zotero.BetterBibTeX.initialized
      Zotero.BetterBibTeX.debug('auto.process: Better BibTeX is not yet initialized')
      return

    if @running
      Zotero.BetterBibTeX.debug('auto.process: export already running')
      return

    switch Zotero.BetterBibTeX.Pref.get('autoExport')
      when 'off'
        Zotero.BetterBibTeX.debug('auto.process: off')
        return
      when 'idle'
        if !@idle
          Zotero.BetterBibTeX.debug('auto.process: not idle')
          return

    skip = {error: [], done: []}

    translate = null
    for ae in @db.autoexport.findObjects({status: 'pending'})
      break if translate = @prepare(ae)
      @mark(ae, 'error')

    @run(ae, translate, reason)

  run: (ae, translate, reason) ->
    if !translate
      Zotero.BetterBibTeX.debug('auto.process: no pending jobs')
      return

    @running = '' + ae.$loki
    Zotero.BetterBibTeX.debug('auto.run: starting', ae)
    @mark(ae, 'running')
    @updated()

    translate.then(=>
      # if it's been re-marked during the run, let that handle the mark if any
      @mark(ae, 'done') if @db.autoexport.get(ae.$loki).status == 'running'
      Zotero.BetterBibTeX.debug("auto.run: finished #{@running}: done")
      return Promise.resolve()
    ).catch(=>
      # if it's been re-marked during the run, let that handle the mark if any
      @mark(ae, 'error') if @db.autoexport.get(ae.$loki).status == 'running'
      Zotero.BetterBibTeX.debug("auto.run: finished #{@running}: error")
      return Promise.resolve()
    ).then(=>
      @running = null
      @updated()
      @process(reason)
      return null
    )
