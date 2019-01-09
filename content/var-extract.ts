import * as log from './debug'
import JSON5 = require('json5')

// http://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables
const cslVariables = require('./csl-vars.json')
import * as Citekey from './key-manager/get-set'

function cslCreator(value) {
  const creator = value.split(/\s*\|\|\s*/)
  if (creator.length === 2) { // tslint:disable-line:no-magic-numbers
    return {lastName: creator[0] || '', firstName: creator[1] || ''}
  } else {
    return { name: value }
  }
}

function indexOfRE(str, re, start) {
  const index = str.substring(start).search(re)
  return (index >= 0) ? (index + start) : index
}

export function extract(item) {
  let extra = item.extra || ''

  const extraFields = {
    bibtex: {},
    csl: {},
    kv: {},
    citekey: { citekey: '', pinned: false },
  }

  const citekey = Citekey.get(extra)
  extraFields.citekey = { citekey: citekey.citekey, pinned: citekey.pinned }
  extra = citekey.extra

  extra = extra.replace(/(?:biblatexdata|bibtex|biblatex)(\*)?\[([^\[\]]*)\]/g, (match, cook, fields) => {
    const legacy = {}
    for (const field of fields.split(';')) {
      const kv = field.match(/^([^=]+)(?:=)([\S\s]*)/)
      if (!kv) {
        log.debug('fieldExtract: not a field', field)
        return match
      }

      let [ , name, value ] = kv.map(v => v.trim())
      name = name.toLowerCase()
      legacy[name] = { name, value, raw: !cook }
    }

    log.debug('var-extract:', legacy)
    Object.assign(extraFields.bibtex, legacy)
    return ''
  }).trim()

  const bibtexJSON = /(biblatexdata|bibtex|biblatex)(\*)?{/
  let marker = 0
  while ((marker = indexOfRE(extra, bibtexJSON, marker)) >= 0) {
    const start = extra.indexOf('{', marker)
    const cook = extra[start - 1] === '*'

    // this selects the maximum chunk of text looking like {...}. May be too long, deal with that below
    let end = extra.lastIndexOf('}')

    log.debug('var-extract: biblatexdata marker found', { marker, start, end, cook })

    let json = null
    while (end > start) {
      try {
        log.debug('var-extract: biblatexdata trying', { start, end, candidate: extra.substring(start, end + 1) })
        json = JSON5.parse(extra.substring(start, end + 1))

        if (extra[marker - 1] === '\n' && extra[end + 1] === '\n') end += 1

        extra = extra.substring(0, marker) + extra.substring(end + 1)

        for (const [name, value] of Object.entries(json)) {
          extraFields.bibtex[name] = {name, value, raw: !cook }
        }
        break

      } catch (err) {
        json = null
      }

      end = extra.lastIndexOf('}', end - 1)
    }

    if (!json) {
      log.debug('var-extract: biblatexdata ignoring', { marker, start })
      marker = start
    }
  }

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
    let [name, value] = line.split(/\s*:\s*(.+)/)

    if (!value) return true // keep line

    name = name.trim().toLowerCase().replace(/ +/g, '-')
    const cslType = cslVariables[name]
    log.debug('fieldExtract:', { name, value, cslType })
    if (cslType) {
      if (cslType === 'creator') {
        extraFields.csl[name] = extraFields.csl[name] || { type: cslType, value: [] }
        extraFields.csl[name].value.push(cslCreator(value))
      } else {
        extraFields.csl[name] = { type: cslType, name, value }
      }

      return false
    }

    if (['lccn', 'mr', 'zbl', 'arxiv', 'jstor', 'hdl', 'googlebooksid'].includes(name.replace(/-/g, ''))) { // google-books-id
      extraFields.kv[name.replace(/-/g, '')] = value
      return false
    }

    return true
  }).join('\n')

  log.debug('fieldExtract:', { extra, extraFields })
  return { extra, extraFields }
}
