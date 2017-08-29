Reference = require('./bibtex/reference.coffee')
Exporter = require('./lib/exporter.coffee')
debug = require('./lib/debug.coffee')
JSON5 = require('json5')
htmlEscape = require('./lib/html-escape.coffee')
#BibTeXParser = require('biblatex-csl-converter').BibLatexParser
BibTeXParser = require('../../biblatex-csl-converter').BibLatexParser

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

Translator.initialize = ->
  Reference.installPostscript()
  Translator.unicode = !Translator.preferences.asciiBibTeX
  return

months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

Translator.doExport = ->
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

    switch Translator.preferences.bibtexURL
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
        ref.add({ name: 'journal', value: (Translator.options.useJournalAbbreviation && item.journalAbbreviation) || item.publicationTitle, preserveBibTeXVariables: true })

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

    if item.notes and Translator.options.exportNotes
      for note in item.notes
        ref.add({ name: 'annote', value: Zotero.Utilities.unescapeHTML(note.note), allowDuplicates: true, html: true })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })
    ref.complete()

  Exporter.complete()
  Zotero.write('\n')
  return

importReferences = (input) ->
  parser = new BibTeXParser(input, {
    rawFields: true,
    processUnexpected: true,
    processUnknown: {
      comment: 'f_verbatim'
    }
  })

  ### this must be called before requesting warnings or errors -- this really, really weirds me out ###
  references = parser.output

  ### relies on side effect of calling '.output' ###
  return {
    references: references,
    groups: parser.groups,
    errors: parser.errors,
    warnings: parser.warnings
  }

Translator.detectImport = ->
  input = Zotero.read(102400)
  bib = importReferences(input)
  found = Object.keys(bib.references).length > 0
  debug("better-bibtex: detect: #{found}")
  return found

importGroup = (group, itemID, root) ->
  collection = new Zotero.Collection()
  collection.type = 'collection'
  collection.name = group.name
  collection.children = ({type: 'item', id: itemID[citekey]} for citekey in group.references when itemID[citekey])
  debug('importGroup:', group.name, collection.children)

  for subgroup in group.groups || []
    collection.children.push(importGroup(subgroup, items))

  collection.complete() if root
  return collection

Translator.doImport = ->
  input = ''
  while (read = Zotero.read(0x100000)) != false
    input += read
  bib = importReferences(input)

  debug('doImport: groups', typeof bib.groups)

  if bib.errors.length
    debug('Translator.doImport errors:', bib.errors)
    item = new Zotero.Item('note')
    item.note = 'Import errors found: <ul>'
    for err in bib.errors
      switch err.type
        when 'cut_off_citation'
          item.note += '<li>' + htmlEscape("Incomplete reference @#{err.entry}") + '</li>'
        else
          throw(err)
    item.note += '</ul>'
    item.complete()

  itemIDS = {}
  for id, ref of bib.references
    itemIDS[ref.entry_key] = id
    new ZoteroItem(id, ref, bib.groups)

  for group in bib.groups
    importGroup(group, itemIDS, true)
  return

class ZoteroItem
  constructor: (@id, @bibtex, @groups) ->
    @bibtex.bib_type = @bibtex.bib_type.toLowerCase()
    @type = @typeMap[@bibtex.bib_type] || 'journalArticle'

    debug('ZoteroItem: importing', @id, @type, JSON.stringify(@bibtex, null, 2))

    @item = new Zotero.Item(@type)
    @item.itemID = @id
    debug("new reference: #{@item.itemID}")
    @biblatexdata = {}
#    @item.notes.push({ note: ('The following fields were not imported:<br/>' + @bibtex.__note__).trim(), tags: ['#BBT Import'] }) if @bibtex.__note__
    @import()
