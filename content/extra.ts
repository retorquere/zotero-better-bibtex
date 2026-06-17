import { Schema } from './item-schema'
import * as CSL from 'citeproc'

export type TeXString = { value: string; mode?: 'raw' | 'cased'; line: number }

type Creator = {
  name: string
  type: string
}

const re = {
  // fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/. Spurious 'tex.' so I can do a single match
  old: /^{:(?<key>[^:]+)(?<assign>:)\s*(?<value>[^}]+)}$/i,
  new: /^(?:(?<tex>(bib(la)?)?tex\.)|(?<csl>csl\.))?(?<key>[^:=]+)\s*(?<assign>[:=])\s*(?<value>[\S\s]*)/i,
  quoted: /^(?:(?<tex>(bib(la)?)?tex\.)|(?<csl>csl\.))?"(?<key>[^"]+)"\s*(?<assign>[:=])\s*(?<value>[\S\s]*)/i,
  ck: /^(citation[ -]?key|bibtex):(?<citationKey>.*)/i,
}

export function citationKey(extra: string): { citationKey: string; extra: string } {
  let ck = ''
  let m: RegExpMatchArray
  extra = (extra || '').split('\n').filter(line => {
    if (m = line.match(re.ck)) {
      ck = m.groups.citationKey.trim()
      return false
    }
    return true
  }).join('\n')
  return { extra, citationKey: ck }
}

export type Fields = {
  raw: Record<string, string>
  kv: Record<string, string>
  csl: Record<string, string>
  creator: Record<string, string[]>
  creators: Creator[]
  tex: Record<string, TeXString>
  aliases: string[]
}

type CSLCreator = { literal?: string; isInstitution?: 1; family?: string; given?: string }
type ZoteroCreator = { name?: string; lastName?: string; firstName?: string; creatorType: string }

export function cslCreator(value: string): CSLCreator {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) {
    const csl_creator = { family: creator[0] || '', given: creator[1] || '' }
    CSL.parseParticles(csl_creator)
    return csl_creator
  }
  else {
    // return { literal: value, isInstitution: 1 }
    return { literal: value }
  }
}

export function zoteroCreator(value: string, creatorType: string): ZoteroCreator {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) {
    return { lastName: creator[0] || '', firstName: creator[1] || '', creatorType }
  }
  else {
    return { name: value, creatorType }
  }
}

type SetOptions = {
  aliases?: string[]
  kv?: Record<string, string | string[]>
  csl?: Record<string, string>
  tex?: Record<string, TeXString>
}
type GetOptions = SetOptions | {
  aliases?: boolean
  kv?: boolean
  csl?: boolean
  tex?: boolean
}

const otherFields = [ 'lccn', 'mr', 'zbl', 'arxiv', 'jstor', 'hdl', 'googlebooksid' ]
const casing = {
  arxiv: 'arXiv',
}

