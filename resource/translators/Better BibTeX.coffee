Translator.fieldMap = {
  # Zotero          BibTeX
  place:            { name: 'address', import: 'location' }
  section:          { name: 'chapter' }
  edition:          { name: 'edition' }
  type:             { name: 'type' }
  series:           { name: 'series' }
  title:            { name: 'title', autoCase: true }
  volume:           { name: 'volume' }
  rights:           { name: 'copyright' }
  ISBN:             { name: 'isbn' }
  ISSN:             { name: 'issn' }
  callNumber:       { name: 'lccn'}
  shortTitle:       { name: 'shorttitle', autoCase: true }
  DOI:              { name: 'doi' }
  abstractNote:     { name: 'abstract' }
  country:          { name: 'nationality' }
  language:         { name: 'language' }
  assignee:         { name: 'assignee' }
  issue:            { import: 'issue' }
  publicationTitle: { import: 'booktitle' }
  publisher:        { import: [ 'school', 'institution', 'publisher' ], enc: 'literal' }
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

Translator.fieldEncoding = {
  url: 'url'
  doi: 'verbatim'
}

months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

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
        ref.add({ name: 'howpublished', allowDuplicates: true, value: item.url, enc: 'url'}) if item.itemType == 'webpage'

    switch
      when item.itemType in ['bookSection', 'conferencePaper']
        ref.add({ name: 'booktitle',  autoCase: true, value: item.publicationTitle, preserveBibTeXVariables: true })
      when ref.isBibVar(item.publicationTitle)
        ref.add({ name: 'journal', value: item.publicationTitle, preserveBibTeXVariables: true })
      else
        ref.add({ name: 'journal', value: Translator.useJournalAbbreviation && Zotero.BetterBibTeX.journalAbbrev(item) || item.publicationTitle, preserveBibTeXVariables: true })

    switch item.itemType
      when 'thesis' then ref.add({ school: item.publisher })
      when 'report' then ref.add({ institution: item.institution || item.publisher })
      else               ref.add({ name: 'publisher', value: item.publisher, enc: 'literal' })

    if item.itemType == 'thesis' && item.thesisType in ['mastersthesis', 'phdthesis']
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
        ref.add({ name: 'annote', value: Zotero.Utilities.unescapeHTML(note.note), allowDuplicates: true })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })
    ref.complete()

  Translator.exportGroups()
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
    bib = BetterBibTeXParser.parse(data, {raw: Translator.rawImports})

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
  constructor: (bibtex) ->
    @type = Translator.typeMap.BibTeX2Zotero[Zotero.Utilities.trimInternal((bibtex.type || bibtex.__type__).toLowerCase())] || 'journalArticle'
    @item = new Zotero.Item(@type)
    @item.itemID = bibtex.__key__
    Translator.log("new reference: #{@item.itemID}")
    @biblatexdata = {}
    @item.notes.push({ note: ('The following fields were not imported:<br/>' + bibtex.__note__).trim(), tags: ['#BBT Import'] }) if bibtex.__note__
    @import(bibtex)
    if Translator.rawImports
      @item.tags ?= []
      @item.tags.push(Translator.rawLaTag)
    @item.complete()

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

ZoteroItem::import = (bibtex) ->
  hackyFields = []

  for own field, value of bibtex
    continue if typeof value != 'number' && not value
    value = Zotero.Utilities.trim(value) if typeof value == 'string'
    continue if value == ''

    if @fieldMap[field]
      @item[@fieldMap[field]] = value
      continue

    switch field
      when '__note__', '__key__', 'type', 'added-at', 'timestamp' then continue

      when '__type__'
        @item.thesisType = bibtex.__type__ if bibtex.__type__ in [ 'phdthesis', 'mastersthesis' ]

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
            creator.fieldMode = 1 if creator.lastName && !creator.firstName
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
          if value.indexOf(@item.date) >= 0
            ### value contains year and more ###
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

      when 'url', 'howpublished'
        if m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)
          @item.url = m[2]
        else if field == 'url' || /^(https?:\/\/|mailto:)/i.test(value)
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

      when 'eprint', 'eprinttype'
        ### Support for IDs exported by BibLaTeX ###
        @item["_#{field}"] = value

        if @item._eprint && @item._eprinttype
          switch @item._eprinttype.trim().toLowerCase()
            when 'arxiv' then hackyFields.push("arXiv: #{value}")
            when 'jstor' then hackyFields.push("JSTOR: #{value}")
            when 'pubmed' then hackyFields.push("PMID: #{value}")
            when 'hdl' then hackyFields.push("HDL: #{value}")
            when 'googlebooks' then hackyFields.push("GoogleBooksID: #{value}")
          delete @item._eprint
          delete @item._eprinttype

      when 'lccn'
        hackyFields.push("LCCB: #{value}")

      when 'mrnumber'
        hackyFields.push("MR: #{value}")

      when 'zmnumber'
        hackyFields.push("Zbl: #{value}")

      when 'pmid'
        hackyFields.push("PMID: #{value}")

      when 'pmcid'
        hackyFields.push("PMCID: #{value}")

      else
        @addToExtraData(field, value)

  if @item.itemType == 'conferencePaper' and @item.publicationTitle and not @item.proceedingsTitle
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

  if hackyFields.length > 0
    hackyFields.sort()
    @addToExtra(hackyFields.join(" \n"))

  if not @item.publisher and @item.backupPublisher
    @item.publisher = @item.backupPublisher
    delete @item.backupPublisher

  return
