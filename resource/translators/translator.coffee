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

  @skipFields = (field.trim() for field in (Zotero.getHiddenPref('better-bibtex.skipFields') || '').split(','))
  for pref in ['csquotes', 'usePrefix', 'preserveCaps', 'fancyURLs', 'langID', 'rawImports', 'DOIandURL', 'attachmentsNoMetadata', 'preserveBibTeXVariables', 'verbatimDate']
    @[pref] = Zotero.getHiddenPref("better-bibtex.#{pref}")
  if @verbatimDate == ''
    delete @verbatimDate
  else
    @verbatimDate = new RegExp("^(#{@verbatimDate})$", 'i')

  for option in ['useJournalAbbreviation', 'exportPath', 'exportFilename', 'exportCharset', 'exportFileData', 'exportNotes']
    @[option] = Zotero.getOption(option)

  @caching = @header.BetterBibTeX?.cache?.BibTeX && !@exportFileData

  @unicode = switch
    when @BetterBibLaTeX then !Zotero.getHiddenPref('better-bibtex.asciiBibLaTeX')
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
  return if @collections.length == 0

  Zotero.write('@comment{jabref-meta: groupsversion:3;}\n')
  Zotero.write('@comment{jabref-meta: groupstree:\n')
  Zotero.write('0 AllEntriesGroup:;\n')

  @debug('exportGroups: getting groups')
  groups = []
  for collection in @collections
    groups = groups.concat(JabRef.exportGroup(collection, 1))
  @debug('exportGroups: serialize', groups)

  Zotero.write(JabRef.serialize(groups, ';\n', true) + ';\n}\n')

JabRef = {}

JabRef.serialize = (arr, sep, wrap) ->
  arr = (('' + v).replace(/;/g, "\\;") for v in arr)
  arr = (v.match(/.{1,70}/g).join("\n") for v in arr) if wrap
  return arr.join(sep)

JabRef.exportGroup = (collection, level) ->
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

class Reference
  constructor: (@item) ->
    @fields = []
    @has = Object.create(null)
    @raw = ((tag.tag for tag in @item.tags when tag.tag == Translator.rawLaTag).length > 0)

    @referencetype = Translator.typeMap.Zotero2BibTeX[@item.itemType] || 'misc'

    @override = Translator.extractFields(@item)

    for own attr, f of Translator.fieldMap || {}
      @add(@field(f, @item[attr])) if f.name

    @add({name: 'timestamp', value: Translator.testing_timestamp || @item.dateModified || @item.dateAdded})

Reference::log = Translator.log

Reference::field = (f, value) ->
  clone = JSON.parse(JSON.stringify(f))
  #clone = Object.create(f)
  clone.value = value
  return clone

Reference::enc_raw = (f) ->
  return f.value

