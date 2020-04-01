declare const Zotero: any

import { Translator } from './lib/translator'
export { Translator }

import * as escape from '../content/escape'
import * as Extra from '../content/extra'

const html = {
  levels: 0,
  body: '',
}

function _collection(collection, level = 1) {
  if (level > html.levels) html.levels = level

  html.body += `<h${ level }>${ escape.html(collection.name) }</h${ level }>\n`
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
      html.body += `<blockquote><pre>${ escape.html(note) }</pre></blockquote>\n`
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
    if (item.title) title = `<samp>${ escape.html(item.title) }</samp>`

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

    if (item.title) title += `<i>${ escape.html(item.title) }</i>`
    if (author) title += `(${ escape.html(author) })`
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

export function doExport() {
  Translator.init('export')

  // collect all notes
  const items: Record<number, ISerializedItem> = {}
  for (const item of Translator.items()) {
    if (!_keep(item)) continue
    items[item.itemID] = Object.assign(item, Extra.get(item.extra, null, 'zotero')) // tslint:disable-line:prefer-object-spread
  }

  const filed = {}
  // expand collections
  for (const collection of Object.values(Translator.collections)) {
    // collection.collections = collection.collections.map(key => Translator.collections[key]).filter(v => v) // TODO: doesn't CTranslator laready do this?
    collection.items = collection.items.map(id => filed[id] = items[id]).filter(v => v)
  }

  // prune empty branches
  const collections = Object.values(Translator.collections).filter(collection => !collection.parent && !_prune(collection))

  html.body += '<html><body>'

  for (const item of (Object.values(items) as { itemID: number }[])) {
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
