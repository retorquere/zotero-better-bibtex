Components.utils.import("resource://zotero/config.js")

Zotero.BetterBibTeX.serialized = new class
  fixup: (item, itemID) ->

    item.itemID ?= itemID
    item.itemID = parseInt(item.itemID)

    item.tags = ((if typeof tag == 'object' then tag.tag else tag) for tag in item.tags)

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
    @db = Zotero.BetterBibTeX.DB
    @stats = {
      clear: 0
      hit: 0
      miss: 0
    }

  reset: (reason) ->
    Zotero.BetterBibTeX.debug('serialized.reset:', new Error(reason))
    @db.serialized.removeDataOnly()
    @stats = {
      clear: 0
      hit: 0
      miss: 0
    }

  remove: (itemID) ->
    Zotero.BetterBibTeX.debug('serialized.remove:', {itemID})
    @stats.clear++
    @db.serialized.removeWhere({itemID: parseInt(itemID)})

  get: (zoteroItem) ->
    ### we may be passed a serialized item ###
    return zoteroItem if zoteroItem.itemType && zoteroItem.itemID && zoteroItem.uri

    itemID = parseInt(if zoteroItem.getField then zoteroItem.id else zoteroItem.itemID)
    item = @db.serialized.findOne({itemID})

    if item
      Zotero.BetterBibTeX.debug('serialized: hit')
      @stats.hit++
    else
      Zotero.BetterBibTeX.debug('serialized: miss')
      @stats.miss++
      zoteroItem = Zotero.Items.get(itemID) unless typeof zoteroItem.isAttachment == 'function'

      if zoteroItem.isAttachment()
        item = Zotero.Translate.ItemGetter::_attachmentToArray(zoteroItem)
      else
        item = Zotero.Utilities.Internal.itemToExportFormat(zoteroItem)

      switch
        when !item
          item = {itemID, itemType: 'cache-miss'}

        when item.itemType in ['note', 'attachment']
          @fixup(item, itemID)
          item.attachmentIDs = []

        else
          @fixup(item, itemID)
          item.attachmentIDs = zoteroItem.getAttachments() || []

      @db.serialized.insert(item)

    return null if item.itemType == 'cache-miss'
    item.attachments = (@get({itemID: id}) for id in item.attachmentIDs) unless item.itemType in ['note', 'attachment']
    return JSON.parse(JSON.stringify(item))