#    if Translator.preferences.rawImports
#      @item.tags ?= []
#      @item.tags.push(Translator.preferences.rawLaTag)
    debug('saving')
    @item.complete()

  typeMap:
    book:           'book'
    booklet:        'book'
    manual:         'book'
    proceedings:    'book'
    collection:     'book'
    incollection:   'bookSection'
    inbook:         'bookSection'
    inreference:    'encyclopediaArticle'
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
    report:         'report'

  sup: {
    0: '\u2070'
    1: '\u00B9'
    2: '\u00B2'
    3: '\u00B3'
    4: '\u2074'
    5: '\u2075'
    6: '\u2076'
    7: '\u2077'
    8: '\u2078'
    9: '\u2079'
    '+': '\u207A'
    '-': '\u207B'
    '=': '\u207C'
    '(': '\u207D'
    ')': '\u207E'
    i: '\u2071'
    n: '\u207F'
  }
  sub: {
    0: '\u2080'
    1: '\u2081'
    2: '\u2082'
    3: '\u2083'
    4: '\u2084'
    5: '\u2085'
    6: '\u2086'
    7: '\u2087'
    8: '\u2088'
    9: '\u2089'
    '+': '\u208A'
    '-': '\u208B'
    '=': '\u208C'
    '(': '\u208D'
    ')': '\u208E'
    a: '\u2090'
    e: '\u2091'
    o: '\u2092'
    x: '\u2093'
    h: '\u2095'
    k: '\u2096'
    l: '\u2097'
    m: '\u2098'
    n: '\u2099'
    p: '\u209A'
    s: '\u209B'
    t: '\u209C'
  }

  collapse: (node) ->
    return null unless node?

    return node if typeof node in ['string', 'number']

    return (@collapse(n) for n in node).join('') if Array.isArray(node)

    if node.type == 'text'
      marks = (node.marks || []).reduce(((acc, mark) -> acc[mark.type] = true; return acc), {})

      if marks.sup || marks.sub
        mark = if marks.sup then @sup else @sub
        text = []
        for c in Zotero.Utilities.XRegExp.split(node.text, '')
          switch
            when mark[c] && typeof text[0] == 'string'
              text[0] += mark[c]
            when mark[c]
              text.unshift(mark[c])
            when typeof text[0] == 'object'
              text[0].text += c
            else
              text.unshift({ text: c })
        mark = if marks.sup then 'sup' else 'sub'
        text = text.reverse().map((chunk) -> if typeof chunk == 'string' then chunk else "<#{mark}>#{chunk.text}</#{mark}>").join('')
      else
        text = node.text

      # debug('collapse:', {marks, text})

      # text = '<span class="nocase">' + text + '</span>' if marks.nocase
      text = "<i>#{text}</i>" if marks.em
      text = "<b>#{text}</b>" if marks.strong
      text = "<span style=\"font-variant: small-caps;\">#{text}</span>" if marks.smallcaps
      text = "\u201C#{text}\u201D" if marks.enquote

      return text

    return node.attrs.variable if node.type == 'variable'

    return JSON.stringify(node)

  import: () ->
    @hackyFields = []

    fields = Object.keys(@bibtex.fields)
    unexpected = Object.keys(@bibtex.unexpected_fields || {})
    unknown = Object.keys(@bibtex.unknown_fields || {})
    if Translator.preferences.testing
      fields.sort()
      unexpected.sort()
      unknown.sort()
    fields = fields.concat(unexpected).concat(unknown)
    @fields = Object.assign({}, @bibtex.unknown_fields || {}, @bibtex.unexpected_fields || {}, @bibtex.fields)

    for field in fields
      value = @fields[field]

      if field.match(/^local-zo-url-[0-9]+$/)
        continue if @$file(value, field)
      else if field.match(/^bdsk-url-[0-9]+$/)
        continue if @$url(value, field)

      debug('ZoteroItem.import:', field)
      continue if @["$#{field}"]?(value, field)
      debug('ZoteroItem.import: addtoextra', field)
      @addToExtraData(field, @collapse(value))

    if @type in ['conferencePaper', 'paper-conference'] and @item.publicationTitle and not @item.proceedingsTitle
      @item.proceedingsTitle = @item.publicationTitle
      delete @item.publicationTitle

    @addToExtra("bibtex: #{@bibtex.entry_key}")

    keys = Object.keys(@biblatexdata)
    if keys.length > 0
      keys.sort() if Translator.preferences.testing
      biblatexdata = switch
        when @biblatexdatajson && Translator.preferences.testing
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

  addToExtra: (str) ->
    debug('ZoteroItem::addToExtra:', str)
    if @item.extra and @item.extra != ''
      @item.extra += " \n#{str}"
    else
      @item.extra = str
    return

  addToExtraData: (key, value) ->
    debug('addToExtraData', { key, value })
    @biblatexdata[key] = @collapse(value)
    @biblatexdatajson = true if key.match(/[\[\]=;\r\n]/) || value.match(/[\[\]=;\r\n]/)
    return

  $title: (value) ->
    if @type == 'encyclopediaArticle'
      @item.publicationTitle = @collapse(value)
    else
      @item.title = @collapse(value)
    return true

  $author: (value, field) ->
    for name in value
      debug('doImport.$author', name)
      creator = {
        creatorType: field
      }
      if name.literal
        creator.lastName = @collapse(name.literal)
        creator.fieldMode = 1
      else
        creator.firstName = @collapse(name.given)
        creator.lastName = @collapse(name.family)
        creator.lastName = @collapse(name.prefix) + ' ' + creator.lastName if name.prefix
        creator.lastName = creator.lastName + ', ' + @collapse(name.suffix) if name.suffix
        # creator = Zotero.Utilities.cleanAuthor(creator, field, false)
        creator.fieldMode = 1 if creator.lastName && !creator.firstName
      @item.creators.push(creator)
    return true
  $editor: @::$author
  $translator: @::$author

  $publisher: (value) -> @item.publisher = (@collapse(pub) for pub in value).join(' and ')
  $institution: @::$publisher
  $school: @::$publisher

  $address: (value) -> @item.place = @collapse(value)
  $location: @::$address

  $edition: (value) -> @item.edition = @collapse(value)

  $isbn: (value) -> @item.ISBN = @collapse(value)

  $date: (value) -> @item.date = @collapse(value)

  $booktitle: (value) -> @item.publicationTitle = @collapse(value)

  $journaltitle: (value) ->
    value = @collapse(value)
    if @fields['booktitle']
      @item.journalAbbreviation = value
    else
      @item.publicationTitle = value
    return true
  $journal: @::$journaltitle

  $pages: (value) ->
    debug('pages:', value)

    # https://github.com/fiduswriter/biblatex-csl-converter/issues/51
    pages = []
    for range in value
      if range.length == 1
        pages.push(@collapse(range[0]))
      else
        pages.push(@collapse(range[0]) + '-' + @collapse(range[1]))
    pages = pages.join(', ')

    if @type in ['book', 'thesis', 'manuscript']
      @item.numPages = pages
    else
      @item.pages = pages

    return true

  $volume: (value) -> @item.volume = @collapse(value)

  $doi: (value) -> @item.DOI = @collapse(value)

  $abstract: (value) -> @item.abstractNote = @collapse(value)

  $keywords: (value) ->
    @item.tags ||= []
    @item.tags = @item.tags.concat(value)
    @item.tags = @item.tags.sort().filter((item, pos, ary) -> !pos || item != ary[pos - 1])
    return true
  $keyword: @::$keywords

  $year: (value) ->
    value = @collapse(value)

    if @item.date
      @item.date += value if @item.date.indexOf(value) < 0
    else
      @item.date = value
    return true

  $month: (value) ->
    value = @collapse(value)

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

  $file: (value) ->
    value = @collapse(value)

    # :Better BibTeX.001/Users/heatherwright/Documents/Scientific Papers/AVX3W9~F.PDF:PDF
    if m = value.match(/^([^:]*):([^:]+):([^:]*)$/)
      title = m[1]
      path = m[2]
      mimeType = m[3]
    else
      path = value

    mimeType = (mimeType || '').toLowerCase()
    mimetype = 'application/pdf' if !mimeType && path.toLowerCase().endsWith('.pdf')
    mimeType = 'application/pdf' if mimeType.toLowerCase() == 'pdf'
    mimeType = undefined unless mimeType

    @item.attachments.push({
      title
      path
      mimeType
    })
    return true

  '$date-modified': -> true
  '$date-added': -> true
  '$added-at': -> true
  $timestamp: -> true

  $number: (value) ->
    value = @collapse(value)
    switch @type
      when 'report'                         then @item.reportNumber = value
      when 'book', 'bookSection', 'chapter' then @item.seriesNumber = value
      when 'patent'                         then @item.patentNumber = value
      else                                       @item.issue = value
    return true

  $issn: (value) -> @item.ISSN = @collapse(value)

  $url: (value, field) ->
    value = @collapse(value)

    if m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)
      url = m[2]
    else if field == 'url' || /^(https?:\/\/|mailto:)/i.test(value)
      url = value
    else
      url = nil

    return false unless url

    return (@item.url == url) if @item.url

    @item.url = url
    return true
  $howpublished: @::$url

  $type: (value) ->
    @item.sessionType = @item.websiteType = @item.manuscriptType = @item.genre = @item.postType = @item.sessionType = @item.letterType = @item.manuscriptType = @item.mapType = @item.presentationType = @item.regulationType = @item.reportType = @item.thesisType = @item.websiteType = @collapse(value)
    return true

  $lista: (value) ->
    return false unless @type == 'encyclopediaArticle' && !@item.title

    @item.title = @collapse(value)
    return true

  $annotation: (value) ->
    @item.notes.push(Zotero.Utilities.text2html(@collapse(value)))
    return true
  $comment: @::$annotation
  $annote: @::$annotation
  $review: @::$annotation
  $notes: @::$annotation

  $urldate: (value) -> @item.accessDate = @collapse(value)
  $lastchecked: @::$urldate

  $series: (value) -> @item.series = @collapse(value)

  $groups: (value) ->
    return true unless @groups
    throw new Error(@collapse(value))
    return

  $note: (value) ->
    @addToExtra(@collapse(value))
    return true

  $language: (value) ->
    language = @collapse(value)
    return true unless language

    switch language.toLowerCase()
      when 'en', 'eng', 'usenglish'
        language = 'English'
    @item.language = language
    return true
  $langid: @::$language

  $shorttitle: (value) -> @item.shortTitle = @collapse(value)

  $eprint: (value, field) ->
    ### Support for IDs exported by BibLaTeX ###
    return false unless @fields['eprinttype']

    eprint = @collapse(value)
    eprinttype = @collapse(@fields['eprinttype'])

    switch eprinttype.trim().toLowerCase()
      when 'arxiv' then @hackyFields.push("arXiv: #{eprint}")
      when 'jstor' then @hackyFields.push("JSTOR: #{eprint}")
      when 'pubmed' then @hackyFields.push("PMID: #{eprint}")
      when 'hdl' then @hackyFields.push("HDL: #{eprint}")
      when 'googlebooks' then @hackyFields.push("GoogleBooksID: #{eprint}")
      else
        return false
    return true
  $eprinttype: (value) -> @fields['eprint']

  $nationality: (value) -> @item.country = @collapse(value)

  $chapter: (value) -> @item.section = @collapse(value)

