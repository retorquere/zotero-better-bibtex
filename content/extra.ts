// http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables
import * as ExtraFields from '../gen/extra-fields.json'
import * as CSL from '../gen/citeproc'

type TeXString = { value: string, raw?: boolean, type?: 'biblatex' | 'bibtex' }

export type Fields = {
  kv: Record<string, string | string[]>
  tex: Record<string, TeXString>
  citationKey: string
  aliases: string[]
}

type CSLCreator = { literal?: string, isInstitution?: 1, family?: string, given?: string }
type ZoteroCreator = { name?: string, lastName?: string, firstName?: string, creatorType?: string }

export function cslCreator(value: string): CSLCreator {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) { // tslint:disable-line:no-magic-numbers
    const _creator = { family: creator[0] || '', given: creator[1] || ''}
    CSL.parseParticles(_creator)
    return _creator
  } else {
    // return { literal: value, isInstitution: 1 }
    return { literal: value }
  }
}

export function zoteroCreator(value: string, creatorType?: string): ZoteroCreator {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) { // tslint:disable-line:no-magic-numbers
    return { creatorType, lastName: creator[0] || '', firstName: creator[1] || '' }
  } else {
    return { creatorType, name: value }
  }
}

const re = {
  // fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/. Spurious tex. so I can do a single match
  kv: /^{:((?:bib(?:la)?)?tex\.)?([^:]+)(:)\s*([^}]+)}$/,
  tex: /^((?:bib(?:la)?)?tex\.)?([^:=]+)\s*([:=])\s*([\S\s]*)/,
}

type GetOptions = {
  citationKey?: boolean | string
  aliases?: boolean | string[]
  kv?: boolean | Record<string, string | string[]>
  tex?: boolean | Record<string, TeXString>
  normalize?: boolean
}

const otherFields = ['lccn', 'mr', 'zbl', 'arxiv', 'jstor', 'hdl', 'googlebooksid']
const casing = {
  arxiv: 'arXiv',
}

export function get(extra: string, options?: GetOptions): { extra: string, extraFields: Fields } {
  if (!options) options = { citationKey: true , aliases: true, kv: true, tex: true, normalize: true }

  extra = extra || ''

  const extraFields: Fields = {
    kv: {},
    tex: {},
    citationKey: '',
    aliases: [],
  }

  extra = extra.split('\n').filter(line => {
    const m = line.match(re.kv) || line.match(re.tex)
    if (!m) return true

    let [ , tex, name, assign, value ] = m
    const raw = (assign === '=')

    if (!tex && raw) return true

    name = name.trim()
    const _name = name.toLowerCase()

    value = value.trim()

    if (options.citationKey && !tex && options.citationKey && ['citation key', 'bibtex'].includes(_name)) {
      extraFields.citationKey = value
      return false
    }

    if (options.aliases && !tex && options.aliases && _name === 'citation key alias') {
      extraFields.aliases = value.split(/s*,\s*/).filter(alias => alias)
      return false
    }
    if (options.aliases && tex && !raw && options.aliases && _name === 'ids') {
      extraFields.aliases = value.split(/s*,\s*/).filter(alias => alias)
      return false
    }

    if (options.kv && !tex) {
      const type = ExtraFields[_name].type
      const k = options.normalize ? ExtraFields[_name].id : name
      if (type) {
        if (type === 'creator') {
          extraFields.kv[k] = (extraFields.kv[k] as string[]) || [];
          (extraFields.kv[k] as string[]).push(value)
        } else {
          extraFields.kv[k] = value
        }
        return false
      }
    }

    if (options.tex && tex && !name.includes(' ')) {
      extraFields.tex[_name] = { value, raw }
      if (tex === 'bibtex' || tex === 'biblatex') extraFields.tex[_name].type = tex
      return false
    }

    if (options.tex && !tex && otherFields.includes(_name.replace(/[- ]/g, ''))) {
      extraFields.tex[_name.replace(/[- ]/g, '')] = { value }
      return false
    }

    return true
  }).join('\n').trim()

  return { extra, extraFields }
}

export function set(extra, options: { citationKey?: string, aliases?: string[], kv?: Record<string, string | string[]>, tex?: Record<string, TeXString>} = {}) {
  const parsed = get(extra, options)

  if (options.citationKey) parsed.extra += `\nCitation Key: ${options.citationKey}`

  if (options.aliases && options.aliases.length) {
    const aliases = Array.from(new Set(options.aliases)).sort().join(', ')
    parsed.extra += `\ntex.ids: ${aliases}`
  }

  if (options.tex) {
    for (const name of Object.keys(options.tex).sort()) {
      const value = options.tex[name]
      const prefix = otherFields.includes(name) ? '' : 'tex.'
      parsed.extra += `\n${prefix}${casing[name] || name}${value.raw ? '=' : ':'} ${value.value}`
    }
  }

  if (options.kv) {
    for (const name of Object.keys(options.kv).sort()) {
      const value = options.kv[name]
      if (Array.isArray(value)) { // creators
        parsed.extra += value.map(creator => `\n${name}: ${value}`).join('') // do not sort!!
      } else {
        parsed.extra += `\n${name}: ${value}`
      }
    }
  }

  return parsed.extra.trim()
}
