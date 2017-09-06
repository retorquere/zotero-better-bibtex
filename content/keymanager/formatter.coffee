flash = require('../flash.coffee')
Prefs = require('../prefs.coffee')
debug = require('../debug.coffee')

parser = require('./formatter.pegjs')
parseDate = require('../dateparser.coffee')
transliterate = require('transliteration').transliterate
fold2ascii = require('fold-to-ascii').fold
punycode = require('punycode')
journalAbbrev = require('../journal-abbrev.coffee')

debug('Keymanager.Formatter... loading')

class PatternFormatter
  constructor: ->
    @update()

  update: ->
    debug('PatternFormatter.update:')
    @skipWords = Prefs.get('skipWords').split(',').map((word) -> word.trim()).filter((word) -> word)
    @fold = Prefs.get('citekeyFold')

    for attempt in ['get', 'reset']
      if attempt == 'reset'
        debug("PatternFormatter.update: malformed citekeyFormat '#{@citekeyFormat}', resetting to default")
        flash("Malformed citation pattern '#{@citekeyFormat}', resetting to default")
        Prefs.clear('citekeyFormat')
      @citekeyFormat = Prefs.get('citekeyFormat')

      try
        debug("PatternFormatter.update: trying citekeyFormat #{@citekeyFormat}...")
        @generate = new Function(@parsePattern(@citekeyFormat))
        break
      catch err
        debug('PatternFormatter.update: Error parsing citekeyFormat ', {pattern: @citekeyFormat}, err)

    debug('PatternFormatter.update: citekeyFormat=', @citekeyFormat, '' + @generate)
    return

  parsePattern: (pattern) -> parser.parse(pattern, PatternFormatter::)

  re:
    unsafechars: Zotero.Utilities.XRegExp("[^-\\p{L}0-9_!$*+./;?\\[\\]]")
    alphanum: Zotero.Utilities.XRegExp("[^\\p{L}\\p{N}]")
    punct: Zotero.Utilities.XRegExp('\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g')
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g')
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g')
    word: Zotero.Utilities.XRegExp("[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+(-[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+)*", 'g')

  removeDiacritics: (str) ->
    str = transliterate(str || '')
    str = fold2ascii(str)
    return str

  format: (item) ->
    @item = {
      item
      type: Zotero.ItemTypes.getName(item.itemTypeID)
    }
    return {} if @item.type in ['attachment', 'note']

    try
      @item.date = item.getField('date', false, true)
    try
      @item.title = item.getField('title', false, true)

    if @item.date
      date = parseDate(@item.date)
      date = (date.from || date.to) if date.type == 'interval'

      switch date?.type || 'verbatim'
        when 'verbatim'
          # strToDate is a lot less accurate than the BBT+EDTF dateparser, but it sometimes extracts year-ish things that
          # ours doesn't
          date = Zotero.Date.strToDate(@item.date)

          @item.year = parseInt(date.year)
          delete @item.year if isNaN(@item.year)
          @item.year ?= @item.date

          @item.month = parseInt(date.month)
          delete @item.month if isNaN(@item.month)

        when 'date'
          @item.origyear = date.orig?.year || date.year
          @item.year = date.year || @item.origyear

          @item.month = date.month

        when 'season'
          @item.year = date.year

        else
          throw "Unexpected parsed date #{JSON.stringify(date)}"

    debug('PatternFormatter.format: base state =', Object.assign({}, @item, {item: @item.title}))

    citekey = @generate()
    debug('PatternFormatter.format: generated', Object.assign({}, @item, {citekey, item: @item.title}))

    citekey.citekey ||= "zotero-#{item.id}"
    citekey.citekey = @removeDiacritics(citekey.citekey) if citekey.citekey && @fold
    return citekey

  clean: (str) ->
    return @safechars(@removeDiacritics(str)).trim()

  safechars: (str) ->
    return Zotero.Utilities.XRegExp.replace(str, @re.unsafechars, '', 'all')

  words: (str) ->
    # 551
    return (@clean(word).replace(/-/g, '') for word in Zotero.Utilities.XRegExp.matchChain(@innerText(str), [@re.word]) when word != '')

  ###
  # three-letter month abbreviations. I assume these are the same ones that the
  # docs say are defined in some appendix of the LaTeX book. (i don't have the
  # LaTeX book.)
  ###
  months: [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

  padYear: (year, length) ->
    return year if typeof year == 'string'
    return '' unless typeof year == 'number'

    # don't pad to pass the tests
    return '' + year if length != 2

    if year < 0
      prefix = '-'
      year = -year
    else
      prefix = ''

    return prefix + ('0000' + year).slice(-length)

  titleWords: (title, options = {}) ->
    return null unless title
    words = @words(title)

    words = (word.replace(/[^ -~]/g, '') for word in words) if options.asciiOnly
    words = (word for word in words when word != '')
    words = (word for word in words when @skipWords.indexOf(word.toLowerCase()) < 0 && punycode.ucs2.decode(word).length > 1) if options.skipWords
    return null if words.length == 0
    return words

  DOMParser: Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser)
  innerText: (str) ->
    return '' unless str
    doc = @DOMParser.parseFromString("<span>#{str}</span>", 'text/html')
    doc = doc.documentElement if doc.nodeType == 9 # DOCUMENT_NODE
    return doc.textContent

  initial: (creator) ->
    return '' unless creator.firstName

    if m = creator.firstName.match(/(.+)\u0097/)
      initial = m[1]
    else
      initial = creator.firstName[0]
    initial = @removeDiacritics(initial)

    return initial

  creators: (onlyEditors, options = {}) ->
    if !@item.creators
      types = Zotero.CreatorTypes.getTypesForItemType(@item.item.itemTypeID)
      types = types.reduce((map, type) -> map[type.name] = type.id; return map)
      primary = Zotero.CreatorTypes.getPrimaryIDForType(@item.item.itemTypeID)

      @item.creators = {}

      for creator in @item.item.getCreators()
        continue if onlyEditors && creator.creatorTypeID not in [types.editor, types.seriesEditor]

        if options.initialOnly
          name = @initial(creator)
        else
          name = @innerText(creator.lastName)

        if name
          if options.withInitials && creator.firstName
            initials = Zotero.Utilities.XRegExp.replace(creator.firstName, @re.caseNotUpperTitle, '', 'all')
            initials = @removeDiacritics(initials)
            initials = Zotero.Utilities.XRegExp.replace(initials, @re.caseNotUpper, '', 'all')
            name += initials
        else
          name = @innerText(creator.firstName)

        continue unless name

        switch creator.creatorTypeID
          when types.editor, types.seriesEditor
            @item.creators.editors ||= []
            @item.creators.editors.push(name)

          when types.translator
            @item.creators.translators ||= []
            @item.creators.translators.push(name)

          when primary
            @item.creators.authors ||= []
            @item.creators.authors.push(name)

          else
            @item.creators.collaborators ||= []
            @item.creators.collaborators.push(name)

    return @item.creators.editors || [] if onlyEditors
    return @item.creators.authors || @item.creators.editors || @item.creators.translators || @item.creators.collaborators || []

  zotero:
    numberRe: /^[0-9]+/
    citeKeyTitleBannedRe: /\b(a|an|the|some|from|on|in|to|of|do|with|der|die|das|ein|eine|einer|eines|einem|einen|un|une|la|le|l\'|el|las|los|al|uno|una|unos|unas|de|des|del|d\')(\s+|\b)|(<\/?(i|b|sup|sub|sc|span)>)/g
    citeKeyConversionsRe: /%([a-zA-Z])/
    citeKeyCleanRe: /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g

  # methods
  $zotero: ->
    key = ''

    if creator = (@item.item.getCreators() || [])[0]
      key += creator.lastName.toLowerCase().replace(RegExp(' ', 'g'), '_').replace(/,/g, '') if creator.lastName

    key += '_'

    if title = @item.title
      key += title.toLowerCase().replace(@zotero.citeKeyTitleBannedRe, '').split(/\s+/g)[0]

    key += '_'

    year = '????'
    if @item.date
      date = Zotero.Date.strToDate(@item.date)
      year = date.year if date.year && @zotero.numberRe.test(date.year)
    key += year

    key = Zotero.Utilities.removeDiacritics(key.toLowerCase(), true)
    return key.replace(@zotero.citeKeyCleanRe, '')

  $property: (name) ->
    try
      return @innerText(@item.item.getField(name, false, true) || '')
    try
      return @innerText(@item.item.getField(name[0].toLowerCase() + name.slice(1), false, true) || '')
    return ''

  $library: ->
    return '' if @item.item.libraryID == Zotero.Libraries.userLibraryID
    return Zotero.Libraries.getName(@item.item.libraryID)

  $auth: (onlyEditors, withInitials, n, m) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length
    author = authors[m || 0]
    author = author.substring(0, n)  if author && n
    return author ? ''

  $authForeIni: (onlyEditors) ->
    authors = @creators(onlyEditors, {initialOnly: true})
    return '' unless authors?.length
    return authors[0]

  $authorLastForeIni: (onlyEditors) ->
    authors = @creators(onlyEditors, {initialOnly: true})
    return '' unless authors?.length
    return authors[authors.length - 1]

  $authorLast: (onlyEditors, withInitials) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length
    return authors[authors.length - 1] ? ''

  $journal: -> journalAbbrev.get(@item.item, true) || @item.item.getField('publicationTitle', false, true)

  $authors: (onlyEditors, withInitials, n) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length

    if n
      etal = (authors.length > n)
      authors = authors.slice(0, n)
      authors.push('EtAl') if etal

    authors = authors.join('')
    return authors

  $authorsAlpha: (onlyEditors, withInitials) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length

    return switch authors.length
      when 1
        return authors[0].substring(0, 3)

      when 2, 3, 4
        return (author.substring(0, 1) for author in authors).join('')

      else
        return (author.substring(0, 1) for author in authors.slice(0, 3)).join('') + '+'

  $authIni: (onlyEditors, withInitials, n) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length
    return (author.substring(0, n) for author in authors).join('.')

  $authorIni: (onlyEditors, withInitials) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length
    firstAuthor = authors.shift()
    return [firstAuthor.substring(0, 5)].concat(((name.substring(0, 1) for name in auth).join('.') for auth in authors)).join('.')

  $auth_auth_ea: (onlyEditors, withInitials) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length
    return authors.slice(0, 2).concat((if authors.length > 2 then ['ea'] else [])).join('.')

  $authEtAl: (onlyEditors, withInitials) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length

    return authors.join('') if authors.length == 2
    return authors.slice(0, 1).concat((if authors.length > 1 then ['EtAl'] else [])).join('')

  $auth_etal: (onlyEditors, withInitials) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length

    return authors.join('.') if authors.length == 2
    return authors.slice(0, 1).concat((if authors.length > 1 then ['etal'] else [])).join('.')

  $authshort: (onlyEditors, withInitials) ->
    authors = @creators(onlyEditors, {withInitials})
    return '' unless authors?.length

    switch authors.length
      when 0
        return ''

      when 1
        return authors[0]

      else
        return (author.substring(0, 1) for author in authors).join('.') + (if authors.length > 3 then '+' else '')

  $firstpage: ->
    @item.pages ||= @item.item.getField('pages', false, true)
    return '' unless @item.pages
    firstpage = ''
    @item.pages.replace(/^([0-9]+)/g, (match, fp) -> firstpage = fp)
    return firstpage

  $lastpage: ->
    @item.pages ||= @item.item.getField('pages', false, true)
    return '' unless @item.pages
    lastpage = ''
    @item.pages.replace(/([0-9]+)[^0-9]*$/g, (match, lp) -> lastpage = lp)
    return lastpage

  $keyword: (n) ->
    @item.tags ||= (tag.tag for tag in @item.item.getTags())
    return @item.tags[n] || ''

  $shorttitle: ->
    words = @titleWords(@item.title, { skipWords: true, asciiOnly: true})
    return ''  unless words
    return words.slice(0, 3).join('')

  $veryshorttitle: ->
    words = @titleWords(@item.title, { skipWords: true, asciiOnly: true})
    return '' unless words
    return words.slice(0, 1).join('')

  $shortyear: ->
    return @padYear(@item.year, 2)

  $year: ->
    return @padYear(@item.year, 4)

  $origyear: ->
    return @padYear(@item.origyear, 4)

  $month: ->
    return '' unless @item.month
    return @months[@item.month - 1] ? ''

  $title: -> @titleWords(@item.title).join('')

  # filters
  _condense: (value, sep) ->
    sep = '' if typeof sep == 'undefined'
    return (value || '').replace(/\s/g, sep)

  _prefix: (value, prefix) ->
    value ||= ''
    return "#{prefix}#{value}" if value != '' && prefix
    return value

  _postfix: (value, postfix) ->
    value ||= ''
    return value + postfix if value != '' && postfix
    return value

  _abbr: (value) ->
    return (word.substring(0, 1) for word in (value || '').split(/\s+/)).join('')

  _lower: (value) ->
    return (value || '').toLowerCase()

  _upper: (value) ->
    return (value || '').toUpperCase()

  _skipwords: (value) ->
    return (word for word in (value || '').split(/\s+/) when @skipWords.indexOf(word.toLowerCase()) < 0).join(' ').trim()

  _select: (value, start, n) ->
    value = (value || '').split(/\s+/)
    end = value.length
    start = 1 if typeof start == 'undefined'
    start = parseInt(start) - 1
    end = start + parseInt(n) if typeof n != 'undefined'
    return value.slice(start, end).join(' ')

  _substring: (value, start, n) ->
    return (value || '').slice(start - 1, start - 1 + n)

  _ascii: (value) ->
    return (value || '').replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim()

  _alphanum: (value) ->
    return Zotero.Utilities.XRegExp.replace(value || '', @re.alphanum, '', 'all').split(/\s+/).join(' ').trim()

  _fold: (value) ->
    return @removeDiacritics(value).split(/\s+/).join(' ').trim()

  _capitalize: (value) ->
    return (value || '').replace(/((^|\s)[a-z])/g, (m) -> m.toUpperCase())

  _nopunct: (value) ->
    return Zotero.Utilities.XRegExp.replace(value || '', @re.punct, '', 'all')

#  ### TODO: What is this for? ###
#  HTML: class
#    constructor: (html) ->
#      @text = ''
#      @HTMLtoDOM.Parser(html, @)
#
#    cdata: (text) -> @text += text
#
#    chars: (text) -> @text += text

debug('Keymanager.Formatter loaded')
module.exports = new PatternFormatter()
