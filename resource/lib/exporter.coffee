debug = require('../lib/debug.coffee')
JSON5 = require('json5')
Citekey = require('../../content/keymanager/get-set.coffee')
JabRef = require('../bibtex/jabref.coffee') # not so nice... BibTeX-specific code in general exporter lib
collections = require('./collections.coffee')

class Exporter
  constructor: ->
    return Exporter::instance if Exporter::instance
    Exporter::instance = @

    @extractFieldsKVRE = new RegExp("^\\s*(#{Object.keys(Exporter::CSLVariables).join('|')}|LCCN|MR|Zbl|arXiv|JSTOR|HDL|GoogleBooksID)\\s*:\\s*(.+)\\s*$", 'i')

    # why?
    for name, v of @CSLVariables
      v.name = name

    @preamble = {DeclarePrefChars: ''}
    @attachmentCounter = 0

    @caching = !BetterBibTeX.options.exportFileData

    @collections = collections()
    @jabref = new JabRef(@collections)

    @context = {
      exportCharset: (BetterBibTeX.options.exportCharset || 'UTF-8').toUpperCase()
      exportNotes: !!BetterBibTeX.options.exportNotes
      translatorID: BetterBibTeX.header.translatorID
      useJournalAbbreviation: !!BetterBibTeX.options.useJournalAbbreviation
    }

  # candidate for removal
  locale: (language) ->
    if !@languages.locales[language]
      ll = language.toLowerCase()
      for locale in @languages.langs
        for k, v of locale
          @languages.locales[language] = locale[1] if ll == v
        break if @languages.locales[language]
      @languages.locales[language] ||= language

    return @languages.locales[language]

  ### http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables ###
  CSLVariables: {
    #'abstract':                    {}
    #'annote':                      {}
    archive:                        {}
    'archive_location':             {}
    'archive-place':                {}
    authority:                      { BibLaTeX: 'institution' }
    'call-number':                  { BibTeX: 'lccn' }
    #'citation-label':              {}
    #'citation-number':             {}
    'collection-title':             {}
    'container-title':
      BibLaTeX: ->
        return switch @item.__type__
          when 'film', 'tvBroadcast', 'videoRecording', 'motion_picture' then 'booktitle'
          when 'bookSection', 'chapter' then 'maintitle'
          else 'journaltitle'

    'container-title-short':        {}
    dimensions:                     {}
    DOI:                            { BibTeX: 'doi', BibLaTeX: 'doi' }
    event:                          {}
    'event-place':                  {}
    #'first-reference-note-number': {}
    genre:                          {}
    ISBN:                           { BibTeX: 'isbn', BibLaTeX: 'isbn' }
    ISSN:                           { BibTeX: 'issn', BibLaTeX: 'issn' }
    jurisdiction:                   {}
    keyword:                        {}
    locator:                        {}
    medium:                         {}
    #'note':                        {}
    'original-publisher':           { BibLaTeX: 'origpublisher', type: 'literal' }
    'original-publisher-place':     { BibLaTeX: 'origlocation', type: 'literal' }
    'original-title':               { BibLaTeX: 'origtitle' }
    page:                           {}
    'page-first':                   {}
    PMCID:                          {}
    PMID:                           {}
    publisher:                      {}
    'publisher-place':              { BibLaTeX: 'location', type: 'literal' }
    references:                     {}
    'reviewed-title':               {}
    scale:                          {}
    section:                        {}
    source:                         {}
    status:                         { BibLaTeX: 'pubstate' }
    title:                          { BibLaTeX: -> (if @referencetype == 'book' then 'maintitle' else null) }
    'title-short':                  {}
    URL:                            {}
    version:                        {}
    'volume-title':                 { field: 'volumeTitle' }
    'year-suffix':                  {}
    'chapter-number':               {}
    'collection-number':            {}
    edition:                        {}
    issue:                          {}
    number:                         { BibLaTeX: 'number' }
    'number-of-pages':              {}
    'number-of-volumes':            {}
    volume:                         { BibLaTeX: 'volume' }
    accessed:                       { type: 'date' }
    container:                      { type: 'date' }
    'event-date':                   { type: 'date' }
    issued:                         { type: 'date', BibLaTeX: 'date' }
    'original-date':                { type: 'date', BibLaTeX: 'origdate'}
    submitted:                      { type: 'date' }
    author:                         { type: 'creator', BibLaTeX: 'author' }
    'collection-editor':            { type: 'creator' }
    composer:                       { type: 'creator' }
    'container-author':             { type: 'creator' }
    director:                       { type: 'creator', BibLaTeX: 'director' }
    editor:                         { type: 'creator', BibLaTeX: 'editor' }
    'editorial-director':           { type: 'creator' }
    illustrator:                    { type: 'creator' }
    interviewer:                    { type: 'creator' }
    'original-author':              { type: 'creator' }
    recipient:                      { type: 'creator' }
    'reviewed-author':              { type: 'creator' }
    translator:                     { type: 'creator' }
    type:                           { field: 'cslType' }
  }

  CSLVariable: (name) -> @CSLVariables[name] || @CSLVariables[name.toLowerCase()] || @CSLVariables[name.toUpperCase()]

  CSLCreator: (value) ->
    creator = value.split(/\s*\|\|\s*/)
    if creator.length == 2
      return {lastName: creator[0] || '', firstName: creator[1] || ''}
    else
      return {name: value}

  extractFields: (item) ->
    return {} unless item.extra

    fields = {}

    m = /(biblatexdata|bibtex|biblatex)(\*)?\[([^\]]+)\]/.exec(item.extra)
    if m
      item.extra = item.extra.replace(m[0], '').trim()
      for assignment in m[3].split(';')
        data = assignment.match(/^([^=]+)=[^\S\n]*(.*)/)
        if data
          fields[data[1].toLowerCase()] = {value: data[2], format: 'naive', raw: !m[2]}
        else
          debug("Not an assignment: #{assignment}")

    m = /(biblatexdata|bibtex|biblatex)(\*)?({[\s\S]+})/.exec(item.extra)
    if m
      prefix = m[1] + (m[2] || '')
      raw = !m[2]
      data = m[3]
      while data.indexOf('}') >= 0
        try
          json = JSON5.parse(data)
        catch
          json = null
        break if json
        data = data.replace(/[^}]*}$/, '')
      if json
        item.extra = item.extra.replace(prefix + data, '').trim()
        for own name, value of json
          fields[name.toLowerCase()] = {value, format: 'json', raw }

    ### fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/ ###
    item.extra = item.extra.replace(/{:([^:]+):[^\S\n]*([^}]+)}/g, (m, name, value) =>
      cslvar = @CSLVariable(name)
      return m unless cslvar

      switch
        when cslvar.field
          item[cslvar.field] = value
        when cslvar.type == 'creator'
          fields[cslvar.name] = {value: [], format: 'csl'} unless Array.isArray(fields[name]?.value)
          fields[cslvar.name].value.push(@CSLCreator(value))
        else
          fields[cslvar.name] = { value, format: 'csl' }

      return ''
    )

    extra = []
    for line in item.extra.split("\n")
      m = @extractFieldsKVRE.exec(line)
      cslvar = if m then @CSLVariable(m[1]) else null

      switch
        when !m
          extra.push(line)
        when !cslvar
          fields[m[1].toLowerCase()] = {value: m[2].trim(), format: 'key-value'}
        when cslvar.field
          item[cslvar.field] = m[2].trim()
        when cslvar.type == 'creator'
          fields[cslvar.name] = {value: [], format: 'csl'} unless Array.isArray(fields[cslvar.name]?.value)
          fields[cslvar.name].value.push(@CSLCreator(m[2].trim()))
        else
          fields[cslvar.name] = {value: m[2].trim(), format: 'csl'}
    item.extra = extra.join("\n")

    item.extra = item.extra.trim()
    delete item.extra if item.extra == ''

    return fields


  unique_chars: (str) ->
    uniq = ''
    for c in str
      uniq += c if uniq.indexOf(c) < 0
    return uniq

  nextItem: ->
    while item = Zotero.BetterBibTeX.simplifyFields(Zotero.nextItem())
      continue if item.itemType in ['note', 'attachment']
      debug('fetched item:', item)
