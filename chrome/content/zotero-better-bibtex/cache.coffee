Zotero.BetterBibTeX.cache = new class
  constructor: ->
    @db = Zotero.BetterBibTeX.DB
    @stats = {
      hit: 0
      miss: 0
      clear: 0
    }

  integer: (v) ->
    return v if typeof v == 'number'
    _v = parseInt(v)
    throw new Error("#{v} is not an integer-string") if isNaN(_v)
    return _v

  verify: (entry) ->
    return entry unless Zotero.BetterBibTeX.Pref.get('debug') || Zotero.BetterBibTeX.testing

    verify = {itemID: 1, exportCharset: 'x', exportNotes: true, translatorID: 'x', useJournalAbbreviation: true }

    for own key, value of entry
      switch
        when key in ['$loki', 'meta'] then # ignore

        when verify[key] == undefined
          throw new Error("Unexpected field #{key} in #{typeof entry} #{JSON.stringify(entry)}")

        when verify[key] == null
          delete verify[key]

        when typeof verify[key] == 'string' && typeof value == 'string' && value.trim() != ''
          delete verify[key]

        when typeof verify[key] == 'number' && typeof value == 'number'
          delete verify[key]

        when typeof verify[key] == 'boolean' && typeof value == 'boolean'
          delete verify[key]

        else
          throw new Error("field #{key} of #{typeof entry} #{JSON.stringify(entry)} is unexpected #{typeof value} #{value}")

    verify = Object.keys(verify)
    return entry if verify.length == 0
    throw new Error("missing fields #{verify} in #{typeof entry} #{JSON.stringify(entry)}")

  remove: (what) ->
    @stats.clear++
    what.itemID = @integer(what.itemID) unless what.itemID == undefined
    @db.cache.removeWhere(what)

  reset: (reason) ->
    @db.cache.removeDataOnly()
    @stats = {
      hit: 0
      miss: 0
      clear: 0
    }

  record: (itemID, context) ->
    return @verify({
      itemID: @integer(itemID)
      exportCharset: (context.exportCharset || 'UTF-8').toUpperCase()
      exportNotes: !!context.exportNotes
      translatorID: context.translatorID
      useJournalAbbreviation: !!context.useJournalAbbreviation
    })

  clone: (obj) ->
    clone = JSON.parse(JSON.stringify(obj))
    delete clone.meta
    delete clone['$loki']
    return clone

  dump: (itemIDs) ->
    itemIDs = (parseInt(id) for id in itemIDs)
    cache = (@clone(cached) for cached in @db.cache.where((o) -> o.itemID in itemIDs))
    return cache

  fetch: (itemID, context) ->
    Zotero.BetterBibTeX.debug('cache.fetch:', {itemID, context})
    #return unless Zotero.BetterBibTeX.Pref.get('caching')

    ### file paths vary if exportFileData is on ###
    return if context.exportFileData

    cached = @db.cache.findOne({'$and': [
      { itemID: @integer(itemID) }
      { exportCharset: context.exportCharset }
      { exportNotes: context.exportNotes }
      { translatorID: context.translatorID }
      { useJournalAbbreviation: context.useJournalAbbreviation }
    ]})

    if cached
      @db.cacheAccess[cached.$loki] = Date.now()
      @stats.hit++
      Zotero.BetterBibTeX.debug('cache.fetch: hit')
    else
      @stats.miss++
      Zotero.BetterBibTeX.debug('cache.fetch: miss')

    return cached

  store: (itemID, context, citekey, bibtex, data) ->
    ### file paths vary if exportFileData is on ###
    if context.exportFileData
      return

    record = @record(itemID, context)
    cached = @db.cache.findObject(record)
    if cached
      cached.citekey = citekey
      cached.bibtex = bibtex
      cached.data = data
      cached.accessed = Date.now()
      @db.cache.update(cached)
    else
      record.citekey = citekey
      record.bibtex = bibtex
      record.data = data
      record.accessed = Date.now()
      @db.cache.insert(record)
