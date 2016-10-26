Translator = {}

Translator._log = (level, msg...) ->
  str = []
  for m in msg
    switch
      when m instanceof Error
        m = "<Exception: #{m.message || m.name}#{if m.stack then '\n' + m.stack else ''}>"
      when m instanceof String
        m = '' + m
      else
        m = Zotero.Utilities.varDump(m)
    str.push(m) if m
  str = str.join(' ')

  Zotero.debug('[better' + '-' + "bibtex:#{@header.label}] " + str, level)

Translator.debug_off = ->
Translator.debug = Translator.debug_on = (msg...) ->
  @_log.apply(@, [5].concat(msg))

Translator.log_off = ->
Translator.log = Translator.log_on = (msg...) ->
  @_log.apply(@, [3].concat(msg))

Translator.HTMLEncode = (text) ->
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

Translator.stringify = (obj, replacer, spaces, cycleReplacer) ->
  str = JSON.stringify(obj, @stringifier(replacer, cycleReplacer), spaces)
  if Array.isArray(obj)
    keys = Object.keys(obj)
    if keys.length > 0
      o = {}
      for key in keys
        continue if key.match(/^\d+$/)
        o[key] = obj[key]
      str += '+' + @stringify(o)
  return str

Translator.locale = (language) ->
  if !@languages.locales[language]
    ll = language.toLowerCase()
    for locale in @languages.langs
      for k, v of locale
        @languages.locales[language] = locale[1] if ll == v
      break if @languages.locales[language]
    @languages.locales[language] ||= language

  return @languages.locales[language]

Translator.stringifier = (replacer, cycleReplacer) ->
  stack = []
  keys = []
  if cycleReplacer == null
    cycleReplacer = (key, value) ->
      return '[Circular ~]' if stack[0] == value
      return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'

  return (key, value) ->
    if stack.length > 0
      thisPos = stack.indexOf(this)
      if ~thisPos then stack.splice(thisPos + 1) else stack.push(this)
      if ~thisPos then keys.splice(thisPos, Infinity, key) else keys.push(key)
      value = cycleReplacer.call(this, key, value) if ~stack.indexOf(value)
    else
      stack.push(value)

    return value if replacer == null || replacer == undefined
    return replacer.call(this, key, value)

