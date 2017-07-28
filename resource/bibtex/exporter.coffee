debug = require('../lib/debug.coffee')
JSON5 = require('json5')
getCiteKey = require('../../content/getCiteKey.coffee')

class Exporter
  constructor: ->
    return Exporter::instance if Exporter::instance
    Exporter::instance = @

    @extractFieldsKVRE = new RegExp("^\\s*(#{Object.keys(Exporter::CSLVariables).join('|')}|LCCN|MR|Zbl|arXiv|JSTOR|HDL|GoogleBooksID)\\s*:\\s*(.+)\\s*$", 'i')

    # why?
    for name, v of @CSLVariables
      v.name = name

    @preamble = {DeclarePrefChars: ''}
    @citekeys = {}
    @attachmentCounter = 0

    # TODO: disable temporarily because this translator ID doesn't trigger itemID adding
    @caching = !BetterBibTeX.options.exportFileData

    @unicode = switch
      when BetterBibTeX.BetterBibLaTeX || BetterBibTeX.CollectedNotes then !BetterBibTeX.preferences.asciiBibLaTeX
      when BetterBibTeX.BetterBibTeX then !BetterBibTeX.preferences.asciiBibTeX
      else true

    @collections = []
    if Zotero.nextCollection && BetterBibTeX.header.configOptions?.getCollections
      while collection = Zotero.nextCollection()
        debug('adding collection:', collection)
        @collections.push(@sanitizeCollection(collection))

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
        data = assignment.match(/^([^=]+)=\s*(.*)/)
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
    item.extra = item.extra.replace(/{:([^:]+):\s*([^}]+)}/g, (m, name, value) =>
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


  # The default collection structure passed is beyond screwed up.
  sanitizeCollection: (coll) ->
    sane = {
      name: coll.name
      collections: []
      items: []
    }

    for c in coll.children || coll.descendents
      switch c.type
        when 'item'       then sane.items.push(c.id)
        when 'collection' then sane.collections.push(@sanitizeCollection(c))
        else              throw "Unexpected collection member type '#{c.type}'"

    sane.collections.sort( ( (a, b) -> a.name.localeCompare(b.name) ) ) if BetterBibTeX.preferences.testing

    return sane

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

      @citekeys[item.itemID] = item.__citekey__ = getCiteKey(item).citekey
      if !@citekeys[item.itemID]
        debug(new Error('No citation key found in'), item)
        throw new Error('No citation key in ' + JSON.stringify(item))

      debug("Translator: assignGroups: #{item.itemID}")
      @JabRef_assignGroups(@collections, item)
      return item

    return null

  complete: ->
    @exportGroups()

    preamble = []
    preamble.push("\\ifdefined\\DeclarePrefChars\\DeclarePrefChars{'’-}\\else\\fi") if @preamble.DeclarePrefChars
    preamble.push('\\newcommand{\\noopsort}[1]{}') if @preamble.noopsort
    if preamble.length > 0
      preamble = ('"' + cmd + ' "' for cmd in preamble)
      Zotero.write("@preamble{ " + preamble.join(" \n # ") + " }\n")
    return

  exportGroups: ->
    debug('exportGroups:', @collections)
    return if @collections.length == 0 || !BetterBibTeX.preferences.jabrefGroups

    switch
      when BetterBibTeX.preferences.jabrefGroups == 3
        meta = 'groupsversion:3'
      when BetterBibTeX.BetterBibLaTeX
        meta = 'databaseType:biblatex'
      else
        meta = 'databaseType:bibtex'

    Zotero.write("@comment{jabref-meta: #{meta};}\n")
    Zotero.write('@comment{jabref-meta: groupstree:\n')
    Zotero.write(@JabRef_exportGroup({collections: @collections}))
    Zotero.write(';\n')
    Zotero.write('}\n')
    return

  JabRef_assignGroups: (collection, item) ->
    return unless BetterBibTeX.preferences.jabrefGroups == 4

    collection = {items: [], collections: collection} if Array.isArray(collection)

    if item.itemID in collection.items
      item.groups ||= []
      item.groups.push(collection.name)
      item.groups.sort() if BetterBibTeX.preferences.testing

    for coll in collection.collections
      @JabRef_assignGroups(coll, item)
    return

  JabRef_serialize: (list, wrap) ->
    serialized = (elt.replace(/\\/g, '\\\\').replace(/;/g, '\\;') for elt in list)
    serialized = (elt.match(/.{1,70}/g).join("\n") for elt in serialized) if wrap
    return serialized.join(if wrap then ";\n" else ';')

  JabRef_exportGroup: (collection, level = 0) ->
    if level
      collected = ["#{level} ExplicitGroup:#{collection.name}", '0']
      if BetterBibTeX.preferences.jabrefGroups == 3
        references = (@citekeys[id] for id in (collection.items || []) when @citekeys[id])
        references.sort() if BetterBibTeX.preferences.testing
        collected = collected.concat(references)
      # what is the meaning of the empty cell at the end, JabRef?
      collected = collected.concat([''])
    else
      collected = ['0 AllEntriesGroup:']

    collected = [@JabRef_serialize(collected)]

    for child in collection.collections || []
      collected = collected.concat(@JabRef_exportGroup(child, level + 1))

    if level
      return collected
    else
      return @JabRef_serialize(collected, true)

module.exports = Exporter
