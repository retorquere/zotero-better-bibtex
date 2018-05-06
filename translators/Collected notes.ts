declare const Zotero: any
declare const Translator: ITranslator

import { htmlEscape } from './lib/html-escape.ts'

const html = {
  levels: 0,
  body: '',
}

function _collection(collection, level = 1) {
  if (level > html.levels) html.levels = level

  html.body += `<h${ level }>${ htmlEscape(collection.name) }</h${ level }>\n`
  for (const item of collection.items) {
    _item(item)
  }

  for (const subcoll of collection.collections) {
    _collection(subcoll, level + 1)
  }
}

function _item(item) {
  switch (item.itemType) {
    case 'note':
      _note(item.note, false)
      break
    case 'attachment':
      _attachment(item)
      break
    default:
      _reference(item)
      break
  }
}

function _prune(collection) {
  let keep = collection.items.length > 0

  collection.collections = collection.collections.filter(subcoll => {
    if (_prune(subcoll)) {
      return false
    } else {
      keep = true
      return true
    }
  })

  return !keep
}

function _attachment(att) {
  // ignore for now
}

function _note(body, extra) {
  if (!body) return
  if (typeof body.note !== 'undefined') body = body.note
  if (!body) return

  if (extra) {
    html.body += `<blockquote><pre>${ htmlEscape(body) }</pre></blockquote>\n`
  } else {
    html.body += `<blockquote>${ body }</blockquote>\n`
  }
}

function _creator(cr) {
  return [cr.lastName, cr.firstName, cr.name].filter(v => v).join(', ')
}

function _reference(item) {
  const creators = item.creators.map(_creator).filter(v => v).join(' and ')

  let date = null
  if (item.date) {
    date = Zotero.BetterBibTeX.parseDate(item.date)
    if (date.from) date = date.from
    date = typeof date.year === 'number' ? date.year : item.date
  }

  const author = [creators, date].filter(v => v).join(', ')

  const title = []
  if (item.title) title.push(`<i>${ htmlEscape(item.title) }</i>`)
  if (author) title.push(`(${ htmlEscape(author) })`)

  html.body += `<div>${ title.join(' ') }</div>\n`

  _note(item.extra, true)

  for (const note of item.notes || []) {
    _note(note, false)
  }

  for (const att of item.attachments || []) {
    _attachment(att)
  }
}

function _reset(starting) {
  if (starting > html.levels) return ''

  let reset = 'counter-reset:'
  for (let level = starting; level <= html.levels; level++) {
    reset += ` h${ level }counter 0`
  }
  return reset + ';'
  // return `counter-reset: h${ starting }counter;`
}

function _keep(item) {
  if (item.extra) return true
  if (item.itemType === 'note') return true
  if (item.notes && item.notes.length) return true
  return false
}

Translator.doExport = () => {
  // collect all notes
  const items = {}
  let z_item
  while (z_item = Zotero.nextItem()) {
    Object.assign(z_item, Zotero.BetterBibTeX.extractFields(z_item))
    if (_keep(z_item)) items[z_item.itemID] = z_item
  }

  const filed = {}
  // expand collections
  for (const collection of Object.values(Translator.collections)) {
    collection.collections = collection.collections.map(key => Translator.collections[key]).filter(v => v)
    collection.items = collection.items.map(id => filed[id] = items[id]).filter(v => v)
  }

  // prune empty branches
  const collections = Object.values(Translator.collections).filter(collection => !collection.parent && !_prune(collection))

  html.body += '<html><body>'

  for (const item of (Object.values(items) as Array<{ itemID: number }>)) {
    if (filed[item.itemID]) continue
    _item(item)
  }

  for (const collection of collections) {
    _collection(collection)
  }

  let style = `  body { ${ _reset(1) } }\n`
  for (let level = 1; level <= html.levels; level++) {
    style += `  h${ level } { ${ _reset(level + 1) } }\n`
    const label = Array.from({length: level}, (x, i) => `counter(h${ i + 1 }counter)`).join(' "." ')
    style += `  h${ level }:before { counter-increment: h${ level }counter; content: ${ label } ".\\0000a0\\0000a0"; }\n`
  }

  Zotero.write(`<html><head><style>${ style }</style></head><body>${ html.body }</body></html>`)
}