### http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables ###
Translator.CSLVariables = {
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
      switch @item.__type__
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
for name, v of Translator.CSLVariables
  v.name = name

Translator.CSLVariable = (name) ->
  return @CSLVariables[name] || @CSLVariables[name.toLowerCase()] || @CSLVariables[name.toUpperCase()]

Translator.CSLCreator = (value) ->
  creator = value.split(/\s*\|\|\s*/)
  if creator.length == 2
    return {lastName: creator[0] || '', firstName: creator[1] || ''}
  else
    return {name: value}

Translator.extractFieldsKVRE = new RegExp("^\\s*(#{Object.keys(Translator.CSLVariables).join('|')}|LCCN|MR|Zbl|arXiv|JSTOR|HDL|GoogleBooksID)\\s*:\\s*(.+)\\s*$", 'i')
Translator.extractFields = (item) ->
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
        Translator.debug("Not an assignment: #{assignment}")

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
    cslvar = Translator.CSLVariable(name)
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
    m = Translator.extractFieldsKVRE.exec(line)
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

Translator.initialize = ->
  return if @initialized
  @initialized = true

  @preamble = {DeclarePrefChars: ''}
  @citekeys = Object.create(null)
  @attachmentCounter = 0
  @rawLaTag = '#LaTeX'
  @BibLaTeXDataFieldMap = Object.create(null)

  @translatorID = @header.translatorID

  @testing = Zotero.getHiddenPref('better-bibtex.tests') != ''
  @testing_timestamp = Zotero.getHiddenPref('better-bibtex.test.timestamp') if @testing

  for own attr, f of @fieldMap || {}
    @BibLaTeXDataFieldMap[f.name] = f if f.name

  for pref in Object.keys(@preferences)
    @preferences[pref] = @[pref] = Zotero.getHiddenPref("better-bibtex.#{pref}")

  @skipWords = @skipWords.trim().split(/\s*,\s*/)
  @skipFields = (field.trim() for field in (@skipFields || '').split(',') when field.trim())
  if @csquotes
    @csquotes = { open: '', close: '' }
    for ch, i in Translator.preferences.csquotes
      if i % 2 == 0 # open
        @csquotes.open += ch
      else
        @csquotes.close += ch

  @options = {}
  for option in ['useJournalAbbreviation', 'exportPath', 'exportFilename', 'exportCharset', 'exportFileData', 'exportNotes']
    @options[option] = @[option] = Zotero.getOption(option)

  @caching = !@exportFileData

  @unicode = switch
    when @BetterBibLaTeX || @CollectedNotes then !@asciiBibLaTeX
    when @BetterBibTeX then !@asciiBibTeX
    else true

  if Zotero.getHiddenPref('better-bibtex.debug')
    @debug = @debug_on
    @log = @log_on
    cfg = {}
    for own k, v of @
      cfg[k] = v unless typeof v == 'object'
    @debug("Translator initialized:", cfg)
  else
    @debug = @debug_off
    @log = @log_off

  @collections = []
  if Zotero.nextCollection && Translator.header.configOptions?.getCollections
    while collection = Zotero.nextCollection()
      @debug('adding collection:', collection)
      @collections.push(@sanitizeCollection(collection))

  @context = {
    exportCharset: (@exportCharset || 'UTF-8').toUpperCase()
    exportNotes: !!@exportNotes
    translatorID: @translatorID
    useJournalAbbreviation: !!@useJournalAbbreviation
  }

# The default collection structure passed is beyond screwed up.
Translator.sanitizeCollection = (coll) ->
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

  sane.collections.sort( ( (a, b) -> a.name.localeCompare(b.name) ) ) if Translator.testing

  return sane

Translator.unique_chars = (str) ->
  uniq = ''
  for c in str
    uniq += c if uniq.indexOf(c) < 0
  return uniq

Translator.nextItem = ->
  @initialize()

  while item = Zotero.nextItem()
    continue if item.itemType == 'note' || item.itemType == 'attachment'
    Translator.debug('fetched item:', item)
    if @caching
      cached = Zotero.BetterBibTeX.cache.fetch(item.itemID, @context)
      if cached?.citekey
        Translator.debug('nextItem: cached')
        @citekeys[item.itemID] = cached.citekey
        Zotero.write(cached.bibtex)
        @preamble.DeclarePrefChars += cached.data.DeclarePrefChars if cached.data.DeclarePrefChars
        continue

    Zotero.BetterBibTeX.keymanager.extract(item, 'nextItem')
    item.__citekey__ ||= Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey

    @citekeys[item.itemID] = item.__citekey__
    return item

  return null

Translator.complete = ->
  @exportGroups()

  preamble = []
  preamble.push('\\DeclarePrefChars{' + @unique_chars(@preamble.DeclarePrefChars) + '}') if @preamble.DeclarePrefChars
  preamble.push('\\newcommand{\\noopsort}[1]{}') if @preamble.noopsort
  if preamble.length > 0
    preamble = ('"' + cmd + ' "' for cmd in preamble)
    Zotero.write("@preamble{ " + preamble.join(" \n # ") + " }\n")

Translator.exportGroups = ->
  @debug('exportGroups:', @collections)
  return if @collections.length == 0 || !@jabrefGroups

  Zotero.write('@comment{jabref-meta: groupsversion:3;}\n')
  Zotero.write('@comment{jabref-meta: groupstree:\n')
  Zotero.write('0 AllEntriesGroup:;\n')

  @debug('exportGroups: getting groups')
  groups = []
  for collection in @collections
    groups = groups.concat(JabRef.exportGroup(collection, 1))
  @debug('exportGroups: serialize', groups)

  Zotero.write(JabRef.serialize(groups, ';\n', true) + ';\n}\n')

JabRef =
  serialize: (arr, sep, wrap) ->
    arr = (('' + v).replace(/;/g, "\\;") for v in arr)
    arr = (v.match(/.{1,70}/g).join("\n") for v in arr) if wrap
    return arr.join(sep)

  exportGroup: (collection, level) ->
    group = ["#{level} ExplicitGroup:#{collection.name}", 0]
    references = (Translator.citekeys[id] for id in collection.items)
    references.sort() if Translator.testing
    group = group.concat(references)
    group.push('')
    group = @serialize(group, ';')

    result = [group]
    for coll in collection.collections
      result = result.concat(JabRef.exportGroup(coll, level + 1))
    return result

