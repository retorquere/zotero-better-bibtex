debug = require('../lib/debug.coffee')
JSON5 = require('json5')
BibTeXParser = require('biblatex-csl-converter').BibLatexParser

parseReferences = (max) ->
  debug('BibTeXParser.parseReferences:', max || 'all')

  if max
    input = Zotero.read(max)
  else
    input = ''
    while (read = Zotero.read(0x100000)) != false
      input += read

  parser = new BibTeXParser(input, {
    rawFields: true,
    processUnexpected: true,
    processUnknown: true,
  })

  # this must be called before requesting warnings or errors -- I really, really don't like this
  references = parser.output
  # come on....
  references.length = Object.keys(references).length
  # relies on side effect of calling '.output'... can we change this?
  return { references, groups: parser.groups, errors: parser.errors, warnings: parser.warnings }

detectImport = ->
  bib = parseReferences(102400)

  debug('BibTeXParser.detectImport:' + JSON.stringify(bib, null, 2))
  debug('BibTeXParser.detectImport errors:' + bib.errors)
  debug('BibTeXParser.detectImport references:' + bib.references)
  Zotero.debug('no comment?')
  throw new Error('No references found') if bib.references.length == 0
  return true

doImport = ->
  throw new Error('BibTeXParser.doImport: bye')
  bib = parseReferences()

  try
    Zotero.BetterBibTeX.debug('Translator.doImport:' + JSON.stringify(bib))

#    for coll in bib.collections
#      JabRef.collect(coll)
#
#    for ref in bib.references
#      # JabRef groups
#      if ref.groups
#        for group in ref.groups.split(',')
#          group = group.trim()
#          switch
#            when group == ''
#              debug("#{ref.__key__} specifies empty group name")
#            when !JabRef.collections[group]
#              debug("#{ref.__key__} specifies non-existant group #{group}")
#            else
#              JabRef.collections[group].items.append(ref.__key__)
#        delete ref.groups
#
#      new ZoteroItem(ref)
#
#    for coll in bib.collections
#      JabRef.importGroup(coll)
#
#    if bib.errors && bib.errors.length > 0
#      item = new Zotero.Item('journalArticle')
#      item.title = "#{Translator.header.label} import errors"
#      item.extra = JSON.stringify({translator: Translator.header.translatorID, notimported: bib.errors.join("\n\n")})
#      item.complete()

  catch e
    debug("better-bibtex: import failed:", e)
    throw e

  return

