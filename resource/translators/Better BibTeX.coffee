Translator.fieldMap = {
  # Zotero          BibTeX
  place:            { name: 'address', import: 'location' }
  section:          { name: 'chapter' }
  edition:          { name: 'edition' }
  type:             { name: 'type' }
  series:           { name: 'series' }
  title:            { name: 'title', caseConversion: true }
  volume:           { name: 'volume' }
  rights:           { name: 'copyright' }
  ISBN:             { name: 'isbn' }
  ISSN:             { name: 'issn' }
  callNumber:       { name: 'lccn'}
  shortTitle:       { name: 'shorttitle', caseConversion: true }
  DOI:              { name: 'doi' }
  abstractNote:     { name: 'abstract' }
  country:          { name: 'nationality' }
  language:         { name: 'language' }
  assignee:         { name: 'assignee' }
  issue:            { import: 'issue' }
  publicationTitle: { import: 'booktitle' }
  publisher:        { import: [ 'school', 'institution', 'publisher' ], enc: 'literal' }
}

Translator.fieldEncoding = {
  url: 'url'
  doi: 'verbatim'
}

months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

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

doExport = ->
  Zotero.write('\n')
  while item = Translator.nextItem()
    ref = new Reference(item)

    ref.add({ number: item.reportNumber || item.issue || item.seriesNumber || item.patentNumber })
    ref.add({ urldate: item.accessDate && item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '') })

    switch Translator.bibtexURL
      when 'url'
        ref.add({ name: 'url', value: item.url, enc: 'verbatim'})
      when 'note', 'true' # that's what you get when you change pref type
        ref.add({ name: (if ref.referencetype in ['misc', 'booklet'] then 'howpublished' else 'note'), allowDuplicates: true, value: item.url, enc: 'url'})
      else
        ref.add({ name: 'howpublished', allowDuplicates: true, value: item.url, enc: 'url'}) if item.__type__ in ['webpage', 'post', 'post-weblog']

    switch
      when item.__type__ in ['bookSection', 'conferencePaper', 'chapter']
        ref.add({ name: 'booktitle',  caseConversion: true, value: item.publicationTitle, preserveBibTeXVariables: true })
      when ref.isBibVar(item.publicationTitle)
        ref.add({ name: 'journal', value: item.publicationTitle, preserveBibTeXVariables: true })
      else
        ref.add({ name: 'journal', value: Translator.useJournalAbbreviation && Zotero.BetterBibTeX.journalAbbrev(item) || item.publicationTitle, preserveBibTeXVariables: true })

    switch item.__type__
      when 'thesis' then ref.add({ school: item.publisher })
      when 'report' then ref.add({ institution: item.institution || item.publisher })
      else               ref.add({ name: 'publisher', value: item.publisher, enc: 'literal' })

    if item.__type__ == 'thesis' && item.thesisType in ['mastersthesis', 'phdthesis']
      ref.referencetype = item.thesisType
      ref.remove('type')

    ref.addCreators()

    if item.date
      date = Zotero.BetterBibTeX.parseDateToObject(item.date, item.language)
      if date.literal || date.year_end
        ref.add({ year: item.date })
      else
        ref.add({ name: 'month', value: months[date.month - 1], bare: true }) if date.month
        ref.add({ year: '' + date.year })

    ref.add({ name: 'note', value: item.extra, allowDuplicates: true })
    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    if item.pages
      pages = item.pages
      pages = pages.replace(/[-\u2012-\u2015\u2053]+/g, '--') unless ref.raw
      ref.add({ pages })

    if item.notes and Translator.exportNotes
      for note in item.notes
        ref.add({ name: 'annote', value: Zotero.Utilities.unescapeHTML(note.note), allowDuplicates: true, html: true })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })
    ref.complete()

  Translator.complete()
  Zotero.write('\n')
  return

detectImport = ->
  try
    input = Zotero.read(102400)
    Translator.log("BBT detect against #{input}")
    bib = BetterBibTeXParser.parse(input)
    Translator.log("better-bibtex: detect: #{bib.references.length > 0}")
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
    bib = BetterBibTeXParser.parse(data, {csquotes: Translator.csquotes, raw: Translator.rawImports})

    for ref in bib.references
      new ZoteroItem(ref)

    for coll in bib.collections
      JabRef.importGroup(coll)

    if bib.errors && bib.errors.length > 0
      item = new Zotero.Item('journalArticle')
      item.title = "#{Translator.header.label} import errors"
      item.extra = JSON.stringify({translator: Translator.header.translatorID, notimported: bib.errors.join("\n\n")})
      item.complete()

  catch e
    Translator.log("better-bibtex: import failed: #{e}\n#{e.stack}")
    throw e

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

