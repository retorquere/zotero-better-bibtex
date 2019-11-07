function extract(extra, re) {
  extra = extra ? `${extra}` : ''
  let citekey = ''
  let m
  extra = extra.split('\n').filter(line => {
    if (m = line.match(re)) {
      citekey = m[1]
      return false
    }
    return true
  }).join('\n')
  return { extra, citekey, pinned: !!citekey }
}

const citationKey = /^(?:Citation Key|bibtex)\s*:\s*([^\s]*)\s*$/i
export function get(extra) {
  const extracted = extract(extra, citationKey)

  return extracted
}

export function set(extra, citekey) { return `Citation Key: ${citekey}\n${get(extra).extra}`.trim() }

const citationKeyAlias = /^Citation Key Alias\s*:\s*([^\s]*)\s*$/i
export const aliases = new class {
  public get(extra) {
    const extracted = extract(extra, citationKeyAlias)
    return { extra: extracted.extra, aliases: extracted.citekey.trim().split(/\s*,\s*/).filter(alias => alias) }
  }

  public set(extra, _aliases) {
    if (!_aliases.length) throw new Error('empty alias list')
    _aliases = Array.from(new Set(_aliases)).sort().join(', ')
    return `${this.get(extra).extra}\nCitation Key Alias: ${_aliases}`.trim()
  }
}
