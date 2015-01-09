require('translator.coffee')
require('unicode_translator.coffee')

Translator.fieldMap = {
  # Zotero      BibTeX
  place:            { name: 'address', preserveCaps: true, import: 'location' }
  section:          { name: 'chapter', preserveCaps: true }
  edition:          { name: 'edition', preserveCaps: true }
  type:             { name: 'type', preserveCaps: true }
  series:           { name: 'series', preserveCaps: true }
  title:            { name: 'title', preserveCaps: true }
  volume:           { name: 'volume', preserveCaps: true }
  rights:           { name: 'copyright',  preserveCaps: true }
  ISBN:             { name: 'isbn' }
  ISSN:             { name: 'issn' }
  callNumber:       { name: 'lccn'}
  shortTitle:       { name: 'shorttitle', preserveCaps: true }
  url:              { name: 'url', esc: 'url' }
  DOI:              { name: 'doi', esc: 'doi' }
  abstractNote:     { name: 'abstract' }
  country:          { name: 'nationality' }
  language:         { name: 'language' }
  assignee:         { name: 'assignee' }
  issue:            { import: 'issue' }
  publicationTitle: { import: 'booktitle' }
  publisher:        { import: [ 'school', 'institution', 'publisher' ] }
}

Translator.typeMap = {
# BibTeX                              Zotero
  'book booklet manual proceedings':  'book'
  'incollection inbook':              'bookSection'
  'article misc':                     'journalArticle magazineArticle newspaperArticle'
  'phdthesis mastersthesis':          'thesis'
  unpublished:                        'manuscript'
  patent:                             'patent'
  'inproceedings conference':         'conferencePaper'
  techreport:                         'report'
  misc:                               'letter interview film artwork webpage'
}

months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

doExport = ->
  Zotero.write('\n')
  while item = Translator.nextItem()
    ref = new Reference(item)

    ref.add({ name: 'number', value: item.reportNumber || item.issue || item.seriesNumber || item.patentNumber })
    ref.add({ name: 'urldate', value: item.accessDate && item.accessDate.replace(/\s*\d+:\d+:\d+/, '') })

    switch item.itemType
      when 'bookSection', 'conferencePaper'
        ref.add({ name: 'booktitle',  value: item.publicationTitle, preserveCaps: true })
      else
        ref.add({ name: 'journal', value: Translator.useJournalAbbreviation && Zotero.BetterBibTeX.keymanager.journalAbbrev(item) || item.publicationTitle, preserveCaps: true })

    switch item.itemType
      when 'thesis' then ref.add({ name: 'school', value: item.publisher, preserveCaps: true })
      when 'report' then ref.add({ name: 'institution', value: item.publisher, preserveCaps: true })
      else               ref.add({ name: 'publisher', value: item.publisher, preserveCaps: true })

    if item.creators and item.creators.length
      # split creators into subcategories
      authors = []
      editors = []
      translators = []
      collaborators = []
      primaryCreatorType = Zotero.Utilities.getCreatorsForType(item.itemType)[0]

      for creator in item.creators
        if ('' + creator.firstName).trim() != '' and ('' + creator.lastName).trim() != ''
          creatorString = creator.lastName + ', ' + creator.firstName
        else
          creatorString = new String(creator.lastName)

        switch creator.creatorType
          when  'editor', 'seriesEditor'  then editors.push(creatorString)
          when 'translator'               then translators.push(creatorString)
          when primaryCreatorType         then authors.push(creatorString)
          else                                 collaborators.push(creatorString)

      ref.add({ name: 'author', value: authors, sep: ' and ' })
      ref.add({ name: 'editor', value: editors, sep: ' and ' })
      ref.add({ name: 'translator', value: translators, sep: ' and ' })
      ref.add({ name: 'collaborator', value: collaborators, sep: ' and ' })

    if item.date
      date = Zotero.Utilities.strToDate(item.date)
      if typeof date.year == 'undefined'
        ref.add({ name: 'year', value: item.date, preserveCaps: true })
      else
        if typeof date.month == 'number'
          ref.add({ name: 'month', value: months[date.month], braces: false })

        ref.add({ name: 'year', value: date.year })

    ref.add({ name: 'note', value: item.extra })
    ref.add({ name: 'keywords', value: item.tags, esc: 'tags' })

    if item.pages
      pages = item.pages
      pages = pages.replace(/[-\u2012-\u2015\u2053]+/g, '--') unless ref.raw
      ref.add({ name: 'pages', value: pages })

    if item.notes and Translator.exportNotes
      for note in item.notes
        ref.add({ name: 'annote', value: Zotero.Utilities.unescapeHTML(note.note) })

    ref.add({ name: 'file', value: item.attachments, esc: 'attachments' })
    ref.complete()

  Translator.exportGroups()
  Zotero.write('\n')
  return

require('Parser.js')

detectImport = ->
  try
    input = Zotero.read(102400)
    Translator.log("BBT detect against #{input}")
    bib = BetterBibTeXParser.parse(input)
    return (bib.references.length > 0)
  catch e
    Translator.log("better-bibtex: detect failed: #{e}\n#{e.stack}")
    return false
  return

doImport = ->
  try
    Translator.initialize()

    data = ''
    while (read = Zotero.read(0x100000)) != false
      data += read
    bib = BetterBibTeXParser.parse(data, {raw: Translator.rawImport})

    for ref in bib.references
      new ZoteroItem(ref)

    for coll in bib.collections
      JabRef.importGroup(coll)

  catch e
    Translator.log('better-bibtex: import failed: ' + e + '\n' + e.stack)
    throw e

