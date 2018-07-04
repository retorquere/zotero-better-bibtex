const citationKey = /(?:^|\s)Citation Key:[^\S\n]*([^\s]*)(?:\s|$)/i
const bibtex = /(?:^|\s)bibtex:[^\S\n]*([^\s]*)(?:\s|$)/i
const biblatexcitekey = /(?:^|\s)biblatexcitekey\[([^\[\]\s]*)\](?:\s|$)/i

export function get(extra) {
  extra = extra ? `${extra}` : ''

  let citekey = ''
  let pinned = false

  for (const re of [citationKey, bibtex, biblatexcitekey]) {
    if (!citekey) {
      extra = extra.replace(re, (m, _citekey) => {
        citekey = _citekey
        pinned = !!citekey
        return '\n'
      }).trim()
    }
  }

  return {extra, citekey, pinned}
}

export function set(extra, citekey) { return `${get(extra).extra}\nCitation Key: ${citekey}`.trim() }
