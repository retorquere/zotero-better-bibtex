const bibtex = /(?:^|\s)bibtex:[^\S\n]*([^\s]*)(?:\s|$)/
const biblatexcitekey = /(?:^|\s)biblatexcitekey\[([^\[\]\s]*)\](?:\s|$)/

function get(extra) {
  extra = extra ? `${extra}` : ''

  let citekey = ''
  let pinned = false

  extra = extra.replace(bibtex, (m, _citekey) => {
    citekey = _citekey
    pinned = !!citekey
    return '\n'
  }).trim()

  if (!citekey) {
    extra = extra.replace(biblatexcitekey, (m, _citekey) => {
      citekey = _citekey
      pinned = !!citekey
      return '\n'
    }).trim()
  }

  return {extra, citekey, pinned}
}

function set(extra, citekey) { return `${get(extra).extra}\nbibtex: ${citekey}`.trim() }

export = { get, set }
