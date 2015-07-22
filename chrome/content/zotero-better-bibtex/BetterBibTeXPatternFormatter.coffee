class BetterBibTeXPatternFormatter
  constructor: (@patterns) ->
    Zotero.BetterBibTeX.debug('formatter:', @pattern)

  re:
    unsafechars: Zotero.Utilities.XRegExp("[^-\\p{L}0-9_!$*+./;?\\[\\]]")
    alphanum: Zotero.Utilities.XRegExp("[^\\p{L}\\p{N}]")
    punct: Zotero.Utilities.XRegExp('\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g')
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g')
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g')

  format: (item) ->
    @item = Zotero.BetterBibTeX.serialized.get(item)
    return {} if @item.itemType in ['attachment', 'note']

    for candidate in @patterns[0]
      delete @postfix
      citekey = @concat(candidate)
      return {citekey: citekey, postfix: @postfix} if citekey != ''
    return {}

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
    result = (@reduce(part) for part in pattern)
    result = (part for part in result when part)
    return result.join('').replace(/[\s{},]/, '')

  reduce: (step) ->
    value = @methods[step.method].apply(@, step.arguments)
    value = '' if value in [undefined, null]
    value = @clean(value) if step.scrub

    return value unless step.filters

    for filter in step.filters
      value = @filters[filter.filter].apply(@, [value].concat(filter.arguments))
      value = '' if value in [undefined, null]
    return value

  clean: (str) ->
    return @safechars(Zotero.BetterBibTeX.removeDiacritics(str || '')).trim()

  safechars: (str) ->
    safe = Zotero.Utilities.XRegExp.replace(str, @re.unsafechars, '', 'all')
    Zotero.BetterBibTeX.debug('safechars:', str, '->', safe, ':', @re.unsafechars)
    return safe

  words: (str) ->
    return (@clean(word) for word in Zotero.Utilities.XRegExp.matchChain(@innerText(str), [XRegExp("[\\p{Alphabetic}\\p{Nd}\\{Pc}\\p{M}]+", "g")]) when word != '')

  # three-letter month abbreviations. I assume these are the same ones that the
  # docs say are defined in some appendix of the LaTeX book. (i don't have the
  # LaTeX book.)
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
    return (new @HTML(str)).text.replace(/\s+/, ' ').trim()

  creators: (onlyEditors, withInitials) ->
    return [] unless @item.creators?.length

    creators = {}
    primaryCreatorType = Zotero.Utilities.getCreatorsForType(@item.itemType)[0]
    for creator in @item.creators
      continue if onlyEditors && creator.creatorType not in ['editor', 'seriesEditor']

      name = @innerText(creator.lastName)

      if name != ''
        if withInitials and creator.firstName
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

  methods:
    '0': (text) ->
      @postfix = '0'
      return ''

    literal: (text) -> return text

    property: (name) ->
      return @innerText(@item[name] || @item[name[0].toLowerCase() + name.slice(1)] || '')

    id: -> return @item.itemID

    key: -> return @item.key

    auth: (onlyEditors, withInitials, n, m) ->
      authors = @creators(onlyEditors, withInitials)
      return ''  unless authors
      author = authors[m || 0]
      author = author.substring(0, n)  if author and n
      return author ? ''

    authorLast: (onlyEditors, withInitials) ->
      authors = @creators(onlyEditors, withInitials)
      return '' unless authors
      return authors[authors.length - 1] ? ''

    journal: ->
      return Zotero.BetterBibTeX.keymanager.journalAbbrev(@item)

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
      return '' unless @item.date
      date = Zotero.Date.strToDate(@item.date)
      return '' if typeof date.year == 'undefined'
      year = date.year % 100
      return "0#{year}"  if year < 10
      return '' + year

    year: ->
      return '' unless @item.date
      date = Zotero.Date.strToDate(@item.date)
      return @item.date if typeof date.year == 'undefined'
      return date.year

    month: ->
      return '' unless @item.date
      date = Zotero.Date.strToDate(@item.date)
      return '' if typeof date.year == 'undefined'
      return @months[date.month] ? ''

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

Components.utils.import('resource://zotero-better-bibtex/translators/htmlparser.js', BetterBibTeXPatternFormatter::HTML::)
