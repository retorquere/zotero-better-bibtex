Components.utils.import("resource://zotero/config.js")

Zotero.BetterBibTeX.serialized = new class
  itemToExportFormat: (zoteroItem) ->
    item = Zotero.Utilities.Internal.itemToExportFormat(zoteroItem)
    item.itemID = parseInt(zoteroItem.id)

    switch item.itemType
      when 'artwork'
        item.medium ?= item.artworkMedium
      when 'audioRecording'
        item.medium ?= item.audioRecordingFormat
        item.publisher ?= item.label
      when 'bill'
        item.number ?= item.billNumber
        item.pages ?= item.codePages
        item.volume ?= item.codeVolume
      when 'blogPost'
        item.publicationTitle ?= item.blogTitle
        item.type ?= item.websiteType
      when 'bookSection'
        item.publicationTitle ?= item.bookTitle
      when 'case'
        item.date ?= item.dateDecided
        item.number ?= item.docketNumber
        item.pages ?= item.firstPage
        item.title ?= item.caseName
        item.volume ?= item.reporterVolume
      when 'computerProgram'
        item.publisher ?= item.company
      when 'conferencePaper'
        item.publicationTitle ?= item.proceedingsTitle
      when 'dictionaryEntry'
        item.publicationTitle ?= item.dictionaryTitle
      when 'email'
        item.title ?= item.subject
      when 'encyclopediaArticle'
        item.publicationTitle ?= item.encyclopediaTitle
      when 'film'
        item.medium ?= item.videoRecordingFormat
        item.publisher ?= item.distributor
        item.type ?= item.genre
      when 'forumPost'
        item.publicationTitle ?= item.forumTitle
        item.type ?= item.postType
      when 'hearing'
        item.number ?= item.documentNumber
      when 'interview'
        item.medium ?= item.interviewMedium
      when 'letter'
        item.type ?= item.letterType
      when 'manuscript'
        item.type ?= item.manuscriptType
      when 'map'
        item.type ?= item.mapType
      when 'patent'
        item.date ?= item.issueDate
        item.number ?= item.patentNumber
      when 'podcast'
        item.medium ?= item.audioFileType
        item.number ?= item.episodeNumber
      when 'presentation'
        item.type ?= item.presentationType
      when 'radioBroadcast'
        item.medium ?= item.audioRecordingFormat
        item.number ?= item.episodeNumber
        item.publicationTitle ?= item.programTitle
        item.publisher ?= item.network
      when 'report'
        item.number ?= item.reportNumber
        item.publisher ?= item.institution
        item.type ?= item.reportType
      when 'statute'
        item.date ?= item.dateEnacted
        item.number ?= item.publicLawNumber
        item.title ?= item.nameOfAct
      when 'thesis'
        item.publisher ?= item.university
        item.type ?= item.thesisType
      when 'tvBroadcast'
        item.medium ?= item.videoRecordingFormat
        item.number ?= item.episodeNumber
        item.publicationTitle ?= item.programTitle
        item.publisher ?= item.network
      when 'videoRecording'
        item.medium ?= item.videoRecordingFormat
        item.publisher ?= item.studio
      when 'webpage'
        item.publicationTitle ?= item.websiteTitle
        item.type ?= item.websiteType

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
      store = Zotero.BetterBibTeX.createFile('serialized.json')
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
      serialized = Zotero.BetterBibTeX.createFile('serialized.json')
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
          cached = Zotero.BetterBibTeX.serialized.itemToExportFormat(item)

      switch
        # the serialization yielded no object (why?), mark it as missing so we don't do this again
        when !cached
          cached = {itemType: 'cache-miss'}

        when cached.itemType in ['note', 'attachment']
          cached.attachmentIDs = []

        else
          cached.attachmentIDs = item.getAttachments()
      cache.insert(cached)

    Zotero.BetterBibTeX.debug('serialized.get:', cached)
    return null if cached.itemType == 'cache-miss'
    return cached

  _attachmentToArray: Zotero.Translate.ItemGetter::_attachmentToArray