Reference::enc_verbatim = (f) ->
  if Translator.BetterBibTeX
    href = ('' + f.value).replace(/([#\\%&{}])/g, '\\$1')
  else
    href = ('' + f.value).replace(/([\\{}])/g, '\\$1')
  href = href.replace(/[^\x21-\x7E]/g, ((chr) -> '\\%' + ('00' + chr.charCodeAt(0).toString(16).slice(-2)))) if not Translator.unicode

  return "\\href{#{href}}{#{LaTeX.text2latex(href)}}" if f.name == 'url' && Translator.fancyURLs
  return href

Reference::particleSpacing =
  atEnd: new XRegExp("[-\\s]$")
  atStart: new XRegExp("^[-\\s]")

Reference::enc_creators = (f, raw) ->
  # family
  # given
  # dropping-particle
  # non-dropping-particle
  # comma-suffix?
  # comma-dropping-particle?
  # suffix?

  return null if f.value.length == 0

  Translator.debug('enc_creators', f, 'raw:', raw)

  encoded = []
  for creator in f.value
    switch
      when creator.lastName && creator.fieldMode == 1
        name = if raw then "{#{creator.lastName}}" else @enc_latex({value: new String(creator.lastName)})

      when raw
        name = (part for part in [creator.lastName, creator.firstName] when part).join(', ')

      when creator.lastName || creator.firstName
        name = {family: creator.lastName || '', given: creator.firstName || ''}
        # Parse name particles
        # Replicate citeproc-js logic for what should be parsed so we don't
        # break current behavior.
        if name.family # && name.given
          # Don't parse if last name is quoted
          if name.family.length > 1 && name.family[0] == '"' && name.family[name.family.length - 1] == '"'
            name.family = @enc_latex({value: new String(name.family.slice(1, -1))})

          else
            Zotero.BetterBibTeX.CSL.parseParticles(name)

            Translator.debug('particle parser:', creator, '=>', name)

            if name['non-dropping-particle']
              if ! XRegExp.test(name['non-dropping-particle'], Reference::particleSpacing.atEnd) && ! XRegExp.test(name.family, Reference::particleSpacing.atStart)
                name['non-dropping-particle'] += ' '
              name.family = @enc_latex({value: new String((name['non-dropping-particle'] + name.family).trim())})
            else
              name.family = @enc_latex({value: name.family}).replace(/ and /g, ' {and} ')

            if name['dropping-particle']
              particle = @enc_latex({value: name['dropping-particle']}).replace(/ and /g, ' {and} ')
              if ! XRegExp.test(name['dropping-particle'], Reference::particleSpacing.atEnd) && ! XRegExp.test(name.family, Reference::particleSpacing.atStart)
                particle += ' '
              name.family = particle + name.family

        if name.given
          name.given = @enc_latex({value: name.given}).replace(/ and /g, ' {and} ')

        # TODO: is this the best way to deal with commas?
        name = (part.replace(/,/g, '{,}') for part in [name.family, name.suffix, name.given] when part).join(', ')

      else
        continue

    encoded.push(name)

  return encoded.join(' and ')

Reference::enc_latex = (f, raw) ->
  return f.value if typeof f.value == 'number'
  return null unless f.value

  if Array.isArray(f.value)
    return null if f.value.length == 0
    return (@enc_latex(@field(f, word), raw) for word in f.value).join(f.sep)

  return f.value if raw

  value = LaTeX.text2latex(f.value)
  value = new String("{#{value}}") if f.value instanceof String
  return value

Reference::enc_tags = (f) ->
  return null if not f.value || f.value.length == 0
  tags = (tag.tag for tag in f.value when tag.tag != Translator.rawLaTag)

  # sort tags for stable tests
  tags.sort() if Translator.testing

  f.value = tags
  f.sep = ','
  return @enc_latex(f)

Reference::enc_attachments = (f) ->
  return null if not f.value || f.value.length == 0
  attachments = []
  errors = []

  for att in f.value
    a = {
      title: att.title
      path: att.localPath
      mimetype: att.mimeType || ''
    }

    save = Translator.exportFileData && att.defaultPath && att.saveFile
    a.path = att.defaultPath if save

    continue unless a.path # amazon/googlebooks etc links show up as atachments without a path

    a.title ||= att.path.replace(/.*[\\\/]/, '') || 'attachment'

    if a.path.match(/[{}]/) # latex really doesn't want you to do this.
      errors.push("BibTeX cannot handle file paths with braces: #{JSON.stringify(a.path)}")
      continue

    switch
      when save
        att.saveFile(a.path)
      when Translator.testing
        Translator.attachmentCounter += 1
        a.path = "files/#{Translator.attachmentCounter}/#{att.localPath.replace(/.*[\/\\]/, '')}"
      when Translator.exportPath && att.localPath.indexOf(Translator.exportPath) == 0
        a.path = att.localPath.slice(Translator.exportPath.length)

    attachments.push(a)

  f.errors = errors if errors.length != 0
  return null if attachments.length == 0

  # sort attachments for stable tests
  attachments.sort( ( (a, b) -> a.path.localeCompare(b.path) ) ) if Translator.testing

  return (att.path.replace(/([\\{};])/g, "\\$1") for att in attachments).join(';') if Translator.attachmentsNoMetadata
  return ((part.replace(/([\\{}:;])/g, "\\$1") for part in [att.title, att.path, att.mimetype]).join(':') for att in attachments).join(';')

Reference::preserveCaps = {
  inner:  new XRegExp("(^|[\\s\\p{Punctuation}])([^\\s\\p{Punctuation}]+\\p{Uppercase_Letter}[^\\s\\p{Punctuation}]*)", 'g')
  all:    new XRegExp("(^|[\\s\\p{Punctuation}])([^\\s\\p{Punctuation}]*\\p{Uppercase_Letter}[^\\s\\p{Punctuation}]*)", 'g')
}
Reference::initialCapOnly = new XRegExp("^\\p{Uppercase_Letter}\\p{Lowercase_Letter}+$")

Reference::isBibVar = (value) ->
  return Translator.preserveBibTeXVariables && value.match(/^[a-z][a-z0-9_]*$/i)

Reference::add = (field) ->
  return if Translator.skipFields.indexOf(field.name) >= 0
  return if typeof field.value != 'number' && not field.value
  return if typeof field.value == 'string' && field.value.trim() == ''
  return if Array.isArray(field.value) && field.value.length == 0

  @remove(field.name) if field.replace
  throw "duplicate field '#{field.name}' for #{@item.__citekey__}" if @has[field.name] && !field.allowDuplicates

  if typeof field.value == 'number' || (field.preserveBibTeXVariables && @isBibVar(field.value))
    value = field.value
  else
    enc = field.enc || Translator.fieldEncoding?[field.name] || 'latex'
    value = @["enc_#{enc}"](field, (if field.enc && field.enc != 'creators' then false else @raw))

    return unless value

    unless field.bare && !field.value.match(/\s/)
      if Translator.preserveCaps != 'no' && field.preserveCaps && !@raw
        braced = []
        scan = value.replace(/\\./, '..')
        for i in [0...value.length]
          braced[i] = (braced[i - 1] || 0)
          braced[i] += switch scan[i]
            when '{' then 1
            when '}' then -1
            else          0
          braced[i] = 0 if braced[i] < 0

        value = XRegExp.replace(value, @preserveCaps[Translator.preserveCaps], (match, boundary, needle, pos, haystack) ->
          boundary ?= ''
          pos += boundary.length
          return boundary + needle if needle.length < 2 # don't encode single-letter capitals
          return boundary + needle if pos == 0 && Translator.preserveCaps == 'all' && XRegExp.test(needle, Reference::initialCapOnly)

          c = 0
          for i in [pos - 1 .. 0] by -1
            if haystack[i] == '\\'
              c++
            else
              break
          return boundary + needle if c % 2 == 1 # don't enclose LaTeX command

          return boundary + needle if braced[pos] > 0
          return "#{boundary}{#{needle}}"
        )
      value = "{#{value}}"

  field.bibtex = "  #{field.name} = #{value}"
  field.bibtex = field.bibtex.normalize('NFKC') if @normalize
  @fields.push(field)
  @has[field.name] = field

Reference::remove = (name) ->
  return unless @has[name]
  delete @has[name]
  for field, i in @fields
    if field.name == name
      @fields.splice(i, 1)
      return
  return

Reference::normalize = (typeof (''.normalize) == 'function')

Reference::CSLtoBibTeX = {
  'original-date': 'origdate'
  'original-publisher': 'origpublisher'
  'original-publisher-place': 'origlocation'
  'original-title': 'origtitle'
}

Reference::complete = ->
  @add({name: 'xref', value: @item.__xref__, enc: 'raw'}) if !@has.xref && @item.__xref__

  if Translator.DOIandURL != 'both'
    if @has.doi && @has.url
      switch Translator.DOIandURL
        when 'doi' then @remove('url')
        when 'url' then @remove('doi')

  fields = []
  for own name, value of @override
    name = name.toLowerCase()

    # CSL names are not in BibTeX format, so only add it if there's a mapping
    if value.format == 'csl'
      if @CSLtoBibTeX[name]
        fields.push({ name: @CSLtoBibTeX[name], value: value.value })
      else
        Translator.debug('Unmapped CSL field', name, '=', value.value)
      continue

    if ((typeof value.value == 'string') && value.value.trim() == '')
      @remove(name)
      continue

    switch name
      when 'mr'
        fields.push({ name: 'mrnumber', value: value.value })
      when 'zbl'
        fields.push({ name: 'zmnumber', value: value.value })
      when 'lccn', 'pmcid'
        fields.push({ name: name, value: value.value })
      when 'pmid', 'arxiv', 'jstor', 'hdl'
        if Translator.BetterBibLaTeX
          fields.push({ name: 'eprinttype', value: name.toLowerCase() })
          fields.push({ name: 'eprint', value: value.value })
        else
          fields.push({ name, value: value.value })
      when 'googlebooksid'
        if Translator.BetterBibLaTeX
          fields.push({ name: 'eprinttype', value: 'googlebooks' })
          fields.push({ name: 'eprint', value: value.value })
        else
          fields.push({ name: 'googlebooks', value: value.value })
      when 'xref'
        fields.push({ name, value: value.value, enc: 'raw' })

      # psuedo-var, sets the reference type
      when 'referencetype'
        @referencetype = value.value

      else
        fields.push({ name, value: value.value })

  for field in fields
    field = @field(Translator.BibLaTeXDataFieldMap[field.name], field.value) if Translator.BibLaTeXDataFieldMap[field.name]
    field.replace = true
    @add(field)

  @add({name: 'type', value: @referencetype}) if @fields.length == 0

  # sort fields for stable tests
  @fields.sort((a, b) -> ("#{a.name} = #{a.value}").localeCompare(("#{b.name} = #{b.value}"))) if Translator.testing

  ref = "@#{@referencetype}{#{@item.__citekey__},\n"
  ref += (field.bibtex for field in @fields).join(',\n')
  ref += '\n}\n\n'
  Zotero.write(ref)

  Zotero.BetterBibTeX.cache.store(@item.itemID, Translator, @item.__citekey__, ref) if Translator.caching
