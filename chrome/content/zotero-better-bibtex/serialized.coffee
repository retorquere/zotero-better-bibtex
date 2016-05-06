Components.utils.import("resource://zotero/config.js")

Zotero.BetterBibTeX.serialized = new class
  fixup: (item, itemID) ->

    item.itemID ?= itemID
    item.itemID = parseInt(item.itemID)

    item.tags = ((if typeof tag == 'object' then tag.tag else tag) for tag in item.tags)

    item.medium ||= item.artworkMedium || item.audioRecordingFormat || item.videoRecordingFormat || item.interviewMedium || item.audioFileType
    item.publicationTitle ||= item.websiteTitle || item.album || item.reporter || item.blogTitle || item.bookTitle || item.proceedingsTitle || item.dictionaryTitle || item.encyclopediaTitle || item.forumTitle || item.programTitle
    item.edition ||= item.release
    item.publisher ||= item.label || item.company || item.distributor || item.network || item.university || item.studio
    item.number ||= item.billNumber || item.docketNumber || item.publicLawNumber || item.documentNumber || item.patentNumber || item.episodeNumber || item.reportNumber
    item.pages ||= item.codePages || item.firstPage
    item.seriesNumber ||= item.assemblyNumber
    item.type ||= item.sessionType || item.websiteType || item.manuscriptType || item.genre || item.postType || item.letterType || item.mapType || item.presentationType || item.regulationType || item.reportType || item.thesisType
    item.volume ||= item.codeVolume || item.reporterVolume
    item.date ||= item.dateDecided || item.dateEnacted || item.issueDate
    item.title ||= item.caseName || item.subject || item.nameOfAct
    item.legislativeBody ||= item.regulatoryBody

    if item.multi && item.multi._keys
      item.multi._keys.medium ||= item.multi._keys.artworkMedium || item.multi._keys.audioRecordingFormat || item.multi._keys.videoRecordingFormat || item.multi._keys.interviewMedium || item.multi._keys.audioFileType
      item.multi._keys.publicationTitle ||= item.multi._keys.websiteTitle || item.multi._keys.album || item.multi._keys.reporter || item.multi._keys.blogTitle || item.multi._keys.bookTitle || item.multi._keys.proceedingsTitle || item.multi._keys.dictionaryTitle || item.multi._keys.encyclopediaTitle || item.multi._keys.forumTitle || item.multi._keys.programTitle
      item.multi._keys.edition ||= item.multi._keys.release
      item.multi._keys.publisher ||= item.multi._keys.label || item.multi._keys.company || item.multi._keys.distributor || item.multi._keys.network || item.multi._keys.university || item.multi._keys.studio
      item.multi._keys.number ||= item.multi._keys.billNumber || item.multi._keys.docketNumber || item.multi._keys.publicLawNumber || item.multi._keys.documentNumber || item.multi._keys.patentNumber || item.multi._keys.episodeNumber || item.multi._keys.reportNumber
      item.multi._keys.pages ||= item.multi._keys.codePages || item.multi._keys.firstPage
      item.multi._keys.seriesNumber ||= item.multi._keys.assemblyNumber
      item.multi._keys.type ||= item.multi._keys.sessionType || item.multi._keys.websiteType || item.multi._keys.manuscriptType || item.multi._keys.genre || item.multi._keys.postType || item.multi._keys.letterType || item.multi._keys.mapType || item.multi._keys.presentationType || item.multi._keys.regulationType || item.multi._keys.reportType || item.multi._keys.thesisType
      item.multi._keys.volume ||= item.multi._keys.codeVolume || item.multi._keys.reporterVolume
      item.multi._keys.date ||= item.multi._keys.dateDecided || item.multi._keys.dateEnacted || item.multi._keys.issueDate
      item.multi._keys.title ||= item.multi._keys.caseName || item.multi._keys.subject || item.multi._keys.nameOfAct
      item.multi._keys.legislativeBody ||= item.multi._keys.regulatoryBody

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
