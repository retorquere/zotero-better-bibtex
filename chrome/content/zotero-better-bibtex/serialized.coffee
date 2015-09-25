Components.utils.import("resource://zotero/config.js")

Zotero.BetterBibTeX.serialized = new class
  fixup: (item, itemID) ->
    Zotero.BetterBibTeX.debug('trying to fix:', item) if !item.itemID

    item.itemID = itemID || Zotero.URI.getURIItem(item.uri)?.id if !item.itemID && item.uri
    item.itemID = parseInt(item.itemID) if item.itemID

    return item

  constructor: ->
    @db = new loki('serialized', {adapter: @, env: 'BROWSER'})
    @reset()

  reset: ->
    @db.removeCollection('metadata')
    @db.removeCollection('serialized')
    @cache = @db.addCollection('serialized', { indices: ['itemID', 'uri'] })

  save: ->
    @db.removeCollection('metadata')
    metadata = @db.addCollection('metadata')
    metadata.insert({Zotero: ZOTERO_CONFIG.VERSION, BetterBibTeX: Zotero.BetterBibTeX.release})
    @db.save()

  saveDatabase: (name, serialized) ->
    try
      store = Zotero.BetterBibTeX.createFile('serialized-items.json')
      store.remove(false) if store.exists()
      Zotero.File.putContents(store, serialized)
    catch e
      Zotero.BetterBibTeX.debug("serialized.saveDatabase failed: #{e}")

  load: ->
    try
      @db.loadDatabase()
    catch e
      Zotero.BetterBibTeX.debug("serialized.loadDatabase failed: #{e}")
      @reset()
      return

    metadata = @db.getCollection('metadata')
    return if metadata?.data[0]?.Zotero == ZOTERO_CONFIG.VERSION && metadata.data[0].BetterBibTeX == Zotero.BetterBibTeX.release
    @reset()

  loadDatabase: (name) ->
    try
      serialized = Zotero.BetterBibTeX.createFile('serialized-items.json')
      return '' unless serialized.exists()
      return Zotero.File.getContents(serialized)
    catch e
      Zotero.BetterBibTeX.debug("serialized.loadDatabase failed: #{e}")

  remove: (itemID) ->
    item = @cache.findOne({itemID: parseInt(itemID)})
    @cache.remove(item) if item

  get: (item, options = {}) ->
    Zotero.BetterBibTeX.debug('serialized.get:', item, options)

    # no serialization for attachments when their data is exported
    if options.exportFileData && (options.attachmentID || item.isAttachment())
      Zotero.BetterBibTeX.debug('serialized.get: attachment + exportFileData')
      item = Zotero.Items.get(item) if options.attachmentID
      return null unless item
      return @_attachmentToArray(item)

    switch
      # attachment ID
      when options.attachmentID
        query = {itemID: parseInt(item)}
        item = null

      # Zotero object
      when item.getField
        query = {itemID: parseInt(item.id)}

      # cached miss
      when item.itemType == 'cache-miss'
        return null

      # assume fixed-up serialized object passed
      when item.itemType && item.itemID && item.uri
        return item

      else
        switch
          when item.itemID
            query = {itemID: parseInt(item.itemID)}
          when item.uri
            query = {uri: item.uri}
          else
            throw new Error('cannot construct query from ' + JSON.stringify(item))
        item = null

    # we may be called as a method on itemGetter
    cache = Zotero.BetterBibTeX.serialized.cache

    cached = cache.findOne(query)
    Zotero.BetterBibTeX.debug('serialized.get:', {query, cached})
    if !cached
      Zotero.BetterBibTeX.debug('serialized.get: cache miss, getting item:', {query, item: !!item})
      item = switch
        when item         then  item
        when query.itemID then  Zotero.Items.get(query.itemID)
        when query.uri    then  Zotero.URI.this.getURIItem(query.uri)
        else                    throw new error('Cannot get object from query ' + JSON.stringify(query))

      if item
        if item.isAttachment()
          cached = @_attachmentToArray(item)
        else
          cached = Zotero.Utilities.Internal.itemToExportFormat(item)

      cached = Zotero.BetterBibTeX.serialized.fixup(cached, item.id) if cached

      switch
        # the serialization yielded no object (why?), mark it as missing so we don't do this again
        when !cached
          cached = {itemType: 'cache-miss'}

        when cached.itemType in ['note', 'attachment']
          cached.attachmentIDs = []

        else
          cached.attachmentIDs = item.getAttachments()
      cache.insert(cached)

    Zotero.BetterBibTeX.debug('serialized.get:', cached.itemType)
    return null if cached.itemType == 'cache-miss'
    return cached

  _attachmentToArray: Zotero.Translate.ItemGetter::_attachmentToArray
