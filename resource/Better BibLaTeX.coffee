Reference = require('./bibtex/reference.coffee')
Exporter = require('./bibtex/exporter.coffee')
debug = require('./lib/debug.coffee')
datefield = require('./bibtex/datefield.coffee')

Reference::fieldEncoding = {
  url: 'url'
  doi: 'verbatim'
  eprint: 'verbatim'
  eprintclass: 'verbatim'
  crossref: 'raw'
  xdata: 'raw'
  xref: 'raw'
  entrykey: 'raw'
  childentrykey: 'raw'
  verba: 'verbatim'
  verbb: 'verbatim'
  verbc: 'verbatim'
  institution: 'literal'
  publisher: 'literal'
  location: 'literal'
}
Reference::caseConversion = {
  title: true,
  shorttitle: true,
  origtitle: true,
  booktitle: true,
  maintitle: true,
  type: true,
  eventtitle: true,
}

Reference::requiredFields =
  article: ['author', 'title', 'journaltitle', 'year/date']
  book: ['author', 'title', 'year/date']
  mvbook: ['book']
  inbook: ['author', 'title', 'booktitle', 'year/date']
  bookinbook: ['inbook']
  suppbook: ['inbook']
  booklet: ['author/editor', 'title', 'year/date']
  collection: ['editor', 'title', 'year/date']
  mvcollection: ['collection']
  incollection: ['author', 'title', 'booktitle', 'year/date']
  suppcollection: ['incollection']
  manual: ['author/editor', 'title', 'year/date']
  misc: ['author/editor', 'title', 'year/date']
  online: ['author/editor', 'title', 'year/date', 'url']
  patent: ['author', 'title', 'number', 'year/date']
  periodical: ['editor', 'title', 'year/date']
  suppperiodical: ['article']
  proceedings: ['title', 'year/date']
  mvproceedings: ['proceedings']
  inproceedings: ['author', 'title', 'booktitle', 'year/date']
  reference: ['collection']
  mvreference: ['collection']
  inreference: ['incollection']
  report: ['author', 'title', 'type', 'institution', 'year/date']
  thesis: ['author', 'title', 'type', 'institution', 'year/date']
  unpublished: ['author', 'title', 'year/date']

  # semi aliases (differing fields)
  mastersthesis: ['author', 'title', 'institution', 'year/date']
  techreport: ['author', 'title', 'institution', 'year/date']

Reference::requiredFields.conference = Reference::requiredFields.inproceedings
Reference::requiredFields.electronic = Reference::requiredFields.online
Reference::requiredFields.phdthesis = Reference::requiredFields.mastersthesis
Reference::requiredFields.www = Reference::requiredFields.online

Reference::addCreators = ->
  return unless @item.creators and @item.creators.length

  creators = {
    author: []
    bookauthor: []
    commentator: []
    editor: []
    editora: []
    editorb: []
    holder: []
    translator: []
    scriptwriter: []
    director: []
  }
  for creator in @item.creators
    kind = switch creator.creatorType
      when 'director'
        # 365.something
        if @referencetype in ['video', 'movie']
          'director'
        else
          'author'
      when 'author', 'interviewer', 'programmer', 'artist', 'podcaster', 'presenter'
        'author'
      when 'bookAuthor'
        'bookauthor'
      when 'commenter'
        'commentator'
      when 'editor'
        'editor'
      when 'inventor'
        'holder'
      when 'translator'
        'translator'
      when 'seriesEditor'
        'editorb'
      when 'scriptwriter'
        # 365.something
        if @referencetype in ['video', 'movie']
          'scriptwriter'
        else
          'editora'

      else
        'editora'

    creators[kind].push(creator)

  for own field, value of creators
    @remove(field)
    @add({ name: field, value: value, enc: 'creators' })

  @add({ editoratype: 'collaborator' }) if creators.editora.length > 0
  @add({ editorbtype: 'redactor' }) if creators.editorb.length > 0
  return

