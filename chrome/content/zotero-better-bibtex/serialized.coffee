Components.utils.import("resource://zotero/config.js")

Zotero.BetterBibTeX.serialized =
  items: {}

  load: ->
    try
      serialized = Zotero.BetterBibTeX.createFile('serialized-items.json')
      if serialized.exists()
        @items = JSON.parse(Zotero.File.getContents(serialized))
        Zotero.BetterBibTeX.debug("serialized.load: #{Object.keys(@items).length} items")
      else
        @items = {}
    catch e
      Zotero.BetterBibTeX.debug("serialized.load failed: #{e}")
      @items = {}

    if @items.Zotero != ZOTERO_CONFIG.VERSION || Zotero.BetterBibTeX.version(@items.BetterBibTeX) != Zotero.BetterBibTeX.version(Zotero.BetterBibTeX.release)
      @reset()
    @items.Zotero = ZOTERO_CONFIG.VERSION
    @items.BetterBibTeX = Zotero.BetterBibTeX.release

  remove: (itemID) ->
    delete @items[parseInt(itemID)]

  reset: ->
    Zotero.BetterBibTeX.debug("serialized.reset")
    @items = {}

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
        itemID = parseInt(item)
        item = null

      # Zotero object
      when item.getField
        itemID = parseInt(item.itemID)

      # cached miss
      when item.itemType == 'cache-miss'
        return null

      # assume serialized object passed
      when item.itemType
        return item

      else
        itemID = parseInt(item.itemID)
        item = null

    # we may be called as a method on itemGetter
    items = Zotero.BetterBibTeX.serialized.items

    if !items[itemID]
      Zotero.BetterBibTeX.debug('serialized.get: cache miss, getting item:', !!item)
      item ||= Zotero.Items.get(itemID)

      # TODO: force legacy format to true until I switch over
      items[itemID] = (if item.isAttachment() then @_attachmentToArray(item) else Zotero.Utilities.Internal.itemToExportFormat(item, true)) if item

      switch
        # the serialization yielded no object (why?), mark it as missing so we don't do this again
        when !items[itemID]
          items[itemID] = {itemType: 'cache-miss'}

        when items[itemID].itemType in ['note', 'attachment']
          items[itemID].attachmentIDs = []

        else
          items[itemID].attachmentIDs = item.getAttachments()

    Zotero.BetterBibTeX.debug('serialized.get:', items[itemID].itemType)
    return null if items[itemID].itemType == 'cache-miss'
    return items[itemID]

  save: ->
    try
      serialized = Zotero.BetterBibTeX.createFile('serialized-items.json')
      serialized.remove(false) if serialized.exists()
      Zotero.File.putContents(serialized, JSON.stringify(@items))
    catch e
      Zotero.BetterBibTeX.debug("serialized.save failed: #{e}")

  _attachmentToArray: Zotero.Translate.ItemGetter::_attachmentToArray
