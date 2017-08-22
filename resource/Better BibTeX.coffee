Reference = require('./bibtex/reference.coffee')
Exporter = require('./lib/exporter.coffee')
debug = require('./lib/debug.coffee')
JSON5 = require('json5')
BibTeX = require('./bibtex/bibtex-parser.pegjs')

Reference::caseConversion = {
  title: true,
  shorttitle: true,
  booktitle: true,
}

Reference::fieldEncoding = {
  url: 'verbatim'
  doi: 'verbatim'
  # school: 'literal'
  institution: 'literal'
  publisher: 'literal'
}

Reference::requiredFields =
  inproceedings: ['author','booktitle','pages','publisher','title','year']
  article: ['author','journal','number','pages','title','volume','year']
  techreport: ['author','institution','title','year']
  incollection: ['author','booktitle','pages','publisher','title','year']
  book: ['author','publisher','title','year']
  inbook: ['author','booktitle','pages','publisher','title','year']
  proceedings: ['editor','publisher','title','year']
  phdthesis: ['author','school','title','year']
  mastersthesis: ['author','school','title','year']
  electronic: ['author','title','url','year']
  misc: ['author','howpublished','title','year']

Reference::addCreators = ->
  return unless @item.creators and @item.creators.length
  ### split creators into subcategories ###
  authors = []
  editors = []
  translators = []
  collaborators = []
  primaryCreatorType = Zotero.Utilities.getCreatorsForType(@item.itemType)[0]

  for creator in @item.creators
    switch creator.creatorType
      when 'editor', 'seriesEditor'   then editors.push(creator)
      when 'translator'               then translators.push(creator)
      when primaryCreatorType         then authors.push(creator)
      else                                 collaborators.push(creator)

  @remove('author')
  @remove('editor')
  @remove('translator')
  @remove('collaborator')

  @add({ name: 'author', value: authors, enc: 'creators' })
  @add({ name: 'editor', value: editors, enc: 'creators' })
  @add({ name: 'translator', value: translators, enc: 'creators' })
  @add({ name: 'collaborator', value: collaborators, enc: 'creators' })
  return

Reference::typeMap =
  csl:
    article               : 'article'
    'article-journal'     : 'article'
    'article-magazine'    : 'article'
    'article-newspaper'   : 'article'
    bill                  : 'misc'
    book                  : 'book'
    broadcast             : 'misc'
    chapter               : 'incollection'
    dataset               : 'misc'
    entry                 : 'incollection'
    'entry-dictionary'    : 'incollection'
    'entry-encyclopedia'  : 'incollection'
    figure                : 'misc'
    graphic               : 'misc'
    interview             : 'misc'
    legal_case            : 'misc'
    legislation           : 'misc'
    manuscript            : 'unpublished'
    map                   : 'misc'
    motion_picture        : 'misc'
    musical_score         : 'misc'
    pamphlet              : 'booklet'
    'paper-conference'    : 'inproceedings'
    patent                : 'misc'
    personal_communication: 'misc'
    post                  : 'misc'
    'post-weblog'         : 'misc'
    report                : 'techreport'
    review                : 'article'
    'review-book'         : 'article'
    song                  : 'misc'
    speech                : 'misc'
    thesis                : 'phdthesis'
    treaty                : 'misc'
    webpage               : 'misc'
  zotero:
    artwork         : 'misc'
    book            : 'book'
    bookSection     : 'incollection'
    conferencePaper : 'inproceedings'
    film            : 'misc'
    interview       : 'misc'
    journalArticle  : 'article'
    letter          : 'misc'
    magazineArticle : 'article'
    manuscript      : 'unpublished'
    newspaperArticle: 'article'
    patent          : 'patent'
    report          : 'techreport'
    thesis          : 'phdthesis'
    webpage         : 'misc'

BetterBibTeX.initialize = ->
  Reference.installPostscript()
  BetterBibTeX.unicode = !BetterBibTeX.preferences.asciiBibTeX
  return

months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

