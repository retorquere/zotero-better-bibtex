// http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables
import * as cslVariables from './csl-vars.json'
import * as Citekey from './key-manager/get-set'

function cslCreator(value) {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) { // tslint:disable-line:no-magic-numbers
    return {lastName: creator[0] || '', firstName: creator[1] || ''}
  } else {
    return { name: value }
  }
}

export function extract(item) {
  let extra = item.extra || ''

  const extraFields = {
    csl: {},
    tex: {},
    citekey: { citekey: '', pinned: false, aliases: [] },
  }

  const citekey = Citekey.get(extra)
  extraFields.citekey = { citekey: citekey.citekey, pinned: citekey.pinned, aliases: [] }
  const aliases = Citekey.aliases.get(citekey.extra)
  extraFields.citekey.aliases = aliases.aliases
  extra = aliases.extra

  // fetch fields as per https://forums.zotero.org/discussion/3673/2/original-date-of-publication/
  extra = extra.replace(/{:([^:]+):[^\S\n]*([^}]+)}/g, (match, name, value) => {
    name = name.toLowerCase()
    const cslType = cslVariables[name]

    if (!cslType) return match

    if (cslType === 'creator') {
      extraFields.csl[name] = extraFields.csl[name] || { type: cslType, value: [] }
      extraFields.csl[name].value.push(cslCreator(value))
    } else {
      extraFields.csl[name] = { type: cslType, name, value }
    }

    return ''
  }).trim()

  extra = extra.split('\n').filter(line => {
    const kv = line.match(/^(tex\.)?([^:=]+)\s*([:=])\s*([\S\s]*)/)
    if (!kv) return true
    let [ , tex, name, assign, value ] = kv
    name = name.trim().toLowerCase()
    const raw = (assign === '=')

    if (!name) return true
    if (!tex && raw) return true

    if (tex) {
      extraFields.tex[name] = { name, value, raw }
      return false
    }

    name = name.replace(/ +/g, '-')
    const cslType = cslVariables[name]
    if (cslType) {
      if (cslType === 'creator') {
        extraFields.csl[name] = extraFields.csl[name] || { type: cslType, value: [] }
        extraFields.csl[name].value.push(cslCreator(value))
      } else {
        extraFields.csl[name] = { type: cslType, name, value }
      }

      return false
    }

    name = name.replace(/-/g, '') // google-books-id
    if (['place', 'lccn', 'mr', 'zbl', 'arxiv', 'jstor', 'hdl', 'googlebooksid'].includes(name)) {
      extraFields.tex[name] = { name, value }
      return false
    }

    return true
  }).join('\n')

  return { extra, extraFields }
}