# JabRef = JabRef ? {}
# JabRef.importGroup = (group) ->
#   collection = new Zotero.Collection()
#   collection.type = 'collection'
#   collection.name = group.name
#   collection.children = ({type: 'item', id: key} for key in group.items)
#
#   for child in group.collections
#     collection.children.push(JabRef.importGroup(child))
#   collection.complete()
#   return collection
#
# JabRef.collections = {}
# JabRef.collect = (group) ->
#   JabRef.collections[group.name] = group
#   for child in group.collections
#     JabRef.collect(child)
#   return
#
# class ZoteroItem
#   constructor: (@bibtex) ->
#     @type = @typeMap[Zotero.Utilities.trimInternal(@bibtex.__type__.toLowerCase())] || 'journalArticle'
#     @item = new Zotero.Item(@type)
#     @item.itemID = @bibtex.__key__
#     debug("new reference: #{@item.itemID}")
#     @biblatexdata = {}
#     @item.notes.push({ note: ('The following fields were not imported:<br/>' + @bibtex.__note__).trim(), tags: ['#BBT Import'] }) if @bibtex.__note__
#     @import()
#     if Translator.preferences.rawImports
#       @item.tags ?= []
#       @item.tags.push(Translator.preferences.rawLaTag)
#     @item.complete()
#
#   typeMap:
#     book:           'book'
#     booklet:        'book'
#     manual:         'book'
#     proceedings:    'book'
#     collection:     'book'
#     incollection:   'bookSection'
#     inbook:         'bookSection'
#     inreference:    'bookSection'
#     article:        'journalArticle'
#     misc:           'journalArticle'
#     phdthesis:      'thesis'
#     mastersthesis:  'thesis'
#     thesis:         'thesis'
#     unpublished:    'manuscript'
#     patent:         'patent'
#     inproceedings:  'conferencePaper'
#     conference:     'conferencePaper'
#     techreport:     'report'
#
# ZoteroItem::keywordClean = (k) ->
#   return k.replace(/^[\s{]+|[}\s]+$/g, '').trim()
#
# ZoteroItem::addToExtra = (str) ->
#   if @item.extra and @item.extra != ''
#     @item.extra += " \n#{str}"
#   else
#     @item.extra = str
#   return
#
# ZoteroItem::addToExtraData = (key, value) ->
#   @biblatexdata[key] = value
#   @biblatexdatajson = true if key.match(/[\[\]=;\r\n]/) || value.match(/[\[\]=;\r\n]/)
#   return
#
# ZoteroItem::fieldMap = Object.create(null)
# for own attr, field of Reference::fieldMap
#   fields = []
#   fields.push(field.name) if field.name
#   fields = fields.concat(field.import) if field.import
#   for f in fields
#     ZoteroItem::fieldMap[f] ?= attr
#
# ZoteroItem::$__note__ = ZoteroItem::$__key__ = ZoteroItem::['$added-at'] = ZoteroItem::$timestamp = () -> true
#
# ZoteroItem::$type = (value) ->
#   @item.sessionType = @item.websiteType = @item.manuscriptType = @item.genre = @item.postType = @item.sessionType = @item.letterType = @item.manuscriptType = @item.mapType = @item.presentationType = @item.regulationType = @item.reportType = @item.thesisType = @item.websiteType = value
#   return true
#
# ZoteroItem::$__type__ = (value) ->
#   @item.thesisType = value if value in [ 'phdthesis', 'mastersthesis' ]
#   return true
#
# ### these return the value which will be interpreted as 'true' ###
# ZoteroItem::$address      = ZoteroItem::$location     = (value) -> @item.place = value
# ZoteroItem::$institution  = ZoteroItem::$organization = (value) -> @item.backupPublisher = value
# ZoteroItem::$lastchecked  = ZoteroItem::$urldate      = (value) -> @item.accessDate = value
# ZoteroItem::$school       = ZoteroItem::$institution  = ZoteroItem::$publisher = (value) -> @item.publisher = value
#
# ZoteroItem::$chapter      = (value) -> @item.section = value
# ZoteroItem::$edition      = (value) -> @item.edition = value
# ZoteroItem::$series       = (value) -> @item.series = value
# ZoteroItem::$copyright    = (value) -> @item.rights = value
# ZoteroItem::$volume       = (value) -> @item.volume = value
# ZoteroItem::$isbn         = (value) -> @item.ISBN = value
# ZoteroItem::$issn         = (value) -> @item.ISSN = value
# ZoteroItem::$shorttitle   = (value) -> @item.shortTitle = value
# ZoteroItem::$doi          = (value) -> @item.DOI = value
# ZoteroItem::$abstract     = (value) -> @item.abstractNote = value
# ZoteroItem::$nationality  = (value) -> @item.country = value
# ZoteroItem::$language     = (value) -> @item.language = value
# ZoteroItem::$assignee     = (value) -> @item.assignee = value
# ZoteroItem::$issue        = (value) -> @item.issue = value
# ZoteroItem::$booktitle    = (value) -> @item.publicationTitle = value
#
# ### ZoteroItem::$lccn = (value) -> @item.callNumber = value ###
# ZoteroItem::$lccn = (value) -> @hackyFields.push("LCCB: #{value}")
# ZoteroItem::$pmid = ZoteroItem::$pmcid = (value, field) -> @hackyFields.push("#{field.toUpperCase()}: #{value}")
# ZoteroItem::$mrnumber = (value) -> @hackyFields.push("MR: #{value}")
# ZoteroItem::$zmnumber = (value) -> @hackyFields.push("Zbl: #{value}")
#
# ZoteroItem::$lista = (value) ->
#   @item.title = value if @bibtex.__type__ == 'inreference'
#   return true
#
# ZoteroItem::$title = (value) ->
#   if @bibtex.__type__ == 'inreference'
#     @item.bookTitle = value
#   else
#     @item.title = value
#   return true
#
# ZoteroItem::$subtitle = (value) ->
#   @item.title = '' unless @item.title
#   @item.title = @item.title.trim()
#   value = value.trim()
#   if not /[-–—:!?.;]$/.test(@item.title) and not /^[-–—:.;¡¿]/.test(value)
#     @item.title += ': '
#   else
#   @item.title += ' ' if @item.title.length
#   @item.title += value
#   return true
#
# ZoteroItem::$journal = ZoteroItem::$journaltitle = (value) ->
#   if @item.publicationTitle
#     @item.journalAbbreviation = value
#   else
#     @item.publicationTitle = value
#   return true
#
# ZoteroItem::$fjournal = (value) ->
#   @item.journalAbbreviation = @item.publicationTitle if @item.publicationTitle
#   @item.publicationTitle = value
#   return true
#
# ZoteroItem::$author = ZoteroItem::$editor = ZoteroItem::$translator = (value, field) ->
#   for creator in value
#     continues unless creator
#     if typeof creator == 'string'
#       creator = Zotero.Utilities.cleanAuthor(creator, field, false)
#       creator.fieldMode = 1 if creator.lastName && !creator.firstName
#     else
#       creator.creatorType = field
#     @item.creators.push(creator)
#   return true
#
# ZoteroItem::$number = (value) ->
#   switch @item.__type__
#     when 'report'                         then @item.reportNumber = value
#     when 'book', 'bookSection', 'chapter' then @item.seriesNumber = value
#     when 'patent'                         then @item.patentNumber = value
#     else                             @item.issue = value
#   return true
#
# ZoteroItem::$month = (value) ->
#   month = months.indexOf(value.toLowerCase())
#   if month >= 0
#     value = Zotero.Utilities.formatDate({month: month})
#   else
#     value += ' '
#
#   if @item.date
#     if value.indexOf(@item.date) >= 0
#       ### value contains year and more ###
#       @item.date = value
#     else
#       @item.date = value + @item.date
#   else
#     @item.date = value
#   return true
#
# ZoteroItem::$year = (value) ->
#   if @item.date
#     @item.date += value if @item.date.indexOf(value) < 0
#   else
#     @item.date = value
#   return true
#
# ZoteroItem::$pages = (value) ->
#   if @item.__type__ in ['book', 'thesis', 'manuscript']
#     @item.numPages = value
#   else
#     @item.pages = value.replace(/--/g, '-')
#   return true
#
# ZoteroItem::$date = (value) -> @item.date = value
#
# ZoteroItem::$url = ZoteroItem::$howpublished = (value) ->
#   if m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)
#     @item.url = m[2]
#   else if field == 'url' || /^(https?:\/\/|mailto:)/i.test(value)
#     @item.url = value
#   else
#     return false
#   return true
#
# ZoteroItem::$keywords = ZoteroItem::$keyword = (value) ->
#   keywords = value.split(/[,;]/)
#   keywords = value.split(/\s+/) if keywords.length == 1
#   @item.tags = (@keywordClean(kw) for kw in keywords)
#   return true
#
# ZoteroItem::$annotation = ZoteroItem::$comment = ZoteroItem::$annote = ZoteroItem::$review = ZoteroItem::$notes = (value) ->
#   @item.notes.push({note: Zotero.Utilities.text2html(value)})
#   return true
#
# ZoteroItem::$file = (value) ->
#   for att in value
#     @item.attachments.push(att)
#   return true
#
# ZoteroItem::$eprint = ZoteroItem::$eprinttype = (value, field) ->
#   ### Support for IDs exported by BibLaTeX ###
#   @item["_#{field}"] = value
#
#   if @item._eprint && @item._eprinttype
#     switch @item._eprinttype.trim().toLowerCase()
#       when 'arxiv' then @hackyFields.push("arXiv: #{value}")
#       when 'jstor' then @hackyFields.push("JSTOR: #{value}")
#       when 'pubmed' then @hackyFields.push("PMID: #{value}")
#       when 'hdl' then @hackyFields.push("HDL: #{value}")
#       when 'googlebooks' then @hackyFields.push("GoogleBooksID: #{value}")
#     delete @item._eprint
#     delete @item._eprinttype
#   return true
#
# ZoteroItem::$note = (value) ->
#   @addToExtra(value)
#   return true
#
# ZoteroItem::import = () ->
#   @hackyFields = []
#
#   for own field, value of @bibtex
#     continue if typeof value != 'number' && not value
#     value = Zotero.Utilities.trim(value) if typeof value == 'string'
#     continue if value == ''
#
#     continue if @['$' + field]?(value, field)
#     @addToExtraData(field, value)
#
#   if @item.__type__ in ['conferencePaper', 'paper-conference'] and @item.publicationTitle and not @item.proceedingsTitle
#     @item.proceedingsTitle = @item.publicationTitle
#     delete @item.publicationTitle
#
#   @addToExtra("bibtex: #{@item.itemID}")
#
#   keys = Object.keys(@biblatexdata)
#   if keys.length > 0
#     keys.sort() if Translator.preferences.testing
#     biblatexdata = switch
#       when @biblatexdatajson && Translator.preferences.testing
#         'bibtex{' + (for k in keys
#           o = {}
#           o[k] = @biblatexdata[k]
#           JSON5.stringify(o).slice(1, -1)
#         ) + '}'
#
#       when @biblatexdatajson
#         "bibtex#{JSON5.stringify(@biblatexdata)}"
#
#       else
#         biblatexdata = 'bibtex[' + ("#{key}=#{@biblatexdata[key]}" for key in keys).join(';') + ']'
#
#     @addToExtra(biblatexdata)
#
#   if @hackyFields.length > 0
#     @hackyFields.sort()
#     @addToExtra(@hackyFields.join(" \n"))
#
#   if not @item.publisher and @item.backupPublisher
#     @item.publisher = @item.backupPublisher
#     delete @item.backupPublisher
#
#   return
#

doImport.detect = detectImport
module.exports = doImport
