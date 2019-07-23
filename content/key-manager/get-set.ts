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

const citationKeyAlias = /(?:^|\n)Citation Key Alias:(.*?)(?:\n|$)/i
export const aliases = new class {
  public get(extra) {
    const parsed = { extra, aliases: [] }

    parsed.extra = parsed.extra.replace(citationKeyAlias, (m, _aliases) => {
      parsed.aliases = _aliases.trim().split(/\s*,\s*/)
      return '\n'
    }).trim()

    return parsed
  }

  public set(extra, _aliases) {
    if (!_aliases.length) throw new Error('empty alias list')
    _aliases = Array.from(new Set(_aliases)).sort().join(', ')
    return `${this.get(extra).extra}\nCitation Key Alias: ${_aliases}`.trim()
  }
}
