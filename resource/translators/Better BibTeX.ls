require 'translator.ls'

Translator.fieldMap = {
  # Zotero      BibTeX
  place:            { name: 'address', protect: true, import: 'location' }
  section:          { name: 'chapter', protect: true }
  edition:          { name: 'edition', protect: true }
  type:             { name: 'type'}
  series:           { name: 'series', protect: true }
  title:            { name: 'title', protect: true }
  volume:           { name: 'volume', protect: true }
  rights:           { name: 'copyright',  protect: true }
  ISBN:             { name: 'isbn' }
  ISSN:             { name: 'issn' }
  callNumber:       { name: 'lccn'}
  shortTitle:       { name: 'shorttitle', protect: true }
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
  Zotero.write '\n'
  while item = Translator.nextItem!
    ref = new Reference item

    ref.add { name: 'number', value: item.reportNumber || item.issue || item.seriesNumber || item.patentNumber }
    ref.add { name: 'urldate', value: item.accessDate && item.accessDate.replace(//\s*\d+:\d+:\d+//, '') }

    switch item.itemType
    case 'bookSection', 'conferencePaper'
      ref.add { name: 'booktitle',  value: item.publicationTitle, protect: true }
    default
      ref.add { name: 'journal', value: Translator.useJournalAbbreviation && Zotero.BetterBibTeX.keymanager.journalAbbrev(item) || item.publicationTitle, protect: true }

    switch item.itemType
    case 'thesis'
      ref.add { name: 'school', value: item.publisher, protect: true }
    case 'report'
      ref.add { name: 'institution', value: item.publisher, protect: true }
    default
      ref.add { name: 'publisher', value: item.publisher, protect: true }

    if item.creators and item.creators.length
      # split creators into subcategories
      authors = []
      editors = []
      translators = []
      collaborators = []
      primaryCreatorType = Zotero.Utilities.getCreatorsForType(item.itemType)[0]

      for creator in item.creators
        if ('' + creator.firstName).trim! != '' and ('' + creator.lastName).trim! != ''
          creatorString = creator.lastName + ', ' + creator.firstName
        else
          creatorString = String creator.lastName

        switch creator.creatorType
        case 'editor', 'seriesEditor'
          editors.push creatorString
        case 'translator'
          translators.push creatorString
        case primaryCreatorType
          authors.push creatorString
        default
          collaborators.push creatorString

      ref.add { name: 'author', value: authors, sep: ' and ' }
      ref.add { name: 'editor', value: editors, sep: ' and ' }
      ref.add { name: 'translator', value: translators, sep: ' and ' }
      ref.add { name: 'collaborator', value: collaborators, sep: ' and ' }

    if item.date
      date = Zotero.Utilities.strToDate item.date
      if typeof date.year == 'undefined'
        ref.add { name: 'year', value: item.date, protect: true }
      else
        if typeof date.month == 'number'
          ref.add { name: 'month', value: months[date.month], braces: false }

        ref.add { name: 'year', value: date.year }

    ref.add { name: 'note', value: item.extra }
    ref.add { name: 'keywords', value: item.tags, esc: 'tags' }
    ref.add { name: 'pages', value: item.pages && item.pages.replace(//[-\u2012-\u2015\u2053]+//g, '--') }

    if item.notes and Translator.exportNotes
      for note in item.notes
        ref.add { name: 'annote', value: Zotero.Utilities.unescapeHTML(note.note) }

    ref.add { name: 'file', value: item.attachments, esc: 'attachments' }
    ref.complete!

  Translator.exportGroups!
  Zotero.write '\n'

## import

require 'Parser.js'

detectImport = ->
  try
    input = Zotero.read 102400
    Zotero.debug "BBT detect against #input"
    bib = BetterBibTeXParser.parse input
    return (bib.references.length > 0)
  catch e
    Zotero.debug "better-bibtex: detect failed: #e\n#{e.stack}"
    return false

doImport = ->
  try
    Translator.initialize!

    data = ''
    while (read = Zotero.read 0x100000) != false
      data += read
    bib = BetterBibTeXParser.parse data

    for ref in bib.references
      new ZoteroItem(ref)

    for coll in bib.collections
      JabRef.importGroup coll

  catch e
    Zotero.debug 'better-bibtex: import failed: ' + e + '\n' + e.stack
    throw e

JabRef ?= {}
JabRef.importGroup = (group) ->
  collection = new Zotero.Collection
  collection.type = 'collection'
  collection.name = group.name
  collection.children = [{type: 'item', id: key} for key in group.items]

  for child in group.collections
    collection.children.push(JabRef.importGroup(child))
  collection.complete!
  return collection

ZoteroItem = (bibtex) ->
  @item = item
  @type = Translator.typeMap.BibTeX2Zotero[Zotero.Utilities.trimInternal((bibtex.type || bibtex.__type__).toLowerCase!)] || 'journalArticle'
  @item = new Zotero.Item @type
  @item.itemID = bibtexitem.__key__
  @biblatexdata = []
  @item.notes.push { note: ('The following fields were not imported:<br/>' + bibtexitem.__note__).trim!, tags: ['#BBT Import'] } if bibtex.__note__
  @import(bibtex)
  @item.complete!

ZoteroItem::keywordClean = (k) ->
  return k.replace(//^[\s{]+|[}\s]+$//g, '').trim!

ZoteroItem::addToExtra = (str) ->
  if @item.extra and @item.extra != ''
    @item.extra += " \n#str"
  else
    @item.extra = str

ZoteroItem::addToExtraData = (key, value) ->
  @extradata.push key.replace(//[=;]//g, '#') + '=' + value.replace(//[\r\n]+//g, ' ').replace(//[=;]g//, '#')

ZoteroItem::fieldMap = Object.create null
for own attr, field of Translator.fieldMap
  fields = []
  fields.push field.name if field.name
  if field.import then fields = fields.concat field.import
  for f in fields
    ZoteroItem::fieldMap[f] ?= attr

ZoteroItem::import = (bibtex) ->
  for own field, value of bibtex
    continue if typeof value != 'number' && not value
    value = Zotero.Utilities.trim value if typeof value == 'string'
    continue if value == ''

    if @fieldMap[field]
      @item[@fieldMap[field]] = value
      continue

    switch field
    case '__note__', '__key__', '__type__', 'type', 'added-at', 'timestamp'
      continue

    case 'subtitle'
      @item.title = '' unless @item.title
      @item.title = @item.title.trim!
      value = value.trim!
      if not //[-–—:!?.;]$//.test(@item.title) and not //^[-–—:.;¡¿]//.test(value)
        @item.title += ': '
      else
        @item.title += ' ' if @item.title.length
      @item.title += value

    case 'journal'
      if @item.publicationTitle
        @item.journalAbbreviation = value
      else
        @item.publicationTitle = value

    case 'fjournal'
      @item.journalAbbreviation = @item.publicationTitle if @item.publicationTitle
      @item.publicationTitle = value

    case 'author', 'editor', 'translator'
      for creator in value
        continues unless creator
        if typeof creator == 'string'
          creator = Zotero.Utilities.cleanAuthor(creator, field, false)
        else
          creator.creatorType = field
        @item.creators.push creator

    case 'institution', 'organization'
      @item.backupPublisher = value

    case 'number'
      switch @item.itemType
      case 'report'
        @item.reportNumber = value
      case 'book', 'bookSection'
        @item.seriesNumber = value
      case 'patent'
        @item.patentNumber = value
      default
        @item.issue = value

    case 'month'
      month = months.indexOf value.toLowerCase!
      if month >= 0
        value = Zotero.Utilities.formatDate {month: month}
      else
        value += ' '

      if @item.date
        if value.indexOf(item.date) >= 0 # value contains year and more
          @item.date = value
        else
          @item.date = value + @item.date
      else
        @item.date = value

    case 'year'
      if @item.date
        item.date += value if item.date.indexOf(value) < 0
      else
        item.date = value

    case 'date'
      @item.date = value

    case 'pages'
      switch @item.itemType
      case 'book', 'thesis', 'manuscript'
        @item.numPages = value
      default
        @item.pages = value.replace //--//g, '-'

    case 'note'
        @addToExtra value

    case 'howpublished'
      if //^(https?:\/\/|mailto:)//i.test(value)
        item.url = value
      else
        @addToExtraData(field, value)

    case 'lastchecked', 'urldate'
      @item.accessDate = value

    case 'keywords', 'keyword'
      keywords = value.split //[,;]//
      keywords = value.split //\s+// if keywords.length == 1
      @item.tags = [keywordClean(kw) for kw in keywords]

    case 'comment', 'annote', 'review', 'notes'
      @item.notes.push {note: Zotero.Utilities.text2html value}

    case 'file'
      for att in value
        @item.attachments.push att

    default
      @addToExtraData field, value

  if @item.itemType == 'conferencePaper' and @item.publicationTitle and not @item.proceedingsTitle
    @item.proceedingsTitle = @item.publicationTitle
    delete! @item.publicationTitle

  @addToExtra 'bibtex: ' + item.itemID

  if @biblatexdata.length > 0
    @biblatexdata.sort!
    addToExtra "biblatexdata[#{@biblatexdata.join(';')}]"

  if not @item.publisher and @item.backupPublisher
    @item.publisher = @item.backupPublisher
    delete! @item.backupPublisher
