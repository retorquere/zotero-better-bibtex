declare const Zotero: any
declare const Translator: ITranslator

import { htmlEscape } from './lib/html-escape'

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
      _note(item.note, 'note')
      break
    case 'attachment':
      _reference(item)
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

function _note(note, type) {
  switch (type) {
    case 'extra':
      if (!note) return
      html.body += `<blockquote><pre>${ htmlEscape(note) }</pre></blockquote>\n`
      break
    case 'attachment':
      if (!note.note) return
      html.body += `<blockquote><div><samp>${ note.title }</samp></div>${ note.note }</blockquote>\n`
      break
    default:
      if (!note.note) return
      html.body += `<blockquote>${ note.note }</blockquote>\n`
      break
  }
}

function _creator(cr) {
  return [cr.lastName, cr.firstName, cr.name].filter(v => v).join(', ')
}

function _reference(item) {
  let notes = []
  let title = ''

  if (item.itemType === 'attachment') {
    if (item.note) notes = [ { note: item.note } ]
    if (item.title) title = `<samp>${ htmlEscape(item.title) }</samp>`

  } else {
    notes = item.notes.filter(note => note.note)

    const creators = item.creators.map(_creator).filter(v => v).join(' and ')

    let date = null
    if (item.date) {
      date = Zotero.BetterBibTeX.parseDate(item.date)
      if (date.from) date = date.from
      date = typeof date.year === 'number' ? date.year : item.date
    }

    const author = [creators, date].filter(v => v).join(', ')

    if (item.title) title += `<i>${ htmlEscape(item.title) }</i>`
    if (author) title += `(${ htmlEscape(author) })`
    title = title.trim()
  }

  html.body += `<div>${ title }</div>\n`

  _note(item.extra, 'extra')

  for (const note of notes) {
    _note(note, 'note')
  }

  for (const att of item.attachments || []) {
    _note(att, 'attachment')
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
  if (item.note) return true
  if (item.notes && item.notes.find(note => note.note)) return true
  if (item.attachments && item.attachments.find(att => att.note)) return true
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
  style += '  blockquote { border-left: 1px solid gray; }\n'

  Zotero.write(`<html><head><style>${ style }</style></head><body>${ html.body }</body></html>`)
}
