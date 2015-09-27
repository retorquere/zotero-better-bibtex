Components.utils.import("resource://zotero/config.js")

Zotero.BetterBibTeX.serialized = new class
  lokiAdapter:
    saveDatabase: (name, serialized, callback) ->
      try
        store = Zotero.BetterBibTeX.createFile('serialized-items.json')
        store.remove(false) if store.exists()
        Zotero.File.putContents(store, serialized)
      catch e
        Zotero.BetterBibTeX.debug("serialized.saveDatabase failed: #{e}")
      callback(true)

    loadDatabase: (name, callback) ->
      data = null
      try
        serialized = Zotero.BetterBibTeX.createFile('serialized-items.json')
        data = Zotero.File.getContents(serialized) if serialized.exists()
      catch e
        Zotero.BetterBibTeX.debug("serialized.loadDatabase failed: #{e}")
        data = null
      callback(data)

  fixup: (item, itemID) ->
    Zotero.BetterBibTeX.debug('trying to fix:', item) if !item.itemID

    item.itemID ?= itemID
    item.itemID = parseInt(item.itemID)

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
    @db = new loki('serialized', {adapter: @lokiAdapter, env: 'BROWSER'})
    @reset()

  reset: ->
    Zotero.BetterBibTeX.debug('serialized.reset')
    @db.removeCollection('metadata')
    @db.removeCollection('serialized')
    @cache = @db.addCollection('serialized', { indices: ['itemID', 'uri'] })

  save: ->
    @db.removeCollection('metadata')
    metadata = @db.addCollection('metadata')
    metadata.insert({Zotero: ZOTERO_CONFIG.VERSION, BetterBibTeX: Zotero.BetterBibTeX.release})
    @db.save()

  load: ->
    try
      @db.loadDatabase()
    catch e
      Zotero.BetterBibTeX.debug("serialized.loadDatabase failed: #{e}")
      @reset()
      return

    metadata = @db.getCollection('metadata')
    @cache = @db.getCollection('serialized')

    switch
      when !@cache
        Zotero.BetterBibTeX.debug('serialized.load: no cache collection')

      when !metadata
        Zotero.BetterBibTeX.debug('serialized.load: no metadata')

      when metadata.data[0].Zotero != ZOTERO_CONFIG.VERSION
        Zotero.BetterBibTeX.debug('serialized.load: serialized data found for', {Zotero: metadata.data[0].Zotero}, 'expected', {Zotero: ZOTERO_CONFIG.VERSION})

      when metadata.data[0].BetterBibTeX != Zotero.BetterBibTeX.release
        Zotero.BetterBibTeX.debug('serialized.load: serialized data found for', {BetterBibTeX: metadata.data[0].BetterBibTeX}, 'expected', {BetterBibTeX: Zotero.BetterBibTeX.release})

      else
        Zotero.BetterBibTeX.debug('serialized.load: loaded', @cache.data.length, 'items')
        return

    @reset()

  remove: (itemID) ->
    item = @cache.findOne({itemID: parseInt(itemID)})
    @cache.remove(item) if item

  get: (zoteroItem) ->
    Zotero.BetterBibTeX.debug('serialized.get:', zoteroItem)

    # we may be passed a serialized item
    return zoteroItem if zoteroItem.itemType && zoteroItem.itemID && zoteroItem.uri

    itemID = parseInt(zoteroItem.id || zoteroItem.itemID)
    item = @cache.findOne({itemID})

    if !item
      Zotero.BetterBibTeX.debug('serialize:', {itemID, isAttachment: typeof zoteroItem.isAttachment, zoteroItem})
      zoteroItem = Zotero.Items.get(itemID) unless typeof zoteroItem.isAttachment == 'function'

      if zoteroItem.isAttachment()
        item = Zotero.Translate.ItemGetter::_attachmentToArray(zoteroItem)
      else
        item = Zotero.Utilities.Internal.itemToExportFormat(zoteroItem)

      switch
        when !item
          item = {itemID, itemType: 'cache-miss'}

        when item.itemType in ['note', 'attachment']
          item.attachmentIDs = []

        else
          @fixup(item, itemID)
          item.attachmentIDs = zoteroItem.getAttachments() || []

      @cache.insert(item)

    return null if item.itemType == 'cache-miss'
    item.attachments = (@get({itemID: id}) for id in item.attachmentIDs) unless item.itemType in ['note', 'attachment']
    return JSON.parse(JSON.stringify(item))