BetterBibTeX.doExport = ->
  Exporter = new Exporter()

  Zotero.write('\n')
  while item = Exporter.nextItem()
    ref = new Reference(item)

    ref.add({address: item.place})
    ref.add({chapter: item.section})
    ref.add({edition: item.edition})
    ref.add({type: item.type})
    ref.add({series: item.series})
    ref.add({title: item.title})
    ref.add({volume: item.volume})
    ref.add({copyright: item.rights})
    ref.add({isbn: item.ISBN})
    ref.add({issn: item.ISSN})
    ref.add({lccn: item.callNumber})
    ref.add({shorttitle: item.shortTitle})
    ref.add({doi: item.DOI})
    ref.add({abstract: item.abstractNote})
    ref.add({nationality: item.country})
    ref.add({language: item.language})
    ref.add({assignee: item.assignee})

    ref.add({ number: item.reportNumber || item.issue || item.seriesNumber || item.patentNumber })
    ref.add({ urldate: item.accessDate && item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '') })

    switch BetterBibTeX.preferences.bibtexURL
      when 'url'
        ref.add({ name: 'url', value: item.url })
      when 'note'
        ref.add({ name: (if ref.referencetype in ['misc', 'booklet'] then 'howpublished' else 'note'), allowDuplicates: true, value: item.url, enc: 'url' })
      else
        ref.add({ name: 'howpublished', allowDuplicates: true, value: item.url }) if item.__type__ in ['webpage', 'post', 'post-weblog']

    switch
      when item.__type__ in ['bookSection', 'conferencePaper', 'chapter']
        ref.add({ name: 'booktitle', value: item.publicationTitle, preserveBibTeXVariables: true })
      when ref.isBibVar(item.publicationTitle)
        ref.add({ name: 'journal', value: item.publicationTitle, preserveBibTeXVariables: true })
      else
        ref.add({ name: 'journal', value: (BetterBibTeX.options.useJournalAbbreviation && item.journalAbbreviation) || item.publicationTitle, preserveBibTeXVariables: true })

    switch item.__type__
      when 'thesis' then ref.add({ school: item.publisher })
      when 'report' then ref.add({ institution: item.institution || item.publisher })
      else               ref.add({ name: 'publisher', value: item.publisher })

    if item.__type__ == 'thesis' && item.thesisType in ['mastersthesis', 'phdthesis']
      ref.referencetype = item.thesisType
      ref.remove('type')

    ref.addCreators()

    if item.date
      date = Zotero.BetterBibTeX.parseDate(item.date)
      switch date?.type || 'verbatim'
        when 'verbatim', 'interval'
          ref.add({ year: item.date })
        when 'date'
          ref.add({ name: 'month', value: months[date.month - 1], bare: true }) if date.month
          if date.orig?.type == 'date'
            ref.add({ year: "[#{date.orig.year}] #{date.year}" })
          else
            ref.add({ year: '' + date.year })

    ref.add({ name: 'note', value: item.extra, allowDuplicates: true })
    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    if item.pages
      pages = item.pages
      pages = pages.replace(/[-\u2012-\u2015\u2053]+/g, '--') unless ref.raw
      ref.add({ pages })

    if item.notes and BetterBibTeX.options.exportNotes
      for note in item.notes
        ref.add({ name: 'annote', value: Zotero.Utilities.unescapeHTML(note.note), allowDuplicates: true, html: true })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })
    ref.complete()

  Exporter.complete()
  Zotero.write('\n')
  return

BetterBibTeX.detectImport = ->
  input = Zotero.read(102400)
  bib = BibTeX.parse(input)
  debug("better-bibtex: detect: #{bib.references.length > 0}")
  return (bib.references.length > 0)

