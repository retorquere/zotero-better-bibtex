// http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables
import * as cslVariables from './csl-vars.json'

type CSLCreator = { lastName: string, firstName: string } | { name: string }
type TeXField = { name: string, value: string, raw?: boolean }

type Fields = {
  csl: Record<string, { type: string, value: CSLCreator[] | string }>
  tex: Record<string, TeXField>
  citationKey: string
  aliases: string[]
}

function cslCreator(value: string): CSLCreator {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) { // tslint:disable-line:no-magic-numbers
    return {lastName: creator[0] || '', firstName: creator[1] || ''}
  } else {
    return { name: value }
  }
}

const re = {
  // fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/. Spurious tex. so I can do a single match
  csl: /^{:(tex\.)?([^:]+)(:)\s*([^}]+)}$/,
  kv: /^(tex\.)?([^:=]+)\s*([:=])\s*([\S\s]*)/,
}

export function get(extra, options?: { citationKey?: boolean | string, aliases?: boolean | string[], csl?: boolean, tex?: boolean | TeXField[]}): { extra: string, extraFields: Fields } {
  if (!options) options = { citationKey: true , aliases: true, csl: true, tex: true }

  extra = extra || ''

  const extraFields: Fields = {
    csl: {},
    tex: {},
    citationKey: '',
    aliases: [],
  }

  extra = extra.split('\n').filter(line => {
    const m = line.match(re.csl) || line.match(re.kv)
    if (!m) return true

    let [ , tex, name, assign, value ] = m
    const raw = (assign === '=')

    if (!tex && raw) return true

    name = name.toLowerCase().trim()
    value = value.trim()

    if (!tex && options.citationKey && ['citation key', 'bibtex'].includes(name)) {
      extraFields.citationKey = value
      return false
    }

    if (!tex && options.aliases && name === 'citation key alias') {
      extraFields.aliases = value.split(/s*,\s*/).filter(alias => alias)
      return false
    }

    if (!tex && options.csl) {
      let cslName = name.replace(/ +/g, '-')
      const cslType = cslVariables[cslName] || cslVariables[cslName = cslName.toUpperCase()]
      if (cslType) {
        if (cslType === 'creator') {
          extraFields.csl[cslName] = extraFields.csl[cslName] || { type: cslType, value: [] };
          (extraFields.csl[cslName].value as CSLCreator[]).push(cslCreator(value))
        } else {
          extraFields.csl[cslName] = { type: cslType, value }
        }
        return false
      }
    }

    if (tex && options.tex && !name.includes(' ')) {
      extraFields.tex[name] = { name, value, raw }
      return false
    }

    if (!tex && ['place', 'lccn', 'mr', 'zbl', 'arxiv', 'jstor', 'hdl', 'google-books-id'].includes(name)) {
      name = name.replace(/-/g, '') // google-books-id
      extraFields.tex[name] = { name, value }
      return false
    }

    return true
  }).join('\n').trim()

  return { extra, extraFields }
}

export function set(extra, options: { citationKey?: string, aliases?: string[], tex?: TeXField[]} = {}) {
  const parsed = get(extra, options)

  if (options.citationKey) parsed.extra += `\nCitation Key: ${options.citationKey}`

  if (options.aliases) {
    if (!options.aliases.length) throw new Error('empty alias list')
    const aliases = Array.from(new Set(options.aliases)).sort().join(', ')
    parsed.extra += `\nCitation Key Alias: ${aliases}`
  }

  if (options.tex) {
    for (const field of options.tex) {
      parsed.extraFields.tex[field.name] = field
    }
    for (const name of Object.keys(parsed.extraFields.tex).sort()) {
      const field = parsed.extraFields.tex[name]
      parsed.extra += `\ntex.${name}${field.raw ? '=' : ':'} ${field.value}`
    }
  }

  return parsed.extra.trim()
}
