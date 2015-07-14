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

  for own attr, f of @fieldMap or {}
    @BibLaTeXDataFieldMap[f.name] = f if f.name

  @skipFields = (field.trim() for field in (Zotero.getHiddenPref('better-bibtex.skipFields') || '').split(','))
  for pref in ['usePrefix', 'preserveCaps', 'fancyURLs', 'langID', 'rawImports', 'DOIandURL', 'attachmentsNoMetadata', 'preserveBibTeXVariables', 'verbatimDate']
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

  for c in coll.children or coll.descendents
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

    xrefs = item.relations?['dc:relation']
    if xrefs
      item.__xref__ = []
      xrefs = [xref] unless Array.isArray(xref)
      for xref in xrefs
        m = xref.match(/^http:\/\/zotero.org\/users\/local\/[^\/]+\/items\/([A-Z0-9]+)$/i)
        next unless m
        item.__xref__.push(Zotero.BetterBibTeX.keymanager.get({libraryID: item.libraryID, key: m[1]}, 'on-export').citekey)
      if item.__xref__.length == 0
        delete item.__xref__
      else
        item.__xref__ = item.__xref__.join(',')

    @citekeys[item.itemID] = item.__citekey__
    return item

  return null

Translator.creator = (creator) ->
  creatorString = (name for name in [creator.lastName, creator.firstName] when name && name.trim() != '')
  switch creatorString.length
    when 2
      return creatorString.join(', ')
    when 1
      return new String(creatorString[0])
    else
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

    @itemtype = Translator.typeMap.Zotero2BibTeX[@item.itemType] or 'misc'

    if @item.extra
      fields = []

      extra = []
      for line in @item.extra.split("\n")
        m = /^\s*(LCCN|MR|Zbl|PMCID|PMID|arXiv|JSTOR|HDL|GoogleBooksID)\s*:\s*([\S]+)\s*$/i.exec(line)
        name = m?[1].toLowerCase()
        Translator.log("fixed field #{name} = #{m[2]}") if name
        switch name
          when 'mr'
            fields.push({ name: 'mrnumber', value: m[2] })
          when 'zbl'
            fields.push({ name: 'zmnumber', value: m[2] })
          when 'lccn', 'pmcid'
            fields.push({ name: name, value: m[2] })
          when 'pmid', 'arxiv', 'jstor', 'hdl'
            if Translator.BetterBibLaTeX
              fields.push({ name: 'eprinttype', value: m[1].toLowerCase() })
              fields.push({ name: 'eprint', value: m[2] })
            else
              fields.push({ name: name, value: m[2] })
          when 'googlebooksid'
            if Translator.BetterBibLaTeX
              fields.push({ name: 'eprinttype', value: 'googlebooks' })
              fields.push({ name: 'eprint', value: m[2] })
            else
              fields.push({ name: 'googlebooks', value: m[2] })

          else extra.push(line)
      @item.extra = extra.join("\n")

      m = /(biblatexdata|bibtex|biblatex)\[([^\]]+)\]/.exec(@item.extra)
      if m
        @item.extra = @item.extra.replace(m[0], '').trim()
        for assignment in m[2].split(';')
          data = assignment.match(/^([^=]+)=\s*(.*)/)
          unless data
            Zotero.debug("Not an assignment: #{assignment}")
            continue

          fields.push({ name: data[1], value: data[2] })

      m = /(biblatexdata|bibtex|biblatex)({[\s\S]+})/.exec(@item.extra)
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
          @item.extra = @item.extra.replace(prefix + data, '').trim()
          for name, value of json
            fields.push({name: name, value: value})

      # fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/
      @item.extra = @item.extra.replace(/{:([^:]+):\s*([^}]+)}/g, (m, field, value) ->
        switch field.toLowerCase()
          when 'original-date'
            fields.push({ name: 'origdate', value: value })
        return ''
      )

      for field in fields
        if field.name == 'referencetype'
          @itemtype = field.value
          continue

        field.esc = 'raw' if field.name == 'xref'

        field = @field(Translator.BibLaTeXDataFieldMap[field.name], field.value) if Translator.BibLaTeXDataFieldMap[field.name]
        field.noreplace = true
        @add(field)

    for own attr, f of Translator.fieldMap or {}
      if f.name and not @has[f.name]
        @add(@field(f, @item[attr]))

    @add({name: 'timestamp', value: Translator.testing_timestamp || @item.dateModified || @item.dateAdded})

Reference::log = Translator.log

Reference::field = (f, value) ->
  clone = Object.create(f)
  clone.value = value
  return clone

Reference::esc_raw = (f) ->
  return f.value

