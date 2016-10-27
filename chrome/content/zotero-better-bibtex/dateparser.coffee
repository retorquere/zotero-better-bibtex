class Zotero.BetterBibTeX.DateParser
  parseDateToObject: (date, options) -> (new Zotero.BetterBibTeX.DateParser(date, options)).date
  parseDateToArray: (date, options) -> (new Zotero.BetterBibTeX.DateParser(date, options)).array()

  toArray: (date) ->
    ### [ 0 ] instead if [0, 0]; see https://github.com/retorquere/zotero-better-bibtex/issues/360#issuecomment-143540469 ###
    return [ 0 ] unless date.type in ['Date', 'Season']

    return null unless date.year

    arr = [ date.year ]
    if date.month
      arr.push(date.month)
      arr.push(date.day) if date.day
    return arr

  array: ->
    date1 = @toArray(@date.from || @date)
    return {literal: @source} unless date1

    date2 = @toArray(@date.to) if @date.to

    array = {'date-parts': (if date2 then [date1, date2] else [date1])}
    array.circa = true if @date.approximate
    return array

  constructor: (@source, options = {}) ->
    @source = @source.trim() if @source
    @zoteroLocale ?= Zotero.locale.toLowerCase()
    @edtf = options.edtf
    @cslNull = options.cslNull

    return unless @source

    if options.locale
      locale = options.locale.toLowerCase()
      @dateorder = Zotero.BetterBibTeX.Locales.dateorder[locale]
      if @dateorder
        found = locale
      else
        for k, v of Zotero.BetterBibTeX.Locales.dateorder
          if k == locale || k.slice(0, locale.length) == locale
            found = k
            @dateorder = Zotero.BetterBibTeX.Locales.dateorder[options.locale] = v
            break

    if !@dateorder
      fallback = Zotero.BetterBibTeX.Pref.get('defaultDateParserLocale')
      @dateorder = Zotero.BetterBibTeX.Locales.dateorder[fallback]
      if !@dateorder
        @dateorder = Zotero.BetterBibTeX.Locales.dateorder[fallback] = Zotero.BetterBibTeX.Locales.dateorder[fallback.trim().toLowerCase()]

    @dateorder ||= Zotero.BetterBibTeX.Locales.dateorder[@zoteroLocale]

    @date = @parse()

  swapMonth: (date, dateorder) ->
    return unless date.day && date.month

    switch
      when @dateorder && @dateorder == dateorder && date.day <= 12 then
      when date.month > 12 then
      else return
    [date.month, date.day] = [date.day, date.month]

  cruft: new Zotero.Utilities.XRegExp("[^\\p{Letter}\\p{Number}]+", 'g')
  parsedate: (date) ->
    date = date.trim()
    return { type: 'Unknown', verbatim: date } if date == ''

    ### TODO: https://bitbucket.org/fbennett/citeproc-js/issues/189/8-juli-2011-parsed-as-literal ###
    date = date.replace(/^([0-9]+)\.\s+([a-z])/i, '$1 $2')

    ### https://github.com/retorquere/zotero-better-bibtex/issues/515 ###
    if m = date.match(/^(-?[0-9]{3,4}-[0-9]{1,2}-[0-9]{1,2})T[0-9]{2}:[0-9]{2}:[0-9]{2}(\+[0-9]+|\s*[A-Z]+)?(.*)/)
      date = m[1] + m[3]

    if m = date.match(/^(-?[0-9]{3,4})(\?)?(~)?$/)
      return {
        type: 'Date'
        year: @year(m[1])
        uncertain: (if m[2] == '?' then true else undefined)
        approximate: (if m[3] == '~' then true else undefined)
      }

    ### CSL dateparser doesn't recognize d?/m/y ###
    if m = date.match(/^(([0-9]{1,2})[-\.\s\/])?([0-9]{1,2})[-\.\s\/]([0-9]{3,4})(\?)?(~)?$/)
      parsed = {
        type: 'Date'
        year: parseInt(m[4])
        month: parseInt(m[3])
        day: parseInt(m[1]) || undefined
        uncertain: (if m[5] == '?' then true else undefined)
        approximate: (if m[6] == '~' then true else undefined)
      }
      @swapMonth(parsed, 'mdy')
      parsed.type = 'Season' if parsed.month > 12
      return parsed

    if m = date.match(/^(-?[0-9]{3,4})[-\.\s\/]([0-9]{1,2})([-\.\s\/]([0-9]{1,2}))?(\?)?(~)?$/)
      parsed = {
        type: 'Date'
        year: @year(m[1])
        month: parseInt(m[2])
        day: parseInt(m[4]) || undefined
        uncertain: (if m[5] == '?' then true else undefined)
        approximate: (if m[6] == '~' then true else undefined)
      }
      ### only swap to repair -- assume yyyy-nn-nn == EDTF-0 ###
      @swapMonth(parsed)
      parsed.type = 'Season' if parsed.month > 12
      return parsed

    parsed = Zotero.BetterBibTeX.CSL.DateParser.parseDateToObject(date)
    for k, v of parsed
      switch
        when v == 'NaN' then delete parsed[k]
        when typeof v == 'string' && v.match(/^-?[0-9]+$/) then parsed[k] = parseInt(v)

    return null if parsed.literal

    ### there's a season in there somewhere ###
    return null if parsed.month && parsed.month > 12

    shape = date
    shape = shape.slice(1) if shape[0] == '-'
    shape = Zotero.Utilities.XRegExp.replace(shape.trim(), @cruft, ' ', 'all')
    shape = shape.split(' ')

    fields = (if parsed.year then 1 else 0) + (if parsed.month then 1 else 0) + (if parsed.day then 1 else 0)

    if fields == 3 || shape.length == fields
      parsed.type = 'Date'
      return parsed

    return null

  parserange: ->
    for sep in ['--', '_', '/', '-']
      continue if @source == sep
      ### too hard to distinguish from negative year ###
      continue if sep == '-' && @source.match(/^-[0-9]{3,4}/)

      interval = @source.split(sep)
      continue unless interval.length == 2 && interval[0].trim() && interval[1].trim()

      interval = {
        type: 'Interval'
        verbatim: @source
        from: (new Zotero.BetterBibTeX.DateParser(m[1].trim())).date
        to: (new Zotero.BetterBibTeX.DateParser(m[2].trim())).date
      }

      continue unless interval.from.type in ['Date', 'Season'] && interval.to.type in ['Date', 'Season']

      return interval

    return null

  year: (y) ->
    y = parseInt(y)

    # 360: CSL doesn't do 'null', so zero means null, and all negative dates must be bumped one down
    y -= 1 if y <= 0 && @cslNull

    return y

  parse: ->
    if m = @source.match(/^\[([^\[\]]+)\]([^\[\]]+)/)
      origdate = (new Zotero.BetterBibTeX.DateParser(m[1].trim())).date
      repubdate = (new Zotero.BetterBibTeX.DateParser(m[2].trim())).date
      if origdate.type in ['Date', 'Season', 'Interval'] && repubdate.type in ['Date', 'Season', 'Interval']
        repubdate.origdate = origdate
        return repubdate

    if m = @source.match(/^y(-?[0-9]+)$/)
      return {
        type: 'Date'
        edtf: true
        year: parseInt(m[1])
      }

    parsed = @parse_edtf(@source)
    return parsed if (@edtf && parsed) || parsed?.year || parsed?.from?.year

    return { type: 'Verbatim', verbatim: @source } if !@source || @source in ['--', '/', '_']

    candidate = @parserange()

    ### if no range was found, try to parse the whole input as a single date ###
    candidate ||= @parsedate(@source)

    ### if that didn't yield anything, assume literal ###
    candidate ||= { type: 'Verbatim', verbatim: @source }

    return candidate

  parse_edtf: (date) ->
    try
      # will throw an error if it's not an EDTF date/time
      # replaces are because edtf.js parses the WD ISO norm rather than EDTF: https://github.com/inukshuk/edtf.js/issues/6
      parsed = Zotero.BetterBibTeX.EDTF.parse(date.replace(/unknown/g, '*').replace(/open/g, '').replace(/u/g, 'X').replace(/\?~/g, '%'))
    catch err
      return null

    return @normalize_edtf(parsed)

  normalize_edtf: (parsed) ->
    if parsed in [ Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
      return {
        edtf: true
        type: 'Unknown'
        verbatim: @source
      }

    unspecified = if parsed.unspecified then new Zotero.BetterBibTeX.EDTF.Bitmask(parsed.unspecified) else undefined

    switch parsed.type
      when 'Date'
        n = {
          type: 'Date'
          edtf: true
          verbatim: @source
        }
        return n if parsed.values.length < 1 || (unspecified && unspecified.is('year'))
        n.approximate = true if parsed.approximate
        n.year = parsed.values[0]
        n.uncertain = true if parsed.uncertain

        return n if parsed.values.length < 2 || (unspecified && unspecified.is('month'))
        n.month = parsed.values[1] + 1

        return n if parsed.values.length < 3 || (unspecified && unspecified.is('day'))
        n.day = parsed.values[2]
        return n

      when 'Season'
        n = {
          type: 'Date'
          edtf: true
          year: parsed.values[0]
          month: parsed.values[1]
          verbatim: @source
        }
        n.uncertain = true if parsed.uncertain
        n.approximate = true if parsed.approximate
        return n

      when 'Interval'
        from = if parsed.values[0] then @normalize_edtf(parsed.values[0]) else { type: 'Open', edtf: true }
        to = if parsed.values[1] then @normalize_edtf(parsed.values[1]) else { type: 'Open', edtf: true }
        n = {
          type: 'Interval'
          edtf: true
          from: from
          to: to
          verbatim: @source
        }
        n.uncertain = true if parsed.uncertain || from.uncertain || to.uncertain
        n.approximate = true if parsed.approximate || from.approximate || to.approximate
        return n

      else
        throw "Unexpected date type #{JSON.stringify(parsed)}"
