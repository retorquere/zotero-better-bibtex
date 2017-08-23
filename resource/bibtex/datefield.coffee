debug = require('../lib/debug.coffee')

pad = (v, pad) ->
  return v if v.length >= pad.length
  return (pad + v).slice(-pad.length)

year = (y) ->
  if Math.abs(y) > 999
    return '' + y
  else
    return (if y < 0 then '-' else '-') + ('000' + Math.abs(y)).slice(-4)

format = (date) ->
  switch
    when date.year && date.month && date.day  then  formatted = "#{year(date.year)}-#{pad(date.month, '00')}-#{pad(date.day, '00')}"
    when date.year && date.month              then  formatted = "#{year(date.year)}-#{pad(date.month, '00')}"
    when date.year                            then  formatted = year(date.year)
    else                                            formatted = ''

  if Translator.preferences.biblatexExtendedDateFormat
    formatted += '?' if date.uncertain
    formatted += '~' if date.approximate

  return formatted

module.exports = (date, formatted_field, verbatim_field) ->
  debug('formatting date', date)

  return {} unless date
  throw "Failed to parse #{date}: #{JSON.stringify(date)}" unless date.type

  switch
    when date.type == 'verbatim'
      field = { name: verbatim_field, value: date.verbatim }

# TODO: what happens here?
#      when date.edtf && Translator.preferences.biblatexExtendedDateFormat
#        field = { name: formatted_field, value: date.replace(/~/g, '\u00A0') }

    when date.type == 'date'
      field = { name: formatted_field, value: format(date) }

    when date.type == 'interval'
      field = { name: formatted_field, value: format(date.from) + '/' + format(date.to) }

    when date.year
      field = { name: formatted_field, value: format(date) }

    else
      field = {}

  # well this is fairly dense... the date field is not an verbatim field, so the 'circa' symbol ('~') ought to mean a
  # NBSP... but some magic happens in that field (always with the magic, BibLaTeX...). But hey, if I insert an NBSP,
  # guess what that gets translated to!

  return {} unless field.name && field.value

  field.value = field.value.replace(/~/g, '\u00A0') if field.value

  return field