class ZoteroItem
  constructor: (@bibtex) ->
    @type = @typeMap[Zotero.Utilities.trimInternal(@bibtex.__type__.toLowerCase())] || 'journalArticle'
    @item = new Zotero.Item(@type)
    @item.itemID = @bibtex.__key__
    Translator.log("new reference: #{@item.itemID}")
    @biblatexdata = {}
    @item.notes.push({ note: ('The following fields were not imported:<br/>' + @bibtex.__note__).trim(), tags: ['#BBT Import'] }) if @bibtex.__note__
    @import()
    if Translator.rawImports
      @item.tags ?= []
      @item.tags.push(Translator.rawLaTag)
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
for own attr, field of Translator.fieldMap
  fields = []
  fields.push(field.name) if field.name
  fields = fields.concat(field.import) if field.import
  for f in fields
    ZoteroItem::fieldMap[f] ?= attr

ZoteroItem::$__note__ = ZoteroItem::$__key__ = ZoteroItem::['$added-at'] = ZoteroItem::$timestamp = () -> true

ZoteroItem::$type = (value) ->
  @item.sessionType = @item.websiteType = @item.manuscriptType = @item.genre = @item.postType = @item.sessionType = @item.letterType = @item.manuscriptType = @item.mapType = @item.presentationType = @item.regulationType = @item.reportType = @item.thesisType = @item.websiteType = value

ZoteroItem::$__type__ = (value) ->
  @item.thesisType = @bibtex.__type__ if @bibtex.__type__ in [ 'phdthesis', 'mastersthesis' ]
  return true

ZoteroItem::$lista = (value) ->
  @item.title = value if @bibtex.__type__ == 'inreference'

ZoteroItem::$title = (value) ->
  if @bibtex.__type__ == 'inreference'
    @item.bookTitle = value
  else
    @item.title = value

ZoteroItem::$subtitle = (value) ->
  @item.title = '' unless @item.title
  @item.title = @item.title.trim()
  value = value.trim()
  if not /[-–—:!?.;]$/.test(@item.title) and not /^[-–—:.;¡¿]/.test(value)
    @item.title += ': '
  else
  @item.title += ' ' if @item.title.length
  @item.title += value

ZoteroItem::$journal = ZoteroItem::$journaltitle = (value) ->
  if @item.publicationTitle
    @item.journalAbbreviation = value
  else
    @item.publicationTitle = value

ZoteroItem::$fjournal = (value) ->
  @item.journalAbbreviation = @item.publicationTitle if @item.publicationTitle
  @item.publicationTitle = value

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

ZoteroItem::$institution = ZoteroItem::$organization = (value) ->
  @item.backupPublisher = value

ZoteroItem::$number = (value) ->
  switch @item.__type__
    when 'report'                         then @item.reportNumber = value
    when 'book', 'bookSection', 'chapter' then @item.seriesNumber = value
    when 'patent'                         then @item.patentNumber = value
    else                             @item.issue = value

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

ZoteroItem::$year = (value) ->
  if @item.date
    @item.date += value if @item.date.indexOf(value) < 0
  else
    @item.date = value

ZoteroItem::$pages = (value) ->
  if @item.__type__ in ['book', 'thesis', 'manuscript']
    @item.numPages = value
  else
    @item.pages = value.replace(/--/g, '-')

ZoteroItem::$date = (value) -> @item.date = value

ZoteroItem::$url = ZoteroItem::$howpublished = (value) ->
  if m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)
    @item.url = m[2]
  else if field == 'url' || /^(https?:\/\/|mailto:)/i.test(value)
    @item.url = value
  else
    false

ZoteroItem::$lastchecked = ZoteroItem::$urldate = (value) ->
  @item.accessDate = value

ZoteroItem::$keywords = ZoteroItem::$keyword = (value) ->
  keywords = value.split(/[,;]/)
  keywords = value.split(/\s+/) if keywords.length == 1
  @item.tags = (@keywordClean(kw) for kw in keywords)

ZoteroItem::$comment = ZoteroItem::$annote = ZoteroItem::$review = ZoteroItem::$notes = (value) ->
  @item.notes.push({note: Zotero.Utilities.text2html(value)})

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

ZoteroItem::$pmid = ZoteroItem::$pmcid = (value, field) ->
  @hackyFields.push("#{field.toUpperCase()}: #{value}")

ZoteroItem::$lccn = (value) ->
  @hackyFields.push("LCCB: #{value}")

ZoteroItem::$mrnumber = (value) ->
  @hackyFields.push("MR: #{value}")

ZoteroItem::$zmnumber = (value) ->
  @hackyFields.push("Zbl: #{value}")

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
    if target = @fieldMap[field]
      @item[target] ||= value
      continue
    @addToExtraData(field, value)

  if @item.__type__ in ['conferencePaper', 'paper-conference'] and @item.publicationTitle and not @item.proceedingsTitle
    @item.proceedingsTitle = @item.publicationTitle
    delete @item.publicationTitle

  @addToExtra("bibtex: #{@item.itemID}")

  keys = Object.keys(@biblatexdata)
  if keys.length > 0
    keys.sort() if Translator.testing
    biblatexdata = switch
      when @biblatexdatajson && Translator.testing
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
