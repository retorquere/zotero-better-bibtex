Reference = require('./bibtex/reference.coffee')
Exporter = require('./lib/exporter.coffee')
debug = require('./lib/debug.coffee')
JSON5 = require('json5')
htmlEscape = require('./lib/html-escape.coffee')
BibTeXParser = require('biblatex-csl-converter').BibLatexParser
#BibTeXParser = require('../../biblatex-csl-converter').BibLatexParser

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
  return found

importGroup = (group, itemIDs, root) ->
  collection = new Zotero.Collection()
  collection.type = 'collection'
  collection.name = group.name
  collection.children = ({type: 'item', id: itemIDs[citekey]} for citekey in group.references when itemIDs[citekey])

  for subgroup in group.groups || []
    collection.children.push(importGroup(subgroup, itemIDs))

  collection.complete() if root
  return collection

Translator.doImport = ->
  input = ''
  while (read = Zotero.read(0x100000)) != false
    input += read
  bib = importReferences(input)

  if bib.errors.length
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

  if Translator.preferences.csquotes
    ZoteroItem::tags.enquote = {open: Translator.preferences.csquotes[0], close: Translator.preferences.csquotes[1]}

  itemIDS = {}
  for id, ref of bib.references
    itemIDS[ref.entry_key] = id if ref.entry_key # Endnote has no citation keys
    new ZoteroItem(id, ref, bib.groups)

  for group in bib.groups || []
    importGroup(group, itemIDS, true)
  return

class ZoteroItem
  constructor: (@id, @bibtex, @groups) ->
    @bibtex.bib_type = @bibtex.bib_type.toLowerCase()
    @type = @typeMap[@bibtex.bib_type] || 'journalArticle'

    @item = new Zotero.Item(@type)
    @item.itemID = @id
    @biblatexdata = {}
#    @item.notes.push({ note: ('The following fields were not imported:<br/>' + @bibtex.__note__).trim(), tags: ['#BBT Import'] }) if @bibtex.__note__
    @import()
#    if Translator.preferences.rawImports
#      @item.tags ?= []
#      @item.tags.push(Translator.preferences.rawLaTag)
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
    "(": '\u207D'
    ")": '\u207E'
    "+": '\u207A'
    "=": '\u207C'
    '-': '\u207B'
    '\u00C6': '\u1D2D'
    '\u014B': '\u1D51'
    '\u018E': '\u1D32'
    '\u0222': '\u1D3D'
    '\u0250': '\u1D44'
    '\u0251': '\u1D45'
    '\u0254': '\u1D53'
    '\u0259': '\u1D4A'
    '\u025B': '\u1D4B'
    '\u025C': '\u1D4C'
    '\u0263': '\u02E0'
    '\u0266': '\u02B1'
    '\u026F': '\u1D5A'
    '\u0279': '\u02B4'
    '\u027B': '\u02B5'
    '\u0281': '\u02B6'
    '\u0294': '\u02C0'
    '\u0295': '\u02C1'
    '\u0295': '\u02E4'
    '\u03B2': '\u1D5D'
    '\u03B3': '\u1D5E'
    '\u03B4': '\u1D5F'
    '\u03C6': '\u1D60'
    '\u03C7': '\u1D61'
    '\u1D02': '\u1D46'
    '\u1D16': '\u1D54'
    '\u1D17': '\u1D55'
    '\u1D1D': '\u1D59'
    '\u1D25': '\u1D5C'
    '\u2212': '\u207B'
    '\u2218': '\u00B0'
    '\u4E00': '\u3192'
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
    A: '\u1D2C'
    B: '\u1D2E'
    D: '\u1D30'
    E: '\u1D31'
    G: '\u1D33'
    H: '\u1D34'
    I: '\u1D35'
    J: '\u1D36'
    K: '\u1D37'
    L: '\u1D38'
    M: '\u1D39'
    N: '\u1D3A'
    O: '\u1D3C'
    P: '\u1D3E'
    R: '\u1D3F'
    T: '\u1D40'
    U: '\u1D41'
    W: '\u1D42'
    a: '\u1D43'
    b: '\u1D47'
    d: '\u1D48'
    e: '\u1D49'
    g: '\u1D4D'
    h: '\u02B0'
    i: '\u2071'
    j: '\u02B2'
    k: '\u1D4F'
    l: '\u02E1'
    m: '\u1D50'
    n: '\u207F'
    o: '\u1D52'
    p: '\u1D56'
    r: '\u02B3'
    s: '\u02E2'
    t: '\u1D57'
    u: '\u1D58'
    v: '\u1D5B'
    w: '\u02B7'
    x: '\u02E3'
    y: '\u02B8'
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
  tags: {
    strong: {open:'<b>', close: '</b>'},
    em: {open:'<i>', close: '</i>'},
    sub: {open:'<sub>', close: '</sub>'},
    sup: {open:'<sup>', close: '</sup>'},
    smallcaps: {open:'<span style="font-variant:small-caps;">', close: '</span>'},
    nocase: {open:'', close: ''},
    enquote: {open:'“', close: '”'},
    url: {open:'', close: ''},
    'undefined': {open:'[', close: ']'}
   }
  unparse: (text, allowtilde) ->
    return (@unparse(elt) for elt in text).join(' and ') if Array.isArray(text) && Array.isArray(text[0])

    return text if typeof text in ['string', 'number']

    # split out sup/sub text that can be unicodified
    chunks = []
    for node in text
      if node.type == 'variable'
        chunks.push({text: node.attrs.variable, marks: []})
        continue

      if !node.marks
        chunks.push(node)
        continue

      sup = false
      sub = false
      nosupb = node.marks.filter((mark) ->
        sup ||= mark.type == 'sup'
        sub ||= mark.type == 'sub'
        return mark.type not in ['sup', 'sub']
      )

      if sup == sub # !xor
        chunks.push(node)
        continue

      tr = if sup then @sup else @sub
      unicoded = ''
      for c, i in Zotero.Utilities.XRegExp.split(node.text, '')
        if sup && c in [ '\u00B0' ] # spurious mark
          unicoded += c
        else if tr[c]
          unicoded += tr[c]
        else
          unicoded = false
          break
      if unicoded
        node.text = unicoded
        node.marks = nosupb
      chunks.push(node)

