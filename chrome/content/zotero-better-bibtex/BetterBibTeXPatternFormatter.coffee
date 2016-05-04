class BetterBibTeXPatternFormatter
  constructor: (@patterns, @fold) ->
    Zotero.BetterBibTeX.debug('formatter:', @patterns, @fold)

  re:
    unsafechars: Zotero.Utilities.XRegExp("[^-\\p{L}0-9_!$*+./;?\\[\\]]")
    alphanum: Zotero.Utilities.XRegExp("[^\\p{L}\\p{N}]")
    punct: Zotero.Utilities.XRegExp('\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g')
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g')
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g')
    word: Zotero.Utilities.XRegExp("[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+", 'g')

  format: (item) ->
    @item = Zotero.BetterBibTeX.serialized.get(item)
    return {} if @item.itemType in ['attachment', 'note']

    delete @year
    delete @month

    if @item.date
      date = Zotero.BetterBibTeX.DateParser::parseDateToObject(@item.date, {locale: @item.language, verbatimDetection: false})
      if date
        if date.literal
          date = Zotero.Date.strToDate(@item.date)

          @year = parseInt(date.year)
          delete @year if isNaN(@year)
          @year ?= @item.date

          @month = parseInt(date.month)
          delete @month if isNaN(@month)

        else
          @year = date.year
          @month = date.month

    items = [@item]
    if @item.multi || (@item.creators && @item.creators.some((creator) -> creator.multi))
      Zotero.BetterBibTeX.debug('multi found')

      languages = {}

      @item = JSON.parse(JSON.stringify(@item))
      @item.multi ||= {}
      @item.multi.main ||= {}
      @item.multi._keys ||= {}
      for field, variants of @item.multi._keys
        @item.multi._keys[field][@item.multi.main[field] || @item.language] = @item[field]
        for lang in Object.keys(@item.multi._keys[field])
          continue unless lang
          launguages[lang] = true

      for creator in (@item.creators || [])
        creator.multi ||= {}
        creator.multi.main ||= {}
        creator.multi._key ||= {}
        creator.multi._key[creator.multi.main || @item.language] = creator
        for lang in Object.keys(creator.multi._keys[field])
          continue unless lang
          launguages[lang] = true

      for lang in Object.keys(languages)
        item = JSON.parse(JSON.stringify(@item))

        for field, variants of item.multi._keys
          item[field] = variants[lang] if variants[lang]

        for creator in (item.creators || [])
          pick = creator.multi._key[lang]
          continue unless pick
          creator.lastName = pick.lastName
          creator.firstName = pick.firstName
          creator.name = pick.name
          creator.fieldMode = pick.fieldMode

        items.push(item)

    match = {}
    for @item in items
      for candidate in @patterns[0]
        delete @postfix
        citekey = @concat(candidate)
        continue unless citekey.length > (match.citekey || '').length
        match = {citekey: citekey, postfix: @postfix}
    return match

  alternates: (item) ->
    @item = Zotero.BetterBibTeX.serialized.get(item)
    return if @item.itemType in ['attachment', 'note']

    citekeys = []
    for pattern in @patterns
      citekey = ''
      for candidate in pattern
        citekey = @concat(candidate)
        break if citekey != ''
      citekeys.push(citekey)
    return citekeys

  concat: (pattern) ->
    result = ''
    for part in pattern
      part = @evaluate(part)
      continue unless part
      if typeof(part) == 'function'
        return '' unless part.call(null, result)
      else
        result += part.replace(/[\s{},]/g, '')

    result = Zotero.BetterBibTeX.removeDiacritics(result) if @fold
    return result

  evaluate: (step) ->
    Zotero.BetterBibTeX.debug('evaluate', typeof step.method, step)

    value = step.method.apply(@, step.arguments) || ''
    return value if typeof(value) == 'function'

    value = @clean(value) if step.scrub

    for filter in step.filters
      value = @filters[filter.filter].apply(@, [value].concat(filter.arguments)) || ''

    return value

  clean: (str) ->
    return @safechars(Zotero.BetterBibTeX.removeDiacritics(str || '')).trim()

  safechars: (str) ->
    return Zotero.Utilities.XRegExp.replace(str, @re.unsafechars, '', 'all')

  words: (str) ->
    return (@clean(word) for word in Zotero.Utilities.XRegExp.matchChain(@innerText(str), [@re.word]) when word != '')

  ###
  # three-letter month abbreviations. I assume these are the same ones that the
  # docs say are defined in some appendix of the LaTeX book. (i don't have the
  # LaTeX book.)
  ###
  months: [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

  titleWords: (title, options = {}) ->
    return null unless title
    words = @words(title)

    words = (word.replace(/[^ -~]/g, '') for word in words) if options.asciiOnly
    words = (word for word in words when word != '')
    words = (word for word in words when @skipWords.indexOf(word.toLowerCase()) < 0 && Zotero.BetterBibTeX.punycode.ucs2.decode(word).length > 1) if options.skipWords
    return null if words.length == 0
    return words

  innerText: (str) ->
    return Zotero.BetterBibTeX.HTMLParser.text(str)

  creators: (onlyEditors, withInitials) ->
    return [] unless @item.creators?.length

    creators = {}
    primaryCreatorType = Zotero.Utilities.getCreatorsForType(@item.itemType)[0]
    for creator in @item.creators
      continue if onlyEditors && creator.creatorType not in ['editor', 'seriesEditor']

      name = @innerText(creator.name || creator.lastName)

      if name != ''
        if withInitials && creator.firstName
          initials = Zotero.Utilities.XRegExp.replace(creator.firstName, @re.caseNotUpperTitle, '', 'all')
          initials = Zotero.BetterBibTeX.removeDiacritics(initials)
          initials = Zotero.Utilities.XRegExp.replace(initials, @re.caseNotUpper, '', 'all')
          name += initials
      else
        name = @innerText(creator.firstName)

      continue if name == ''

      switch creator.creatorType
        when 'editor', 'seriesEditor'
          creators.editors ||= []
          creators.editors.push(name)

        when 'translator'
          creators.translators ||= []
          creators.translators.push(name)

        when primaryCreatorType
          creators.authors ||= []
          creators.authors.push(name)

        else
          creators.collaborators ||= []
          creators.collaborators.push(name)

    return creators.editors || [] if onlyEditors
    return creators.authors || creators.editors || creators.translators || creators.collaborators || []

  zotero:
    numberRe: /^[0-9]+/
    citeKeyTitleBannedRe: /\b(a|an|the|some|from|on|in|to|of|do|with|der|die|das|ein|eine|einer|eines|einem|einen|un|une|la|le|l\'|el|las|los|al|uno|una|unos|unas|de|des|del|d\')(\s+|\b)|(<\/?(i|b|sup|sub|sc|span style=\"small-caps\"|span)>)/g
    citeKeyConversionsRe: /%([a-zA-Z])/
    citeKeyCleanRe: /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g

  methods:
    zotero: ->
      @postfix = '0'
      key = ''

      if @item.creators && @item.creators[0] && (@item.creators[0].lastName || @item.creators[0].name)
        key += (@item.creators[0].lastName || @item.creators[0].name).toLowerCase().replace(RegExp(' ', 'g'), '_').replace(/,/g, '')

      key += '_'

      if @item.title
        key += @item.title.toLowerCase().replace(@zotero.citeKeyTitleBannedRe, '').split(/\s+/g)[0]

      key += '_'

      year = '????'
      if @item.date
        date = Zotero.Date.strToDate(@item.date)
        year = date.year if date.year && @zotero.numberRe.test(date.year)
      key += year

      key = Zotero.Utilities.removeDiacritics(key.toLowerCase(), true)
      return key.replace(@zotero.citeKeyCleanRe, '')

    '0': (text) ->
      @postfix = '0'
      return ''

    literal: (text) -> return text

    '>': (chars) ->
      return (text) -> (text && text.length > chars)

    property: (name) ->
      return @innerText(@item[name] || @item[name[0].toLowerCase() + name.slice(1)] || '')

    id: -> return @item.itemID

    key: -> return @item.key

    auth: (onlyEditors, withInitials, n, m) ->
      authors = @creators(onlyEditors, withInitials)
      return ''  unless authors
      author = authors[m || 0]
      author = author.substring(0, n)  if author && n
      return author ? ''

    authorLast: (onlyEditors, withInitials) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors
      return authors[authors.length - 1] ? ''

    journal: -> Zotero.BetterBibTeX.keymanager.journalAbbrev(@item) || @item.publicationTitle

    authors: (onlyEditors, withInitials, n) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors

      if n
        etal = (authors.length > n)
        authors = authors.slice(0, n)
        authors.push('EtAl') if etal

      authors = authors.join('')
      return authors

    authorsAlpha: (onlyEditors, withInitials) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors

      return switch authors.length
        when 1
          return authors[0].substring(0, 3)

        when 2, 3, 4
          return (author.substring(0, 1) for author in authors).join('')

        else
          return (author.substring(0, 1) for author in authors.slice(0, 3)).join('') + '+'

    authIni: (onlyEditors, withInitials, n) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors
      return (author.substring(0, n) for author in authors).join('.')

    authorIni: (onlyEditors, withInitials) ->
      authors = @creators(onlyEditors, withInitials)
      return ''  unless authors
      firstAuthor = authors.shift()
      return [firstAuthor.substring(0, 5)].concat(((name.substring(0, 1) for name in auth).join('.') for auth in authors)).join('.')

    'auth.auth.ea': (onlyEditors, withInitials) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors
      return authors.slice(0, 2).concat((if authors.length > 2 then ['ea'] else [])).join('.')

    'auth.etal': (onlyEditors, withInitials) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors

      return authors.join('.') if authors.length == 2
      return authors.slice(0, 1).concat((if authors.length > 1 then ['etal'] else [])).join('.')

    authshort: (onlyEditors, withInitials) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors

      switch authors.length
        when 0
          return ''

        when 1
          return authors[0]

        else
          return (author.substring(0, 1) for author in authors).join('.') + (if authors.length > 3 then '+' else '')

    firstpage: ->
      return '' unless @item.pages
      firstpage = ''
      @item.pages.replace(/^([0-9]+)/g, (match, fp) -> firstpage = fp)
      return firstpage

    keyword: (n) ->
      return '' if not @item.tags?[n]
      return @item.tags[n].tag

    lastpage: ->
      return '' unless @item.pages
      lastpage = ''
      @item.pages.replace(/([0-9]+)[^0-9]*$/g, (match, lp) -> lastpage = lp)
      return lastpage

    shorttitle: ->
      words = @titleWords(@item.title, { skipWords: true, asciiOnly: true})
      return ''  unless words
      words.slice(0, 3).join('')

    veryshorttitle: ->
      words = @titleWords(@item.title, { skipWords: true, asciiOnly: true})
      return '' unless words
      words.slice(0, 1).join('')

    shortyear: ->
      return '' unless @year
      year = @year % 100
      return "0#{year}"  if year < 10
      return '' + year

    year: ->
      return @year || ''

    month: ->
      return '' unless @month
      return @months[@month - 1] ? ''

    title: ->
      return @titleWords(@item.title).join('')

  filters:
    ifempty: (value, dflt) ->
      return dflt if (value || '') == ''
      return value

    condense: (value, sep) ->
      sep = '' if typeof sep == 'undefined'
      return (value || '').replace(/\s/g, sep)

    prefix: (value, prefix) ->
      value ||= ''
      return "#{prefix}#{value}" if value != '' && prefix
      return value

    postfix: (value, postfix) ->
      value ||= ''
      return value + postfix if value != '' && postfix
      return value

    abbr: (value) ->
      return (word.substring(0, 1) for word in (value || '').split(/\s+/)).join('')

    lower: (value) ->
      return (value || '').toLowerCase()

    upper: (value) ->
      return (value || '').toUpperCase()

    skipwords: (value) ->
      return (word for word in (value || '').split(/\s+/) when @skipWords.indexOf(word.toLowerCase()) < 0).join(' ').trim()

    select: (value, start, n) ->
      value = (value || '').split(/\s+/)
      end = value.length
      start = 1 if typeof start == 'undefined'
      start = parseInt(start) - 1
      end = start + parseInt(n) if typeof n != 'undefined'
      return value.slice(start, end).join(' ')

    substring: (value, start, n) ->
      return (value || '').slice(start - 1, start - 1 + n)

    ascii: (value) ->
      return (value || '').replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim()

    alphanum: (value) ->
      return Zotero.Utilities.XRegExp.replace(value || '', @re.alphanum, '', 'all').split(/\s+/).join(' ').trim()

    fold: (value) ->
      return Zotero.BetterBibTeX.removeDiacritics(value || '').split(/\s+/).join(' ').trim()

    capitalize: (value) ->
      return (value || '').replace(/((^|\s)[a-z])/g, (m) -> m.toUpperCase())

    nopunct: (value) ->
      return Zotero.Utilities.XRegExp.replace(value || '', @re.punct, '', 'all')

  HTML: class
    constructor: (html) ->
      @text = ''
      @HTMLtoDOM.Parser(html, @)

    cdata: (text) ->
      @text += text

    chars: (text) ->
      @text += text