Reference::typeMap =
  csl:
    article               : 'article'
    'article-journal'     : 'article'
    'article-magazine'    : {type: 'article', subtype: 'magazine'}
    'article-newspaper'   : {type: 'article', subtype: 'newspaper'}
    bill                  : 'legislation'
    book                  : 'book'
    broadcast             : {type: 'misc', subtype: 'broadcast'}
    chapter               : 'incollection'
    dataset               : 'data'
    entry                 : 'inreference'
    'entry-dictionary'    : 'inreference'
    'entry-encyclopedia'  : 'inreference'
    figure                : 'image'
    graphic               : 'image'
    interview             : {type: 'misc', subtype: 'interview'}
    legal_case            : 'jurisdiction'
    legislation           : 'legislation'
    manuscript            : 'unpublished'
    map                   : {type: 'misc', subtype: 'map'}
    motion_picture        : 'movie'
    musical_score         : 'audio'
    pamphlet              : 'booklet'
    'paper-conference'    : 'inproceedings'
    patent                : 'patent'
    personal_communication: 'letter'
    post                  : 'online'
    'post-weblog'         : 'online'
    report                : 'report'
    review                : 'review'
    'review-book'         : 'review'
    song                  : 'music'
    speech                : {type: 'misc', subtype: 'speech'}
    thesis                : 'thesis'
    treaty                : 'legal'
    webpage               : 'online'
  zotero:
    artwork            : 'artwork'
    audioRecording     : 'audio'
    bill               : 'legislation'
    blogPost           : 'online'
    book               : 'book'
    bookSection        : 'incollection'
    case               : 'jurisdiction'
    computerProgram    : 'software'
    conferencePaper    : 'inproceedings'
    dictionaryEntry    : 'inreference'
    document           : 'misc'
    email              : 'letter'
    encyclopediaArticle: 'inreference'
    film               : 'movie'
    forumPost          : 'online'
    hearing            : 'jurisdiction'
    instantMessage     : 'misc'
    interview          : 'misc'
    journalArticle     : 'article'
    letter             : 'letter'
    magazineArticle    : {type: 'article', subtype: 'magazine'}
    manuscript         : 'unpublished'
    map                : 'misc'
    newspaperArticle   : {type: 'article', subtype: 'newspaper'}
    patent             : 'patent'
    podcast            : 'audio'
    presentation       : 'unpublished'
    radioBroadcast     : 'audio'
    report             : 'report'
    statute            : 'legislation'
    thesis             : 'thesis'
    tvBroadcast        : 'video'
    videoRecording     : 'video'
    webpage            : 'online'

BetterBibTeX.initialize = ->
  Reference.installPostscript()
  return

