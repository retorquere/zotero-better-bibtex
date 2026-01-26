import { Schema } from './item-schema'
import * as CSL from 'citeproc'

export type TeXString = { value: string; mode?: 'raw' | 'cased'; line: number }

type Creator = {
  name: string
  type: string
}

export type Fields = {
  raw: Record<string, string>
  kv: Record<string, string>
  creator: Record<string, string[]>
  creators: Creator[]
  tex: Record<string, TeXString>
  citationKey: string
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

const re = {
  // fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/. Spurious 'tex.' so I can do a single match
  old: /^{:((?:bib(?:la)?)?tex\.)?([^:]+)(:)\s*([^}]+)}$/i,
  new: /^((?:bib(?:la)?)?tex\.)?([^:=]+)\s*([:=])\s*([\S\s]*)/i,
  quoted: /^((?:bib(?:la)?)?tex\.)"([^"]+)"\s*([:=])\s*([\S\s]*)/i,
}

type SetOptions = {
  citationKey?: string
  aliases?: string[]
  kv?: Record<string, string | string[]>
  tex?: Record<string, TeXString>
}
type GetOptions = SetOptions | {
  citationKey?: boolean
  aliases?: boolean
  kv?: boolean
  tex?: boolean
}

const otherFields = [ 'lccn', 'mr', 'zbl', 'arxiv', 'jstor', 'hdl', 'googlebooksid' ]
const casing = {
  arxiv: 'arXiv',
}

export function get(extra: string, mode: 'zotero' | 'csl', options?: GetOptions): { extra: string; extraFields: Fields } {
  let defaults = false
  if (!options) {
    options = { citationKey: true, aliases: true, kv: true, tex: true }
    defaults = true
  }

  extra = extra || ''

  const extraFields: Fields = {
    raw: {},
    kv: options.kv || defaults ? {} : undefined,
    creator: {},
    creators: [],
    tex: options.tex || defaults ? {} : undefined,
    citationKey: '',
    aliases: options.aliases || defaults ? [] : undefined,
  }

  let ef
  extra = extra.split('\n').filter((line, i) => {
    const m = line.match(re.old)
      || line.match(re.quoted) // quoted before new, because new will trigger on the quoted colon
      || line.match(re.new)
    if (!m) return true

    let [ , tex, key, assign, value ] = m
    const texmode = (assign === '=') ? 'raw' : (tex && (tex.includes('T') || tex.match(/^[A-Z]/)) ? 'cased' : undefined)
    tex = tex && tex.toLowerCase()

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

    if (options.citationKey && !tex && [ 'citation key', 'bibtex' ].includes(key)) {
      extraFields.citationKey = value
      return false
    }

    if (options.aliases && !tex && key === 'citation key alias') {
      extraFields.aliases = [ ...extraFields.aliases, ...(value.split(/s*,\s*/).filter(alias => alias)) ]
      return false
    }
    if (options.aliases && tex && key === 'ids') {
      extraFields.aliases = [ ...extraFields.aliases, ...(value.split(/s*,\s*/).filter(alias => alias)) ]
      return false
    }

    // https://github.com/retorquere/zotero-better-bibtex/issues/2399
    if (options.kv && key === '_eprint') {
      extraFields.kv[key] = value
      return false
    }

    const [ primary, secondary ] = mode === 'csl' ? ['csl', 'zotero'] : ['zotero', 'csl']
    if (options.kv && key !== 'citation key' && (!tex && (ef = Schema.labeled[primary][key] || Schema.labeled[secondary][key]))) {
      switch (ef.type) {
        case 'name':
          extraFields.creator[ef.field] ??= []
          extraFields.creator[ef.field].push(value)
          extraFields.creators.push({ name: value, type: ef.field })
          return false

        case 'text':
        case 'date':
          extraFields.kv[ef.field] = value
          return false
      }
    }

    if (options.tex && tex && !key.includes(' ')) {
      extraFields.tex[tex + key] = { value, mode: texmode, line: i }
      return false
    }

    if (options.tex && !tex && otherFields.includes(key.replace(/[- ]/g, ''))) {
      extraFields.tex[`tex.${ key.replace(/[- ]/g, '') }`] = { value, line: i }
      return false
    }

    return true
  }).join('\n').trim()

  extraFields.aliases = Array.from(new Set(extraFields.aliases)).filter(key => key !== extraFields.citationKey)

  return { extra, extraFields }
}

export function set(extra: string, options: SetOptions = {}): string {
  const parsed = get(extra, 'zotero', options)

  if (options.citationKey) parsed.extra += `\nCitation Key: ${ options.citationKey }`

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
