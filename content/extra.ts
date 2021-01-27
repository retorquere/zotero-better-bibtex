import * as mapping from '../gen/items/extra-fields.json'
import * as CSL from '../gen/citeproc'
import { log } from './logger'

type TeXString = { value: string, raw?: boolean }

export type Fields = {
  kv: Record<string, string>
  creator: Record<string, string[]>
  tex: Record<string, TeXString>
  citationKey: string
  aliases: string[]
}

type CSLCreator = { literal?: string, isInstitution?: 1, family?: string, given?: string }
type ZoteroCreator = { name?: string, lastName?: string, firstName?: string }

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

export function zoteroCreator(value: string): ZoteroCreator {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) { // tslint:disable-line:no-magic-numbers
    return { lastName: creator[0] || '', firstName: creator[1] || '' }
  } else {
    return { name: value }
  }
}

const re = {
  // fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/. Spurious 'tex.' so I can do a single match
  old: /^{:((?:bib(?:la)?)?tex\.)?([^:]+)(:)\s*([^}]+)}$/,
  new: /^((?:bib(?:la)?)?tex\.)?([^:=]+)\s*([:=])\s*([\S\s]*)/,
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

const otherFields = ['lccn', 'mr', 'zbl', 'arxiv', 'jstor', 'hdl', 'googlebooksid']
const casing = {
  arxiv: 'arXiv',
}

export function get(extra: string, mode: 'zotero' | 'csl', options?: GetOptions): { extra: string, extraFields: Fields } {
  if (!options) options = { citationKey: true , aliases: true, kv: true, tex: true }
  options.citationKey = options.aliases = (options.citationKey as boolean) || (options.aliases as boolean)

  const other = {zotero: 'csl', csl: 'zotero'}[mode]

  extra = extra || ''

  const extraFields: Fields = {
    kv: {},
    creator: {},
    tex: {},
    citationKey: '',
    aliases: [],
  }

  let ef
  extra = extra.split('\n').filter(line => {
    const m = line.match(re.old) || line.match(re.new)
    if (!m) return true

    let [ , tex, key, assign, value ] = m
    const raw = (assign === '=')

    if (!tex && raw) return true

    if (tex) {
      key = key.trim().toLowerCase()
    } else {
      key = key.trim().replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
    }
    value = value.trim()

    if (options.citationKey && !tex && ['citation key', 'bibtex'].includes(key)) {
      extraFields.citationKey = value
      extraFields.aliases.push(value)
      return false
    }

    if (options.aliases && !tex && key === 'citation key alias') {
      extraFields.aliases = extraFields.aliases.concat(value.split(/s*,\s*/).filter(alias => alias))
      return false
    }
    if (options.aliases && tex && !raw && options.aliases && key === 'ids') {
      extraFields.aliases = extraFields.aliases.concat(value.split(/s*,\s*/).filter(alias => alias))
      return false
    }

    if (options.kv && (ef = mapping[key]) && !tex) {
      for (const field of (ef[mode] ||  ef[other])) {
        switch (ef.type) {
          case 'name':
            extraFields.creator[field] = extraFields.creator[key] || []
            extraFields.creator[field].push(value)
            break
          case 'text':
          case 'date':
            extraFields.kv[field] = value
            break
          default:
            throw new Error(`Unexpected extra field type ${ef.type}`)
        }
      }
      return false
    }

    if (options.tex && tex && !key.includes(' ')) {
      extraFields.tex[tex + key] = { value, raw }
      return false
    }

    if (options.tex && !tex && otherFields.includes(key.replace(/[- ]/g, ''))) {
      extraFields.tex['tex.' + key.replace(/[- ]/g, '')] = { value }
      return false
    }

    return true
  }).join('\n').trim()

  extraFields.aliases = Array.from(new Set(extraFields.aliases)).filter(key => key !== extraFields.citationKey)
  if (options.citationKey && !extraFields.citationKey) extraFields.citationKey = extraFields.aliases.shift()
  log.debug('bbt merge:extra.get.extraFields = ', extraFields)

  return { extra, extraFields }
}

export function set(extra, options: SetOptions = {}) {
  log.debug('bbt merge: extra.set.options', options)
  if (options.citationKey && !options.aliases) options.aliases = []
  if (!options.citationKey && options.aliases?.length) options.citationKey = options.aliases.shift()
  if (options.citationKey && options.aliases) options.aliases = options.aliases.filter(key => key !== options.citationKey)
  const parsed = get(extra, 'zotero', options)
  log.debug('bbt merge: extra.set.parsed', parsed)

  if (options.citationKey) parsed.extra += `\nCitation Key: ${options.citationKey}`

  if (options.aliases?.length) {
    const aliases = Array.from(new Set(options.aliases)).sort().join(', ')
    parsed.extra += `\ntex.ids: ${aliases}`
  }

  if (options.tex) {
    for (const name of Object.keys(options.tex).sort()) {
      let prefix, field
      const m = name.match(/^((?:bib(?:la)?)?tex\.)(.*)/)
      if (m) {
        [ , prefix, field ] = m
      } else {
        prefix = 'tex.'
        field = name
      }
      if (otherFields.includes(field)) prefix = ''
      const value = options.tex[name]
      parsed.extra += `\n${prefix}${casing[field] || field}${value.raw ? '=' : ':'} ${value.value}`
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

  log.debug('bbt merge: extra.set.parsed.return', parsed)
  return parsed.extra.trim()
}
