bibtex = /(?:^|\s)bibtex(\*?):[^\S\n]*([^\s]*)(?:\s|$)/
biblatexcitekey = /(?:^|\s)biblatexcitekey\[([^\[\]\s]*)\](?:\s|$)/

# TODO: remove dunamic and * detection before release
get = (extra, dynamic) ->
  if extra?
    extra = '' + extra
  else
    extra = ''

  citekey = ''
  pinned = false

  Zotero.debug("getCiteKey from " + JSON.stringify({extra}))
  extra = extra.replace(bibtex, (m, _dynamic, _citekey) ->
    citekey = _citekey
    pinned = !_dynamic && citekey
    return "\n"
  ).trim()
  Zotero.debug("getCiteKey after bibtex: extract " + JSON.stringify({citekey, extra}))

  if !citekey
    extra = extra.replace(biblatexcitekey, (m, _citekey) ->
      citekey = _citekey
      pinned = citekey
      return "\n"
    ).trim()
  Zotero.debug("getCiteKey after biblatexcitekey: extract " + JSON.stringify({citekey, extra}))

  citekey = '' unless pinned || dynamic
  return {extra, citekey, pinned: !!pinned}

set = (extra, citekey) ->
  return "#{get(extra).extra}\nbibtex: #{citekey}".trim()

module.exports = { get, set }