export function get(extra: string, mode: 'zotero' | 'csl', options?: GetOptions): { extra: string; extraFields: Fields } {
  let defaults = false
  if (!options) {
    options = { aliases: true, kv: true, csl: true, tex: true }
    defaults = true
  }

  extra = extra || ''

  const extraFields: Fields = {
    raw: {},
    kv: options.kv || defaults ? {} : undefined,
    csl: options.csl || defaults ? {} : undefined,
    creator: {},
    creators: [],
    tex: options.tex || defaults ? {} : undefined,
    aliases: options.aliases || defaults ? [] : undefined,
  }

  let ef
  function addMappedField(field: { field: string; type: string }, value: string): boolean {
    switch (field.type) {
      case 'name':
        extraFields.creator[field.field] ??= []
        extraFields.creator[field.field].push(value)
        extraFields.creators.push({ name: value, type: field.field })
        return true

      case 'text':
      case 'date':
        extraFields.kv[field.field] = value
        return true

      default:
        return false
    }
  }
  extra = extra.split('\n').filter((line, i) => {
    const m = line.match(re.old)
      || line.match(re.quoted) // quoted before new, because new will trigger on the quoted colon
      || line.match(re.new)
    if (!m) return true

    let { tex, csl, key, assign, value } = m.groups
    const texmode = (assign === '=') ? 'raw' : (tex && (tex.includes('T') || tex.match(/^[A-Z]/)) ? 'cased' : undefined)
    tex = tex && tex.toLowerCase()
    csl = csl && csl.toLowerCase()

    if (!tex && texmode) return true

    key = key.trim()
    value = value.trim()
    extraFields.raw[key.toLowerCase()] = value

    if (tex) {
      key = key.toLowerCase()
    }
    else {
      // retain leading dash or underscore
      key = key.replace(/(?!^)[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
    }

    if (csl) {
      // All explicit csl.* fields go into their own bucket.
      // The CSL exporter handles typed conversion (name/date/text) for all of them uniformly.
      if (options.csl && !key.includes(' ')) extraFields.csl[key] = value
      return false
    }

    if (tex) {
      if (options.aliases && key === 'ids') {
        extraFields.aliases = [ ...extraFields.aliases, ...value.split(/\s*,\s*/).filter(alias => alias) ]
        return false
      }

      if (options.tex && !key.includes(' ')) {
        extraFields.tex[tex + key] = { value, mode: texmode, line: i }
        return false
      }

      return true
    }

    // unprefixed: Zotero-first, explicit aliases, then CSL fallback
    if (options.aliases && key === 'citation key alias') {
      extraFields.aliases = [ ...extraFields.aliases, ...value.split(/\s*,\s*/).filter(alias => alias) ]
      return false
    }

    if (options.kv) {
      // https://github.com/retorquere/zotero-better-bibtex/issues/2399
      if (key === '_eprint') { extraFields.kv[key] = value; return false }

      if ((ef = Schema.labeled.zotero[key]) && addMappedField(ef, value)) return false

      // CSL fallback only when the key is not a known Zotero field.
      // 'type' is excluded: CSL type overrides require explicit csl.type.
      if (key !== 'type' && !Schema.labeled.zotero[key] && (ef = Schema.labeled.csl[key]) && addMappedField(ef, value)) return false
    }

    if (options.tex && otherFields.includes(key.replace(/[- ]/g, ''))) {
      extraFields.tex[`tex.${key.replace(/[- ]/g, '')}`] = { value, line: i }
      return false
    }

    return true
  }).join('\n').trim()

  extraFields.aliases = Array.from(new Set(extraFields.aliases))

  return { extra, extraFields }
}

export function set(extra: string, options: SetOptions = {}): string {
  const parsed = get(extra, 'zotero', options)

  if (options.aliases?.length) {
    const aliases = Array.from(new Set(options.aliases)).sort().join(', ')
    parsed.extra += `\ntex.ids= ${ aliases }`
  }

  if (options.tex) {
    for (const name of Object.keys(options.tex).sort()) {
      let prefix, field
      const m = name.match(/^((?:bib(?:la)?)?tex\.)(.*)/i)
      if (m) {
        [ , prefix, field ] = m
      }
      else {
        prefix = 'tex.'
        field = name
      }
      if (otherFields.includes(field)) prefix = ''
      const value = options.tex[name]
      parsed.extra += `\n${ prefix }${ casing[field] || field }${ value.mode === 'raw' ? '=' : ':' } ${ value.value }`
    }
  }

  if (options.csl) {
    for (const name of Object.keys(options.csl).sort()) {
      parsed.extra += `\ncsl.${ name }: ${ options.csl[name] }`
    }
  }

  if (options.kv) {
    for (const name of Object.keys(options.kv).sort()) {
      const value = options.kv[name]
      if (Array.isArray(value)) { // creators
        parsed.extra += value.map(creator => `\n${ name }: ${ creator }`).join('') // do not sort!!
      }
      else {
        parsed.extra += `\n${ name }: ${ value }`
      }
    }
  }

  return parsed.extra.trim()
}