BetterBibTeX.doImport = ->
  try

    data = ''
    while (read = Zotero.read(0x100000)) != false
      data += read
    debug('parsing bibtex with', {mathMode: BetterBibTeX.preferences.mathMode, csquotes: BetterBibTeX.preferences.csquotes, raw: BetterBibTeX.preferences.rawImports})
    bib = BibTeX.parse(data, {mathMode: BetterBibTeX.preferences.mathMode, csquotes: BetterBibTeX.preferences.csquotes, raw: BetterBibTeX.preferences.rawImports})

    for coll in bib.collections
      JabRef.collect(coll)

    for ref in bib.references
      # JabRef groups
      if ref.groups
        for group in ref.groups.split(',')
          group = group.trim()
          switch
            when group == ''
              debug("#{ref.__key__} specifies empty group name")
            when !JabRef.collections[group]
              debug("#{ref.__key__} specifies non-existant group #{group}")
            else
              JabRef.collections[group].items.append(ref.__key__)
        delete ref.groups

      new ZoteroItem(ref)

    for coll in bib.collections
      JabRef.importGroup(coll)

    if bib.errors && bib.errors.length > 0
      item = new Zotero.Item('journalArticle')
      item.title = "#{BetterBibTeX.header.label} import errors"
      item.extra = JSON.stringify({translator: BetterBibTeX.header.translatorID, notimported: bib.errors.join("\n\n")})
      item.complete()

  catch e
    debug("better-bibtex: import failed: #{e}\n#{e.stack}")
    throw e

  return

JabRef = JabRef ? {}
JabRef.importGroup = (group) ->
  collection = new Zotero.Collection()
  collection.type = 'collection'
  collection.name = group.name
  collection.children = ({type: 'item', id: key} for key in group.items)

  for child in group.collections
    collection.children.push(JabRef.importGroup(child))
  collection.complete()
  return collection

JabRef.collections = {}
JabRef.collect = (group) ->
  JabRef.collections[group.name] = group
  for child in group.collections
    JabRef.collect(child)
  return

class ZoteroItem
  constructor: (@bibtex) ->
    @type = @typeMap[Zotero.Utilities.trimInternal(@bibtex.__type__.toLowerCase())] || 'journalArticle'
    @item = new Zotero.Item(@type)
    @item.itemID = @bibtex.__key__
    debug("new reference: #{@item.itemID}")
    @biblatexdata = {}
    @item.notes.push({ note: ('The following fields were not imported:<br/>' + @bibtex.__note__).trim(), tags: ['#BBT Import'] }) if @bibtex.__note__
    @import()
    if BetterBibTeX.preferences.rawImports
      @item.tags ?= []
      @item.tags.push(BetterBibTeX.preferences.rawLaTag)
    @item.complete()

  typeMap:
    book:           'book'
    booklet:        'book'
    manual:         'book'
    proceedings:    'book'
    collection:     'book'
    incollection:   'bookSection'
    inbook:         'bookSection'
    inreference:    'bookSection'
    article:        'journalArticle'
    misc:           'journalArticle'
    phdthesis:      'thesis'
    mastersthesis:  'thesis'
    thesis:         'thesis'
    unpublished:    'manuscript'
    patent:         'patent'
    inproceedings:  'conferencePaper'
    conference:     'conferencePaper'
    techreport:     'report'

ZoteroItem::keywordClean = (k) ->
  return k.replace(/^[\s{]+|[}\s]+$/g, '').trim()

ZoteroItem::addToExtra = (str) ->
  debug('ZoteroItem::addToExtra:', str)
  if @item.extra and @item.extra != ''
    @item.extra += " \n#{str}"
  else
    @item.extra = str
  return

ZoteroItem::addToExtraData = (key, value) ->
  @biblatexdata[key] = value
  @biblatexdatajson = true if key.match(/[\[\]=;\r\n]/) || value.match(/[\[\]=;\r\n]/)
  return

ZoteroItem::fieldMap = Object.create(null)
for own attr, field of Reference::fieldMap
  fields = []
  fields.push(field.name) if field.name
  fields = fields.concat(field.import) if field.import
  for f in fields
    ZoteroItem::fieldMap[f] ?= attr

ZoteroItem::$__note__ = ZoteroItem::$__key__ = ZoteroItem::['$added-at'] = ZoteroItem::$timestamp = () -> true

ZoteroItem::$type = (value) ->
  @item.sessionType = @item.websiteType = @item.manuscriptType = @item.genre = @item.postType = @item.sessionType = @item.letterType = @item.manuscriptType = @item.mapType = @item.presentationType = @item.regulationType = @item.reportType = @item.thesisType = @item.websiteType = value
  return true

