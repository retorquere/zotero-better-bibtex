import JSON5 = require('json5')

const bibtex = /(?:^|\s)bibtex:[^\S\n]*([^\s]*)(?:\s|$)/
const biblatexcitekey = /(?:^|\s)biblatexcitekey\[([^\[\]\s]*)\](?:\s|$)/
const citekey = new RegExp(`${bibtex.source}|${biblatexcitekey.source}`, 'ig')

const bibtexJSON = /(biblatexdata|bibtex|biblatex)(\*)?{/

function indexOfRE(str, re, start) {
  const index = str.substring(start).search(re)
  return (index >= 0) ? (index + start) : index
}

function makeName(name) {
  return `tex.${name.replace(/[:=]/g, '-').toLowerCase()}`
}
function makeValue(value) {
  return `${value}`.replace(/\n+/g, ' ')
}

export function upgradeExtra(extra) {
  let extraFields = []

  // replace citekey markers with 'Citation Key'
  extra = extra.replace(citekey, (_, ck1, ck2) => {
    extraFields.push(`Citation Key: ${(ck1 || ck2 || '').trim()}`)
    return '\n'
  }).trim()

  // replace old-style key-value fields
  extra = extra.replace(/(?:biblatexdata|bibtex|biblatex)(\*)?\[([^\[\]]*)\]/g, (match, cook, fields) => {
    const legacy = []
    for (const field of fields.split(';')) {
      const kv = field.match(/^([^=]+)(?:=)([\S\s]*)/)
      if (!kv) return match

      const [ , name, value ] = kv.map(v => v.trim())
      legacy.push(`${makeName(name)}${cook ? ':' : '='} ${makeValue(value)}`)
    }

    extraFields = extraFields.concat(legacy)

    return ''
  }).trim()

  let marker = 0
  while ((marker = indexOfRE(extra, bibtexJSON, marker)) >= 0) {
    const start = extra.indexOf('{', marker)
    const cook = extra[start - 1] === '*'

    // this selects the maximum chunk of text looking like {...}. May be too long, deal with that below
    let end = extra.lastIndexOf('}')

    let json = null
    while (end > start) {
      const candidate = extra.substring(start, end + 1)
      try {
        json = JSON.parse(candidate)
      } catch (err) {
        try {
          json = JSON5.parse(candidate)
        } catch (err) {
          json = null
        }
      }

      if (json) {
        if (extra[marker - 1] === '\n' && extra[end + 1] === '\n') end += 1

        extra = extra.substring(0, marker) + extra.substring(end + 1)

        for (const [name, value] of Object.entries(json)) {
          if (typeof value !== 'number' && typeof value !== 'string') throw new Error(`unexpected field of type ${typeof value}`)
          extraFields.push(`${makeName(name)}${cook ? ':' : '='} ${makeValue(value)}`)
        }

        break
      }

      end = extra.lastIndexOf('}', end - 1)
    }

    if (!json) {
      marker = start
    }
  }

  extra = extraFields.sort().concat(extra).join('\n').trim()

  return extra
}
