bibtex = /(?:^|\n|\s)bibtex(\*?):\s*([^\s\n]+)(?:\s|\n|$)/
biblatexcitekey = /(?:^|\n|\s)biblatexcitekey\[([^\[\]\s\n]+)\](?:\s|\n|$)/

module.exports = (extra) ->
  if extra?
    extra = '' + extra
  else
    extra = ''

  citekey = ''
  dynamic = false

  extra = extra.replace(bibtex, (m, _dynamic, _citekey) ->
    citekey = _citekey
    dynamic = _dynamic
    return "\n"
  ).trim()

  if !citekey
    extra = extra.replace(biblatexcitekey, (m, _citekey) ->
      citekey = _citekey
      dynamic = false
      return "\n"
    ).trim()

  dynamic = true unless citekey

  return {extra, citekey, dynamic}