ZoteroItem::$__type__ = (value) ->
  @item.thesisType = value if value in [ 'phdthesis', 'mastersthesis' ]
  return true

### these return the value which will be interpreted as 'true' ###
ZoteroItem::$address      = ZoteroItem::$location     = (value) -> @item.place = value
ZoteroItem::$institution  = ZoteroItem::$organization = (value) -> @item.backupPublisher = value
ZoteroItem::$lastchecked  = ZoteroItem::$urldate      = (value) -> @item.accessDate = value
ZoteroItem::$school       = ZoteroItem::$institution  = ZoteroItem::$publisher = (value) -> @item.publisher = value

ZoteroItem::$chapter      = (value) -> @item.section = value
ZoteroItem::$edition      = (value) -> @item.edition = value
ZoteroItem::$series       = (value) -> @item.series = value
ZoteroItem::$copyright    = (value) -> @item.rights = value
ZoteroItem::$volume       = (value) -> @item.volume = value
ZoteroItem::$isbn         = (value) -> @item.ISBN = value
ZoteroItem::$issn         = (value) -> @item.ISSN = value
ZoteroItem::$shorttitle   = (value) -> @item.shortTitle = value
ZoteroItem::$doi          = (value) -> @item.DOI = value
ZoteroItem::$abstract     = (value) -> @item.abstractNote = value
ZoteroItem::$nationality  = (value) -> @item.country = value
ZoteroItem::$language     = (value) -> @item.language = value
ZoteroItem::$assignee     = (value) -> @item.assignee = value
ZoteroItem::$issue        = (value) -> @item.issue = value
ZoteroItem::$booktitle    = (value) -> @item.publicationTitle = value

### ZoteroItem::$lccn = (value) -> @item.callNumber = value ###
ZoteroItem::$lccn = (value) -> @hackyFields.push("LCCB: #{value}")
ZoteroItem::$pmid = ZoteroItem::$pmcid = (value, field) -> @hackyFields.push("#{field.toUpperCase()}: #{value}")
ZoteroItem::$mrnumber = (value) -> @hackyFields.push("MR: #{value}")
ZoteroItem::$zmnumber = (value) -> @hackyFields.push("Zbl: #{value}")

ZoteroItem::$lista = (value) ->
  @item.title = value if @bibtex.__type__ == 'inreference'
  return true

ZoteroItem::$title = (value) ->
  if @bibtex.__type__ == 'inreference'
    @item.bookTitle = value
  else
    @item.title = value
  return true

ZoteroItem::$subtitle = (value) ->
  @item.title = '' unless @item.title
  @item.title = @item.title.trim()
  value = value.trim()
  if not /[-–—:!?.;]$/.test(@item.title) and not /^[-–—:.;¡¿]/.test(value)
    @item.title += ': '
  else
  @item.title += ' ' if @item.title.length
  @item.title += value
  return true

ZoteroItem::$journal = ZoteroItem::$journaltitle = (value) ->
  if @item.publicationTitle
    @item.journalAbbreviation = value
  else
    @item.publicationTitle = value
  return true

ZoteroItem::$fjournal = (value) ->
  @item.journalAbbreviation = @item.publicationTitle if @item.publicationTitle
  @item.publicationTitle = value
  return true

ZoteroItem::$author = ZoteroItem::$editor = ZoteroItem::$translator = (value, field) ->
  for creator in value
    continues unless creator
    if typeof creator == 'string'
      creator = Zotero.Utilities.cleanAuthor(creator, field, false)
      creator.fieldMode = 1 if creator.lastName && !creator.firstName
    else
      creator.creatorType = field
    @item.creators.push(creator)
  return true

ZoteroItem::$number = (value) ->
  switch @item.__type__
    when 'report'                         then @item.reportNumber = value
    when 'book', 'bookSection', 'chapter' then @item.seriesNumber = value
    when 'patent'                         then @item.patentNumber = value
    else                             @item.issue = value
  return true