#ZoteroItem::$__note__ = ZoteroItem::$__key__ = -> true

#
#ZoteroItem::$__type__ = (value) ->
#  @item.thesisType = value if value in [ 'phdthesis', 'mastersthesis' ]
#  return true
#
#### these return the value which will be interpreted as 'true' ###
#ZoteroItem::$institution  = ZoteroItem::$organization = (value) -> @item.backupPublisher = value
#ZoteroItem::$school       = ZoteroItem::$institution  = ZoteroItem::$publisher = (value) -> @item.publisher = value
#
#ZoteroItem::$copyright    = (value) -> @item.rights = value
#ZoteroItem::$assignee     = (value) -> @item.assignee = value
#ZoteroItem::$issue        = (value) -> @item.issue = value
#
#### ZoteroItem::$lccn = (value) -> @item.callNumber = value ###
#ZoteroItem::$lccn = (value) -> @hackyFields.push("LCCB: #{value}")
#ZoteroItem::$pmid = ZoteroItem::$pmcid = (value, field) -> @hackyFields.push("#{field.toUpperCase()}: #{value}")
#ZoteroItem::$mrnumber = (value) -> @hackyFields.push("MR: #{value}")
#ZoteroItem::$zmnumber = (value) -> @hackyFields.push("Zbl: #{value}")
#
#ZoteroItem::$subtitle = (value) ->
#  @item.title = '' unless @item.title
#  @item.title = @item.title.trim()
#  value = value.trim()
#  if not /[-–—:!?.;]$/.test(@item.title) and not /^[-–—:.;¡¿]/.test(value)
#    @item.title += ': '
#  else
#  @item.title += ' ' if @item.title.length
#  @item.title += value
#  return true
#
#ZoteroItem::$fjournal = (value) ->
#  @item.journalAbbreviation = @item.publicationTitle if @item.publicationTitle
#  @item.publicationTitle = value
#  return true
#
#
#
#
#
