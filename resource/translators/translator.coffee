Translator = {}

Translator.debug_off = ->
Translator.debug = Translator.debug_on = (msg...) ->
  @_log.apply(@, [5].concat(msg))

Translator.log_off = ->
Translator.log = Translator.log_on = (msg...) ->
  @_log.apply(@, [3].concat(msg))

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

Translator._log = (level, msg...) ->
  msg = ((if (typeof m) in ['boolean', 'string', 'number'] then '' + m else Translator.stringify(m)) for m in msg).join(' ')
  Zotero.debug('[better' + '-' + "bibtex:#{@header.label}] " + msg, level)

Translator.extractFields = (item) ->
  return {} unless item.extra

  fields = {}
  extra = []
  for line in item.extra.split("\n")
    m = /^\s*(LCCN|MR|Zbl|PMCID|PMID|arXiv|JSTOR|HDL|GoogleBooksID|DOI)\s*:\s*([\S]+)\s*$/i.exec(line)
    if !m
      extra.push(line)
    else
      fields[m[1]] = {value: m[2], format: 'key-value'}
  item.extra = extra.join("\n")

  m = /(biblatexdata|bibtex|biblatex)\[([^\]]+)\]/.exec(item.extra)
  if m
    item.extra = item.extra.replace(m[0], '').trim()
    for assignment in m[2].split(';')
      data = assignment.match(/^([^=]+)=\s*(.*)/)
      if data
        fields[data[1]] = {value: data[2], format: 'naive'}
      else
        Translator.debug("Not an assignment: #{assignment}")

  m = /(biblatexdata|bibtex|biblatex)({[\s\S]+})/.exec(item.extra)
  if m
    prefix = m[1]
    data = m[2]
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
        fields[name] = {value, format: 'json' }

  # fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/
  item.extra = item.extra.replace(/{:([^:]+):\s*([^}]+)}/g, (m, name, value) ->
    fields[name] = { value, format: 'csl' }
    return ''
  )

  item.extra = item.extra.trim()
  delete item.extra if item.extra == ''
  return fields

Translator.initialize = ->
  return if @initialized
  @initialized = true

  @citekeys = Object.create(null)
  @attachmentCounter = 0
  @rawLaTag = '#LaTeX'
  @BibLaTeXDataFieldMap = Object.create(null)

  @translatorID = @header.translatorID

  @testing = Zotero.getHiddenPref('better-bibtex.tests') != ''
  @testing_timestamp = Zotero.getHiddenPref('better-bibtex.test.timestamp') if @testing

  for own attr, f of @fieldMap || {}
    @BibLaTeXDataFieldMap[f.name] = f if f.name

  @options = {}
  @options.skipFields = (field.trim() for field in (Zotero.getHiddenPref('better-bibtex.skipFields') || '').split(','))
  for pref in ['jabrefGroups', 'postscript', 'csquotes', 'usePrefix', 'preserveCaps', 'fancyURLs', 'langID', 'rawImports', 'DOIandURL', 'attachmentsNoMetadata', 'preserveBibTeXVariables', 'verbatimDate']
    @options[pref] = Zotero.getHiddenPref("better-bibtex.#{pref}")
  @verbatimDateRE = new RegExp("^(#{@options.verbatimDate})$", 'i') if @options.verbatimDate
  for own k, v of @options
    @[k] = v

  @preferences = {}
  for option in ['useJournalAbbreviation', 'exportPath', 'exportFilename', 'exportCharset', 'exportFileData', 'exportNotes']
    @preferences[option] = @[option] = Zotero.getOption(option)

  @caching = @header.BetterBibTeX?.cache?.BibTeX && !@exportFileData

  @unicode = switch
    when @BetterBibLaTeX || @CollectedNotes then !Zotero.getHiddenPref('better-bibtex.asciiBibLaTeX')
    when @BetterBibTeX then !Zotero.getHiddenPref('better-bibtex.asciiBibTeX')
    else true

  if @typeMap
    typeMap = @typeMap
    @typeMap = {
      BibTeX2Zotero: Object.create(null)
      Zotero2BibTeX: Object.create(null)
    }

    for own bibtex, zotero of typeMap
      # =online to fool the ridiculously stupid Mozilla code safety validator, as it thinks that any
      # object property starting with 'on' on any kind of object installs an event handler on a DOM
      # node
      bibtex = bibtex.replace(/^=/, '').trim().split(/\s+/)
      zotero = zotero.trim().split(/\s+/)

      for type in bibtex
        @typeMap.BibTeX2Zotero[type] ?= zotero[0]

      for type in zotero
        @typeMap.Zotero2BibTeX[type] ?= bibtex[0]

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
  if Zotero.nextCollection
    while collection = Zotero.nextCollection()
      @debug('adding collection:', collection)
      @collections.push(@sanitizeCollection(collection))

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

Translator.nextItem = ->
  @initialize()

  while item = Zotero.nextItem()
    continue if item.itemType == 'note' || item.itemType == 'attachment'
    if @caching
      cached = Zotero.BetterBibTeX.cache.fetch(item.itemID, Translator)
      if cached?.citekey
        @citekeys[item.itemID] = cached.citekey
        Zotero.write(cached.bibtex)
        continue

    Zotero.BetterBibTeX.keymanager.extract(item, 'nextItem')
    item.__citekey__ ||= Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey

    # TODO: xref is unidirectional, Zotero relations are bidirectional
    #xrefs = item.relations?['dc:relation']
    #if xrefs
    #  item.__xref__ = []
    #  xrefs = [xrefs] unless Array.isArray(xrefs)
    #  for xref in xrefs
    #    m = xref.match(/^http:\/\/zotero.org\/users\/local\/[^\/]+\/items\/([A-Z0-9]+)$/i)
    #    continue unless m
    #    item.__xref__.push(Zotero.BetterBibTeX.keymanager.get({libraryID: item.libraryID, key: m[1]}, 'on-export').citekey)
    #  if item.__xref__.length == 0
    #    delete item.__xref__
    #  else
    #    item.__xref__ = item.__xref__.join(',')

    @citekeys[item.itemID] = item.__citekey__
    return item

  return null

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