ZoteroItem::$month = (value) ->
  month = months.indexOf(value.toLowerCase())
  if month >= 0
    value = Zotero.Utilities.formatDate({month: month})
  else
    value += ' '

  if @item.date
    if value.indexOf(@item.date) >= 0
      ### value contains year and more ###
      @item.date = value
    else
      @item.date = value + @item.date
  else
    @item.date = value
  return true

ZoteroItem::$year = (value) ->
  if @item.date
    @item.date += value if @item.date.indexOf(value) < 0
  else
    @item.date = value
  return true

ZoteroItem::$pages = (value) ->
  if @item.__type__ in ['book', 'thesis', 'manuscript']
    @item.numPages = value
  else
    @item.pages = value.replace(/--/g, '-')
  return true

ZoteroItem::$date = (value) -> @item.date = value

ZoteroItem::$url = ZoteroItem::$howpublished = (value) ->
  if m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)
    @item.url = m[2]
  else if field == 'url' || /^(https?:\/\/|mailto:)/i.test(value)
    @item.url = value
  else
    return false
  return true

ZoteroItem::$keywords = ZoteroItem::$keyword = (value) ->
  keywords = value.split(/[,;]/)
  keywords = value.split(/\s+/) if keywords.length == 1
  @item.tags = (@keywordClean(kw) for kw in keywords)
  return true

ZoteroItem::$annotation = ZoteroItem::$comment = ZoteroItem::$annote = ZoteroItem::$review = ZoteroItem::$notes = (value) ->
  @item.notes.push({note: Zotero.Utilities.text2html(value)})
  return true

ZoteroItem::$file = (value) ->
  for att in value
    @item.attachments.push(att)
  return true

ZoteroItem::$eprint = ZoteroItem::$eprinttype = (value, field) ->
  ### Support for IDs exported by BibLaTeX ###
  @item["_#{field}"] = value

  if @item._eprint && @item._eprinttype
    switch @item._eprinttype.trim().toLowerCase()
      when 'arxiv' then @hackyFields.push("arXiv: #{value}")
      when 'jstor' then @hackyFields.push("JSTOR: #{value}")
      when 'pubmed' then @hackyFields.push("PMID: #{value}")
      when 'hdl' then @hackyFields.push("HDL: #{value}")
      when 'googlebooks' then @hackyFields.push("GoogleBooksID: #{value}")
    delete @item._eprint
    delete @item._eprinttype
  return true

ZoteroItem::$note = (value) ->
  @addToExtra(value)
  return true

ZoteroItem::import = () ->
  @hackyFields = []

  for own field, value of @bibtex
    continue if typeof value != 'number' && not value
    value = Zotero.Utilities.trim(value) if typeof value == 'string'
    continue if value == ''

    continue if @['$' + field]?(value, field)
    @addToExtraData(field, value)

  if @item.__type__ in ['conferencePaper', 'paper-conference'] and @item.publicationTitle and not @item.proceedingsTitle
    @item.proceedingsTitle = @item.publicationTitle
    delete @item.publicationTitle

  @addToExtra("bibtex: #{@item.itemID}")

  keys = Object.keys(@biblatexdata)
  if keys.length > 0
    keys.sort() if BetterBibTeX.preferences.testing
    biblatexdata = switch
      when @biblatexdatajson && BetterBibTeX.preferences.testing
        'bibtex{' + (for k in keys
          o = {}
          o[k] = @biblatexdata[k]
          JSON5.stringify(o).slice(1, -1)
        ) + '}'

      when @biblatexdatajson
        "bibtex#{JSON5.stringify(@biblatexdata)}"

      else
        biblatexdata = 'bibtex[' + ("#{key}=#{@biblatexdata[key]}" for key in keys).join(';') + ']'

    @addToExtra(biblatexdata)

  if @hackyFields.length > 0
    @hackyFields.sort()
    @addToExtra(@hackyFields.join(" \n"))

  if not @item.publisher and @item.backupPublisher
    @item.publisher = @item.backupPublisher
    delete @item.backupPublisher

  return