BetterBibTeX.doExport = ->
  debug('Translation started with prefs', BetterBibTeX.preferences)

  Exporter = new Exporter()

  Zotero.write('\n')
  while item = Exporter.nextItem()
    ref = new Reference(item)

    ref.referencetype = 'inbook' if item.__type__ in ['bookSection', 'chapter'] and ref.hasCreator('bookAuthor')
    ref.referencetype = 'collection' if item.__type__ == 'book' and not ref.hasCreator('author') and ref.hasCreator('editor')
    ref.referencetype = 'mvbook' if ref.referencetype == 'book' and item.numberOfVolumes

    if m = item.url?.match(/^http:\/\/www.jstor.org\/stable\/([\S]+)$/i)
      ref.add({ eprinttype: 'jstor'})
      ref.add({ eprint: m[1] })
      delete item.url
      ref.remove('url')

    if m = item.url?.match(/^http:\/\/books.google.com\/books?id=([\S]+)$/i)
      ref.add({ eprinttype: 'googlebooks'})
      ref.add({ eprint: m[1] })
      delete item.url
      ref.remove('url')

    if m = item.url?.match(/^http:\/\/www.ncbi.nlm.nih.gov\/pubmed\/([\S]+)$/i)
      ref.add({ eprinttype: 'pubmed'})
      ref.add({ eprint: m[1] })
      delete item.url
      ref.remove('url')

    for eprinttype in ['pmid', 'arxiv', 'jstor', 'hdl', 'googlebooks']
      if ref.has[eprinttype]
        if not ref.has.eprinttype
          ref.add({ eprinttype: eprinttype})
          ref.add({ eprint: ref.has[eprinttype].value })
        ref.remove(eprinttype)

    if item.archive and item.archiveLocation
      archive = true
      switch item.archive.toLowerCase()
        when 'arxiv'
          ref.add({ eprinttype: 'arxiv' })           unless ref.has.eprinttype
          ref.add({ eprintclass: item.callNumber })

        when 'jstor'
          ref.add({ eprinttype: 'jstor' })           unless ref.has.eprinttype

        when 'pubmed'
          ref.add({ eprinttype: 'pubmed' })          unless ref.has.eprinttype

        when 'hdl'
          ref.add({ eprinttype: 'hdl' })             unless ref.has.eprinttype

        when 'googlebooks', 'google books'
          ref.add({ eprinttype: 'googlebooks' })     unless ref.has.eprinttype

        else
          archive = false

      if archive
        ref.add({ eprint: item.archiveLocation })    unless ref.has.eprint

    ref.add({ langid: ref.language })

    ref.add({ location: item.place })
    ref.add({ chapter: item.chapter })
    ref.add({ edition: item.edition })
    ref.add({ name: 'title', value: item.title })
    ref.add({ volume: item.volume })
    ref.add({ rights: item.rights })
    ref.add({ isbn: item.ISBN })
    ref.add({ issn: item.ISSN })
    ref.add({ url: item.url })
    ref.add({ doi: item.DOI })
    ref.add({ shorttitle: item.shortTitle })
    ref.add({ abstract: item.abstractNote })
    ref.add({ volumes: item.numberOfVolumes })
    ref.add({ version: item.versionNumber })
    ref.add({ eventtitle: item.conferenceName })
    ref.add({ pagetotal: item.numPages })
    ref.add({ type: item.type })

    ref.add({ number: item.seriesNumber || item.number })
    ref.add({ name: (if isNaN(parseInt(item.issue)) || (( '' + parseInt(item.issue)) != ('' + item.issue))  then 'issue' else 'number'), value: item.issue })

    switch item.__type__
      when 'case', 'gazette', 'legal_case'
        ref.add({ name: 'journaltitle', value: item.reporter, preserveBibTeXVariables: true })
      when 'statute', 'bill', 'legislation'
        ref.add({ name: 'journaltitle', value: item.code, preserveBibTeXVariables: true })

    if item.publicationTitle
      switch item.__type__
        when 'bookSection', 'conferencePaper', 'dictionaryEntry', 'encyclopediaArticle', 'chapter'
          ref.add({ name: 'booktitle', value: item.bookTitle || item.publicationTitle, preserveBibTeXVariables: true })

        when 'magazineArticle', 'newspaperArticle', 'article-magazine', 'article-newspaper'
          ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true})
          ref.add({ journalsubtitle: item.section }) if item.__type__ in ['newspaperArticle', 'article-newspaper']

        when 'journalArticle', 'article', 'article-journal'
          if ref.isBibVar(item.publicationTitle)
            ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true })
          else
            if BetterBibTeX.options.useJournalAbbreviation && item.journalAbbrev
              ref.add({ name: 'journaltitle', value: item.journalAbbrev, preserveBibTeXVariables: true })
            else if BetterBibTeX.BetterBibLaTeX && item.publicationTitle.match(/arxiv:/i)
              ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true })
              ref.add({ name: 'shortjournal', value: item.journalAbbrev, preserveBibTeXVariables: true })
            else
              ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true })
              ref.add({ name: 'shortjournal', value: item.journalAbbrev, preserveBibTeXVariables: true })

        else
          ref.add({ journaltitle: item.publicationTitle}) if ! ref.has.journaltitle && item.publicationTitle != item.title

    ref.add({ name: 'booktitle', value: item.bookTitle || item.encyclopediaTitle || item.dictionaryTitle || item.proceedingsTitle }) if not ref.has.booktitle
    ref.add({ name: 'booktitle', value: item.websiteTitle || item.forumTitle || item.blogTitle || item.programTitle }) if ref.referencetype in ['movie', 'video'] and not ref.has.booktitle

    if item.multi?._keys?.title && (main = item.multi?.main?.title || item.language)
      languages = Object.keys(item.multi._keys.title).filter((lang) -> lang != main)
      main += '-'
      languages.sort((a, b) ->
        return 0 if a == b
        return -1 if a.indexOf(main) == 0 && b.indexOf(main) != 0
        return 1 if a.indexOf(main) != 0 && b.indexOf(main) == 0
        return -1 if a < b
        return 1
      )
      for lang, i in languages
        ref.add(name: (if i == 0 then 'titleaddon' else 'user' + String.fromCharCode('d'.charCodeAt() + i)), value: item.multi._keys.title[lang])

    ref.add({ series: item.seriesTitle || item.series })

    switch item.__type__
      when 'report', 'thesis'
        ref.add({ institution: item.institution || item.publisher || item.university })

      when 'case', 'hearing', 'legal_case'
        ref.add({ institution: item.court })

      else
        ref.add({ publisher: item.publisher })

    switch item.__type__
      when 'letter', 'personal_communication'
        ref.add({ name: 'type', value: item.letterType || 'Letter', replace: true })

      when 'email'
        ref.add({ name: 'type', value: 'E-mail', replace: true })

      when 'thesis'
        thesistype = item.thesisType?.toLowerCase()
        if thesistype in ['phdthesis', 'mastersthesis']
          ref.referencetype = thesistype
          ref.remove('type')
        else
          ref.add({ name: 'type', value: item.thesisType, replace: true })

      when 'report'
        if (item.type || '').toLowerCase().trim() == 'techreport'
          ref.referencetype = 'techreport'
        else
          ref.add({ name: 'type', value: item.type, replace: true })

      else
        ref.add({ name: 'type', value: item.type || item.websiteType || item.manuscriptType, replace: true })

    ref.add({ howpublished: item.presentationType || item.manuscriptType })

    ref.add({ name: 'eventtitle', value: item.meetingName })

    ref.addCreators()

    ref.add({ urldate: Zotero.Utilities.strToISO(item.accessDate) }) if item.accessDate && item.url

    if item.date
      date = Zotero.BetterBibTeX.parseDate(item.date)
      debug('found date', date)
      ref.add(datefield(date, 'date', 'year'))
      ref.add(datefield(date.origdate, 'origdate', 'origdate'))

    switch
      when item.pages
        ref.add({ pages: item.pages.replace(/[-\u2012-\u2015\u2053]+/g, '--' )})
      when item.firstPage && item.lastPage
        ref.add({ pages: "#{item.firstPage}--#{item.lastPage}" })
      when item.firstPage
        ref.add({ pages: "#{item.firstPage}" })

    ref.add({ name: (if ref.has.note then 'annotation' else 'note'), value: item.extra, allowDuplicates: true })
    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    if item.notes and BetterBibTeX.options.exportNotes
      for note in item.notes
        ref.add({ name: 'annotation', value: Zotero.Utilities.unescapeHTML(note.note), allowDuplicates: true, html: true })

    ###
    # 'juniorcomma' needs more thought, it isn't for *all* suffixes you want this. Or even at all.
    #ref.add({ name: 'options', value: (option for option in ['useprefix', 'juniorcomma'] when ref[option]).join(',') })
    ###
    ref.add({ options: 'useprefix=true' }) if ref.useprefix

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    if item.volumeTitle # #381
      debug('volumeTitle: true, type:', item._type__, 'has:', Object.keys(ref.has))
      if item.__type__ == 'book' && ref.has.title
        debug('volumeTitle: for book, type:', item.__type__, 'has:', Object.keys(ref.has))
        ref.add({name: 'maintitle', value: item.volumeTitle })
        [ref.has.title.bibtex, ref.has.maintitle.bibtex] = [ref.has.maintitle.bibtex, ref.has.title.bibtex]
        [ref.has.title.value, ref.has.maintitle.value] = [ref.has.maintitle.value, ref.has.title.value]

      if item.__type__ in ['bookSection', 'chapter'] && ref.has.booktitle
        debug('volumeTitle: for bookSection, type:', item.__type__, 'has:', Object.keys(ref.has))
        ref.add({name: 'maintitle', value: item.volumeTitle })
        [ref.has.booktitle.bibtex, ref.has.maintitle.bibtex] = [ref.has.maintitle.bibtex, ref.has.booktitle.bibtex]
        [ref.has.booktitle.value, ref.has.maintitle.value] = [ref.has.maintitle.value, ref.has.booktitle.value]

    ref.complete()

  Exporter.complete()
  Zotero.write('\n')
  return