# TODO: caching?
#      if @caching
#        cached = Zotero.BetterBibTeX.cache.fetch(item.itemID, @context)
#        if cached?.citekey
#          debug('nextItem: cached')
#          @citekeys[item.itemID] = cached.citekey
#          Zotero.write(cached.bibtex)
#          @preamble.DeclarePrefChars += cached.data.DeclarePrefChars if cached.data.DeclarePrefChars
#          continue

      citekey = Citekey.get(item.extra)
      item.extra = citekey.extra
      @jabref.citekeys[item.itemID] = item.__citekey__ = citekey.citekey
      debug('citation key extracted', item.__citekey__)
      if !item.__citekey__
        debug(new Error('No citation key found in'), item)
        throw new Error('No citation key in ' + JSON.stringify(item))

      if @jabref
        debug("Translator: assignGroups: #{item.itemID}")
        @jabref.assignToGroups(item)
      return item

    return null

  complete: ->
    @jabref.exportGroups()

    preamble = []
    preamble.push("\\ifdefined\\DeclarePrefChars\\DeclarePrefChars{'’-}\\else\\fi") if @preamble.DeclarePrefChars
    preamble.push('\\newcommand{\\noopsort}[1]{}') if @preamble.noopsort
    if preamble.length > 0
      preamble = ('"' + cmd + ' "' for cmd in preamble)
      Zotero.write("@preamble{ " + preamble.join(" \n # ") + " }\n")
    return

module.exports = Exporter