Reference::esc_verbatim = (f) ->
  if Translator.BetterBibTeX
    href = ('' + f.value).replace(/([#\\%&{}])/g, '\\$1')
  else
    href = ('' + f.value).replace(/([\\%&{}])/g, '\\$1')
  href = href.replace(/[^\x21-\x7E]/g, ((chr) -> '\\%' + ('00' + chr.charCodeAt(0).toString(16).slice(-2)))) if not Translator.unicode

  return "\\href{#{href}}{#{LaTeX.text2latex(href)}}" if f.name == 'url' and Translator.fancyURLs
  return href

Reference::esc_doi = Reference::esc_verbatim
Reference::esc_url = Reference::esc_verbatim

Reference::esc_latex = (f, raw) ->
  return f.value if typeof f.value == 'number'
  return null unless f.value

  if Array.isArray(f.value)
    return null if f.value.length == 0
    return (@esc_latex(@field(f, word), raw) for word in f.value).join(f.sep)

  return f.value if raw

  value = LaTeX.text2latex(f.value)
  value = new String("{#{value}}") if f.value instanceof String
  return value

Reference::esc_tags = (f) ->
  return null if not f.value or f.value.length == 0
  tags = (tag.tag for tag in f.value when tag.tag != Translator.rawLaTag)

  # sort tags for stable tests
  tags.sort() if Translator.testing

  f.value = tags
  f.sep = ','
  return @esc_latex(f)

Reference::esc_attachments = (f) ->
  return null if not f.value or f.value.length == 0
  attachments = []
  errors = []

  for att in f.value
    a = {
      title: att.title
      path: att.localPath
      mimetype: att.mimeType || ''
    }

    Translator.debug("save attachment: exportFileData=#{Translator.exportFileData}, defaultPath=#{att.defaultPath}, saveFile=#{typeof att.saveFile}/#{!!att.saveFile}")
    save = Translator.exportFileData and att.defaultPath and att.saveFile
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
  inner: new XRegExp("\\b\\p{Letter}+\\p{Uppercase_Letter}\\p{Letter}*", 'g')
  all: new XRegExp("\\b\\p{Letter}*\\p{Uppercase_Letter}\\p{Letter}*", 'g')
}
Reference::initialCapOnly = new XRegExp("^\\p{Uppercase_Letter}\\p{Lowercase_Letter}+$")

Reference::add = (field) ->
  return if Translator.skipFields.indexOf(field.name) >= 0
  return if typeof field.value != 'number' and not field.value
  return if typeof field.value == 'string' and field.value.trim() == ''
  return if Array.isArray(field.value) and field.value.length == 0

  return if @has[field.name]?.noreplace

  @remove(field.name) if field.replace
  throw "duplicate field '#{field.name}' for #{@item.__citekey__}" if @has[field.name] && !field.allowDuplicates

  if typeof field.value == 'number'
    value = field.value
  else
    value = @["esc_#{field.esc || 'latex'}"](field, (if field.esc then false else @raw))

    return null unless value

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

        value = XRegExp.replace(value, @preserveCaps[Translator.preserveCaps], (needle, pos, haystack) ->
          #return needle if needle.length < 2 # don't escape single-letter capitals
          return needle if pos == 0 && Translator.preserveCaps == 'all' && XRegExp.test(needle, Reference::initialCapOnly)

          c = 0
          for i in [pos - 1 .. 0] by -1
            if haystack[i] == '\\'
              c++
            else
              break
          return needle if c % 2 == 1 # don't enclose LaTeX command

          return needle if braced[pos] > 0
          return "{#{needle}}"
        )
      value = "{#{value}}"

  field.bibtex = "  #{field.name} = #{value}"
  field.bibtex = field.bibtex.normalize('NFKC') if @normalize
  @fields.push(field)
  @has[field.name] = field
  return

Reference::remove = (name) ->
  return unless @has[name]
  delete @has[name]
  for field, i in @fields
    if field.name == name
      @fields.splice(i, 1)
      return
  return

Reference::normalize = (typeof (''.normalize) == 'function')

Reference::complete = ->
  @add({name: 'xref', value: @item.__xref__, esc: 'raw'}) if !@has.xref && @item.__xref__
  @add({name: 'type', value: @itemtype}) if @fields.length == 0

  if Translator.DOIandURL != 'both'
    doi = (i for field, i in @fields when field.name == 'doi')
    url = (i for field, i in @fields when field.name == 'url')
    if doi.length > 0 && url.length > 0
      switch Translator.DOIandURL
        when 'doi' then @fields.splice(url[0], 1)
        when 'url' then @fields.splice(doi[0], 1)

  # sort fields for stable tests
  if Translator.testing
    @fields.sort( ((a, b) ->
      _a = a.name
      _b = b.name
      if a.name == b.name
        _a = a.value
        _b = b.value
      return -1 if _a < _b
      return 1  if _a > _b
      return 0) )

  ref = "@#{@itemtype}{#{@item.__citekey__},\n"
  ref += (field.bibtex for field in @fields).join(',\n')
  ref += '\n}\n\n'
  Zotero.write(ref)

  Zotero.BetterBibTeX.cache.store(@item.itemID, Translator, @item.__citekey__, ref) if Translator.caching
