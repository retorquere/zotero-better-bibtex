class BetterBibTeXParserSupport
  constructor: (@options) ->
    @references = []
    @collections = []
    @strings = Object.create(null)
    @comments = []
    @errors = []

  quoteWith: (state) ->
    switch state
      when '"'
        @braced = false
        @quoted = true
      when '{}'
        @braced = true
        @quoted = false
      else
        @braced = false
        @quoted = false
    return true

  lookahead: (n) ->
    return "#{peg$currPos} :: #{input.substr(peg$currPos, n)}"

  flatten: (str) ->
    return (@flatten(s) for s in str when s?).join('') if Array.isArray(str)
    return '' + str

  log: (msg...) ->
    msg = ((if (typeof m) in ['number', 'string'] then ('' + m) else JSON.stringify(m)) for m in msg).join(' ')
    msg = "\n\n*** #{msg} ***\n\n"
    (Translator?.log || console.log)(msg)
    return true

  filterattachments: (attachments, key) ->
    if key == 'sentelink'
      for attachment in attachments
        attachment.path = attachment.path.replace(/,.*/, '') if attachment.path
    attachments = (attachment for attachment in attachments when attachment.path && attachment.path != '')

    attachments.sort((a, b) ->
      if a.path < b.path
        -1
      else if a.path > b.path
        1
      else
        0
    )

    return attachments

  skipEmptyKeys: (key) ->
    return key != ''

  intersect: (v) -> # will be called on array! @indexOf is OK here!
    return @indexOf(v) >= 0

  unique: (arr) ->
    result = []
    for v in arr
      result.push(v) if result.indexOf(v) < 0
    return result

  Creators: new class
    reduce: (result, fragment) ->
      ### for the first item, return the item ###
      return [fragment] if result.length == 0

      ###
      # if either the last element of the result so far of the new string to be added is a literal, push it onto the
      # result (don't smush literals)
      ###
      return result.concat(fragment) if (result[result.length - 1] instanceof String) || (fragment instanceof String)

      ### regular strings -- add to tail ###
      result[result.length - 1] += fragment
      return result

    compact: (fragments) ->
      fragments.reduce(@reduce, [])

    push: (groups, fragment, startNewGroup) ->
      groups.push([]) if startNewGroup || groups.length == 0
      groups[groups.length - 1].push(fragment)

    split: (fragments, sep, groups = []) ->
      fragments = @compact(fragments)

      for fragment in fragments
        if fragment instanceof String
          ### literals always form a new substring ###
          @push(groups, fragment)

        else
          ### split on separator and push resulting substrings ###
          for splinter, i in fragment.split(sep)
            ###
            # first word is before the separator, so it is appended to the previous chunk
            # all other words start a new entry
            ###
            @push(groups, splinter, i > 0)

      ### compact regular strings in groups ###
      groups = (@compact(group) for group in groups)

      ### 'trim' the groups ###
      for group in groups
        continue if group.length == 0

        ### remove whitespace at the start of the group ###
        if typeof group[0] == 'string'
          group[0] = group[0].replace(/^\s+/g, '')
          group.shift() if group[0] == ''
        continue if group.length == 0

        ### remove whitespace at the end of the group ###
        last = group.length - 1
        if typeof group[last] == 'string'
          group[last] = group[last].replace(/\s+$/g, '')
          group.pop() if group[last] == ''

      return groups

    join: (group) ->
      return group.join('').trim()

    creator: (name) ->
      name = @split(name, ",")

      switch name.length
        when 0
          return null

        when 1
          ### single string, no commas ###
          if name[0].length == 1 and (name[0][0] instanceof String)
            ### single literal ###
            return { lastName: "" + name[0][0], fieldMode: 1 }

          ### single string, no commas ###
          ### this will be cleaned up by zotero utils later ###
          return @join(name[0])

        when 2
          ### last name, first name ###
          return { lastName: @join(name[0]), firstName: @join(name[1]) }

        else
          ### assumed middle item is something like Jr. ###
          firstName = @join(name.pop())
          lastName = (@join(n) for n in name).join(', ')

          return { lastName: lastName, firstName: firstName }

    parse: (creators) ->
      return (@creator(name) for name in @split(creators, /\s+and\s+/))

  reference: (type, citekey, fields) ->
    if fields.length == 0
      @errors.push("@#{type}{#{citekey},}")
    else
      ref = {
        __type__: type.toLowerCase()
        __key__: citekey
      }

      for field in fields
        ### safe since we're only dealing with strings, not numbers ###
        continue unless field.value && field.value != ''

        switch field.type
          when 'file'
            attachments = ref.file ? []
            ref.file = attachments.concat(field.value)

          when 'creator'
            ref[field.key] = field.value if field.value.length > 0

          else
            if ref[field.key]
              ### duplicate fields are not supposed to occur I think ###
              note = if ref.__note__ then ref.__note__ + "<br/>\n" else ''
              ref.__note__ = note + field.key + "=" + field.value
            else
              ref[field.key] = field.value

      @references.push(ref)

  error: (text) ->
    @errors.push("@#{@flatten(text)}")

  comment: (text) ->
    @comments.push(@flatten(text).trim())

  string: (str) ->
    @strings[str.verbatimKey] = str.value

  command: (command, param) ->
    variants = ["\\#{command}#{param}"]
    variants.push("{\\#{command}#{param}}")     if param.length == 1
    variants.push("{\\#{command}#{param[1]}}")  if param.length == 3 and param[0] == '{' and param[2] == '}'

    for variant in variants
      return LaTeX.toUnicode[variant] if LaTeX.toUnicode[variant]

    return param

  attachment: (parts) ->
    parts = (v.trim() for v in parts || [])

    switch parts.length
      when 0
        return {}
      when 1
        attachment = { path: parts.shift() }
      else
        attachment = { title: parts.shift() }
        attachment.path = parts.shift() ? ''
        attachment.mimeType = parts.shift() ? ''

    attachment.title = 'Attachment' unless attachment.title && attachment.title != ''
    attachment.mimeType = 'application/pdf' if attachment.mimeType.match(/pdf/i) || attachment.path.match(/\.pdf$/i)
    attachment.path = attachment.path.replace(/\\/g, '/')
    attachment.path = "file:///#{attachment.path}"  if attachment.path.match(/^[a-z]:\//i)
    attachment.path = "file:#{attachment.path}"  if attachment.path.match(/^\/\//)

    return attachment

  groupsTree: (id, groups) ->
    levels = Object.create(null)
    collections = []

    for group in groups
      continue unless group

      collection = Object.create(null)
      collection.name = group.data.shift()
      intersection = group.data.shift()

      collection.items = group.data.filter(@skipEmptyKeys)
      collection.collections = []

      levels[group.level] = collection
      if group.level == 1
        collections.push(collection)
      else
        levels[group.level - 1].collections.push(collection)
        switch intersection
          #when "0" # independent

          when "1"
            ### intersection ###
            collection.items = collection.items.filter(@intersect, levels[group.level - 1].items)

          when "2"
            ### union ###
            collection.items = @unique(levels[group.level - 1].items.concat(collection.items))

    @collections = @collections.concat(collections)
