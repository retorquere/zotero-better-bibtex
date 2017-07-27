edtf = require('edtf')
edtfy = require('edtfy')
debug = require('./debug.coffee')
escapeStringRegexp = require('escape-string-regexp')

months = require('../gen/dateparser-data.json')
months_re = Object.keys(months)
months_re.sort((a, b) -> b.length - a.length)
months_re = months_re.join('|')
months_re = new RegExp(months_re, 'i')

#regex = {
#  My: new RegExp('^(' + months.english.join('|') + ')\\s([0-9]{3,})$', 'i'),
#  Mdy: new RegExp('^(' + months.english.join('|') + ')\\s([0-9]{1,2})\\s*,\\s*([0-9]{3,})$', 'i'),
#  dMy: new RegExp('^([0-9]{1,2})\\.?\\s+(' + months.english.join('|') + ')\\s+([0-9]{3,})$', 'i'),
#}

normalize_edtf = (date) ->
  switch date.type
    when 'Date'
      year = date.values[0]
      month = if typeof date.values[1] == 'number' then date.values[1] + 1 else undefined
      day = date.values[2]
      return { type: 'date', year, month, day, approximate: date.approximate || !!date.unspecified, uncertain: date.uncertain }

#    when 'Set'
#      if date.values.length == 1
#        return { type: 'set', orig: { year: date.values[0].values[0] } }

    when 'Interval'
      throw new Error(JSON.stringify(date)) unless date.values.length == 2
      from = if date.values[0] then normalize_edtf(date.values[0]) else { type: 'open' }
      to = if date.values[1] then normalize_edtf(date.values[1]) else { type: 'open' }
      return { type: 'interval', from, to }

    when 'Season'
      throw new Error("Unexpected season #{date.values[1]}") unless 21 <= date.values[1] <= 24
      return { type: 'season', year: date.values[0], season: ['spring', 'summer', 'autumn', 'winter'][date.values[1] - 21] }

    else
      throw new Error(JSON.stringify(date))

parse_edtf = (date) ->
  try
    parsed = edtf.parse(edtfy(date.replace(/\. /, ' '))) # 8. july 2011
  catch err
    throw err unless err.name == 'SyntaxError' || err.token
    try
      parsed = edtf.parse(date.replace('?~', '~').replace(/u/g, 'X'))
    catch err
      throw err unless err.name == 'SyntaxError' || err.token
      return false

  return normalize_edtf(parsed)

parse = (raw) ->
  debug('dateparser: parsing', raw)
  return {type: 'open'} if raw.trim() == ''

  for sep in ['-', '/', '_']
    if (m = raw.split(sep)).length == 2 # potential range
      if (m[0].length > 2 || (sep == '/' && m[0].length == 0)) && (m[1].length > 2 || (sep == '/' && m[1].length == 0))
        from = parse(m[0])
        to = parse(m[1])
        return { type: 'interval', from, to } if from.type in ['date', 'open'] && to.type in ['date', 'open']

  cleaned = raw.normalize('NFC').replace(months_re, ((month) -> months[month.toLowerCase()]))
  debug('dateparser:', raw, 'cleaned up to', cleaned)

  trimmed = cleaned.trim().replace(/(\s+|T)[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|\+[0-9]{2}:?[0-9]{2})?$/, '').toLowerCase()

#  if m = regex.dMy.exec(trimmed)
#    year = parseInt(m[3])
#    day = parseInt(m[1])
#    month = months.english.indexOf(m[2]) + 1
#    month += 8 if month > 12
#    return { type: 'date', year, month, day }

#  if m = regex.Mdy.exec(trimmed)
#    year = parseInt(m[3])
#    day = parseInt(m[2])
#    month = months.english.indexOf(m[1]) + 1
#    month += 8 if month > 12
#    return { type: 'date', year, month, day }

#  if m = regex.My.exec(trimmed)
#    year = parseInt(m[2])
#    month = months.english.indexOf(m[1]) + 1
#    month += 8 if month > 12
#    return { type: 'date', year, month }

  if m = /^(-?[0-9]{3,})([-\/\.])([0-9]{1,2})(\2([0-9]{1,2}))?$/.exec(trimmed)
    year = parseInt(m[1])
    month = parseInt(m[3])
    day = if m[5] then parseInt(m[5]) else undefined
    [day, month] = [month, day] if day && month > 12 && day < 12
    return { type: 'date', year, month, day }

  if m = /^([0-9]{1,2})([-\/\. ])([0-9]{1,2})([-\/\. ])([0-9]{3,})$/.exec(trimmed)
    year = parseInt(m[5])
    month = parseInt(m[3])
    day = parseInt(m[1])
    [day, month] = [month, day] if m[1] == '/' # silly yanks
    [day, month] = [month, day] if month > 12 && day < 12
    return { type: 'date', year, month, day }

  if m = /^([0-9]{1,2})[-\/\.]([0-9]{3,})$/.exec(trimmed)
    year = parseInt(m[2])
    month = parseInt(m[1])
    return { type: 'date', year, month }

  if m = /^([0-9]{3,})[-\/\.]([0-9]{1,2})$/.exec(trimmed)
    year = parseInt(m[1])
    month = parseInt(m[2])
    return { type: 'date', year, month }

#  if m = /^(-?[0-9]{3,})([?~]*)$/.exec(trimmed)
#    return { type: 'date', year: parseInt(m[1]), approximate: m[2].indexOf('~') >=0, uncertain: m[2].indexOf('?') >= 0 }

  if m = /^\[(-?[0-9]+)\]$/.exec(trimmed)
    return { type: 'date', orig: { type: 'date', year: parseInt(m[1]) } }

  if m = /^\[(-?[0-9]+)\]\s*(-?[0-9]+)$/.exec(trimmed)
    return {
      type: 'date',
      year: parseInt(m[2]),
      orig: { type: 'date', year: parseInt(m[1]) },
    }

  if m = /^(-?[0-9]+)\s*\[(-?[0-9]+)\]$/.exec(trimmed)
    return {
      type: 'date',
      year: parseInt(m[1]),
      orig: { year: parseInt(m[2]) },
    }

  parsed = parse_edtf(cleaned)
  return parsed if parsed

  return { type: 'verbatim', verbatim: raw }

module.exports = parse
