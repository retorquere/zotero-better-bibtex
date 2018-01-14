const bibtex = /(?:^|\s)bibtex:[^\S\n]*([^\s]*)(?:\s|$)/
const biblatexcitekey = /(?:^|\s)biblatexcitekey\[([^\[\]\s]*)\](?:\s|$)/

export function get(extra) {
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

export function set(extra, citekey) { return `${get(extra).extra}\nbibtex: ${citekey}`.trim() }
