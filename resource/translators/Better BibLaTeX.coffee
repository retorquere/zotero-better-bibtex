Translator.fieldMap = {
  # Zotero          BibTeX
  place:            { name: 'location', enc: 'literal' }
  chapter:          { name: 'chapter' }
  edition:          { name: 'edition' }
  title:            { name: 'title', autoCase: true }
  volume:           { name: 'volume' }
  rights:           { name: 'rights' }
  ISBN:             { name: 'isbn' }
  ISSN:             { name: 'issn' }
  url:              { name: 'url' }
  DOI:              { name: 'doi' }
  shortTitle:       { name: 'shorttitle', autoCase: true }
  abstractNote:     { name: 'abstract' }
  numberOfVolumes:  { name: 'volumes' }
  versionNumber:    { name: 'version' }
  conferenceName:   { name: 'eventtitle' }
  numPages:         { name: 'pagetotal' }
  type:             { name: 'type' }
}

Translator.typeMap = {
  # BibTeX                            Zotero
  'book booklet manual proceedings':  'book'
  'incollection inbook':              'bookSection'
  'article misc':                     'journalArticle magazineArticle newspaperArticle'
  thesis:                             'thesis'
  letter:                             'email letter'
  movie:                              'film'
  artwork:                            'artwork'
  # =online because someone thinks that any object property starting with 'on' on any kind of object installs an event handler on a DOM
  # node
  '=online':                          'blogPost forumPost webpage'
  inproceedings:                      'conferencePaper'
  report:                             'report'
  legislation:                        'statute bill'
  jurisdiction:                       'case hearing'
  patent:                             'patent'
  audio:                              'audioRecording podcast radioBroadcast'
  video:                              'videoRecording tvBroadcast'
  software:                           'computerProgram'
  unpublished:                        'manuscript presentation'
  inreference:                        'encyclopediaArticle dictionaryEntry'
  misc:                               'interview map instantMessage document'
}

Translator.fieldEncoding = {
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
}

class DateField
  constructor: (date, locale, formatted, literal) ->
    parsed = Zotero.BetterBibTeX.parseDateToObject(date, locale)

    switch
      when !parsed
        @field = {}

      when parsed.literal
        @field = { name: literal, value: date }

      when (parsed.year || parsed.empty) && (parsed.year_end || parsed.empty_end)
        @field = { name: formatted, value: @format(parsed) + '/' + @format(parsed, '_end') }

      when parsed.year
        @field = { name: formatted, value: @format(parsed) }

      else
        @field = {}

  pad: (v, pad) ->
    return v if v.length >= pad.length
    return (pad + v).slice(-pad.length)

  format: (v, suffix = '') ->
    _v = {}
    for f in ['empty', 'year', 'month', 'day']
      _v[f] = v["#{f}#{suffix}"]

    return '' if _v.empty
    return "#{_v.year}-#{@pad(_v.month, '00')}-#{@pad(_v.day, '00')}" if _v.year && _v.month && _v.day
    return "#{_v.year}-#{@pad(_v.month, '00')}" if _v.year && _v.month
    return '' + _v.year

