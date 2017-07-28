bibtex = /(?:^|\n|\s)bibtex(\*?):\s*([^\s\n]+)(?:\s|\n|$)/
biblatexcitekey = /(?:^|\n|\s)biblatexcitekey\[([^\[\]\s\n]+)\](?:\s|\n|$)/

module.exports = (item) ->
  item.extra ||= ''
  citekey = ''
  dynamic = false

  item.extra = item.extra.replace(bibtex, (m, _dynamic, _citekey) ->
    citekey = _citekey
    dynamic = _dynamic
    return "\n"
  ).trim()

  if !citekey
    item.extra = item.extra.replace(biblatexcitekey, (m, _citekey) ->
      citekey = _citekey
      dynamic = false
      return "\n"
    ).trim()

  dynamic = true unless citekey

  return {citekey, dynamic}
