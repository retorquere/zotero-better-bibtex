Components.utils.import("resource://zotero/config.js")

Zotero.BetterBibTeX.serialized = new class
  fixup: (item, itemID) ->

    Zotero.BetterBibTeX.debug('serialized.fixup:', {itemID: item.itemID, itemType: item.itemType, patchID: itemID})
    item.itemID ?= itemID
    item.itemID = parseInt(item.itemID)
    Zotero.BetterBibTeX.debug('serialized.fixup.post:', {itemID: item.itemID, itemType: item.itemType, patchID: itemID})

    item.tags = ((if typeof tag == 'object' then tag.tag else tag) for tag in item.tags)

    # artwork.artworkMedium = item.medium
    # artwork.websiteTitle = item.publicationTitle
    # audioRecording.release = item.edition
    # audioRecording.audioRecordingFormat = item.medium
    # audioRecording.album = item.publicationTitle
    # audioRecording.label = item.publisher
    # bill.billNumber = item.number
    # bill.codePages = item.pages
    # bill.reporter = item.publicationTitle
    # bill.assemblyNumber = item.seriesNumber
    # bill.sessionType = item.type
    # bill.codeVolume = item.volume
    # blogPost.blogTitle = item.publicationTitle
    # blogPost.websiteType = item.type
    # bookSection.bookTitle = item.publicationTitle
    # case.dateDecided = item.date
    # case.docketNumber = item.number
    # case.firstPage = item.pages
    # case.reporter = item.publicationTitle
    # case.caseName = item.title
    # case.reporterVolume = item.volume
    # classic.manuscriptType = item.type
    # computerProgram.company = item.publisher
    # conferencePaper.proceedingsTitle = item.publicationTitle
    # dictionaryEntry.dictionaryTitle = item.publicationTitle
    # email.subject = item.title
    # encyclopediaArticle.encyclopediaTitle = item.publicationTitle
    # film.videoRecordingFormat = item.medium
    # film.distributor = item.publisher
    # film.genre = item.type
    # forumPost.forumTitle = item.publicationTitle
    # forumPost.postType = item.type
    # gazette.dateEnacted = item.date
    # gazette.publicLawNumber = item.number
    # gazette.nameOfAct = item.title
    # hearing.documentNumber = item.number
    # hearing.reporter = item.publicationTitle
    # hearing.sessionType = item.type
    # interview.interviewMedium = item.medium
    # letter.letterType = item.type
    # manuscript.manuscriptType = item.type
    # map.mapType = item.type
    # patent.issueDate = item.date
    # patent.patentNumber = item.number
    # podcast.audioFileType = item.medium
    # podcast.episodeNumber = item.number
    # presentation.presentationType = item.type
    # radioBroadcast.audioRecordingFormat = item.medium
    # radioBroadcast.episodeNumber = item.number
    # radioBroadcast.programTitle = item.publicationTitle
    # radioBroadcast.network = item.publisher
    # regulation.dateEnacted = item.date
    # regulation.regulatoryBody = item.legislativeBody
    # regulation.publicLawNumber = item.number
    # regulation.nameOfAct = item.title
    # regulation.regulationType = item.type
    # report.reportNumber = item.number
    # report.bookTitle = item.publicationTitle
    # report.reportType = item.type
    # statute.dateEnacted = item.date
    # statute.publicLawNumber = item.number
    # statute.nameOfAct = item.title
    # thesis.university = item.publisher
    # thesis.thesisType = item.type
    # tvBroadcast.videoRecordingFormat = item.medium
    # tvBroadcast.episodeNumber = item.number
    # tvBroadcast.programTitle = item.publicationTitle
    # tvBroadcast.network = item.publisher
    # videoRecording.videoRecordingFormat = item.medium
    # videoRecording.studio = item.publisher
    # webpage.websiteTitle = item.publicationTitle
    # webpage.websiteType = item.type

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

    if keys = (item.multi && item.multi._keys)
      keys.medium ||= keys.artworkMedium || keys.audioRecordingFormat || keys.videoRecordingFormat || keys.interviewMedium || keys.audioFileType
      keys.publicationTitle ||= keys.websiteTitle || keys.album || keys.reporter || keys.blogTitle || keys.bookTitle || keys.proceedingsTitle || keys.dictionaryTitle || keys.encyclopediaTitle || keys.forumTitle || keys.programTitle
      keys.edition ||= keys.release
      keys.publisher ||= keys.label || keys.company || keys.distributor || keys.network || keys.university || keys.studio
      keys.number ||= keys.billNumber || keys.docketNumber || keys.publicLawNumber || keys.documentNumber || keys.patentNumber || keys.episodeNumber || keys.reportNumber
      keys.pages ||= keys.codePages || keys.firstPage
      keys.seriesNumber ||= keys.assemblyNumber
      keys.type ||= keys.sessionType || keys.websiteType || keys.manuscriptType || keys.genre || keys.postType || keys.letterType || keys.mapType || keys.presentationType || keys.regulationType || keys.reportType || keys.thesisType
      keys.volume ||= keys.codeVolume || keys.reporterVolume
      keys.date ||= keys.dateDecided || keys.dateEnacted || keys.issueDate
      keys.title ||= keys.caseName || keys.subject || keys.nameOfAct
      keys.legislativeBody ||= keys.regulatoryBody

    return item

  constructor: ->
    @db = Zotero.BetterBibTeX.DB
    @stats = {
      clear: 0
      hit: 0
      miss: 0
    }

  reset: (reason) ->
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
    ### we may be passed a fully serialized item ###
    Zotero.BetterBibTeX.debug('serialized.get:', {
      type: if typeof zoteroItem.getField == 'function' then 'ZoteroItem' else 'serialized'
      itemType: zoteroItem.itemType
      itemID: zoteroItem.itemID
      uri: zoteroItem.uri
    })
    return zoteroItem if typeof zoteroItem.getField != 'function' && zoteroItem.itemType && zoteroItem.itemID && zoteroItem.uri

    itemID = parseInt(if typeof zoteroItem.getField == 'function' then zoteroItem.id else zoteroItem.itemID)
    item = @db.serialized.findOne({itemID})

    if item
      Zotero.BetterBibTeX.debug('serialized.get: hit', itemID)
      @stats.hit++
    else
      Zotero.BetterBibTeX.debug('serialized.get: miss', itemID)
      @stats.miss++
      zoteroItem = Zotero.Items.get(itemID) unless typeof zoteroItem.getField == 'function'

      if zoteroItem.isAttachment()
        item = Zotero.Translate.ItemGetter::_attachmentToArray(zoteroItem)
      else
        item = Zotero.Utilities.Internal.itemToExportFormat(zoteroItem)

      if item
        @fixup(item, itemID)
        item.attachmentIDs = zoteroItem.getAttachments() unless item.itemType in ['note', 'attachment']
      else
        item = {itemID, itemType: 'cache-miss'}

      @db.serialized.insert(item)

    item.attachments = (@get({itemID: id}) for id in item.attachmentIDs) if item.attachmentIDs && item.attachmentIDs.length != 0
    Zotero.BetterBibTeX.debug('serialized.get: return', {itemType: item.itemType, itemID: item.itemID})
    return null if item.itemType == 'cache-miss'
    return JSON.parse(JSON.stringify(item))