JabRef = JabRef ? {}
JabRef.importGroup = (group) ->
  collection = new Zotero.Collection
  collection.type = 'collection'
  collection.name = group.name
  collection.children = ({type: 'item', id: key} for key in group.items)

  for child in group.collections
    collection.children.push(JabRef.importGroup(child))
  collection.complete()
  return collection

class ZoteroItem
  constructor: (bibtex) ->
    @type = Translator.typeMap.BibTeX2Zotero[Zotero.Utilities.trimInternal((bibtex.type || bibtex.__type__).toLowerCase())] || 'journalArticle'
    @item = new Zotero.Item(@type)
    @item.itemID = bibtex.__key__
    @biblatexdata = []
    @item.notes.push({ note: ('The following fields were not imported:<br/>' + bibtex.__note__).trim(), tags: ['#BBT Import'] }) if bibtex.__note__
    @import(bibtex)
    if Translator.rawImport
      @item.tags ?= []
      @item.tags.push(Translator.rawLaTag)
    @item.complete()

ZoteroItem::log = Translator.log

ZoteroItem::keywordClean = (k) ->
  return k.replace(/^[\s{]+|[}\s]+$/g, '').trim()

ZoteroItem::addToExtra = (str) ->
  if @item.extra and @item.extra != ''
    @item.extra += " \n#{str}"
  else
    @item.extra = str
  return

ZoteroItem::addToExtraData = (key, value) ->
  @biblatexdata.push(key.replace(/[=;]/g, '#') + '=' + value.replace(/[\r\n]+/g, ' ').replace(/[=;]g/, '#'))
  return

ZoteroItem::fieldMap = Object.create(null)
for own attr, field of Translator.fieldMap
  fields = []
  fields.push(field.name) if field.name
  fields = fields.concat(field.import) if field.import
  for f in fields
    ZoteroItem::fieldMap[f] ?= attr

ZoteroItem::import = (bibtex) ->
  for own field, value of bibtex
    continue if typeof value != 'number' && not value
    value = Zotero.Utilities.trim(value) if typeof value == 'string'
    continue if value == ''

    if @fieldMap[field]
      @item[@fieldMap[field]] = value
      continue

    switch field
      when '__note__', '__key__', '__type__', 'type', 'added-at', 'timestamp' then continue

      when 'subtitle'
        @item.title = '' unless @item.title
        @item.title = @item.title.trim()
        value = value.trim()
        if not /[-–—:!?.;]$/.test(@item.title) and not /^[-–—:.;¡¿]/.test(value)
          @item.title += ': '
        else
          @item.title += ' ' if @item.title.length
        @item.title += value

      when 'journal'
        if @item.publicationTitle
          @item.journalAbbreviation = value
        else
          @item.publicationTitle = value

      when 'fjournal'
        @item.journalAbbreviation = @item.publicationTitle if @item.publicationTitle
        @item.publicationTitle = value

      when 'author', 'editor', 'translator'
        for creator in value
          continues unless creator
          if typeof creator == 'string'
            creator = Zotero.Utilities.cleanAuthor(creator, field, false)
          else
            creator.creatorType = field
          @item.creators.push(creator)

      when 'institution', 'organization'
        @item.backupPublisher = value

      when 'number'
        switch @item.itemType
          when 'report'               then @item.reportNumber = value
          when 'book', 'bookSection'  then @item.seriesNumber = value
          when 'patent'               then @item.patentNumber = value
          else                             @item.issue = value

      when 'month'
        month = months.indexOf(value.toLowerCase())
        if month >= 0
          value = Zotero.Utilities.formatDate({month: month})
        else
          value += ' '

        if @item.date
          if value.indexOf(@item.date) >= 0 # value contains year and more
            @item.date = value
          else
            @item.date = value + @item.date
        else
          @item.date = value

      when 'year'
        if @item.date
          @item.date += value if @item.date.indexOf(value) < 0
        else
          @item.date = value

      when 'date'
        @item.date = value

      when 'pages'
        switch @item.itemType
          when 'book', 'thesis', 'manuscript' then @item.numPages = value
          else                                     @item.pages = value.replace(/--/g, '-')

      when 'note'
        @addToExtra(value)

      when 'howpublished'
        if /^(https?:\/\/|mailto:)/i.test(value)
          @item.url = value
        else
          @addToExtraData(field, value)

      when 'lastchecked', 'urldate'
        @item.accessDate = value

      when 'keywords', 'keyword'
        keywords = value.split(/[,;]/)
        keywords = value.split(/\s+/) if keywords.length == 1
        @item.tags = (@keywordClean(kw) for kw in keywords)

      when 'comment', 'annote', 'review', 'notes'
        @item.notes.push({note: Zotero.Utilities.text2html(value)})

      when 'file'
        for att in value
          @item.attachments.push(att)

      else
        @addToExtraData(field, value)

  if @item.itemType == 'conferencePaper' and @item.publicationTitle and not @item.proceedingsTitle
    @item.proceedingsTitle = @item.publicationTitle
    delete @item.publicationTitle

  @addToExtra('bibtex: ' + @item.itemID)

  if @biblatexdata.length > 0
    @biblatexdata.sort()
    @addToExtra("biblatexdata[#{@biblatexdata.join(';')}]")

  if not @item.publisher and @item.backupPublisher
    @item.publisher = @item.backupPublisher
    delete @item.backupPublisher

  return