#        switch
#          when tr[c] && (i == 0 || !chunks[chunks.length - 1].unicoded) # can be replaced but not appended
#            chunks.push({text: tr[c], marks: nosupb, unicoded: true})
#          when tr[c]
#            chunks[chunks.length - 1].text += tr[c] # can be replaced and appended
#          when i == 0 || chunks[chunks.length - 1].unicoded # cannot be replaced and and cannot be appended
#            chunks.push({text: c, marks: node.marks})
#          else
#            chunks[chunks.length - 1].text += c # cannot be replaced but can be appended

    # convert to string
    html = ''
    lastMarks = []
    for node in chunks
      if node.type == 'variable'
        # This is an undefined variable
        # This should usually not happen, as CSL doesn't know what to
        # do with these. We'll put them into an unsupported tag.
        html += '' + @tags.undefined.open + node.attrs.variable + @tags.undefined.close
        continue

      newMarks = []
      if node.marks
        for mark in node.marks
          newMarks.push(mark.type)

      # close all tags that are not present in current text node.
      closing = false
      closeTags = []
      for mark, index in lastMarks
        closing = true if mark != newMarks[index]
        closeTags.push @tags[mark].close if closing
      # Add close tags in reverse order to close innermost tags
      # first.
      closeTags.reverse()

      html += closeTags.join('')
      # open all new tags that were not present in the last text node.
      opening = false
      for mark, index in newMarks
        opening = true if mark != lastMarks[index]
        html += @tags[mark].open if opening

      html += node.text
      lastMarks = newMarks

    # Close all still open tags
    for mark in lastMarks.slice().reverse()
      html += @tags[mark].close

    html = html.replace(/ \u00A0/g, ' ~') # if allowtilde
    html = html.replace(/\u00A0 /g, '~ ') # if allowtilde
    # html = html.replace(/\uFFFD/g, '') # we have no use for the unicode replacement character
    return html

  # for the really "special" jabref groups 4 format
  findGroup: (name, groups) ->
    return null unless @groups
    groups ||= @groups

    for group in groups
      return group if group.name == name
      return group if group = @findGroup(name, group.groups || [])

    return null

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

      continue if @["$#{field}"]?(value, field)
      @addToExtraData(field, @unparse(value))

    if @type in ['conferencePaper', 'paper-conference'] and @item.publicationTitle and not @item.proceedingsTitle
      @item.proceedingsTitle = @item.publicationTitle
      delete @item.publicationTitle

    @addToExtra("bibtex: #{@bibtex.entry_key}") if @bibtex.entry_key # Endnote has no citation keys in their bibtex

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
    if @item.extra and @item.extra != ''
      @item.extra += " \n#{str}"
    else
      @item.extra = str
    return

  addToExtraData: (key, value) ->
    @biblatexdata[key] = @unparse(value)
    @biblatexdatajson = true if key.match(/[\[\]=;\r\n]/) || value.match(/[\[\]=;\r\n]/)
    return

  $title: (value) ->
    if @type == 'encyclopediaArticle'
      @item.publicationTitle = @unparse(value)
    else
      @item.title = @unparse(value)
    return true

  $author: (value, field) ->
    for name in value
      creator = {
        creatorType: field
      }
      if name.literal
        creator.lastName = @unparse(name.literal)
        creator.fieldMode = 1
      else
        creator.firstName = @unparse(name.given)
        creator.lastName = @unparse(name.family)
        creator.lastName = @unparse(name.prefix) + ' ' + creator.lastName if name.prefix
        creator.lastName = creator.lastName + ', ' + @unparse(name.suffix) if name.suffix
        # creator = Zotero.Utilities.cleanAuthor(creator, field, false)
        creator.fieldMode = 1 if creator.lastName && !creator.firstName
      @item.creators.push(creator)
    return true
  $editor: @::$author
  $translator: @::$author

  $publisher: (value) ->
    @item.publisher ||= ''
    @item.publisher += ' / ' if @item.publisher
    @item.publisher += (@unparse(pub) for pub in value).join(' and ')
    return true
  $institution: @::$publisher
  $school: @::$publisher

  $address: (value) -> @item.place = @unparse(value)
  $location: @::$address

  $edition: (value) -> @item.edition = @unparse(value)

  $isbn: (value) -> @item.ISBN = @unparse(value)

  $date: (value) -> @item.date = @unparse(value)

  $booktitle: (value) -> @item.publicationTitle = @unparse(value)

  $journaltitle: (value) ->
    value = @unparse(value)
    if @fields['booktitle']
      @item.journalAbbreviation = value
    else
      @item.publicationTitle = value
    return true
  $journal: @::$journaltitle

  $pages: (value) ->
    # https://github.com/fiduswriter/biblatex-csl-converter/issues/51
    pages = []
    for range in value
      if range.length == 1
        p = @unparse(range[0])
        pages.push(p) if p
      else
        p0 = @unparse(range[0])
        p1 = @unparse(range[1])
        if p0.indexOf('-') >= 0 || p1.indexOf('-') >= 0
          pages.push("#{p0}--#{p1}")
        else if p0 || p1
          pages.push("#{p0}-#{p1}")
    pages = pages.join(', ')

    return true unless pages

    if @type in ['book', 'thesis', 'manuscript']
      @item.numPages = pages
    else
      @item.pages = pages

    return true

  $volume: (value) -> @item.volume = @unparse(value)

  $doi: (value) -> @item.DOI = @unparse(value)

  $abstract: (value) -> @item.abstractNote = @unparse(value, true)

  $keywords: (value) ->
    value = (@unparse(tag).replace(/\n+/g, ' ') for tag in value)
    value = value[0].split(/\s*;\s*/) if value.length == 1 && value[0].indexOf(';') > 0
    @item.tags ||= []
    @item.tags = @item.tags.concat(value)
    @item.tags = @item.tags.sort().filter((item, pos, ary) -> !pos || item != ary[pos - 1])
    return true
  $keyword: @::$keywords

  $year: (value) ->
    value = @unparse(value)

    if @item.date
      @item.date += value if @item.date.indexOf(value) < 0
    else
      @item.date = value
    return true

  $month: (value) ->
    value = @unparse(value)

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
    value = @unparse(value)

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
    value = @unparse(value)
    switch @type
      when 'report'                         then @item.reportNumber = value
      when 'book', 'bookSection', 'chapter' then @item.seriesNumber = value
      when 'patent'                         then @item.patentNumber = value
      else                                       @item.issue = value
    return true

  $issn: (value) -> @item.ISSN = @unparse(value)

  $url: (value, field) ->
    value = @unparse(value)

    if m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)
      url = m[2]
    else if field == 'url' || /^(https?:\/\/|mailto:)/i.test(value)
      url = value
    else
      url = null

    return false unless url

    return (@item.url == url) if @item.url

    @item.url = url
    return true
  $howpublished: @::$url

  $type: (value) ->
    @item.sessionType = @item.websiteType = @item.manuscriptType = @item.genre = @item.postType = @item.sessionType = @item.letterType = @item.manuscriptType = @item.mapType = @item.presentationType = @item.regulationType = @item.reportType = @item.thesisType = @item.websiteType = @unparse(value)
    return true

  $lista: (value) ->
    return false unless @type == 'encyclopediaArticle' && !@item.title

    @item.title = @unparse(value)
    return true

  $annotation: (value) ->
    @item.notes.push(Zotero.Utilities.text2html(@unparse(value)))
    return true
  $comment: @::$annotation
  $annote: @::$annotation
  $review: @::$annotation
  $notes: @::$annotation

  $urldate: (value) -> @item.accessDate = @unparse(value)
  $lastchecked: @::$urldate

  $series: (value) -> @item.series = @unparse(value)

  # if the biblatex-csl-converter hasn't already taken care of it it is a remnant of the horribly broken JabRaf 3.8.1
  # groups format -- shoo, we don't want you
  $groups: (value) -> true

  $note: (value) ->
    @addToExtra(@unparse(value))
    return true

  $language: (value, field) ->
    if field == 'language'
      language = (@unparse(lang) for lang in value).join(' and ')
    else
      language = @unparse(value)
    return true unless language

    switch language.toLowerCase()
      when 'en', 'eng', 'usenglish'
        language = 'English'
    @item.language = language
    return true
  $langid: @::$language

  $shorttitle: (value) -> @item.shortTitle = @unparse(value)

  $eprint: (value, field) ->
    ### Support for IDs exported by BibLaTeX ###
    eprinttype = @fields['eprinttype'] ||  @fields['archiveprefix']
    return false unless eprinttype

    eprint = @unparse(value)
    eprinttype = @unparse(eprinttype)

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
  $archiveprefix: @::$eprinttype

  $nationality: (value) -> @item.country = @unparse(value)

  $chapter: (value) -> @item.section = @unparse(value)

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