doExport = ->
  Zotero.write('\n')
  while item = Translator.nextItem()
    ref = new Reference(item)

    ref.referencetype = 'inbook' if item.itemType == 'bookSection' and ref.hasCreator('bookAuthor')
    ref.referencetype = 'collection' if item.itemType == 'book' and not ref.hasCreator('author') and ref.hasCreator('editor')
    ref.referencetype = 'mvbook' if ref.referencetype == 'book' and item.numberOfVolumes

    if m = item.publicationTitle?.match(/^arxiv:\s*([\S]+)/i)
      ref.add({ name: 'eprinttype', value: 'arxiv'})
      ref.add({ name: 'eprint', value: m[1] })
      delete item.publicationTitle

    if m = item.url?.match(/^http:\/\/www.jstor.org\/stable\/([\S]+)$/i)
      ref.add({ name: 'eprinttype', value: 'jstor'})
      ref.add({ name: 'eprint', value: m[1] })
      delete item.url
      ref.remove('url')

    if m = item.url?.match(/^http:\/\/books.google.com\/books?id=([\S]+)$/i)
      ref.add({ name: 'eprinttype', value: 'googlebooks'})
      ref.add({ name: 'eprint', value: m[1] })
      delete item.url
      ref.remove('url')

    if m = item.url?.match(/^http:\/\/www.ncbi.nlm.nih.gov\/pubmed\/([\S]+)$/i)
      ref.add({ name: 'eprinttype', value: 'pubmed'})
      ref.add({ name: 'eprint', value: m[1] })
      delete item.url
      ref.remove('url')

    for eprinttype in ['pmid', 'arxiv', 'jstor', 'hdl', 'googlebooks']
      if ref.has[eprinttype]
        if not ref.has.eprinttype
          ref.add({ name: 'eprinttype', value: eprinttype})
          ref.add({ name: 'eprint', value: ref.has[eprinttype].value })
        ref.remove(eprinttype)

    if item.archive and item.archiveLocation
      archive = true
      switch item.archive.toLowerCase()
        when 'arxiv'
          ref.add({ name: 'eprinttype', value: 'arxiv' })           unless ref.has.eprinttype
          ref.add({ name: 'eprintclass', value: item.callNumber })

        when 'jstor'
          ref.add({ name: 'eprinttype', value: 'jstor' })           unless ref.has.eprinttype

        when 'pubmed'
          ref.add({ name: 'eprinttype', value: 'pubmed' })          unless ref.has.eprinttype

        when 'hdl'
          ref.add({ name: 'eprinttype', value: 'hdl' })             unless ref.has.eprinttype

        when 'googlebooks', 'google books'
          ref.add({ name: 'eprinttype', value: 'googlebooks' })     unless ref.has.eprinttype

        else
          archive = false

      if archive
        ref.add({ name: 'eprint', value: item.archiveLocation })    unless ref.has.eprint

    ref.add({ name: 'langid', value: ref.language })

    ref.add({ name: 'number', value: item.docketNumber || item.publicLawNumber || item.reportNumber || item.seriesNumber || item.patentNumber || item.billNumber || item.episodeNumber || item.number })
    ref.add({ name: (if isNaN(parseInt(item.issue)) then 'issue' else 'number'), value: item.issue })

    switch item.itemType
      when 'case', 'gazette'
        ref.add({ name: 'journaltitle', value: item.reporter, preserveBibTeXVariables: true })
      when 'statute'
        ref.add({ name: 'journaltitle', value: item.code, preserveBibTeXVariables: true })

    if item.publicationTitle
      switch item.itemType
        when 'bookSection', 'conferencePaper', 'dictionaryEntry', 'encyclopediaArticle'
          ref.add({ name: 'booktitle', value: item.bookTitle || item.publicationTitle, preserveBibTeXVariables: true, autoCase: true})

        when 'magazineArticle', 'newspaperArticle'
          ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true})
          ref.add({ name: 'journalsubtitle', value: item.section }) if item.itemType == 'newspaperArticle'

        when 'journalArticle'
          if ref.isBibVar(item.publicationTitle)
            ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true })
          else
            abbr = Zotero.BetterBibTeX.keymanager.journalAbbrev(item)
            if Translator.useJournalAbbreviation && abbr
              ref.add({ name: 'journal', value: abbr, preserveBibTeXVariables: true })
            else
              ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true })
              ref.add({ name: 'shortjournal', value: abbr, preserveBibTeXVariables: true })

    ref.add({ name: 'booktitle', value: item.bookTitle || item.encyclopediaTitle || item.dictionaryTitle || item.proceedingsTitle, autoCase: true }) if not ref.has.booktitle

    ref.add({
      name: (if ref.referencetype in ['movie', 'video'] then 'booktitle' else 'titleaddon')
      value: item.websiteTitle || item.forumTitle || item.blogTitle || item.programTitle
      autoCase: ref.referencetype in ['movie', 'video']
    })
    ref.add({ name: 'series', value: item.seriesTitle || item.series })

    switch item.itemType
      when 'report', 'thesis'
        ref.add({ name: 'institution', value: item.institution || item.publisher || item.university, enc: 'literal' })

      when 'case', 'hearing'
        ref.add({ name: 'institution', value: item.court, enc: 'literal' })

      else
        ref.add({ name: 'publisher', value: item.publisher, enc: 'literal' })

    switch item.itemType
      when 'letter' then ref.add({ name: 'type', value: item.letterType || 'Letter', replace: true })

      when 'email'  then ref.add({ name: 'type', value: 'E-mail', replace: true })

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

    ref.add({ name: 'howpublished', value: item.presentationType || item.manuscriptType })

    ref.add({ name: 'note', value: item.meetingName, allowDuplicates: true })

    if item.creators and item.creators.length
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

      for creator in item.creators
        switch creator.creatorType
          when 'director'
            # 365.something
            if ref.referencetype in ['video', 'movie']
              creators.director.push(creator)
            else
              creators.author.push(creator)
          when 'author', 'interviewer', 'programmer', 'artist', 'podcaster', 'presenter'
            creators.author.push(creator)
          when 'bookAuthor'
            creators.bookauthor.push(creator)
          when 'commenter'
            creators.commentator.push(creator)
          when 'editor'
            creators.editor.push(creator)
          when 'inventor'
            creators.holder.push(creator)
          when 'translator'
            creators.translator.push(creator)
          when 'seriesEditor'
            creators.editorb.push(creator)
          when 'scriptwriter'
            # 365.something
            if ref.referencetype in ['video', 'movie']
              creators.scriptwriter.push(creator)
            else
              creators.editora.push(creator)

          else
            creators.editora.push(creator)

      for own field, value of creators
        ref.add({ name: field, value: value, enc: 'creators' })

      ref.add({ name: 'editoratype', value: 'collaborator' }) if creators.editora.length > 0
      ref.add({ name: 'editorbtype', value: 'redactor' }) if creators.editorb.length > 0

    ref.add({ name: 'urldate', value: Zotero.Utilities.strToISO(item.accessDate) }) if item.accessDate && item.url

    ref.add((new DateField(item.date, item.language, 'date', 'year')).field)

    switch
      when item.pages
        ref.add({ name: 'pages', value: item.pages.replace(/[-\u2012-\u2015\u2053]+/g, '--' )})
      when item.firstPage && item.lastPage
        ref.add({ name: 'pages', value: "#{item.firstPage}--#{item.lastPage}" })
      when item.firstPage
        ref.add({ name: 'pages', value: "#{item.firstPage}" })

    ref.add({ name: (if ref.has.note then 'annotation' else 'note'), value: item.extra, allowDuplicates: true })
    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    if item.notes and Translator.exportNotes
      for note in item.notes
        ref.add({ name: 'annotation', value: Zotero.Utilities.unescapeHTML(note.note), allowDuplicates: true })

    # 'juniorcomma' needs more thought, it isn't for *all* suffixes you want this. Or even at all.
    #ref.add({ name: 'options', value: (option for option in ['useprefix', 'juniorcomma'] when ref[option]).join(',') })
    ref.add({ name: 'options', value: 'useprefix=true' }) if ref.useprefix

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    # pre-process overrides for #381
    for own name, value of ref.override
      continue unless value.format == 'csl'

      switch
        when name == 'volume-title' && ref.item.itemType == 'book' && ref.has.title
          ref.add({name: 'maintitle', value: value.value, autoCase: true })
          [ref.has.title.bibtex, ref.has.maintitle.bibtex] = [ref.has.maintitle.bibtex, ref.has.title.bibtex]
          [ref.has.title.value, ref.has.maintitle.value] = [ref.has.maintitle.value, ref.has.title.value]

        when  name == 'volume-title' && ref.item.itemType == 'bookSection' && ref.has.booktitle
          ref.add({name: 'maintitle', value: value.value, autoCase: true })
          [ref.has.booktitle.bibtex, ref.has.maintitle.bibtex] = [ref.has.maintitle.bibtex, ref.has.booktitle.bibtex]
          [ref.has.booktitle.value, ref.has.maintitle.value] = [ref.has.maintitle.value, ref.has.booktitle.value]

        else
          continue

      delete ref.override[name]

    ref.complete()

  Translator.exportGroups()
  Zotero.write('\n')
  return
